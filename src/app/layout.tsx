import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'WSI Cyber Security', description: 'WSI Cyber Security Management Information System' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
