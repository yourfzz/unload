export interface BreathingPhase {
  label: string;
  duration: number; // seconds
  instruction: string;
}

export interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  phases: BreathingPhase[];
  totalCycles: number;
}

export interface GroundingStep {
  sense: string;
  count: number;
  instruction: string;
  examples: string;
}

export interface GroundingExercise {
  id: string;
  name: string;
  description: string;
  steps: GroundingStep[];
}

export const BREATHING_EXERCISES: BreathingExercise[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Teknik pernapasan kotak yang dipakai banyak orang untuk menenangkan sistem saraf.',
    totalCycles: 4,
    phases: [
      { label: 'Tarik napas', duration: 4, instruction: 'Tarik napas perlahan...' },
      { label: 'Tahan', duration: 4, instruction: 'Tahan sebentar...' },
      { label: 'Buang napas', duration: 4, instruction: 'Buang napas pelan...' },
      { label: 'Tahan', duration: 4, instruction: 'Tahan lagi...' },
    ],
  },
  {
    id: '4-7-8',
    name: '4-7-8',
    description: 'Pola pernapasan ini bisa membantu tubuh terasa lebih rileks dalam beberapa menit.',
    totalCycles: 3,
    phases: [
      { label: 'Tarik napas', duration: 4, instruction: 'Hirup napas dalam-dalam...' },
      { label: 'Tahan', duration: 7, instruction: 'Tahan...' },
      { label: 'Buang napas', duration: 8, instruction: 'Hembuskan perlahan...' },
    ],
  },
  {
    id: 'slow',
    name: 'Pernapasan Lambat',
    description: 'Cukup tarik dan buang napas dengan ritme yang lebih lambat dari biasanya.',
    totalCycles: 5,
    phases: [
      { label: 'Tarik napas', duration: 5, instruction: 'Hirup napas dengan santai...' },
      { label: 'Buang napas', duration: 5, instruction: 'Lepaskan perlahan...' },
    ],
  },
];

export const GROUNDING_EXERCISES: GroundingExercise[] = [
  {
    id: '5-4-3-2-1',
    name: '5-4-3-2-1',
    description: 'Teknik sederhana untuk mengalihkan perhatian ke lingkungan sekitarmu sekarang.',
    steps: [
      {
        sense: 'Lihat 👀',
        count: 5,
        instruction: 'Cari 5 hal yang bisa kamu lihat sekarang',
        examples: 'Misalnya: meja, jendela, tanaman, lampu, tas',
      },
      {
        sense: 'Sentuh ✋',
        count: 4,
        instruction: 'Cari 4 hal yang bisa kamu sentuh atau rasakan',
        examples: 'Misalnya: permukaan meja, pakaianmu, lantai, dinding',
      },
      {
        sense: 'Dengar 👂',
        count: 3,
        instruction: 'Dengarkan 3 suara di sekitarmu sekarang',
        examples: 'Misalnya: kipas angin, suara luar, napasmu sendiri',
      },
      {
        sense: 'Cium 👃',
        count: 2,
        instruction: 'Coba kenali 2 aroma di sekitarmu',
        examples: 'Misalnya: udara ruangan, minumanmu, sabun tangan',
      },
      {
        sense: 'Rasa 👄',
        count: 1,
        instruction: 'Sadari 1 rasa yang ada di mulutmu',
        examples: 'Misalnya: sisa minuman, udara yang kamu hirup',
      },
    ],
  },
  {
    id: 'body-scan',
    name: 'Body Scan',
    description: 'Perhatikan tubuhmu dari atas ke bawah — tanpa menilai, cukup perhatikan.',
    steps: [
      {
        sense: 'Kepala & Wajah',
        count: 1,
        instruction: 'Perhatikan kepala dan wajahmu',
        examples: 'Ada ketegangan di dahi? Rahang terkatup? Coba lepaskan.',
      },
      {
        sense: 'Bahu & Leher',
        count: 1,
        instruction: 'Rasakan bahu dan lehermu',
        examples: 'Bahu terangkat atau tegang? Biarkan turun perlahan.',
      },
      {
        sense: 'Dada & Perut',
        count: 1,
        instruction: 'Perhatikan dada dan perutmu',
        examples: 'Napasmu dangkal atau dalam? Perut kencang? Biarkan mengembang.',
      },
      {
        sense: 'Tangan & Jari',
        count: 1,
        instruction: 'Rasakan kedua tanganmu',
        examples: 'Tangan mengepal? Jari-jari kaku? Goyang pelan-pelan.',
      },
      {
        sense: 'Kaki & Telapak',
        count: 1,
        instruction: 'Perhatikan kakimu sampai telapak',
        examples: 'Kaki bertumpu di lantai? Jari kaki melengkung? Biarkan menjejak.',
      },
    ],
  },
];

export const PAUSE_DURATIONS = [
  { value: 60, label: '1 menit' },
  { value: 180, label: '3 menit' },
  { value: 300, label: '5 menit' },
  { value: 600, label: '10 menit' },
];
