import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mic,
  Volume2,
  BookOpen,
  Award,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Gamepad2,
  Bot,
  Lock,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { chapters, getChapterAccess } = useCourseStore();

  const userGroup = user?.group_name || 'Cohort A1';

  return (
    <div className="w-full space-y-8">
      {/* 1. Full-Width Welcome Header Card */}
      <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Academic Week 4 • Semester 1</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.first_name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Enrolled Academic Cohort: <strong>{userGroup}</strong> • Department of English Language & Literature. You have 2 pronunciation drills and 1 minimal pairs challenge scheduled for this module.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="/pronunciation-lab">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch Pronunciation Lab
              </Button>
            </Link>
            <Link to="/curriculum">
              <Button variant="outline" size="sm">
                View Assigned Chapters
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* 2. Key Metrics Row (Full Width 4-Col Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 space-y-1 bg-white">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pronunciation Avg</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">84.2%</span>
            <span className="text-xs text-emerald-600 font-semibold">+3.8%</span>
          </div>
          <p className="text-[11px] text-slate-400">Based on 28 audio evaluations</p>
        </Card>

        <Card className="p-5 space-y-1 bg-white">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Learning Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">6 Days</span>
            <span className="text-xs text-amber-600 font-semibold">Active</span>
          </div>
          <p className="text-[11px] text-slate-400">Personal best: 14 days</p>
        </Card>

        <Card className="p-5 space-y-1 bg-white">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Curriculum Progress</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">68%</span>
            <span className="text-xs text-slate-400">11/16 Units</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '68%' }} />
          </div>
        </Card>

        <Card className="p-5 space-y-1 bg-white">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Vocabulary Collected</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">42 Words</span>
            <span className="text-xs text-purple-600 font-semibold">Saved</span>
          </div>
          <p className="text-[11px] text-slate-400">With verified IPA transcriptions</p>
        </Card>
      </div>

      {/* 3. Main Split View: Assigned Chapters Progress + Diagnostic Radars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Assigned Chapters List */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Assigned Curriculum Modules ({userGroup})</CardTitle>
                <p className="text-xs text-slate-500">
                  Chapters unlocked by your professor for your cohort
                </p>
              </div>
              <Badge variant="primary" size="sm">Academic Schedule</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {chapters.map((ch) => {
                  const access = getChapterAccess(ch.id, userGroup);
                  const isReleased = access.isAccessible;

                  return (
                    <div
                      key={ch.id}
                      className={`p-4 rounded-lg border flex items-center justify-between transition-colors ${
                        isReleased
                          ? 'border-slate-200 bg-white hover:border-blue-400'
                          : 'border-slate-200 bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isReleased
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isReleased ? <BookOpen className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{ch.title}</h4>
                          <p className="text-[11px] text-slate-500">{ch.weeks} • {ch.description}</p>
                          {!isReleased && (
                            <span className="text-[10px] text-amber-700 font-medium block mt-0.5">
                              {access.message}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        {isReleased ? (
                          <Link to="/curriculum">
                            <Button variant="primary" size="sm">
                              Open Unit
                            </Button>
                          </Link>
                        ) : (
                          <Badge variant="secondary" size="sm">
                            Locked by Faculty
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Access Labs Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/ipa-lab" className="group">
              <Card hoverEffect className="p-5 space-y-2 border-l-4 border-l-purple-600">
                <Volume2 className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-bold text-slate-900">Interactive IPA Chart</h4>
                <p className="text-[11px] text-slate-500 leading-snug">Clickable chart with acoustic harmonic playback.</p>
              </Card>
            </Link>

            <Link to="/ai-speaking" className="group">
              <Card hoverEffect className="p-5 space-y-2 border-l-4 border-l-emerald-600">
                <Bot className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-bold text-slate-900">AI Speaking Partner</h4>
                <p className="text-[11px] text-slate-500 leading-snug">Practice spoken dialogues at CEFR levels.</p>
              </Card>
            </Link>

            <Link to="/games" className="group">
              <Card hoverEffect className="p-5 space-y-2 border-l-4 border-l-amber-500">
                <Gamepad2 className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-bold text-slate-900">Phonetics Games</h4>
                <p className="text-[11px] text-slate-500 leading-snug">Play Minimal Pairs and Sound Detective challenges.</p>
              </Card>
            </Link>
          </div>
        </div>

        {/* Right Column: Phonemic Radar Weaknesses */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Phoneme Articulation Radar
            </h3>

            <div className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-blue-600">/θ/ Voiceless Dental</span>
                  <span className="font-semibold text-amber-700">68% Needs Practice</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '68%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-blue-600">/ŋ/ Velar Nasal</span>
                  <span className="font-semibold text-emerald-700">89% Good</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '89%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-blue-600">/iː/ Long Vowel</span>
                  <span className="font-semibold text-emerald-700">95% Mastered</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '95%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-blue-600">/ʃ/ Postalveolar</span>
                  <span className="font-semibold text-blue-600">84% Good</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '84%' }} />
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>Faculty Note:</strong> Prof. Holloway recommends practicing minimal pairs (<em>think</em> vs <em>sink</em>) in the games engine.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
