<?php

namespace App\Services\AI;

use GuzzleHttp\Client;
use Exception;

class AzurePronunciationAssessmentService implements PronunciationAssessmentInterface
{
    protected string $apiKey;
    protected string $region;
    protected string $language;
    protected Client $httpClient;

    public function __construct(?string $apiKey = null, ?string $region = null, ?string $language = 'en-US')
    {
        $this->apiKey = $apiKey ?? config('phonetix.azure.key', '');
        $this->region = $region ?? config('phonetix.azure.region', 'eastus');
        $this->language = $language ?? config('phonetix.azure.language', 'en-US');
        $this->httpClient = new Client();
    }

    public function getProviderName(): string
    {
        return 'azure_ai_speech';
    }

    public function assess(string $audioFilePath, string $referenceText, array $options = []): AssessmentResult
    {
        if (empty($this->apiKey) || empty($this->region)) {
            throw new Exception('Azure Speech credentials are not configured.');
        }

        $endpoint = "https://{$this->region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language={$this->language}";

        $pronAssessmentParams = [
            'ReferenceText' => $referenceText,
            'GradingSystem' => 'HundredMark',
            'Granularity' => 'Phoneme',
            'PhonemeAlphabet' => 'IPA',
            'Dimension' => 'Comprehensive',
            'EnableMiscue' => true,
        ];

        $encodedParams = base64_encode(json_encode($pronAssessmentParams));

        if (!file_exists($audioFilePath)) {
            throw new Exception("Recorded audio file not found at: {$audioFilePath}");
        }

        $audioData = file_get_contents($audioFilePath);

        try {
            $response = $this->httpClient->post($endpoint, [
                'headers' => [
                    'Ocp-Apim-Subscription-Key' => $this->apiKey,
                    'Pronunciation-Assessment' => $encodedParams,
                    'Content-Type' => 'audio/wav; codecs=audio/pcm; samplerate=16000',
                    'Accept' => 'application/json',
                ],
                'body' => $audioData,
                'timeout' => 20,
            ]);

            $json = json_decode($response->getBody()->getContents(), true);
            return $this->parseAzureResponse($json, $referenceText);

        } catch (Exception $e) {
            throw $e;
        }
    }

    protected function parseAzureResponse(array $json, string $referenceText): AssessmentResult
    {
        $nBest = $json['NBest'][0] ?? [];
        $pronScore = $nBest['PronunciationAssessment'] ?? [];

        $overallScore = (float)($pronScore['PronScore'] ?? 80);
        $accuracyScore = (float)($pronScore['AccuracyScore'] ?? 80);
        $fluencyScore = (float)($pronScore['FluencyScore'] ?? 80);
        $completenessScore = (float)($pronScore['CompletenessScore'] ?? 100);
        $prosodyScore = isset($pronScore['ProsodyScore']) ? (float)$pronScore['ProsodyScore'] : null;

        $phonemes = [];
        foreach ($nBest['Words'] ?? [] as $word) {
            foreach ($word['Phonemes'] ?? [] as $p) {
                $score = (float)($p['PronunciationAssessment']['AccuracyScore'] ?? 0);
                $status = match (true) {
                    $score >= 85 => 'correct',
                    $score >= 70 => 'acceptable',
                    default => 'needs_improvement',
                };

                $phonemes[] = new PhonemeScore(
                    phoneme: $p['Phoneme'],
                    ipaSymbol: "/{$p['Phoneme']}/",
                    score: $score,
                    status: $status,
                    suggestion: $status === 'needs_improvement' ? "Review articulation and tongue placement for /{$p['Phoneme']}/." : null
                );
            }
        }

        $needsPractice = collect($phonemes)->filter(fn (PhonemeScore $score) => $score->status === 'needs_improvement')->pluck('ipaSymbol')->unique()->values();
        $feedback = $needsPractice->isEmpty()
            ? 'Good work. Keep practising at a natural pace and maintain clear word stress.'
            : 'Focus on '.implode(', ', $needsPractice->all()).'. Repeat the word slowly, then blend it into a natural sentence.';

        return new AssessmentResult(
            overallScore: $overallScore,
            accuracyScore: $accuracyScore,
            fluencyScore: $fluencyScore,
            completenessScore: $completenessScore,
            prosodyScore: $prosodyScore,
            phonemes: $phonemes,
            actionableFeedback: $feedback,
            provider: $this->getProviderName(),
            rawResponse: $json
        );
    }
}
