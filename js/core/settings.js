/* ============================================================
   Settings — modul pengaturan bersama semua portal.
   Tab: Akun, Tampilan, Bahasa, Notifikasi, Regional, Branding.
   Perubahan tema/bahasa berlaku instan tanpa login ulang.
   ============================================================ */

import { t, getLang, getLangs, setLang } from './i18n.js';
import * as Store from './store.js';
import { el, field, input, passwordInput, select, tabs, toast, segmented } from './ui.js';

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

    const pwCurrent = passwordInput({ placeholder: 'Kata sandi saat ini' });
    const pwNew     = passwordInput({ placeholder: 'Minimal 6 karakter' });
    const pwConfirm = passwordInput({ placeholder: 'Ulangi kata sandi baru' });
    const pwErr     = el('div', { class: 'small', style: { color: 'var(--danger)', minHeight: '1.2em' } });

    function doChangePassword() {
      pwErr.textContent = '';
      if (!pwCurrent.value) { pwErr.textContent = 'Masukkan kata sandi saat ini.'; return; }
      if (pwNew.value.length < 6) { pwErr.textContent = 'Kata sandi baru minimal 6 karakter.'; return; }
      if (pwNew.value !== pwConfirm.value) { pwErr.textContent = 'Konfirmasi kata sandi tidak cocok.'; return; }
      const res = Store.changePassword(session.userId, pwCurrent.value, pwNew.value, session.userId);
      if (!res.ok) {
        pwErr.textContent = res.err === 'wrong_password' ? 'Kata sandi saat ini salah.' : 'Gagal mengganti kata sandi.';
        return;
      }
      pwCurrent.value = ''; pwNew.value = ''; pwConfirm.value = '';
      toast('Kata sandi berhasil diganti.', 'ok');
    }

    return el('div', { style: { maxWidth: '560px' } },
      el('div', { class: 'panel' },
        field(t('common.name'), input({ value: user.name || '', disabled: true })),
        field('Email', input({ value: user.email || '', disabled: true })),
        field('No. HP', input({ value: user.phone || '', disabled: true })),
        el('div', { class: 'muted small' }, 'Data profil dikelola oleh admin.'),
      ),
      el('div', { class: 'panel', style: { marginTop: 'var(--s-4)' } },
        el('h3', { style: { margin: '0 0 var(--s-3)' } }, 'Ganti Kata Sandi'),
        field('Kata sandi saat ini', pwCurrent),
        field('Kata sandi baru', pwNew),
        field('Konfirmasi kata sandi baru', pwConfirm),
        pwErr,
        el('button', { class: 'btn primary', onclick: doChangePassword }, 'Simpan Kata Sandi Baru'),
      ),
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

  branding(session, rerender) {
    const tenant = session.tenantId ? Store.get('tenants', session.tenantId) : null;
    if (!tenant) {
      return el('div', { class: 'panel' }, el('p', { class: 'muted' }, 'Branding diatur per tenant. Pilih tenant di modul Tenant.'));
    }
    const nameIn = input({ value: tenant.name });
    const colorIn = el('input', { type: 'color', value: tenant.accentColor || '#2f7bff', style: { width: '64px', height: '38px', padding: '2px' } });
    const langSel = select(getLangs().map((l) => ({ value: l.code, label: l.label, selected: l.code === (tenant.defaultLang || 'id') })));

    /* Logo sekolah — diunggah admin, dipakai sebagai ikon aplikasi & logo sidebar
       untuk seluruh akun di bawah sekolah ini (admin, guru, orang tua). */
    let logoDataUrl = tenant.logoDataUrl || null;
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
      else preview.append(tenant.name.slice(0, 1));
    };
    renderPreview();

    const fileIn = el('input', { type: 'file', accept: 'image/*', style: { display: 'none' } });
    fileIn.addEventListener('change', () => {
      const f = fileIn.files?.[0];
      if (!f) return;
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => { img.src = reader.result; };
      img.onload = () => {
        /* Perkecil ke 256px agar ringan disimpan & cepat dimuat */
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
      reader.readAsDataURL(f);
    });

    return el('div', { class: 'panel', style: { maxWidth: '560px' } },
      el('p', { class: 'muted small' },
        '🎨 Logo & warna di sini menjadi identitas aplikasi untuk SELURUH akun sekolah ini — admin, guru, dan orang tua. Tidak memengaruhi tampilan Web Master maupun yayasan.'),
      field('Nama instansi', nameIn),
      el('div', { class: 'field' },
        el('label', {}, 'Logo sekolah / pondok (ikon aplikasi)'),
        el('div', { class: 'row', style: { gap: '14px', alignItems: 'center' } },
          preview,
          el('div', { class: 'stack', style: { gap: '6px' } },
            el('button', { class: 'btn sm', onclick: () => fileIn.click() }, '📁 Pilih gambar…'),
            logoRemoveBtn(),
          ),
        ),
        el('div', { class: 'hint' }, 'PNG/JPG persegi disarankan. Otomatis diperkecil ke 256×256.'),
        fileIn,
      ),
      field('Warna aksen instansi', colorIn, 'Warna tombol, tautan, dan sorotan di seluruh aplikasi sekolah ini.'),
      field('Bahasa default tenant', langSel, 'User tetap dapat memilih bahasa pribadinya sendiri.'),
      el('button', {
        class: 'btn primary',
        onclick: () => {
          Store.update('tenants', tenant.id, {
            name: nameIn.value, accentColor: colorIn.value, defaultLang: langSel.value, logoDataUrl,
          }, session.userId);
          toast(t('common.saved'), 'ok');
          rerender?.(); /* terapkan warna & logo baru seketika */
        },
      }, t('common.save')),
    );

    function logoRemoveBtn() {
      return el('button', {
        class: 'btn ghost sm',
        onclick: () => { logoDataUrl = null; fileIn.value = ''; renderPreview(); },
      }, '🗑 Hapus logo');
    }
  },
};
