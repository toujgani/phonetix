<?php

namespace App\Services\AI;

class AIServiceManager
{
    public static function getPronunciationService(): PronunciationAssessmentInterface
    {
        $provider = config('phonetix.ai_provider', 'azure');

        return match ($provider) {
            'azure' => new AzurePronunciationAssessmentService(),
            default => new MockPronunciationAssessmentService(),
        };
    }
}
