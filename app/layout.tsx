import type { Metadata } from 'next';
import { Syne, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'CodeAtlas AI',
  description: 'Understand any GitHub repository in minutes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${mono.variable}`}>
      <body className="bg-[#0a0a0a] text-white antialiased min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
