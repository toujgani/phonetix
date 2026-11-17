<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GameController extends Controller
{
    public function index()
    {
        return response()->json(['games' => DB::table('games')->where('is_published', true)->orderBy('title')->paginate(20)]);
    }

    public function show(int $id)
    {
        $game = DB::table('games')->where('id', $id)->where('is_published', true)->first();
        abort_unless($game, 404);
        $game->questions = DB::table('game_questions')->where('game_id', $id)->orderBy('id')->get()->map(function ($question) { unset($question->correct_answer_json); $question->options_json = json_decode($question->options_json, true); return $question; });
        return response()->json(['game' => $game]);
    }

    public function submitAttempt(Request $request, int $id)
    {
        $game = DB::table('games')->where('id', $id)->where('is_published', true)->first();
        abort_unless($game, 404);
        $data = $request->validate(['answers' => ['required', 'array'], 'time_spent_seconds' => ['required', 'integer', 'min:0', 'max:7200']]);
        $questions = DB::table('game_questions')->where('game_id', $id)->get();
        abort_if($questions->isEmpty(), 422, 'This game has no questions yet.');
        $score = 0;
        $answerLog = [];
        foreach ($questions as $question) {
            $correct = json_decode($question->correct_answer_json, true);
            $submitted = $data['answers'][$question->id] ?? null;
            $matched = $submitted !== null && $submitted == ($correct['answer'] ?? $correct);
            if ($matched) $score += (int) $question->points;
            $answerLog[] = ['question_id' => $question->id, 'correct' => $matched];
        }
        $percent = (int) round($score / max(1, (int) $questions->sum('points')) * 100);
        $passed = $percent >= (int) $game->passing_score;
        DB::table('game_attempts')->insert(['game_id' => $id, 'student_id' => $request->user()->id, 'score' => $percent, 'is_passed' => $passed, 'time_spent_seconds' => $data['time_spent_seconds'], 'answers_json' => json_encode($answerLog), 'created_at' => now(), 'updated_at' => now()]);
        return response()->json(['score' => $percent, 'is_passed' => $passed, 'correct_count' => count(array_filter($answerLog, fn ($answer) => $answer['correct'])), 'question_count' => $questions->count()]);
    }
}
