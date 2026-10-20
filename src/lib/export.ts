import { getAllData } from './storage';

export function exportDataAsJSON(): void {
  try {
    const data = getAllData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unload-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.warn('[UNLOAD] Export failed:', e);
    throw new Error('Ekspor gagal. Coba lagi.');
  }
}

export function exportDataAsText(): void {
  try {
    const data = getAllData();
    const lines: string[] = [];

    lines.push('=== UNLOAD — Data Export ===');
    lines.push(`Diekspor pada: ${new Date(data.exportedAt).toLocaleString('id-ID')}`);
    lines.push('');

    if (data.brainDumps.length > 0) {
      lines.push('── Brain Dump ─────────────────────────────');
      data.brainDumps.forEach((entry) => {
        lines.push('');
        if (entry.title) lines.push(`Judul: ${entry.title}`);
        lines.push(`Tanggal: ${new Date(entry.createdAt).toLocaleString('id-ID')}`);
        if (entry.promptUsed) lines.push(`Prompt: ${entry.promptUsed}`);
        lines.push('');
        lines.push(entry.content);
        lines.push('─'.repeat(40));
      });
    }

    if (data.moods.length > 0) {
      lines.push('');
      lines.push('── Mood Check-in ───────────────────────────');
      data.moods.forEach((entry) => {
        lines.push('');
        lines.push(`Mood: ${entry.mood} (intensitas ${entry.intensity}/5)`);
        lines.push(`Tanggal: ${new Date(entry.createdAt).toLocaleString('id-ID')}`);
        if (entry.factors.length > 0) lines.push(`Faktor: ${entry.factors.join(', ')}`);
        if (entry.note) lines.push(`Catatan: ${entry.note}`);
        lines.push('─'.repeat(40));
      });
    }

    if (data.reflections.length > 0) {
      lines.push('');
      lines.push('── Perspective Shift ───────────────────────');
      data.reflections.forEach((entry) => {
        lines.push('');
        lines.push(`Tanggal: ${new Date(entry.createdAt).toLocaleString('id-ID')}`);
        lines.push(`Apa yang terjadi: ${entry.whatHappened}`);
        lines.push(`Apa yang dirasakan: ${entry.whatFelt}`);
        lines.push(`Asumsi: ${entry.assumptions}`);
        lines.push(`Yang bisa dikontrol: ${entry.whatCanControl}`);
        lines.push('─'.repeat(40));
      });
    }

    const text = lines.join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unload-data-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.warn('[UNLOAD] Text export failed:', e);
    throw new Error('Ekspor gagal. Coba lagi.');
  }
}
