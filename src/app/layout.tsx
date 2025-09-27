import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DemoProvider } from "@/contexts/DemoContext";
import { PetProvider } from "@/contexts/PetContext";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HabitPet - Nutrition Tracker",
  description: "Build healthy eating habits with your virtual pet companion. Track nutrition, log meals, and care for your virtual pet.",
  keywords: ["nutrition", "health", "tracking", "habits", "pet", "wellness"],
  authors: [{ name: "HabitPet Team" }],
  creator: "HabitPet",
  publisher: "HabitPet",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://habitpet.app",
    title: "HabitPet - Nutrition Tracker",
    description: "Build healthy eating habits with your virtual pet companion",
    siteName: "HabitPet",
  },
  twitter: {
    card: "summary_large_image",
    title: "HabitPet - Nutrition Tracker",
    description: "Build healthy eating habits with your virtual pet companion",
    creator: "@habitpet",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HabitPet',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192x192.png",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HabitPet" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <GoogleAnalytics />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PetProvider>
          <DemoProvider>
            {children}
          </DemoProvider>
        </PetProvider>
      </body>
    </html>
  );
}
