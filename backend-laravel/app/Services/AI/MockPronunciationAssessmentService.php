<?php

namespace App\Services\AI;

class MockPronunciationAssessmentService implements PronunciationAssessmentInterface
{
    /**
     * Map common English phonemes with actionable articulation advice.
     */
    protected array $phoneticGuidance = [
        'θ' => 'Place the tip of your tongue gently between your upper and lower teeth. Expel air without voicing.',
        'ð' => 'Place your tongue tip between teeth, but vibrate your vocal cords.',
        'ɪ' => 'Lower your jaw slightly compared to /i:/; keep your tongue relaxed in the mid-high front position.',
        'i:' => 'Spread your lips in a subtle smile; tongue high front tense.',
        'ŋ' => 'Touch the back of your tongue against the soft palate (velum); sound passes through the nasal cavity.',
        'k' => 'Back of tongue presses firmly against the velum, releasing an unvoiced burst of air.',
        'æ' => 'Open your mouth wide, jaw dropped, tongue low front.',
        'ʌ' => 'Mid-central relaxed vowel with tongue low-to-mid.',
        'ə' => 'Neutral unstressed schwa; completely relaxed articulators.',
        'ʃ' => 'Blade of tongue close to postalveolar ridge with slight lip rounding.',
        'tʃ' => 'Affricate starting with unvoiced stop /t/ releasing smoothly into /ʃ/.',
    ];

    public function getProviderName(): string
    {
        return 'mock_institutional_simulator';
    }

    public function assess(string $audioFilePath, string $referenceText, array $options = []): AssessmentResult
    {
        // Extract or default IPA symbols for common words
        $targetIpa = $options['target_ipa'] ?? $this->lookupIpa($referenceText);
        $phonemeSymbols = $this->extractPhonemes($targetIpa, $referenceText);

        $phonemeScores = [];
        $totalAccuracy = 0;

        foreach ($phonemeSymbols as $symbol) {
            // High fidelity realistic score simulation (70% - 98%)
            $score = mt_rand(68, 97);
            $status = match (true) {
                $score >= 85 => 'correct',
                $score >= 70 => 'acceptable',
                default => 'needs_improvement',
            };

            $suggestion = $status === 'needs_improvement'
                ? ($this->phoneticGuidance[$symbol] ?? "Refine the tongue position and airflow for /{$symbol}/.")
                : null;

            $phonemeScores[] = new PhonemeScore(
                phoneme: $symbol,
                ipaSymbol: "/{$symbol}/",
                score: $score,
                status: $status,
                suggestion: $suggestion
            );

            $totalAccuracy += $score;
        }

        $phonemeCount = max(1, count($phonemeScores));
        $accuracyScore = $totalAccuracy / $phonemeCount;
        $fluencyScore = mt_rand(75, 95);
        $completenessScore = 100.0;
        $prosodyScore = mt_rand(72, 92);

        $overallScore = ($accuracyScore * 0.5) + ($fluencyScore * 0.3) + ($prosodyScore * 0.2);

        $feedback = $overallScore >= 85
            ? "Exceptional pronunciation! Your articulation of target sounds aligns with Standard Modern British / General American phonetics."
            : "Good effort. Pay close attention to your consonant articulation and vowel length highlighted in amber below.";

        return new AssessmentResult(
            overallScore: $overallScore,
            accuracyScore: $accuracyScore,
            fluencyScore: (float)$fluencyScore,
            completenessScore: $completenessScore,
            prosodyScore: (float)$prosodyScore,
            phonemes: $phonemeScores,
            actionableFeedback: $feedback,
            provider: $this->getProviderName(),
            rawResponse: ['simulated' => true, 'timestamp' => time()]
        );
    }

    protected function lookupIpa(string $word): string
    {
        $dictionary = [
            'think' => '/θɪŋk/',
            'thought' => '/θɔːt/',
            'this' => '/ðɪs/',
            'ship' => '/ʃɪp/',
            'sheep' => '/ʃiːp/',
            'cat' => '/kæt/',
            'cup' => '/kʌp/',
            'sing' => '/sɪŋ/',
            'teacher' => '/ˈtiːtʃə/',
            'phonetics' => '/fəˈnetɪks/',
        ];

        return $dictionary[strtolower(trim($word))] ?? '/θɪŋk/';
    }

    protected function extractPhonemes(string $ipa, string $fallbackWord): array
    {
        $cleaned = trim($ipa, '/');
        // Simple phonetic unit segmentation
        $units = [];
        $len = mb_strlen($cleaned);
        $i = 0;
        while ($i < $len) {
            $char = mb_substr($cleaned, $i, 1);
            if ($char === 'ː' || $char === 'ˈ' || $char === 'ˌ') {
                $i++;
                continue;
            }
            // Check for diphthongs or digraphs
            if ($i + 1 < $len) {
                $next = mb_substr($cleaned, $i + 1, 1);
                if (in_array($char . $next, ['aɪ', 'eɪ', 'ɔɪ', 'aʊ', 'əʊ', 'ɪə', 'eə', 'ʊə', 'tʃ', 'dʒ'])) {
                    $units[] = $char . $next;
                    $i += 2;
                    continue;
                }
            }
            $units[] = $char;
            $i++;
        }

        return !empty($units) ? $units : ['θ', 'ɪ', 'ŋ', 'k'];
    }
}
