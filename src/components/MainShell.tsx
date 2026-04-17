"use client";
import { usePathname } from "next/navigation";

export default function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isClientView = pathname.startsWith("/client/");
  return (
    <main
      className={`flex-1 min-h-screen ${
        isClientView ? "" : "md:ml-64 pb-28 md:pb-0"
      }`}
    >
      {children}
    </main>
  );
}
