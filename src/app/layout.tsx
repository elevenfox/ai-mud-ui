import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI MUD - Neon City',
  description: 'An AI-native text adventure in a cyberpunk world',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cyber-black min-h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
