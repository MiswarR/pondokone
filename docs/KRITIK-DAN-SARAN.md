# Kritik & Saran atas Workflow "Aplikasi Pondok Pesantren dan Sekolah"

Tinjauan menyeluruh terhadap dua dokumen sumber:
- `arsitektur-aplikasi-pondok-sekolah.html` (spesifikasi flow, screen, arsitektur)
- `desain-ui-aplikasi-pondok-modern.html` (arah visual & design system)

Tujuan tinjauan: memastikan hasil akhirnya **responsif, bersahabat, mudah dioperasikan, dan ringan** di web, Android, dan iOS.

---

## 1. Yang sudah sangat baik (pertahankan)

| Aspek | Alasan |
|---|---|
| **Satu backend + satu database + satu API** untuk 3 kanal | Ini keputusan paling penting dan sudah benar. Mencegah logika ganda dan data tidak sinkron. |
| **RBAC 3 lapis** (role → tenant scope → resource rule) | Model otorisasi yang tepat untuk multi-tenant pendidikan. |
| **Status pembayaran final hanya dari webhook** | Mencegah "false paid" — banyak aplikasi sekolah gagal justru di sini. |
| **Pemisahan billing SaaS dari tagihan siswa** | Laporan bisnis penyedia tidak tercampur dengan keuangan tenant. |
| **Absensi dipisah sesi vs record per siswa** | Struktur data yang benar; memudahkan rekap dan revisi. |
| **Design tokens & i18n sejak awal** (ID/EN/AR + RTL) | Menghindari pekerjaan ulang paling mahal di fase lanjut. |
| **Web = administrasi, mobile = operasional** | Pembagian kanal per konteks pemakaian yang realistis. |

---

## 2. Kritik utama & perbaikan yang saya terapkan / sarankan

### 2.1 "Dark premium default" berisiko untuk audiens orang tua
**Kritik:** Dokumen desain mendorong dark mode sebagai identitas. Untuk admin dan guru itu cocok, tetapi mayoritas orang tua (termasuk staf senior) lebih nyaman dan lebih percaya pada tampilan terang; dark UI di ponsel murah dengan layar TN juga menurunkan keterbacaan. Dokumen bahkan menunda light mode ("sediakan belakangan") — ini bertentangan dengan tujuan "bersahabat".

**Saran (sudah diterapkan di prototipe):** Light mode dibangun **sejak hari pertama** dari token yang sama; tema mengikuti sistem (`prefers-color-scheme`) sebagai default untuk portal orang tua, dark sebagai default untuk portal admin/master. Biayanya kecil bila dikerjakan di awal, mahal bila ditunda.

### 2.2 Offline-first guru disebut, tetapi belum dirinci konfliknya
**Kritik:** Spesifikasi menyebut "draft offline lalu sinkron", tapi tidak menjawab: bagaimana jika dua guru mengisi absensi sesi yang sama? Bagaimana jika draft dikirim setelah admin mengedit data? `updated_at` + "versioning ringan" belum cukup sebagai aturan operasional.

**Saran:**
- Jadikan penulisan absensi **idempotent per kunci alami** `(tenant, unit, tanggal, sesi)` — pengiriman ulang menimpa milik sendiri, bukan membuat duplikat (sudah diterapkan di prototipe & backend).
- Draft offline diberi `client_id` (UUID dari perangkat) agar retry tidak menggandakan data.
- Aturan konflik sederhana yang bisa dijelaskan ke guru: *"input terakhir per sesi menang, dan semua versi tercatat di audit log"* — jangan membangun CRDT/sync engine yang berlebihan untuk kasus ini.

### 2.3 Publikasi nilai butuh alur persetujuan yang eksplisit
**Kritik:** Ada `publish policy` per komponen nilai, tetapi flow guru → approval → tampil ke orang tua tidak digambar. Nilai yang muncul-hilang di aplikasi orang tua adalah sumber komplain nomor satu.

**Saran:** Tetapkan state machine kecil: `draft → submitted → published` dengan aktor yang jelas (guru submit, wali kelas/admin publish untuk komponen ber-approval, PTS/PAS di-publish serentak per semester). Prototipe menerapkan versi sederhananya (`published: true/false` mengikuti policy komponen).

### 2.4 Bahasa "pelanggaran" perlu dilunakkan di sisi orang tua
**Kritik:** Dokumen desain sudah benar menulis "transparansi tanpa membuat UI terasa menakutkan", tetapi daftar screen orang tua tetap memakai istilah teknis (poin, kategori berat). Notifikasi push "Anak Anda melanggar aturan B-01, 50 poin" merusak hubungan sekolah–wali.

**Saran:** Di aplikasi orang tua, tampilkan **catatan baik lebih menonjol daripada pelanggaran** (timeline campur, badge positif), gunakan bahasa pembinaan ("perlu pendampingan", "sudah ditindaklanjuti musyrif"), dan tampilkan **status tindak lanjut** — bukan hanya kesalahannya. Poin cukup terlihat di detail, bukan di push notification.

### 2.5 Tidak ada strategi untuk sinyal lemah & perangkat murah (selain draft)
**Kritik:** Target pengguna banyak di pesantren daerah. Dokumen belum menyebut anggaran ukuran aplikasi/halaman.

