/* ============================================================
   Portal Guru / Ustadz — shell mobile, role 'teacher'.
   Prinsip: ringan, cepat, input dalam beberapa sentuhan,
   draft offline saat sinyal lemah.
   ============================================================ */

import I18n, { t, fmtMoney, fmtDate } from '../core/i18n.js';
import * as Store from '../core/store.js';
import * as UI from '../core/ui.js';

const { el } = UI;

I18n.extend({
  id: {
    'guru.greeting': 'Assalamu’alaikum',
    'guru.agendaToday': 'Agenda hari ini',
    'guru.students': 'santri',
    'guru.attDone': 'Sudah diabsen',
    'guru.attPending': 'Belum diabsen',
    'guru.pendingTasks': 'Tugas belum selesai',
    'guru.draftsOffline': 'Draf offline',
    'guru.unitsNotAttended': 'Unit belum diabsen',
    'guru.announcements': 'Pengumuman',
    'guru.tasksSub': 'Input cepat dalam beberapa sentuhan',
    'guru.tab.absensi': 'Absensi',
    'guru.tab.hafalan': 'Hafalan',
    'guru.tab.nilai': 'Nilai',
    'guru.tab.perilaku': 'Perilaku',
    'guru.unit': 'Kelas / Halaqah',
    'guru.unitClass': 'Kelas',
    'guru.unitHalaqah': 'Halaqah',
    'guru.session.pagi': 'Pagi',
    'guru.session.siang': 'Siang',
    'guru.session.malam': 'Malam',
    'guru.saveAttendance': 'Simpan Absensi',
    'guru.attExists': 'Absensi sesi ini sudah ada — simpan akan memperbarui data',
    'guru.attSaved': 'Absensi tersimpan',
    'guru.attUpdated': 'Absensi diperbarui',
    'guru.noUnits': 'Belum ada kelas/halaqah yang diampu',
    'guru.noHalaqah': 'Belum ada halaqah yang diampu',
    'guru.memoType': 'Jenis setoran',
    'guru.memoType.quran': 'Al-Qur’an',
    'guru.memoType.hadits': 'Hadits',
    'guru.memoType.doa': 'Doa',
    'guru.memoType.matan': 'Matan',
    'guru.memoType.lainnya': 'Lainnya',
    'guru.material': 'Materi',
    'guru.fromAyah': 'Dari ayat',
    'guru.toAyah': 'Sampai ayat',
    'guru.result': 'Hasil',
    'guru.score': 'Nilai',
    'guru.saveMemo': 'Simpan Setoran',
    'guru.memoSaved': 'Setoran hafalan tersimpan',
    'guru.materialRequired': 'Materi wajib diisi',
    'guru.subject': 'Mata pelajaran',
    'guru.component': 'Komponen nilai',
    'guru.saveGrades': 'Simpan Nilai',
    'guru.gradesSaved': '{n} nilai tersimpan',
    'guru.noGradeSetup': 'Belum ada kelas/mapel yang diampu',
    'guru.noScores': 'Isi minimal satu nilai terlebih dulu',
    'guru.kind': 'Jenis catatan',
    'guru.kind.good': 'Catatan baik',
    'guru.kind.violation': 'Pelanggaran',
    'guru.rule': 'Aturan pelanggaran',
    'guru.points': 'Poin',
    'guru.chronology': 'Kronologi',
    'guru.followUp': 'Tindak lanjut',
    'guru.notifyGuardian': 'Kirim notifikasi ke wali',
    'guru.saveBehavior': 'Simpan Catatan',
    'guru.behaviorSaved': 'Catatan perilaku tersimpan',
    'guru.chronologyRequired': 'Kronologi wajib diisi',
    'guru.notif.good': 'Catatan baik untuk {name}',
    'guru.notif.violation': 'Catatan pelanggaran untuk {name}',
    'guru.historySub': 'Semua input yang pernah Anda simpan',
    'guru.pendingSync': 'Menunggu sinkron',
    'guru.homeroom': 'Wali kelas',
    'guru.musyrif': 'Musyrif',
    'guru.myUnits': 'Unit ajar',
    'guru.mySubjects': 'Mata pelajaran',
    'guru.recapMonth': 'Rekap bulan ini',
    'status.open': 'Terbuka',
    'status.process': 'Proses',
    'status.done': 'Selesai',
  },
  en: {
    'guru.greeting': 'Assalamu’alaikum',
    'guru.agendaToday': 'Today’s agenda',
    'guru.tab.absensi': 'Attendance',
    'guru.tab.hafalan': 'Memorization',
    'guru.tab.nilai': 'Grades',
    'guru.tab.perilaku': 'Behavior',
    'guru.tasksSub': 'Quick input in a few taps',
    'guru.pendingTasks': 'Unfinished tasks',
    'guru.saveAttendance': 'Save Attendance',
    'guru.saveMemo': 'Save Recitation',
    'guru.saveGrades': 'Save Grades',
    'guru.saveBehavior': 'Save Note',
    'guru.historySub': 'Everything you have saved',
    'guru.myUnits': 'Teaching units',
    'guru.mySubjects': 'Subjects',
    'status.open': 'Open',
    'status.process': 'In process',
    'status.done': 'Done',
  },
  ar: {
    'guru.greeting': 'السلام عليكم',
    'guru.agendaToday': 'جدول اليوم',
    'guru.tab.absensi': 'الحضور',
    'guru.tab.hafalan': 'التحفيظ',
    'guru.tab.nilai': 'الدرجات',
    'guru.tab.perilaku': 'السلوك',
    'guru.tasksSub': 'إدخال سريع بلمسات قليلة',
    'guru.pendingTasks': 'مهام غير منجزة',
    'guru.saveAttendance': 'حفظ الحضور',
    'guru.saveMemo': 'حفظ التسميع',
    'guru.saveGrades': 'حفظ الدرجات',
    'guru.saveBehavior': 'حفظ الملاحظة',
    'guru.historySub': 'كل ما قمت بحفظه',
    'guru.myUnits': 'وحدات التدريس',
    'guru.mySubjects': 'المواد',
    'status.open': 'مفتوح',
    'status.process': 'قيد المعالجة',
    'status.done': 'منجز',
  },
});

