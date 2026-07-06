/* ============================================================
   Portal Web Master — pengelola platform SaaS PondokOne.
   Routes: dashboard, tenants, plans, invoices, audit.
   Data lintas tenant (role 'master', tenantId null).
   ============================================================ */

import I18n, { t, fmtMoney, fmtDate, fmtDateTime } from '../core/i18n.js';
import * as Store from '../core/store.js';
import * as UI from '../core/ui.js';

const { el, clear } = UI;

I18n.extend({
  id: {
    'status.closed': 'Ditutup',
    'status.resolved': 'Selesai',
    'status.open': 'Terbuka',

    'mst.dash.title': 'Ringkasan Platform',
    'mst.dash.sub': 'Kondisi seluruh tenant, pendapatan SaaS, dan penggunaan',
    'mst.kpi.activeTenants': 'Tenant Aktif',
    'mst.kpi.trialTenants': 'Tenant Trial',
    'mst.kpi.overdueTenants': 'Tenant Terlambat Bayar',
    'mst.kpi.suspendedTenants': 'Tenant Ditangguhkan',
    'mst.kpi.invTotal': 'Invoice Bulan Ini',
    'mst.kpi.invPaid': 'Terbayar',
    'mst.kpi.invOut': 'Outstanding',
    'mst.kpi.students': 'Siswa Aktif (semua tenant)',
    'mst.kpi.payments': 'Transaksi Pembayaran',
    'mst.notif.title': 'Notifikasi Sistem',
    'mst.notif.overdueInv': 'Invoice jatuh tempo',
    'mst.notif.openTicket': 'Tiket support terbuka',
    'mst.notif.none': 'Tidak ada notifikasi sistem',

    'mst.tenants.title': 'Manajemen Tenant',
    'mst.tenants.sub': 'Sekolah & pesantren yang berlangganan platform',
    'mst.tenants.add': 'Tambah Tenant',
    'mst.tenants.edit': 'Ubah Tenant',
    'mst.tenants.code': 'Kode Tenant',
    'mst.tenants.type': 'Tipe Institusi',
    'mst.tenants.subdomain': 'Subdomain',
    'mst.tenants.plan': 'Paket Layanan',
    'mst.tenants.modules': 'Modul Aktif',
    'mst.tenants.quota': 'Kuota Siswa',
    'mst.tenants.usage': 'Siswa / Kuota',
    'mst.tenants.adminName': 'Nama Admin Utama',
    'mst.tenants.adminEmail': 'Email Admin',
    'mst.tenants.adminPhone': 'No. HP Admin',
    'mst.tenants.subStatus': 'Status Langganan',
    'mst.tenants.profile': 'Profil Tenant',
    'mst.tenants.invoices': 'Invoice Tenant Ini',
    'mst.tenants.address': 'Alamat',
    'mst.tenants.contact': 'Kontak',

    'mst.type.sekolah': 'Sekolah',
    'mst.type.pesantren': 'Pesantren',
    'mst.type.gabungan': 'Gabungan',

    'mst.mod.akademik': 'Akademik',
    'mst.mod.hafalan': 'Hafalan',
    'mst.mod.perilaku': 'Perilaku',
    'mst.mod.keuangan': 'Keuangan',
    'mst.mod.notifikasi': 'Notifikasi',

    'mst.plans.title': 'Paket Layanan',
    'mst.plans.sub': 'Paket berlangganan & aturan billing SaaS',
    'mst.plans.add': 'Tambah Paket',
    'mst.plans.edit': 'Ubah Paket',
    'mst.plans.base': 'Biaya dasar / bulan',
    'mst.plans.perStudent': 'Biaya per siswa aktif',
    'mst.plans.features': 'Fitur (pisahkan dengan koma)',
    'mst.plans.featuresLabel': 'Fitur',
    'mst.plans.invoiceDay': 'Tanggal terbit invoice',
    'mst.plans.grace': 'Masa tenggang (hari)',
    'mst.plans.usedBy': 'Dipakai {n} tenant',

    'mst.inv.title': 'Invoice SaaS',
    'mst.inv.sub': 'Penagihan langganan ke seluruh tenant',
    'mst.inv.generate': 'Generate Invoice',
    'mst.inv.number': 'Nomor',
    'mst.inv.tenant': 'Tenant',
    'mst.inv.send': 'Kirim',
    'mst.inv.markPaid': 'Tandai Lunas',
    'mst.inv.items': 'Rincian',
    'mst.inv.preview': 'Perhitungan otomatis',
    'mst.inv.perStudentItem': 'Per siswa aktif ({n} × {fee})',
    'mst.inv.baseItem': '{plan} base fee',
    'mst.inv.sentOk': 'Invoice dikirim ke tenant',
    'mst.inv.paidOk': 'Invoice ditandai lunas',
    'mst.inv.createdOk': 'Invoice draft dibuat',

    'mst.audit.title': 'Audit & Support',
    'mst.audit.sub': 'Jejak perubahan data dan tiket bantuan tenant',
    'mst.audit.logTab': 'Audit Log',
    'mst.audit.ticketTab': 'Tiket Support',
    'mst.audit.time': 'Waktu',
    'mst.audit.actor': 'Aktor',
    'mst.audit.action': 'Aksi',
    'mst.audit.entity': 'Entitas',
    'mst.audit.subject': 'Subjek',
    'mst.audit.resolve': 'Selesaikan',
    'mst.audit.resolvedOk': 'Tiket diselesaikan',
  },
  en: {
    'status.closed': 'Closed',
    'status.resolved': 'Resolved',
    'status.open': 'Open',
    'mst.dash.title': 'Platform Overview',
    'mst.tenants.title': 'Tenant Management',
    'mst.tenants.add': 'Add Tenant',
    'mst.plans.title': 'Service Plans',
    'mst.plans.add': 'Add Plan',
    'mst.inv.title': 'SaaS Invoices',
    'mst.inv.generate': 'Generate Invoice',
    'mst.audit.title': 'Audit & Support',
    'mst.audit.logTab': 'Audit Log',
    'mst.audit.ticketTab': 'Support Tickets',
  },
  ar: {
    'status.closed': 'مغلق',
    'status.resolved': 'تم الحل',
    'status.open': 'مفتوح',
    'mst.dash.title': 'نظرة عامة على المنصة',
    'mst.tenants.title': 'إدارة المؤسسات',
    'mst.plans.title': 'باقات الخدمة',
    'mst.inv.title': 'فواتير الخدمة',
    'mst.audit.title': 'التدقيق والدعم',
  },
});

