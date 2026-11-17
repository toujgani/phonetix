import { create } from 'zustand';
import { Chapter, ChapterGroupRelease, ChapterMaterial, ChapterState } from '../types';

interface CourseState {
  chapters: Chapter[];
  completedLessonIds: number[];
  launchChapter: (chapterId: number, groupId: string, professorName: string) => void;
  lockChapter: (chapterId: number, groupId: string) => void;
  reopenChapter: (chapterId: number, groupId: string) => void;
  scheduleChapter: (chapterId: number, groupId: string, date: string, time: string) => void;
  createChapter: (newChapter: Omit<Chapter, 'id' | 'materials' | 'groupReleases' | 'lessonsCount'>) => void;
  uploadMaterial: (chapterId: number, material: Omit<ChapterMaterial, 'id'>) => void;
  toggleLessonCompletion: (lessonId: number) => void;
  getChapterAccess: (
    chapterId: number,
    groupName?: string
  ) => { isAccessible: boolean; status: ChapterState; message: string; release?: ChapterGroupRelease };
}

const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: 1,
    course_id: 1,
    order_number: 1,
    title: 'Chapter 1: Foundations of Articulatory Phonetics',
    description: 'Anatomical structures of the vocal tract, pulmonary airflow, and mechanisms of phonation.',
    weeks: 'Weeks 1–2',
    learning_objectives: [
      'Identify upper and lower vocal tract articulators.',
      'Distinguish voiced vs unvoiced glottal vibrations.',
      'Trace pulmonic egressive airflow dynamics.',
    ],
    materials: [
      {
        id: 'mat-101',
        title: 'Vocal_Tract_Anatomy_Guide.pdf',
        type: 'pdf',
        file_url: '/materials/Vocal_Tract_Anatomy_Guide.pdf',
        size_bytes: 2450000,
      },
      {
        id: 'mat-102',
        title: 'Glottal_Waveform_Demonstration.mp3',
        type: 'audio',
        file_url: '/materials/Glottal_Waveform_Demonstration.mp3',
        size_bytes: 4800000,
      },
    ],
    lessonsCount: 2,
    groupReleases: {
      'Cohort A1': {
        groupId: 'Cohort A1',
        groupName: 'Cohort A1',
        status: 'published',
        releasedAt: '2026-10-01T09:00:00Z',
        releasedBy: 'Prof. Arthur Holloway',
        studentsStarted: 32,
        studentsCompleted: 28,
        averageScore: 84.5,
      },
      'Cohort B1': {
        groupId: 'Cohort B1',
        groupName: 'Cohort B1',
        status: 'published',
        releasedAt: '2026-10-02T10:30:00Z',
        releasedBy: 'Prof. Arthur Holloway',
        studentsStarted: 26,
        studentsCompleted: 22,
        averageScore: 81.0,
      },
      'Cohort B2': {
        groupId: 'Cohort B2',
        groupName: 'Cohort B2',
        status: 'published',
        releasedAt: '2026-10-02T11:00:00Z',
        releasedBy: 'Prof. Arthur Holloway',
        studentsStarted: 28,
        studentsCompleted: 20,
        averageScore: 79.2,
      },
    },
  },
  {
    id: 2,
    course_id: 1,
    order_number: 2,
    title: 'Chapter 2: English Vowel Spaces & Monophthongs',
    description: 'Acoustic formants, tongue height, backness, lip rounding, and minimal pair discrimination.',
    weeks: 'Weeks 3–5',
    learning_objectives: [
      'Contrast high-front tense /iː/ with lax /ɪ/.',
      'Analyze low-back resonance spaces (/ɑː/, /ɒ/, /ɔː/).',
      'Articulate the unstressed neutral schwa /ə/ in multisyllabic contexts.',
    ],
    materials: [
      {
        id: 'mat-201',
        title: 'Vowel_Quadrant_Acoustics_Handout.pdf',
        type: 'pdf',
        file_url: '/materials/Vowel_Quadrant_Acoustics_Handout.pdf',
        size_bytes: 1850000,
      },
      {
        id: 'mat-202',
        title: 'Minimal_Pairs_Vowels_SlideDeck.pptx',
        type: 'pptx',
        file_url: '/materials/Minimal_Pairs_Vowels_SlideDeck.pptx',
        size_bytes: 6200000,
      },
    ],
    lessonsCount: 3,
    // Group-Specific Release Scenario:
    // Published for Cohort A1, but LOCKED for Cohort B2!
    groupReleases: {
      'Cohort A1': {
        groupId: 'Cohort A1',
        groupName: 'Cohort A1',
        status: 'published',
        releasedAt: '2026-11-01T08:00:00Z',
        releasedBy: 'Prof. Arthur Holloway',
        studentsStarted: 24,
        studentsCompleted: 14,
        averageScore: 82.4,
      },
      'Cohort B1': {
        groupId: 'Cohort B1',
        groupName: 'Cohort B1',
        status: 'scheduled',
        scheduledAt: '2026-11-15T09:00:00Z',
        studentsStarted: 0,
        studentsCompleted: 0,
      },
      'Cohort B2': {
        groupId: 'Cohort B2',
        groupName: 'Cohort B2',
        status: 'locked',
        lockedAt: '2026-11-01T08:00:00Z',
        studentsStarted: 0,
        studentsCompleted: 0,
      },
    },
  },
  {
    id: 3,
    course_id: 1,
    order_number: 3,
    title: 'Chapter 3: Consonant Classification & Articulatory Manners',
    description: 'Plosives, fricatives, affricates, nasals, and approximants across English phonotactics.',
    weeks: 'Weeks 6–7',
    learning_objectives: [
      'Master the dental fricatives /θ/ and /ð/.',
      'Distinguish postalveolar affricates /tʃ/ and /dʒ/.',
      'Overcome velar nasal /ŋ/ cluster interference.',
    ],
    materials: [
      {
        id: 'mat-301',
        title: 'Consonant_Articulatory_Matrix.pdf',
        type: 'pdf',
        file_url: '/materials/Consonant_Articulatory_Matrix.pdf',
        size_bytes: 2100000,
      },
    ],
    lessonsCount: 2,
    groupReleases: {
      'Cohort A1': {
        groupId: 'Cohort A1',
        groupName: 'Cohort A1',
        status: 'locked',
        studentsStarted: 0,
        studentsCompleted: 0,
      },
      'Cohort B1': {
        groupId: 'Cohort B1',
        groupName: 'Cohort B1',
        status: 'locked',
        studentsStarted: 0,
        studentsCompleted: 0,
      },
      'Cohort B2': {
        groupId: 'Cohort B2',
        groupName: 'Cohort B2',
        status: 'locked',
        studentsStarted: 0,
        studentsCompleted: 0,
      },
    },
  },
  {
    id: 4,
    course_id: 1,
    order_number: 4,
    title: 'Chapter 4: Syllable Structure & Word Stress',
    description: 'Syllabic templates, onset-nucleus-coda patterns, and primary/secondary stress markers.',
    weeks: 'Weeks 8–9',
    learning_objectives: [
      'Transcribe complex English onsets and codas.',
      'Locate primary stress in multisyllabic academic derivatives.',
    ],
    materials: [],
    lessonsCount: 2,
    groupReleases: {
      'Cohort A1': {
        groupId: 'Cohort A1',
        groupName: 'Cohort A1',
        status: 'draft',
        studentsStarted: 0,
        studentsCompleted: 0,
      },
      'Cohort B1': {
        groupId: 'Cohort B1',
        groupName: 'Cohort B1',
        status: 'draft',
        studentsStarted: 0,
        studentsCompleted: 0,
      },
      'Cohort B2': {
        groupId: 'Cohort B2',
        groupName: 'Cohort B2',
        status: 'draft',
        studentsStarted: 0,
        studentsCompleted: 0,
      },
    },
  },
];

