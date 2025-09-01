import { SocketIOProvider } from '@/contexts/SocketIOContext';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Panel de Inbox - Chatbot Admin',
    description: 'Panel de administración tipo WhatsApp Web para equipos de ventas',
    keywords: ['chat', 'whatsapp', 'inbox', 'ventas', 'crm'],
};
  
const themeScript = `
  try {
    const theme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (theme === 'dark' || (!theme && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
        <head>
            <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
      <body className={inter.className}>
        <SocketIOProvider>
            <div id="root">
                {children}
            </div>
        </SocketIOProvider>
      </body>
    </html>
  );
}