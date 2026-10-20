"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FileText,
  Smile,
  Lightbulb,
  Eye,
  Wind,
  FolderOpen,
  ArrowRight,
  Sparkles,
  Clock3,
  Plus,
} from "lucide-react";

import { getBrainDumps, getMoodEntries, getReflections } from "@/lib/storage";
import { getGreeting, formatTimeAgo } from "@/lib/dates";
import { getMoodOption } from "@/data/moods";
import AppFooter from "@/components/layout/app-footer";

const QUICK_ACTIONS = [
  {
    href: "/unload",
    icon: FileText,
    title: "Brain Dump",
    desc: "Keluarin aja semuanya. Nggak harus runtut, nggak harus masuk akal.",
    color: "#7B68C8",
    bg: "#EDE8F5",
    tag: "Lagi penuh kepala?",
  },
  {
    href: "/mood",
    icon: Smile,
    title: "Mood Check-in",
    desc: "Berhenti sebentar dan cari tahu apa yang sebenarnya kamu rasain.",
    color: "#5E8B5A",
    bg: "#E5EDE4",
    tag: "Cek keadaan diri",
  },
  {
    href: "/prompts",
    icon: Lightbulb,
    title: "Unstuck Prompts",
    desc: "Buat saat kamu pengin mulai cerita, tapi bingung harus dari mana.",
    color: "#9B7D3A",
    bg: "#F5EDD8",
    tag: "Butuh sedikit dorongan",
  },
] as const;

const MORE_ACTIONS = [
  {
    href: "/reflect",
    icon: Eye,
    label: "Lihat dari sisi lain",
  },
  {
    href: "/pause",
    icon: Wind,
    label: "Ambil jeda",
  },
  {
    href: "/space",
    icon: FolderOpen,
    label: "Ruang pribadiku",
  },
] as const;

type RecentActivity = {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  timestamp: string;
  type: "dump" | "mood" | "reflection";
  emoji?: string;
};

