# PondokOne Backend — REST API `/v1`

Node.js 20, **tanpa dependensi eksternal** (hanya modul bawaan `node:http`, `node:crypto`, `node:fs`).
Mengimplementasikan kontrak API dari dokumen spesifikasi: JWT access+refresh, RBAC 3 lapis
(role → scope tenant → resource rule), audit log untuk edit sensitif, dan webhook gateway
sebagai **satu-satunya** jalur finalisasi status pembayaran.

## Menjalankan

```powershell
node server.js          # port default 3000 (ubah dengan env PORT)
```

Server juga melayani frontend dari `../web`, jadi cukup buka `http://localhost:3000`.

- Data: `data/db.json` (dibuat otomatis dari `seed.js` saat pertama jalan; hapus file ini untuk reset).
- Secret JWT: env `PO_SECRET`, atau otomatis dibuat persisten di `.secret`.
- Password disimpan sebagai hash SHA-256 + salt (bukan plaintext).

## Akun demo

| Role | Identifier | Password |
|---|---|---|
| super_admin (Web Master) | `master@pondokone.id` | `master123` |
| tenant_admin | `admin@alhikmah.sch.id` | `admin123` |
| teacher | `ustadz@alhikmah.sch.id` | `guru123` |
| guardian | `wali@gmail.com` | `wali123` |

## Contoh pemakaian

```powershell
# Login
$r = Invoke-RestMethod -Method Post -Uri http://localhost:3000/v1/auth/login `
  -ContentType 'application/json' `
  -Body '{"identifier":"admin@alhikmah.sch.id","password":"admin123"}'

# Panggil endpoint dengan token
Invoke-RestMethod -Uri http://localhost:3000/v1/students `
  -Headers @{ Authorization = "Bearer $($r.accessToken)" }
```

## Endpoint

| Method | Path | Akses | Keterangan |
|---|---|---|---|
| POST | `/v1/auth/login` | publik | → accessToken, refreshToken, user, permissions, context |
| POST | `/v1/auth/refresh` | publik | Tukar refresh token → access token baru |
| GET | `/v1/me` | semua role | Profil + permissions + context |
| GET | `/v1/tenants/current` | role ber-tenant | Tenant aktif |
| GET/POST | `/v1/students` | sesuai scope / tenant_admin | Guru: siswa unit ajar; wali: anak sendiri |
| GET/POST | `/v1/attendance/sessions` | teacher (unit diampu) | POST idempotent per (unit, tanggal, sesi) |
| GET/POST | `/v1/memorization-records` | teacher (halaqah diampu) | Setoran hafalan |
| GET/POST | `/v1/grade-entries` | teacher (mapel/kelas diampu) | POST menerima array (batch); wali hanya published |
| GET/POST | `/v1/behavior-events` | teacher | Catatan perilaku + notifikasi wali |
| POST | `/v1/bills/generate` | tenant_admin | Generate tagihan massal, skip duplikat |
| GET | `/v1/bills` | admin / guardian | Wali hanya tagihan anaknya |
| POST | `/v1/payments/checkout` | guardian / tenant_admin | → payment `pending` + reference + expiry |
| POST | `/v1/webhooks/payment-gateway` | signature HMAC | Finalisasi `paid`/`failed`; idempotent |
| GET | `/v1/saas/invoices` | super_admin | Invoice SaaS |
| POST | `/v1/saas/invoices/generate` | super_admin | base fee + per-siswa × siswa aktif |
| GET | `/v1/health` | publik | Cek hidup |

Format error: `{ "error": { "code", "message" } }` — 401 token invalid, 403 pelanggaran scope,
404 tidak ditemukan, 422 validasi.

## Catatan webhook

Signature = `HMAC-SHA256(secret, reference + status)`. Di produksi ganti dengan skema
verifikasi milik gateway yang dipakai (mis. Midtrans/Xendit) — struktur handler sudah
memisahkan verifikasi, finalisasi bill, pembuatan receipt, dan notifikasi.
