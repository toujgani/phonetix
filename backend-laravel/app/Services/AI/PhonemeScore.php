<?php

namespace App\Services\AI;

class PhonemeScore
{
    public function __construct(
        public string $phoneme,
        public string $ipaSymbol,
        public float $score, // 0 - 100
        public string $status, // 'correct', 'acceptable', 'needs_improvement', 'omitted'
        public ?string $suggestion = null,
        public ?int $startOffsetMs = null,
        public ?int $endOffsetMs = null
    ) {}

    public function toArray(): array
    {
        return [
            'phoneme' => $this->phoneme,
            'ipa_symbol' => $this->ipaSymbol,
            'score' => round($this->score, 1),
            'status' => $this->status,
            'suggestion' => $this->suggestion,
            'start_offset_ms' => $this->startOffsetMs,
            'end_offset_ms' => $this->endOffsetMs,
        ];
    }
}