/* ---------- Util ---------- */
const ATT_TONES = { hadir: 'ok', izin: '', sakit: 'warn', alfa: 'danger', terlambat: 'warn' };
const SESSIONS = ['Pagi', 'Siang', 'Malam'];
const TASK_KINDS = ['absensi', 'hafalan', 'nilai', 'perilaku'];

function todayISO() { return new Date().toISOString().slice(0, 10); }
function meOf(ctx) { return Store.get('users', ctx.session.userId); }
function unitKey(u) { return `${u.unitType}:${u.id}`; }

function unitName(unitType, unitId) {
  const u = Store.get(unitType === 'class' ? 'classes' : 'halaqahs', unitId);
  return u?.name || unitId;
}

function attendedToday(unit) {
  const today = todayISO();
  return Store.list('attendanceSessions', (a) => a.unitId === unit.id && a.unitType === unit.unitType && a.date === today).length > 0;
}

function bigBtn(label, onclick, extraClass = 'primary') {
  return el('button', { class: `btn ${extraClass} block`, style: { padding: '14px', fontSize: '1rem', marginTop: 'var(--s-4)' }, onclick }, label);
}

/* ============================================================
   Route: home
   ============================================================ */
function home(container, ctx) {
  const me = meOf(ctx);
  const units = Store.unitsOf(me);
  const today = todayISO();
  const drafts = Store.listDrafts();
  const notAttended = units.filter((u) => !attendedToday(u));

  // Sapaan + tanggal
  container.append(el('div', { class: 'panel', style: { marginBottom: 'var(--s-4)' } },
    el('div', { class: 'row between' },
      el('div', {},
        el('div', { style: { fontWeight: 700, fontSize: '1.12rem' } }, `${t('guru.greeting')}, ${me.name}`),
        el('div', { class: 'small muted' }, fmtDate(today, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })),
      ),
      UI.avatar(me.name),
    ),
  ));

  // Quick actions
  container.append(el('div', { class: 'quick-grid' },
    [['absensi', '🗓️'], ['hafalan', '📖'], ['nilai', '📝'], ['perilaku', '⭐']].map(([kind, ico]) =>
      el('div', { class: 'quick', onclick: () => ctx.navigate(`guru/tugas/${kind}`) },
        el('span', { class: 'ico' }, ico),
        el('span', {}, t(`guru.tab.${kind}`)),
      )),
  ));

  // Agenda hari ini
  container.append(el('div', { class: 'panel' },
    el('div', { class: 'panel-title' }, el('h3', {}, `📋 ${t('guru.agendaToday')}`)),
    units.length
      ? units.map((u) => {
        const done = attendedToday(u);
        const count = Store.studentsInUnit(u.unitType, u.id).length;
        return el('div', {
          class: 'list-item', style: { cursor: 'pointer' },
          onclick: () => ctx.navigate(`guru/tugas/absensi/${unitKey(u)}`),
        },
          el('span', { style: { fontSize: '20px' } }, u.unitType === 'class' ? '🏫' : '📖'),
          el('div', { class: 'body' },
            el('div', { class: 'title' }, u.name),
            el('div', { class: 'sub' }, `${t(u.unitType === 'class' ? 'guru.unitClass' : 'guru.unitHalaqah')} · ${count} ${t('guru.students')}`),
          ),
          UI.chip(done ? `✓ ${t('guru.attDone')}` : t('guru.attPending'), done ? 'ok' : 'warn'),
        );
      })
      : UI.emptyState(t('guru.noUnits')),
  ));

  // Tugas belum selesai
  container.append(el('div', { class: 'panel' },
    el('div', { class: 'panel-title' }, el('h3', {}, `⏳ ${t('guru.pendingTasks')}`)),
    el('div', { class: 'grid grid-2' },
      UI.kpiCard({ label: t('guru.draftsOffline'), value: String(drafts.length), tone: drafts.length ? 'warn' : '', onClick: () => ctx.navigate('guru/riwayat') }),
      UI.kpiCard({ label: t('guru.unitsNotAttended'), value: String(notAttended.length), tone: notAttended.length ? 'warn' : 'ok', onClick: () => ctx.navigate('guru/tugas/absensi') }),
    ),
  ));

  // Pengumuman untuk guru
  const anns = Store.list('announcements', (a) => a.tenantId === ctx.session.tenantId && (a.audience === 'all' || a.audience === 'teacher'))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  container.append(el('div', { class: 'panel' },
    el('div', { class: 'panel-title' }, el('h3', {}, `📣 ${t('guru.announcements')}`)),
    anns.length
      ? anns.slice(0, 4).map((a) => el('div', { class: 'list-item' },
        el('div', { class: 'body' },
          el('div', { class: 'title' }, a.title),
          el('div', { class: 'sub' }, fmtDate(a.date)),
          el('div', { class: 'small muted' }, a.body),
        ),
      ))
      : UI.emptyState(t('common.empty'), '📣'),
  ));
}

