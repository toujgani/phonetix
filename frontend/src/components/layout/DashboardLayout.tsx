import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Mic,
  Volume2,
  Bot,
  Gamepad2,
  BookOpen,
  Bookmark,
  Users,
  GraduationCap,
  FileCheck2,
  Activity,
  ShieldCheck,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Palette,
  PlaySquare,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useBrandingStore } from '../../store/brandingStore';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { InstitutionalLogo } from '../ui/InstitutionalLogo';
import { ThemeToggle } from '../ui/ThemeToggle';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { branding } = useBrandingStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  // Role-Specific Navigation Trees
  const studentNav = [
    { name: 'Overview', path: '/student', icon: LayoutDashboard },
    { name: 'Course Curriculum', path: '/curriculum', icon: BookOpen },
    { name: 'Interactive IPA Lab', path: '/ipa-lab', icon: Volume2 },
    { name: 'AI Pronunciation Lab', path: '/pronunciation-lab', icon: Mic },
    { name: 'AI Speaking Partner', path: '/ai-speaking', icon: Bot },
    { name: 'Educational Games', path: '/games', icon: Gamepad2 },
    { name: 'Vocabulary Notebook', path: '/vocabulary', icon: Bookmark },
    { name: 'Pronunciation Progress', path: '/learning-path', icon: Activity },
    { name: 'My Assignments', path: '/assignments', icon: FileCheck2 },
  ];

  const teacherNav = [
    { name: 'Faculty Overview', path: '/teacher', icon: LayoutDashboard },
    { name: 'Live Course Control', path: '/teacher/control', icon: PlaySquare },
    { name: 'Chapter Management', path: '/curriculum', icon: BookOpen },
    { name: 'My Academic Groups', path: '/teacher/groups', icon: Users },
    { name: 'Review Pronunciations', path: '/teacher/reviews', icon: Mic },
    { name: 'Assignments & Feedback', path: '/teacher/assignments', icon: FileCheck2 },
    { name: 'Interactive IPA Lab', path: '/ipa-lab', icon: Volume2 },
    { name: 'Educational Games', path: '/games', icon: Gamepad2 },
  ];

  const adminNav = [
    { name: 'Admin Overview', path: '/super_admin', icon: LayoutDashboard },
    { name: 'Branding & Identity', path: '/admin/branding', icon: Palette },
    { name: 'Registration Approvals', path: '/admin/approvals', icon: FileCheck2 },
    { name: 'Academic Structure', path: '/admin/academic', icon: GraduationCap },
    { name: 'User Database', path: '/admin/users', icon: Users },
    { name: 'System Telemetry', path: '/admin/telemetry', icon: Activity },
    { name: 'Audit Logs', path: '/admin/audit', icon: ShieldCheck },
  ];

  const currentNav =
    user.role === 'super_admin' ? adminNav : user.role === 'teacher' ? teacherNav : studentNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-full min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 1. Full-Height Clean White Institutional Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Institutional Branding Top */}
        <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 focus:outline-none">
            <InstitutionalLogo size="sm" showText={true} />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Persona</span>
            <Badge
              variant={user.role === 'super_admin' ? 'violet' : user.role === 'teacher' ? 'primary' : 'success'}
              size="sm"
            >
              {user.role === 'super_admin' ? 'Administrator' : user.role === 'teacher' ? 'Faculty' : 'Student'}
            </Badge>
          </div>
          <p className="text-xs font-semibold text-slate-900 truncate">
            {user.first_name} {user.last_name}
          </p>
          <p className="text-[11px] font-mono text-slate-500 truncate">{user.institutional_id}</p>
          {user.group_name && (
            <p className="text-[10px] text-blue-600 font-medium mt-0.5 truncate">
              {user.group_name}
            </p>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-600" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* 2. Full-Width Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-hidden">
        {/* Compact Header */}
        <header className="h-16 w-full bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm font-bold text-slate-900 capitalize tracking-tight">
                {location.pathname.replace('/', '').replace('-', ' ') || 'Dashboard'}
              </h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {branding.platformName} • Academic Year 2026-2027
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {/* Notification Bell */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
            </button>

            {/* User Profile Mini Pill */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700">
                {user.first_name[0]}{user.last_name[0]}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <span className="text-xs font-semibold text-slate-900 block">
                  {user.first_name} {user.last_name}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">{user.role.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Full-Width Scrollable Content Viewport */}
        <main className="w-full flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 2xl:p-10">
          <Outlet />
        </main>
      </div>

      {/* Notifications Modal */}
      <Modal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        title="Institutional Notifications & Advisories"
      >
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-xs font-semibold text-blue-900">Curriculum Chapter Update</p>
            <p className="text-xs text-slate-600 mt-1">
              Chapter 2 "English Vowel Spaces" has been officially released for Cohort A1.
            </p>
            <span className="text-[10px] text-slate-400 mt-1.5 block">15 minutes ago</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs font-semibold text-slate-900">Acoustic Engine Telemetry</p>
            <p className="text-xs text-slate-600 mt-1">
              Speech assessment latency: 12.4ms across active student laboratory sessions.
            </p>
            <span className="text-[10px] text-slate-400 mt-1.5 block">1 hour ago</span>
          </div>
        </div>
      </Modal>
    </div>
  );
};
