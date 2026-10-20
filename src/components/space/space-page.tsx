"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  FileText,
  Smile,
  Eye,
  Trash2,
  Download,
  AlertTriangle,
  Archive,
  ShieldCheck,
  CheckCircle2,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import {
  getBrainDumps,
  getMoodEntries,
  getReflections,
  deleteBrainDump,
  deleteMoodEntry,
  deleteReflection,
  clearAllData,
} from "@/lib/storage";

import { exportDataAsJSON, exportDataAsText } from "@/lib/export";
import { formatDateTime, formatTimeAgo } from "@/lib/dates";
import { getMoodOption } from "@/data/moods";

import type {
  BrainDumpEntry,
  MoodEntry,
  ReflectionEntry,
} from "@/types/unload";

type Tab = "dump" | "mood" | "reflect";

type DeleteTarget = {
  type: Tab;
  id: string;
};

const tabs: {
  value: Tab;
  label: string;
  icon: typeof FileText;
  emptyTitle: string;
  emptyDescription: string;
}[] = [
  {
    value: "dump",
    label: "Brain Dump",
    icon: FileText,
    emptyTitle: "Belum ada brain dump",
    emptyDescription:
      "Keluarkan isi kepala yang lagi numpuk, mulai dari mana saja.",
  },
  {
    value: "mood",
    label: "Mood",
    icon: Smile,
    emptyTitle: "Belum ada mood check-in",
    emptyDescription:
      "Coba cek-in perasaanmu hari ini. Nggak harus punya alasan.",
  },
  {
    value: "reflect",
    label: "Refleksi",
    icon: Eye,
    emptyTitle: "Belum ada refleksi",
    emptyDescription:
      "Luangkan waktu untuk melihat sesuatu dari sudut pandang baru.",
  },
];

