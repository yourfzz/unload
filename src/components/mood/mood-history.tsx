"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, History, Heart, X, AlertTriangle } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { getMoodEntries, deleteMoodEntry } from "@/lib/storage";
import { getMoodOption, INTENSITY_LABELS } from "@/data/moods";
import { formatDate, formatTimeAgo } from "@/lib/dates";
import type { MoodEntry } from "@/types/unload";

export default function MoodHistory() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const shouldReduceMotion = useReducedMotion();

  const refreshEntries = useCallback(() => {
    setEntries(getMoodEntries());
  }, []);

  useEffect(() => {
    refreshEntries();
  }, [refreshEntries]);

  const selectedEntry = entries.find((entry) => entry.id === showDelete);

  const closeDeleteDialog = () => {
    if (isDeleting) return;

    setShowDelete(null);
    setDeleteError("");
  };

  const handleDelete = () => {
    if (!showDelete || isDeleting) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      const success = deleteMoodEntry(showDelete);

      if (!success) {
        setDeleteError("Catatan belum berhasil dihapus. Coba sekali lagi.");
        return;
      }

      refreshEntries();
      setShowDelete(null);
    } catch {
      setDeleteError("Ada kendala saat menghapus catatan. Coba lagi, ya.");
    } finally {
      setIsDeleting(false);
    }
  };

  const transition = {
    duration: shouldReduceMotion ? 0 : 0.2,
  };

  if (entries.length === 0) {
    return (
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className="rounded-2xl border border-[#29282D]/[0.06] bg-white/50 px-6 py-12 text-center"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDE8F5]">
          <Heart size={25} className="text-[#7B68C8]" />
        </div>

        <h2 className="font-semibold text-[#29282D]">
          Belum ada cerita di sini
        </h2>

        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[#29282D]/55">
          Nggak apa-apa, semua bisa dimulai dari satu check-in kecil.
          Pelan-pelan aja.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <section className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDE8F5]">
              <History size={19} className="text-[#7B68C8]" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#29282D]">
                Riwayat mood
              </h2>
              <p className="mt-0.5 text-xs text-[#29282D]/50">
                Semua perasaanmu punya tempat.
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-full bg-[#29282D]/[0.05] px-3 py-1.5 text-xs font-medium text-[#29282D]/60">
            {entries.length} {entries.length === 1 ? "catatan" : "catatan"}
          </span>
        </div>

        <div className="relative space-y-3">
          {entries.map((entry, index) => {
            const option = getMoodOption(entry.mood);
            const intensityLabel =
              INTENSITY_LABELS[entry.intensity] ?? "Belum ditentukan";

            return (
              <motion.article
                key={entry.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  ...transition,
                  delay: shouldReduceMotion ? 0 : Math.min(index * 0.04, 0.2),
                }}
                className="group rounded-2xl border border-[#29282D]/[0.06] bg-white/70 p-4 transition-colors hover:border-[#7B68C8]/20 hover:bg-white sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EDE8F5] text-2xl"
                    aria-hidden="true"
                  >
                    {option?.emoji ?? "😐"}
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#29282D]">
                        {option?.label ?? entry.mood}
                      </h3>

                      <span className="rounded-full bg-[#29282D]/[0.05] px-2.5 py-1 text-[11px] font-medium text-[#29282D]/60">
                        {intensityLabel}
                      </span>
                    </div>

                    {entry.factors?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {entry.factors.map((factor) => (
                          <span
                            key={factor}
                            className="rounded-lg bg-[#E5EDE4] px-2 py-1 text-[11px] text-[#456642]"
                          >
                            {factor}
                          </span>
                        ))}
                      </div>
                    )}

                    {entry.note?.trim() && (
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#29282D]/70">
                        {entry.note}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-[11px] text-[#29282D]/40">
                      <span>{formatDate(entry.createdAt)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatTimeAgo(entry.createdAt)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError("");
                      setShowDelete(entry.id);
                    }}
                    aria-label={`Hapus catatan mood ${option?.label ?? entry.mood}`}
                    title="Hapus catatan"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#29282D]/35 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>

        <p className="px-1 text-center text-xs leading-relaxed text-[#29282D]/40">
          Nggak harus selalu merasa baik-baik aja. Jujur sama diri sendiri juga
          sebuah kemajuan.
        </p>
      </section>

      <AnimatePresence>
        {showDelete && selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#29282D]/35 p-4 backdrop-blur-sm"
            onClick={closeDeleteDialog}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-mood-title"
              aria-describedby="delete-mood-description"
              initial={
                shouldReduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 8, scale: 0.98 }
              }
              transition={transition}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-sm rounded-3xl border border-white/60 bg-[#F4F0E8] p-6 shadow-2xl sm:p-7"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-500">
                  <AlertTriangle size={23} />
                </div>

                <button
                  type="button"
                  onClick={closeDeleteDialog}
                  disabled={isDeleting}
                  aria-label="Tutup dialog"
                  className="rounded-xl p-2 text-[#29282D]/45 transition-colors hover:bg-black/5 hover:text-[#29282D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] disabled:opacity-40"
                >
                  <X size={18} />
                </button>
              </div>

              <h3
                id="delete-mood-title"
                className="text-lg font-semibold text-[#29282D]"
              >
                Hapus catatan ini?
              </h3>

              <p
                id="delete-mood-description"
                className="mt-2 text-sm leading-relaxed text-[#29282D]/60"
              >
                Catatan mood ini akan dihapus dari riwayatmu. Pastikan kamu
                memang ingin menghapusnya.
              </p>

              {deleteError && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600"
                >
                  {deleteError}
                </p>
              )}

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={closeDeleteDialog}
                  disabled={isDeleting}
                  className="flex-1 rounded-xl border border-[#29282D]/10 bg-white px-4 py-3 text-sm font-medium text-[#29282D] transition-colors hover:bg-[#29282D]/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? "Menghapus..." : "Ya, hapus"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
