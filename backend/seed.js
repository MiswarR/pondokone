/* ============================================================
   Seed data demo — versi ringkas dari web/js/core/store.js.
   Akun demo SAMA dengan web, tetapi password disimpan sebagai
   hash sha256+salt (tidak ada plaintext di db.json).
   Role mengikuti kontrak API: super_admin / tenant_admin / teacher / guardian.
   ============================================================ */
import crypto from 'node:crypto';

export function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex');
}

function withPassword(user, plain) {
  const salt = crypto.randomBytes(8).toString('hex');
  return { ...user, passwordSalt: salt, passwordHash: hashPassword(plain, salt) };
}

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

let seedCounter = 0;
function sid(prefix) {
  seedCounter += 1;
  return `${prefix}_seed_${String(seedCounter).padStart(3, '0')}`;
}

export function buildSeed() {
  const T1 = 'ten_alhikmah';
  const T2 = 'ten_cahaya';
  const now = new Date().toISOString();
  const monthName = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const plans = [
    { id: 'pln_basic', name: 'Basic', monthlyBase: 500000, perStudent: 3000, features: ['Akademik', 'Absensi'], invoiceDay: 1, graceDays: 14 },
    { id: 'pln_std', name: 'Standard', monthlyBase: 1000000, perStudent: 4000, features: ['Akademik', 'Absensi', 'Hafalan', 'Perilaku', 'Keuangan'], invoiceDay: 1, graceDays: 14 },
    { id: 'pln_prm', name: 'Premium', monthlyBase: 2000000, perStudent: 5000, features: ['Semua modul', 'Notifikasi premium', 'Support prioritas'], invoiceDay: 1, graceDays: 21 },
  ];

  const tenants = [
    {
      id: T1, name: 'Ponpes Al-Hikmah', code: 'alhikmah', type: 'gabungan',
      subdomain: 'alhikmah.pondokone.id', planId: 'pln_std',
      modules: ['akademik', 'hafalan', 'perilaku', 'keuangan', 'notifikasi'],
      studentQuota: 300, activeStudents: 8,
      adminName: 'H. Syamsul Arifin', adminEmail: 'admin@alhikmah.sch.id', adminPhone: '0811000002',
      subscriptionStatus: 'active',
      address: 'Jl. Raya Pesantren No. 12, Bogor', phone: '0251-777888', email: 'info@alhikmah.sch.id',
      accentColor: '#2f7bff', defaultLang: 'id',
    },
    {
      id: T2, name: 'SDIT Cahaya Ilmu', code: 'cahayailmu', type: 'sekolah',
      subdomain: 'cahayailmu.pondokone.id', planId: 'pln_basic',
      modules: ['akademik', 'keuangan'],
      studentQuota: 150, activeStudents: 1,
      adminName: 'Dewi Lestari, S.Pd', adminEmail: 'admin@cahayailmu.sch.id', adminPhone: '0811000003',
      subscriptionStatus: 'trial',
      address: 'Jl. Melati No. 8, Depok', phone: '021-555444', email: 'info@cahayailmu.sch.id',
      accentColor: '#2ecc8f', defaultLang: 'id',
    },
  ];

  const classes = [
    { id: 'cls_7a', tenantId: T1, name: 'Kelas 7A', level: 'SMP', homeroomId: 'usr_guru1', capacity: 28, status: 'active' },
    { id: 'cls_7b', tenantId: T1, name: 'Kelas 7B', level: 'SMP', homeroomId: 'usr_guru2', capacity: 28, status: 'active' },
    { id: 'cls_8a', tenantId: T1, name: 'Kelas 8A', level: 'SMP', homeroomId: 'usr_guru3', capacity: 30, status: 'active' },
    { id: 'cls_c1', tenantId: T2, name: 'Kelas 1 Ibnu Sina', level: 'SD', homeroomId: null, capacity: 25, status: 'active' },
  ];

  const halaqahs = [
    { id: 'hlq_umar', tenantId: T1, name: 'Halaqah Umar bin Khattab', musyrifId: 'usr_guru1', target: 'Juz 30 + Juz 29', schedule: 'Ba’da Subuh & Maghrib' },
    { id: 'hlq_ali', tenantId: T1, name: 'Halaqah Ali bin Abi Thalib', musyrifId: 'usr_guru2', target: 'Juz 30', schedule: 'Ba’da Subuh' },
  ];

  const subjects = [
    { id: 'sub_mtk', tenantId: T1, code: 'MTK', name: 'Matematika', category: 'umum', teacherIds: ['usr_guru3'] },
    { id: 'sub_bind', tenantId: T1, code: 'BIND', name: 'Bahasa Indonesia', category: 'umum', teacherIds: ['usr_guru2'] },
    { id: 'sub_fiqih', tenantId: T1, code: 'FQH', name: 'Fiqih', category: 'pesantren', teacherIds: ['usr_guru1'] },
    { id: 'sub_barab', tenantId: T1, code: 'BAR', name: 'Bahasa Arab', category: 'pesantren', teacherIds: ['usr_guru1'] },
  ];

  const gradeComponents = [
    { id: 'gc_harian', tenantId: T1, name: 'Ulangan Harian', category: 'umum', weight: 30, maxScale: 100, publishPolicy: 'auto' },
    { id: 'gc_tugas', tenantId: T1, name: 'Tugas', category: 'umum', weight: 20, maxScale: 100, publishPolicy: 'auto' },
    { id: 'gc_pts', tenantId: T1, name: 'PTS', category: 'umum', weight: 20, maxScale: 100, publishPolicy: 'approval' },
  ];

  const behaviorRules = [
    { id: 'br_telat', tenantId: T1, code: 'R-01', name: 'Terlambat masuk kelas/halaqah', category: 'ringan', points: 5, defaultAction: 'Teguran dan pembinaan wali kelas' },
    { id: 'br_asrama', tenantId: T1, code: 'S-02', name: 'Melanggar disiplin asrama', category: 'sedang', points: 20, defaultAction: 'Pembinaan musyrif' },
    { id: 'br_kabur', tenantId: T1, code: 'B-01', name: 'Keluar pondok tanpa izin', category: 'berat', points: 50, defaultAction: 'Pemanggilan wali dan surat peringatan' },
  ];

  /* --- Siswa (ringkas: 8 di T1 + 1 di T2) --- */
  const studentDefs = [
    ['std_01', 'Ahmad Fauzan', 'L', 'cls_7a', 'hlq_umar', ['usr_wali1']],
    ['std_02', 'Muhammad Rizki Pratama', 'L', 'cls_7a', 'hlq_umar', ['usr_wali2']],
    ['std_03', 'Abdullah Hasan', 'L', 'cls_7a', 'hlq_umar', ['usr_wali2']],
    ['std_04', 'Umar Said', 'L', 'cls_7a', 'hlq_ali', ['usr_wali2']],
    ['std_05', 'Fatimah Azzahra', 'P', 'cls_7b', 'hlq_ali', ['usr_wali1']],
    ['std_06', 'Aisyah Putri Rahma', 'P', 'cls_7b', 'hlq_ali', ['usr_wali2']],
    ['std_07', 'Hamzah Alfarizi', 'L', 'cls_8a', 'hlq_umar', ['usr_wali2']],
    ['std_08', 'Maryam Shafiyya', 'P', 'cls_8a', 'hlq_ali', ['usr_wali2']],
  ];
  const students = studentDefs.map(([id, name, gender, classId, halaqahId, guardianIds], i) => ({
    id, tenantId: T1,
    nis: `2026${String(i + 1).padStart(3, '0')}`,
    name, gender, classId, halaqahId, roomId: null, guardianIds,
    birthDate: `201${2 + (i % 3)}-0${(i % 9) + 1}-1${i % 9}`,
    status: 'active',
    createdAt: now,
  }));
  students.push({
    id: 'std_c1', tenantId: T2, nis: '2026101', name: 'Alya Kirana', gender: 'P',
    classId: 'cls_c1', halaqahId: null, roomId: null, guardianIds: [], birthDate: '2018-03-02',
    status: 'active', createdAt: now,
  });

  /* --- Users: akun demo SAMA dengan web, password di-hash --- */
  const users = [
    withPassword({ id: 'usr_master', tenantId: null, role: 'super_admin', name: 'Pusat PondokOne', identifier: 'master@pondokone.id', email: 'master@pondokone.id', phone: '0811000001', status: 'active' }, 'master123'),
    withPassword({ id: 'usr_admin1', tenantId: T1, role: 'tenant_admin', name: 'H. Syamsul Arifin', identifier: 'admin@alhikmah.sch.id', email: 'admin@alhikmah.sch.id', phone: '0811000002', status: 'active' }, 'admin123'),
    withPassword({ id: 'usr_admin2', tenantId: T2, role: 'tenant_admin', name: 'Dewi Lestari, S.Pd', identifier: 'admin@cahayailmu.sch.id', email: 'admin@cahayailmu.sch.id', phone: '0811000003', status: 'active' }, 'admin123'),
    withPassword({
      id: 'usr_guru1', tenantId: T1, role: 'teacher', name: 'Ust. Abdurrahman Hakim', identifier: 'ustadz@alhikmah.sch.id',
      email: 'ustadz@alhikmah.sch.id', phone: '0812000001', status: 'active',
      staffRoles: ['ustadz', 'wali_kelas', 'musyrif'],
      classIds: ['cls_7a'], halaqahIds: ['hlq_umar'], subjectIds: ['sub_fiqih', 'sub_barab'], roomIds: [],
    }, 'guru123'),
    withPassword({
      id: 'usr_guru2', tenantId: T1, role: 'teacher', name: 'Ust. Lukman Hafidz', identifier: 'lukman@alhikmah.sch.id',
      email: 'lukman@alhikmah.sch.id', phone: '0812000002', status: 'active',
      staffRoles: ['ustadz', 'musyrif'],
      classIds: ['cls_7b'], halaqahIds: ['hlq_ali'], subjectIds: ['sub_bind'], roomIds: [],
    }, 'guru123'),
    withPassword({
      id: 'usr_guru3', tenantId: T1, role: 'teacher', name: 'Ibu Ratna Sari, S.Pd', identifier: 'ratna@alhikmah.sch.id',
      email: 'ratna@alhikmah.sch.id', phone: '0812000003', status: 'active',
      staffRoles: ['guru'],
      classIds: ['cls_8a'], halaqahIds: [], subjectIds: ['sub_mtk'], roomIds: [],
    }, 'guru123'),
    withPassword({
      id: 'usr_wali1', tenantId: T1, role: 'guardian', name: 'Bpk. Hendra Wijaya', identifier: 'wali@gmail.com',
      email: 'wali@gmail.com', phone: '0813000001', status: 'active',
      relation: 'ayah', childIds: ['std_01', 'std_05'],
      notifPrefs: { nilai: true, absensi: true, perilaku: true, tagihan: true },
    }, 'wali123'),
    withPassword({
      id: 'usr_wali2', tenantId: T1, role: 'guardian', name: 'Ibu Sri Mulyani', identifier: 'sri@gmail.com',
      email: 'sri@gmail.com', phone: '0813000002', status: 'active',
      relation: 'ibu', childIds: ['std_02', 'std_03', 'std_04', 'std_06', 'std_07', 'std_08'],
      notifPrefs: { nilai: true, absensi: true, perilaku: true, tagihan: true },
    }, 'wali123'),
  ];

  /* --- Absensi 3 hari terakhir --- */
  const attendanceSessions = [];
  const statuses = ['hadir', 'hadir', 'hadir', 'hadir', 'izin', 'sakit', 'terlambat', 'alfa'];
  const classTeacher = { cls_7a: 'usr_guru1', cls_7b: 'usr_guru2', cls_8a: 'usr_guru3' };
  for (let d = 3; d >= 1; d--) {
    for (const cls of ['cls_7a', 'cls_7b', 'cls_8a']) {
      const clsStudents = students.filter((s) => s.classId === cls);
      if (!clsStudents.length) continue;
      attendanceSessions.push({
        id: sid('att'), tenantId: T1, unitType: 'class', unitId: cls,
        date: daysAgo(d), session: 'Pagi',
        teacherId: classTeacher[cls],
        records: clsStudents.map((s, i) => ({
          studentId: s.id,
          status: statuses[(d * 3 + i) % statuses.length],
          note: '',
        })),
        createdAt: now,
      });
    }
  }

  /* --- Hafalan --- */
  const surahs = [['An-Naba’', 40], ['An-Nazi’at', 46], ['‘Abasa', 42], ['At-Takwir', 29]];
  const memoResults = ['lancar', 'lancar', 'cukup', 'ulang'];
  const memorizationRecords = [];
  students.filter((s) => s.tenantId === T1 && s.halaqahId).forEach((s, si) => {
    for (let d = 4; d >= 1; d -= 2) {
      const [surah, ayat] = surahs[(si + d) % surahs.length];
      memorizationRecords.push({
        id: sid('mem'), tenantId: T1, studentId: s.id, halaqahId: s.halaqahId,
        teacherId: s.halaqahId === 'hlq_umar' ? 'usr_guru1' : 'usr_guru2',
        date: daysAgo(d), type: 'quran',
        material: `QS. ${surah}`, fromAyah: 1, toAyah: Math.min(10 + d, ayat),
        result: memoResults[(si + d) % memoResults.length],
        score: 75 + ((si * d) % 25),
        note: '',
        createdAt: now,
      });
    }
  });

  /* --- Nilai --- */
  const gradeEntries = [];
  const gradePairs = [['sub_mtk', 'gc_harian'], ['sub_bind', 'gc_tugas'], ['sub_fiqih', 'gc_harian'], ['sub_barab', 'gc_tugas']];
  students.filter((s) => s.tenantId === T1).forEach((s, si) => {
    gradePairs.forEach(([subjectId, componentId], gi) => {
      gradeEntries.push({
        id: sid('grd'), tenantId: T1, studentId: s.id, subjectId, componentId,
        classId: s.classId,
        teacherId: subjects.find((x) => x.id === subjectId)?.teacherIds?.[0] || 'usr_guru1',
        date: daysAgo(3 + gi), score: 68 + ((si * 7 + gi * 11) % 32),
        note: '',
        published: gi !== 3, // satu entri belum published untuk uji filter wali
        createdAt: now,
      });
    });
  });

  /* --- Perilaku --- */
  const behaviorEvents = [
    { id: sid('bhv'), tenantId: T1, studentId: 'std_02', teacherId: 'usr_guru1', date: daysAgo(1), kind: 'violation', ruleId: 'br_telat', points: 5, chronology: 'Terlambat 15 menit masuk halaqah subuh.', followUp: 'Teguran lisan dan pembinaan singkat.', notifyGuardian: true, status: 'done', createdAt: now },
    { id: sid('bhv'), tenantId: T1, studentId: 'std_01', teacherId: 'usr_guru1', date: daysAgo(3), kind: 'good', ruleId: null, points: 0, chronology: 'Membantu membersihkan masjid tanpa diminta.', followUp: 'Apresiasi di depan halaqah.', notifyGuardian: true, status: 'done', createdAt: now },
  ];

  /* --- Keuangan siswa --- */
  const billProducts = [
    { id: 'bp_spp', tenantId: T1, name: 'SPP Bulanan', category: 'recurring', amount: 750000, dueRule: 'Tanggal 10 tiap bulan', allowInstallment: true, target: 'all' },
    { id: 'bp_taawun', tenantId: T1, name: 'Ta’awun Sosial', category: 'compulsory-donation', amount: 50000, dueRule: 'Tanggal 10 tiap bulan', allowInstallment: false, target: 'all' },
  ];

  const bills = [];
  students.filter((s) => s.tenantId === T1).forEach((s, i) => {
    bills.push({
      id: `bil_spp_${s.id}`, tenantId: T1, studentId: s.id, productId: 'bp_spp',
      name: 'SPP Bulanan', period: monthName, amount: 750000,
      paidAmount: i % 3 === 0 ? 750000 : i % 3 === 1 ? 0 : 300000,
      dueDate: daysAhead(5),
      status: i % 3 === 0 ? 'paid' : i % 3 === 1 ? 'unpaid' : 'partial',
      note: 'SPP bulan berjalan',
      createdAt: now,
    });
    bills.push({
      id: `bil_taw_${s.id}`, tenantId: T1, studentId: s.id, productId: 'bp_taawun',
      name: 'Ta’awun Sosial', period: monthName, amount: 50000,
      paidAmount: i % 2 === 0 ? 50000 : 0,
      dueDate: daysAhead(5),
      status: i % 2 === 0 ? 'paid' : 'unpaid',
      note: '',
      createdAt: now,
    });
  });

  const payments = [];
  const receipts = [];
  bills.filter((b) => b.status === 'paid' || b.status === 'partial').forEach((b, i) => {
    const student = students.find((s) => s.id === b.studentId);
    const pay = {
      id: sid('pay'), tenantId: T1, billId: b.id, studentId: b.studentId,
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
      id: sid('rcp'), tenantId: T1, paymentId: pay.id, billId: b.id, studentId: b.studentId,
      number: `RCP-2026${String(1000 + i)}`, amount: pay.amount, method: pay.method, paidAt: pay.paidAt,
      createdAt: now,
    });
  });

  /* --- SaaS invoices --- */
  const saasInvoices = [
    {
      id: 'sin_001', tenantId: T1, number: 'INV-SAAS-2606-001', period: 'Juni 2026',
      items: [
        { label: 'Standard base fee', amount: 1000000 },
        { label: 'Per siswa aktif (8 × Rp4.000)', amount: 32000 },
      ],
      total: 1032000, status: 'paid', dueDate: daysAgo(20), paidAt: daysAgo(18),
      createdAt: now,
    },
    {
      id: 'sin_002', tenantId: T2, number: 'INV-SAAS-2607-002', period: 'Juli 2026',
      items: [{ label: 'Basic base fee (trial berakhir)', amount: 500000 }],
      total: 500000, status: 'overdue', dueDate: daysAgo(3), paidAt: null,
      createdAt: now,
    },
  ];

  const announcements = [
    { id: sid('ann'), tenantId: T1, title: 'Libur Idul Adha', body: 'KBM diliburkan tanggal 12–14 Juli. Santri mukim tetap mengikuti agenda pondok.', date: daysAgo(2), audience: 'all', createdAt: now },
    { id: sid('ann'), tenantId: T1, title: 'Pembagian rapor semester', body: 'Rapor semester genap dapat diunduh orang tua mulai 20 Juli melalui aplikasi.', date: daysAgo(4), audience: 'guardian', createdAt: now },
  ];

  const notifications = [
    { id: sid('ntf'), tenantId: T1, target: 'usr_wali1', title: 'Tagihan mendekati jatuh tempo', body: `SPP ${monthName} jatuh tempo ${daysAhead(5)}.`, kind: 'warn', read: false, at: now, createdAt: now },
  ];

  return {
    plans, tenants, saasInvoices, users, students, classes, halaqahs, subjects,
    gradeComponents, behaviorRules,
    attendanceSessions, memorizationRecords,
    gradeEntries, behaviorEvents,
    billProducts, bills, payments, receipts,
    announcements, notifications,
    auditLogs: [],
  };
}
