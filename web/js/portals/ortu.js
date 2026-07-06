/* ============================================================
   Portal Orang Tua — mobile-first (shell bottom-nav).
   Prinsip spesifikasi: keterbacaan, ringkasan kondisi anak,
   kemudahan pembayaran, "calm & trustful".
   Data DIBATASI pada anak yang terhubung ke akun wali.
   ============================================================ */

import I18n, { t, fmtMoney, fmtDate, fmtDateTime } from '../core/i18n.js';
import * as Store from '../core/store.js';
import * as UI from '../core/ui.js';

I18n.extend({
  id: {
    'ortu.chooseChild': 'Pilih anak',
    'ortu.todayStatus': 'Status hari ini',
    'ortu.noSessionToday': 'Belum ada absensi hari ini',
    'ortu.monthRecap': 'Rekap bulan ini',
    'ortu.lastMemo': 'Setoran terakhir',
    'ortu.memoProgress': 'Capaian hafalan',
    'ortu.latestGrades': 'Nilai terbaru',
    'ortu.avgGrade': 'Rata-rata',
    'ortu.behaviorNote': 'Catatan perilaku',
    'ortu.points': 'poin',
    'ortu.billActive': 'Tagihan aktif',
    'ortu.nearestDue': 'Jatuh tempo terdekat',
    'ortu.pay': 'Bayar',
    'ortu.payNow': 'Mulai Pembayaran',
    'ortu.method': 'Metode pembayaran',
    'ortu.checkout': 'Pembayaran',
    'ortu.waitingPay': 'Menunggu pembayaran',
    'ortu.scanQr': 'Pindai kode QR di bawah dengan aplikasi pembayaran Anda',
    'ortu.simulateOk': '✅ Simulasi pembayaran berhasil',
    'ortu.simulateFail': 'Simulasi gagal',
    'ortu.paySuccess': 'Pembayaran berhasil',
    'ortu.payFailed': 'Pembayaran gagal — coba lagi',
    'ortu.receipt': 'Bukti Pembayaran',
    'ortu.txHistory': 'Riwayat transaksi',
    'ortu.remaining': 'Sisa tagihan',
    'ortu.followupStatus': 'Status pembinaan',
    'ortu.goodDeed': 'Perilaku baik',
    'ortu.needGuidance': 'Perlu pendampingan',
    'ortu.handled': 'Sudah ditindaklanjuti',
    'ortu.school': 'Sekolah',
    'ortu.pesantren': 'Pesantren',
    'ortu.week': 'Minggu ini',
    'ortu.month': 'Bulan ini',
    'ortu.semester': 'Semester',
    'ortu.children': 'Anak terhubung',
    'ortu.expiresIn': 'Berlaku sampai',
  },
  en: {
    'ortu.chooseChild': 'Choose child',
    'ortu.todayStatus': "Today's status",
    'ortu.pay': 'Pay',
    'ortu.payNow': 'Start Payment',
    'ortu.checkout': 'Payment',
    'ortu.receipt': 'Payment Receipt',
    'ortu.txHistory': 'Transaction history',
    'ortu.billActive': 'Active bills',
  },
  ar: {
    'ortu.chooseChild': 'اختر الطفل',
    'ortu.pay': 'ادفع',
    'ortu.payNow': 'بدء الدفع',
    'ortu.checkout': 'الدفع',
    'ortu.receipt': 'إيصال الدفع',
    'ortu.billActive': 'الفواتير النشطة',
  },
});

/* ---------- helper anak aktif ---------- */
const CHILD_KEY = 'po.activeChild';

function me(ctx) { return Store.get('users', ctx.session.userId); }
function children(ctx) { return Store.childrenOf(me(ctx)); }
function activeChild(ctx) {
  const kids = children(ctx);
  const saved = localStorage.getItem(CHILD_KEY);
  return kids.find((k) => k.id === saved) || kids[0] || null;
}
function setActiveChild(id) { localStorage.setItem(CHILD_KEY, id); }

const todayISO = () => new Date().toISOString().slice(0, 10);
const monthStartISO = () => todayISO().slice(0, 8) + '01';

function classNameOf(id) { return Store.get('classes', id)?.name || ''; }
function halaqahNameOf(id) { return Store.get('halaqahs', id)?.name || ''; }

