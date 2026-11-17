import React, { useCallback, useEffect, useState } from 'react';
import { Activity, Database, HardDrive, RefreshCw, Server } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { apiRequest } from '../services/http';
import { useAuthStore } from '../store/authStore';

type Telemetry = { application: { status: string; environment: string; php_version: string; laravel_version: string }; database: { status: string; driver: string; latency_ms: number | null }; queue: { driver: string; pending_jobs: number | null; failed_jobs: number | null }; storage: { disk: string; used_bytes: number; used_mb: number }; generated_at: string };
export const AdminTelemetry: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const [data, setData] = useState<Telemetry | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); setError(''); try { setData(await apiRequest<Telemetry>('/admin/telemetry', {}, token)); } catch (e) { setError(e instanceof Error ? e.message : 'Could not load system telemetry.'); } finally { setLoading(false); } }, [token]);
  useEffect(() => { void load(); }, [load]);
  const statusColor = (status?: string) => status === 'healthy' || status === 'running' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50';
  const tile = (title: string, icon: React.ReactNode, children: React.ReactNode) => <Card><CardHeader className="flex flex-row items-center gap-3"><span className="rounded-lg bg-blue-50 p-2 text-blue-700">{icon}</span><CardTitle>{title}</CardTitle></CardHeader><CardContent className="space-y-3">{children}</CardContent></Card>;
  const status = (value?: string) => <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusColor(value)}`}>{value || 'unknown'}</span>;
  return <div className="w-full space-y-6"><div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight text-slate-900">System Telemetry</h1><p className="text-xs text-slate-500">Live status of the application services and local storage.</p></div><Button variant="outline" size="sm" onClick={() => void load()} disabled={loading} leftIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}>Refresh</Button></div>
    {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}{loading && !data && <Card><CardContent className="p-8 text-center text-sm text-slate-500">Reading service status…</CardContent></Card>}
    {data && <><div className="grid gap-4 md:grid-cols-2">{tile('Application', <Activity className="h-5 w-5" />, <><div>{status(data.application.status)}</div><p className="text-sm text-slate-600">Environment: <strong>{data.application.environment}</strong></p><p className="text-sm text-slate-600">PHP {data.application.php_version} · Laravel {data.application.laravel_version}</p></>)}{tile('Database', <Database className="h-5 w-5" />, <><div>{status(data.database.status)}</div><p className="text-sm text-slate-600">Driver: <strong className="uppercase">{data.database.driver}</strong></p><p className="text-sm text-slate-600">Query connection time: <strong>{data.database.latency_ms ?? '—'} ms</strong></p></>)}{tile('Queue', <Server className="h-5 w-5" />, <><p className="text-sm text-slate-600">Driver: <strong>{data.queue.driver}</strong></p><p className="text-sm text-slate-600">Pending jobs: <strong>{data.queue.pending_jobs ?? 'Not measured'}</strong></p><p className="text-sm text-slate-600">Failed jobs: <strong>{data.queue.failed_jobs ?? 'Not measured'}</strong></p></>)}{tile('Storage', <HardDrive className="h-5 w-5" />, <><p className="text-sm text-slate-600">Disk: <strong>{data.storage.disk}</strong></p><p className="text-sm text-slate-600">Files in Laravel storage: <strong>{data.storage.used_mb} MB</strong></p></>)}</div><p className="text-right text-xs text-slate-400">Updated {new Date(data.generated_at).toLocaleString()}</p></>}
  </div>;
};