/* ---------- Konstanta & util ---------- */
const MODULES = ['akademik', 'hafalan', 'perilaku', 'keuangan', 'notifikasi'];
const TENANT_TYPES = ['sekolah', 'pesantren', 'gabungan'];
const SUB_STATUSES = ['trial', 'active', 'overdue', 'suspended', 'closed'];
const INV_STATUSES = ['draft', 'sent', 'paid', 'overdue'];

/** Periode berjalan — selalu id-ID agar cocok dengan format data seed. */
function currentPeriod() {
  return new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}
function isoAhead(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const tenantName = (id) => Store.get('tenants', id)?.name || id || '—';
const planOf = (tn) => (tn ? Store.get('plans', tn.planId) : null);
const userName = (id) => Store.get('users', id)?.name || id || 'system';

function kv(label, value) {
  return el('div', { class: 'row between', style: { padding: '4px 0', gap: 'var(--s-3)' } },
    el('span', { class: 'muted small' }, label),
    el('span', { class: 'small', style: { textAlign: 'end' } }, value),
  );
}

function panel(title, ...children) {
  return el('div', { class: 'panel' },
    title ? el('div', { class: 'panel-title' }, title) : null,
    children,
  );
}

/* ---------- Form modal generik ----------
   fields: [{ key, label, type: 'text'|'number'|'date'|'email'|'select'|'checks'|'textarea',
              options?, required?, full?, hint?, default? }] */
function formModal({ title, fields, record = {}, onSave }) {
  const getters = {};
  const body = el('div', { class: 'form-grid' }, fields.map((f) => {
    const cur = record[f.key] ?? f.default ?? '';
    let ctrl;
    if (f.type === 'select') {
      ctrl = UI.select((f.options || []).map((o) => ({ ...o, selected: String(o.value) === String(cur) })));
      getters[f.key] = () => ctrl.value;
    } else if (f.type === 'checks') {
      const set = new Set(Array.isArray(cur) ? cur.map(String) : []);
      const cbs = [];
      ctrl = el('div', { class: 'stack', style: { gap: '6px' } }, (f.options || []).map((o) => {
        const cb = el('input', { type: 'checkbox', value: String(o.value), checked: set.has(String(o.value)) || null, style: { width: 'auto' } });
        cbs.push(cb);
        return el('label', { class: 'row', style: { gap: '8px', fontWeight: 400 } }, cb, o.label);
      }));
      getters[f.key] = () => cbs.filter((c) => c.checked).map((c) => c.value);
    } else if (f.type === 'textarea') {
      ctrl = UI.textarea({});
      ctrl.value = cur ?? '';
      getters[f.key] = () => ctrl.value;
    } else if (f.type === 'number') {
      ctrl = UI.input({ type: 'number', value: cur });
      getters[f.key] = () => Number(ctrl.value || 0);
    } else {
      ctrl = UI.input({ type: f.type || 'text', value: cur });
      getters[f.key] = () => ctrl.value.trim();
    }
    const wrapped = UI.field(f.label, ctrl, f.hint);
    if (f.full || f.type === 'checks' || f.type === 'textarea') wrapped.classList.add('full');
    return wrapped;
  }));

  const m = UI.modal({
    title,
    body,
    footer: [
      el('button', { class: 'btn ghost', onclick: () => m.close() }, t('common.cancel')),
      el('button', {
        class: 'btn primary',
        onclick: () => {
          const values = {};
          for (const f of fields) values[f.key] = getters[f.key]();
          for (const f of fields) {
            const v = values[f.key];
            if (f.required && (v === '' || v === null || (Array.isArray(v) && !v.length))) {
              UI.toast(`${f.label} — ${t('common.required')}`, 'warn');
              return;
            }
          }
          m.close();
          onSave(values);
        },
      }, t('common.save')),
    ],
  });
  return m;
}

/* ============================================================
   TENANTS
   ============================================================ */
function tenantForm(existing, ctx, afterSave) {
  formModal({
    title: existing ? t('mst.tenants.edit') : t('mst.tenants.add'),
    record: existing || {},
    fields: [
      { key: 'name', label: t('common.name'), required: true },
      { key: 'code', label: t('mst.tenants.code'), required: true },
      { key: 'type', label: t('mst.tenants.type'), type: 'select', options: TENANT_TYPES.map((v) => ({ value: v, label: t(`mst.type.${v}`) })) },
      { key: 'subdomain', label: t('mst.tenants.subdomain'), hint: 'contoh: namatenant.pondokone.id' },
      { key: 'planId', label: t('mst.tenants.plan'), type: 'select', options: Store.list('plans').map((p) => ({ value: p.id, label: p.name })) },
      { key: 'studentQuota', label: t('mst.tenants.quota'), type: 'number', default: 100 },
      { key: 'modules', label: t('mst.tenants.modules'), type: 'checks', options: MODULES.map((m) => ({ value: m, label: t(`mst.mod.${m}`) })) },
      { key: 'adminName', label: t('mst.tenants.adminName'), required: true },
      { key: 'adminEmail', label: t('mst.tenants.adminEmail'), type: 'email', required: true },
      { key: 'adminPhone', label: t('mst.tenants.adminPhone') },
      { key: 'subscriptionStatus', label: t('mst.tenants.subStatus'), type: 'select', options: SUB_STATUSES.map((v) => ({ value: v, label: t(`status.${v}`) })) },
    ],
    onSave(values) {
      if (existing) {
        Store.update('tenants', existing.id, values, ctx.session.userId);
      } else {
        Store.insert('tenants', { ...values, activeStudents: 0, defaultLang: 'id', accentColor: '#2f7bff' }, ctx.session.userId);
      }
      UI.toast(t('common.saved'), 'ok');
      afterSave?.();
    },
  });
}

function tenantDrawer(tn, ctx, refresh) {
  const invs = Store.list('saasInvoices', (i) => i.tenantId === tn.id)
    .sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || ''));
  const d = UI.drawer({
    title: tn.name,
    body: el('div', { class: 'stack', style: { padding: 'var(--s-4)', gap: 'var(--s-4)' } },
      el('div', { class: 'row', style: { gap: '8px', flexWrap: 'wrap' } },
        UI.statusChip(tn.subscriptionStatus),
        UI.chip(t(`mst.type.${tn.type}`) , 'info'),
        UI.chip(planOf(tn)?.name || '—'),
      ),
      panel(t('mst.tenants.profile'),
        kv(t('mst.tenants.code'), tn.code),
        kv(t('mst.tenants.subdomain'), tn.subdomain || '—'),
        kv(t('mst.tenants.quota'), `${tn.activeStudents ?? 0} / ${tn.studentQuota ?? 0}`),
        kv(t('mst.tenants.adminName'), tn.adminName || '—'),
        kv(t('mst.tenants.adminEmail'), tn.adminEmail || '—'),
        kv(t('mst.tenants.adminPhone'), tn.adminPhone || '—'),
        kv(t('mst.tenants.address'), tn.address || '—'),
        kv(t('mst.tenants.contact'), [tn.phone, tn.email].filter(Boolean).join(' · ') || '—'),
      ),
      panel(t('mst.tenants.modules'),
        el('div', { class: 'row', style: { gap: '6px', flexWrap: 'wrap' } },
          (tn.modules || []).length
            ? (tn.modules || []).map((m) => UI.chip(t(`mst.mod.${m}`), 'ok'))
            : el('span', { class: 'muted small' }, t('common.empty')),
        ),
      ),
      panel(t('mst.tenants.invoices'),
        UI.dataTable({
          columns: [
            { label: t('mst.inv.number'), render: (r) => el('span', { class: 'mono small' }, r.number) },
            { label: t('common.period'), key: 'period' },
            { label: t('common.total'), render: (r) => fmtMoney(r.total) },
            { label: t('common.status'), render: (r) => UI.statusChip(r.status) },
          ],
          rows: invs,
        }),
      ),
      el('button', {
        class: 'btn primary',
        onclick: () => { d.close(); tenantForm(tn, ctx, refresh); },
      }, `✏️ ${t('common.edit')}`),
    ),
  });
}