export const useCourseStore = create<CourseState>((set, get) => {
  // Load persisted state if exists
  const savedChapters = localStorage.getItem('phonetix_chapters_data');
  const savedCompletions = localStorage.getItem('phonetix_lesson_completions');

  let initialChapters = INITIAL_CHAPTERS;
  let initialCompletions: number[] = [1];

  if (savedChapters) {
    try {
      initialChapters = JSON.parse(savedChapters);
    } catch {
      // Fallback
    }
  }

  if (savedCompletions) {
    try {
      initialCompletions = JSON.parse(savedCompletions);
    } catch {
      // Fallback
    }
  }

  const persist = (chapters: Chapter[], completions: number[]) => {
    localStorage.setItem('phonetix_chapters_data', JSON.stringify(chapters));
    localStorage.setItem('phonetix_lesson_completions', JSON.stringify(completions));
  };

  return {
    chapters: initialChapters,
    completedLessonIds: initialCompletions,

    launchChapter: (chapterId: number, groupId: string, professorName: string) => {
      set((state) => {
        const updated = state.chapters.map((ch) => {
          if (ch.id !== chapterId) return ch;
          const currentRelease = ch.groupReleases[groupId] || {
            groupId,
            groupName: groupId,
            studentsStarted: 0,
            studentsCompleted: 0,
          };
          return {
            ...ch,
            groupReleases: {
              ...ch.groupReleases,
              [groupId]: {
                ...currentRelease,
                status: 'published' as ChapterState,
                releasedAt: new Date().toISOString(),
                releasedBy: professorName,
              },
            },
          };
        });
        persist(updated, state.completedLessonIds);
        return { chapters: updated };
      });
    },

    lockChapter: (chapterId: number, groupId: string) => {
      set((state) => {
        const updated = state.chapters.map((ch) => {
          if (ch.id !== chapterId) return ch;
          const currentRelease = ch.groupReleases[groupId] || {
            groupId,
            groupName: groupId,
            studentsStarted: 0,
            studentsCompleted: 0,
          };
          return {
            ...ch,
            groupReleases: {
              ...ch.groupReleases,
              [groupId]: {
                ...currentRelease,
                status: 'locked' as ChapterState,
                lockedAt: new Date().toISOString(),
              },
            },
          };
        });
        persist(updated, state.completedLessonIds);
        return { chapters: updated };
      });
    },

    reopenChapter: (chapterId: number, groupId: string) => {
      set((state) => {
        const updated = state.chapters.map((ch) => {
          if (ch.id !== chapterId) return ch;
          const currentRelease = ch.groupReleases[groupId];
          if (!currentRelease) return ch;
          return {
            ...ch,
            groupReleases: {
              ...ch.groupReleases,
              [groupId]: {
                ...currentRelease,
                status: 'published' as ChapterState,
                releasedAt: new Date().toISOString(),
              },
            },
          };
        });
        persist(updated, state.completedLessonIds);
        return { chapters: updated };
      });
    },

    scheduleChapter: (chapterId: number, groupId: string, date: string, time: string) => {
      set((state) => {
        const updated = state.chapters.map((ch) => {
          if (ch.id !== chapterId) return ch;
          const currentRelease = ch.groupReleases[groupId] || {
            groupId,
            groupName: groupId,
            studentsStarted: 0,
            studentsCompleted: 0,
          };
          return {
            ...ch,
            groupReleases: {
              ...ch.groupReleases,
              [groupId]: {
                ...currentRelease,
                status: 'scheduled' as ChapterState,
                scheduledAt: `${date}T${time}:00Z`,
              },
            },
          };
        });
        persist(updated, state.completedLessonIds);
        return { chapters: updated };
      });
    },

    createChapter: (newChapterData) => {
      set((state) => {
        const newChapter: Chapter = {
          ...newChapterData,
          id: Date.now(),
          materials: [],
          lessonsCount: 1,
          groupReleases: {
            'Cohort A1': { groupId: 'Cohort A1', groupName: 'Cohort A1', status: 'draft', studentsStarted: 0, studentsCompleted: 0 },
            'Cohort B1': { groupId: 'Cohort B1', groupName: 'Cohort B1', status: 'draft', studentsStarted: 0, studentsCompleted: 0 },
            'Cohort B2': { groupId: 'Cohort B2', groupName: 'Cohort B2', status: 'draft', studentsStarted: 0, studentsCompleted: 0 },
          },
        };
        const updated = [...state.chapters, newChapter];
        persist(updated, state.completedLessonIds);
        return { chapters: updated };
      });
    },

    uploadMaterial: (chapterId: number, materialData) => {
      set((state) => {
        const updated = state.chapters.map((ch) => {
          if (ch.id !== chapterId) return ch;
          const newMat: ChapterMaterial = {
            ...materialData,
            id: `mat-${Date.now()}`,
          };
          return {
            ...ch,
            materials: [...ch.materials, newMat],
          };
        });
        persist(updated, state.completedLessonIds);
        return { chapters: updated };
      });
    },

    toggleLessonCompletion: (lessonId: number) => {
      set((state) => {
        const next = state.completedLessonIds.includes(lessonId)
          ? state.completedLessonIds.filter((id) => id !== lessonId)
          : [...state.completedLessonIds, lessonId];
        persist(state.chapters, next);
        return { completedLessonIds: next };
      });
    },

    getChapterAccess: (chapterId: number, userGroupName = 'Cohort A1') => {
      const chapter = get().chapters.find((c) => c.id === chapterId);
      if (!chapter) {
        return { isAccessible: false, status: 'locked', message: 'Chapter does not exist.' };
      }

      // Check the student's assigned group release status
      const release = chapter.groupReleases[userGroupName] || chapter.groupReleases['Cohort A1'];

      if (!release) {
        return {
          isAccessible: false,
          status: 'locked',
          message: 'This chapter has not been assigned to your academic cohort.',
        };
      }

      if (release.status === 'published') {
        return {
          isAccessible: true,
          status: 'published',
          message: 'Chapter is active and open for study.',
          release,
        };
      }

      if (release.status === 'scheduled') {
        return {
          isAccessible: false,
          status: 'scheduled',
          message: `This chapter is scheduled for automatic publication on ${new Date(
            release.scheduledAt || ''
          ).toLocaleDateString()}.`,
          release,
        };
      }

      return {
        isAccessible: false,
        status: release.status,
        message: 'This chapter has not yet been released by your professor.',
        release,
      };
    },
  };
});
