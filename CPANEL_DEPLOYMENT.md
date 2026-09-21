# cPanel deployment

This application runs on cPanel hosting that provides **Setup Node.js App**, Node.js 20+, SSH/Terminal access, and MySQL 8-compatible databases. Shared hosting without Node.js application support cannot run the Next.js server.

## 1. Upload

Upload the contents of `security-center-cpanel.zip` to the application directory. Do not upload `.env`, `node_modules`, `.git`, or local `.next` files.

## 2. Create the cPanel Node.js application

In **cPanel → Setup Node.js App**, create an application with:

- Node.js version: 20 or newer
- Application mode: Production
- Application root: the uploaded directory
- Application startup file: `server.js`

## 3. Configure environment variables

Add these variables in the Node.js application settings. Use new values for the production server:

```env
NODE_ENV=production
DATABASE_URL=mysql://DATABASE_USER:DATABASE_PASSWORD@localhost:3306/DATABASE_NAME
SESSION_SECRET=generate-a-long-random-secret
SESSION_COOKIE_SECURE=true
PLATFORM_OWNER_EMAIL=your-owner-email
PLATFORM_OWNER_PASSWORD=use-a-long-random-password
DEMO_USER_EMAIL=your-demo-email
DEMO_USER_PASSWORD=use-a-long-random-password
```

Optional variables:

```env
EMAIL_WEBHOOK_URL=https://your-mail-service.example/send
PFSENSE_URL=https://your-firewall.example
PFSENSE_API_KEY=your-key
PFSENSE_API_SECRET=your-secret
PFSENSE_STATUS_PATH=/api/v2/status/system
PFSENSE_TLS_INSECURE=false
```

Never put production passwords or API keys in the zip or GitHub.

## 4. Install and initialize

From cPanel Terminal or SSH, inside the application root:

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npx tsx prisma/seed.ts
npm run build
```

If cPanel uses a separate production start command, use:

```bash
npm run start
```

Restart the Node.js application from cPanel after building.

## 5. Database

Create a MySQL database and database user in **cPanel → MySQL Databases**, grant the user all privileges on that database, and use the resulting connection string as `DATABASE_URL`. MySQL must be reachable by the Node.js application; do not expose MySQL publicly.

For a new installation, `prisma migrate deploy` creates the tables. For an existing installation, back up the database before applying migrations.

## Standalone startup note

The normal source package is intentionally included so cPanel can install dependencies and run Prisma migrations. For a smaller runtime package, run `npm run build`, then use the generated standalone server and copy `.next/static` into `.next/standalone/.next/static` plus `public` into `.next/standalone/public` before uploading. Keep the Prisma migrations available until deployment is complete.
