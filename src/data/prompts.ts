import type { Prompt, PromptCategory } from '@/types/unload';

const PROMPTS: Prompt[] = [
  // Overthinking
  { id: 'ot-01', category: 'overthinking', text: 'Hal apa yang terus kamu pikirkan, padahal belum tentu akan terjadi?' },
  { id: 'ot-02', category: 'overthinking', text: 'Kamu lagi takut sama apa yang mungkin terjadi, atau sama sesuatu yang sudah terjadi?' },
  { id: 'ot-03', category: 'overthinking', text: 'Kalau dipikir-pikir, berapa banyak skenario buruk yang kamu bayangkan hari ini yang akhirnya tidak terjadi?' },
  { id: 'ot-04', category: 'overthinking', text: 'Ada nggak satu hal yang bisa kamu lakukan sekarang untuk mengurangi beban pikiranmu?' },
  { id: 'ot-05', category: 'overthinking', text: 'Pikiran yang paling berisik di kepalamu saat ini itu bilang apa?' },
  { id: 'ot-06', category: 'overthinking', text: 'Kalau kamu punya tombol jeda untuk pikiranmu, kamu mau jeda di bagian mana?' },
  // Pertemanan
  { id: 'pt-01', category: 'pertemanan', text: 'Ada orang yang bikin kamu ngerasa lelah setiap habis interaksi? Kenapa kamu pikir itu terjadi?' },
  { id: 'pt-02', category: 'pertemanan', text: 'Kapan terakhir kali kamu ngerasa benar-benar didengar oleh seseorang?' },
  { id: 'pt-03', category: 'pertemanan', text: 'Hubungan mana yang lagi membutuhkan energimu lebih dari yang kamu punya?' },
  { id: 'pt-04', category: 'pertemanan', text: 'Ada hal yang pengin kamu sampaikan ke seseorang, tapi belum berani? Apa yang bikin kamu menahan?' },
  { id: 'pt-05', category: 'pertemanan', text: 'Seberapa sering kamu ngerasa harus jadi orang lain supaya diterima di lingkaran pertemananmu?' },
  { id: 'pt-06', category: 'pertemanan', text: 'Siapa orang yang bikin kamu bisa jadi diri sendiri paling bebas? Kapan terakhir kamu ngobrol sama mereka?' },
  // Percintaan
  { id: 'pc-01', category: 'percintaan', text: 'Kamu benar-benar menginginkan ini, atau cuma takut mengecewakan orang lain?' },
  { id: 'pc-02', category: 'percintaan', text: 'Apa yang kamu harapkan dari hubungan ini yang belum pernah kamu ungkapkan secara jelas?' },
  { id: 'pc-03', category: 'percintaan', text: 'Kalau kamu benar-benar jujur sama dirimu sendiri, apa yang sebenarnya kamu rasakan sekarang?' },
  { id: 'pc-04', category: 'percintaan', text: 'Ada pola yang terus berulang dalam hubunganmu — entah sekarang atau sebelumnya? Pola itu terlihat seperti apa?' },
  { id: 'pc-05', category: 'percintaan', text: 'Apa hal yang sering kamu kompromikan yang sebenarnya penting buat kamu?' },
  { id: 'pc-06', category: 'percintaan', text: 'Kalau kamu ngomong ke dirimu sendiri lima tahun lalu soal hubungan ini, apa yang akan kamu katakan?' },
  // Kuliah & Kerja
  { id: 'kk-01', category: 'kuliah-kerja', text: 'Bagian mana dari aktivitasmu sekarang yang paling menguras energi, tapi paling sedikit memberi makna?' },
  { id: 'kk-02', category: 'kuliah-kerja', text: 'Kamu lagi ngejar target siapa — target kamu sendiri, atau ekspektasi orang lain?' },
  { id: 'kk-03', category: 'kuliah-kerja', text: 'Kalau tidak ada yang menilai atau menghakimi, kamu sebenarnya ingin mengerjakan apa?' },
  { id: 'kk-04', category: 'kuliah-kerja', text: 'Tugas atau tanggung jawab mana yang paling sering kamu tunda? Apa yang bikin kamu menghindarinya?' },
  { id: 'kk-05', category: 'kuliah-kerja', text: 'Apa satu hal kecil yang bisa membuat harimu di kampus atau tempat kerja sedikit lebih ringan?' },
  { id: 'kk-06', category: 'kuliah-kerja', text: 'Seberapa sering kamu merasa pekerjaanmu atau studimu mendefinisikan seberapa berharganya dirimu?' },
  // Masa Depan
  { id: 'md-01', category: 'masa-depan', text: 'Ketika kamu membayangkan masa depan, perasaan apa yang paling sering muncul — excited, takut, atau bingung?' },
  { id: 'md-02', category: 'masa-depan', text: 'Ada hal yang kamu tunda karena menunggu kondisi "sempurna"? Kondisi sempurna itu seperti apa?' },
  { id: 'md-03', category: 'masa-depan', text: 'Kamu sedang membangun hidup yang kamu inginkan, atau yang terasa paling aman?' },
  { id: 'md-04', category: 'masa-depan', text: 'Ekspektasi siapa yang paling banyak memengaruhi rencana hidupmu saat ini?' },
  { id: 'md-05', category: 'masa-depan', text: 'Apa satu hal yang sudah lama kamu tunda karena takut, tapi sebenarnya kamu tahu harus segera dimulai?' },
  { id: 'md-06', category: 'masa-depan', text: 'Versi dirimu yang ideal itu terlihat seperti apa? Dan versi itu bebas dari pengaruh orang lain?' },
  // Self-worth
  { id: 'sw-01', category: 'self-worth', text: 'Kalau temanmu mengalami hal yang sama persis denganmu, apa yang akan kamu katakan ke dia?' },
  { id: 'sw-02', category: 'self-worth', text: 'Standar apa yang kamu terapkan ke dirimu sendiri yang tidak akan kamu terapkan ke orang yang kamu sayang?' },
  { id: 'sw-03', category: 'self-worth', text: 'Kapan terakhir kali kamu merasa cukup hanya dengan menjadi dirimu sendiri?' },
  { id: 'sw-04', category: 'self-worth', text: 'Apa yang perlu terjadi supaya kamu bisa berhenti membuktikan dirimu ke orang lain?' },
  { id: 'sw-05', category: 'self-worth', text: 'Kamu lebih sering meragukan dirimu, atau lebih sering mengabaikan pencapaian kecilmu?' },
  { id: 'sw-06', category: 'self-worth', text: 'Apa satu hal tentang dirimu yang kamu anggap biasa saja, tapi mungkin sebenarnya cukup luar biasa?' },
  // Kelelahan
  { id: 'kl-01', category: 'kelelahan', text: 'Kamu capek secara fisik, emosi, atau keduanya? Bedakan keduanya sebentar.' },
  { id: 'kl-02', category: 'kelelahan', text: 'Ada hal yang sedang kamu tahan sendirian, yang sebenarnya boleh kamu bagi ke orang lain?' },
  { id: 'kl-03', category: 'kelelahan', text: 'Kapan terakhir kali kamu melakukan sesuatu hanya untuk dirimu sendiri, tanpa merasa bersalah?' },
  { id: 'kl-04', category: 'kelelahan', text: 'Ada hal yang terus kamu pertahankan, padahal sudah menguras terlalu banyak energimu?' },
  { id: 'kl-05', category: 'kelelahan', text: 'Kalau kamu diizinkan beristirahat tanpa rasa bersalah, apa yang pertama kali ingin kamu lakukan?' },
  { id: 'kl-06', category: 'kelelahan', text: 'Apa yang sebenarnya kamu butuhkan sekarang — bukan apa yang seharusnya kamu lakukan?' },
  // Bingung Milih
  { id: 'bm-01', category: 'pilihan', text: 'Dari semua pilihan yang ada, mana yang paling kamu takuti? Kenapa itu yang paling menakutkan?' },
  { id: 'bm-02', category: 'pilihan', text: 'Ada hal yang sebenarnya bisa kamu lepaskan, tapi masih kamu pertahankan karena sudah terlanjur lama?' },
  { id: 'bm-03', category: 'pilihan', text: 'Kalau nggak ada yang tahu keputusanmu, kamu akan memilih apa?' },
  { id: 'bm-04', category: 'pilihan', text: 'Apa yang benar-benar kamu inginkan dari pilihan ini — bukan hasil yang terlihat bagus dari luar?' },
  { id: 'bm-05', category: 'pilihan', text: 'Keputusan ini perlu dibuat sekarang, atau kamu bisa memberi dirimu waktu sedikit lebih lama?' },
  { id: 'bm-06', category: 'pilihan', text: 'Hal apa yang harus benar-benar ada atau tidak ada untuk membuat salah satu pilihan ini terasa lebih pas?' },
  // Mengenali Emosi
  { id: 'me-01', category: 'emosi', text: 'Ada sesuatu yang bikin kamu ngerasa begini, atau rasanya datang begitu aja?' },
  { id: 'me-02', category: 'emosi', text: 'Kamu merasakan ini di bagian tubuh mana? Dada sesak? Kepala penuh? Tangan tidak bisa diam?' },
  { id: 'me-03', category: 'emosi', text: 'Kalau perasaanmu ini adalah sebuah cuaca, itu akan jadi seperti apa?' },
  { id: 'me-04', category: 'emosi', text: 'Emosi apa yang paling sering kamu sembunyikan dari orang lain? Dan kenapa?' },
  { id: 'me-05', category: 'emosi', text: 'Apa yang ingin perasaanmu ini sampaikan, kalau diberi kesempatan bicara?' },
  { id: 'me-06', category: 'emosi', text: 'Seberapa sering kamu memberi ruang pada dirimu sendiri untuk sekadar merasakan tanpa harus segera memperbaikinya?' },
  // Refleksi Harian
  { id: 'rh-01', category: 'refleksi-harian', text: 'Apa satu momen kecil hari ini yang sebenarnya cukup berarti, meski terasa sepele?' },
  { id: 'rh-02', category: 'refleksi-harian', text: 'Energimu hari ini habis untuk apa? Dan apakah itu sepadan?' },
  { id: 'rh-03', category: 'refleksi-harian', text: 'Apa yang paling ingin kamu ceritakan ke seseorang hari ini, tapi tidak sempat atau tidak jadi?' },
  { id: 'rh-04', category: 'refleksi-harian', text: 'Kalau hari ini bisa diulang, ada satu hal kecil yang ingin kamu lakukan berbeda?' },
  { id: 'rh-05', category: 'refleksi-harian', text: 'Apa yang sedang kamu butuhkan untuk bisa istirahat dengan tenang malam ini?' },
  { id: 'rh-06', category: 'refleksi-harian', text: 'Satu kata untuk menggambarkan harimu hari ini — dan kenapa kata itu yang muncul?' },
];

export function getAllPrompts(): Prompt[] {
  return PROMPTS;
}

export function getPromptsByCategory(category: PromptCategory): Prompt[] {
  return PROMPTS.filter((p) => p.category === category);
}

export function getRandomPrompt(excludeIds: string[] = []): Prompt | null {
  const available = PROMPTS.filter((p) => !excludeIds.includes(p.id));
  const pool = available.length > 0 ? available : PROMPTS;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

export function getRandomPromptByCategory(
  category: PromptCategory,
  excludeIds: string[] = []
): Prompt | null {
  const all = getPromptsByCategory(category);
  const available = all.filter((p) => !excludeIds.includes(p.id));
  const pool = available.length > 0 ? available : all;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

export function getPromptById(id: string): Prompt | undefined {
  return PROMPTS.find((p) => p.id === id);
}

export default PROMPTS;
