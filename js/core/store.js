/* ============================================================
   Store — data layer lokal (demo) dengan bentuk data yang
   mengikuti desain database di arsitektur-aplikasi-pondok-sekolah.html.
   Semua mutasi lewat insert/update/remove agar audit log konsisten,
   dan agar mudah ditukar dengan REST API /v1 di produksi.
   ============================================================ */

const LS_KEY = 'po.db.v4'; // v4: sesi absensi kustom (sessionTypes) dikelola admin
const DRAFT_KEY = 'po.drafts.v1';

let db = null;
let idCounter = 1000;

export function uid(prefix = 'id') {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter}`;
}

function persist() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(db)); } catch (e) { console.warn('persist failed', e); }
}

export function load() {
  if (db) return db;
  const raw = localStorage.getItem(LS_KEY);
  if (raw) {
    try { db = JSON.parse(raw); return db; } catch { /* rebuild */ }
  }
  db = buildSeed();
  persist();
  return db;
}

export function resetDemo() {
  db = buildSeed();
  persist();
  localStorage.removeItem(DRAFT_KEY);
}

/* ---------- CRUD generik ---------- */
const AUDITED = new Set(['gradeEntries', 'behaviorEvents', 'bills', 'payments', 'saasInvoices', 'tenants', 'students', 'users', 'foundations', 'fndTransactions']);

export function list(name, filterFn) {
  const col = load()[name] || [];
  return filterFn ? col.filter(filterFn) : [...col];
}

export function get(name, id) {
  return (load()[name] || []).find((x) => x.id === id) || null;
}

export function insert(name, obj, actor) {
  load();
  if (!db[name]) db[name] = [];
  const rec = { id: obj.id || uid(name.slice(0, 3)), createdAt: new Date().toISOString(), ...obj };
  db[name].push(rec);
  if (AUDITED.has(name)) audit(actor, 'create', name, rec.id, null, rec);
  persist();
  return rec;
}

export function update(name, id, patch, actor) {
  load();
  const idx = (db[name] || []).findIndex((x) => x.id === id);
  if (idx < 0) return null;
  const before = { ...db[name][idx] };
  db[name][idx] = { ...before, ...patch, updatedAt: new Date().toISOString() };
  if (AUDITED.has(name)) audit(actor, 'update', name, id, before, db[name][idx]);
  persist();
  return db[name][idx];
}

export function remove(name, id, actor) {
  load();
  const idx = (db[name] || []).findIndex((x) => x.id === id);
  if (idx < 0) return false;
  const before = db[name][idx];
  db[name].splice(idx, 1);
  if (AUDITED.has(name)) audit(actor, 'delete', name, id, before, null);
  persist();
  return true;
}

export function audit(actor, action, entity, entityId, before, after) {
  load();
  db.auditLogs.unshift({
    id: uid('aud'),
    at: new Date().toISOString(),
    actor: actor || 'system',
    action, entity, entityId,
    before: before ? JSON.stringify(before).slice(0, 400) : null,
    after: after ? JSON.stringify(after).slice(0, 400) : null,
  });
  if (db.auditLogs.length > 500) db.auditLogs.length = 500;
  persist();
}

/* ---------- Auth ---------- */
export function login(identifier, password) {
  const user = list('users').find(
    (u) => (u.identifier === identifier || u.email === identifier || u.phone === identifier) && u.password === password && u.status !== 'inactive'
  );
  return user || null;
}

export function changePassword(userId, currentPassword, newPassword, actor) {
  const user = get('users', userId);
  if (!user) return { ok: false, err: 'user_not_found' };
  if (user.password !== currentPassword) return { ok: false, err: 'wrong_password' };
  if (!newPassword || newPassword.length < 6) return { ok: false, err: 'too_short' };
  update('users', userId, { password: newPassword }, actor);
  return { ok: true };
}

export function resetPasswordByAdmin(userId, newPassword, actor) {
  const user = get('users', userId);
  if (!user) return { ok: false, err: 'user_not_found' };
  if (!newPassword || newPassword.length < 6) return { ok: false, err: 'too_short' };
  update('users', userId, { password: newPassword }, actor);
  return { ok: true };
}

/* ---------- Notifikasi ---------- */
export function notify(tenantId, target, title, body, kind = 'info') {
  return insert('notifications', { tenantId, target, title, body, kind, read: false, at: new Date().toISOString() });
}

export function notificationsFor(user) {
  return list('notifications', (n) =>
    (n.tenantId === user.tenantId || !n.tenantId) &&
    (n.target === user.id || n.target === user.role || n.target === 'all')
  ).sort((a, b) => b.at.localeCompare(a.at));
}

/* ---------- Pembayaran (meniru gateway + webhook) ---------- */
export function checkout(billId, method, amount, payer, actor) {
  const bill = get('bills', billId);
  if (!bill) throw new Error('Bill not found');
  const payment = insert('payments', {
    tenantId: bill.tenantId,
    billId,
    studentId: bill.studentId,
    guardianId: payer?.guardianId || null,
    method,
    amount,
    reference: `PAY-${Date.now().toString().slice(-8)}`,
    status: 'pending',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  }, actor);
  update('bills', billId, { status: 'pending' }, actor);
  return payment;
}

/** Simulasi webhook gateway — satu-satunya jalur yang boleh memfinalkan status (sesuai spesifikasi). */
export function simulateWebhook(paymentId, finalStatus = 'paid', actor = 'gateway') {
  const p = get('payments', paymentId);
  if (!p) return null;
  const now = new Date().toISOString();
  update('payments', paymentId, { status: finalStatus, paidAt: finalStatus === 'paid' ? now : null }, actor);
  const bill = get('bills', p.billId);
  if (bill && finalStatus === 'paid') {
    const paidAmount = (bill.paidAmount || 0) + p.amount;
    const status = paidAmount >= bill.amount ? 'paid' : 'partial';
    update('bills', bill.id, { paidAmount, status }, actor);
    insert('receipts', {
      tenantId: bill.tenantId,
      paymentId,
      billId: bill.id,
      studentId: bill.studentId,
      number: `RCP-${Date.now().toString().slice(-8)}`,
      amount: p.amount,
      method: p.method,
      paidAt: now,
    });
    const student = get('students', bill.studentId);
    (student?.guardianIds || []).forEach((gid) =>
      notify(bill.tenantId, gid, 'Pembayaran berhasil', `${bill.name} ${bill.period} — pembayaran diterima.`, 'ok'));
  } else if (bill && finalStatus !== 'paid') {
    update('bills', bill.id, { status: (bill.paidAmount || 0) > 0 ? 'partial' : 'unpaid' }, actor);
  }
  return get('payments', paymentId);
}

/* ---------- Draft offline (input guru saat sinyal lemah) ---------- */
export function queueDraft(type, payload) {
  const drafts = JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]');
  drafts.push({ id: uid('drf'), type, payload, at: new Date().toISOString() });
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
  return drafts.length;
}

export function listDrafts() {
  return JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]');
}

export function flushDrafts(applyFn) {
  const drafts = listDrafts();
  const remaining = [];
  for (const d of drafts) {
    try { applyFn(d); } catch { remaining.push(d); }
  }
  localStorage.setItem(DRAFT_KEY, JSON.stringify(remaining));
  return drafts.length - remaining.length;
}

/* ============================================================
   SEED DATA — dua tenant demo, fokus pada Ponpes Al-Hikmah
   ============================================================ */
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function daysAhead(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function buildSeed() {
  const T1 = 'ten_alhikmah';
  const T2 = 'ten_cahaya';
  const T3 = 'ten_smpit';
  const F1 = 'fnd_alhikmah';
  const F2 = 'fnd_cahaya';

  /* --- Lembaga / Yayasan (menaungi satu atau beberapa sekolah/pondok) --- */
  const foundations = [
    {
      id: F1, name: 'Yayasan Pendidikan Al-Hikmah', code: 'yph-alhikmah',
      chairman: 'KH. Mahmud Baidhowi', profile: 'Yayasan yang menaungi pendidikan pesantren dan sekolah Islam terpadu sejak 1998.',
      address: 'Jl. Raya Pesantren No. 12, Bogor', phone: '0251-777888', email: 'yayasan@alhikmah.or.id',
      logoDataUrl: null, subscriptionStatus: 'active',
    },
    {
      id: F2, name: 'Yayasan Cahaya Ilmu Nusantara', code: 'ycin',
      chairman: 'Dr. H. Rahmat Hidayat', profile: 'Yayasan pendidikan dasar Islam di wilayah Depok.',
      address: 'Jl. Melati No. 8, Depok', phone: '021-555444', email: 'yayasan@cahayailmu.or.id',
      logoDataUrl: null, subscriptionStatus: 'trial',
    },
  ];

  /* --- Kelas, halaqah, kamar, mapel --- */
  const classes = [
    { id: 'cls_7a', tenantId: T1, name: 'Kelas 7A', level: 'SMP', homeroomId: 'usr_guru1', capacity: 28, status: 'active' },
    { id: 'cls_7b', tenantId: T1, name: 'Kelas 7B', level: 'SMP', homeroomId: 'usr_guru2', capacity: 28, status: 'active' },
    { id: 'cls_8a', tenantId: T1, name: 'Kelas 8A', level: 'SMP', homeroomId: 'usr_guru3', capacity: 30, status: 'active' },
    { id: 'cls_c1', tenantId: T2, name: 'Kelas 1 Ibnu Sina', level: 'SD', homeroomId: null, capacity: 25, status: 'active' },
    { id: 'cls_s7', tenantId: T3, name: 'Kelas 7 Ar-Razi', level: 'SMP', homeroomId: 'usr_guru4', capacity: 30, status: 'active' },
  ];
  const halaqahs = [
    { id: 'hlq_umar', tenantId: T1, name: 'Halaqah Umar bin Khattab', musyrifId: 'usr_guru1', target: 'Juz 30 + Juz 29', schedule: 'Ba’da Subuh & Maghrib' },
    { id: 'hlq_ali', tenantId: T1, name: 'Halaqah Ali bin Abi Thalib', musyrifId: 'usr_guru2', target: 'Juz 30', schedule: 'Ba’da Subuh' },
  ];
  const rooms = [
    { id: 'rom_1', tenantId: T1, name: 'Kamar Al-Fath 1', supervisorId: 'usr_guru2', capacity: 8, location: 'Gedung A Lt. 1' },
    { id: 'rom_2', tenantId: T1, name: 'Kamar Al-Fath 2', supervisorId: 'usr_guru2', capacity: 8, location: 'Gedung A Lt. 1' },
  ];
  const subjects = [
    { id: 'sub_mtk', tenantId: T1, code: 'MTK', name: 'Matematika', category: 'umum', teacherIds: ['usr_guru3'] },
    { id: 'sub_ipa', tenantId: T1, code: 'IPA', name: 'IPA Terpadu', category: 'umum', teacherIds: ['usr_guru3'] },
    { id: 'sub_bind', tenantId: T1, code: 'BIND', name: 'Bahasa Indonesia', category: 'umum', teacherIds: ['usr_guru2'] },
    { id: 'sub_fiqih', tenantId: T1, code: 'FQH', name: 'Fiqih', category: 'pesantren', teacherIds: ['usr_guru1'] },
    { id: 'sub_hadits', tenantId: T1, code: 'HDT', name: 'Hadits', category: 'pesantren', teacherIds: ['usr_guru1'] },
    { id: 'sub_barab', tenantId: T1, code: 'BAR', name: 'Bahasa Arab', category: 'pesantren', teacherIds: ['usr_guru1'] },
  ];
  const gradeComponents = [
    { id: 'gc_harian', tenantId: T1, name: 'Ulangan Harian', category: 'umum', weight: 30, maxScale: 100, publishPolicy: 'auto' },
    { id: 'gc_tugas', tenantId: T1, name: 'Tugas', category: 'umum', weight: 20, maxScale: 100, publishPolicy: 'auto' },
    { id: 'gc_pts', tenantId: T1, name: 'PTS', category: 'umum', weight: 20, maxScale: 100, publishPolicy: 'approval' },
    { id: 'gc_pas', tenantId: T1, name: 'PAS', category: 'umum', weight: 30, maxScale: 100, publishPolicy: 'approval' },
    { id: 'gc_tahfidz', tenantId: T1, name: 'Ujian Tahfidz', category: 'pesantren', weight: 100, maxScale: 100, publishPolicy: 'auto' },
  ];
  const behaviorRules = [
    { id: 'br_telat', tenantId: T1, code: 'R-01', name: 'Terlambat masuk kelas/halaqah', category: 'ringan', points: 5, defaultAction: 'Teguran dan pembinaan wali kelas' },
    { id: 'br_kitab', tenantId: T1, code: 'R-02', name: 'Tidak membawa kitab/buku', category: 'ringan', points: 5, defaultAction: 'Teguran' },
    { id: 'br_seragam', tenantId: T1, code: 'S-01', name: 'Melanggar aturan seragam', category: 'sedang', points: 15, defaultAction: 'Pembinaan dan pemberitahuan wali' },
    { id: 'br_asrama', tenantId: T1, code: 'S-02', name: 'Melanggar disiplin asrama', category: 'sedang', points: 20, defaultAction: 'Pembinaan musyrif' },
    { id: 'br_kabur', tenantId: T1, code: 'B-01', name: 'Keluar pondok tanpa izin', category: 'berat', points: 50, defaultAction: 'Pemanggilan wali dan surat peringatan' },
  ];

  /* --- Sesi absensi (dikelola admin sekolah; guru memilih saat mengabsen) --- */
  const sessionTypes = [
    { id: 'ses_muroja', tenantId: T1, name: 'Murojaah Hafalan', startTime: '04:30', endTime: '05:30', order: 1 },
    { id: 'ses_pagi', tenantId: T1, name: 'Pagi', startTime: '07:00', endTime: '08:00', order: 2 },
    { id: 'ses_siang', tenantId: T1, name: 'Siang', startTime: '13:00', endTime: '14:00', order: 3 },
    { id: 'ses_malam', tenantId: T1, name: 'Malam', startTime: '19:30', endTime: '20:30', order: 4 },
    { id: 'ses_s_pagi', tenantId: T3, name: 'Pagi', startTime: '07:00', endTime: '08:00', order: 1 },
    { id: 'ses_s_siang', tenantId: T3, name: 'Siang', startTime: '13:00', endTime: '14:00', order: 2 },
    { id: 'ses_c_pagi', tenantId: T2, name: 'Pagi', startTime: '07:30', endTime: '08:30', order: 1 },
  ];

  /* --- Siswa --- */
  const studentDefs = [
    ['std_01', 'Ahmad Fauzan', 'L', 'cls_7a', 'hlq_umar', 'rom_1', ['usr_wali1']],
    ['std_02', 'Muhammad Rizki Pratama', 'L', 'cls_7a', 'hlq_umar', 'rom_1', ['usr_wali2']],
    ['std_03', 'Abdullah Hasan', 'L', 'cls_7a', 'hlq_umar', 'rom_1', ['usr_wali3']],
    ['std_04', 'Umar Said', 'L', 'cls_7a', 'hlq_ali', 'rom_2', ['usr_wali4']],
    ['std_05', 'Fatimah Azzahra', 'P', 'cls_7b', 'hlq_ali', null, ['usr_wali1']],
    ['std_06', 'Aisyah Putri Rahma', 'P', 'cls_7b', 'hlq_ali', null, ['usr_wali2']],
    ['std_07', 'Khadijah Nur', 'P', 'cls_7b', 'hlq_ali', null, ['usr_wali3']],
    ['std_08', 'Zaid Ramadhan', 'L', 'cls_7a', 'hlq_umar', 'rom_1', ['usr_wali4']],
    ['std_09', 'Hamzah Alfarizi', 'L', 'cls_8a', 'hlq_umar', 'rom_2', ['usr_wali2']],
    ['std_10', 'Salman Alfarisi', 'L', 'cls_8a', 'hlq_umar', 'rom_2', ['usr_wali3']],
    ['std_11', 'Maryam Shafiyya', 'P', 'cls_8a', 'hlq_ali', null, ['usr_wali4']],
    ['std_12', 'Bilal Saputra', 'L', 'cls_8a', 'hlq_umar', 'rom_2', ['usr_wali1']],
  ];
  const students = studentDefs.map(([id, name, gender, classId, halaqahId, roomId, guardianIds], i) => ({
    id, tenantId: T1,
    nis: `2026${String(i + 1).padStart(3, '0')}`,
    name, gender, classId, halaqahId, roomId, guardianIds,
    birthDate: `201${2 + (i % 3)}-0${(i % 9) + 1}-1${i % 9}`,
    status: 'active',
  }));
  students.push({
    id: 'std_c1', tenantId: T2, nis: '2026101', name: 'Alya Kirana', gender: 'P',
    classId: 'cls_c1', halaqahId: null, roomId: null, guardianIds: [], birthDate: '2018-03-02', status: 'active',
  });
  /* Siswa SMP IT Al-Hikmah (sekolah kedua di bawah Yayasan Al-Hikmah) */
  [['std_s1', 'Raihan Akbar', 'L'], ['std_s2', 'Nabila Husna', 'P'], ['std_s3', 'Farhan Maulana', 'L'], ['std_s4', 'Zahra Aulia', 'P']].forEach(([id, name, gender], i) => {
    students.push({
      id, tenantId: T3, nis: `2026S0${i + 1}`, name, gender,
      classId: 'cls_s7', halaqahId: null, roomId: null, guardianIds: [], birthDate: `2013-0${(i % 9) + 1}-1${i + 1}`, status: 'active',
    });
  });

  /* --- Users --- */
  const users = [
    { id: 'usr_master', tenantId: null, role: 'master', name: 'Pusat PondokOne', identifier: 'master@pondokone.id', email: 'master@pondokone.id', phone: '0811000001', password: 'master123', status: 'active' },
    /* Pengurus lembaga/yayasan — fndRole menentukan kapasitas fitur:
       admin = Master Admin (kelola semua), bendahara = input keuangan lembaga,
       ketua/sekretaris = hanya memantau laporan. */
    { id: 'usr_yayasan1', tenantId: null, foundationId: F1, role: 'foundation_admin', fndRole: 'admin', name: 'KH. Mahmud Baidhowi', identifier: 'yayasan@alhikmah.or.id', email: 'yayasan@alhikmah.or.id', phone: '0811000010', password: 'yayasan123', status: 'active' },
    { id: 'usr_bendahara1', tenantId: null, foundationId: F1, role: 'foundation_admin', fndRole: 'bendahara', name: 'H. Umar Faruq, S.E.', identifier: 'bendahara@alhikmah.or.id', email: 'bendahara@alhikmah.or.id', phone: '0811000012', password: 'bendahara123', status: 'active' },
    { id: 'usr_sekretaris1', tenantId: null, foundationId: F1, role: 'foundation_admin', fndRole: 'sekretaris', name: 'Hj. Aminah Zahra, S.Pd.I', identifier: 'sekretaris@alhikmah.or.id', email: 'sekretaris@alhikmah.or.id', phone: '0811000013', password: 'sekretaris123', status: 'active' },
    { id: 'usr_yayasan2', tenantId: null, foundationId: F2, role: 'foundation_admin', fndRole: 'admin', name: 'Dr. H. Rahmat Hidayat', identifier: 'yayasan@cahayailmu.or.id', email: 'yayasan@cahayailmu.or.id', phone: '0811000011', password: 'yayasan123', status: 'active' },
    { id: 'usr_admin1', tenantId: T1, role: 'admin', name: 'H. Syamsul Arifin', identifier: 'admin@alhikmah.sch.id', email: 'admin@alhikmah.sch.id', phone: '0811000002', password: 'admin123', status: 'active' },
    { id: 'usr_admin2', tenantId: T2, role: 'admin', name: 'Dewi Lestari, S.Pd', identifier: 'admin@cahayailmu.sch.id', email: 'admin@cahayailmu.sch.id', phone: '0811000003', password: 'admin123', status: 'active' },
    { id: 'usr_admin3', tenantId: T3, role: 'admin', name: 'Ust. Fahmi Ramadhan, M.Pd', identifier: 'admin@smpit-alhikmah.sch.id', email: 'admin@smpit-alhikmah.sch.id', phone: '0811000004', password: 'admin123', status: 'active' },
    {
      id: 'usr_guru4', tenantId: T3, role: 'teacher', name: 'Ibu Laila Fitriani, S.Pd', identifier: 'laila@smpit-alhikmah.sch.id',
      email: 'laila@smpit-alhikmah.sch.id', phone: '0812000004', password: 'guru123', status: 'active',
      staffRoles: ['guru', 'wali_kelas'],
      classIds: ['cls_s7'], halaqahIds: [], subjectIds: [], roomIds: [],
    },
    {
      id: 'usr_guru1', tenantId: T1, role: 'teacher', name: 'Ust. Abdurrahman Hakim', identifier: 'ustadz@alhikmah.sch.id',
      email: 'ustadz@alhikmah.sch.id', phone: '0812000001', password: 'guru123', status: 'active',
      staffRoles: ['ustadz', 'wali_kelas', 'musyrif'],
      classIds: ['cls_7a'], halaqahIds: ['hlq_umar'], subjectIds: ['sub_fiqih', 'sub_hadits', 'sub_barab'], roomIds: [],
    },
    {
      id: 'usr_guru2', tenantId: T1, role: 'teacher', name: 'Ust. Lukman Hafidz', identifier: 'lukman@alhikmah.sch.id',
      email: 'lukman@alhikmah.sch.id', phone: '0812000002', password: 'guru123', status: 'active',
      staffRoles: ['ustadz', 'musyrif', 'pembina_asrama'],
      classIds: ['cls_7b'], halaqahIds: ['hlq_ali'], subjectIds: ['sub_bind'], roomIds: ['rom_1', 'rom_2'],
    },
    {
      id: 'usr_guru3', tenantId: T1, role: 'teacher', name: 'Ibu Ratna Sari, S.Pd', identifier: 'ratna@alhikmah.sch.id',
      email: 'ratna@alhikmah.sch.id', phone: '0812000003', password: 'guru123', status: 'active',
      staffRoles: ['guru'],
      classIds: ['cls_8a'], halaqahIds: [], subjectIds: ['sub_mtk', 'sub_ipa'], roomIds: [],
    },
    {
      id: 'usr_wali1', tenantId: T1, role: 'guardian', name: 'Bpk. Hendra Wijaya', identifier: 'wali@gmail.com',
      email: 'wali@gmail.com', phone: '0813000001', password: 'wali123', status: 'active',
      relation: 'ayah', childIds: ['std_01', 'std_05'],
      notifPrefs: { nilai: true, absensi: true, perilaku: true, tagihan: true },
    },
    {
      id: 'usr_wali2', tenantId: T1, role: 'guardian', name: 'Ibu Sri Mulyani', identifier: 'sri@gmail.com',
      email: 'sri@gmail.com', phone: '0813000002', password: 'wali123', status: 'active',
      relation: 'ibu', childIds: ['std_02', 'std_06', 'std_09'],
      notifPrefs: { nilai: true, absensi: true, perilaku: true, tagihan: true },
    },
    {
      id: 'usr_wali3', tenantId: T1, role: 'guardian', name: 'Bpk. Agus Salim', identifier: 'agus@gmail.com',
      email: 'agus@gmail.com', phone: '0813000003', password: 'wali123', status: 'active',
      relation: 'ayah', childIds: ['std_03', 'std_07', 'std_10'],
      notifPrefs: { nilai: true, absensi: true, perilaku: false, tagihan: true },
    },
    {
      id: 'usr_wali4', tenantId: T1, role: 'guardian', name: 'Ibu Nurhayati', identifier: 'nur@gmail.com',
      email: 'nur@gmail.com', phone: '0813000004', password: 'wali123', status: 'active',
      relation: 'wali', childIds: ['std_04', 'std_08', 'std_11'],
      notifPrefs: { nilai: true, absensi: true, perilaku: true, tagihan: true },
    },
  ];

  /* --- Absensi 10 hari terakhir --- */
  const attendanceSessions = [];
  const statuses = ['hadir', 'hadir', 'hadir', 'hadir', 'hadir', 'hadir', 'hadir', 'izin', 'sakit', 'terlambat', 'alfa'];
  for (let d = 9; d >= 1; d--) {
    for (const cls of ['cls_7a', 'cls_7b', 'cls_8a']) {
      const clsStudents = students.filter((s) => s.classId === cls);
      attendanceSessions.push({
        id: uid('att'), tenantId: T1, unitType: 'class', unitId: cls,
        date: daysAgo(d), session: 'Pagi',
        teacherId: cls === 'cls_7a' ? 'usr_guru1' : cls === 'cls_7b' ? 'usr_guru2' : 'usr_guru3',
        records: clsStudents.map((s, i) => ({
          studentId: s.id,
          status: statuses[(d * 3 + i) % statuses.length],
          note: '',
        })),
      });
    }
  }

  /* --- Hafalan --- */
  const surahs = [
    ['An-Naba’', 40], ['An-Nazi’at', 46], ['‘Abasa', 42], ['At-Takwir', 29],
    ['Al-Infitar', 19], ['Al-Mutaffifin', 36], ['Al-Insyiqaq', 25], ['Al-Buruj', 22],
  ];
  const memoResults = ['lancar', 'lancar', 'lancar', 'cukup', 'ulang'];
  const memorizationRecords = [];
  students.filter((s) => s.tenantId === T1 && s.halaqahId).forEach((s, si) => {
    for (let d = 8; d >= 1; d -= 2) {
      const [surah, ayat] = surahs[(si + d) % surahs.length];
      memorizationRecords.push({
        id: uid('mem'), tenantId: T1, studentId: s.id, halaqahId: s.halaqahId,
        teacherId: s.halaqahId === 'hlq_umar' ? 'usr_guru1' : 'usr_guru2',
        date: daysAgo(d), type: 'quran',
        material: `QS. ${surah}`, fromAyah: 1, toAyah: Math.min(10 + d, ayat),
        result: memoResults[(si + d) % memoResults.length],
        score: 75 + ((si * d) % 25),
        note: d === 2 ? 'Tajwid makin baik, jaga mad thabi’i.' : '',
      });
    }
  });
  const memorizationTargets = [
    { id: 'mt_1', tenantId: T1, halaqahId: 'hlq_umar', period: 'Semester 1 2026/2027', target: 'Juz 30 & 29', totalUnits: 60, doneUnitsHint: 'dihitung dari setoran' },
    { id: 'mt_2', tenantId: T1, halaqahId: 'hlq_ali', period: 'Semester 1 2026/2027', target: 'Juz 30', totalUnits: 37, doneUnitsHint: 'dihitung dari setoran' },
  ];

  /* --- Nilai --- */
  const gradeEntries = [];
  const gradePairs = [['sub_mtk', 'gc_harian'], ['sub_mtk', 'gc_tugas'], ['sub_ipa', 'gc_harian'], ['sub_bind', 'gc_tugas'], ['sub_fiqih', 'gc_harian'], ['sub_barab', 'gc_tugas']];
  students.filter((s) => s.tenantId === T1).forEach((s, si) => {
    gradePairs.forEach(([subjectId, componentId], gi) => {
      gradeEntries.push({
        id: uid('grd'), tenantId: T1, studentId: s.id, subjectId, componentId,
        classId: s.classId,
        teacherId: subjects.find((x) => x.id === subjectId)?.teacherIds?.[0] || 'usr_guru1',
        date: daysAgo(3 + gi), score: 68 + ((si * 7 + gi * 11) % 32),
        note: '', published: true,
      });
    });
  });

  /* --- Perilaku --- */
  const behaviorEvents = [
    { id: uid('bhv'), tenantId: T1, studentId: 'std_02', teacherId: 'usr_guru1', date: daysAgo(1), kind: 'violation', ruleId: 'br_telat', points: 5, chronology: 'Terlambat 15 menit masuk halaqah subuh.', followUp: 'Teguran lisan dan pembinaan singkat.', notifyGuardian: true, status: 'done' },
    { id: uid('bhv'), tenantId: T1, studentId: 'std_08', teacherId: 'usr_guru2', date: daysAgo(2), kind: 'violation', ruleId: 'br_asrama', points: 20, chronology: 'Tidur di kamar lain melewati jam malam.', followUp: 'Pembinaan musyrif, wali diberi tahu.', notifyGuardian: true, status: 'process' },
    { id: uid('bhv'), tenantId: T1, studentId: 'std_01', teacherId: 'usr_guru1', date: daysAgo(3), kind: 'good', ruleId: null, points: 0, chronology: 'Membantu membersihkan masjid tanpa diminta.', followUp: 'Apresiasi di depan halaqah.', notifyGuardian: true, status: 'done' },
    { id: uid('bhv'), tenantId: T1, studentId: 'std_10', teacherId: 'usr_guru3', date: daysAgo(5), kind: 'violation', ruleId: 'br_kitab', points: 5, chronology: 'Tidak membawa buku paket Matematika.', followUp: 'Teguran.', notifyGuardian: false, status: 'done' },
  ];

  /* --- Keuangan siswa --- */
  const billProducts = [
    { id: 'bp_spp', tenantId: T1, name: 'SPP Bulanan', category: 'recurring', amount: 750000, dueRule: 'Tanggal 10 tiap bulan', allowInstallment: true, target: 'all' },
    { id: 'bp_buku', tenantId: T1, name: 'Paket Buku & Kitab', category: 'one-time', amount: 450000, dueRule: null, allowInstallment: true, target: 'all' },
    { id: 'bp_taawun', tenantId: T1, name: 'Ta’awun Sosial', category: 'compulsory-donation', amount: 50000, dueRule: 'Tanggal 10 tiap bulan', allowInstallment: false, target: 'all' },
    { id: 'bp_asrama', tenantId: T1, name: 'Biaya Asrama & Makan', category: 'recurring', amount: 900000, dueRule: 'Tanggal 10 tiap bulan', allowInstallment: true, target: 'boarding' },
  ];

  const bills = [];
  const monthName = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  students.filter((s) => s.tenantId === T1).forEach((s, i) => {
    bills.push({
      id: `bil_spp_${s.id}`, tenantId: T1, studentId: s.id, productId: 'bp_spp',
      name: 'SPP Bulanan', period: monthName, amount: 750000,
      paidAmount: i % 3 === 0 ? 750000 : i % 3 === 1 ? 0 : 300000,
      dueDate: daysAhead(5),
      status: i % 3 === 0 ? 'paid' : i % 3 === 1 ? 'unpaid' : 'partial',
      note: 'SPP bulan berjalan',
    });
    bills.push({
      id: `bil_taw_${s.id}`, tenantId: T1, studentId: s.id, productId: 'bp_taawun',
      name: 'Ta’awun Sosial', period: monthName, amount: 50000,
      paidAmount: i % 2 === 0 ? 50000 : 0,
      dueDate: daysAhead(5),
      status: i % 2 === 0 ? 'paid' : 'unpaid',
      note: '',
    });
    if (s.roomId) {
      bills.push({
        id: `bil_asr_${s.id}`, tenantId: T1, studentId: s.id, productId: 'bp_asrama',
        name: 'Biaya Asrama & Makan', period: monthName, amount: 900000,
        paidAmount: i % 4 === 0 ? 900000 : 0,
        dueDate: daysAhead(5),
        status: i % 4 === 0 ? 'paid' : 'unpaid',
        note: '',
      });
    }
  });

  const payments = [];
  const receipts = [];
  bills.filter((b) => b.status === 'paid' || b.status === 'partial').forEach((b, i) => {
    const student = students.find((s) => s.id === b.studentId);
    const pay = {
      id: uid('pay'), tenantId: T1, billId: b.id, studentId: b.studentId,
      guardianId: student?.guardianIds?.[0] || null,
      method: ['qris', 'va_bca', 'ewallet', 'manual'][i % 4],
      amount: b.paidAmount,
      reference: `PAY-2026${String(1000 + i)}`,
      status: 'paid',
      createdAt: daysAgo(2 + (i % 4)),
      paidAt: daysAgo(2 + (i % 4)),
    };
    payments.push(pay);
    receipts.push({
      id: uid('rcp'), tenantId: T1, paymentId: pay.id, billId: b.id, studentId: b.studentId,
      number: `RCP-2026${String(1000 + i)}`, amount: pay.amount, method: pay.method, paidAt: pay.paidAt,
    });
  });

  /* --- SaaS: plans, tenants, invoices --- */
  const plans = [
    { id: 'pln_basic', name: 'Basic', monthlyBase: 500000, perStudent: 3000, features: ['Akademik', 'Absensi'], invoiceDay: 1, graceDays: 14 },
    { id: 'pln_std', name: 'Standard', monthlyBase: 1000000, perStudent: 4000, features: ['Akademik', 'Absensi', 'Hafalan', 'Perilaku', 'Keuangan'], invoiceDay: 1, graceDays: 14 },
    { id: 'pln_prm', name: 'Premium', monthlyBase: 2000000, perStudent: 5000, features: ['Semua modul', 'Notifikasi premium', 'Support prioritas'], invoiceDay: 1, graceDays: 21 },
  ];
  const tenants = [
    {
      id: T1, foundationId: F1, name: 'Ponpes Al-Hikmah', code: 'alhikmah', type: 'gabungan',
      subdomain: 'alhikmah.pondokone.id', planId: 'pln_std',
      modules: ['akademik', 'hafalan', 'perilaku', 'keuangan', 'notifikasi'],
      studentQuota: 300, activeStudents: 12,
      adminName: 'H. Syamsul Arifin', adminEmail: 'admin@alhikmah.sch.id', adminPhone: '0811000002',
      subscriptionStatus: 'active',
      address: 'Jl. Raya Pesantren No. 12, Bogor', phone: '0251-777888', email: 'info@alhikmah.sch.id',
      accentColor: '#2f7bff', logoDataUrl: null, defaultLang: 'id',
    },
    {
      id: T3, foundationId: F1, name: 'SMP IT Al-Hikmah', code: 'smpit-alhikmah', type: 'sekolah',
      subdomain: 'smpit-alhikmah.pondokone.id', planId: 'pln_basic',
      modules: ['akademik', 'perilaku', 'keuangan'],
      studentQuota: 120, activeStudents: 4,
      adminName: 'Ust. Fahmi Ramadhan, M.Pd', adminEmail: 'admin@smpit-alhikmah.sch.id', adminPhone: '0811000004',
      subscriptionStatus: 'active',
      address: 'Jl. Raya Pesantren No. 14, Bogor', phone: '0251-777889', email: 'info@smpit-alhikmah.sch.id',
      accentColor: '#8b5cf6', logoDataUrl: null, defaultLang: 'id',
    },
    {
      id: T2, foundationId: F2, name: 'SDIT Cahaya Ilmu', code: 'cahayailmu', type: 'sekolah',
      subdomain: 'cahayailmu.pondokone.id', planId: 'pln_basic',
      modules: ['akademik', 'keuangan'],
      studentQuota: 150, activeStudents: 1,
      adminName: 'Dewi Lestari, S.Pd', adminEmail: 'admin@cahayailmu.sch.id', adminPhone: '0811000003',
      subscriptionStatus: 'trial',
      address: 'Jl. Melati No. 8, Depok', phone: '021-555444', email: 'info@cahayailmu.sch.id',
      accentColor: '#2ecc8f', logoDataUrl: null, defaultLang: 'id',
    },
  ];
  /* Invoice SaaS ditagihkan ke YAYASAN (bukan per sekolah) —
     item dirinci tanpa menyebut nama sekolah, total siswa = agregat seluruh naungan. */
  const saasInvoices = [
    {
      id: 'sin_001', foundationId: F1, number: 'INV-SAAS-2606-001', period: 'Juni 2026',
      items: [
        { label: 'Biaya dasar paket (2 sekolah/pondok)', amount: 1500000 },
        { label: 'Per santri/siswa aktif (16 santri)', amount: 60000 },
      ],
      total: 1560000, status: 'paid', dueDate: daysAgo(20), paidAt: daysAgo(18),
    },
    {
      id: 'sin_002', foundationId: F1, number: 'INV-SAAS-2607-001', period: 'Juli 2026',
      items: [
        { label: 'Biaya dasar paket (2 sekolah/pondok)', amount: 1500000 },
        { label: 'Per santri/siswa aktif (16 santri)', amount: 60000 },
      ],
      total: 1560000, status: 'sent', dueDate: daysAhead(10), paidAt: null,
    },
    {
      id: 'sin_003', foundationId: F2, number: 'INV-SAAS-2607-002', period: 'Juli 2026',
      items: [{ label: 'Biaya dasar paket — trial berakhir (1 sekolah)', amount: 500000 }],
      total: 500000, status: 'overdue', dueDate: daysAgo(3), paidAt: null,
    },
  ];

  /* --- Kebendaharaan lembaga (kas yayasan: BOS/BOP, pemasukan, pengeluaran) --- */
  const fndTransactions = [
    { id: 'ftx_001', foundationId: F1, date: daysAgo(28), kind: 'in', category: 'Dana BOS', amount: 45000000, description: 'Pencairan BOS tahap II — 2 sekolah naungan', proofDataUrl: null, createdBy: 'usr_bendahara1' },
    { id: 'ftx_002', foundationId: F1, date: daysAgo(25), kind: 'in', category: 'Dana BOP', amount: 15000000, description: 'BOP pesantren semester ganjil', proofDataUrl: null, createdBy: 'usr_bendahara1' },
    { id: 'ftx_003', foundationId: F1, date: daysAgo(20), kind: 'out', category: 'Gaji & Honor', amount: 22000000, description: 'Gaji guru & staf bulan Juni', proofDataUrl: null, createdBy: 'usr_bendahara1' },
    { id: 'ftx_004', foundationId: F1, date: daysAgo(14), kind: 'out', category: 'Operasional', amount: 4500000, description: 'Listrik, air, internet seluruh unit', proofDataUrl: null, createdBy: 'usr_bendahara1' },
    { id: 'ftx_005', foundationId: F1, date: daysAgo(9), kind: 'in', category: 'Donasi / Hibah', amount: 5000000, description: 'Donasi wali santri untuk pembangunan musala', proofDataUrl: null, createdBy: 'usr_bendahara1' },
    { id: 'ftx_006', foundationId: F1, date: daysAgo(4), kind: 'out', category: 'Pembangunan', amount: 8000000, description: 'Material renovasi asrama Al-Fath', proofDataUrl: null, createdBy: 'usr_bendahara1' },
  ];

  /* --- Pengumuman & notifikasi --- */
  const announcements = [
    { id: uid('ann'), tenantId: T1, title: 'Libur Idul Adha', body: 'KBM diliburkan tanggal 12–14 Juli. Santri mukim tetap mengikuti agenda pondok.', date: daysAgo(2), audience: 'all' },
    { id: uid('ann'), tenantId: T1, title: 'Pembagian rapor semester', body: 'Rapor semester genap dapat diunduh orang tua mulai 20 Juli melalui aplikasi.', date: daysAgo(4), audience: 'guardian' },
    { id: uid('ann'), tenantId: T1, title: 'Rapat guru bulanan', body: 'Seluruh guru dan musyrif hadir di aula utama Kamis pukul 13.00.', date: daysAgo(1), audience: 'teacher' },
  ];
  const notifications = [
    { id: uid('ntf'), tenantId: T1, target: 'usr_wali1', title: 'Tagihan mendekati jatuh tempo', body: `SPP ${monthName} jatuh tempo ${daysAhead(5)}.`, kind: 'warn', read: false, at: new Date().toISOString() },
    { id: uid('ntf'), tenantId: T1, target: 'usr_guru1', title: 'Pengingat input absensi', body: 'Absensi halaqah sore belum diinput.', kind: 'info', read: false, at: new Date().toISOString() },
  ];

  const academicYears = [
    { id: 'ay_2627', tenantId: T1, name: '2026/2027', startDate: '2026-07-13', endDate: '2027-06-20', active: true },
    { id: 'ay_2526', tenantId: T1, name: '2025/2026', startDate: '2025-07-14', endDate: '2026-06-19', active: false },
  ];
  const semesters = [
    { id: 'sem_1', tenantId: T1, yearId: 'ay_2627', name: 'Semester 1', startDate: '2026-07-13', endDate: '2026-12-19', publishGrades: false },
  ];

  const auditLogs = [
    { id: uid('aud'), at: new Date().toISOString(), actor: 'usr_admin1', action: 'update', entity: 'bills', entityId: 'bil_spp_std_03', before: '{"status":"unpaid"}', after: '{"status":"partial"}' },
    { id: uid('aud'), at: daysAgo(1) + 'T08:12:00Z', actor: 'usr_master', action: 'create', entity: 'saasInvoices', entityId: 'sin_002', before: null, after: '{"period":"Juli 2026"}' },
  ];

  const supportTickets = [
    { id: uid('tkt'), tenantId: T2, subject: 'Gagal upload logo', body: 'Logo PNG 2MB tidak bisa diunggah.', status: 'open', createdAt: daysAgo(1) },
    { id: uid('tkt'), tenantId: T1, subject: 'Webhook pembayaran tertunda', body: 'Ada 1 transaksi VA yang callback-nya terlambat 10 menit.', status: 'resolved', createdAt: daysAgo(6) },
  ];

  return {
    foundations, fndTransactions, plans, tenants, saasInvoices, users, students, classes, halaqahs, rooms, subjects,
    academicYears, semesters, gradeComponents, behaviorRules, sessionTypes,
    attendanceSessions, memorizationRecords, memorizationTargets,
    gradeEntries, behaviorEvents,
    billProducts, bills, payments, receipts,
    announcements, notifications, auditLogs, supportTickets,
  };
}

/* ---------- Helper kueri yang sering dipakai portal ---------- */
export const ATT_STATUSES = ['hadir', 'izin', 'sakit', 'alfa', 'terlambat'];

export function studentsOf(tenantId) { return list('students', (s) => s.tenantId === tenantId); }
export function childrenOf(guardian) { return (guardian.childIds || []).map((id) => get('students', id)).filter(Boolean); }

/* ---------- Yayasan / lembaga ---------- */
export function tenantsOfFoundation(foundationId) {
  return list('tenants', (tn) => tn.foundationId === foundationId);
}
export function studentsOfFoundation(foundationId) {
  const tids = tenantsOfFoundation(foundationId).map((tn) => tn.id);
  return list('students', (s) => tids.includes(s.tenantId) && s.status === 'active');
}
export function teachersOfFoundation(foundationId) {
  const tids = tenantsOfFoundation(foundationId).map((tn) => tn.id);
  return list('users', (u) => u.role === 'teacher' && tids.includes(u.tenantId));
}

export function unitsOf(teacher) {
  const cls = (teacher.classIds || []).map((id) => ({ ...get('classes', id), unitType: 'class' }));
  const hlq = (teacher.halaqahIds || []).map((id) => ({ ...get('halaqahs', id), unitType: 'halaqah' }));
  return [...cls, ...hlq].filter((u) => u.id);
}

/* Sesi absensi yang dikelola admin — diurutkan; guru memilih dari daftar ini.
   Bila tenant belum punya sesi kustom, sediakan default agar absensi tetap jalan. */
export function sessionTypesOf(tenantId) {
  const list = load().sessionTypes || [];
  const rows = list.filter((s) => s.tenantId === tenantId)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || (a.startTime || '').localeCompare(b.startTime || ''));
  if (rows.length) return rows;
  return [
    { id: '_pagi', tenantId, name: 'Pagi', startTime: '07:00', endTime: '08:00', order: 1 },
    { id: '_siang', tenantId, name: 'Siang', startTime: '13:00', endTime: '14:00', order: 2 },
  ];
}

export function studentsInUnit(unitType, unitId) {
  return list('students', (s) => (unitType === 'class' ? s.classId === unitId : s.halaqahId === unitId) && s.status === 'active');
}

export function attendanceRecap(studentId, fromDate) {
  const recap = { hadir: 0, izin: 0, sakit: 0, alfa: 0, terlambat: 0 };
  for (const ses of list('attendanceSessions', (a) => !fromDate || a.date >= fromDate)) {
    const rec = ses.records.find((r) => r.studentId === studentId);
    if (rec && recap[rec.status] !== undefined) recap[rec.status] += 1;
  }
  return recap;
}

export function billsOfStudent(studentId) {
  return list('bills', (b) => b.studentId === studentId).sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || ''));
}

export function outstandingOf(studentIds) {
  return list('bills', (b) => studentIds.includes(b.studentId) && b.status !== 'paid')
    .reduce((sum, b) => sum + (b.amount - (b.paidAmount || 0)), 0);
}

export function behaviorPoints(studentId) {
  return list('behaviorEvents', (e) => e.studentId === studentId && e.kind === 'violation')
    .reduce((s, e) => s + (e.points || 0), 0);
}