export default function HomePage() {
  const [greeting, setGreeting] = useState("");
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [ready, setReady] = useState(false);

  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setGreeting(getGreeting());

    const dumps = getBrainDumps();
    const moods = getMoodEntries();
    const reflections = getReflections();

    const recentActivities: RecentActivity[] = [
      ...dumps.map((dump) => ({
        id: `dump-${dump.updatedAt}-${dump.title ?? ""}`,
        href: "/unload",
        title: dump.title?.trim() || "Brain Dump",
        subtitle: `Catatan · ${formatTimeAgo(dump.updatedAt)}`,
        timestamp: dump.updatedAt,
        type: "dump" as const,
      })),

      ...moods.map((entry) => ({
        id: `mood-${entry.createdAt}-${entry.mood}`,
        href: "/mood",
        title: getMoodOption(entry.mood)?.label ?? entry.mood,
        subtitle: `Mood check-in · ${formatTimeAgo(entry.createdAt)}`,
        timestamp: entry.createdAt,
        type: "mood" as const,
        emoji: getMoodOption(entry.mood)?.emoji ?? "😐",
      })),

      ...reflections.map((reflection, index) => ({
        id: `reflection-${index}`,
        href: "/reflect",
        title: "Perspective Shift",
        subtitle: "Refleksi pribadi",
        timestamp: "",
        type: "reflection" as const,
      })),
    ];

    recentActivities.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();

      return (
        (Number.isFinite(timeB) ? timeB : 0) -
        (Number.isFinite(timeA) ? timeA : 0)
      );
    });

    setActivities(recentActivities.slice(0, 3));
    setTotalEntries(dumps.length + moods.length + reflections.length);
    setReady(true);
  }, []);

  const enterAnimation = {
    initial: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: shouldReduceMotion ? 0 : 0.4 },
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-4 pb-4 pt-6 sm:px-6">
      <div className="flex-1 space-y-9">
        {/* Hero */}
        <motion.section
          {...enterAnimation}
          aria-labelledby="home-heading"
          className="relative overflow-hidden rounded-[28px] border border-[#29282D]/[0.06] bg-white/45 px-5 py-7 sm:px-7 sm:py-9"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full bg-[#EDE8F5]/80 blur-3xl"
          />

          <div className="relative space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#29282D]/[0.07] bg-white/70 px-3 py-1.5">
              <Sparkles
                size={13}
                className="text-[#7B68C8]"
                strokeWidth={1.8}
              />
              <span className="text-xs font-medium text-[#29282D]/60">
                A little space for yourself
              </span>
            </div>

            <div className="space-y-3">
              {greeting && (
                <p className="text-sm text-[#29282D]/50">{greeting} 👋</p>
              )}

              <h1
                id="home-heading"
                className="max-w-lg text-3xl font-semibold leading-[1.15] tracking-tight text-[#29282D] sm:text-4xl"
              >
                Isi kepalamu lagi{" "}
                <span className="text-[#7B68C8]">ramai banget?</span>
              </h1>

              <p className="max-w-md text-sm leading-7 text-[#29282D]/60 sm:text-base">
                Nggak semua hal harus langsung beres. Kadang, kamu cuma butuh
                tempat buat mengeluarkan semuanya tanpa harus menjelaskan diri
                ke siapa-siapa.
              </p>
            </div>

            <Link
              href="/unload"
              className="group inline-flex min-h-11 items-center gap-2.5 rounded-xl bg-[#29282D] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-[#403D46] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2"
            >
              <Plus size={17} strokeWidth={2} />
              <span>Keluarin isi kepala</span>
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>

            <p className="text-xs text-[#29282D]/35">
              Pelan-pelan aja. Kamu nggak lagi dikejar deadline.
            </p>
          </div>
        </motion.section>

        {/* Quick Actions */}
        <motion.section
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.4,
            delay: shouldReduceMotion ? 0 : 0.08,
          }}
          aria-labelledby="actions-heading"
          className="space-y-4"
        >
          <div className="space-y-1">
            <h2
              id="actions-heading"
              className="text-lg font-semibold tracking-tight text-[#29282D]"
            >
              Mulai dari yang kamu butuhin
            </h2>
            <p className="text-sm text-[#29282D]/45">
              Nggak ada cara yang paling benar. Pilih yang terasa pas.
            </p>
          </div>

          <div className="space-y-3">
            {QUICK_ACTIONS.map(
              ({ href, icon: Icon, title, desc, color, bg, tag }, index) => (
                <motion.div
                  key={href}
                  initial={
                    shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.3,
                    delay: shouldReduceMotion ? 0 : 0.1 + index * 0.06,
                  }}
                >
                  <Link
                    href={href}
                    className="group flex items-center gap-4 rounded-2xl border border-[#29282D]/[0.06] bg-white/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#29282D]/[0.10] hover:bg-white/90 hover:shadow-[0_8px_24px_rgba(41,40,45,0.04)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2"
                  >
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] transition-transform duration-200 group-hover:scale-105"
                      style={{ backgroundColor: bg }}
                    >
                      <Icon size={21} style={{ color }} strokeWidth={1.8} />
                    </span>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-sm font-semibold text-[#29282D]">
                          {title}
                        </p>
                        <span className="text-[10px] text-[#29282D]/35">
                          {tag}
                        </span>
                      </div>

                      <p className="text-sm leading-relaxed text-[#29282D]/55">
                        {desc}
                      </p>
                    </div>

                    <ArrowRight
                      size={17}
                      className="shrink-0 text-[#29282D]/25 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#29282D]/60"
                    />
                  </Link>
                </motion.div>
              ),
            )}
          </div>
        </motion.section>

        {/* Other tools */}
        <motion.section
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.4,
            delay: shouldReduceMotion ? 0 : 0.18,
          }}
          aria-labelledby="more-heading"
          className="space-y-3"
        >
          <h2
            id="more-heading"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-[#29282D]/40"
          >
            Atau, coba yang ini
          </h2>

          <div className="flex flex-wrap gap-2">
            {MORE_ACTIONS.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#29282D]/[0.07] bg-white/45 px-3 py-2 text-sm text-[#29282D]/65 transition-all hover:border-[#29282D]/[0.12] hover:bg-white/80 hover:text-[#29282D] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2"
              >
                <Icon size={15} strokeWidth={1.8} />
                {label}
              </Link>
            ))}
          </div>
        </motion.section>

        {/* Recent activity */}
        {ready && (
          <motion.section
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.4,
              delay: shouldReduceMotion ? 0 : 0.2,
            }}
            aria-labelledby="recent-heading"
            className="space-y-4"
          >
            <div className="flex items-end justify-between gap-3">
              <div className="space-y-1">
                <h2
                  id="recent-heading"
                  className="text-lg font-semibold tracking-tight text-[#29282D]"
                >
                  {totalEntries > 0
                    ? "Jejak kecilmu"
                    : "Ruang ini masih kosong"}
                </h2>
                <p className="text-sm text-[#29282D]/45">
                  {totalEntries > 0
                    ? "Hal-hal yang sempat kamu simpan."
                    : "Belum ada yang dicatat. Nggak masalah."}
                </p>
              </div>

              {totalEntries > 0 && (
                <Link
                  href="/space"
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#7B68C8] transition-colors hover:text-[#624DAA]"
                >
                  Lihat semua
                  <ArrowRight size={13} />
                </Link>
              )}
            </div>

            {activities.length > 0 ? (
              <div className="space-y-2">
                {activities.map((activity) => {
                  const ActivityIcon =
                    activity.type === "mood"
                      ? Smile
                      : activity.type === "reflection"
                        ? Eye
                        : FileText;

                  return (
                    <Link
                      key={activity.id}
                      href={activity.href}
                      className="group flex items-center gap-3 rounded-xl border border-[#29282D]/[0.05] bg-white/40 px-4 py-3 transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2"
                    >
                      {activity.emoji ? (
                        <span
                          aria-hidden="true"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E5EDE4] text-base"
                        >
                          {activity.emoji}
                        </span>
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EDE8F5]">
                          <ActivityIcon
                            size={16}
                            className="text-[#7B68C8]"
                            strokeWidth={1.8}
                          />
                        </span>
                      )}

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="truncate text-sm font-medium text-[#29282D]">
                          {activity.title}
                        </p>
                        <p className="text-xs text-[#29282D]/40">
                          {activity.subtitle}
                        </p>
                      </div>

                      <ArrowRight
                        size={14}
                        className="shrink-0 text-[#29282D]/20 transition-transform group-hover:translate-x-0.5 group-hover:text-[#29282D]/50"
                      />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <Link
                href="/unload"
                className="group flex items-center gap-4 rounded-2xl border border-dashed border-[#29282D]/15 bg-white/30 px-4 py-5 transition-colors hover:bg-white/60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDE8F5]">
                  <Clock3
                    size={18}
                    className="text-[#7B68C8]"
                    strokeWidth={1.8}
                  />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#29282D]">
                    Mulai dari satu hal kecil
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#29282D]/50">
                    Satu pikiran yang kamu keluarkan juga sudah berarti.
                  </p>
                </div>

                <ArrowRight
                  size={16}
                  className="shrink-0 text-[#29282D]/30 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            )}
          </motion.section>
        )}
      </div>

      <div className="pt-8">
        <AppFooter />
      </div>
    </div>
  );
}
