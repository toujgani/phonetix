import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { InstitutionalLogo } from '../components/ui/InstitutionalLogo';

export const PendingApprovalPage: React.FC = () => {
  const [studentInfo, setStudentInfo] = useState<{
    institutional_id?: string;
    studentId?: string;
    first_name?: string;
    last_name?: string;
    name?: string;
    email?: string;
    department?: string;
    group_name?: string;
    groupName?: string;
  } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('phonetix_pending_student');
    if (raw) {
      try {
        setStudentInfo(JSON.parse(raw));
      } catch {
        // Fallback
      }
    }
  }, []);

  const studentId = studentInfo?.institutional_id || studentInfo?.studentId || 'STU-2026-9901';
  const studentName =
    studentInfo?.name ||
    `${studentInfo?.first_name || 'Julian'} ${studentInfo?.last_name || 'Mercer'}`;
  const email = studentInfo?.email || 'pending@phonetix-institution.edu';
  const group = studentInfo?.group_name || studentInfo?.groupName || 'Cohort A1';

  return (
    <div className="w-full min-h-[80vh] py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center bg-slate-50 text-center">
      <div className="w-full max-w-xl space-y-8">
        <div className="flex justify-center mb-1">
          <InstitutionalLogo size="md" showText={false} />
        </div>

        <div className="space-y-2">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center">
            <Clock className="w-8 h-8" />
          </div>
          <Badge variant="warning" size="md">Account Status: PENDING ADMINISTRATIVE REVIEW</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Registration Submitted for Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            In accordance with institutional policy, your account has been created in a pending state. A faculty administrator must confirm your enrollment before access to phonetics course materials is granted.
          </p>
        </div>

        {/* Student Application Summary Box */}
        <Card className="p-6 text-left bg-white border border-slate-200 shadow-card space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Application Reference</span>
            <span className="font-mono text-xs font-bold text-blue-600">{studentId}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Applicant</span>
              <span className="font-semibold text-slate-900">{studentName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">University Email</span>
              <span className="font-semibold text-slate-900 truncate block">{email}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Academic Cohort</span>
              <span className="font-semibold text-blue-600">{group}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Security Verification</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ID Logged
              </span>
            </div>
          </div>
        </Card>

        {/* Next Steps Guide */}
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 text-xs text-slate-600 leading-relaxed text-left space-y-1">
          <p className="font-bold text-blue-900">What happens next?</p>
          <p>
            1. Your application is reviewed by the Faculty Registrar.
            <br />
            2. Once approved, you will receive an activation confirmation and can log in immediately.
          </p>
        </div>

        <div>
          <Link to="/login">
            <Button variant="primary" size="md">
              Return to Login Screen
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
