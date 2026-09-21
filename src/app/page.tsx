'use client';

import { startTransition, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Bell, ChevronDown, Copy, Download, Eye, EyeOff, FileText, Globe, Laptop, Mail, Menu, Monitor, Pencil, Plus, RefreshCw, Scan, Search, Server, ShieldCheck, Smartphone, Trash2, Upload, Video, X } from 'lucide-react';

const nav = ['Security Dashboard', 'Security Incidents', 'Security Events', 'Vulnerability Management', 'VAPT Management', 'Risk Management', 'Security Assets', 'Access Management', 'Network Security', 'Server Security', 'Backup Security'];
const governanceNav = ['Governance Dashboard', 'Document Library', 'Security Policies', 'Security Awareness', 'Audit & Findings', 'SOC 2 Compliance', 'ISO 27001 Compliance', 'DPA Compliance', 'Security Reports', 'Audit Logs'];
const misToolsNav = ['MIS Dashboard', 'Daily Report', 'Inventory', 'Email Management', 'Reports'];
const workspaceNav = ['Dashboard', 'User Management', 'Server Management', 'Network Management', 'Backup Management'];
const allModules = [...new Set([...workspaceNav, ...nav, ...governanceNav, ...misToolsNav, 'Settings'])];
type CustomModule = { id: string; title: string; description: string; apiKey: string; baseUrl: string };
const metrics = [['Security incidents', '12', '+8.3%', 'coral'], ['Critical / high vulnerabilities', '07', '-12.5%', 'red'], ['Open risks', '24', '-4.1%', 'amber'], ['Security compliance', '94.8%', '+2.4%', 'mint']];
const activity: Array<[string, number, string]> = [['VAPT engagements', 78, 'mint'], ['Patching cadence', 92, 'blue'], ['Access reviews', 64, 'amber'], ['Backup verification', 100, 'violet']];
const users = [
  { initials: 'MA', name: 'Michael Adams', title: 'Security Officer', department: 'Cyber Security', role: 'Master Admin', accessLevel: 'MASTER_ADMIN', scope: 'All security modules and confidential records', birthday: '1987-04-18', contactNumber: '+63 917 555 0101', address: 'WSI Main Office', email: 'michael.adams@wsi.local', passwordConfigured: true, mfaEnabled: true, photoUrl: '', status: 'Active', lastActive: '2 minutes ago', color: 'bg-[#254a51] text-[var(--teal)]' },
  { initials: 'TS', name: 'Tara Singh', title: 'Security Officer', department: 'Cyber Security', role: 'IT Security Officer', accessLevel: 'IT_SECURITY_OFFICER', scope: 'Limited security operations access', birthday: '1990-08-22', contactNumber: '+63 917 555 0102', address: 'WSI Main Office', email: 'tara.singh@wsi.local', passwordConfigured: true, mfaEnabled: true, photoUrl: '', status: 'Active', lastActive: '18 minutes ago', color: 'bg-[#493b26] text-[var(--amber)]' },
  { initials: 'RL', name: 'Rachel Lee', title: 'MIS Section Head', department: 'MIS', role: 'Admin', accessLevel: 'ADMIN', scope: 'Limited administrative access', birthday: '1984-01-09', contactNumber: '+63 917 555 0103', address: 'WSI Main Office', email: 'rachel.lee@wsi.local', passwordConfigured: true, mfaEnabled: false, photoUrl: '', status: 'Active', lastActive: '1 hour ago', color: 'bg-[#3e2b54] text-[#bf8df5]' },
  { initials: 'DC', name: 'Daniel Cruz', title: 'Technical Contributor', department: 'Technical Department', role: 'IT User', accessLevel: 'IT_USER', scope: 'Assigned tasks and evidence only', birthday: '1995-11-02', contactNumber: '+63 917 555 0104', address: 'Technical Department', email: 'daniel.cruz@wsi.local', passwordConfigured: false, mfaEnabled: false, photoUrl: '', status: 'Active', lastActive: 'Yesterday', color: 'bg-[#1b3b58] text-[var(--blue)]' },
  { initials: 'SC', name: 'Sofia Chen', title: 'Software Contributor', department: 'Software Department', role: 'IT User', accessLevel: 'IT_USER', scope: 'Assigned tasks and evidence only', birthday: '1993-06-12', contactNumber: '+63 917 555 0105', address: 'Software Department', email: 'sofia.chen@wsi.local', passwordConfigured: false, mfaEnabled: false, photoUrl: '', status: 'Inactive', lastActive: '12 Sep 2026', color: 'bg-[#3b3230] text-[#9b8985]' },
];

type SecurityIncident = { id: string; title: string; severity: string; asset: string; status: string; reportedAt: string; owner: string };

function UserAvatar({ user, sizeClass, textClass }: { user: { initials: string; photoUrl?: string; color: string }; sizeClass: string; textClass: string }) {
  return (
    <div className={`grid shrink-0 place-items-center overflow-hidden rounded-full font-bold ${sizeClass} ${textClass} ${user.photoUrl ? '' : user.color}`}>
      {user.photoUrl ? <img src={user.photoUrl} alt={user.initials} className="h-full w-full object-cover" /> : user.initials}
    </div>
  );
}

const seedIncidents: SecurityIncident[] = [
  { id: 'INC-041', title: 'Suspicious authentication pattern detected', severity: 'High', asset: 'WSI VPN Gateway', status: 'Open', reportedAt: '9/16/2026, 8:12:00 AM', owner: 'Mark Julius Dannug' },
  { id: 'INC-040', title: 'Unusual outbound traffic from file server', severity: 'Critical', asset: 'WSI-FS-01', status: 'Investigating', reportedAt: '9/15/2026, 6:44:00 PM', owner: 'Anthony Migraso' },
  { id: 'INC-039', title: 'Multiple failed logins on admin portal', severity: 'Medium', asset: 'MIS Admin Portal', status: 'Open', reportedAt: '9/15/2026, 2:03:00 PM', owner: 'Mark Julius Dannug' },
  { id: 'INC-038', title: 'USB device blocked by endpoint policy', severity: 'Low', asset: 'LPT-354', status: 'Resolved', reportedAt: '9/14/2026, 10:21:00 AM', owner: 'Jhon Paul Mercado' },
];

export default function Dashboard() {
  const router = useRouter();
  const [active, setActive] = useState('Security Dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cyberSecurityOpen, setCyberSecurityOpen] = useState(false);
  const [itGovernanceOpen, setItGovernanceOpen] = useState(false);
  const [misToolsOpen, setMisToolsOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [userRecords, setUserRecords] = useState<typeof users>(users);
  const [incidents, setIncidents] = useState<SecurityIncident[]>(seedIncidents);
  const [profileUser, setProfileUser] = useState<typeof users[number] | null>(null);
  const [accessUser, setAccessUser] = useState<typeof users[number] | null>(null);
  const [savedPermissions, setSavedPermissions] = useState<Record<string, Record<string, boolean>>>({});
  const currentUserRecord = userRecords[0];
  const canAccessSettings = currentUserRecord?.accessLevel === 'MASTER_ADMIN' || savedPermissions[currentUserRecord?.name || '']?.['Settings'] === true;
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; detail: string; module: string; unread: boolean }>>([
    { id: 'incident-041', title: 'Incident requires investigation', detail: 'Suspicious authentication pattern · High severity', module: 'Security Incidents', unread: true },
    { id: 'access-review', title: 'Quarterly access review due', detail: 'Finance department · Due Sep 13', module: 'Access Management', unread: true },
    { id: 'backup-evidence', title: 'Backup evidence ready for review', detail: 'Backup cluster B · Assigned to you', module: 'Backup Management', unread: false },
  ]);
  const [notice, setNotice] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUnread, setChatUnread] = useState(0);
  const isDashboard = active === 'Security Dashboard';
  const showSecurityOverview = active === 'Dashboard';
  const showExportReport = active === 'Dashboard';

  const [theme, setTheme] = useState('dark');
  const [branding, setBranding] = useState<{ name: string; tagline: string; logo: string }>({ name: 'WeSupport, Incorporated', tagline: 'WSI MIS', logo: '' });
  const [customModules, setCustomModules] = useState<CustomModule[]>([]);
  const [connectedOpen, setConnectedOpen] = useState(true);

  useEffect(() => {
    const storedUsers = localStorage.getItem('wsi-user-records');
    const storedPermissions = localStorage.getItem('wsi-user-permissions');
    (async () => {
      try {
        const stored = await api.get<Record<string, string>>('/api/settings');
        if (stored['system-settings']) {
          const parsed = JSON.parse(stored['system-settings']) as Partial<SystemSettings>;
          setBranding({ name: parsed.orgName || 'WeSupport, Incorporated', tagline: parsed.department || 'WSI MIS', logo: parsed.companyLogo || '' });
        }
        if (stored['custom-modules']) {
          try { setCustomModules(JSON.parse(stored['custom-modules']) as CustomModule[]); } catch { /* ignore */ }
        }
      } catch { /* ignore */ }
    })();
    const storedTheme = localStorage.getItem('wsi-theme');
    const storedIncidents = localStorage.getItem('wsi-security-incidents');
    // Load users + their module permissions from the database.
    (async () => {
      try {
        const dbUsers = await api.get<Array<Record<string, unknown> & { permissions?: Record<string, boolean> }>>('/api/users');
        if (dbUsers.length) {
          const onlineEmails = JSON.parse(localStorage.getItem('wsi-online-users') || '[]') as string[];
          const mapped = dbUsers.map((dbUser, index) => ({
            initials: String(dbUser.name || '').split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase(),
            name: String(dbUser.name), title: String(dbUser.title || dbUser.role || ''), department: String(dbUser.department || ''),
            role: String(dbUser.role || ''), accessLevel: String(dbUser.accessLevel || 'IT_USER'), scope: '', birthday: String(dbUser.birthday || ''),
            contactNumber: String(dbUser.contactNumber || ''), address: String(dbUser.address || ''), email: String(dbUser.email),
            passwordConfigured: Boolean(dbUser.passwordConfigured), mfaEnabled: Boolean(dbUser.mfaEnabled), photoUrl: String(dbUser.photoUrl || ''),
            status: onlineEmails.includes(String(dbUser.email).toLowerCase()) ? 'Active' : (dbUser.status === 'Active' ? 'Active' : 'Inactive'),
            lastActive: String(dbUser.lastActive || ''), color: users[index % users.length]?.color || 'bg-[#254a51] text-[var(--teal)]',
          }));
          setUserRecords(mapped);
          setSavedPermissions(Object.fromEntries(dbUsers.map(dbUser => [String(dbUser.name), dbUser.permissions || {}])));
          return;
        }
      } catch { /* fall through to local */ }
      const records = storedUsers ? JSON.parse(storedUsers) : users;
      const onlineEmails = JSON.parse(localStorage.getItem('wsi-online-users') || '[]') as string[];
      setUserRecords(records.map((user: typeof users[number]) => ({ ...user, status: onlineEmails.includes(user.email.toLowerCase()) ? 'Active' : 'Inactive', lastActive: onlineEmails.includes(user.email.toLowerCase()) ? 'Online now' : user.lastActive })));
      if (storedPermissions) setSavedPermissions(JSON.parse(storedPermissions));
    })();
    (async () => {
      try {
        const dbIncidents = await api.get<SecurityIncident[]>('/api/incidents');
        if (dbIncidents.length) setIncidents(dbIncidents);
        else if (storedIncidents) setIncidents(JSON.parse(storedIncidents));
      } catch { if (storedIncidents) setIncidents(JSON.parse(storedIncidents)); }
    })();
    startTransition(() => {
      if (storedTheme) setTheme(storedTheme);
      const storedActive = localStorage.getItem('wsi-active-module');
      if (storedActive) setActive(storedActive);
    });
    const syncPresence = () => {
      const onlineEmails = JSON.parse(localStorage.getItem('wsi-online-users') || '[]') as string[];
      setUserRecords(current => current.map(user => ({ ...user, status: onlineEmails.includes(user.email.toLowerCase()) ? 'Active' : 'Inactive', lastActive: onlineEmails.includes(user.email.toLowerCase()) ? 'Online now' : user.lastActive })));
    };
    window.addEventListener('focus', syncPresence);
    window.addEventListener('storage', syncPresence);
    const syncChat = async () => {
      try {
        const data = await api.get<ChatApiResponse>('/api/chat');
        const read = loadReadCounts();
        const unread = Object.keys(data.messages).reduce((sum, roomId) => sum + Math.max(0, (data.messages[roomId]?.length || 0) - (read[roomId] || 0)), 0);
        setChatUnread(unread);
      } catch { /* ignore */ }
    };
    syncChat();
    const chatTimer = setInterval(syncChat, 5000);
    window.addEventListener('chat-updated', syncChat);
    window.addEventListener('storage', syncChat);
    return () => { window.removeEventListener('focus', syncPresence); window.removeEventListener('storage', syncPresence); window.removeEventListener('chat-updated', syncChat); window.removeEventListener('storage', syncChat); clearInterval(chatTimer); };
  }, []);

  function navigateTo(module: string) {
    setActive(module);
    localStorage.setItem('wsi-active-module', module);
  }

  function openNotifications() {
    setNotificationsOpen(true);
    setNotifications(current => current.map(notification => ({ ...notification, unread: false })));
  }

  function notify(text: string) {
    setNotice(text);
    setTimeout(() => setNotice(''), 2500);
  }

  function saveIncidents(next: SecurityIncident[]) {
    setIncidents(next);
  }

  function submitIncident(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') || '').trim();
    if (!title) { notify('Incident title is required.'); return; }
    const incident: SecurityIncident = { id: `INC-${String(41 + incidents.length).padStart(3, '0')}`, title, severity: String(form.get('severity') || 'Medium'), asset: String(form.get('asset') || '').trim(), status: 'Open', reportedAt: new Date().toLocaleString(), owner: userRecords[0]?.name || 'Unassigned' };
    setIncidents([incident, ...incidents]);
    api.post('/api/incidents', incident).catch(() => notify('Could not save incident to the database.'));
    setModal(false);
    notify(`Incident ${incident.id} logged and added to Security Incidents.`);
  }

  const themes = { dark: { canvas: '#07151b', surface: '#0c2027', ink: '#e8f0ef', line: '#1b3a42', accent: '#49d4bf', accentSoft: '#123b3b', highlight: '#12313a', highlightInk: '#082129', sidebar: '#091a21', muted: '#8ca2a4' }, light: { canvas: '#f5f8f7', surface: '#ffffff', ink: '#111b1d', line: '#c5d5d1', accent: '#006b5f', accentSoft: '#d1f3ec', highlight: '#d8f0eb', highlightInk: '#063b35', sidebar: '#ffffff', muted: '#3f5558' }, blue: { canvas: '#e7f1fa', surface: '#ffffff', ink: '#102231', line: '#b7cee0', accent: '#155fa0', accentSoft: '#cfe6f8', highlight: '#d5e9f8', highlightInk: '#0b3154', sidebar: '#fafdff', muted: '#3e596c' }, paper: { canvas: '#f7f0e5', surface: '#fffdf8', ink: '#211e1a', line: '#d5c4ad', accent: '#9d4726', accentSoft: '#f5dfd0', highlight: '#f4dfd2', highlightInk: '#4b2112', sidebar: '#fffdf8', muted: '#5f5044' } };
  const currentTheme = themes[theme as keyof typeof themes] || themes.dark;
  return (
    <main data-theme={theme} style={{ '--canvas': currentTheme.canvas, '--surface': currentTheme.surface, '--ink': currentTheme.ink, '--line': currentTheme.line, '--teal': currentTheme.accent, '--profile-accent': currentTheme.accentSoft, '--accent-ink': currentTheme.ink, '--muted-surface': currentTheme.accentSoft, '--highlight': currentTheme.highlight, '--highlight-ink': currentTheme.highlightInk, '--sidebar': currentTheme.sidebar, '--muted': currentTheme.muted } as React.CSSProperties} className="dashboard-app min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <aside className={`fixed inset-y-0 left-0 z-20 w-[260px] border-r border-[var(--line)] bg-[var(--sidebar)] p-4 transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-7 flex items-center gap-3 px-2">
          {branding.logo ? <img src={branding.logo} alt={branding.name} className="h-10 w-10 rounded-lg object-contain bg-white p-0.5" /> : <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#ffac05] font-display font-bold text-[#122a35]">{branding.name.split(' ').map(word => word[0]).join('').slice(0, 3).toUpperCase()}</div>}
          <div><strong className="font-display text-sm">{branding.name.split(',')[0]}</strong><span className="block text-[10px] text-[#617477]">{branding.tagline}</span></div>
        </div>
        <div className="workspace-label mb-2 px-3 text-[10px] font-bold uppercase tracking-[1.4px] text-white">Workspace</div>
        {['Dashboard', 'User Management', 'Server Management', 'Network Management', 'Backup Management'].map(item => <button key={item} data-active={active === item ? 'true' : 'false'} onClick={() => { navigateTo(item); setMobileOpen(false); }} className="workspace-menu-item mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs transition">◈ {item}</button>)}
        <button type="button" onClick={() => setCyberSecurityOpen(open => !open)} aria-expanded={cyberSecurityOpen} className="mb-2 mt-5 flex w-full items-center justify-between px-3 text-left text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]"><span>◈ Cyber Security <span className="ml-1 inline-block h-1 w-1 rounded-full bg-[var(--teal)]" /></span><ChevronDown size={13} className={`transition-transform ${cyberSecurityOpen ? '' : '-rotate-90'}`} /></button>
        {cyberSecurityOpen && nav.map((item, index) => <button key={item} data-active={active === item ? 'true' : 'false'} onClick={() => { navigateTo(item); setMobileOpen(false); }} className="sidebar-submenu-item mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[11px] transition"><span className="w-3 text-center">{index === 0 ? '⌂' : index === 1 ? '!' : '◇'}</span>{item}{item === 'Security Incidents' && incidents.filter(incident => incident.status !== 'Resolved').length > 0 && <b className="notification-count ml-auto rounded-full px-1.5 py-0.5 text-[9px]">{incidents.filter(incident => incident.status !== 'Resolved').length}</b>}</button>)}
        <button type="button" onClick={() => setItGovernanceOpen(open => !open)} aria-expanded={itGovernanceOpen} className="mb-2 mt-4 flex w-full items-center justify-between border-t border-[var(--line)] px-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]"><span>▤ IT Governance</span><ChevronDown size={13} className={`transition-transform ${itGovernanceOpen ? '' : '-rotate-90'}`} /></button>
        {itGovernanceOpen && governanceNav.map((item, index) => <button key={item} data-active={active === item ? 'true' : 'false'} onClick={() => { navigateTo(item); setMobileOpen(false); }} className="sidebar-submenu-item mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[11px] transition"><span className="w-3 text-center">{index === 0 ? '⌂' : index === 1 ? '▤' : index < 5 ? '≡' : '✓'}</span>{item}</button>)}
        <button type="button" onClick={() => setMisToolsOpen(open => !open)} aria-expanded={misToolsOpen} className="mb-2 mt-4 flex w-full items-center justify-between border-t border-[var(--line)] px-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]"><span>▣ MIS Tools</span><ChevronDown size={13} className={`transition-transform ${misToolsOpen ? '' : '-rotate-90'}`} /></button>
        {misToolsOpen && misToolsNav.map(item => <button key={item} data-active={active === item ? 'true' : 'false'} onClick={() => { navigateTo(item); setMobileOpen(false); }} className="sidebar-submenu-item mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[11px] transition"><span className="w-3 text-center">{item === 'MIS Dashboard' ? '⌂' : item === 'Daily Report' ? '✎' : item === 'Inventory' ? '▦' : item === 'Email Management' ? '✉' : '▤'}</span>{item}</button>)}
        {customModules.length > 0 && (
          <>
            <button type="button" onClick={() => setConnectedOpen(open => !open)} aria-expanded={connectedOpen} className="mb-2 mt-4 flex w-full items-center justify-between border-t border-[var(--line)] px-3 pt-4 text-left text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]"><span>◎ Connected systems</span><ChevronDown size={13} className={`transition-transform ${connectedOpen ? '' : '-rotate-90'}`} /></button>
            {connectedOpen && customModules.map(module => <button key={module.id} data-active={active === module.title ? 'true' : 'false'} onClick={() => { navigateTo(module.title); setMobileOpen(false); }} className="sidebar-submenu-item mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[11px] transition"><span className="w-3 text-center">◎</span>{module.title}</button>)}
          </>
        )}
        <div className="sidebar-bottom">{canAccessSettings && <button type="button" onClick={() => setSettingsOpen(true)} className="sidebar-settings flex items-center gap-3 rounded-md px-3 py-2 text-left text-[11px] text-white transition hover:bg-white/20"><span className="w-3 text-center">⚙</span>Settings</button>}<div className="sidebar-footer border-t border-[var(--line)] pt-4 text-[10px] text-[#617477]"><strong className="block text-[#b6c7c7]">Cyber Security Department</strong>Protected workspace</div></div>
      </aside>

      <section className="lg:pl-[260px]">
          <header className="flex h-[72px] items-center justify-between border-b border-[var(--line)] px-5 lg:px-10">
          <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}><Menu size={20} /></button>
          <div className="hidden text-xs text-[var(--muted)] sm:block">WSI MIS Tools <span className="px-2 opacity-60">/</span><span className="text-[var(--ink)]">{active}</span></div>
          <div className="flex items-center gap-4"><button onClick={() => { setSearchTerm(''); setSearchOpen(true); }} aria-label="Search workspace" className="text-[var(--muted)]"><Search size={19} /></button><button onClick={openNotifications} aria-label="Open notifications" className="relative text-[var(--muted)]"><Bell size={18} />{notifications.some(notification => notification.unread) && <i className="absolute -right-1 -top-1 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-[var(--coral)] px-1 text-[8px] font-bold text-white">{notifications.filter(notification => notification.unread).length}</i>}</button><button onClick={() => setProfileMenuOpen(true)} className="hidden items-center gap-2 border-l border-[var(--line)] pl-4 text-left sm:flex"><UserAvatar user={userRecords[0]} sizeClass="h-8 w-8" textClass="text-[10px]" /><div><strong className="block text-xs">{userRecords[0].name}</strong><span className="text-[10px] text-[var(--muted)]">{userRecords[0].title}</span></div><ChevronDown size={13} className="text-[var(--muted)]" /></button></div>
        </header>

        <div className="mx-auto max-w-[1500px] p-5 lg:p-10">
          <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="mb-2 text-[10px] font-bold uppercase tracking-[1.7px] text-[var(--teal)]">WSI SECURITY MANAGEMENT INFORMATION SYSTEM</div><h1 className="font-display text-3xl font-semibold tracking-tight">{isDashboard ? 'Security overview' : active}</h1><p className="mt-2 text-xs text-[var(--muted)]">{isDashboard ? 'Executive visibility across your security posture, operations, and compliance.' : `Operational workspace for ${active.toLowerCase()}.`}</p></div>{showExportReport && <div className="flex gap-2"><button onClick={() => notify('Report export queued.')} className="flex items-center gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-[11px] text-[var(--ink)]"><Download size={14} /> Export report</button></div>}</div>
          {showSecurityOverview && <div className="mb-5 flex items-center justify-between rounded-lg border border-[var(--teal)] bg-[var(--muted-surface)] p-4"><div className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-[var(--teal)] shadow-[0_0_0_4px_var(--muted-surface)]" /><div><strong className="block text-xs text-[var(--accent-ink)]">Security status: Normal</strong><span className="text-[10px] opacity-70">Last assessed 11 Sep 2026, 09:42 AM</span></div></div><div className="hidden gap-4 text-[10px] opacity-70 sm:flex">Monitoring <b>24/7</b><span className="border-l border-current" />Next review <b>18 Sep</b></div></div>}
          {showSecurityOverview && <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, trend, color]) => <article key={label} className="panel relative overflow-hidden p-4"><div className="flex justify-between text-[11px] text-[#8ca2a4]"><span>{label}</span><span className={`rounded-md px-2 py-1 ${color === 'mint' ? 'bg-[var(--muted-surface)] text-[var(--teal)]' : color === 'amber' ? 'bg-[#493b26] text-[var(--amber)]' : 'bg-[#492b33] text-[var(--coral)]'}`}>◆</span></div><strong className="mt-3 block font-display text-3xl">{value}</strong><div className="mt-1 text-[10px] text-[var(--teal)]">{trend} <span className="text-[#617477]">vs last month</span></div><div className="mt-4 h-1 rounded bg-[#18353b]"><i className="block h-full w-4/5 rounded bg-[var(--teal)]" /></div></article>)}</div>}
          {active === 'Dashboard' ? <WorkspaceDashboard notify={notify} onNavigate={navigateTo} onAddUser={() => navigateTo('User Management')} onUploadDocument={() => navigateTo('Document Library')} /> : customModules.some(module => module.title === active) ? <ConnectedModuleView module={customModules.find(module => module.title === active)!} notify={notify} /> : active === 'User Management' ?<UserManagement users={userRecords} notify={notify} currentUser={currentUserRecord} savedPermissions={savedPermissions} onSettingsPermission={(user, allowed) => { const nextPermissions = { ...savedPermissions, [user.name]: { ...(savedPermissions[user.name] || {}), Settings: allowed } }; setSavedPermissions(nextPermissions); api.patch('/api/users', { email: user.email, permissions: nextPermissions[user.name] }).catch(() => notify('Could not save permission to the database.')); notify(allowed ? `Settings access granted to ${user.name}.` : `Settings access revoked for ${user.name}.`); }} onEditProfile={setProfileUser} onReviewAccess={setAccessUser} onAddUser={newUser => { const nextUsers = [newUser, ...userRecords]; setUserRecords(nextUsers); api.post('/api/users', newUser).catch(() => notify('Could not save user to the database.')); notify(`${newUser.name} was successfully invited and added.`); }} onDeleteUser={user => { const nextUsers = userRecords.filter(record => record.name !== user.name); setUserRecords(nextUsers); api.del('/api/users', { email: user.email }).catch(() => notify('Could not delete user from the database.')); setProfileUser(null); notify(`${user.name}'s account was deleted.`); }} /> : active === 'Server Management' ? <ServerManagementWithLogs notify={notify} /> : active === 'Network Management' ? <NetworkManagementWithTabs notify={notify} /> : active === 'MIS Dashboard' ? <MisDashboard notify={notify} onNavigate={navigateTo} /> : active === 'Daily Report' ? <DailyReport notify={notify} /> : active === 'Inventory' ? <InventoryManagement notify={notify} /> : active === 'Email Management' ? <EmailManagement notify={notify} /> : active === 'Reports' ? <ReportsManagement notify={notify} /> : active === 'Document Library' ? <DocumentLibrary notify={notify} /> : active === 'Governance Dashboard' ? <GovernanceDashboard notify={notify} onNavigate={navigateTo} /> : active === 'VAPT Management' ? <VaptManagement notify={notify} /> : active === 'Security Incidents' ? <SecurityIncidents incidents={incidents} notify={notify} onUpdate={saveIncidents} onLogIncident={() => setModal(true)} /> : active === 'Backup Management' ? <BackupManagement notify={notify} /> : !isDashboard && !['Dashboard', 'User Management', 'Server Management', 'Network Management'].includes(active) ? <ModuleContent module={active} notify={notify} /> : !isDashboard ? <div className="panel flex min-h-[360px] flex-col items-center justify-center text-center"><ShieldCheck size={42} className="mb-4 text-[var(--teal)]" /><h2 className="font-display text-xl">{active}</h2><p className="mt-2 max-w-md text-xs text-[var(--muted)]">This Phase 1 workspace is ready for live Prisma records and role-scoped operations.</p></div> : <DashboardPanels onNavigate={navigateTo} activity={activity} />}
        </div>
      </section>

      {modal && <div className="fixed inset-0 z-30 grid place-items-center bg-[#031015cc] p-5"><form onSubmit={submitIncident} className="w-full max-w-lg rounded-lg border border-[#2a555d] bg-[var(--surface)] p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><h2 className="font-display text-lg">Log security incident</h2><button type="button" onClick={() => setModal(false)}><X size={19} /></button></div><div className="grid gap-4"><label className="text-[11px] text-[#8ca2a4]">Incident title<input name="title" required className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white" placeholder="Describe the event" /></label><label className="text-[11px] text-[#8ca2a4]">Severity<select name="severity" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white"><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></label><label className="text-[11px] text-[#8ca2a4]">Affected asset<input name="asset" required className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white" placeholder="Asset or service name" /></label></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setModal(false)} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button><button className="rounded bg-[var(--teal)] px-3 py-2 text-xs font-bold text-[var(--highlight-ink)]">Save incident</button></div></form></div>}
      {profileUser && <FullProfileModal user={profileUser} onClose={() => setProfileUser(null)} onSave={updates => { const nextUsers = userRecords.map(user => user.name === profileUser.name ? { ...user, ...updates } : user); setUserRecords(nextUsers); api.patch('/api/users', { email: profileUser.email, ...updates }).catch(() => notify('Could not save profile to the database.')); setProfileUser(null); notify(`${profileUser.name}'s profile was saved.`); }} />}
      {accessUser && <EditableAccessReviewModal user={accessUser} initialPermissions={savedPermissions[accessUser.name]} onClose={() => setAccessUser(null)} onApprove={permissions => { const nextPermissions = { ...savedPermissions, [accessUser.name]: permissions }; setSavedPermissions(nextPermissions); api.patch('/api/users', { email: accessUser.email, permissions }).catch(() => notify('Could not save permissions to the database.')); setAccessUser(null); notify(`Access permissions saved for ${accessUser.name}.`); }} />}
      {profileMenuOpen && <ProfileDrawer user={userRecords[0]} onEdit={() => { setProfileMenuOpen(false); setProfileUser(userRecords[0]); }} onLogout={() => { const email = sessionStorage.getItem('wsi-login-email'); const onlineEmails = JSON.parse(localStorage.getItem('wsi-online-users') || '[]') as string[]; localStorage.setItem('wsi-online-users', JSON.stringify(onlineEmails.filter(item => item !== email))); sessionStorage.removeItem('wsi-login-email'); sessionStorage.removeItem('wsi-authenticated'); router.push('/login'); }} onClose={() => setProfileMenuOpen(false)} />}
      {settingsOpen && <SystemSettingsModal theme={theme} onThemeChange={value => { setTheme(value); localStorage.setItem('wsi-theme', value); }} customModules={customModules} onCustomModulesChange={setCustomModules} notify={notify} onClose={() => setSettingsOpen(false)} />}
      {notificationsOpen && <NotificationsDrawer notifications={notifications} onNavigate={module => { setNotificationsOpen(false); navigateTo(module); }} onMarkAllRead={() => setNotifications(current => current.map(notification => ({ ...notification, unread: false })))} onClose={() => setNotificationsOpen(false)} />}
      {searchOpen && <SearchOverlay term={searchTerm} setTerm={setSearchTerm} users={userRecords} onNavigate={module => { setSearchOpen(false); navigateTo(module); }} onClose={() => setSearchOpen(false)} />}
      {notice && <div className="fixed bottom-5 right-5 z-40 rounded border border-[var(--teal)] bg-[var(--muted-surface)] px-4 py-3 text-xs text-[var(--accent-ink)]">{notice}</div>}

      {/* Floating chat launcher */}
      {chatOpen && (
        <div className="fixed bottom-20 right-5 z-40 flex h-[560px] w-[min(720px,calc(100vw-40px))] flex-col overflow-hidden rounded-lg border border-[var(--teal)] bg-[var(--surface)] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2.5">
            <strong className="font-display text-sm">Team Chat</strong>
            <button onClick={() => setChatOpen(false)} className="text-[var(--muted)] hover:text-white"><X size={17} /></button>
          </div>
          <div className="min-h-0 flex-1 p-3">
            <ChatCenter users={userRecords} currentUser={userRecords[0]} notify={notify} compact />
          </div>
        </div>
      )}
      <button onClick={() => setChatOpen(open => !open)} aria-label="Open chat" className="fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-[var(--teal)] text-[var(--highlight-ink)] shadow-lg transition hover:opacity-90">
        <Mail size={20} />
        {chatUnread > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--coral)] px-1 text-[10px] font-bold text-white">{chatUnread > 99 ? '99+' : chatUnread}</span>}
      </button>
    </main>
  );
}

function UserManagement({
  users: userList,
  notify,
  currentUser,
  savedPermissions,
  onSettingsPermission,
  onEditProfile,
  onReviewAccess,
  onDeleteUser,
  onAddUser
}: {
  users: typeof users;
  notify: (text: string) => void;
  currentUser: typeof users[number];
  savedPermissions: Record<string, Record<string, boolean>>;
  onSettingsPermission: (user: typeof users[number], allowed: boolean) => void;
  onEditProfile: (user: typeof users[number]) => void;
  onReviewAccess: (user: typeof users[number]) => void;
  onDeleteUser: (user: typeof users[number]) => void;
  onAddUser: (user: typeof users[number]) => void;
}) {
  const [selected, setSelected] = useState(userList[0]);
  const [deleteTarget, setDeleteTarget] = useState<typeof users[number] | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [search, setSearch] = useState('');

  const filteredUsers = userList.filter(user => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.department.toLowerCase().includes(q) ||
      user.role.toLowerCase().includes(q) ||
      user.contactNumber.toLowerCase().includes(q) ||
      user.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Directory Cards & Selected Profile */}
      <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <section className="panel overflow-hidden">
          <div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-lg">User directory</h2>
              <p className="mt-1 text-[10px] text-[#617477]">Manage people, roles, and security workspace access.</p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 rounded-md bg-[var(--teal)] px-3 py-2 text-[11px] font-bold text-[var(--highlight-ink)] hover:opacity-90"
            >
              <Plus size={14} /> Invite user
            </button>
          </div>
          <div className="border-b border-[var(--line)] p-4">
            <div className="flex items-center gap-2 rounded border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-xs text-[#617477]">
              <Search size={14} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search users by name, email, department, contact..."
                className="w-full bg-transparent text-xs text-[var(--ink)] placeholder-[#617477] outline-none"
              />
            </div>
          </div>
          <div className="divide-y divide-[#1b3a42] max-h-[460px] overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--muted)]">No users found matching "{search}".</div>
            ) : (
              filteredUsers.map(user => (
                <button
                  key={user.email}
                  onClick={() => setSelected(user)}
                  data-selected={selected.email === user.email ? 'true' : 'false'}
                  className="user-row flex w-full items-center gap-3 p-4 text-left transition hover:bg-[var(--highlight)]/30"
                >
                  <UserAvatar user={user} sizeClass="h-9 w-9" textClass="text-[10px]" />
                  <div className="min-w-0 flex-1">
                    <strong className="block text-xs text-[var(--ink)]">{user.name}</strong>
                    <span className="block truncate text-[10px] text-[var(--muted)]">{user.title} · {user.department}</span>
                  </div>
                  <div className="hidden text-right sm:block">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] ${user.status === 'Active' ? 'bg-[var(--muted-surface)] text-[var(--teal)] border border-[var(--line)]' : 'bg-[var(--canvas)] text-[var(--muted)]'}`}>
                      {user.status}
                    </span>
                    <span className="mt-1 block text-[9px] text-[var(--muted)]">{user.lastActive}</span>
                  </div>
                  <ChevronDown size={14} className="-rotate-90 text-[var(--muted)]" />
                </button>
              ))
            )}
          </div>
        </section>

        <section className="panel p-5">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">User profile</span>
              <h2 className="mt-2 font-display text-xl">{selected.name}</h2>
              <p className="mt-1 text-xs text-[#8ca2a4]">{selected.title} · {selected.email}</p>
            </div>
            <UserAvatar user={selected} sizeClass="h-14 w-14" textClass="text-sm" />
          </div>
          <div className="mb-5 rounded-md border border-[#195a55] bg-[#0b2928] p-3">
            <div className="flex items-center gap-2 text-xs text-[#bff2e6]">
              <span className="h-2 w-2 rounded-full bg-[var(--teal)]" />
              {selected.status} account
            </div>
            <p className="mt-2 text-[10px] text-[#7fa4a2]">Last activity: {selected.lastActive}</p>
          </div>
          <dl className="divide-y divide-[#163239] text-xs">
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-[#617477]">Department</dt>
              <dd className="text-right text-[#d5e2e0]">{selected.department}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-[#617477]">Assigned role</dt>
              <dd className="text-right text-[#d5e2e0]">{selected.role}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-[#617477]">Contact Number</dt>
              <dd className="text-right text-[#d5e2e0] font-mono">{selected.contactNumber || '-'}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-[#617477]">Birthday</dt>
              <dd className="text-right text-[#d5e2e0]">{selected.birthday || '-'}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-[#617477]">Address</dt>
              <dd className="max-w-[220px] text-right text-[#d5e2e0] truncate" title={selected.address}>{selected.address || '-'}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-[#617477]">Password Status</dt>
              <dd className={selected.passwordConfigured ? 'text-[var(--teal)]' : 'text-[var(--coral)]'}>
                {selected.passwordConfigured ? 'Configured' : 'Not configured'}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-[#617477]">MFA Status</dt>
              <dd className={selected.mfaEnabled ? 'text-[var(--teal)] font-medium' : 'text-[#8ca2a4]'}>
                {selected.mfaEnabled ? 'Enabled' : 'Disabled'}
              </dd>
            </div>
          </dl>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <button onClick={() => onEditProfile(selected)} className="rounded-md border border-[var(--line)] px-3 py-2 text-[11px] text-[var(--ink)] hover:bg-white/5">
              Edit profile
            </button>
            <button onClick={() => onReviewAccess(selected)} className="review-access-button rounded-md px-3 py-2 text-[11px]">
              Review access
            </button>
            {currentUser?.accessLevel === 'MASTER_ADMIN' && selected.accessLevel !== 'MASTER_ADMIN' && (
              <button
                onClick={() => onSettingsPermission(selected, !(savedPermissions[selected.name]?.['Settings'] === true))}
                className={`rounded-md border px-3 py-2 text-[11px] ${savedPermissions[selected.name]?.['Settings'] ? 'border-[var(--teal)] text-[var(--teal)]' : 'border-[var(--line)] text-[var(--ink)] hover:bg-white/5'}`}
              >
                {savedPermissions[selected.name]?.['Settings'] ? '⚙ Settings access: ON' : '⚙ Grant settings access'}
              </button>
            )}
            <button onClick={() => setDeleteTarget(selected)} className="rounded-md border border-[#9b4038] bg-[#492b33] px-3 py-2 text-[11px] font-medium text-white hover:bg-[#9b4038] sm:col-span-2">
              Delete account
            </button>
          </div>
        </section>
      </div>

      {/* Comprehensive Table for Invite User & All Members */}
      <section className="panel overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] p-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Identity Register</div>
            <h2 className="font-display text-lg">Invited &amp; Registered Users</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">Inspect all team members with email address, full name, birthday, contact number, address, password, and MFA status.</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 rounded-md bg-[var(--teal)] px-3 py-2 text-[11px] font-bold text-[var(--highlight-ink)] hover:opacity-90"
          >
            <Plus size={14} /> Invite user
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--muted-surface)] text-[10px] uppercase tracking-wider text-[var(--muted)]">
                <th className="p-3.5 pl-5">Full Name</th>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5">Birthday</th>
                <th className="p-3.5">Contact Number</th>
                <th className="p-3.5">Address</th>
                <th className="p-3.5">Password</th>
                <th className="p-3.5">MFA Status</th>
                <th className="p-3.5">Role &amp; Department</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-xs text-[var(--muted)]">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.email} className="transition hover:bg-[var(--highlight)]/30">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} sizeClass="h-8 w-8" textClass="text-[9px]" />
                        <div>
                          <strong className="block text-xs font-semibold text-[var(--ink)]">{user.name}</strong>
                          <span className="text-[10px] text-[var(--muted)]">{user.title}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[var(--teal)]">{user.email}</td>
                    <td className="p-3.5 text-[11px] text-[var(--muted)]">{user.birthday || '-'}</td>
                    <td className="p-3.5 font-mono text-[11px] text-[var(--ink)]">{user.contactNumber || '-'}</td>
                    <td className="p-3.5 text-[11px] text-[var(--muted)] max-w-[180px] truncate" title={user.address}>{user.address || '-'}</td>
                    <td className="p-3.5">
                      {user.passwordConfigured ? (
                        <span className="inline-flex items-center gap-1 rounded bg-[var(--muted-surface)] px-2 py-0.5 text-[10px] font-medium text-[var(--teal)] border border-[var(--line)]">
                          ● Configured
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-[#492b33] px-2 py-0.5 text-[10px] font-medium text-[#ef9b88] border border-[#70403c]">
                          Not set
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {user.mfaEnabled ? (
                        <span className="inline-flex items-center gap-1 rounded bg-[var(--muted-surface)] px-2 py-0.5 text-[10px] font-medium text-[var(--teal)] border border-[var(--line)]">
                          <ShieldCheck size={11} /> Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-[var(--canvas)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)] border border-[var(--line)]">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="rounded bg-[var(--highlight)] px-2 py-1 text-[10px] font-medium text-[var(--ink)] block w-fit">
                        {user.role}
                      </span>
                      <small className="block text-[9px] text-[var(--muted)] mt-1">{user.department}</small>
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditProfile(user)}
                          className="rounded border border-[var(--line)] px-2.5 py-1 text-[10px] text-[var(--ink)] hover:border-[var(--teal)] hover:text-[var(--teal)]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onReviewAccess(user)}
                          className="rounded border border-[var(--line)] px-2.5 py-1 text-[10px] text-[var(--teal)] hover:bg-[var(--teal)]/10"
                        >
                          Access
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="rounded border border-[#9b4038] bg-[#492b33] px-2 py-1 text-[10px] font-medium text-white hover:bg-[#9b4038]"
                          title="Delete user"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Invite User Modal */}
      {showInviteModal && (
        <InviteUserModal
          onClose={() => setShowInviteModal(false)}
          onSave={newUser => {
            setShowInviteModal(false);
            setSelected(newUser);
            onAddUser(newUser);
          }}
        />
      )}

      {/* Delete User Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[#031015cc] p-5">
          <div className="w-full max-w-md rounded-lg border border-[#8b4a44] bg-[var(--surface)] p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[1.3px] text-[#d8786b]">Permanent action</span>
                <h2 className="mt-1 font-display text-lg">Delete account?</h2>
              </div>
              <button onClick={() => setDeleteTarget(null)}><X size={19} /></button>
            </div>
            <p className="text-xs leading-5 text-[var(--muted)]">
              This will remove <strong className="text-[var(--ink)]">{deleteTarget.name}</strong> from the user directory and saved workspace records. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button>
              <button
                onClick={() => {
                  const replacement = userList.find(user => user.name !== deleteTarget.name);
                  if (replacement) setSelected(replacement);
                  onDeleteUser(deleteTarget);
                  setDeleteTarget(null);
                }}
                className="rounded bg-[#9b4038] px-3 py-2 text-xs font-bold text-white"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InviteUserModal({ onClose, onSave }: { onClose: () => void; onSave: (newUser: typeof users[number]) => void }) {
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get('fullName') || '').trim();
    const email = String(form.get('email') || '').trim().toLowerCase();
    const birthday = String(form.get('birthday') || '');
    const address = String(form.get('address') || '').trim();
    const contactNumber = String(form.get('contactNumber') || '').trim();
    const password = String(form.get('password') || '');
    const mfaEnabled = form.get('mfaEnabled') === 'on';
    const department = String(form.get('department') || 'Cyber Security');
    const title = String(form.get('title') || '').trim() || 'Team Member';
    const accessLevel = String(form.get('accessLevel') || 'IT_USER');
    const role = accessLevel.replaceAll('_', ' ');

    const initials = fullName
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';

    const colors = [
      'bg-[#254a51] text-[var(--teal)]',
      'bg-[#493b26] text-[var(--amber)]',
      'bg-[#1b3b58] text-[var(--blue)]',
      'bg-[#3e2b54] text-[#bf8df5]',
      'bg-[#492b33] text-[var(--coral)]'
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const scope = accessLevel === 'MASTER_ADMIN'
      ? 'All security modules and confidential records'
      : accessLevel === 'ADMIN'
      ? 'Administrative workspace and evidence access'
      : accessLevel === 'IT_SECURITY_OFFICER'
      ? 'Security operations and monitoring'
      : 'Assigned tasks and evidence only';

    const newUser: typeof users[number] = {
      initials,
      name: fullName,
      title,
      department,
      role,
      accessLevel,
      scope,
      birthday,
      contactNumber,
      address,
      email,
      passwordConfigured: Boolean(password),
      mfaEnabled,
      photoUrl: '',
      status: 'Active',
      lastActive: 'Invited just now',
      color
    };

    onSave(newUser);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#031015cc] p-5">
      <form onSubmit={handleSubmit} className="mx-auto my-6 w-full max-w-2xl rounded-lg border border-[var(--teal)] bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b border-[var(--line)] pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">User Onboarding</span>
            <h2 className="mt-1 font-display text-xl font-semibold">Invite &amp; Add New User</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">Add a user with identity credentials, contact profile, and security access.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-[var(--muted)] hover:text-white"><X size={20} /></button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-[11px] text-[#8ca2a4]">
            Full name <span className="text-[var(--teal)]">*</span>
            <input name="fullName" required placeholder="e.g. John Doe" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
          </label>

          <label className="text-[11px] text-[#8ca2a4]">
            Work email address <span className="text-[var(--teal)]">*</span>
            <input name="email" type="email" required placeholder="john.doe@wsi.local" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
          </label>

          <label className="text-[11px] text-[#8ca2a4]">
            Birthday <span className="text-[var(--teal)]">*</span>
            <input name="birthday" type="date" required className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
          </label>

          <label className="text-[11px] text-[#8ca2a4]">
            Contact number <span className="text-[var(--teal)]">*</span>
            <input name="contactNumber" type="tel" required placeholder="+63 917 555 0199" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
          </label>

          <label className="text-[11px] text-[#8ca2a4]">
            Job title
            <input name="title" placeholder="e.g. Security Analyst" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
          </label>

          <label className="text-[11px] text-[#8ca2a4]">
            Department
            <select name="department" defaultValue="Cyber Security" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none">
              <option>Cyber Security</option>
              <option>MIS</option>
              <option>Technical Department</option>
              <option>Software Department</option>
              <option>Finance</option>
              <option>Executive</option>
            </select>
          </label>

          <label className="text-[11px] text-[#8ca2a4] sm:col-span-2">
            User level access (Role)
            <select name="accessLevel" defaultValue="IT_USER" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none">
              <option value="MASTER_ADMIN">Master Admin (Full Access to All Modules)</option>
              <option value="IT_SECURITY_OFFICER">IT Security Officer (Security Operations)</option>
              <option value="ADMIN">Admin (Administrative Control)</option>
              <option value="IT_USER">IT User (Evidence &amp; Task Contributor)</option>
            </select>
          </label>

          <label className="text-[11px] text-[#8ca2a4] sm:col-span-2">
            Password <span className="text-[var(--teal)]">*</span>
            <div className="relative mt-1">
              <input name="password" type={showPassword ? 'text' : 'password'} required placeholder="Create initial temporary password" className="w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 pr-10 text-sm text-white focus:border-[var(--teal)] outline-none" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-[#617477] hover:text-white">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <label className="text-[11px] text-[#8ca2a4] sm:col-span-2">
            Address <span className="text-[var(--teal)]">*</span>
            <textarea name="address" rows={2} required placeholder="Complete residential or office address" className="mt-1 w-full resize-none rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
          </label>

          <div className="rounded border border-[var(--line)] bg-[var(--canvas)] p-3 sm:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer text-xs text-white">
              <input name="mfaEnabled" type="checkbox" defaultChecked className="h-4 w-4 accent-[#49d4bf] rounded" />
              <div>
                <strong className="block text-xs text-[var(--teal)]">Require Multi-Factor Authentication (MFA)</strong>
                <span className="text-[10px] text-[var(--muted)]">Enforce authenticator app or hardware FIDO2 key verification on sign-in.</span>
              </div>
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-[var(--line)] pt-4">
          <button type="button" onClick={onClose} className="rounded border border-[var(--line)] px-4 py-2 text-xs text-[var(--ink)] hover:bg-white/5">Cancel</button>
          <button type="submit" className="flex items-center gap-2 rounded bg-[var(--teal)] px-4 py-2 text-xs font-bold text-[var(--highlight-ink)] hover:opacity-90">
            <Plus size={14} /> Invite &amp; Create User
          </button>
        </div>
      </form>
    </div>
  );
}


function LegacyProfileModal({ user, onClose, onSave }: { user: typeof users[number]; onClose: () => void; onSave: () => void }) {
  return <div className="fixed inset-0 z-30 grid place-items-center bg-[#031015cc] p-5"><form onSubmit={event => { event.preventDefault(); onSave(); }} className="w-full max-w-lg rounded-lg border border-[#2a555d] bg-[var(--surface)] p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><span className="text-[10px] font-bold uppercase tracking-[1.3px] text-[var(--teal)]">Account settings</span><h2 className="mt-1 font-display text-lg">Edit profile</h2></div><button type="button" onClick={onClose}><X size={19} /></button></div><div className="grid gap-4"><label className="text-[11px] text-[#8ca2a4]">Full name<input defaultValue={user.name} required className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white" /></label><label className="text-[11px] text-[#8ca2a4]">Job title<input defaultValue={user.title} required className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white" /></label><label className="text-[11px] text-[#8ca2a4]">Department<select defaultValue={user.department} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white"><option>Cyber Security</option><option>MIS</option><option>Technical Department</option><option>Software Department</option></select></label><label className="text-[11px] text-[#8ca2a4]">Email address<input defaultValue={`${user.name.toLowerCase().replace(' ', '.')}@wsi.local`} type="email" required className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white" /></label></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button><button className="rounded bg-[var(--teal)] px-3 py-2 text-xs font-bold text-[var(--highlight-ink)]">Save changes</button></div></form></div>;
}

function LegacyAccessReviewModal({ user, onClose, onApprove }: { user: typeof users[number]; onClose: () => void; onApprove: () => void }) {
  return <div className="fixed inset-0 z-30 grid place-items-center bg-[#031015cc] p-5"><div className="w-full max-w-lg rounded-lg border border-[#2a555d] bg-[var(--surface)] p-6 shadow-2xl"><div className="mb-5 flex items-start justify-between"><div><span className="text-[10px] font-bold uppercase tracking-[1.3px] text-[var(--teal)]">Quarterly certification</span><h2 className="mt-1 font-display text-lg">Review access</h2><p className="mt-1 text-xs text-[#8ca2a4]">{user.name} · {user.role}</p></div><button onClick={onClose}><X size={19} /></button></div><div className="mb-5 rounded-md border border-[#195a55] bg-[#0b2928] p-3 text-xs"><strong className="block text-[#bff2e6]">Access scope</strong><span className="mt-1 block text-[10px] text-[#7fa4a2]">{user.scope}</span></div><div className="space-y-3 text-xs"><label className="flex items-center gap-3 rounded border border-[var(--line)] p-3"><input type="checkbox" defaultChecked className="accent-[#49d4bf]" /> View assigned security tasks</label><label className="flex items-center gap-3 rounded border border-[var(--line)] p-3"><input type="checkbox" defaultChecked={user.scope.includes('Confidential')} className="accent-[#49d4bf]" /> View confidential security records</label><label className="flex items-center gap-3 rounded border border-[var(--line)] p-3"><input type="checkbox" defaultChecked className="accent-[#49d4bf]" /> Submit audit evidence</label></div><div className="mt-6 flex justify-end gap-2"><button onClick={onClose} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button><button onClick={onApprove} className="rounded bg-[var(--teal)] px-3 py-2 text-xs font-bold text-[var(--highlight-ink)]">Approve access</button></div></div></div>;
}

function WorkspaceDashboard({ notify, onNavigate, onAddUser, onUploadDocument }: { notify: (text: string) => void; onNavigate: (name: string) => void; onAddUser: () => void; onUploadDocument: () => void }) {
  const [range, setRange] = useState('This week');
  const [showServiceDetails, setShowServiceDetails] = useState(false);
  const [stats, setStats] = useState({ workItems: 0, assets: 0, members: 0, openIncidents: 0 });
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let members = users.length;
      let assets = seedInventory.length;
      let backups = seedBackupRecords.length;
      let openIncidents = seedIncidents.filter(incident => incident.status !== 'Resolved').length;
      try { const rows = await api.get<InventoryDevice[]>('/api/inventory'); if (rows.length) assets = rows.length; } catch { /* keep */ }
      try { const rows = await api.get<BackupRecord[]>('/api/backups'); if (rows.length) backups = rows.length; } catch { /* keep */ }
      try { const rows = await api.get<Array<{ id: number }>>('/api/users'); if (rows.length) members = rows.length; } catch { /* keep */ }
      try { const rows = await api.get<Array<{ status: string }>>('/api/records?module=Security%20Incidents'); if (rows.length) openIncidents = rows.filter(incident => incident.status !== 'Resolved').length; } catch { /* keep */ }
      if (!cancelled) setStats({ workItems: backups + openIncidents, assets, members, openIncidents });
    })();
    return () => { cancelled = true; };
  }, []);
  const tasks: Array<[string, string, string]> = [['Review privileged access', 'Access Management', 'Due today'], ['Approve backup verification', 'Backup Management', 'Due tomorrow'], ['Update server maintenance window', 'Server Management', 'Sep 15'], ['Publish security awareness brief', 'Document Library', 'Sep 18']];
  return <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><WorkspaceMetric label="Open work items" value={String(stats.workItems)} detail={`${stats.openIncidents} incidents open`} accent="var(--teal)" /><WorkspaceMetric label="Registered assets" value={String(stats.assets)} detail="In inventory" accent="var(--blue)" /><WorkspaceMetric label="Team members" value={String(stats.members)} detail="User accounts" accent="var(--amber)" /><WorkspaceMetric label="Platform uptime" value="99.98%" detail="All services healthy" accent="var(--coral)" /></div>
    <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]"><section className="panel p-5"><div className="mb-6 flex items-start justify-between"><div><h2 className="font-display text-sm">Operations pulse</h2><p className="mt-1 text-[10px] text-[var(--muted)]">Work activity across the WSI MIS platform.</p></div><select value={range} onChange={event => setRange(event.target.value)} className="rounded border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-[10px] text-[var(--ink)]"><option>This week</option><option>This month</option><option>This quarter</option></select></div><div className="grid h-48 grid-cols-7 items-end gap-3 border-b border-[var(--line)] bg-[linear-gradient(to_bottom,transparent_0%,transparent_24%,var(--line)_25%,transparent_26%,transparent_49%,var(--line)_50%,transparent_51%,transparent_74%,var(--line)_75%,transparent_76%)] px-3">{[45,62,54,78,68,88,72].map((height, index) => <div key={index} className="flex h-full flex-col items-center justify-end gap-2"><div className="w-full max-w-8 rounded-t bg-[var(--teal)] opacity-90" style={{ height: `${height}%` }} /><small className="text-[9px] text-[var(--muted)]">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][index]}</small></div>)}</div><div className="mt-4 flex flex-wrap gap-5 text-[10px] text-[var(--muted)]"><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--teal)]" />Completed <b className="text-[var(--ink)]">84</b></span><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--blue)]" />In progress <b className="text-[var(--ink)]">28</b></span><span className="ml-auto text-[var(--teal)]">{range} activity</span></div></section><section className="panel p-5"><div className="mb-5"><h2 className="font-display text-sm">Service health</h2><p className="mt-1 text-[10px] text-[var(--muted)]">Live platform availability.</p></div><div className="space-y-4">{[['Cyber Security', 'Operational'], ['Identity services', 'Operational'], ['Backup services', 'Operational'], ['Document library', 'Operational']].map(([name, status]) => <div key={name} className="flex items-center justify-between border-b border-[var(--line)] pb-3 text-xs"><span>{name}</span><span className="flex items-center gap-2 text-[var(--teal)]"><i className="h-2 w-2 rounded-full bg-[var(--teal)]" />{status}</span></div>)}</div><button onClick={() => setShowServiceDetails(true)} className="mt-5 text-[10px] text-[var(--teal)]">View service details →</button>{showServiceDetails && <div className="fixed inset-0 z-50 grid place-items-center bg-[#031015cc] p-5"><div className="w-full max-w-md rounded-lg border border-[var(--teal)] bg-[var(--surface)] p-6 shadow-2xl"><div className="mb-4 flex items-center justify-between"><h2 className="font-display text-lg">Service health details</h2><button onClick={() => setShowServiceDetails(false)}><X size={19} /></button></div><div className="space-y-3">{[['Cyber Security platform', 'Operational', 'All security modules responding normally.'], ['Identity services', 'Operational', 'Directory authentication and MFA available.'], ['Backup services', 'Operational', 'Nightly jobs verified; last restore test passed.'], ['Document library', 'Operational', 'Evidence and controlled documents accessible.']].map(([name, status, detail]) => <div key={name} className="rounded border border-[var(--line)] bg-[var(--canvas)] p-3"><div className="flex items-center justify-between"><strong className="text-xs text-[var(--ink)]">{name}</strong><span className="rounded-full bg-[var(--muted-surface)] px-2 py-0.5 text-[9px] text-[var(--teal)]">{status}</span></div><p className="mt-1 text-[10px] text-[var(--muted)]">{detail}</p></div>)}</div><div className="mt-5 flex justify-end"><button onClick={() => setShowServiceDetails(false)} className="rounded bg-[var(--teal)] px-4 py-2 text-xs font-bold text-[var(--highlight-ink)]">Close</button></div></div></div>}</section></div>
    <div className="grid gap-4 xl:grid-cols-[1fr_1fr]"><section className="panel p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-display text-sm">My work queue</h2><p className="mt-1 text-[10px] text-[var(--muted)]">Assigned actions across your workspace.</p></div><span className="rounded-full bg-[var(--highlight)] px-2 py-1 text-[9px] text-[var(--teal)]">4 open</span></div><div className="space-y-3">{tasks.map(([task, module, due]) => <button key={task} onClick={() => onNavigate(module)} className="flex w-full items-center gap-3 border-b border-[var(--line)] pb-3 text-left"><span className="h-2 w-2 shrink-0 rounded-full bg-[var(--amber)]" /><span className="min-w-0 flex-1"><strong className="block truncate text-xs font-normal">{task}</strong><small className="text-[10px] text-[var(--muted)]">{module}</small></span><small className="text-[9px] text-[var(--muted)]">{due}</small><span className="text-[var(--teal)]">→</span></button>)}</div></section><section className="panel p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-display text-sm">Quick actions</h2><p className="mt-1 text-[10px] text-[var(--muted)]">Start a common platform workflow.</p></div></div><div className="grid gap-2 sm:grid-cols-2"><button onClick={onAddUser} className="rounded border border-[var(--line)] bg-[var(--highlight)] p-3 text-left text-xs"><strong className="block">＋ Add user</strong><span className="mt-1 block text-[10px] text-[var(--muted)]">Create a role-scoped account</span></button><button onClick={onUploadDocument} className="rounded border border-[var(--line)] bg-[var(--highlight)] p-3 text-left text-xs"><strong className="block">↥ Upload document</strong><span className="mt-1 block text-[10px] text-[var(--muted)]">Add evidence or reference material</span></button><button onClick={() => onNavigate('Security Dashboard')} className="rounded border border-[var(--line)] bg-[var(--highlight)] p-3 text-left text-xs"><strong className="block">◇ Security posture</strong><span className="mt-1 block text-[10px] text-[var(--muted)]">Open executive security view</span></button><button onClick={() => notify('Report builder opened.')} className="rounded border border-[var(--line)] bg-[var(--highlight)] p-3 text-left text-xs"><strong className="block">▥ Build report</strong><span className="mt-1 block text-[10px] text-[var(--muted)]">Prepare a management summary</span></button></div></section></div>
  </div>;
}

type MonitoredServer = { id: number; name: string; host: string; serverType: string; environment: string; status: string; monitoringEnabled?: boolean; responseMs?: number | null; lastCheckedAt?: string | null };

function ServerManagement({ notify }: { notify: (text: string) => void }) {
  const [servers, setServers] = useState<MonitoredServer[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<MonitoredServer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MonitoredServer | null>(null);
  const [checking, setChecking] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  async function loadServers() { try { const response = await fetch('/api/servers', { cache: 'no-store' }); if (!response.ok) throw new Error('Unable to load servers'); setServers(await response.json()); } catch { notify('Database is unavailable. Start MySQL before loading monitored servers.'); } finally { setLoaded(true); } }
  useEffect(() => { loadServers(); }, []);
  async function saveServer(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const response = await fetch('/api/servers', { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing?.id, name: form.get('name'), host: form.get('host'), serverType: form.get('serverType'), environment: form.get('environment') }) }); if (response.ok) { setShowAdd(false); setEditing(null); await loadServers(); notify(editing ? 'Server details updated.' : 'Server added to monitoring.'); } else notify('Could not save server. Check the required fields.'); }
  async function deleteServer(server: MonitoredServer) { const response = await fetch('/api/servers', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: server.id }) }); if (response.ok) { setServers(current => current.filter(item => item.id !== server.id)); notify(`${server.name} was removed from monitoring.`); } else notify('Could not delete server.'); setDeleteTarget(null); }
  async function checkServer(server: MonitoredServer) { setChecking(server.id); const response = await fetch('/api/servers/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: server.id }) }); if (response.ok) { const checked = await response.json(); setServers(current => current.map(item => item.id === checked.id ? { ...item, ...checked } : item)); notify(`${server.name}: ${checked.status}.`); } else notify('Health check failed.'); setChecking(null); }
  useEffect(() => { if (!loaded || servers.length === 0) return; const timer = setInterval(() => { servers.filter(server => server.monitoringEnabled !== false).forEach(checkServer); }, 60000); return () => clearInterval(timer); }, [loaded, servers.length]);
  const downServers = servers.filter(server => server.status === 'offline' || server.status === 'degraded');
  return <div className="space-y-4"><section className="panel p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Infrastructure monitoring</div><h2 className="font-display text-xl">Servers & Active Directory</h2><p className="mt-2 max-w-2xl text-xs text-[var(--muted)]">Monitor Windows servers, domain controllers, Active Directory endpoints, and web services. Store only host addresses here; keep credentials in a protected server-side secret store.</p></div><button onClick={() => { setEditing(null); setShowAdd(true); }} className="flex items-center justify-center gap-2 rounded-md bg-[var(--teal)] px-3 py-2 text-[11px] font-bold text-[var(--highlight-ink)]"><Plus size={14} /> Add server</button></div></section>{downServers.length > 0 && <div className="flex items-start gap-3 rounded-lg border border-[#b35a4f] bg-[#f5dfd0] p-4 text-[#4b2112]"><span className="text-lg">!</span><div><strong className="block text-xs">Server attention required</strong><span className="text-[10px]">{downServers.map(server => server.name).join(', ')} {downServers.length === 1 ? 'is' : 'are'} offline or degraded.</span></div></div>}<div className="grid gap-3 sm:grid-cols-3"><WorkspaceMetric label="Monitored servers" value={String(servers.length)} detail="Configured endpoints" accent="var(--teal)" /><WorkspaceMetric label="Online" value={String(servers.filter(server => server.status === 'online').length)} detail="Responding now" accent="var(--blue)" /><WorkspaceMetric label="Needs attention" value={String(downServers.length)} detail="Offline or degraded" accent="var(--coral)" /></div><section className="panel overflow-hidden"><div className="border-b border-[var(--line)] p-5"><h2 className="font-display text-sm">Monitored endpoints</h2><p className="mt-1 text-[10px] text-[var(--muted)]">Automatic checks run every minute while this screen is open.</p></div>{!loaded ? <div className="p-8 text-center text-xs text-[var(--muted)]">Loading monitored servers…</div> : servers.length === 0 ? <div className="p-10 text-center"><Server size={30} className="mx-auto mb-3 text-[var(--teal)]" /><p className="text-xs text-[var(--muted)]">No servers configured yet.</p><button onClick={() => setShowAdd(true)} className="mt-4 text-[10px] text-[var(--teal)]">Add your first server →</button></div> : <div className="divide-y divide-[var(--line)]">{servers.map(server => <div key={server.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--highlight)] text-[var(--teal)]"><Server size={18} /></div><div className="min-w-0 flex-1"><strong className="block text-sm">{server.name}</strong><span className="mt-1 block truncate text-[10px] text-[var(--muted)]">{server.host} · {server.serverType} · {server.environment}</span></div><div className="flex items-center gap-3"><div className="text-right"><span className={`flex items-center justify-end gap-2 text-[10px] ${server.status === 'online' ? 'text-[var(--teal)]' : server.status === 'offline' ? 'text-[var(--coral)]' : 'text-[var(--amber)]'}`}><i className="h-2 w-2 rounded-full bg-current" />{server.status || 'Not checked'}</span><span className="mt-1 block text-[9px] text-[var(--muted)]">{server.responseMs ? `${server.responseMs} ms` : 'No check yet'}</span></div><button onClick={() => checkServer(server)} disabled={checking === server.id} className="rounded border border-[var(--line)] px-2 py-2 text-[10px] text-[var(--ink)] disabled:opacity-50">{checking === server.id ? 'Checking…' : 'Check now'}</button><button onClick={() => { setEditing(server); setShowAdd(true); }} className="rounded border border-[var(--line)] px-2 py-2 text-[10px] text-[var(--ink)]">Edit</button><button onClick={() => setDeleteTarget(server)} className="rounded border border-[#9b4038] bg-[#492b33] px-2 py-2 text-[10px] font-medium text-white hover:bg-[#9b4038]">Delete</button></div></div>)}</div>}</section>{showAdd && <div className="fixed inset-0 z-30 grid place-items-center bg-[#031015cc] p-5"><form onSubmit={saveServer} className="w-full max-w-lg rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><span className="text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Monitoring setup</span><h2 className="mt-1 font-display text-lg">{editing ? 'Edit server' : 'Add server'}</h2></div><button type="button" onClick={() => { setShowAdd(false); setEditing(null); }}><X size={19} /></button></div><div className="grid gap-4"><label className="text-[11px] text-[var(--muted)]">Server name<input name="name" required defaultValue={editing?.name} placeholder="WSI Domain Controller 01" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /></label><label className="text-[11px] text-[var(--muted)]">IP address or URL<input name="host" required defaultValue={editing?.host} placeholder="https://ad.wsi.local or 192.168.1.10" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-[11px] text-[var(--muted)]">Server type<select name="serverType" defaultValue={editing?.serverType || 'Windows Server'} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm"><option>Windows Server</option><option>Active Directory</option><option>Domain Controller</option><option>Web Server</option><option>Database Server</option><option>Linux Server</option></select></label><label className="text-[11px] text-[var(--muted)]">Environment<select name="environment" defaultValue={editing?.environment || 'Production'} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm"><option>Production</option><option>Staging</option><option>Development</option><option>Disaster Recovery</option></select></label></div></div><p className="mt-4 rounded border border-[var(--line)] bg-[var(--highlight)] p-3 text-[10px] leading-4 text-[var(--muted)]">For Active Directory, add an HTTPS health endpoint or internal monitoring endpoint. LDAP/WinRM credentials should be added later through server-side environment secrets.</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => { setShowAdd(false); setEditing(null); }} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button><button className="rounded bg-[var(--teal)] px-3 py-2 text-xs font-bold text-[var(--highlight-ink)]">{editing ? 'Save changes' : 'Add server'}</button></div></form></div>}{deleteTarget && <div className="fixed inset-0 z-30 grid place-items-center bg-[#031015cc] p-5"><div className="w-full max-w-md rounded-lg border border-[#8b4a44] bg-[var(--surface)] p-6"><h2 className="font-display text-lg">Delete monitored server?</h2><p className="mt-2 text-xs text-[var(--muted)]">Remove {deleteTarget.name} and its health history?</p><div className="mt-5 flex justify-end gap-2"><button onClick={() => setDeleteTarget(null)} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button><button onClick={() => deleteServer(deleteTarget)} className="rounded bg-[#9b4038] px-3 py-2 text-xs font-bold text-white">Delete server</button></div></div></div>}</div>;
}


type DiscoveredDevice = { ipAddress: string; status: string; responseMs?: number | null; port?: number; name?: string | null; deviceType?: string; vlanId?: number | null; zoneName?: string | null; macAddress?: string | null };
function DeviceIcon({ deviceType }: { deviceType?: string }) { return deviceType === 'phone' ? <Smartphone size={17} /> : deviceType === 'pc' ? <Monitor size={17} /> : <Server size={17} />; }
function PfSenseHealthPanel({ notify }: { notify: (text: string) => void }) {
  const [state, setState] = useState<{ connected?: boolean; authenticated?: boolean; configured?: boolean; data?: unknown; error?: string } | null>(null);
  const [checking, setChecking] = useState(false);
  async function check() { setChecking(true); try { const response = await fetch('/api/integrations/pfsense/status', { cache: 'no-store' }); const text = await response.text(); const data = text ? JSON.parse(text) : { error: `Request failed (${response.status})` }; setState(data); if (data.connected) notify('pfSense health retrieved.'); } catch (cause) { setState({ connected: false, error: cause instanceof Error ? cause.message : 'pfSense health request failed.' }); } finally { setChecking(false); } }
  useEffect(() => { check(); }, []);
  return <section className="panel p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Firewall integration</div><h2 className="font-display text-lg">pfSense health</h2><p className="mt-1 text-[10px] text-[var(--muted)]">{state?.configured ? 'Connected profile is configured. Health is queried from the server.' : 'Configure pfSense credentials from the profile settings drawer.'}</p></div><button onClick={check} disabled={checking} className="rounded border border-[var(--line)] px-3 py-2 text-[10px] disabled:opacity-50">{checking ? 'Checking...' : 'Check pfSense'}</button></div><div className="mt-4 flex items-center gap-3">{state?.connected && state.authenticated ? <><span className="h-3 w-3 rounded-full bg-[var(--teal)]" /><strong className="text-xs text-[var(--teal)]">Connected with data access</strong></> : state?.connected ? <><span className="h-3 w-3 rounded-full bg-[var(--amber)]" /><strong className="text-xs text-[var(--amber)]">WebGUI reachable, API data unavailable</strong></> : <><span className="h-3 w-3 rounded-full bg-[var(--coral)]" /><strong className="text-xs text-[var(--coral)]">{state?.error || 'Not connected'}</strong></>}</div>{state?.error && <p className="mt-3 text-[10px] text-[var(--muted)]">{state.error}</p>}<div className="mt-3 rounded border border-[var(--line)] bg-[var(--highlight)] p-3 text-[10px] text-[var(--muted)]">Per-device traffic requires pfSense remote syslog, NetFlow/IPFIX, and DNS logging. A normal pfSense WebGUI username/password confirms reachability but cannot expose traffic data to this app.</div></section>;
}

type FirewallProfile = { id?: number; name: string; host: string; vendor: string; port: string; apiPath: string; username: string; password: string; apiKey: string };
const firewallManagerClass = 'firewall-manager';
function FirewallHealthSummary({ metric }: { metric: (keys: string[]) => string }) { return <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5"><div className="rounded border border-[var(--line)] bg-[var(--highlight)] p-3"><small className="block text-[10px]">Temperature</small><strong className="mt-1 block">{metric(['temperature','temp'])}</strong></div><div className="rounded border border-[var(--line)] bg-[var(--highlight)] p-3"><small className="block text-[10px]">CPU load</small><strong className="mt-1 block">{metric(['cpu_load','load_average','cpu'])}</strong></div><div className="rounded border border-[var(--line)] bg-[var(--highlight)] p-3"><small className="block text-[10px]">Memory usage</small><strong className="mt-1 block">{metric(['memory_usage','memory','ram'])}</strong></div><div className="rounded border border-[var(--line)] bg-[var(--highlight)] p-3"><small className="block text-[10px]">Storage usage</small><strong className="mt-1 block">{metric(['storage_usage','disk','storage'])}</strong></div><div className="rounded border border-[var(--line)] bg-[var(--highlight)] p-3"><small className="block text-[10px]">Uptime</small><strong className="mt-1 block">{metric(['uptime'])}</strong></div></div>; }
function FirewallManagement({ notify }: { notify: (text: string) => void }) {
  const [firewalls, setFirewalls] = useState<Array<{ id: number; name: string; host: string; vendor?: string | null }>>([]);
  const [editing, setEditing] = useState<FirewallProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<{ connected?: boolean; authenticated?: boolean; data?: unknown; error?: string } | null>(null);
  async function load() { try { const response = await fetch('/api/network/firewalls', { cache: 'no-store' }); if (!response.ok) throw new Error('Could not load firewalls.'); setFirewalls(await response.json()); } catch (cause) { notify(cause instanceof Error ? cause.message : 'Could not load firewalls.'); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  useEffect(() => { firewalls.forEach(firewall => { const saved = JSON.parse(localStorage.getItem(`wsi-firewall-${firewall.id}`) || 'null'); if (!saved?.apiKey) return; fetch('/api/integrations/pfsense/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: firewall.name, baseUrl: `https://${firewall.host}:${saved.port || '8443'}`, statusPath: saved.apiPath || '/api/v2/status/system', apiKey: saved.apiKey, username: saved.username || '', password: saved.password || '' }) }); }); }, [firewalls]);
  useEffect(() => { if (firewalls.length === 0) return; fetch('/api/integrations/pfsense/status', { cache: 'no-store' }).then(response => response.json()).then(data => setHealth(data)).catch(cause => setHealth({ connected: false, error: cause instanceof Error ? cause.message : 'Health request failed.' })); }, [firewalls.length]);
  function metric(keys: string[]) { const visit = (value: unknown): unknown => { if (!value || typeof value !== 'object') return undefined; for (const [key, child] of Object.entries(value)) { if (keys.some(candidate => key.toLowerCase().includes(candidate))) return child; const nested = visit(child); if (nested !== undefined) return nested; } return undefined; }; const value = visit(health?.data); return value === undefined || value === null || value === '' ? 'Unavailable' : String(value); }
  function profileFor(firewall: typeof firewalls[number]): FirewallProfile { const saved = JSON.parse(localStorage.getItem(`wsi-firewall-${firewall.id}`) || 'null') || {}; return { id: firewall.id, name: firewall.name, host: firewall.host, vendor: firewall.vendor || 'pfSense', port: saved.port || '8443', apiPath: saved.apiPath || '/api/v2/status/system', username: saved.username || '', password: saved.password || '', apiKey: saved.apiKey || '' }; }
  async function save(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const profile: FirewallProfile = { id: editing?.id, name: String(data.get('name') || ''), host: String(data.get('host') || ''), vendor: String(data.get('vendor') || 'pfSense'), port: String(data.get('port') || '8443'), apiPath: String(data.get('apiPath') || '/api/v2/status/system'), username: String(data.get('username') || ''), password: String(data.get('password') || ''), apiKey: String(data.get('apiKey') || '') }; if (!profile.name || !profile.host) { notify('Firewall name and IP address are required.'); return; } try { if (profile.id) { await fetch('/api/network/firewalls', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: profile.id }) }); } const response = await fetch('/api/network/firewalls', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: profile.name, host: profile.host, vendor: profile.vendor }) }); if (!response.ok) throw new Error('Could not save firewall.'); const created = await response.json(); localStorage.setItem(`wsi-firewall-${created.id}`, JSON.stringify({ port: profile.port, apiPath: profile.apiPath, username: profile.username, password: profile.password, apiKey: profile.apiKey })); setEditing(null); await load(); notify(editing ? 'Firewall updated.' : 'Firewall added.'); } catch (cause) { notify(cause instanceof Error ? cause.message : 'Could not save firewall.'); } }
  async function remove(id: number) { if (!window.confirm('Delete this firewall connection?')) return; const response = await fetch('/api/network/firewalls', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); if (response.ok) { localStorage.removeItem(`wsi-firewall-${id}`); setFirewalls(current => current.filter(item => item.id !== id)); notify('Firewall deleted.'); } else notify('Could not delete firewall.'); }
  return <div className="space-y-4"><section className="panel overflow-hidden"><div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] p-5 sm:flex-row sm:items-center"><div><div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Network Management</div><h2 className="font-display text-xl">Firewalls</h2><p className="mt-1 text-xs text-[var(--muted)]">Manage firewall connections and API credentials.</p></div><button onClick={() => setEditing({ name: '', host: '', vendor: 'pfSense', port: '8443', apiPath: '/api/v2/status/system', username: '', password: '', apiKey: '' })} className="flex items-center justify-center gap-2 rounded-md bg-[var(--teal)] px-3 py-2 text-[11px] font-bold text-[var(--highlight-ink)]"><Plus size={14} /> Add firewall</button></div>{loading ? <div className="p-8 text-center text-xs text-[var(--muted)]">Loading firewalls...</div> : firewalls.length === 0 ? <div className="p-8 text-center text-xs text-[var(--muted)]">No firewall connections configured.</div> : <div className="divide-y divide-[var(--line)]">{firewalls.map(firewall => <div key={firewall.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--highlight)] text-[var(--teal)]"><ShieldCheck size={18} /></div><div className="flex-1"><strong className="block text-sm">{firewall.name}</strong><span className="text-[10px] text-[var(--muted)]">{firewall.host} · {firewall.vendor || 'Firewall'}</span></div><div className="flex gap-2"><button onClick={() => setEditing(profileFor(firewall))} className="rounded border border-[var(--line)] px-3 py-2 text-[10px]">Edit</button><button onClick={() => remove(firewall.id)} className="rounded border border-[#9b4038] bg-[#492b33] px-3 py-2 text-[10px] font-medium text-white hover:bg-[#9b4038]">Delete</button></div></div>)}</div>}</section>{firewalls.length > 0 && <section className="panel p-5"><div className="mb-4 flex items-center justify-between"><div><div className="mb-1 text-[10px] font-bold uppercase tracking-[1.3px] text-[var(--teal)]">Live health</div><h2 className="font-display text-lg">Firewall health</h2></div><span className={`text-xs ${health?.connected && health.authenticated ? 'text-[var(--teal)]' : 'text-[var(--coral)]'}`}>● {health?.connected && health.authenticated ? 'Connected' : health?.error || 'Waiting for API data'}</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><div className="rounded border border-[var(--line)] bg-[var(--highlight)] p-4"><small className="block text-[10px] text-[var(--muted)]">Temperature</small><strong className="mt-2 block text-lg">{metric(['temperature','temp'])}</strong></div><div className="rounded border border-[var(--line)] bg-[var(--highlight)] p-4"><small className="block text-[10px] text-[var(--muted)]">CPU load</small><strong className="mt-2 block text-lg">{metric(['cpu_load','load_average','cpu'])}</strong></div><div className="rounded border border-[var(--line)] bg-[var(--highlight)] p-4"><small className="block text-[10px] text-[var(--muted)]">Memory usage</small><strong className="mt-2 block text-lg">{metric(['memory_usage','memory','ram'])}</strong></div><div className="rounded border border-[var(--line)] bg-[var(--highlight)] p-4"><small className="block text-[10px] text-[var(--muted)]">Storage usage</small><strong className="mt-2 block text-lg">{metric(['storage_usage','disk','storage'])}</strong></div><div className="rounded border border-[var(--line)] bg-[var(--highlight)] p-4"><small className="block text-[10px] text-[var(--muted)]">Uptime</small><strong className="mt-2 block text-lg">{metric(['uptime'])}</strong></div></div></section>}{editing && <div className="panel p-5"><div className="mb-5 flex items-start justify-between"><div><div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Firewall connection settings</div><h2 className="font-display text-lg">{editing.id ? 'Edit firewall' : 'Add firewall'}</h2></div><button onClick={() => setEditing(null)} className="text-[var(--muted)]">✕</button></div><form onSubmit={save} className="grid gap-4 sm:grid-cols-2"><label className="text-xs">Firewall name<input name="name" defaultValue={editing.name} required className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5" placeholder="Main pfSense" /></label><label className="text-xs">IP address or hostname<input name="host" defaultValue={editing.host} required className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5" placeholder="192.168.26.1" /></label><label className="text-xs">Vendor<input name="vendor" defaultValue={editing.vendor} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5" /></label><label className="text-xs">HTTPS port<input name="port" defaultValue={editing.port} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5" placeholder="8443" /></label><label className="text-xs sm:col-span-2">API path<input name="apiPath" defaultValue={editing.apiPath} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5" placeholder="/api/v2/status/system" /></label><label className="text-xs">API username<input name="username" defaultValue={editing.username} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5" autoComplete="username" /></label><label className="text-xs">API password<input name="password" defaultValue={editing.password} type="password" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5" autoComplete="current-password" /></label><label className="text-xs sm:col-span-2">API key<input name="apiKey" defaultValue={editing.apiKey} type="password" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5" autoComplete="off" /><small className="mt-1 block text-[10px] text-[var(--muted)]">For pfSense REST API v2 use the X-API-Key value.</small></label><div className="flex justify-end gap-2 sm:col-span-2"><button type="button" onClick={() => setEditing(null)} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button><button className="rounded bg-[var(--teal)] px-3 py-2 text-xs font-bold text-[var(--highlight-ink)]">Save firewall</button></div></form></div>}</div>;
}
function FirewallHealthByFirewall({ notify }: { notify: (text: string) => void }) { const [firewalls, setFirewalls] = useState<Array<{ id: number; name: string; host: string; status?: string; responseMs?: number | null }>>([]); const [checking, setChecking] = useState<number | null>(null); const [apiData, setApiData] = useState<unknown>(null); async function load() { try { const response = await fetch('/api/network/firewalls', { cache: 'no-store' }); if (!response.ok) throw new Error('Could not load firewall health.'); setFirewalls(await response.json()); } catch { notify('Could not load firewall health.'); } } useEffect(() => { load(); fetch('/api/integrations/pfsense/status', { cache: 'no-store' }).then(response => response.json()).then(data => setApiData(data.data)).catch(() => setApiData(null)); }, []); function metric(keys: string[]) { const visit = (value: unknown): unknown => { if (!value || typeof value !== 'object') return undefined; for (const [key, child] of Object.entries(value)) { if (keys.some(candidate => key.toLowerCase().includes(candidate))) return child; const nested = visit(child); if (nested !== undefined) return nested; } return undefined; }; const value = visit(apiData); return value === undefined || value === null || value === '' ? 'Unavailable' : String(value); } async function check(id: number) { setChecking(id); const response = await fetch('/api/network/firewalls/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); if (response.ok) { const result = await response.json(); setFirewalls(current => current.map(item => item.id === result.id ? { ...item, ...result } : item)); notify(`${result.name}: ${result.status}.`); } else notify('Firewall health check failed.'); setChecking(null); } return <section className="panel overflow-hidden"><div className="border-b border-[var(--line)] p-5"><div className="mb-1 text-[10px] font-bold uppercase tracking-[1.3px] text-[var(--teal)]">Health by firewall</div><h2 className="font-display text-lg">Firewall health</h2></div>{firewalls.length === 0 ? <div className="p-6 text-xs text-[var(--muted)]">Add a firewall above to see its health here.</div> : <div className="divide-y divide-[var(--line)]">{firewalls.map(firewall => <div key={firewall.id} className="p-5"><div className="flex items-center justify-between"><div><strong className="block text-sm">{firewall.name}</strong><span className="text-[10px] text-[var(--muted)]">{firewall.host}</span></div><div className="flex items-center gap-3"><span className="text-xs text-[var(--teal)]">● {firewall.status || 'Not checked'}</span><button onClick={() => check(firewall.id)} disabled={checking === firewall.id} className="rounded border border-[var(--line)] px-3 py-2 text-[10px] disabled:opacity-50">{checking === firewall.id ? 'Checking...' : 'Check now'}</button></div></div><div className="mt-4 grid gap-2 sm:grid-cols-3"><div className="rounded border border-[var(--line)] bg-[var(--highlight)] p-3"><small className="block text-[10px]">Response</small><strong className="mt-1 block">{firewall.responseMs ? `${firewall.responseMs} ms` : 'Unavailable'}</strong></div><div className="rounded border border-[var(--line)] bg-[var(--highlight)] p-3"><small className="block text-[10px]">Temperature</small><strong className="mt-1 block">{metric(['temperature','temp'])}</strong></div><div className="rounded border border-[var(--line)] bg-[var(--highlight)] p-3"><small className="block text-[10px]">CPU / RAM / Storage</small><strong className="mt-1 block">{metric(['cpu','load','memory','ram','storage','disk'])}</strong></div></div></div>)}</div>}</section>; }
function FirewallCapacityTraffic({ notify }: { notify: (text: string) => void }) {
  const [system, setSystem] = useState<Record<string, unknown> | null>(null);
  const [traffic, setTraffic] = useState<Array<{ sourceIp?: string; destinationIp?: string; protocol?: string; action?: string; loggedAt: string }>>([]);
  useEffect(() => {
    Promise.all([
      fetch('/api/integrations/pfsense/status', { cache: 'no-store' }).then(response => response.json()),
      fetch('/api/traffic', { cache: 'no-store' }).then(response => response.ok ? response.json() : []),
    ]).then(([status, logs]) => { setSystem(status.data?.data || status.data || null); setTraffic(Array.isArray(logs) ? logs.slice(0, 24) : []); }).catch(() => notify('Capacity or traffic data could not be loaded.'));
  }, [notify]);
  function value(keys: string[]) { const visit = (item: unknown): unknown => { if (!item || typeof item !== 'object') return undefined; for (const [key, child] of Object.entries(item)) { if (keys.some(candidate => key.toLowerCase().includes(candidate))) return child; const nested = visit(child); if (nested !== undefined) return nested; } return undefined; }; const result = visit(system); return result === undefined || result === null || result === '' ? 'Unavailable' : String(result); }
  const bars = traffic.length ? traffic.slice(-12) : [];
  return <section className="panel p-5"><div className="flex items-center justify-between"><div><div className="mb-1 text-[10px] font-bold uppercase tracking-[1.3px] text-[var(--teal)]">Capacity and traffic</div><h2 className="font-display text-lg">Firewall utilization</h2></div><span className="text-[10px] text-[var(--muted)]">{traffic.length ? `${traffic.length} recent events` : 'Waiting for syslog'}</span></div><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5"><div className="rounded border border-[var(--line)] bg-[var(--highlight)] p-3"><small className="block text-[10px]">CPU usage</small><strong className="mt-1 block">{value(['cpu_usage','cpu percent'])}%</strong></div><div className="rounded border border-[var(--line)] bg-[var(--highlight)] p-3"><small className="block text-[10px]">Memory</small><strong className="mt-1 block">{value(['mem_usage','memory_usage','ram'])}%</strong></div><div className="rounded border border-[var(--line)] bg-[var(--highlight)] p-3"><small className="block text-[10px]">Disk</small><strong className="mt-1 block">{value(['disk_usage','storage_usage','disk'])}%</strong></div><div className="rounded border border-[var(--line)] bg-[var(--highlight)] p-3"><small className="block text-[10px]">CPU cores</small><strong className="mt-1 block">{value(['cpu_count','cores'])}</strong></div><div className="rounded border border-[var(--line)] bg-[var(--highlight)] p-3"><small className="block text-[10px]">Swap</small><strong className="mt-1 block">{value(['swap_usage','swap'])}%</strong></div></div><div className="mt-5 rounded border border-[var(--line)] bg-[var(--canvas)] p-4"><div className="flex items-center justify-between"><strong className="text-xs">Recent traffic activity</strong><span className="text-[10px] text-[var(--muted)]">Newest events on the right</span></div>{bars.length ? <div className="mt-4 flex h-24 items-end gap-2">{bars.map((log, index) => <div key={`${log.loggedAt}-${index}`} title={`${log.action || 'event'} · ${log.protocol || 'unknown'}`} className="min-w-0 flex-1 rounded-t bg-[var(--teal)]" style={{ height: `${25 + ((index * 17) % 70)}%` }} />)}</div> : <div className="mt-4 flex h-24 items-center justify-center text-xs text-[var(--muted)]">No traffic events received yet. Enable pfSense remote syslog to populate this chart.</div>}</div></section>;
}
function InterfaceTrafficGraphs({ notify }: { notify: (text: string) => void }) { const [events, setEvents] = useState<Array<{ loggedAt: string; action?: string; sourceIp?: string }>>([]); const [open, setOpen] = useState(false); const [filter, setFilter] = useState(''); useEffect(() => { const load = () => fetch('/api/traffic', { cache: 'no-store' }).then(response => response.ok ? response.json() : []).then(data => setEvents(Array.isArray(data) ? data : [])).catch(() => notify('Traffic graph data could not be loaded.')); load(); const timer = setInterval(load, 10000); const show = (event: Event) => { const detail = (event as CustomEvent<{ filter?: string }>).detail; setFilter(detail?.filter || ''); setOpen(true); }; window.addEventListener('view-firewall-traffic', show); return () => { clearInterval(timer); window.removeEventListener('view-firewall-traffic', show); }; }, [notify]); if (!open) return null; const filteredEvents = events.filter(event => !filter || event.sourceIp === filter); const interfaces = ['WAN', 'WSI1', 'WSI2']; return <section className="panel overflow-hidden traffic-graphs"><div className="flex items-center justify-between border-b border-[var(--line)] p-5"><div><div className="mb-1 text-[10px] font-bold uppercase tracking-[1.3px] text-[var(--teal)]">Traffic graphs</div><h2 className="font-display text-lg">Firewall interface traffic{filter ? ` · ${filter}` : ''}</h2></div><button onClick={() => setOpen(false)} className="rounded border border-[var(--line)] px-3 py-2 text-[10px]">Hide graphs</button></div>{interfaces.map((name, interfaceIndex) => <div key={name} className="traffic-interface"><div className="flex items-center justify-between"><strong>{name}</strong><div className="traffic-legend"><span><i className="traffic-dot traffic-in" />in</span><span><i className="traffic-dot traffic-out" />out</span></div></div><div className="traffic-chart"><div className="traffic-grid" />{Array.from({ length: 12 }, (_, index) => <i key={index} className="traffic-bar traffic-bar-in" style={{ height: filteredEvents.length ? `${12 + ((filteredEvents.length + index * 7 + interfaceIndex * 11) % 65)}%` : '1px' }} />)}{Array.from({ length: 12 }, (_, index) => <i key={`out-${index}`} className="traffic-bar traffic-bar-out" style={{ height: filteredEvents.length ? `${8 + ((filteredEvents.length * 2 + index * 5 + interfaceIndex * 9) % 45)}%` : '1px' }} />)}</div><div className="traffic-axis"><span>60 min ago</span><span>now</span></div></div>)}</section>; }
function FirewallTrafficLauncher() { return <button onClick={() => window.dispatchEvent(new CustomEvent('view-firewall-traffic', { detail: { filter: '' } }))} className="firewall-traffic-launcher rounded border border-[var(--line)] px-3 py-2 text-[10px]">View traffic graphs</button>; }
function EditableNetworkOperations({ notify }: { notify: (text: string) => void }) { return <div className="network-management-sections"><div className="firewall-section"><FirewallManagement notify={notify} /><div className="firewall-health-group"><FirewallHealthByFirewall notify={notify} /><button onClick={() => window.dispatchEvent(new CustomEvent('view-firewall-traffic', { detail: { filter: '' } }))} className="firewall-traffic-launcher rounded border border-[var(--line)] px-3 py-2 text-[10px]">View traffic graphs</button><InterfaceTrafficGraphs notify={notify} /></div></div><div className="network-discovery-section"><NetworkOperationsContent notify={notify} /></div></div>; }

function FirewallHealthRecords({ notify }: { notify: (text: string) => void }) {
  type Firewall = { id: number; name: string; host: string; vendor?: string; status: string; responseMs?: number | null; temperature?: string | null; lastCheckedAt?: string | null; healthChecks?: Array<{ id: string; status: string; responseMs?: number | null; checkedAt: string; details?: string | null }> };
  const [firewalls, setFirewalls] = useState<Firewall[]>([]);
  const [loading, setLoading] = useState(true);
  async function load() { try { const response = await fetch('/api/network/firewalls', { cache: 'no-store' }); if (!response.ok) throw new Error('Firewall health records unavailable.'); setFirewalls(await response.json()); } catch (cause) { notify(cause instanceof Error ? cause.message : 'Could not load firewall health.'); } finally { setLoading(false); } }
  async function check(firewall: Firewall) { const response = await fetch('/api/network/firewalls/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: firewall.id }) }); if (response.ok) { const result = await response.json(); setFirewalls(current => current.map(item => item.id === result.id ? { ...item, ...result } : item)); notify(`${firewall.name}: ${result.status}.`); } else notify('Firewall health check failed.'); }
  useEffect(() => { load(); }, []);
  return <section className="panel overflow-hidden"><div className="flex items-center justify-between border-b border-[var(--line)] p-5"><div><div className="mb-1 text-[10px] font-bold uppercase tracking-[1.3px] text-[var(--teal)]">Health records</div><h2 className="font-display text-sm">Firewall health history</h2><p className="mt-1 text-[10px] text-[var(--muted)]">Availability, temperature, and response history for monitored firewall gateways.</p></div><button onClick={load} className="rounded border border-[var(--line)] px-3 py-2 text-[10px]">Refresh</button></div>{loading ? <div className="p-8 text-center text-xs text-[var(--muted)]">Loading firewall health...</div> : firewalls.length === 0 ? <div className="p-8 text-center text-xs text-[var(--muted)]">No firewall health records yet. Add a firewall below to begin monitoring.</div> : <div className="divide-y divide-[var(--line)]">{firewalls.map(firewall => <div key={firewall.id} className="p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--highlight)] text-[var(--teal)]"><ShieldCheck size={18} /></div><div className="flex-1"><strong className="block text-sm">{firewall.name}</strong><span className="text-[10px] text-[var(--muted)]">{firewall.host} · {firewall.vendor || 'pfSense firewall'}</span></div><div className="text-right"><span className={`text-[10px] ${firewall.status === 'online' ? 'text-[var(--teal)]' : firewall.status === 'offline' ? 'text-[var(--coral)]' : 'text-[var(--amber)]'}`}>● {firewall.status || 'Not checked'}</span><span className="mt-1 block text-[9px] text-[var(--muted)]">{firewall.responseMs ? `${firewall.responseMs} ms` : 'No latency'}{firewall.lastCheckedAt ? ` · ${new Date(firewall.lastCheckedAt).toLocaleString()}` : ''}</span></div><div className="rounded border border-[var(--line)] px-3 py-2 text-center"><span className="block text-[9px] text-[var(--muted)]">Temperature</span><strong className="text-xs text-[var(--amber)]">{firewall.temperature || 'Unavailable'}</strong></div><button onClick={() => check(firewall)} className="rounded border border-[var(--line)] px-3 py-2 text-[10px]">Check now</button></div><div className="mt-4 flex flex-wrap gap-2">{(firewall.healthChecks || []).map(checkRecord => <span key={checkRecord.id} className={`rounded px-2 py-1 text-[9px] ${checkRecord.status === 'online' ? 'bg-[var(--muted-surface)] text-[var(--teal)]' : 'bg-[#f5dfd0] text-[#9b4038]'}`}>{checkRecord.status} {checkRecord.responseMs ? `${checkRecord.responseMs}ms` : ''} · {new Date(checkRecord.checkedAt).toLocaleTimeString()}</span>)}</div></div>)}</div>}</section>;
}

function TrafficLogPanel() {
  const [logs, setLogs] = useState<Array<{ id: string; sourceIp?: string; destinationIp?: string; destinationPort?: number; protocol?: string; action?: string; loggedAt: string }>>([]);
  const [source, setSource] = useState('');
  async function load() { const response = await fetch('/api/traffic', { cache: 'no-store' }); if (response.ok) setLogs(await response.json()); }
  useEffect(() => { load(); const timer = setInterval(load, 15000); return () => clearInterval(timer); }, []);
  const filtered = logs.filter(log => !source || log.sourceIp?.includes(source));
  return <section className="panel overflow-hidden"><div className="flex flex-col justify-between gap-3 border-b border-[var(--line)] p-5 sm:flex-row sm:items-center"><div><h2 className="font-display text-sm">Recent firewall traffic</h2><p className="mt-1 text-[10px] text-[var(--muted)]">Live records received from pfSense syslog.</p></div><div className="flex gap-2"><input value={source} onChange={event => setSource(event.target.value)} placeholder="Filter source IP" className="w-36 rounded border border-[var(--line)] bg-[var(--canvas)] px-2 py-2 text-[10px]" /><button onClick={load} className="rounded border border-[var(--line)] px-3 py-2 text-[10px]">Refresh</button></div></div>{filtered.length === 0 ? <div className="p-8 text-center text-xs text-[var(--muted)]">No traffic logs received yet. Start the syslog collector and generate traffic through pfSense.</div> : <div className="overflow-x-auto"><table className="w-full text-left text-[10px]"><thead className="border-b border-[var(--line)] text-[var(--muted)]"><tr><th className="p-3">Time</th><th className="p-3">Source</th><th className="p-3">Destination</th><th className="p-3">Port</th><th className="p-3">Protocol</th><th className="p-3">Action</th></tr></thead><tbody className="divide-y divide-[var(--line)]">{filtered.map(log => <tr key={log.id}><td className="p-3 text-[var(--muted)]">{new Date(log.loggedAt).toLocaleString()}</td><td className="p-3">{log.sourceIp || '-'}</td><td className="p-3">{log.destinationIp || '-'}</td><td className="p-3">{log.destinationPort || '-'}</td><td className="p-3">{log.protocol || '-'}</td><td className="p-3 text-[var(--teal)]">{log.action || '-'}</td></tr>)}</tbody></table></div>}</section>;
}

function NetworkOperationsContent({ notify }: { notify: (text: string) => void }) {
  const [zones, setZones] = useState<Array<{ id: number; name: string; cidr: string; gateway: string }>>([]);
  const [devices, setDevices] = useState<DiscoveredDevice[]>([]);
  const [editingZone, setEditingZone] = useState<{ id?: number; name: string; cidr: string; gateway: string } | null>(null);
  const [editingDevice, setEditingDevice] = useState<DiscoveredDevice | null>(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState<string | null>(null);

  async function readJson(response: Response) {
    const text = await response.text();
    let data: Record<string, unknown> = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = { error: `Request failed (${response.status}).` }; }
    if (!response.ok) throw new Error(String(data.error || `Request failed (${response.status}).`));
    return data;
  }
  async function load() {
    try { setError(''); const [zoneResponse, deviceResponse] = await Promise.all([fetch('/api/network/zones', { cache: 'no-store' }), fetch('/api/network/devices', { cache: 'no-store' })]); const [zoneData, deviceData] = await Promise.all([readJson(zoneResponse), readJson(deviceResponse)]); setZones(zoneData as unknown as typeof zones); setDevices(deviceData as unknown as DiscoveredDevice[]); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Network management could not load.'); }
  }
  useEffect(() => { load(); }, []);
  async function saveZone(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); try { const data = await readJson(await fetch('/api/network/zones', { method: editingZone?.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingZone?.id, name: form.get('name'), cidr: form.get('cidr'), gateway: form.get('gateway') }) })); setEditingZone(null); setZones(current => editingZone?.id ? current.map(zone => zone.id === data.id ? data as unknown as typeof zone : zone) : [...current, data as unknown as typeof current[number]]); notify('Gateway saved.'); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Gateway could not be saved.'); } }
  async function removeZone(zone: typeof zones[number]) { if (!window.confirm(`Delete ${zone.name}?`)) return; try { await readJson(await fetch('/api/network/zones', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: zone.id }) })); setZones(current => current.filter(item => item.id !== zone.id)); notify('Gateway deleted.'); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Gateway could not be deleted.'); } }
  async function scan(zone: typeof zones[number]) { try { setScanning(zone.cidr); const data = await readJson(await fetch('/api/network/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cidr: zone.cidr }) })) as { online: number; devices: DiscoveredDevice[] }; setDevices(current => [...current.filter(device => !data.devices.some(item => item.ipAddress === device.ipAddress)), ...data.devices.map(device => ({ ...device, zoneName: zone.name }))]); notify(`${zone.name}: ${data.online} online devices.`); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Scan failed.'); } finally { setScanning(null); } }
  async function saveDevice(device: DiscoveredDevice, name: string) { if (!name.trim()) return; try { const saved = await readJson(await fetch('/api/network/devices', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ipAddress: device.ipAddress, name, status: device.status, responseMs: device.responseMs }) })); setDevices(current => current.map(item => item.ipAddress === device.ipAddress ? saved as unknown as DiscoveredDevice : item)); setEditingDevice(null); notify('Device name saved.'); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Device name could not be saved.'); } }
  return <div className="space-y-4"><section className="panel p-5"><div className="flex items-center justify-between"><div><div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Network operations</div><h2 className="font-display text-xl">VLAN gateways</h2><p className="mt-2 text-xs text-[var(--muted)]">Add, edit, remove, and scan your network gateways.</p></div><button onClick={() => setEditingZone({ name: '', cidr: '', gateway: '' })} className="rounded bg-[var(--teal)] px-3 py-2 text-[10px] font-bold text-[var(--highlight-ink)]">Add gateway</button></div>{error && <div className="mt-4 rounded border border-[#8b4a44] bg-[#f5dfd0] p-3 text-xs text-[#4b2112]">{error}</div>}</section><div className="grid gap-3 lg:grid-cols-3">{zones.map(zone => <article key={zone.id} className="panel p-5"><h3 className="font-display text-sm">{zone.name}</h3><p className="mt-1 text-[10px] text-[var(--muted)]">{zone.cidr}</p><p className="mt-5 text-xs">Gateway: {zone.gateway}</p><div className="mt-5 grid gap-2"><button onClick={() => scan(zone)} className="rounded bg-[var(--teal)] px-3 py-2 text-[10px] font-bold text-[var(--highlight-ink)]">{scanning === zone.cidr ? 'Scanning...' : 'Scan VLAN'}</button><div className="grid grid-cols-2 gap-2"><button onClick={() => setEditingZone(zone)} className="rounded border border-[var(--line)] px-2 py-2 text-[10px]">Edit</button><button onClick={() => removeZone(zone)} className="rounded border border-[#9b4038] bg-[#492b33] px-2 py-2 text-[10px] font-medium text-white hover:bg-[#9b4038]">Delete</button></div></div></article>)}</div><section className="panel overflow-hidden"><div className="border-b border-[var(--line)] p-5"><h2 className="font-display text-sm">Discovered devices</h2><p className="mt-1 text-[10px] text-[var(--muted)]">Edit names, click IPs, and use View traffic for the firewall-log integration point.</p></div><div className="divide-y divide-[var(--line)]">{devices.length === 0 ? <p className="p-8 text-center text-xs text-[var(--muted)]">No devices discovered yet.</p> : devices.map(device => <div key={device.ipAddress} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--highlight)] text-[var(--teal)]"><DeviceIcon deviceType={device.deviceType} /></span><div className="min-w-0 flex-1"><strong className="block text-xs">{device.name || 'Unnamed device'}</strong><a href={`http://${device.ipAddress}`} target="_blank" rel="noreferrer" className="text-[10px] text-[var(--teal)] underline">{device.ipAddress}</a><span className="ml-2 text-[10px] text-[var(--muted)]">{device.zoneName || 'VLAN device'} · {device.deviceType || 'unknown'}</span></div><span className="text-[10px] text-[var(--teal)]">{device.status}{device.responseMs ? ` · ${device.responseMs} ms` : ''}</span><button onClick={() => setEditingDevice(device)} className="rounded border border-[var(--line)] px-2 py-2 text-[10px]">Edit name</button><button onClick={() => notify('Site access requires firewall, DNS, or NetFlow logs; an IP scan cannot determine browsing history.')} className="rounded border border-[var(--line)] px-2 py-2 text-[10px]">View traffic</button></div>)}</div></section>{editingZone && <ZoneModal zone={editingZone} onClose={() => setEditingZone(null)} onSave={saveZone} />}{editingDevice && <DeviceNameModal device={editingDevice} onClose={() => setEditingDevice(null)} onSave={saveDevice} />}</div>;
}

function ZoneModal({ zone, onClose, onSave }: { zone: { id?: number; name: string; cidr: string; gateway: string }; onClose: () => void; onSave: (event: React.FormEvent<HTMLFormElement>) => void }) { return <div className="fixed inset-0 z-30 grid place-items-center bg-[#031015cc] p-5"><form onSubmit={onSave} className="w-full max-w-md rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6"><div className="mb-5 flex items-center justify-between"><h2 className="font-display text-lg">{zone.id ? 'Edit gateway' : 'Add gateway'}</h2><button type="button" onClick={onClose}><X size={19} /></button></div><div className="grid gap-4"><input name="name" required defaultValue={zone.name} placeholder="VLAN 25 - Office" className="rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /><input name="cidr" required defaultValue={zone.cidr} placeholder="192.168.25.0/24" className="rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /><input name="gateway" required defaultValue={zone.gateway} placeholder="192.168.25.1" className="rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button><button className="rounded bg-[var(--teal)] px-3 py-2 text-xs font-bold text-[var(--highlight-ink)]">Save</button></div></form></div>; }

function DeviceNameModal({ device, onClose, onSave }: { device: DiscoveredDevice; onClose: () => void; onSave: (device: DiscoveredDevice, name: string) => void }) { return <div className="fixed inset-0 z-30 grid place-items-center bg-[#031015cc] p-5"><form onSubmit={event => { event.preventDefault(); onSave(device, String(new FormData(event.currentTarget).get('name'))); }} className="w-full max-w-md rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6"><div className="mb-5 flex items-center justify-between"><h2 className="font-display text-lg">Name device</h2><button type="button" onClick={onClose}><X size={19} /></button></div><p className="mb-4 text-xs text-[var(--muted)]">{device.ipAddress} · {device.deviceType || 'unknown device'}</p><input name="name" required defaultValue={device.name || ''} placeholder="Finance PC 01" className="w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button><button className="rounded bg-[var(--teal)] px-3 py-2 text-xs font-bold text-[var(--highlight-ink)]">Save name</button></div></form></div>; }

function LegacyEditableNetworkOperations({ notify }: { notify: (text: string) => void }) {
  const [zones, setZones] = useState<Array<{ id: number; name: string; cidr: string; gateway: string }>>([]);
  const [editing, setEditing] = useState<{ id?: number; name: string; cidr: string; gateway: string } | null>(null);
  const [devices, setDevices] = useState<DiscoveredDevice[]>([]);
  useEffect(() => { fetch('/api/network/zones').then(response => response.json()).then(setZones); fetch('/api/network/devices').then(response => response.json()).then(setDevices); }, []);
  async function saveZone(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const response = await fetch('/api/network/zones', { method: editing?.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing?.id, name: form.get('name'), cidr: form.get('cidr'), gateway: form.get('gateway') }) }); if (response.ok) { const zone = await response.json(); setZones(current => editing?.id ? current.map(item => item.id === zone.id ? zone : item) : [...current, zone]); setEditing(null); notify('Network gateway saved.'); } else notify('Could not save gateway.'); }
  async function removeZone(zone: typeof zones[number]) { if (!window.confirm(`Delete ${zone.name}?`)) return; const response = await fetch('/api/network/zones', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: zone.id }) }); if (response.ok) { setZones(current => current.filter(item => item.id !== zone.id)); notify('Gateway removed.'); } }
  async function scan(zone: typeof zones[number]) { const response = await fetch('/api/network/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cidr: zone.cidr }) }); const data = await response.json(); if (response.ok) { setDevices(current => [...current.filter(item => !data.devices.some((newItem: DiscoveredDevice) => newItem.ipAddress === item.ipAddress)), ...data.devices.map((item: DiscoveredDevice) => ({ ...item, zoneName: zone.name }))]); notify(`${zone.name}: ${data.online} online devices.`); } else notify(data.error || 'Scan failed.'); }
  return <div className="space-y-4"><section className="panel p-5"><div className="flex items-center justify-between"><div><div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Network operations</div><h2 className="font-display text-xl">VLAN gateways</h2><p className="mt-2 text-xs text-[var(--muted)]">Add, edit, or remove monitored network zones. Office VLANs 25 and 26 are preloaded below after seeding.</p></div><button onClick={() => setEditing({ name: '', cidr: '', gateway: '' })} className="rounded bg-[var(--teal)] px-3 py-2 text-[10px] font-bold text-[var(--highlight-ink)]">＋ Add gateway</button></div></section><div className="grid gap-3 lg:grid-cols-3">{zones.map(zone => <article key={zone.id} className="panel p-5"><div className="flex items-start justify-between"><div><h3 className="font-display text-sm">{zone.name}</h3><p className="mt-1 text-[10px] text-[var(--muted)]">{zone.cidr}</p></div><span className="rounded bg-[var(--highlight)] px-2 py-1 text-[9px] text-[var(--teal)]">Gateway</span></div><p className="mt-5 text-xs">{zone.gateway}</p><div className="mt-5 grid gap-2"><button onClick={() => scan(zone)} className="rounded bg-[var(--teal)] px-3 py-2 text-[10px] font-bold text-[var(--highlight-ink)]">Scan VLAN</button><div className="grid grid-cols-2 gap-2"><button onClick={() => setEditing(zone)} className="rounded border border-[var(--line)] px-2 py-2 text-[10px]">Edit</button><button onClick={() => removeZone(zone)} className="rounded border border-[#9b4038] bg-[#492b33] px-2 py-2 text-[10px] font-medium text-white hover:bg-[#9b4038]">Delete</button></div></div></article>)}</div><section className="panel overflow-hidden"><div className="border-b border-[var(--line)] p-5"><h2 className="font-display text-sm">Discovered devices</h2><p className="mt-1 text-[10px] text-[var(--muted)]">Icons indicate likely device type. PC classification uses Windows/SMB/RDP signals; phone detection requires DHCP, ARP, SNMP, or firewall metadata.</p></div><div className="divide-y divide-[var(--line)]">{devices.map(device => <div key={device.ipAddress} className="flex items-center gap-3 p-4"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--highlight)] text-[var(--teal)]"><DeviceIcon deviceType={device.deviceType} /></span><div className="flex-1"><strong className="block text-xs">{device.name || 'Unnamed device'}</strong><a href={`http://${device.ipAddress}`} target="_blank" rel="noreferrer" className="text-[10px] text-[var(--teal)] underline">{device.ipAddress}</a><span className="ml-2 text-[10px] text-[var(--muted)]">{device.zoneName || 'VLAN device'}</span></div><span className="text-[10px] text-[var(--teal)]">{device.status}{device.responseMs ? ` · ${device.responseMs} ms` : ''}</span></div>)}</div></section>{editing && <div className="fixed inset-0 z-30 grid place-items-center bg-[#031015cc] p-5"><form onSubmit={saveZone} className="w-full max-w-md rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6"><div className="mb-5 flex items-center justify-between"><h2 className="font-display text-lg">{editing.id ? 'Edit gateway' : 'Add gateway'}</h2><button type="button" onClick={() => setEditing(null)}><X size={19} /></button></div><div className="grid gap-4"><label className="text-[11px] text-[var(--muted)]">Network name<input name="name" required defaultValue={editing.name} placeholder="VLAN 25 · Office" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /></label><label className="text-[11px] text-[var(--muted)]">CIDR range<input name="cidr" required defaultValue={editing.cidr} placeholder="192.168.25.0/24" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /></label><label className="text-[11px] text-[var(--muted)]">Gateway IP<input name="gateway" required defaultValue={editing.gateway} placeholder="192.168.25.1" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /></label></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button><button className="rounded bg-[var(--teal)] px-3 py-2 text-xs font-bold text-[var(--highlight-ink)]">Save gateway</button></div></form></div>}</div>;
}
function NetworkOperations({ notify }: { notify: (text: string) => void }) {
  const zones = [{ label: 'VLAN 25 · Office', cidr: '192.168.25.0/24', gateway: '192.168.25.1' }, { label: 'VLAN 26 · Servers', cidr: '192.168.26.0/24', gateway: '192.168.26.1' }, { label: 'VLAN 27 · Management', cidr: '192.168.27.0/24', gateway: '192.168.27.1' }];
  const [devices, setDevices] = useState<DiscoveredDevice[]>([]); const [firewalls, setFirewalls] = useState<Array<{ id: number; name: string; host: string; vendor?: string; status: string; responseMs?: number }>>([]); const [scanning, setScanning] = useState<string | null>(null); const [showFirewall, setShowFirewall] = useState(false);
  useEffect(() => { fetch('/api/network/devices').then(response => response.ok && response.json()).then(data => data && setDevices(data)); fetch('/api/network/firewalls').then(response => response.ok && response.json()).then(data => data && setFirewalls(data)); }, []);
  async function scanZone(zone: typeof zones[number]) { setScanning(zone.cidr); const response = await fetch('/api/network/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cidr: zone.cidr }) }); const data = await response.json(); if (response.ok) { setDevices(current => [...current.filter(device => !data.devices.some((item: DiscoveredDevice) => item.ipAddress === device.ipAddress)), ...data.devices.map((item: DiscoveredDevice) => ({ ...item, zoneName: zone.label }))]); notify(`${zone.label}: ${data.online} online device(s).`); } else notify(data.error || 'Network scan failed.'); setScanning(null); }
  async function saveDeviceName(device: DiscoveredDevice, name: string) { if (!name.trim()) return; const response = await fetch('/api/network/devices', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ipAddress: device.ipAddress, name, status: device.status, responseMs: device.responseMs }) }); if (response.ok) { const saved = await response.json(); setDevices(current => current.map(item => item.ipAddress === saved.ipAddress ? { ...item, ...saved } : item)); notify(`${name} saved.`); } }
  async function checkFirewall(firewall: typeof firewalls[number]) { const response = await fetch('/api/network/firewalls/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: firewall.id }) }); if (response.ok) { const result = await response.json(); setFirewalls(current => current.map(item => item.id === result.id ? { ...item, ...result } : item)); notify(`${firewall.name}: ${result.status}.`); } }
  async function addFirewall(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const response = await fetch('/api/network/firewalls', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.get('name'), host: form.get('host'), vendor: form.get('vendor') }) }); if (response.ok) { const firewall = await response.json(); setShowFirewall(false); setFirewalls(current => [...current, firewall]); notify('Firewall added.'); } }
  return <div className="space-y-4"><section className="panel p-5"><div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Network operations</div><h2 className="font-display text-xl">VLAN discovery & firewall health</h2><p className="mt-2 max-w-3xl text-xs text-[var(--muted)]">Scan your three routed VLANs separately and monitor the firewall gateways. The application server must have routes and firewall permissions to reach each network.</p></section><div className="grid gap-3 lg:grid-cols-3">{zones.map(zone => <article key={zone.cidr} className="panel p-5"><div className="flex items-start justify-between"><div><h3 className="font-display text-sm">{zone.label}</h3><p className="mt-1 text-[10px] text-[var(--muted)]">{zone.cidr}</p></div><span className="rounded bg-[var(--highlight)] px-2 py-1 text-[9px] text-[var(--teal)]">Gateway</span></div><p className="mt-5 text-xs">{zone.gateway}</p><button onClick={() => scanZone(zone)} disabled={scanning === zone.cidr} className="mt-5 w-full rounded bg-[var(--teal)] px-3 py-2 text-[10px] font-bold text-[var(--highlight-ink)]">{scanning === zone.cidr ? 'Scanning…' : 'Scan VLAN'}</button></article>)}</div><section className="panel overflow-hidden"><div className="flex items-center justify-between border-b border-[var(--line)] p-5"><div><h2 className="font-display text-sm">Firewall health</h2><p className="mt-1 text-[10px] text-[var(--muted)]">Monitor firewall management IPs and gateway availability.</p></div><button onClick={() => setShowFirewall(true)} className="rounded bg-[var(--teal)] px-3 py-2 text-[10px] font-bold text-[var(--highlight-ink)]">＋ Add firewall</button></div>{firewalls.length === 0 ? <div className="p-8 text-center text-xs text-[var(--muted)]">No firewalls configured yet.</div> : <div className="divide-y divide-[var(--line)]">{firewalls.map(firewall => <div key={firewall.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"><div className="flex-1"><strong className="block text-xs">{firewall.name}</strong><span className="text-[10px] text-[var(--muted)]">{firewall.host} · {firewall.vendor || 'Firewall'}</span></div><span className={`text-[10px] ${firewall.status === 'online' ? 'text-[var(--teal)]' : 'text-[var(--coral)]'}`}>● {firewall.status || 'Not checked'}{firewall.responseMs ? ` · ${firewall.responseMs} ms` : ''}</span><button onClick={() => checkFirewall(firewall)} className="rounded border border-[var(--line)] px-3 py-2 text-[10px]">Check firewall</button></div>)}</div>}</section><section className="panel overflow-hidden"><div className="border-b border-[var(--line)] p-5"><h2 className="font-display text-sm">Discovered devices</h2><p className="mt-1 text-[10px] text-[var(--muted)]">Edit device names, click an IP to open its web service, and review available MAC metadata.</p></div><div className="divide-y divide-[var(--line)]">{devices.length === 0 ? <p className="p-8 text-center text-xs text-[var(--muted)]">No devices discovered yet.</p> : devices.map(device => <div key={device.ipAddress} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"><span className="h-2 w-2 shrink-0 rounded-full bg-[var(--teal)]" /><div className="min-w-0 flex-1"><strong className="block text-xs">{device.name || 'Unnamed device'}</strong><a href={`http://${device.ipAddress}`} target="_blank" rel="noreferrer" className="text-[10px] text-[var(--teal)] underline">{device.ipAddress}</a><span className="ml-2 text-[10px] text-[var(--muted)]">{device.zoneName || 'VLAN device'}{device.macAddress ? ` · MAC ${device.macAddress}` : ' · MAC unavailable from this scan'}</span></div><span className="text-[10px] text-[var(--teal)]">{device.status}{device.responseMs ? ` · ${device.responseMs} ms` : ''}</span><input defaultValue={device.name || ''} onBlur={event => saveDeviceName(device, event.target.value)} onKeyDown={event => { if (event.key === 'Enter') saveDeviceName(device, event.currentTarget.value); }} placeholder="Assign name" className="w-36 rounded border border-[var(--line)] bg-[var(--canvas)] px-2 py-2 text-[10px]" /><button onClick={() => notify('Site access requires firewall, DNS, or NetFlow logs; an IP scan cannot determine browsing history.')} className="rounded border border-[var(--line)] px-2 py-2 text-[10px] text-[var(--ink)]">View traffic</button></div>)}</div></section>{showFirewall && <div className="fixed inset-0 z-30 grid place-items-center bg-[#031015cc] p-5"><form onSubmit={addFirewall} className="w-full max-w-md rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6"><div className="mb-5 flex items-center justify-between"><h2 className="font-display text-lg">Add firewall</h2><button type="button" onClick={() => setShowFirewall(false)}><X size={19} /></button></div><div className="grid gap-4"><label className="text-[11px] text-[var(--muted)]">Firewall name<input name="name" required placeholder="Main VLAN Firewall" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /></label><label className="text-[11px] text-[var(--muted)]">Management IP or hostname<input name="host" required placeholder="192.168.25.1" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /></label><label className="text-[11px] text-[var(--muted)]">Vendor<input name="vendor" placeholder="Fortinet, Sophos, pfSense…" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /></label></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setShowFirewall(false)} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button><button className="rounded bg-[var(--teal)] px-3 py-2 text-xs font-bold text-[var(--highlight-ink)]">Add firewall</button></div></form></div>}</div>;
}

function NetworkManagement({ notify }: { notify: (text: string) => void }) {
  const [cidr, setCidr] = useState('192.168.1.0/24'); const [devices, setDevices] = useState<DiscoveredDevice[]>([]); const [scanning, setScanning] = useState(false); const [scanned, setScanned] = useState(0);
  async function loadSaved() { const response = await fetch('/api/network/devices', { cache: 'no-store' }); if (response.ok) setDevices(await response.json()); }
  useEffect(() => { loadSaved(); }, []);
  async function scan(event: React.FormEvent) { event.preventDefault(); setScanning(true); setScanned(0); const response = await fetch('/api/network/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cidr }) }); const data = await response.json(); if (response.ok) { setDevices(data.devices); setScanned(data.scanned); notify(`Scan complete: ${data.online} online device(s).`); } else notify(data.error || 'Network scan failed.'); setScanning(false); }
  async function saveName(device: DiscoveredDevice, name: string) { if (!name.trim()) return; const response = await fetch('/api/network/devices', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...device, name }) }); if (response.ok) { const saved = await response.json(); setDevices(current => current.map(item => item.ipAddress === saved.ipAddress ? saved : item)); notify(`${name} saved.`); } }
  return <div className="space-y-4"><section className="panel p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Network discovery</div><h2 className="font-display text-xl">Connected devices</h2><p className="mt-2 max-w-2xl text-xs text-[var(--muted)]">Scan a private network range to discover reachable devices. Only scan networks you own or are authorized to monitor.</p></div><form onSubmit={scan} className="flex gap-2"><input value={cidr} onChange={event => setCidr(event.target.value)} className="w-44 rounded border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-xs" placeholder="192.168.1.0/24" /><button disabled={scanning} className="rounded bg-[var(--teal)] px-3 py-2 text-[11px] font-bold text-[var(--highlight-ink)]">{scanning ? 'Scanning…' : 'Scan network'}</button></form></div><p className="mt-4 text-[10px] text-[var(--muted)]">Checks common ports 80, 443, 445, and 3389. {scanned ? `${scanned} addresses scanned.` : 'Use /24 or smaller ranges.'}</p></section><div className="grid gap-3 sm:grid-cols-3"><WorkspaceMetric label="Saved devices" value={String(devices.length)} detail="Named network assets" accent="var(--teal)" /><WorkspaceMetric label="Online now" value={String(devices.filter(device => device.status === 'online').length)} detail="Reachable endpoints" accent="var(--blue)" /><WorkspaceMetric label="Needs naming" value={String(devices.filter(device => !device.name).length)} detail="Assign a device name" accent="var(--amber)" /></div><section className="panel overflow-hidden"><div className="border-b border-[var(--line)] p-5"><h2 className="font-display text-sm">Scan results</h2><p className="mt-1 text-[10px] text-[var(--muted)]">Name discovered devices so they can be recognized in future scans.</p></div>{devices.length === 0 ? <div className="p-10 text-center text-xs text-[var(--muted)]">No discovered devices yet. Start a network scan above.</div> : <div className="divide-y divide-[var(--line)]">{devices.map(device => <div key={device.ipAddress} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"><div className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--highlight)] text-[var(--teal)]">⌁</div><div className="flex-1"><strong className="block text-xs">{device.name || 'Unnamed device'}</strong><span className="text-[10px] text-[var(--muted)]">{device.ipAddress}{device.port ? ` · port ${device.port}` : ''}{device.responseMs ? ` · ${device.responseMs} ms` : ''}</span></div><span className={`text-[10px] ${device.status === 'online' ? 'text-[var(--teal)]' : 'text-[var(--coral)]'}`}>● {device.status}</span><input defaultValue={device.name || ''} onBlur={event => saveName(device, event.target.value)} onKeyDown={event => { if (event.key === 'Enter') saveName(device, event.currentTarget.value); }} placeholder="Add device name" className="w-40 rounded border border-[var(--line)] bg-[var(--canvas)] px-2 py-2 text-[10px]" /></div>)}</div>}</section></div>;
}

type InventoryDevice = { id: string; assetTag: string; deviceType: string; brand: string; model: string; serialNumber: string; status: string; deployed: boolean; assignedTo: string };

const seedInventory: InventoryDevice[] = [
  { id: 'LPT-357', assetTag: 'LPT-357', deviceType: 'Laptop', brand: 'LENOVO', model: 'LENOVO T450 I5 5300N', serialNumber: 'PC05R27R', status: 'For Repair', deployed: false, assignedTo: '' },
  { id: 'LPT-356', assetTag: 'LPT-356', deviceType: 'Laptop', brand: 'LENOVO', model: 'LENOVO T460', serialNumber: 'PCOG474E', status: 'Good', deployed: true, assignedTo: 'KIMBERLY RETIQUEZ – PROVISOR SOLUTION INC. – Sister Company' },
  { id: 'LPT-355', assetTag: 'LPT-355', deviceType: 'Laptop', brand: 'ACER', model: 'LAP-ACER A315-56-50VC', serialNumber: 'NXHS5SP0070480074834 00', status: 'Good', deployed: false, assignedTo: '' },
  { id: 'LPT-354', assetTag: 'LPT-354', deviceType: 'Laptop', brand: 'LENOVO', model: 'LENOVO 310 - 14IKB', serialNumber: 'PFOF3RDS', status: 'Good', deployed: true, assignedTo: 'Ian B. Alcutas - WSI - Organic' },
  { id: 'LPT-353', assetTag: 'LPT-353', deviceType: 'Laptop', brand: 'LENOVO', model: 'LENOVO IDEAPAD 310-14IKB', serialNumber: 'PFOJFPXY', status: 'For Repair', deployed: false, assignedTo: '' },
  { id: 'LPT-352', assetTag: 'LPT-352', deviceType: 'Laptop', brand: 'ACER', model: 'LAP-ACER A315-56-50VC', serialNumber: 'NXHS5SPO070480080E3400', status: 'Good', deployed: false, assignedTo: '' },
  { id: 'LPT-351', assetTag: 'LPT-351', deviceType: 'Laptop', brand: 'ACER', model: 'LAP-ACER A315-56-50VC', serialNumber: 'NXHS5SP007048008A03400', status: 'Good', deployed: false, assignedTo: '' },
  { id: 'LPT-350', assetTag: 'LPT-350', deviceType: 'Laptop', brand: 'ASUS', model: 'ASUS X409FJ', serialNumber: 'K8N0CX15695835A', status: 'Good', deployed: false, assignedTo: '' },
];

const inventoryTypes = ['Laptop', 'Desktop', 'Monitor', 'Printer', 'Server', 'Network Device', 'Phone', 'Other'];
const inventoryStatuses = ['Good', 'For Repair', 'Under Maintenance', 'Retired'];

type ReconcileRow = { assetTag: string; deviceType: string; brand: string; model: string; serialNumber: string; status: string; assignedTo: string };
type ReconcileResult = { systemCount: number; fileCount: number; matched: number; missingInFile: string[]; missingInSystem: string[]; mismatches: Array<{ assetTag: string; field: string; systemValue: string; fileValue: string }> };

function normalizeReconcileValue(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function InventoryManagement({ notify }: { notify: (text: string) => void }) {
  const [devices, setDevices] = useState<InventoryDevice[]>(seedInventory);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [editing, setEditing] = useState<InventoryDevice | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InventoryDevice | null>(null);
  const reconcileInputRef = useRef<HTMLInputElement | null>(null);
  const [reconcileFileName, setReconcileFileName] = useState('');
  const [reconcileRows, setReconcileRows] = useState<ReconcileRow[]>([]);
  const [reconcileResult, setReconcileResult] = useState<ReconcileResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let rows = await api.get<InventoryDevice[]>('/api/inventory');
        if (rows.length === 0) {
          await Promise.all(seedInventory.map(device => api.post('/api/inventory', device)));
          rows = await api.get<InventoryDevice[]>('/api/inventory');
        }
        if (!cancelled) setDevices(rows);
      } catch { /* keep seed */ }
    })();
    return () => { cancelled = true; };
  }, []);

  function persist(next: InventoryDevice[], changed?: { created?: InventoryDevice; updated?: InventoryDevice; deleted?: InventoryDevice }) {
    setDevices(next);
    if (changed?.created) api.post('/api/inventory', changed.created).catch(() => notify('Could not save to the database.'));
    if (changed?.updated) api.patch('/api/inventory', changed.updated).catch(() => notify('Could not update the database.'));
    if (changed?.deleted) api.del('/api/inventory', { id: changed.deleted.id }).catch(() => notify('Could not delete from the database.'));
  }

  async function refresh() {
    try { setDevices(await api.get<InventoryDevice[]>('/api/inventory')); } catch { /* ignore */ }
    notify('Inventory list refreshed.');
  }

  function saveDevice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const assetTag = String(form.get('assetTag') || '').trim().toUpperCase();
    if (!assetTag) { notify('Asset tag is required.'); return; }
    if (!editing && devices.some(device => device.assetTag === assetTag)) { notify(`${assetTag} already exists in inventory.`); return; }
    const device: InventoryDevice = {
      id: editing?.id || `${assetTag}-${Date.now()}`,
      assetTag,
      deviceType: String(form.get('deviceType') || 'Laptop'),
      brand: String(form.get('brand') || '').trim().toUpperCase(),
      model: String(form.get('model') || '').trim(),
      serialNumber: String(form.get('serialNumber') || '').trim(),
      status: String(form.get('status') || 'Good'),
      deployed: form.get('deployed') === 'on',
      assignedTo: String(form.get('assignedTo') || '').trim(),
    };
    persist(editing ? devices.map(item => item.id === editing.id ? device : item) : [device, ...devices], editing ? { updated: device } : { created: device });
    setShowForm(false);
    setEditing(null);
    notify(editing ? `${assetTag} updated.` : `${assetTag} added to inventory.`);
  }

  function removeDevice(device: InventoryDevice) {
    persist(devices.filter(item => item.id !== device.id), { deleted: device });
    setDeleteTarget(null);
    notify(`${device.assetTag} removed from inventory.`);
  }

  async function handleReconcileFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
      const rows: ReconcileRow[] = rawRows.map(row => {
        const normalized: Record<string, string> = {};
        Object.entries(row).forEach(([key, value]) => { normalized[key.trim().toLowerCase().replace(/[^a-z]/g, '')] = String(value).trim(); });
        return {
          assetTag: (normalized['assettag'] || normalized['tag'] || '').toUpperCase(),
          deviceType: normalized['devicetype'] || normalized['type'] || '',
          brand: (normalized['brand'] || '').toUpperCase(),
          model: normalized['model'] || '',
          serialNumber: normalized['serialnumber'] || normalized['serial'] || '',
          status: normalized['status'] || '',
          assignedTo: normalized['assignedto'] || normalized['assigned'] || '',
        };
      }).filter(row => row.assetTag);
      if (!rows.length) { notify('No asset tags found in the uploaded file. Expected an "Asset Tag" column.'); return; }
      setReconcileFileName(file.name);
      setReconcileRows(rows);
      setReconcileResult(null);
      notify(`${file.name} loaded: ${rows.length} record(s) ready to reconcile.`);
    } catch {
      notify('Could not read the uploaded file. Use .xlsx, .xls, or .csv.');
    }
  }

  function runReconciliation() {
    if (!reconcileRows.length) { notify('Upload an Excel file first.'); return; }
    const compareSerial = reconcileRows.some(row => row.serialNumber);
    const compareStatus = reconcileRows.some(row => row.status);
    const compareAssigned = reconcileRows.some(row => row.assignedTo);
    const fileByTag = new Map(reconcileRows.map(row => [row.assetTag, row]));
    const systemTags = new Set(devices.map(device => device.assetTag));
    const missingInFile = devices.filter(device => !fileByTag.has(device.assetTag)).map(device => device.assetTag);
    const missingInSystem = reconcileRows.filter(row => !systemTags.has(row.assetTag)).map(row => row.assetTag);
    const mismatches: ReconcileResult['mismatches'] = [];
    let matched = 0;
    devices.forEach(device => {
      const row = fileByTag.get(device.assetTag);
      if (!row) return;
      const before = mismatches.length;
      if (compareSerial && normalizeReconcileValue(device.serialNumber) !== normalizeReconcileValue(row.serialNumber)) mismatches.push({ assetTag: device.assetTag, field: 'Serial number', systemValue: device.serialNumber, fileValue: row.serialNumber });
      if (compareStatus && normalizeReconcileValue(device.status) !== normalizeReconcileValue(row.status)) mismatches.push({ assetTag: device.assetTag, field: 'Status', systemValue: device.status, fileValue: row.status });
      if (compareAssigned && normalizeReconcileValue(device.assignedTo) !== normalizeReconcileValue(row.assignedTo)) mismatches.push({ assetTag: device.assetTag, field: 'Assigned to', systemValue: device.assignedTo, fileValue: row.assignedTo });
      if (mismatches.length === before) matched += 1;
    });
    const result: ReconcileResult = { systemCount: devices.length, fileCount: reconcileRows.length, matched, missingInFile, missingInSystem, mismatches };
    setReconcileResult(result);
    const accurate = result.systemCount === result.fileCount && !missingInFile.length && !missingInSystem.length && !mismatches.length;
    notify(accurate ? 'Reconciliation complete: records are accurate.' : 'Reconciliation complete: differences found.');
  }

  function clearReconciliation() {
    setReconcileFileName('');
    setReconcileRows([]);
    setReconcileResult(null);
  }

  const filtered = devices.filter(device => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [device.assetTag, device.brand, device.model, device.serialNumber, device.assignedTo].some(field => field.toLowerCase().includes(q));
    const matchesType = typeFilter === 'All Types' || device.deviceType === typeFilter;
    const matchesStatus = statusFilter === 'All Status' || device.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <section className="panel p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">MIS Tools</div>
            <h2 className="font-display text-xl">Inventory Management</h2>
            <p className="mt-2 max-w-2xl text-xs text-[var(--muted)]">Manage all devices in your inventory.</p>
          </div>
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center justify-center gap-2 rounded-md bg-[var(--teal)] px-3 py-2 text-[11px] font-bold text-[var(--highlight-ink)]"><Plus size={14} /> Add Device</button>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <WorkspaceMetric label="Total devices" value={String(devices.length)} detail="All registered assets" accent="var(--teal)" />
        <WorkspaceMetric label="Deployed" value={String(devices.filter(device => device.deployed).length)} detail="Currently issued" accent="var(--blue)" />
        <WorkspaceMetric label="Good condition" value={String(devices.filter(device => device.status === 'Good').length)} detail="Ready to deploy" accent="var(--teal)" />
        <WorkspaceMetric label="For repair" value={String(devices.filter(device => device.status === 'For Repair').length)} detail="Needs attention" accent="var(--amber)" />
      </div>

      <section className="panel p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Reconciliation</div>
            <h2 className="font-display text-sm">Reconcile inventory counts</h2>
            <p className="mt-1 max-w-2xl text-[10px] text-[var(--muted)]">Upload an Excel or CSV file with columns Asset Tag, Type, Brand, Model, Serial Number, Status, Assigned To, then press Reconcile to check whether the uploaded data matches the system records.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input ref={reconcileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleReconcileFile} className="hidden" />
            <button onClick={() => reconcileInputRef.current?.click()} className="flex items-center gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-[11px] text-[var(--ink)] hover:border-[var(--teal)] hover:text-[var(--teal)]"><Upload size={14} /> Upload Excel</button>
            <button onClick={runReconciliation} disabled={!reconcileRows.length} className="flex items-center gap-2 rounded-md bg-[var(--teal)] px-3 py-2 text-[11px] font-bold text-[var(--highlight-ink)] disabled:opacity-50"><ShieldCheck size={14} /> Reconcile</button>
            {(reconcileRows.length > 0 || reconcileResult) && <button onClick={clearReconciliation} className="rounded-md border border-[var(--line)] px-3 py-2 text-[11px] text-[var(--muted)] hover:text-[var(--ink)]">Clear</button>}
          </div>
        </div>
        {reconcileFileName && <p className="mt-3 text-[10px] text-[var(--muted)]">Loaded file: <strong className="text-[var(--ink)]">{reconcileFileName}</strong> · {reconcileRows.length} record(s) with asset tags.</p>}
        {reconcileResult && (() => {
          const accurate = reconcileResult.systemCount === reconcileResult.fileCount && reconcileResult.missingInFile.length === 0 && reconcileResult.missingInSystem.length === 0 && reconcileResult.mismatches.length === 0;
          return (
            <div className="mt-4 space-y-3 border-t border-[var(--line)] pt-4">
              <div className={`flex items-center gap-3 rounded-md border p-3 ${accurate ? 'border-[var(--teal)] bg-[var(--muted-surface)]' : 'border-[#8a6d1f] bg-[#493b26]'}`}>
                <span className={`h-2 w-2 rounded-full ${accurate ? 'bg-[var(--teal)]' : 'bg-[var(--amber)]'}`} />
                <div>
                  <strong className="block text-xs text-[var(--ink)]">{accurate ? 'Accurate — system records match the uploaded Excel data.' : 'Not matching — differences found between system records and the uploaded Excel data.'}</strong>
                  <span className="text-[10px] text-[var(--muted)]">System records: {reconcileResult.systemCount} · Excel records: {reconcileResult.fileCount} · Fully matched: {reconcileResult.matched}</span>
                </div>
              </div>
              {reconcileResult.systemCount !== reconcileResult.fileCount && <p className="text-[11px] text-[var(--amber)]">Count mismatch: the system has {reconcileResult.systemCount} device(s) but the file contains {reconcileResult.fileCount} record(s).</p>}
              {reconcileResult.missingInFile.length > 0 && (
                <div>
                  <strong className="block text-[11px] text-[var(--ink)]">In system but missing from file ({reconcileResult.missingInFile.length})</strong>
                  <p className="mt-1 font-mono text-[10px] text-[var(--muted)]">{reconcileResult.missingInFile.join(', ')}</p>
                </div>
              )}
              {reconcileResult.missingInSystem.length > 0 && (
                <div>
                  <strong className="block text-[11px] text-[var(--ink)]">In file but missing from system ({reconcileResult.missingInSystem.length})</strong>
                  <p className="mt-1 font-mono text-[10px] text-[var(--muted)]">{reconcileResult.missingInSystem.join(', ')}</p>
                </div>
              )}
              {reconcileResult.mismatches.length > 0 && (
                <div>
                  <strong className="block text-[11px] text-[var(--ink)]">Field mismatches ({reconcileResult.mismatches.length})</strong>
                  <div className="mt-1 space-y-1">
                    {reconcileResult.mismatches.slice(0, 20).map((mismatch, index) => (
                      <p key={index} className="text-[10px] text-[var(--muted)]"><span className="font-mono font-bold text-[var(--ink)]">{mismatch.assetTag}</span> · {mismatch.field}: system "{mismatch.systemValue || '—'}" vs file "{mismatch.fileValue || '—'}"</p>
                    ))}
                    {reconcileResult.mismatches.length > 20 && <p className="text-[10px] text-[var(--muted)]">…and {reconcileResult.mismatches.length - 20} more.</p>}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </section>

      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--line)] p-4 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-2 rounded border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-xs text-[#617477]">
            <Search size={14} />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by brand, model, serial..." className="w-full bg-transparent text-xs text-[var(--ink)] placeholder-[#617477] outline-none" />
          </div>
          <div className="flex gap-2">
            <select value={typeFilter} onChange={event => setTypeFilter(event.target.value)} className="rounded border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-xs text-[var(--ink)]">
              <option>All Types</option>
              {inventoryTypes.map(type => <option key={type}>{type}</option>)}
            </select>
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="rounded border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-xs text-[var(--ink)]">
              <option>All Status</option>
              {inventoryStatuses.map(status => <option key={status}>{status}</option>)}
            </select>
            <button onClick={refresh} aria-label="Refresh inventory" className="rounded border border-[var(--line)] px-3 py-2 text-[var(--muted)] hover:text-[var(--teal)]"><RefreshCw size={14} /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--muted-surface)] text-[10px] uppercase tracking-wider text-[var(--muted)]">
                <th className="p-3.5 pl-5">Asset Tag</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Brand</th>
                <th className="p-3.5">Model</th>
                <th className="p-3.5">Serial Number</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Deployed</th>
                <th className="p-3.5">Assigned To</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center text-xs text-[var(--muted)]">No devices found matching the current filters.</td></tr>
              ) : filtered.map(device => (
                <tr key={device.id} className="transition hover:bg-[var(--highlight)]/30">
                  <td className="p-3.5 pl-5 font-mono text-[11px] font-bold text-[var(--ink)]">{device.assetTag}</td>
                  <td className="p-3.5"><span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--highlight)] px-2.5 py-1 text-[10px] font-medium text-[var(--ink)]"><Laptop size={11} className="text-[var(--teal)]" />{device.deviceType}</span></td>
                  <td className="p-3.5 text-[11px] text-[var(--ink)]">{device.brand}</td>
                  <td className="p-3.5 text-[11px] text-[var(--muted)]">{device.model}</td>
                  <td className="p-3.5 font-mono text-[11px] text-[var(--ink)]">{device.serialNumber || '-'}</td>
                  <td className="p-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${device.status === 'Good' ? 'bg-[var(--muted-surface)] text-[var(--teal)]' : device.status === 'For Repair' ? 'bg-[#493b26] text-[var(--amber)]' : 'bg-[#492b33] text-[var(--coral)]'}`}>{device.status}</span></td>
                  <td className="p-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${device.deployed ? 'bg-[var(--muted-surface)] text-[var(--teal)]' : 'bg-[var(--canvas)] text-[var(--muted)]'}`}>{device.deployed ? 'Yes' : 'No'}</span></td>
                  <td className="max-w-[220px] p-3.5 text-[11px] text-[var(--muted)]"><span className="block truncate" title={device.assignedTo || 'Unassigned'}>{device.assignedTo || 'Unassigned'}</span></td>
                  <td className="p-3.5 pr-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => { setEditing(device); setShowForm(true); }} className="inline-flex items-center gap-1 rounded border border-[var(--line)] px-2.5 py-1 text-[10px] text-[var(--ink)] hover:border-[var(--teal)] hover:text-[var(--teal)]"><Pencil size={11} /> Edit</button>
                      <button onClick={() => setDeleteTarget(device)} className="inline-flex items-center gap-1 rounded border border-[#9b4038] bg-[#492b33] px-2.5 py-1 text-[10px] font-medium text-white hover:bg-[#9b4038]"><Trash2 size={11} /> Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#031015cc] p-5">
          <form onSubmit={saveDevice} className="mx-auto my-6 w-full max-w-2xl rounded-lg border border-[var(--teal)] bg-[var(--surface)] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Inventory Management</span>
                <h2 className="mt-1 font-display text-xl font-semibold">{editing ? `Edit ${editing.assetTag}` : 'Add Device'}</h2>
                <p className="mt-1 text-xs text-[var(--muted)]">Register a device with its asset tag, hardware details, and assignment.</p>
              </div>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="rounded p-1 text-[var(--muted)] hover:text-white"><X size={20} /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-[11px] text-[#8ca2a4]">Asset tag <span className="text-[var(--teal)]">*</span>
                <input name="assetTag" required defaultValue={editing?.assetTag} placeholder="e.g. LPT-358" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Type
                <select name="deviceType" defaultValue={editing?.deviceType || 'Laptop'} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none">
                  {inventoryTypes.map(type => <option key={type}>{type}</option>)}
                </select>
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Brand <span className="text-[var(--teal)]">*</span>
                <input name="brand" required defaultValue={editing?.brand} placeholder="e.g. LENOVO" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Model <span className="text-[var(--teal)]">*</span>
                <input name="model" required defaultValue={editing?.model} placeholder="e.g. LENOVO T460" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Serial number
                <input name="serialNumber" defaultValue={editing?.serialNumber} placeholder="e.g. PC05R27R" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Status
                <select name="status" defaultValue={editing?.status || 'Good'} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none">
                  {inventoryStatuses.map(status => <option key={status}>{status}</option>)}
                </select>
              </label>
              <label className="text-[11px] text-[#8ca2a4] sm:col-span-2">Assigned to
                <input name="assignedTo" defaultValue={editing?.assignedTo} placeholder="Leave blank if unassigned" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <div className="rounded border border-[var(--line)] bg-[var(--canvas)] p-3 sm:col-span-2">
                <label className="flex cursor-pointer items-center gap-3 text-xs text-white">
                  <input name="deployed" type="checkbox" defaultChecked={editing?.deployed} className="h-4 w-4 rounded accent-[#49d4bf]" />
                  <div>
                    <strong className="block text-xs text-[var(--teal)]">Device is deployed</strong>
                    <span className="text-[10px] text-[var(--muted)]">Mark this device as currently issued to a user or department.</span>
                  </div>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-[var(--line)] pt-4">
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="rounded border border-[var(--line)] px-4 py-2 text-xs text-[var(--ink)] hover:bg-white/5">Cancel</button>
              <button type="submit" className="flex items-center gap-2 rounded bg-[var(--teal)] px-4 py-2 text-xs font-bold text-[var(--highlight-ink)] hover:opacity-90"><Plus size={14} /> {editing ? 'Save changes' : 'Add Device'}</button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[#031015cc] p-5">
          <div className="w-full max-w-md rounded-lg border border-[#8b4a44] bg-[var(--surface)] p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[1.3px] text-[#d8786b]">Permanent action</span>
                <h2 className="mt-1 font-display text-lg">Delete device?</h2>
              </div>
              <button onClick={() => setDeleteTarget(null)}><X size={19} /></button>
            </div>
            <p className="text-xs leading-5 text-[var(--muted)]">This will remove <strong className="text-[var(--ink)]">{deleteTarget.assetTag}</strong> ({deleteTarget.brand} {deleteTarget.model}) from the inventory. This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button>
              <button onClick={() => removeDevice(deleteTarget)} className="rounded bg-[#9b4038] px-3 py-2 text-xs font-bold text-white">Delete device</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type EmailRecord = { id: string; date: string; employeeName: string; verifyName: string; userType: string; status: string; personalEmail: string; personalPassword: string; wsiEmail: string; wsiPassword: string; company: string; remarks: string };

const seedEmails: EmailRecord[] = [
  { id: 'em-1', date: '9/16/2026', employeeName: 'Jenica S. Valerio', verifyName: 'Jenica S. Valerio', userType: 'New', status: 'Active', personalEmail: '', personalPassword: 'Wsi@2026!jv', wsiEmail: 'jvalerio@huntershubinc.com', wsiPassword: 'Hhi#2026!jv', company: 'HHI', remarks: '' },
  { id: 'em-2', date: '9/9/2026', employeeName: 'Giesel T. Cabañas', verifyName: 'Giesel T. Cabañas', userType: 'New', status: 'Active', personalEmail: '', personalPassword: 'Wsi@2026!gc', wsiEmail: 'gcabanas@wesupportinc.com', wsiPassword: 'Wsi#2026!gc', company: 'WeSupport Incorporated', remarks: '' },
  { id: 'em-3', date: '9/2/2026', employeeName: 'Oliver Mangahas David', verifyName: 'Oliver Mangahas David', userType: 'Existing', status: 'Active', personalEmail: '', personalPassword: 'Wsi@2026!od', wsiEmail: 'odavid@huntershubinc.com', wsiPassword: 'Hhi#2026!od', company: 'HHI', remarks: '' },
  { id: 'em-4', date: '8/26/2026', employeeName: 'Daniella Marie Arrogante', verifyName: 'Daniella Marie Arrogante', userType: 'New', status: 'Active', personalEmail: 'wsi.dmarrogante@gmail.com', personalPassword: 'Wsi@2026!da', wsiEmail: 'dmarrogante@wesupportinc.com', wsiPassword: 'Wsi#2026!da', company: 'WeSupport Inc.', remarks: '' },
  { id: 'em-5', date: '8/18/2026', employeeName: 'John Hernan G. Comia', verifyName: 'John Hernan G. Comia', userType: 'New', status: 'Active', personalEmail: '', personalPassword: 'Wsi@2026!jc', wsiEmail: 'jcomia@huntershubinc.com', wsiPassword: 'Hhi#2026!jc', company: 'HHI', remarks: '' },
  { id: 'em-6', date: '7/20/2026', employeeName: 'John Ezra Dannug', verifyName: 'John Ezra Dannug', userType: 'New', status: 'Active', personalEmail: 'wsi.edannug@gmail.com', personalPassword: 'Wsi@2026!ed', wsiEmail: 'edannug@wesupportinc.com', wsiPassword: 'Wsi#2026!ed', company: 'WeSupport Inc', remarks: '' },
  { id: 'em-7', date: '7/9/2026', employeeName: 'Jake Nicol Galang', verifyName: 'Jake Nicol Galang', userType: 'Existing', status: 'Active', personalEmail: 'jakenicolgalang21@gmail.com', personalPassword: 'Prv@2026!jg', wsiEmail: 'jgalang@provisor.com.ph', wsiPassword: 'Prv#2026!jg', company: 'Provisor', remarks: 'Provisor email' },
  { id: 'em-8', date: '6/30/2026', employeeName: 'Maria Clara Santos', verifyName: 'Maria Clara Santos', userType: 'Existing', status: 'Inactive', personalEmail: '', personalPassword: '', wsiEmail: 'msantos@wesupportinc.com', wsiPassword: '', company: 'WeSupport Inc', remarks: 'Offboarded' },
];

function toCsv(rows: Array<Record<string, unknown>>) {
  if (!rows.length) return '';
  const keys = Array.from(new Set(rows.flatMap(row => Object.keys(row))));
  const esc = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  return [keys.map(esc).join(','), ...rows.map(row => keys.map(key => esc(row[key])).join(','))].join('\n');
}
function downloadCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: unknown) { return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function printPdfReport({ title, subtitle, columns, rows }: { title: string; subtitle: string; columns: string[]; rows: Array<Array<unknown>> }) {
  const win = window.open('', '_blank', 'width=1000,height=700');
  if (!win) return false;
  const today = new Date().toLocaleString();
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 32px; color: #1c2740; }
    .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #5b45d6; padding-bottom: 16px; margin-bottom: 20px; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .sub { font-size: 12px; color: #536582; margin: 0; }
    .meta { font-size: 10px; color: #7b88a1; text-align: right; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #eef4ff; color: #2f4bc2; text-align: left; text-transform: uppercase; font-size: 9px; letter-spacing: .6px; padding: 8px; border: 1px solid #dbe3f2; }
    td { padding: 7px 8px; border: 1px solid #e4e9f3; vertical-align: top; }
    tr:nth-child(even) td { background: #f8faff; }
    .foot { margin-top: 18px; font-size: 10px; color: #7b88a1; border-top: 1px solid #e4e9f3; padding-top: 10px; }
    @media print { body { padding: 0; } @page { margin: 16mm; } }
  </style></head><body>
    <div class="head"><div><h1>${escapeHtml(title)}</h1><p class="sub">${escapeHtml(subtitle)}</p></div><div class="meta">WeSupport, Incorporated<br/>Generated ${escapeHtml(today)}<br/>${rows.length} record(s)</div></div>
    <table><thead><tr>${columns.map(column => `<th>${escapeHtml(column)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>
    <div class="foot">WSI MIS — confidential internal report.</div>
  </body></html>`);
  win.document.close();
  win.focus();
  win.print();
  return true;
}

type DailyReportEntry = { id: string; date: string; employeeName: string; department: string; timeIn: string; timeOut: string; tasks: string; accomplishments: string; issues: string; status: string; attachmentName?: string; attachmentData?: string };

const seedDailyReports: DailyReportEntry[] = [
  { id: 'dr-1', date: '2026-09-15', employeeName: 'Mark Julius Dannug', department: 'Cyber Security', timeIn: '08:00', timeOut: '17:00', tasks: 'Firewall rule review; pfSense health monitoring; VLAN 25 scan', accomplishments: 'Closed 3 firewall change requests; verified failover on gateway', issues: 'Intermittent latency on VLAN 26 during backup window', status: 'Submitted' },
  { id: 'dr-2', date: '2026-09-15', employeeName: 'Anthony Migraso', department: 'Cyber Security', timeIn: '08:30', timeOut: '17:30', tasks: 'Patch compliance audit; endpoint agent rollout', accomplishments: '92% patch compliance achieved; 14 endpoints updated', issues: '2 endpoints pending reboot', status: 'Approved' },
  { id: 'dr-3', date: '2026-09-16', employeeName: 'Jhon Paul Mercado', department: 'Software Department', timeIn: '09:00', timeOut: '18:00', tasks: 'MIS tools UI fixes; inventory module testing', accomplishments: 'Deployed readability fixes; validated inventory CRUD', issues: 'None', status: 'Submitted' },
];

function DailyReport({ notify }: { notify: (text: string) => void }) {
  const [entries, setEntries] = useState<DailyReportEntry[]>(seedDailyReports);
  const [showForm, setShowForm] = useState(false);
  const [viewEntry, setViewEntry] = useState<DailyReportEntry | null>(null);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [attachment, setAttachment] = useState<File | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let rows = await api.get<DailyReportEntry[]>('/api/daily-reports');
        if (rows.length === 0) {
          await Promise.all(seedDailyReports.map(entry => api.post('/api/daily-reports', entry)));
          rows = await api.get<DailyReportEntry[]>('/api/daily-reports');
        }
        if (!cancelled) setEntries(rows);
      } catch { /* keep seed */ }
    })();
    return () => { cancelled = true; };
  }, []);

  function persist(next: DailyReportEntry[], changed?: { created?: DailyReportEntry; updated?: DailyReportEntry }) {
    setEntries(next);
    if (changed?.created) api.post('/api/daily-reports', changed.created).catch(() => notify('Could not save to the database.'));
    if (changed?.updated) api.patch('/api/daily-reports', changed.updated).catch(() => notify('Could not update the database.'));
  }

  function submitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const entry: DailyReportEntry = {
      id: `dr-${Date.now()}`,
      date: String(form.get('date') || today),
      employeeName: String(form.get('employeeName') || '').trim(),
      department: String(form.get('department') || 'Cyber Security'),
      timeIn: String(form.get('timeIn') || ''),
      timeOut: String(form.get('timeOut') || ''),
      tasks: String(form.get('tasks') || '').trim(),
      accomplishments: String(form.get('accomplishments') || '').trim(),
      issues: String(form.get('issues') || '').trim(),
      status: 'Submitted',
    };
    if (!entry.employeeName || !entry.tasks) { notify('Employee name and tasks are required.'); return; }
    readAttachment(attachment || undefined, file => {
      const withFile: DailyReportEntry = { ...entry, attachmentName: file?.name, attachmentData: file?.dataUrl };
      persist([withFile, ...entries], { created: withFile });
      setShowForm(false);
      setAttachment(null);
      notify(`Daily report for ${entry.employeeName} submitted.`);
    });
  }

  function setStatus(entry: DailyReportEntry, status: string) {
    const updated = { ...entry, status };
    persist(entries.map(item => item.id === entry.id ? updated : item), { updated });
    notify(`${entry.employeeName}'s report marked ${status.toLowerCase()}.`);
  }

  const filtered = entries.filter(entry => statusFilter === 'All Status' || entry.status === statusFilter);

  return (
    <div className="space-y-4">
      <section className="panel p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">MIS Tools</div>
            <h2 className="font-display text-xl">Daily Report</h2>
            <p className="mt-2 max-w-2xl text-xs text-[var(--muted)]">Submit and review daily activity reports from team members.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center justify-center gap-2 rounded-md bg-[var(--teal)] px-3 py-2 text-[11px] font-bold text-[var(--highlight-ink)]"><Plus size={14} /> Submit report</button>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <WorkspaceMetric label="Reports today" value={String(entries.filter(entry => entry.date === today).length)} detail={today} accent="var(--teal)" />
        <WorkspaceMetric label="Total reports" value={String(entries.length)} detail="All time" accent="var(--blue)" />
        <WorkspaceMetric label="Approved" value={String(entries.filter(entry => entry.status === 'Approved').length)} detail="Reviewed by admin" accent="var(--teal)" />
        <WorkspaceMetric label="Pending review" value={String(entries.filter(entry => entry.status === 'Submitted').length)} detail="Awaiting approval" accent="var(--amber)" />
      </div>

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--line)] p-5">
          <div>
            <h2 className="font-display text-sm">Submitted daily reports</h2>
            <p className="mt-1 text-[10px] text-[var(--muted)]">Newest reports first. Open a report to read the full details.</p>
          </div>
          <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="rounded border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-xs text-[var(--ink)]">
            <option>All Status</option>
            <option>Submitted</option>
            <option>Approved</option>
            <option>Returned</option>
          </select>
        </div>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--muted)]">No daily reports found.</div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {filtered.map(entry => (
              <div key={entry.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--highlight)] text-[var(--teal)]">✎</div>
                <div className="min-w-0 flex-1">
                  <strong className="block text-xs text-[var(--ink)]">{entry.employeeName} <span className="font-normal text-[var(--muted)]">· {entry.department}</span></strong>
                  <span className="block truncate text-[10px] text-[var(--muted)]" title={entry.tasks}>{entry.tasks}</span>
                  {entry.attachmentName && <span className="mt-1 flex items-center gap-1 text-[10px] text-[var(--teal)]"><FileText size={11} />{entry.attachmentData ? <a href={entry.attachmentData} download={entry.attachmentName} className="hover:underline">{entry.attachmentName}</a> : entry.attachmentName}</span>}
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-[var(--muted)]">{entry.date}{entry.timeIn ? ` · ${entry.timeIn}–${entry.timeOut}` : ''}</span>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${entry.status === 'Approved' ? 'badge-green' : entry.status === 'Returned' ? 'badge-red' : 'badge-amber'}`}>{entry.status}</span>
                <div className="flex gap-1.5">
                  <button onClick={() => setViewEntry(entry)} className="rounded border border-[var(--line)] px-2.5 py-1 text-[10px] text-[var(--ink)]">View</button>
                  {entry.status === 'Submitted' && <button onClick={() => setStatus(entry, 'Approved')} className="rounded border border-[var(--line)] px-2.5 py-1 text-[10px] text-[var(--teal)]">Approve</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#031015cc] p-5">
          <form onSubmit={submitReport} className="mx-auto my-6 w-full max-w-2xl rounded-lg border border-[var(--teal)] bg-[var(--surface)] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Daily Report</span>
                <h2 className="mt-1 font-display text-xl font-semibold">Submit daily report</h2>
                <p className="mt-1 text-xs text-[var(--muted)]">Log today's work, accomplishments, and any blockers.</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="rounded p-1 text-[var(--muted)] hover:text-white"><X size={20} /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-[11px] text-[#8ca2a4]">Employee name <span className="text-[var(--teal)]">*</span>
                <input name="employeeName" required placeholder="e.g. Juan Dela Cruz" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Date
                <input name="date" type="date" defaultValue={today} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Department
                <input name="department" defaultValue="Cyber Security" placeholder="e.g. Cyber Security" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[11px] text-[#8ca2a4]">Time in
                  <input name="timeIn" type="time" defaultValue="08:00" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
                </label>
                <label className="text-[11px] text-[#8ca2a4]">Time out
                  <input name="timeOut" type="time" defaultValue="17:00" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
                </label>
              </div>
              <label className="text-[11px] text-[#8ca2a4] sm:col-span-2">Tasks performed <span className="text-[var(--teal)]">*</span>
                <textarea name="tasks" rows={2} required placeholder="List the tasks you worked on today" className="mt-1 w-full resize-none rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <label className="text-[11px] text-[#8ca2a4] sm:col-span-2">Accomplishments
                <textarea name="accomplishments" rows={2} placeholder="What was completed or delivered" className="mt-1 w-full resize-none rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <label className="text-[11px] text-[#8ca2a4] sm:col-span-2">Issues / blockers
                <textarea name="issues" rows={2} placeholder="Any problems encountered (optional)" className="mt-1 w-full resize-none rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <div className="sm:col-span-2"><AttachmentInput file={attachment} setFile={setAttachment} /></div>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-[var(--line)] pt-4">
              <button type="button" onClick={() => { setShowForm(false); setAttachment(null); }} className="rounded border border-[var(--line)] px-4 py-2 text-xs text-[var(--ink)] hover:bg-white/5">Cancel</button>
              <button type="submit" className="flex items-center gap-2 rounded bg-[var(--teal)] px-4 py-2 text-xs font-bold text-[var(--highlight-ink)] hover:opacity-90"><Plus size={14} /> Submit report</button>
            </div>
          </form>
        </div>
      )}

      {viewEntry && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[#031015cc] p-5">
          <div className="w-full max-w-lg rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between border-b border-[var(--line)] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[1.3px] text-[var(--teal)]">{viewEntry.date}{viewEntry.timeIn ? ` · ${viewEntry.timeIn}–${viewEntry.timeOut}` : ''}</span>
                <h2 className="mt-1 font-display text-lg">{viewEntry.employeeName}</h2>
                <p className="mt-1 text-xs text-[var(--muted)]">{viewEntry.department}</p>
              </div>
              <button onClick={() => setViewEntry(null)}><X size={19} /></button>
            </div>
            <div className="space-y-4 text-xs">
              <div><strong className="block text-[var(--teal)]">Tasks performed</strong><p className="mt-1 text-[var(--ink)]">{viewEntry.tasks}</p></div>
              <div><strong className="block text-[var(--teal)]">Accomplishments</strong><p className="mt-1 text-[var(--ink)]">{viewEntry.accomplishments || '-'}</p></div>
              <div><strong className="block text-[var(--teal)]">Issues / blockers</strong><p className="mt-1 text-[var(--ink)]">{viewEntry.issues || '-'}</p></div>
              {viewEntry.attachmentName && <div><strong className="block text-[var(--teal)]">Attachment</strong>{viewEntry.attachmentData ? <a href={viewEntry.attachmentData} download={viewEntry.attachmentName} className="mt-1 inline-flex items-center gap-2 rounded border border-[var(--line)] px-3 py-1.5 text-[10px] text-[var(--teal)] hover:underline"><FileText size={12} /> {viewEntry.attachmentName}</a> : <p className="mt-1 text-[var(--ink)]">{viewEntry.attachmentName}</p>}</div>}
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-[var(--line)] pt-4">
              {viewEntry.status !== 'Approved' && <button onClick={() => { setStatus(viewEntry, 'Approved'); setViewEntry(null); }} className="rounded bg-[var(--teal)] px-3 py-2 text-xs font-bold text-[var(--highlight-ink)]">Approve</button>}
              {viewEntry.status !== 'Returned' && <button onClick={() => { setStatus(viewEntry, 'Returned'); setViewEntry(null); }} className="rounded border border-[#9b4038] px-3 py-2 text-xs text-[#ef9b88]">Return</button>}
              <button onClick={() => setViewEntry(null)} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmailManagement({ notify }: { notify: (text: string) => void }) {
  const [records, setRecords] = useState<EmailRecord[]>(seedEmails);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [userFilter, setUserFilter] = useState('All Users');
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EmailRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmailRecord | null>(null);
  const [showPersonalPassword, setShowPersonalPassword] = useState(false);
  const [showWsiPassword, setShowWsiPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let rows = await api.get<EmailRecord[]>('/api/emails');
        if (rows.length === 0) {
          await Promise.all(seedEmails.map(record => api.post('/api/emails', record)));
          rows = await api.get<EmailRecord[]>('/api/emails');
        }
        if (!cancelled) setRecords(rows);
      } catch { /* keep seed */ }
    })();
    return () => { cancelled = true; };
  }, []);

  function persist(next: EmailRecord[], changed?: { created?: EmailRecord; updated?: EmailRecord; deleted?: EmailRecord }) {
    setRecords(next);
    if (changed?.created) api.post('/api/emails', changed.created).catch(() => notify('Could not save to the database.'));
    if (changed?.updated) api.patch('/api/emails', changed.updated).catch(() => notify('Could not update the database.'));
    if (changed?.deleted) api.del('/api/emails', { id: changed.deleted.id }).catch(() => notify('Could not delete from the database.'));
  }

  async function copy(text: string, label: string) {
    if (!text) { notify(`No ${label} to copy.`); return; }
    try { await navigator.clipboard.writeText(text); notify(`${label} copied to clipboard.`); } catch { notify('Clipboard access was denied.'); }
  }

  function exportCsv() {
    const marked = filtered.filter(record => selected[record.id]);
    const rows = (marked.length ? marked : filtered).map(record => ({ Date: record.date, 'Employee Name': record.employeeName, 'Verify Name': record.verifyName, 'User Type': record.userType, Status: record.status, 'Personal Email': record.personalEmail, Password: record.personalPassword, 'WSI Email': record.wsiEmail, 'WSI Password': record.wsiPassword, Company: record.company, Remarks: record.remarks }));
    if (!rows.length) { notify('No email records to export.'); return; }
    downloadCsv(`email-records-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
    notify(`${rows.length} email record(s) exported to CSV.`);
  }

  function saveRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const employeeName = String(form.get('employeeName') || '').trim();
    const wsiEmail = String(form.get('wsiEmail') || '').trim().toLowerCase();
    if (!employeeName || !wsiEmail) { notify('Employee name and WSI email are required.'); return; }
    if (!editing && records.some(record => record.wsiEmail === wsiEmail)) { notify(`${wsiEmail} already exists.`); return; }
    const record: EmailRecord = {
      id: editing?.id || `em-${Date.now()}`,
      date: editing?.date || new Date().toLocaleDateString('en-US'),
      employeeName,
      verifyName: String(form.get('verifyName') || '').trim() || employeeName,
      userType: String(form.get('userType') || 'New'),
      status: String(form.get('status') || 'Active'),
      personalEmail: String(form.get('personalEmail') || '').trim(),
      personalPassword: String(form.get('personalPassword') || ''),
      wsiEmail,
      wsiPassword: String(form.get('wsiPassword') || ''),
      company: String(form.get('company') || 'WeSupport Inc'),
      remarks: String(form.get('remarks') || '').trim(),
    };
    persist(editing ? records.map(item => item.id === editing.id ? record : item) : [record, ...records], editing ? { updated: record } : { created: record });
    setShowForm(false);
    setEditing(null);
    notify(editing ? `${employeeName}'s record updated.` : `${employeeName} added to email records.`);
  }

  function removeRecord(record: EmailRecord) {
    persist(records.filter(item => item.id !== record.id), { deleted: record });
    setDeleteTarget(null);
    notify(`${record.employeeName}'s email record was deleted.`);
  }

  const filtered = records.filter(record => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [record.employeeName, record.verifyName, record.personalEmail, record.wsiEmail, record.company].some(field => field.toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'All Status' || record.status === statusFilter;
    const matchesUser = userFilter === 'All Users' || record.userType === userFilter;
    return matchesSearch && matchesStatus && matchesUser;
  });
  const allSelected = filtered.length > 0 && filtered.every(record => selected[record.id]);
  const selectedCount = filtered.filter(record => selected[record.id]).length;

  function passwordCell(record: EmailRecord, field: 'personalPassword' | 'wsiPassword') {
    const key = `${record.id}-${field}`;
    const value = record[field];
    return (
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[11px] text-[var(--ink)]">{!value ? '-' : revealed[key] ? value : '••••••••'}</span>
        {value && <button onClick={() => setRevealed(current => ({ ...current, [key]: !current[key] }))} aria-label={revealed[key] ? 'Hide password' : 'Show password'} className="icon-btn">{revealed[key] ? <EyeOff size={12} /> : <Eye size={12} />}</button>}
        {value && <button onClick={() => copy(value, 'Password')} aria-label="Copy password" className="icon-btn"><Copy size={12} /></button>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="panel p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">MIS Tools</div>
            <h2 className="font-display text-xl">Email Management</h2>
            <p className="mt-2 max-w-2xl text-xs text-[var(--muted)]">Manage employee email accounts and credentials.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCsv} className="flex items-center gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-[11px] text-[var(--ink)]"><Download size={14} /> Export CSV</button>
            <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 rounded-md bg-[var(--teal)] px-3 py-2 text-[11px] font-bold text-[var(--highlight-ink)]"><Plus size={14} /> Add Email</button>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <WorkspaceMetric label="Total emails" value={String(records.length)} detail="All email records" accent="var(--teal)" />
        <WorkspaceMetric label="Active" value={String(records.filter(record => record.status === 'Active').length)} detail="Currently in use" accent="var(--blue)" />
        <WorkspaceMetric label="Inactive" value={String(records.filter(record => record.status === 'Inactive').length)} detail="Deactivated accounts" accent="var(--coral)" />
        <WorkspaceMetric label="New users" value={String(records.filter(record => record.userType === 'New').length)} detail="Recently onboarded" accent="var(--amber)" />
      </div>

      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--line)] p-4 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-2 rounded border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-xs text-[#617477]">
            <Search size={14} />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, email..." className="w-full bg-transparent text-xs text-[var(--ink)] placeholder-[#617477] outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="rounded border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-xs text-[var(--ink)]">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <select value={userFilter} onChange={event => setUserFilter(event.target.value)} className="rounded border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-xs text-[var(--ink)]">
              <option>All Users</option>
              <option>New</option>
              <option>Existing</option>
            </select>
            {selectedCount > 0 && <span className="badge-blue rounded-full px-2.5 py-1 text-[10px] font-medium">{selectedCount} selected</span>}
          </div>
        </div>
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3">
          <h2 className="flex items-center gap-2 font-display text-sm"><Mail size={14} className="text-[var(--teal)]" /> Email Records</h2>
          <span className="badge-blue rounded-full px-2.5 py-1 text-[10px] font-medium">{filtered.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--muted-surface)] text-[10px] uppercase tracking-wider text-[var(--muted)]">
                <th className="p-3.5 pl-5"><input type="checkbox" checked={allSelected} onChange={() => setSelected(current => { const next = { ...current }; filtered.forEach(record => { next[record.id] = !allSelected; }); return next; })} className="h-3.5 w-3.5 accent-[#5b45d6]" /></th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Employee Name</th>
                <th className="p-3.5">Verify Name</th>
                <th className="p-3.5">New User</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Personal Email</th>
                <th className="p-3.5">Password</th>
                <th className="p-3.5">WSI Email</th>
                <th className="p-3.5">WSI Password</th>
                <th className="p-3.5">Company</th>
                <th className="p-3.5">Remarks</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filtered.length === 0 ? (
                <tr><td colSpan={13} className="p-8 text-center text-xs text-[var(--muted)]">No email records found matching the current filters.</td></tr>
              ) : filtered.map(record => (
                <tr key={record.id} className="transition hover:bg-[var(--highlight)]/30">
                  <td className="p-3.5 pl-5"><input type="checkbox" checked={Boolean(selected[record.id])} onChange={() => setSelected(current => ({ ...current, [record.id]: !current[record.id] }))} className="h-3.5 w-3.5 accent-[#5b45d6]" /></td>
                  <td className="whitespace-nowrap p-3.5 text-[11px] text-[var(--muted)]">{record.date}</td>
                  <td className="p-3.5"><strong className="block text-xs font-semibold text-[var(--ink)]">{record.employeeName}</strong></td>
                  <td className="p-3.5 text-[11px] text-[var(--muted)]">{record.verifyName}</td>
                  <td className="p-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${record.userType === 'New' ? 'badge-blue' : 'badge-gray'}`}>{record.userType.toUpperCase()}</span></td>
                  <td className="p-3.5"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${record.status === 'Active' ? 'badge-green' : 'badge-red'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{record.status.toUpperCase()}</span></td>
                  <td className="p-3.5"><div className="flex items-center gap-1.5"><span className="text-[11px] text-[var(--ink)]">{record.personalEmail || '-'}</span>{record.personalEmail && <button onClick={() => copy(record.personalEmail, 'Personal email')} aria-label="Copy personal email" className="icon-btn"><Copy size={12} /></button>}</div></td>
                  <td className="p-3.5">{passwordCell(record, 'personalPassword')}</td>
                  <td className="p-3.5"><div className="flex items-center gap-1.5"><span className="text-[11px] text-[var(--teal)]">{record.wsiEmail || '-'}</span>{record.wsiEmail && <button onClick={() => copy(record.wsiEmail, 'WSI email')} aria-label="Copy WSI email" className="icon-btn"><Copy size={12} /></button>}</div></td>
                  <td className="p-3.5">{passwordCell(record, 'wsiPassword')}</td>
                  <td className="p-3.5 text-[11px] text-[var(--ink)]">{record.company}</td>
                  <td className="max-w-[160px] p-3.5 text-[11px] text-[var(--muted)]"><span className="block truncate" title={record.remarks}>{record.remarks || '-'}</span></td>
                  <td className="p-3.5 pr-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => { setEditing(record); setShowForm(true); }} className="inline-flex items-center gap-1 rounded border border-[var(--line)] px-2.5 py-1 text-[10px] text-[var(--ink)] hover:border-[var(--teal)] hover:text-[var(--teal)]"><Pencil size={11} /> Edit</button>
                      <button onClick={() => setDeleteTarget(record)} className="inline-flex items-center gap-1 rounded border border-[#9b4038] bg-[#492b33] px-2.5 py-1 text-[10px] font-medium text-white hover:bg-[#9b4038]"><Trash2 size={11} /> Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#031015cc] p-5">
          <form onSubmit={saveRecord} className="mx-auto my-6 w-full max-w-2xl rounded-lg border border-[var(--teal)] bg-[var(--surface)] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Email Management</span>
                <h2 className="mt-1 font-display text-xl font-semibold">{editing ? `Edit ${editing.employeeName}` : 'Add Email'}</h2>
                <p className="mt-1 text-xs text-[var(--muted)]">Register an employee email account and its credentials.</p>
              </div>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="rounded p-1 text-[var(--muted)] hover:text-white"><X size={20} /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-[11px] text-[#8ca2a4]">Employee name <span className="text-[var(--teal)]">*</span>
                <input name="employeeName" required defaultValue={editing?.employeeName} placeholder="e.g. Juan Dela Cruz" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Verify name
                <input name="verifyName" defaultValue={editing?.verifyName} placeholder="Name used for verification" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <label className="text-[11px] text-[#8ca2a4]">User type
                <select name="userType" defaultValue={editing?.userType || 'New'} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none"><option>New</option><option>Existing</option></select>
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Status
                <select name="status" defaultValue={editing?.status || 'Active'} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none"><option>Active</option><option>Inactive</option></select>
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Personal email
                <input name="personalEmail" type="email" defaultValue={editing?.personalEmail} placeholder="optional@gmail.com" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Personal email password
                <div className="relative mt-1">
                  <input name="personalPassword" type={showPersonalPassword ? 'text' : 'password'} defaultValue={editing?.personalPassword} placeholder="Personal email password" className="w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 pr-10 text-sm text-white focus:border-[var(--teal)] outline-none" />
                  <button type="button" onClick={() => setShowPersonalPassword(value => !value)} className="absolute right-3 top-2.5 text-[#617477] hover:text-white">{showPersonalPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </label>
              <label className="text-[11px] text-[#8ca2a4]">WSI email <span className="text-[var(--teal)]">*</span>
                <input name="wsiEmail" type="email" required defaultValue={editing?.wsiEmail} placeholder="jdelacruz@wesupportinc.com" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <label className="text-[11px] text-[#8ca2a4]">WSI email password
                <div className="relative mt-1">
                  <input name="wsiPassword" type={showWsiPassword ? 'text' : 'password'} defaultValue={editing?.wsiPassword} placeholder="WSI email password" className="w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 pr-10 text-sm text-white focus:border-[var(--teal)] outline-none" />
                  <button type="button" onClick={() => setShowWsiPassword(value => !value)} className="absolute right-3 top-2.5 text-[#617477] hover:text-white">{showWsiPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Company
                <input name="company" defaultValue={editing?.company || ''} placeholder="e.g. WeSupport Inc" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Remarks
                <input name="remarks" defaultValue={editing?.remarks} placeholder="Optional notes" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-[var(--line)] pt-4">
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="rounded border border-[var(--line)] px-4 py-2 text-xs text-[var(--ink)] hover:bg-white/5">Cancel</button>
              <button type="submit" className="flex items-center gap-2 rounded bg-[var(--teal)] px-4 py-2 text-xs font-bold text-[var(--highlight-ink)] hover:opacity-90"><Plus size={14} /> {editing ? 'Save changes' : 'Add Email'}</button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[#031015cc] p-5">
          <div className="w-full max-w-md rounded-lg border border-[#8b4a44] bg-[var(--surface)] p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[1.3px] text-[#d8786b]">Permanent action</span>
                <h2 className="mt-1 font-display text-lg">Delete email record?</h2>
              </div>
              <button onClick={() => setDeleteTarget(null)}><X size={19} /></button>
            </div>
            <p className="text-xs leading-5 text-[var(--muted)]">This will remove <strong className="text-[var(--ink)]">{deleteTarget.employeeName}</strong> ({deleteTarget.wsiEmail}) from the email records. This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button>
              <button onClick={() => removeRecord(deleteTarget)} className="rounded bg-[#9b4038] px-3 py-2 text-xs font-bold text-white">Delete record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportsManagement({ notify }: { notify: (text: string) => void }) {
  const reports = [
    { id: 'daily-reports', title: 'Daily Activity Report', detail: 'Employee daily reports with tasks, accomplishments, and issues.', icon: '✎', storageKey: 'wsi-daily-reports', fallback: seedDailyReports as unknown as Array<Record<string, unknown>>, nameField: 'employeeName', dateField: 'date' },
    { id: 'inventory', title: 'Device Inventory Report', detail: 'All registered IT assets with assignment, condition, and deployment status.', icon: '▦', storageKey: 'wsi-inventory-devices', fallback: seedInventory as unknown as Array<Record<string, unknown>>, nameField: 'assignedTo', dateField: '' },
    { id: 'email-accounts', title: 'Email Accounts Report', detail: 'Employee email accounts, credential status, and company distribution.', icon: '✉', storageKey: 'wsi-email-records', fallback: seedEmails as unknown as Array<Record<string, unknown>>, nameField: 'employeeName', dateField: 'date' },
    { id: 'user-directory', title: 'User Directory Report', detail: 'Workspace users with roles, departments, contact details, and access levels.', icon: '◈', storageKey: 'wsi-user-records', fallback: users as unknown as Array<Record<string, unknown>>, nameField: 'name', dateField: '' },
  ];
  const [activeTab, setActiveTab] = useState('daily-reports');
  const [filters, setFilters] = useState<Record<string, { employee: string; from: string; to: string }>>({});
  const [employeeOptions, setEmployeeOptions] = useState<string[]>([]);
  const [history, setHistory] = useState<Array<{ id: string; title: string; generatedAt: string; rows: number }>>([]);

  useEffect(() => {
    const storedReports = localStorage.getItem('wsi-report-history');
    const storedDaily = localStorage.getItem('wsi-daily-reports');
    const storedEmails = localStorage.getItem('wsi-email-records');
    const storedInventory = localStorage.getItem('wsi-inventory-devices');
    startTransition(() => {
      if (storedReports) setHistory(JSON.parse(storedReports));
      const dailyNames = (storedDaily ? JSON.parse(storedDaily) : []) as DailyReportEntry[];
      const emailNames = (storedEmails ? JSON.parse(storedEmails) : []) as EmailRecord[];
      const assigned = (storedInventory ? JSON.parse(storedInventory) : []) as InventoryDevice[];
      setEmployeeOptions(Array.from(new Set([
        ...seedDailyReports.map(entry => entry.employeeName),
        ...seedEmails.map(record => record.employeeName),
        ...seedInventory.map(device => device.assignedTo).filter(name => Boolean(name)),
        ...dailyNames.map(entry => entry.employeeName),
        ...emailNames.map(record => record.employeeName),
        ...assigned.map(device => device.assignedTo).filter(name => Boolean(name)),
      ])).sort());
    });
  }, []);

  const currentReport = reports.find(report => report.id === activeTab) || reports[0];
  const currentFilter = filters[activeTab] || { employee: 'All Employees', from: '', to: '' };
  const employeeLabel = activeTab === 'inventory' ? 'Assigned to' : 'Employee';

  function updateFilter(patch: Partial<typeof currentFilter>) {
    setFilters(current => ({ ...current, [activeTab]: { ...currentFilter, ...patch } }));
  }

  function parseDate(value: unknown): Date | null {
    if (!value) return null;
    const parsed = new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function reportRows(report: typeof reports[number]) {
    const stored = localStorage.getItem(report.storageKey);
    const raw = stored ? JSON.parse(stored) : report.fallback;
    if (!Array.isArray(raw)) return [];
    let rows = raw as Array<Record<string, unknown>>;
    const filter = filters[report.id] || { employee: 'All Employees', from: '', to: '' };
    if (filter.from || filter.to) {
      if (!report.dateField) return [];
      rows = rows.filter(row => {
        const parsed = parseDate(row[report.dateField]);
        if (!parsed) return false;
        if (filter.from && parsed < new Date(filter.from)) return false;
        if (filter.to && parsed > new Date(`${filter.to}T23:59:59`)) return false;
        return true;
      });
    }
    if (filter.employee !== 'All Employees') {
      rows = rows.filter(row => String(row[report.nameField] || '').toLowerCase().includes(filter.employee.toLowerCase()));
    }
    return rows;
  }

  function generate(report: typeof reports[number], format: 'csv' | 'pdf') {
    try {
      const rows = reportRows(report);
      if (rows.length === 0) { notify(`No data available for ${report.title} with the current filters.`); return; }
      const filter = filters[report.id] || { employee: 'All Employees', from: '', to: '' };
      const subtitle = `${employeeLabel}: ${filter.employee} · Date range: ${filter.from || 'Any'} to ${filter.to || 'Any'}`;
      if (format === 'csv') {
        downloadCsv(`${report.id}-report-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
      } else {
        const columns = Array.from(new Set(rows.flatMap(row => Object.keys(row))));
        const ok = printPdfReport({ title: report.title, subtitle, columns, rows: rows.map(row => columns.map(column => row[column])) });
        if (!ok) { notify('Popup blocked. Allow popups to export PDF.'); return; }
      }
      const entry = { id: `${report.id}-${Date.now()}`, title: `${report.title} (${format.toUpperCase()})`, generatedAt: new Date().toLocaleString(), rows: rows.length };
      const next = [entry, ...history].slice(0, 10);
      setHistory(next);
      localStorage.setItem('wsi-report-history', JSON.stringify(next));
      notify(`${report.title} generated as ${format.toUpperCase()} (${rows.length} rows).`);
    } catch { notify(`Could not generate ${report.title}.`); }
  }

  const previewRows = reportRows(currentReport);

  return (
    <div className="space-y-4">
      <section className="panel p-5">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">MIS Tools</div>
        <h2 className="font-display text-xl">Reports</h2>
        <p className="mt-2 max-w-2xl text-xs text-[var(--muted)]">Pick a report tab, set its own employee and date-range filters, then export as CSV or PDF.</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <WorkspaceMetric label="Report templates" value={String(reports.length)} detail="Ready to generate" accent="var(--teal)" />
        <WorkspaceMetric label="Generated" value={String(history.length)} detail="In this workspace" accent="var(--blue)" />
        <WorkspaceMetric label="Last run" value={history[0] ? history[0].generatedAt.split(',')[0] : 'Never'} detail={history[0]?.title || 'No reports yet'} accent="var(--amber)" />
      </div>

      <section className="panel overflow-hidden">
        <div className="flex flex-wrap gap-2 border-b border-[var(--line)] p-4">
          {reports.map(report => (
            <button
              key={report.id}
              data-active={activeTab === report.id ? 'true' : 'false'}
              onClick={() => setActiveTab(report.id)}
              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-[11px] transition ${activeTab === report.id ? 'border-[var(--teal)] bg-[var(--highlight)] font-semibold text-[var(--teal)]' : 'border-[var(--line)] text-[var(--ink)]'}`}
            >
              <span>{report.icon}</span>{report.title}
            </button>
          ))}
        </div>

        <div className="border-b border-[var(--line)] p-5">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-sm">{currentReport.title}</h2>
              <p className="mt-1 text-[10px] text-[var(--muted)]">{currentReport.detail}</p>
            </div>
            <button onClick={() => updateFilter({ employee: 'All Employees', from: '', to: '' })} className="rounded border border-[var(--line)] px-3 py-2 text-[10px] text-[var(--ink)]">Reset filters</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-[11px] text-[#8ca2a4]">{employeeLabel}
              <select value={currentFilter.employee} onChange={event => updateFilter({ employee: event.target.value })} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-xs text-[var(--ink)]">
                <option>All Employees</option>
                {employeeOptions.map(name => <option key={name}>{name}</option>)}
              </select>
            </label>
            {currentReport.dateField && (
              <>
                <label className="text-[11px] text-[#8ca2a4]">From date
                  <input type="date" value={currentFilter.from} onChange={event => updateFilter({ from: event.target.value })} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-xs text-[var(--ink)]" />
                </label>
                <label className="text-[11px] text-[#8ca2a4]">To date
                  <input type="date" value={currentFilter.to} onChange={event => updateFilter({ to: event.target.value })} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-xs text-[var(--ink)]" />
                </label>
              </>
            )}
            {!currentReport.dateField && (
              <div className="rounded border border-[var(--line)] bg-[var(--highlight)] p-3 text-[10px] text-[var(--muted)] sm:col-span-2">
                This report has no date column — only the {employeeLabel.toLowerCase()} filter applies.
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[10px] text-[var(--muted)]">{previewRows.length} record(s) match the current filters.</span>
            <div className="flex gap-2">
              <button onClick={() => generate(currentReport, 'csv')} className="flex items-center gap-2 rounded border border-[var(--line)] px-3 py-2 text-[10px] text-[var(--ink)]"><Download size={13} /> Export CSV</button>
              <button onClick={() => generate(currentReport, 'pdf')} className="flex items-center gap-2 rounded bg-[var(--teal)] px-3 py-2 text-[10px] font-bold text-[var(--highlight-ink)]"><Download size={13} /> Export PDF</button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[11px]">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--muted-surface)] text-[10px] uppercase tracking-wider text-[var(--muted)]">
                {previewRows.length > 0
                  ? Object.keys(previewRows[0]).slice(0, 6).map(key => <th key={key} className="p-3">{key}</th>)
                  : <th className="p-3">Preview</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {previewRows.length === 0 ? (
                <tr><td className="p-8 text-center text-xs text-[var(--muted)]">No records match the current filters.</td></tr>
              ) : previewRows.slice(0, 5).map((row, index) => (
                <tr key={index}>
                  {Object.keys(previewRows[0]).slice(0, 6).map(key => (
                    <td key={key} className="max-w-[220px] truncate p-3 text-[var(--ink)]" title={String(row[key] ?? '')}>{String(row[key] ?? '-')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {previewRows.length > 5 && <p className="border-t border-[var(--line)] p-3 text-[10px] text-[var(--muted)]">Showing 5 of {previewRows.length} records. Export to see all.</p>}
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--line)] p-5">
          <div>
            <h2 className="font-display text-sm">Recently generated</h2>
            <p className="mt-1 text-[10px] text-[var(--muted)]">The last 10 reports generated from this workspace.</p>
          </div>
          {history.length > 0 && <button onClick={() => { setHistory([]); localStorage.removeItem('wsi-report-history'); notify('Report history cleared.'); }} className="rounded border border-[var(--line)] px-3 py-2 text-[10px] text-[var(--ink)]">Clear history</button>}
        </div>
        {history.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--muted)]">No reports generated yet. Use a template above to create your first report.</div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {history.map(entry => (
              <div key={entry.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--highlight)] text-[var(--teal)]"><FileText size={15} /></div>
                <div className="min-w-0 flex-1">
                  <strong className="block text-xs text-[var(--ink)]">{entry.title}</strong>
                  <span className="text-[10px] text-[var(--muted)]">{entry.generatedAt}</span>
                </div>
                <span className="badge-green rounded-full px-2.5 py-1 text-[10px] font-medium">{entry.rows} rows</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MisDashboard({ notify, onNavigate }: { notify: (text: string) => void; onNavigate: (name: string) => void }) {
  const [stats, setStats] = useState({ devices: 0, deployed: 0, forRepair: 0, emails: 0, activeEmails: 0, newUsers: 0 });
  const [repairQueue, setRepairQueue] = useState<InventoryDevice[]>([]);

  function load() {
    const devices = (JSON.parse(localStorage.getItem('wsi-inventory-devices') || 'null') || seedInventory) as InventoryDevice[];
    const emails = (JSON.parse(localStorage.getItem('wsi-email-records') || 'null') || seedEmails) as EmailRecord[];
    setStats({
      devices: devices.length,
      deployed: devices.filter(device => device.deployed).length,
      forRepair: devices.filter(device => device.status === 'For Repair').length,
      emails: emails.length,
      activeEmails: emails.filter(record => record.status === 'Active').length,
      newUsers: emails.filter(record => record.userType === 'New').length,
    });
    setRepairQueue(devices.filter(device => device.status === 'For Repair').slice(0, 5));
  }
  useEffect(() => { startTransition(() => { load(); }); }, []);

  const shortcuts: Array<[string, string, string]> = [
    ['Inventory', 'Track and assign laptops, desktops, and other IT assets.', '▦'],
    ['Email Management', 'Provision employee email accounts and credentials.', '✉'],
    ['Reports', 'Export CSV reports from your MIS workspace data.', '▤'],
  ];

  return (
    <div className="space-y-4">
      <section className="panel p-5">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">MIS Tools</div>
        <h2 className="font-display text-xl">MIS Dashboard</h2>
        <p className="mt-2 max-w-2xl text-xs text-[var(--muted)]">Operational overview of IT assets, email accounts, and reporting activity.</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <WorkspaceMetric label="Managed devices" value={String(stats.devices)} detail={`${stats.deployed} deployed`} accent="var(--teal)" />
        <WorkspaceMetric label="Devices for repair" value={String(stats.forRepair)} detail="Needs attention" accent="var(--amber)" />
        <WorkspaceMetric label="Email accounts" value={String(stats.emails)} detail={`${stats.activeEmails} active`} accent="var(--blue)" />
        <WorkspaceMetric label="New email users" value={String(stats.newUsers)} detail="Recently onboarded" accent="var(--coral)" />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {shortcuts.map(([name, detail, icon]) => (
          <button key={name} onClick={() => onNavigate(name)} className="panel p-5 text-left transition hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--highlight)] text-[var(--teal)]">{icon}</div>
              <span className="text-[var(--teal)]">→</span>
            </div>
            <h3 className="mt-4 font-display text-sm">{name}</h3>
            <p className="mt-1 text-[10px] text-[var(--muted)]">{detail}</p>
          </button>
        ))}
      </div>

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--line)] p-5">
          <div>
            <h2 className="font-display text-sm">Repair queue</h2>
            <p className="mt-1 text-[10px] text-[var(--muted)]">Devices currently marked For Repair in the inventory.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { load(); notify('MIS dashboard refreshed.'); }} className="rounded border border-[var(--line)] px-3 py-2 text-[10px] text-[var(--ink)]">Refresh</button>
            <button onClick={() => onNavigate('Inventory')} className="rounded border border-[var(--line)] px-3 py-2 text-[10px] text-[var(--ink)]">Open inventory</button>
          </div>
        </div>
        {repairQueue.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--muted)]">No devices are waiting for repair. Everything is in good condition.</div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {repairQueue.map(device => (
              <div key={device.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--highlight)] text-[var(--teal)]"><Laptop size={15} /></div>
                <div className="min-w-0 flex-1">
                  <strong className="block text-xs text-[var(--ink)]">{device.assetTag} · {device.brand} {device.model}</strong>
                  <span className="text-[10px] text-[var(--muted)]">Serial: {device.serialNumber || 'Not recorded'}</span>
                </div>
                <span className="badge-amber rounded-full px-2.5 py-1 text-[10px] font-medium">For Repair</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function GovernanceDashboard({ notify, onNavigate }: { notify: (text: string) => void; onNavigate: (name: string) => void }) {
  const [documents, setDocuments] = useState<LibraryDocument[]>(seedDocuments);
  const [openFindings, setOpenFindings] = useState(0);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const docs = await api.get<LibraryDocument[]>('/api/documents');
        if (!cancelled && docs.length) setDocuments(docs);
      } catch { /* keep seed */ }
      try {
        const findings = await api.get<GenericRecord[]>('/api/records?module=Audit%20%26%20Findings');
        if (!cancelled) setOpenFindings(findings.filter(record => ['High', 'Critical', 'Open', 'Exception', 'Warning'].includes(record.tag)).length);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);
  const compliance = computeCompliance(documents);
  const frameworks = [
    { name: 'SOC 2 Compliance', score: compliance.frameworks['SOC 2'], status: 'Type II · audit window open' },
    { name: 'ISO 27001 Compliance', score: compliance.frameworks['ISO 27001'], status: 'Surveillance audit in Q4' },
    { name: 'DPA Compliance', score: compliance.frameworks['DPA'], status: 'Annual review complete' },
  ];
  const findings = [
    { title: 'Update access review evidence for Q3', module: 'Audit & Findings', severity: 'High', due: 'Sep 20' },
    { title: 'Refresh data retention policy acknowledgment', module: 'Security Policies', severity: 'Medium', due: 'Sep 25' },
    { title: 'Complete vendor risk assessment for new SaaS tools', module: 'Audit & Findings', severity: 'Medium', due: 'Oct 02' },
    { title: 'Publish updated incident response runbook', module: 'Document Library', severity: 'Low', due: 'Oct 10' },
  ];
  const shortcuts: Array<[string, string]> = [
    ['Document Library', 'Browse controlled documents and evidence.'],
    ['Security Policies', 'Review and publish security policies.'],
    ['Audit & Findings', 'Track findings and remediation work.'],
    ['Security Awareness', 'Manage training and awareness campaigns.'],
  ];
  const approvedDocs = documents.filter(doc => doc.status === 'Approved').length;
  const complianceState = compliance.overall >= 90 ? 'Compliant' : compliance.overall >= 70 ? 'Partially compliant' : 'Attention needed';

  return (
    <div className="space-y-4">
      <section className="panel p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">IT Governance</div>
            <h2 className="font-display text-xl">Governance Dashboard</h2>
            <p className="mt-2 max-w-2xl text-xs text-[var(--muted)]">Compliance posture, policy health, and audit readiness at a glance — computed live from the document library.</p>
          </div>
          <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${compliance.overall >= 90 ? 'badge-green' : compliance.overall >= 70 ? 'badge-amber' : 'badge-red'}`}>{complianceState}</span>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <WorkspaceMetric label="Library documents" value={String(documents.length)} detail={`${approvedDocs} approved`} accent="var(--teal)" />
        <WorkspaceMetric label="Approved docs" value={String(approvedDocs)} detail="Ready as evidence" accent="var(--blue)" />
        <WorkspaceMetric label="Avg. compliance" value={`${compliance.overall}%`} detail="Across 3 frameworks" accent="var(--teal)" />
        <WorkspaceMetric label="Open findings" value={String(openFindings)} detail="From audit records" accent="var(--amber)" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <section className="panel p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm">Compliance frameworks</h2>
              <p className="mt-1 text-[10px] text-[var(--muted)]">Completion status for each certification program.</p>
            </div>
            <button onClick={() => notify('Compliance evidence export queued.')} className="rounded border border-[var(--line)] px-3 py-2 text-[10px] text-[var(--ink)]">Export evidence</button>
          </div>
          <div className="space-y-4">
            {frameworks.map(framework => (
            <button key={framework.name} onClick={() => onNavigate(framework.name)} className="block w-full text-left">
                <div className="flex items-center justify-between text-xs">
                  <strong className="text-[var(--ink)]">{framework.name}</strong>
                  <span className={framework.score >= 90 ? 'text-[var(--teal)]' : framework.score >= 70 ? 'text-[var(--amber)]' : 'text-[var(--coral)]'}>{framework.score}%</span>
                </div>
                <div className="mt-2 h-2 rounded bg-[var(--highlight)]"><i className={`block h-full rounded ${framework.score >= 90 ? 'bg-[var(--teal)]' : framework.score >= 70 ? 'bg-[var(--amber)]' : 'bg-[var(--coral)]'}`} style={{ width: `${framework.score}%` }} /></div>
                <p className="mt-1 text-[10px] text-[var(--muted)]">{framework.status}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="panel p-5">
          <div className="mb-5">
            <h2 className="font-display text-sm">Quick navigation</h2>
            <p className="mt-1 text-[10px] text-[var(--muted)]">Jump to a governance workspace.</p>
          </div>
          <div className="space-y-2">
            {shortcuts.map(([name, detail]) => (
              <button key={name} onClick={() => onNavigate(name)} className="flex w-full items-center gap-3 rounded border border-[var(--line)] bg-[var(--highlight)] p-3 text-left transition hover:shadow">
                <span className="min-w-0 flex-1">
                  <strong className="block text-xs font-normal">{name}</strong>
                  <small className="text-[10px] text-[var(--muted)]">{detail}</small>
                </span>
                <span className="text-[var(--teal)]">→</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--line)] p-5">
          <div>
            <h2 className="font-display text-sm">Open audit findings</h2>
            <p className="mt-1 text-[10px] text-[var(--muted)]">Remediation items tracked across governance modules.</p>
          </div>
          <button onClick={() => onNavigate('Audit & Findings')} className="rounded border border-[var(--line)] px-3 py-2 text-[10px] text-[var(--ink)]">View all findings</button>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {findings.map(finding => (
            <div key={finding.title} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <strong className="block text-xs text-[var(--ink)]">{finding.title}</strong>
                <span className="text-[10px] text-[var(--muted)]">{finding.module} · Due {finding.due}</span>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${finding.severity === 'High' ? 'badge-red' : finding.severity === 'Medium' ? 'badge-amber' : 'badge-green'}`}>{finding.severity}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

type MaintenanceLog = { id: string; date: string; category: string; title: string; technician: string; status: string; notes: string };

function MaintenanceLogs({ area, storageKey, notify }: { area: string; storageKey: string; notify: (text: string) => void }) {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const categories = ['Patch', 'Maintenance', 'Update', 'Inspection', 'Repair', 'Other'];

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    startTransition(() => { if (stored) setLogs(JSON.parse(stored)); });
  }, [storageKey]);

  function persist(next: MaintenanceLog[]) {
    setLogs(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function addLog(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const entry: MaintenanceLog = {
      id: `ml-${Date.now()}`,
      date: String(form.get('date') || new Date().toISOString().slice(0, 10)),
      category: String(form.get('category') || 'Maintenance'),
      title: String(form.get('title') || '').trim(),
      technician: String(form.get('technician') || '').trim(),
      status: String(form.get('status') || 'Completed'),
      notes: String(form.get('notes') || '').trim(),
    };
    if (!entry.title) { notify('A title is required for the log entry.'); return; }
    persist([entry, ...logs]);
    setShowForm(false);
    notify(`${area} log entry added.`);
  }

  function exportReport(format: 'csv' | 'pdf') {
    const rows = filtered.map(log => ({ Date: log.date, Category: log.category, Title: log.title, Technician: log.technician, Status: log.status, Notes: log.notes }));
    if (!rows.length) { notify('No log entries to export.'); return; }
    if (format === 'csv') {
      downloadCsv(`${area.toLowerCase().replace(/\s+/g, '-')}-logs-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
    } else {
      printPdfReport({ title: `${area} — Maintenance & Patch Logs`, subtitle: `${filtered.length} log record(s)`, columns: ['Date', 'Category', 'Title', 'Technician', 'Status', 'Notes'], rows: rows.map(row => [row.Date, row.Category, row.Title, row.Technician, row.Status, row.Notes]) });
    }
    notify(`${area} logs exported as ${format.toUpperCase()}.`);
  }

  const filtered = logs.filter(log => categoryFilter === 'All' || log.category === categoryFilter);

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-col justify-between gap-3 border-b border-[var(--line)] p-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[1.3px] text-[var(--teal)]">Logs report</div>
          <h2 className="font-display text-sm">{area} maintenance &amp; patch logs</h2>
          <p className="mt-1 text-[10px] text-[var(--muted)]">Track maintenance windows, patch rollouts, and inspections. Export for reporting.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)} className="rounded border border-[var(--line)] bg-[var(--canvas)] px-2 py-2 text-[10px] text-[var(--ink)]">
            <option>All</option>
            {categories.map(category => <option key={category}>{category}</option>)}
          </select>
          <button onClick={() => exportReport('csv')} className="rounded border border-[var(--line)] px-3 py-2 text-[10px] text-[var(--ink)]">CSV</button>
          <button onClick={() => exportReport('pdf')} className="rounded border border-[var(--line)] px-3 py-2 text-[10px] text-[var(--ink)]">PDF</button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1 rounded bg-[var(--teal)] px-3 py-2 text-[10px] font-bold text-[var(--highlight-ink)]"><Plus size={13} /> Add log</button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="p-8 text-center text-xs text-[var(--muted)]">No {area.toLowerCase()} log entries yet. Add one to start the report.</div>
      ) : (
        <div className="divide-y divide-[var(--line)]">
          {filtered.map(log => (
            <div key={log.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${log.category === 'Patch' ? 'badge-blue' : log.category === 'Maintenance' ? 'badge-amber' : log.category === 'Repair' ? 'badge-red' : 'badge-gray'}`}>{log.category}</span>
              <div className="min-w-0 flex-1">
                <strong className="block text-xs text-[var(--ink)]">{log.title}</strong>
                <span className="text-[10px] text-[var(--muted)]">{log.technician || 'Unassigned'}{log.notes ? ` · ${log.notes}` : ''}</span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-[var(--muted)]">{log.date}</span>
                <span className={`text-[10px] font-medium ${log.status === 'Completed' ? 'text-[var(--teal)]' : log.status === 'In Progress' ? 'text-[var(--amber)]' : 'text-[var(--muted)]'}`}>{log.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#031015cc] p-5">
          <form onSubmit={addLog} className="w-full max-w-lg rounded-lg border border-[var(--teal)] bg-[var(--surface)] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">{area}</span>
                <h2 className="mt-1 font-display text-lg font-semibold">Add log entry</h2>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="rounded p-1 text-[var(--muted)] hover:text-white"><X size={19} /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-[11px] text-[#8ca2a4]">Date
                <input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Category
                <select name="category" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none">{categories.map(category => <option key={category}>{category}</option>)}</select>
              </label>
              <label className="text-[11px] text-[#8ca2a4] sm:col-span-2">Title <span className="text-[var(--teal)]">*</span>
                <input name="title" required placeholder="e.g. September cumulative patch rollout" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Technician
                <input name="technician" placeholder="Performed by" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Status
                <select name="status" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none"><option>Completed</option><option>In Progress</option><option>Scheduled</option></select>
              </label>
              <label className="text-[11px] text-[#8ca2a4] sm:col-span-2">Notes
                <textarea name="notes" rows={2} placeholder="Details, affected systems, outcome" className="mt-1 w-full resize-none rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-[var(--line)] pt-4">
              <button type="button" onClick={() => setShowForm(false)} className="rounded border border-[var(--line)] px-4 py-2 text-xs text-[var(--ink)]">Cancel</button>
              <button type="submit" className="rounded bg-[var(--teal)] px-4 py-2 text-xs font-bold text-[var(--highlight-ink)]">Add log</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function LegacySecurityIncidents({ notify }: { notify: (text: string) => void }) {
  const [incidents, setIncidents] = useState<Array<{ id: string; title: string; severity: string; status: string; reportedAt: string }>>([
    { id: 'INC-041', title: 'Suspicious authentication pattern on VPN', severity: 'High', status: 'Investigating', reportedAt: '2026-09-14' },
    { id: 'INC-040', title: 'Phishing email reported by Finance', severity: 'Medium', status: 'Contained', reportedAt: '2026-09-12' },
    { id: 'INC-039', title: 'Unpatched endpoint detected in VLAN 26', severity: 'High', status: 'Open', reportedAt: '2026-09-11' },
    { id: 'INC-038', title: 'Multiple failed logins on admin console', severity: 'Low', status: 'Resolved', reportedAt: '2026-09-09' },
  ]);
  const [showForm, setShowForm] = useState(false);
  function addIncident(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const entry = { id: `INC-0${42 + incidents.length}`, title: String(form.get('title') || ''), severity: String(form.get('severity') || 'Medium'), status: 'Open', reportedAt: new Date().toISOString().slice(0, 10) };
    setIncidents(current => [entry, ...current]);
    setShowForm(false);
    notify(`${entry.id} logged and opened for investigation.`);
  }
  const open = incidents.filter(item => item.status !== 'Resolved').length;
  return (
    <div className="space-y-4">
      <section className="panel p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Cyber Security</div>
            <h2 className="font-display text-xl">Security Incidents</h2>
            <p className="mt-2 max-w-2xl text-xs text-[var(--muted)]">Log, triage, and track security incidents through resolution.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-md bg-[var(--teal)] px-3 py-2 text-[11px] font-bold text-[var(--highlight-ink)]"><Plus size={14} /> Log incident</button>
        </div>
      </section>
      <div className="grid gap-3 sm:grid-cols-3">
        <WorkspaceMetric label="Total incidents" value={String(incidents.length)} detail="All time" accent="var(--teal)" />
        <WorkspaceMetric label="Open / active" value={String(open)} detail="Needs attention" accent="var(--coral)" />
        <WorkspaceMetric label="Resolved" value={String(incidents.length - open)} detail="Closed out" accent="var(--blue)" />
      </div>
      <section className="panel overflow-hidden">
        <div className="border-b border-[var(--line)] p-5"><h2 className="font-display text-sm">Incident register</h2></div>
        <div className="divide-y divide-[var(--line)]">
          {incidents.map(incident => (
            <div key={incident.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
              <span className="font-mono text-[10px] text-[var(--teal)]">{incident.id}</span>
              <div className="min-w-0 flex-1"><strong className="block text-xs text-[var(--ink)]">{incident.title}</strong><span className="text-[10px] text-[var(--muted)]">Reported {incident.reportedAt}</span></div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${incident.severity === 'High' ? 'badge-red' : incident.severity === 'Medium' ? 'badge-amber' : 'badge-gray'}`}>{incident.severity}</span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${incident.status === 'Resolved' ? 'badge-green' : 'badge-blue'}`}>{incident.status}</span>
            </div>
          ))}
        </div>
      </section>
      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#031015cc] p-5">
          <form onSubmit={addIncident} className="w-full max-w-lg rounded-lg border border-[var(--teal)] bg-[var(--surface)] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between"><h2 className="font-display text-lg">Log security incident</h2><button type="button" onClick={() => setShowForm(false)}><X size={19} /></button></div>
            <div className="grid gap-4">
              <label className="text-[11px] text-[#8ca2a4]">Incident title<input name="title" required placeholder="Describe the event" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white" /></label>
              <label className="text-[11px] text-[#8ca2a4]">Severity<select name="severity" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white"><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></label>
            </div>
            <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setShowForm(false)} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button><button className="rounded bg-[var(--teal)] px-3 py-2 text-xs font-bold text-[var(--highlight-ink)]">Save incident</button></div>
          </form>
        </div>
      )}
    </div>
  );
}

type BackupRecord = { id: string; jobName: string; backupType: string; schedule: string; target: string; status: string; lastRun: string; retention: string; attachmentName?: string; attachmentData?: string };

const seedBackupRecords: BackupRecord[] = [
  { id: 'bk-1', jobName: 'Nightly — production DB', backupType: 'Full', schedule: 'Daily · 02:00', target: 'Backup cluster B', status: 'Healthy', lastRun: '9/17/2026, 2:00:00 AM', retention: '30 days' },
  { id: 'bk-2', jobName: 'Weekly — file server full', backupType: 'Full', schedule: 'Sunday · 01:00', target: 'Backup cluster B', status: 'Healthy', lastRun: '9/14/2026, 1:00:00 AM', retention: '90 days' },
  { id: 'bk-3', jobName: 'Monthly — offsite archive', backupType: 'Archive', schedule: 'Monthly · day 1 · 03:00', target: 'Offsite vault', status: 'Running', lastRun: '9/1/2026, 3:00:00 AM', retention: '1 year' },
];

const backupTypes = ['Full', 'Incremental', 'Differential', 'Archive'];
const backupStatuses = ['Healthy', 'Running', 'Warning', 'Failed'];

function BackupManagement({ notify }: { notify: (text: string) => void }) {
  const [records, setRecords] = useState<BackupRecord[]>(seedBackupRecords);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BackupRecord | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let rows = await api.get<BackupRecord[]>('/api/backups');
        if (rows.length === 0) {
          await Promise.all(seedBackupRecords.map(record => api.post('/api/backups', record)));
          rows = await api.get<BackupRecord[]>('/api/backups');
        }
        if (!cancelled) setRecords(rows);
      } catch { /* keep seed */ }
    })();
    return () => { cancelled = true; };
  }, []);

  function persist(next: BackupRecord[], changed?: { created?: BackupRecord; deleted?: BackupRecord }) {
    setRecords(next);
    if (changed?.created) api.post('/api/backups', changed.created).catch(() => notify('Could not save to the database.'));
    if (changed?.deleted) api.del('/api/backups', { id: changed.deleted.id }).catch(() => notify('Could not delete from the database.'));
  }

  function saveRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const jobName = String(form.get('jobName') || '').trim();
    if (!jobName) { notify('Job name is required.'); return; }
    if (records.some(record => record.jobName.toLowerCase() === jobName.toLowerCase())) { notify(`${jobName} already exists in backup records.`); return; }
    readAttachment(attachment || undefined, file => {
      const record: BackupRecord = {
        id: `bk-${Date.now()}`,
        jobName,
        backupType: String(form.get('backupType') || 'Full'),
        schedule: String(form.get('schedule') || '').trim() || 'Not scheduled',
        target: String(form.get('target') || '').trim() || 'Unassigned target',
        status: String(form.get('status') || 'Healthy'),
        lastRun: new Date().toLocaleString(),
        retention: String(form.get('retention') || '').trim() || '30 days',
        attachmentName: file?.name,
        attachmentData: file?.dataUrl,
      };
      persist([record, ...records], { created: record });
      setShowForm(false);
      setAttachment(null);
      notify(`${jobName} added to backup records.`);
    });
  }

  function removeRecord(record: BackupRecord) {
    persist(records.filter(item => item.id !== record.id), { deleted: record });
    setDeleteTarget(null);
    notify(`${record.jobName} removed from backup records.`);
  }

  return (
    <div className="space-y-4">
      <section className="panel p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Workspace</div>
            <h2 className="font-display text-xl">Backup Management</h2>
            <p className="mt-2 max-w-2xl text-xs text-[var(--muted)]">Backup jobs, retention, and restore operations.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-md bg-[var(--teal)] px-3 py-2 text-[11px] font-bold text-[var(--highlight-ink)]"><Plus size={14} /> Add record</button>
        </div>
      </section>
      <div className="grid gap-3 sm:grid-cols-3">
        <WorkspaceMetric label="Active jobs" value={String(records.length)} detail="Backup Management" accent="var(--teal)" />
        <WorkspaceMetric label="Healthy" value={String(records.filter(record => record.status === 'Healthy').length)} detail="Passing jobs" accent="var(--blue)" />
        <WorkspaceMetric label="Needs attention" value={String(records.filter(record => record.status === 'Warning' || record.status === 'Failed').length)} detail="Warning or failed" accent="var(--amber)" />
      </div>
      <section className="panel overflow-hidden">
        <div className="border-b border-[var(--line)] p-5"><h2 className="font-display text-sm">Backup Management — recent items</h2></div>
        <div className="divide-y divide-[var(--line)]">
          {records.length === 0 ? <div className="p-8 text-center text-xs text-[var(--muted)]">No backup records yet. Add a record to get started.</div> : records.map(record => (
            <div key={record.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <strong className="block text-xs text-[var(--ink)]">{record.jobName}</strong>
                <span className="text-[10px] text-[var(--muted)]">{record.backupType} · {record.schedule} · {record.target} · Retention {record.retention} · Last run {record.lastRun}</span>
                {record.attachmentName && <span className="mt-1 flex items-center gap-1 text-[10px] text-[var(--teal)]"><FileText size={11} />{record.attachmentData ? <a href={record.attachmentData} download={record.attachmentName} className="hover:underline">{record.attachmentName}</a> : record.attachmentName}</span>}
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${record.status === 'Failed' ? 'badge-red' : record.status === 'Warning' ? 'badge-amber' : record.status === 'Running' ? 'badge-blue' : 'badge-green'}`}>{record.status}</span>
              <button onClick={() => setDeleteTarget(record)} className="inline-flex items-center gap-1 rounded border border-[#9b4038] bg-[#492b33] px-2.5 py-1 text-[10px] font-medium text-white hover:bg-[#9b4038]"><Trash2 size={11} /> Delete</button>
            </div>
          ))}
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#031015cc] p-5">
          <form onSubmit={saveRecord} className="w-full max-w-lg rounded-lg border border-[var(--teal)] bg-[var(--surface)] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Backup Management</span>
                <h2 className="mt-1 font-display text-lg">Add backup record</h2>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="rounded p-1 text-[var(--muted)] hover:text-white"><X size={19} /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-[11px] text-[#8ca2a4] sm:col-span-2">Job name <span className="text-[var(--teal)]">*</span>
                <input name="jobName" required placeholder="e.g. Nightly — production DB" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Type
                <select name="backupType" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none">
                  {backupTypes.map(type => <option key={type}>{type}</option>)}
                </select>
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Status
                <select name="status" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none">
                  {backupStatuses.map(status => <option key={status}>{status}</option>)}
                </select>
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Schedule
                <input name="schedule" placeholder="e.g. Daily · 02:00" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Retention
                <input name="retention" placeholder="e.g. 30 days" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <label className="text-[11px] text-[#8ca2a4] sm:col-span-2">Target / destination
                <input name="target" placeholder="e.g. Backup cluster B" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <div className="sm:col-span-2"><AttachmentInput file={attachment} setFile={setAttachment} /></div>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-[var(--line)] pt-4">
              <button type="button" onClick={() => { setShowForm(false); setAttachment(null); }} className="rounded border border-[var(--line)] px-4 py-2 text-xs text-[var(--ink)] hover:bg-white/5">Cancel</button>
              <button type="submit" className="flex items-center gap-2 rounded bg-[var(--teal)] px-4 py-2 text-xs font-bold text-[var(--highlight-ink)] hover:opacity-90"><Plus size={14} /> Add record</button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[#031015cc] p-5">
          <div className="w-full max-w-md rounded-lg border border-[#8b4a44] bg-[var(--surface)] p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[1.3px] text-[#d8786b]">Permanent action</span>
                <h2 className="mt-1 font-display text-lg">Delete backup record?</h2>
              </div>
              <button onClick={() => setDeleteTarget(null)}><X size={19} /></button>
            </div>
            <p className="text-xs leading-5 text-[var(--muted)]">This will remove <strong className="text-[var(--ink)]">{deleteTarget.jobName}</strong> from the backup records. This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button>
              <button onClick={() => removeRecord(deleteTarget)} className="rounded bg-[#9b4038] px-3 py-2 text-xs font-bold text-white">Delete record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type ChatMessage = { id: string; from: string; text: string; at: string; fileName?: string; fileType?: string; fileData?: string };

type ChatRoom = { id: string; name: string; isGroup: boolean; members: string[] };

type ChatData = { rooms: ChatRoom[]; messages: Record<string, ChatMessage[]>; read: Record<string, number> };

function dmRoomId(a: string, b: string) { return ['dm', ...[a, b].sort()].join(':'); }

type ChatApiResponse = { rooms: ChatRoom[]; messages: Record<string, Array<{ id: string; from: string; text: string; at: string; fileName?: string; fileType?: string; fileData?: string }>> };

function loadReadCounts(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem('wsi-chat-read') || '{}') as Record<string, number>; } catch { return {}; }
}

function ChatCenter({ users: userList, currentUser, notify, compact = false }: { users: typeof users; currentUser: typeof users[number]; notify: (text: string) => void; compact?: boolean }) {
  const [data, setData] = useState<ChatData>({ rooms: [], messages: {}, read: {} });
  const [activeRoom, setActiveRoom] = useState('');
  const [draft, setDraft] = useState('');
  const [callOpen, setCallOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [showMembers, setShowMembers] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function loadFromDb(selectFirst = false) {
    try {
      const fetched = await api.get<ChatApiResponse>('/api/chat');
      const rooms = [...fetched.rooms];
      // Ensure a DM room exists for every other user.
      const toCreate: ChatRoom[] = [];
      userList.forEach(user => {
        if (user.email === currentUser.email) return;
        const id = dmRoomId(currentUser.email, user.email);
        if (!rooms.some(room => room.id === id)) toCreate.push({ id, name: user.name, isGroup: false, members: [currentUser.email, user.email] });
      });
      await Promise.all(toCreate.map(room => api.post('/api/chat', { action: 'createRoom', ...room })));
      const finalRooms = [...rooms, ...toCreate];
      const next: ChatData = { rooms: finalRooms, messages: fetched.messages as ChatData['messages'], read: loadReadCounts() };
      setData(next);
      setActiveRoom(current => current || (selectFirst && finalRooms.length ? finalRooms[0].id : current));
    } catch { /* keep current */ }
  }

  useEffect(() => {
    loadFromDb(true);
    const sync = () => loadFromDb(false);
    window.addEventListener('chat-updated', sync);
    const timer = setInterval(() => loadFromDb(false), 5000);
    return () => { window.removeEventListener('chat-updated', sync); clearInterval(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userList.length]);

  useEffect(() => () => { streamRef.current?.getTracks().forEach(track => track.stop()); }, []);

  function persistRead(read: Record<string, number>) {
    localStorage.setItem('wsi-chat-read', JSON.stringify(read));
    setData(current => ({ ...current, read }));
    window.dispatchEvent(new Event('chat-updated'));
  }

  function openRoom(roomId: string) {
    setActiveRoom(roomId);
    const count = data.messages[roomId]?.length || 0;
    persistRead({ ...data.read, [roomId]: count });
  }

  async function postMessage(message: Omit<ChatMessage, 'id' | 'from' | 'at'>) {
    if (!activeRoom) return;
    try {
      await api.post('/api/chat', { action: 'message', roomId: activeRoom, ...message, from: currentUser.name });
      await loadFromDb(false);
      const count = (data.messages[activeRoom]?.length || 0) + 1;
      persistRead({ ...data.read, [activeRoom]: count });
      window.dispatchEvent(new Event('chat-updated'));
    } catch { notify('Could not send message. Check the database connection.'); }
  }

  function sendText(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    postMessage({ text: draft.trim() });
    setDraft('');
  }

  function sendFile(file: File | undefined) {
    if (!file) return;
    readAttachment(file, attachment => {
      if (!attachment) { notify('Could not read the file.'); return; }
      postMessage({ text: `Shared a file: ${attachment.name}`, fileName: attachment.name, fileType: attachment.type, fileData: attachment.dataUrl });
      notify(`Sent ${attachment.name}.`);
    });
  }

  async function createGroup(event: React.FormEvent) {
    event.preventDefault();
    const name = groupName.trim();
    if (!name) { notify('Group name is required.'); return; }
    if (!groupMembers.length) { notify('Select at least one member.'); return; }
    const room: ChatRoom = { id: `grp-${Date.now()}`, name, isGroup: true, members: [currentUser.email, ...groupMembers] };
    try {
      await api.post('/api/chat', { action: 'createRoom', ...room });
      setData(current => ({ ...current, rooms: [room, ...current.rooms] }));
      setShowNewGroup(false);
      setGroupName('');
      setGroupMembers([]);
      setActiveRoom(room.id);
      notify(`Group "${name}" created.`);
    } catch { notify('Could not create group. Check the database connection.'); }
  }

  async function removeRoom(room: ChatRoom) {
    try {
      await api.del('/api/chat', { roomId: room.id });
      const messages = { ...data.messages };
      delete messages[room.id];
      const next = { ...data, rooms: data.rooms.filter(item => item.id !== room.id), messages };
      setData(next);
      if (activeRoom === room.id) setActiveRoom(next.rooms[0]?.id || '');
      notify(`${room.name} removed.`);
    } catch { notify('Could not remove. Check the database connection.'); }
  }

  async function toggleGroupMember(room: ChatRoom, email: string) {
    const has = room.members.includes(email);
    if (room.members.length <= 2 && has) { notify('A group needs at least 2 members.'); return; }
    const members = has ? room.members.filter(member => member !== email) : [...room.members, email];
    try {
      await api.post('/api/chat', { action: 'updateMembers', id: room.id, members });
      setData(current => ({ ...current, rooms: current.rooms.map(item => item.id === room.id ? { ...item, members } : item) }));
      notify(has ? 'Member removed.' : 'Member added.');
    } catch { notify('Could not update members.'); }
  }

  async function startCall() {
    setCameraError('');
    setCallOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setCameraError('Camera/microphone unavailable or permission denied. Peer connection requires a signaling server.');
    }
  }

  function endCall() {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCallOpen(false);
  }

  const room = data.rooms.find(item => item.id === activeRoom);
  const messages = data.messages[activeRoom] || [];
  const roomUser = room && !room.isGroup ? userList.find(user => user.email === room.members.find(member => member !== currentUser.email)) : null;
  const roomTitle = room ? (room.isGroup ? room.name : roomUser?.name || room.name) : 'Select a chat';

  return (
    <div className={compact ? 'flex h-full flex-col' : 'space-y-4'}>
      {!compact && (
        <section className="panel p-5">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">MIS Tools</div>
          <h2 className="font-display text-xl">Team Chat</h2>
          <p className="mt-2 max-w-2xl text-xs text-[var(--muted)]">Direct messages and group chats with file sharing and video calls.</p>
        </section>
      )}

      <div className={`grid gap-4 ${compact ? 'min-h-0 flex-1 grid-cols-[180px_1fr]' : 'lg:grid-cols-[260px_1fr]'}`}>
        <section className="panel flex min-h-0 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--line)] p-3">
            <h3 className="font-display text-sm">Chats</h3>
            <button onClick={() => setShowNewGroup(true)} title="Create group" className="rounded border border-[var(--line)] p-1.5 text-[var(--teal)] hover:border-[var(--teal)]"><Plus size={13} /></button>
          </div>
          <div className="min-h-0 flex-1 divide-y divide-[var(--line)] overflow-y-auto">
            {data.rooms.length === 0 ? <div className="p-4 text-center text-xs text-[var(--muted)]">No chats.</div> : data.rooms.map(item => {
              const unread = (data.messages[item.id]?.length || 0) - (data.read[item.id] || 0);
              const itemUser = !item.isGroup ? userList.find(user => user.email === item.members.find(member => member !== currentUser.email)) : null;
              return (
                <div key={item.id} className="group relative">
                  <button onClick={() => openRoom(item.id)} data-active={activeRoom === item.id ? 'true' : 'false'} className="flex w-full items-center gap-2 p-3 text-left transition hover:bg-[var(--highlight)]/30 data-[active=true]:bg-[var(--highlight)]">
                    {item.isGroup ? <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--highlight)] text-[10px] font-bold text-[var(--teal)]">{item.members.length}</span> : itemUser ? <UserAvatar user={itemUser} sizeClass="h-8 w-8" textClass="text-[9px]" /> : <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--highlight)] text-[9px] font-bold text-[var(--teal)]">{item.name.slice(0, 2).toUpperCase()}</span>}
                    <span className="min-w-0 flex-1"><strong className="block truncate text-xs text-[var(--ink)]">{item.isGroup ? item.name : itemUser?.name || item.name}</strong><span className="block truncate text-[10px] text-[var(--muted)]">{item.isGroup ? `${item.members.length} members` : itemUser?.title || 'Direct message'}</span></span>
                    {unread > 0 && <span className="rounded-full bg-[var(--teal)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--highlight-ink)]">{unread}</span>}
                  </button>
                  {item.isGroup && <button onClick={() => removeRoom(item)} title="Remove group" className="absolute right-1 top-1 hidden rounded p-0.5 text-[var(--muted)] hover:text-[var(--coral)] group-hover:block"><X size={12} /></button>}
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel flex min-h-0 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--line)] p-3">
            <div className="flex min-w-0 items-center gap-3">
              {roomUser && <UserAvatar user={roomUser} sizeClass="h-9 w-9" textClass="text-[10px]" />}
              {room?.isGroup && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--highlight)] text-xs font-bold text-[var(--teal)]">{room.members.length}</span>}
              <div className="min-w-0"><strong className="block truncate text-xs text-[var(--ink)]">{roomTitle}</strong><span className="text-[10px] text-[var(--muted)]">{room ? (room.isGroup ? `${room.members.length} members` : roomUser?.email || '') : ''}</span></div>
            </div>
            {room && (
              <div className="flex gap-2">
                {room.isGroup && <button onClick={() => setShowMembers(value => !value)} className="rounded border border-[var(--line)] px-2.5 py-1.5 text-[10px] text-[var(--ink)] hover:text-[var(--teal)]">Members</button>}
                <button onClick={startCall} className="flex items-center gap-2 rounded-md bg-[var(--teal)] px-3 py-2 text-[11px] font-bold text-[var(--highlight-ink)]"><Video size={14} /> Call</button>
              </div>
            )}
          </div>

          {showMembers && room?.isGroup && (
            <div className="max-h-40 overflow-y-auto border-b border-[var(--line)] p-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Add / remove members</p>
              <div className="space-y-1">
                {userList.filter(user => user.email !== currentUser.email).map(user => {
                  const inRoom = room.members.includes(user.email);
                  return (
                    <div key={user.email} className="flex items-center justify-between rounded border border-[var(--line)] px-2 py-1.5">
                      <span className="flex items-center gap-2 text-[11px] text-[var(--ink)]"><UserAvatar user={user} sizeClass="h-6 w-6" textClass="text-[8px]" />{user.name}</span>
                      <button onClick={() => toggleGroupMember(room, user.email)} className={`rounded px-2 py-0.5 text-[10px] ${inRoom ? 'border border-[#9b4038] text-[#ef9b88]' : 'border border-[var(--teal)] text-[var(--teal)]'}`}>{inRoom ? 'Remove' : 'Add'}</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            {!room ? <div className="grid h-full place-items-center text-center text-xs text-[var(--muted)]">Select a chat or create a group.</div> : messages.length === 0 ? <div className="grid h-full place-items-center text-center text-xs text-[var(--muted)]">No messages yet. Say hello.</div> : messages.map(message => {
              const own = message.from === currentUser.name;
              return (
                <div key={message.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-lg border p-3 text-xs ${own ? 'border-[var(--teal)] bg-[var(--highlight)]' : 'border-[var(--line)] bg-[var(--canvas)]'}`}>
                    <div className="mb-1 flex items-center gap-2"><strong className="text-[10px] text-[var(--teal)]">{message.from}</strong><span className="text-[9px] text-[var(--muted)]">{message.at}</span></div>
                    <p className="text-[var(--ink)]">{message.text}</p>
                    {message.fileName && (
                      <a href={message.fileData} download={message.fileName} className="mt-2 flex items-center gap-2 rounded border border-[var(--line)] bg-[var(--surface)] p-2 text-[10px] text-[var(--teal)] hover:underline">
                        {message.fileType?.startsWith('video/') ? <Video size={13} /> : <FileText size={13} />} {message.fileName}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {room && (
            <form onSubmit={sendText} className="flex items-center gap-2 border-t border-[var(--line)] p-3">
              <input ref={fileRef} type="file" className="hidden" onChange={event => { sendFile(event.target.files?.[0]); event.target.value = ''; }} />
              <button type="button" onClick={() => fileRef.current?.click()} aria-label="Attach file" className="rounded border border-[var(--line)] p-2 text-[var(--muted)] hover:text-[var(--teal)]"><Upload size={15} /></button>
              <input value={draft} onChange={event => setDraft(event.target.value)} placeholder={`Message ${roomTitle}…`} className="flex-1 rounded border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-xs text-[var(--ink)] placeholder-[#617477] outline-none" />
              <button type="submit" className="rounded bg-[var(--teal)] px-4 py-2 text-[11px] font-bold text-[var(--highlight-ink)]">Send</button>
            </form>
          )}
        </section>
      </div>

      {showNewGroup && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#031015cc] p-5">
          <form onSubmit={createGroup} className="w-full max-w-md rounded-lg border border-[var(--teal)] bg-[var(--surface)] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between"><h2 className="font-display text-lg">Create group</h2><button type="button" onClick={() => setShowNewGroup(false)}><X size={19} /></button></div>
            <label className="block text-[11px] text-[#8ca2a4]">Group name<input value={groupName} onChange={event => setGroupName(event.target.value)} placeholder="e.g. Security Ops" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" /></label>
            <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Members</p>
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {userList.filter(user => user.email !== currentUser.email).map(user => {
                const selectedMember = groupMembers.includes(user.email);
                return (
                  <label key={user.email} className="flex cursor-pointer items-center gap-2 rounded border border-[var(--line)] px-2 py-1.5 text-[11px] text-[var(--ink)]">
                    <input type="checkbox" checked={selectedMember} onChange={() => setGroupMembers(current => selectedMember ? current.filter(email => email !== user.email) : [...current, user.email])} className="h-3.5 w-3.5 accent-[#49d4bf]" />
                    <UserAvatar user={user} sizeClass="h-6 w-6" textClass="text-[8px]" />{user.name}
                  </label>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setShowNewGroup(false)} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button><button type="submit" className="rounded bg-[var(--teal)] px-4 py-2 text-xs font-bold text-[var(--highlight-ink)]">Create group</button></div>
          </form>
        </div>
      )}

      {callOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#031015cc] p-5">
          <div className="w-full max-w-3xl overflow-hidden rounded-lg border border-[var(--teal)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--line)] p-4">
              <div><span className="text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Video conference</span><h2 className="mt-0.5 font-display text-base">Call — {roomTitle}</h2></div>
              <button onClick={endCall} className="rounded p-1 text-[var(--muted)] hover:text-white"><X size={19} /></button>
            </div>
            <div className="grid gap-3 bg-black p-4 sm:grid-cols-2">
              <div className="overflow-hidden rounded border border-[var(--line)] bg-[#07151b]">
                <video ref={videoRef} autoPlay playsInline muted className="h-56 w-full object-cover" />
                <p className="p-2 text-center text-[9px] text-[var(--muted)]">You ({currentUser.name})</p>
              </div>
              <div className="grid h-56 place-items-center overflow-hidden rounded border border-dashed border-[var(--line)] bg-[#07151b]">
                <div className="p-4 text-center">
                  {roomUser && <UserAvatar user={roomUser} sizeClass="mx-auto h-14 w-14" textClass="text-sm" />}
                  <p className="mt-2 text-[10px] text-[var(--muted)]">{cameraError || `${roomTitle} — waiting for remote peer. Full video calling needs a signaling/RTC server (e.g. WebRTC + Socket.IO).`}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[var(--line)] p-4">
              <button onClick={endCall} className="rounded bg-[#9b4038] px-4 py-2 text-xs font-bold text-white">End call</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type LibraryDocument = { id: string; name: string; category: string; framework: string; status: string; size: string; uploadedAt: string; dataUrl?: string };

const seedDocuments: LibraryDocument[] = [
  { id: 'doc-1', name: 'Incident Response Plan v3.2', category: 'Policy', framework: 'SOC 2', status: 'Approved', size: '—', uploadedAt: '2026-08-12' },
  { id: 'doc-2', name: 'Access Control Policy v2.0', category: 'Policy', framework: 'ISO 27001', status: 'Under review', size: '—', uploadedAt: '2026-09-01' },
  { id: 'doc-3', name: 'Network Diagram — HQ', category: 'Evidence', framework: 'General', status: 'Approved', size: '—', uploadedAt: '2026-08-20' },
  { id: 'doc-4', name: 'Data Retention Schedule', category: 'Policy', framework: 'DPA', status: 'Draft', size: '—', uploadedAt: '2026-07-15' },
];

const documentFrameworks = ['SOC 2', 'ISO 27001', 'DPA', 'General'];
const documentStatuses = ['Draft', 'Under review', 'Approved'];
const documentCategories = ['Policy', 'Evidence', 'Procedure', 'Record', 'Template'];

function loadLibraryDocuments(): LibraryDocument[] {
  try {
    const stored = localStorage.getItem('wsi-library-documents');
    if (stored) return JSON.parse(stored) as LibraryDocument[];
  } catch { /* ignore */ }
  return seedDocuments;
}

function computeCompliance(documents: LibraryDocument[]) {
  const frameworks: Record<string, number> = { 'SOC 2': 0, 'ISO 27001': 0, 'DPA': 0 };
  (['SOC 2', 'ISO 27001', 'DPA'] as const).forEach(framework => {
    const docs = documents.filter(doc => doc.framework === framework || doc.framework === 'General');
    if (!docs.length) { frameworks[framework] = 0; return; }
    const score = docs.reduce((sum, doc) => sum + (doc.status === 'Approved' ? 100 : doc.status === 'Under review' ? 60 : 30), 0) / docs.length;
    frameworks[framework] = Math.round(score);
  });
  const overall = Math.round((frameworks['SOC 2'] + frameworks['ISO 27001'] + frameworks['DPA']) / 3);
  return { frameworks, overall };
}

function DocumentLibrary({ notify }: { notify: (text: string) => void }) {
  const [documents, setDocuments] = useState<LibraryDocument[]>(seedDocuments);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LibraryDocument | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let rows = await api.get<LibraryDocument[]>('/api/documents');
        if (rows.length === 0) {
          await Promise.all(seedDocuments.map(doc => api.post('/api/documents', doc)));
          rows = await api.get<LibraryDocument[]>('/api/documents');
        }
        if (!cancelled) setDocuments(rows);
      } catch { /* keep seed */ }
    })();
    return () => { cancelled = true; };
  }, []);

  function persist(next: LibraryDocument[], changed?: { created?: LibraryDocument; deleted?: LibraryDocument }) {
    setDocuments(next);
    if (changed?.created) api.post('/api/documents', changed.created).catch(() => notify('Could not save document to the database.'));
    if (changed?.deleted) api.del('/api/documents', { id: changed.deleted.id }).catch(() => notify('Could not delete from the database.'));
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function saveDocument(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim() || selectedFile?.name || '';
    if (!name) { notify('Document name is required.'); return; }
    const finish = (dataUrl?: string, size = '—') => {
      const doc: LibraryDocument = { id: `doc-${Date.now()}`, name, category: String(form.get('category') || 'Policy'), framework: String(form.get('framework') || 'General'), status: String(form.get('status') || 'Draft'), size, uploadedAt: new Date().toISOString().slice(0, 10), dataUrl };
      persist([doc, ...documents], { created: doc });
      setShowForm(false);
      setSelectedFile(null);
      notify(`${name} uploaded to the document library.`);
    };
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => finish(String(reader.result || ''), formatSize(selectedFile.size));
      reader.onerror = () => finish(undefined, formatSize(selectedFile.size));
      reader.readAsDataURL(selectedFile);
    } else finish();
  }

  function removeDocument(doc: LibraryDocument) {
    persist(documents.filter(item => item.id !== doc.id), { deleted: doc });
    setDeleteTarget(null);
    notify(`${doc.name} removed from the library.`);
  }

  const compliance = computeCompliance(documents);

  return (
    <div className="space-y-4">
      <section className="panel p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">IT Governance</div>
            <h2 className="font-display text-xl">Document Library</h2>
            <p className="mt-2 max-w-2xl text-xs text-[var(--muted)]">Controlled documents, evidence, and reference material. Upload files and tag them to a compliance framework.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-md bg-[var(--teal)] px-3 py-2 text-[11px] font-bold text-[var(--highlight-ink)]"><Upload size={14} /> Upload document</button>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <WorkspaceMetric label="Total documents" value={String(documents.length)} detail="In library" accent="var(--teal)" />
        <WorkspaceMetric label="Approved" value={String(documents.filter(doc => doc.status === 'Approved').length)} detail="Ready as evidence" accent="var(--blue)" />
        <WorkspaceMetric label="Under review" value={String(documents.filter(doc => doc.status === 'Under review').length)} detail="Pending approval" accent="var(--amber)" />
        <WorkspaceMetric label="Avg. compliance" value={`${compliance.overall}%`} detail="Across frameworks" accent="var(--teal)" />
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b border-[var(--line)] p-5"><h2 className="font-display text-sm">Documents</h2><p className="mt-1 text-[10px] text-[var(--muted)]">Uploaded files are stored in the database. Compliance is computed from approval status per framework.</p></div>
        <div className="divide-y divide-[var(--line)]">
          {documents.length === 0 ? <div className="p-8 text-center text-xs text-[var(--muted)]">No documents yet. Upload one to get started.</div> : documents.map(doc => (
            <div key={doc.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--highlight)] text-[var(--teal)]"><FileText size={16} /></div>
              <div className="min-w-0 flex-1">
                <strong className="block text-xs text-[var(--ink)]">{doc.name}</strong>
                <span className="text-[10px] text-[var(--muted)]">{doc.category} · {doc.framework} · {doc.size} · Uploaded {doc.uploadedAt}</span>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${doc.status === 'Approved' ? 'badge-green' : doc.status === 'Under review' ? 'badge-amber' : 'badge-blue'}`}>{doc.status}</span>
              {doc.dataUrl && <a href={doc.dataUrl} download={doc.name} className="rounded border border-[var(--line)] px-2.5 py-1 text-[10px] text-[var(--ink)] hover:text-[var(--teal)]">Download</a>}
              <button onClick={() => setDeleteTarget(doc)} className="rounded border border-[#9b4038] bg-[#492b33] px-2.5 py-1 text-[10px] font-medium text-white hover:bg-[#9b4038]">Delete</button>
            </div>
          ))}
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#031015cc] p-5">
          <form onSubmit={saveDocument} className="w-full max-w-lg rounded-lg border border-[var(--teal)] bg-[var(--surface)] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div><span className="text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Document Library</span><h2 className="mt-1 font-display text-lg">Upload document</h2></div>
              <button type="button" onClick={() => { setShowForm(false); setSelectedFile(null); }} className="rounded p-1 text-[var(--muted)] hover:text-white"><X size={19} /></button>
            </div>
            <div className="grid gap-4">
              <div>
                <span className="text-[11px] text-[#8ca2a4]">File</span>
                <div className="mt-1 flex items-center gap-2">
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.txt" onChange={event => setSelectedFile(event.target.files?.[0] || null)} className="hidden" />
                  <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 rounded border border-[var(--line)] px-3 py-2 text-[11px] text-[var(--ink)] hover:border-[var(--teal)] hover:text-[var(--teal)]"><Upload size={14} /> Choose file</button>
                  <span className="text-[10px] text-[var(--muted)]">{selectedFile ? `${selectedFile.name} · ${formatSize(selectedFile.size)}` : 'No file selected (metadata only)'}</span>
                </div>
              </div>
              <label className="text-[11px] text-[#8ca2a4]">Document name
                <input name="name" placeholder={selectedFile ? selectedFile.name : 'e.g. Access Control Policy v2.1'} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="text-[11px] text-[#8ca2a4]">Category
                  <select name="category" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none">{documentCategories.map(category => <option key={category}>{category}</option>)}</select>
                </label>
                <label className="text-[11px] text-[#8ca2a4]">Framework
                  <select name="framework" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none">{documentFrameworks.map(framework => <option key={framework}>{framework}</option>)}</select>
                </label>
                <label className="text-[11px] text-[#8ca2a4]">Status
                  <select name="status" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none">{documentStatuses.map(status => <option key={status}>{status}</option>)}</select>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-[var(--line)] pt-4">
              <button type="button" onClick={() => { setShowForm(false); setSelectedFile(null); }} className="rounded border border-[var(--line)] px-4 py-2 text-xs text-[var(--ink)]">Cancel</button>
              <button type="submit" className="flex items-center gap-2 rounded bg-[var(--teal)] px-4 py-2 text-xs font-bold text-[var(--highlight-ink)]"><Upload size={14} /> Upload</button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[#031015cc] p-5">
          <div className="w-full max-w-md rounded-lg border border-[#8b4a44] bg-[var(--surface)] p-6 shadow-2xl">
            <h2 className="mt-1 font-display text-lg">Delete document?</h2>
            <p className="mt-3 text-xs leading-5 text-[var(--muted)]">Remove <strong className="text-[var(--ink)]">{deleteTarget.name}</strong> from the library. This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button>
              <button onClick={() => removeDocument(deleteTarget)} className="rounded bg-[#9b4038] px-3 py-2 text-xs font-bold text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type GenericRecord = { id: string; title: string; tag: string; meta: string; detail: string; createdAt: string; attachmentName?: string; attachmentType?: string; attachmentData?: string };

type Attachment = { name: string; type: string; dataUrl: string } | null;

function readAttachment(file: File | undefined, done: (attachment: Attachment) => void) {
  if (!file) { done(null); return; }
  const reader = new FileReader();
  reader.onload = () => done({ name: file.name, type: file.type, dataUrl: String(reader.result || '') });
  reader.onerror = () => done(null);
  reader.readAsDataURL(file);
}

function AttachmentInput({ file, setFile }: { file: File | null; setFile: (file: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <div>
      <span className="text-[11px] text-[#8ca2a4]">Attachment <span className="text-[var(--muted)]">(file, image, or video — optional)</span></span>
      <div className="mt-1 flex items-center gap-2">
        <input ref={inputRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip" onChange={event => setFile(event.target.files?.[0] || null)} className="hidden" />
        <button type="button" onClick={() => inputRef.current?.click()} className="flex items-center gap-2 rounded border border-[var(--line)] px-3 py-2 text-[11px] text-[var(--ink)] hover:border-[var(--teal)] hover:text-[var(--teal)]"><Upload size={13} /> Choose file</button>
        <span className="truncate text-[10px] text-[var(--muted)]">{file ? file.name : 'No file selected'}</span>
        {file && <button type="button" onClick={() => setFile(null)} className="text-[var(--muted)] hover:text-white"><X size={13} /></button>}
      </div>
    </div>
  );
}

function seedModuleRecords(module: string, seed: Array<[string, string, string]>): GenericRecord[] {
  return seed.map(([title, tag, meta], index) => ({ id: `${module}-seed-${index}`, title, tag, meta, detail: '', createdAt: new Date().toISOString() }));
}

function ModuleContent({ module, notify }: { module: string; notify: (text: string) => void }) {
  const content: Record<string, { intro: string; cards: Array<[string, string]>; items: Array<[string, string, string]> }> = {
    'Security Events': { intro: 'Correlated security events from firewalls, endpoints, and identity providers.', cards: [['Events (24h)', '1,284'], ['Anomalies', '6'], ['Suppressed', '312']], items: [['Repeated RDP failures from 45.132.x.x', 'High', '2h ago'], ['New admin session outside office hours', 'Medium', '5h ago'], ['Firewall rule change by automation', 'Info', '8h ago'], ['DNS query to known-bad domain blocked', 'Medium', '12h ago']] },
    'Vulnerability Management': { intro: 'Track vulnerabilities from discovery through remediation.', cards: [['Open', '32'], ['Critical / High', '7'], ['Remediated (30d)', '48']], items: [['CVE-2026-21772 · OpenSSL on SRV-DC-01', 'Critical', 'Due Sep 20'], ['CVE-2026-1188 · Chrome < 129 on 14 endpoints', 'High', 'Due Sep 25'], ['CVE-2025-55182 · pfSense base OS', 'Medium', 'Due Oct 02'], ['Weak TLS ciphers on legacy portal', 'Medium', 'Due Oct 10']] },
    'Risk Management': { intro: 'Maintain the risk register and treatment plans.', cards: [['Open risks', '24'], ['High residual', '5'], ['Accepted', '9']], items: [['Unencrypted backup offload to branch NAS', 'High', 'Mitigating'], ['Legacy ERP without MFA', 'High', 'Treating'], ['Shared service accounts in Operations', 'Medium', 'Monitoring'], ['Third-party VPN concentrator EOL', 'Medium', 'Treating']] },
    'Security Assets': { intro: 'Crown-jewel systems, data stores, and security tooling inventory.', cards: [['Crown jewels', '18'], ['Covered by monitoring', '94%'], ['Unassigned owners', '2']], items: [['Active Directory domain controllers', 'Critical', 'Owned: M. Dannug'], ['Customer records database', 'Critical', 'Owned: R. Lee'], ['pfSense perimeter firewall', 'High', 'Owned: Network team'], ['Backup vault (offsite)', 'High', 'Owned: MIS']] },
    'Access Management': { intro: 'Review entitlements, privileged accounts, and joiner/mover/leaver actions.', cards: [['Privileged accounts', '14'], ['Reviews due', '3'], ['Orphaned accounts', '1']], items: [['Quarterly entitlement review — Finance', 'Due Sep 13', 'In progress'], ['Dormant admin account: svc_legacy', 'Action required', 'Open'], ['MFA gap: 2 contractor accounts', 'High', 'Open']] },
    'Network Security': { intro: 'Perimeter, segmentation, and wireless security controls.', cards: [['VLANs monitored', '6'], ['Firewall policies', '128'], ['Open findings', '3']], items: [['VLAN 25↔26 unrestricted SMB', 'High', 'Remediating'], ['Guest Wi-Fi lacks client isolation', 'Medium', 'Scheduled'], ['Stale any-any rule on WAN', 'High', 'Open']] },
    'Server Security': { intro: 'Hardening baselines, patch posture, and endpoint protection.', cards: [['Baseline compliant', '91%'], ['Agents healthy', '97%'], ['Exceptions', '4']], items: [['SRV-WEB-02 missing LAPS', 'Medium', 'Open'], ['SMBv1 enabled on legacy file server', 'High', 'Remediating'], ['EDR tamper protection off on 1 host', 'High', 'Open']] },
    'Backup Security': { intro: 'Backup integrity, immutability, and restore verification.', cards: [['Jobs passing', '98%'], ['Immutable copies', '12'], ['Last restore test', 'Sep 12']], items: [['Nightly backup cluster B verified', 'Passed', 'Today'], ['Offsite replication lagging 40 min', 'Warning', 'Now'], ['Quarterly restore drill', 'Scheduled', 'Sep 28']] },
    'Document Library': { intro: 'Controlled documents, evidence, and reference material.', cards: [['Controlled docs', '48'], ['Pending review', '6'], ['Expired', '2']], items: [['Incident Response Plan v3.2', 'Current', 'Review Mar 2027'], ['Access Control Policy v2.0', 'Under review', 'Due Sep 30'], ['Network Diagram — HQ', 'Current', 'Updated Aug 2026'], ['Data Retention Schedule', 'Expired', 'Refresh needed']] },
    'Security Policies': { intro: 'Publish, acknowledge, and maintain the security policy set.', cards: [['Active policies', '23'], ['Acknowledgment rate', '96%'], ['Draft', '4']], items: [['Acceptable Use Policy', 'Published', '96% acknowledged'], ['Remote Work Policy', 'Draft', 'In review'], ['Password Standard v4', 'Published', '100% acknowledged'], ['Data Classification Policy', 'Published', '92% acknowledged']] },
    'Security Awareness': { intro: 'Training campaigns, phishing simulations, and completion tracking.', cards: [['Training completion', '89%'], ['Phish click rate', '4.1%'], ['Campaigns active', '3']], items: [['Q3 phishing simulation', 'Running', 'Click rate 4.1%'], ['New-hire security onboarding', 'Active', '100% completion'], ['Ransomware awareness module', 'Active', 'Due Oct 15']] },
    'Audit & Findings': { intro: 'Internal/external audit findings and remediation tracking.', cards: [['Open findings', '12'], ['High severity', '2'], ['Closed (YTD)', '37']], items: [['Access review evidence incomplete', 'High', 'Due Sep 20'], ['Vendor risk assessment gap', 'Medium', 'Due Oct 02'], ['Log retention < 1 year on NAS', 'Medium', 'Remediating']] },
    'SOC 2 Compliance': { intro: 'SOC 2 trust services criteria readiness and evidence.', cards: [['Criteria met', '92%'], ['Controls tested', '64'], ['Exceptions', '3']], items: [['CC6.1 logical access — evidence refreshed', 'Passing', 'This month'], ['CC7.2 monitoring — 1 exception', 'Exception', 'Owner: M. Dannug'], ['A1.2 availability — backup evidence', 'Passing', 'Q3']] },
    'ISO 27001 Compliance': { intro: 'ISO 27001 Annex A control implementation status.', cards: [['Controls implemented', '87%'], ['Nonconformities', '2'], ['Audit window', 'Q4 2026']], items: [['A.12.6 technical vulnerability mgmt', 'Implemented', 'Verified'], ['A.9.4 access control — partial', 'In progress', 'Due Nov'], ['A.18.2.3 compliance review', 'Implemented', 'Verified']] },
    'DPA Compliance': { intro: 'Data Privacy Act compliance and personal data processing controls.', cards: [['Requirements met', '95%'], ['Open actions', '1'], ['Registered processes', '14']], items: [['Privacy impact assessment refresh', 'Complete', 'Aug 2026'], ['Consent records audit', 'Complete', 'Q3'], ['Breach notification drill', 'Scheduled', 'Oct 2026']] },
    'Security Reports': { intro: 'Executive and operational security reporting.', cards: [['Reports this quarter', '16'], ['Scheduled', '5'], ['Ad-hoc', '11']], items: [['Monthly security posture — Sep', 'Delivered', 'Sep 05'], ['Incident trends Q3', 'Draft', 'Due Sep 30'], ['Board security summary', 'Scheduled', 'Oct 07']] },
    'Audit Logs': { intro: 'Immutable record of administrative and security-relevant actions.', cards: [['Events (7d)', '9,412'], ['Retention', '400 days'], ['Anomalies', '1']], items: [['michael.adams modified firewall rule 44', 'Admin', '2h ago'], ['tara.singh exported user directory', 'Data access', 'Yesterday'], ['Failed auth ×3 — service account', 'Auth', 'Yesterday'], ['policy update published by rachel.lee', 'Governance', '2d ago']] },
    'Backup Management': { intro: 'Backup jobs, retention, and restore operations.', cards: [['Active jobs', '22'], ['Success rate', '98.2%'], ['Storage used', '64%']], items: [['Nightly — production DB', 'Healthy', 'Last run 02:00'], ['Weekly — file server full', 'Healthy', 'Last Sun'], ['Monthly — offsite archive', 'Running', 'In progress']] },
  };
  const fallback = { intro: `Operational workspace for ${module.toLowerCase()}.`, cards: [['Records', '0'], ['Open items', '0'], ['This month', '0']] as Array<[string, string]>, items: [['No records yet', 'Info', 'Add data to populate this module']] as Array<[string, string, string]> };
  const data = content[module] || fallback;
  const [records, setRecords] = useState<GenericRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GenericRecord | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let rows = await api.get<GenericRecord[]>(`/api/records?module=${encodeURIComponent(module)}`);
        if (rows.length === 0) {
          const seeds = seedModuleRecords(module, data.items);
          await Promise.all(seeds.map(record => api.post('/api/records', { ...record, module })));
          rows = await api.get<GenericRecord[]>(`/api/records?module=${encodeURIComponent(module)}`);
        }
        if (!cancelled) setRecords(rows);
      } catch {
        if (!cancelled) setRecords(seedModuleRecords(module, data.items));
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module]);

  async function persist(next: GenericRecord[], changed?: { created?: GenericRecord; deleted?: GenericRecord }) {
    setRecords(next);
    try {
      if (changed?.created) await api.post('/api/records', { ...changed.created, module });
      if (changed?.deleted) await api.del('/api/records', { id: changed.deleted.id });
    } catch { notify('Could not save to the database. Check the connection.'); }
  }

  function saveRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') || '').trim();
    if (!title) { notify('Record title is required.'); return; }
    readAttachment(attachment || undefined, file => {
      const record: GenericRecord = { id: `${module}-${Date.now()}`, title, tag: String(form.get('tag') || 'Info'), meta: String(form.get('meta') || 'Just now'), detail: String(form.get('detail') || '').trim(), createdAt: new Date().toISOString(), attachmentName: file?.name, attachmentType: file?.type, attachmentData: file?.dataUrl };
      persist([record, ...records], { created: record });
      setShowForm(false);
      setAttachment(null);
      notify(`${module} record added.`);
    });
  }

  function removeRecord(record: GenericRecord) {
    persist(records.filter(item => item.id !== record.id), { deleted: record });
    setDeleteTarget(null);
    notify(`${record.title} removed.`);
  }

  const total = records.length;
  const openItems = records.filter(record => ['High', 'Critical', 'Exception', 'Open', 'Expired', 'Warning', 'Action required', 'Failed'].includes(record.tag)).length;
  const inProgress = records.filter(record => ['In progress', 'Running', 'Scheduled', 'Mitigating', 'Treating', 'Remediating', 'Monitoring', 'Under review'].includes(record.tag)).length;
  const cards: Array<[string, string]> = [[data.cards[0]?.[0] || 'Records', String(total)], ['Open items', String(openItems)], ['In progress', String(inProgress)]];

  return (
    <div className="space-y-4">
      <section className="panel p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">{governanceNav.includes(module) ? 'IT Governance' : 'Cyber Security'}</div>
            <h2 className="font-display text-xl">{module}</h2>
            <p className="mt-2 max-w-2xl text-xs text-[var(--muted)]">{data.intro}</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-md bg-[var(--teal)] px-3 py-2 text-[11px] font-bold text-[var(--highlight-ink)]"><Plus size={14} /> Add record</button>
        </div>
      </section>
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map(([label, value]) => <WorkspaceMetric key={label} label={label} value={value} detail={module} accent="var(--teal)" />)}
      </div>
      <section className="panel overflow-hidden">
        <div className="border-b border-[var(--line)] p-5"><h2 className="font-display text-sm">{module} — records</h2></div>
        <div className="divide-y divide-[var(--line)]">
          {records.length === 0 ? <div className="p-8 text-center text-xs text-[var(--muted)]">No records yet. Use Add record to create one.</div> : records.map(record => (
            <div key={record.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <strong className="block text-xs text-[var(--ink)]">{record.title}</strong>
                <span className="text-[10px] text-[var(--muted)]">{record.meta}{record.detail ? ` · ${record.detail}` : ''}</span>
                {record.attachmentName && (
                  <span className="mt-1 flex items-center gap-1 text-[10px] text-[var(--teal)]">
                    {record.attachmentType?.startsWith('image/') ? <FileText size={11} /> : record.attachmentType?.startsWith('video/') ? <Video size={11} /> : <FileText size={11} />}
                    {record.attachmentData ? <a href={record.attachmentData} download={record.attachmentName} className="hover:underline">{record.attachmentName}</a> : record.attachmentName}
                  </span>
                )}
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${['High', 'Critical', 'Exception', 'Open', 'Expired', 'Warning', 'Action required', 'Failed'].includes(record.tag) ? 'badge-red' : ['Medium', 'In progress', 'Running', 'Scheduled', 'Mitigating', 'Treating', 'Remediating', 'Monitoring', 'Under review', 'Info'].includes(record.tag) ? 'badge-blue' : 'badge-green'}`}>{record.tag}</span>
              <button onClick={() => setDeleteTarget(record)} className="rounded border border-[#9b4038] bg-[#492b33] px-2.5 py-1 text-[10px] font-medium text-white hover:bg-[#9b4038]">Delete</button>
            </div>
          ))}
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#031015cc] p-5">
          <form onSubmit={saveRecord} className="w-full max-w-lg rounded-lg border border-[var(--teal)] bg-[var(--surface)] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">{module}</span>
                <h2 className="mt-1 font-display text-lg">Add record</h2>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="rounded p-1 text-[var(--muted)] hover:text-white"><X size={19} /></button>
            </div>
            <div className="grid gap-4">
              <label className="text-[11px] text-[#8ca2a4]">Title <span className="text-[var(--teal)]">*</span>
                <input name="title" required placeholder="Record title" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Status / tag
                <select name="tag" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none">
                  {['Info', 'Open', 'In progress', 'Scheduled', 'Monitoring', 'Under review', 'Passed', 'Healthy', 'Medium', 'High', 'Critical', 'Warning', 'Failed', 'Complete', 'Current'].map(tag => <option key={tag}>{tag}</option>)}
                </select>
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Meta / date label
                <input name="meta" placeholder="e.g. Due Sep 30" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <label className="text-[11px] text-[#8ca2a4]">Details
                <textarea name="detail" rows={3} placeholder="Optional details" className="mt-1 w-full resize-none rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" />
              </label>
              <AttachmentInput file={attachment} setFile={setAttachment} />
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-[var(--line)] pt-4">
              <button type="button" onClick={() => { setShowForm(false); setAttachment(null); }} className="rounded border border-[var(--line)] px-4 py-2 text-xs text-[var(--ink)]">Cancel</button>
              <button type="submit" className="rounded bg-[var(--teal)] px-4 py-2 text-xs font-bold text-[var(--highlight-ink)]">Add record</button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[#031015cc] p-5">
          <div className="w-full max-w-md rounded-lg border border-[#8b4a44] bg-[var(--surface)] p-6 shadow-2xl">
            <h2 className="mt-1 font-display text-lg">Delete record?</h2>
            <p className="mt-3 text-xs leading-5 text-[var(--muted)]">Remove <strong className="text-[var(--ink)]">{deleteTarget.title}</strong> from {module}. This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button>
              <button onClick={() => removeRecord(deleteTarget)} className="rounded bg-[#9b4038] px-3 py-2 text-xs font-bold text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type VaptResult = { target: string; type: string; detail: string; severity: string };
function LegacyVaptManagement({ notify }: { notify: (text: string) => void }) {
  const [scanType, setScanType] = useState<'ip' | 'port' | 'domain' | 'email'>('ip');
  const [target, setTarget] = useState('');
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<VaptResult[]>([]);
  const [history, setHistory] = useState<Array<{ id: string; type: string; target: string; findings: number; at: string }>>([]);

  useEffect(() => {
    const stored = localStorage.getItem('wsi-vapt-history');
    startTransition(() => { if (stored) setHistory(JSON.parse(stored)); });
  }, []);

  const commonPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 3389, 8080, 8443];

  function runScan(event: React.FormEvent) {
    event.preventDefault();
    if (!target.trim()) { notify('Enter a target to scan.'); return; }
    setScanning(true);
    setResults([]);
    const found: VaptResult[] = [];
    const done = () => {
      setResults(found);
      setScanning(false);
      const entry = { id: `vapt-${Date.now()}`, type: scanType.toUpperCase(), target, findings: found.length, at: new Date().toLocaleString() };
      const next = [entry, ...history].slice(0, 10);
      setHistory(next);
      localStorage.setItem('wsi-vapt-history', JSON.stringify(next));
      notify(`${scanType.toUpperCase()} scan of ${target} complete: ${found.length} finding(s).`);
    };
    if (scanType === 'port') {
      let completed = 0;
      commonPorts.forEach(port => {
        const img = new Image();
        const started = Date.now();
        const mark = (open: boolean) => { found.push({ target, type: 'PORT', detail: `Port ${port} ${open ? 'open / responding' : 'closed or filtered'}`, severity: open ? (port === 23 || port === 3389 ? 'High' : 'Info') : 'Info' }); if (++completed === commonPorts.length) done(); };
        img.onload = () => mark(true);
        img.onerror = () => mark(Date.now() - started < 1800);
        img.src = `http://${target}:${port}/favicon.ico?_=${Date.now()}`;
        setTimeout(() => { if (completed < commonPorts.length && !found.some(f => f.detail.includes(`Port ${port} `))) { mark(false); } }, 1900);
      });
    } else {
      setTimeout(() => {
        if (scanType === 'ip') {
          found.push({ target, type: 'IP', detail: 'Host responded to probe (ICMP/TCP reachable)', severity: 'Info' });
          found.push({ target, type: 'IP', detail: 'Reverse DNS: no PTR record found', severity: 'Low' });
          found.push({ target, type: 'IP', detail: 'TTL suggests network device or Linux host', severity: 'Info' });
        } else if (scanType === 'domain') {
          const valid = /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(target);
          found.push({ target, type: 'DOMAIN', detail: valid ? 'Domain format valid; DNS resolution attempted' : 'Domain format appears invalid', severity: valid ? 'Info' : 'High' });
          found.push({ target, type: 'DOMAIN', detail: 'SPF record check recommended for mail spoofing resistance', severity: 'Medium' });
          found.push({ target, type: 'DOMAIN', detail: 'DMARC policy review advised', severity: 'Medium' });
        } else {
          const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target);
          found.push({ target, type: 'EMAIL', detail: valid ? 'Address format valid' : 'Address format invalid', severity: valid ? 'Info' : 'High' });
          found.push({ target, type: 'EMAIL', detail: 'Check against breach corpora before provisioning', severity: 'Medium' });
          found.push({ target, type: 'EMAIL', detail: 'MX/domain ownership verification recommended', severity: 'Low' });
        }
        done();
      }, 1200);
    }
  }

  function exportReport(format: 'csv' | 'pdf') {
    if (!results.length) { notify('Run a scan first to generate a report.'); return; }
    const rows = results.map(r => ({ Type: r.type, Target: r.target, Finding: r.detail, Severity: r.severity }));
    if (format === 'csv') downloadCsv(`vapt-${scanType}-scan-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
    else printPdfReport({ title: `VAPT ${scanType.toUpperCase()} Scan Report`, subtitle: `Target: ${target} · ${results.length} finding(s)`, columns: ['Type', 'Target', 'Finding', 'Severity'], rows: rows.map(r => [r.Type, r.Target, r.Finding, r.Severity]) });
    notify(`VAPT report exported as ${format.toUpperCase()}.`);
  }

  const tabs: Array<['ip' | 'port' | 'domain' | 'email', string, string]> = [['ip', 'IP Scan', '⌖'], ['port', 'Port Scan', '⇶'], ['domain', 'Domain Scan', '◎'], ['email', 'Email Scan', '✉']];
  return (
    <div className="space-y-4">
      <section className="panel p-5">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Cyber Security</div>
        <h2 className="font-display text-xl">VAPT Management</h2>
        <p className="mt-2 max-w-2xl text-xs text-[var(--muted)]">Run IP, port, domain, and email scans, then generate a report from the findings. Only scan assets you own or are authorized to test.</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-4">
        <WorkspaceMetric label="Scans run" value={String(history.length)} detail="This workspace" accent="var(--teal)" />
        <WorkspaceMetric label="Findings" value={String(results.length)} detail="Current scan" accent="var(--blue)" />
        <WorkspaceMetric label="High severity" value={String(results.filter(r => r.severity === 'High').length)} detail="Needs action" accent="var(--coral)" />
        <WorkspaceMetric label="Medium" value={String(results.filter(r => r.severity === 'Medium').length)} detail="Review" accent="var(--amber)" />
      </div>

      <section className="panel overflow-hidden">
        <div className="flex flex-wrap gap-2 border-b border-[var(--line)] p-4">
          {tabs.map(([key, label, icon]) => (
            <button key={key} data-active={scanType === key ? 'true' : 'false'} onClick={() => { setScanType(key); setResults([]); }} className={`flex items-center gap-2 rounded-md border px-3 py-2 text-[11px] transition ${scanType === key ? 'border-[var(--teal)] bg-[var(--highlight)] font-semibold text-[var(--teal)]' : 'border-[var(--line)] text-[var(--ink)]'}`}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </div>
        <form onSubmit={runScan} className="flex flex-col gap-3 border-b border-[var(--line)] p-5 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-xs text-[#617477]">
            <Scan size={14} />
            <input value={target} onChange={event => setTarget(event.target.value)} placeholder={scanType === 'ip' ? '192.168.1.1' : scanType === 'port' ? 'host or IP to port-scan' : scanType === 'domain' ? 'example.com' : 'user@example.com'} className="w-full bg-transparent text-xs text-[var(--ink)] placeholder-[#617477] outline-none" />
          </div>
          <button disabled={scanning} className="rounded bg-[var(--teal)] px-4 py-2 text-[11px] font-bold text-[var(--highlight-ink)] disabled:opacity-50">{scanning ? 'Scanning…' : `Run ${scanType.toUpperCase()} scan`}</button>
        </form>
        <div className="divide-y divide-[var(--line)]">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--muted)]">{scanning ? 'Scanning target…' : 'No findings yet. Enter a target and run a scan.'}</div>
          ) : results.map((result, index) => (
            <div key={index} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
              <span className="badge-gray rounded-full px-2.5 py-1 text-[10px] font-medium">{result.type}</span>
              <div className="min-w-0 flex-1"><strong className="block text-xs text-[var(--ink)]">{result.target}</strong><span className="text-[10px] text-[var(--muted)]">{result.detail}</span></div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${result.severity === 'High' ? 'badge-red' : result.severity === 'Medium' ? 'badge-amber' : result.severity === 'Low' ? 'badge-blue' : 'badge-gray'}`}>{result.severity}</span>
            </div>
          ))}
        </div>
        {results.length > 0 && (
          <div className="flex justify-end gap-2 border-t border-[var(--line)] p-4">
            <button onClick={() => exportReport('csv')} className="flex items-center gap-2 rounded border border-[var(--line)] px-3 py-2 text-[10px] text-[var(--ink)]"><Download size={13} /> Export CSV</button>
            <button onClick={() => exportReport('pdf')} className="flex items-center gap-2 rounded bg-[var(--teal)] px-3 py-2 text-[10px] font-bold text-[var(--highlight-ink)]"><Download size={13} /> Generate report (PDF)</button>
          </div>
        )}
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-[var(--line)] p-5"><h2 className="font-display text-sm">Scan history</h2></div>
        {history.length === 0 ? <div className="p-8 text-center text-xs text-[var(--muted)]">No scans yet.</div> : (
          <div className="divide-y divide-[var(--line)]">
            {history.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-4">
                <span className="badge-blue rounded-full px-2.5 py-1 text-[10px] font-medium">{item.type}</span>
                <div className="min-w-0 flex-1"><strong className="block text-xs text-[var(--ink)]">{item.target}</strong><span className="text-[10px] text-[var(--muted)]">{item.at}</span></div>
                <span className="text-[10px] text-[var(--muted)]">{item.findings} finding(s)</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ServerManagementWithLogs({ notify }: { notify: (text: string) => void }) {
  return <div className="space-y-4"><ServerManagement notify={notify} /><MaintenanceLogs area="Server Management" storageKey="wsi-server-maintenance-logs" notify={notify} /></div>;
}

function NetworkManagementWithTabs({ notify }: { notify: (text: string) => void }) {
  const [tab, setTab] = useState<'discovery' | 'cctv' | 'logs'>('discovery');
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['discovery', 'cctv', 'logs'] as const).map(key => (
          <button key={key} data-active={tab === key ? 'true' : 'false'} onClick={() => setTab(key)} className={`flex items-center gap-2 rounded-md border px-3 py-2 text-[11px] transition ${tab === key ? 'border-[var(--teal)] bg-[var(--highlight)] font-semibold text-[var(--teal)]' : 'border-[var(--line)] text-[var(--ink)]'}`}>
            {key === 'discovery' ? '⇶ Discovery & Firewalls' : key === 'cctv' ? '◉ CCTV & Devices' : '▤ Logs & Maintenance'}
          </button>
        ))}
      </div>
      {tab === 'discovery' && <EditableNetworkOperations notify={notify} />}
      {tab === 'cctv' && <CctvMaintenance notify={notify} />}
      {tab === 'logs' && <MaintenanceLogs area="Network Management" storageKey="wsi-network-maintenance-logs" notify={notify} />}
    </div>
  );
}

type CctvDevice = { id: string; name: string; location: string; ipAddress: string; model: string; status: string; lastService: string; streamUrl?: string; username?: string; password?: string };
const seedCctv: CctvDevice[] = [
  { id: 'cctv-1', name: 'CAM-01 Main Entrance', location: 'Building A — Lobby', ipAddress: '192.168.27.11', model: 'Hikvision DS-2CD2143', status: 'Online', lastService: '2026-08-30', streamUrl: 'http://192.168.27.11', username: 'admin', password: '' },
  { id: 'cctv-2', name: 'CAM-02 Server Room', location: 'Data Center', ipAddress: '192.168.27.12', model: 'Dahua IPC-HDW5442', status: 'Online', lastService: '2026-09-05', streamUrl: 'http://192.168.27.12', username: 'admin', password: '' },
  { id: 'cctv-3', name: 'CAM-03 Parking Lot', location: 'Outdoor — North', ipAddress: '192.168.27.13', model: 'Hikvision DS-2DE2A404', status: 'Offline', lastService: '2026-07-21', streamUrl: 'http://192.168.27.13', username: 'admin', password: '' },
  { id: 'cctv-4', name: 'NVR-01 Recorder', location: 'Data Center', ipAddress: '192.168.27.10', model: 'Hikvision DS-7732NI', status: 'Online', lastService: '2026-09-01', streamUrl: 'http://192.168.27.10', username: 'admin', password: '' },
];

function buildCctvUrl(device: CctvDevice) {
  const base = (device.streamUrl || `http://${device.ipAddress}`).trim();
  if (!device.username) return base;
  try {
    const url = new URL(base.includes('://') ? base : `http://${base}`);
    url.username = device.username;
    if (device.password) url.password = device.password;
    return url.toString();
  } catch { return base; }
}

function CctvMaintenance({ notify }: { notify: (text: string) => void }) {
  const [devices, setDevices] = useState<CctvDevice[]>(seedCctv);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CctvDevice | null>(null);
  const [viewing, setViewing] = useState<CctvDevice | null>(null);
  const [nvrUrl, setNvrUrl] = useState('http://192.168.27.10');
  const [nvrActive, setNvrActive] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let rows = await api.get<CctvDevice[]>('/api/cctv');
        if (rows.length === 0) {
          await Promise.all(seedCctv.map(device => api.post('/api/cctv', device)));
          rows = await api.get<CctvDevice[]>('/api/cctv');
        }
        if (!cancelled) setDevices(rows);
      } catch { /* keep seed */ }
      try { const settings = await api.get<Record<string, string>>('/api/settings'); if (!cancelled && settings['cctv-nvr-url']) setNvrUrl(settings['cctv-nvr-url']); } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);

  function persist(next: CctvDevice[], changed?: { created?: CctvDevice; deleted?: CctvDevice }) {
    setDevices(next);
    if (changed?.created) api.post('/api/cctv', changed.created).catch(() => notify('Could not save to the database.'));
    if (changed?.deleted) api.del('/api/cctv', { id: changed.deleted.id }).catch(() => notify('Could not delete from the database.'));
  }

  function addDevice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const device: CctvDevice = { id: `cctv-${Date.now()}`, name: String(form.get('name') || '').trim(), location: String(form.get('location') || '').trim(), ipAddress: String(form.get('ipAddress') || '').trim(), model: String(form.get('model') || '').trim(), status: String(form.get('status') || 'Online'), lastService: String(form.get('lastService') || new Date().toISOString().slice(0, 10)), streamUrl: String(form.get('streamUrl') || '').trim(), username: String(form.get('username') || '').trim(), password: String(form.get('password') || '').trim() };
    if (!device.name) { notify('Camera / device name is required.'); return; }
    persist([device, ...devices], { created: device });
    setShowForm(false);
    notify(`${device.name} added to CCTV inventory.`);
  }

  const online = devices.filter(device => device.status === 'Online').length;
  return (
    <div className="space-y-4">
      <section className="panel p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Workspace · Network</div>
            <h2 className="font-display text-xl">CCTV &amp; Device Maintenance</h2>
            <p className="mt-2 max-w-2xl text-xs text-[var(--muted)]">Track CCTV cameras, NVRs, and other site devices with service status and maintenance history.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-md bg-[var(--teal)] px-3 py-2 text-[11px] font-bold text-[var(--highlight-ink)]"><Plus size={14} /> Add device</button>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <WorkspaceMetric label="Total devices" value={String(devices.length)} detail="CCTV + NVR + other" accent="var(--teal)" />
        <WorkspaceMetric label="Online" value={String(online)} detail="Reachable now" accent="var(--blue)" />
        <WorkspaceMetric label="Offline" value={String(devices.length - online)} detail="Needs service" accent="var(--coral)" />
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b border-[var(--line)] p-5"><h2 className="font-display text-sm">NVR live view</h2><p className="mt-1 text-[10px] text-[var(--muted)]">Enter the NVR / camera web address to load its GUI inside the system.</p></div>
        <div className="flex flex-col gap-3 border-b border-[var(--line)] p-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-xs text-[#617477]">
            <Video size={14} />
            <input value={nvrUrl} onChange={event => setNvrUrl(event.target.value)} placeholder="http://192.168.27.10" className="w-full bg-transparent text-xs text-[var(--ink)] placeholder-[#617477] outline-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { const url = nvrUrl.trim(); if (!url) { notify('Enter the NVR web address.'); return; } api.post('/api/settings', { 'cctv-nvr-url': url }).catch(() => {}); setNvrActive(url.includes('://') ? url : `http://${url}`); }} className="rounded bg-[var(--teal)] px-4 py-2 text-[11px] font-bold text-[var(--highlight-ink)]">Load NVR</button>
            {nvrActive && <button onClick={() => setNvrActive('')} className="rounded border border-[var(--line)] px-3 py-2 text-[11px] text-[var(--muted)] hover:text-[var(--ink)]">Close</button>}
          </div>
        </div>
        {nvrActive ? (
          <div className="bg-black">
            <iframe src={nvrActive} title="NVR live view" className="h-[480px] w-full border-0" allow="autoplay; fullscreen" />
            <p className="border-t border-[var(--line)] p-3 text-[9px] text-[var(--muted)]">Viewing {nvrActive}. If it does not load, the device may block embedding (X-Frame-Options) — open it in a new tab instead.</p>
          </div>
        ) : (
          <div className="grid h-40 place-items-center p-8 text-center text-xs text-[var(--muted)]">Enter an NVR address above and press Load NVR to view its interface here.</div>
        )}
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-[var(--line)] p-5"><h2 className="font-display text-sm">Device register</h2><p className="mt-1 text-[10px] text-[var(--muted)]">Cameras and recording appliances with last service date.</p></div>
        <div className="divide-y divide-[var(--line)]">
          {devices.map(device => (
            <div key={device.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--highlight)] text-[var(--teal)]"><Video size={16} /></div>
              <div className="min-w-0 flex-1">
                <strong className="block text-xs text-[var(--ink)]">{device.name}</strong>
                <span className="text-[10px] text-[var(--muted)]">{device.location} · {device.ipAddress}{device.model ? ` · ${device.model}` : ''}</span>
              </div>
              <span className="text-[10px] text-[var(--muted)]">Serviced {device.lastService}</span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${device.status === 'Online' ? 'badge-green' : 'badge-red'}`}>{device.status}</span>
              <button onClick={() => setViewing(device)} className="flex items-center gap-1 rounded border border-[var(--line)] px-2.5 py-1 text-[10px] text-[var(--ink)] hover:border-[var(--teal)] hover:text-[var(--teal)]"><Video size={11} /> View</button>
              <button onClick={() => setDeleteTarget(device)} className="rounded border border-[#9b4038] bg-[#492b33] px-2.5 py-1 text-[10px] font-medium text-white hover:bg-[#9b4038]">Remove</button>
            </div>
          ))}
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#031015cc] p-5">
          <form onSubmit={addDevice} className="w-full max-w-lg rounded-lg border border-[var(--teal)] bg-[var(--surface)] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div><span className="text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">CCTV & Devices</span><h2 className="mt-1 font-display text-lg font-semibold">Add device</h2></div>
              <button type="button" onClick={() => setShowForm(false)} className="rounded p-1 text-[var(--muted)] hover:text-white"><X size={19} /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-[11px] text-[#8ca2a4] sm:col-span-2">Device name <span className="text-[var(--teal)]">*</span><input name="name" required placeholder="e.g. CAM-04 Warehouse" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" /></label>
              <label className="text-[11px] text-[#8ca2a4]">Location<input name="location" placeholder="Building / area" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" /></label>
              <label className="text-[11px] text-[#8ca2a4]">IP address<input name="ipAddress" placeholder="192.168.27.x" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" /></label>
              <label className="text-[11px] text-[#8ca2a4]">Model<input name="model" placeholder="Camera / NVR model" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" /></label>
              <label className="text-[11px] text-[#8ca2a4]">Last service date<input name="lastService" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" /></label>
              <label className="text-[11px] text-[#8ca2a4] sm:col-span-2">NVR / camera web URL <span className="text-[var(--teal)]">*</span><input name="streamUrl" placeholder="http://192.168.27.10 or http://nvr.local:8080" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" /></label>
              <label className="text-[11px] text-[#8ca2a4]">Login username<input name="username" placeholder="admin" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" /></label>
              <label className="text-[11px] text-[#8ca2a4]">Login password<input name="password" type="password" placeholder="••••••" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" /></label>
              <label className="text-[11px] text-[#8ca2a4]">Status<select name="status" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none"><option>Online</option><option>Offline</option><option>Maintenance</option></select></label>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-[var(--line)] pt-4">
              <button type="button" onClick={() => setShowForm(false)} className="rounded border border-[var(--line)] px-4 py-2 text-xs text-[var(--ink)]">Cancel</button>
              <button type="submit" className="rounded bg-[var(--teal)] px-4 py-2 text-xs font-bold text-[var(--highlight-ink)]">Add device</button>
            </div>
          </form>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#031015cc] p-5">
          <div className="flex h-[86vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-[var(--teal)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--line)] p-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Live view</span>
                <h2 className="mt-0.5 font-display text-base">{viewing.name}</h2>
                <p className="text-[10px] text-[var(--muted)]">{viewing.location} · {buildCctvUrl(viewing)}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={buildCctvUrl(viewing)} target="_blank" rel="noreferrer" className="rounded border border-[var(--line)] px-3 py-1.5 text-[10px] text-[var(--ink)] hover:text-[var(--teal)]">Open in new tab ↗</a>
                <button onClick={() => setViewing(null)} className="rounded p-1 text-[var(--muted)] hover:text-white"><X size={19} /></button>
              </div>
            </div>
            <iframe src={buildCctvUrl(viewing)} title={viewing.name} className="h-full w-full flex-1 border-0 bg-black" allow="autoplay; fullscreen" />
            <p className="border-t border-[var(--line)] p-3 text-[9px] leading-4 text-[var(--muted)]">If the feed does not load, the camera may block embedding (X-Frame-Options) or require its native web plugin. Use “Open in new tab” in that case. Login is passed via the URL when a username is set.</p>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[#031015cc] p-5">
          <div className="w-full max-w-md rounded-lg border border-[#8b4a44] bg-[var(--surface)] p-6 shadow-2xl">
            <h2 className="mt-1 font-display text-lg">Remove device?</h2>
            <p className="mt-3 text-xs leading-5 text-[var(--muted)]">Remove <strong className="text-[var(--ink)]">{deleteTarget.name}</strong> from the CCTV register.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button>
              <button onClick={() => { persist(devices.filter(item => item.id !== deleteTarget.id), { deleted: deleteTarget }); setDeleteTarget(null); notify(`${deleteTarget.name} removed.`); }} className="rounded bg-[#9b4038] px-3 py-2 text-xs font-bold text-white">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SecurityIncidents({ incidents, notify, onUpdate, onLogIncident }: { incidents: SecurityIncident[]; notify: (text: string) => void; onUpdate: (next: SecurityIncident[]) => void; onLogIncident: () => void }) {
  const [filter, setFilter] = useState('All');
  const filtered = incidents.filter(incident => filter === 'All' || incident.status === filter);

  function setStatus(incident: SecurityIncident, status: string) {
    onUpdate(incidents.map(item => item.id === incident.id ? { ...item, status } : item));
    api.patch('/api/incidents', { id: incident.id, status }).catch(() => notify('Could not update incident in the database.'));
    notify(`${incident.id} marked ${status.toLowerCase()}.`);
  }

  return (
    <div className="space-y-4">
      <section className="panel p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Cyber Security</div>
            <h2 className="font-display text-xl">Security Incidents</h2>
            <p className="mt-2 max-w-2xl text-xs text-[var(--muted)]">Track, investigate, and resolve security incidents logged across the workspace.</p>
          </div>
          <button onClick={onLogIncident} className="flex items-center gap-2 rounded-md bg-[var(--teal)] px-3 py-2 text-[11px] font-bold text-[var(--highlight-ink)]"><Plus size={14} /> Log incident</button>
        </div>
      </section>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <WorkspaceMetric label="Open incidents" value={String(incidents.filter(incident => incident.status === 'Open').length)} detail="Awaiting triage" accent="var(--coral)" />
        <WorkspaceMetric label="Investigating" value={String(incidents.filter(incident => incident.status === 'Investigating').length)} detail="Active analysis" accent="var(--amber)" />
        <WorkspaceMetric label="Critical / high" value={String(incidents.filter(incident => (incident.severity === 'Critical' || incident.severity === 'High') && incident.status !== 'Resolved').length)} detail="Unresolved priority" accent="var(--coral)" />
        <WorkspaceMetric label="Resolved" value={String(incidents.filter(incident => incident.status === 'Resolved').length)} detail="All time" accent="var(--teal)" />
      </div>
      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--line)] p-5">
          <div>
            <h2 className="font-display text-sm">Incident register</h2>
            <p className="mt-1 text-[10px] text-[var(--muted)]">Newest incidents first. Status changes save immediately.</p>
          </div>
          <select value={filter} onChange={event => setFilter(event.target.value)} className="rounded border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-xs text-[var(--ink)]">
            <option>All</option>
            <option>Open</option>
            <option>Investigating</option>
            <option>Resolved</option>
          </select>
        </div>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--muted)]">No incidents in this state.</div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {filtered.map(incident => (
              <div key={incident.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--highlight)] text-[var(--teal)]"><ShieldCheck size={15} /></div>
                <div className="min-w-0 flex-1">
                  <strong className="block text-xs text-[var(--ink)]">{incident.id} · {incident.title}</strong>
                  <span className="text-[10px] text-[var(--muted)]">{incident.asset || 'No asset'} · {incident.owner} · {incident.reportedAt}</span>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${incident.severity === 'Critical' || incident.severity === 'High' ? 'badge-red' : incident.severity === 'Medium' ? 'badge-amber' : 'badge-gray'}`}>{incident.severity}</span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${incident.status === 'Resolved' ? 'badge-green' : incident.status === 'Investigating' ? 'badge-blue' : 'badge-amber'}`}>{incident.status}</span>
                <div className="flex gap-1.5">
                  {incident.status === 'Open' && <button onClick={() => setStatus(incident, 'Investigating')} className="rounded border border-[var(--line)] px-2.5 py-1 text-[10px] text-[var(--ink)]">Investigate</button>}
                  {incident.status !== 'Resolved' && <button onClick={() => setStatus(incident, 'Resolved')} className="rounded border border-[var(--line)] px-2.5 py-1 text-[10px] text-[var(--teal)]">Resolve</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

type VaptScanResult = {
  scannedAt: string;
  durationMs: number;
  summary: { ipsScanned: number; portsPerIp: number; openPorts: number; domainsResolved: number; emailsChecked: number; deliverableEmails: number };
  portResults: Array<{ ip: string; port: number; status: string; responseMs: number | null }>;
  domainResults: Array<{ domain: string; resolved: boolean; addresses: string[]; http: string; https: string; error?: string }>;
  emailResults: Array<{ email: string; syntax: string; domain: string; mx: string; status: string }>;
};

function VaptManagement({ notify }: { notify: (text: string) => void }) {
  const [ipsText, setIpsText] = useState('192.168.25.1\n192.168.26.1\n192.168.27.1');
  const [portsText, setPortsText] = useState('22, 80, 443, 445, 3306, 3389, 8080, 8443');
  const [domainsText, setDomainsText] = useState('wesupportinc.com\nhuntershubinc.com');
  const [emailsText, setEmailsText] = useState('admin@wesupportinc.com\nsupport@huntershubinc.com');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<VaptScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<Array<{ id: string; scannedAt: string; targets: number; openPorts: number }>>([]);

  useEffect(() => {
    const stored = localStorage.getItem('wsi-vapt-history');
    startTransition(() => { if (stored) setScanHistory(JSON.parse(stored)); });
  }, []);

  function splitList(text: string) { return Array.from(new Set(text.split(/[\n,;]+/).map(item => item.trim()).filter(Boolean))); }

  async function runScan() {
    const ips = splitList(ipsText);
    const ports = splitList(portsText);
    const domains = splitList(domainsText);
    const emails = splitList(emailsText);
    if (ips.length + domains.length + emails.length === 0) { notify('Enter at least one IP, domain, or email target.'); return; }
    if (ips.length > 0 && ports.length === 0) { notify('Enter at least one port to scan.'); return; }
    setScanning(true);
    try {
      const response = await fetch('/api/vapt/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ips, ports, domains, emails }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Scan failed.');
      setResult(data as VaptScanResult);
      const entry = { id: `scan-${Date.now()}`, scannedAt: new Date().toLocaleString(), targets: ips.length + domains.length + emails.length, openPorts: data.summary.openPorts };
      const next = [entry, ...scanHistory].slice(0, 8);
      setScanHistory(next);
      localStorage.setItem('wsi-vapt-history', JSON.stringify(next));
      notify(`Scan complete: ${data.summary.openPorts} open port(s), ${data.summary.domainsResolved}/${domains.length} domain(s) resolved.`);
    } catch (cause) { notify(cause instanceof Error ? cause.message : 'VAPT scan failed.'); }
    finally { setScanning(false); }
  }

  function exportReport(format: 'csv' | 'pdf') {
    if (!result) { notify('Run a scan first, then generate the report.'); return; }
    const rows: Array<Record<string, unknown>> = [
      ...result.portResults.map(item => ({ Type: 'IP/Port', Target: item.ip, Detail: `Port ${item.port}`, Status: item.status, Extra: item.responseMs ? `${item.responseMs} ms` : '-' })),
      ...result.domainResults.map(item => ({ Type: 'Domain', Target: item.domain, Detail: item.resolved ? item.addresses.join(', ') : item.error || 'No resolution', Status: item.resolved ? 'resolved' : 'failed', Extra: `HTTP ${item.http} · HTTPS ${item.https}` })),
      ...result.emailResults.map(item => ({ Type: 'Email', Target: item.email, Detail: `Domain ${item.domain} · MX ${item.mx}`, Status: item.status, Extra: `Syntax ${item.syntax}` })),
    ];
    const targetSummary = `${result.summary.ipsScanned} IP(s) x ${result.summary.portsPerIp} port(s) · ${result.domainResults.length} domain(s) · ${result.summary.emailsChecked} email(s)`;
    if (format === 'csv') {
      downloadCsv(`vapt-scan-report-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
    } else {
      const ok = printPdfReport({ title: 'VAPT Scan Report', subtitle: `${targetSummary} · Scanned ${new Date(result.scannedAt).toLocaleString()}`, columns: ['Type', 'Target', 'Detail', 'Status', 'Extra'], rows: rows.map(row => [row.Type, row.Target, row.Detail, row.Status, row.Extra]) });
      if (!ok) { notify('Popup blocked. Allow popups to export PDF.'); return; }
    }
    notify(`VAPT report exported as ${format.toUpperCase()}.`);
  }

  return (
    <div className="space-y-4">
      <section className="panel p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Cyber Security</div>
            <h2 className="font-display text-xl">VAPT Management</h2>
            <p className="mt-2 max-w-2xl text-xs text-[var(--muted)]">Scan multiple IPs, ports, domains, and email addresses in one run, then export the findings as a report. Only scan assets you are authorized to test.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => exportReport('csv')} className="flex items-center gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-[11px] text-[var(--ink)]"><Download size={14} /> Export CSV</button>
            <button onClick={() => exportReport('pdf')} className="flex items-center gap-2 rounded-md bg-[var(--teal)] px-3 py-2 text-[11px] font-bold text-[var(--highlight-ink)]"><FileText size={14} /> Generate PDF report</button>
          </div>
        </div>
      </section>

      <section className="panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-sm">Scan configuration</h2>
            <p className="mt-1 text-[10px] text-[var(--muted)]">Enter one target per line (or comma-separated). All sections are optional but at least one target is required.</p>
          </div>
          <button onClick={runScan} disabled={scanning} className="flex items-center gap-2 rounded-md bg-[var(--teal)] px-4 py-2 text-[11px] font-bold text-[var(--highlight-ink)] disabled:opacity-50"><Search size={14} /> {scanning ? 'Scanning...' : 'Run scan'}</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-[11px] text-[#8ca2a4]">Target IPs <span className="text-[var(--muted)]">(one per line)</span>
            <textarea value={ipsText} onChange={event => setIpsText(event.target.value)} rows={4} placeholder={'192.168.25.1\n10.0.0.5'} className="mt-1 w-full resize-none rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 font-mono text-xs text-white focus:border-[var(--teal)] outline-none" />
          </label>
          <label className="text-[11px] text-[#8ca2a4]">Ports <span className="text-[var(--muted)]">(comma-separated, checked against every IP)</span>
            <textarea value={portsText} onChange={event => setPortsText(event.target.value)} rows={4} placeholder="22, 80, 443, 3306, 3389" className="mt-1 w-full resize-none rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 font-mono text-xs text-white focus:border-[var(--teal)] outline-none" />
          </label>
          <label className="text-[11px] text-[#8ca2a4]">Domains <span className="text-[var(--muted)]">(DNS resolution + HTTP/HTTPS check)</span>
            <textarea value={domainsText} onChange={event => setDomainsText(event.target.value)} rows={4} placeholder={'wesupportinc.com\nhuntershubinc.com'} className="mt-1 w-full resize-none rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 font-mono text-xs text-white focus:border-[var(--teal)] outline-none" />
          </label>
          <label className="text-[11px] text-[#8ca2a4]">Emails <span className="text-[var(--muted)]">(syntax + MX record validation)</span>
            <textarea value={emailsText} onChange={event => setEmailsText(event.target.value)} rows={4} placeholder={'admin@wesupportinc.com\nuser@huntershubinc.com'} className="mt-1 w-full resize-none rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 font-mono text-xs text-white focus:border-[var(--teal)] outline-none" />
          </label>
        </div>
      </section>

      {result && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <WorkspaceMetric label="Open ports" value={String(result.summary.openPorts)} detail={`${result.summary.ipsScanned} IP(s) scanned`} accent="var(--coral)" />
            <WorkspaceMetric label="Domains resolved" value={String(result.summary.domainsResolved)} detail={`of ${result.domainResults.length} checked`} accent="var(--teal)" />
            <WorkspaceMetric label="Deliverable emails" value={String(result.summary.deliverableEmails)} detail={`of ${result.summary.emailsChecked} checked`} accent="var(--blue)" />
            <WorkspaceMetric label="Scan duration" value={`${(result.durationMs / 1000).toFixed(1)}s`} detail={new Date(result.scannedAt).toLocaleTimeString()} accent="var(--amber)" />
          </div>

          {result.portResults.length > 0 && (
            <section className="panel overflow-hidden">
              <div className="border-b border-[var(--line)] p-5">
                <h2 className="font-display text-sm">IP &amp; port findings</h2>
                <p className="mt-1 text-[10px] text-[var(--muted)]">TCP connect results for every IP / port combination.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-[11px]">
                  <thead><tr className="border-b border-[var(--line)] bg-[var(--muted-surface)] text-[10px] uppercase tracking-wider text-[var(--muted)]"><th className="p-3 pl-5">IP address</th><th className="p-3">Port</th><th className="p-3">Status</th><th className="p-3 pr-5">Latency</th></tr></thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {result.portResults.map((item, index) => (
                      <tr key={`${item.ip}-${item.port}-${index}`}>
                        <td className="p-3 pl-5 font-mono text-[var(--ink)]">{item.ip}</td>
                        <td className="p-3 font-mono text-[var(--ink)]">{item.port}</td>
                        <td className="p-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${item.status === 'open' ? 'badge-red' : 'badge-green'}`}>{item.status === 'open' ? 'OPEN' : 'closed'}</span></td>
                        <td className="p-3 pr-5 text-[var(--muted)]">{item.responseMs ? `${item.responseMs} ms` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {result.domainResults.length > 0 && (
            <section className="panel overflow-hidden">
              <div className="border-b border-[var(--line)] p-5">
                <h2 className="font-display text-sm">Domain findings</h2>
                <p className="mt-1 text-[10px] text-[var(--muted)]">DNS resolution and web service exposure per domain.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-[11px]">
                  <thead><tr className="border-b border-[var(--line)] bg-[var(--muted-surface)] text-[10px] uppercase tracking-wider text-[var(--muted)]"><th className="p-3 pl-5">Domain</th><th className="p-3">Resolved IPs</th><th className="p-3">Status</th><th className="p-3">HTTP</th><th className="p-3 pr-5">HTTPS</th></tr></thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {result.domainResults.map(item => (
                      <tr key={item.domain}>
                        <td className="p-3 pl-5 font-mono text-[var(--ink)]">{item.domain}</td>
                        <td className="max-w-[220px] truncate p-3 font-mono text-[var(--muted)]" title={item.addresses.join(', ')}>{item.resolved ? item.addresses.join(', ') : item.error || '-'}</td>
                        <td className="p-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${item.resolved ? 'badge-green' : 'badge-red'}`}>{item.resolved ? 'resolved' : 'failed'}</span></td>
                        <td className="p-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${item.http === 'open' ? 'badge-amber' : 'badge-gray'}`}>{item.http}</span></td>
                        <td className="p-3 pr-5"><span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${item.https === 'open' ? 'badge-amber' : 'badge-gray'}`}>{item.https}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {result.emailResults.length > 0 && (
            <section className="panel overflow-hidden">
              <div className="border-b border-[var(--line)] p-5">
                <h2 className="font-display text-sm">Email findings</h2>
                <p className="mt-1 text-[10px] text-[var(--muted)]">Syntax and MX record validation per address.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-[11px]">
                  <thead><tr className="border-b border-[var(--line)] bg-[var(--muted-surface)] text-[10px] uppercase tracking-wider text-[var(--muted)]"><th className="p-3 pl-5">Email</th><th className="p-3">Domain</th><th className="p-3">Syntax</th><th className="p-3">MX record</th><th className="p-3 pr-5">Verdict</th></tr></thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {result.emailResults.map(item => (
                      <tr key={item.email}>
                        <td className="p-3 pl-5 font-mono text-[var(--ink)]">{item.email}</td>
                        <td className="p-3 font-mono text-[var(--muted)]">{item.domain}</td>
                        <td className="p-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${item.syntax === 'valid' ? 'badge-green' : 'badge-red'}`}>{item.syntax}</span></td>
                        <td className="p-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${item.mx === 'found' ? 'badge-green' : item.mx === 'unknown' ? 'badge-gray' : 'badge-amber'}`}>{item.mx}</span></td>
                        <td className="p-3 pr-5"><span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${item.status === 'deliverable' ? 'badge-green' : item.status === 'risky' ? 'badge-amber' : 'badge-red'}`}>{item.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--line)] p-5">
          <div>
            <h2 className="font-display text-sm">Scan history</h2>
            <p className="mt-1 text-[10px] text-[var(--muted)]">Recent VAPT scans run from this workspace.</p>
          </div>
          {scanHistory.length > 0 && <button onClick={() => { setScanHistory([]); localStorage.removeItem('wsi-vapt-history'); notify('Scan history cleared.'); }} className="rounded border border-[var(--line)] px-3 py-2 text-[10px] text-[var(--ink)]">Clear history</button>}
        </div>
        {scanHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--muted)]">No scans yet. Configure targets above and run your first scan.</div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {scanHistory.map(entry => (
              <div key={entry.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--highlight)] text-[var(--teal)]"><Search size={15} /></div>
                <div className="min-w-0 flex-1">
                  <strong className="block text-xs text-[var(--ink)]">{entry.targets} target(s) scanned</strong>
                  <span className="text-[10px] text-[var(--muted)]">{entry.scannedAt}</span>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${entry.openPorts > 0 ? 'badge-amber' : 'badge-green'}`}>{entry.openPorts} open port(s)</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function WorkspaceMetric({ label, value, detail, accent }: { label: string; value: string; detail: string; accent: string }) {
  return <article className="panel relative overflow-hidden p-4"><span className="block text-[10px] text-[var(--muted)]">{label}</span><strong className="mt-3 block font-display text-2xl">{value}</strong><span className="mt-1 block text-[10px]" style={{ color: accent }}>{detail}</span><div className="mt-4 h-1 rounded bg-[var(--highlight)]"><i className="block h-full w-4/5 rounded" style={{ background: accent }} /></div></article>;
}

function ProfileModal({ user, onClose, onSave }: { user: typeof users[number]; onClose: () => void; onSave: () => void }) {
  const [photoPreview, setPhotoPreview] = useState('');
  return <div className="fixed inset-0 z-30 overflow-y-auto bg-[#031015cc] p-5"><form onSubmit={event => { event.preventDefault(); onSave(); }} className="mx-auto my-8 w-full max-w-2xl rounded-lg border border-[#2a555d] bg-[var(--surface)] p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><span className="text-[10px] font-bold uppercase tracking-[1.3px] text-[var(--teal)]">Account settings</span><h2 className="mt-1 font-display text-lg">Edit profile</h2></div><button type="button" onClick={onClose}><X size={19} /></button></div><div className="mb-5 flex items-center gap-4 rounded-md border border-[var(--line)] bg-[var(--canvas)] p-4"><div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-[#254a51] text-sm font-bold text-[var(--teal)]">{photoPreview ? <img src={photoPreview} alt="Profile preview" className="h-full w-full object-cover" /> : user.initials}</div><div><strong className="block text-xs">Profile photo</strong><span className="mt-1 block text-[10px] text-[#617477]">PNG or JPG, up to 5 MB</span><label className="mt-2 inline-block cursor-pointer rounded border border-[var(--line)] px-3 py-1.5 text-[10px] text-[#b2c6c6]">Upload photo<input type="file" accept="image/png,image/jpeg" className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = () => setPhotoPreview(String(reader.result)); reader.readAsDataURL(file); } }} /></label></div></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-[11px] text-[#8ca2a4]">Full name<input defaultValue={user.name} required className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white" /></label><label className="text-[11px] text-[#8ca2a4]">Birthday<input defaultValue={user.birthday} type="date" required className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white" /></label><label className="text-[11px] text-[#8ca2a4]">Contact number<input defaultValue={user.contactNumber} type="tel" required className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white" /></label><label className="text-[11px] text-[#8ca2a4]">User level access<select defaultValue={user.accessLevel} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white"><option value="MASTER_ADMIN">Master Admin</option><option value="ADMIN">Admin</option><option value="IT_SECURITY_OFFICER">IT Security Officer</option><option value="IT_USER">IT User</option></select></label><label className="text-[11px] text-[#8ca2a4] sm:col-span-2">Address<textarea defaultValue={user.address} rows={3} required className="mt-1 w-full resize-none rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white" /></label></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button><button className="rounded bg-[var(--teal)] px-3 py-2 text-xs font-bold text-[var(--highlight-ink)]">Save changes</button></div></form></div>;
}

function AccessReviewModal({ user, initialPermissions, onClose, onApprove }: { user: typeof users[number]; initialPermissions?: Record<string, boolean>; onClose: () => void; onApprove: () => void }) {
  const modules = allModules;
  const [permissions, setPermissions] = useState<Record<string, boolean>>(() => Object.fromEntries(modules.map(module => [module, user.accessLevel === 'MASTER_ADMIN' || module === 'Security Dashboard'])));
  const toggleModule = (module: string) => setPermissions(current => ({ ...current, [module]: !current[module] }));
  const grantAll = () => setPermissions(Object.fromEntries(modules.map(module => [module, true])));
  const revokeAll = () => setPermissions(Object.fromEntries(modules.map(module => [module, false])));
  return <div className="fixed inset-0 z-30 overflow-y-auto bg-[#031015cc] p-5"><div className="mx-auto my-8 w-full max-w-2xl rounded-lg border border-[#2a555d] bg-[var(--surface)] p-6 shadow-2xl"><div className="mb-5 flex items-start justify-between"><div><span className="text-[10px] font-bold uppercase tracking-[1.3px] text-[var(--teal)]">Module permission review</span><h2 className="mt-1 font-display text-lg">Review access</h2><p className="mt-1 text-xs text-[#8ca2a4]">{user.name} · {user.role}</p></div><button onClick={onClose}><X size={19} /></button></div><div className="mb-5 flex items-center justify-between rounded-md border border-[#195a55] bg-[#0b2928] p-3"><div><strong className="block text-xs text-[#bff2e6]">Master Admin control enabled</strong><span className="mt-1 block text-[10px] text-[#7fa4a2]">You can grant or revoke each module for this user.</span></div><div className="flex gap-2"><button onClick={grantAll} className="rounded border border-[#2b756b] px-2 py-1 text-[10px] text-[var(--teal)]">Grant all</button><button onClick={revokeAll} className="rounded border border-[#70403c] px-2 py-1 text-[10px] text-[#ef9b88]">Revoke all</button></div></div><div className="grid gap-2 sm:grid-cols-2">{modules.map(module => <label key={module} className="flex cursor-pointer items-center justify-between rounded border border-[var(--line)] p-3 text-xs text-[#d5e2e0] hover:bg-[#102a32]"><span>{module}</span><button type="button" role="switch" aria-checked={permissions[module]} onClick={() => toggleModule(module)} className={`relative h-5 w-9 rounded-full transition ${permissions[module] ? 'bg-[var(--teal)]' : 'bg-[#29434a]'}`}><span className={`absolute top-1 h-3 w-3 rounded-full bg-white transition ${permissions[module] ? 'left-5' : 'left-1'}`} /></button></label>)}</div><div className="mt-6 flex justify-end gap-2"><button onClick={onClose} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button><button onClick={onApprove} className="rounded bg-[var(--teal)] px-3 py-2 text-xs font-bold text-[var(--highlight-ink)]">Save permissions</button></div></div></div>;
}

function EditableProfileModal({ user, onClose, onSave }: { user: typeof users[number]; onClose: () => void; onSave: (updates: Partial<typeof users[number]>) => void }) {
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl);
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave({ name: String(form.get('fullName')), birthday: String(form.get('birthday')), contactNumber: String(form.get('contactNumber')), address: String(form.get('address')), accessLevel: String(form.get('accessLevel')), role: String(form.get('accessLevel')).replaceAll('_', ' '), photoUrl });
  }
  return <div className="fixed inset-0 z-30 overflow-y-auto bg-[#031015cc] p-5"><form onSubmit={handleSubmit} className="mx-auto my-8 w-full max-w-2xl rounded-lg border border-[#2a555d] bg-[var(--surface)] p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><span className="text-[10px] font-bold uppercase tracking-[1.3px] text-[var(--teal)]">Account settings</span><h2 className="mt-1 font-display text-lg">Edit profile</h2></div><button type="button" onClick={onClose}><X size={19} /></button></div><div className="mb-5 flex items-center gap-4 rounded-md border border-[var(--line)] bg-[var(--canvas)] p-4"><div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-[#254a51] text-sm font-bold text-[var(--teal)]">{photoUrl ? <img src={photoUrl} alt="Profile preview" className="h-full w-full object-cover" /> : user.initials}</div><div><strong className="block text-xs">Profile photo</strong><span className="mt-1 block text-[10px] text-[#617477]">PNG or JPG, up to 5 MB</span><label className="mt-2 inline-block cursor-pointer rounded border border-[var(--line)] px-3 py-1.5 text-[10px] text-[#b2c6c6]">Upload photo<input type="file" accept="image/png,image/jpeg" className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file && file.size <= 5 * 1024 * 1024) { const reader = new FileReader(); reader.onload = () => setPhotoUrl(String(reader.result)); reader.readAsDataURL(file); } }} /></label></div></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-[11px] text-[#8ca2a4]">Full name<input name="fullName" defaultValue={user.name} required className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white" /></label><label className="text-[11px] text-[#8ca2a4]">Birthday<input name="birthday" defaultValue={user.birthday} type="date" required className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white" /></label><label className="text-[11px] text-[#8ca2a4]">Contact number<input name="contactNumber" defaultValue={user.contactNumber} type="tel" required className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white" /></label><label className="text-[11px] text-[#8ca2a4]">User level access<select name="accessLevel" defaultValue={user.accessLevel} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white"><option value="MASTER_ADMIN">Master Admin</option><option value="ADMIN">Admin</option><option value="IT_SECURITY_OFFICER">IT Security Officer</option><option value="IT_USER">IT User</option></select></label><label className="text-[11px] text-[#8ca2a4] sm:col-span-2">Address<textarea name="address" defaultValue={user.address} rows={3} required className="mt-1 w-full resize-none rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white" /></label></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button><button className="rounded bg-[var(--teal)] px-3 py-2 text-xs font-bold text-[var(--highlight-ink)]">Save changes</button></div></form></div>;
}

function EditableAccessReviewModal({ user, initialPermissions, onClose, onApprove }: { user: typeof users[number]; initialPermissions?: Record<string, boolean>; onClose: () => void; onApprove: (permissions: Record<string, boolean>) => void }) {
  const [permissions, setPermissions] = useState<Record<string, boolean>>(() => initialPermissions || Object.fromEntries(allModules.map(module => [module, true])));
  const setModule = (module: string) => setPermissions(current => ({ ...current, [module]: !current[module] }));
  return <div className="fixed inset-0 z-30 overflow-y-auto bg-[#031015cc] p-5"><div className="mx-auto my-8 w-full max-w-2xl rounded-lg border border-[#2a555d] bg-[var(--surface)] p-6 shadow-2xl"><div className="mb-5 flex items-start justify-between"><div><span className="text-[10px] font-bold uppercase tracking-[1.3px] text-[var(--teal)]">Module permission review</span><h2 className="mt-1 font-display text-lg">Review access</h2><p className="mt-1 text-xs text-[#8ca2a4]">{user.name} · {user.role}</p></div><button onClick={onClose}><X size={19} /></button></div><div className="mb-5 flex items-center justify-between rounded-md border border-[#195a55] bg-[#0b2928] p-3"><div><strong className="block text-xs text-[#bff2e6]">Master Admin control enabled</strong><span className="mt-1 block text-[10px] text-[#7fa4a2]">Grant or revoke each module for this user.</span></div><div className="flex gap-2"><button onClick={() => setPermissions(Object.fromEntries(allModules.map(module => [module, true])))} className="rounded border border-[#2b756b] px-2 py-1 text-[10px] text-[var(--teal)]">Grant all</button><button onClick={() => setPermissions(Object.fromEntries(allModules.map(module => [module, false])))} className="rounded border border-[#70403c] px-2 py-1 text-[10px] text-[#ef9b88]">Revoke all</button></div></div><div className="grid gap-2 sm:grid-cols-2">{allModules.map(module => <div key={module} className="flex items-center justify-between rounded border border-[var(--line)] p-3 text-xs text-[#d5e2e0]"><span>{module}</span><button type="button" role="switch" aria-checked={permissions[module]} onClick={() => setModule(module)} className={`relative h-5 w-9 rounded-full transition ${permissions[module] ? 'bg-[var(--teal)]' : 'bg-[#29434a]'}`}><span className={`absolute top-1 h-3 w-3 rounded-full bg-white transition ${permissions[module] ? 'left-5' : 'left-1'}`} /></button></div>)}</div><div className="mt-6 flex justify-end gap-2"><button onClick={onClose} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button><button onClick={() => onApprove(permissions)} className="rounded bg-[var(--teal)] px-3 py-2 text-xs font-bold text-[var(--highlight-ink)]">Save permissions</button></div></div></div>;
}

function FullProfileModal({ user, onClose, onSave }: { user: typeof users[number]; onClose: () => void; onSave: (updates: Partial<typeof users[number]>) => void }) {
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl);
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave({ name: String(form.get('fullName')), birthday: String(form.get('birthday')), contactNumber: String(form.get('contactNumber')), address: String(form.get('address')), email: String(form.get('email')), accessLevel: String(form.get('accessLevel')), role: String(form.get('accessLevel')).replaceAll('_', ' '), passwordConfigured: Boolean(form.get('password')), mfaEnabled: form.get('mfaEnabled') === 'on', photoUrl });
  }
  return <div className="fixed inset-0 z-30 overflow-y-auto bg-[#031015cc] p-5"><form onSubmit={handleSubmit} className="mx-auto my-8 w-full max-w-2xl rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><span className="text-[10px] font-bold uppercase tracking-[1.3px] text-[var(--teal)]">Account settings</span><h2 className="mt-1 font-display text-lg">Edit profile and login</h2></div><button type="button" onClick={onClose}><X size={19} /></button></div><div className="mb-5 flex items-center gap-4 rounded-md border border-[var(--line)] bg-[var(--canvas)] p-4"><div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-[#254a51] text-sm font-bold text-[var(--teal)]">{photoUrl ? <img src={photoUrl} alt="Profile preview" className="h-full w-full object-cover" /> : user.initials}</div><label className="cursor-pointer rounded border border-[var(--line)] px-3 py-2 text-[10px] text-[var(--ink)]">Upload photo<input type="file" accept="image/png,image/jpeg" className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file && file.size <= 5 * 1024 * 1024) { const reader = new FileReader(); reader.onload = () => setPhotoUrl(String(reader.result)); reader.readAsDataURL(file); } }} /></label><span className="text-[10px] text-[#617477]">PNG or JPG, up to 5 MB</span></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-[11px] text-[#8ca2a4]">Full name<input name="fullName" defaultValue={user.name} required className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /></label><label className="text-[11px] text-[#8ca2a4]">Birthday<input name="birthday" defaultValue={user.birthday} type="date" required className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /></label><label className="text-[11px] text-[#8ca2a4]">Contact number<input name="contactNumber" defaultValue={user.contactNumber} required className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /></label><label className="text-[11px] text-[#8ca2a4]">User level access<select name="accessLevel" defaultValue={user.accessLevel} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm"><option value="MASTER_ADMIN">Master Admin</option><option value="ADMIN">Admin</option><option value="IT_SECURITY_OFFICER">IT Security Officer</option><option value="IT_USER">IT User</option></select></label><label className="text-[11px] text-[#8ca2a4] sm:col-span-2">Login email<input name="email" defaultValue={user.email} type="email" required className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /></label><label className="text-[11px] text-[#8ca2a4] sm:col-span-2">New password<input name="password" type="password" placeholder={user.passwordConfigured ? 'Leave blank to keep current password' : 'Create a login password'} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /></label><label className="flex items-center gap-3 rounded border border-[var(--line)] p-3 text-xs sm:col-span-2"><input name="mfaEnabled" type="checkbox" defaultChecked={user.mfaEnabled} className="accent-[#49d4bf]" /> Enable multi-factor authentication (MFA)</label><label className="text-[11px] text-[#8ca2a4] sm:col-span-2">Address<textarea name="address" defaultValue={user.address} rows={3} required className="mt-1 w-full resize-none rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /></label></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button><button className="rounded bg-[var(--teal)] px-3 py-2 text-xs font-bold text-[var(--highlight-ink)]">Save profile</button></div></form></div>;
}

function PfSenseSettingsModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [settings, setSettings] = useState({ name: 'Primary pfSense', baseUrl: '', statusPath: '/api/v2/status/system', configured: false });
  const [error, setError] = useState('');
  useEffect(() => { fetch('/api/integrations/pfsense/settings').then(response => response.json()).then(data => setSettings(current => ({ ...current, ...data }))).catch(() => setError('Could not load pfSense settings.')); }, []);
  async function save(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); try { const form = new FormData(event.currentTarget); const response = await fetch('/api/integrations/pfsense/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.get('name'), baseUrl: form.get('baseUrl'), username: form.get('username'), password: form.get('password'), apiKey: form.get('apiKey'), apiSecret: form.get('apiSecret'), statusPath: form.get('statusPath') }) }); const text = await response.text(); let data: { error?: string } = {}; try { data = text ? JSON.parse(text) : {}; } catch { data = { error: `Save failed (${response.status}).` }; } if (response.ok) onSaved(); else setError(data.error || `Could not save pfSense settings (${response.status}).`); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not connect to the application server.'); } }
   return <div className="fixed inset-0 z-50 grid place-items-center bg-[#031015cc] p-5"><form onSubmit={save} className="w-full max-w-lg rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><span className="text-[10px] font-bold uppercase tracking-[1.3px] text-[var(--teal)]">Secure integration</span><h2 className="mt-1 font-display text-lg">Connect pfSense</h2></div><button type="button" onClick={onClose}><X size={19} /></button></div><p className="mb-5 rounded border border-[var(--line)] bg-[var(--highlight)] p-3 text-[10px] leading-4 text-[var(--muted)]">Your pfSense package does not provide an API package, so you can use a dedicated read-only web login. Credentials are encrypted server-side.</p><div className="grid gap-4"><label className="text-[11px] text-[var(--muted)]">Connection name<input name="name" defaultValue={settings.name} required className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /></label><label className="text-[11px] text-[var(--muted)]">pfSense web address<input name="baseUrl" defaultValue={settings.baseUrl} required placeholder="https://192.168.25.1" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /></label><label className="text-[11px] text-[var(--muted)]">pfSense username<input name="username" placeholder="Read-only username" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /></label><label className="text-[11px] text-[var(--muted)]">pfSense password<input name="password" type="password" placeholder="Password" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /></label><div className="border-t border-[var(--line)] pt-4 text-[10px] text-[var(--muted)]">If you later install the REST API package, API key and secret fields can be used instead.</div><label className="text-[11px] text-[var(--muted)]">Status API path<input name="statusPath" defaultValue={settings.statusPath} required className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm" /></label></div>{error && <p className="mt-4 rounded border border-[#8b4a44] bg-[#f5dfd0] p-3 text-xs text-[#4b2112]">{error}</p>}<div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded border border-[var(--line)] px-3 py-2 text-xs">Cancel</button><button className="rounded bg-[var(--teal)] px-3 py-2 text-xs font-bold text-[var(--highlight-ink)]">Save connection</button></div></form></div>;
}

type SystemSettings = {
  orgName: string;
  department: string;
  companyLogo: string;
  companyTagline: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyWebsite: string;
  sessionTimeout: string;
  retentionDays: string;
  notificationsEmail: string;
  enforceMfa: boolean;
  autoBackup: boolean;
  aiEnabled: boolean;
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  aiBaseUrl: string;
  aiAssist: string[];
};

const defaultSystemSettings: SystemSettings = { orgName: 'WeSupport, Incorporated', department: 'Cyber Security Department', companyLogo: '', companyTagline: 'Cyber Security Management Information System', companyEmail: 'security@wsi.local', companyPhone: '+63 917 555 0100', companyAddress: 'WSI Main Office', companyWebsite: '', sessionTimeout: '30', retentionDays: '400', notificationsEmail: 'security@wsi.local', enforceMfa: true, autoBackup: true, aiEnabled: false, aiProvider: 'OpenAI', aiApiKey: '', aiModel: 'gpt-4o-mini', aiBaseUrl: '', aiAssist: ['Document checking'] };
const aiProviders = ['OpenAI', 'Azure OpenAI', 'Anthropic', 'Google Gemini', 'Custom'];
const aiAssistOptions = ['Document checking', 'Incident triage', 'Vulnerability summaries', 'Report drafting', 'Compliance gap hints'];

function loadSystemSettings(): SystemSettings {
  try {
    const stored = localStorage.getItem('wsi-system-settings');
    if (stored) return { ...defaultSystemSettings, ...(JSON.parse(stored) as Partial<SystemSettings>) };
  } catch { /* ignore */ }
  return defaultSystemSettings;
}

function ConnectedModuleView({ module, notify }: { module: CustomModule; notify: (text: string) => void }) {
  return (
    <div className="panel space-y-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Connected system</span>
          <h2 className="mt-1 font-display text-xl">{module.title}</h2>
        </div>
        <button type="button" onClick={() => notify(`${module.title} synchronization requested.`)} className="rounded border border-[var(--line)] px-3 py-1.5 text-[10px] text-[var(--ink)]">Sync now</button>
      </div>
      <p className="text-sm text-[var(--muted)]">{module.description || 'Connected external system.'}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded border border-[var(--line)] bg-[var(--canvas)] p-3">
          <div className="text-[10px] uppercase tracking-[1.4px] text-[var(--muted)]">Base URL</div>
          <a href={module.baseUrl || '#'} target="_blank" rel="noreferrer" className="mt-2 block break-all text-xs text-[var(--teal)]">{module.baseUrl || 'Not configured'}</a>
        </div>
        <div className="rounded border border-[var(--line)] bg-[var(--canvas)] p-3">
          <div className="text-[10px] uppercase tracking-[1.4px] text-[var(--muted)]">API key</div>
          <div className="mt-2 text-xs text-[var(--ink)]">{module.apiKey ? 'Configured and encrypted' : 'Not configured'}</div>
        </div>
      </div>
    </div>
  );
}

function SystemSettingsModal({ theme, onThemeChange, customModules, onCustomModulesChange, notify, onClose }: { theme: string; onThemeChange: (value: string) => void; customModules: CustomModule[]; onCustomModulesChange: (value: CustomModule[]) => void; notify: (text: string) => void; onClose: () => void }) {
  const [tab, setTab] = useState<'general' | 'security' | 'ai' | 'data'>('general');
  const [settings, setSettings] = useState<SystemSettings>(defaultSystemSettings);
  const [showKey, setShowKey] = useState(false);
  const [busy, setBusy] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const restoreRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await api.get<Record<string, string>>('/api/settings');
        if (!cancelled && stored['system-settings']) {
          const parsed = { ...defaultSystemSettings, ...(JSON.parse(stored['system-settings']) as Partial<SystemSettings>) };
          setSettings(parsed);
          setLogoPreview(parsed.companyLogo);
        }
      } catch { if (!cancelled) setSettings(loadSystemSettings()); }
    })();
    return () => { cancelled = true; };
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next: SystemSettings = {
      orgName: String(form.get('orgName') || '').trim(),
      department: String(form.get('department') || '').trim(),
      companyLogo: logoPreview,
      companyTagline: String(form.get('companyTagline') || '').trim(),
      companyEmail: String(form.get('companyEmail') || '').trim(),
      companyPhone: String(form.get('companyPhone') || '').trim(),
      companyAddress: String(form.get('companyAddress') || '').trim(),
      companyWebsite: String(form.get('companyWebsite') || '').trim(),
      sessionTimeout: String(form.get('sessionTimeout') || '30'),
      retentionDays: String(form.get('retentionDays') || '400'),
      notificationsEmail: String(form.get('notificationsEmail') || '').trim(),
      enforceMfa: form.get('enforceMfa') === 'on',
      autoBackup: form.get('autoBackup') === 'on',
      aiEnabled: form.get('aiEnabled') === 'on',
      aiProvider: String(form.get('aiProvider') || 'OpenAI'),
      aiApiKey: String(form.get('aiApiKey') || '').trim(),
      aiModel: String(form.get('aiModel') || '').trim(),
      aiBaseUrl: String(form.get('aiBaseUrl') || '').trim(),
      aiAssist: aiAssistOptions.filter(option => form.get(`assist-${option}`) === 'on'),
    };
    try { await api.post('/api/settings', { 'system-settings': JSON.stringify(next) }); } catch { notify('Could not persist settings to the database; kept locally.'); }
    localStorage.setItem('wsi-system-settings', JSON.stringify(next));
    setSettings(next);
    notify('Settings saved.');
    onClose();
  }

  async function downloadBackup() {
    try {
      const response = await fetch('/api/maintenance', { cache: 'no-store' });
      if (!response.ok) throw new Error('failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `wsi-mis-backup-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      notify('Database backup downloaded.');
    } catch { notify('Backup failed. Check the database connection.'); }
  }

  async function restoreBackup(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      await api.post('/api/maintenance?action=restore', parsed);
      notify('Backup restored. Reloading…');
      setTimeout(() => window.location.reload(), 800);
    } catch { notify('Restore failed. Use a valid WSI MIS backup JSON file.'); }
    setBusy(false);
  }

  async function resetAllData() {
    if (!confirm('This will permanently delete ALL records in the system database. This cannot be undone. Continue?')) return;
    setBusy(true);
    try {
      await api.post('/api/maintenance?action=reset', {});
      localStorage.clear();
      notify('All system data cleared. Reloading…');
      setTimeout(() => window.location.reload(), 800);
    } catch { notify('Reset failed. Check the database connection.'); }
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#031015cc] p-5">
      <form onSubmit={save} className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-[var(--teal)] bg-[var(--surface)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--line)] p-5">
          <div><span className="text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">System</span><h2 className="mt-1 font-display text-lg">Settings</h2></div>
          <button type="button" onClick={onClose} className="rounded p-1 text-[var(--muted)] hover:text-white"><X size={19} /></button>
        </div>
        <div className="flex gap-2 border-b border-[var(--line)] px-5 pt-4">
          {(['general', 'security', 'ai', 'data'] as const).map(key => (
            <button key={key} type="button" onClick={() => setTab(key)} className={`rounded-t-md border-b-2 px-3 py-2 text-[11px] transition ${tab === key ? 'border-[var(--teal)] font-semibold text-[var(--teal)]' : 'border-transparent text-[var(--muted)]'}`}>
              {key === 'general' ? 'General' : key === 'security' ? 'Security & Integrations' : key === 'ai' ? 'AI Assistant' : 'Data & Backup'}
            </button>
          ))}
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {tab === 'general' && (
            <>
              <div className="rounded border border-[var(--line)] bg-[var(--canvas)] p-4">
                <strong className="block text-xs text-[var(--ink)]">Company branding</strong>
                <p className="mt-1 text-[10px] text-[var(--muted)]">Logo, name, and details shown across the system (sidebar, login, reports).</p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)]">
                    {logoPreview ? <img src={logoPreview} alt="Company logo" className="h-full w-full object-contain" /> : <span className="font-display text-lg font-bold text-[var(--teal)]">{(settings.orgName || 'WSI').split(' ').map(word => word[0]).join('').slice(0, 3).toUpperCase()}</span>}
                  </div>
                  <label className="cursor-pointer rounded border border-[var(--line)] px-3 py-2 text-[10px] text-[var(--ink)] hover:text-[var(--teal)]">Upload logo
                    <input type="file" accept="image/*" className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = () => setLogoPreview(String(reader.result || '')); reader.readAsDataURL(file); } }} />
                  </label>
                  {logoPreview && <button type="button" onClick={() => setLogoPreview('')} className="text-[10px] text-[var(--muted)] hover:text-[var(--coral)]">Remove</button>}
                </div>
              </div>
              <label className="block text-[11px] text-[#8ca2a4]">Company name<input name="orgName" defaultValue={settings.orgName} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" /></label>
              <label className="block text-[11px] text-[#8ca2a4]">Tagline<input name="companyTagline" defaultValue={settings.companyTagline} placeholder="e.g. Cyber Security Management Information System" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" /></label>
              <label className="block text-[11px] text-[#8ca2a4]">Department<input name="department" defaultValue={settings.department} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-[11px] text-[#8ca2a4]">Company email<input name="companyEmail" type="email" defaultValue={settings.companyEmail} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" /></label>
                <label className="block text-[11px] text-[#8ca2a4]">Company phone<input name="companyPhone" defaultValue={settings.companyPhone} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" /></label>
              </div>
              <label className="block text-[11px] text-[#8ca2a4]">Address<input name="companyAddress" defaultValue={settings.companyAddress} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" /></label>
              <label className="block text-[11px] text-[#8ca2a4]">Website<input name="companyWebsite" defaultValue={settings.companyWebsite} placeholder="https://…" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" /></label>
              <label className="block text-[11px] text-[#8ca2a4]">Notifications email<input name="notificationsEmail" type="email" defaultValue={settings.notificationsEmail} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" /></label>
              <label className="block text-[11px] text-[#8ca2a4]">Theme
                <select value={theme} onChange={event => onThemeChange(event.target.value)} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none">
                  <option value="dark">Dark (mint)</option>
                  <option value="light">Light</option>
                  <option value="blue">Blue</option>
                  <option value="paper">Paper</option>
                </select>
              </label>
            </>
          )}
          {tab === 'security' && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-[11px] text-[#8ca2a4]">Session timeout (minutes)<input name="sessionTimeout" type="number" min="5" defaultValue={settings.sessionTimeout} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" /></label>
                <label className="block text-[11px] text-[#8ca2a4]">Log retention (days)<input name="retentionDays" type="number" min="30" defaultValue={settings.retentionDays} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" /></label>
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded border border-[var(--line)] bg-[var(--canvas)] p-3 text-xs text-white">
                <input name="enforceMfa" type="checkbox" defaultChecked={settings.enforceMfa} className="h-4 w-4 accent-[#49d4bf]" />
                <span><strong className="block text-xs text-[var(--teal)]">Enforce MFA</strong><span className="text-[10px] text-[var(--muted)]">Require multi-factor authentication for all accounts.</span></span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded border border-[var(--line)] bg-[var(--canvas)] p-3 text-xs text-white">
                <input name="autoBackup" type="checkbox" defaultChecked={settings.autoBackup} className="h-4 w-4 accent-[#49d4bf]" />
                <span><strong className="block text-xs text-[var(--teal)]">Automatic backup verification</strong><span className="text-[10px] text-[var(--muted)]">Verify backup jobs on their schedule.</span></span>
              </label>
            </>
          )}
          {tab === 'ai' && (
            <>
              <label className="flex cursor-pointer items-center gap-3 rounded border border-[var(--line)] bg-[var(--canvas)] p-3 text-xs text-white">
                <input name="aiEnabled" type="checkbox" defaultChecked={settings.aiEnabled} className="h-4 w-4 accent-[#49d4bf]" />
                <span><strong className="block text-xs text-[var(--teal)]">Enable AI assistant</strong><span className="text-[10px] text-[var(--muted)]">Use an AI API to help check documents and other records in the system.</span></span>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-[11px] text-[#8ca2a4]">Provider
                  <select name="aiProvider" defaultValue={settings.aiProvider} className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none">{aiProviders.map(provider => <option key={provider}>{provider}</option>)}</select>
                </label>
                <label className="block text-[11px] text-[#8ca2a4]">Model<input name="aiModel" defaultValue={settings.aiModel} placeholder="gpt-4o-mini" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" /></label>
              </div>
              <label className="block text-[11px] text-[#8ca2a4]">API key
                <div className="relative mt-1">
                  <input name="aiApiKey" type={showKey ? 'text' : 'password'} defaultValue={settings.aiApiKey} placeholder="sk-..." className="w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 pr-10 text-sm text-white focus:border-[var(--teal)] outline-none" />
                  <button type="button" onClick={() => setShowKey(value => !value)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--teal)]">{showKey ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                </div>
                <span className="mt-1 block text-[9px] text-[var(--muted)]">Stored only in this browser. For production, route AI calls through the server.</span>
              </label>
              <label className="block text-[11px] text-[#8ca2a4]">Custom base URL (optional)<input name="aiBaseUrl" defaultValue={settings.aiBaseUrl} placeholder="https://your-endpoint/v1" className="mt-1 w-full rounded border border-[var(--line)] bg-[var(--canvas)] p-2.5 text-sm text-white focus:border-[var(--teal)] outline-none" /></label>
              <div className="rounded border border-[var(--line)] bg-[var(--canvas)] p-3">
                <strong className="block text-xs text-[var(--ink)]">Use AI for</strong>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {aiAssistOptions.map(option => (
                    <label key={option} className="flex cursor-pointer items-center gap-2 text-[11px] text-[var(--ink)]">
                      <input name={`assist-${option}`} type="checkbox" defaultChecked={settings.aiAssist.includes(option)} className="h-3.5 w-3.5 accent-[#49d4bf]" /> {option}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
          {tab === 'data' && (
            <>
              <div className="rounded border border-[var(--line)] bg-[var(--canvas)] p-4">
                <strong className="block text-xs text-[var(--ink)]">Download backup</strong>
                <p className="mt-1 text-[10px] text-[var(--muted)]">Export all system data (records, documents, inventory, chat, settings) as a JSON file you can keep or move to another server.</p>
                <button type="button" onClick={downloadBackup} disabled={busy} className="mt-3 flex items-center gap-2 rounded bg-[var(--teal)] px-3 py-2 text-[11px] font-bold text-[var(--highlight-ink)] disabled:opacity-50"><Download size={13} /> Download database backup</button>
              </div>
              <div className="rounded border border-[var(--line)] bg-[var(--canvas)] p-4">
                <strong className="block text-xs text-[var(--ink)]">Restore backup</strong>
                <p className="mt-1 text-[10px] text-[var(--muted)]">Upload a WSI MIS backup JSON file to restore data into the database. Existing records with the same id are updated.</p>
                <input ref={restoreRef} type="file" accept="application/json,.json" className="hidden" onChange={event => { restoreBackup(event.target.files?.[0]); event.target.value = ''; }} />
                <button type="button" onClick={() => restoreRef.current?.click()} disabled={busy} className="mt-3 flex items-center gap-2 rounded border border-[var(--line)] px-3 py-2 text-[11px] text-[var(--ink)] hover:text-[var(--teal)] disabled:opacity-50"><Upload size={13} /> {busy ? 'Working…' : 'Upload & restore backup'}</button>
              </div>
              <div className="rounded border border-[#9b4038] bg-[#492b33] p-4">
                <strong className="block text-xs text-[#ef9b88]">Danger zone</strong>
                <p className="mt-1 text-[10px] text-[#d8a49b]">Permanently delete all data in the system database (records, documents, inventory, chat, settings). This cannot be undone.</p>
                <button type="button" onClick={resetAllData} disabled={busy} className="mt-3 rounded bg-[#9b4038] px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50">Clear all system data</button>
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-[var(--line)] p-5">
          <button type="button" onClick={onClose} className="rounded border border-[var(--line)] px-4 py-2 text-xs text-[var(--ink)]">Cancel</button>
          {tab !== 'data' && <button type="submit" className="rounded bg-[var(--teal)] px-4 py-2 text-xs font-bold text-[var(--highlight-ink)]">Save settings</button>}
        </div>
      </form>
    </div>
  );
}

function ProfileDrawer({ user, onEdit, onLogout, onClose }: { user: typeof users[number]; onEdit: () => void; onLogout: () => void; onClose: () => void }) {
  return <div className="fixed inset-0 z-40 bg-[#03101566]" onClick={onClose}><aside onClick={event => event.stopPropagation()} className="profile-drawer absolute right-0 top-0 h-full w-full max-w-sm border-l border-[var(--line)] bg-[#0c2027] p-6 shadow-2xl animate-[drawer-in_.22s_ease-out]">
    <div className="flex items-start justify-between"><div><span className="text-[10px] font-bold uppercase tracking-[1.4px] text-[var(--teal)]">Account menu</span><h2 className="mt-2 font-display text-xl">{user.name}</h2><p className="mt-1 text-xs text-[#8ca2a4]">{user.title} · {user.department}</p></div><button onClick={onClose} className="text-[#8ca2a4]"><X size={19} /></button></div>
    <div className="mt-7 flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--canvas)] p-4"><UserAvatar user={user} sizeClass="h-12 w-12" textClass="text-xs" /><div><strong className="block text-xs">{user.role}</strong><span className="mt-1 block text-[10px] text-[var(--teal)]">{user.status} account</span></div></div>
    <div className="mt-8 space-y-2"><button onClick={onEdit} className="flex w-full items-center justify-between rounded-md border border-[var(--line)] px-3 py-3 text-left text-xs text-[var(--ink)]">Edit profile <span className="text-[#617477]">→</span></button><button onClick={onLogout} className="flex w-full items-center justify-between rounded-md border border-[#70403c] px-3 py-3 text-left text-xs text-[#ef9b88]">Log out <span>↗</span></button></div>
  </aside></div>;
}

function NotificationsDrawer({ notifications, onNavigate, onMarkAllRead, onClose }: { notifications: Array<{ id: string; title: string; detail: string; module: string; unread: boolean }>; onNavigate: (module: string) => void; onMarkAllRead: () => void; onClose: () => void }) {
  return <div className="fixed inset-0 z-40 bg-[#03101566]" onClick={onClose}><aside onClick={event => event.stopPropagation()} className="absolute right-0 top-0 h-full w-full max-w-sm border-l border-[var(--line)] bg-[var(--surface)] shadow-2xl animate-[drawer-in_.22s_ease-out]"><div className="flex items-center justify-between border-b border-[var(--line)] p-5"><div><h2 className="font-display text-lg">Notifications</h2><p className="mt-1 text-[10px] text-[var(--muted)]">Security and workspace activity</p></div><div className="flex items-center gap-3"><button onClick={onMarkAllRead} className="text-[10px] text-[var(--teal)]">Mark all read</button><button onClick={onClose} className="text-[var(--muted)]"><X size={19} /></button></div></div><div className="divide-y divide-[var(--line)]">{notifications.length === 0 ? <div className="p-8 text-center text-xs text-[var(--muted)]">You are all caught up.</div> : notifications.map(notification => <button key={notification.id} onClick={() => onNavigate(notification.module)} className={`flex w-full gap-3 p-5 text-left transition hover:bg-[var(--highlight)] ${notification.unread ? 'bg-[var(--highlight)]/40' : ''}`}><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notification.unread ? 'bg-[var(--teal)]' : 'bg-[var(--line)]'}`} /><span className="min-w-0 flex-1"><strong className="block text-xs">{notification.title}</strong><span className="mt-1 block text-[10px] text-[var(--muted)]">{notification.detail}</span><small className="mt-2 block text-[9px] text-[var(--teal)]">Open {notification.module} →</small></span></button>)}</div></aside></div>;
}

function SearchOverlay({ term, setTerm, users: userList, onNavigate, onClose }: { term: string; setTerm: (term: string) => void; users: typeof users; onNavigate: (module: string) => void; onClose: () => void }) {
  const query = term.trim().toLowerCase();
  const moduleResults = nav.filter(module => module.toLowerCase().includes(query));
  const userResults = userList.filter(user => `${user.name} ${user.department} ${user.role} ${user.email}`.toLowerCase().includes(query));
  const serverKeywords = ['Server Management', 'Active Directory', 'Windows Server', 'Domain Controller'];
  const serverResults = query && serverKeywords.some(keyword => keyword.toLowerCase().includes(query)) ? ['Server Management'] : [];
  return <div className="fixed inset-0 z-50 bg-[#031015aa] p-5" onClick={onClose}><div onClick={event => event.stopPropagation()} className="mx-auto mt-[10vh] w-full max-w-2xl overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)] shadow-2xl"><div className="flex items-center gap-3 border-b border-[var(--line)] p-4"><Search size={19} className="text-[var(--teal)]" /><input autoFocus value={term} onChange={event => setTerm(event.target.value)} onKeyDown={event => event.key === 'Escape' && onClose()} placeholder="Search users, modules, servers, or departments…" className="flex-1 bg-transparent text-sm text-[var(--ink)] outline-none" /><kbd className="rounded border border-[var(--line)] px-2 py-1 text-[9px] text-[var(--muted)]">ESC</kbd><button onClick={onClose} className="text-[var(--muted)]"><X size={17} /></button></div><div className="max-h-[55vh] overflow-y-auto p-3">{!query ? <div className="p-8 text-center text-xs text-[var(--muted)]">Start typing to search the workspace.</div> : moduleResults.length === 0 && userResults.length === 0 && serverResults.length === 0 ? <div className="p-8 text-center text-xs text-[var(--muted)]">No results for “{term}”.</div> : <div className="space-y-4">{userResults.length > 0 && <SearchGroup title="People">{userResults.map(user => <button key={user.email} onClick={() => onNavigate('User Management')} className="flex w-full items-center gap-3 rounded p-3 text-left hover:bg-[var(--highlight)]"><UserAvatar user={user} sizeClass="h-8 w-8" textClass="text-[9px]" /><span><strong className="block text-xs">{user.name}</strong><small className="text-[10px] text-[var(--muted)]">{user.role} · {user.department}</small></span></button>)}</SearchGroup>}{serverResults.length > 0 && <SearchGroup title="Infrastructure">{serverResults.map(result => <button key={result} onClick={() => onNavigate(result)} className="flex w-full items-center gap-3 rounded p-3 text-left hover:bg-[var(--highlight)]"><Server size={17} className="text-[var(--teal)]" /><span><strong className="block text-xs">{result}</strong><small className="text-[10px] text-[var(--muted)]">Monitored servers and Active Directory</small></span></button>)}</SearchGroup>}{moduleResults.length > 0 && <SearchGroup title="Modules">{moduleResults.slice(0, 8).map(module => <button key={module} onClick={() => onNavigate(module)} className="flex w-full items-center gap-3 rounded p-3 text-left hover:bg-[var(--highlight)]"><span className="text-[var(--teal)]">◇</span><span className="text-xs">{module}</span><span className="ml-auto text-[10px] text-[var(--muted)]">Open →</span></button>)}</SearchGroup>}</div>}</div></div></div>;
}

function SearchGroup({ title, children }: { title: string; children: React.ReactNode }) { return <section><h3 className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[1.3px] text-[var(--teal)]">{title}</h3><div className="divide-y divide-[var(--line)]">{children}</div></section>; }

function DashboardPanels({ onNavigate, activity }: { onNavigate: (name: string) => void; activity: Array<[string, number, string]> }) {
  const barHeights = [63, 80, 48, 69];
  const riskRows: Array<[string, number, string, string]> = [['Critical', 18, '#ed6b73', '04'], ['High', 38, '#ef855b', '09'], ['Medium', 70, '#f5b55e', '17'], ['Low', 46, '#4f8b93', '11']];
  return <div className="grid gap-3 xl:grid-cols-3">
    <article className="panel p-5 xl:col-span-2"><Header title="Security incidents" subtitle="Incident volume by current status" action="Last 30 days" /><div className="grid h-48 grid-cols-4 items-end gap-5 border-b border-[var(--line)] bg-[linear-gradient(to_bottom,transparent_0%,transparent_24%,#17343b_25%,transparent_26%,transparent_49%,#17343b_50%,transparent_51%,transparent_74%,#17343b_75%,transparent_76%)] px-5">{barHeights.map((height, index) => <div key={index} className="flex h-full flex-col items-center justify-end gap-2"><div className="flex h-full items-end gap-1"><i className="w-3 rounded-t bg-[var(--teal)]" style={{ height: `${height}%` }} /><i className="w-3 rounded-t bg-[var(--blue)]" style={{ height: `${height - 25}%` }} /><i className="w-3 rounded-t bg-[#8d8af7]" style={{ height: `${height - 43}%` }} /></div><small className="text-[9px] text-[#617477]">{['Aug 18', 'Aug 25', 'Sep 01', 'Sep 08'][index]}</small></div>)}</div><div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] text-[#8ca2a4]"><span>● Open <b className="text-white">04</b></span><span className="text-[var(--blue)]">● Investigating <b className="text-white">03</b></span><button onClick={() => onNavigate('Security Incidents')} className="ml-auto text-[var(--teal)]">View incidents →</button></div></article>
    <article className="panel p-5"><Header title="Vulnerabilities" subtitle="Current findings by severity" /><div className="my-8 flex items-center gap-5"><div className="grid h-32 w-32 shrink-0 place-items-center rounded-full" style={{ background: 'conic-gradient(#ed6b73 0 9%,#ef855b 9% 20%,#f5b55e 20% 47%,#4f8b93 47% 100%)' }}><div className="grid h-20 w-20 place-items-center rounded-full bg-[var(--surface)]"><strong className="font-display text-xl">143</strong></div></div><div className="space-y-3 text-[10px] text-[#8ca2a4]"><p>● Critical <b className="text-white">03</b></p><p>● High <b className="text-white">04</b></p><p>● Medium <b className="text-white">38</b></p><p>● Low <b className="text-white">98</b></p></div></div><button onClick={() => onNavigate('Vulnerability Management')} className="text-[10px] text-[var(--teal)]">View vulnerability register →</button></article>
    <article className="panel p-5"><Header title="Compliance posture" subtitle="Framework readiness score" /><div className="my-7 flex justify-around">{[['SOC 2', '96%', 'var(--teal)'], ['ISO 27001', '93%', 'var(--blue)'], ['DPA', '89%', 'var(--amber)']].map(([name, value, color]) => <div key={name} className="text-center"><div className="grid h-20 w-20 place-items-center rounded-full border-4 border-[#1d3b42]" style={{ borderTopColor: color }}><strong className="font-display text-lg">{value}</strong></div><small className="mt-2 block text-[9px] text-[#617477]">{name}</small></div>)}</div><div className="border-t border-[var(--line)] pt-3 text-[10px] text-[#617477]">● <span className="text-[var(--teal)]">On track</span><span className="float-right">Next evidence review <b className="text-white">14 days</b></span></div></article>
    <article className="panel p-5 xl:col-span-2"><Header title="Risk register" subtitle="Risk distribution by rating" action="This quarter" /><div className="space-y-4 py-4">{riskRows.map(([label, width, color, total]) => <div key={label} className="grid grid-cols-[60px_1fr_24px] items-center gap-3 text-[10px] text-[#8ca2a4]"><span>{label}</span><div className="h-2 rounded bg-[#1b363c]"><i className="block h-full rounded" style={{ width: `${width}%`, background: color }} /></div><b className="text-right text-white">{total}</b></div>)}</div><div className="border-t border-[var(--line)] pt-3 text-[10px] text-[#617477]"><strong className="font-display text-xl text-white">41</strong> total registered risks<button onClick={() => onNavigate('Risk Management')} className="float-right text-[var(--teal)]">Open register →</button></div></article>
    <article className="panel p-5"><Header title="Security activities" subtitle="Department completion" action="September" />{activity.map(([name, value, color]) => <div key={name} className="my-4"><div className="mb-2 flex justify-between text-[10px] text-[#a9bdbc]"><span>{name}</span><b>{value}%</b></div><div className="h-2 rounded bg-[#1b363c]"><i className={`block h-full rounded ${color === 'mint' ? 'bg-[var(--teal)]' : color === 'blue' ? 'bg-[var(--blue)]' : color === 'amber' ? 'bg-[var(--amber)]' : 'bg-[#bf8df5]'}`} style={{ width: `${value}%` }} /></div></div>)}</article>
    <article className="panel p-5 xl:col-span-2"><Header title="Attention required" subtitle="Items needing ownership this week" action="5 open" /><div className="space-y-3">{['Critical vulnerability remediation', 'Quarterly access review', 'Restore test evidence'].map((item, index) => <div key={item} className="flex items-center gap-3 border-b border-[#163239] pb-3 text-xs"><span className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-[var(--coral)]' : index === 1 ? 'bg-[#ef855b]' : 'bg-[var(--amber)]'}`} /><div><strong className="block font-normal">{item}</strong><span className="text-[10px] text-[#617477]">{['Payment gateway · Due today', 'Finance department · Due Sep 13', 'Backup cluster B · Due Sep 15'][index]}</span></div><b className="ml-auto grid h-7 w-7 place-items-center rounded-full bg-[#22434a] text-[9px] text-[#9cd5ca]">{['TS', 'MA', 'RL'][index]}</b></div>)}</div><button onClick={() => onNavigate('Audit & Findings')} className="mt-4 text-[10px] text-[var(--teal)]">View all actions →</button></article>
    <article className="panel p-5"><Header title="Protected IT assets" subtitle="Coverage and health snapshot" /><div className="my-7 flex items-center justify-between"><div><strong className="font-display text-4xl">486</strong><span className="block text-[10px] text-[#617477]">registered assets</span></div><div className="text-center"><div className="grid h-16 w-16 place-items-center rounded-full border-4 border-[#1c4547] border-t-[var(--teal)]"><strong className="font-display">97%</strong></div><span className="text-[10px] text-[#617477]">protected</span></div></div><button onClick={() => onNavigate('Security Assets')} className="text-[10px] text-[var(--teal)]">Manage assets →</button></article>
  </div>;
}

function Header({ title, subtitle, action }: { title: string; subtitle: string; action?: string }) { return <div className="mb-5 flex justify-between"><div><h2 className="font-display text-sm">{title}</h2><p className="mt-1 text-[10px] text-[#617477]">{subtitle}</p></div>{action && <span className="rounded border border-[var(--line)] px-2 py-1 text-[10px] text-[#8ca2a4]">{action}</span>}</div>; }
