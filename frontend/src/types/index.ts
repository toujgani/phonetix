export type UserRole = 'super_admin' | 'teacher' | 'student';
export type UserStatus = 'pending' | 'active' | 'suspended' | 'rejected';

export interface User {
  id: number;
  institutional_id: string;
  first_name: string;
  last_name: string;
  email: string;
  personal_email?: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  approved_at?: string;
  rejection_reason?: string;
  avatar_url?: string;
  department?: string;
  group_name?: string;
  created_at: string;
}

export type ChapterState =
  | 'draft'
  | 'scheduled'
  | 'locked'
  | 'published'
  | 'in_progress'
  | 'completed'
  | 'archived';

export interface ChapterMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'pptx' | 'docx' | 'audio' | 'video' | 'image';
  file_url: string;
  size_bytes: number;
}

export interface ChapterGroupRelease {
  groupId: string;
  groupName: string;
  status: ChapterState;
  releasedAt?: string;
  releasedBy?: string;
  scheduledAt?: string;
  lockedAt?: string;
  studentsStarted: number;
  studentsCompleted: number;
  averageScore?: number;
}

export interface Chapter {
  id: number;
  course_id: number;
  order_number: number;
  title: string;
  description: string;
  weeks: string;
  learning_objectives: string[];
  materials: ChapterMaterial[];
  groupReleases: Record<string, ChapterGroupRelease>; // keyed by groupId e.g. 'G1'
  lessonsCount: number;
}

export interface BrandingConfig {
  platformName: string;
  shortName: string;
  institutionName: string;
  logoUrl: string | null;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  websiteUrl: string;
}

export interface PhonemeBreakdown {
  phoneme: string;
  ipa_symbol: string;
  score: number;
  status: 'correct' | 'acceptable' | 'needs_improvement' | 'omitted';
  suggestion?: string;
}

export interface PronunciationAssessment {
  id: number;
  exercise_id: number;
  target_text: string;
  ipa_transcription: string;
  overall_score: number;
  accuracy_score: number;
  fluency_score: number;
  completeness_score: number;
  prosody_score?: number;
  phonemes: PhonemeBreakdown[];
  actionable_feedback: string;
  provider: string;
  audio_url?: string;
  created_at: string;
}

export interface PronunciationExercise {
  id: number;
  lesson_id?: number;
  target_text: string;
  ipa_transcription: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  phonetic_explanation: string;
  target_phonemes: string[];
  audio_sample_url?: string;
}

export interface IpaSymbol {
  symbol: string;
  name: string;
  category: 'monophthong' | 'diphthong' | 'consonant';
  subCategory?: string;
  exampleWord: string;
  exampleIpa: string;
  articulationTip: string;
  /** Legacy metadata retained for compatibility; playback uses spoken example words. */
  audioFrequency?: number;
}

export interface AiChatMessage {
  id: string;
  sender: 'student' | 'ai_tutor';
  text: string;
  timestamp: string;
  audioUrl?: string;
  grammarFeedback?: string[];
  pronunciationNotes?: string[];
}

export interface GameItem {
  id: number;
  title: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  timeLimit: number;
  passingScore: number;
  questionsCount: number;
}

export interface Course {
  id: number;
  code: string;
  title: string;
  credits: number;
  description: string;
  department: string;
  progressPercentage?: number;
  chaptersCount?: number;
  lessonsCount?: number;
}

export interface Lesson {
  id: number;
  chapter_id: number;
  order_number: number;
  title: string;
  content_body: string;
  duration_minutes: number;
  is_completed?: boolean;
}

export interface TelemetryData {
  backend_status: 'healthy' | 'degraded' | 'critical';
  db_latency_ms: number;
  redis_connected: boolean;
  active_queue_jobs: number;
  failed_jobs: number;
  storage_usage_gb: number;
  total_students: number;
  active_students: number;
  pending_registrations: number;
  total_teachers: number;
  total_groups: number;
}

export interface AuditLogItem {
  id: number;
  user_name: string;
  action: string;
  entity: string;
  ip_address: string;
  timestamp: string;
}
