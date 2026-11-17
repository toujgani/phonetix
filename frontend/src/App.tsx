import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public Pages
const LandingPage = React.lazy(() => import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })));

const AboutPage = React.lazy(() => import('./pages/AboutPage').then((module) => ({ default: module.AboutPage })));

const FeaturesPage = React.lazy(() => import('./pages/FeaturesPage').then((module) => ({ default: module.FeaturesPage })));

const ContactPage = React.lazy(() => import('./pages/ContactPage').then((module) => ({ default: module.ContactPage })));

const LoginPage = React.lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));

const RegisterPage = React.lazy(() => import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage })));

const PendingApprovalPage = React.lazy(() => import('./pages/PendingApprovalPage').then((module) => ({ default: module.PendingApprovalPage })));

const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage').then((module) => ({ default: module.PrivacyPolicyPage })));

const TermsOfServicePage = React.lazy(() => import('./pages/TermsOfServicePage').then((module) => ({ default: module.TermsOfServicePage })));

const CookiePolicyPage = React.lazy(() => import('./pages/CookiePolicyPage').then((module) => ({ default: module.CookiePolicyPage })));

const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));


// Dashboards and Laboratories
const StudentDashboard = React.lazy(() => import('./pages/StudentDashboard').then((module) => ({ default: module.StudentDashboard })));

const TeacherDashboard = React.lazy(() => import('./pages/TeacherDashboard').then((module) => ({ default: module.TeacherDashboard })));

const TeacherCourseControl = React.lazy(() => import('./pages/TeacherCourseControl').then((module) => ({ default: module.TeacherCourseControl })));

const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard').then((module) => ({ default: module.AdminDashboard })));

const AdminBrandingPage = React.lazy(() => import('./pages/AdminBrandingPage').then((module) => ({ default: module.AdminBrandingPage })));

const AdminUserDatabase = React.lazy(() => import('./pages/AdminUserDatabase').then((module) => ({ default: module.AdminUserDatabase })));

const AdminAuditLogs = React.lazy(() => import('./pages/AdminAuditLogs').then((module) => ({ default: module.AdminAuditLogs })));

const AdminAcademicStructure = React.lazy(() => import('./pages/AdminAcademicStructure').then((module) => ({ default: module.AdminAcademicStructure })));

const AdminRegistrationApprovals = React.lazy(() => import('./pages/AdminRegistrationApprovals').then((module) => ({ default: module.AdminRegistrationApprovals })));

const AdminTelemetry = React.lazy(() => import('./pages/AdminTelemetry').then((module) => ({ default: module.AdminTelemetry })));

const LearningPathPage = React.lazy(() => import('./pages/LearningPathPage').then((module) => ({ default: module.LearningPathPage })));

const AssignmentsPage = React.lazy(() => import('./pages/AssignmentsPage').then((module) => ({ default: module.AssignmentsPage })));

const PronunciationLab = React.lazy(() => import('./pages/PronunciationLab').then((module) => ({ default: module.PronunciationLab })));

const IpaLab = React.lazy(() => import('./pages/IpaLab').then((module) => ({ default: module.IpaLab })));

const AiSpeakingPartner = React.lazy(() => import('./pages/AiSpeakingPartner').then((module) => ({ default: module.AiSpeakingPartner })));

const GamesEngine = React.lazy(() => import('./pages/GamesEngine').then((module) => ({ default: module.GamesEngine })));

const CurriculumPage = React.lazy(() => import('./pages/CurriculumPage').then((module) => ({ default: module.CurriculumPage })));

const VocabularyNotebook = React.lazy(() => import('./pages/VocabularyNotebook').then((module) => ({ default: module.VocabularyNotebook })));


export const App: React.FC = () => {
  return (
    <React.Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">Loading page...</div>}>
      <Routes>
      {/* 1. Public Institutional Portal Routes (Accessible without Authentication) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pending-approval" element={<PendingApprovalPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/cookies" element={<CookiePolicyPage />} />
        <Route path="/404" element={<NotFoundPage />} />
      </Route>

      {/* 2. Protected Stakeholder Dashboard Environments (STRICT AUTHENTICATION REQUIRED) */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Student Environment */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student', 'super_admin']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/curriculum"
          element={
            <ProtectedRoute allowedRoles={['student', 'teacher', 'super_admin']}>
              <CurriculumPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pronunciation-lab"
          element={
            <ProtectedRoute allowedRoles={['student', 'teacher', 'super_admin']}>
              <PronunciationLab />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ipa-lab"
          element={
            <ProtectedRoute allowedRoles={['student', 'teacher', 'super_admin']}>
              <IpaLab />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-speaking"
          element={
            <ProtectedRoute allowedRoles={['student', 'teacher', 'super_admin']}>
              <AiSpeakingPartner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games"
          element={
            <ProtectedRoute allowedRoles={['student', 'teacher', 'super_admin']}>
              <GamesEngine />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vocabulary"
          element={
            <ProtectedRoute allowedRoles={['student', 'teacher', 'super_admin']}>
              <VocabularyNotebook />
            </ProtectedRoute>
          }
        />
        <Route path="/learning-path" element={<ProtectedRoute allowedRoles={['student', 'super_admin']}><LearningPathPage /></ProtectedRoute>} />
        <Route path="/assignments" element={<ProtectedRoute allowedRoles={['student', 'super_admin']}><AssignmentsPage /></ProtectedRoute>} />

        {/* Teacher / Faculty Environment */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={['teacher', 'super_admin']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/control"
          element={
            <ProtectedRoute allowedRoles={['teacher', 'super_admin']}>
              <TeacherCourseControl />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/groups"
          element={
            <ProtectedRoute allowedRoles={['teacher', 'super_admin']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/reviews"
          element={
            <ProtectedRoute allowedRoles={['teacher', 'super_admin']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/teacher/assignments" element={<ProtectedRoute allowedRoles={['teacher', 'super_admin']}><AssignmentsPage /></ProtectedRoute>} />

        {/* Super Administrator Governance Environment */}
        <Route
          path="/super_admin"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/branding"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminBrandingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminRegistrationApprovals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/academic"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminAcademicStructure />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminUserDatabase />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/telemetry"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminTelemetry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminAuditLogs />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </React.Suspense>
  );
};

export default App;
