"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ROUTE_LABELS: Record<string, string> = {
  "/": "Beranda",
  "/unload": "Brain Dump",
  "/mood": "Mood Check-in",
  "/prompts": "Unstuck Prompts",
  "/reflect": "Perspective Shift",
  "/pause": "Pause Mode",
  "/space": "My Space",
};

export default function AppHeader() {
  const pathname = usePathname();
  const label = ROUTE_LABELS[pathname] ?? "UNLOAD";
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-40 border-b border-[#29282D]/[0.06] bg-[#F4F0E8]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          aria-label="Ke beranda UNLOAD"
          className="rounded-sm text-[#29282D] transition-opacity hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8]"
        >
          <span
            className={`font-semibold tracking-tight ${
              isHome ? "text-lg" : "text-lg"
            }`}
          >
            UNLOAD<span className="text-[#7B68C8]">.</span>
          </span>
        </Link>

        {!isHome && (
          <span className="text-sm font-medium text-[#29282D]/55">{label}</span>
        )}
      </div>
    </header>
  );
}
