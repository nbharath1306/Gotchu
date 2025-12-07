import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { Navbar } from "@/components/navbar";
import { auth0 } from "@/lib/auth0";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  
  return (
    <html lang="en">
      <Auth0Provider user={session?.user}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Navbar />
          {children}
          <Toaster />
        </body>
      </Auth0Provider>
    </html>
  );
}
