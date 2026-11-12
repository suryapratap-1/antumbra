import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Antumbra Totality — Unveiling 21.03.2027',
  description: 'Antumbra Totality: a four-motor electric hypercar, first seen by the light around it. 99 cars. Reservations open.',
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%2307080a'/><circle cx='16' cy='16' r='9' fill='none' stroke='%23ff3b2f' stroke-width='1.5'/></svg>" },
};
export const viewport: Viewport = { themeColor: '#07080a', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="is-loading">
      <head>
        <style>{`html,body{background:#07080a;color:#ece7dd}`}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
