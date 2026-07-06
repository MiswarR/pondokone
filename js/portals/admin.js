/* ============================================================
   Portal Admin Tenant — web (shell sidebar).
   Seluruh kueri WAJIB dibatasi tenantId milik sesi.
   Screen sesuai spesifikasi: dashboard, master data (santri, guru,
   wali, struktur), akademik (absensi, nilai, hafalan, perilaku),
   keuangan (produk+generate tagihan, rekonsiliasi), laporan.
   ============================================================ */

import I18n, { t, fmtMoney, fmtDate, fmtDateTime } from '../core/i18n.js';
import * as Store from '../core/store.js';
import * as UI from '../core/ui.js';

I18n.extend({
  id: {
    'adm.dash.attToday': 'Kehadiran hari ini',
    'adm.dash.missingInput': 'Kelas belum diabsen',
    'adm.dash.violations7': 'Pelanggaran 7 hari',
    'adm.dash.billMonth': 'Tagihan bulan ini',
    'adm.dash.paid': 'Sudah dibayar',
    'adm.dash.outstanding': 'Belum terbayar',
    'adm.dash.latestAnn': 'Pengumuman terbaru',
    'adm.dash.academic': 'Ringkasan akademik',
    'adm.dash.finance': 'Ringkasan keuangan',
    'adm.students.title': 'Santri & Murid',
    'adm.students.add': 'Tambah Santri',
    'adm.students.profile': 'Profil Santri',
    'adm.field.nis': 'NIS / NISN',
    'adm.field.gender': 'Jenis kelamin',
    'adm.field.birth': 'Tanggal lahir',
    'adm.field.class': 'Kelas aktif',
    'adm.field.halaqah': 'Halaqah aktif',
    'adm.field.room': 'Kamar / asrama',
    'adm.field.guardians': 'Wali terhubung',
    'adm.field.relation': 'Hubungan',
    'adm.field.address': 'Alamat',
    'adm.field.staffRoles': 'Role staff',
    'adm.field.units': 'Unit mengajar',
    'adm.field.subjects': 'Mapel / bidang',
    'adm.field.notif': 'Hak notifikasi',
    'adm.teachers.add': 'Tambah Guru',
    'adm.guardians.add': 'Tambah Wali',
    'adm.struct.years': 'Tahun Ajaran',
    'adm.struct.classes': 'Kelas',
    'adm.struct.halaqahs': 'Halaqah',
    'adm.struct.rooms': 'Kamar',
    'adm.struct.subjects': 'Mapel',
    'adm.struct.components': 'Komponen Nilai',
    'adm.struct.rules': 'Aturan Pelanggaran',
    'adm.att.recap': 'Rekap kehadiran',
    'adm.att.noSession': 'Belum ada sesi absensi pada tanggal ini',
    'adm.att.pending': 'Input guru belum lengkap',
    'adm.grades.avg': 'Rata-rata kelas',
    'adm.grades.published': 'Tampil ke wali',
    'adm.grades.hidden': 'Draf',
    'adm.memo.progress': 'Progress hafalan per santri',
    'adm.memo.recent': 'Setoran terbaru',
    'adm.bhv.followup': 'Tindak lanjut',
    'adm.fin.products': 'Produk Tagihan',
    'adm.fin.addProduct': 'Tambah Produk',
    'adm.fin.generate': 'Generate Tagihan',
    'adm.fin.billList': 'Daftar Tagihan',
    'adm.fin.generated': 'tagihan dibuat',
    'adm.fin.skipped': 'dilewati (sudah ada)',
    'adm.fin.installment': 'Boleh cicilan',
    'adm.recon.markPaid': 'Tandai lunas',
    'adm.recon.receipt': 'Bukti',
    'adm.report.attendance': 'Kehadiran bulan ini',
    'adm.report.avgGrade': 'Rata-rata nilai',
    'adm.report.memo': 'Total setoran hafalan',
    'adm.report.payRate': 'Kepatuhan pembayaran',
    'adm.report.export': 'Export CSV',
  },
  en: {
    'adm.dash.attToday': "Today's attendance",
    'adm.dash.missingInput': 'Classes not yet recorded',
    'adm.dash.violations7': 'Violations (7 days)',
    'adm.dash.billMonth': "This month's bills",
    'adm.dash.paid': 'Paid',
    'adm.dash.outstanding': 'Outstanding',
    'adm.dash.latestAnn': 'Latest announcements',
    'adm.dash.academic': 'Academic summary',
    'adm.dash.finance': 'Finance summary',
    'adm.students.title': 'Students',
    'adm.students.add': 'Add Student',
    'adm.students.profile': 'Student Profile',
    'adm.fin.products': 'Bill Products',
    'adm.fin.generate': 'Generate Bills',
    'adm.fin.billList': 'Bills',
    'adm.report.export': 'Export CSV',
  },
  ar: {
    'adm.dash.attToday': 'حضور اليوم',
    'adm.dash.billMonth': 'فواتير هذا الشهر',
    'adm.students.title': 'الطلاب',
    'adm.students.add': 'إضافة طالب',
    'adm.fin.products': 'منتجات الفواتير',
    'adm.fin.generate': 'إنشاء الفواتير',
    'adm.report.export': 'تصدير CSV',
  },
});

/* ---------- util ---------- */
const todayISO = () => new Date().toISOString().slice(0, 10);
const monthStartISO = () => todayISO().slice(0, 8) + '01';
const currentMonthName = () => new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

