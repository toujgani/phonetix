import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic,
  Volume2,
  Bot,
  Gamepad2,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Play,
  Layers,
  Sparkles,
  BarChart3,
  Award,
  BookOpen,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useBrandingStore } from '../store/brandingStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { speakPronunciation } from '../services/api';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { branding } = useBrandingStore();
  const [activePhoneme, setActivePhoneme] = useState('θ');

  const previewSounds = [
    { symbol: 'θ', word: 'think', label: 'Voiceless Dental' },
    { symbol: 'iː', word: 'fleece', label: 'Long High Front' },
    { symbol: 'ŋ', word: 'sing', label: 'Velar Nasal' },
    { symbol: 'æ', word: 'trap', label: 'Short Low Front' },
    { symbol: 'ʃ', word: 'ship', label: 'Postalveolar' },
  ];

  const handlePlaySound = (symbol: string, word: string) => {
    setActivePhoneme(symbol);
    speakPronunciation(word);
  };

  const featureCards = [
    {
      icon: Mic,
      title: 'AI Pronunciation Assessment',
      desc: 'Phoneme-level articulatory scoring analyzing vowel formants, consonant voicing, and prosodic rhythm in real time.',
      badge: 'Phoneme Engine',
    },
    {
      icon: Volume2,
      title: 'Interactive IPA Laboratory',
      desc: 'Full English phonetic chart featuring monophthongs, diphthongs, and consonant matrices with spoken word examples.',
      badge: 'Interactive Audio',
    },
    {
      icon: Bot,
      title: 'AI Speaking Partner',
      desc: 'Pedagogical conversational tutor calibrated across CEFR levels A1–C1, delivering immediate oral feedback and fluency tips.',
      badge: 'Conversational Oral Tutor',
    },
    {
      icon: BookOpen,
      title: 'Structured Academic Courses',
      desc: 'Professor-controlled chapter release system with locked/published states, downloadable handouts, and cohort scheduling.',
      badge: 'Institutional Curriculum',
    },
    {
      icon: Gamepad2,
      title: 'Interactive Educational Games',
      desc: '15 gamified phonetic exercises including Minimal Pairs Showdown, Sound Detective, and Word Stress Master.',
      badge: '15 Game Modes',
    },
    {
      icon: BarChart3,
      title: 'Student Performance Analytics',
      desc: 'Empirical phoneme radar diagnostics and cohort weakness reports for individualized pedagogical remediation.',
      badge: 'Faculty Analytics',
    },
  ];

  return (
    <div className="w-full space-y-16 sm:space-y-24 pb-20">
      {/* 1. Full-Width Clean White Hero Section */}
      <section className="w-full py-16 sm:py-24 border-b border-slate-200 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-12 2xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Generation Articulatory AI Assessment</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Master English Phonetics <br className="hidden sm:inline" />
                <span className="text-blue-600">with Confidence.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                An advanced learning environment designed to develop English pronunciation, phonetic awareness, listening comprehension, and speaking skills.
              </p>

              {/* Primary Call to Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {isAuthenticated && user ? (
                  <Link to={`/${user.role}`}>
                    <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                      Access Learning Platform
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login">
                      <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                        Access Learning Platform
                      </Button>
                    </Link>
                    <Link to="/features">
                      <Button size="lg" variant="outline">
                        Explore Features
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Phoneme-Level Scoring</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Curriculum Aligned</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>FERPA Compliant</span>
                </div>
              </div>
            </div>

            {/* Right Column: Spoken Pronunciation Example Card */}
            <div className="lg:col-span-5">
              <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-card">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Spoken Word Examples
                    </span>
                  </div>
                  <Badge variant="primary" size="sm">English Voice</Badge>
                </div>

                <div className="py-6 text-center space-y-4">
                  <div className="inline-block p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-subtle">
                    <span className="font-mono text-5xl font-black text-blue-600 tracking-tight">
                      /{activePhoneme}/
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 capitalize">
                      Example Word: "{previewSounds.find((s) => s.symbol === activePhoneme)?.word}"
                    </h3>
                    <p className="text-xs text-slate-500">
                      {previewSounds.find((s) => s.symbol === activePhoneme)?.label}
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 px-4">
                    Select a symbol to hear its example word spoken aloud:
                  </p>

                  <div className="grid grid-cols-5 gap-2 pt-1">
                    {previewSounds.map((item) => (
                      <button
                        key={item.symbol}
                        onClick={() => handlePlaySound(item.symbol, item.word)}
                        className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all ${
                          activePhoneme === item.symbol
                            ? 'bg-blue-600 text-white border-blue-600 shadow-subtle'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400'
                        }`}
                      >
                        <span className="font-mono text-base font-bold">/{item.symbol}/</span>
                        <span className="text-[10px] opacity-75 mt-0.5">{item.word}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-between text-xs">
                  <span className="text-slate-700">Ready to test your speech?</span>
                  <Link to="/register" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                    Student Enrollment <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Full-Width Institutional Features Grid */}
      <section className="w-full px-4 sm:px-6 lg:px-12 2xl:px-16 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <Badge variant="primary" size="sm">Academic Architecture</Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineered for Modern Phonetics Pedagogy
          </h2>
          <p className="text-sm text-slate-600">
            A comprehensive institutional suite providing empirical acoustic telemetry and autonomous practice drills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={i} hoverEffect className="p-6 bg-white border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary" size="sm">{f.badge}</Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 3. Institutional Call to Action Bar */}
      <section className="w-full px-4 sm:px-6 lg:px-12 2xl:px-16">
        <div className="w-full rounded-2xl bg-slate-900 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-card">
          <div className="space-y-2 text-left max-w-2xl">
            <h3 className="text-2xl font-bold tracking-tight">
              Upgrade Your Department's Phonetics Infrastructure
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Equip your faculty with live chapter release control, student audio reviews, and real-time pronunciation analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="/login">
              <Button size="lg" variant="primary">
                Access Learning Platform
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="text-white border-slate-700 hover:bg-slate-800">
                Contact Department
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
