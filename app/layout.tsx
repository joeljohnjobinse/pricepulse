import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'PricePulse | Retail Intelligence', description: 'Retail pricing, inventory, analytics and simulation workspace.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
