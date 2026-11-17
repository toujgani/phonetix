import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useBrandingStore } from '../store/brandingStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { InstitutionalLogo } from '../components/ui/InstitutionalLogo';

export const LoginPage: React.FC = () => {
  const { login } = useAuthStore();
  const { branding } = useBrandingStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide your institutional email and password.');
      return;
    }

    setIsLoading(true);

    try {
      // Authenticate via store / backend API
      const user = await login(email, password, rememberMe);

      // Automatic Role Detection and Redirection
      // The user role is determined strictly on the backend / session
      const targetPath =
        (location.state as { from?: string })?.from ||
        (user.role === 'super_admin'
          ? '/super_admin'
          : user.role === 'teacher'
          ? '/teacher'
          : '/student');

      navigate(targetPath, { replace: true });
    } catch (err: unknown) {
      setIsLoading(false);
      const message = err instanceof Error ? err.message : 'Authentication failed.';

      if (message === 'ACCOUNT_PENDING') {
        navigate('/pending-approval');
        return;
      }

      if (message === 'ACCOUNT_SUSPENDED') {
        setError('Your institutional account has been suspended. Please contact the Registrar Office.');
        return;
      }

      setError(message);
    }
  };

  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md space-y-8">
        {/* Institutional Crest and Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <InstitutionalLogo size="lg" showText={false} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Sign In to {branding.platformName}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {branding.institutionName} • Educational Portal
            </p>
          </div>
        </div>

        {/* Clean White Login Card */}
        <Card className="p-8 bg-white border border-slate-200 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Email / Username Input */}
            <Input
              label="Institutional Email or ID"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. s.chen@student.institution.edu"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            />

            {/* Password with Show/Hide Toggle Control */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative rounded-lg shadow-subtle">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span>Remember session</span>
              </label>
              <Link to="/contact" className="text-blue-600 hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5"
              isLoading={isLoading}
            >
              Sign In to Educational Workspace
            </Button>
          </form>
        </Card>

        {/* Enrollment Link */}
        <p className="text-center text-xs text-slate-500">
          Enrolled student without an account?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Submit student registration
          </Link>
        </p>

        {/* Institutional Credential Reference for Examination & Verification */}
        <div className="p-3.5 bg-slate-100 rounded-lg border border-slate-200 text-center text-[11px] text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">Institutional Demo Access Credentials:</p>
          <p>Super Admin: <code className="text-slate-800">admin@phonetix-institution.edu</code> / <code className="text-slate-800">Admin@2026</code></p>
          <p>Faculty: <code className="text-slate-800">teacher@phonetix-institution.edu</code> / <code className="text-slate-800">Teacher@2026</code></p>
          <p>Student (Cohort A1): <code className="text-slate-800">student@phonetix-institution.edu</code> / <code className="text-slate-800">Student@2026</code></p>
        </div>
      </div>
    </div>
  );
};
