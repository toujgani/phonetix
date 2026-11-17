import React from 'react';
import { Link } from 'react-router-dom';
import { Home, BookOpen, LogIn, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="relative text-center max-w-lg w-full space-y-8">

        {/* Decorative background phoneme */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span
            className="font-mono font-black leading-none"
            style={{ fontSize: '14rem', color: '#DBEAFE', opacity: 0.6 }}
            aria-hidden="true"
          >
            [ə]
          </span>
        </div>

        {/* Content */}
        <div className="relative space-y-4">
          {/* 404 */}
          <span className="font-mono text-7xl font-black text-[#2563EB] tracking-tighter block leading-none">
            404
          </span>

          <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
            Academic Resource Not Found
          </h1>
          <p className="text-sm text-[#64748B] leading-relaxed max-w-sm mx-auto">
            The curriculum unit, diagnostic exercise, or page you requested does not exist
            or has been relocated to another academic semester.
          </p>
        </div>

        {/* Action buttons */}
        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
              Return to Homepage
            </Button>
          </Link>
          <Link to="/features">
            <Button variant="outline" size="md" leftIcon={<BookOpen className="w-4 h-4" />}>
              Explore Features
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="md" leftIcon={<LogIn className="w-4 h-4" />}>
              Sign In
            </Button>
          </Link>
        </div>

        {/* Footer note */}
        <div className="relative pt-4 border-t border-[#E5E7EB] text-xs text-[#94A3B8]">
          Need assistance?{' '}
          <Link to="/contact" className="text-[#2563EB] hover:underline font-medium">
            Contact the Department Helpdesk
          </Link>
        </div>
      </div>
    </div>
  );
};
