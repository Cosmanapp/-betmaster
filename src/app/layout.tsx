import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'BetMaster - Pronostici',
  description: 'Analisi e pronostici sportivi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
