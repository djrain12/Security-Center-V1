'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type AuditRow = { id: string; action: string; resourceType: string; resourceId?: string | null; createdAt: string; actor?: { fullName: string; email: string } | null; metadata?: Record<string, unknown> | null };
type EditRequest = { id: number; module: string; recordId: string; reason: string; createdAt: string; requestedBy?: { fullName: string; email: string } };

export default function AuditLogs() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<EditRequest[]>([]);
  async function load() {
    setLoading(true);
    try { const [logs, edits] = await Promise.all([api.get<AuditRow[]>(`/api/audit-logs?q=${encodeURIComponent(q)}&from=${from}&to=${to}`), api.get<EditRequest[]>('/api/record-edit-requests')]); setRows(logs); setRequests(edits); } finally { setLoading(false); }
  }
  async function decide(id: number, decision: 'APPROVE' | 'REJECT') { await api.patch('/api/record-edit-requests', { id, decision }); await load(); }
  useEffect(() => { load().catch(() => setRows([])); }, []);
  return <section className="space-y-4"><div className="panel p-5"><h2 className="font-display text-xl">Audit Logs</h2><p className="mt-2 text-xs text-[var(--muted)]">Automatic activity history for system actions, approvals, edits, deletions, and access events.</p><div className="mt-4 grid gap-2 md:grid-cols-[1fr_160px_160px_auto]"><input value={q} onChange={event => setQ(event.target.value)} placeholder="Search activity, module, record..." className="rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-xs" /><input type="date" value={from} onChange={event => setFrom(event.target.value)} className="rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-xs" /><input type="date" value={to} onChange={event => setTo(event.target.value)} className="rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-xs" /><button onClick={() => load().catch(() => undefined)} className="rounded bg-[var(--teal)] px-3 py-2 text-xs font-bold text-[var(--highlight-ink)]">Filter</button></div></div>{requests.length > 0 && <div className="panel overflow-hidden"><div className="border-b border-[var(--line)] p-4"><h3 className="font-display text-sm">Pending record edits</h3></div><div className="divide-y divide-[var(--line)]">{requests.map(item => <div key={item.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center"><div className="min-w-0 flex-1"><strong className="block text-xs">{item.module} · {item.recordId}</strong><span className="block text-[10px] text-[var(--muted)]">{item.requestedBy?.fullName || 'User'} — {item.reason}</span></div><div className="flex gap-2"><button onClick={() => decide(item.id, 'REJECT').catch(() => undefined)} className="rounded border border-[#9b4038] px-3 py-1.5 text-[10px] text-[#ef9b88]">Reject</button><button onClick={() => decide(item.id, 'APPROVE').catch(() => undefined)} className="rounded bg-[var(--teal)] px-3 py-1.5 text-[10px] font-bold text-[var(--highlight-ink)]">Approve</button></div></div>)}</div></div>}<div className="panel overflow-hidden"><div className="border-b border-[var(--line)] p-4 text-xs text-[var(--muted)]">{loading ? 'Loading activity…' : `${rows.length} activities`}</div><div className="divide-y divide-[var(--line)]">{rows.map(row => <div key={row.id} className="grid gap-2 p-4 md:grid-cols-[180px_1fr_180px]"><time className="text-[10px] text-[var(--muted)]">{new Date(row.createdAt).toLocaleString()}</time><div><strong className="block text-xs">{row.action}</strong><span className="text-[10px] text-[var(--muted)]">{row.resourceType}{row.resourceId ? ` · ${row.resourceId}` : ''}</span></div><span className="text-[10px] text-[var(--muted)]">{row.actor?.fullName || 'System'}{row.actor?.email ? ` · ${row.actor.email}` : ''}</span></div>)}</div></div></section>;
}
