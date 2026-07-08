/* ============================================================
   Portal Yayasan / Lembaga (Master Admin) — shell sidebar.
   Satu yayasan menaungi beberapa sekolah/pondok (tenant).
   Hak: pantau seluruh sekolah naungan (lihat saja untuk data
   akademik & keuangan), tambah/kelola sekolah cabang, kelola
   profil & logo yayasan. Tidak mengubah data operasional sekolah.
   ============================================================ */

import I18n, { t, fmtMoney, fmtDate } from '../core/i18n.js';
import * as Store from '../core/store.js';
import * as UI from '../core/ui.js';

const { el, clear } = UI;

I18n.extend({
  id: {
    'yys.nav.schools': 'Sekolah & Pondok',
    'yys.nav.academic': 'Ringkasan Akademik',
    'yys.nav.finance': 'Ringkasan Keuangan',
    'yys.nav.profile': 'Profil Yayasan',

    'yys.dash.title': 'Ringkasan Yayasan',
    'yys.dash.sub': 'Kondisi seluruh sekolah/pondok di bawah naungan',
    'yys.kpi.schools': 'Sekolah / Pondok',
    'yys.kpi.students': 'Santri & Siswa Aktif',
    'yys.kpi.teachers': 'Guru & Ustadz',
    'yys.kpi.outstanding': 'Tagihan Belum Terbayar',
    'yys.dash.perSchool': 'Per sekolah/pondok',

    'yys.sch.title': 'Sekolah & Pondok Naungan',
    'yys.sch.sub': 'Cabang-cabang pendidikan di bawah yayasan',
    'yys.sch.add': 'Tambah Sekolah/Pondok',
    'yys.sch.edit': 'Ubah Sekolah/Pondok',
    'yys.sch.students': 'Siswa',
    'yys.sch.teachers': 'Guru',
    'yys.sch.adminAccount': 'Akun admin sekolah',
    'yys.sch.initialPw': 'Kata sandi awal admin',
    'yys.sch.detail': 'Detail Sekolah',

    'yys.aca.title': 'Ringkasan Akademik',
    'yys.aca.sub': 'Pantauan lintas sekolah — hanya lihat',
    'yys.aca.attend7': 'Kehadiran 7 hari',
    'yys.aca.memo7': 'Setoran hafalan 7 hari',
    'yys.aca.grades': 'Nilai terpublikasi',
    'yys.aca.violations7': 'Pelanggaran 7 hari',
    'yys.aca.school': 'Pilih sekolah/pondok',

    'yys.fin.title': 'Ringkasan Keuangan',
    'yys.fin.sub': 'Tagihan santri/siswa seluruh sekolah — hanya lihat',
    'yys.fin.billed': 'Total ditagihkan',
    'yys.fin.paid': 'Terbayar',
    'yys.fin.outstanding': 'Belum terbayar',

    'yys.prf.title': 'Profil Yayasan',
    'yys.prf.sub': 'Identitas lembaga — tampil di invoice SaaS & halaman lembaga',
    'yys.prf.name': 'Nama yayasan/lembaga',
    'yys.prf.chairman': 'Ketua yayasan',
    'yys.prf.profile': 'Profil singkat',
    'yys.prf.logo': 'Logo yayasan',

    'yys.nav.treasury': 'Kebendaharaan',
    'yys.trs.title': 'Kebendaharaan Lembaga',
    'yys.trs.sub': 'Kas yayasan: dana BOS/BOP, pemasukan & pengeluaran, bukti transaksi',
    'yys.trs.in': 'Pemasukan',
    'yys.trs.out': 'Pengeluaran',
    'yys.trs.balance': 'Saldo Kas',
    'yys.trs.add': 'Catat Transaksi',
    'yys.trs.edit': 'Ubah Transaksi',
    'yys.trs.kind': 'Jenis',
    'yys.trs.category': 'Kategori',
    'yys.trs.amount': 'Jumlah (Rp)',
    'yys.trs.desc': 'Keterangan',
    'yys.trs.proof': 'Bukti transaksi',
    'yys.trs.viewProof': 'Lihat bukti',
    'yys.trs.noProof': 'Tanpa bukti',
    'yys.trs.readonly': 'Anda hanya dapat memantau laporan — pencatatan dilakukan oleh Bendahara.',
    'yys.trs.by': 'Dicatat oleh',

    'yys.nav.people': 'Siswa, Guru & Ortu',
    'yys.ppl.title': 'Data Siswa, Guru & Orang Tua',
    'yys.ppl.sub': 'Pantauan seluruh sekolah/pondok naungan — hanya lihat, pengelolaan data oleh admin masing-masing sekolah',
    'yys.ppl.school': 'Sekolah / Pondok',
    'yys.ppl.allSchools': 'Semua sekolah/pondok',
    'yys.ppl.children': 'Anak',
    'yys.ppl.class': 'Kelas',

    'yys.nav.accounts': 'Akun Pengurus',
    'yys.acc.title': 'Akun Pengurus Lembaga',
    'yys.acc.sub': 'Kelola akun sesuai jabatan — kapasitas fitur mengikuti tugasnya',
    'yys.acc.add': 'Tambah Akun',
    'yys.acc.edit': 'Ubah Akun',
    'yys.acc.jabatan': 'Jabatan',
    'yys.acc.initialPw': 'Kata sandi awal',
    'yys.acc.resetPw': 'Reset kata sandi',
    'yys.acc.adminOnly': 'Halaman ini khusus Master Admin lembaga.',
    'yys.acc.self': 'Akun Anda',

    'yys.jab.admin': 'Master Admin',
    'yys.jab.ketua': 'Ketua',
    'yys.jab.sekretaris': 'Sekretaris',
    'yys.jab.bendahara': 'Bendahara',
    'yys.jab.admin.desc': 'Kelola semua: sekolah, akun, profil, keuangan',
    'yys.jab.ketua.desc': 'Memantau seluruh laporan (tidak bisa mengedit)',
    'yys.jab.sekretaris.desc': 'Memantau seluruh laporan (tidak bisa mengedit)',
    'yys.jab.bendahara.desc': 'Mencatat pemasukan & pengeluaran + bukti transaksi',
  },
  en: {
    'yys.nav.schools': 'Schools',
    'yys.nav.academic': 'Academic Summary',
    'yys.nav.finance': 'Finance Summary',
    'yys.nav.profile': 'Foundation Profile',
    'yys.dash.title': 'Foundation Overview',
    'yys.sch.title': 'Schools Under Foundation',
    'yys.sch.add': 'Add School',
    'yys.aca.title': 'Academic Summary',
    'yys.fin.title': 'Finance Summary',
    'yys.prf.title': 'Foundation Profile',
  },
  ar: {
    'yys.nav.schools': 'المدارس',
    'yys.nav.academic': 'الملخص الأكاديمي',
    'yys.nav.finance': 'الملخص المالي',
    'yys.nav.profile': 'ملف المؤسسة',
    'yys.dash.title': 'نظرة عامة على المؤسسة',
    'yys.sch.title': 'المدارس التابعة',
    'yys.sch.add': 'إضافة مدرسة',
    'yys.aca.title': 'الملخص الأكاديمي',
    'yys.fin.title': 'الملخص المالي',
    'yys.prf.title': 'ملف المؤسسة',
  },
});

