/* ============================================================
   AI — penyusun otomatis "Catatan PJ" dan deskripsi sikap rapor.
   Membaca rangkuman laporan siswa (absensi, nilai, hafalan,
   perilaku, prestasi) lalu merangkai kalimat wajar: membangun,
   tidak menjatuhkan, memberi semangat & solusi bila laporan buruk.

   Dua jalur:
   1. OFFLINE (default) — generator berbasis template, tanpa API key.
   2. ONLINE — memakai API key milik sekolah (Claude/OpenAI/Gemini/xAI).
      Kunci disimpan HANYA di perangkat ini (localStorage), tidak pernah
      dikirim ke server PondokOne.
   ============================================================ */

const AI_KEY = 'po.ai.v1';

export const PROVIDERS = [
  { id: 'offline', label: 'Tanpa AI online (template pintar bawaan)' },
  { id: 'claude', label: 'Claude (Anthropic)' },
  { id: 'gemini', label: 'Gemini (Google)' },
  { id: 'openai', label: 'OpenAI (ChatGPT)' },
  { id: 'xai', label: 'Grok (xAI)' },
];

export function getConfig() {
  return { provider: 'offline', apiKey: '', maxChars: 300, ...(JSON.parse(localStorage.getItem(AI_KEY) || '{}')) };
}

export function setConfig(cfg) {
  localStorage.setItem(AI_KEY, JSON.stringify({ ...getConfig(), ...cfg }));
}

/* ---------- Prompt bahasa Indonesia ---------- */
const KIND_LABEL = {
  catatan: 'Catatan Penanggung Jawab Rombel (catatan wali kelas di rapor)',
  spiritual: 'Deskripsi Sikap Spiritual di rapor',
  sosial: 'Deskripsi Sikap Sosial di rapor',
};

function buildPrompt(kind, data, maxChars) {
  return `Anda adalah wali kelas di sekolah Islam/pesantren di Indonesia yang menulis rapor semester.
Tulislah ${KIND_LABEL[kind] || kind} untuk siswa berikut, berdasarkan rangkuman laporan satu semester:

${data}

Aturan penulisan:
- Bahasa Indonesia yang wajar dan hangat, sebut siswa dengan "Ananda ${'{nama-depan}'}" (pakai nama depannya).
- Maksimal ${maxChars} karakter. Satu paragraf saja, tanpa daftar/poin.
- Nada MEMBANGUN: jangan menjatuhkan. Bila ada catatan buruk (sering alpa, nilai rendah, pelanggaran), sampaikan dengan lembut lalu beri semangat dan solusi konkret.
- Bila laporan bagus, berikan apresiasi tulus dan dorongan untuk mempertahankan.
- Jangan menyebut angka statistik mentah berlebihan; rangkai menjadi kalimat.
- Jangan menambahkan salam pembuka/penutup, langsung isi catatan.

Balas HANYA dengan teks catatan tersebut, tanpa penjelasan lain.`;
}

/* ---------- Panggilan API per penyedia ---------- */
async function callClaude(apiKey, prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      /* wajib untuk pemanggilan langsung dari browser */
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  if (data.stop_reason === 'refusal') throw new Error('Permintaan ditolak oleh model.');
  const block = (data.content || []).find((b) => b.type === 'text');
  if (!block) throw new Error('Respons Claude kosong.');
  return block.text.trim();
}

async function callOpenAICompat(url, apiKey, model, prompt) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, max_tokens: 1024, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Respons API kosong.');
  return text.trim();
}

async function callGemini(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error(`Gemini API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Respons Gemini kosong.');
  return text.trim();
}

/* ---------- Generator OFFLINE (tanpa API key) ----------
   Merangkai kalimat dari data terstruktur dengan nada membangun. */
function firstName(name) { return (name || 'Ananda').split(' ')[0]; }

function offlineCatatan(d) {
  const n = firstName(d.name);
  const parts = [];

  // Kehadiran
  if (d.attendPct === null || d.attendPct === undefined) { /* tanpa data absen */ }
  else if (d.attendPct >= 92) parts.push(`Ananda ${n} menunjukkan kedisiplinan hadir yang sangat baik semester ini`);
  else if (d.attendPct >= 80) parts.push(`Kehadiran Ananda ${n} cukup baik, meski masih bisa ditingkatkan lagi`);
  else parts.push(`Kehadiran Ananda ${n} perlu menjadi perhatian bersama; dampingan orang tua untuk membiasakan hadir tepat waktu akan sangat membantu`);

  // Nilai
  if (d.avgScore === null || d.avgScore === undefined) { /* skip */ }
  else if (d.avgScore >= 88) parts.push(`capaian akademiknya sangat membanggakan dengan rata-rata nilai yang tinggi`);
  else if (d.avgScore >= 78) parts.push(`hasil belajarnya baik dan stabil di sebagian besar mata pelajaran`);
  else parts.push(`hasil belajarnya masih dapat dikembangkan — pembiasaan belajar rutin di rumah serta bimbingan tambahan akan membantunya berkembang`);

  // Hafalan
  if (d.memoCount > 0) {
    if (d.memoAvg >= 85) parts.push(`semangatnya dalam setoran hafalan Al-Qur'an patut diapresiasi`);
    else parts.push(`setoran hafalannya berjalan dan akan semakin lancar dengan murojaah yang istiqamah`);
  }

  // Perilaku
  if (d.violations === 0) parts.push(`sikap dan adabnya terjaga baik tanpa catatan pelanggaran`);
  else if (d.violations <= 2) parts.push(`terdapat sedikit catatan kedisiplinan yang sudah dibina dan kami yakin tidak terulang`);
  else parts.push(`ada beberapa catatan kedisiplinan; kami mohon kerja sama orang tua dalam pembinaan, karena kami yakin dengan pendampingan yang tepat Ananda mampu berubah menjadi lebih baik`);

  // Prestasi
  if (d.achievements > 0) parts.push(`ditambah ${d.achievements} catatan kebaikan/prestasi yang menunjukkan potensi dirinya`);

  let text = parts.join('; ') + '. ';
  text += (d.avgScore >= 78 && d.violations <= 1)
    ? `Pertahankan semangat belajar dan teruslah menjadi teladan kebaikan, Ananda ${n}!`
    : `Tetap semangat, Ananda ${n} — dengan ikhtiar, doa, dan dukungan orang tua, semester depan pasti lebih baik.`;
  return text;
}

