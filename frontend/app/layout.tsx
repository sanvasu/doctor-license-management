import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title:       'MedLicense — Doctor License Management',
  description: 'Manage and track doctor licenses.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50 antialiased`}>

        {/* Navbar */}
        <header className="sticky top-0 z-30 border-b border-slate-200
                           bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center
                          justify-between px-6 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center
                              rounded-lg bg-blue-600 text-white text-sm">
               <a href='/doctors'> ✚</a>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-slate-800">
                  MedLicense
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                  Management System
                </span>
              </div>
            </div>

          
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto max-w-7xl px-6 py-8">
          {children}
        </main>

      </body>
    </html>
  );
}