/* ============================================================
   Route: kelas — unit ajar + drawer daftar santri
   ============================================================ */
function kelas(container, ctx) {
  const me = meOf(ctx);
  const units = Store.unitsOf(me);
  container.append(UI.pageHead(t('nav.classes'), t('guru.myUnits')));

  if (!units.length) { container.append(UI.emptyState(t('guru.noUnits'))); return; }

  units.forEach((u) => {
    const students = Store.studentsInUnit(u.unitType, u.id);
    const pj = Store.get('users', u.unitType === 'class' ? u.homeroomId : u.musyrifId);
    container.append(el('div', {
      class: 'panel', style: { cursor: 'pointer', marginBottom: 'var(--s-3)' },
      onclick: () => openUnitDrawer(u, students),
    },
      el('div', { class: 'row between' },
        el('div', {},
          el('div', { style: { fontWeight: 700, fontSize: '1.02rem' } }, u.name),
          el('div', { class: 'small muted' },
            `${students.length} ${t('guru.students')} · ${t(u.unitType === 'class' ? 'guru.homeroom' : 'guru.musyrif')}: ${pj?.name || '—'}`),
        ),
        UI.chip(t(u.unitType === 'class' ? 'guru.unitClass' : 'guru.unitHalaqah'), u.unitType === 'class' ? 'accent' : 'info'),
      ),
    ));
  });

  function openUnitDrawer(u, students) {
    const monthStart = todayISO().slice(0, 8) + '01';
    UI.drawer({
      title: u.name,
      body: el('div', {},
        el('div', { class: 'small muted', style: { marginBottom: 'var(--s-3)' } }, t('guru.recapMonth')),
        students.length ? students.map((s) => {
          const r = Store.attendanceRecap(s.id, monthStart);
          const recapStr = Store.ATT_STATUSES.filter((st) => r[st] > 0).map((st) => `${t('att.' + st)} ${r[st]}`).join(' · ');
          return el('div', { class: 'list-item' },
            UI.avatar(s.name),
            el('div', { class: 'body' },
              el('div', { class: 'title' }, s.name),
              el('div', { class: 'sub' }, `NIS ${s.nis}`),
              el('div', { class: 'xs muted' }, recapStr || t('common.empty')),
            ),
          );
        }) : UI.emptyState(t('common.empty')),
      ),
    });
  }
}

/* ============================================================
   Route: tugas — hub input (absensi / hafalan / nilai / perilaku)
   ============================================================ */
