<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class LearningController extends Controller
{
    public function dashboard(Request $request)
    {
        $userId = $request->user()->id;
        $summary = DB::table('pronunciation_attempts as a')->join('pronunciation_results as r', 'r.attempt_id', '=', 'a.id')->where('a.student_id', $userId);
        $total = (clone $summary)->count();
        $average = round((float) (clone $summary)->avg('r.overall_score'), 1);
        $latest = (clone $summary)->orderByDesc('a.created_at')->limit(2)->pluck('r.overall_score')->map(fn ($score) => (float) $score);
        $trend = $latest->count() === 2 ? round($latest[0] - $latest[1], 1) : 0;
        $daily = DB::table('pronunciation_attempts as a')->join('pronunciation_results as r', 'r.attempt_id', '=', 'a.id')->where('a.student_id', $userId)->where('a.created_at', '>=', now()->subDays(13)->startOfDay())->selectRaw('DATE(a.created_at) as day, COUNT(*) as attempts, ROUND(AVG(r.overall_score), 1) as accuracy')->groupBy('day')->orderBy('day')->get();
        $weakest = DB::table('pronunciation_attempts as a')->join('pronunciation_results as r', 'r.attempt_id', '=', 'a.id')->join('pronunciation_phoneme_results as p', 'p.result_id', '=', 'r.id')->where('a.student_id', $userId)->select('p.ipa_symbol')->selectRaw('ROUND(AVG(p.score), 1) as average_score')->groupBy('p.ipa_symbol')->orderBy('average_score')->first();
        $goals = DB::table('learning_goals')->where('user_id', $userId)->orderBy('is_completed')->orderBy('due_date')->get();
        $badges = DB::table('learning_badges')->where('user_id', $userId)->orderByDesc('earned_at')->get();
        $weekly = (int) DB::table('pronunciation_attempts')->where('student_id', $userId)->where('created_at', '>=', now()->startOfWeek())->count();
        $groupIds = DB::table('group_enrollments')->where('student_id', $userId)->where('status', 'active')->pluck('group_id')->all();
        $classTarget = $groupIds ? (int) DB::table('group_enrollments')->whereIn('group_id', $groupIds)->where('status', 'active')->distinct('student_id')->count('student_id') : 0;
        $classProgress = $groupIds ? (int) DB::table('group_enrollments as e')->join('pronunciation_attempts as a', 'a.student_id', '=', 'e.student_id')->whereIn('e.group_id', $groupIds)->where('e.status', 'active')->where('a.created_at', '>=', now()->startOfWeek())->distinct('e.student_id')->count('e.student_id') : 0;
        $suggested = $weakest ? "Practise {$weakest->ipa_symbol}: your recent average is {$weakest->average_score}%." : 'Start with a short minimal-pair practice and record your first baseline.';
        return response()->json(['summary' => ['attempts' => $total, 'average_score' => $average, 'trend' => $trend, 'weekly_attempts' => $weekly], 'daily_progress' => $daily, 'weakest_phoneme' => $weakest, 'recommendation' => ['text' => $suggested, 'href' => '/pronunciation-lab', 'target_phoneme' => $weakest->ipa_symbol ?? null], 'goals' => $goals, 'badges' => $badges, 'weekly_challenge' => ['title' => 'Five practice sessions', 'description' => 'Complete five pronunciation practices this week.', 'progress' => min($weekly, 5), 'target' => 5, 'completed' => $weekly >= 5], 'class_challenge' => ['title' => 'Whole-class practice week', 'description' => 'Help everyone in your active group complete at least one pronunciation practice this week.', 'progress' => $classProgress, 'target' => $classTarget, 'completed' => $classTarget > 0 && $classProgress >= $classTarget]]);
    }

    public function createGoal(Request $request)
    {
        $data = $request->validate(['title' => ['required', 'string', 'max:160'], 'target_phoneme' => ['nullable', 'string', 'max:12'], 'target_practices' => ['required', 'integer', 'min:1', 'max:100'], 'due_date' => ['nullable', 'date', 'after_or_equal:today']]);
        $id = DB::table('learning_goals')->insertGetId($data + ['user_id' => $request->user()->id, 'created_at' => now(), 'updated_at' => now()]);
        return response()->json(['goal' => DB::table('learning_goals')->find($id)], 201);
    }

    public function updateGoal(Request $request, int $goal)
    {
        $record = DB::table('learning_goals')->where('id', $goal)->where('user_id', $request->user()->id)->first();
        abort_unless($record, 404);
        $data = $request->validate(['title' => ['sometimes', 'required', 'string', 'max:160'], 'target_phoneme' => ['nullable', 'string', 'max:12'], 'target_practices' => ['sometimes', 'required', 'integer', 'min:1', 'max:100'], 'completed_practices' => ['sometimes', 'required', 'integer', 'min:0', 'max:100'], 'due_date' => ['nullable', 'date'], 'is_completed' => ['sometimes', 'boolean']]);
        DB::table('learning_goals')->where('id', $goal)->update($data + ['updated_at' => now()]);
        return response()->json(['goal' => DB::table('learning_goals')->find($goal)]);
    }

    public function assignments(Request $request)
    {
        $user = $request->user();
        $groupIds = $user->groups()->pluck('groups.id')->map(fn ($id) => (int) $id)->all();
        $query = DB::table('assignments as a')->join('courses as c', 'c.id', '=', 'a.course_id')->where('a.is_published', true)->where(function ($q) use ($groupIds) { $q->whereNull('a.target_groups')->orWhereJsonLength('a.target_groups', 0); foreach ($groupIds as $groupId) $q->orWhereJsonContains('a.target_groups', $groupId); })->select('a.id', 'a.title', 'a.description', 'a.due_date', 'a.max_score', 'c.title as course_title')->orderBy('a.due_date');
        $assignments = $query->paginate(20);
        $assignments->getCollection()->transform(function ($item) use ($user) { $item->submission = DB::table('assignment_submissions')->where('assignment_id', $item->id)->where('student_id', $user->id)->first(); return $item; });
        return response()->json(['assignments' => $assignments]);
    }

    public function createAssignment(Request $request)
    {
        abort_unless(in_array($request->user()->role, ['teacher', 'super_admin'], true), 403);
        $data = $request->validate(['course_id' => ['required', 'integer', 'exists:courses,id'], 'title' => ['required', 'string', 'max:180'], 'description' => ['required', 'string', 'max:5000'], 'due_date' => ['required', 'date', 'after:now'], 'max_score' => ['sometimes', 'integer', 'min:1', 'max:1000'], 'target_groups' => ['sometimes', 'array'], 'target_groups.*' => ['integer', 'exists:groups,id']]);
        if ($request->user()->role === 'teacher') {
            foreach ($data['target_groups'] ?? [] as $groupId) abort_unless(DB::table('teacher_assignments')->where('teacher_id', $request->user()->id)->where('course_id', $data['course_id'])->where('group_id', $groupId)->exists(), 403, 'One or more target groups are not assigned to you.');
        }
        $targetGroups = $data['target_groups'] ?? [];
        if ($request->user()->role === 'teacher' && !$targetGroups) $targetGroups = DB::table('teacher_assignments')->where('teacher_id', $request->user()->id)->where('course_id', $data['course_id'])->pluck('group_id')->map(fn ($id) => (int) $id)->unique()->values()->all();
        unset($data['target_groups']);
        $id = DB::table('assignments')->insertGetId($data + ['teacher_id' => $request->user()->id, 'max_score' => $data['max_score'] ?? 100, 'target_groups' => json_encode($targetGroups), 'is_published' => true, 'created_at' => now(), 'updated_at' => now()]);
        return response()->json(['assignment' => DB::table('assignments')->find($id)], 201);
    }

    public function submitAssignment(Request $request, int $assignment)
    {
        $user = $request->user();
        $record = DB::table('assignments')->where('id', $assignment)->where('is_published', true)->first();
        abort_unless($record, 404);
        $targetGroups = json_decode($record->target_groups ?: '[]', true) ?: [];
        $studentGroups = DB::table('group_enrollments')->where('student_id', $user->id)->where('status', 'active')->pluck('group_id')->map(fn ($id) => (int) $id)->all();
        abort_if($targetGroups && !array_intersect($targetGroups, $studentGroups), 403, 'This assignment is not available to your group.');
        abort_if(now()->greaterThan($record->due_date), 422, 'The assignment deadline has passed.');
        $data = $request->validate(['text_submission' => ['nullable', 'required_without:voice_recording_id', 'string', 'max:10000'], 'voice_recording_id' => ['nullable', 'required_without:text_submission', 'integer', 'exists:voice_recordings,id']]);
        if (!empty($data['voice_recording_id'])) abort_unless(DB::table('voice_recordings')->where('id', $data['voice_recording_id'])->where('user_id', $user->id)->exists(), 403, 'This recording does not belong to your account.');
        $existing = DB::table('assignment_submissions')->where('assignment_id', $assignment)->where('student_id', $user->id)->first();
        abort_if($existing?->graded_at, 409, 'This submission has already been graded.');
        $values = $data + ['updated_at' => now()];
        if ($existing) DB::table('assignment_submissions')->where('id', $existing->id)->update($values);
        else DB::table('assignment_submissions')->insert($values + ['assignment_id' => $assignment, 'student_id' => $user->id, 'created_at' => now()]);
        return response()->json(['message' => 'Assignment submitted.']);
    }

    public function storeRecording(Request $request)
    {
        $data = $request->validate(['audio' => ['required', 'file', 'mimes:webm,mp4,wav,ogg,m4a', 'max:10240'], 'duration_ms' => ['required', 'integer', 'min:300', 'max:30000'], 'consent' => ['accepted']]);
        $file = $request->file('audio');
        $path = $file->store('assignment-recordings/' . $request->user()->id, 'local');
        $id = DB::table('voice_recordings')->insertGetId(['user_id' => $request->user()->id, 'storage_path' => $path, 'duration_ms' => $data['duration_ms'], 'file_size_bytes' => $file->getSize(), 'audio_format' => substr($file->getClientOriginalExtension() ?: 'webm', 0, 10), 'consent_acknowledged_at' => now(), 'created_at' => now(), 'updated_at' => now()]);
        return response()->json(['voice_recording_id' => $id], 201);
    }

    public function submissionRecording(Request $request, int $submission)
    {
        abort_unless(in_array($request->user()->role, ['teacher', 'super_admin'], true), 403);
        $query = DB::table('assignment_submissions as s')->join('assignments as a', 'a.id', '=', 's.assignment_id')->join('voice_recordings as v', 'v.id', '=', 's.voice_recording_id')->where('s.id', $submission)->when($request->user()->role !== 'super_admin', fn ($q) => $q->where('a.teacher_id', $request->user()->id))->select('v.storage_path', 'v.audio_format')->first();
        abort_unless($query && Storage::disk('local')->exists($query->storage_path), 404);
        return Storage::disk('local')->response($query->storage_path, 'student-practice.' . $query->audio_format, ['Cache-Control' => 'private, no-store']);
    }

    public function submissions(Request $request)
    {
        abort_unless(in_array($request->user()->role, ['teacher', 'super_admin'], true), 403);
        $query = DB::table('assignment_submissions as s')->join('assignments as a', 'a.id', '=', 's.assignment_id')->join('users as u', 'u.id', '=', 's.student_id')->when($request->user()->role !== 'super_admin', fn ($q) => $q->where('a.teacher_id', $request->user()->id))->select('s.*', 'a.title as assignment_title', 'a.max_score', 'u.first_name', 'u.last_name', 'u.email')->orderByRaw('s.graded_at IS NOT NULL')->orderByDesc('s.created_at');
        return response()->json(['submissions' => $query->paginate(25)]);
    }

    public function gradeSubmission(Request $request, int $submission)
    {
        abort_unless(in_array($request->user()->role, ['teacher', 'super_admin'], true), 403);
        $data = $request->validate(['score' => ['required', 'numeric', 'min:0'], 'teacher_feedback' => ['required', 'string', 'max:5000']]);
        $record = DB::table('assignment_submissions as s')->join('assignments as a', 'a.id', '=', 's.assignment_id')->where('s.id', $submission)->when($request->user()->role !== 'super_admin', fn ($q) => $q->where('a.teacher_id', $request->user()->id))->select('s.id', 's.assignment_id', 'a.max_score')->first();
        abort_unless($record, 404);
        abort_if($data['score'] > $record->max_score, 422, 'Score cannot exceed the assignment maximum.');
        DB::table('assignment_submissions')->where('id', $submission)->update($data + ['graded_by' => $request->user()->id, 'graded_at' => now(), 'updated_at' => now()]);
        return response()->json(['message' => 'Feedback saved.']);
    }
}
