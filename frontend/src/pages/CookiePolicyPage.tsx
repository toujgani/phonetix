import React from 'react';
import { Cookie, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const cookieData = [
  { name: 'phonetix_session', purpose: 'Authentication session token (Laravel Sanctum)', duration: 'Session' },
  { name: 'phonetix_remember_me', purpose: 'Persistent login token when "Remember Me" is enabled', duration: '30 days' },
  { name: 'phonetix_theme', purpose: 'Light / dark mode preference', duration: '1 year' },
  { name: 'phonetix_cookie_consent', purpose: 'Stores the user\'s cookie consent choice', duration: '1 year' },
  { name: 'phonetix_mic_permission', purpose: 'Microphone permission grant flag for Pronunciation Lab', duration: '30 days' },
];

export const CookiePolicyPage: React.FC = () => {
  const handleResetCookies = () => {
    localStorage.removeItem('phonetix_cookie_consent');
    window.location.reload();
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 2xl:px-16 py-16 space-y-12">
      {/* Page Header */}
      <div className="max-w-2xl space-y-3">
        <Badge variant="primary" size="sm">Privacy Controls</Badge>
        <h1 className="text-3xl font-bold text-[#172033] tracking-tight">
          Institutional Cookie Policy
        </h1>
        <p className="text-sm text-[#64748B] leading-relaxed">
          Transparent explanation of browser storage and session cookies used by PHONETIX.
          We respect your privacy — we use only essential cookies to operate the platform.
        </p>
      </div>

      <div className="space-y-10 max-w-4xl text-sm text-[#64748B] leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            1. Essential Cookies (Strictly Necessary)
          </h2>
          <p>
            These cookies and local storage tokens are vital for secure platform operation. They enable authentication via
            Laravel Sanctum, preserve active user session state, store theme preferences (light/dark mode), and maintain
            recording permissions. These cookies cannot be disabled as they are required for the platform to function.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
            <XCircle className="w-4 h-4 text-[#DC2626]" />
            2. Absence of Third-Party Advertising Trackers
          </h2>
          <p>
            PHONETIX does <strong className="text-[#172033]">not</strong> install cross-site marketing cookies, ad-network
            pixels, social media tracking buttons, or commercial behavioral trackers of any kind. We strictly respect student
            privacy in accordance with FERPA and GDPR requirements.
          </p>
          <Card className="p-4 flex items-start gap-3 bg-[#F0FDF4] border border-[#BBF7D0]">
            <ShieldCheck className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#166534]">
              We do not use Google Analytics, Facebook Pixel, Hotjar, Mixpanel, or any equivalent third-party tracking
              service on this platform. All usage analytics are self-hosted and anonymized.
            </p>
          </Card>
        </section>

        {/* Section 3: Cookie Table */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#172033] flex items-center gap-2">
            <Cookie className="w-4 h-4 text-[#D97706]" />
            3. Cookie Reference Table
          </h2>
          <p>
            Below is a complete reference of all cookies and localStorage keys used by PHONETIX:
          </p>
          <div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC]">
                  <th className="text-left px-4 py-3 font-semibold text-[#172033] border-b border-[#E5E7EB]">
                    Cookie / Storage Key
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-[#172033] border-b border-[#E5E7EB]">
                    Purpose
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-[#172033] border-b border-[#E5E7EB]">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                {cookieData.map((row, i) => (
                  <tr
                    key={row.name}
                    className={`border-b border-[#E5E7EB] hover:bg-[#F8FAFC] transition-colors ${
                      i === cookieData.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-medium text-[#172033] whitespace-nowrap">{row.name}</td>
                    <td className="px-4 py-3 text-[#64748B]">{row.purpose}</td>
                    <td className="px-4 py-3 text-[#64748B] whitespace-nowrap">{row.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Manage Preferences */}
        <section className="space-y-4 pt-6 border-t border-[#E5E7EB]">
          <h2 className="text-base font-bold text-[#172033]">4. Manage Your Cookie Preferences</h2>
          <p>
            You can reset your cookie consent choice at any time. Clicking the button below will clear your stored
            preference and display the consent banner on the next page load:
          </p>
          <Button variant="outline" size="sm" onClick={handleResetCookies}>
            Reset Cookie Consent Choice
          </Button>
          <p className="text-xs text-[#94A3B8]">
            Note: Resetting your consent will not delete your account or academic data. It only clears the cookie
            consent banner preference stored in your browser's local storage.
          </p>
        </section>
      </div>
    </div>
  );
};
