import type { MoodOption, PromptCategory, PromptCategoryOption } from '@/types/unload';

export const MOOD_OPTIONS: MoodOption[] = [
  {
    value: 'senang',
    label: 'Senang',
    emoji: '😊',
    color: '#4A7C59',
    bgColor: '#D4EAD0',
  },
  {
    value: 'tenang',
    label: 'Tenang',
    emoji: '😌',
    color: '#4A6B8A',
    bgColor: '#D0E0EE',
  },
  {
    value: 'bersyukur',
    label: 'Bersyukur',
    emoji: '🙏',
    color: '#8A6B2E',
    bgColor: '#F0E0B8',
  },
  {
    value: 'biasa',
    label: 'Biasa aja',
    emoji: '😐',
    color: '#6B6875',
    bgColor: '#E0DFE5',
  },
  {
    value: 'bingung',
    label: 'Bingung',
    emoji: '😕',
    color: '#7A6B9A',
    bgColor: '#DDD4EE',
  },
  {
    value: 'cemas',
    label: 'Cemas',
    emoji: '😰',
    color: '#8A6B2E',
    bgColor: '#EEDFC8',
  },
  {
    value: 'sedih',
    label: 'Sedih',
    emoji: '😢',
    color: '#4A6B8A',
    bgColor: '#C8D8EE',
  },
  {
    value: 'kesal',
    label: 'Kesal',
    emoji: '😤',
    color: '#8A3A2E',
    bgColor: '#EECCC8',
  },
  {
    value: 'capek',
    label: 'Capek',
    emoji: '😩',
    color: '#5A5068',
    bgColor: '#D8D0E8',
  },
  {
    value: 'mati-rasa',
    label: 'Mati rasa',
    emoji: '😶',
    color: '#6B6875',
    bgColor: '#DDDCE2',
  },
];

export const MOOD_FACTORS = [
  'Pekerjaan / kuliah',
  'Keluarga',
  'Pertemanan',
  'Percintaan',
  'Kesehatan',
  'Keuangan',
  'Kurang tidur',
  'Terlalu banyak pikiran',
  'Tidak tahu',
  'Hal kecil yang numpuk',
  'Ekspektasi orang lain',
  'Kondisi lingkungan',
];

export const INTENSITY_LABELS: Record<number, string> = {
  1: 'Sedikit',
  2: 'Cukup terasa',
  3: 'Lumayan kuat',
  4: 'Cukup intens',
  5: 'Sangat intens',
};

export const PROMPT_CATEGORIES: PromptCategoryOption[] = [
  { value: 'overthinking', label: 'Overthinking', emoji: '🌀' },
  { value: 'pertemanan', label: 'Pertemanan', emoji: '🤝' },
  { value: 'percintaan', label: 'Percintaan', emoji: '💛' },
  { value: 'kuliah-kerja', label: 'Kuliah & Kerja', emoji: '📚' },
  { value: 'masa-depan', label: 'Masa depan', emoji: '🔭' },
  { value: 'self-worth', label: 'Self-worth', emoji: '🪞' },
  { value: 'kelelahan', label: 'Kelelahan', emoji: '🌿' },
  { value: 'pilihan', label: 'Bingung milih', emoji: '🗺️' },
  { value: 'emosi', label: 'Mengenali emosi', emoji: '🌊' },
  { value: 'refleksi-harian', label: 'Refleksi harian', emoji: '☀️' },
] satisfies PromptCategoryOption[];

export function getMoodOption(value: string): MoodOption | undefined {
  return MOOD_OPTIONS.find((m) => m.value === value);
}