function childHeader(ctx, rerouteAfterSwitch) {
  const child = activeChild(ctx);
  const kids = children(ctx);
  const node = UI.el('div', { class: 'row between' },
    UI.el('div', {
      class: 'row', style: { gap: '10px', cursor: kids.length > 1 ? 'pointer' : 'default', flexWrap: 'nowrap' },
      onclick: () => {
        if (kids.length < 2) return;
        const d = UI.drawer({
          title: t('ortu.chooseChild'),
          body: UI.el('div', {}, kids.map((k) => UI.el('div', {
            class: 'list-item', style: { cursor: 'pointer' },
            onclick: () => { setActiveChild(k.id); d.close(); rerouteAfterSwitch(); },
          },
            UI.avatar(k.name),
            UI.el('div', { class: 'body' },
              UI.el('div', { class: 'title' }, k.name),
              UI.el('div', { class: 'sub' }, [classNameOf(k.classId), halaqahNameOf(k.halaqahId)].filter(Boolean).join(' · '))),
            k.id === activeChild(ctx)?.id ? UI.chip('✓', 'ok') : null))),
        });
      },
    },
      UI.avatar(child?.name || '?'),
      UI.el('div', {},
        UI.el('div', { style: { fontWeight: 700 } }, child?.name || '—'),
        UI.el('div', { class: 'xs muted' }, [classNameOf(child?.classId), kids.length > 1 ? `▾ ${t('ortu.chooseChild')}` : null].filter(Boolean).join(' · ')),
      )),
  );
  return node;
}

/* ---------- kartu bukti bayar ---------- */
function receiptCard(rcp, child, bill) {
  return UI.el('div', { class: 'receipt' },
    UI.el('div', { class: 'xs muted' }, fmtDateTime(rcp.paidAt)),
    UI.el('div', { class: 'row between', style: { alignItems: 'baseline' } },
      UI.el('div', { class: 'amount' }, fmtMoney(rcp.amount)),
      UI.chip(t('status.paid'), 'ok')),
    UI.el('div', { class: 'rows' },
      UI.el('div', { class: 'r' }, UI.el('span', { class: 'k' }, 'No.'), UI.el('span', { class: 'mono xs' }, rcp.number)),
      UI.el('div', { class: 'r' }, UI.el('span', { class: 'k' }, t('common.student')), UI.el('span', {}, child?.name || '—')),
      bill ? UI.el('div', { class: 'r' }, UI.el('span', { class: 'k' }, t('nav.bills')), UI.el('span', {}, `${bill.name} · ${bill.period}`)) : null,
      UI.el('div', { class: 'r' }, UI.el('span', { class: 'k' }, t('ortu.method')), UI.el('span', { style: { textTransform: 'uppercase' } }, rcp.method)),
    ),
  );
}

/* ---------- alur checkout ---------- */
function openCheckout(ctx, bill, onDone) {
  const guardian = me(ctx);
  const child = Store.get('students', bill.studentId);
  const product = Store.get('billProducts', bill.productId);
  const remaining = bill.amount - (bill.paidAmount || 0);

  const METHODS = [
    { id: 'qris', label: 'QRIS', icon: '📱' },
    { id: 'va_bca', label: 'VA BCA', icon: '🏦' },
    { id: 'va_mandiri', label: 'VA Mandiri', icon: '🏦' },
    { id: 'ewallet', label: 'E-Wallet', icon: '💳' },
  ];
  let method = 'qris';

  const amountIn = UI.input({ type: 'number', value: remaining, disabled: product?.allowInstallment ? null : true });

  const methodGrid = UI.el('div', { class: 'grid grid-2' });
  const renderMethods = () => {
    UI.clear(methodGrid).append(...METHODS.map((mm) => UI.el('div', {
      class: 'quick', style: { borderColor: mm.id === method ? 'var(--accent)' : '' },
      onclick: () => { method = mm.id; renderMethods(); },
    }, UI.el('div', { class: 'ico' }, mm.icon), mm.label)));
  };
  renderMethods();

  const m = UI.modal({
    title: t('ortu.checkout'),
    body: UI.el('div', {},
      UI.el('div', { class: 'panel', style: { marginBottom: 'var(--s-3)' } },
        UI.el('div', { class: 'row between' }, UI.el('strong', {}, bill.name), UI.el('span', { class: 'muted small' }, bill.period)),
        UI.el('div', { class: 'row between small' },
          UI.el('span', { class: 'muted' }, child?.name),
          UI.el('span', {}, `${t('ortu.remaining')}: ${fmtMoney(remaining)}`)),
      ),
      UI.field(t('ortu.method'), methodGrid),
      UI.field(t('common.amount'), amountIn, product?.allowInstallment ? 'Boleh dibayar sebagian (cicilan).' : null),
    ),
    footer: [
      UI.el('button', { class: 'btn ghost', onclick: () => m.close() }, t('common.cancel')),
      UI.el('button', {
        class: 'btn primary',
        onclick: () => {
          const amount = Math.min(Number(amountIn.value || 0), remaining);
          if (amount <= 0) { UI.toast(t('common.required'), 'warn'); return; }
          const payment = Store.checkout(bill.id, method, amount, { guardianId: guardian.id }, guardian.id);
          m.close();
          openWaiting(ctx, payment, bill, child, onDone);
        },
      }, t('ortu.payNow')),
    ],
  });
}

