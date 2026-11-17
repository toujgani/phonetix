import React from 'react';
import { ShieldCheck, BookCheck, AlertTriangle, Server, Scale } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

const sections = [
  { id: 'section-1', label: '1. Registration & Account Responsibility' },
  { id: 'section-2', label: '2. Academic Integrity & Examination Rules' },
  { id: 'section-3', label: '3. AI Feedback vs. Official Grades' },
  { id: 'section-4', label: '4. Account Suspension & Content Ownership' },
  { id: 'section-5', label: '5. Platform Availability & Maintenance' },
  { id: 'section-6', label: '6. Governing Law & Dispute Resolution' },
];

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 2xl:px-16 py-16">
      {/* Page Header */}
      <div className="mb-10 space-y-3">
        <Badge variant="primary" size="sm">Institutional Policies</Badge>
        <h1 className="text-3xl font-bold text-[#172033] tracking-tight">
          Terms of Academic Service
        </h1>
        <p className="text-xs text-[#64748B]">
          Academic Year 2026–2027 &nbsp;|&nbsp; Applicable to All Enrolled Students &amp; Faculty
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 items-start">
        {/* Left: Table of Contents */}
        <aside className="hidden lg:block">
          <Card className="p-5 bg-[#F8FAFC] border border-[#E5E7EB] sticky top-6">
            <p className="text-xs font-semibold text-[#172033] uppercase tracking-wide mb-4">
              Table of Contents
            </p>
            <nav className="space-y-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block text-xs text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] px-3 py-2 rounded-md transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </Card>
        </aside>

        {/* Right: Content */}
        <div className="space-y-10 text-sm text-[#64748B] leading-relaxed">
          <section id="section-1" className="scroll-mt-20 space-y-4">
            <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
              1. Institutional Registration &amp; Account Responsibility
            </h2>
            <p>
              Access to PHONETIX is restricted to registered students and authorized academic personnel of the institution. Account credentials may not be shared, loaned, or transferred. Users are responsible for safeguarding their session tokens and passwords. Suspected unauthorized access must be reported immediately to{' '}
              <a href="mailto:security@phonetix-institution.edu" className="text-[#2563EB] hover:underline">
                security@phonetix-institution.edu
              </a>.
            </p>
          </section>

          <section id="section-2" className="scroll-mt-20 space-y-4">
            <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
              <BookCheck className="w-4 h-4 text-[#16A34A]" />
              2. Academic Integrity &amp; Examination Rules
            </h2>
            <p>
              All audio recordings submitted for pronunciation evaluations, game challenges, and examinations must represent the authentic, unassisted voice of the registered student. Submitting pre-recorded synthetic audio, voice clones, or third-party recordings constitutes academic misconduct and will result in disciplinary action under university bylaws, including possible course failure or expulsion.
            </p>
          </section>

          <section id="section-3" className="scroll-mt-20 space-y-4">
            <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D97706]" />
              3. AI Feedback vs. Official Academic Grades
            </h2>
            <p>
              AI-generated scores provided in the Pronunciation Laboratory and Educational Games are <strong className="text-[#172033]">formative diagnostic aids only</strong>. They are designed to guide independent study and practice. Official credit-bearing course grades remain exclusively under the jurisdiction of authorized faculty members and the institutional Registrar. No AI score constitutes a formal academic grade.
            </p>
          </section>

          <section id="section-4" className="scroll-mt-20 space-y-4">
            <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#DC2626]" />
              4. Account Suspension &amp; Content Ownership
            </h2>
            <p>
              The institution reserves the right to suspend accounts engaged in unauthorized scraping, reverse-engineering of assessment models, automated submissions, or violation of student codes of conduct. Educational curricula, IPA materials, and assessment frameworks remain the intellectual property of the institution and may not be reproduced or distributed without written authorization.
            </p>
          </section>

          <section id="section-5" className="scroll-mt-20 space-y-4">
            <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
              <Server className="w-4 h-4 text-[#7C3AED]" />
              5. Platform Availability and Maintenance Windows
            </h2>
            <p>
              PHONETIX targets 99.5% monthly uptime for academic periods. Scheduled maintenance windows occur:
            </p>
            <Card className="p-4 bg-[#FFFBEB] border border-[#FDE68A]">
              <p className="text-xs text-[#92400E] font-medium">
                📅 Scheduled Maintenance: Every Saturday, 02:00–04:00 UTC
              </p>
              <p className="text-xs text-[#92400E] mt-1">
                Students and faculty will receive advance email notification at least 48 hours before any extended maintenance window exceeding 2 hours. Emergency maintenance may occur without advance notice for critical security patches.
              </p>
            </Card>
            <p>
              Audio recordings in progress during a maintenance event are automatically saved to the user's draft queue and may be re-submitted upon restoration of service.
            </p>
          </section>

          <section id="section-6" className="scroll-mt-20 space-y-4">
            <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#2563EB]" />
              6. Governing Law and Dispute Resolution
            </h2>
            <p>
              These Terms of Academic Service are governed by the laws of the jurisdiction in which the institution is registered, without regard to conflict of law principles. Any disputes arising from the use of the PHONETIX platform shall first be referred to the institutional Student Affairs &amp; Academic Integrity Office for mediation. If mediation fails to resolve the dispute within 30 days, the matter shall be submitted to binding arbitration under the rules of the institutional Academic Tribunal.
            </p>
            <p>
              Students retain the right to file complaints with their national data protection authority for matters pertaining to personal data processing.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
