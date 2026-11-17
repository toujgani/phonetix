<?php

namespace App\Services\AI;

class AssessmentResult
{
    /**
     * @param float $overallScore Overall Pronunciation Score (0-100)
     * @param float $accuracyScore Accuracy of articulation (0-100)
     * @param float $fluencyScore Rhythm and natural flow (0-100)
     * @param float $completenessScore Completeness of utterance (0-100)
     * @param float|null $prosodyScore Pitch and intonation contour (0-100)
     * @param PhonemeScore[] $phonemes Array of phoneme-by-phoneme scores
     * @param string $actionableFeedback Pedagogical feedback for student improvement
     * @param string $provider Identifier of the assessment engine
     * @param array $rawResponse Underlying vendor payload
     */
    public function __construct(
        public float $overallScore,
        public float $accuracyScore,
        public float $fluencyScore,
        public float $completenessScore,
        public ?float $prosodyScore,
        public array $phonemes,
        public string $actionableFeedback,
        public string $provider,
        public array $rawResponse = []
    ) {}

    public function toArray(): array
    {
        return [
            'overall_score' => round($this->overallScore, 1),
            'accuracy_score' => round($this->accuracyScore, 1),
            'fluency_score' => round($this->fluencyScore, 1),
            'completeness_score' => round($this->completenessScore, 1),
            'prosody_score' => $this->prosodyScore !== null ? round($this->prosodyScore, 1) : null,
            'phonemes' => array_map(fn(PhonemeScore $p) => $p->toArray(), $this->phonemes),
            'actionable_feedback' => $this->actionableFeedback,
            'provider' => $this->provider,
        ];
    }
}