function qrMock(reference) {
  // QR dekoratif deterministik dari reference — hanya untuk demo.
  const size = 21, cells = [];
  let seed = [...reference].reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 2 ** 32; };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const finder = (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
    const on = finder
      ? !((x % 6 === 1 && y % 6 !== 0 && y % 6 !== 5 && !(y % 6 >= 2 && y % 6 <= 4 && x % 6 >= 2)) || (y % 6 === 1 && !(x % 6 >= 2 && x % 6 <= 4)))
      : rnd() > 0.5;
    if (on) cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
  }
  const box = UI.el('div', { style: { background: '#fff', borderRadius: '12px', padding: '14px', width: 'fit-content', margin: '0 auto' } });
  box.innerHTML = `<svg width="180" height="180" viewBox="0 0 ${size} ${size}" fill="#111">${cells.join('')}</svg>`;
  return box;
}

function openWaiting(ctx, payment, bill, child, onDone) {
  const m = UI.modal({
    title: `⏳ ${t('ortu.waitingPay')}`,
    body: UI.el('div', { style: { textAlign: 'center' } },
      UI.el('p', { class: 'muted small' }, payment.method === 'qris' ? t('ortu.scanQr') : `${payment.method.toUpperCase()} — ${t('ortu.scanQr')}`),
      qrMock(payment.reference),
      UI.el('div', { class: 'mono small', style: { margin: 'var(--s-3) 0 4px' } }, payment.reference),
      UI.el('div', { class: 'xs muted' }, `${t('ortu.expiresIn')} ${fmtDateTime(payment.expiresAt)}`),
      UI.el('div', { class: 'amount', style: { fontSize: '1.5rem', fontWeight: 700, margin: 'var(--s-3) 0' } }, fmtMoney(payment.amount)),
      UI.el('div', { class: 'stack' },
        UI.el('button', {
          class: 'btn primary block',
          onclick: () => {
            Store.simulateWebhook(payment.id, 'paid');
            m.close();
            const rcp = Store.list('receipts', (r) => r.paymentId === payment.id)[0];
            UI.toast(t('ortu.paySuccess'), 'ok');
            const rm = UI.modal({
              title: `🧾 ${t('ortu.receipt')}`,
              body: receiptCard(rcp, child, bill),
              footer: [
                UI.el('button', { class: 'btn', onclick: () => window.print() }, `🖨 ${t('common.print')}`),
                UI.el('button', { class: 'btn primary', onclick: () => { rm.close(); onDone(); } }, t('common.close')),
              ],
            });
          },
        }, t('ortu.simulateOk')),
        UI.el('button', {
          class: 'btn ghost block',
          onclick: () => { Store.simulateWebhook(payment.id, 'failed'); m.close(); UI.toast(t('ortu.payFailed'), 'danger'); onDone(); },
        }, t('ortu.simulateFail')),
      ),
    ),
    onClose: onDone,
  });
}

