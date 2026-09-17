import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TABLES = [
  'moduleRecord', 'inventoryDevice', 'backupJob', 'libraryDocument', 'emailAccount',
  'dailyReportEntry', 'cctvDevice', 'chatRoom', 'chatMessage', 'appSetting',
] as const;

type TableName = typeof TABLES[number];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as unknown as Record<TableName, any>;

function serialize(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value, (_key, val) => (typeof val === 'bigint' ? val.toString() : val instanceof Date ? val.toISOString() : val)));
}

// GET -> download a full JSON backup of all app data.
export async function GET() {
  const data: Record<string, unknown> = {};
  for (const table of TABLES) data[table] = serialize(await db[table].findMany());
  return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="wsi-mis-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'restore';

  if (action === 'reset') {
    // Clear all app data (does not drop schema).
    for (const table of [...TABLES].reverse()) await db[table].deleteMany();
    return NextResponse.json({ reset: true });
  }

  // restore: accept { data: { table: rows[] } }
  const body = await request.json();
  const data = (body?.data || {}) as Record<string, Array<Record<string, unknown>>>;
  let restored = 0;
  for (const table of TABLES) {
    const rows = data[table];
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      const { ...fields } = row;
      // Upsert by id/key where applicable.
      const where = table === 'appSetting' ? { key: String(fields.key) } : { id: String(fields.id) };
      await db[table].upsert({ where, update: fields, create: fields });
      restored += 1;
    }
  }
  return NextResponse.json({ restored });
}
