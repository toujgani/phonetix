import React, { useState } from 'react';
import {
  PlaySquare,
  Lock,
  Unlock,
  Calendar,
  CheckCircle2,
  Users,
  Clock,
  Sparkles,
  Plus,
  Upload,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Chapter } from '../types';

export const TeacherCourseControl: React.FC = () => {
  const { user } = useAuthStore();
  const {
    chapters,
    launchChapter,
    lockChapter,
    reopenChapter,
    scheduleChapter,
    createChapter,
    uploadMaterial,
  } = useCourseStore();

  const [selectedGroup, setSelectedGroup] = useState<string>('Cohort A1');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'launch' | 'lock' | 'reopen';
    chapter: Chapter | null;
  }>({
    isOpen: false,
    type: 'launch',
    chapter: null,
  });

  const [scheduleModal, setScheduleModal] = useState<{
    isOpen: boolean;
    chapter: Chapter | null;
    date: string;
    time: string;
  }>({
    isOpen: false,
    chapter: null,
    date: '2026-11-20',
    time: '09:00',
  });

  const [createModal, setCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newWeeks, setNewWeeks] = useState('Weeks 10–12');
  const [newDesc, setNewDesc] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const professorName = `${user?.first_name || 'Prof.'} ${user?.last_name || 'Holloway'}`;

  const handleLaunchConfirm = () => {
    if (!confirmModal.chapter) return;
    launchChapter(confirmModal.chapter.id, selectedGroup, professorName);
    setNotice(
      `Chapter "${confirmModal.chapter.title}" has been officially LAUNCHED for ${selectedGroup}! Students may now access lessons and activities.`
    );
    setConfirmModal({ isOpen: false, type: 'launch', chapter: null });
    setTimeout(() => setNotice(null), 5000);
  };

  const handleLockConfirm = () => {
    if (!confirmModal.chapter) return;
    lockChapter(confirmModal.chapter.id, selectedGroup);
    setNotice(
      `Chapter "${confirmModal.chapter.title}" is now LOCKED for ${selectedGroup}. Students cannot begin new drills; historical progress remains preserved.`
    );
    setConfirmModal({ isOpen: false, type: 'lock', chapter: null });
    setTimeout(() => setNotice(null), 5000);
  };

  const handleReopenConfirm = () => {
    if (!confirmModal.chapter) return;
    reopenChapter(confirmModal.chapter.id, selectedGroup);
    setNotice(
      `Chapter "${confirmModal.chapter.title}" has been REOPENED for ${selectedGroup}.`
    );
    setConfirmModal({ isOpen: false, type: 'reopen', chapter: null });
    setTimeout(() => setNotice(null), 5000);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleModal.chapter) return;
    scheduleChapter(scheduleModal.chapter.id, selectedGroup, scheduleModal.date, scheduleModal.time);
    setNotice(
      `Chapter "${scheduleModal.chapter.title}" scheduled for automatic release to ${selectedGroup} on ${scheduleModal.date} at ${scheduleModal.time}.`
    );
    setScheduleModal({ isOpen: false, chapter: null, date: '', time: '' });
    setTimeout(() => setNotice(null), 5000);
  };

  const handleCreateChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    createChapter({
      course_id: 1,
      order_number: chapters.length + 1,
      title: newTitle,
      description: newDesc || 'Institutional phonetics curriculum unit.',
      weeks: newWeeks,
      learning_objectives: ['Analyze phonetic target structures in practical discourse.'],
    });
    setNewTitle('');
    setNewDesc('');
    setCreateModal(false);
    setNotice('New curriculum chapter initialized as DRAFT.');
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Badge variant="primary" size="sm">Course Delivery</Badge>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Professor Live Course & Chapter Control Center
          </h1>
          <p className="text-xs text-slate-500">
            Control when students can access learning content, download materials, and submit drills.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create New Chapter
          </Button>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-emerald-700 font-bold">×</button>
        </div>
      )}

      {/* Course Context & Group Selector Bar */}
      <Card className="p-5 bg-white border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Course</span>
            <h2 className="text-base font-bold text-slate-900">
              ENG-PHON-101: English Phonetics & Articulation Mastery
            </h2>
            <p className="text-xs text-slate-500">
              Assigned Faculty: <strong>{professorName}</strong> • Department of Applied Linguistics
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Target Cohort:</span>
            {(['Cohort A1', 'Cohort B1', 'Cohort B2'] as const).map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  selectedGroup === grp
                    ? 'bg-blue-600 text-white shadow-subtle'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {grp}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Chapters Table */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Curriculum Units for {selectedGroup}</CardTitle>
            <p className="text-xs text-slate-500">
              Releases are group-isolated. Publishing for {selectedGroup} does not grant access to other groups.
            </p>
          </div>
          <Badge variant="primary" size="sm">{selectedGroup} Active</Badge>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th className="p-4 font-semibold uppercase tracking-wider">Chapter</th>
                <th className="p-4 font-semibold uppercase tracking-wider">Scheduled Period</th>
                <th className="p-4 font-semibold uppercase tracking-wider">Publication Status</th>
                <th className="p-4 font-semibold uppercase tracking-wider">Started</th>
                <th className="p-4 font-semibold uppercase tracking-wider">Completed</th>
                <th className="p-4 font-semibold uppercase tracking-wider">Avg Score</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-right">Professor Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chapters.map((ch) => {
                const release = ch.groupReleases[selectedGroup] || {
                  groupId: selectedGroup,
                  groupName: selectedGroup,
                  status: 'locked',
                  studentsStarted: 0,
                  studentsCompleted: 0,
                };
                const isPub = release.status === 'published';
                const isLocked = release.status === 'locked';
                const isSched = release.status === 'scheduled';
                const isDraft = release.status === 'draft';

                return (
                  <tr key={ch.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{ch.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{ch.description}</div>
                      {ch.materials.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[10px] text-blue-600 mt-1 font-medium">
                          <FileText className="w-3 h-3" />
                          <span>{ch.materials.length} uploaded handouts</span>
                        </div>
                      )}
                    </td>

                    <td className="p-4 font-medium text-slate-600">{ch.weeks}</td>

                    <td className="p-4">
                      {isPub ? (
                        <Badge variant="success" size="sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 animate-pulse" />
                          PUBLISHED
                        </Badge>
                      ) : isSched ? (
                        <Badge variant="primary" size="sm">
                          <Clock className="w-3 h-3 mr-1" />
                          SCHEDULED
                        </Badge>
                      ) : isLocked ? (
                        <Badge variant="danger" size="sm">
                          <Lock className="w-3 h-3 mr-1" />
                          LOCKED
                        </Badge>
                      ) : (
                        <Badge variant="secondary" size="sm">
                          DRAFT
                        </Badge>
                      )}
                      {release.releasedAt && isPub && (
                        <span className="text-[10px] text-slate-400 block mt-1">
                          Released {new Date(release.releasedAt).toLocaleDateString()}
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-semibold text-slate-800">{release.studentsStarted}</td>
                    <td className="p-4 font-semibold text-slate-800">{release.studentsCompleted}</td>
                    <td className="p-4">
                      {release.averageScore ? (
                        <span className="font-bold text-emerald-700">{release.averageScore}%</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="p-4 text-right space-x-2">
                      {!isPub ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setConfirmModal({ isOpen: true, type: 'launch', chapter: ch })}
                          leftIcon={<PlaySquare className="w-3.5 h-3.5" />}
                        >
                          Launch Chapter
                        </Button>
                      ) : (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setConfirmModal({ isOpen: true, type: 'lock', chapter: ch })}
                          leftIcon={<Lock className="w-3.5 h-3.5" />}
                        >
                          Lock Chapter
                        </Button>
                      )}

                      {!isPub && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setScheduleModal({
                              isOpen: true,
                              chapter: ch,
                              date: '2026-11-20',
                              time: '09:00',
                            })
                          }
                          leftIcon={<Calendar className="w-3.5 h-3.5" />}
                        >
                          Schedule
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Confirmation Modal for Launch Chapter */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: 'launch', chapter: null })}
        title={
          confirmModal.type === 'launch'
            ? 'Confirm Official Chapter Launch'
            : confirmModal.type === 'lock'
            ? 'Lock Curriculum Chapter'
            : 'Reopen Curriculum Chapter'
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-100 text-xs text-slate-700 leading-relaxed">
            <p className="font-semibold text-blue-900">
              Chapter: {confirmModal.chapter?.title}
            </p>
            <p className="mt-1">
              Target Academic Group: <strong>{selectedGroup}</strong>
            </p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {confirmModal.type === 'launch' ? (
              <span>
                Launching this chapter will make all associated PDF materials, audio models, and phonetics exercises immediately available to students registered in <strong>{selectedGroup}</strong>.
              </span>
            ) : (
              <span>
                Locking this chapter will immediately prevent students in <strong>{selectedGroup}</strong> from starting new activities or examinations. All existing student scores and recorded attempts are strictly preserved.
              </span>
            )}
          </p>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmModal({ isOpen: false, type: 'launch', chapter: null })}
            >
              Cancel
            </Button>

            {confirmModal.type === 'launch' ? (
              <Button variant="primary" size="sm" onClick={handleLaunchConfirm}>
                Confirm & Launch Chapter Now
              </Button>
            ) : (
              <Button variant="danger" size="sm" onClick={handleLockConfirm}>
                Confirm Lock
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Schedule Release Modal */}
      <Modal
        isOpen={scheduleModal.isOpen}
        onClose={() => setScheduleModal({ isOpen: false, chapter: null, date: '', time: '' })}
        title="Schedule Future Chapter Release"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Configure automated publication for <strong>{scheduleModal.chapter?.title}</strong> to{' '}
            <strong>{selectedGroup}</strong>.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Release Date"
              type="date"
              required
              value={scheduleModal.date}
              onChange={(e) => setScheduleModal({ ...scheduleModal, date: e.target.value })}
            />
            <Input
              label="Release Time"
              type="time"
              required
              value={scheduleModal.time}
              onChange={(e) => setScheduleModal({ ...scheduleModal, time: e.target.value })}
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setScheduleModal({ isOpen: false, chapter: null, date: '', time: '' })}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Schedule Automated Release
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Chapter Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Create New Academic Chapter"
      >
        <form onSubmit={handleCreateChapter} className="space-y-4">
          <Input
            label="Chapter Title *"
            required
            placeholder="e.g. Chapter 5: Intonation and Connected Speech"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <Input
            label="Scheduled Academic Period *"
            required
            placeholder="e.g. Weeks 10–12"
            value={newWeeks}
            onChange={(e) => setNewWeeks(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Chapter Synopsis & Objectives
            </label>
            <textarea
              rows={3}
              placeholder="Outline speech competencies covered..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Chapter Draft
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
