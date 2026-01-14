import type { Metadata } from "next";
import { Inter_Tight, Space_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { Navbar } from "@/components/navbar";
import { auth0 } from "@/lib/auth0";
import { syncUser } from "@/lib/sync-user";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gotchu - Lost & Found",
  description: "DSU Harohalli Campus Lost & Found Platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth0.getSession();

  // Sync user to Supabase if logged in
  if (session?.user) {
    await syncUser();
  }

  return (
    <html lang="en">
      <Auth0Provider user={session?.user}>
        <body
          className={`${interTight.variable} ${spaceMono.variable} antialiased bg-background text-foreground`}
        >
          <Navbar />
          {children}
          <Toaster position="top-center" />
        </body>
      </Auth0Provider>
    </html>
  );
}
