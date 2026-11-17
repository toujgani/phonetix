import {
  PronunciationExercise,
  PronunciationAssessment,
  IpaSymbol,
  AiChatMessage,
  GameItem,
  Course,
  TelemetryData,
  AuditLogItem,
  User,
} from '../types';

// Speak real English example words with the browser's installed speech voice.
export const speakPronunciation = (text: string, onEnd?: () => void, settings: { rate?: number; lang?: string } = {}): boolean => {
  if (!('speechSynthesis' in window) || !text.trim()) return false;

  const speech = window.speechSynthesis;
  speech.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = speech.getVoices();
  const preferredLanguage = settings.lang || 'en-GB';
  const voice = voices.find((candidate) => candidate.lang.toLowerCase() === preferredLanguage.toLowerCase())
    || voices.find((candidate) => candidate.lang.toLowerCase().startsWith('en-'));

  utterance.lang = voice?.lang || preferredLanguage;
  utterance.rate = settings.rate ?? 0.82;
  if (voice) utterance.voice = voice;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  speech.speak(utterance);
  return true;
};

// Initial IPA Chart dataset with complete articulation metadata
export const IPA_SYMBOLS: IpaSymbol[] = [
  // Monophthongs (Vowels)
  { symbol: 'iː', name: 'Close front unrounded vowel', category: 'monophthong', subCategory: 'Long Vowel', exampleWord: 'see', exampleIpa: '/siː/', articulationTip: 'Lips spread wide; tongue elevated high in front of mouth.', audioFrequency: 520 },
  { symbol: 'ɪ', name: 'Near-close near-front unrounded vowel', category: 'monophthong', subCategory: 'Short Vowel', exampleWord: 'sit', exampleIpa: '/sɪt/', articulationTip: 'Slightly lower and more relaxed than /iː/. Jaw lowered gently.', audioFrequency: 460 },
  { symbol: 'e', name: 'Close-mid front unrounded vowel', category: 'monophthong', subCategory: 'Short Vowel', exampleWord: 'bed', exampleIpa: '/bed/', articulationTip: 'Tongue half-way between open and close.', audioFrequency: 400 },
  { symbol: 'æ', name: 'Near-open front unrounded vowel', category: 'monophthong', subCategory: 'Short Vowel', exampleWord: 'cat', exampleIpa: '/kæt/', articulationTip: 'Drop jaw low; tongue low in front, lips neutrally open.', audioFrequency: 340 },
  { symbol: 'ɑː', name: 'Open back unrounded vowel', category: 'monophthong', subCategory: 'Long Vowel', exampleWord: 'car', exampleIpa: '/kɑː/', articulationTip: 'Deep, open back resonant vowel. Jaw wide open.', audioFrequency: 300 },
  { symbol: 'ɒ', name: 'Open back rounded vowel', category: 'monophthong', subCategory: 'Short Vowel', exampleWord: 'hot', exampleIpa: '/hɒt/', articulationTip: 'Short back vowel with slight lip rounding.', audioFrequency: 320 },
  { symbol: 'ɔː', name: 'Open-mid back rounded vowel', category: 'monophthong', subCategory: 'Long Vowel', exampleWord: 'call', exampleIpa: '/kɔːl/', articulationTip: 'Lips firmly rounded into an oval; back of tongue raised.', audioFrequency: 350 },
  { symbol: 'ʊ', name: 'Near-close near-back rounded vowel', category: 'monophthong', subCategory: 'Short Vowel', exampleWord: 'put', exampleIpa: '/pʊt/', articulationTip: 'Tongue near-close near-back with loose lip rounding.', audioFrequency: 410 },
  { symbol: 'uː', name: 'Close back rounded vowel', category: 'monophthong', subCategory: 'Long Vowel', exampleWord: 'too', exampleIpa: '/tuː/', articulationTip: 'Lips tightly rounded, tongue high and back in mouth.', audioFrequency: 470 },
  { symbol: 'ʌ', name: 'Open-mid back unrounded vowel', category: 'monophthong', subCategory: 'Short Vowel', exampleWord: 'cup', exampleIpa: '/kʌp/', articulationTip: 'Mid-central to back unrounded sound.', audioFrequency: 360 },
  { symbol: 'ɜː', name: 'Open-mid central unrounded vowel', category: 'monophthong', subCategory: 'Long Vowel', exampleWord: 'bird', exampleIpa: '/bɜːd/', articulationTip: 'Central neutral long vowel; lips unrounded.', audioFrequency: 380 },
  { symbol: 'ə', name: 'Mid-central vowel (Schwa)', category: 'monophthong', subCategory: 'Unstressed Vowel', exampleWord: 'about', exampleIpa: '/əˈbaʊt/', articulationTip: 'Most common sound in English. Completely relaxed mouth and jaw.', audioFrequency: 370 },

  // Diphthongs
  { symbol: 'eɪ', name: 'Closing diphthong to /ɪ/', category: 'diphthong', subCategory: 'Closing Diphthong', exampleWord: 'face', exampleIpa: '/feɪs/', articulationTip: 'Glide smoothly from /e/ into /ɪ/.', audioFrequency: 430 },
  { symbol: 'aɪ', name: 'Closing diphthong to /ɪ/', category: 'diphthong', subCategory: 'Closing Diphthong', exampleWord: 'price', exampleIpa: '/praɪs/', articulationTip: 'Glide from open front /a/ towards near-close /ɪ/.', audioFrequency: 440 },
  { symbol: 'ɔɪ', name: 'Closing diphthong to /ɪ/', category: 'diphthong', subCategory: 'Closing Diphthong', exampleWord: 'choice', exampleIpa: '/tʃɔɪs/', articulationTip: 'Glide from open back rounded /ɔ/ towards /ɪ/.', audioFrequency: 420 },
  { symbol: 'aʊ', name: 'Closing diphthong to /ʊ/', category: 'diphthong', subCategory: 'Closing Diphthong', exampleWord: 'mouth', exampleIpa: '/maʊθ/', articulationTip: 'Glide from open front /a/ towards /ʊ/ with increasing lip rounding.', audioFrequency: 390 },
  { symbol: 'əʊ', name: 'Closing diphthong to /ʊ/', category: 'diphthong', subCategory: 'Closing Diphthong', exampleWord: 'goat', exampleIpa: '/ɡəʊt/', articulationTip: 'Glide from neutral central /ə/ towards /ʊ/.', audioFrequency: 385 },
  { symbol: 'ɪə', name: 'Centring diphthong to /ə/', category: 'diphthong', subCategory: 'Centring Diphthong', exampleWord: 'near', exampleIpa: '/nɪə/', articulationTip: 'Glide from near-close /ɪ/ into relaxed schwa /ə/.', audioFrequency: 415 },
  { symbol: 'eə', name: 'Centring diphthong to /ə/', category: 'diphthong', subCategory: 'Centring Diphthong', exampleWord: 'square', exampleIpa: '/skweə/', articulationTip: 'Glide from half-open front /e/ into schwa.', audioFrequency: 395 },

  // Consonants (Voiceless & Voiced Pairs)
  { symbol: 'θ', name: 'Voiceless dental fricative', category: 'consonant', subCategory: 'Dental / Fricative / Voiceless', exampleWord: 'think', exampleIpa: '/θɪŋk/', articulationTip: 'Tongue tip between teeth, expel air gently without vocal chord vibration.', audioFrequency: 600 },
  { symbol: 'ð', name: 'Voiced dental fricative', category: 'consonant', subCategory: 'Dental / Fricative / Voiced', exampleWord: 'this', exampleIpa: '/ðɪs/', articulationTip: 'Same position as /θ/, but actively vibrate vocal cords.', audioFrequency: 220 },
  { symbol: 'ʃ', name: 'Voiceless postalveolar fricative', category: 'consonant', subCategory: 'Postalveolar / Fricative / Voiceless', exampleWord: 'ship', exampleIpa: '/ʃɪp/', articulationTip: 'Blade of tongue near alveolar ridge, lips slightly flared.', audioFrequency: 650 },
  { symbol: 'ʒ', name: 'Voiced postalveolar fricative', category: 'consonant', subCategory: 'Postalveolar / Fricative / Voiced', exampleWord: 'measure', exampleIpa: '/ˈmeʒə/', articulationTip: 'Same as /ʃ/, with vocal fold vibration.', audioFrequency: 240 },
  { symbol: 'tʃ', name: 'Voiceless postalveolar affricate', category: 'consonant', subCategory: 'Affricate / Voiceless', exampleWord: 'church', exampleIpa: '/tʃɜːtʃ/', articulationTip: 'Plosive /t/ releasing smoothly into postalveolar fricative /ʃ/.', audioFrequency: 580 },
  { symbol: 'dʒ', name: 'Voiced postalveolar affricate', category: 'consonant', subCategory: 'Affricate / Voiced', exampleWord: 'judge', exampleIpa: '/dʒʌdʒ/', articulationTip: 'Voiced partner to /tʃ/; tongue contacts alveolar ridge and releases.', audioFrequency: 250 },
  { symbol: 'ŋ', name: 'Voiced velar nasal', category: 'consonant', subCategory: 'Velar / Nasal / Voiced', exampleWord: 'sing', exampleIpa: '/sɪŋ/', articulationTip: 'Back of tongue contacts soft palate; air resonates through nasal cavity.', audioFrequency: 210 },
  { symbol: 'v', name: 'Voiced labiodental fricative', category: 'consonant', subCategory: 'Labiodental / Fricative / Voiced', exampleWord: 'voice', exampleIpa: '/vɔɪs/', articulationTip: 'Upper incisors press lower lip while vocal cords buzz.', audioFrequency: 230 },
  { symbol: 'w', name: 'Voiced labial-velar approximant', category: 'consonant', subCategory: 'Approximant / Voiced', exampleWord: 'west', exampleIpa: '/west/', articulationTip: 'Lips rounded tightly, back of tongue elevated towards velum.', audioFrequency: 260 },
  { symbol: 'j', name: 'Voiced palatal approximant', category: 'consonant', subCategory: 'Approximant / Voiced', exampleWord: 'yes', exampleIpa: '/jes/', articulationTip: 'Tongue raised close to hard palate like a very brief /iː/.', audioFrequency: 450 },
];

