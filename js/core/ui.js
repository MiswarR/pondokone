/* ============================================================
   UI helpers — komponen bersama seluruh portal.
   Semua fungsi mengembalikan HTMLElement (bukan string) agar aman
   dari injeksi dan mudah diberi event listener.
   ============================================================ */

import { t, fmtMoney, fmtDate } from './i18n.js';

/** el('div', {class:'x', onclick:fn, dataset:{id:1}}, child1, 'teks', ...) */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') node.innerHTML = v;
    else if (v === true) node.setAttribute(k, '');
    else node.setAttribute(k, v);
  }
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }

/* ---------- KPI card ---------- */
export function kpiCard({ label, value, delta, tone = '', onClick }) {
  return el('div', { class: `kpi ${tone}`, onclick: onClick, style: onClick ? { cursor: 'pointer' } : null },
    el('div', { class: 'label' }, label),
    el('div', { class: 'value' }, value),
    delta ? el('div', { class: 'delta' }, delta) : null,
  );
}

/* ---------- Chip status ---------- */
const STATUS_TONES = {
  active: 'ok', paid: 'ok', hadir: 'ok', lancar: 'ok', done: 'ok', resolved: 'ok', good: 'ok',
  trial: 'info', pending: 'info', sent: 'info', partial: 'info', process: 'info', ringan: 'info',
  overdue: 'danger', unpaid: 'warn', failed: 'danger', expired: 'danger', alfa: 'danger', suspended: 'danger', berat: 'danger', violation: 'danger', open: 'warn',
  izin: 'info', sakit: 'warn', terlambat: 'warn', cukup: 'info', ulang: 'warn', tidak: 'danger', draft: '', inactive: '', sedang: 'warn',
};
export function chip(text, tone) {
  return el('span', { class: `chip ${tone ?? (STATUS_TONES[text] || '')}` }, text);
}
export function statusChip(status, labelKeyPrefix = 'status') {
  const label = t(`${labelKeyPrefix}.${status}`);
  return chip(label === `${labelKeyPrefix}.${status}` ? status : label, STATUS_TONES[status] || '');
}

/* ---------- Tabel data ---------- */
export function dataTable({ columns, rows, onRowClick, emptyText }) {
  if (!rows.length) return emptyState(emptyText || t('common.empty'));
  const thead = el('thead', {}, el('tr', {}, columns.map((c) => el('th', {}, c.label))));
  const tbody = el('tbody', {}, rows.map((row) =>
    el('tr', {
      class: onRowClick ? 'clickable' : '',
      onclick: onRowClick ? () => onRowClick(row) : null,
    }, columns.map((c) => el('td', {}, c.render ? c.render(row) : (row[c.key] ?? '—'))))
  ));
  return el('div', { class: 'table-wrap' }, el('table', { class: 'data' }, thead, tbody));
}

/* ---------- Empty state ---------- */
export function emptyState(text, icon = '🗂️') {
  return el('div', { class: 'empty' }, el('div', { class: 'ico' }, icon), el('div', {}, text));
}

/* ---------- Progress ---------- */
export function progressBar(pct) {
  const clamped = Math.max(0, Math.min(100, pct));
  return el('div', { class: 'progress' }, el('span', { style: { width: `${clamped}%` } }));
}

export function progressRing(pct, label) {
  const clamped = Math.max(0, Math.min(100, pct));
  const r = 36, c = 2 * Math.PI * r;
  const ring = el('div', { class: 'progress-ring' });
  ring.innerHTML = `
    <svg width="86" height="86" viewBox="0 0 86 86">
      <circle cx="43" cy="43" r="${r}" fill="none" stroke="var(--panel-2)" stroke-width="8"/>
      <circle cx="43" cy="43" r="${r}" fill="none" stroke="var(--accent)" stroke-width="8"
        stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - clamped / 100)}"/>
    </svg>`;
  ring.append(el('div', { class: 'val' }, label ?? `${Math.round(clamped)}%`));
  return ring;
}

/* ---------- Timeline ---------- */
export function timeline(items) {
  // items: [{when, what, detail, tone}]
  if (!items.length) return emptyState(t('common.empty'), '🕰️');
  return el('ul', { class: 'timeline' }, items.map((it) =>
    el('li', { class: it.tone || '' },
      el('div', { class: 'when' }, it.when),
      el('div', { class: 'what' }, it.what),
      it.detail ? el('div', { class: 'small muted' }, it.detail) : null,
    )));
}

