<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    private function baseQuery(Request $request)
    {
        $query = User::query()->with(['groups.semester.academicYear'])->select('users.*');
        if ($search = trim((string) $request->query('search', ''))) {
            $needle = mb_strtolower($search);
            $query->where(fn ($q) => $q->whereRaw('LOWER(first_name) LIKE ?', ["%{$needle}%"])
                ->orWhereRaw('LOWER(last_name) LIKE ?', ["%{$needle}%"])
                ->orWhereRaw('LOWER(email) LIKE ?', ["%{$needle}%"])
                ->orWhereRaw('LOWER(institutional_id) LIKE ?', ["%{$needle}%"]));
        }
        foreach (['role', 'status'] as $field) {
            if ($value = $request->query($field)) $query->where($field, $value);
        }
        if ($group = $request->query('group')) $query->whereHas('groups', fn ($q) => $q->where('groups.id', $group));
        if ($year = $request->query('academic_year')) $query->whereHas('groups.semester.academicYear', fn ($q) => $q->where('academic_years.id', $year));
        $sort = $request->query('sort', 'created_at');
        $direction = $request->query('direction', 'desc');
        if (in_array($sort, ['id', 'first_name', 'last_name', 'email', 'institutional_id', 'role', 'status', 'created_at', 'last_login_at'], true)) {
            $query->orderBy($sort, $direction === 'asc' ? 'asc' : 'desc');
        }
        return $query;
    }

    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 25);
        abort_unless(in_array($perPage, [10, 25, 50, 100], true), 422, 'Unsupported page size.');
        $users = $this->baseQuery($request)->paginate($perPage);
        $users->getCollection()->transform(fn (User $user) => $this->serializeUser($user));
        $counts = User::query()->select('role', 'status')->selectRaw('COUNT(*) as aggregate')->groupBy('role', 'status')->get();
        $count = fn (callable $matches) => (int) $counts->filter($matches)->sum('aggregate');
        $stats = [
            'total' => (int) $counts->sum('aggregate'),
            'students' => $count(fn ($row) => $row->role === 'student'),
            'teachers' => $count(fn ($row) => $row->role === 'teacher'),
            'administrators' => $count(fn ($row) => $row->role === 'super_admin'),
            'pending' => $count(fn ($row) => $row->status === 'pending'),
            'active' => $count(fn ($row) => $row->status === 'active'),
            'active_students' => $count(fn ($row) => $row->role === 'student' && $row->status === 'active'),
            'suspended' => $count(fn ($row) => $row->status === 'suspended'),
        ];
        return response()->json(['users' => $users, 'statistics' => $stats, 'groups' => DB::table('groups')->orderBy('name')->get(['id', 'name']), 'academic_years' => DB::table('academic_years')->orderByDesc('start_date')->get(['id', 'name'])]);
    }

    public function show(User $user)
    {
        $user->load(['groups.semester.academicYear', 'pronunciationAttempts.result']);
        return response()->json(['user' => $this->serializeUser($user, true)]);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:255'], 'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'institutional_id' => ['nullable', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:40'], 'role' => ['required', Rule::in(['student', 'teacher', 'super_admin'])],
            'status' => ['required', Rule::in(['pending', 'active', 'suspended', 'rejected'])],
            'group_ids' => ['array'], 'group_ids.*' => ['integer', 'exists:groups,id'],
        ]);
        DB::transaction(function () use ($data, $user, $request) {
            $before = $user->only(['first_name', 'last_name', 'email', 'institutional_id', 'phone', 'role', 'status']);
            $user->fill(collect($data)->except('group_ids')->all());
            if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'name')) $user->name = trim($user->first_name.' '.$user->last_name);
            $user->save();
            if (array_key_exists('group_ids', $data)) $user->groups()->sync($data['group_ids']);
            AuditLog::create(['user_id' => $request->user()->id, 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(), 'action' => 'user.updated', 'entity_type' => User::class, 'entity_id' => $user->id, 'old_values' => $before, 'new_values' => $user->only(array_keys($before)), 'created_at' => now()]);
        });
        return response()->json(['user' => $this->serializeUser($user->fresh('groups.semester.academicYear'))]);
    }

    public function approve(Request $request, User $user)
    {
        abort_unless($user->status === 'pending', 409, 'Only pending registrations can be approved.');
        $user->forceFill(['status' => 'active', 'approved_by' => $request->user()->id, 'approved_at' => now()])->save();
        $this->audit($request, $user, 'user.approved');
        return response()->json(['user' => $this->serializeUser($user)]);
    }

    public function setStatus(Request $request, User $user)
    {
        $data = $request->validate(['status' => ['required', Rule::in(['active', 'suspended', 'rejected'])]]);
        abort_if($request->user()->id === $user->id && $data['status'] === 'suspended', 422, 'You cannot suspend your own account.');
        $user->update(['status' => $data['status']]);
        if ($data['status'] !== 'active') $user->tokens()->delete();
        $this->audit($request, $user, 'user.status_changed');
        return response()->json(['user' => $this->serializeUser($user)]);
    }

    public function passwordReset(Request $request, User $user)
    {
        $result = Password::sendResetLink(['email' => $user->email]);
        abort_unless($result === Password::RESET_LINK_SENT, 503, __($result));
        $this->audit($request, $user, 'user.password_reset_requested');
        return response()->json(['message' => __($result)]);
    }

    public function revokeSessions(Request $request, User $user)
    {
        $deleted = $user->tokens()->delete();
        $this->audit($request, $user, 'user.sessions_revoked');
        return response()->json(['revoked_sessions' => $deleted]);
    }

    public function export(Request $request)
    {
        $query = $this->baseQuery($request);
        if ($request->filled('ids')) {
            $ids = array_filter(explode(',', (string) $request->query('ids')), fn ($id) => ctype_digit($id));
            $query->whereIn('users.id', $ids);
        }
        $users = $query->get();
        if ($request->query('format') === 'excel') {
            $rows = $users->map(fn ($user) => '<tr><td>'.implode('</td><td>', array_map(fn ($value) => e((string) $value), [$user->id, trim($user->first_name.' '.$user->last_name), $user->email, $user->institutional_id, $user->phone, $user->role, $user->groups->pluck('name')->join('; '), $user->groups->map(fn ($g) => $g->semester?->academicYear?->name)->filter()->unique()->join('; '), $user->created_at?->toDateTimeString(), $user->last_login_at?->toDateTimeString(), $user->status])).'</td></tr>')->join('');
            $html = '<table><thead><tr><th>User ID</th><th>Full name</th><th>Email</th><th>Student ID</th><th>Phone</th><th>Role</th><th>Groups</th><th>Academic years</th><th>Registration date</th><th>Last login</th><th>Status</th></tr></thead><tbody>'.$rows.'</tbody></table>';
            return response($html, 200, ['Content-Type' => 'application/vnd.ms-excel; charset=UTF-8', 'Content-Disposition' => 'attachment; filename="phonetix-users.xls"']);
        }
        return response()->streamDownload(function () use ($users) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['User ID', 'Full name', 'Email', 'Student ID', 'Phone', 'Role', 'Groups', 'Academic years', 'Registration date', 'Last login', 'Status']);
            foreach ($users as $user) fputcsv($out, [$user->id, trim($user->first_name.' '.$user->last_name), $user->email, $user->institutional_id, $user->phone, $user->role, $user->groups->pluck('name')->join('; '), $user->groups->map(fn ($g) => $g->semester?->academicYear?->name)->filter()->unique()->join('; '), $user->created_at?->toISOString(), $user->last_login_at?->toISOString(), $user->status]);
            fclose($out);
        }, 'phonetix-users.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function serializeUser(User $user, bool $details = false): array
    {
        $data = $user->only(['id', 'institutional_id', 'first_name', 'last_name', 'email', 'personal_email', 'phone', 'role', 'status', 'approved_at', 'created_at', 'last_login_at']);
        $data['groups'] = $user->groups->map(fn ($group) => ['id' => $group->id, 'name' => $group->name, 'academic_year' => $group->semester?->academicYear?->name])->values();
        if ($details) $data['progress'] = ['pronunciation_attempts' => $user->pronunciationAttempts->count(), 'average_score' => round((float) $user->pronunciationAttempts->map(fn ($a) => $a->result?->overall_score)->filter()->avg(), 1)];
        return $data;
    }

    private function audit(Request $request, User $user, string $action): void
    {
        AuditLog::create(['user_id' => $request->user()->id, 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(), 'action' => $action, 'entity_type' => User::class, 'entity_id' => $user->id, 'created_at' => now()]);
    }
}
