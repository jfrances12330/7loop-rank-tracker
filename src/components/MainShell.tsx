"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isClientView = pathname.startsWith("/client/");
  return (
    <main
      className={`flex-1 min-h-screen ${
        isClientView ? "" : "md:ml-64 pb-28 md:pb-0"
      }`}
    >
      {/* Logo header móvil — visible en TODAS las páginas */}
      {!isClientView && (
        <div className="md:hidden flex items-center justify-center gap-2 pt-14 pb-4 bg-gradient-to-b from-violet-50 to-transparent">
          <Link href="/" className="flex items-center gap-2">
            <img src="/icon-192.png" alt="7Loop" className="w-10 h-10 rounded-xl shadow-sm" />
            <span className="text-lg font-bold text-gray-900 font-[Outfit]">Loop</span>
          </Link>
        </div>
      )}
      {children}
    </main>
  );
}
