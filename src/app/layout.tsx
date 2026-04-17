import type { Metadata, Viewport } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

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
        <main className="flex-1 ml-0 lg:ml-[260px] min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
