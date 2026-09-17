import 'dotenv/config';
import dgram from 'node:dgram';
import { prisma } from '../src/lib/prisma';

const port = Number(process.env.SYSLOG_PORT || 514);
const socket = dgram.createSocket('udp4');
const ip = /(?:src|srcip|source)[= ](\d{1,3}(?:\.\d{1,3}){3})/i;
const destination = /(?:dst|dstip|destination)[= ](\d{1,3}(?:\.\d{1,3}){3})/i;
const portPattern = /(?:dpt|dstport|destination_port)[= ](\d{1,5})/i;
const protocol = /\b(TCP|UDP|ICMP)\b/i;
const action = /\b(pass|block|reject|allow|deny)\b/i;
const iface = /\b(?:on|interface)[= ](\w+)/i;

socket.on('message', async message => {
  const rawMessage = message.toString('utf8').trim();
  try {
    await prisma.trafficLog.create({ data: { sourceIp: rawMessage.match(ip)?.[1], destinationIp: rawMessage.match(destination)?.[1], destinationPort: rawMessage.match(portPattern)?.[1] ? Number(rawMessage.match(portPattern)?.[1]) : null, protocol: rawMessage.match(protocol)?.[1]?.toUpperCase(), action: rawMessage.match(action)?.[1]?.toLowerCase(), interfaceName: rawMessage.match(iface)?.[1], rawMessage } });
  } catch (error) { console.error('Could not save syslog message:', error); }
});
socket.on('error', error => console.error('Syslog socket error:', error));
socket.bind(port, '0.0.0.0', () => console.log(`WSI syslog collector listening on UDP ${port}`));
process.on('SIGINT', async () => { socket.close(); await prisma.$disconnect(); process.exit(0); });
