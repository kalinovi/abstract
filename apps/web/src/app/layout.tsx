import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Abstract — Online Art Gallery & Community',
  description:
    'Discover art from creators all over the world, explore and share your own. Abstract is an online art gallery and community.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">
        <Navbar />
        {/* Top padding clears the fixed navbar; the landing hero opts out with -mt-16. */}
        <main className="pt-16">{children}</main>
        <footer className="border-t border-white/10 py-8 text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} Abstract — Kevin Alinovi
        </footer>
      </body>
    </html>
  );
}
