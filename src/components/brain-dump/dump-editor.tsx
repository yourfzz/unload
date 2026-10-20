"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Save,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  PenLine,
  Sparkles,
  Clock3,
  LockKeyhole,
  Feather,
  Plus,
  ArrowRight,
  Type,
} from "lucide-react";

import {
  getBrainDumps,
  saveBrainDump,
  deleteBrainDump,
  generateId,
} from "@/lib/storage";
import { formatDateTime } from "@/lib/dates";
import { getRandomPrompt } from "@/data/prompts";
import type { BrainDumpEntry } from "@/types/unload";
import AppFooter from "@/components/layout/app-footer";

const AUTOSAVE_DELAY = 1500;
const DRAFT_KEY = "unload_draft";

const PLACEHOLDERS = [
  "Tulis aja apa yang lagi muter-muter di kepala kamu...",
  "Nggak harus rapi. Nggak harus masuk akal. Mulai aja dulu.",
  "Apa yang paling memenuhi pikiranmu hari ini?",
  "Kalau bisa ngomong tanpa takut dihakimi, kamu mau bilang apa?",
  "Tulis dulu. Urusan memahami semuanya bisa belakangan.",
];

type SaveStatus = "idle" | "saving" | "saved" | "error";

type Draft = {
  title: string;
  content: string;
  promptText: string;
};

