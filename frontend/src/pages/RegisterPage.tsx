import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { InstitutionalLogo } from '../components/ui/InstitutionalLogo';
import { apiRequest } from '../services/http';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    institutionalEmail: '',
    personalEmail: '',
    phone: '',
    academicYear: '2026-2027',
    department: 'English Language & Literature',
    groupName: 'Cohort A1',
    password: '',
    passwordConfirmation: '',
    acceptedTerms: false,
    acceptedVoiceConsent: false,
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.studentId.trim() ||
      !formData.institutionalEmail.trim() ||
      !formData.password
    ) {
      setError('Please complete all mandatory institutional registration fields.');
      return;
    }

    if (formData.password !== formData.passwordConfirmation) {
      setError('Password and password confirmation do not match.');
      return;
    }

    if (!formData.acceptedTerms || !formData.acceptedVoiceConsent) {
      setError('You must accept the institutional terms and voice recording privacy policy.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await apiRequest<{ user: { id: number; institutional_id: string; first_name: string; last_name: string; email: string } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ first_name: formData.firstName, last_name: formData.lastName, institutional_id: formData.studentId, email: formData.institutionalEmail, personal_email: formData.personalEmail, phone: formData.phone, password: formData.password, password_confirmation: formData.passwordConfirmation, group_name: formData.groupName }),
      });
      localStorage.setItem('phonetix_pending_student', JSON.stringify(result.user));
      navigate('/pending-approval');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration could not be submitted.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <InstitutionalLogo size="md" showText={false} />
          </div>
          <Badge variant="primary" size="sm">Enrollment & Admissions</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Student Institutional Registration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Provide your official university student credentials. All accounts undergo administrative verification before course access is granted.
          </p>
        </div>

        {/* Clean White Card Form */}
        <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Identity Fields */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2">
                1. Student Identification
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name *"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Sophia"
                  required
                />
                <Input
                  label="Last Name *"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Chen"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Institutional Student ID *"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="e.g. STU-2026-8842"
                  helperText="Must match your official university student ID card"
                  required
                />
                <Input
                  label="Institutional University Email *"
                  name="institutionalEmail"
                  type="email"
                  value={formData.institutionalEmail}
                  onChange={handleChange}
                  placeholder="name@student.institution.edu"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Personal Email (Optional)"
                  name="personalEmail"
                  type="email"
                  value={formData.personalEmail}
                  onChange={handleChange}
                  placeholder="personal@domain.com"
                />
                <Input
                  label="Telephone Contact"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 019-2834"
                />
              </div>
            </div>

            {/* 2. Academic Assignment */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2">
                2. Academic Assignment
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Academic Year
                  </label>
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="2026-2027">2026-2027 (Current)</option>
                    <option value="2027-2028">2027-2028</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="English Language & Literature">English Language & Literature</option>
                    <option value="Applied Linguistics">Applied Linguistics</option>
                    <option value="English Education">English Education</option>
                    <option value="Translation & Interpretation">Translation & Interpretation</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Assigned Cohort Group
                  </label>
                  <select
                    name="groupName"
                    value={formData.groupName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Cohort A1">Cohort A1 (Prof. Holloway)</option>
                    <option value="Cohort B1">Cohort B1 (Prof. Holloway)</option>
                    <option value="Cohort B2">Cohort B2</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Password */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2">
                3. Security Credentials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Account Password *"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  required
                />
                <Input
                  label="Confirm Password *"
                  type="password"
                  name="passwordConfirmation"
                  value={formData.passwordConfirmation}
                  onChange={handleChange}
                  placeholder="Repeat password exactly"
                  required
                />
              </div>
            </div>

            {/* 4. Consent */}
            <div className="space-y-3 pt-2 p-4 rounded-lg bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800">
                4. Institutional Consent & FERPA Agreement
              </h4>
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  name="acceptedTerms"
                  checked={formData.acceptedTerms}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span>
                  I agree to the <Link to="/terms" className="text-blue-600 underline">Terms of Academic Service</Link> and certify my institutional enrollment.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  name="acceptedVoiceConsent"
                  checked={formData.acceptedVoiceConsent}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span>
                  I consent to the recording and acoustic processing of my voice for pronunciation assessment under the <Link to="/privacy" className="text-blue-600 underline">Voice Privacy Policy</Link>.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
            >
              Submit Student Registration
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};
