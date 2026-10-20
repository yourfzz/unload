export type MoodType =
  | 'senang'
  | 'tenang'
  | 'bersyukur'
  | 'biasa'
  | 'bingung'
  | 'cemas'
  | 'sedih'
  | 'kesal'
  | 'capek'
  | 'mati-rasa';

export type PromptCategory =
  | 'overthinking'
  | 'pertemanan'
  | 'percintaan'
  | 'kuliah-kerja'
  | 'masa-depan'
  | 'self-worth'
  | 'kelelahan'
  | 'pilihan'
  | 'emosi'
  | 'refleksi-harian';

export interface BrainDumpEntry {
  id: string;
  title?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  promptUsed?: string;
}

export interface MoodEntry {
  id: string;
  mood: MoodType;
  intensity: number; // 1–5
  factors: string[];
  note?: string;
  createdAt: string;
}

export interface ReflectionEntry {
  id: string;
  whatHappened: string;
  whatFelt: string;
  assumptions: string;
  whatCanControl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prompt {
  id: string;
  text: string;
  category: PromptCategory;
}

export interface FavoritePrompt {
  promptId: string;
  savedAt: string;
}

export interface UserPreferences {
  hasSeenOnboarding: boolean;
  lastVisited?: string;
}

export interface MoodOption {
  value: MoodType;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export interface PromptCategoryOption {
  value: PromptCategory;
  label: string;
  emoji: string;
}
