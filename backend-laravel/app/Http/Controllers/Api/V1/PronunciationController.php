<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PronunciationAttempt;
use App\Models\PronunciationExercise;
use App\Models\PronunciationResult;
use App\Models\VoiceRecording;
use App\Services\AI\AIServiceManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class PronunciationController extends Controller
{
    private const EXERCISES = [
        ['Think', '/θɪŋk/', 'Place the tongue lightly between the teeth and let air pass without voicing.', ['θ', 'ɪ', 'ŋ', 'k']],
        ['Sheep', '/ʃiːp/', 'Keep the tongue high and forward; sustain the long vowel /iː/.', ['ʃ', 'iː', 'p']],
        ['This', '/ðɪs/', 'Touch the tongue near the teeth and voice the dental fricative /ð/.', ['ð', 'ɪ', 's']],
        ['Ship', '/ʃɪp/', 'Keep /ɪ/ short and relaxed, then release the final /p/.', ['ʃ', 'ɪ', 'p']],
        ['Phonetics', '/fəˈnetɪks/', 'Keep the first vowel unstressed and place primary stress on “net”.', ['f', 'ə', 'n', 'e', 't', 'ɪ', 'k', 's']],
    ];

    public function getIpaChart()
    {
        return response()->json(['symbols' => []]);
    }

    public function indexExercises()
    {
        $exercises = collect(self::EXERCISES)->map(function ($item) {
            return PronunciationExercise::firstOrCreate(['target_text' => $item[0]], ['ipa_transcription' => $item[1], 'phonetic_explanation' => $item[2], 'target_phonemes' => $item[3], 'difficulty' => 'beginner']);
        });
        return response()->json(['exercises' => $exercises->values()]);
    }

    public function assessRecording(Request $request)
    {
        $data = $request->validate([
            'audio' => ['required', 'file', 'mimes:wav', 'max:10240'],
            'target_text' => ['required', 'string', 'max:180'],
            'target_ipa' => ['required', 'string', 'max:180'],
            'duration_ms' => ['required', 'integer', 'min:300', 'max:30000'],
            'consent' => ['accepted'],
        ]);
        $exercise = PronunciationExercise::firstOrCreate(['target_text' => $data['target_text']], ['ipa_transcription' => $data['target_ipa'], 'difficulty' => 'beginner']);
        $path = $request->file('audio')->store('recordings/' . $request->user()->id, 'local');
        $recording = VoiceRecording::create(['user_id' => $request->user()->id, 'storage_path' => $path, 'duration_ms' => $data['duration_ms'], 'sample_rate' => 16000, 'file_size_bytes' => $request->file('audio')->getSize(), 'audio_format' => 'wav', 'consent_acknowledged_at' => now()]);

        try {
            $assessment = AIServiceManager::getPronunciationService()->assess(Storage::path($path), $data['target_text'], ['target_ipa' => $data['target_ipa']]);
            $result = DB::transaction(function () use ($request, $exercise, $recording, $assessment) {
                $attemptNumber = (int) PronunciationAttempt::where('student_id', $request->user()->id)->where('exercise_id', $exercise->id)->max('attempt_number') + 1;
                $attempt = PronunciationAttempt::create(['exercise_id' => $exercise->id, 'student_id' => $request->user()->id, 'voice_recording_id' => $recording->id, 'attempt_number' => $attemptNumber]);
                $result = PronunciationResult::create(['attempt_id' => $attempt->id, 'overall_score' => $assessment->overallScore, 'accuracy_score' => $assessment->accuracyScore, 'fluency_score' => $assessment->fluencyScore, 'completeness_score' => $assessment->completenessScore, 'prosody_score' => $assessment->prosodyScore, 'assessed_by_provider' => $assessment->provider, 'raw_provider_response' => $assessment->rawResponse, 'actionable_feedback' => $assessment->actionableFeedback]);
                foreach ($assessment->phonemes as $phoneme) DB::table('pronunciation_phoneme_results')->insert(['result_id' => $result->id, 'phoneme' => $phoneme->phoneme, 'ipa_symbol' => $phoneme->ipaSymbol, 'score' => $phoneme->score, 'status' => $phoneme->status, 'suggestion' => $phoneme->suggestion, 'created_at' => now(), 'updated_at' => now()]);
                $this->updateLearningPath($request->user()->id, $exercise->id, $assessment->phonemes);
                return $result;
            });
            return response()->json(['assessment' => ['id' => $result->id, 'exercise_id' => $exercise->id, 'target_text' => $exercise->target_text, 'ipa_transcription' => $exercise->ipa_transcription, 'overall_score' => $assessment->overallScore, 'accuracy_score' => $assessment->accuracyScore, 'fluency_score' => $assessment->fluencyScore, 'completeness_score' => $assessment->completenessScore, 'prosody_score' => $assessment->prosodyScore, 'phonemes' => array_map(fn ($p) => ['phoneme' => $p->phoneme, 'ipa_symbol' => $p->ipaSymbol, 'score' => $p->score, 'status' => $p->status, 'suggestion' => $p->suggestion], $assessment->phonemes), 'actionable_feedback' => $assessment->actionableFeedback, 'provider' => $assessment->provider, 'created_at' => $result->created_at]]);
        } catch (\Throwable $error) {
            $recording->delete();
            Storage::disk('local')->delete($path);
            report($error);
            return response()->json(['message' => 'Pronunciation assessment is not available. Configure the Azure Speech credentials and try again.'], 503);
        }
    }

    public function history(Request $request)
    {
        $history = PronunciationAttempt::with(['exercise:id,target_text,ipa_transcription', 'result.phonemeResults'])->where('student_id', $request->user()->id)->latest()->paginate(20);
        return response()->json(['history' => $history]);
    }

    private function updateLearningPath(int $userId, int $exerciseId, array $phonemes): void
    {
        $count = PronunciationAttempt::where('student_id', $userId)->count();
        foreach (DB::table('learning_goals')->where('user_id', $userId)->where('is_completed', false)->get() as $goal) {
            if ($goal->target_phoneme && !collect($phonemes)->contains(fn ($phoneme) => mb_strtolower($phoneme->phoneme) === mb_strtolower($goal->target_phoneme) || mb_strtolower($phoneme->ipaSymbol) === mb_strtolower($goal->target_phoneme))) continue;
            $completed = min((int) $goal->target_practices, (int) $goal->completed_practices + 1);
            DB::table('learning_goals')->where('id', $goal->id)->update(['completed_practices' => $completed, 'is_completed' => $completed >= $goal->target_practices, 'updated_at' => now()]);
        }
        $badges = [];
        if ($count >= 1) $badges['first-practice'] = ['First Steps', 'Completed your first pronunciation practice.'];
        if ($count >= 10) $badges['ten-practices'] = ['Sound Explorer', 'Completed ten pronunciation practices.'];
        if ($count >= 25) $badges['twenty-five-practices'] = ['Phonetics Champion', 'Completed twenty-five pronunciation practices.'];
        foreach ($badges as $key => [$title, $description]) {
            if (!DB::table('learning_badges')->where('user_id', $userId)->where('badge_key', $key)->exists()) DB::table('learning_badges')->insert(['user_id' => $userId, 'badge_key' => $key, 'title' => $title, 'description' => $description, 'earned_at' => now()]);
        }
    }
}
