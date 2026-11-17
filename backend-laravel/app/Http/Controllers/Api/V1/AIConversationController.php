<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AIConversationController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(['conversations' => DB::table('ai_conversations')->where('student_id', $request->user()->id)->orderByDesc('updated_at')->paginate(20)]);
    }

    public function store(Request $request)
    {
        $data = $request->validate(['topic' => ['required', 'string', 'max:120'], 'cefr_level' => ['required', 'in:A1,A2,B1,B2,C1']]);
        $id = DB::table('ai_conversations')->insertGetId(['student_id' => $request->user()->id, 'title' => $data['topic'], 'topic' => $data['topic'], 'cefr_level' => $data['cefr_level'], 'created_at' => now(), 'updated_at' => now()]);
        return response()->json(['conversation' => ['id' => $id, 'topic' => $data['topic'], 'cefr_level' => $data['cefr_level'], 'messages' => []]], 201);
    }

    public function sendMessage(Request $request, int $id)
    {
        $data = $request->validate(['message' => ['required', 'string', 'max:2000']]);
        $conversation = DB::table('ai_conversations')->where('id', $id)->where('student_id', $request->user()->id)->first();
        abort_unless($conversation, 404);
        DB::table('ai_conversation_messages')->insert(['conversation_id' => $id, 'sender_role' => 'student', 'content' => $data['message'], 'created_at' => now()]);
        $response = match (mb_strtolower($conversation->topic)) {
            'job interview' => 'Good interview practice. Give one clear example using: situation, action, result. Stress the action word, then tell me what result you achieved.',
            'class presentation' => 'For a presentation, signpost your next point with “First…” or “Next…”. Say your main idea in one short sentence, then add one supporting detail.',
            'ordering at a café' => 'Try a polite request such as “Could I have a tea, please?” Keep the /k/ in “could” clear and make “please” warm and natural.',
            'asking for directions' => 'Practise asking a complete question: “Could you tell me how to get to the library?” Keep the stress on “tell”, “get” and “library”.',
            'meeting a professor' => 'Use a polite opening and state your reason clearly: “Good morning, Professor. I wanted to ask about…” Finish with a clear final consonant.',
            'group project discussion' => 'Build on the previous idea: “I agree, and I would add…” Stress the key content words and pause briefly between ideas.',
            default => 'Thanks for practising. Try that sentence again slowly, make the key word stress clear, and pronounce the final sounds.',
        };
        DB::table('ai_conversation_messages')->insert(['conversation_id' => $id, 'sender_role' => 'ai_tutor', 'content' => $response, 'grammar_feedback' => json_encode([]), 'pronunciation_notes' => json_encode(['Practise word stress and pronounce final consonants clearly.']), 'created_at' => now()]);
        DB::table('ai_conversations')->where('id', $id)->increment('duration_seconds', 30, ['updated_at' => now()]);
        return response()->json(['reply' => ['sender' => 'ai_tutor', 'text' => $response, 'pronunciation_notes' => ['Practise word stress and pronounce final consonants clearly.']]]);
    }
}
