/* ============================================================
   i18n — Bahasa Indonesia (default), English, العربية (RTL)
   Portal module dapat menambah kamusnya sendiri via I18n.extend().
   ============================================================ */

const dicts = {
  id: {
    'app.name': 'PondokOne',
    'app.tagline': 'Platform terpadu sekolah & pesantren',

    // Umum
    'common.save': 'Simpan',
    'common.cancel': 'Batal',
    'common.close': 'Tutup',
    'common.add': 'Tambah',
    'common.edit': 'Ubah',
    'common.delete': 'Hapus',
    'common.search': 'Cari…',
    'common.detail': 'Detail',
    'common.all': 'Semua',
    'common.back': 'Kembali',
    'common.today': 'Hari ini',
    'common.date': 'Tanggal',
    'common.status': 'Status',
    'common.action': 'Aksi',
    'common.name': 'Nama',
    'common.note': 'Catatan',
    'common.notes': 'Catatan',
    'common.total': 'Total',
    'common.period': 'Periode',
    'common.filter': 'Filter',
    'common.download': 'Unduh',
    'common.send': 'Kirim',
    'common.yes': 'Ya',
    'common.no': 'Tidak',
    'common.saved': 'Berhasil disimpan',
    'common.deleted': 'Data dihapus',
    'common.confirmDelete': 'Yakin ingin menghapus data ini?',
    'common.empty': 'Belum ada data',
    'common.required': 'Wajib diisi',
    'common.optional': 'Opsional',
    'common.viewAll': 'Lihat semua',
    'common.class': 'Kelas',
    'common.student': 'Siswa/Santri',
    'common.teacher': 'Guru/Ustadz',
    'common.guardian': 'Wali',
    'common.amount': 'Nominal',
    'common.dueDate': 'Jatuh tempo',
    'common.print': 'Cetak',
    'common.logout': 'Keluar',
    'common.offlineDraft': 'Tersimpan offline — akan disinkronkan',
    'common.offline': 'Offline — mode draf aktif',

    // Nav
    'nav.dashboard': 'Dashboard',
    'nav.home': 'Beranda',
    'nav.masterdata': 'Master Data',
    'nav.students': 'Santri & Murid',
    'nav.teachers': 'Guru & Ustadz',
    'nav.guardians': 'Orang Tua & Wali',
    'nav.structure': 'Struktur Akademik',
    'nav.academic': 'Akademik',
    'nav.attendance': 'Absensi',
    'nav.grades': 'Nilai',
    'nav.memorization': 'Hafalan',
    'nav.behavior': 'Perilaku',
    'nav.finance': 'Keuangan',
    'nav.billing': 'Tagihan',
    'nav.reconciliation': 'Rekonsiliasi',
    'nav.reports': 'Laporan',
    'nav.settings': 'Pengaturan',
    'nav.tenants': 'Tenant',
    'nav.plans': 'Paket Layanan',
    'nav.invoices': 'Invoice SaaS',
    'nav.audit': 'Audit & Support',
    'nav.classes': 'Kelas',
    'nav.tasks': 'Tugas',
    'nav.history': 'Riwayat',
    'nav.profile': 'Profil',
    'nav.progress': 'Perkembangan',
    'nav.bills': 'Tagihan',
    'nav.announcements': 'Pengumuman',

    // Auth
    'auth.welcome': 'Selamat datang',
    'auth.choosePortal': 'Pilih portal sesuai peran Anda',
    'auth.login': 'Masuk',
    'auth.identifier': 'Email / No. HP / Username',
    'auth.password': 'Kata sandi',
    'auth.remember': 'Ingat perangkat ini',
    'auth.forgot': 'Lupa kata sandi?',
    'auth.demoHint': 'Akun demo — klik untuk mengisi otomatis:',
    'auth.invalid': 'Identitas atau kata sandi salah',
    'auth.portal.master': 'Web Master',
    'auth.portal.masterDesc': 'Pengelola platform SaaS',
    'auth.portal.yayasan': 'Yayasan / Lembaga',
    'auth.portal.yayasanDesc': 'Pantau seluruh sekolah naungan',
    'auth.portal.admin': 'Admin',
    'auth.portal.adminDesc': 'Admin sekolah / pondok',
    'auth.portal.guru': 'Guru / Ustadz',
    'auth.portal.guruDesc': 'Input operasional harian',
    'auth.portal.ortu': 'Orang Tua',
    'auth.portal.ortuDesc': 'Pantau anak & bayar tagihan',

    // Status umum
    'status.active': 'Aktif',
    'status.inactive': 'Nonaktif',
    'status.trial': 'Trial',
    'status.overdue': 'Terlambat',
    'status.suspended': 'Ditangguhkan',
    'status.paid': 'Lunas',
    'status.unpaid': 'Belum dibayar',
    'status.pending': 'Menunggu',
    'status.failed': 'Gagal',
    'status.expired': 'Kedaluwarsa',
    'status.draft': 'Draf',
    'status.sent': 'Terkirim',
    'status.partial': 'Sebagian',

    // Absensi
    'att.hadir': 'Hadir',
    'att.izin': 'Izin',
    'att.sakit': 'Sakit',
    'att.alfa': 'Alfa',
    'att.terlambat': 'Terlambat',
    'att.session': 'Sesi',

    // Hafalan
    'memo.result.lancar': 'Lancar',
    'memo.result.cukup': 'Cukup',
    'memo.result.ulang': 'Perlu ulang',
    'memo.result.tidak': 'Tidak setor',

    // Settings
    'settings.title': 'Pengaturan',
    'settings.account': 'Akun',
    'settings.appearance': 'Tampilan',
    'settings.language': 'Bahasa',
    'settings.notifications': 'Notifikasi',
    'settings.regional': 'Regional',
    'settings.branding': 'Branding',
    'settings.theme': 'Tema',
    'settings.theme.dark': 'Gelap',
    'settings.theme.light': 'Terang',
    'settings.theme.system': 'Ikuti sistem',
    'settings.density': 'Kepadatan tampilan',
    'settings.density.comfortable': 'Nyaman',
    'settings.density.compact': 'Padat',
    'settings.textsize': 'Ukuran teks',
    'settings.textsize.small': 'Kecil',
    'settings.textsize.default': 'Standar',
    'settings.textsize.large': 'Besar',
    'settings.langNote': 'Perubahan bahasa berlaku instan tanpa login ulang.',
    'settings.resetDemo': 'Reset data demo',
    'settings.resetDemoDone': 'Data demo dikembalikan ke awal',
  },

  en: {
    'app.name': 'PondokOne',
    'app.tagline': 'Unified school & pesantren platform',

    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.add': 'Add',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search…',
    'common.detail': 'Detail',
    'common.all': 'All',
    'common.back': 'Back',
    'common.today': 'Today',
    'common.date': 'Date',
    'common.status': 'Status',
    'common.action': 'Action',
    'common.name': 'Name',
    'common.note': 'Note',
    'common.notes': 'Notes',
    'common.total': 'Total',
    'common.period': 'Period',
    'common.filter': 'Filter',
    'common.download': 'Download',
    'common.send': 'Send',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.saved': 'Saved successfully',
    'common.deleted': 'Data deleted',
    'common.confirmDelete': 'Delete this record?',
    'common.empty': 'No data yet',
    'common.required': 'Required',
    'common.optional': 'Optional',
    'common.viewAll': 'View all',
    'common.class': 'Class',
    'common.student': 'Student',
    'common.teacher': 'Teacher',
    'common.guardian': 'Guardian',
    'common.amount': 'Amount',
    'common.dueDate': 'Due date',
    'common.print': 'Print',
    'common.logout': 'Sign out',
    'common.offlineDraft': 'Saved offline — will sync',
    'common.offline': 'Offline — draft mode active',

    'nav.dashboard': 'Dashboard',
    'nav.home': 'Home',
    'nav.masterdata': 'Master Data',
    'nav.students': 'Students',
    'nav.teachers': 'Teachers',
    'nav.guardians': 'Guardians',
    'nav.structure': 'Academic Structure',
    'nav.academic': 'Academic',
    'nav.attendance': 'Attendance',
    'nav.grades': 'Grades',
    'nav.memorization': 'Memorization',
    'nav.behavior': 'Behavior',
    'nav.finance': 'Finance',
    'nav.billing': 'Bills',
    'nav.reconciliation': 'Reconciliation',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'nav.tenants': 'Tenants',
    'nav.plans': 'Plans',
    'nav.invoices': 'SaaS Invoices',
    'nav.audit': 'Audit & Support',
    'nav.classes': 'Classes',
    'nav.tasks': 'Tasks',
    'nav.history': 'History',
    'nav.profile': 'Profile',
    'nav.progress': 'Progress',
    'nav.bills': 'Bills',
    'nav.announcements': 'Announcements',

    'auth.welcome': 'Welcome',
    'auth.choosePortal': 'Choose the portal for your role',
    'auth.login': 'Sign in',
    'auth.identifier': 'Email / Phone / Username',
    'auth.password': 'Password',
    'auth.remember': 'Remember this device',
    'auth.forgot': 'Forgot password?',
    'auth.demoHint': 'Demo accounts — click to autofill:',
    'auth.invalid': 'Invalid credentials',
    'auth.portal.master': 'Web Master',
    'auth.portal.masterDesc': 'SaaS platform operator',
    'auth.portal.yayasan': 'Foundation',
    'auth.portal.yayasanDesc': 'Monitor all schools under the foundation',
    'auth.portal.admin': 'Admin',
    'auth.portal.adminDesc': 'School / pesantren admin',
    'auth.portal.guru': 'Teacher',
    'auth.portal.guruDesc': 'Daily operational input',
    'auth.portal.ortu': 'Parent',
    'auth.portal.ortuDesc': 'Monitor children & pay bills',

    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'status.trial': 'Trial',
    'status.overdue': 'Overdue',
    'status.suspended': 'Suspended',
    'status.paid': 'Paid',
    'status.unpaid': 'Unpaid',
    'status.pending': 'Pending',
    'status.failed': 'Failed',
    'status.expired': 'Expired',
    'status.draft': 'Draft',
    'status.sent': 'Sent',
    'status.partial': 'Partial',

    'att.hadir': 'Present',
    'att.izin': 'Permit',
    'att.sakit': 'Sick',
    'att.alfa': 'Absent',
    'att.terlambat': 'Late',
    'att.session': 'Session',

    'memo.result.lancar': 'Fluent',
    'memo.result.cukup': 'Fair',
    'memo.result.ulang': 'Repeat',
    'memo.result.tidak': 'No recitation',

    'settings.title': 'Settings',
    'settings.account': 'Account',
    'settings.appearance': 'Appearance',
    'settings.language': 'Language',
    'settings.notifications': 'Notifications',
    'settings.regional': 'Regional',
    'settings.branding': 'Branding',
    'settings.theme': 'Theme',
    'settings.theme.dark': 'Dark',
    'settings.theme.light': 'Light',
    'settings.theme.system': 'System default',
    'settings.density': 'Display density',
    'settings.density.comfortable': 'Comfortable',
    'settings.density.compact': 'Compact',
    'settings.textsize': 'Text size',
    'settings.textsize.small': 'Small',
    'settings.textsize.default': 'Default',
    'settings.textsize.large': 'Large',
    'settings.langNote': 'Language changes apply instantly, no re-login needed.',
    'settings.resetDemo': 'Reset demo data',
    'settings.resetDemoDone': 'Demo data restored',
  },

  ar: {
    'app.name': 'PondokOne',
    'app.tagline': 'منصة موحدة للمدرسة والمعهد',

    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.close': 'إغلاق',
    'common.add': 'إضافة',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.search': 'بحث…',
    'common.detail': 'تفاصيل',
    'common.all': 'الكل',
    'common.back': 'رجوع',
    'common.today': 'اليوم',
    'common.date': 'التاريخ',
    'common.status': 'الحالة',
    'common.action': 'إجراء',
    'common.name': 'الاسم',
    'common.note': 'ملاحظة',
    'common.notes': 'ملاحظات',
    'common.total': 'المجموع',
    'common.period': 'الفترة',
    'common.filter': 'تصفية',
    'common.download': 'تنزيل',
    'common.send': 'إرسال',
    'common.yes': 'نعم',
    'common.no': 'لا',
    'common.saved': 'تم الحفظ بنجاح',
    'common.deleted': 'تم حذف البيانات',
    'common.confirmDelete': 'هل تريد حذف هذا السجل؟',
    'common.empty': 'لا توجد بيانات بعد',
    'common.required': 'إلزامي',
    'common.optional': 'اختياري',
    'common.viewAll': 'عرض الكل',
    'common.class': 'الفصل',
    'common.student': 'الطالب',
    'common.teacher': 'المعلم',
    'common.guardian': 'ولي الأمر',
    'common.amount': 'المبلغ',
    'common.dueDate': 'تاريخ الاستحقاق',
    'common.print': 'طباعة',
    'common.logout': 'تسجيل الخروج',
    'common.offlineDraft': 'حُفظ دون اتصال — ستتم المزامنة',
    'common.offline': 'غير متصل — وضع المسودة نشط',

    'nav.dashboard': 'لوحة التحكم',
    'nav.home': 'الرئيسية',
    'nav.masterdata': 'البيانات الأساسية',
    'nav.students': 'الطلاب',
    'nav.teachers': 'المعلمون',
    'nav.guardians': 'أولياء الأمور',
    'nav.structure': 'الهيكل الأكاديمي',
    'nav.academic': 'الأكاديمية',
    'nav.attendance': 'الحضور',
    'nav.grades': 'الدرجات',
    'nav.memorization': 'التحفيظ',
    'nav.behavior': 'السلوك',
    'nav.finance': 'المالية',
    'nav.billing': 'الفواتير',
    'nav.reconciliation': 'التسوية',
    'nav.reports': 'التقارير',
    'nav.settings': 'الإعدادات',
    'nav.tenants': 'المؤسسات',
    'nav.plans': 'الباقات',
    'nav.invoices': 'فواتير الخدمة',
    'nav.audit': 'التدقيق والدعم',
    'nav.classes': 'الفصول',
    'nav.tasks': 'المهام',
    'nav.history': 'السجل',
    'nav.profile': 'الملف الشخصي',
    'nav.progress': 'التقدم',
    'nav.bills': 'الفواتير',
    'nav.announcements': 'الإعلانات',

    'auth.welcome': 'مرحبًا بكم',
    'auth.choosePortal': 'اختر البوابة حسب دورك',
    'auth.login': 'تسجيل الدخول',
    'auth.identifier': 'البريد / الهاتف / اسم المستخدم',
    'auth.password': 'كلمة المرور',
    'auth.remember': 'تذكر هذا الجهاز',
    'auth.forgot': 'نسيت كلمة المرور؟',
    'auth.demoHint': 'حسابات تجريبية — انقر للتعبئة التلقائية:',
    'auth.invalid': 'بيانات الدخول غير صحيحة',
    'auth.portal.master': 'مدير المنصة',
    'auth.portal.masterDesc': 'مشغل منصة الخدمة',
    'auth.portal.yayasan': 'المؤسسة',
    'auth.portal.yayasanDesc': 'متابعة جميع المدارس التابعة',
    'auth.portal.admin': 'الإدارة',
    'auth.portal.adminDesc': 'إدارة المدرسة / المعهد',
    'auth.portal.guru': 'المعلم',
    'auth.portal.guruDesc': 'الإدخال التشغيلي اليومي',
    'auth.portal.ortu': 'ولي الأمر',
    'auth.portal.ortuDesc': 'متابعة الأبناء ودفع الفواتير',

    'status.active': 'نشط',
    'status.inactive': 'غير نشط',
    'status.trial': 'تجريبي',
    'status.overdue': 'متأخر',
    'status.suspended': 'موقوف',
    'status.paid': 'مدفوع',
    'status.unpaid': 'غير مدفوع',
    'status.pending': 'قيد الانتظار',
    'status.failed': 'فشل',
    'status.expired': 'منتهي',
    'status.draft': 'مسودة',
    'status.sent': 'مرسل',
    'status.partial': 'جزئي',

    'att.hadir': 'حاضر',
    'att.izin': 'إذن',
    'att.sakit': 'مريض',
    'att.alfa': 'غائب',
    'att.terlambat': 'متأخر',
    'att.session': 'الجلسة',

    'memo.result.lancar': 'متقن',
    'memo.result.cukup': 'مقبول',
    'memo.result.ulang': 'إعادة',
    'memo.result.tidak': 'لم يسمّع',

    'settings.title': 'الإعدادات',
    'settings.account': 'الحساب',
    'settings.appearance': 'المظهر',
    'settings.language': 'اللغة',
    'settings.notifications': 'الإشعارات',
    'settings.regional': 'الإقليمية',
    'settings.branding': 'الهوية',
    'settings.theme': 'السمة',
    'settings.theme.dark': 'داكن',
    'settings.theme.light': 'فاتح',
    'settings.theme.system': 'حسب النظام',
    'settings.density': 'كثافة العرض',
    'settings.density.comfortable': 'مريح',
    'settings.density.compact': 'مضغوط',
    'settings.textsize': 'حجم النص',
    'settings.textsize.small': 'صغير',
    'settings.textsize.default': 'افتراضي',
    'settings.textsize.large': 'كبير',
    'settings.langNote': 'يتم تطبيق تغيير اللغة فورًا دون إعادة تسجيل الدخول.',
    'settings.resetDemo': 'إعادة تعيين البيانات التجريبية',
    'settings.resetDemoDone': 'تمت استعادة البيانات التجريبية',
  },
};

