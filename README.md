# WSI Cyber Security MIS

Full-stack executive Cyber Security MIS dashboard for WSI, built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, and MySQL.

## Requirements

- Node.js 20+
- Docker Desktop (for local MySQL)

PowerShell may block `npm.ps1`; use `npm.cmd` in commands if needed.

## Setup

```powershell
Copy-Item .env.example .env   # then set DATABASE_URL / SHADOW_DATABASE_URL
npm.cmd install
docker compose up -d          # local MySQL
npm.cmd run db:generate
npm.cmd run db:migrate        # applies all migrations
npm.cmd run db:seed           # creates roles + default users
npm.cmd run dev
```

Open http://localhost:3000.

### Default sign-in

Seeded accounts (change the password after first login):

| Email | Password | Role |
| --- | --- | --- |
| michael.adams@wsi.local | Admin@2026 | Master Admin |
| tara.singh@wsi.local | Admin@2026 | IT Security Officer |

## What's in the database

All operational data is stored in MySQL via Prisma:

- **Users, roles, and module permissions** (`User`, `Role`, `UserModulePermission`) — includes bcrypt-hashed passwords and per-module access control.
- **Modules**: generic record store (`ModuleRecord`) for security/governance modules.
- **MIS tools**: `InventoryDevice`, `EmailAccount`, `DailyReportEntry`, `LibraryDocument`, `BackupJob`, `CctvDevice`.
- **Chat**: `ChatRoom` + `ChatMessage` (direct + group rooms, file attachments).
- **Settings & branding**: `AppSetting` (system settings, company logo/name/details, NVR URL).
- **Infra**: `MonitoredServer`, `NetworkDevice`, `NetworkZone`, `FirewallMonitor`, `TrafficLog`, `SecurityIncident`, plus the rest of the security schema (vulnerabilities, risks, assets, compliance, audit logs).

### Useful API routes

`/api/auth/login` (DB sign-in) · `/api/users` · `/api/records` · `/api/inventory` · `/api/backups` · `/api/documents` · `/api/emails` · `/api/daily-reports` · `/api/cctv` · `/api/chat` · `/api/settings` · `/api/maintenance` (JSON backup / restore / reset) · `/api/incidents`

## Deploy to a live server

1. Provision MySQL 8 and set `DATABASE_URL` (and `SHADOW_DATABASE_URL`) in the server `.env`.
2. Install deps and build:

```powershell
npm.cmd install
npx prisma migrate deploy   # create/upgrade tables
npx tsx prisma/seed.ts      # optional: roles + default admin
npm.cmd run build
npm.cmd start               # or: next start -p 3000
```

3. Use **Settings → Data & Backup** in the app to download a JSON backup or restore one on the new server.

## pfSense integration

Create a dedicated read-only pfSense REST API account and copy the API values into `.env` locally. Never commit `.env` or paste credentials into chat.

```env
PFSENSE_URL="https://192.168.25.1"
PFSENSE_API_KEY="your-local-api-key"
PFSENSE_API_SECRET="your-local-api-secret"
PFSENSE_STATUS_PATH="/api/v2/status/system"
```

The server-side health endpoint is `/api/integrations/pfsense/status`. It is intentionally server-only so pfSense credentials are never sent to the browser. Endpoint paths can differ by pfSense REST API package/version; set `PFSENSE_STATUS_PATH` to the status endpoint documented by your installed package.
