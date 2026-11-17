<?php

return [
    'ai_provider' => env('PHONETIX_AI_PROVIDER', 'azure'),
    'azure' => [
        'key' => env('AZURE_SPEECH_KEY', ''),
        'region' => env('AZURE_SPEECH_REGION', ''),
        'language' => env('AZURE_SPEECH_LANGUAGE', 'en-US'),
    ],
];
