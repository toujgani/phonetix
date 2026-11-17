import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Download,
  Play,
  FileText,
  Volume2,
  Clock,
  ChevronRight,
  AlertCircle,
  FileQuestion,
  Users,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { speakPronunciation } from '../services/api';

export const CurriculumPage: React.FC = () => {
  const { user } = useAuthStore();
  const { chapters, completedLessonIds, toggleLessonCompletion, getChapterAccess } = useCourseStore();

  const [activeChapterId, setActiveChapterId] = useState<number>(1);
  const [activeLessonId, setActiveLessonId] = useState<number>(1);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Determine active student group
  const userGroup = user?.group_name || 'Cohort A1';
  const isProfessor = user?.role === 'teacher' || user?.role === 'super_admin';

  const selectedChapter = chapters.find((c) => c.id === activeChapterId) || chapters[0];
  const accessInfo = getChapterAccess(selectedChapter.id, userGroup);

  const canAccessContent = isProfessor || accessInfo.isAccessible;

  const handleDownload = (materialTitle: string) => {
    if (!canAccessContent) {
      alert('Access Denied: Chapter has not been released by your professor.');
      return;
    }
    setDownloadNotice(`Downloading authentic handout: ${materialTitle}`);
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Badge variant="primary" size="sm">Curriculum & Course Structure</Badge>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            ENG-PHON-101: English Phonetics & Articulation
          </h1>
          <p className="text-xs text-slate-500">
            Enrolled Cohort: <strong>{userGroup}</strong> • Faculty: Prof. Arthur Holloway • Academic Year 2026-2027
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload('Course_Syllabus_ENG101.pdf')}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download Syllabus (PDF)
          </Button>
        </div>
      </div>

      {downloadNotice && (
        <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{downloadNotice}</span>
          </div>
          <button onClick={() => setDownloadNotice(null)} className="text-blue-600 font-bold">×</button>
        </div>
      )}

      {/* Main Full-Width Split Layout: Chapter Sidebar + Content Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Chapters Navigation List */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4 bg-slate-50 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Curriculum Units (Assigned to {userGroup})
            </h3>
            <p className="text-xs text-slate-600">
              Select a chapter to review learning materials and drills.
            </p>
          </Card>

          <div className="space-y-3">
            {chapters.map((ch) => {
              const chAccess = getChapterAccess(ch.id, userGroup);
              const isSelected = ch.id === activeChapterId;
              const isAvailable = isProfessor || chAccess.isAccessible;

              return (
                <Card
                  key={ch.id}
                  onClick={() => {
                    setActiveChapterId(ch.id);
                    setActiveLessonId(ch.id === 1 ? 1 : ch.id === 2 ? 3 : 6);
                  }}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-white ring-1 ring-blue-600 shadow-card'
                      : 'hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{ch.title}</span>
                      </div>
                      <p className="text-xs text-slate-500">{ch.weeks} • {ch.lessonsCount} lessons</p>
                    </div>

                    <div>
                      {isAvailable ? (
                        <Badge variant="success" size="sm">
                          Released
                        </Badge>
                      ) : (
                        <Badge variant="danger" size="sm">
                          <Lock className="w-3 h-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>

                  {!isAvailable && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-amber-700">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{chAccess.message}</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chapter & Lesson Content Stage */}
        <div className="lg:col-span-7">
          {!canAccessContent ? (
            /* Locked State Screen */
            <Card className="p-12 text-center space-y-5 bg-white border border-slate-200">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <Badge variant="warning" size="md">Access Restricted</Badge>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {selectedChapter.title}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  This chapter has not yet been released by your professor for <strong>{userGroup}</strong>. In accordance with university academic scheduling, course materials and exercises will unlock once formally launched.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 max-w-sm mx-auto text-left space-y-1">
                <span className="font-semibold text-slate-700 block">Scheduled Period:</span>
                <span>{selectedChapter.weeks}</span>
                <span className="font-semibold text-slate-700 block mt-2">Prerequisites:</span>
                <span>Complete preceding released chapters and submit required phonetic recordings.</span>
              </div>
            </Card>
          ) : (
            /* Published Active Chapter Content */
            <Card className="p-6 sm:p-8 space-y-6 bg-white border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Active Study Unit
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
                    {selectedChapter.title}
                  </h2>
                </div>
                <Badge variant="success" size="sm">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Officially Released
                </Badge>
              </div>

              {/* Learning Objectives */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Pedagogical Learning Objectives
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {selectedChapter.learning_objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lecture Handouts & Materials */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Course Handouts & Study Materials
                </h4>
                {selectedChapter.materials.length === 0 ? (
                  <p className="text-xs text-slate-400">No downloadable files attached yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedChapter.materials.map((mat) => (
                      <div
                        key={mat.id}
                        className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <div>
                            <span className="font-semibold text-slate-900 block">{mat.title}</span>
                            <span className="text-[10px] text-slate-400">
                              {(mat.size_bytes / (1024 * 1024)).toFixed(1)} MB • {mat.type.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(mat.title)}
                          leftIcon={<Download className="w-3.5 h-3.5" />}
                        >
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Practical Lecture Audio Demonstration */}
              <div className="p-5 rounded-lg border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-blue-600" />
                    Spoken Vowel Examples
                  </h4>
                  <Badge variant="primary" size="sm">Lab Sample</Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hear example words spoken aloud to compare English vowel sounds.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => speakPronunciation('see, sit, bed, cat, car, hot, call, put, too')}
                  leftIcon={<Play className="w-3.5 h-3.5" />}
                >
                  Hear Spoken Examples
                </Button>
              </div>

              {/* Lesson Completion Action */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {completedLessonIds.includes(selectedChapter.id)
                    ? 'Activity logged as completed in your portfolio.'
                    : 'Mark activity as studied once reviewed.'}
                </span>
                <Button
                  variant={completedLessonIds.includes(selectedChapter.id) ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => toggleLessonCompletion(selectedChapter.id)}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  {completedLessonIds.includes(selectedChapter.id) ? 'Mark Incomplete' : 'Complete Study Unit'}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
