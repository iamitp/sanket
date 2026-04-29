import './globals.css';
import type { Metadata } from 'next';
import { SiteNav } from '../components/site-nav';

export const metadata: Metadata = {
  title: 'Sanket — MoPNG cyber-posture register',
  description:
    'Public passive-reconnaissance scorecard on the Indian Ministry of Petroleum & Natural Gas digital estate. Civic-tech transparency, refreshed daily.',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Sanket',
  description:
    'Public passive-reconnaissance scorecard on the Indian Ministry of Petroleum & Natural Gas digital estate.',
  url: 'https://sanket.amitpatnaik.com',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  publisher: {
    '@type': 'Person',
    name: 'Amit Patnaik',
    url: 'https://amitpatnaik.com',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteNav />
        <main className="flex-1 mx-auto w-full max-w-[1480px] px-5 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
