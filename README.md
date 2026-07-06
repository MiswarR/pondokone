# PondokOne — Platform Terpadu Sekolah & Pondok Pesantren

Implementasi utuh dari workflow di folder induk:
- `arsitektur-aplikasi-pondok-sekolah.html` → flow per role, daftar screen, kontrak API, model data
- `desain-ui-aplikasi-pondok-modern.html` → design tokens, dark premium + electric blue, i18n ID/EN/AR + RTL

## Struktur

```
aplikasi-pondok/
├─ web/            # Frontend PWA (tanpa build step, vanilla ES modules)
│  ├─ index.html
│  ├─ css/         # tokens.css (design tokens) + app.css
│  ├─ js/core/     # i18n, store (data layer + seed), ui (komponen), auth, settings
│  ├─ js/portals/  # master.js, admin.js, guru.js, ortu.js
│  ├─ manifest.webmanifest + sw.js   # PWA: installable & offline
├─ backend/        # REST API /v1 (Node 20, tanpa dependensi eksternal)
└─ docs/KRITIK-DAN-SARAN.md
```

## Cara menjalankan

**Cara termudah (frontend + backend sekaligus):**
```powershell
cd backend
node server.js
# buka http://localhost:3000
```

**Frontend saja (mode demo, data lokal di browser):**
```powershell
cd web
npx serve .        # atau server statis apa pun
```

## Akun demo

| Portal | Login | Password |
|---|---|---|
| Web Master | `master@pondokone.id` | `master123` |
| Admin Tenant | `admin@alhikmah.sch.id` | `admin123` |
| Guru / Ustadz | `ustadz@alhikmah.sch.id` | `guru123` |
| Orang Tua | `wali@gmail.com` | `wali123` |

Di layar login, klik kartu portal untuk mengisi akun otomatis.

## Fitur per portal (sesuai spesifikasi)

- **Web Master** — dashboard global (KPI tenant, pendapatan, penggunaan), manajemen tenant + paket layanan, invoice SaaS (generate/kirim/lunas), audit log & tiket support.
- **Admin Tenant** — dashboard operasional, master data (santri, guru, wali, kelas, halaqah, kamar, mapel, komponen nilai, aturan pelanggaran), monitor absensi/nilai/hafalan/perilaku, produk tagihan + generate tagihan massal, rekonsiliasi pembayaran, laporan + export CSV.
- **Guru / Ustadz (mobile-first)** — agenda harian, quick attendance (satu sesi beberapa sentuhan), setoran hafalan, input nilai batch, catatan perilaku; **draft offline** otomatis sinkron saat online kembali.
- **Orang Tua (mobile-first)** — dashboard anak (multi-anak dengan child switcher), detail absensi/hafalan/nilai/perilaku, tagihan + checkout QRIS/VA/e-wallet (simulasi gateway + webhook), bukti bayar (receipt) + riwayat transaksi, pengumuman.
- **Semua role** — Settings: tema gelap/terang/sistem, densitas, ukuran teks, bahasa **ID / EN / العربية (RTL penuh)** — berlaku instan tanpa login ulang.

## Catatan arsitektur

- Frontend memakai data layer lokal (`js/core/store.js`) yang bentuk datanya identik dengan API `/v1`, sehingga integrasi produksi tinggal mengganti pemanggilan Store → `fetch`.
- Status pembayaran hanya difinalkan lewat (simulasi) webhook — sesuai aturan spesifikasi.
- Semua edit sensitif tercatat di audit log (actor, before, after, timestamp).
