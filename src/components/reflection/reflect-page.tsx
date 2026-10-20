"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { saveReflection, generateId } from "@/lib/storage";
import type { ReflectionEntry } from "@/types/unload";

const STEPS = [
  {
    key: "whatHappened",
    label: "Apa yang terjadi?",
    hint: "Coba pisahkan kejadian yang benar-benar terjadi dari interpretasimu.",
    placeholder:
      "Ceritakan situasinya dengan versimu sendiri. Apa yang terjadi?",
    emoji: "📝",
    helper: "Fokus ke kejadian, bukan kesimpulan.",
  },
  {
    key: "whatFelt",
    label: "Apa yang kamu rasakan?",
    hint: "Nggak perlu mencari emosi yang paling benar. Sebutkan yang terasa.",
    placeholder:
      "Aku merasa ... karena ... / Rasanya sulit dijelaskan, tapi ...",
    emoji: "🌿",
    helper: "Semua emosi boleh hadir di sini.",
  },
  {
    key: "assumptions",
    label: "Apa yang sedang kamu asumsikan?",
    hint: "Pikiran kita kadang mengisi bagian yang belum kita ketahui.",
    placeholder: "Aku berpikir bahwa ... / Mungkin aku menganggap ...",
    emoji: "💭",
    helper: "Pikiran belum tentu sama dengan fakta.",
  },
  {
    key: "whatCanControl",
    label: "Apa yang masih bisa kamu kendalikan?",
    hint: "Cari satu hal kecil yang realistis, kalau memang ada.",
    placeholder:
      "Hal kecil yang bisa kulakukan adalah ... / Untuk sekarang, aku bisa ...",
    emoji: "🌱",
    helper: "Kamu nggak harus menyelesaikan semuanya sekarang.",
  },
] as const;

type FieldKey = (typeof STEPS)[number]["key"];

type ReflectionData = Record<FieldKey, string>;

const INITIAL_DATA: ReflectionData = {
  whatHappened: "",
  whatFelt: "",
  assumptions: "",
  whatCanControl: "",
};