export const INITIAL_EXERCISES: PronunciationExercise[] = [
  {
    id: 1,
    target_text: 'Think',
    ipa_transcription: '/θɪŋk/',
    difficulty: 'beginner',
    phonetic_explanation: 'Contrasts the unvoiced dental fricative /θ/ with the voiced velar nasal /ŋ/.',
    target_phonemes: ['θ', 'ɪ', 'ŋ', 'k'],
  },
  {
    id: 2,
    target_text: 'Thoughtful',
    ipa_transcription: '/ˈθɔːtfəl/',
    difficulty: 'intermediate',
    phonetic_explanation: 'Features long vowel /ɔː/ followed by unvoiced stop /t/ and unstressed schwa /ə/.',
    target_phonemes: ['θ', 'ɔː', 't', 'f', 'ə', 'l'],
  },
  {
    id: 3,
    target_text: 'Distinguish',
    ipa_transcription: '/dɪˈstɪŋɡwɪʃ/',
    difficulty: 'advanced',
    phonetic_explanation: 'Complex consonant cluster /ŋɡw/ followed by postalveolar fricative /ʃ/.',
    target_phonemes: ['d', 'ɪ', 's', 't', 'ɪ', 'ŋ', 'ɡ', 'w', 'ɪ', 'ʃ'],
  },
  {
    id: 4,
    target_text: 'Pronunciation',
    ipa_transcription: '/prəˌnʌnsiˈeɪʃən/',
    difficulty: 'advanced',
    phonetic_explanation: 'Multisyllabic word requiring distinct primary stress on /eɪ/ and secondary on /nʌn/.',
    target_phonemes: ['p', 'r', 'ə', 'n', 'ʌ', 'n', 's', 'i', 'eɪ', 'ʃ', 'ə', 'n'],
  },
  {
    id: 5,
    target_text: 'Ship vs Sheep',
    ipa_transcription: '/ʃɪp/ vs /ʃiːp/',
    difficulty: 'beginner',
    phonetic_explanation: 'Classic minimal pair contrasting lax short vowel /ɪ/ with tense long /iː/.',
    target_phonemes: ['ʃ', 'ɪ', 'p', 'iː'],
  },
];

