<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminAcademicStructureController extends Controller
{
    private const RESOURCES = [
        'years' => 'academic_years',
        'semesters' => 'semesters',
        'departments' => 'departments',
        'programs' => 'programs',
        'groups' => 'groups',
        'courses' => 'courses',
    ];

    public function index()
    {
        $years = DB::table('academic_years')->orderByDesc('start_date')->get();
        $semesters = DB::table('semesters')->orderBy('semester_number')->get()->groupBy('academic_year_id');
        $departments = DB::table('departments')->orderBy('name')->get();
        $programs = DB::table('programs')->orderBy('name')->get()->groupBy('department_id');
        $courses = DB::table('courses')->join('departments', 'courses.department_id', '=', 'departments.id')->orderBy('courses.title')->limit(100)->get(['courses.*', 'courses.title as name', 'departments.name as department_name']);
        $groups = DB::table('groups')
            ->join('programs', 'groups.program_id', '=', 'programs.id')
            ->join('departments', 'programs.department_id', '=', 'departments.id')
            ->join('semesters', 'groups.semester_id', '=', 'semesters.id')
            ->join('academic_years', 'semesters.academic_year_id', '=', 'academic_years.id')
            ->leftJoin('group_enrollments', 'groups.id', '=', 'group_enrollments.group_id')
            ->select('groups.id', 'groups.name', 'groups.program_id', 'groups.semester_id', 'groups.capacity', 'groups.is_active', 'programs.name as program_name', 'departments.name as department_name', 'semesters.name as semester_name', 'academic_years.name as academic_year', DB::raw('COUNT(group_enrollments.id) as enrolled_count'))
            ->groupBy('groups.id', 'programs.name', 'departments.name', 'semesters.name', 'academic_years.name')
            ->orderBy('academic_years.start_date', 'desc')->orderBy('groups.name')->limit(100)->get();

        return response()->json([
            'years' => $years->map(fn ($year) => [...(array) $year, 'semesters' => $semesters->get($year->id, collect())->values()])->values(),
            'departments' => $departments->map(fn ($department) => [...(array) $department, 'programs' => $programs->get($department->id, collect())->values()])->values(),
            'groups' => $groups,
            'courses' => $courses,
            'options' => ['years' => $years->map(fn ($year) => ['id' => $year->id, 'name' => $year->name])->values(), 'semesters' => DB::table('semesters')->join('academic_years', 'semesters.academic_year_id', '=', 'academic_years.id')->orderByDesc('academic_years.start_date')->orderBy('semester_number')->get(['semesters.id', 'semesters.name', 'academic_years.name as academic_year']), 'departments' => $departments->map(fn ($department) => ['id' => $department->id, 'name' => $department->name])->values(), 'programs' => DB::table('programs')->orderBy('name')->get(['id', 'name', 'department_id'])],
            'statistics' => ['years' => DB::table('academic_years')->count(), 'departments' => DB::table('departments')->count(), 'programs' => DB::table('programs')->count(), 'groups' => DB::table('groups')->count(), 'courses' => DB::table('courses')->count(), 'students_assigned' => DB::table('group_enrollments')->where('status', 'active')->distinct('student_id')->count('student_id')],
        ]);
    }

    public function store(Request $request, string $resource)
    {
        $table = $this->table($resource);
        $data = $this->validated($request, $resource);
        $id = DB::transaction(function () use ($request, $resource, $table, $data) {
            if ($resource === 'years' && ($data['is_current'] ?? false)) DB::table($table)->update(['is_current' => false]);
            $data['created_at'] = now();
            $data['updated_at'] = now();
            $id = DB::table($table)->insertGetId($data);
            $this->audit($request, $resource, $id, 'created', null, $data);
            return $id;
        });
        return response()->json(['id' => $id], 201);
    }

    public function update(Request $request, string $resource, int $id)
    {
        $table = $this->table($resource);
        abort_unless(DB::table($table)->where('id', $id)->exists(), 404);
        $data = $this->validated($request, $resource, $id);
        DB::transaction(function () use ($request, $resource, $table, $id, $data) {
            if ($resource === 'years' && ($data['is_current'] ?? false)) DB::table($table)->where('id', '!=', $id)->update(['is_current' => false]);
            $old = (array) DB::table($table)->where('id', $id)->first();
            $data['updated_at'] = now();
            DB::table($table)->where('id', $id)->update($data);
            $this->audit($request, $resource, $id, 'updated', $old, $data);
        });
        return response()->json(['message' => 'Academic record updated.']);
    }

    public function destroy(Request $request, string $resource, int $id)
    {
        $table = $this->table($resource);
        abort_unless(DB::table($table)->where('id', $id)->exists(), 404);
        $dependents = match ($resource) {
            'years' => DB::table('semesters')->where('academic_year_id', $id)->exists(),
            'semesters' => DB::table('groups')->where('semester_id', $id)->exists(),
            'departments' => DB::table('programs')->where('department_id', $id)->exists() || DB::table('courses')->where('department_id', $id)->exists(),
            'programs' => DB::table('groups')->where('program_id', $id)->exists(),
            'groups' => DB::table('group_enrollments')->where('group_id', $id)->exists() || DB::table('teacher_assignments')->where('group_id', $id)->exists(),
            'courses' => DB::table('chapters')->where('course_id', $id)->exists() || DB::table('assignments')->where('course_id', $id)->exists() || DB::table('teacher_assignments')->where('course_id', $id)->exists(),
        };
        abort_if($dependents, 409, 'This record is in use. Remove its dependent assignments first.');
        $record = (array) DB::table($table)->where('id', $id)->first();
        DB::table($table)->where('id', $id)->delete();
        $this->audit($request, $resource, $id, 'deleted', $record, null);
        return response()->noContent();
    }

    private function table(string $resource): string
    {
        abort_unless(isset(self::RESOURCES[$resource]), 404);
        return self::RESOURCES[$resource];
    }

    private function validated(Request $request, string $resource, ?int $id = null): array
    {
        $unique = fn (string $table, string $column = 'code') => Rule::unique($table, $column)->ignore($id);
        $rules = match ($resource) {
            'years' => ['name' => ['required', 'string', 'max:80', $unique('academic_years', 'name')], 'start_date' => ['required', 'date'], 'end_date' => ['required', 'date', 'after_or_equal:start_date'], 'is_current' => ['boolean']],
            'semesters' => ['academic_year_id' => ['required', 'integer', 'exists:academic_years,id'], 'name' => ['required', 'string', 'max:120'], 'semester_number' => ['required', 'integer', 'min:1', 'max:4'], 'start_date' => ['required', 'date'], 'end_date' => ['required', 'date', 'after_or_equal:start_date']],
            'departments' => ['name' => ['required', 'string', 'max:180'], 'code' => ['required', 'string', 'max:30', $unique('departments')], 'head_name' => ['nullable', 'string', 'max:180'], 'description' => ['nullable', 'string', 'max:2000']],
            'programs' => ['department_id' => ['required', 'integer', 'exists:departments,id'], 'name' => ['required', 'string', 'max:180'], 'code' => ['required', 'string', 'max:30', $unique('programs')], 'degree_level' => ['required', Rule::in(['undergraduate', 'postgraduate', 'diploma'])]],
            'groups' => ['program_id' => ['required', 'integer', 'exists:programs,id'], 'semester_id' => ['required', 'integer', 'exists:semesters,id'], 'name' => ['required', 'string', 'max:120'], 'capacity' => ['required', 'integer', 'min:1', 'max:1000'], 'is_active' => ['boolean']],
            'courses' => ['department_id' => ['required', 'integer', 'exists:departments,id'], 'code' => ['required', 'string', 'max:40', $unique('courses')], 'title' => ['required', 'string', 'max:180'], 'credits' => ['required', 'integer', 'min:1', 'max:30'], 'description' => ['nullable', 'string', 'max:5000'], 'is_published' => ['boolean']],
        };
        $data = $request->validate($rules);
        if ($resource === 'groups' && !array_key_exists('is_active', $data)) $data['is_active'] = false;
        if ($resource === 'years' && !array_key_exists('is_current', $data)) $data['is_current'] = false;
        return $data;
    }

    private function audit(Request $request, string $resource, int $id, string $verb, ?array $old, ?array $new): void
    {
        AuditLog::create(['user_id' => $request->user()->id, 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(), 'action' => "academic.{$resource}.{$verb}", 'entity_type' => $resource, 'entity_id' => $id, 'old_values' => $old, 'new_values' => $new, 'created_at' => now()]);
    }
}
