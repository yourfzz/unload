'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  Smile,
  Lightbulb,
  Eye,
  Wind,
  FolderOpen,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/unload', label: 'Brain Dump', icon: FileText },
  { href: '/mood', label: 'Mood', icon: Smile },
  { href: '/prompts', label: 'Prompts', icon: Lightbulb },
  { href: '/reflect', label: 'Refleksi', icon: Eye },
  { href: '/pause', label: 'Jeda', icon: Wind },
  { href: '/space', label: 'My Space', icon: FolderOpen },
] as const;

export default function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#F4F0E8] border-t border-[#29282D]/10 px-2 pb-safe"
    >
      <ul className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center gap-0.5 px-2 py-2.5 rounded-xl transition-colors min-w-[48px] ${
                  isActive
                    ? 'text-[#29282D]'
                    : 'text-[#29282D]/40 hover:text-[#29282D]/70'
                }`}
              >
                <span
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-[#B8A9D9]/30' : ''
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                </span>
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
