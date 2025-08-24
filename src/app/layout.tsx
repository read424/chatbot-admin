import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Panel de Inbox - Chatbot Admin',
  description: 'Panel de administración tipo WhatsApp Web para equipos de ventas',
  keywords: ['chat', 'whatsapp', 'inbox', 'ventas', 'crm'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
}