'use client';

import type {
  BrainDumpEntry,
  MoodEntry,
  ReflectionEntry,
  FavoritePrompt,
  UserPreferences,
} from '@/types/unload';

const KEYS = {
  BRAIN_DUMPS: 'unload_brain_dumps',
  MOODS: 'unload_moods',
  REFLECTIONS: 'unload_reflections',
  FAVORITE_PROMPTS: 'unload_favorite_prompts',
  PREFERENCES: 'unload_preferences',
} as const;

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function safeRead<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): boolean {
  if (!isClient()) return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('[UNLOAD] Storage write failed for key:', key, e);
    return false;
  }
}

// ─── Brain Dump ──────────────────────────────────────────────────────────────

export function getBrainDumps(): BrainDumpEntry[] {
  const data = safeRead<unknown>(KEYS.BRAIN_DUMPS, []);
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is BrainDumpEntry =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as BrainDumpEntry).id === 'string' &&
      typeof (item as BrainDumpEntry).content === 'string'
  );
}

export function saveBrainDump(entry: BrainDumpEntry): boolean {
  const entries = getBrainDumps();
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    entries[idx] = entry;
  } else {
    entries.unshift(entry);
  }
  return safeWrite(KEYS.BRAIN_DUMPS, entries);
}

export function deleteBrainDump(id: string): boolean {
  const entries = getBrainDumps().filter((e) => e.id !== id);
  return safeWrite(KEYS.BRAIN_DUMPS, entries);
}

// ─── Mood ─────────────────────────────────────────────────────────────────────

export function getMoodEntries(): MoodEntry[] {
  const data = safeRead<unknown>(KEYS.MOODS, []);
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is MoodEntry =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as MoodEntry).id === 'string' &&
      typeof (item as MoodEntry).mood === 'string'
  );
}

export function saveMoodEntry(entry: MoodEntry): boolean {
  const entries = getMoodEntries();
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    entries[idx] = entry;
  } else {
    entries.unshift(entry);
  }
  return safeWrite(KEYS.MOODS, entries);
}

export function deleteMoodEntry(id: string): boolean {
  const entries = getMoodEntries().filter((e) => e.id !== id);
  return safeWrite(KEYS.MOODS, entries);
}

// ─── Reflection ───────────────────────────────────────────────────────────────

export function getReflections(): ReflectionEntry[] {
  const data = safeRead<unknown>(KEYS.REFLECTIONS, []);
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is ReflectionEntry =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as ReflectionEntry).id === 'string'
  );
}

export function saveReflection(entry: ReflectionEntry): boolean {
  const entries = getReflections();
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    entries[idx] = entry;
  } else {
    entries.unshift(entry);
  }
  return safeWrite(KEYS.REFLECTIONS, entries);
}

export function deleteReflection(id: string): boolean {
  const entries = getReflections().filter((e) => e.id !== id);
  return safeWrite(KEYS.REFLECTIONS, entries);
}

// ─── Favorite Prompts ─────────────────────────────────────────────────────────

export function getFavoritePrompts(): FavoritePrompt[] {
  const data = safeRead<unknown>(KEYS.FAVORITE_PROMPTS, []);
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is FavoritePrompt =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as FavoritePrompt).promptId === 'string'
  );
}

export function toggleFavoritePrompt(promptId: string): boolean {
  const favorites = getFavoritePrompts();
  const idx = favorites.findIndex((f) => f.promptId === promptId);
  if (idx >= 0) {
    favorites.splice(idx, 1);
  } else {
    favorites.push({ promptId, savedAt: new Date().toISOString() });
  }
  return safeWrite(KEYS.FAVORITE_PROMPTS, favorites);
}

export function isFavoritePrompt(promptId: string): boolean {
  return getFavoritePrompts().some((f) => f.promptId === promptId);
}

// ─── Preferences ──────────────────────────────────────────────────────────────

export function getPreferences(): UserPreferences {
  return safeRead<UserPreferences>(KEYS.PREFERENCES, {
    hasSeenOnboarding: false,
  });
}

export function savePreferences(prefs: Partial<UserPreferences>): boolean {
  const current = getPreferences();
  return safeWrite(KEYS.PREFERENCES, { ...current, ...prefs });
}

// ─── Global ───────────────────────────────────────────────────────────────────

export function clearAllData(): boolean {
  if (!isClient()) return false;
  try {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
    return true;
  } catch {
    return false;
  }
}

export function getAllData() {
  return {
    brainDumps: getBrainDumps(),
    moods: getMoodEntries(),
    reflections: getReflections(),
    favoritePrompts: getFavoritePrompts(),
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