**Saran (prinsip "ringan" yang terukur):**
- Web: budget < 200 KB JS awal, tanpa framework berat di kanal orang tua; prototipe ini vanilla ES modules ± beberapa puluh KB, tanpa dependensi.
- PWA dengan service worker (sudah diterapkan): shell dibuka instan, tetap terbuka saat offline.
- API mengembalikan **ringkasan dashboard dalam satu endpoint** (`/v1/me` memuat context) agar mobile tidak melakukan 6 request untuk satu layar — sudah sesuai saran spesifikasi, pertahankan saat implementasi produksi.
- Gambar (foto siswa) wajib varian thumbnail; jangan kirim foto asli ke list.

### 2.6 Mobile: mulai dari PWA, baru native bila perlu
**Kritik:** Dokumen menyarankan Flutter/React Native sejak awal untuk 2 aplikasi mobile. Itu berarti 3 codebase UI (web + 2 app) sebelum produk terbukti — mahal untuk tim kecil.

**Saran bertahap:**
1. **Fase 1 (sekarang):** PWA responsif (prototipe ini) — installable di Android & iOS, ringan, satu codebase, update tanpa app store.
2. **Fase 2:** Bungkus PWA dengan **Capacitor** untuk hadir di Play Store/App Store + push notification native (FCM/APNs) — masih satu codebase.
3. **Fase 3 (bila skala menuntut):** Flutter untuk aplikasi guru (kebutuhan offline paling berat), tetap memakai design tokens yang sama.
   Catatan iOS: push notification untuk web/PWA di iOS terbatas (butuh instalasi ke home screen, iOS 16.4+); jika notifikasi adalah fitur kritis orang tua, Capacitor di Fase 2 menjadi wajib, jangan ditunda ke Fase 3.

### 2.7 Celah spesifikasi yang perlu ditambah sebelum produksi
1. **Impor massal** — onboarding tenant dengan 500 santri tidak mungkin lewat form satu-satu. Butuh impor Excel/CSV dengan pratinjau kesalahan. (Paling sering jadi penghambat go-live.)
2. **Kenaikan kelas / tahun ajaran baru** — belum ada flow promosi siswa antar tahun ajaran; ini pekerjaan tahunan terbesar admin.
3. **Rapor PDF** — disebut "dapat dipakai untuk rapor digital" tapi tidak dispesifikasikan; tentukan sejak awal karena memengaruhi struktur komponen nilai.
4. **Kebijakan data & privasi anak** — data santri adalah data anak di bawah umur (UU PDP): perlu retensi, hak hapus, enkripsi at-rest, dan pembatasan ekspor.
5. **Rate limit & lockout login** — portal wali menghadap publik; wajib throttling OTP/login.
6. **Backup & disaster recovery per tenant** — jualan penting SaaS pendidikan, belum disinggung.
7. **Mode "support" Web Master** sudah disebut harus tercatat di audit — bagus; tambahkan **banner visual** saat sesi support aktif agar tidak disalahgunakan diam-diam.
8. **Multi-anak lintas tenant** — satu wali bisa punya anak di 2 pondok berbeda; tabel relasi wali–anak sebaiknya tidak mengunci wali pada satu tenant.

### 2.8 Aksesibilitas (belum disebut sama sekali di kedua dokumen)
- Target sentuh minimal 44×44 px (diterapkan di tombol/segmented prototipe).
- Kontras WCAG AA — aksen `#0066ff` di atas panel gelap lolos untuk teks besar, tetapi untuk teks kecil gunakan varian lebih terang (`#2f7bff`/`#9cc3ff`, sudah dipakai di tokens).
- Status **tidak boleh hanya warna** — dokumen desain sudah benar mensyaratkan chip + ikon + teks; pertahankan.
- Dukungan pembaca layar: label ARIA pada ikon-saja (diterapkan pada tombol bell/menu).

---

## 3. Ringkasan prioritas eksekusi (disempurnakan dari spesifikasi)

| Tahap | Isi | Catatan |
|---|---|---|
| 1 | Auth + multi-tenant + master data + **impor massal** | Impor massal dimajukan (dari "tidak ada" ke tahap 1) |
| 2 | Absensi + hafalan (nilai menyusul) | Nilai butuh alur publish yang matang, jangan dipaksakan serentak |
| 3 | Tagihan + payment gateway + rekonsiliasi | Webhook + idempotency + audit sejak hari pertama |
| 4 | Perilaku + notifikasi + rapor PDF | Bahasa pembinaan di sisi wali |
| 5 | Panel Web Master + billing SaaS | Paralel setelah fondasi stabil |
| 6 | Capacitor build (Play Store/App Store) | Push notification native |

---

## 4. Apa yang dibangun di prototipe ini

- **Frontend PWA** (`web/`): 4 portal lengkap (Web Master, Admin, Guru, Orang Tua) — seluruh screen dari spesifikasi, design tokens dark/light, i18n ID/EN/AR dengan RTL, settings (tema/densitas/ukuran teks/bahasa), draft offline guru, checkout QRIS simulasi + webhook + receipt, audit log, installable & offline-capable.
- **Backend** (`backend/`): REST API `/v1` sesuai kontrak spesifikasi (JWT, RBAC 3 lapis, webhook pembayaran sebagai satu-satunya finalisasi status, audit log), tanpa dependensi eksternal.
- Frontend prototipe memakai data layer lokal yang bentuknya identik dengan API, sehingga penggantian ke `fetch('/v1/...')` bersifat mekanis.
