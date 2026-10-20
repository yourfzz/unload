"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  Heart,
  Lightbulb,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  getAllPrompts,
  getRandomPrompt,
  getRandomPromptByCategory,
} from "@/data/prompts";
import { PROMPT_CATEGORIES } from "@/data/moods";
import { getFavoritePrompts, toggleFavoritePrompt } from "@/lib/storage";
import type { Prompt, PromptCategory } from "@/types/unload";

type CategoryFilter = PromptCategory | "all" | "favorites";

const RECENT_LIMIT = 5;

export default function PromptsPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [cat, setCat] = useState<CategoryFilter>("all");
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [favIds, setFavIds] = useState<Set<string>>(() => new Set());
  const [toast, setToast] = useState("");
  const [copied, setCopied] = useState(false);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allPrompts = useMemo(() => getAllPrompts(), []);

  const favoritePrompts = useMemo(
    () => allPrompts.filter((item) => favIds.has(item.id)),
    [allPrompts, favIds],
  );

  const activeCategory = useMemo(
    () => PROMPT_CATEGORIES.find((item) => item.value === cat),
    [cat],
  );

  const currentIsFavorite = prompt ? favIds.has(prompt.id) : false;

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    setToast(message);

    toastTimer.current = setTimeout(() => {
      setToast("");
      toastTimer.current = null;
    }, 2200);
  }, []);

  useEffect(() => {
    const initialPrompt = getRandomPrompt();

    if (initialPrompt) {
      setPrompt(initialPrompt);
      setRecent([initialPrompt.id]);
    }

    setFavIds(
      new Set(getFavoritePrompts().map((favorite) => favorite.promptId)),
    );

    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const getCandidates = useCallback(
    (category: CategoryFilter): Prompt[] => {
      if (category === "favorites") {
        return allPrompts.filter((item) => favIds.has(item.id));
      }

      if (category === "all") {
        return allPrompts;
      }

      // The existing category helper is used to preserve the data model.
      const first = getRandomPromptByCategory(category);
      const candidates = allPrompts.filter((item) => {
        const candidateCategory = (
          item as Prompt & { category?: PromptCategory }
        ).category;

        return candidateCategory === category;
      });

      // If Prompt does not expose a category field, fall back to the
      // existing helper instead of assuming a different data structure.
      return candidates.length > 0 ? candidates : first ? [first] : [];
    },
    [allPrompts, favIds],
  );

  const choosePrompt = useCallback(
    (category: CategoryFilter, excludeRecent = true) => {
      const candidates = getCandidates(category);

      if (candidates.length === 0) {
        setPrompt(null);
        return;
      }

      const recentIds = new Set(recent.slice(-RECENT_LIMIT));

      let available = excludeRecent
        ? candidates.filter((item) => !recentIds.has(item.id))
        : candidates;

      // If every prompt has appeared recently, allow the history to roll over.
      if (available.length === 0) {
        available = candidates.filter((item) => item.id !== prompt?.id);
      }

      if (available.length === 0) {
        available = candidates;
      }

      const nextPrompt =
        available[Math.floor(Math.random() * available.length)];

      if (!nextPrompt) {
        setPrompt(null);
        return;
      }

      setPrompt(nextPrompt);
      setRecent((previous) =>
        [...previous, nextPrompt.id].slice(-RECENT_LIMIT),
      );
    },
    [getCandidates, prompt?.id, recent],
  );

  const changeCategory = useCallback(
    (category: CategoryFilter) => {
      setCat(category);

      const candidates =
        category === "favorites"
          ? allPrompts.filter((item) => favIds.has(item.id))
          : category === "all"
            ? allPrompts
            : getCandidates(category);

      if (candidates.length === 0) {
        setPrompt(null);
        setRecent([]);
        return;
      }

      const firstPrompt =
        candidates[Math.floor(Math.random() * candidates.length)];

      setPrompt(firstPrompt ?? null);
      setRecent(firstPrompt ? [firstPrompt.id] : []);
    },
    [allPrompts, favIds, getCandidates],
  );

  const refreshFavorites = useCallback(() => {
    setFavIds(
      new Set(getFavoritePrompts().map((favorite) => favorite.promptId)),
    );
  }, []);

  const handleFavorite = useCallback(() => {
    if (!prompt) return;

    toggleFavoritePrompt(prompt.id);
    refreshFavorites();

    showToast(
      currentIsFavorite ? "Dihapus dari favorit" : "Disimpan ke favorit",
    );
  }, [prompt, currentIsFavorite, refreshFavorites, showToast]);

  const removeFavorite = useCallback(
    (id: string) => {
      toggleFavoritePrompt(id);
      refreshFavorites();
      showToast("Dihapus dari favorit");
    },
    [refreshFavorites, showToast],
  );

  const handleCopy = useCallback(async () => {
    if (!prompt) return;

    try {
      await navigator.clipboard.writeText(prompt.text);
      setCopied(true);
      showToast("Prompt berhasil disalin");

      if (copyTimer.current) clearTimeout(copyTimer.current);

      copyTimer.current = setTimeout(() => {
        setCopied(false);
        copyTimer.current = null;
      }, 1800);
    } catch {
      showToast("Belum bisa menyalin prompt");
    }
  }, [prompt, showToast]);

  const startWriting = useCallback(() => {
    if (!prompt) return;

    router.push(`/unload?prompt=${encodeURIComponent(prompt.text)}`);
  }, [prompt, router]);

  const enterAnimation = {
    initial: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: shouldReduceMotion ? 0 : 0.35 },
  };

  const categoryFilters: {
    value: CategoryFilter;
    label: string;
    emoji: string;
  }[] = [
    { value: "all", label: "Semua", emoji: "✨" },
    { value: "favorites", label: "Favorit", emoji: "🤍" },
    ...PROMPT_CATEGORIES.map((item) => ({
      value: item.value,
      label: item.label,
      emoji: item.emoji,
    })),
  ];

  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-4 pb-8 pt-6 sm:px-6">
      <div className="flex-1 space-y-8">
        {/* Hero */}
        <motion.section
          {...enterAnimation}
          aria-labelledby="prompts-heading"
          className="relative overflow-hidden rounded-[28px] border border-[#29282D]/[0.06] bg-white/45 px-5 py-7 sm:px-7 sm:py-8"
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
              <h1
                id="prompts-heading"
                className="max-w-lg text-3xl font-semibold leading-[1.15] tracking-tight text-[#29282D] sm:text-4xl"
              >
                Kadang, kamu cuma butuh{" "}
                <span className="text-[#7B68C8]">satu pertanyaan.</span>
              </h1>

              <p className="max-w-md text-sm leading-7 text-[#29282D]/60 sm:text-base">
                Nggak harus langsung punya jawaban. Mulai aja dari hal kecil
                yang lagi ada di pikiranmu.
              </p>
            </div>

            <p className="flex items-center gap-2 text-xs text-[#29282D]/40">
              <Lightbulb size={14} className="text-[#9B7D3A]" />
              Pelan-pelan aja. Nggak ada jawaban yang salah.
            </p>
          </div>
        </motion.section>

        {/* Category filters */}
        <motion.section
          {...enterAnimation}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.35,
            delay: shouldReduceMotion ? 0 : 0.05,
          }}
          aria-label="Filter kategori prompt"
          className="space-y-3"
        >
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-[#29282D]">
              Lagi pengin bahas apa?
            </h2>
            <p className="text-sm text-[#29282D]/45">
              Pilih yang paling dekat dengan keadaanmu sekarang.
            </p>
          </div>

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6">
            {categoryFilters.map((item) => {
              const selected = cat === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => changeCategory(item.value)}
                  aria-pressed={selected}
                  className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2 ${
                    selected
                      ? "border-[#29282D] bg-[#29282D] text-[#F4F0E8]"
                      : "border-[#29282D]/[0.08] bg-white/60 text-[#29282D]/60 hover:border-[#29282D]/15 hover:bg-white/90"
                  }`}
                >
                  <span aria-hidden="true">{item.emoji}</span>
                  {item.label}
                  {item.value === "favorites" && favIds.size > 0 && (
                    <span
                      className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                        selected
                          ? "bg-white/15 text-white"
                          : "bg-[#EDE8F5] text-[#7B68C8]"
                      }`}
                    >
                      {favIds.size}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.section>

        {/* Main prompt */}
        {cat !== "favorites" && (
          <section aria-label="Prompt pilihan" aria-live="polite">
            <AnimatePresence mode="wait">
              {prompt ? (
                <motion.div
                  key={prompt.id}
                  initial={
                    shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }
                  }
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.22,
                  }}
                  className="relative overflow-hidden rounded-[28px] border border-[#29282D]/[0.06] bg-white/70 p-5 shadow-[0_8px_30px_rgba(41,40,45,0.025)] sm:p-7"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-16 -right-12 h-40 w-40 rounded-full bg-[#EDE8F5]/55 blur-3xl"
                  />

                  <div className="relative space-y-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#29282D]/40">
                        <Sparkles size={13} className="text-[#7B68C8]" />
                        Satu pertanyaan untukmu
                      </span>

                      <button
                        type="button"
                        onClick={handleFavorite}
                        aria-label={
                          currentIsFavorite
                            ? "Hapus prompt dari favorit"
                            : "Simpan prompt ke favorit"
                        }
                        aria-pressed={currentIsFavorite}
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2 ${
                          currentIsFavorite
                            ? "border-red-200 bg-red-50 text-red-500"
                            : "border-[#29282D]/[0.07] bg-white/80 text-[#29282D]/40 hover:border-red-200 hover:bg-red-50 hover:text-red-400"
                        }`}
                      >
                        <Heart
                          size={17}
                          fill={currentIsFavorite ? "currentColor" : "none"}
                        />
                      </button>
                    </div>

                    <p className="relative text-xl font-medium leading-relaxed tracking-tight text-[#29282D] sm:text-2xl sm:leading-relaxed">
                      “{prompt.text}”
                    </p>

                    <div className="h-px bg-[#29282D]/[0.06]" />

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <button
                        type="button"
                        onClick={() => choosePrompt(cat)}
                        className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#29282D] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-[#403D46] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2"
                      >
                        <RefreshCw size={15} />
                        Prompt lain
                      </button>

                      <button
                        type="button"
                        onClick={startWriting}
                        className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#EDE8F5] px-4 py-3 text-sm font-medium text-[#62509B] transition-all hover:bg-[#E4DCF2] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2"
                      >
                        <BookOpen size={15} />
                        Mulai menulis
                        <ArrowRight
                          size={14}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#29282D]/[0.08] bg-white/70 px-4 py-3 text-sm text-[#29282D]/60 transition-colors hover:bg-white hover:text-[#29282D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2"
                      >
                        {copied ? (
                          <Check size={15} />
                        ) : (
                          <span aria-hidden="true">↗</span>
                        )}
                        {copied ? "Tersalin" : "Salin prompt"}
                      </button>
                    </div>

                    <p className="text-xs leading-relaxed text-[#29282D]/35">
                      Nggak perlu buru-buru menjawab. Luangkan waktu sebentar
                      buat memahami apa yang kamu rasakan.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty-prompt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-[28px] border border-dashed border-[#29282D]/15 bg-white/40 px-5 py-12 text-center"
                >
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDE8F5]">
                    <Lightbulb size={22} className="text-[#7B68C8]" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-[#29282D]">
                    Belum ada prompt di sini
                  </h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[#29282D]/50">
                    Sepertinya kategori ini masih kosong. Coba lihat kategori
                    lain dulu, ya.
                  </p>
                  <button
                    type="button"
                    onClick={() => changeCategory("all")}
                    className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#29282D] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#403D46]"
                  >
                    Jelajahi semua prompt
                    <ArrowRight size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        {/* Favorites */}
        {cat === "favorites" && (
          <motion.section
            {...enterAnimation}
            aria-labelledby="favorites-heading"
            className="space-y-4"
          >
            <div className="space-y-1">
              <h2
                id="favorites-heading"
                className="text-lg font-semibold tracking-tight text-[#29282D]"
              >
                Prompt yang kamu simpan
              </h2>
              <p className="text-sm text-[#29282D]/45">
                Pertanyaan yang bisa kamu kunjungi lagi kapan saja.
              </p>
            </div>

            {favoritePrompts.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-[#29282D]/15 bg-white/40 px-5 py-12 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5E9EC]">
                  <Heart size={21} className="text-[#C47D8C]" />
                </span>

                <h3 className="mt-4 text-base font-semibold text-[#29282D]">
                  Belum ada yang disimpan
                </h3>

                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[#29282D]/50">
                  Ketemu pertanyaan yang terasa dekat? Simpan lewat ikon hati
                  supaya gampang ditemukan lagi.
                </p>

                <button
                  type="button"
                  onClick={() => changeCategory("all")}
                  className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#29282D] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#403D46]"
                >
                  Cari prompt
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {favoritePrompts.map((item, index) => (
                  <motion.article
                    key={item.id}
                    initial={
                      shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.25,
                      delay: shouldReduceMotion ? 0 : index * 0.035,
                    }}
                    className="flex items-start gap-3 rounded-2xl border border-[#29282D]/[0.06] bg-white/60 p-4 transition-colors hover:bg-white/85 sm:p-5"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EDE8F5]">
                      <Heart
                        size={16}
                        className="text-[#7B68C8]"
                        fill="currentColor"
                      />
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setPrompt(item);
                        setRecent((previous) =>
                          [...previous, item.id].slice(-RECENT_LIMIT),
                        );
                        router.push(
                          `/unload?prompt=${encodeURIComponent(item.text)}`,
                        );
                      }}
                      className="min-w-0 flex-1 text-left text-sm leading-relaxed text-[#29282D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2"
                    >
                      {item.text}
                      <span className="mt-2 flex items-center gap-1 text-xs font-medium text-[#7B68C8]">
                        Tulis respons
                        <ArrowRight size={12} />
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeFavorite(item.id)}
                      aria-label="Hapus prompt dari favorit"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#29282D]/35 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2"
                    >
                      <X size={16} />
                    </button>
                  </motion.article>
                ))}
              </div>
            )}
          </motion.section>
        )}

        {/* Gentle reminder */}
        <motion.div
          {...enterAnimation}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.35,
            delay: shouldReduceMotion ? 0 : 0.1,
          }}
          className="flex items-start gap-3 rounded-2xl border border-[#29282D]/[0.05] bg-white/35 p-4"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E5EDE4]">
            <span aria-hidden="true">🌱</span>
          </span>
          <div className="space-y-1">
            <p className="text-sm font-medium text-[#29282D]">
              Nggak harus selesai hari ini.
            </p>
            <p className="text-xs leading-relaxed text-[#29282D]/50">
              Memahami diri sendiri bukan lomba. Satu hal kecil juga tetap
              berarti.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.2,
            }}
            className="fixed bottom-6 left-1/2 z-50 max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full bg-[#29282D] px-4 py-3 text-center text-xs font-medium text-[#F4F0E8] shadow-lg sm:bottom-8"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
