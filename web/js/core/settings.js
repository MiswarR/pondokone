/* ============================================================
   Settings — modul pengaturan bersama semua portal.
   Tab: Akun, Tampilan, Bahasa, Notifikasi, Regional, Branding.
   Perubahan tema/bahasa berlaku instan tanpa login ulang.
   ============================================================ */

import { t, getLang, getLangs, setLang } from './i18n.js';
import * as Store from './store.js';
import { el, field, input, select, tabs, toast, segmented } from './ui.js';

const PREFS_KEY = 'po.prefs';

export function getPrefs() {
  return { theme: 'dark', density: 'comfortable', textsize: 'default', ...(JSON.parse(localStorage.getItem(PREFS_KEY) || '{}')) };
}

export function setPref(key, value) {
  const prefs = getPrefs();
  prefs[key] = value;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  applyPrefs();
}

export function applyPrefs() {
  const prefs = getPrefs();
  const root = document.documentElement;
  let theme = prefs.theme;
  if (theme === 'system') {
    theme = window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  root.dataset.theme = theme;
  root.dataset.density = prefs.density;
  root.dataset.textsize = prefs.textsize;
}

export function renderSettings(container, ctx) {
  const { session, rerender } = ctx;
  const isAdminish = session.role === 'admin' || session.role === 'master';
  container.innerHTML = '';

  const tabDefs = [
    { id: 'account', label: t('settings.account') },
    { id: 'appearance', label: t('settings.appearance') },
    { id: 'language', label: t('settings.language') },
    { id: 'notifications', label: t('settings.notifications') },
    ...(isAdminish ? [
      { id: 'regional', label: t('settings.regional') },
      { id: 'branding', label: t('settings.branding') },
    ] : []),
  ];

  const body = el('div', {});
  let active = ctx.params?.tab || 'appearance';

  function show(id) {
    active = id;
    body.innerHTML = '';
    body.append(SECTIONS[id](session, rerender));
  }

  container.append(
    el('h1', { style: { fontSize: '1.45rem' } }, t('settings.title')),
    tabs(tabDefs, active, show),
    body,
  );
  show(active);
}

const SECTIONS = {
  account(session) {
    const user = Store.get('users', session.userId) || {};
    return el('div', { class: 'panel', style: { maxWidth: '560px' } },
      field(t('common.name'), input({ value: user.name || '', disabled: true })),
      field('Email', input({ value: user.email || '', disabled: true })),
      field('No. HP', input({ value: user.phone || '', disabled: true })),
      el('div', { class: 'muted small' }, 'Demo: data akun dikelola oleh admin.'),
      el('hr', { style: { border: 'none', borderTop: '1px solid var(--line-soft)', margin: 'var(--s-4) 0' } }),
      el('button', {
        class: 'btn danger',
        onclick: () => {
          if (confirm(t('settings.resetDemo') + '?')) {
            Store.resetDemo();
            toast(t('settings.resetDemoDone'), 'ok');
            setTimeout(() => location.reload(), 600);
          }
        },
      }, t('settings.resetDemo')),
    );
  },

  appearance(session, rerender) {
    const prefs = getPrefs();
    return el('div', { class: 'panel', style: { maxWidth: '560px' } },
      field(t('settings.theme'), segmented([
        { value: 'dark', label: t('settings.theme.dark') },
        { value: 'light', label: t('settings.theme.light') },
        { value: 'system', label: t('settings.theme.system') },
      ], prefs.theme, (v) => setPref('theme', v))),
      field(t('settings.density'), segmented([
        { value: 'comfortable', label: t('settings.density.comfortable') },
        { value: 'compact', label: t('settings.density.compact') },
      ], prefs.density, (v) => setPref('density', v))),
      field(t('settings.textsize'), segmented([
        { value: 'small', label: t('settings.textsize.small') },
        { value: 'default', label: t('settings.textsize.default') },
        { value: 'large', label: t('settings.textsize.large') },
      ], prefs.textsize, (v) => setPref('textsize', v))),
    );
  },

  language(session, rerender) {
    return el('div', { class: 'panel', style: { maxWidth: '560px' } },
      el('p', { class: 'muted small' }, t('settings.langNote')),
      el('div', { class: 'stack' },
        getLangs().map((l) => el('button', {
          class: `btn block ${l.code === getLang() ? 'primary' : ''}`,
          style: { justifyContent: 'space-between' },
          onclick: () => { setLang(l.code); rerender?.(); },
        },
          el('span', {}, l.label),
          el('span', { class: 'mono xs' }, l.code.toUpperCase() + (l.dir === 'rtl' ? ' · RTL' : '')),
        )),
      ),
    );
  },

  notifications(session) {
    const user = Store.get('users', session.userId) || {};
    const prefs = user.notifPrefs || { nilai: true, absensi: true, perilaku: true, tagihan: true };
    const rows = Object.entries(prefs).map(([key, val]) => {
      const cb = el('input', { type: 'checkbox', checked: val || null, style: { width: 'auto' } });
      cb.addEventListener('change', () => {
        const next = { ...(Store.get('users', session.userId)?.notifPrefs || prefs), [key]: cb.checked };
        Store.update('users', session.userId, { notifPrefs: next }, session.userId);
        toast(t('common.saved'), 'ok');
      });
      return el('label', { class: 'row between', style: { padding: '10px 0', borderBottom: '1px solid var(--line-soft)' } },
        el('span', { style: { textTransform: 'capitalize' } }, key), cb);
    });
    return el('div', { class: 'panel', style: { maxWidth: '560px' } }, rows);
  },

  regional(session) {
    return el('div', { class: 'panel', style: { maxWidth: '560px' } },
      field('Timezone', select([
        { value: 'wib', label: 'WIB (GMT+7)', selected: true },
        { value: 'wita', label: 'WITA (GMT+8)' },
        { value: 'wit', label: 'WIT (GMT+9)' },
      ])),
      field('Format tanggal', select([
        { value: 'd', label: '5 Juli 2026', selected: true },
        { value: 'i', label: '2026-07-05' },
      ])),
      field('Mata uang', select([{ value: 'idr', label: 'Rupiah (IDR)', selected: true }])),
      el('button', { class: 'btn primary', onclick: () => toast(t('common.saved'), 'ok') }, t('common.save')),
    );
  },

  branding(session) {
    const tenant = session.tenantId ? Store.get('tenants', session.tenantId) : null;
    if (!tenant) {
      return el('div', { class: 'panel' }, el('p', { class: 'muted' }, 'Branding diatur per tenant. Pilih tenant di modul Tenant.'));
    }
    const nameIn = input({ value: tenant.name });
    const colorIn = el('input', { type: 'color', value: tenant.accentColor || '#2f7bff', style: { width: '64px', height: '38px', padding: '2px' } });
    const langSel = select(getLangs().map((l) => ({ value: l.code, label: l.label, selected: l.code === (tenant.defaultLang || 'id') })));
    return el('div', { class: 'panel', style: { maxWidth: '560px' } },
      field('Nama instansi', nameIn),
      field('Warna aksen instansi', colorIn),
      field('Bahasa default tenant', langSel, 'User tetap dapat memilih bahasa pribadinya sendiri.'),
      el('button', {
        class: 'btn primary',
        onclick: () => {
          Store.update('tenants', tenant.id, { name: nameIn.value, accentColor: colorIn.value, defaultLang: langSel.value }, session.userId);
          toast(t('common.saved'), 'ok');
        },
      }, t('common.save')),
    );
  },
};