/* ============================================================ ROUTES */
const routes = {

  /* ---------------- Dashboard anak ---------------- */
  home(container, ctx) {
    ctx.setHeader(childHeader(ctx, () => ctx.rerender()));
    const child = activeChild(ctx);
    if (!child) { container.append(UI.emptyState(t('common.empty'), '👶')); return; }

    // Absensi hari ini + rekap bulan
    const today = todayISO();
    const sesToday = Store.list('attendanceSessions', (a) => a.tenantId === child.tenantId && a.date === today);
    let todayStatus = null;
    for (const s of sesToday) {
      const r = s.records.find((x) => x.studentId === child.id);
      if (r) { todayStatus = r.status; break; }
    }
    const recap = Store.attendanceRecap(child.id, monthStartISO());

    // Hafalan
    const memos = Store.list('memorizationRecords', (mm) => mm.studentId === child.id).sort((a, b) => b.date.localeCompare(a.date));
    const lancar = memos.filter((mm) => mm.result === 'lancar').length;
    const memoPct = memos.length ? Math.round((lancar / memos.length) * 100) : 0;

    // Nilai
    const grades = Store.list('gradeEntries', (g) => g.studentId === child.id && g.published);
    const avg = grades.length ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1) : '—';

    // Perilaku
    const events = Store.list('behaviorEvents', (e) => e.studentId === child.id).sort((a, b) => b.date.localeCompare(a.date));
    const points = Store.behaviorPoints(child.id);

    // Tagihan
    const outstanding = Store.outstandingOf([child.id]);
    const unpaidBills = Store.billsOfStudent(child.id).filter((b) => b.status !== 'paid');
    const nearestDue = unpaidBills.map((b) => b.dueDate).sort()[0];

    // Pengumuman
    const anns = Store.list('announcements', (a) => a.tenantId === child.tenantId && (a.audience === 'all' || a.audience === 'guardian'))
      .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 2);

    const summaryCard = (icon, title, mainNode, subNode, route) => UI.el('div', {
      class: 'list-item', style: { cursor: 'pointer' },
      onclick: () => ctx.navigate(route),
    },
      UI.el('div', { class: 'quick', style: { padding: '8px', border: 'none', background: 'transparent' } }, UI.el('div', { class: 'ico' }, icon)),
      UI.el('div', { class: 'body' },
        UI.el('div', { class: 'sub' }, title),
        UI.el('div', { class: 'title' }, mainNode),
        subNode ? UI.el('div', { class: 'sub' }, subNode) : null),
      UI.el('span', { class: 'muted' }, '›'));

    container.append(
      // Kartu profil anak
      UI.el('div', { class: 'panel', style: { marginBottom: 'var(--s-4)' } },
        UI.el('div', { class: 'row', style: { gap: '14px', flexWrap: 'nowrap' } },
          UI.avatar(child.name, 'lg'),
          UI.el('div', { style: { minWidth: 0 } },
            UI.el('div', { style: { fontWeight: 700, fontSize: '1.1rem' } }, child.name),
            UI.el('div', { class: 'xs muted' }, [child.nis, classNameOf(child.classId), halaqahNameOf(child.halaqahId), Store.get('rooms', child.roomId)?.name].filter(Boolean).join(' · ')),
            UI.el('div', { style: { marginTop: '6px' } }, UI.statusChip(child.status)))),
      ),

      // Ringkasan modul
      summaryCard('📋', t('nav.attendance'),
        todayStatus ? UI.chip(t('att.' + todayStatus), { hadir: 'ok', izin: 'info', sakit: 'warn', alfa: 'danger', terlambat: 'warn' }[todayStatus]) : UI.el('span', { class: 'muted small' }, t('ortu.noSessionToday')),
        `${t('ortu.monthRecap')}: ${Store.ATT_STATUSES.map((s) => `${t('att.' + s)[0]}:${recap[s]}`).join(' ')}`,
        'ortu/progress/absensi'),
      summaryCard('📖', t('nav.memorization'),
        memos[0] ? `${memos[0].material}` : t('common.empty'),
        memos[0] ? UI.el('span', {}, UI.chip(t('memo.result.' + memos[0].result), { lancar: 'ok', cukup: 'info', ulang: 'warn', tidak: 'danger' }[memos[0].result]), ` · ${t('ortu.memoProgress')} ${memoPct}%`) : null,
        'ortu/progress/hafalan'),
      summaryCard('📝', t('nav.grades'), `${t('ortu.avgGrade')}: ${avg}`, `${grades.length} nilai dipublikasikan`, 'ortu/progress/nilai'),
      summaryCard('🧭', t('nav.behavior'),
        events[0] ? (events[0].kind === 'good' ? `👍 ${t('ortu.goodDeed')}` : `⚠ ${t('ortu.needGuidance')}`) : t('common.empty'),
        `${points} ${t('ortu.points')}`,
        'ortu/progress/perilaku'),

      // Tagihan menonjol
      UI.el('div', { class: 'panel', style: { marginTop: 'var(--s-2)', borderColor: outstanding ? 'rgba(245,184,61,.45)' : 'var(--line-soft)' } },
        UI.el('div', { class: 'row between' },
          UI.el('div', {},
            UI.el('div', { class: 'xs muted' }, t('ortu.billActive')),
            UI.el('div', { style: { fontWeight: 700, fontSize: '1.25rem' } }, fmtMoney(outstanding)),
            nearestDue ? UI.el('div', { class: 'xs muted' }, `${t('ortu.nearestDue')}: ${fmtDate(nearestDue)}`) : null),
          outstanding > 0
            ? UI.el('button', { class: 'btn primary', onclick: () => ctx.navigate('ortu/bills') }, `💳 ${t('ortu.pay')}`)
            : UI.chip(t('status.paid'), 'ok')),
      ),

      // Strip pengumuman
      anns.length ? UI.el('div', { class: 'panel', style: { marginTop: 'var(--s-4)' } },
        UI.el('div', { class: 'panel-title' },
          UI.el('h3', { class: 'small', style: { margin: 0 } }, `📣 ${t('nav.announcements')}`),
          UI.el('button', { class: 'btn ghost sm', onclick: () => ctx.navigate('ortu/announcements') }, t('common.viewAll'))),
        anns.map((a) => UI.el('div', { style: { padding: '6px 0', borderBottom: '1px solid var(--line-soft)' } },
          UI.el('div', { class: 'small', style: { fontWeight: 600 } }, a.title),
          UI.el('div', { class: 'xs muted' }, fmtDate(a.date)))),
      ) : null,
    );
  },

  /* ---------------- Perkembangan ---------------- */
  progress(container, ctx) {
    ctx.setHeader(childHeader(ctx, () => ctx.rerender()));
    const child = activeChild(ctx);
    if (!child) { container.append(UI.emptyState(t('common.empty'), '👶')); return; }

    const body = UI.el('div', {});
    const TABS = [
      { id: 'absensi', label: t('nav.attendance') },
      { id: 'hafalan', label: t('nav.memorization') },
      { id: 'nilai', label: t('nav.grades') },
      { id: 'perilaku', label: t('nav.behavior') },
    ];
    const initial = TABS.some((x) => x.id === ctx.params[0]) ? ctx.params[0] : 'absensi';

    function show(id) {
      UI.clear(body);
      if (id === 'absensi') {
        let period = 'month';
        const host = UI.el('div', {});
        const render = () => {
          const from = period === 'week'
            ? new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
            : period === 'month' ? monthStartISO() : new Date(Date.now() - 180 * 86400000).toISOString().slice(0, 10);
          const recap = Store.attendanceRecap(child.id, from);
          const items = [];
          for (const ses of Store.list('attendanceSessions', (a) => a.tenantId === child.tenantId && a.date >= from).sort((a, b) => b.date.localeCompare(a.date))) {
            const r = ses.records.find((x) => x.studentId === child.id);
            if (r) items.push({
              when: `${fmtDate(ses.date)} · ${ses.session}`,
              what: t('att.' + r.status),
              detail: r.note || null,
              tone: { hadir: 'ok', terlambat: 'warn', sakit: 'warn', alfa: 'danger', izin: '' }[r.status],
            });
          }
          UI.clear(host).append(
            UI.el('div', { class: 'row', style: { marginBottom: 'var(--s-3)' } },
              Store.ATT_STATUSES.map((s) => UI.chip(`${t('att.' + s)}: ${recap[s]}`, { hadir: 'ok', alfa: 'danger', sakit: 'warn', terlambat: 'warn', izin: 'info' }[s]))),
            UI.timeline(items.slice(0, 40)),
          );
        };
        body.append(UI.segmented([
          { value: 'week', label: t('ortu.week') },
          { value: 'month', label: t('ortu.month') },
          { value: 'semester', label: t('ortu.semester') },
        ], period, (v) => { period = v; render(); }), UI.el('div', { style: { height: 'var(--s-3)' } }), host);
        render();
      }

      if (id === 'hafalan') {
        let typeFilter = '';
        const host = UI.el('div', {});
        const render = () => {
          const memos = Store.list('memorizationRecords', (mm) => mm.studentId === child.id && (!typeFilter || mm.type === typeFilter))
            .sort((a, b) => b.date.localeCompare(a.date));
          const lancar = memos.filter((mm) => mm.result === 'lancar').length;
          const pct = memos.length ? Math.round((lancar / memos.length) * 100) : 0;
          const target = Store.list('memorizationTargets', (mt) => mt.halaqahId === child.halaqahId)[0];
          UI.clear(host).append(
            UI.el('div', { class: 'panel', style: { display: 'flex', gap: 'var(--s-4)', alignItems: 'center', marginBottom: 'var(--s-3)' } },
              UI.progressRing(pct),
              UI.el('div', {},
                UI.el('div', { style: { fontWeight: 700 } }, t('ortu.memoProgress')),
                UI.el('div', { class: 'small muted' }, target ? `Target: ${target.target} (${target.period})` : ''),
                UI.el('div', { class: 'small' }, `${lancar}/${memos.length} ${t('memo.result.lancar').toLowerCase()}`))),
            UI.timeline(memos.slice(0, 40).map((mm) => ({
              when: fmtDate(mm.date),
              what: `${mm.material}${mm.fromAyah ? ` (${mm.fromAyah}–${mm.toAyah})` : ''}`,
              detail: [t('memo.result.' + mm.result), mm.score ? `nilai ${mm.score}` : null, mm.note].filter(Boolean).join(' · '),
              tone: { lancar: 'ok', cukup: '', ulang: 'warn', tidak: 'danger' }[mm.result],
            }))),
          );
        };
        body.append(UI.el('div', { class: 'filterbar' },
          UI.select([{ value: '', label: t('common.all') }, ...['quran', 'hadits', 'doa', 'matan', 'lainnya'].map((x) => ({ value: x, label: x }))], { onchange: (e) => { typeFilter = e.target.value; render(); } })), host);
        render();
      }

      if (id === 'nilai') {
        let cat = 'umum';
        const host = UI.el('div', {});
        const render = () => {
          const grades = Store.list('gradeEntries', (g) => g.studentId === child.id && g.published)
            .filter((g) => (Store.get('subjects', g.subjectId)?.category || 'umum') === cat)
            .sort((a, b) => b.date.localeCompare(a.date));
          const avg = grades.length ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1) : '—';
          UI.clear(host).append(
            UI.kpiCard({ label: t('ortu.avgGrade'), value: avg, tone: 'ok' }),
            UI.el('div', { style: { height: 'var(--s-3)' } }),
            UI.dataTable({
              columns: [
                { label: t('adm.struct.subjects') || 'Mapel', render: (g) => Store.get('subjects', g.subjectId)?.name || '—' },
                { label: 'Komponen', render: (g) => Store.get('gradeComponents', g.componentId)?.name || '—' },
                { label: 'Nilai', render: (g) => UI.el('strong', {}, g.score) },
                { label: t('common.date'), render: (g) => fmtDate(g.date) },
              ],
              rows: grades,
            }),
          );
        };
        body.append(UI.segmented([
          { value: 'umum', label: t('ortu.school') },
          { value: 'pesantren', label: t('ortu.pesantren') },
        ], cat, (v) => { cat = v; render(); }), UI.el('div', { style: { height: 'var(--s-3)' } }), host);
        render();
      }

      if (id === 'perilaku') {
        const events = Store.list('behaviorEvents', (e) => e.studentId === child.id).sort((a, b) => b.date.localeCompare(a.date));
        const points = Store.behaviorPoints(child.id);
        body.append(
          UI.el('div', { class: 'row', style: { marginBottom: 'var(--s-3)' } },
            UI.chip(`${t('common.total')}: ${points} ${t('ortu.points')}`, points >= 20 ? 'danger' : 'info')),
          UI.timeline(events.map((e) => {
            const rule = e.ruleId ? Store.get('behaviorRules', e.ruleId) : null;
            return {
              when: fmtDate(e.date),
              what: e.kind === 'good' ? `👍 ${t('ortu.goodDeed')}` : `⚠ ${rule?.name || t('ortu.needGuidance')}`,
              detail: [e.chronology, e.followUp ? `${t('ortu.handled')}: ${e.followUp}` : null,
                `${t('ortu.followupStatus')}: ${e.status}`].filter(Boolean).join(' — '),
              tone: e.kind === 'good' ? 'ok' : (rule?.category === 'berat' ? 'danger' : 'warn'),
            };
          })),
        );
      }
    }

    container.append(UI.tabs(TABS, initial, show), body);
    show(initial);
  },

  /* ---------------- Tagihan & pembayaran ---------------- */
  bills(container, ctx) {
    ctx.setHeader(childHeader(ctx, () => ctx.rerender()));
    const guardian = me(ctx);
    const kids = children(ctx);
    let statusFilter = '';

    const listHost = UI.el('div', {});
    const historyHost = UI.el('div', {});

    const render = () => {
      const bills = kids.flatMap((k) => Store.billsOfStudent(k.id).map((b) => ({ ...b, _child: k })))
        .filter((b) => !statusFilter || b.status === statusFilter)
        .sort((a, b) => (a.status === 'paid' ? 1 : 0) - (b.status === 'paid' ? 1 : 0));

      UI.clear(listHost);
      if (!bills.length) { listHost.append(UI.emptyState(t('common.empty'), '💳')); }
      for (const b of bills) {
        const remaining = b.amount - (b.paidAmount || 0);
        listHost.append(UI.el('div', { class: 'list-item' },
          UI.el('div', { class: 'body' },
            UI.el('div', { class: 'title' }, `${b.name} · ${b.period}`),
            UI.el('div', { class: 'sub' }, `${kids.length > 1 ? b._child.name + ' · ' : ''}${t('common.dueDate')}: ${fmtDate(b.dueDate)}`),
            UI.el('div', { class: 'row', style: { marginTop: '4px', gap: '6px' } },
              UI.statusChip(b.status),
              b.paidAmount ? UI.chip(`${t('adm.dash.paid') || 'Dibayar'}: ${fmtMoney(b.paidAmount)}`, 'ok') : null)),
          UI.el('div', { style: { textAlign: 'end' } },
            UI.el('div', { style: { fontWeight: 700 } }, fmtMoney(remaining > 0 ? remaining : b.amount)),
            (b.status === 'unpaid' || b.status === 'partial' || b.status === 'pending')
              ? UI.el('button', { class: 'btn primary sm', style: { marginTop: '6px' }, onclick: () => openCheckout(ctx, Store.get('bills', b.id), render) }, `💳 ${t('ortu.pay')}`)
              : null),
        ));
      }
      renderHistory();
    };

    const renderHistory = () => {
      const kidIds = kids.map((k) => k.id);
      const payments = Store.list('payments', (p) => kidIds.includes(p.studentId))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      UI.clear(historyHost).append(
        UI.el('h3', { class: 'small', style: { margin: 'var(--s-5) 0 var(--s-3)' } }, `🧾 ${t('ortu.txHistory')}`),
        payments.length ? payments.slice(0, 20).map((p) => UI.el('div', {
          class: 'list-item', style: { cursor: p.status === 'paid' ? 'pointer' : 'default' },
          onclick: () => {
            if (p.status !== 'paid') return;
            const rcp = Store.list('receipts', (r) => r.paymentId === p.id)[0];
            if (!rcp) return;
            const bill = Store.get('bills', p.billId);
            const child = Store.get('students', p.studentId);
            UI.modal({ title: `🧾 ${t('ortu.receipt')}`, body: receiptCard(rcp, child, bill),
              footer: [UI.el('button', { class: 'btn', onclick: () => window.print() }, `🖨 ${t('common.print')}`)] });
          },
        },
          UI.el('div', { class: 'body' },
            UI.el('div', { class: 'title small' }, fmtMoney(p.amount)),
            UI.el('div', { class: 'sub' }, `${fmtDateTime(p.paidAt || p.createdAt)} · ${p.method}`)),
          UI.statusChip(p.status),
        )) : UI.emptyState(t('common.empty'), '🧾'),
      );
    };

    container.append(
      UI.el('div', { class: 'filterbar' },
        UI.select([{ value: '', label: `${t('common.status')}: ${t('common.all')}` },
          ...['unpaid', 'pending', 'partial', 'paid', 'expired'].map((s) => ({ value: s, label: t('status.' + s) }))],
          { onchange: (e) => { statusFilter = e.target.value; render(); } })),
      listHost,
      historyHost,
    );
    render();
  },

  /* ---------------- Pengumuman ---------------- */
  announcements(container, ctx) {
    const guardian = me(ctx);
    const anns = Store.list('announcements', (a) => a.tenantId === guardian.tenantId && (a.audience === 'all' || a.audience === 'guardian'))
      .sort((a, b) => b.date.localeCompare(a.date));
    const notifs = Store.notificationsFor(guardian).slice(0, 10);

    container.append(
      anns.length ? UI.el('div', {}, anns.map((a) => UI.el('div', { class: 'panel', style: { marginBottom: 'var(--s-3)' } },
        UI.el('div', { class: 'row between' },
          UI.el('h3', { class: 'small', style: { margin: 0 } }, a.title),
          UI.el('span', { class: 'xs muted' }, fmtDate(a.date))),
        UI.el('p', { class: 'small', style: { margin: 'var(--s-2) 0 0' } }, a.body),
      ))) : UI.emptyState(t('common.empty'), '📣'),
      notifs.length ? UI.el('div', {},
        UI.el('h3', { class: 'small', style: { margin: 'var(--s-4) 0 var(--s-3)' } }, '🔔 Notifikasi'),
        UI.timeline(notifs.map((n) => ({ when: fmtDateTime(n.at), what: n.title, detail: n.body, tone: n.kind === 'ok' ? 'ok' : n.kind === 'warn' ? 'warn' : '' })))) : null,
    );
  },

  /* ---------------- Profil ---------------- */
  profil(container, ctx) {
    const guardian = me(ctx);
    const kids = children(ctx);
    container.append(
      UI.el('div', { class: 'panel', style: { textAlign: 'center', marginBottom: 'var(--s-4)' } },
        UI.avatar(guardian.name, 'lg'),
        UI.el('div', { style: { fontWeight: 700, marginTop: 'var(--s-2)', fontSize: '1.1rem' } }, guardian.name),
        UI.el('div', { class: 'small muted' }, [guardian.relation, guardian.phone, guardian.email].filter(Boolean).join(' · '))),
      UI.el('div', { class: 'panel', style: { marginBottom: 'var(--s-4)' } },
        UI.el('h3', { class: 'small' }, `👨‍👩‍👧 ${t('ortu.children')}`),
        kids.map((k) => UI.el('div', { class: 'list-item' },
          UI.avatar(k.name),
          UI.el('div', { class: 'body' },
            UI.el('div', { class: 'title' }, k.name),
            UI.el('div', { class: 'sub' }, [classNameOf(k.classId), halaqahNameOf(k.halaqahId)].filter(Boolean).join(' · ')))))),
      UI.el('div', { class: 'stack' },
        UI.el('button', { class: 'btn block', onclick: () => ctx.navigate('ortu/settings') }, `⚙️ ${t('nav.settings')}`),
        UI.el('button', { class: 'btn danger block', onclick: ctx.logout }, `🚪 ${t('common.logout')}`)),
    );
  },
};

export default {
  id: 'ortu',
  role: 'guardian',
  shell: 'mobile',
  defaultRoute: 'home',
  navGroups: [{
    items: [
      { route: 'home', icon: '🏠', label: 'nav.home' },
      { route: 'progress', icon: '📈', label: 'nav.progress' },
      { route: 'bills', icon: '💳', label: 'nav.bills' },
      { route: 'announcements', icon: '📣', label: 'nav.announcements' },
      { route: 'profil', icon: '👤', label: 'nav.profile' },
    ],
  }],
  routes,
};
