import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mic,
  Volume2,
  Bot,
  Gamepad2,
  BookOpen,
  Award,
  BarChart3,
  ShieldCheck,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const FeaturesPage: React.FC = () => {
  const featureList = [
    {
      icon: Mic,
      title: 'Phoneme-Level Pronunciation Laboratory',
      desc: 'Real-time Web Audio recording with acoustic waveform visualization, producing diagnostic scores for individual phonemes (/θ/, /ɪ/, /ŋ/, /k/) with actionable tongue and lip positioning tips.',
      badge: 'Core AI Signature',
      badgeVariant: 'primary' as const,
    },
    {
      icon: Volume2,
      title: 'Interactive International Phonetic Alphabet (IPA)',
      desc: 'Complete clickable English IPA chart organized by vowels, diphthongs, and voiced/voiceless consonants with in-browser harmonic sound synthesis and place/manner of articulation guides.',
      badge: 'Acoustic Synthesis',
      badgeVariant: 'violet' as const,
    },
    {
      icon: Bot,
      title: 'Pedagogical AI Speaking Partner',
      desc: 'Voice and text conversation tutor supporting CEFR levels A1 through C1 with real-time feedback on speaking rhythm, vocabulary enrichment, and grammar corrections.',
      badge: 'Conversational AI',
      badgeVariant: 'success' as const,
    },
    {
      icon: Gamepad2,
      title: '15-Type Educational Games Engine',
      desc: 'Configurable game mechanics including Minimal Pairs Showdown, Sound Detective, Word Stress Challenge, and Phonetic Transcription Race with server-side score verification.',
      badge: 'Gamification',
      badgeVariant: 'warning' as const,
    },
    {
      icon: BarChart3,
      title: 'Faculty Analytics & Phonemic Radar',
      desc: 'Cohort-level radar charts revealing student weaknesses across specific phoneme families, allowing teachers to customize curriculum units based on empirical evidence.',
      badge: 'Faculty Suite',
      badgeVariant: 'secondary' as const,
    },
    {
      icon: ShieldCheck,
      title: 'Institutional Administration & Audit Trails',
      desc: 'Strict multi-persona RBAC, multi-year academic structure management, student registration approval workflows, and immutable security audit logs.',
      badge: 'Governance',
      badgeVariant: 'violet' as const,
    },
  ];

  return (
    <div className="w-full py-16 px-4 sm:px-6 lg:px-12 2xl:px-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="primary" size="sm">System Capabilities</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Engineered for Rigorous Phonetic Pedagogy
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Discover the complete suite of articulatory, conversational, and administrative capabilities powering the PHONETIX platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {featureList.map((f, i) => {
          const Icon = f.icon;
          return (
            <Card key={i} hoverEffect className="p-6 bg-white border border-slate-200 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant={f.badgeVariant} size="sm">{f.badge}</Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="text-center pt-8">
        <Link to="/register">
          <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Begin Student Enrollment
          </Button>
        </Link>
      </div>
    </div>
  );
};
