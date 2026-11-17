import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Mic,
  BookOpen,
  Award,
  AlertTriangle,
  Play,
  CheckCircle2,
  Download,
  Filter,
  Search,
  Sparkles,
  TrendingUp,
  PlaySquare,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { speakPronunciation } from '../services/api';

export const TeacherDashboard: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const studentSubmissions = [
    {
      id: 1,
      studentName: 'Sophia Chen',
      studentId: 'STU-2026-8842',
      group: 'Cohort A1',
      exercise: 'Think (/θɪŋk/)',
      overallScore: 88,
      weakPhoneme: '/θ/ (72%)',
      submittedAt: 'Today, 14:15',
      targetText: 'think',
    },
    {
      id: 2,
      studentName: 'Mateo Rossi',
      studentId: 'STU-2026-9043',
      group: 'Cohort A1',
      exercise: 'Distinguish (/dɪˈstɪŋɡwɪʃ/)',
      overallScore: 68,
      weakPhoneme: '/ʃ/ (58%)',
      submittedAt: 'Today, 11:30',
      targetText: 'distinguish',
    },
    {
      id: 3,
      studentName: 'Yuki Tanaka',
      studentId: 'STU-2026-9044',
      group: 'Cohort B2',
      exercise: 'Ship vs Sheep',
      overallScore: 94,
      weakPhoneme: 'None (/iː/ 96%)',
      submittedAt: 'Yesterday, 16:40',
      targetText: 'ship. Sheep.',
    },
    {
      id: 4,
      studentName: 'David Al-Mansoor',
      studentId: 'STU-2026-9041',
      group: 'Cohort B1',
      exercise: 'Thoughtful (/ˈθɔːtfəl/)',
      overallScore: 74,
      weakPhoneme: '/θ/ (64%)',
      submittedAt: 'Yesterday, 10:15',
      targetText: 'thoughtful',
    },
  ];

  const handlePlayRecording = (id: number, targetText: string) => {
    setPlayingId(id);
    if (!speakPronunciation(targetText, () => setPlayingId(null))) setPlayingId(null);
  };

  const handleExport = (type: 'Excel' | 'PDF') => {
    setExportNotice(`Exporting official cohort gradebook as ${type}... File generated.`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  const filtered = studentSubmissions.filter((sub) => {
    const matchesGroup = selectedGroup === 'All' || sub.group === selectedGroup;
    const matchesSearch =
      sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.exercise.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Badge variant="primary" size="sm">Faculty Suite</Badge>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Faculty Academic Portal
          </h1>
          <p className="text-xs text-slate-500">
            Instructor: <strong>Prof. Arthur Holloway</strong> • Department of Applied Linguistics & Phonetics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/teacher/control">
            <Button variant="primary" size="sm" leftIcon={<PlaySquare className="w-4 h-4" />}>
              Live Course Control
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => handleExport('Excel')} leftIcon={<Download className="w-4 h-4" />}>
            Export Gradebook
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('PDF')} leftIcon={<Download className="w-4 h-4" />}>
            Export PDF Report
          </Button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{exportNotice}</span>
          </div>
          <button onClick={() => setExportNotice(null)} className="text-blue-600 font-bold">×</button>
        </div>
      )}

      {/* Faculty Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 space-y-1 bg-white">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Assigned Cohorts</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">3 Groups</span>
          <p className="text-[11px] text-slate-400">86 registered students total</p>
        </Card>

        <Card className="p-5 space-y-1 bg-white">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cohort Average</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">78.4%</span>
          <p className="text-[11px] text-emerald-600 font-semibold">+4.2% since Week 1</p>
        </Card>

        <Card className="p-5 space-y-1 bg-white">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Audio Reviews</span>
            <Mic className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">12 Recordings</span>
          <p className="text-[11px] text-slate-400">Awaiting faculty qualitative notes</p>
        </Card>

        <Card className="p-5 space-y-1 bg-white">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Needing Attention</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-slate-900">7 Students</span>
          <p className="text-[11px] text-amber-600 font-semibold">Struggling with /θ/ & /ð/</p>
        </Card>
      </div>

      {/* Live Course Control Banner */}
      <Card className="p-5 border-l-4 border-l-blue-600 bg-blue-50/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
              <PlaySquare className="w-4 h-4 text-blue-600" />
              Live Chapter Release Management
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              Control which curriculum modules are published, scheduled, or locked for Cohort A1, B1, and B2. Students cannot access course activities until launched.
            </p>
          </div>
          <Link to="/teacher/control">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Open Control Center
            </Button>
          </Link>
        </div>
      </Card>

      {/* Student Pronunciation Submission Roster */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle>Recent Student Voice Recordings</CardTitle>
            <p className="text-xs text-slate-500">Inspect phoneme breakdown, hear target examples, and validate grades</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 bg-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="All">All Cohorts</option>
              <option value="Cohort A1">Cohort A1</option>
              <option value="Cohort B1">Cohort B1</option>
              <option value="Cohort B2">Cohort B2</option>
            </select>
            <Input
              placeholder="Search student or drill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 text-xs py-1"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th className="p-4 font-semibold uppercase tracking-wider">Student</th>
                <th className="p-4 font-semibold uppercase tracking-wider">Cohort</th>
                <th className="p-4 font-semibold uppercase tracking-wider">Target Drill</th>
                <th className="p-4 font-semibold uppercase tracking-wider">Overall Score</th>
                <th className="p-4 font-semibold uppercase tracking-wider">Phonemic Weakness</th>
                <th className="p-4 font-semibold uppercase tracking-wider">Submitted</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-semibold text-slate-900">
                    <div>{sub.studentName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{sub.studentId}</div>
                  </td>
                  <td className="p-4 text-slate-600">{sub.group}</td>
                  <td className="p-4 font-mono font-bold text-blue-600">{sub.exercise}</td>
                  <td className="p-4">
                    <span
                      className={`font-bold ${
                        sub.overallScore >= 85
                          ? 'text-emerald-600'
                          : sub.overallScore >= 70
                          ? 'text-blue-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {sub.overallScore}%
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">
                    <Badge variant={sub.overallScore >= 80 ? 'success' : 'warning'} size="sm">
                      {sub.weakPhoneme}
                    </Badge>
                  </td>
                  <td className="p-4 text-slate-400">{sub.submittedAt}</td>
                  <td className="p-4 text-right">
                    <Button
                      variant={playingId === sub.id ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handlePlayRecording(sub.id, sub.targetText)}
                      leftIcon={<Play className="w-3.5 h-3.5" />}
                    >
                      {playingId === sub.id ? 'Playing...' : 'Hear Example'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