/* ============================================================
   PLANS
   ============================================================ */
function planForm(existing, ctx, afterSave) {
  formModal({
    title: existing ? t('mst.plans.edit') : t('mst.plans.add'),
    record: existing ? { ...existing, features: (existing.features || []).join(', ') } : {},
    fields: [
      { key: 'name', label: t('common.name'), required: true },
      { key: 'monthlyBase', label: t('mst.plans.base'), type: 'number', required: true },
      { key: 'perStudent', label: t('mst.plans.perStudent'), type: 'number' },
      { key: 'invoiceDay', label: t('mst.plans.invoiceDay'), type: 'number', default: 1 },
      { key: 'graceDays', label: t('mst.plans.grace'), type: 'number', default: 14 },
      { key: 'features', label: t('mst.plans.features'), type: 'textarea' },
    ],
    onSave(values) {
      const data = { ...values, features: values.features.split(',').map((s) => s.trim()).filter(Boolean) };
      if (existing) Store.update('plans', existing.id, data, ctx.session.userId);
      else Store.insert('plans', data, ctx.session.userId);
      UI.toast(t('common.saved'), 'ok');
      afterSave?.();
    },
  });
}

/* ============================================================
   INVOICES
   ============================================================ */
function invoiceDetailModal(inv) {
  UI.modal({
    title: `${t('mst.inv.title')} — ${inv.number}`,
    body: el('div', {},
      kv(t('mst.inv.tenant'), tenantName(inv.tenantId)),
      kv(t('common.period'), inv.period),
      kv(t('common.dueDate'), fmtDate(inv.dueDate)),
      kv(t('common.status'), UI.statusChip(inv.status)),
      inv.paidAt ? kv(t('status.paid'), fmtDate(inv.paidAt)) : null,
      el('div', { class: 'panel', style: { marginTop: 'var(--s-3)' } },
        el('div', { class: 'panel-title' }, t('mst.inv.items')),
        (inv.items || []).map((it) => kv(it.label, fmtMoney(it.amount))),
        el('div', { style: { borderTop: '1px dashed var(--line)', marginTop: '8px', paddingTop: '8px', fontWeight: 700 } },
          kv(t('common.total'), fmtMoney(inv.total)),
        ),
      ),
    ),
  });
}