function checkboxGroup(options, selected = []) {
  // options: [{value,label}] → node + values()
  const boxes = options.map((o) =>
    UI.el('label', { class: 'row small', style: { gap: '8px', padding: '3px 0' } },
      UI.el('input', { type: 'checkbox', value: o.value, checked: selected.includes(o.value) || null, style: { width: 'auto' } }),
      o.label));
  const node = UI.el('div', { style: { maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', background: 'var(--bg-elev)' } }, boxes);
  return { node, values: () => boxes.filter((b) => b.querySelector('input').checked).map((b) => b.querySelector('input').value) };
}

function downloadCSV(filename, headers, rows) {
  const esc = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
  const csv = [headers.map(esc).join(';'), ...rows.map((r) => r.map(esc).join(';'))].join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const a = UI.el('a', { href: URL.createObjectURL(blob), download: filename });
  document.body.append(a); a.click(); a.remove();
  UI.toast(`📥 ${filename}`, 'ok');
}

function classNameOf(id) { return Store.get('classes', id)?.name || '—'; }
function halaqahNameOf(id) { return Store.get('halaqahs', id)?.name || '—'; }
function studentNameOf(id) { return Store.get('students', id)?.name || '—'; }
function userNameOf(id) { return Store.get('users', id)?.name || (id === 'gateway' ? 'Gateway' : id === 'system' ? 'System' : id || '—'); }

/* Sinkronkan relasi dua arah wali ⇄ anak. */
function syncGuardianLinks(studentId, newGuardianIds, actor) {
  for (const g of Store.list('users', (u) => u.role === 'guardian')) {
    const has = (g.childIds || []).includes(studentId);
    const should = newGuardianIds.includes(g.id);
    if (has === should) continue;
    const childIds = should
      ? [...(g.childIds || []), studentId]
      : (g.childIds || []).filter((c) => c !== studentId);
    Store.update('users', g.id, { childIds }, actor);
  }
}

/* ============================================================ ROUTES */
const routes = {

  /* ---------------- Dashboard ---------------- */
  dashboard(container, ctx) {
    const tid = ctx.session.tenantId;
    const today = todayISO();
    const sessionsToday = Store.list('attendanceSessions', (a) => a.tenantId === tid && a.date === today);
    const allRec = sessionsToday.flatMap((s) => s.records);
    const present = allRec.filter((r) => r.status === 'hadir' || r.status === 'terlambat').length;
    const pct = allRec.length ? Math.round((present / allRec.length) * 100) : null;

    const classesNoSession = Store.list('classes', (c) => c.tenantId === tid && c.status === 'active')
      .filter((c) => !sessionsToday.some((s) => s.unitType === 'class' && s.unitId === c.id));

    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const violations = Store.list('behaviorEvents', (e) => e.tenantId === tid && e.kind === 'violation' && e.date >= weekAgo);

    const bills = Store.list('bills', (b) => b.tenantId === tid && b.period === currentMonthName());
    const totalBill = bills.reduce((s, b) => s + b.amount, 0);
    const totalPaid = bills.reduce((s, b) => s + (b.paidAmount || 0), 0);

    const anns = Store.list('announcements', (a) => a.tenantId === tid).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

    container.append(
      UI.pageHead(t('nav.dashboard'), fmtDate(new Date().toISOString())),
      UI.el('div', { class: 'grid grid-4' },
        UI.kpiCard({ label: t('adm.dash.attToday'), value: pct === null ? '—' : `${pct}%`, delta: `${sessionsToday.length} sesi tercatat`, tone: pct !== null && pct < 80 ? 'warn' : 'ok', onClick: () => ctx.navigate('admin/attendance') }),
        UI.kpiCard({ label: t('adm.dash.missingInput'), value: classesNoSession.length, delta: classesNoSession.map((c) => c.name).join(', ') || '✓ lengkap', tone: classesNoSession.length ? 'warn' : 'ok', onClick: () => ctx.navigate('admin/attendance') }),
        UI.kpiCard({ label: t('adm.dash.violations7'), value: violations.length, tone: violations.length > 3 ? 'danger' : '', onClick: () => ctx.navigate('admin/behavior') }),
        UI.kpiCard({ label: t('adm.dash.billMonth'), value: fmtMoney(totalBill), delta: `${t('adm.dash.paid')}: ${fmtMoney(totalPaid)}`, tone: 'ok', onClick: () => ctx.navigate('admin/billing') }),
      ),
      UI.el('div', { class: 'grid grid-2', style: { marginTop: 'var(--s-4)' } },
        UI.el('div', { class: 'panel' },
          UI.el('div', { class: 'panel-title' }, UI.el('h3', {}, t('adm.dash.finance')),
            UI.el('button', { class: 'btn sm ghost', onclick: () => ctx.navigate('admin/reconciliation') }, t('common.viewAll'))),
          UI.el('div', { class: 'stack' },
            UI.el('div', { class: 'row between' }, UI.el('span', { class: 'muted' }, t('common.total')), UI.el('strong', {}, fmtMoney(totalBill))),
            UI.el('div', { class: 'row between' }, UI.el('span', { class: 'muted' }, t('adm.dash.paid')), UI.el('strong', { style: { color: 'var(--ok)' } }, fmtMoney(totalPaid))),
            UI.el('div', { class: 'row between' }, UI.el('span', { class: 'muted' }, t('adm.dash.outstanding')), UI.el('strong', { style: { color: 'var(--warn)' } }, fmtMoney(totalBill - totalPaid))),
            UI.progressBar(totalBill ? (totalPaid / totalBill) * 100 : 0),
          ),
        ),
        UI.el('div', { class: 'panel' },
          UI.el('div', { class: 'panel-title' }, UI.el('h3', {}, t('adm.dash.latestAnn'))),
          UI.timeline(anns.map((a) => ({ when: fmtDate(a.date), what: a.title, detail: a.body }))),
        ),
      ),
    );
  },

  /* ---------------- Santri ---------------- */
  students(container, ctx) {
    const tid = ctx.session.tenantId;
    const classes = Store.list('classes', (c) => c.tenantId === tid);
    let q = '', classFilter = '';

    const listHost = UI.el('div', {});
    const render = () => {
      const rows = Store.studentsOf(tid).filter((s) =>
        (!q || s.name.toLowerCase().includes(q) || (s.nis || '').includes(q)) &&
        (!classFilter || s.classId === classFilter));
      UI.clear(listHost).append(UI.dataTable({
        columns: [
          { label: t('adm.field.nis'), render: (s) => UI.el('span', { class: 'mono xs' }, s.nis) },
          { label: t('common.name'), render: (s) => UI.el('div', { class: 'row', style: { gap: '10px', flexWrap: 'nowrap' } }, UI.avatar(s.name), s.name) },
          { label: t('common.class'), render: (s) => classNameOf(s.classId) },
          { label: t('adm.field.halaqah'), render: (s) => s.halaqahId ? halaqahNameOf(s.halaqahId) : '—' },
          { label: t('adm.field.room'), render: (s) => s.roomId ? (Store.get('rooms', s.roomId)?.name || '—') : '—' },
          { label: t('common.status'), render: (s) => UI.statusChip(s.status) },
          { label: t('common.action'), render: (s) => UI.el('div', { class: 'row', style: { flexWrap: 'nowrap' } },
            UI.el('button', { class: 'btn sm', onclick: (e) => { e.stopPropagation(); openForm(s); } }, t('common.edit')),
            UI.el('button', { class: 'btn sm danger', onclick: (e) => { e.stopPropagation(); UI.confirmDialog(s.name, () => { Store.remove('students', s.id, ctx.session.userId); UI.toast(t('common.deleted')); render(); }); } }, t('common.delete'))) },
        ],
        rows,
        onRowClick: openProfile,
      }));
    };

    function openProfile(s) {
      const recap = Store.attendanceRecap(s.id, monthStartISO());
      const points = Store.behaviorPoints(s.id);
      const outstanding = Store.outstandingOf([s.id]);
      const guardians = (s.guardianIds || []).map((id) => Store.get('users', id)).filter(Boolean);
      UI.drawer({
        title: t('adm.students.profile'),
        body: UI.el('div', { class: 'stack' },
          UI.el('div', { class: 'row', style: { gap: '14px' } },
            UI.avatar(s.name, 'lg'),
            UI.el('div', {},
              UI.el('div', { style: { fontWeight: 700, fontSize: '1.1rem' } }, s.name),
              UI.el('div', { class: 'small muted' }, `${s.nis} · ${classNameOf(s.classId)}${s.halaqahId ? ' · ' + halaqahNameOf(s.halaqahId) : ''}`),
              UI.statusChip(s.status),
            )),
          UI.el('div', { class: 'panel' },
            UI.el('h3', { class: 'small' }, t('nav.attendance') + ` (${currentMonthName()})`),
            UI.el('div', { class: 'row' }, Store.ATT_STATUSES.map((st) => UI.chip(`${t('att.' + st)}: ${recap[st]}`)))),
          UI.el('div', { class: 'grid grid-2' },
            UI.kpiCard({ label: t('nav.behavior'), value: `${points} poin`, tone: points >= 20 ? 'danger' : '' }),
            UI.kpiCard({ label: t('adm.dash.outstanding'), value: fmtMoney(outstanding), tone: outstanding ? 'warn' : 'ok' })),
          UI.el('div', { class: 'panel' },
            UI.el('h3', { class: 'small' }, t('nav.guardians')),
            guardians.length
              ? guardians.map((g) => UI.el('div', { class: 'row between', style: { padding: '4px 0' } },
                  UI.el('span', {}, g.name), UI.el('span', { class: 'muted small' }, `${g.relation || ''} · ${g.phone || ''}`)))
              : UI.el('div', { class: 'muted small' }, t('common.empty'))),
        ),
      });
    }

    function openForm(existing) {
      const halaqahs = Store.list('halaqahs', (h) => h.tenantId === tid);
      const rooms = Store.list('rooms', (r) => r.tenantId === tid);
      const guardians = Store.list('users', (u) => u.role === 'guardian' && u.tenantId === tid);
      const f = {
        nis: UI.input({ value: existing?.nis || '' }),
        name: UI.input({ value: existing?.name || '' }),
        gender: UI.select([{ value: 'L', label: 'Laki-laki', selected: existing?.gender === 'L' }, { value: 'P', label: 'Perempuan', selected: existing?.gender === 'P' }]),
        birthDate: UI.input({ type: 'date', value: existing?.birthDate || '' }),
        classId: UI.select(classes.map((c) => ({ value: c.id, label: c.name, selected: existing?.classId === c.id }))),
        halaqahId: UI.select([{ value: '', label: '—' }, ...halaqahs.map((h) => ({ value: h.id, label: h.name, selected: existing?.halaqahId === h.id }))]),
        roomId: UI.select([{ value: '', label: '—' }, ...rooms.map((r) => ({ value: r.id, label: r.name, selected: existing?.roomId === r.id }))]),
        status: UI.select(['active', 'cuti', 'lulus', 'pindah', 'inactive'].map((s) => ({ value: s, label: s, selected: (existing?.status || 'active') === s }))),
      };
      const gGroup = checkboxGroup(guardians.map((g) => ({ value: g.id, label: `${g.name} (${g.relation || 'wali'})` })), existing?.guardianIds || []);
      const m = UI.modal({
        title: existing ? t('common.edit') : t('adm.students.add'),
        wide: true,
        body: UI.el('div', { class: 'form-grid' },
          UI.field(t('adm.field.nis'), f.nis), UI.field(t('common.name'), f.name),
          UI.field(t('adm.field.gender'), f.gender), UI.field(t('adm.field.birth'), f.birthDate),
          UI.field(t('adm.field.class'), f.classId), UI.field(t('adm.field.halaqah'), f.halaqahId),
          UI.field(t('adm.field.room'), f.roomId), UI.field(t('common.status'), f.status),
          UI.el('div', { class: 'full' }, UI.field(t('adm.field.guardians'), gGroup.node)),
        ),
        footer: [
          UI.el('button', { class: 'btn ghost', onclick: () => m.close() }, t('common.cancel')),
          UI.el('button', {
            class: 'btn primary',
            onclick: () => {
              if (!f.nis.value.trim() || !f.name.value.trim()) { UI.toast(t('common.required'), 'warn'); return; }
              const data = {
                tenantId: tid, nis: f.nis.value.trim(), name: f.name.value.trim(),
                gender: f.gender.value, birthDate: f.birthDate.value || null,
                classId: f.classId.value, halaqahId: f.halaqahId.value || null,
                roomId: f.roomId.value || null, status: f.status.value,
                guardianIds: gGroup.values(),
              };
              const saved = existing
                ? Store.update('students', existing.id, data, ctx.session.userId)
                : Store.insert('students', data, ctx.session.userId);
              syncGuardianLinks(saved.id, data.guardianIds, ctx.session.userId);
              UI.toast(t('common.saved'), 'ok'); m.close(); render();
            },
          }, t('common.save')),
        ],
      });
    }

    const search = UI.input({ placeholder: t('common.search'), oninput: (e) => { q = e.target.value.toLowerCase(); render(); } });
    const clsSel = UI.select([{ value: '', label: t('common.all') }, ...classes.map((c) => ({ value: c.id, label: c.name }))], { onchange: (e) => { classFilter = e.target.value; render(); } });

    container.append(
      UI.pageHead(t('adm.students.title'), `${Store.studentsOf(tid).length} ${t('common.student').toLowerCase()}`,
        UI.el('button', { class: 'btn primary', onclick: () => openForm(null) }, `＋ ${t('adm.students.add')}`)),
      UI.el('div', { class: 'filterbar' }, search, clsSel),
      listHost,
    );
    render();
  },

  /* ---------------- Guru ---------------- */
  teachers(container, ctx) {
    const tid = ctx.session.tenantId;
    const listHost = UI.el('div', {});
    const render = () => {
      const rows = Store.list('users', (u) => u.role === 'teacher' && u.tenantId === tid);
      UI.clear(listHost).append(UI.dataTable({
        columns: [
          { label: t('common.name'), render: (u) => UI.el('div', { class: 'row', style: { gap: '10px', flexWrap: 'nowrap' } }, UI.avatar(u.name), u.name) },
          { label: 'HP', key: 'phone' },
          { label: t('adm.field.staffRoles'), render: (u) => UI.el('div', { class: 'row', style: { gap: '4px' } }, (u.staffRoles || []).map((r) => UI.chip(r))) },
          { label: t('adm.field.units'), render: (u) => [...(u.classIds || []).map(classNameOf), ...(u.halaqahIds || []).map(halaqahNameOf)].join(', ') || '—' },
          { label: t('adm.field.subjects'), render: (u) => (u.subjectIds || []).map((id) => Store.get('subjects', id)?.name).filter(Boolean).join(', ') || '—' },
          { label: t('common.action'), render: (u) => UI.el('div', { class: 'row', style: { flexWrap: 'nowrap' } },
            UI.el('button', { class: 'btn sm', onclick: () => openForm(u) }, t('common.edit')),
            UI.el('button', { class: 'btn sm danger', onclick: () => UI.confirmDialog(u.name, () => { Store.remove('users', u.id, ctx.session.userId); render(); }) }, t('common.delete'))) },
        ],
        rows,
      }));
    };

    function openForm(existing) {
      const classes = Store.list('classes', (c) => c.tenantId === tid);
      const halaqahs = Store.list('halaqahs', (h) => h.tenantId === tid);
      const subjects = Store.list('subjects', (s) => s.tenantId === tid);
      const f = {
        name: UI.input({ value: existing?.name || '' }),
        phone: UI.input({ value: existing?.phone || '' }),
        email: UI.input({ type: 'email', value: existing?.email || '' }),
      };
      const roles = checkboxGroup(['guru', 'ustadz', 'wali_kelas', 'musyrif', 'admin_keuangan'].map((r) => ({ value: r, label: r })), existing?.staffRoles || []);
      const cls = checkboxGroup(classes.map((c) => ({ value: c.id, label: c.name })), existing?.classIds || []);
      const hlq = checkboxGroup(halaqahs.map((h) => ({ value: h.id, label: h.name })), existing?.halaqahIds || []);
      const sub = checkboxGroup(subjects.map((s) => ({ value: s.id, label: s.name })), existing?.subjectIds || []);
      const m = UI.modal({
        title: existing ? t('common.edit') : t('adm.teachers.add'),
        wide: true,
        body: UI.el('div', { class: 'form-grid' },
          UI.field(t('common.name'), f.name), UI.field('No. HP', f.phone),
          UI.field('Email', f.email), UI.field(t('adm.field.staffRoles'), roles.node),
          UI.field(t('common.class'), cls.node), UI.field(t('adm.field.halaqah'), hlq.node),
          UI.el('div', { class: 'full' }, UI.field(t('adm.field.subjects'), sub.node)),
        ),
        footer: [
          UI.el('button', { class: 'btn ghost', onclick: () => m.close() }, t('common.cancel')),
          UI.el('button', {
            class: 'btn primary',
            onclick: () => {
              if (!f.name.value.trim() || !f.phone.value.trim()) { UI.toast(t('common.required'), 'warn'); return; }
              const data = {
                tenantId: tid, role: 'teacher', name: f.name.value.trim(), phone: f.phone.value.trim(),
                email: f.email.value.trim() || null,
                identifier: f.email.value.trim() || f.phone.value.trim(),
                staffRoles: roles.values(), classIds: cls.values(), halaqahIds: hlq.values(), subjectIds: sub.values(),
                status: 'active',
              };
              if (existing) Store.update('users', existing.id, data, ctx.session.userId);
              else Store.insert('users', { ...data, password: 'guru123' }, ctx.session.userId);
              UI.toast(t('common.saved'), 'ok'); m.close(); render();
            },
          }, t('common.save')),
        ],
      });
    }

    container.append(
      UI.pageHead(t('nav.teachers'), null, UI.el('button', { class: 'btn primary', onclick: () => openForm(null) }, `＋ ${t('adm.teachers.add')}`)),
      listHost,
    );
    render();
  },

  /* ---------------- Wali ---------------- */
  guardians(container, ctx) {
    const tid = ctx.session.tenantId;
    const listHost = UI.el('div', {});
    const render = () => {
      const rows = Store.list('users', (u) => u.role === 'guardian' && u.tenantId === tid);
      UI.clear(listHost).append(UI.dataTable({
        columns: [
          { label: t('common.name'), render: (u) => UI.el('div', { class: 'row', style: { gap: '10px', flexWrap: 'nowrap' } }, UI.avatar(u.name), u.name) },
          { label: t('adm.field.relation'), render: (u) => UI.chip(u.relation || 'wali') },
          { label: 'HP', key: 'phone' },
          { label: t('nav.students'), render: (u) => (u.childIds || []).map(studentNameOf).join(', ') || '—' },
          { label: t('common.action'), render: (u) => UI.el('div', { class: 'row', style: { flexWrap: 'nowrap' } },
            UI.el('button', { class: 'btn sm', onclick: () => openForm(u) }, t('common.edit')),
            UI.el('button', { class: 'btn sm danger', onclick: () => UI.confirmDialog(u.name, () => { Store.remove('users', u.id, ctx.session.userId); render(); }) }, t('common.delete'))) },
        ],
        rows,
      }));
    };

    function openForm(existing) {
      const students = Store.studentsOf(tid);
      const f = {
        name: UI.input({ value: existing?.name || '' }),
        relation: UI.select(['ayah', 'ibu', 'wali', 'lainnya'].map((r) => ({ value: r, label: r, selected: existing?.relation === r }))),
        phone: UI.input({ value: existing?.phone || '' }),
        email: UI.input({ type: 'email', value: existing?.email || '' }),
        address: UI.textarea({ value: existing?.address || '' }),
      };
      const kids = checkboxGroup(students.map((s) => ({ value: s.id, label: `${s.name} (${classNameOf(s.classId)})` })), existing?.childIds || []);
      const notif = checkboxGroup(['nilai', 'absensi', 'perilaku', 'tagihan'].map((n) => ({ value: n, label: n })),
        Object.entries(existing?.notifPrefs || { nilai: true, absensi: true, perilaku: true, tagihan: true }).filter(([, v]) => v).map(([k]) => k));
      const m = UI.modal({
        title: existing ? t('common.edit') : t('adm.guardians.add'),
        wide: true,
        body: UI.el('div', { class: 'form-grid' },
          UI.field(t('common.name'), f.name), UI.field(t('adm.field.relation'), f.relation),
          UI.field('No. HP', f.phone), UI.field('Email', f.email),
          UI.el('div', { class: 'full' }, UI.field(t('adm.field.address'), f.address)),
          UI.field(t('nav.students'), kids.node), UI.field(t('adm.field.notif'), notif.node),
        ),
        footer: [
          UI.el('button', { class: 'btn ghost', onclick: () => m.close() }, t('common.cancel')),
          UI.el('button', {
            class: 'btn primary',
            onclick: () => {
              if (!f.name.value.trim() || !f.phone.value.trim()) { UI.toast(t('common.required'), 'warn'); return; }
              const notifSel = notif.values();
              const data = {
                tenantId: tid, role: 'guardian', name: f.name.value.trim(), relation: f.relation.value,
                phone: f.phone.value.trim(), email: f.email.value.trim() || null, address: f.address.value || null,
                identifier: f.email.value.trim() || f.phone.value.trim(),
                childIds: kids.values(),
                notifPrefs: { nilai: notifSel.includes('nilai'), absensi: notifSel.includes('absensi'), perilaku: notifSel.includes('perilaku'), tagihan: notifSel.includes('tagihan') },
                status: 'active',
              };
              let saved;
              if (existing) saved = Store.update('users', existing.id, data, ctx.session.userId);
              else saved = Store.insert('users', { ...data, password: 'wali123' }, ctx.session.userId);
              // sinkron balik ke students.guardianIds
              for (const s of Store.studentsOf(tid)) {
                const has = (s.guardianIds || []).includes(saved.id);
                const should = data.childIds.includes(s.id);
                if (has !== should) {
                  Store.update('students', s.id, {
                    guardianIds: should ? [...(s.guardianIds || []), saved.id] : (s.guardianIds || []).filter((g) => g !== saved.id),
                  }, ctx.session.userId);
                }
              }
              UI.toast(t('common.saved'), 'ok'); m.close(); render();
            },
          }, t('common.save')),
        ],
      });
    }

    container.append(
      UI.pageHead(t('nav.guardians'), null, UI.el('button', { class: 'btn primary', onclick: () => openForm(null) }, `＋ ${t('adm.guardians.add')}`)),
      listHost,
    );
    render();
  },

  /* ---------------- Struktur akademik ---------------- */
  structure(container, ctx) {
    const tid = ctx.session.tenantId;
    const teacherOpts = () => Store.list('users', (u) => u.role === 'teacher' && u.tenantId === tid).map((u) => ({ value: u.id, label: u.name }));

    const SECTIONS = {
      years: {
        collection: 'academicYears', titleKey: 'adm.struct.years',
        columns: [
          { label: t('common.name'), key: 'name' },
          { label: 'Mulai', render: (r) => fmtDate(r.startDate) },
          { label: 'Selesai', render: (r) => fmtDate(r.endDate) },
          { label: t('common.status'), render: (r) => r.active ? UI.chip(t('status.active'), 'ok') : UI.chip(t('status.inactive')) },
        ],
        fields: [
          { key: 'name', label: t('common.name'), type: 'text' },
          { key: 'startDate', label: 'Mulai', type: 'date' },
          { key: 'endDate', label: 'Selesai', type: 'date' },
          { key: 'active', label: t('status.active'), type: 'check' },
        ],
      },
      classes: {
        collection: 'classes', titleKey: 'adm.struct.classes',
        columns: [
          { label: t('common.name'), key: 'name' },
          { label: 'Jenjang', key: 'level' },
          { label: 'Wali kelas', render: (r) => userNameOf(r.homeroomId) },
          { label: 'Kapasitas', key: 'capacity' },
        ],
        fields: [
          { key: 'name', label: t('common.name'), type: 'text' },
          { key: 'level', label: 'Jenjang', type: 'text' },
          { key: 'homeroomId', label: 'Wali kelas', type: 'select', options: teacherOpts },
          { key: 'capacity', label: 'Kapasitas', type: 'number' },
        ],
        defaults: { status: 'active' },
      },
      halaqahs: {
        collection: 'halaqahs', titleKey: 'adm.struct.halaqahs',
        columns: [
          { label: t('common.name'), key: 'name' },
          { label: 'Musyrif', render: (r) => userNameOf(r.musyrifId) },
          { label: 'Target', key: 'target' },
          { label: 'Jadwal', key: 'schedule' },
        ],
        fields: [
          { key: 'name', label: t('common.name'), type: 'text' },
          { key: 'musyrifId', label: 'Musyrif', type: 'select', options: teacherOpts },
          { key: 'target', label: 'Target hafalan', type: 'text' },
          { key: 'schedule', label: 'Jadwal', type: 'text' },
        ],
      },
      rooms: {
        collection: 'rooms', titleKey: 'adm.struct.rooms',
        columns: [
          { label: t('common.name'), key: 'name' },
          { label: 'Pembina', render: (r) => userNameOf(r.supervisorId) },
          { label: 'Kapasitas', key: 'capacity' },
          { label: 'Lokasi', key: 'location' },
        ],
        fields: [
          { key: 'name', label: t('common.name'), type: 'text' },
          { key: 'supervisorId', label: 'Pembina', type: 'select', options: teacherOpts },
          { key: 'capacity', label: 'Kapasitas', type: 'number' },
          { key: 'location', label: 'Lokasi', type: 'text' },
        ],
      },
      subjects: {
        collection: 'subjects', titleKey: 'adm.struct.subjects',
        columns: [
          { label: 'Kode', render: (r) => UI.el('span', { class: 'mono xs' }, r.code) },
          { label: t('common.name'), key: 'name' },
          { label: 'Kategori', render: (r) => UI.chip(r.category, r.category === 'pesantren' ? 'accent' : 'info') },
          { label: 'Pengampu', render: (r) => (r.teacherIds || []).map(userNameOf).join(', ') || '—' },
        ],
        fields: [
          { key: 'code', label: 'Kode', type: 'text' },
          { key: 'name', label: t('common.name'), type: 'text' },
          { key: 'category', label: 'Kategori', type: 'select', options: () => [{ value: 'umum', label: 'Umum' }, { value: 'pesantren', label: 'Pesantren' }] },
        ],
      },
      components: {
        collection: 'gradeComponents', titleKey: 'adm.struct.components',
        columns: [
          { label: t('common.name'), key: 'name' },
          { label: 'Kategori', render: (r) => UI.chip(r.category) },
          { label: 'Bobot', render: (r) => `${r.weight}%` },
          { label: 'Skala', key: 'maxScale' },
          { label: 'Publish', render: (r) => UI.chip(r.publishPolicy === 'auto' ? 'auto' : 'approval', r.publishPolicy === 'auto' ? 'ok' : 'warn') },
        ],
        fields: [
          { key: 'name', label: t('common.name'), type: 'text' },
          { key: 'category', label: 'Kategori', type: 'select', options: () => [{ value: 'umum', label: 'Umum' }, { value: 'pesantren', label: 'Pesantren' }] },
          { key: 'weight', label: 'Bobot (%)', type: 'number' },
          { key: 'maxScale', label: 'Skala maksimum', type: 'number' },
          { key: 'publishPolicy', label: 'Publish policy', type: 'select', options: () => [{ value: 'auto', label: 'Langsung tampil' }, { value: 'approval', label: 'Perlu persetujuan' }] },
        ],
      },
      rules: {
        collection: 'behaviorRules', titleKey: 'adm.struct.rules',
        columns: [
          { label: 'Kode', render: (r) => UI.el('span', { class: 'mono xs' }, r.code) },
          { label: t('common.name'), key: 'name' },
          { label: 'Kategori', render: (r) => UI.chip(r.category) },
          { label: 'Poin', key: 'points' },
          { label: 'Tindakan', render: (r) => UI.el('span', { class: 'small muted' }, r.defaultAction || '—') },
        ],
        fields: [
          { key: 'code', label: 'Kode', type: 'text' },
          { key: 'name', label: t('common.name'), type: 'text' },
          { key: 'category', label: 'Kategori', type: 'select', options: () => [{ value: 'ringan', label: 'Ringan' }, { value: 'sedang', label: 'Sedang' }, { value: 'berat', label: 'Berat' }] },
          { key: 'points', label: 'Poin', type: 'number' },
          { key: 'defaultAction', label: 'Tindakan default', type: 'textarea' },
        ],
      },
    };

    const body = UI.el('div', {});
    function show(id) {
      const cfg = SECTIONS[id];
      const host = UI.el('div', {});
      const render = () => {
        UI.clear(host).append(UI.dataTable({
          columns: [...cfg.columns, {
            label: t('common.action'),
            render: (r) => UI.el('div', { class: 'row', style: { flexWrap: 'nowrap' } },
              UI.el('button', { class: 'btn sm', onclick: () => openForm(r) }, t('common.edit')),
              UI.el('button', { class: 'btn sm danger', onclick: () => UI.confirmDialog(r.name || r.code, () => { Store.remove(cfg.collection, r.id, ctx.session.userId); render(); }) }, t('common.delete'))),
          }],
          rows: Store.list(cfg.collection, (r) => r.tenantId === tid),
        }));
      };
      function openForm(existing) {
        const inputs = {};
        const nodes = cfg.fields.map((fd) => {
          let node;
          if (fd.type === 'select') node = UI.select([{ value: '', label: '—' }, ...fd.options().map((o) => ({ ...o, selected: existing?.[fd.key] === o.value }))]);
          else if (fd.type === 'textarea') node = UI.textarea({ value: existing?.[fd.key] || '' });
          else if (fd.type === 'check') node = UI.el('input', { type: 'checkbox', checked: existing?.[fd.key] || null, style: { width: 'auto' } });
          else node = UI.input({ type: fd.type, value: existing?.[fd.key] ?? '' });
          inputs[fd.key] = { node, fd };
          return UI.field(fd.label, node);
        });
        const m = UI.modal({
          title: `${existing ? t('common.edit') : t('common.add')} — ${t(cfg.titleKey)}`,
          body: UI.el('div', {}, nodes),
          footer: [
            UI.el('button', { class: 'btn ghost', onclick: () => m.close() }, t('common.cancel')),
            UI.el('button', {
              class: 'btn primary',
              onclick: () => {
                const data = { tenantId: tid, ...(cfg.defaults || {}) };
                for (const [key, { node, fd }] of Object.entries(inputs)) {
                  data[key] = fd.type === 'check' ? node.checked : fd.type === 'number' ? Number(node.value || 0) : node.value || null;
                }
                if (existing) Store.update(cfg.collection, existing.id, data, ctx.session.userId);
                else Store.insert(cfg.collection, data, ctx.session.userId);
                UI.toast(t('common.saved'), 'ok'); m.close(); render();
              },
            }, t('common.save')),
          ],
        });
      }
      UI.clear(body).append(
        UI.el('div', { class: 'row between', style: { marginBottom: 'var(--s-3)' } },
          UI.el('h3', {}, t(cfg.titleKey)),
          UI.el('button', { class: 'btn primary sm', onclick: () => openForm(null) }, `＋ ${t('common.add')}`)),
        host,
      );
      render();
    }

    container.append(
      UI.pageHead(t('nav.structure')),
      UI.tabs(Object.keys(SECTIONS).map((id) => ({ id, label: t(SECTIONS[id].titleKey) })), 'years', show),
      body,
    );
    show('years');
  },

  /* ---------------- Absensi (monitor) ---------------- */
  attendance(container, ctx) {
    const tid = ctx.session.tenantId;
    const classes = Store.list('classes', (c) => c.tenantId === tid && c.status === 'active');
    let date = todayISO(), classFilter = '';

    const host = UI.el('div', {});
    const render = () => {
      const sessions = Store.list('attendanceSessions', (a) =>
        a.tenantId === tid && a.date === date && (!classFilter || a.unitId === classFilter));
      const pending = classes.filter((c) => !Store.list('attendanceSessions', (a) => a.tenantId === tid && a.date === date && a.unitType === 'class' && a.unitId === c.id).length);

      UI.clear(host);
      if (pending.length) {
        host.append(UI.el('div', { class: 'panel', style: { borderColor: 'rgba(245,184,61,.4)' } },
          UI.el('h3', { class: 'small' }, `⚠️ ${t('adm.att.pending')}`),
          UI.el('div', { class: 'row' }, pending.map((c) => UI.chip(c.name, 'warn')))));
      }
      if (!sessions.length) { host.append(UI.emptyState(t('adm.att.noSession'), '📋')); return; }

      for (const ses of sessions) {
        const unitName = ses.unitType === 'class' ? classNameOf(ses.unitId) : halaqahNameOf(ses.unitId);
        const recap = { hadir: 0, izin: 0, sakit: 0, alfa: 0, terlambat: 0 };
        ses.records.forEach((r) => { if (recap[r.status] !== undefined) recap[r.status] += 1; });
        host.append(UI.el('div', { class: 'panel' },
          UI.el('div', { class: 'panel-title' },
            UI.el('h3', {}, `${unitName} — ${t('att.session')} ${ses.session}`),
            UI.el('div', { class: 'row' }, Store.ATT_STATUSES.map((st) => UI.chip(`${t('att.' + st)}: ${recap[st]}`)))),
          UI.el('div', { class: 'small muted', style: { marginBottom: 'var(--s-2)' } }, `${t('common.teacher')}: ${userNameOf(ses.teacherId)}`),
          UI.dataTable({
            columns: [
              { label: t('common.student'), render: (r) => studentNameOf(r.studentId) },
              { label: t('common.status'), render: (r) => UI.chip(t('att.' + r.status), { hadir: 'ok', izin: 'info', sakit: 'warn', alfa: 'danger', terlambat: 'warn' }[r.status]) },
              { label: t('common.note'), render: (r) => r.note || '—' },
            ],
            rows: ses.records,
          }),
        ));
      }
    };

    container.append(
      UI.pageHead(t('nav.attendance')),
      UI.el('div', { class: 'filterbar' },
        UI.input({ type: 'date', value: date, onchange: (e) => { date = e.target.value; render(); } }),
        UI.select([{ value: '', label: t('common.all') }, ...classes.map((c) => ({ value: c.id, label: c.name }))], { onchange: (e) => { classFilter = e.target.value; render(); } }),
      ),
      host,
    );
    render();
  },

  /* ---------------- Nilai (monitor + publish) ---------------- */
  grades(container, ctx) {
    const tid = ctx.session.tenantId;
    const classes = Store.list('classes', (c) => c.tenantId === tid);
    const subjects = Store.list('subjects', (s) => s.tenantId === tid);
    let classFilter = classes[0]?.id || '', subjectFilter = '';

    const host = UI.el('div', {});
    const render = () => {
      const entries = Store.list('gradeEntries', (g) =>
        g.tenantId === tid && (!classFilter || g.classId === classFilter) && (!subjectFilter || g.subjectId === subjectFilter));
      const avg = entries.length ? (entries.reduce((s, e) => s + e.score, 0) / entries.length).toFixed(1) : '—';
      UI.clear(host).append(
        UI.el('div', { class: 'grid grid-3', style: { marginBottom: 'var(--s-4)' } },
          UI.kpiCard({ label: t('adm.grades.avg'), value: avg }),
          UI.kpiCard({ label: t('adm.grades.published'), value: entries.filter((e) => e.published).length, tone: 'ok' }),
          UI.kpiCard({ label: t('adm.grades.hidden'), value: entries.filter((e) => !e.published).length, tone: 'warn' }),
        ),
        UI.dataTable({
          columns: [
            { label: t('common.student'), render: (g) => studentNameOf(g.studentId) },
            { label: t('adm.struct.subjects'), render: (g) => Store.get('subjects', g.subjectId)?.name || '—' },
            { label: t('adm.struct.components'), render: (g) => Store.get('gradeComponents', g.componentId)?.name || '—' },
            { label: t('common.date'), render: (g) => fmtDate(g.date) },
            { label: 'Nilai', render: (g) => UI.el('strong', {}, g.score) },
            { label: 'Publish', render: (g) => UI.el('button', {
                class: `btn sm ${g.published ? '' : 'primary'}`,
                onclick: () => { Store.update('gradeEntries', g.id, { published: !g.published }, ctx.session.userId); render(); },
              }, g.published ? '✓ ' + t('adm.grades.published') : t('adm.grades.hidden')) },
          ],
          rows: entries.sort((a, b) => b.date.localeCompare(a.date)),
        }),
      );
    };

    container.append(
      UI.pageHead(t('nav.grades')),
      UI.el('div', { class: 'filterbar' },
        UI.select(classes.map((c) => ({ value: c.id, label: c.name, selected: c.id === classFilter })), { onchange: (e) => { classFilter = e.target.value; render(); } }),
        UI.select([{ value: '', label: t('common.all') }, ...subjects.map((s) => ({ value: s.id, label: s.name }))], { onchange: (e) => { subjectFilter = e.target.value; render(); } }),
      ),
      host,
    );
    render();
  },

  /* ---------------- Hafalan (monitor) ---------------- */
  memorization(container, ctx) {
    const tid = ctx.session.tenantId;
    const halaqahs = Store.list('halaqahs', (h) => h.tenantId === tid);
    let hlqFilter = halaqahs[0]?.id || '';

    const host = UI.el('div', {});
    const render = () => {
      const records = Store.list('memorizationRecords', (m) => m.tenantId === tid && (!hlqFilter || m.halaqahId === hlqFilter))
        .sort((a, b) => b.date.localeCompare(a.date));
      const byStudent = {};
      records.forEach((r) => { (byStudent[r.studentId] ||= []).push(r); });

      UI.clear(host).append(
        UI.el('div', { class: 'panel' },
          UI.el('h3', {}, t('adm.memo.progress')),
          UI.el('div', { class: 'grid grid-2' },
            Object.entries(byStudent).map(([sid, recs]) => {
              const lancar = recs.filter((r) => r.result === 'lancar').length;
              const pct = Math.round((lancar / recs.length) * 100);
              return UI.el('div', {},
                UI.el('div', { class: 'row between small' },
                  UI.el('span', {}, studentNameOf(sid)),
                  UI.el('span', { class: 'muted' }, `${lancar}/${recs.length} ${t('memo.result.lancar').toLowerCase()}`)),
                UI.progressBar(pct));
            }))),
        UI.el('div', { class: 'panel' },
          UI.el('h3', {}, t('adm.memo.recent')),
          UI.dataTable({
            columns: [
              { label: t('common.date'), render: (r) => fmtDate(r.date) },
              { label: t('common.student'), render: (r) => studentNameOf(r.studentId) },
              { label: 'Materi', render: (r) => `${r.material}${r.fromAyah ? ` (${r.fromAyah}–${r.toAyah})` : ''}` },
              { label: 'Hasil', render: (r) => UI.chip(t('memo.result.' + (r.result === 'ulang' ? 'ulang' : r.result)), { lancar: 'ok', cukup: 'info', ulang: 'warn', tidak: 'danger' }[r.result]) },
              { label: 'Nilai', render: (r) => r.score ?? '—' },
              { label: t('common.teacher'), render: (r) => userNameOf(r.teacherId) },
            ],
            rows: records.slice(0, 30),
          })),
      );
    };

    container.append(
      UI.pageHead(t('nav.memorization')),
      UI.el('div', { class: 'filterbar' },
        UI.select([{ value: '', label: t('common.all') }, ...halaqahs.map((h) => ({ value: h.id, label: h.name, selected: h.id === hlqFilter }))], { onchange: (e) => { hlqFilter = e.target.value; render(); } })),
      host,
    );
    render();
  },

  /* ---------------- Perilaku (monitor + tindak lanjut) ---------------- */
  behavior(container, ctx) {
    const tid = ctx.session.tenantId;
    let kindFilter = '';
    const host = UI.el('div', {});
    const render = () => {
      const events = Store.list('behaviorEvents', (e) => e.tenantId === tid && (!kindFilter || e.kind === kindFilter))
        .sort((a, b) => b.date.localeCompare(a.date));
      UI.clear(host).append(UI.dataTable({
        columns: [
          { label: t('common.date'), render: (e) => fmtDate(e.date) },
          { label: t('common.student'), render: (e) => studentNameOf(e.studentId) },
          { label: 'Jenis', render: (e) => UI.chip(e.kind === 'good' ? '👍 baik' : '⚠ pelanggaran', e.kind === 'good' ? 'ok' : 'danger') },
          { label: 'Aturan', render: (e) => e.ruleId ? (Store.get('behaviorRules', e.ruleId)?.name || '—') : '—' },
          { label: 'Poin', key: 'points' },
          { label: 'Kronologi', render: (e) => UI.el('span', { class: 'small' }, e.chronology) },
          { label: t('adm.bhv.followup'), render: (e) => UI.select(
              ['open', 'process', 'done'].map((s) => ({ value: s, label: s, selected: e.status === s })),
              { onchange: (ev) => { Store.update('behaviorEvents', e.id, { status: ev.target.value }, ctx.session.userId); UI.toast(t('common.saved'), 'ok'); } }) },
        ],
        rows: events,
      }));
    };
    container.append(
      UI.pageHead(t('nav.behavior')),
      UI.el('div', { class: 'filterbar' },
        UI.select([{ value: '', label: t('common.all') }, { value: 'good', label: '👍 baik' }, { value: 'violation', label: '⚠ pelanggaran' }], { onchange: (e) => { kindFilter = e.target.value; render(); } })),
      host,
    );
    render();
  },

  /* ---------------- Keuangan: produk + generate + daftar tagihan ---------------- */
  billing(container, ctx) {
    const tid = ctx.session.tenantId;
    let statusFilter = '';

    const productHost = UI.el('div', {});
    const billHost = UI.el('div', {});

    const renderProducts = () => {
      UI.clear(productHost).append(UI.dataTable({
        columns: [
          { label: t('common.name'), key: 'name' },
          { label: 'Kategori', render: (p) => UI.chip(p.category, 'info') },
          { label: t('common.amount'), render: (p) => fmtMoney(p.amount) },
          { label: t('common.dueDate'), render: (p) => p.dueRule || '—' },
          { label: t('adm.fin.installment'), render: (p) => p.allowInstallment ? '✓' : '—' },
          { label: t('common.action'), render: (p) => UI.el('div', { class: 'row', style: { flexWrap: 'nowrap' } },
            UI.el('button', { class: 'btn sm', onclick: () => openProductForm(p) }, t('common.edit')),
            UI.el('button', { class: 'btn sm danger', onclick: () => UI.confirmDialog(p.name, () => { Store.remove('billProducts', p.id, ctx.session.userId); renderProducts(); }) }, t('common.delete'))) },
        ],
        rows: Store.list('billProducts', (p) => p.tenantId === tid),
      }));
    };

    const renderBills = () => {
      const bills = Store.list('bills', (b) => b.tenantId === tid && (!statusFilter || b.status === statusFilter))
        .sort((a, b) => (a.status === 'unpaid' ? 0 : 1) - (b.status === 'unpaid' ? 0 : 1));
      UI.clear(billHost).append(UI.dataTable({
        columns: [
          { label: t('common.student'), render: (b) => studentNameOf(b.studentId) },
          { label: t('common.name'), key: 'name' },
          { label: t('common.period'), key: 'period' },
          { label: t('common.amount'), render: (b) => fmtMoney(b.amount) },
          { label: t('adm.dash.paid'), render: (b) => fmtMoney(b.paidAmount || 0) },
          { label: t('common.dueDate'), render: (b) => fmtDate(b.dueDate) },
          { label: t('common.status'), render: (b) => UI.statusChip(b.status) },
        ],
        rows: bills,
      }));
    };

    function openProductForm(existing) {
      const f = {
        name: UI.input({ value: existing?.name || '' }),
        category: UI.select(['recurring', 'one-time', 'voluntary-donation', 'compulsory-donation'].map((c) => ({ value: c, label: c, selected: existing?.category === c }))),
        amount: UI.input({ type: 'number', value: existing?.amount ?? '' }),
        dueRule: UI.input({ value: existing?.dueRule || '' }),
        allowInstallment: UI.el('input', { type: 'checkbox', checked: existing?.allowInstallment || null, style: { width: 'auto' } }),
        target: UI.select([{ value: 'all', label: t('common.all') }, { value: 'boarding', label: 'Santri mukim' }].map((o) => ({ ...o, selected: existing?.target === o.value }))),
      };
      const m = UI.modal({
        title: existing ? t('common.edit') : t('adm.fin.addProduct'),
        body: UI.el('div', { class: 'form-grid' },
          UI.field(t('common.name'), f.name), UI.field('Kategori', f.category),
          UI.field(t('common.amount'), f.amount), UI.field(t('common.dueDate'), f.dueRule),
          UI.field(t('adm.fin.installment'), f.allowInstallment), UI.field('Target', f.target),
        ),
        footer: [
          UI.el('button', { class: 'btn ghost', onclick: () => m.close() }, t('common.cancel')),
          UI.el('button', {
            class: 'btn primary',
            onclick: () => {
              if (!f.name.value.trim() || !f.amount.value) { UI.toast(t('common.required'), 'warn'); return; }
              const data = {
                tenantId: tid, name: f.name.value.trim(), category: f.category.value,
                amount: Number(f.amount.value), dueRule: f.dueRule.value || null,
                allowInstallment: f.allowInstallment.checked, target: f.target.value,
              };
              if (existing) Store.update('billProducts', existing.id, data, ctx.session.userId);
              else Store.insert('billProducts', data, ctx.session.userId);
              UI.toast(t('common.saved'), 'ok'); m.close(); renderProducts();
            },
          }, t('common.save')),
        ],
      });
    }

    function openGenerate() {
      const products = Store.list('billProducts', (p) => p.tenantId === tid);
      const classes = Store.list('classes', (c) => c.tenantId === tid);
      const f = {
        product: UI.select(products.map((p) => ({ value: p.id, label: `${p.name} (${fmtMoney(p.amount)})` }))),
        period: UI.input({ value: currentMonthName() }),
        target: UI.select([{ value: 'all', label: t('common.all') }, ...classes.map((c) => ({ value: c.id, label: c.name }))]),
        override: UI.input({ type: 'number', placeholder: t('common.optional') }),
        dueDate: UI.input({ type: 'date', value: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10) }),
        note: UI.textarea({}),
      };
      const m = UI.modal({
        title: t('adm.fin.generate'),
        body: UI.el('div', { class: 'form-grid' },
          UI.el('div', { class: 'full' }, UI.field('Produk', f.product)),
          UI.field(t('common.period'), f.period), UI.field('Target', f.target),
          UI.field(`${t('common.amount')} override`, f.override), UI.field(t('common.dueDate'), f.dueDate),
          UI.el('div', { class: 'full' }, UI.field(t('common.note'), f.note)),
        ),
        footer: [
          UI.el('button', { class: 'btn ghost', onclick: () => m.close() }, t('common.cancel')),
          UI.el('button', {
            class: 'btn primary',
            onclick: () => {
              const product = Store.get('billProducts', f.product.value);
              if (!product || !f.period.value.trim()) { UI.toast(t('common.required'), 'warn'); return; }
              let targets = Store.studentsOf(tid).filter((s) => s.status === 'active');
              if (f.target.value !== 'all') targets = targets.filter((s) => s.classId === f.target.value);
              if (product.target === 'boarding') targets = targets.filter((s) => s.roomId);
              let created = 0, skipped = 0;
              for (const s of targets) {
                const dup = Store.list('bills', (b) => b.tenantId === tid && b.studentId === s.id && b.productId === product.id && b.period === f.period.value.trim()).length;
                if (dup) { skipped += 1; continue; }
                Store.insert('bills', {
                  tenantId: tid, studentId: s.id, productId: product.id,
                  name: product.name, period: f.period.value.trim(),
                  amount: f.override.value ? Number(f.override.value) : product.amount,
                  paidAmount: 0, dueDate: f.dueDate.value, status: 'unpaid',
                  note: f.note.value || '',
                }, ctx.session.userId);
                created += 1;
              }
              UI.toast(`✅ ${created} ${t('adm.fin.generated')}, ${skipped} ${t('adm.fin.skipped')}`, 'ok');
              m.close(); renderBills();
            },
          }, t('adm.fin.generate')),
        ],
      });
    }

    container.append(
      UI.pageHead(t('nav.billing'), null,
        UI.el('button', { class: 'btn', onclick: () => openProductForm(null) }, `＋ ${t('adm.fin.addProduct')}`),
        UI.el('button', { class: 'btn primary', onclick: openGenerate }, `⚡ ${t('adm.fin.generate')}`)),
      UI.el('h3', {}, t('adm.fin.products')), productHost,
      UI.el('div', { class: 'row between', style: { margin: 'var(--s-5) 0 var(--s-3)' } },
        UI.el('h3', { style: { margin: 0 } }, t('adm.fin.billList')),
        UI.select([{ value: '', label: t('common.all') }, ...['unpaid', 'pending', 'partial', 'paid', 'expired'].map((s) => ({ value: s, label: t('status.' + s) }))], { onchange: (e) => { statusFilter = e.target.value; renderBills(); } })),
      billHost,
    );
    renderProducts();
    renderBills();
  },

  /* ---------------- Rekonsiliasi pembayaran ---------------- */
  reconciliation(container, ctx) {
    const tid = ctx.session.tenantId;
    let statusFilter = '', methodFilter = '';
    const host = UI.el('div', {});

    const render = () => {
      const payments = Store.list('payments', (p) => p.tenantId === tid &&
        (!statusFilter || p.status === statusFilter) && (!methodFilter || p.method === methodFilter))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      UI.clear(host).append(UI.dataTable({
        columns: [
          { label: 'Reference', render: (p) => UI.el('span', { class: 'mono xs' }, p.reference) },
          { label: t('common.student'), render: (p) => studentNameOf(p.studentId) },
          { label: t('common.guardian'), render: (p) => p.guardianId ? userNameOf(p.guardianId) : '—' },
          { label: 'Metode', render: (p) => UI.chip(p.method, 'info') },
          { label: t('common.amount'), render: (p) => fmtMoney(p.amount) },
          { label: 'Waktu', render: (p) => fmtDateTime(p.paidAt || p.createdAt) },
          { label: t('common.status'), render: (p) => UI.statusChip(p.status) },
          { label: t('common.action'), render: (p) => UI.el('div', { class: 'row', style: { flexWrap: 'nowrap' } },
            p.status === 'pending' ? UI.el('button', {
              class: 'btn sm primary',
              onclick: () => { Store.simulateWebhook(p.id, 'paid', ctx.session.userId); UI.toast(t('common.saved'), 'ok'); render(); },
            }, t('adm.recon.markPaid')) : null,
            p.status === 'paid' ? UI.el('button', {
              class: 'btn sm',
              onclick: () => {
                const rcp = Store.list('receipts', (r) => r.paymentId === p.id)[0];
                if (!rcp) { UI.toast(t('common.empty'), 'warn'); return; }
                UI.modal({
                  title: `🧾 ${rcp.number}`,
                  body: UI.el('div', { class: 'receipt' },
                    UI.el('div', { class: 'muted xs' }, fmtDateTime(rcp.paidAt)),
                    UI.el('div', { class: 'amount' }, fmtMoney(rcp.amount)),
                    UI.el('div', { class: 'rows' },
                      UI.el('div', { class: 'r' }, UI.el('span', { class: 'k' }, 'No.'), UI.el('span', { class: 'mono xs' }, rcp.number)),
                      UI.el('div', { class: 'r' }, UI.el('span', { class: 'k' }, t('common.student')), UI.el('span', {}, studentNameOf(rcp.studentId))),
                      UI.el('div', { class: 'r' }, UI.el('span', { class: 'k' }, 'Metode'), UI.el('span', {}, rcp.method)),
                    ),
                  ),
                });
              },
            }, t('adm.recon.receipt')) : null) },
        ],
        rows: payments,
      }));
    };

    container.append(
      UI.pageHead(t('nav.reconciliation')),
      UI.el('div', { class: 'filterbar' },
        UI.select([{ value: '', label: `${t('common.status')}: ${t('common.all')}` }, ...['pending', 'paid', 'failed', 'expired'].map((s) => ({ value: s, label: t('status.' + s) }))], { onchange: (e) => { statusFilter = e.target.value; render(); } }),
        UI.select([{ value: '', label: `Metode: ${t('common.all')}` }, ...['qris', 'va_bca', 'va_mandiri', 'ewallet', 'manual'].map((mm) => ({ value: mm, label: mm }))], { onchange: (e) => { methodFilter = e.target.value; render(); } }),
      ),
      host,
    );
    render();
  },

  /* ---------------- Laporan + export CSV ---------------- */
  reports(container, ctx) {
    const tid = ctx.session.tenantId;
    const monthStart = monthStartISO();

    const sessions = Store.list('attendanceSessions', (a) => a.tenantId === tid && a.date >= monthStart);
    const recs = sessions.flatMap((s) => s.records);
    const attPct = recs.length ? Math.round((recs.filter((r) => r.status === 'hadir' || r.status === 'terlambat').length / recs.length) * 100) : 0;

    const grades = Store.list('gradeEntries', (g) => g.tenantId === tid);
    const avgGrade = grades.length ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1) : '—';

    const memoCount = Store.list('memorizationRecords', (m) => m.tenantId === tid).length;

    const bills = Store.list('bills', (b) => b.tenantId === tid);
    const payRate = bills.length ? Math.round((bills.filter((b) => b.status === 'paid').length / bills.length) * 100) : 0;

    container.append(
      UI.pageHead(t('nav.reports'), currentMonthName()),
      UI.el('div', { class: 'grid grid-4' },
        UI.kpiCard({ label: t('adm.report.attendance'), value: `${attPct}%`, tone: attPct >= 85 ? 'ok' : 'warn' }),
        UI.kpiCard({ label: t('adm.report.avgGrade'), value: avgGrade }),
        UI.kpiCard({ label: t('adm.report.memo'), value: memoCount }),
        UI.kpiCard({ label: t('adm.report.payRate'), value: `${payRate}%`, tone: payRate >= 70 ? 'ok' : 'warn' }),
      ),
      UI.el('div', { class: 'panel', style: { marginTop: 'var(--s-4)' } },
        UI.el('h3', {}, t('adm.report.export')),
        UI.el('div', { class: 'row' },
          UI.el('button', {
            class: 'btn',
            onclick: () => downloadCSV('absensi.csv',
              ['Tanggal', 'Unit', 'Sesi', 'Siswa', 'Status', 'Catatan'],
              sessions.flatMap((s) => s.records.map((r) => [
                s.date, s.unitType === 'class' ? classNameOf(s.unitId) : halaqahNameOf(s.unitId),
                s.session, studentNameOf(r.studentId), r.status, r.note || '']))),
          }, `📋 ${t('nav.attendance')}`),
          UI.el('button', {
            class: 'btn',
            onclick: () => downloadCSV('nilai.csv',
              ['Tanggal', 'Siswa', 'Kelas', 'Mapel', 'Komponen', 'Nilai', 'Published'],
              grades.map((g) => [g.date, studentNameOf(g.studentId), classNameOf(g.classId),
                Store.get('subjects', g.subjectId)?.name || '', Store.get('gradeComponents', g.componentId)?.name || '',
                g.score, g.published ? 'ya' : 'tidak'])),
          }, `📝 ${t('nav.grades')}`),
          UI.el('button', {
            class: 'btn',
            onclick: () => downloadCSV('tagihan.csv',
              ['Siswa', 'Tagihan', 'Periode', 'Nominal', 'Dibayar', 'JatuhTempo', 'Status'],
              bills.map((b) => [studentNameOf(b.studentId), b.name, b.period, b.amount, b.paidAmount || 0, b.dueDate, b.status])),
          }, `💰 ${t('nav.billing')}`),
        ),
      ),
    );
  },
};

export default {
  id: 'admin',
  role: 'admin',
  shell: 'sidebar',
  defaultRoute: 'dashboard',
  navGroups: [
    { items: [{ route: 'dashboard', icon: '📊', label: 'nav.dashboard' }] },
    {
      label: 'nav.masterdata',
      items: [
        { route: 'students', icon: '🎓', label: 'nav.students' },
        { route: 'teachers', icon: '👳', label: 'nav.teachers' },
        { route: 'guardians', icon: '👨‍👩‍👧', label: 'nav.guardians' },
        { route: 'structure', icon: '🏗️', label: 'nav.structure' },
      ],
    },
    {
      label: 'nav.academic',
      items: [
        { route: 'attendance', icon: '📋', label: 'nav.attendance' },
        { route: 'grades', icon: '📝', label: 'nav.grades' },
        { route: 'memorization', icon: '📖', label: 'nav.memorization' },
        { route: 'behavior', icon: '🧭', label: 'nav.behavior' },
      ],
    },
    {
      label: 'nav.finance',
      items: [
        { route: 'billing', icon: '💰', label: 'nav.billing' },
        { route: 'reconciliation', icon: '🔄', label: 'nav.reconciliation' },
      ],
    },
    { items: [{ route: 'reports', icon: '📈', label: 'nav.reports' }] },
  ],
  routes,
};
