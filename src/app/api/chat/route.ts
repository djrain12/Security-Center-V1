import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';
import { writeAuditLog } from '@/lib/audit';

function serializeRoom(room: { id: string; name: string; isGroup: boolean; members: string; createdAt: Date }) {
  let members: string[] = [];
  try { members = JSON.parse(room.members) as string[]; } catch { members = []; }
  return { id: room.id, name: room.name, isGroup: room.isGroup, members };
}

// GET returns rooms + all messages grouped by room.
export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
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
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const body = await request.json();
  if (body.action === 'createRoom') {
    if (!body.name) return NextResponse.json({ error: 'name is required.' }, { status: 400 });
    const id = body.id || `room-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const room = await prisma.chatRoom.upsert({ where: { id }, update: { name: body.name, members: JSON.stringify(body.members || []) }, create: { id, name: body.name, isGroup: Boolean(body.isGroup), members: JSON.stringify(body.members || []) } });
    await writeAuditLog({ actorId: session.userId, action: 'CREATE_CHAT_ROOM', resourceType: 'ChatRoom', resourceId: room.id, metadata: { isGroup: room.isGroup, name: room.name } });
    return NextResponse.json(serializeRoom(room), { status: 201 });
  }
  if (body.action === 'message') {
    if (!body.roomId || !body.text) return NextResponse.json({ error: 'roomId and text are required.' }, { status: 400 });
    const message = await prisma.chatMessage.create({ data: { id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, roomId: body.roomId, senderName: body.from || 'Unknown', text: body.text, fileName: body.fileName || null, fileType: body.fileType || null, fileData: body.fileData || null } });
    await writeAuditLog({ actorId: session.userId, action: 'SEND_CHAT_MESSAGE', resourceType: 'ChatRoom', resourceId: body.roomId });
    return NextResponse.json({ id: message.id }, { status: 201 });
  }
  if (body.action === 'updateMembers') {
    if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    const room = await prisma.chatRoom.update({ where: { id: body.id }, data: { members: JSON.stringify(body.members || []) } });
    await writeAuditLog({ actorId: session.userId, action: 'UPDATE_CHAT_MEMBERS', resourceType: 'ChatRoom', resourceId: room.id, metadata: { members: body.members || [] } });
    return NextResponse.json(serializeRoom(room));
  }
  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}

export async function DELETE(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const body = await request.json();
  if (body.roomId) {
    await prisma.chatMessage.deleteMany({ where: { roomId: body.roomId } });
    await prisma.chatRoom.delete({ where: { id: body.roomId } });
    await writeAuditLog({ actorId: session.userId, action: 'DELETE_CHAT_ROOM', resourceType: 'ChatRoom', resourceId: body.roomId });
    return NextResponse.json({ deleted: true });
  }
  return NextResponse.json({ error: 'roomId is required.' }, { status: 400 });
}
