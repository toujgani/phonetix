import React from 'react';
import { ShieldCheck, Lock, Mic, FileText, Database, UserX, Globe, Scale } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const sections = [
  { id: 'section-1', label: '1. Purpose & Data Minimization' },
  { id: 'section-2', label: '2. Voice Recording & AI Processing' },
  { id: 'section-3', label: '3. Storage, Encryption & Access' },
  { id: 'section-4', label: '4. Data Retention & Deletion' },
  { id: 'section-5', label: '5. Third-Party Service Integrations' },
  { id: 'section-6', label: '6. Student Rights & Contact' },
];

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 2xl:px-16 py-16">
      {/* Page Header */}
      <div className="mb-10 space-y-3">
        <Badge variant="primary" size="sm">Legal &amp; Compliance</Badge>
        <h1 className="text-3xl font-bold text-[#172033] tracking-tight">
          Institutional Privacy &amp; Voice Recording Policy
        </h1>
        <p className="text-xs text-[#64748B]">
          Effective Date: Academic Year 2026–2027 &nbsp;|&nbsp; Policy Version 2.1 &nbsp;|&nbsp; FERPA &amp; GDPR Compliant
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
              <Database className="w-4 h-4 text-[#2563EB]" />
              1. Purpose and Data Minimization
            </h2>
            <p>
              PHONETIX is operated exclusively for educational, diagnostic, and academic assessment purposes by the
              institutional Faculty of Applied Linguistics. We collect only information strictly necessary to maintain
              academic records and evaluate English phonetic proficiency:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#64748B]">
              <li>Student institutional identification numbers, student name, and university email.</li>
              <li>Academic program, semester enrollment, and assigned learning cohort.</li>
              <li>Voice recordings submitted during pronunciation laboratory drills and examinations.</li>
              <li>Derived phonetic acoustic metrics (accuracy scores, fluency, phoneme error status).</li>
            </ul>
          </section>

          <section id="section-2" className="scroll-mt-20 space-y-4">
            <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
              <Mic className="w-4 h-4 text-[#7C3AED]" />
              2. Voice Recording and AI Acoustic Processing
            </h2>
            <p>When a student records their voice in the AI Pronunciation Laboratory or AI Speaking Partner:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#64748B]">
              <li>Recordings are streamed securely over TLS 1.3 to our backend and processed via the Azure AI Speech Pronunciation Assessment service.</li>
              <li>Voice data is used solely to evaluate phonemic accuracy against target IPA models.</li>
              <li>Third-party speech services are bound by institutional Data Processing Agreements (DPA) and do <strong className="text-[#172033]">not</strong> train generalized AI models on student voice samples.</li>
              <li>Students retain the right to replay, compare, or request deletion of their practice recordings.</li>
            </ul>
          </section>

          <section id="section-3" className="scroll-mt-20 space-y-4">
            <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#16A34A]" />
              3. Storage, Encryption, and Access Controls
            </h2>
            <p>
              All user credentials and sensitive records are hashed with <strong className="text-[#172033]">Argon2id</strong> and stored in isolated relational PostgreSQL databases. Audio binaries are stored in private S3-compatible object storage with signed URL access controls. Access to student recordings is restricted strictly to the student themselves and their assigned academic faculty. All data at rest is encrypted using AES-256.
            </p>
          </section>

          <section id="section-4" className="scroll-mt-20 space-y-4">
            <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
              <UserX className="w-4 h-4 text-[#DC2626]" />
              4. Data Retention and Deletion Requests
            </h2>
            <p>
              Formative pronunciation practice recordings are retained for the duration of the active semester plus 90 days. Students may submit a formal Data Deletion Request through the Student Profile settings. Official examination records required for institutional accreditation are archived in accordance with university registrar retention schedules (typically 7 years).
            </p>
          </section>

          <section id="section-5" className="scroll-mt-20 space-y-4">
            <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#2563EB]" />
              5. Third-Party Service Integrations
            </h2>
            <p>
              PHONETIX integrates with the following third-party services, each governed by a signed Data Processing Agreement (DPA):
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] text-[#172033]">
                    <th className="text-left px-4 py-3 font-semibold border-b border-[#E5E7EB]">Service</th>
                    <th className="text-left px-4 py-3 font-semibold border-b border-[#E5E7EB]">Purpose</th>
                    <th className="text-left px-4 py-3 font-semibold border-b border-[#E5E7EB]">Trains on student data?</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Azure AI Speech', 'Pronunciation assessment, STT/TTS', 'No — DPA prohibits it'],
                    ['OpenAI / Gemini API', 'Conversational AI Speaking Partner', 'No — API-only, zero retention mode'],
                    ['AWS S3-compatible storage', 'Audio file & document storage', 'N/A — infrastructure only'],
                    ['Redis Cloud', 'Session caching & queue brokering', 'N/A — no personal data stored'],
                  ].map(([svc, purpose, trains]) => (
                    <tr key={svc} className="border-b border-[#E5E7EB] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3 font-medium text-[#172033]">{svc}</td>
                      <td className="px-4 py-3">{purpose}</td>
                      <td className="px-4 py-3 text-[#16A34A] font-medium">{trains}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="section-6" className="scroll-mt-20 space-y-4">
            <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#D97706]" />
              6. Student Rights and Contact Information
            </h2>
            <p>Under GDPR and FERPA, enrolled students have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-[#172033]">Access:</strong> Request a copy of all personal data held by the institution.</li>
              <li><strong className="text-[#172033]">Rectification:</strong> Correct inaccurate personal data.</li>
              <li><strong className="text-[#172033]">Erasure:</strong> Request deletion of personal data (subject to academic retention requirements).</li>
              <li><strong className="text-[#172033]">Portability:</strong> Receive your data in a structured, machine-readable format.</li>
              <li><strong className="text-[#172033]">Restriction:</strong> Request restriction of processing under certain circumstances.</li>
            </ul>
            <Card className="p-4 bg-[#EFF6FF] border border-[#BFDBFE]">
              <p className="text-xs text-[#1E40AF]">
                To exercise any of these rights or to contact our Data Protection Officer, email:{' '}
                <a href="mailto:privacy@phonetix-institution.edu" className="font-semibold underline">
                  privacy@phonetix-institution.edu
                </a>
              </p>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};
