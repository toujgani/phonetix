import React from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpen, GraduationCap, ShieldCheck, Cpu, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const AboutPage: React.FC = () => {
  return (
    <div className="w-full py-16 px-4 sm:px-6 lg:px-12 2xl:px-16 space-y-16">
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <Badge variant="primary" size="sm">Institutional Pedagogy</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          About the PHONETIX Educational Architecture
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          PHONETIX was conceived to bridge the gap between classical articulatory phonetics theory and high-frequency, autonomous oral pronunciation training for university students.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">
            The Pedagogical Challenge in Higher Education
          </h2>
          <p>
            Traditional language laboratories frequently struggle to give each student individualized feedback on challenging phonetic contrasts such as voiceless dental fricatives (/θ/ vs /s/), tense vs lax vowels (/iː/ vs /ɪ/), and connected speech rhythm.
          </p>
          <p>
            Faculty members face time constraints grading dozens of audio recordings by hand. PHONETIX resolves this dilemma by providing instantaneous, phoneme-by-phoneme diagnostic telemetry while retaining faculty oversight over official grades.
          </p>
        </div>

        <Card className="p-6 bg-white border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Phoneme-Level Acoustic Engine</h3>
              <p className="text-xs text-slate-500">Engineered with Azure Cognitive Speech Assessment</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Unlike basic Speech-to-Text APIs that simply transcribe words, PHONETIX breaks speech down into its acoustic components, assessing accuracy, fluency, completeness, and prosodic intonation contours.
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
            <span>WCAG 2.2 AA Standard</span>
            <span>FERPA / GDPR Compliant</span>
          </div>
        </Card>
      </div>

      <div className="border-t border-slate-200 pt-12 text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900">
          Experience PHONETIX in Action
        </h2>
        <div className="flex justify-center gap-4">
          <Link to="/register">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Enroll New Student
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">
              Sign In to Portal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
