<?php

namespace App\Services\AI;

interface PronunciationAssessmentInterface
{
    /**
     * Assess an audio recording against a target reference text.
     *
     * @param string $audioFilePath Path to the recorded audio file on disk or object storage
     * @param string $referenceText Target word or sentence expected
     * @param array $options Additional options such as target IPA, CEFR level, granularity
     * @return AssessmentResult
     */
    public function assess(string $audioFilePath, string $referenceText, array $options = []): AssessmentResult;

    /**
     * Get the identifier of the active provider.
     *
     * @return string
     */
    public function getProviderName(): string;
}
