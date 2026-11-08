/**
 * RootLayout Component
 * Entry layout for all pages. Mounts global Toast notifications container.
 * Sets metadata for search engine optimization.
 *
 * Related: src/app/globals.css, src/components/base/ToastContainer.tsx
 * Pattern: Next.js Root Layout
 */

import { ClerkProvider } from '@clerk/nextjs';
import { shadcn } from '@clerk/ui/themes';
import type { Metadata } from 'next';
import './globals.css';
import './landing/landing.css';
import ToastContainer from '@/components/base/ToastContainer';
import MiniSocChatbox from '@/components/features/ai/MiniSocChatbox';
import FacebookChatWidget from '@/components/features/support/FacebookChatWidget';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import ClerkTokenBridge from '@/components/auth/ClerkTokenBridge';
import AuthInitializer from '@/components/auth/AuthInitializer';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Soc Mobile - Dien thoai di dong cao cap, gia tot nhat',
  description:
    'He thong ban le dien thoai di dong chinh hang Apple, Samsung, Xiaomi voi chinh sach bao hanh 12 thang, giao hang hoa toc va dich vu ho tro AI chuyen nghiep.',
  keywords: ['dien thoai', 'iphone', 'samsung', 'xiaomi', 'smartphone', 'mua dien thoai'],
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
          <AuthInitializer />
          <main>{children}</main>
          <FacebookChatWidget />
          <MiniSocChatbox />
          <ToastContainer />
        </ClerkProvider>
      </body>
    </html>
  );
}
