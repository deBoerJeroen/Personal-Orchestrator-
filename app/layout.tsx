import type { Metadata, Viewport } from "next";
import { ServiceWorker } from "@/components/service-worker";
import { copy } from "@/lib/copy";
import "./globals.css";

export const metadata: Metadata = {
  title: copy.app.name,
  description: copy.app.tagline,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: copy.app.name,
    statusBarStyle: "default",
  },
  // Deze app is persoonlijk. Nergens indexeren.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfd" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1d21" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
