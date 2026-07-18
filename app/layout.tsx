import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { UmpireProvider } from "@/lib/umpire";
import { SiteHeader } from "@/components/SiteHeader";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Badminton Scoreboard 2026",
  description:
    "Live badminton tournament scoreboard — games to 20 points, realtime standings.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}if(t==='light'){document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();`,
          }}
        />
        <StoreProvider>
          <UmpireProvider>
            <SiteHeader />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
              {children}
            </main>
            <footer className="border-t border-line/60 py-6 text-center text-xs text-muted">
              Badminton Scoreboard 2026 · games to 20 points
            </footer>
          </UmpireProvider>
        </StoreProvider>
        <Analytics />
      </body>
    </html>
  );
}