function tugas(container, ctx) {
  const me = meOf(ctx);
  let active = TASK_KINDS.includes(ctx.params[0]) ? ctx.params[0] : 'absensi';
  const body = el('div');

  container.append(
    UI.pageHead(t('nav.tasks'), t('guru.tasksSub')),
    UI.tabs(TASK_KINDS.map((k) => ({ id: k, label: t(`guru.tab.${k}`) })), active, (id) => { active = id; renderKind(); }),
    body,
  );

  function renderKind() {
    UI.clear(body);
    if (active === 'absensi') renderAttendance(body, ctx, me);
    else if (active === 'hafalan') renderMemorization(body, ctx, me);
    else if (active === 'nilai') renderGrades(body, ctx, me);
    else renderBehavior(body, ctx, me);
  }
  renderKind();
}

/* ---------- Tugas: Absensi cepat ---------- */
function renderAttendance(body, ctx, me) {
  const units = Store.unitsOf(me);
  if (!units.length) { body.append(UI.emptyState(t('guru.noUnits'))); return; }

  const preKey = ctx.params[1] || '';
  let unit = units.find((u) => unitKey(u) === preKey) || units[0];
  let date = todayISO();
  let session = 'Pagi';
  const statusMap = new Map();

  const unitSel = UI.select(
    units.map((u) => ({ value: unitKey(u), label: u.name, selected: u === unit })),
    { onchange: (e) => { unit = units.find((x) => unitKey(x) === e.target.value) || unit; renderList(); } },
  );
  const dateInp = UI.input({ type: 'date', value: date, onchange: (e) => { date = e.target.value; renderList(); } });
  const sesSel = UI.select(
    SESSIONS.map((s) => ({ value: s, label: t(`guru.session.${s.toLowerCase()}`), selected: s === session })),
    { onchange: (e) => { session = e.target.value; renderList(); } },
  );

  const listHost = el('div');
  body.append(
    el('div', { class: 'panel' },
      UI.field(t('guru.unit'), unitSel),
      el('div', { class: 'grid grid-2' },
        UI.field(t('common.date'), dateInp),
        UI.field(t('att.session'), sesSel),
      ),
    ),
    listHost,
    bigBtn(`💾 ${t('guru.saveAttendance')}`, save),
  );

  function existing() {
    return Store.list('attendanceSessions', (a) =>
      a.unitType === unit.unitType && a.unitId === unit.id && a.date === date && a.session === session)[0] || null;
  }

  function renderList() {
    UI.clear(listHost);
    statusMap.clear();
    const students = Store.studentsInUnit(unit.unitType, unit.id);
    const ex = existing();
    if (ex) {
      listHost.append(el('div', { class: 'small', style: { color: 'var(--warn)', margin: 'var(--s-3) 0' } }, `✏️ ${t('guru.attExists')}`));
    }
    if (!students.length) { listHost.append(UI.emptyState(t('common.empty'))); return; }
    students.forEach((s) => {
      const rec = ex?.records?.find((r) => r.studentId === s.id);
      statusMap.set(s.id, rec?.status || 'hadir');
      listHost.append(el('div', { class: 'list-item', style: { flexWrap: 'wrap' } },
        UI.avatar(s.name),
        el('div', { class: 'body' },
          el('div', { class: 'title' }, s.name),
          el('div', { class: 'sub' }, `NIS ${s.nis}`),
        ),
        UI.segmented(
          Store.ATT_STATUSES.map((st) => ({ value: st, label: t(`att.${st}`) })),
          statusMap.get(s.id),
          (v) => statusMap.set(s.id, v),
          ATT_TONES,
        ),
      ));
    });
  }

  function save() {
    const students = Store.studentsInUnit(unit.unitType, unit.id);
    if (!students.length) return;
    const records = students.map((s) => ({ studentId: s.id, status: statusMap.get(s.id) || 'hadir', note: '' }));
    const payload = {
      tenantId: ctx.session.tenantId, unitType: unit.unitType, unitId: unit.id,
      date, session, teacherId: me.id, records,
    };
    if (!navigator.onLine) {
      Store.queueDraft('attendance', payload);
      UI.toast(t('common.offlineDraft'), 'warn');
      return;
    }
    const ex = existing();
    if (ex) {
      Store.update('attendanceSessions', ex.id, { records }, me.id);
      UI.toast(`✅ ${t('guru.attUpdated')}`, 'ok');
    } else {
      Store.insert('attendanceSessions', payload, me.id);
      UI.toast(`✅ ${t('guru.attSaved')}`, 'ok');
    }
    renderList();
  }

  renderList();
}

