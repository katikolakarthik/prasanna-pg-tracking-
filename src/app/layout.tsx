import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "NEET PG Preparation Tracker",
  description: "Track study hours, subjects, mocks, and revision for NEET PG.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <Script id="neet-theme-init" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem('neet-theme');document.documentElement.classList.toggle('dark',t==='dark');}catch(e){}`}
        </Script>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
