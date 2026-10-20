"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  History,
  Heart,
  Sparkles,
  RotateCcw,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  Activity,
  Feather,
} from "lucide-react";

import { saveMoodEntry, generateId } from "@/lib/storage";
import { MOOD_OPTIONS, MOOD_FACTORS, INTENSITY_LABELS } from "@/data/moods";
import MoodHistory from "./mood-history";
import type { MoodType } from "@/types/unload";

type Step = "select" | "intensity" | "factors" | "note" | "done";

const STEPS: { id: Step; label: string }[] = [
  { id: "select", label: "Mood" },
  { id: "intensity", label: "Intensitas" },
  { id: "factors", label: "Pemicu" },
  { id: "note", label: "Catatan" },
];

const STEP_INDEX: Record<Step, number> = {
  select: 0,
  intensity: 1,
  factors: 2,
  note: 3,
  done: 4,
};

export default function MoodPage() {
  const [step, setStep] = useState<Step>("select");
  const [mood, setMood] = useState<MoodType | null>(null);
  const [intensity, setIntensity] = useState(3);
  const [factors, setFactors] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Ref mencegah double-click sebelum React selesai memperbarui state.
  const savingRef = useRef(false);

  const shouldReduceMotion = useReducedMotion();
  const opt = MOOD_OPTIONS.find((item) => item.value === mood);
  const currentStep = STEP_INDEX[step];
  const progress =
    step === "done" ? 100 : ((currentStep + 1) / STEPS.length) * 100;

  const transition = {
    duration: shouldReduceMotion ? 0 : 0.25,
  };

  const back = () => {
    setSaveError(false);

    if (step === "intensity") setStep("select");
    else if (step === "factors") setStep("intensity");
    else if (step === "note") setStep("factors");
  };

  const doSave = () => {
    if (!mood || savingRef.current || saved) return;

    savingRef.current = true;
    setIsSaving(true);
    setSaveError(false);

    try {
      const ok = saveMoodEntry({
        id: generateId(),
        mood,
        intensity,
        factors,
        note: note.trim() || undefined,
        createdAt: new Date().toISOString(),
      });

      if (ok) {
        setSaved(true);
        setStep("done");
      } else {
        setSaveError(true);
      }
    } catch {
      setSaveError(true);
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const reset = () => {
    setStep("select");
    setMood(null);
    setIntensity(3);
    setFactors([]);
    setNote("");
    setSaved(false);
    setSaveError(false);
    setIsSaving(false);
    savingRef.current = false;
  };

  const toggleFactor = (factor: string) => {
    setFactors((previous) =>
      previous.includes(factor)
        ? previous.filter((item) => item !== factor)
        : [...previous, factor],
    );
  };

  if (showHistory) {
    return (
      <main className="relative mx-auto min-h-[70vh] w-full max-w-2xl overflow-hidden px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 top-0 -z-10 h-72 w-72 rounded-full bg-[#EDE8F5]/70 blur-3xl"
        />

        <button
          type="button"
          onClick={() => setShowHistory(false)}
          className="mb-7 inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[#29282D]/60 transition-colors hover:bg-white/70 hover:text-[#29282D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8]"
        >
          <ChevronLeft size={17} />
          Kembali ke check-in
        </button>

        <MoodHistory />
      </main>
    );
  }

  return (
    <main className="relative mx-auto w-full max-w-2xl overflow-hidden px-4 pb-12 pt-7 sm:px-6 sm:pt-10 lg:px-8">
      {/* Background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 top-0 -z-10 h-80 w-80 rounded-full bg-[#EDE8F5]/70 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-[480px] -z-10 h-64 w-64 rounded-full bg-[#E5EDE4]/50 blur-3xl"
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className="mb-8 space-y-5 sm:mb-10"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-[#B8A9D9]/30 bg-white/70 px-3 py-1.5 text-xs font-medium text-[#7B68C8] shadow-sm">
          <Sparkles size={13} />
          <span>A MOMENT FOR YOURSELF</span>
        </div>

        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-2xl space-y-3">
            <h1 className="text-4xl font-semibold tracking-[-0.045em] text-[#29282D] sm:text-5xl lg:text-6xl">
              Check in with <span className="text-[#7B68C8]">yourself.</span>
            </h1>

            <p className="max-w-xl text-sm leading-7 text-[#29282D]/60 sm:text-base sm:leading-8">
              Berhenti sebentar dari ramainya hari. Kenali apa yang kamu rasakan
              tanpa harus buru-buru memperbaiki semuanya.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-2xl border border-[#29282D]/[0.07] bg-white/75 px-4 py-3 text-sm font-medium text-[#29282D]/70 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white hover:text-[#29282D] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] md:self-end"
          >
            <History size={16} className="text-[#7B68C8]" />
            Lihat riwayat
            <ArrowUpRight size={14} className="text-[#29282D]/35" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDE8F5] px-3 py-1.5 text-xs text-[#7562B3]">
            <Heart size={12} />
            Kenali perasaanmu
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5EDE4] px-3 py-1.5 text-xs text-[#597453]">
            <ShieldCheck size={12} />
            Tanpa menghakimi diri
          </span>
        </div>
      </motion.header>

      {/* Progress */}
      {step !== "done" && (
        <motion.section
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.04 }}
          aria-label="Progres check-in"
          className="mb-6 rounded-[24px] border border-[#29282D]/[0.06] bg-white/65 p-4 sm:p-5"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-[#29282D]/45">
                LANGKAH {currentStep + 1} DARI {STEPS.length}
              </p>
              <p className="mt-1 text-sm font-semibold text-[#29282D]">
                {STEPS[currentStep]?.label}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDE8F5] text-[#7B68C8]">
              {step === "select" && <Heart size={18} />}
              {step === "intensity" && <Activity size={18} />}
              {step === "factors" && <Sparkles size={18} />}
              {step === "note" && <Feather size={18} />}
            </div>
          </div>

          <div
            className="h-2 overflow-hidden rounded-full bg-[#29282D]/[0.07]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <motion.div
              className="h-full rounded-full bg-[#7B68C8]"
              animate={{ width: `${progress}%` }}
              transition={transition}
            />
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {STEPS.map((item, index) => {
              const isCurrent = index === currentStep;
              const isComplete = index < currentStep;

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-1.5 text-[10px] sm:text-xs ${
                    isCurrent || isComplete
                      ? "font-medium text-[#7B68C8]"
                      : "text-[#29282D]/30"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                      isComplete
                        ? "bg-[#7B68C8] text-white"
                        : isCurrent
                          ? "bg-[#EDE8F5] text-[#7B68C8]"
                          : "bg-[#29282D]/[0.05] text-[#29282D]/40"
                    }`}
                  >
                    {isComplete ? <CheckCircle2 size={12} /> : index + 1}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Main card */}
      <div className="overflow-hidden rounded-[28px] border border-[#29282D]/[0.07] bg-[#FFFEFC]/90 shadow-[0_16px_50px_rgba(41,40,45,0.045)] backdrop-blur-sm">
        <AnimatePresence mode="wait" initial={false}>
          {/* STEP 1: SELECT MOOD */}
          {step === "select" && (
            <motion.section
              key="select"
              initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: shouldReduceMotion ? 0 : -14 }}
              transition={transition}
              className="space-y-6 p-5 sm:p-8"
            >
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#7B68C8]">
                  Pause for a moment
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-[#29282D] sm:text-3xl">
                  Lagi ngerasa apa?
                </h2>
                <p className="max-w-lg text-sm leading-7 text-[#29282D]/55">
                  Pilih yang paling mendekati perasaanmu sekarang. Nggak harus
                  cocok seratus persen, perasaan bukan soal pilihan ganda.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {MOOD_OPTIONS.map((item, index) => {
                  const isSelected = mood === item.value;

                  return (
                    <motion.button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setMood(item.value);
                        setSaveError(false);
                        setStep("intensity");
                      }}
                      aria-label={`Saya merasa ${item.label}`}
                      aria-pressed={isSelected}
                      initial={{
                        opacity: 0,
                        y: shouldReduceMotion ? 0 : 8,
                      }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        ...transition,
                        delay: shouldReduceMotion ? 0 : index * 0.035,
                      }}
                      style={{
                        backgroundColor: item.bgColor,
                      }}
                      className={`group relative flex min-h-[104px] items-center gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2 sm:min-h-[120px] sm:p-5 ${
                        isSelected
                          ? "border-[#7B68C8]/60 ring-2 ring-[#7B68C8]/20"
                          : "border-[#29282D]/[0.06] hover:border-[#B8A9D9]/60"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="absolute -right-5 -top-7 h-24 w-24 rounded-full bg-white/20 transition-transform duration-300 group-hover:scale-125"
                      />

                      <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/60 text-3xl shadow-sm transition-transform duration-200 group-hover:scale-105 sm:h-16 sm:w-16 sm:text-4xl">
                        {item.emoji}
                      </span>

                      <span className="relative min-w-0 flex-1">
                        <span className="block text-base font-semibold text-[#29282D]">
                          {item.label}
                        </span>
                        <span className="mt-1.5 block text-xs leading-relaxed text-[#29282D]/55">
                          {isSelected
                            ? "Mood yang kamu pilih"
                            : "Pilih mood ini"}
                        </span>
                      </span>

                      <span
                        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                          isSelected
                            ? "bg-[#7B68C8] text-white"
                            : "bg-white/55 text-[#29282D]/40 group-hover:bg-white/90 group-hover:text-[#7B68C8]"
                        }`}
                      >
                        {isSelected ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-[#E5EDE4]/55 p-4">
                <ShieldCheck
                  size={17}
                  className="mt-0.5 shrink-0 text-[#66805F]"
                />
                <p className="text-xs leading-6 text-[#29282D]/60">
                  Perasaan bisa berubah. Apa yang kamu rasakan sekarang tetap
                  layak untuk diperhatikan.
                </p>
              </div>
            </motion.section>
          )}

          {/* STEP 2: INTENSITY */}
          {step === "intensity" && opt && (
            <motion.section
              key="intensity"
              initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: shouldReduceMotion ? 0 : -14 }}
              transition={transition}
              className="space-y-6 p-5 sm:p-8"
            >
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#7B68C8]">
                  Step 02 / Intensity
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-[#29282D] sm:text-3xl">
                  Seberapa kuat rasanya?
                </h2>
                <p className="text-sm leading-7 text-[#29282D]/55">
                  Nggak perlu dianalisis terlalu jauh. Pilih angka yang paling
                  mendekati apa yang kamu rasakan.
                </p>
              </div>

              <div
                className="relative overflow-hidden rounded-[24px] border border-[#29282D]/[0.05] p-5 sm:p-6"
                style={{ backgroundColor: opt.bgColor }}
              >
                <div
                  aria-hidden="true"
                  className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/25 blur-xl"
                />
                <div className="relative flex items-center gap-4">
                  <span className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-[24px] bg-white/60 text-5xl shadow-sm">
                    {opt.emoji}
                  </span>

                  <div className="min-w-0">
                    <p className="text-xs text-[#29282D]/50">
                      Mood yang kamu pilih
                    </p>
                    <p className="mt-1 text-xl font-semibold text-[#29282D]">
                      {opt.label}
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep("select")}
                      className="mt-2 text-xs font-medium text-[#29282D]/60 underline underline-offset-4 transition-colors hover:text-[#29282D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8]"
                    >
                      Ganti mood
                    </button>
                  </div>

                  <div className="relative ml-auto hidden text-[#29282D]/20 sm:block">
                    <Heart size={34} strokeWidth={1.2} />
                  </div>
                </div>
              </div>

              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold text-[#29282D]">
                  Seberapa intens perasaan ini?
                </legend>

                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5].map((value) => {
                    const active = intensity === value;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setIntensity(value)}
                        aria-pressed={active}
                        aria-label={`Intensitas ${value} dari 5`}
                        className={`flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2 ${
                          active
                            ? "border-[#29282D] bg-[#29282D] text-[#F4F0E8] shadow-md"
                            : "border-[#29282D]/[0.08] bg-white/75 text-[#29282D]/60 hover:border-[#B8A9D9] hover:bg-[#EDE8F5]/40"
                        }`}
                      >
                        <span className="text-lg font-semibold">{value}</span>
                        <span
                          className={`h-1 w-1 rounded-full ${
                            active ? "bg-[#B8A9D9]" : "bg-[#29282D]/20"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-[#B8A9D9]/25 bg-[#EDE8F5]/55 p-4 text-center">
                  <p className="text-base font-semibold text-[#29282D]">
                    {INTENSITY_LABELS[intensity]}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#29282D]/50">
                    Skala ini subjektif. Nggak ada angka yang lebih baik atau
                    lebih buruk.
                  </p>
                </div>
              </fieldset>

              <div className="flex gap-3 border-t border-[#29282D]/[0.06] pt-5">
                <button
                  type="button"
                  onClick={back}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#29282D]/10 bg-white/60 px-4 text-sm font-medium text-[#29282D]/70 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8]"
                >
                  <ChevronLeft size={16} />
                  Kembali
                </button>

                <button
                  type="button"
                  onClick={() => setStep("factors")}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#29282D] px-4 text-sm font-medium text-[#F4F0E8] transition-all hover:bg-[#45424B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2"
                >
                  Lanjut
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.section>
          )}

          {/* STEP 3: FACTORS */}
          {step === "factors" && (
            <motion.section
              key="factors"
              initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: shouldReduceMotion ? 0 : -14 }}
              transition={transition}
              className="space-y-6 p-5 sm:p-8"
            >
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#7B68C8]">
                  Step 03 / Reflection
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-[#29282D] sm:text-3xl">
                  Apa yang memengaruhimu?
                </h2>
                <p className="text-sm leading-7 text-[#29282D]/55">
                  Kadang kita tahu penyebabnya, kadang nggak. Pilih hal yang
                  terasa relevan. Kamu boleh memilih lebih dari satu.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {MOOD_FACTORS.map((factor) => {
                  const selected = factors.includes(factor);

                  return (
                    <button
                      key={factor}
                      type="button"
                      onClick={() => toggleFactor(factor)}
                      aria-pressed={selected}
                      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] ${
                        selected
                          ? "border-[#B8A9D9] bg-[#EDE8F5] font-medium text-[#66549F] shadow-sm"
                          : "border-[#29282D]/[0.09] bg-white/75 text-[#29282D]/65 hover:border-[#B8A9D9]/70 hover:bg-[#EDE8F5]/40"
                      }`}
                    >
                      {selected && <CheckCircle2 size={15} />}
                      {factor}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-dashed border-[#B8A9D9]/50 bg-[#EDE8F5]/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 text-[#7B68C8]">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#29282D]">
                      {factors.length > 0
                        ? `${factors.length} hal dipilih`
                        : "Nggak harus punya jawabannya"}
                    </p>
                    <p className="mt-1 text-xs leading-6 text-[#29282D]/55">
                      {factors.length > 0
                        ? "Kamu nggak harus mencari alasan untuk semua yang kamu rasakan."
                        : "Kalau belum tahu apa penyebabnya, kamu bisa melewati bagian ini."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 border-t border-[#29282D]/[0.06] pt-5">
                <button
                  type="button"
                  onClick={back}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#29282D]/10 bg-white/60 px-4 text-sm font-medium text-[#29282D]/70 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8]"
                >
                  <ChevronLeft size={16} />
                  Kembali
                </button>

                <button
                  type="button"
                  onClick={() => setStep("note")}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#29282D] px-4 text-sm font-medium text-[#F4F0E8] transition-colors hover:bg-[#45424B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2"
                >
                  Lanjut
                  <ChevronRight size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep("note")}
                className="w-full rounded-lg py-2 text-xs text-[#29282D]/40 underline underline-offset-4 transition-colors hover:text-[#29282D]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8]"
              >
                Lewati bagian ini
              </button>
            </motion.section>
          )}

          {/* STEP 4: NOTE */}
          {step === "note" && (
            <motion.section
              key="note"
              initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: shouldReduceMotion ? 0 : -14 }}
              transition={transition}
              className="space-y-6 p-5 sm:p-8"
            >
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#7B68C8]">
                  Step 04 / Your thoughts
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-[#29282D] sm:text-3xl">
                  Ada yang ingin kamu ceritakan?
                </h2>
                <p className="text-sm leading-7 text-[#29282D]/55">
                  Kamu boleh menulis sedikit tentang harimu, atau menyimpan
                  check-in ini tanpa menambahkan apa pun.
                </p>
              </div>

              {opt && (
                <div
                  className="flex items-center gap-3 rounded-2xl p-4"
                  style={{ backgroundColor: opt.bgColor }}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/65 text-3xl">
                    {opt.emoji}
                  </span>
                  <div>
                    <p className="text-xs text-[#29282D]/50">Check-in kamu</p>
                    <p className="mt-1 font-semibold text-[#29282D]">
                      {opt.label} · Intensitas {intensity}/5
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="mood-note"
                  className="text-sm font-medium text-[#29282D]/75"
                >
                  Catatan pribadi{" "}
                  <span className="font-normal text-[#29282D]/35">
                    (opsional)
                  </span>
                </label>

                <textarea
                  id="mood-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={7}
                  placeholder="Hari ini aku merasa...&#10;&#10;Hal yang paling memenuhi pikiranku adalah..."
                  className="w-full resize-y rounded-2xl border border-[#29282D]/10 bg-white/75 p-4 text-sm leading-7 text-[#29282D] outline-none placeholder:text-[#29282D]/30 transition-all focus:border-[#B8A9D9] focus:bg-white focus:ring-4 focus:ring-[#B8A9D9]/15 sm:p-5"
                />

                <div className="flex items-center justify-between gap-3 text-xs text-[#29282D]/35">
                  <span>Tulis sebanyak atau sesedikit yang kamu mau.</span>
                  <span className="shrink-0">
                    {note.length.toLocaleString("id-ID")} karakter
                  </span>
                </div>
              </div>

              {saveError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p className="leading-6">
                    Check-in belum berhasil disimpan. Coba lagi. Catatan ini
                    belum dikonfirmasi tersimpan.
                  </p>
                </div>
              )}

              <div className="flex gap-3 border-t border-[#29282D]/[0.06] pt-5">
                <button
                  type="button"
                  onClick={back}
                  disabled={isSaving}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#29282D]/10 bg-white/60 px-4 text-sm font-medium text-[#29282D]/70 transition-colors hover:bg-white disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8]"
                >
                  <ChevronLeft size={16} />
                  Kembali
                </button>

                <button
                  type="button"
                  onClick={doSave}
                  disabled={isSaving || saved}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#29282D] px-4 text-sm font-medium text-[#F4F0E8] transition-all hover:bg-[#45424B] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2"
                >
                  {isSaving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      Simpan check-in
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-xs leading-relaxed text-[#29282D]/35">
                Kamu nggak harus punya semua jawabannya sekarang.
              </p>
            </motion.section>
          )}

          {/* DONE */}
          {step === "done" && saved && opt && (
            <motion.section
              key="done"
              initial={{
                opacity: 0,
                scale: shouldReduceMotion ? 1 : 0.98,
              }}
              animate={{ opacity: 1, scale: 1 }}
              transition={transition}
              className="space-y-7 px-5 py-10 text-center sm:px-8 sm:py-14"
              aria-live="polite"
            >
              <div
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] text-5xl shadow-sm"
                style={{ backgroundColor: opt.bgColor }}
              >
                {opt.emoji}
              </div>

              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#E5EDE4] px-3 py-1.5 text-xs font-medium text-[#587650]">
                  <CheckCircle2 size={14} />
                  Check-in berhasil disimpan
                </div>

                <h2 className="text-2xl font-semibold tracking-tight text-[#29282D] sm:text-3xl">
                  Makasih udah meluangkan waktu.
                </h2>

                <p className="mx-auto max-w-md text-sm leading-7 text-[#29282D]/55">
                  Hari ini kamu merasa{" "}
                  <span className="font-semibold text-[#29282D]">
                    {opt.label.toLowerCase()}
                  </span>
                  . Kamu nggak harus langsung mengubah perasaan itu.
                  Mengenalinya dulu juga berarti.
                </p>
              </div>

              <div className="mx-auto max-w-md rounded-[24px] border border-[#B8A9D9]/25 bg-[#EDE8F5]/45 p-5 sm:p-6">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-[#7B68C8]">
                  <Sparkles size={18} />
                </div>
                <p className="mt-3 text-sm leading-7 text-[#29282D]/70">
                  {intensity >= 4
                    ? "Rasanya lagi cukup kuat, ya. Coba beri dirimu sedikit ruang. Kamu nggak harus membereskan semuanya sekaligus."
                    : intensity <= 2
                      ? "Perasaanmu tetap layak diperhatikan, sekecil atau setenang apa pun rasanya."
                      : "Nggak perlu buru-buru menyimpulkan apa pun dari satu momen ini. Cukup catat, kenali, lalu lanjutkan harimu pelan-pelan."}
                </p>
              </div>

              {factors.length > 0 && (
                <div className="mx-auto max-w-md">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#29282D]/40">
                    Hal yang kamu catat
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {factors.map((factor) => (
                      <span
                        key={factor}
                        className="rounded-full border border-[#29282D]/[0.07] bg-white/80 px-3 py-1.5 text-xs text-[#29282D]/65"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col justify-center gap-3 border-t border-[#29282D]/[0.06] pt-6 sm:flex-row">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#29282D] px-5 text-sm font-medium text-[#F4F0E8] transition-all hover:-translate-y-0.5 hover:bg-[#45424B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2"
                >
                  <RotateCcw size={15} />
                  Check-in lagi
                </button>

                <button
                  type="button"
                  onClick={() => setShowHistory(true)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#29282D]/10 bg-white/70 px-5 text-sm font-medium text-[#29282D]/70 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8]"
                >
                  <History size={15} />
                  Lihat riwayat
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Footer: sengaja dipertahankan persis seperti versi sebelumnya */}
      <footer className="border-t border-[#29282D]/[0.06] pt-5 text-center">
        <p className="text-xs leading-relaxed text-[#29282D]/40">
          Nggak harus selalu produktif, positif, atau baik-baik aja.
          <br />
          Kamu boleh merasakan apa yang kamu rasakan.
        </p>
      </footer>
    </main>
  );
}