export default function ReflectPage() {
  const shouldReduceMotion = useReducedMotion();

  const [step, setStep] = useState(0);
  const [data, setData] = useState<ReflectionData>({ ...INITIAL_DATA });
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;
  const answeredCount = STEPS.filter(
    (item) => data[item.key].trim().length > 0,
  ).length;

  const transition = {
    duration: shouldReduceMotion ? 0 : 0.22,
  };

  const handleNext = () => {
    setError("");

    if (isLast) {
      handleSave();
      return;
    }

    setStep((previous) => Math.min(previous + 1, STEPS.length - 1));
  };

  const handleSave = () => {
    const hasContent = Object.values(data).some(
      (value) => value.trim().length > 0,
    );

    if (!hasContent) {
      setError("Isi setidaknya satu bagian sebelum menyimpan refleksi.");
      return;
    }

    const now = new Date().toISOString();

    const entry: ReflectionEntry = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const ok = saveReflection(entry);

    if (ok) {
      setError("");
      setDone(true);
    } else {
      setError("Refleksimu belum berhasil disimpan. Coba lagi sebentar, ya.");
    }
  };

  const handleReset = () => {
    setStep(0);
    setData({ ...INITIAL_DATA });
    setDone(false);
    setError("");
  };

  const enterAnimation = {
    initial: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition,
  };

  if (done) {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-4 pb-8 pt-6 sm:px-6">
        <motion.section
          {...enterAnimation}
          aria-labelledby="reflection-done-heading"
          className="relative overflow-hidden rounded-[28px] border border-[#29282D]/[0.06] bg-white/45 px-5 py-8 sm:px-8 sm:py-10"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full bg-[#EDE8F5]/80 blur-3xl"
          />

          <div className="relative space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#E5EDE4]">
              <CheckCircle2
                size={32}
                className="text-[#5E8B5A]"
                strokeWidth={1.7}
              />
            </div>

            <div className="space-y-3 text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#29282D]/[0.07] bg-white/70 px-3 py-1.5">
                <Sparkles size={13} className="text-[#7B68C8]" />
                <span className="text-xs font-medium text-[#29282D]/60">
                  Satu langkah kecil
                </span>
              </div>

              <h1
                id="reflection-done-heading"
                className="text-2xl font-semibold tracking-tight text-[#29282D] sm:text-3xl"
              >
                Kamu sudah meluangkan waktu untuk dirimu.
              </h1>

              <p className="mx-auto max-w-md text-sm leading-7 text-[#29282D]/55">
                Nggak semua hal harus langsung terselesaikan. Tapi kamu sudah
                memberi ruang untuk melihatnya dengan lebih jernih. Itu berarti.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-[#29282D]/[0.06] bg-white/65 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-[#29282D]">
                  Refleksimu
                </h2>
                <span className="text-xs text-[#29282D]/40">
                  {answeredCount} dari {STEPS.length} bagian
                </span>
              </div>

              {STEPS.map((item) => (
                <div
                  key={item.key}
                  className="space-y-1 border-t border-[#29282D]/[0.06] pt-3 first:border-0 first:pt-0"
                >
                  <p className="text-xs font-medium text-[#29282D]/45">
                    {item.label}
                  </p>
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#29282D]">
                    {data[item.key].trim() || "Bagian ini kamu lewati."}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#29282D] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#403D46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2"
              >
                <RotateCcw size={15} />
                Refleksi baru
              </button>

              <Link
                href="/"
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#29282D]/[0.08] bg-white/70 px-4 py-3 text-sm font-medium text-[#29282D]/65 transition-colors hover:bg-white hover:text-[#29282D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2"
              >
                Kembali ke Home
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-4 pb-8 pt-6 sm:px-6">
      <div className="flex-1 space-y-7">
        {/* Hero */}
        <motion.section
          {...enterAnimation}
          aria-labelledby="reflect-heading"
          className="relative overflow-hidden rounded-[28px] border border-[#29282D]/[0.06] bg-white/45 px-5 py-7 sm:px-7 sm:py-8"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full bg-[#EDE8F5]/80 blur-3xl"
          />

          <div className="relative space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#29282D]/[0.07] bg-white/70 px-3 py-1.5">
              <Eye size={13} className="text-[#7B68C8]" strokeWidth={1.8} />
              <span className="text-xs font-medium text-[#29282D]/60">
                Perspective Shift
              </span>
            </div>

            <div className="space-y-3">
              <h1
                id="reflect-heading"
                className="max-w-lg text-3xl font-semibold leading-[1.15] tracking-tight text-[#29282D] sm:text-4xl"
              >
                Coba lihat dari{" "}
                <span className="text-[#7B68C8]">sisi yang berbeda.</span>
              </h1>

              <p className="max-w-md text-sm leading-7 text-[#29282D]/60 sm:text-base">
                Urai satu situasi secara perlahan. Kamu nggak perlu menghakimi
                diri sendiri atau buru-buru menemukan solusi.
              </p>
            </div>

            <div className="flex items-start gap-2 text-xs leading-relaxed text-[#29282D]/45">
              <Heart size={14} className="mt-0.5 shrink-0 text-[#C47D8C]" />
              Kamu boleh berhenti kapan saja. Lewati bagian yang belum ingin
              kamu jawab.
            </div>
          </div>
        </motion.section>

        {/* Progress */}
        <section aria-label="Progres refleksi" className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#29282D]">
                Langkah {step + 1} dari {STEPS.length}
              </p>
              <p className="text-xs text-[#29282D]/45">
                {answeredCount} bagian sudah terisi
              </p>
            </div>

            <span className="rounded-full bg-[#EDE8F5] px-3 py-1.5 text-xs font-medium text-[#7B68C8]">
              {Math.round(((step + 1) / STEPS.length) * 100)}%
            </span>
          </div>

          <div
            className="flex gap-1.5"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={STEPS.length}
            aria-valuenow={step + 1}
            aria-label={`Langkah ${step + 1} dari ${STEPS.length}`}
          >
            {STEPS.map((item, index) => (
              <div
                key={item.key}
                className={`h-1.5 flex-1 overflow-hidden rounded-full transition-colors duration-300 ${
                  index <= step ? "bg-[#7B68C8]" : "bg-[#29282D]/[0.08]"
                }`}
              />
            ))}
          </div>
        </section>

        {/* Form step */}
        <AnimatePresence mode="wait">
          <motion.section
            key={step}
            initial={
              shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 12 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
            transition={transition}
            aria-labelledby={`step-heading-${step}`}
            className="rounded-[28px] border border-[#29282D]/[0.06] bg-white/65 p-5 sm:p-7"
          >
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EDE8F5] text-xl"
                >
                  {current.emoji}
                </span>

                <div className="min-w-0 flex-1 space-y-2">
                  <h2
                    id={`step-heading-${step}`}
                    className="text-lg font-semibold tracking-tight text-[#29282D] sm:text-xl"
                  >
                    {current.label}
                  </h2>
                  <p className="text-sm leading-6 text-[#29282D]/55">
                    {current.hint}
                  </p>
                </div>
              </div>

              <textarea
                id={`reflection-field-${current.key}`}
                value={data[current.key]}
                onChange={(event) => {
                  setData((previous) => ({
                    ...previous,
                    [current.key]: event.target.value,
                  }));
                  setError("");
                }}
                rows={7}
                placeholder={current.placeholder}
                aria-label={current.label}
                aria-describedby={`helper-${current.key}`}
                className="w-full resize-y rounded-2xl border border-[#29282D]/[0.08] bg-white/70 p-4 text-sm leading-7 text-[#29282D] outline-none transition-all placeholder:text-[#29282D]/30 focus:border-[#7B68C8]/50 focus:bg-white focus:ring-4 focus:ring-[#7B68C8]/[0.07] sm:p-5"
              />

              <div className="flex items-start gap-2">
                <Sparkles
                  size={14}
                  className="mt-0.5 shrink-0 text-[#7B68C8]"
                />
                <p
                  id={`helper-${current.key}`}
                  className="text-xs leading-relaxed text-[#29282D]/40"
                >
                  {current.helper}
                </p>
              </div>
            </div>
          </motion.section>
        </AnimatePresence>

        {/* Save error */}
        <AnimatePresence>
          {error && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-2">
          {step > 0 && (
            <button
              type="button"
              onClick={() => {
                setError("");
                setStep((previous) => Math.max(previous - 1, 0));
              }}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#29282D]/[0.08] bg-white/60 px-4 py-3 text-sm font-medium text-[#29282D]/65 transition-colors hover:bg-white hover:text-[#29282D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2"
            >
              <ChevronLeft size={16} />
              Kembali
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="group inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#29282D] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-[#403D46] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2"
          >
            {isLast ? (
              <>
                <Check size={16} />
                Simpan refleksi
              </>
            ) : (
              <>
                Lanjut
                <ChevronRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </>
            )}
          </button>
        </div>

        <p className="flex items-center justify-center gap-2 text-center text-xs leading-relaxed text-[#29282D]/35">
          <Heart size={12} />
          Boleh dilewati kalau belum tahu jawabannya. Itu juga valid.
        </p>
      </div>
    </div>
  );
}
