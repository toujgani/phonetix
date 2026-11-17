import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../services/http';

type AuditEntry = {
  id: number;
  user_name: string;
  user_email: string | null;
  action: string;
  entity: string;
  entity_id: number | null;
  ip_address: string | null;
  timestamp: string | null;
};
type AuditPage = {
  logs: { data: AuditEntry[]; current_page: number; last_page: number; total: number; per_page: number };
};

export const AdminAuditLogs: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const [logs, setLogs] = useState<AuditPage['logs'] | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [sort, setSortValue] = useState('created_at');
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage), sort, direction });
    if (debouncedSearch) params.set('search', debouncedSearch);
    return params.toString();
  }, [page, perPage, sort, direction, debouncedSearch]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest<AuditPage>(`/admin/audit-logs?${query}`, {}, token);
      setLogs(result.logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [query, token]);

  useEffect(() => { void load(); }, [load]);

  const changeSort = (field: string) => {
    setPage(1);
    setDirection((current) => sort === field && current === 'desc' ? 'asc' : 'desc');
    setSortValue(field);
  };

  return (
    <div className="w-full space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Audit Logs</h1>
        <p className="text-xs text-slate-500">Review administrative and account activity recorded by the system.</p>
      </div>

      {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Activity history{logs ? ` (${logs.total.toLocaleString()})` : ''}</CardTitle>
            <p className="mt-1 text-xs text-slate-500">Search by administrator, action, record, or IP address.</p>
          </div>
          <label className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input aria-label="Search audit logs" className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs" placeholder="Search audit logs" value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} />
          </label>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead><tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                {[['created_at', 'Date and time'], ['user_name', 'User'], ['action', 'Action'], ['entity_type', 'Record'], ['ip_address', 'IP address']].map(([field, label]) => (
                  <th key={field} className="p-3 font-semibold"><button disabled={field === 'user_name'} className="disabled:cursor-default" onClick={() => changeSort(field)}>{label}{sort === field ? (direction === 'asc' ? ' ↑' : ' ↓') : ''}</button></th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading audit logs…</td></tr> : logs?.data.length ? logs.data.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap p-3">{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '—'}</td>
                    <td className="p-3"><span className="font-semibold text-slate-900">{entry.user_name}</span>{entry.user_email && <span className="mt-0.5 block text-slate-500">{entry.user_email}</span>}</td>
                    <td className="p-3 font-medium">{entry.action}</td>
                    <td className="p-3">{entry.entity}{entry.entity_id ? ` #${entry.entity_id}` : ''}</td>
                    <td className="p-3 font-mono">{entry.ip_address || '—'}</td>
                  </tr>
                )) : <tr><td colSpan={5} className="p-10 text-center text-slate-500">No audit entries match this search.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2">Rows per page <select className="rounded border border-slate-300 bg-white px-2 py-1" value={perPage} onChange={(event) => { setPage(1); setPerPage(Number(event.target.value)); }}>{[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
            <div className="flex items-center gap-2"><span>Page {logs?.current_page || 1} of {logs?.last_page || 1}</span><button aria-label="Previous page" disabled={page <= 1 || loading} className="rounded border p-1 disabled:opacity-40" onClick={() => setPage((current) => current - 1)}><ChevronLeft className="h-4 w-4" /></button><button aria-label="Next page" disabled={page >= (logs?.last_page || 1) || loading} className="rounded border p-1 disabled:opacity-40" onClick={() => setPage((current) => current + 1)}><ChevronRight className="h-4 w-4" /></button></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
