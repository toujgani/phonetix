import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download, Eye, Pencil, Search, ShieldCheck, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuthStore } from '../store/authStore';
import { apiRequest, apiUrl } from '../services/http';

type Group = { id: number; name: string; academic_year?: string | null };
type ManagedUser = { id: number; institutional_id: string | null; first_name: string; last_name: string; email: string; personal_email?: string | null; phone?: string | null; role: string; status: string; created_at: string; last_login_at?: string | null; approved_at?: string | null; groups: Group[]; progress?: { pronunciation_attempts: number; average_score: number | null } };
type PageData = { users: { data: ManagedUser[]; current_page: number; last_page: number; total: number; per_page: number }; statistics: Record<string, number>; groups: Group[]; academic_years: { id: number; name: string }[] };
type Filters = { search: string; role: string; status: string; group: string; academic_year: string; sort: string; direction: string; per_page: number };
const emptyFilters: Filters = { search: '', role: '', status: '', group: '', academic_year: '', sort: 'created_at', direction: 'desc', per_page: 25 };

export const AdminUserDatabase: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const [data, setData] = useState<PageData | null>(null);
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [focused, setFocused] = useState<ManagedUser | null>(null);
  const [details, setDetails] = useState<ManagedUser | null>(null);
  const [editForm, setEditForm] = useState<Partial<ManagedUser> & { group_ids?: number[] }>({});
  const [editOpen, setEditOpen] = useState(false);
  const requestRef = useRef<AbortController | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), per_page: String(filters.per_page), sort: filters.sort, direction: filters.direction });
    Object.entries(filters).forEach(([key, value]) => { if (value && !['per_page', 'sort', 'direction'].includes(key)) params.set(key, String(value)); });
    return params.toString();
  }, [filters, page]);

  const load = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true); setError('');
    try { setData(await apiRequest<PageData>(`/admin/users?${query}`, { signal: controller.signal }, token)); }
    catch (e) {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Unable to load users.');
    }
    finally { if (!controller.signal.aborted) setLoading(false); }
  }, [query, token]);
  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, filters.search ? 300 : 0);
    return () => {
      window.clearTimeout(timer);
      requestRef.current?.abort();
    };
  }, [load, filters.search]);

  const action = async (url: string, method: string, body?: unknown) => {
    try { await apiRequest(url, { method, ...(body ? { body: JSON.stringify(body) } : {}) }, token); setNotice('User record updated.'); await load(); return true; }
    catch (e) { setError(e instanceof Error ? e.message : 'The requested action failed.'); return false; }
  };
  const viewUser = async (user: ManagedUser) => {
    try { const result = await apiRequest<{ user: ManagedUser }>(`/admin/users/${user.id}`, {}, token); setDetails(result.user); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load user details.'); }
  };
  const openEdit = (user: ManagedUser) => { setFocused(user); setEditForm({ ...user, group_ids: user.groups.map((group) => group.id) }); setEditOpen(true); };
  const saveEdit = async (event: React.FormEvent) => { event.preventDefault(); if (!focused) return; if (await action(`/admin/users/${focused.id}`, 'PUT', editForm)) setEditOpen(false); };

  const exportFile = async (format: 'csv' | 'excel') => {
    try {
      const ids = format === 'excel' && selectedIds.length ? `&ids=${selectedIds.join(',')}` : '';
      const response = await fetch(apiUrl(`/admin/users/export?${query.replace(/(^|&)page=\d+/, '')}&format=${format}${ids}`), { headers: { Authorization: `Bearer ${token}`, Accept: '*/*' } });
      if (!response.ok) { const payload = await response.json().catch(() => ({})); throw new Error(payload.message || 'Export failed.'); }
      const blob = await response.blob(); const href = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = href; anchor.download = format === 'csv' ? 'phonetix-users.csv' : 'phonetix-users.xls'; anchor.click(); URL.revokeObjectURL(href);
    } catch (e) { setError(e instanceof Error ? e.message : 'Export failed.'); }
  };
  const setFilter = (key: keyof Filters, value: string | number) => { setPage(1); setFilters((current) => ({ ...current, [key]: value })); };
  const sortBy = (field: string) => { setPage(1); setFilters((f) => ({ ...f, sort: field, direction: f.sort === field && f.direction === 'asc' ? 'desc' : 'asc' })); };
  const currentRows = data?.users.data || [];
  const allSelected = currentRows.length > 0 && currentRows.every((user) => selectedIds.includes(user.id));
  const toggleAll = () => setSelectedIds(allSelected ? selectedIds.filter((id) => !currentRows.some((user) => user.id === id)) : [...new Set([...selectedIds, ...currentRows.map((user) => user.id)])]);
  const stats = data?.statistics;

  return <div className="space-y-6">
    <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold text-slate-900">User Database</h1><p className="text-xs text-slate-500">Search, review, and manage registered accounts.</p></div><Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={() => void exportFile('csv')}>Export CSV</Button></div>
    {stats && <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">{[['Total users', 'total'], ['Students', 'students'], ['Teachers', 'teachers'], ['Administrators', 'administrators'], ['Pending', 'pending'], ['Active', 'active'], ['Suspended', 'suspended']].map(([label, key]) => <Card key={key} className="p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-900">{stats[key].toLocaleString()}</p></Card>)}</div>}
    {notice && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{notice}</div>}
    {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
    <Card>
      <CardHeader><CardTitle>User records{data ? ` (${data.users.total.toLocaleString()})` : ''}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-6">
          <label className="relative lg:col-span-2"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/><input aria-label="Search name, email or student ID" className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs" placeholder="Search name, email or student ID" value={filters.search} onChange={(e) => setFilter('search', e.target.value)}/></label>
          <select aria-label="Filter role" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs" value={filters.role} onChange={(e) => setFilter('role', e.target.value)}><option value="">All roles</option><option value="student">Student</option><option value="teacher">Teacher</option><option value="super_admin">Administrator</option></select>
          <select aria-label="Filter group" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs" value={filters.group} onChange={(e) => setFilter('group', e.target.value)}><option value="">All groups</option>{data?.groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
          <select aria-label="Filter academic year" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs" value={filters.academic_year} onChange={(e) => setFilter('academic_year', e.target.value)}><option value="">All years</option>{data?.academic_years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}</select>
          <select aria-label="Filter account status" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs" value={filters.status} onChange={(e) => setFilter('status', e.target.value)}><option value="">All statuses</option><option value="pending">Pending</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="rejected">Rejected</option></select>
        </div>
        {selectedIds.length > 0 && <div className="flex flex-wrap items-center gap-2 text-xs"><span>{selectedIds.length} selected</span><Button size="sm" variant="outline" onClick={() => void exportFile('excel')} leftIcon={<Download className="h-3.5 w-3.5"/>}>Export Excel</Button><Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>Clear selection</Button></div>}
        <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-xs"><thead><tr className="border-b border-slate-200 bg-slate-50 text-slate-500"><th className="p-3"><input type="checkbox" aria-label="Select current page" checked={allSelected} onChange={toggleAll}/></th>{[['id','ID'],['first_name','Full name'],['email','Email'],['institutional_id','Student ID'],['role','Role'],['created_at','Registered'],['last_login_at','Last login'],['status','Status']].map(([key,label])=><th className="cursor-pointer p-3 font-semibold" key={key}><button onClick={() => sortBy(key)}>{label}{filters.sort===key ? (filters.direction==='asc'?' ↑':' ↓') : ''}</button></th>)}<th className="p-3">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={10} className="p-8 text-center text-slate-500">Loading user records…</td></tr> : currentRows.map((user) => <tr key={user.id} className="hover:bg-slate-50"><td className="p-3"><input type="checkbox" aria-label={`Select ${user.email}`} checked={selectedIds.includes(user.id)} onChange={(e) => setSelectedIds(e.target.checked ? [...selectedIds,user.id] : selectedIds.filter((id)=>id!==user.id))}/></td><td className="p-3">{user.id}</td><td className="p-3 font-semibold text-slate-900">{user.first_name} {user.last_name}<div className="font-normal text-slate-500">{user.phone || '—'}</div></td><td className="p-3">{user.email}</td><td className="p-3 font-mono">{user.institutional_id || '—'}</td><td className="p-3 capitalize">{user.role.replace('_',' ')}</td><td className="p-3">{new Date(user.created_at).toLocaleDateString()}</td><td className="p-3">{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : '—'}</td><td className="p-3 capitalize">{user.status}</td><td className="p-3"><div className="flex gap-1"><button aria-label="View user" title="View" className="rounded p-1.5 hover:bg-slate-100" onClick={() => void viewUser(user)}><Eye className="h-4 w-4"/></button><button aria-label="Edit user" title="Edit" className="rounded p-1.5 hover:bg-slate-100" onClick={() => openEdit(user)}><Pencil className="h-4 w-4"/></button><button aria-label="Approve registration" title="Approve" disabled={user.status!=='pending'} className="rounded p-1.5 hover:bg-emerald-50 disabled:opacity-30" onClick={() => void action(`/admin/users/${user.id}/approve`,'POST')}><ShieldCheck className="h-4 w-4"/></button><button aria-label={user.status==='suspended'?'Reactivate account':'Suspend account'} title={user.status==='suspended'?'Reactivate':'Suspend'} className="rounded p-1.5 hover:bg-amber-50" onClick={() => { const next=user.status==='suspended'?'active':'suspended'; if(window.confirm(`${next==='suspended'?'Suspend':'Reactivate'} ${user.email}?`)) void action(`/admin/users/${user.id}/status`,'PATCH',{status:next}); }}><Users className="h-4 w-4"/></button><button aria-label="Trigger password reset" title="Send password reset" className="rounded p-1.5 hover:bg-blue-50" onClick={() => { if(window.confirm(`Send a password reset link to ${user.email}?`)) void action(`/admin/users/${user.id}/password-reset`,'POST'); }}>↻</button><button aria-label="Revoke sessions" title="Revoke active sessions" className="rounded p-1.5 hover:bg-rose-50" onClick={() => { if(window.confirm(`Revoke all active sessions for ${user.email}?`)) void action(`/admin/users/${user.id}/sessions`,'DELETE'); }}>⦸</button></div></td></tr>)}</tbody></table></div>
        <div className="flex flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between"><label className="flex items-center gap-2">Rows per page <select className="rounded border border-slate-300 bg-white px-2 py-1" value={filters.per_page} onChange={(e)=>setFilter('per_page',Number(e.target.value))}>{[10,25,50,100].map(n=><option key={n}>{n}</option>)}</select></label><div className="flex items-center gap-2"><span>Page {data?.users.current_page || 1} of {data?.users.last_page || 1}</span><button aria-label="Previous page" disabled={page<=1||loading} className="rounded border p-1 disabled:opacity-40" onClick={()=>setPage((p)=>p-1)}><ChevronLeft className="h-4 w-4"/></button><button aria-label="Next page" disabled={page>=(data?.users.last_page||1)||loading} className="rounded border p-1 disabled:opacity-40" onClick={()=>setPage((p)=>p+1)}><ChevronRight className="h-4 w-4"/></button></div></div>
      </CardContent>
    </Card>
    <Modal isOpen={!!details} onClose={()=>setDetails(null)} title="User profile" maxWidth="lg">{details && <div className="space-y-4 text-sm"><h3 className="text-lg font-semibold">{details.first_name} {details.last_name}</h3><dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">{[['Email',details.email],['Personal email',details.personal_email||'—'],['Phone',details.phone||'—'],['Student ID',details.institutional_id||'—'],['Role',details.role],['Status',details.status],['Registered',new Date(details.created_at).toLocaleString()],['Last login',details.last_login_at?new Date(details.last_login_at).toLocaleString():'—'],['Groups',details.groups.map(g=>g.name).join(', ')||'—'],['Academic years',details.groups.map(g=>g.academic_year).filter(Boolean).join(', ')||'—'],['Pronunciation attempts',String(details.progress?.pronunciation_attempts??0)],['Average score',details.progress?.average_score==null?'—':`${details.progress.average_score}%`]].map(([k,v])=><div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className="font-medium capitalize">{v}</dd></div>)}</dl></div>}</Modal>
    <Modal isOpen={editOpen} onClose={()=>setEditOpen(false)} title="Edit user" maxWidth="lg"><form className="space-y-3" onSubmit={saveEdit}><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{(['first_name','last_name','email','institutional_id','phone'] as const).map((key)=><label key={key} className="text-xs capitalize">{key.replace('_',' ')}<input required={key==='first_name'||key==='last_name'||key==='email'} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2" value={editForm[key]||''} onChange={(e)=>setEditForm((f)=>({...f,[key]:e.target.value}))}/></label>)}<label className="text-xs">Role<select className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2" value={editForm.role} onChange={(e)=>setEditForm((f)=>({...f,role:e.target.value}))}><option value="student">Student</option><option value="teacher">Teacher</option><option value="super_admin">Administrator</option></select></label><label className="text-xs">Status<select className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2" value={editForm.status} onChange={(e)=>setEditForm((f)=>({...f,status:e.target.value}))}><option value="pending">Pending</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="rejected">Rejected</option></select></label><label className="text-xs sm:col-span-2">Group assignments<select multiple className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2" value={(editForm.group_ids||[]).map(String)} onChange={(e)=>setEditForm((f)=>({...f,group_ids:Array.from(e.target.selectedOptions,o=>Number(o.value))}))}>{data?.groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label></div><div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={()=>setEditOpen(false)}>Cancel</Button><Button type="submit" disabled={loading}>Save changes</Button></div></form></Modal>
  </div>;
};