/* ---------- Tugas: Hafalan ---------- */
function renderMemorization(body, ctx, me) {
  const halaqahs = Store.unitsOf(me).filter((u) => u.unitType === 'halaqah');
  const students = halaqahs.flatMap((h) => Store.studentsInUnit('halaqah', h.id));
  if (!students.length) { body.append(UI.emptyState(t('guru.noHalaqah'))); return; }

  const stuSel = UI.select(students.map((s) => ({ value: s.id, label: `${s.name} (${s.nis})` })));
  const typeSel = UI.select(['quran', 'hadits', 'doa', 'matan', 'lainnya'].map((v) => ({ value: v, label: t(`guru.memoType.${v}`) })));
  const matInp = UI.input({ placeholder: 'QS. An-Naba’' });
  const fromInp = UI.input({ type: 'number', min: 1 });
  const toInp = UI.input({ type: 'number', min: 1 });
  let result = 'lancar';
  const resultSeg = UI.segmented(
    ['lancar', 'cukup', 'ulang', 'tidak'].map((v) => ({ value: v, label: t(`memo.result.${v}`) })),
    result, (v) => { result = v; },
    { lancar: 'ok', cukup: '', ulang: 'warn', tidak: 'danger' },
  );
  const scoreInp = UI.input({ type: 'number', min: 0, max: 100 });
  const noteTa = UI.textarea({});

  body.append(el('div', { class: 'panel' },
    UI.field(t('common.student'), stuSel),
    UI.field(t('guru.memoType'), typeSel),
    UI.field(t('guru.material'), matInp),
    el('div', { class: 'grid grid-2' },
      UI.field(`${t('guru.fromAyah')} (${t('common.optional')})`, fromInp),
      UI.field(`${t('guru.toAyah')} (${t('common.optional')})`, toInp),
    ),
    UI.field(t('guru.result'), resultSeg),
    UI.field(`${t('guru.score')} (${t('common.optional')})`, scoreInp),
    UI.field(t('common.note'), noteTa),
    bigBtn(`💾 ${t('guru.saveMemo')}`, save),
  ));

  function save() {
    const s = Store.get('students', stuSel.value);
    if (!s) return;
    if (!matInp.value.trim()) { UI.toast(t('guru.materialRequired'), 'danger'); return; }
    const payload = {
      tenantId: ctx.session.tenantId, studentId: s.id, halaqahId: s.halaqahId,
      teacherId: me.id, date: todayISO(), type: typeSel.value,
      material: matInp.value.trim(),
      fromAyah: fromInp.value ? Number(fromInp.value) : null,
      toAyah: toInp.value ? Number(toInp.value) : null,
      result,
      score: scoreInp.value ? Number(scoreInp.value) : null,
      note: noteTa.value.trim(),
    };
    if (!navigator.onLine) {
      Store.queueDraft('memorization', payload);
      UI.toast(t('common.offlineDraft'), 'warn');
    } else {
      Store.insert('memorizationRecords', payload, me.id);
      UI.toast(`✅ ${t('guru.memoSaved')}`, 'ok');
    }
    matInp.value = ''; fromInp.value = ''; toInp.value = ''; scoreInp.value = ''; noteTa.value = '';
  }
}

