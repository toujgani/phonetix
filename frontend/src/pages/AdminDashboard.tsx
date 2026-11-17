import React, { useEffect, useState } from 'react';
import { Activity, ArrowRight, BookOpen, FileCheck2, GraduationCap, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { apiRequest } from '../services/http';
import { useAuthStore } from '../store/authStore';

type OverviewData = { statistics: { total: number; active_students: number; teachers: number; pending: number; active: number }; };
export const AdminDashboard: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { apiRequest<OverviewData>('/admin/users?per_page=10', {}, token).then(setOverview).catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load overview.')); }, [token]);
  const cards = [
    { label: 'Total accounts', value: overview?.statistics.total, icon: Users, href: '/admin/users' },
    { label: 'Active students', value: overview?.statistics.active_students, icon: GraduationCap, href: '/admin/users?role=student' },
    { label: 'Teachers', value: overview?.statistics.teachers, icon: BookOpen, href: '/admin/users?role=teacher' },
    { label: 'Pending approvals', value: overview?.statistics.pending, icon: FileCheck2, href: '/admin/approvals' },
  ];
  return <div className="w-full space-y-6">
    <div className="border-b border-slate-200 pb-4"><h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Overview</h1><p className="text-xs text-slate-500">A summary of accounts and shortcuts to system administration.</p></div>
    {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{cards.map(({ label, value, icon: Icon, href }) => <Link to={href} key={label}><Card className="h-full p-4 transition hover:border-blue-300"><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p><Icon className="h-4 w-4 text-blue-600" /></div><p className="mt-2 text-2xl font-bold text-slate-900">{value?.toLocaleString() ?? '—'}</p></Card></Link>)}</div>
    <div className="grid gap-4 md:grid-cols-2"><Card className="p-5"><div className="flex items-start justify-between"><div><h2 className="font-semibold text-slate-900">Registration approvals</h2><p className="mt-1 text-sm text-slate-500">Review new student and teacher registrations.</p></div><FileCheck2 className="h-5 w-5 text-amber-600" /></div><Link to="/admin/approvals"><Button className="mt-4" size="sm" variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>Open approvals</Button></Link></Card><Card className="p-5"><div className="flex items-start justify-between"><div><h2 className="font-semibold text-slate-900">System telemetry</h2><p className="mt-1 text-sm text-slate-500">Check backend, database, queue and storage status.</p></div><Activity className="h-5 w-5 text-emerald-600" /></div><Link to="/admin/telemetry"><Button className="mt-4" size="sm" variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>Open telemetry</Button></Link></Card></div>
  </div>;
};