/* ---------- Avatar ---------- */
export function avatar(name, size = '') {
  const initials = (name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return el('span', { class: `avatar ${size}` }, initials);
}

/* ---------- Toast ---------- */
export function toast(message, tone = '') {
  let host = document.getElementById('toasts');
  if (!host) { host = el('div', { id: 'toasts' }); document.body.append(host); }
  const item = el('div', { class: `toast ${tone}` }, message);
  host.append(item);
  setTimeout(() => { item.style.opacity = '0'; item.style.transition = 'opacity .3s'; }, 2600);
  setTimeout(() => item.remove(), 3000);
}

/* ---------- Modal ---------- */
export function modal({ title, body, footer, wide = false, onClose }) {
  const close = () => { overlay.remove(); onClose?.(); };
  const box = el('div', { class: `modal ${wide ? 'wide' : ''}` },
    el('div', { class: 'modal-head' },
      el('h3', {}, title),
      el('button', { class: 'modal-close', onclick: close, 'aria-label': t('common.close') }, '✕'),
    ),
    el('div', { class: 'modal-body' }, body),
    footer ? el('div', { class: 'row', style: { marginTop: 'var(--s-4)', justifyContent: 'flex-end' } }, footer) : null,
  );
  const overlay = el('div', { class: 'overlay', onclick: (e) => { if (e.target === overlay) close(); } }, box);
  document.body.append(overlay);
  return { close, box };
}

/* ---------- Drawer ---------- */
export function drawer({ title, body, onClose }) {
  const close = () => { scrim.remove(); panel.remove(); onClose?.(); };
  const scrim = el('div', { class: 'drawer-overlay', onclick: close });
  const panel = el('div', { class: 'drawer' },
    el('div', { class: 'modal-head' },
      el('h3', {}, title),
      el('button', { class: 'modal-close', onclick: close, 'aria-label': t('common.close') }, '✕'),
    ),
    body,
  );
  document.body.append(scrim, panel);
  return { close, panel };
}

export function confirmDialog(message, onYes) {
  const m = modal({
    title: t('common.confirmDelete'),
    body: el('p', {}, message || t('common.confirmDelete')),
    footer: [
      el('button', { class: 'btn ghost', onclick: () => m.close() }, t('common.cancel')),
      el('button', { class: 'btn danger', onclick: () => { m.close(); onYes(); } }, t('common.delete')),
    ],
  });
  return m;
}

/* ---------- Form helpers ---------- */
export function field(labelText, inputEl, hint) {
  return el('div', { class: 'field' },
    el('label', {}, labelText),
    inputEl,
    hint ? el('div', { class: 'hint' }, hint) : null,
  );
}

export function input(attrs = {}) { return el('input', { type: 'text', ...attrs }); }

export function select(options, attrs = {}) {
  // options: [{value, label, selected}]
  return el('select', attrs, options.map((o) =>
    el('option', { value: o.value, selected: o.selected || null }, o.label)));
}

export function textarea(attrs = {}) { return el('textarea', attrs); }

/** Segmented control — dipakai untuk status absensi, tab kecil, dsb. */
export function segmented(options, value, onChange, toneMap = {}) {
  const wrap = el('div', { class: 'segmented' });
  const buttons = options.map((o) => {
    const btn = el('button', {
      type: 'button',
      class: `${toneMap[o.value] ? `st-${toneMap[o.value]}` : ''} ${o.value === value ? 'active' : ''}`,
      onclick: () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        onChange(o.value);
      },
    }, o.label);
    return btn;
  });
  wrap.append(...buttons);
  return wrap;
}

/* ---------- Tabs ---------- */
export function tabs(items, activeId, onChange) {
  // items: [{id, label}]
  const bar = el('div', { class: 'tabs' });
  const btns = items.map((it) => {
    const b = el('button', {
      class: it.id === activeId ? 'active' : '',
      onclick: () => {
        btns.forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
        onChange(it.id);
      },
    }, it.label);
    return b;
  });
  bar.append(...btns);
  return bar;
}

/* ---------- Format util re-export (agar portal cukup impor UI) ---------- */
export { fmtMoney, fmtDate };

/* ---------- Page head ---------- */
export function pageHead(title, sub, ...actions) {
  return el('div', { class: 'page-head' },
    el('div', {},
      el('h1', {}, title),
      sub ? el('div', { class: 'sub' }, sub) : null,
    ),
    actions.length ? el('div', { class: 'row' }, actions) : null,
  );
}