/* ---------- Tugas: Nilai ---------- */
function renderGrades(body, ctx, me) {
  const classes = (me.classIds || []).map((id) => Store.get('classes', id)).filter(Boolean);
  const subjects = (me.subjectIds || []).map((id) => Store.get('subjects', id)).filter(Boolean);
  const comps = Store.list('gradeComponents', (c) => c.tenantId === ctx.session.tenantId);
  if (!classes.length || !subjects.length || !comps.length) { body.append(UI.emptyState(t('guru.noGradeSetup'))); return; }

  let cls = classes[0];
  let subj = subjects[0];
  let comp = comps[0];
  let date = todayISO();
  const scoreMap = new Map();
  const noteMap = new Map();

  const clsSel = UI.select(classes.map((c) => ({ value: c.id, label: c.name })), {
    onchange: (e) => { cls = classes.find((c) => c.id === e.target.value) || cls; renderList(); },
  });
  const subjSel = UI.select(subjects.map((s) => ({ value: s.id, label: s.name })), {
    onchange: (e) => { subj = subjects.find((s) => s.id === e.target.value) || subj; },
  });
  const compSel = UI.select(comps.map((c) => ({ value: c.id, label: `${c.name} (maks ${c.maxScale})` })), {
    onchange: (e) => { comp = comps.find((c) => c.id === e.target.value) || comp; renderList(); },
  });
  const dateInp = UI.input({ type: 'date', value: date, onchange: (e) => { date = e.target.value; } });

  const listHost = el('div');
  body.append(
    el('div', { class: 'panel' },
      UI.field(t('common.class'), clsSel),
      UI.field(t('guru.subject'), subjSel),
      el('div', { class: 'grid grid-2' },
        UI.field(t('guru.component'), compSel),
        UI.field(t('common.date'), dateInp),
      ),
    ),
    listHost,
    bigBtn(`💾 ${t('guru.saveGrades')}`, save),
  );

  function renderList() {
    UI.clear(listHost);
    scoreMap.clear();
    noteMap.clear();
    const students = Store.studentsInUnit('class', cls.id);
    if (!students.length) { listHost.append(UI.emptyState(t('common.empty'))); return; }
    students.forEach((s) => {
      const scoreInp = UI.input({
        type: 'number', min: 0, max: comp.maxScale, placeholder: `0–${comp.maxScale}`,
        style: { width: '92px', textAlign: 'center' },
        oninput: (e) => scoreMap.set(s.id, e.target.value),
      });
      const noteInp = UI.input({
        placeholder: t('common.note'), style: { marginTop: '6px', fontSize: 'var(--fs-xs)', padding: '6px 8px' },
        oninput: (e) => noteMap.set(s.id, e.target.value),
      });
      listHost.append(el('div', { class: 'list-item' },
        UI.avatar(s.name),
        el('div', { class: 'body' },
          el('div', { class: 'title' }, s.name),
          el('div', { class: 'sub' }, `NIS ${s.nis}`),
          noteInp,
        ),
        scoreInp,
      ));
    });
  }

  function save() {
    const students = Store.studentsInUnit('class', cls.id);
    const published = comp.publishPolicy === 'auto';
    let n = 0;
    for (const s of students) {
      const raw = scoreMap.get(s.id);
      if (raw === undefined || raw === '') continue;
      const score = Math.max(0, Math.min(comp.maxScale, Number(raw)));
      const payload = {
        tenantId: ctx.session.tenantId, studentId: s.id, subjectId: subj.id, componentId: comp.id,
        classId: cls.id, teacherId: me.id, date, score,
        note: (noteMap.get(s.id) || '').trim(), published,
      };
      if (!navigator.onLine) Store.queueDraft('grade', payload);
      else Store.insert('gradeEntries', payload, me.id);
      n += 1;
    }
    if (!n) { UI.toast(t('guru.noScores'), 'warn'); return; }
    if (!navigator.onLine) UI.toast(t('common.offlineDraft'), 'warn');
    else UI.toast(`✅ ${t('guru.gradesSaved', { n })}`, 'ok');
    renderList();
  }

  renderList();
}

