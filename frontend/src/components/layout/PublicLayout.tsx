import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useBrandingStore } from '../../store/brandingStore';
import { Button } from '../ui/Button';
import { InstitutionalLogo } from '../ui/InstitutionalLogo';
import { ThemeToggle } from '../ui/ThemeToggle';

export const PublicLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { branding } = useBrandingStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cookieConsent, setCookieConsent] = useState<'accepted' | 'rejected' | null>(null);
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem('phonetix_cookie_consent') as 'accepted' | 'rejected' | null;
    setCookieConsent(saved);
  }, []);

  const handleCookieAction = (status: 'accepted' | 'rejected') => {
    localStorage.setItem('phonetix_cookie_consent', status);
    setCookieConsent(status);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'About PHONETIX', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="w-full min-h-screen flex flex-col bg-white text-slate-900 transition-colors duration-150">
      {/* 1. Full-Width Sticky Institutional White Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="w-full px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between">
          {/* Dynamic Institutional Logo & Name */}
          <Link to="/" className="flex items-center gap-3 focus:outline-none">
            <InstitutionalLogo size="md" showText={true} />
          </Link>

          {/* Clean Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors py-1 hover:text-blue-600 ${
                  location.pathname === link.path
                    ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                    : 'text-slate-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action Area */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated && user ? (
              <Link to={`/${user.role}`}>
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Access {user.role === 'super_admin' ? 'Admin Portal' : user.role === 'teacher' ? 'Faculty Portal' : 'Student Space'}
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Student Registration
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 shadow-dropdown">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 hover:text-blue-600"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              {isAuthenticated && user ? (
                <Link to={`/${user.role}`} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full">
                      Student Registration
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. Main Full-Width Content Container */}
      <main className="w-full flex-1">
        <Outlet />
      </main>

      {/* 3. Professional White Institutional Footer */}
      <footer className="w-full border-t border-slate-200 bg-slate-50 py-12">
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <InstitutionalLogo size="sm" showText={true} />
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                Enterprise Institutional English Phonetics Learning Management System. Powered by phoneme-level acoustic assessment and structured academic curricula.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>WCAG 2.2 AA & FERPA Compliant</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
                Academic Modules
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><Link to="/features" className="hover:text-blue-600">Interactive IPA Laboratory</Link></li>
                <li><Link to="/features" className="hover:text-blue-600">Phoneme Pronunciation Lab</Link></li>
                <li><Link to="/features" className="hover:text-blue-600">AI Pedagogical Tutor</Link></li>
                <li><Link to="/features" className="hover:text-blue-600">Minimal Pairs Discrimination</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
                Stakeholder Portals
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><Link to="/login" className="hover:text-blue-600">Faculty & Teacher Suite</Link></li>
                <li><Link to="/login" className="hover:text-blue-600">Student Learning Space</Link></li>
                <li><Link to="/login" className="hover:text-blue-600">Super Administrator Portal</Link></li>
                <li><Link to="/register" className="hover:text-blue-600">Registration Status Check</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
                Institution & Compliance
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><Link to="/privacy" className="hover:text-blue-600">Privacy & Voice Data Policy</Link></li>
                <li><Link to="/terms" className="hover:text-blue-600">Terms of Academic Service</Link></li>
                <li><Link to="/cookies" className="hover:text-blue-600">Cookie Management</Link></li>
                <li><Link to="/contact" className="hover:text-blue-600">Institutional Helpdesk</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 {branding.institutionName}. All rights reserved.</p>
            <p className="text-slate-500 font-medium">
              {branding.shortName} • {branding.address}
            </p>
          </div>
        </div>
      </footer>

      {/* Cookie Notice */}
      {!cookieConsent && (
        <div className="fixed bottom-4 right-4 max-w-sm z-50 p-4 bg-white rounded-lg border border-slate-200 shadow-modal space-y-2">
          <h4 className="text-xs font-bold text-slate-900">Privacy & Cookie Notice</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            We use strictly essential cookies for secure authentication and session management. No commercial trackers are utilized.
          </p>
          <div className="pt-1 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => handleCookieAction('rejected')}>
              Essential Only
            </Button>
            <Button variant="primary" size="sm" onClick={() => handleCookieAction('accepted')}>
              Accept
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
