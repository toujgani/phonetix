<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PronunciationExercise extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'target_text',
        'ipa_transcription',
        'audio_sample_url',
        'difficulty',
        'phonetic_explanation',
        'target_phonemes',
    ];

    protected $casts = [
        'target_phonemes' => 'array',
    ];

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    public function attempts()
    {
        return $this->hasMany(PronunciationAttempt::class, 'exercise_id');
    }
}