/* ---------- Util ---------- */
function fnd(ctx) { return Store.get('foundations', ctx.session.foundationId); }
function mySchools(ctx) { return Store.tenantsOfFoundation(ctx.session.foundationId); }
function daysAgoIso(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); }

/* Jabatan pengurus: admin (Master Admin) | bendahara | sekretaris | ketua.
   Kapasitas fitur mengikuti jabatan — lihat navGroups & guard tiap route. */
const JABATAN = ['admin', 'bendahara', 'sekretaris', 'ketua'];
function jabatanOf(ctx) {
  return Store.get('users', ctx.session.userId)?.fndRole || 'admin';
}
const isMasterAdmin = (ctx) => jabatanOf(ctx) === 'admin';
/* Pencatatan kas HANYA oleh Bendahara — Master Admin, Ketua, dan
   Sekretaris murni memantau laporan tanpa bisa mengubah. */
const canRecordFinance = (ctx) => jabatanOf(ctx) === 'bendahara';

function adminOnlyNotice(container) {
  container.append(UI.emptyState(t('yys.acc.adminOnly'), '🔒'));
}

/* Unggah gambar bukti → dataURL (diperkecil agar hemat penyimpanan) */
function imagePicker(onReady, maxSize = 800) {
  const fileIn = UI.el('input', { type: 'file', accept: 'image/*', style: { display: 'none' } });
  fileIn.addEventListener('change', () => {
    const f = fileIn.files?.[0];
    if (!f) return;
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => { img.src = reader.result; };
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      onReady(canvas.toDataURL('image/jpeg', 0.78));
    };
    reader.readAsDataURL(f);
  });
  return fileIn;
}

function kv(label, value) {
  return el('div', { class: 'row between', style: { padding: '4px 0', gap: 'var(--s-3)' } },
    el('span', { class: 'muted small' }, label),
    el('span', { class: 'small', style: { textAlign: 'end' } }, value),
  );
}

function schoolStats(tn) {
  const students = Store.studentsOf(tn.id).filter((s) => s.status === 'active');
  const teachers = Store.list('users', (u) => u.role === 'teacher' && u.tenantId === tn.id);
  const outstanding = Store.outstandingOf(students.map((s) => s.id));
  return { students: students.length, teachers: teachers.length, outstanding };
}

/* Rekap 7 hari per sekolah */
function academicStats(tid) {
  const from = daysAgoIso(7);
  const sessions = Store.list('attendanceSessions', (a) => a.tenantId === tid && a.date >= from);
  let present = 0, total = 0;
  for (const s of sessions) for (const r of s.records) { total += 1; if (r.status === 'hadir' || r.status === 'terlambat') present += 1; }
  const memo = Store.list('memorizationRecords', (m) => m.tenantId === tid && m.date >= from).length;
  const grades = Store.list('gradeEntries', (g) => g.tenantId === tid && g.published).length;
  const violations = Store.list('behaviorEvents', (b) => b.tenantId === tid && b.kind === 'violation' && b.date >= from).length;
  return { attendPct: total ? Math.round((present / total) * 100) : null, sessions: sessions.length, memo, grades, violations };
}

/* ---------- Form sekolah (tambah cabang / ubah) ---------- */
const SCHOOL_TYPES = ['sekolah', 'pesantren', 'gabungan'];

