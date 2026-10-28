import { ClerkProvider } from '@clerk/nextjs';
import { shadcn } from '@clerk/ui/themes';
/**
 * RootLayout Component
 * Entry layout for all pages. Mounts global Toast notifications container.
 * Sets metadata for search engine optimization.
 *
 * Related: src/app/globals.css, src/components/base/ToastContainer.tsx
 * Pattern: Next.js Root Layout
 */

import type { Metadata } from 'next';
import './globals.css';
import './landing/landing.css';
import ToastContainer from '@/components/base/ToastContainer';
import MiniSocChatbox from '@/components/features/ai/MiniSocChatbox';
import FacebookChatWidget from '@/components/features/support/FacebookChatWidget';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import ClerkTokenBridge from '@/components/auth/ClerkTokenBridge';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Sóc Mobile — Điện thoại di động cao cấp, giá tốt nhất',
  description:
    'Hệ thống bán lẻ điện thoại di động chính hãng Apple, Samsung, Xiaomi với chính sách bảo hành 12 tháng, giao hàng hỏa tốc và dịch vụ hỗ trợ AI chuyên nghiệp.',
  keywords: ['điện thoại', 'iphone', 'samsung', 'xiaomi', 'smartphone', 'mua điện thoại'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" data-theme="light" className={cn("font-sans light", geist.variable)}>
      <body>
        <ClerkProvider appearance={{ theme: shadcn }}>
          <ClerkTokenBridge />
          <main>{children}</main>
          <FacebookChatWidget />
          <MiniSocChatbox />
          <ToastContainer />
        </ClerkProvider>
      </body>
    </html>
  );
}