export default function DumpEditor() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [promptText, setPromptText] = useState("");
  const [savedEntries, setSavedEntries] = useState<BrainDumpEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [showPromptBanner, setShowPromptBanner] = useState(false);
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const [ready, setReady] = useState(false);

  const autosaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const refreshEntries = useCallback(() => {
    setSavedEntries(getBrainDumps());
  }, []);

  const clearAutosave = useCallback(() => {
    if (autosaveRef.current) {
      clearTimeout(autosaveRef.current);
      autosaveRef.current = null;
    }
  }, []);

  const clearStatusTimer = useCallback(() => {
    if (statusRef.current) {
      clearTimeout(statusRef.current);
      statusRef.current = null;
    }
  }, []);

  const removeDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Editor tetap bisa digunakan tanpa localStorage.
    }
  }, []);

  useEffect(() => {
    setPlaceholder(
      PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)] ??
        PLACEHOLDERS[0],
    );

    refreshEntries();

    try {
      const raw = localStorage.getItem(DRAFT_KEY);

      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Draft>;

        setTitle(parsed.title ?? "");
        setContent(parsed.content ?? "");
        setPromptText(parsed.promptText ?? "");
        setShowPromptBanner(Boolean(parsed.promptText));
      }
    } catch {
      // Draft yang tidak valid tidak menghalangi editor.
    }

    setReady(true);

    return () => {
      clearAutosave();
      clearStatusTimer();
    };
  }, [refreshEntries, clearAutosave, clearStatusTimer]);

  useEffect(() => {
    if (!showDelete) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowDelete(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    cancelDeleteRef.current?.focus();

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showDelete]);

  const doSave = useCallback(
    (
      id: string | null,
      nextTitle: string,
      nextContent: string,
      nextPrompt: string,
    ): string | null => {
      if (!nextContent.trim()) return null;

      clearStatusTimer();
      setSaveStatus("saving");

      const now = new Date().toISOString();
      const existing = id
        ? getBrainDumps().find((entry) => entry.id === id)
        : undefined;

      const entry: BrainDumpEntry = {
        id: id ?? generateId(),
        title: nextTitle.trim() || undefined,
        content: nextContent.trim(),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        promptUsed: nextPrompt.trim() || undefined,
      };

      const ok = saveBrainDump(entry);

      if (!ok) {
        setSaveStatus("error");
        return null;
      }

      refreshEntries();
      removeDraft();
      setSaveStatus("saved");

      statusRef.current = setTimeout(() => {
        setSaveStatus("idle");
        statusRef.current = null;
      }, 2500);

      return entry.id;
    },
    [clearStatusTimer, refreshEntries, removeDraft],
  );

  const scheduleAutosave = useCallback(
    (
      nextTitle: string,
      nextContent: string,
      nextPrompt: string,
      id: string | null = editingId,
    ) => {
      clearAutosave();
      clearStatusTimer();
      setSaveStatus("idle");

      autosaveRef.current = setTimeout(() => {
        autosaveRef.current = null;

        if (id && nextContent.trim()) {
          doSave(id, nextTitle, nextContent, nextPrompt);
          return;
        }

        if (!nextTitle.trim() && !nextContent.trim() && !nextPrompt.trim()) {
          removeDraft();
          return;
        }

        try {
          localStorage.setItem(
            DRAFT_KEY,
            JSON.stringify({
              title: nextTitle,
              content: nextContent,
              promptText: nextPrompt,
            } satisfies Draft),
          );

          setSaveStatus("saved");

          statusRef.current = setTimeout(() => {
            setSaveStatus("idle");
            statusRef.current = null;
          }, 2500);
        } catch {
          setSaveStatus("error");
        }
      }, AUTOSAVE_DELAY);
    },
    [editingId, clearAutosave, clearStatusTimer, doSave, removeDraft],
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    scheduleAutosave(value, content, promptText);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    scheduleAutosave(title, value, promptText);
  };

  const handleSave = () => {
    clearAutosave();

    const newId = doSave(editingId, title, content, promptText);

    if (newId) setEditingId(newId);
  };

  const handleNew = useCallback(() => {
    clearAutosave();
    clearStatusTimer();

    setTitle("");
    setContent("");
    setPromptText("");
    setEditingId(null);
    setSaveStatus("idle");
    setShowPromptBanner(false);
    setShowDelete(null);
    removeDraft();

    requestAnimationFrame(() => textareaRef.current?.focus());
  }, [clearAutosave, clearStatusTimer, removeDraft]);

  const handleLoadEntry = (entry: BrainDumpEntry) => {
    clearAutosave();
    clearStatusTimer();

    setTitle(entry.title ?? "");
    setContent(entry.content);
    setPromptText(entry.promptUsed ?? "");
    setEditingId(entry.id);
    setSaveStatus("idle");
    setShowPromptBanner(Boolean(entry.promptUsed));

    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });

    textareaRef.current?.focus({ preventScroll: true });
  };

  const handleDelete = (id: string) => {
    if (deleteBrainDump(id)) {
      refreshEntries();

      if (editingId === id) handleNew();
    }

    setShowDelete(null);
  };

  const handleRandomPrompt = () => {
    const prompt = getRandomPrompt();

    if (!prompt) return;

    setPromptText(prompt.text);
    setShowPromptBanner(true);
    scheduleAutosave(title, content, prompt.text);
  };

  const activeDeleteEntry = savedEntries.find(
    (entry) => entry.id === showDelete,
  );

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const enter = shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 };

  const transition = {
    duration: shouldReduceMotion ? 0 : 0.4,
  };

  return (
    <main className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-4 pb-4 pt-6 sm:px-6">
      <div className="flex-1 space-y-9">
        {/* Hero: mengikuti struktur Home */}
        <motion.section
          initial={enter}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          aria-labelledby="dump-heading"
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
              <h1
                id="dump-heading"
                className="max-w-lg text-3xl font-semibold leading-[1.15] tracking-tight text-[#29282D] sm:text-4xl"
              >
                Keluarin isi kepala
                <span className="text-[#7B68C8]">.</span>
              </h1>

              <p className="max-w-md text-sm leading-7 text-[#29282D]/60 sm:text-base">
                Nggak semua hal harus langsung beres. Tulis aja yang lagi kamu
                pikirkan, tanpa perlu merapikan semuanya atau mencari solusi
                sekarang.
              </p>
            </div>

            <button
              type="button"
              onClick={() => textareaRef.current?.focus()}
              className="group inline-flex min-h-11 items-center gap-2.5 rounded-xl bg-[#29282D] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-[#403D46] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2"
            >
              <PenLine size={16} strokeWidth={1.8} />
              <span>Mulai menulis</span>
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-[#29282D]/40">
              <span className="inline-flex items-center gap-1.5">
                <LockKeyhole size={12} />
                Tersimpan di perangkatmu
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Feather size={12} />
                Nggak harus sempurna
              </span>
            </div>
          </div>
        </motion.section>

        {/* Editor */}
        <motion.section
          initial={enter}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            ...transition,
            delay: shouldReduceMotion ? 0 : 0.08,
          }}
          aria-labelledby="editor-heading"
          className="overflow-hidden rounded-[28px] border border-[#29282D]/[0.06] bg-white/60"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#29282D]/[0.06] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] bg-[#EDE8F5]">
                <PenLine
                  size={18}
                  className="text-[#7B68C8]"
                  strokeWidth={1.8}
                />
              </span>

              <div>
                <h2
                  id="editor-heading"
                  className="text-sm font-semibold text-[#29282D]"
                >
                  {editingId ? "Edit catatan" : "Ruang menulismu"}
                </h2>
                <p className="mt-0.5 text-xs text-[#29282D]/45">
                  {editingId
                    ? "Lanjutkan dari tempat terakhir"
                    : "Mulai dari mana aja"}
                </p>
              </div>
            </div>

            <div
              role="status"
              aria-live="polite"
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium ${
                saveStatus === "error"
                  ? "bg-red-50 text-red-600"
                  : saveStatus === "saved"
                    ? "bg-[#E5EDE4] text-[#587650]"
                    : saveStatus === "saving"
                      ? "bg-[#EDE8F5] text-[#7B68C8]"
                      : "bg-[#29282D]/[0.04] text-[#29282D]/45"
              }`}
            >
              {saveStatus === "saving" ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : saveStatus === "saved" ? (
                <CheckCircle2 size={12} />
              ) : saveStatus === "error" ? (
                <AlertCircle size={12} />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
              )}

              <span>
                {saveStatus === "saving"
                  ? "Menyimpan..."
                  : saveStatus === "saved"
                    ? "Tersimpan"
                    : saveStatus === "error"
                      ? "Gagal menyimpan"
                      : "Siap menulis"}
              </span>
            </div>
          </div>

          <div className="px-5 pb-5 pt-6 sm:px-6 sm:pb-6 sm:pt-7">
            <input
              type="text"
              value={title}
              onChange={(event) => handleTitleChange(event.target.value)}
              placeholder="Judul kecil untuk pikiranmu..."
              aria-label="Judul catatan, opsional"
              className="w-full bg-transparent text-xl font-semibold tracking-tight text-[#29282D] outline-none placeholder:font-normal placeholder:text-[#29282D]/30 focus-visible:ring-0 sm:text-2xl"
            />

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-[#29282D]/[0.07]" />
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#29282D]/30">
                Just let it flow
              </span>
              <span className="h-px flex-1 bg-[#29282D]/[0.07]" />
            </div>

            <textarea
              ref={textareaRef}
              value={content}
              onChange={(event) => handleContentChange(event.target.value)}
              placeholder={placeholder}
              rows={12}
              aria-label="Isi catatan"
              className="min-h-[280px] w-full resize-y bg-transparent text-[15px] leading-[1.9] text-[#29282D]/85 outline-none placeholder:text-[#29282D]/35 focus-visible:ring-0 sm:min-h-[340px] sm:text-base"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#29282D]/[0.07] pt-4">
              <div className="flex items-center gap-4 text-xs text-[#29282D]/45">
                <span className="inline-flex items-center gap-1.5">
                  <Type size={13} />
                  {content.length.toLocaleString("id-ID")} karakter
                </span>
                <span>{wordCount.toLocaleString("id-ID")} kata</span>
              </div>

              <span className="text-[11px] text-[#29282D]/40">
                {content.trim()
                  ? "Pelan-pelan aja."
                  : "Satu kalimat juga cukup."}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#29282D]/[0.06] bg-white/35 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={!ready || !content.trim()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#29282D] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-[#403D46] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2"
              >
                <Save size={15} />
                {editingId ? "Simpan perubahan" : "Simpan catatan"}
              </button>

              <button
                type="button"
                onClick={handleRandomPrompt}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#29282D]/[0.07] bg-white/80 px-4 py-3 text-sm text-[#29282D]/70 transition-all hover:border-[#29282D]/[0.12] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8]"
              >
                <Sparkles size={15} className="text-[#7B68C8]" />
                Kasih ide
              </button>
            </div>

            {(content.trim() || title.trim() || editingId) && (
              <button
                type="button"
                onClick={handleNew}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 self-start rounded-xl px-3 text-xs text-[#29282D]/45 transition-colors hover:bg-white hover:text-[#29282D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] sm:self-auto"
              >
                <Plus size={14} />
                Catatan baru
              </button>
            )}
          </div>
        </motion.section>

        {/* Prompt banner */}
        <AnimatePresence>
          {showPromptBanner && promptText && (
            <motion.section
              initial={
                shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              aria-label="Prompt refleksi"
              className="relative overflow-hidden rounded-[24px] border border-[#29282D]/[0.06] bg-white/60 p-5 sm:p-6"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-5 -top-8 h-28 w-28 rounded-full bg-[#EDE8F5]/80 blur-2xl"
              />

              <div className="relative flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#EDE8F5]">
                  <Sparkles size={17} className="text-[#7B68C8]" />
                </span>

                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-xs font-semibold text-[#7B68C8]">
                    Sedikit dorongan buat mulai
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#29282D]/75 sm:text-base">
                    “{promptText}”
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPromptBanner(false)}
                  aria-label="Tutup prompt"
                  className="rounded-lg p-2 text-[#29282D]/40 transition-colors hover:bg-[#EDE8F5] hover:text-[#29282D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8]"
                >
                  <X size={15} />
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Saved notes */}
        <motion.section
          initial={enter}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            ...transition,
            delay: shouldReduceMotion ? 0 : 0.12,
          }}
          aria-labelledby="saved-heading"
          className="space-y-4"
        >
          <div className="flex items-end justify-between gap-3">
            <div className="space-y-1">
              <h2
                id="saved-heading"
                className="text-lg font-semibold tracking-tight text-[#29282D]"
              >
                {savedEntries.length > 0
                  ? "Catatanmu"
                  : "Ruang ini masih kosong"}
              </h2>

              <p className="text-sm leading-relaxed text-[#29282D]/45">
                {savedEntries.length > 0
                  ? "Hal-hal yang sempat kamu keluarkan dari kepala."
                  : "Belum ada yang dicatat. Nggak masalah."}
              </p>
            </div>

            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#29282D]/[0.07] bg-white/60 px-3 py-1.5 text-xs text-[#29282D]/55">
              <FileText size={12} />
              {savedEntries.length} catatan
            </span>
          </div>

          {savedEntries.length > 0 ? (
            <div className="space-y-2">
              {savedEntries.map((entry, index) => (
                <motion.article
                  key={entry.id}
                  initial={
                    shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.25,
                    delay: shouldReduceMotion ? 0 : Math.min(index * 0.04, 0.2),
                  }}
                  className={`group rounded-2xl border p-4 transition-all duration-200 ${
                    editingId === entry.id
                      ? "border-[#B8A9D9]/50 bg-[#EDE8F5]/50"
                      : "border-[#29282D]/[0.06] bg-white/60 hover:border-[#29282D]/[0.10] hover:bg-white/90"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#EDE8F5]">
                      <FileText
                        size={17}
                        className="text-[#7B68C8]"
                        strokeWidth={1.8}
                      />
                    </span>

                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleLoadEntry(entry)}
                        aria-label={`Buka catatan ${entry.title || "Brain Dump"}`}
                        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-[#29282D]">
                            {entry.title?.trim() || "Brain Dump tanpa judul"}
                          </h3>

                          {editingId === entry.id && (
                            <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-[#7B68C8]">
                              Sedang dibuka
                            </span>
                          )}
                        </div>

                        <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[#29282D]/55">
                          {entry.content}
                        </p>
                      </button>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-[#29282D]/40">
                          <Clock3 size={12} />
                          {formatDateTime(entry.updatedAt)}
                        </span>

                        <button
                          type="button"
                          onClick={() => setShowDelete(entry.id)}
                          aria-label={`Hapus catatan ${entry.title || "Brain Dump"}`}
                          className="inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2 text-xs text-[#29282D]/40 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                        >
                          <Trash2 size={13} />
                          Hapus
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLoadEntry(entry)}
                      aria-label={`Edit catatan ${entry.title || "Brain Dump"}`}
                      className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#29282D]/30 transition-colors hover:bg-[#EDE8F5] hover:text-[#7B68C8] sm:flex"
                    >
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-[#29282D]/15 bg-white/30 px-5 py-9 text-center sm:py-11">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDE8F5]">
                <Feather
                  size={21}
                  className="text-[#7B68C8]"
                  strokeWidth={1.7}
                />
              </span>

              <h3 className="mt-4 text-base font-semibold tracking-tight text-[#29282D]">
                Ceritamu dimulai di sini.
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-[#29282D]/50">
                Tulis apa pun yang ada di kepala, tanpa perlu menunggu semuanya
                terasa beres.
              </p>

              <button
                type="button"
                onClick={() => textareaRef.current?.focus()}
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#EDE8F5] px-4 py-2.5 text-sm font-medium text-[#7562B3] transition-colors hover:bg-[#E3DBF1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8]"
              >
                <PenLine size={14} />
                Mulai menulis
              </button>
            </div>
          )}
        </motion.section>
      </div>

      {/* Footer: gunakan komponen yang sama dengan Home */}
      <div className="pt-8">
        <footer className="border-t border-[#29282D]/[0.07] py-6 text-center">
          <p className="text-xs leading-6 text-[#29282D]/40">
            Nggak semua pikiran harus diselesaikan hari ini.
            <br />
            Kadang, mengeluarkannya aja udah cukup untuk sekarang.
          </p>
        </footer>
      </div>

      {/* Delete dialog */}
      <AnimatePresence>
        {showDelete && activeDeleteEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#29282D]/35 px-4 pb-5 pt-10 backdrop-blur-sm sm:items-center sm:pb-4"
            onClick={() => setShowDelete(null)}
          >
            <motion.div
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 20, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 12, scale: 0.98 }
              }
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-title"
              aria-describedby="delete-description"
              className="w-full max-w-sm rounded-[28px] border border-white/60 bg-[#F9F7F2] p-6 shadow-[0_24px_80px_rgba(41,40,45,0.2)] sm:p-7"
              onClick={(event) => event.stopPropagation()}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <Trash2 size={20} />
              </span>

              <h3
                id="delete-title"
                className="mt-5 text-xl font-semibold tracking-tight text-[#29282D]"
              >
                Hapus catatan ini?
              </h3>

              <p
                id="delete-description"
                className="mt-3 text-sm leading-7 text-[#29282D]/60"
              >
                Catatan “
                {activeDeleteEntry.title?.trim() || "Brain Dump tanpa judul"}”
                akan dihapus permanen dari perangkatmu. Tindakan ini nggak bisa
                dibatalkan.
              </p>

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(showDelete)}
                  className="min-h-11 flex-1 rounded-xl bg-red-500 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
                >
                  Hapus catatan
                </button>

                <button
                  ref={cancelDeleteRef}
                  type="button"
                  onClick={() => setShowDelete(null)}
                  className="min-h-11 flex-1 rounded-xl border border-[#29282D]/10 bg-white px-3 py-2.5 text-sm font-medium text-[#29282D] transition-colors hover:bg-[#F4F0E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2"
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