const LANGS = [
  { code: 'id', label: 'Bahasa Indonesia', dir: 'ltr' },
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
];

let current = localStorage.getItem('po.lang') || 'id';
const listeners = new Set();

export function t(key, vars) {
  let s = dicts[current]?.[key] ?? dicts.id[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}

export function getLang() { return current; }
export function getLangs() { return LANGS; }
export function isRTL() { return current === 'ar'; }

export function setLang(code) {
  if (!dicts[code]) return;
  current = code;
  localStorage.setItem('po.lang', code);
  applyDir();
  listeners.forEach((fn) => fn(code));
}

export function onLangChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function applyDir() {
  const lang = LANGS.find((l) => l.code === current);
  document.documentElement.lang = current;
  document.documentElement.dir = lang?.dir || 'ltr';
}

/** Portal modules menambah kamus sendiri: I18n.extend({ id:{...}, en:{...}, ar:{...} }) */
export function extend(extra) {
  for (const [lang, entries] of Object.entries(extra)) {
    if (!dicts[lang]) dicts[lang] = {};
    Object.assign(dicts[lang], entries);
  }
}

/* ---------- Format lokal ---------- */
const LOCALE_MAP = { id: 'id-ID', en: 'en-US', ar: 'ar-SA' };

export function fmtMoney(n, currency = 'IDR') {
  return new Intl.NumberFormat(LOCALE_MAP[current] || 'id-ID', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(n || 0);
}

export function fmtNum(n) {
  return new Intl.NumberFormat(LOCALE_MAP[current] || 'id-ID').format(n || 0);
}

export function fmtDate(iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat(LOCALE_MAP[current] || 'id-ID', opts).format(new Date(iso));
}

export function fmtDateTime(iso) {
  return fmtDate(iso, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export const I18n = { t, getLang, getLangs, setLang, onLangChange, extend, isRTL, applyDir, fmtMoney, fmtNum, fmtDate, fmtDateTime };
export default I18n;
