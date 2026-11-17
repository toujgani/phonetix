<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LiveQuizController extends Controller
{
    public function create(Request $request)
    {
        abort_unless(in_array($request->user()->role, ['teacher', 'super_admin'], true), 403);
        $data = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'questions' => ['required', 'array', 'min:1', 'max:50'],
            'questions.*.prompt' => ['required', 'string', 'max:500'],
            'questions.*.options' => ['required', 'array', 'min:2', 'max:4'],
            'questions.*.options.*' => ['required', 'string', 'max:180'],
            'questions.*.correct_index' => ['required', 'integer', 'min:0', 'max:3'],
            'questions.*.seconds' => ['nullable', 'integer', 'min:5', 'max:120'],
        ]);
        foreach ($data['questions'] as $question) {
            if ($question['correct_index'] >= count($question['options'])) {
                throw ValidationException::withMessages(['questions' => ['Correct option index is outside the options list.']]);
            }
        }

        do { $pin = (string) random_int(100000, 999999); }
        while (DB::table('live_quiz_rooms')->where('pin', $pin)->exists());

        $id = DB::table('live_quiz_rooms')->insertGetId([
            'host_id' => $request->user()->id, 'pin' => $pin, 'title' => $data['title'],
            'questions' => json_encode($data['questions']), 'status' => 'lobby', 'current_question' => 0,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        return response()->json($this->room($id, true), 201);
    }

    public function join(Request $request)
    {
        $data = $request->validate(['pin' => ['required', 'digits:6']]);
        $room = DB::table('live_quiz_rooms')->where('pin', $data['pin'])->first();
        if (!$room || $room->status !== 'lobby') throw ValidationException::withMessages(['pin' => ['Game not found or it has already started.']]);
        DB::table('live_quiz_participants')->updateOrInsert(
            ['room_id' => $room->id, 'user_id' => $request->user()->id],
            ['updated_at' => now(), 'created_at' => now()]
        );
        return response()->json($this->room($room->id, false));
    }

    public function state(Request $request, int $id)
    {
        $room = DB::table('live_quiz_rooms')->find($id);
        abort_unless($room, 404);
        $isHost = (int)$room->host_id === (int)$request->user()->id;
        $isPlayer = DB::table('live_quiz_participants')->where('room_id', $id)->where('user_id', $request->user()->id)->exists();
        abort_unless($isHost || $isPlayer, 403);
        return response()->json($this->room($id, $isHost));
    }

    public function start(Request $request, int $id)
    {
        $room = $this->hostRoom($request, $id);
        abort_unless($room->status === 'lobby', 409);
        DB::table('live_quiz_rooms')->where('id', $id)->update(['status' => 'question', 'question_started_at' => now(), 'updated_at' => now()]);
        return response()->json($this->room($id, true));
    }

    public function answer(Request $request, int $id)
    {
        $data = $request->validate(['answer' => ['required', 'integer', 'min:0', 'max:3']]);
        $room = DB::table('live_quiz_rooms')->find($id);
        abort_unless($room && $room->status === 'question', 409);
        $participant = DB::table('live_quiz_participants')->where('room_id', $id)->where('user_id', $request->user()->id)->first();
        abort_unless($participant, 403);
        $questions = json_decode($room->questions, true);
        $index = (int)$room->current_question;
        if (!isset($questions[$index]['options'][$data['answer']])) throw ValidationException::withMessages(['answer' => ['Invalid answer choice.']]);
        $answers = json_decode($participant->answers ?: '{}', true) ?: [];
        if (array_key_exists((string)$index, $answers)) throw ValidationException::withMessages(['answer' => ['Your answer has already been recorded.']]);
        $correct = $data['answer'] === (int)$questions[$index]['correct_index'];
        $answers[(string)$index] = ['choice' => $data['answer'], 'correct' => $correct];
        $remaining = max(0, ((int)($questions[$index]['seconds'] ?? 20)) - now()->diffInSeconds($room->question_started_at));
        $points = $correct ? 500 + (int) round(500 * $remaining / max(1, (int)($questions[$index]['seconds'] ?? 20))) : 0;
        DB::table('live_quiz_participants')->where('id', $participant->id)->update([
            'answers' => json_encode($answers), 'score' => (int)$participant->score + $points, 'updated_at' => now(),
        ]);
        return response()->json(['accepted' => true, 'correct' => $correct, 'points' => $points]);
    }

    public function next(Request $request, int $id)
    {
        $room = $this->hostRoom($request, $id);
        $questions = json_decode($room->questions, true);
        $next = (int)$room->current_question + 1;
        DB::table('live_quiz_rooms')->where('id', $id)->update([
            'status' => $next >= count($questions) ? 'finished' : 'question',
            'current_question' => min($next, count($questions) - 1),
            'question_started_at' => $next >= count($questions) ? null : now(), 'updated_at' => now(),
        ]);
        return response()->json($this->room($id, true));
    }

    private function hostRoom(Request $request, int $id): object
    {
        $room = DB::table('live_quiz_rooms')->find($id);
        abort_unless($room && (int)$room->host_id === (int)$request->user()->id, 403);
        return $room;
    }

    private function room(int $id, bool $isHost): array
    {
        $room = DB::table('live_quiz_rooms')->find($id);
        $questions = json_decode($room->questions, true);
        $current = (int)$room->current_question;
        $playerRows = DB::table('live_quiz_participants as p')->join('users as u', 'u.id', '=', 'p.user_id')
            ->where('p.room_id', $id)->orderByDesc('p.score')->select('p.user_id', 'u.first_name', 'u.last_name', 'p.score', 'p.answers')->get();
        $players = $playerRows->map(function ($p) use ($isHost, $room) {
            return ['id' => $p->user_id, 'name' => trim($p->first_name.' '.$p->last_name), 'score' => (int)$p->score,
                'answered' => $room->status === 'question' && isset((json_decode($p->answers ?: '{}', true) ?: [])[(string)$room->current_question])];
        })->values();
        $question = $questions[$current] ?? null;
        if ($question && !$isHost && $room->status !== 'finished') unset($question['correct_index']);
        if ($question && $isHost) $question['correct_index'] = (int)$question['correct_index'];
        return ['id' => $room->id, 'pin' => $room->pin, 'title' => $room->title, 'status' => $room->status,
            'current_question' => $current, 'question_count' => count($questions), 'question' => $question,
            'players' => $players, 'is_host' => $isHost];
    }
}