function generateInvoiceModal(ctx, afterSave) {
  const tenants = Store.list('tenants').filter((tn) => tn.subscriptionStatus !== 'closed');
  const selTenant = UI.select(tenants.map((tn) => ({ value: tn.id, label: tn.name })));
  const inpPeriod = UI.input({ value: currentPeriod() });
  const preview = el('div', {});

  const compute = () => {
    const tn = Store.get('tenants', selTenant.value);
    const plan = planOf(tn) || {};
    const base = plan.monthlyBase || 0;
    const perTotal = (plan.perStudent || 0) * (tn?.activeStudents || 0);
    return {
      tn,
      plan,
      items: [
        { label: t('mst.inv.baseItem', { plan: plan.name || '—' }), amount: base },
        { label: t('mst.inv.perStudentItem', { n: tn?.activeStudents || 0, fee: fmtMoney(plan.perStudent || 0) }), amount: perTotal },
      ],
      total: base + perTotal,
    };
  };
  const renderPreview = () => {
    const c = compute();
    clear(preview);
    preview.append(
      el('div', { class: 'panel-title' }, t('mst.inv.preview')),
      c.items.map((it) => kv(it.label, fmtMoney(it.amount))),
      el('div', { style: { borderTop: '1px dashed var(--line)', marginTop: '8px', paddingTop: '8px', fontWeight: 700 } },
        kv(t('common.total'), fmtMoney(c.total)),
      ),
    );
  };
  selTenant.addEventListener('change', renderPreview);
  renderPreview();

  const m = UI.modal({
    title: t('mst.inv.generate'),
    body: el('div', {},
      UI.field(t('mst.inv.tenant'), selTenant),
      UI.field(t('common.period'), inpPeriod),
      el('div', { class: 'panel' }, preview),
    ),
    footer: [
      el('button', { class: 'btn ghost', onclick: () => m.close() }, t('common.cancel')),
      el('button', {
        class: 'btn primary',
        onclick: () => {
          const c = compute();
          if (!c.tn) return;
          Store.insert('saasInvoices', {
            tenantId: c.tn.id,
            number: `INV-SAAS-${Date.now().toString().slice(-8)}`,
            period: inpPeriod.value.trim() || currentPeriod(),
            items: c.items,
            total: c.total,
            status: 'draft',
            dueDate: isoAhead(c.plan.graceDays || 14),
            paidAt: null,
          }, ctx.session.userId);
          m.close();
          UI.toast(t('mst.inv.createdOk'), 'ok');
          afterSave?.();
        },
      }, t('common.save')),
    ],
  });
}

