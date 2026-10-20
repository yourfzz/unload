'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  getMoodEntries,
  saveMoodEntry,
  deleteMoodEntry,
  generateId,
} from '@/lib/storage';
import type { MoodEntry, MoodType } from '@/types/unload';

export function useMoodHistory() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setEntries(getMoodEntries());
    setIsLoading(false);
  }, []);

  const addEntry = useCallback(
    (data: {
      mood: MoodType;
      intensity: number;
      factors: string[];
      note?: string;
    }): boolean => {
      const entry: MoodEntry = {
        id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
      };
      const ok = saveMoodEntry(entry);
      if (ok) {
        setEntries((prev) => [entry, ...prev]);
      }
      return ok;
    },
    []
  );

  const removeEntry = useCallback((id: string): boolean => {
    const ok = deleteMoodEntry(id);
    if (ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
    return ok;
  }, []);

  const refresh = useCallback(() => {
    setEntries(getMoodEntries());
  }, []);

  return { entries, isLoading, addEntry, removeEntry, refresh };
}

export default useMoodHistory;