function schoolForm(existing, ctx, afterSave) {
  const f = {
    name: UI.input({ value: existing?.name || '' }),
    code: UI.input({ value: existing?.code || '' }),
    type: UI.select(SCHOOL_TYPES.map((v) => ({ value: v, label: t(`mst.type.${v}`), selected: existing?.type === v }))),
    quota: UI.input({ type: 'number', value: existing?.studentQuota ?? 100 }),
    address: UI.input({ value: existing?.address || '' }),
    adminName: UI.input({ value: existing?.adminName || '' }),
    adminEmail: UI.input({ type: 'email', value: existing?.adminEmail || '' }),
    adminPhone: UI.input({ value: existing?.adminPhone || '' }),
    adminPw: UI.passwordInput({ placeholder: 'Min. 6 karakter' }),
  };
  const m = UI.modal({
    title: existing ? t('yys.sch.edit') : t('yys.sch.add'),
    wide: true,
    body: el('div', { class: 'form-grid' },
      UI.field(t('common.name'), f.name), UI.field(t('mst.tenants.code'), f.code),
      UI.field(t('mst.tenants.type'), f.type), UI.field(t('mst.tenants.quota'), f.quota),
      el('div', { class: 'full' }, UI.field(t('mst.tenants.address'), f.address)),
      UI.field(t('mst.tenants.adminName'), f.adminName), UI.field(t('mst.tenants.adminEmail'), f.adminEmail),
      UI.field(t('mst.tenants.adminPhone'), f.adminPhone),
      existing ? null : UI.field(t('yys.sch.initialPw'), f.adminPw, 'Dipakai admin sekolah untuk login pertama'),
    ),
    footer: [
      el('button', { class: 'btn ghost', onclick: () => m.close() }, t('common.cancel')),
      el('button', {
        class: 'btn primary',
        onclick: () => {
          if (!f.name.value.trim() || !f.code.value.trim()) { UI.toast(t('common.required'), 'warn'); return; }
          const data = {
            foundationId: ctx.session.foundationId,
            name: f.name.value.trim(), code: f.code.value.trim(), type: f.type.value,
            studentQuota: Number(f.quota.value || 0), address: f.address.value.trim() || null,
            adminName: f.adminName.value.trim() || null, adminEmail: f.adminEmail.value.trim() || null,
            adminPhone: f.adminPhone.value.trim() || null,
          };
          if (existing) {
            Store.update('tenants', existing.id, data, ctx.session.userId);
          } else {
            const pw = f.adminPw.value.trim();
            if (data.adminEmail && pw.length < 6) { UI.toast('Kata sandi admin minimal 6 karakter', 'warn'); return; }
            const tn = Store.insert('tenants', {
              ...data,
              planId: 'pln_basic', modules: ['akademik', 'keuangan'],
              activeStudents: 0, subscriptionStatus: 'active',
              accentColor: '#2f7bff', logoDataUrl: null, defaultLang: 'id',
              subdomain: `${data.code}.pondokone.id`,
            }, ctx.session.userId);
            /* Buat akun admin sekolah bila email diisi */
            if (data.adminEmail) {
              Store.insert('users', {
                tenantId: tn.id, role: 'admin', name: data.adminName || data.adminEmail,
                identifier: data.adminEmail, email: data.adminEmail, phone: data.adminPhone,
                password: pw, status: 'active',
              }, ctx.session.userId);
            }
          }
          UI.toast(t('common.saved'), 'ok'); m.close(); afterSave?.();
        },
      }, t('common.save')),
    ],
  });
}

function schoolDrawer(tn, ctx, refresh) {
  const st = schoolStats(tn);
  const aca = academicStats(tn.id);
  const d = UI.drawer({
    title: tn.name,
    body: el('div', { class: 'stack', style: { padding: 'var(--s-4)', gap: 'var(--s-4)' } },
      el('div', { class: 'row', style: { gap: '8px', flexWrap: 'wrap' } },
        UI.statusChip(tn.subscriptionStatus),
        UI.chip(t(`mst.type.${tn.type}`), 'info'),
      ),
      el('div', { class: 'panel' },
        el('div', { class: 'panel-title' }, t('yys.sch.detail')),
        kv(t('mst.tenants.code'), tn.code),
        kv(t('yys.sch.students'), `${st.students} / ${tn.studentQuota ?? 0}`),
        kv(t('yys.sch.teachers'), String(st.teachers)),
        kv(t('yys.fin.outstanding'), fmtMoney(st.outstanding)),
        kv(t('yys.aca.attend7'), aca.attendPct === null ? '—' : `${aca.attendPct}%`),
        kv(t('yys.aca.violations7'), String(aca.violations)),
        kv(t('mst.tenants.adminName'), tn.adminName || '—'),
        kv(t('mst.tenants.adminEmail'), tn.adminEmail || '—'),
        kv(t('mst.tenants.address'), tn.address || '—'),
      ),
      el('button', { class: 'btn primary', onclick: () => { d.close(); schoolForm(tn, ctx, refresh); } }, `✏️ ${t('common.edit')}`),
    ),
  });
}

/* ============================================================
   EXPORT PORTAL
   ============================================================ */
