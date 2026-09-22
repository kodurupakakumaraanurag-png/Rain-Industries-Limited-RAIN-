import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RAIN Enterprise CRM | Rain Industries Limited',
  description: 'Enterprise Manufacturing Customer Relationship Management & Sales Intelligence Platform for Rain Industries Limited (RAIN)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