export const INITIAL_GAMES: GameItem[] = [
  {
    id: 1,
    title: 'Minimal Pairs Showdown',
    type: 'minimal_pairs',
    difficulty: 'easy',
    description: 'Listen carefully and distinguish between confusing vowel pairs (/ɪ/ vs /iː/, /æ/ vs /ʌ/).',
    timeLimit: 60,
    passingScore: 60,
    questionsCount: 10,
  },
  {
    id: 2,
    title: 'IPA Sound Detective',
    type: 'sound_recognition',
    difficulty: 'medium',
    description: 'Identify the exact phonetic symbol corresponding to the spoken acoustic prompt.',
    timeLimit: 90,
    passingScore: 60,
    questionsCount: 12,
  },
  {
    id: 3,
    title: 'Word Stress Master',
    type: 'word_stress',
    difficulty: 'hard',
    description: 'Pinpoint the syllable carrying the primary lexical stress in multisyllabic academic terms.',
    timeLimit: 120,
    passingScore: 60,
    questionsCount: 15,
  },
  {
    id: 4,
    title: 'Phonetic Transcription Race',
    type: 'phonetic_transcription',
    difficulty: 'hard',
    description: 'Use the interactive IPA keyboard to transcribe spoken words under time pressure.',
    timeLimit: 120,
    passingScore: 60,
    questionsCount: 3,
  },
  {
    id: 5,
    title: 'Syllable Count Challenge',
    type: 'syllable_count',
    difficulty: 'easy',
    description: 'Listen to a word and identify how many syllables it contains.',
    timeLimit: 60,
    passingScore: 60,
    questionsCount: 3,
  },
  {
    id: 6,
    title: 'Voice or No Voice?',
    type: 'voicing_detective',
    difficulty: 'medium',
    description: 'Tell voiced consonants from their unvoiced partners by listening for vocal fold vibration.',
    timeLimit: 75,
    passingScore: 60,
    questionsCount: 3,
  },
  {
    id: 7,
    title: 'Rhyme Time',
    type: 'rhyme_time',
    difficulty: 'easy',
    description: 'Choose the word that shares the same ending sound with the spoken word.',
    timeLimit: 60,
    passingScore: 60,
    questionsCount: 3,
  },
  {
    id: 8,
    title: 'Sound Position Detective',
    type: 'sound_position',
    difficulty: 'medium',
    description: 'Find the word that starts or ends with the target phoneme.',
    timeLimit: 75,
    passingScore: 60,
    questionsCount: 3,
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 1,
    code: 'ENG-PHON-101',
    title: 'Foundations of English Phonetics & Articulation',
    credits: 3,
    description: 'Comprehensive study of articulatory phonetics, the International Phonetic Alphabet, vowel spaces, and consonant manners.',
    department: 'Applied Linguistics',
    progressPercentage: 68,
    chaptersCount: 5,
    lessonsCount: 16,
  },
  {
    id: 2,
    code: 'ENG-ORAL-202',
    title: 'Connected Speech, Intonation & Oral Fluency',
    credits: 4,
    description: 'Mastery of weak forms, assimilation, elision, rhythm, and tone units in academic discourse.',
    department: 'English Language & Literature',
    progressPercentage: 35,
    chaptersCount: 4,
    lessonsCount: 12,
  },
];

