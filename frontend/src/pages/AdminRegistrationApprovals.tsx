import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { apiRequest } from '../services/http';
import { useAuthStore } from '../store/authStore';

type Applicant = { id: number; first_name: string; last_name: string; email: string; institutional_id?: string | null; role: string; created_at: string; groups?: { name: string }[] };
type UserPage = { users: { data: Applicant[]; total: number }; statistics: { pending: number } };
export const AdminRegistrationApprovals: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const [result, setResult] = useState<UserPage | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); setError(''); try { setResult(await apiRequest<UserPage>('/admin/users?status=pending&per_page=100', {}, token)); } catch (e) { setError(e instanceof Error ? e.message : 'Could not load applications.'); } finally { setLoading(false); } }, [token]);
  useEffect(() => { void load(); }, [load]);
  const act = async (user: Applicant, action: 'approve' | 'reject') => { setBusy(user.id); setError(''); try { if (action === 'approve') await apiRequest(`/admin/users/${user.id}/approve`, { method: 'POST' }, token); else await apiRequest(`/admin/users/${user.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'rejected' }) }, token); await load(); } catch (e) { setError(e instanceof Error ? e.message : 'Could not update application.'); } finally { setBusy(null); } };
  return <div className="w-full space-y-6"><div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight text-slate-900">Registration Approvals</h1><p className="text-xs text-slate-500">Review and process accounts waiting for approval.</p></div><Button variant="outline" size="sm" onClick={() => void load()} disabled={loading} leftIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}>Refresh</Button></div>
    {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
    <Card><CardHeader><CardTitle>Pending applications ({result?.statistics.pending ?? '—'})</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500"><th className="p-3">Applicant</th><th className="p-3">Institutional ID</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Registered</th><th className="p-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{result?.users.data.map((user) => <tr key={user.id}><td className="p-3 font-semibold">{user.first_name} {user.last_name}</td><td className="p-3 font-mono text-slate-600">{user.institutional_id || '—'}</td><td className="p-3 text-slate-600">{user.email}</td><td className="p-3 capitalize">{user.role.replace('_', ' ')}</td><td className="p-3 text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td><td className="p-3 text-right"><div className="flex justify-end gap-2"><Button size="sm" isLoading={busy === user.id} onClick={() => void act(user, 'approve')} leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}>Approve</Button><Button size="sm" variant="danger" disabled={busy !== null} onClick={() => void act(user, 'reject')} leftIcon={<XCircle className="h-3.5 w-3.5" />}>Reject</Button></div></td></tr>)}</tbody></table>{loading && <p className="p-8 text-center text-sm text-slate-500">Loading applications…</p>}{!loading && !result?.users.data.length && <p className="p-10 text-center text-sm text-slate-500">No pending registration requests.</p>}</div></CardContent></Card>
  </div>;
};
