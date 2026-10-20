"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Wind,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  Leaf,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import {
  BREATHING_EXERCISES,
  GROUNDING_EXERCISES,
  PAUSE_DURATIONS,
} from "@/data/exercises";

type Mode = "home" | "breathing" | "grounding" | "timer";

const COLORS = {
  text: "#29282D",
  purple: "#7B68C8",
  purpleSoft: "#EDE8F5",
  green: "#E5EDE4",
  greenStrong: "#A9B9A5",
  background: "#F8F6F1",
};

const cardClass =
  "rounded-[24px] border border-[#29282D]/[0.07] bg-white/70 shadow-[0_4px_24px_rgba(41,40,45,0.025)]";

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-[#29282D] px-5 py-3 text-sm font-medium text-[#F8F6F1] transition-colors hover:bg-[#45434B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-[#29282D]/10 bg-white/70 px-5 py-3 text-sm font-medium text-[#29282D]/75 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8] focus-visible:ring-offset-2";

const sectionLabelClass =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-[#29282D]/40";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

export default function PausePage() {
  const shouldReduceMotion = useReducedMotion();

  const [mode, setMode] = useState<Mode>("home");

  const [breathIdx, setBreathIdx] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [breathDone, setBreathDone] = useState(false);

  const [groundIdx, setGroundIdx] = useState(0);
  const [groundStep, setGroundStep] = useState(0);

  const [timerDur, setTimerDur] = useState(180);
  const [timerLeft, setTimerLeft] = useState(180);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);

  const breathEx = BREATHING_EXERCISES[breathIdx]!;
  const groundEx = GROUNDING_EXERCISES[groundIdx]!;
  const phase = breathEx.phases[phaseIdx]!;
  const groundStepData = groundEx.steps[groundStep];

  // Jalankan fase napas yang sedang aktif.
  // Setiap pergantian fase membersihkan interval sebelumnya.
  useEffect(() => {
    if (mode !== "breathing" || breathDone) return;

    const durationMs = Math.max(phase.duration * 1000, 100);
    const startedAt = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(elapsed / durationMs, 1);

      setPhaseProgress(progress);

      if (progress < 1) return;

      setPhaseProgress(0);

      const nextPhase = (phaseIdx + 1) % breathEx.phases.length;

      if (nextPhase === 0) {
        const nextCycleCount = cycleCount + 1;
        setCycleCount(nextCycleCount);

        if (nextCycleCount >= breathEx.totalCycles) {
          setBreathDone(true);
          return;
        }
      }

      setPhaseIdx(nextPhase);
    }, 50);

    return () => clearInterval(interval);
  }, [
    mode,
    breathDone,
    phase.duration,
    phaseIdx,
    breathEx.phases.length,
    breathEx.totalCycles,
    cycleCount,
  ]);

  // Timer menggunakan timestamp agar tidak terlalu bergantung
  // pada ketepatan interval browser.
  useEffect(() => {
    if (mode !== "timer" || !timerRunning || timerDone) return;

    const endAt = Date.now() + timerLeft * 1000;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));

      setTimerLeft(remaining);

      if (remaining <= 0) {
        setTimerRunning(false);
        setTimerDone(true);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [mode, timerRunning, timerDone, timerLeft]);

  const stopAll = () => {
    setMode("home");

    setPhaseIdx(0);
    setCycleCount(0);
    setPhaseProgress(0);
    setBreathDone(false);

    setGroundStep(0);

    setTimerRunning(false);
    setTimerDone(false);
    setTimerLeft(timerDur);
  };

  const startBreathing = (index: number) => {
    setBreathIdx(index);
    setPhaseIdx(0);
    setCycleCount(0);
    setPhaseProgress(0);
    setBreathDone(false);
    setMode("breathing");
  };

  const startGrounding = (index: number) => {
    setGroundIdx(index);
    setGroundStep(0);
    setMode("grounding");
  };

  const startTimer = (duration: number) => {
    setTimerDur(duration);
    setTimerLeft(duration);
    setTimerRunning(false);
    setTimerDone(false);
    setMode("timer");
  };

  const resetTimer = () => {
    setTimerLeft(timerDur);
    setTimerRunning(false);
    setTimerDone(false);
  };

  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: pageTransition.initial,
        animate: pageTransition.animate,
        exit: pageTransition.exit,
        transition: { duration: 0.25 },
      };

  return (
    <main className="mx-auto max-w-2xl space-y-7 px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-[#29282D]/40">
          <Wind size={15} />
          <span>UNLOAD / PAUSE MODE</span>
        </div>

        {mode !== "home" && (
          <button
            type="button"
            onClick={stopAll}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-[#29282D]/50 transition-colors hover:bg-white/70 hover:text-[#29282D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8]"
            aria-label="Keluar dari latihan dan kembali ke halaman utama Pause Mode"
          >
            <X size={15} />
            Keluar
          </button>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {/* HOME */}
        {mode === "home" && (
          <motion.section key="home" {...motionProps} className="space-y-8">
            <header className="space-y-3 pt-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#EDE8F5] px-3 py-1.5 text-xs font-medium text-[#7B68C8]">
                <Sparkles size={13} />
                Ruang buat bernapas
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-[#29282D] sm:text-4xl">
                Pause Mode
              </h1>

              <p className="max-w-md text-sm leading-6 text-[#29282D]/55 sm:text-base">
                Kamu nggak harus menyelesaikan semuanya hari ini. Berhenti
                sebentar juga bagian dari perjalanan.
              </p>
            </header>

            {/* Intro card */}
            <div className={`${cardClass} overflow-hidden`}>
              <div className="flex items-start gap-4 p-5 sm:p-6">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#EDE8F5] text-[#7B68C8]">
                  <Wind size={23} strokeWidth={1.7} />
                </div>

                <div className="space-y-1.5">
                  <h2 className="font-semibold text-[#29282D]">
                    Nggak perlu buru-buru.
                  </h2>
                  <p className="text-sm leading-6 text-[#29282D]/55">
                    Pilih satu hal kecil untuk dirimu sekarang. Nggak perlu
                    sempurna, nggak perlu punya alasan.
                  </p>
                </div>
              </div>

              <div className="h-1 bg-gradient-to-r from-[#EDE8F5] via-[#B8A9D9] to-[#E5EDE4]" />
            </div>

            {/* Breathing */}
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className={sectionLabelClass}>01 / Latihan pernapasan</h2>
                <Wind size={15} className="text-[#7B68C8]/60" />
              </div>

              <div className="grid gap-3">
                {BREATHING_EXERCISES.map((exercise, index) => (
                  <motion.button
                    key={exercise.id}
                    type="button"
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                    onClick={() => startBreathing(index)}
                    className={`${cardClass} group w-full p-4 text-left transition-colors hover:border-[#B8A9D9]/50 hover:bg-white sm:p-5`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#EDE8F5] text-[#7B68C8] transition-colors group-hover:bg-[#E4DDF3]">
                        <Wind size={20} strokeWidth={1.7} />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="font-medium text-[#29282D]">
                          {exercise.name}
                        </p>
                        <p className="text-sm leading-5 text-[#29282D]/50">
                          {exercise.description}
                        </p>
                      </div>

                      <ChevronRight
                        size={18}
                        className="shrink-0 text-[#29282D]/25 transition-transform group-hover:translate-x-0.5 group-hover:text-[#7B68C8]"
                      />
                    </div>
                  </motion.button>
                ))}
              </div>
            </section>

            {/* Grounding */}
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className={sectionLabelClass}>02 / Grounding</h2>
                <Leaf size={15} className="text-[#82967D]/70" />
              </div>

              <div className="grid gap-3">
                {GROUNDING_EXERCISES.map((exercise, index) => (
                  <motion.button
                    key={exercise.id}
                    type="button"
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                    onClick={() => startGrounding(index)}
                    className={`${cardClass} group w-full p-4 text-left transition-colors hover:border-[#A9B9A5]/60 hover:bg-white sm:p-5`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#E5EDE4] text-[#71856C]">
                        <Leaf size={20} strokeWidth={1.7} />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="font-medium text-[#29282D]">
                          {exercise.name}
                        </p>
                        <p className="text-sm leading-5 text-[#29282D]/50">
                          {exercise.description}
                        </p>
                      </div>

                      <ChevronRight
                        size={18}
                        className="shrink-0 text-[#29282D]/25 transition-transform group-hover:translate-x-0.5 group-hover:text-[#71856C]"
                      />
                    </div>
                  </motion.button>
                ))}
              </div>
            </section>

            {/* Timer */}
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className={sectionLabelClass}>03 / Timer jeda</h2>
                <Clock3 size={15} className="text-[#29282D]/40" />
              </div>

              <div className={`${cardClass} p-4 sm:p-5`}>
                <p className="mb-4 text-sm leading-5 text-[#29282D]/55">
                  Kosongkan waktu sebentar. Kamu boleh nggak produktif selama
                  beberapa menit.
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {PAUSE_DURATIONS.map((duration) => (
                    <button
                      key={duration.value}
                      type="button"
                      onClick={() => startTimer(duration.value)}
                      className="rounded-2xl border border-[#29282D]/[0.07] bg-white/70 px-2 py-3 text-sm font-medium text-[#29282D]/70 transition-colors hover:border-[#B8A9D9]/60 hover:bg-[#EDE8F5]/60 hover:text-[#29282D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B68C8]"
                    >
                      {duration.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <p className="pb-2 text-center text-xs leading-5 text-[#29282D]/35">
              Pelan-pelan juga tetap bergerak.
            </p>
          </motion.section>
        )}

        {/* BREATHING */}
        {mode === "breathing" && (
          <motion.section
            key="breathing"
            {...motionProps}
            className="space-y-7"
          >
            {breathDone ? (
              <div className={`${cardClass} space-y-5 p-6 text-center sm:p-9`}>
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#EDE8F5] text-[#7B68C8]">
                  <CheckCircle2 size={30} strokeWidth={1.6} />
                </div>

                <div className="space-y-2">
                  <p className={sectionLabelClass}>Latihan selesai</p>
                  <h1 className="text-2xl font-semibold tracking-tight text-[#29282D]">
                    Kamu sudah meluangkan waktu.
                  </h1>
                  <p className="mx-auto max-w-sm text-sm leading-6 text-[#29282D]/55">
                    Nggak harus langsung merasa berbeda. Kamu sudah memberi
                    dirimu kesempatan untuk berhenti sejenak.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F8F6F1] p-4">
                  <p className="text-sm font-medium text-[#29282D]">
                    {breathEx.name}
                  </p>
                  <p className="mt-1 text-xs text-[#29282D]/45">
                    {cycleCount} siklus selesai
                  </p>
                </div>

                <button type="button" onClick={stopAll} className={buttonClass}>
                  Kembali ke Pause Mode
                </button>
              </div>
            ) : (
              <>
                <header className="space-y-2 text-center">
                  <p className={sectionLabelClass}>LATIHAN PERNAPASAN</p>
                  <h1 className="text-2xl font-semibold tracking-tight text-[#29282D]">
                    {breathEx.name}
                  </h1>
                  <p className="text-sm text-[#29282D]/50">
                    Siklus {cycleCount + 1} dari {breathEx.totalCycles}
                  </p>
                </header>

                <div className={`${cardClass} px-4 py-8 sm:px-8 sm:py-10`}>
                  {/* Cycle progress */}
                  <div
                    className="mb-8 flex gap-1.5"
                    aria-label={`${cycleCount} dari ${breathEx.totalCycles} siklus selesai`}
                  >
                    {Array.from(
                      { length: breathEx.totalCycles },
                      (_, index) => (
                        <div
                          key={index}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            index < cycleCount
                              ? "bg-[#7B68C8]"
                              : "bg-[#29282D]/[0.08]"
                          }`}
                        />
                      ),
                    )}
                  </div>

                  {/* Breathing circle */}
                  <div className="relative mx-auto aspect-square w-full max-w-[260px]">
                    <svg
                      className="absolute inset-0 size-full -rotate-90"
                      viewBox="0 0 200 200"
                      role="img"
                      aria-label={`Progress fase ${phase.label}`}
                    >
                      <circle
                        cx="100"
                        cy="100"
                        r="87"
                        fill="none"
                        stroke="#EDE8F5"
                        strokeWidth="2"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="87"
                        fill="none"
                        stroke="#7B68C8"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 87}
                        strokeDashoffset={
                          2 * Math.PI * 87 * (1 - phaseProgress)
                        }
                        style={{
                          transition: shouldReduceMotion
                            ? "none"
                            : "stroke-dashoffset 100ms linear",
                        }}
                      />
                    </svg>

                    <motion.div
                      className="absolute inset-[14%] flex flex-col items-center justify-center rounded-full bg-[#EDE8F5]/65 px-4 text-center"
                      animate={
                        shouldReduceMotion
                          ? undefined
                          : {
                              scale:
                                phase.label.toLowerCase().includes("tarik") ||
                                phase.instruction
                                  .toLowerCase()
                                  .includes("tarik")
                                  ? [0.92, 1]
                                  : phase.label
                                        .toLowerCase()
                                        .includes("hembus") ||
                                      phase.instruction
                                        .toLowerCase()
                                        .includes("hembus")
                                    ? [1, 0.92]
                                    : [0.96, 0.96],
                            }
                      }
                      transition={{
                        duration: phase.duration,
                        ease: "easeInOut",
                      }}
                    >
                      <p className="text-xs font-medium text-[#7B68C8]/75">
                        {phase.label}
                      </p>
                      <p
                        aria-live="polite"
                        className="mt-2 text-lg font-semibold leading-snug text-[#29282D] sm:text-xl"
                      >
                        {phase.instruction}
                      </p>
                    </motion.div>
                  </div>

                  <p className="mt-7 text-center text-xs leading-5 text-[#29282D]/40">
                    Ikuti ritmenya. Kalau terasa nggak nyaman, kembali bernapas
                    seperti biasa.
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={stopAll}
                    className={secondaryButtonClass}
                  >
                    <X size={15} />
                    Akhiri latihan
                  </button>
                </div>
              </>
            )}
          </motion.section>
        )}

        {/* GROUNDING */}
        {mode === "grounding" && (
          <motion.section
            key="grounding"
            {...motionProps}
            className="space-y-6"
          >
            {!groundStepData ? (
              <div className={`${cardClass} space-y-5 p-6 text-center sm:p-9`}>
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#E5EDE4] text-[#71856C]">
                  <CheckCircle2 size={30} strokeWidth={1.6} />
                </div>

                <div className="space-y-2">
                  <p className={sectionLabelClass}>Grounding selesai</p>
                  <h1 className="text-2xl font-semibold text-[#29282D]">
                    Kembali ke saat ini.
                  </h1>
                  <p className="text-sm leading-6 text-[#29282D]/55">
                    Kamu nggak perlu memaksa diri merasa tenang. Cukup sadari
                    apa yang ada di sekitarmu sekarang.
                  </p>
                </div>

                <button type="button" onClick={stopAll} className={buttonClass}>
                  Kembali ke Pause Mode
                </button>
              </div>
            ) : (
              <>
                <header className="space-y-2">
                  <p className={sectionLabelClass}>LATIHAN GROUNDING</p>
                  <h1 className="text-2xl font-semibold tracking-tight text-[#29282D]">
                    {groundEx.name}
                  </h1>
                  <p className="text-sm leading-5 text-[#29282D]/50">
                    Pelan-pelan saja. Nggak ada jawaban yang harus sempurna.
                  </p>
                </header>

                <div className={`${cardClass} space-y-6 p-5 sm:p-7`}>
                  <div
                    className="flex gap-1.5"
                    aria-label={`Langkah ${groundStep + 1} dari ${groundEx.steps.length}`}
                  >
                    {groundEx.steps.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          index <= groundStep
                            ? "bg-[#A9B9A5]"
                            : "bg-[#29282D]/[0.08]"
                        }`}
                      />
                    ))}
                  </div>

                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={groundStep}
                      initial={
                        shouldReduceMotion ? false : { opacity: 0, y: 8 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={
                        shouldReduceMotion ? undefined : { opacity: 0, y: -5 }
                      }
                      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                      className="space-y-5"
                    >
                      <div className="flex min-h-28 items-center justify-center rounded-2xl bg-[#E5EDE4]/65 py-5 text-5xl">
                        <span role="img" aria-label="Simbol latihan grounding">
                          {groundStepData.sense}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <p className="text-lg font-semibold leading-snug text-[#29282D]">
                          {groundStepData.instruction}
                        </p>

                        <p className="text-sm leading-6 text-[#29282D]/55">
                          {groundStepData.examples}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <div className="flex items-center justify-between gap-3 border-t border-[#29282D]/[0.06] pt-4">
                    <p className="text-xs text-[#29282D]/40">
                      {groundStep + 1} dari {groundEx.steps.length}
                    </p>

                    <div className="flex gap-2">
                      {groundStep > 0 && (
                        <button
                          type="button"
                          onClick={() => setGroundStep((step) => step - 1)}
                          className={secondaryButtonClass}
                        >
                          <ChevronLeft size={16} />
                          Kembali
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setGroundStep((step) => step + 1)}
                        className={buttonClass}
                      >
                        {groundStep < groundEx.steps.length - 1
                          ? "Lanjut"
                          : "Selesai"}
                        {groundStep < groundEx.steps.length - 1 && (
                          <ChevronRight size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.section>
        )}

        {/* TIMER */}
        {mode === "timer" && (
          <motion.section key="timer" {...motionProps} className="space-y-6">
            {timerDone ? (
              <div className={`${cardClass} space-y-5 p-6 text-center sm:p-9`}>
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#E5EDE4] text-[#71856C]">
                  <CheckCircle2 size={30} strokeWidth={1.6} />
                </div>

                <div className="space-y-2">
                  <p className={sectionLabelClass}>Waktu jeda selesai</p>
                  <h1 className="text-2xl font-semibold tracking-tight text-[#29282D]">
                    Nggak perlu buru-buru kembali.
                  </h1>
                  <p className="text-sm leading-6 text-[#29282D]/55">
                    Ambil waktu tambahan kalau kamu masih membutuhkannya. Jadwal
                    boleh menunggu sebentar.
                  </p>
                </div>

                <div className="flex flex-col justify-center gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={resetTimer}
                    className={secondaryButtonClass}
                  >
                    <RotateCcw size={15} />
                    Ulangi timer
                  </button>

                  <button
                    type="button"
                    onClick={stopAll}
                    className={buttonClass}
                  >
                    Selesai
                  </button>
                </div>
              </div>
            ) : (
              <div className={`${cardClass} space-y-8 p-5 sm:p-9`}>
                <header className="space-y-2 text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#EDE8F5] text-[#7B68C8]">
                    <Clock3 size={22} strokeWidth={1.7} />
                  </div>

                  <h1 className="text-2xl font-semibold tracking-tight text-[#29282D]">
                    Waktu buat berhenti.
                  </h1>

                  <p className="mx-auto max-w-xs text-sm leading-6 text-[#29282D]/50">
                    Kamu nggak harus produktif setiap menit. Istirahat juga
                    punya tempatnya.
                  </p>
                </header>

                <div className="space-y-4">
                  <p
                    aria-live="off"
                    aria-label={`Sisa waktu ${formatTime(timerLeft)}`}
                    className="text-center text-6xl font-light tabular-nums tracking-tight text-[#29282D] sm:text-7xl"
                  >
                    {formatTime(timerLeft)}
                  </p>

                  <div
                    className="h-1.5 overflow-hidden rounded-full bg-[#29282D]/[0.07]"
                    role="progressbar"
                    aria-label="Sisa waktu jeda"
                    aria-valuemin={0}
                    aria-valuemax={timerDur}
                    aria-valuenow={timerLeft}
                  >
                    <div
                      className="h-full rounded-full bg-[#B8A9D9]"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, (timerLeft / timerDur) * 100),
                        )}%`,
                        transition: shouldReduceMotion
                          ? "none"
                          : "width 200ms linear",
                      }}
                    />
                  </div>

                  <p className="text-center text-xs text-[#29282D]/40">
                    {timerRunning
                      ? "Nggak perlu melakukan apa-apa dulu."
                      : "Tekan mulai saat kamu siap."}
                  </p>
                </div>

                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTimerRunning((running) => !running)}
                    className={buttonClass}
                  >
                    {timerRunning ? (
                      <>
                        <Pause size={16} />
                        Jeda
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        Mulai
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={resetTimer}
                    className={secondaryButtonClass}
                    aria-label="Ulangi timer dari awal"
                  >
                    <RotateCcw size={16} />
                    Reset
                  </button>
                </div>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