export const INITIAL_TELEMETRY: TelemetryData = {
  backend_status: 'healthy',
  db_latency_ms: 12.4,
  redis_connected: true,
  active_queue_jobs: 3,
  failed_jobs: 0,
  storage_usage_gb: 14.8,
  total_students: 1248,
  active_students: 1192,
  pending_registrations: 4,
  total_teachers: 34,
  total_groups: 28,
};

export const INITIAL_PENDING_REGISTRATIONS: User[] = [
  {
    id: 101,
    institutional_id: 'STU-2026-9041',
    first_name: 'David',
    last_name: 'Al-Mansoor',
    email: 'd.almansoor@student.phonetix.edu',
    role: 'student',
    status: 'pending',
    department: 'English Language & Literature',
    group_name: 'Group B1',
    created_at: '2026-11-09T14:22:00Z',
  },
  {
    id: 102,
    institutional_id: 'STU-2026-9042',
    first_name: 'Fatima',
    last_name: 'Bouchard',
    email: 'f.bouchard@student.phonetix.edu',
    role: 'student',
    status: 'pending',
    department: 'Applied Linguistics',
    group_name: 'Group A2',
    created_at: '2026-11-10T08:15:00Z',
  },
  {
    id: 103,
    institutional_id: 'STU-2026-9043',
    first_name: 'Mateo',
    last_name: 'Rossi',
    email: 'm.rossi@student.phonetix.edu',
    role: 'student',
    status: 'pending',
    department: 'English Education',
    group_name: 'Group C1',
    created_at: '2026-11-10T11:40:00Z',
  },
  {
    id: 104,
    institutional_id: 'STU-2026-9044',
    first_name: 'Yuki',
    last_name: 'Tanaka',
    email: 'y.tanaka@student.phonetix.edu',
    role: 'student',
    status: 'pending',
    department: 'Applied Linguistics',
    group_name: 'Group B2',
    created_at: '2026-11-10T16:05:00Z',
  },
];
