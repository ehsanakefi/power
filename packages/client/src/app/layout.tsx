import type { Metadata } from 'next';
import { Inter, Vazirmatn } from 'next/font/google';
import './globals.css';
import ThemeRegistry from '@/theme/ThemeRegistry';
import { QueryProvider } from '@/lib/queryClient';

const inter = Inter({ subsets: ['latin'] });
const vazirmatn = Vazirmatn({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['arabic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Power CRM - سیستم مدیریت ارتباط با مشتری',
  description: 'سیستم جامع مدیریت ارتباط با مشتری شرکت توزیع برق',
  keywords: ['CRM', 'Power Distribution', 'Customer Management', 'شرکت توزیع برق'],
  authors: [{ name: 'Power Distribution Company' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={`${vazirmatn.className} ${inter.className}`}>
        <ThemeRegistry>
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
