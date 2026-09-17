import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function serializeRoom(room: { id: string; name: string; isGroup: boolean; members: string; createdAt: Date }) {
  let members: string[] = [];
  try { members = JSON.parse(room.members) as string[]; } catch { members = []; }
  return { id: room.id, name: room.name, isGroup: room.isGroup, members };
}

// GET returns rooms + all messages grouped by room.
export async function GET() {
  const [rooms, messages] = await Promise.all([
    prisma.chatRoom.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.chatMessage.findMany({ orderBy: { createdAt: 'asc' } }),
  ]);
  const grouped: Record<string, unknown[]> = {};
  messages.forEach(message => {
    const entry = { id: message.id, from: message.senderName, text: message.text, at: message.createdAt.toISOString(), fileName: message.fileName, fileType: message.fileType, fileData: message.fileData };
    (grouped[message.roomId] = grouped[message.roomId] || []).push(entry);
  });
  return NextResponse.json({ rooms: rooms.map(serializeRoom), messages: grouped });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (body.action === 'createRoom') {
    if (!body.name) return NextResponse.json({ error: 'name is required.' }, { status: 400 });
    const room = await prisma.chatRoom.create({ data: { id: body.id || `room-${Date.now()}`, name: body.name, isGroup: Boolean(body.isGroup), members: JSON.stringify(body.members || []) } });
    return NextResponse.json(serializeRoom(room), { status: 201 });
  }
  if (body.action === 'message') {
    if (!body.roomId || !body.text) return NextResponse.json({ error: 'roomId and text are required.' }, { status: 400 });
    const message = await prisma.chatMessage.create({ data: { id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, roomId: body.roomId, senderName: body.from || 'Unknown', text: body.text, fileName: body.fileName || null, fileType: body.fileType || null, fileData: body.fileData || null } });
    return NextResponse.json({ id: message.id }, { status: 201 });
  }
  if (body.action === 'updateMembers') {
    if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    const room = await prisma.chatRoom.update({ where: { id: body.id }, data: { members: JSON.stringify(body.members || []) } });
    return NextResponse.json(serializeRoom(room));
  }
  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  if (body.roomId) {
    await prisma.chatMessage.deleteMany({ where: { roomId: body.roomId } });
    await prisma.chatRoom.delete({ where: { id: body.roomId } });
    return NextResponse.json({ deleted: true });
  }
  return NextResponse.json({ error: 'roomId is required.' }, { status: 400 });
}
