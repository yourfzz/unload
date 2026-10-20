"use client";

import { useEffect, useState } from "react";
import { Heart, ShieldCheck } from "lucide-react";

export default function AppFooter() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="mt-auto border-t border-[#29282D]/8 px-4 py-8">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2 text-[#29282D]/50">
          <ShieldCheck size={14} strokeWidth={1.8} />
          <p className="text-xs">
            Curhat aja, aman. Semua tetap di perangkat kamu.
          </p>
        </div>

        <p className="text-xs leading-relaxed text-[#29282D]/40">
          Nggak ada akun, nggak ada server, nggak ada yang kepo.
          <br />
          Cuma kamu dan isi kepala yang akhirnya keluar.
        </p>

        <div className="flex items-center gap-1.5 text-[11px] text-[#29282D]/30">
          <span>UNLOAD © {year ?? "—"}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            Made with <Heart size={10} className="fill-current" /> for
            overthinkers
          </span>
        </div>
      </div>
    </footer>
  );
}
