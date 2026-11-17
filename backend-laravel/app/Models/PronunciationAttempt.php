<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PronunciationAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'exercise_id',
        'student_id',
        'voice_recording_id',
        'attempt_number',
    ];

    public function exercise()
    {
        return $this->belongsTo(PronunciationExercise::class, 'exercise_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function voiceRecording()
    {
        return $this->belongsTo(VoiceRecording::class, 'voice_recording_id');
    }

    public function result()
    {
        return $this->hasOne(PronunciationResult::class, 'attempt_id');
    }
}
