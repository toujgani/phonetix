<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{
    public function index()
    {
        return response()->json(['courses' => DB::table('courses')->where('is_published', true)->orderBy('title')->paginate(20)]);
    }

    public function show(int $id)
    {
        $course = DB::table('courses')->where('id', $id)->where('is_published', true)->first();
        abort_unless($course, 404);
        $course->chapters = DB::table('chapters')->where('course_id', $id)->orderBy('order_number')->get();
        return response()->json(['course' => $course]);
    }

    public function completeLesson(Request $request, int $id)
    {
        abort_unless(DB::table('lessons')->where('id', $id)->exists(), 404);
        DB::table('lesson_completions')->updateOrInsert(['lesson_id' => $id, 'student_id' => $request->user()->id], ['completed_at' => now()]);
        return response()->json(['message' => 'Lesson marked complete.']);
    }
}