export default {
  id: 'yayasan',
  role: 'foundation_admin',
  shell: 'sidebar',
  defaultRoute: 'dashboard',
  /* Menu menyesuaikan jabatan: Master Admin melihat semua; bendahara fokus
     kebendaharaan; ketua/sekretaris hanya menu pantauan. */
  navGroups(ctx) {
    const jab = jabatanOf(ctx);
    const pemantau = ['admin', 'ketua', 'sekretaris'].includes(jab);
    const items = [
      { route: 'dashboard', icon: '📊', label: 'nav.dashboard' },
      ...(jab === 'admin' ? [{ route: 'schools', icon: '🏫', label: 'yys.nav.schools' }] : []),
      ...(pemantau ? [{ route: 'people', icon: '🎓', label: 'yys.nav.people' }] : []),
      { route: 'academic', icon: '📚', label: 'yys.nav.academic' },
      { route: 'finance', icon: '💰', label: 'yys.nav.finance' },
      { route: 'treasury', icon: '💵', label: 'yys.nav.treasury' },
      ...(jab === 'admin' ? [
        { route: 'accounts', icon: '👥', label: 'yys.nav.accounts' },
        { route: 'profile', icon: '🏛️', label: 'yys.nav.profile' },
      ] : []),
    ];
    return [{ items }];
  },

  routes: {
    /* ---------- Dashboard agregat ---------- */
    dashboard(container, ctx) {
      const schools = mySchools(ctx);
      const totals = schools.reduce((acc, tn) => {
        const st = schoolStats(tn);
        acc.students += st.students; acc.teachers += st.teachers; acc.outstanding += st.outstanding;
        return acc;
      }, { students: 0, teachers: 0, outstanding: 0 });

      container.append(
        UI.pageHead(t('yys.dash.title'), `${fnd(ctx)?.name || ''} — ${t('yys.dash.sub')}`),
        el('div', { class: 'grid grid-4' },
          UI.kpiCard({ label: t('yys.kpi.schools'), value: schools.length, onClick: () => ctx.navigate('yayasan/schools') }),
          UI.kpiCard({ label: t('yys.kpi.students'), value: totals.students, tone: 'ok' }),
          UI.kpiCard({ label: t('yys.kpi.teachers'), value: totals.teachers }),
          UI.kpiCard({ label: t('yys.kpi.outstanding'), value: fmtMoney(totals.outstanding), tone: totals.outstanding > 0 ? 'warn' : 'ok', onClick: () => ctx.navigate('yayasan/finance') }),
        ),
        el('div', { class: 'panel', style: { marginTop: 'var(--s-4)' } },
          el('div', { class: 'panel-title' }, t('yys.dash.perSchool')),
          UI.dataTable({
            columns: [
              { label: t('common.name'), render: (tn) => el('strong', {}, tn.name) },
              { label: t('mst.tenants.type'), render: (tn) => UI.chip(t(`mst.type.${tn.type}`), 'info') },
              { label: t('yys.sch.students'), render: (tn) => String(schoolStats(tn).students) },
              { label: t('yys.sch.teachers'), render: (tn) => String(schoolStats(tn).teachers) },
              { label: t('yys.fin.outstanding'), render: (tn) => fmtMoney(schoolStats(tn).outstanding) },
              { label: t('common.status'), render: (tn) => UI.statusChip(tn.subscriptionStatus) },
            ],
            rows: schools,
            onRowClick: (tn) => schoolDrawer(tn, ctx, () => ctx.rerender()),
          }),
        ),
      );
    },

    /* ---------- Direktori siswa/guru/ortu seluruh naungan (hanya lihat) ----------
       Tidak ada tombol tambah/ubah/hapus di sini — pengelolaan data siswa,
       guru, dan wali hanya dilakukan oleh admin sekolah masing-masing. */
    people(container, ctx) {
      const jab = jabatanOf(ctx);
      if (!['admin', 'ketua', 'sekretaris'].includes(jab)) { adminOnlyNotice(container); return; }

      const schools = mySchools(ctx);
      const tids = schools.map((tn) => tn.id);
      const schoolName = (tid) => schools.find((tn) => tn.id === tid)?.name || '—';
      const schoolChip = (tid) => UI.chip(schoolName(tid), 'info');

      let tab = 'students';
      let schoolFilter = 'all';
      const inScope = (tid) => tids.includes(tid) && (schoolFilter === 'all' || tid === schoolFilter);

      const host = el('div', { style: { marginTop: 'var(--s-3)' } });

      const renderTab = () => {
        clear(host);
        if (tab === 'students') {
          const rows = Store.list('students', (s) => inScope(s.tenantId));
          host.append(UI.dataTable({
            columns: [
              { label: t('common.name'), render: (s) => el('div', { class: 'row', style: { gap: '10px', flexWrap: 'nowrap' } }, UI.avatar(s.name), s.name) },
              { label: 'NIS', render: (s) => el('span', { class: 'mono small' }, s.nis || '—') },
              { label: t('yys.ppl.class'), render: (s) => Store.get('classes', s.classId)?.name || '—' },
              { label: t('yys.ppl.school'), render: (s) => schoolChip(s.tenantId) },
              { label: t('common.status'), render: (s) => UI.statusChip(s.status) },
            ],
            rows,
          }));
        } else if (tab === 'teachers') {
          const rows = Store.list('users', (u) => u.role === 'teacher' && inScope(u.tenantId));
          host.append(UI.dataTable({
            columns: [
              { label: t('common.name'), render: (u) => el('div', { class: 'row', style: { gap: '10px', flexWrap: 'nowrap' } }, UI.avatar(u.name), u.name) },
              { label: 'HP', render: (u) => u.phone || '—' },
              { label: t('adm.field.staffRoles'), render: (u) => el('div', { class: 'row', style: { gap: '4px', flexWrap: 'wrap' } }, (u.staffRoles || []).map((r) => UI.chip(r))) },
              { label: t('yys.ppl.school'), render: (u) => schoolChip(u.tenantId) },
            ],
            rows,
          }));
        } else {
          const rows = Store.list('users', (u) => u.role === 'guardian' && inScope(u.tenantId));
          host.append(UI.dataTable({
            columns: [
              { label: t('common.name'), render: (u) => el('div', { class: 'row', style: { gap: '10px', flexWrap: 'nowrap' } }, UI.avatar(u.name), u.name) },
              { label: t('adm.field.relation'), render: (u) => UI.chip(u.relation || 'wali') },
              { label: 'HP', render: (u) => u.phone || '—' },
              { label: t('yys.ppl.children'), render: (u) => (u.childIds || []).map((id) => Store.get('students', id)?.name).filter(Boolean).join(', ') || '—' },
              { label: t('yys.ppl.school'), render: (u) => schoolChip(u.tenantId) },
            ],
            rows,
          }));
        }
      };

      const schoolSel = UI.select([
        { value: 'all', label: t('yys.ppl.allSchools') },
        ...schools.map((tn) => ({ value: tn.id, label: tn.name })),
      ]);
      schoolSel.addEventListener('change', () => { schoolFilter = schoolSel.value; renderTab(); });

      renderTab();
      container.append(
        UI.pageHead(t('yys.ppl.title'), t('yys.ppl.sub')),
        el('div', { class: 'filterbar' }, el('span', { class: 'muted small' }, t('yys.ppl.school')), schoolSel),
        UI.tabs([
          { id: 'students', label: `🎓 ${t('nav.students')}` },
          { id: 'teachers', label: `👳 ${t('nav.teachers')}` },
          { id: 'guardians', label: `👨‍👩‍👧 ${t('nav.guardians')}` },
        ], tab, (id) => { tab = id; renderTab(); }),
        host,
      );
    },

    /* ---------- Kebendaharaan lembaga ---------- */
    treasury(container, ctx) {
      const fid = ctx.session.foundationId;
      const canRecord = canRecordFinance(ctx);
      const kpiHost = el('div', { class: 'grid grid-3' });
      const host = el('div', { style: { marginTop: 'var(--s-4)' } });

      const CATEGORIES = {
        in: ['Dana BOS', 'Dana BOP', 'Donasi / Hibah', 'Infaq & Sedekah', 'Setoran unit sekolah', 'Lainnya'],
        out: ['Gaji & Honor', 'Operasional', 'Pembangunan', 'Kegiatan', 'Pengadaan barang', 'Lainnya'],
      };

      const renderAll = () => {
        clear(kpiHost); clear(host);
        const txs = Store.list('fndTransactions', (x) => x.foundationId === fid)
          .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        const inSum = txs.filter((x) => x.kind === 'in').reduce((s, x) => s + x.amount, 0);
        const outSum = txs.filter((x) => x.kind === 'out').reduce((s, x) => s + x.amount, 0);
        kpiHost.append(
          UI.kpiCard({ label: t('yys.trs.in'), value: fmtMoney(inSum), tone: 'ok' }),
          UI.kpiCard({ label: t('yys.trs.out'), value: fmtMoney(outSum), tone: 'warn' }),
          UI.kpiCard({ label: t('yys.trs.balance'), value: fmtMoney(inSum - outSum), tone: inSum - outSum >= 0 ? 'ok' : 'danger' }),
        );
        host.append(UI.dataTable({
          columns: [
            { label: t('common.date'), render: (r) => fmtDate(r.date) },
            { label: t('yys.trs.kind'), render: (r) => UI.chip(r.kind === 'in' ? t('yys.trs.in') : t('yys.trs.out'), r.kind === 'in' ? 'ok' : 'warn') },
            { label: t('yys.trs.category'), key: 'category' },
            {
              label: t('yys.trs.desc'),
              render: (r) => el('div', {},
                el('div', {}, r.description || '—'),
                el('div', { class: 'xs muted' }, `${t('yys.trs.by')}: ${Store.get('users', r.createdBy)?.name || '—'}`)),
            },
            { label: t('yys.trs.amount'), render: (r) => el('strong', { style: { color: r.kind === 'in' ? 'var(--ok)' : 'var(--warn)', whiteSpace: 'nowrap' } }, `${r.kind === 'in' ? '+' : '−'} ${fmtMoney(r.amount)}`) },
            {
              label: t('yys.trs.proof'),
              render: (r) => r.proofDataUrl
                ? el('button', {
                  class: 'btn ghost sm',
                  onclick: () => UI.modal({
                    title: `${t('yys.trs.proof')} — ${r.category}`,
                    body: el('img', { src: r.proofDataUrl, alt: 'Bukti', style: { maxWidth: '100%', borderRadius: '10px' } }),
                  }),
                }, `🧾 ${t('yys.trs.viewProof')}`)
                : el('span', { class: 'muted xs' }, t('yys.trs.noProof')),
            },
            ...(canRecord ? [{
              label: t('common.action'),
              render: (r) => el('div', { class: 'row', style: { flexWrap: 'nowrap' } },
                el('button', { class: 'btn sm', onclick: () => txForm(r) }, t('common.edit')),
                el('button', { class: 'btn sm danger', onclick: () => UI.confirmDialog(r.description || r.category, () => { Store.remove('fndTransactions', r.id, ctx.session.userId); renderAll(); }) }, t('common.delete')),
              ),
            }] : []),
          ],
          rows: txs,
        }));
      };

      function txForm(existing) {
        let kind = existing?.kind || 'in';
        let proofDataUrl = existing?.proofDataUrl || null;

        const dateIn = UI.input({ type: 'date', value: existing?.date || new Date().toISOString().slice(0, 10) });
        const catSel = UI.select(CATEGORIES[kind].map((c) => ({ value: c, label: c, selected: existing?.category === c })));
        const amountIn = UI.input({ type: 'number', value: existing?.amount ?? '', placeholder: 'cth: 5000000' });
        const descIn = UI.textarea({ value: existing?.description || '' });

        const rebuildCats = () => {
          catSel.innerHTML = '';
          CATEGORIES[kind].forEach((c) => catSel.append(el('option', { value: c }, c)));
        };
        const kindSeg = UI.segmented(
          [{ value: 'in', label: `⬇ ${t('yys.trs.in')}` }, { value: 'out', label: `⬆ ${t('yys.trs.out')}` }],
          kind,
          (v) => { kind = v; rebuildCats(); },
          { in: 'ok', out: 'warn' },
        );

        const proofThumb = el('div', {});
        const renderProof = () => {
          clear(proofThumb);
          if (proofDataUrl) {
            proofThumb.append(
              el('img', { src: proofDataUrl, alt: 'Bukti', style: { maxWidth: '160px', borderRadius: '8px', display: 'block', marginBottom: '6px' } }),
              el('button', { type: 'button', class: 'btn ghost sm', onclick: () => { proofDataUrl = null; renderProof(); } }, '🗑 Hapus bukti'),
            );
          }
        };
        renderProof();
        const picker = imagePicker((url) => { proofDataUrl = url; renderProof(); });

        const m = UI.modal({
          title: existing ? t('yys.trs.edit') : t('yys.trs.add'),
          wide: true,
          body: el('div', { class: 'form-grid' },
            UI.field(t('yys.trs.kind'), kindSeg),
            UI.field(t('common.date'), dateIn),
            UI.field(t('yys.trs.category'), catSel),
            UI.field(t('yys.trs.amount'), amountIn),
            el('div', { class: 'full' }, UI.field(t('yys.trs.desc'), descIn)),
            el('div', { class: 'full' },
              UI.field(t('yys.trs.proof'),
                el('div', {},
                  proofThumb,
                  el('button', { type: 'button', class: 'btn sm', onclick: () => picker.click() }, '📁 Unggah foto/scan bukti…'),
                  picker,
                ),
                'Foto nota, kuitansi, atau bukti transfer. Otomatis diperkecil.'),
            ),
          ),
          footer: [
            el('button', { class: 'btn ghost', onclick: () => m.close() }, t('common.cancel')),
            el('button', {
              class: 'btn primary',
              onclick: () => {
                const amount = Number(amountIn.value || 0);
                if (!amount || amount <= 0) { UI.toast(`${t('yys.trs.amount')} — ${t('common.required')}`, 'warn'); return; }
                const data = {
                  foundationId: fid, kind, date: dateIn.value, category: catSel.value,
                  amount, description: descIn.value.trim(), proofDataUrl,
                };
                if (existing) Store.update('fndTransactions', existing.id, data, ctx.session.userId);
                else Store.insert('fndTransactions', { ...data, createdBy: ctx.session.userId }, ctx.session.userId);
                UI.toast(t('common.saved'), 'ok'); m.close(); renderAll();
              },
            }, t('common.save')),
          ],
        });
      }

      renderAll();
      container.append(
        UI.pageHead(t('yys.trs.title'), t('yys.trs.sub'),
          canRecord ? el('button', { class: 'btn primary', onclick: () => txForm(null) }, `＋ ${t('yys.trs.add')}`) : null),
        canRecord ? null : el('div', { class: 'panel', style: { marginBottom: 'var(--s-3)' } },
          el('span', { class: 'muted small' }, `👁 ${t('yys.trs.readonly')}`)),
        kpiHost,
        host,
      );
    },

    /* ---------- Akun pengurus lembaga (khusus Master Admin) ---------- */
    accounts(container, ctx) {
      if (!isMasterAdmin(ctx)) { adminOnlyNotice(container); return; }
      const fid = ctx.session.foundationId;
      const host = el('div');

      const render = () => {
        clear(host);
        const rows = Store.list('users', (u) => u.role === 'foundation_admin' && u.foundationId === fid);
        host.append(UI.dataTable({
          columns: [
            {
              label: t('common.name'),
              render: (u) => el('div', { class: 'row', style: { gap: '10px', flexWrap: 'nowrap' } },
                UI.avatar(u.name),
                el('div', {},
                  el('div', {}, u.name),
                  u.id === ctx.session.userId ? el('div', { class: 'xs muted' }, t('yys.acc.self')) : null)),
            },
            { label: t('yys.acc.jabatan'), render: (u) => UI.chip(t(`yys.jab.${u.fndRole || 'admin'}`), u.fndRole === 'admin' ? 'info' : u.fndRole === 'bendahara' ? 'ok' : '') },
            { label: 'Email', key: 'email' },
            { label: 'HP', key: 'phone' },
            {
              label: t('common.action'),
              render: (u) => el('div', { class: 'row', style: { flexWrap: 'nowrap' } },
                el('button', { class: 'btn sm', onclick: () => accForm(u) }, t('common.edit')),
                u.id !== ctx.session.userId
                  ? el('button', { class: 'btn sm danger', onclick: () => UI.confirmDialog(u.name, () => { Store.remove('users', u.id, ctx.session.userId); render(); }) }, t('common.delete'))
                  : null),
            },
          ],
          rows,
        }));
      };

      function accForm(existing) {
        const f = {
          name: UI.input({ value: existing?.name || '' }),
          jab: UI.select(JABATAN.map((j) => ({ value: j, label: `${t(`yys.jab.${j}`)} — ${t(`yys.jab.${j}.desc`)}`, selected: (existing?.fndRole || 'admin') === j }))),
          email: UI.input({ type: 'email', value: existing?.email || '' }),
          phone: UI.input({ value: existing?.phone || '' }),
          pw: UI.passwordInput({ placeholder: 'Min. 6 karakter' }),
        };
        const m = UI.modal({
          title: existing ? t('yys.acc.edit') : t('yys.acc.add'),
          wide: true,
          body: el('div', { class: 'form-grid' },
            UI.field(t('common.name'), f.name),
            el('div', { class: 'full' }, UI.field(t('yys.acc.jabatan'), f.jab)),
            UI.field('Email', f.email),
            UI.field('No. HP', f.phone),
            UI.field(existing ? t('yys.acc.resetPw') : t('yys.acc.initialPw'), f.pw,
              existing ? 'Kosongkan bila tidak ingin mengubah kata sandi' : 'Dipakai untuk login pertama kali'),
          ),
          footer: [
            el('button', { class: 'btn ghost', onclick: () => m.close() }, t('common.cancel')),
            el('button', {
              class: 'btn primary',
              onclick: () => {
                const email = f.email.value.trim();
                const pw = f.pw.value.trim();
                if (!f.name.value.trim() || !email) { UI.toast(t('common.required'), 'warn'); return; }
                if (!existing && pw.length < 6) { UI.toast('Kata sandi minimal 6 karakter', 'warn'); return; }
                if (existing && pw && pw.length < 6) { UI.toast('Kata sandi minimal 6 karakter', 'warn'); return; }
                const data = {
                  name: f.name.value.trim(), fndRole: f.jab.value,
                  email, identifier: email, phone: f.phone.value.trim() || null,
                };
                if (existing) {
                  Store.update('users', existing.id, pw ? { ...data, password: pw } : data, ctx.session.userId);
                } else {
                  Store.insert('users', {
                    ...data, tenantId: null, foundationId: fid,
                    role: 'foundation_admin', password: pw, status: 'active',
                  }, ctx.session.userId);
                }
                UI.toast(t('common.saved'), 'ok'); m.close(); render();
              },
            }, t('common.save')),
          ],
        });
      }

      render();
      container.append(
        UI.pageHead(t('yys.acc.title'), t('yys.acc.sub'),
          el('button', { class: 'btn primary', onclick: () => accForm(null) }, `＋ ${t('yys.acc.add')}`)),
        host,
      );
    },

    /* ---------- Kelola sekolah/pondok naungan ---------- */
    schools(container, ctx) {
      if (!isMasterAdmin(ctx)) { adminOnlyNotice(container); return; }
      const host = el('div');
      const renderList = () => {
        clear(host);
        host.append(UI.dataTable({
          columns: [
            { label: t('common.name'), render: (tn) => el('strong', {}, tn.name) },
            { label: t('mst.tenants.code'), render: (tn) => el('span', { class: 'mono small' }, tn.code) },
            { label: t('mst.tenants.type'), render: (tn) => t(`mst.type.${tn.type}`) },
            { label: t('mst.tenants.usage'), render: (tn) => `${schoolStats(tn).students} / ${tn.studentQuota ?? 0}` },
            { label: t('mst.tenants.adminName'), render: (tn) => tn.adminName || '—' },
            { label: t('common.status'), render: (tn) => UI.statusChip(tn.subscriptionStatus) },
            {
              label: t('common.action'),
              render: (tn) => el('button', { class: 'btn sm', onclick: (e) => { e.stopPropagation(); schoolForm(tn, ctx, renderList); } }, t('common.edit')),
            },
          ],
          rows: mySchools(ctx),
          onRowClick: (tn) => schoolDrawer(tn, ctx, renderList),
        }));
      };
      renderList();
      container.append(
        UI.pageHead(t('yys.sch.title'), t('yys.sch.sub'),
          el('button', { class: 'btn primary', onclick: () => schoolForm(null, ctx, renderList) }, `＋ ${t('yys.sch.add')}`)),
        host,
      );
    },

    /* ---------- Ringkasan akademik (lihat saja) ---------- */
    academic(container, ctx) {
      const schools = mySchools(ctx);
      let selected = schools[0]?.id || null;
      const host = el('div');

      const renderStats = () => {
        clear(host);
        if (!selected) { host.append(UI.emptyState(t('common.empty'), '🏫')); return; }
        const aca = academicStats(selected);
        host.append(
          el('div', { class: 'grid grid-4' },
            UI.kpiCard({ label: t('yys.aca.attend7'), value: aca.attendPct === null ? '—' : `${aca.attendPct}%`, delta: `${aca.sessions} sesi`, tone: (aca.attendPct ?? 100) >= 85 ? 'ok' : 'warn' }),
            UI.kpiCard({ label: t('yys.aca.memo7'), value: aca.memo }),
            UI.kpiCard({ label: t('yys.aca.grades'), value: aca.grades }),
            UI.kpiCard({ label: t('yys.aca.violations7'), value: aca.violations, tone: aca.violations > 0 ? 'warn' : 'ok' }),
          ),
        );
      };

      const sel = UI.select(schools.map((tn) => ({ value: tn.id, label: tn.name })));
      sel.addEventListener('change', () => { selected = sel.value; renderStats(); });
      renderStats();

      container.append(
        UI.pageHead(t('yys.aca.title'), t('yys.aca.sub')),
        el('div', { class: 'filterbar' }, el('span', { class: 'muted small' }, t('yys.aca.school')), sel),
        host,
      );
    },

    /* ---------- Ringkasan keuangan (lihat saja) ---------- */
    finance(container, ctx) {
      const schools = mySchools(ctx);
      const rows = schools.map((tn) => {
        const students = Store.studentsOf(tn.id);
        const sids = students.map((s) => s.id);
        const bills = Store.list('bills', (b) => sids.includes(b.studentId));
        const billed = bills.reduce((s, b) => s + b.amount, 0);
        const paid = bills.reduce((s, b) => s + (b.paidAmount || 0), 0);
        return { tn, billed, paid, outstanding: billed - paid };
      });
      const tot = rows.reduce((a, r) => ({ billed: a.billed + r.billed, paid: a.paid + r.paid, out: a.out + r.outstanding }), { billed: 0, paid: 0, out: 0 });

      container.append(
        UI.pageHead(t('yys.fin.title'), t('yys.fin.sub')),
        el('div', { class: 'grid grid-3' },
          UI.kpiCard({ label: t('yys.fin.billed'), value: fmtMoney(tot.billed) }),
          UI.kpiCard({ label: t('yys.fin.paid'), value: fmtMoney(tot.paid), tone: 'ok' }),
          UI.kpiCard({ label: t('yys.fin.outstanding'), value: fmtMoney(tot.out), tone: tot.out > 0 ? 'warn' : 'ok' }),
        ),
        el('div', { class: 'panel', style: { marginTop: 'var(--s-4)' } },
          UI.dataTable({
            columns: [
              { label: t('common.name'), render: (r) => el('strong', {}, r.tn.name) },
              { label: t('yys.fin.billed'), render: (r) => fmtMoney(r.billed) },
              { label: t('yys.fin.paid'), render: (r) => fmtMoney(r.paid) },
              { label: t('yys.fin.outstanding'), render: (r) => el('span', { style: { color: r.outstanding > 0 ? 'var(--warn)' : 'var(--ok)' } }, fmtMoney(r.outstanding)) },
            ],
            rows,
          }),
        ),
      );
    },

    /* ---------- Profil & logo yayasan (khusus Master Admin) ---------- */
    profile(container, ctx) {
      if (!isMasterAdmin(ctx)) { adminOnlyNotice(container); return; }
      const foundation = fnd(ctx);
      if (!foundation) { container.append(UI.emptyState(t('common.empty'), '🏛️')); return; }

      const f = {
        name: UI.input({ value: foundation.name || '' }),
        chairman: UI.input({ value: foundation.chairman || '' }),
        profile: UI.textarea({ value: foundation.profile || '' }),
        address: UI.input({ value: foundation.address || '' }),
        phone: UI.input({ value: foundation.phone || '' }),
        email: UI.input({ type: 'email', value: foundation.email || '' }),
      };

      let logoDataUrl = foundation.logoDataUrl || null;
      const preview = el('div', {
        style: {
          width: '72px', height: '72px', borderRadius: '16px', border: '1px solid var(--line)',
          display: 'grid', placeItems: 'center', overflow: 'hidden', background: 'var(--accent-soft)',
          fontSize: '1.6rem', fontWeight: 700,
        },
      });
      const renderPreview = () => {
        preview.innerHTML = '';
        if (logoDataUrl) preview.append(el('img', { src: logoDataUrl, alt: 'Logo', style: { width: '100%', height: '100%', objectFit: 'cover' } }));
        else preview.append((foundation.name || 'Y').slice(0, 1));
      };
      renderPreview();

      const fileIn = el('input', { type: 'file', accept: 'image/*', style: { display: 'none' } });
      fileIn.addEventListener('change', () => {
        const file = fileIn.files?.[0];
        if (!file) return;
        const img = new Image();
        const reader = new FileReader();
        reader.onload = () => { img.src = reader.result; };
        img.onload = () => {
          const size = 256;
          const canvas = document.createElement('canvas');
          canvas.width = size; canvas.height = size;
          const g = canvas.getContext('2d');
          const scale = Math.max(size / img.width, size / img.height);
          const w = img.width * scale, h = img.height * scale;
          g.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
          logoDataUrl = canvas.toDataURL('image/png');
          renderPreview();
        };
        reader.readAsDataURL(file);
      });

      container.append(
        UI.pageHead(t('yys.prf.title'), t('yys.prf.sub')),
        el('div', { class: 'panel', style: { maxWidth: '640px' } },
          UI.field(t('yys.prf.name'), f.name),
          el('div', { class: 'field' },
            el('label', {}, t('yys.prf.logo')),
            el('div', { class: 'row', style: { gap: '14px', alignItems: 'center' } },
              preview,
              el('div', { class: 'stack', style: { gap: '6px' } },
                el('button', { class: 'btn sm', onclick: () => fileIn.click() }, '📁 Pilih gambar…'),
                el('button', { class: 'btn ghost sm', onclick: () => { logoDataUrl = null; fileIn.value = ''; renderPreview(); } }, '🗑 Hapus logo'),
              ),
            ),
            fileIn,
          ),
          UI.field(t('yys.prf.chairman'), f.chairman),
          UI.field(t('yys.prf.profile'), f.profile),
          UI.field(t('mst.tenants.address'), f.address),
          UI.field('Telepon', f.phone),
          UI.field('Email', f.email),
          el('button', {
            class: 'btn primary',
            onclick: () => {
              Store.update('foundations', foundation.id, {
                name: f.name.value.trim(), chairman: f.chairman.value.trim(),
                profile: f.profile.value, address: f.address.value.trim(),
                phone: f.phone.value.trim(), email: f.email.value.trim(),
                logoDataUrl,
              }, ctx.session.userId);
              UI.toast(t('common.saved'), 'ok');
              ctx.rerender();
            },
          }, t('common.save')),
        ),
      );
    },
  },
};
