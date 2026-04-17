import type { Metadata, Viewport } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import BottomTabs from "@/components/BottomTabs";
import MainShell from "@/components/MainShell";

export const metadata: Metadata = {
  title: "7Loop SEO Tracker",
  description: "Panel de seguimiento SEO por 7Loop",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "7Loop SEO Tracker",
  },
};

export const viewport: Viewport = {
  themeColor: "#3B0764",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="h-full flex">
        <Sidebar />
        <MainShell>{children}</MainShell>
        <BottomTabs />
      </body>
    </html>
  );
}
