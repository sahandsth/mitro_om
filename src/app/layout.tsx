import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/effects/SmoothScroll";
import CustomCursor from "@/components/effects/CustomCursor";
import Preloader from "@/components/effects/Preloader";
import GrainOverlay from "@/components/effects/GrainOverlay";
import ScrollProgress from "@/components/effects/ScrollProgress";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mitro.agency"),
  title: {
    default: "Mitro Team — Creative Studio",
    template: "%s — Mitro Team",
  },
  description:
    "Mitro Team is a creative studio crafting visual identities, websites, and motion-led brand experiences for ambitious brands.",
  keywords: [
    "creative studio",
    "branding",
    "visual identity",
    "web design",
    "motion design",
    "Mitro Team",
  ],
  authors: [{ name: "Mitro Team" }],
  icons: {
    icon: "/Logo.png",
    shortcut: "/Logo.png",
    apple: "/Logo.png",
  },
  openGraph: {
    title: "Mitro Team — Creative Studio",
    description:
      "Visual identities, websites, and motion-led brand experiences for ambitious brands.",
    url: "https://mitro.agency",
    siteName: "Mitro Team",
    images: [{ url: "/Logo.png", width: 512, height: 512, alt: "Mitro Team" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mitro Team — Creative Studio",
    description:
      "Visual identities, websites, and motion-led brand experiences for ambitious brands.",
    images: ["/Logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Preloader />
        <SmoothScroll />
        <CustomCursor />
        <GrainOverlay />
        <ScrollProgress />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