function offlineSpiritual(d) {
  const n = firstName(d.name);
  if (d.memoCount > 0 && d.memoAvg >= 85) {
    return `Ananda ${n} aktif dalam kegiatan ibadah dan setoran hafalan Al-Qur'an dengan hasil yang baik, menjalankan shalat berjamaah dengan tertib, serta menunjukkan adab yang santun. Terus istiqamah dan jadikan Al-Qur'an sahabat setia.`;
  }
  if (d.memoCount > 0) {
    return `Ananda ${n} mengikuti kegiatan ibadah dan pembinaan hafalan dengan cukup baik. Dengan murojaah yang lebih rutin dan bimbingan berkelanjutan, insyaAllah kualitas ibadah dan hafalannya akan terus meningkat.`;
  }
  return `Ananda ${n} mengikuti kegiatan keagamaan di sekolah dengan baik dan menunjukkan sikap hormat dalam beribadah. Pembiasaan ibadah di rumah bersama keluarga akan semakin menguatkan karakter spiritualnya.`;
}

function offlineSosial(d) {
  const n = firstName(d.name);
  if (d.violations === 0 && d.achievements > 0) {
    return `Ananda ${n} menunjukkan sikap sosial yang sangat baik: santun kepada guru, peduli kepada teman, dan aktif dalam kebaikan. Sikap positif ini patut dipertahankan dan menjadi teladan bagi teman-temannya.`;
  }
  if (d.violations === 0) {
    return `Ananda ${n} bergaul dengan baik, menghormati guru, dan menjaga kerukunan bersama teman-temannya. Teruslah memupuk kepedulian dan keberanian untuk berkontribusi dalam kegiatan bersama.`;
  }
  if (d.violations <= 2) {
    return `Ananda ${n} pada dasarnya mampu bersikap santun dan bekerja sama dengan teman. Beberapa catatan kedisiplinan telah dibina, dan kami yakin dengan kesadaran diri serta dukungan orang tua sikapnya akan semakin matang.`;
  }
  return `Ananda ${n} sedang dalam proses pembinaan sikap dan kedisiplinan. Kami percaya setiap anak memiliki kebaikan dalam dirinya; dengan pendampingan yang konsisten di sekolah dan di rumah, Ananda ${n} insyaAllah akan menunjukkan perubahan yang membanggakan.`;
}

function generateOffline(kind, d, maxChars) {
  const fn = kind === 'spiritual' ? offlineSpiritual : kind === 'sosial' ? offlineSosial : offlineCatatan;
  let text = fn(d);
  if (text.length > maxChars) {
    text = text.slice(0, maxChars - 1);
    const cut = Math.max(text.lastIndexOf('.'), text.lastIndexOf(';'));
    text = cut > maxChars * 0.5 ? text.slice(0, cut + 1) : text + '…';
  }
  return text;
}

/* ---------- API utama ----------
   kind : 'catatan' | 'spiritual' | 'sosial'
   d    : { name, attendPct, avgScore, memoCount, memoAvg, violations, achievements, detailText }
   Mengembalikan Promise<string>. */
export async function generateNote(kind, d) {
  const cfg = getConfig();
  const maxChars = Number(cfg.maxChars) || 300;

  if (cfg.provider === 'offline' || !cfg.apiKey) {
    return generateOffline(kind, d, maxChars);
  }

  const prompt = buildPrompt(kind, d.detailText, maxChars).replace('{nama-depan}', firstName(d.name));
  let text;
  if (cfg.provider === 'claude') text = await callClaude(cfg.apiKey, prompt);
  else if (cfg.provider === 'openai') text = await callOpenAICompat('https://api.openai.com/v1/chat/completions', cfg.apiKey, 'gpt-4o-mini', prompt);
  else if (cfg.provider === 'xai') text = await callOpenAICompat('https://api.x.ai/v1/chat/completions', cfg.apiKey, 'grok-3', prompt);
  else if (cfg.provider === 'gemini') text = await callGemini(cfg.apiKey, prompt);
  else return generateOffline(kind, d, maxChars);

  if (text.length > maxChars + 40) text = text.slice(0, maxChars) + '…';
  return text;
}
