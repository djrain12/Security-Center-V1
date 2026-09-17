import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/pfsense-crypto';
export async function GET() { const connection = await prisma.pfSenseConnection.findUnique({ where: { id: 1 } }); return NextResponse.json({ configured: Boolean(connection), baseUrl: connection?.baseUrl || '', statusPath: connection?.statusPath || '/api/v2/status/system', name: connection?.name || 'Primary pfSense' }); }
export async function POST(request: Request) {
	try {
		const body = await request.json();
		if (!body.baseUrl || ((!body.apiKey) && (!body.username || !body.password))) return NextResponse.json({ error: 'Enter an API key, or pfSense username and password.' }, { status: 400 });
		const connection = await prisma.pfSenseConnection.upsert({ where: { id: 1 }, update: { name: body.name || 'Primary pfSense', baseUrl: body.baseUrl, encryptedApiKey: body.apiKey ? encrypt(body.apiKey) : '', encryptedApiSecret: body.apiSecret ? encrypt(body.apiSecret) : '', encryptedUsername: body.username ? encrypt(body.username) : null, encryptedPassword: body.password ? encrypt(body.password) : null, statusPath: body.statusPath || '/api/v2/status/system' }, create: { id: 1, name: body.name || 'Primary pfSense', baseUrl: body.baseUrl, encryptedApiKey: body.apiKey ? encrypt(body.apiKey) : '', encryptedApiSecret: body.apiSecret ? encrypt(body.apiSecret) : '', encryptedUsername: body.username ? encrypt(body.username) : null, encryptedPassword: body.password ? encrypt(body.password) : null, statusPath: body.statusPath || '/api/v2/status/system' } });
		return NextResponse.json({ configured: true, baseUrl: connection.baseUrl, statusPath: connection.statusPath, name: connection.name });
	} catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save pfSense settings.' }, { status: 500 }); }
}
