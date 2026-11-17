<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PronunciationResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'attempt_id',
        'overall_score',
        'accuracy_score',
        'fluency_score',
        'completeness_score',
        'prosody_score',
        'assessed_by_provider',
        'raw_provider_response',
        'actionable_feedback',
    ];

    protected $casts = [
        'overall_score' => 'float',
        'accuracy_score' => 'float',
        'fluency_score' => 'float',
        'completeness_score' => 'float',
        'prosody_score' => 'float',
        'raw_provider_response' => 'array',
    ];

    public function attempt()
    {
        return $this->belongsTo(PronunciationAttempt::class, 'attempt_id');
    }

    public function phonemeResults()
    {
        return $this->hasMany(PronunciationPhonemeResult::class, 'result_id');
    }
}