/* ============================================================
   EXPORT PORTAL
   ============================================================ */
export default {
  id: 'master',
  role: 'master',
  shell: 'sidebar',
  defaultRoute: 'dashboard',
  navGroups: [
    {
      items: [
        { route: 'dashboard', icon: '📊', label: 'nav.dashboard' },
        { route: 'tenants', icon: '🏫', label: 'nav.tenants' },
        { route: 'plans', icon: '📦', label: 'nav.plans' },
        { route: 'invoices', icon: '🧾', label: 'nav.invoices' },
        { route: 'audit', icon: '🛡️', label: 'nav.audit' },
      ],
    },
  ],

  routes: {
    /* ---------- Dashboard ---------- */
    dashboard(container, ctx) {
      const tenants = Store.list('tenants');
      const count = (st) => tenants.filter((x) => x.subscriptionStatus === st).length;

      const invs = Store.list('saasInvoices');
      const monthInvs = invs.filter((i) => i.period === currentPeriod());
      const invTotal = monthInvs.reduce((s, i) => s + i.total, 0);
      const invPaid = monthInvs.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0);

      const activeStudents = Store.list('students', (s) => s.status === 'active').length;
      const payCount = Store.list('payments').length;

      const overdueInvs = invs.filter((i) => i.status === 'overdue');
      const openTickets = Store.list('supportTickets', (tk) => tk.status === 'open');

      const goTenants = () => ctx.navigate('master/tenants');
      const goInvoices = () => ctx.navigate('master/invoices');

      container.append(
        UI.pageHead(t('mst.dash.title'), t('mst.dash.sub')),
        el('div', { class: 'grid grid-4' },
          UI.kpiCard({ label: t('mst.kpi.activeTenants'), value: count('active'), tone: 'ok', onClick: goTenants }),
          UI.kpiCard({ label: t('mst.kpi.trialTenants'), value: count('trial'), onClick: goTenants }),
          UI.kpiCard({ label: t('mst.kpi.overdueTenants'), value: count('overdue'), tone: 'warn', onClick: goTenants }),
          UI.kpiCard({ label: t('mst.kpi.suspendedTenants'), value: count('suspended'), tone: 'danger', onClick: goTenants }),
        ),
        el('div', { class: 'grid grid-3', style: { marginTop: 'var(--s-4)' } },
          UI.kpiCard({ label: t('mst.kpi.invTotal'), value: fmtMoney(invTotal), delta: `${monthInvs.length} invoice`, onClick: goInvoices }),
          UI.kpiCard({ label: t('mst.kpi.invPaid'), value: fmtMoney(invPaid), tone: 'ok', onClick: goInvoices }),
          UI.kpiCard({ label: t('mst.kpi.invOut'), value: fmtMoney(invTotal - invPaid), tone: invTotal - invPaid > 0 ? 'warn' : 'ok', onClick: goInvoices }),
        ),
        el('div', { class: 'grid grid-2', style: { marginTop: 'var(--s-4)' } },
          UI.kpiCard({ label: t('mst.kpi.students'), value: activeStudents, onClick: goTenants }),
          UI.kpiCard({ label: t('mst.kpi.payments'), value: payCount }),
        ),
        el('div', { class: 'panel', style: { marginTop: 'var(--s-4)' } },
          el('div', { class: 'panel-title' }, `🔔 ${t('mst.notif.title')}`),
          (overdueInvs.length || openTickets.length)
            ? UI.timeline([
              ...overdueInvs.map((i) => ({
                when: fmtDate(i.dueDate),
                what: `${t('mst.notif.overdueInv')} — ${tenantName(i.tenantId)}`,
                detail: `${i.number} · ${fmtMoney(i.total)}`,
                tone: 'danger',
              })),
              ...openTickets.map((tk) => ({
                when: fmtDate(tk.createdAt),
                what: `${t('mst.notif.openTicket')} — ${tenantName(tk.tenantId)}`,
                detail: tk.subject,
                tone: 'warn',
              })),
            ])
            : UI.emptyState(t('mst.notif.none'), '✅'),
        ),
      );
    },

    /* ---------- Tenants ---------- */
    tenants(container, ctx) {
      const host = el('div');
      const renderList = () => {
        clear(host);
        const rows = Store.list('tenants');
        host.append(UI.dataTable({
          columns: [
            { label: t('common.name'), render: (r) => el('strong', {}, r.name) },
            { label: t('mst.tenants.code'), render: (r) => el('span', { class: 'mono small' }, r.code) },
            { label: t('mst.tenants.type'), render: (r) => t(`mst.type.${r.type}`) },
            { label: t('mst.tenants.plan'), render: (r) => planOf(r)?.name || '—' },
            { label: t('mst.tenants.usage'), render: (r) => `${r.activeStudents ?? 0} / ${r.studentQuota ?? 0}` },
            { label: t('common.status'), render: (r) => UI.statusChip(r.subscriptionStatus) },
          ],
          rows,
          onRowClick: (r) => tenantDrawer(r, ctx, renderList),
        }));
      };
      renderList();

      container.append(
        UI.pageHead(t('mst.tenants.title'), t('mst.tenants.sub'),
          el('button', { class: 'btn primary', onclick: () => tenantForm(null, ctx, renderList) }, `＋ ${t('mst.tenants.add')}`)),
        host,
      );
    },

    /* ---------- Plans ---------- */
    plans(container, ctx) {
      const host = el('div', { class: 'grid grid-3' });
      const renderList = () => {
        clear(host);
        const tenants = Store.list('tenants');
        for (const p of Store.list('plans')) {
          const used = tenants.filter((tn) => tn.planId === p.id).length;
          host.append(el('div', { class: 'panel' },
            el('div', { class: 'row between' },
              el('h3', { style: { margin: 0 } }, p.name),
              UI.chip(t('mst.plans.usedBy', { n: used }), 'info'),
            ),
            el('div', { style: { fontSize: '1.4rem', fontWeight: 700, margin: 'var(--s-3) 0' } },
              fmtMoney(p.monthlyBase), el('span', { class: 'muted small' }, ' /bulan')),
            kv(t('mst.plans.perStudent'), fmtMoney(p.perStudent)),
            kv(t('mst.plans.invoiceDay'), String(p.invoiceDay ?? 1)),
            kv(t('mst.plans.grace'), `${p.graceDays ?? 14} hari`),
            el('div', { class: 'row', style: { gap: '6px', flexWrap: 'wrap', margin: 'var(--s-3) 0' } },
              (p.features || []).map((f) => UI.chip(f)),
            ),
            el('button', { class: 'btn ghost sm', onclick: () => planForm(p, ctx, renderList) }, `✏️ ${t('common.edit')}`),
          ));
        }
      };
      renderList();

      container.append(
        UI.pageHead(t('mst.plans.title'), t('mst.plans.sub'),
          el('button', { class: 'btn primary', onclick: () => planForm(null, ctx, renderList) }, `＋ ${t('mst.plans.add')}`)),
        host,
      );
    },

    /* ---------- Invoices ---------- */
    invoices(container, ctx) {
      let status = 'all';
      const host = el('div');

      const renderList = () => {
        clear(host);
        const rows = Store.list('saasInvoices', (i) => status === 'all' || i.status === status)
          .sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || ''));
        host.append(UI.dataTable({
          columns: [
            { label: t('mst.inv.number'), render: (r) => el('span', { class: 'mono small' }, r.number) },
            { label: t('mst.inv.tenant'), render: (r) => tenantName(r.tenantId) },
            { label: t('common.period'), key: 'period' },
            { label: t('common.total'), render: (r) => fmtMoney(r.total) },
            { label: t('common.dueDate'), render: (r) => fmtDate(r.dueDate) },
            { label: t('common.status'), render: (r) => UI.statusChip(r.status) },
            {
              label: t('common.action'),
              render: (r) => el('div', { class: 'row', style: { gap: '6px' } },
                el('button', { class: 'btn ghost sm', onclick: () => invoiceDetailModal(r) }, t('common.detail')),
                r.status === 'draft'
                  ? el('button', {
                    class: 'btn sm',
                    onclick: () => {
                      Store.update('saasInvoices', r.id, { status: 'sent' }, ctx.session.userId);
                      UI.toast(t('mst.inv.sentOk'), 'ok');
                      renderList();
                    },
                  }, `📨 ${t('mst.inv.send')}`)
                  : null,
                (r.status === 'sent' || r.status === 'overdue')
                  ? el('button', {
                    class: 'btn sm',
                    onclick: () => {
                      Store.update('saasInvoices', r.id, { status: 'paid', paidAt: new Date().toISOString() }, ctx.session.userId);
                      UI.toast(t('mst.inv.paidOk'), 'ok');
                      renderList();
                    },
                  }, `✅ ${t('mst.inv.markPaid')}`)
                  : null,
              ),
            },
          ],
          rows,
        }));
      };

      const filter = UI.select(
        [{ value: 'all', label: t('common.all') }, ...INV_STATUSES.map((v) => ({ value: v, label: t(`status.${v}`) }))],
        { onchange: (e) => { status = e.target.value; renderList(); } },
      );

      renderList();
      container.append(
        UI.pageHead(t('mst.inv.title'), t('mst.inv.sub'),
          el('button', { class: 'btn primary', onclick: () => generateInvoiceModal(ctx, renderList) }, `⚙️ ${t('mst.inv.generate')}`)),
        el('div', { class: 'filterbar' }, el('span', { class: 'muted small' }, t('common.filter')), filter),
        host,
      );
    },

    /* ---------- Audit & Support ---------- */
    audit(container, ctx) {
      let tab = 'logs';
      const host = el('div', { style: { marginTop: 'var(--s-3)' } });

      const renderTab = () => {
        clear(host);
        if (tab === 'logs') {
          const rows = Store.list('auditLogs').sort((a, b) => (b.at || '').localeCompare(a.at || ''));
          host.append(UI.dataTable({
            columns: [
              { label: t('mst.audit.time'), render: (r) => el('span', { class: 'mono small' }, fmtDateTime(r.at)) },
              { label: t('mst.audit.actor'), render: (r) => userName(r.actor) },
              { label: t('mst.audit.action'), render: (r) => UI.chip(r.action, r.action === 'delete' ? 'danger' : r.action === 'create' ? 'ok' : 'info') },
              { label: t('mst.audit.entity'), render: (r) => el('span', { class: 'mono small' }, `${r.entity} · ${r.entityId}`) },
            ],
            rows,
          }));
        } else {
          const rows = Store.list('supportTickets').sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          host.append(UI.dataTable({
            columns: [
              { label: t('common.date'), render: (r) => fmtDate(r.createdAt) },
              { label: t('mst.audit.subject'), render: (r) => el('div', {}, el('strong', {}, r.subject), el('div', { class: 'xs muted' }, r.body || '')) },
              { label: t('mst.inv.tenant'), render: (r) => tenantName(r.tenantId) },
              { label: t('common.status'), render: (r) => UI.statusChip(r.status) },
              {
                label: t('common.action'),
                render: (r) => r.status === 'open'
                  ? el('button', {
                    class: 'btn sm',
                    onclick: () => {
                      Store.update('supportTickets', r.id, { status: 'resolved' }, ctx.session.userId);
                      UI.toast(t('mst.audit.resolvedOk'), 'ok');
                      renderTab();
                    },
                  }, `✅ ${t('mst.audit.resolve')}`)
                  : el('span', { class: 'muted small' }, '—'),
              },
            ],
            rows,
          }));
        }
      };

      renderTab();
      container.append(
        UI.pageHead(t('mst.audit.title'), t('mst.audit.sub')),
        UI.tabs([
          { id: 'logs', label: `📜 ${t('mst.audit.logTab')}` },
          { id: 'tickets', label: `🎫 ${t('mst.audit.ticketTab')}` },
        ], tab, (id) => { tab = id; renderTab(); }),
        host,
      );
    },
  },
};
