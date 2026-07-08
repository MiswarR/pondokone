/* ============================================================
   Auth — landing pemilihan portal + login.
   Sesuai spesifikasi: satu komponen autentikasi untuk semua role,
   respons login memuat role & tenant untuk menentukan menu.
   ============================================================ */

import { t, getLangs, getLang, setLang } from './i18n.js';
import * as Store from './store.js';
import { el, field, input, toast } from './ui.js';

/* Halaman login sengaja polos — tanpa kartu pemilihan portal.
   Sistem otomatis mengarahkan ke portal yang tepat sesuai role akun.
   Akun Web Master tetap tidak ditampilkan; login manual tetap bisa.
   Daftar di bawah hanya teks akun demo (klik = isi otomatis). */
const DEMO_ACCOUNTS = [
  { id: 'yayasan@alhikmah.or.id', pw: 'yayasan123' },
  { id: 'bendahara@alhikmah.or.id', pw: 'bendahara123' },
  { id: 'sekretaris@alhikmah.or.id', pw: 'sekretaris123' },
  { id: 'admin@alhikmah.sch.id', pw: 'admin123' },
  { id: 'ustadz@alhikmah.sch.id', pw: 'guru123' },
  { id: 'wali@gmail.com', pw: 'wali123' },
];

export function renderAuth(container, { onLogin }) {
  container.innerHTML = '';

  const langBar = el('div', { class: 'row', style: { justifyContent: 'center', marginBottom: 'var(--s-4)' } },
    getLangs().map((l) => el('button', {
      class: `btn sm ${l.code === getLang() ? 'primary' : 'ghost'}`,
      onclick: () => { setLang(l.code); renderAuth(container, { onLogin }); },
    }, l.code.toUpperCase())),
  );

  const idInput = input({ placeholder: t('auth.identifier'), autocomplete: 'username' });
  const pwWrap = el('div', { style: { position: 'relative' } });
  const pwInput = input({ type: 'password', placeholder: t('auth.password'), autocomplete: 'current-password' });
  const pwToggle = el('button', {
    type: 'button',
    class: 'btn ghost sm',
    style: { position: 'absolute', insetInlineEnd: '6px', top: '5px', padding: '3px 8px' },
    onclick: () => { pwInput.type = pwInput.type === 'password' ? 'text' : 'password'; },
  }, '👁');
  pwWrap.append(pwInput, pwToggle);

  const err = el('div', { class: 'small', style: { color: 'var(--danger)', minHeight: '1.3em', marginBottom: '8px' } });

  function doLogin() {
    const user = Store.login(idInput.value.trim(), pwInput.value);
    if (!user) { err.textContent = t('auth.invalid'); return; }
    onLogin(user);
  }

  const card = el('div', { class: 'auth-card' },
    el('div', { class: 'row', style: { justifyContent: 'center', marginBottom: 'var(--s-3)' } },
      el('div', { class: 'brand', style: { border: 'none', padding: 0, margin: 0 } },
        el('div', { class: 'logo' }, 'P1'),
        el('div', {},
          el('div', { class: 'name' }, t('app.name')),
          el('div', { class: 'sub' }, t('app.tagline')),
        ),
      ),
    ),
    langBar,
    field(t('auth.identifier'), idInput),
    field(t('auth.password'), pwWrap),
    el('label', { class: 'row small muted', style: { marginBottom: 'var(--s-3)', gap: '8px' } },
      el('input', { type: 'checkbox', style: { width: 'auto' } }), t('auth.remember'),
    ),
    err,
    el('button', { class: 'btn primary block', onclick: doLogin }, t('auth.login')),
    el('div', { style: { textAlign: 'center', marginTop: 'var(--s-3)' } },
      el('a', { href: '#', class: 'small', onclick: (e) => { e.preventDefault(); toast('Demo: gunakan akun contoh di atas', 'warn'); } }, t('auth.forgot')),
    ),
    el('div', { class: 'xs muted', style: { marginTop: 'var(--s-4)', borderTop: '1px solid var(--line-soft)', paddingTop: 'var(--s-3)' } },
      t('auth.demoHint'),
      el('div', { class: 'mono xs', style: { marginTop: '6px', lineHeight: 1.8 } },
        DEMO_ACCOUNTS.map((a) => el('div', {
          style: { cursor: 'pointer' },
          onclick: () => { idInput.value = a.id; pwInput.value = a.pw; },
        }, `${a.id} / ${a.pw}`)),
      ),
    ),
  );

  pwInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
  container.append(el('div', { class: 'auth-wrap' }, card));
}