const cardClass =
  "rounded-[24px] border border-[#29282D]/[0.07] bg-white/70 shadow-[0_4px_24px_rgba(41,40,45,0.025)]";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-[#29282D] px-4 py-3 text-sm font-medium text-[#F8F6F1] transition-colors hover:bg-[#45434B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2 disabled:opacity-50";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-[#29282D]/10 bg-white/70 px-4 py-3 text-sm font-medium text-[#29282D]/75 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2";

const sectionLabel =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-[#29282D]/40";

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
}) {
  return (
    <div
      className={`${cardClass} flex flex-col items-center px-6 py-12 text-center`}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-[#EDE8F5] text-[#7B68C8]">
        <Icon size={24} strokeWidth={1.6} />
      </div>

      <h3 className="mt-5 font-semibold text-[#29282D]">{title}</h3>

      <p className="mt-2 max-w-xs text-sm leading-6 text-[#29282D]/50">
        {description}
      </p>
    </div>
  );
}

function EntryDate({
  date,
  showRelative = false,
}: {
  date: string;
  showRelative?: boolean;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#29282D]/40">
      <span>{formatDateTime(date)}</span>
      {showRelative && (
        <>
          <span aria-hidden="true">·</span>
          <span>{formatTimeAgo(date)}</span>
        </>
      )}
    </div>
  );
}

export default function SpacePage() {
  const shouldReduceMotion = useReducedMotion();

  const [tab, setTab] = useState<Tab>("dump");
  const [dumps, setDumps] = useState<BrainDumpEntry[]>([]);
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);

  const [showDeleteOne, setShowDeleteOne] = useState<DeleteTarget | null>(null);
  const [showClearAll, setShowClearAll] = useState(false);
  const [exportMsg, setExportMsg] = useState("");
  const [exportError, setExportError] = useState(false);

  const exportTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const reload = () => {
    setDumps(getBrainDumps());
    setMoods(getMoodEntries());
    setReflections(getReflections());
  };

  useEffect(() => {
    reload();

    return () => {
      if (exportTimeoutRef.current) {
        clearTimeout(exportTimeoutRef.current);
      }
    };
  }, []);

  const total = dumps.length + moods.length + reflections.length;

  const tabCounts: Record<Tab, number> = {
    dump: dumps.length,
    mood: moods.length,
    reflect: reflections.length,
  };

  const activeTab = tabs.find((item) => item.value === tab)!;
  const dialogOpen = Boolean(showDeleteOne || showClearAll);

  // Mengembalikan fokus ke tombol pemicu saat dialog ditutup.
  useEffect(() => {
    if (dialogOpen) {
      previousFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      requestAnimationFrame(() => {
        const firstButton =
          dialogRef.current?.querySelector<HTMLElement>("button");
        firstButton?.focus();
      });

      return;
    }

    previousFocusRef.current?.focus();
    previousFocusRef.current = null;
  }, [dialogOpen]);

  // Menutup dialog dengan Escape.
  useEffect(() => {
    if (!dialogOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowDeleteOne(null);
        setShowClearAll(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialogOpen]);

  const handleDeleteOne = () => {
    if (!showDeleteOne) return;

    if (showDeleteOne.type === "dump") {
      deleteBrainDump(showDeleteOne.id);
    } else if (showDeleteOne.type === "mood") {
      deleteMoodEntry(showDeleteOne.id);
    } else {
      deleteReflection(showDeleteOne.id);
    }

    reload();
    setShowDeleteOne(null);
  };

  const handleClearAll = () => {
    clearAllData();
    reload();
    setShowClearAll(false);
    setTab("dump");
  };

  const handleExport = (format: "json" | "txt") => {
    try {
      if (format === "json") {
        exportDataAsJSON();
      } else {
        exportDataAsText();
      }

      setExportError(false);
      setExportMsg(
        format === "json"
          ? "File JSON berhasil disiapkan."
          : "File teks berhasil disiapkan.",
      );
    } catch {
      setExportError(true);
      setExportMsg("Ekspor gagal. Coba lagi sebentar.");
    }

    if (exportTimeoutRef.current) {
      clearTimeout(exportTimeoutRef.current);
    }

    exportTimeoutRef.current = setTimeout(() => {
      setExportMsg("");
      exportTimeoutRef.current = null;
    }, 3500);
  };

  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -5 },
        transition: { duration: 0.22 },
      };

  return (
    <main className="mx-auto max-w-2xl space-y-7 px-4 py-6 sm:px-6 sm:py-8">
      {/* Page heading */}
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#EDE8F5] px-3 py-1.5 text-xs font-medium text-[#7B68C8]">
          <Archive size={13} />
          Ruang personalmu
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-[#29282D] sm:text-4xl">
          My Space<span className="text-[#7B68C8]">.</span>
        </h1>

        <p className="max-w-md text-sm leading-6 text-[#29282D]/55 sm:text-base">
          Semua yang pernah kamu tulis, rasakan, dan pikirkan. Nggak harus
          selalu rapi untuk tetap berarti.
        </p>
      </header>

      {/* Summary */}
      <section className={`${cardClass} p-5 sm:p-6`}>
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#EDE8F5] text-[#7B68C8]">
            <Sparkles size={22} strokeWidth={1.7} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#29282D]">
              Ruangmu, ceritamu.
            </p>
            <p className="mt-1 text-xs leading-5 text-[#29282D]/50">
              {total === 0
                ? "Belum ada catatan. Ruang ini siap menampung ceritamu."
                : `${total} catatan tersimpan di perangkatmu.`}
            </p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-semibold tabular-nums text-[#29282D]">
              {total}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-[#29282D]/35">
              catatan
            </p>
          </div>
        </div>
      </section>

      {/* Empty all */}
      {total === 0 ? (
        <EmptyState
          icon={Archive}
          title="Belum ada catatan di sini"
          description="Mulai dari Brain Dump, Mood Check-in, atau Perspective Shift. Apa pun yang sedang kamu pikirkan boleh dimulai dari sini."
        />
      ) : (
        <>
          {/* Category tabs */}
          <section className="space-y-4">
            <div
              role="tablist"
              aria-label="Kategori catatan"
              className="grid grid-cols-3 gap-1.5 rounded-2xl border border-[#29282D]/[0.06] bg-white/40 p-1.5"
            >
              {tabs.map((item) => {
                const Icon = item.icon;
                const selected = tab === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    role="tab"
                    id={`tab-${item.value}`}
                    aria-selected={selected}
                    aria-controls={`panel-${item.value}`}
                    onClick={() => setTab(item.value)}
                    className={`flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-1 py-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] sm:flex-row sm:gap-2 sm:px-3 ${
                      selected
                        ? "bg-white text-[#29282D] shadow-sm"
                        : "text-[#29282D]/45 hover:bg-white/50 hover:text-[#29282D]/75"
                    }`}
                  >
                    <Icon size={16} strokeWidth={1.8} />
                    <span className="text-[11px] font-medium sm:text-xs">
                      {item.label}
                    </span>
                    <span
                      className={`text-[10px] tabular-nums ${
                        selected ? "text-[#7B68C8]" : "text-[#29282D]/35"
                      }`}
                    >
                      {tabCounts[item.value]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3">
              <h2 className={sectionLabel}>{activeTab.label}</h2>
              <span className="text-xs text-[#29282D]/35">
                {tabCounts[tab]} catatan
              </span>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                {...motionProps}
                id={`panel-${tab}`}
                role="tabpanel"
                aria-labelledby={`tab-${tab}`}
                className="space-y-3"
              >
                {/* Brain dumps */}
                {tab === "dump" &&
                  (dumps.length === 0 ? (
                    <EmptyState
                      icon={FileText}
                      title={tabs[0].emptyTitle}
                      description={tabs[0].emptyDescription}
                    />
                  ) : (
                    dumps.map((entry) => (
                      <article
                        key={entry.id}
                        className={`${cardClass} group p-4 transition-colors hover:bg-white/90 sm:p-5`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EDE8F5] text-[#7B68C8]">
                            <FileText size={18} strokeWidth={1.7} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="break-words text-sm font-semibold text-[#29282D]">
                              {entry.title?.trim() || "Brain Dump"}
                            </h3>

                            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#29282D]/60 line-clamp-4">
                              {entry.content}
                            </p>

                            <EntryDate date={entry.updatedAt} showRelative />
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setShowDeleteOne({
                                type: "dump",
                                id: entry.id,
                              })
                            }
                            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-[#29282D]/30 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                            aria-label={`Hapus catatan ${entry.title || "Brain Dump"}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </article>
                    ))
                  ))}

                {/* Mood entries */}
                {tab === "mood" &&
                  (moods.length === 0 ? (
                    <EmptyState
                      icon={Smile}
                      title={tabs[1].emptyTitle}
                      description={tabs[1].emptyDescription}
                    />
                  ) : (
                    moods.map((entry) => {
                      const mood = getMoodOption(entry.mood);

                      return (
                        <article
                          key={entry.id}
                          className={`${cardClass} p-4 transition-colors hover:bg-white/90 sm:p-5`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#EDE8F5] text-2xl">
                              <span
                                role="img"
                                aria-label={mood?.label ?? "Mood"}
                              >
                                {mood?.emoji ?? "😐"}
                              </span>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-semibold text-[#29282D]">
                                  {mood?.label ?? entry.mood}
                                </h3>

                                <span className="rounded-full bg-[#E5EDE4] px-2 py-1 text-[10px] font-medium text-[#64775F]">
                                  Intensitas {entry.intensity}/5
                                </span>
                              </div>

                              {entry.note && (
                                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#29282D]/60">
                                  {entry.note}
                                </p>
                              )}

                              <EntryDate date={entry.createdAt} />
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setShowDeleteOne({
                                  type: "mood",
                                  id: entry.id,
                                })
                              }
                              className="flex size-9 shrink-0 items-center justify-center rounded-xl text-[#29282D]/30 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                              aria-label={`Hapus mood check-in ${mood?.label ?? entry.mood}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </article>
                      );
                    })
                  ))}

                {/* Reflections */}
                {tab === "reflect" &&
                  (reflections.length === 0 ? (
                    <EmptyState
                      icon={Eye}
                      title={tabs[2].emptyTitle}
                      description={tabs[2].emptyDescription}
                    />
                  ) : (
                    reflections.map((entry) => (
                      <article
                        key={entry.id}
                        className={`${cardClass} p-4 transition-colors hover:bg-white/90 sm:p-5`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E5EDE4] text-[#71856C]">
                            <Eye size={18} strokeWidth={1.7} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#71856C]">
                              Apa yang terjadi?
                            </p>

                            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-[#29282D] line-clamp-3">
                              {entry.whatHappened || "Belum ada jawaban."}
                            </p>

                            <EntryDate date={entry.createdAt} />

                            <details className="mt-3 border-t border-[#29282D]/[0.06] pt-3">
                              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-medium text-[#7B68C8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8]">
                                Lihat refleksi lengkap
                                <ChevronRight size={14} className="shrink-0" />
                              </summary>

                              <div className="mt-4 space-y-4">
                                {[
                                  {
                                    label: "Apa yang terjadi?",
                                    value: entry.whatHappened,
                                  },
                                  {
                                    label: "Apa yang kamu rasakan?",
                                    value: entry.whatFelt,
                                  },
                                  {
                                    label: "Apa yang sedang kamu asumsikan?",
                                    value: entry.assumptions,
                                  },
                                  {
                                    label: "Apa yang bisa kamu kendalikan?",
                                    value: entry.whatCanControl,
                                  },
                                ].map((answer) => (
                                  <div key={answer.label} className="space-y-1">
                                    <p className="text-xs font-medium text-[#29282D]/45">
                                      {answer.label}
                                    </p>
                                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#29282D]/75">
                                      {answer.value || "Belum diisi."}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </details>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setShowDeleteOne({
                                type: "reflect",
                                id: entry.id,
                              })
                            }
                            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-[#29282D]/30 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                            aria-label="Hapus catatan refleksi"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </article>
                    ))
                  ))}
              </motion.div>
            </AnimatePresence>
          </section>

          {/* Privacy & export */}
          <section className={`${cardClass} space-y-5 p-5 sm:p-6`}>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E5EDE4] text-[#71856C]">
                <ShieldCheck size={20} strokeWidth={1.7} />
              </div>

              <div className="space-y-1">
                <h2 className="font-semibold text-[#29282D]">Data & privasi</h2>
                <p className="text-sm leading-6 text-[#29282D]/50">
                  Catatanmu tersimpan di perangkat ini. Ekspor salinan kalau
                  kamu ingin menyimpannya di tempat lain.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleExport("json")}
                className={secondaryButton}
              >
                <Download size={15} />
                Ekspor JSON
              </button>

              <button
                type="button"
                onClick={() => handleExport("txt")}
                className={secondaryButton}
              >
                <FileText size={15} />
                Ekspor teks
              </button>
            </div>

            <AnimatePresence>
              {exportMsg && (
                <motion.p
                  initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="status"
                  className={`flex items-center gap-2 text-xs ${
                    exportError ? "text-red-500" : "text-[#71856C]"
                  }`}
                >
                  {exportError ? (
                    <AlertTriangle size={14} />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  {exportMsg}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="border-t border-[#29282D]/[0.07] pt-4">
              <p className="text-xs leading-5 text-[#29282D]/45">
                Menghapus catatan bersifat permanen. Ekspor dulu jika ada data
                yang masih ingin kamu simpan.
              </p>

              <button
                type="button"
                onClick={() => setShowClearAll(true)}
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-200/80 px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
              >
                <Trash2 size={15} />
                Hapus semua data
              </button>
            </div>
          </section>
        </>
      )}

      {/* Confirmation dialogs */}
      <AnimatePresence>
        {dialogOpen && (
          <motion.div
            key="dialog-overlay"
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#29282D]/30 px-3 pb-3 backdrop-blur-[3px] sm:items-center sm:p-4"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setShowDeleteOne(null);
                setShowClearAll(false);
              }
            }}
          >
            <motion.div
              ref={dialogRef}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              aria-describedby="confirm-description"
              initial={
                shouldReduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                shouldReduceMotion
                  ? undefined
                  : { opacity: 0, y: 8, scale: 0.98 }
              }
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              className="w-full max-w-sm space-y-5 rounded-[28px] border border-white/60 bg-[#F8F6F1] p-5 shadow-2xl sm:p-6"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                  <AlertTriangle size={21} />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <h2
                    id="confirm-title"
                    className="font-semibold text-[#29282D]"
                  >
                    {showClearAll
                      ? "Hapus semua catatan?"
                      : "Hapus catatan ini?"}
                  </h2>

                  <p
                    id="confirm-description"
                    className="text-sm leading-6 text-[#29282D]/55"
                  >
                    {showClearAll
                      ? "Semua brain dump, mood check-in, dan refleksi akan dihapus permanen dari perangkat ini."
                      : "Catatan ini akan dihapus permanen dari perangkatmu. Tindakan ini nggak bisa dibatalkan."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteOne(null);
                    setShowClearAll(false);
                  }}
                  aria-label="Tutup dialog"
                  className="flex size-8 shrink-0 items-center justify-center rounded-xl text-[#29282D]/40 hover:bg-white hover:text-[#29282D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8]"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={showClearAll ? handleClearAll : handleDeleteOne}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
                >
                  <Trash2 size={15} />
                  {showClearAll ? "Hapus semuanya" : "Hapus catatan"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteOne(null);
                    setShowClearAll(false);
                  }}
                  className={secondaryButton}
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
