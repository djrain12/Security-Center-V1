'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState('');
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!form.get('email') || !form.get('password')) {
      setError('Enter your email and password to continue.');
      return;
    }
    const email = String(form.get('email')).trim().toLowerCase();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: String(form.get('password')) }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error || 'Sign-in failed.'); setLoading(false); return; }
      sessionStorage.setItem('wsi-authenticated', 'true');
      sessionStorage.setItem('wsi-login-email', email);
      sessionStorage.setItem('wsi-current-user', JSON.stringify(data));
      localStorage.setItem('wsi-online-users', JSON.stringify([email]));
      router.push('/');
    } catch {
      setError('Could not reach the server. Check the database connection.');
      setLoading(false);
    }
  }
  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form.entries())) });
      const data = await response.json();
      if (!response.ok) { setError(data.error || 'Registration failed.'); return; }
      setMessage(data.verificationUrl ? `Registration created. For local testing, open this verification link: ${data.verificationUrl}` : data.message);
      setRegistering(false);
    } catch { setError('Could not reach the server.'); } finally { setLoading(false); }
  }
  return <main className="login-page min-h-screen bg-[var(--canvas)] text-[var(--ink)]"><div className="login-ambient" aria-hidden="true"><i /><i /><i /><i /><i /><span /><span /><span /><span /></div><div className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
    <section className="relative hidden overflow-hidden border-r border-[var(--line)] bg-[#091a21] p-12 lg:flex lg:flex-col lg:justify-between"><div><div className="flex items-center gap-3"><div><strong className="font-display text-sm">Security Center</strong><span className="block text-[10px] text-[#617477]">Security Management Platform</span></div></div><div className="mt-32 max-w-lg"><div className="mb-4 text-[10px] font-bold uppercase tracking-[1.8px] text-[var(--teal)]">Cyber Security Management Information System</div><h1 className="font-display text-5xl font-semibold leading-tight">A clearer view of your security posture.</h1><p className="mt-6 max-w-md text-sm leading-6 text-[#8ca2a4]">One secure workspace for incidents, vulnerabilities, risk, compliance, and accountable access.</p></div></div><div className="flex items-center gap-2 text-[10px] text-[#617477]"><span className="h-2 w-2 rounded-full bg-[var(--teal)]" /> Systems monitored 24/7</div></section>
    <section className="flex items-center justify-center p-6 sm:p-10"><div className="w-full max-w-md"><div className="mb-10 flex items-center gap-3 lg:hidden"><div><strong className="font-display text-sm">Security Center</strong><span className="block text-[10px] text-[#617477]">Security Management Platform</span></div></div><div className="mb-8"><div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-[#123b3b] text-[var(--teal)]"><ShieldCheck size={22} /></div><h2 className="font-display text-3xl font-semibold">{registering ? 'Start your 30-day trial' : 'Welcome back'}</h2><p className="mt-2 text-sm text-[#8ca2a4]">{registering ? 'Register your company and verify your email to begin.' : 'Sign in to your security workspace.'}</p></div>{registering ? <form onSubmit={handleRegister} className="space-y-4"><input name="companyName" required placeholder="Company name" className="w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-sm text-white" /><input name="name" required placeholder="Your full name" className="w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-sm text-white" /><input name="email" required type="email" placeholder="Work email" className="w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-sm text-white" /><input name="password" required minLength={8} type="password" placeholder="Password (8+ characters)" className="w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-sm text-white" /><button disabled={loading} className="w-full rounded-md bg-[var(--teal)] px-4 py-3 text-xs font-bold text-[#082129]">{loading ? 'Creating trial…' : 'Register company'}</button><button type="button" onClick={() => setRegistering(false)} className="w-full text-xs text-[var(--teal)]">Back to sign in</button></form> : <form onSubmit={handleSubmit} className="space-y-5"><label className="block text-xs text-[#8ca2a4]">Work email<input name="email" type="email" placeholder="you@company.com" className="mt-2 w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-sm text-white outline-none transition focus:border-[var(--teal)]" /></label><label className="block text-xs text-[#8ca2a4]">Password<div className="relative mt-2"><input name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" className="w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-3 pr-10 text-sm text-white outline-none transition focus:border-[var(--teal)]" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-[#617477]">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>{error && <p className="rounded border border-[#70403c] bg-[#492b33] p-3 text-xs text-[#ef9b88]">{error}</p>}<button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--teal)] px-4 py-3 text-xs font-bold text-[#082129] disabled:opacity-60">{loading ? 'Signing in…' : 'Sign in'} <ArrowRight size={15} /></button><button type="button" onClick={() => setRegistering(true)} className="w-full text-xs text-[var(--teal)]">Register a company for a 30-day trial</button></form>}{message && <p className="mt-4 rounded border border-[#195a55] bg-[#0b2928] p-3 text-xs text-[#bff2e6]">{message}</p>}    <p className="mt-8 text-center text-[10px] text-[#617477]">Protected Security Center workspace · Access is role-scoped</p></div></section>
  </div></main>;
}