/* ---------- Tugas: Perilaku ---------- */
function renderBehavior(body, ctx, me) {
  const units = Store.unitsOf(me);
  const seen = new Set();
  const students = [];
  units.forEach((u) => Store.studentsInUnit(u.unitType, u.id).forEach((s) => {
    if (!seen.has(s.id)) { seen.add(s.id); students.push(s); }
  }));
  if (!students.length) { body.append(UI.emptyState(t('guru.noUnits'))); return; }

  const rules = Store.list('behaviorRules', (r) => r.tenantId === ctx.session.tenantId);
  let kind = 'good';

  const stuSel = UI.select(students.map((s) => ({ value: s.id, label: `${s.name} (${s.nis})` })));
  const pointsInp = UI.input({ type: 'number', min: 0, value: rules[0]?.points ?? 0 });
  const ruleSel = UI.select(rules.map((r) => ({ value: r.id, label: `${r.code} — ${r.name}` })), {
    onchange: (e) => {
      const r = Store.get('behaviorRules', e.target.value);
      if (r) pointsInp.value = r.points;
    },
  });
  const ruleWrap = el('div', { style: { display: 'none' } },
    UI.field(t('guru.rule'), ruleSel),
    UI.field(t('guru.points'), pointsInp),
  );
  const kindSeg = UI.segmented(
    [{ value: 'good', label: `👍 ${t('guru.kind.good')}` }, { value: 'violation', label: `⚠️ ${t('guru.kind.violation')}` }],
    kind,
    (v) => { kind = v; ruleWrap.style.display = v === 'violation' ? '' : 'none'; },
    { good: 'ok', violation: 'danger' },
  );
  const chronoTa = UI.textarea({ placeholder: t('common.required') });
  const followTa = UI.textarea({});
  const notifyCb = UI.input({ type: 'checkbox', checked: true, style: { width: 'auto' } });

  body.append(el('div', { class: 'panel' },
    UI.field(t('common.student'), stuSel),
    UI.field(t('guru.kind'), kindSeg),
    ruleWrap,
    UI.field(t('guru.chronology'), chronoTa),
    UI.field(`${t('guru.followUp')} (${t('common.optional')})`, followTa),
    el('label', { class: 'row', style: { gap: '8px', cursor: 'pointer', fontSize: 'var(--fs-sm)' } },
      notifyCb, t('guru.notifyGuardian')),
    bigBtn(`💾 ${t('guru.saveBehavior')}`, save),
  ));

  function save() {
    const s = Store.get('students', stuSel.value);
    if (!s) return;
    const chronology = chronoTa.value.trim();
    if (!chronology) { UI.toast(t('guru.chronologyRequired'), 'danger'); return; }
    const notifyGuardian = notifyCb.checked;
    const payload = {
      tenantId: ctx.session.tenantId, studentId: s.id, teacherId: me.id, date: todayISO(),
      kind,
      ruleId: kind === 'violation' ? ruleSel.value : null,
      points: kind === 'violation' ? (Number(pointsInp.value) || 0) : 0,
      chronology,
      followUp: followTa.value.trim(),
      notifyGuardian,
      status: 'open',
    };
    if (!navigator.onLine) {
      Store.queueDraft('behavior', payload);
      UI.toast(t('common.offlineDraft'), 'warn');
    } else {
      Store.insert('behaviorEvents', payload, me.id);
      if (notifyGuardian) {
        (s.guardianIds || []).forEach((gid) => Store.notify(
          ctx.session.tenantId, gid,
          t(kind === 'good' ? 'guru.notif.good' : 'guru.notif.violation', { name: s.name }),
          chronology.slice(0, 160),
          kind === 'good' ? 'ok' : 'warn',
        ));
      }
      UI.toast(`✅ ${t('guru.behaviorSaved')}`, 'ok');
    }
    chronoTa.value = ''; followTa.value = '';
  }
}

/* ============================================================
   Route: riwayat — timeline gabungan + draf offline
   ============================================================ */
function riwayat(container, ctx) {
  const me = meOf(ctx);
  const filters = ['all', ...TASK_KINDS];
  let active = 'all';
  const body = el('div');

  container.append(
    UI.pageHead(t('nav.history'), t('guru.historySub')),
    UI.tabs(filters.map((f) => ({ id: f, label: f === 'all' ? t('common.all') : t(`guru.tab.${f}`) })), active, (id) => { active = id; renderBody(); }),
    body,
  );

  function collect() {
    const out = [];

    Store.list('attendanceSessions', (a) => a.teacherId === me.id).forEach((a) => {
      const counts = {};
      (a.records || []).forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
      out.push({
        kind: 'absensi', date: a.date,
        when: `${fmtDate(a.date)} · ${a.session}`,
        what: `🗓️ ${t('guru.tab.absensi')} — ${unitName(a.unitType, a.unitId)}`,
        detail: Store.ATT_STATUSES.filter((st) => counts[st]).map((st) => `${t('att.' + st)} ${counts[st]}`).join(' · '),
        tone: counts.alfa ? 'warn' : 'ok',
      });
    });

    Store.list('memorizationRecords', (m) => m.teacherId === me.id).forEach((m) => {
      const s = Store.get('students', m.studentId);
      out.push({
        kind: 'hafalan', date: m.date,
        when: fmtDate(m.date),
        what: `📖 ${s?.name || '—'}: ${m.material}${m.fromAyah ? ` (${m.fromAyah}–${m.toAyah || m.fromAyah})` : ''}`,
        detail: `${t('memo.result.' + m.result)}${m.score != null ? ` · ${m.score}` : ''}${m.note ? ` · ${m.note}` : ''}`,
        tone: m.result === 'lancar' ? 'ok' : (m.result === 'ulang' || m.result === 'tidak') ? 'warn' : '',
      });
    });

    const groups = new Map();
    Store.list('gradeEntries', (g) => g.teacherId === me.id).forEach((g) => {
      const k = `${g.date}|${g.subjectId}|${g.componentId}|${g.classId}`;
      if (!groups.has(k)) groups.set(k, { ...g, count: 0 });
      groups.get(k).count += 1;
    });
    groups.forEach((g) => {
      out.push({
        kind: 'nilai', date: g.date,
        when: fmtDate(g.date),
        what: `📝 ${Store.get('subjects', g.subjectId)?.name || '—'} — ${Store.get('gradeComponents', g.componentId)?.name || '—'}`,
        detail: `${Store.get('classes', g.classId)?.name || ''} · ${g.count} ${t('guru.students')}`,
        tone: '',
      });
    });

    Store.list('behaviorEvents', (e) => e.teacherId === me.id).forEach((ev) => {
      const s = Store.get('students', ev.studentId);
      const rule = ev.ruleId ? Store.get('behaviorRules', ev.ruleId) : null;
      out.push({
        kind: 'perilaku', date: ev.date,
        when: fmtDate(ev.date),
        what: `${ev.kind === 'good' ? '👍' : '⚠️'} ${s?.name || '—'} — ${rule ? rule.name : t('guru.kind.good')}`,
        detail: `${ev.chronology}${ev.points ? ` · ${ev.points} ${t('guru.points').toLowerCase()}` : ''}`,
        tone: ev.kind === 'good' ? 'ok' : rule?.category === 'berat' ? 'danger' : 'warn',
      });
    });

    return out.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }

  function renderBody() {
    UI.clear(body);

    const drafts = Store.listDrafts();
    if (drafts.length) {
      body.append(el('div', { class: 'panel', style: { marginBottom: 'var(--s-4)' } },
        el('div', { class: 'panel-title' }, el('h3', {}, `📴 ${t('guru.draftsOffline')}`)),
        drafts.map((d) => el('div', { class: 'list-item' },
          el('span', { style: { fontSize: '18px' } }, '⏳'),
          el('div', { class: 'body' },
            el('div', { class: 'title' }, t(`guru.tab.${{ attendance: 'absensi', memorization: 'hafalan', grade: 'nilai', behavior: 'perilaku' }[d.type] || 'absensi'}`)),
            el('div', { class: 'sub' }, new Date(d.at).toLocaleString()),
          ),
          UI.chip(t('guru.pendingSync'), 'warn'),
        )),
      ));
    }

    const items = collect().filter((it) => active === 'all' || it.kind === active);
    body.append(el('div', { class: 'panel' },
      UI.timeline(items.slice(0, 60).map((it) => ({ when: it.when, what: it.what, detail: it.detail, tone: it.tone }))),
    ));
  }

  renderBody();
}

