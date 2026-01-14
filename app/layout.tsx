import type { Metadata } from "next";
import { Inter_Tight, Space_Mono } from "next/font/google"; // Keep fonts
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { Navbar } from "@/components/navbar";
import { auth0 } from "@/lib/auth0";
import { syncUser } from "@/lib/sync-user";
// import { ReactLenis } from "lenis/react"; // Check if this imports correctly. If not, I will fix.
// Actually, let's just use the standard lenis import if possible or try to create a client wrapper.
// Since I can't be 100% sure of the export in the user's installed version, I'll create a client component wrapper.

import { SmoothScroll } from "@/components/smooth-scroll";

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
  title: "Gotchu - The Recovery Network",
  description: "Next-Gen Lost & Found Protocol",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth0.getSession();

  if (session?.user) {
    await syncUser();
  }

  return (
    <html lang="en" className="dark">
      <Auth0Provider user={session?.user}>
        <body
          className={`${interTight.variable} ${spaceMono.variable} antialiased bg-background text-foreground`}
        >
          <SmoothScroll>
            {/* Global Noise Overlay */}
            <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            <Navbar />
            <main className="relative z-10">
              {children}
            </main>
            <Toaster position="top-center" theme="dark" />
          </SmoothScroll>
        </body>
      </Auth0Provider>
    </html>
  );
}