/* ============================================================
   Route: profil
   ============================================================ */
function profil(container, ctx) {
  const me = meOf(ctx);
  const units = Store.unitsOf(me);
  const subjects = (me.subjectIds || []).map((id) => Store.get('subjects', id)).filter(Boolean);

  container.append(
    el('div', { class: 'panel', style: { textAlign: 'center' } },
      el('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: 'var(--s-3)' } }, UI.avatar(me.name, 'lg')),
      el('div', { style: { fontWeight: 700, fontSize: '1.15rem' } }, me.name),
      el('div', { class: 'small muted' }, me.email || ''),
      el('div', { class: 'row', style: { justifyContent: 'center', marginTop: 'var(--s-3)' } },
        (me.staffRoles || []).map((r) => UI.chip(r.replace(/_/g, ' '), 'accent')),
      ),
    ),
    el('div', { class: 'panel' },
      el('div', { class: 'panel-title' }, el('h3', {}, `🏫 ${t('guru.myUnits')}`)),
      el('div', { class: 'row' },
        units.length ? units.map((u) => UI.chip(u.name, u.unitType === 'class' ? 'accent' : 'info')) : t('common.empty'),
      ),
    ),
    el('div', { class: 'panel' },
      el('div', { class: 'panel-title' }, el('h3', {}, `📚 ${t('guru.mySubjects')}`)),
      el('div', { class: 'row' },
        subjects.length ? subjects.map((s) => UI.chip(s.name)) : t('common.empty'),
      ),
    ),
    bigBtn(`⚙️ ${t('nav.settings')}`, () => ctx.navigate('guru/settings'), ''),
    bigBtn(`🚪 ${t('common.logout')}`, () => ctx.logout(), 'danger'),
  );
}

/* ============================================================
   Ekspor modul portal
   ============================================================ */
export default {
  id: 'guru',
  role: 'teacher',
  shell: 'mobile',
  navGroups: [{
    items: [
      { route: 'home', icon: '🏠', label: 'nav.home' },
      { route: 'kelas', icon: '🏫', label: 'nav.classes' },
      { route: 'tugas', icon: '📝', label: 'nav.tasks' },
      { route: 'riwayat', icon: '🕰️', label: 'nav.history' },
      { route: 'profil', icon: '👤', label: 'nav.profile' },
    ],
  }],
  defaultRoute: 'home',
  routes: { home, kelas, tugas, riwayat, profil },
};
