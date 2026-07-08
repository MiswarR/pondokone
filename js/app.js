/* ============================================================
   App shell — router hash, sesi, shell sidebar (web) dan
   shell bottom-nav (mobile), indikator offline, re-render i18n.

   Kontrak modul portal (js/portals/*.js):
   export default {
     id: 'admin',            // segmen hash pertama
     role: 'admin',          // role user yang boleh masuk
     shell: 'sidebar',       // 'sidebar' | 'mobile'
     navGroups: [ { label?: 'nav.masterdata', items: [
        { route: 'students', icon: '🎓', label: 'nav.students' }, ... ] } ],
     defaultRoute: 'dashboard',
     routes: { dashboard(container, ctx) { ... }, ... },
   }
   ctx = { session, params, navigate, rerender }
   ============================================================ */

import { t, onLangChange, applyDir } from './core/i18n.js';
import * as Store from './core/store.js';
import { el, clear, avatar, toast } from './core/ui.js';
import { renderAuth } from './core/auth.js';
import { renderSettings, applyPrefs } from './core/settings.js';

import masterPortal from './portals/master.js';
import yayasanPortal from './portals/yayasan.js';
import adminPortal from './portals/admin.js';
import guruPortal from './portals/guru.js';
import ortuPortal from './portals/ortu.js';

const PORTALS = { master: masterPortal, yayasan: yayasanPortal, admin: adminPortal, guru: guruPortal, ortu: ortuPortal };
const ROLE_PORTAL = { master: 'master', foundation_admin: 'yayasan', admin: 'admin', teacher: 'guru', guardian: 'ortu' };
const SESSION_KEY = 'po.session';

const app = document.getElementById('app');
let session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');

/* ---------- Sesi ---------- */
function setSession(user) {
  session = user
    ? { userId: user.id, role: user.role, tenantId: user.tenantId || null, foundationId: user.foundationId || null, name: user.name }
    : null;
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

/* ---------- Branding per sekolah ----------
   Warna aksen + logo sekolah berlaku HANYA ke bawah (admin, guru, orang tua
   sekolah tsb). Web Master dan admin yayasan tetap tampilan default platform. */
const BRANDED_ROLES = ['admin', 'teacher', 'guardian'];

export function applyBranding() {
  const root = document.documentElement;
  const tenant = session && BRANDED_ROLES.includes(session.role) && session.tenantId
    ? Store.get('tenants', session.tenantId) : null;

  const accent = tenant?.accentColor;
  if (accent && /^#[0-9a-f]{6}$/i.test(accent)) {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(accent.slice(i, i + 2), 16));
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-strong', `rgb(${Math.max(r - 30, 0)}, ${Math.max(g - 30, 0)}, ${Math.max(b - 30, 0)})`);
    root.style.setProperty('--accent-soft', `rgba(${r}, ${g}, ${b}, 0.14)`);
    root.style.setProperty('--accent-ink', `rgb(${Math.min(r + 90, 255)}, ${Math.min(g + 90, 255)}, ${Math.min(b + 90, 255)})`);
  } else {
    ['--accent', '--accent-strong', '--accent-soft', '--accent-ink'].forEach((v) => root.style.removeProperty(v));
  }

  const fav = document.querySelector('link[rel="icon"]');
  if (fav) fav.href = tenant?.logoDataUrl || './assets/icon.svg';
  document.title = tenant ? `${tenant.name} — ${t('app.name')}` : 'PondokOne — Platform Sekolah & Pesantren';
}

/* Logo brand: pakai logo sekolah bila ada, selain itu huruf pertama nama. */
function brandLogo(tenant, fallbackName) {
  if (tenant?.logoDataUrl) {
    return el('div', { class: 'logo', style: { overflow: 'hidden', padding: 0 } },
      el('img', { src: tenant.logoDataUrl, alt: '', style: { width: '100%', height: '100%', objectFit: 'cover' } }));
  }
  return el('div', { class: 'logo' }, (fallbackName || 'P').slice(0, 1));
}

function logout() {
  setSession(null);
  location.hash = '#/login';
}

/* ---------- Router ---------- */
export function navigate(path) { location.hash = `#/${path}`; }

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [portalId, route, ...rest] = raw.split('/');
  return { portalId: portalId || '', route: route || '', params: rest };
}

function render() {
  applyDir();
  applyBranding();
  const { portalId, route, params } = parseHash();

  if (!session) {
    if (portalId !== 'login') { location.hash = '#/login'; return; }
    clear(app);
    renderAuth(app, {
      onLogin(user) {
        setSession(user);
        toast(`${t('auth.welcome')}, ${user.name}`, 'ok');
        navigate(ROLE_PORTAL[user.role]);
      },
    });
    return;
  }

  const expected = ROLE_PORTAL[session.role];
  if (!portalId || portalId === 'login' || portalId !== expected) {
    location.hash = `#/${expected}`;
    return;
  }

  const portal = PORTALS[portalId];
  const routeName = route || portal.defaultRoute;
  const ctx = {
    session,
    params,
    navigate,
    rerender: render,
    logout,
  };

  clear(app);
  if (portal.shell === 'mobile') renderMobileShell(portal, routeName, ctx);
  else renderSidebarShell(portal, routeName, ctx);
}

/* ---------- Shell web (sidebar) ---------- */
function renderSidebarShell(portal, routeName, ctx) {
  const tenant = ctx.session.tenantId ? Store.get('tenants', ctx.session.tenantId) : null;
  const foundation = ctx.session.foundationId ? Store.get('foundations', ctx.session.foundationId) : null;
  const brandName = tenant?.name || foundation?.name || t('app.name');
  const content = el('div', { class: 'content' });

  const navItems = [];
  const sidebar = el('nav', { class: 'sidebar' },
    el('div', { class: 'brand' },
      brandLogo(tenant || foundation, brandName),
      el('div', {},
        el('div', { class: 'name' }, brandName),
        el('div', { class: 'sub' }, (tenant || foundation) ? t('app.name') : t('app.tagline')),
      ),
    ),
    portal.navGroups.map((group) => [
      group.label ? el('div', { class: 'nav-group-label' }, t(group.label)) : null,
      group.items.map((item) => {
        const node = el('div', {
          class: `nav-item ${item.route === routeName ? 'active' : ''}`,
          onclick: () => { document.body.classList.remove('sidebar-open'); navigate(`${portal.id}/${item.route}`); },
        }, el('span', { class: 'ico' }, item.icon), el('span', {}, t(item.label)));
        navItems.push(node);
        return node;
      }),
    ]),
    el('div', { class: 'spacer' }),
    el('div', {
      class: `nav-item ${routeName === 'settings' ? 'active' : ''}`,
      onclick: () => navigate(`${portal.id}/settings`),
    }, el('span', { class: 'ico' }, '⚙️'), el('span', {}, t('nav.settings'))),
    el('div', { class: 'nav-item', onclick: ctx.logout },
      el('span', { class: 'ico' }, '🚪'), el('span', {}, t('common.logout'))),
  );

  const scrim = el('div', { class: 'sidebar-scrim', onclick: () => document.body.classList.remove('sidebar-open') });

  const topbar = el('div', { class: 'topbar' },
    el('button', { class: 'hamburger', 'aria-label': 'Menu', onclick: () => document.body.classList.toggle('sidebar-open') }, '☰'),
    el('div', { class: 'title' }, t(findNavLabel(portal, routeName))),
    el('div', { class: 'grow' }),
    el('div', { class: 'searchbox' }, '🔎', el('input', { placeholder: t('common.search'), 'aria-label': t('common.search') })),
    notifBell(ctx),
    el('div', { class: 'row', style: { gap: '10px' } },
      avatar(ctx.session.name),
    ),
  );

  app.append(el('div', { class: 'shell' },
    sidebar,
    el('div', { class: 'main' }, topbar, content),
  ), scrim, offlineBadge());

  renderRoute(portal, routeName, content, ctx);
}

/* ---------- Shell mobile (bottom nav) ---------- */
function renderMobileShell(portal, routeName, ctx) {
  const tenant = ctx.session.tenantId ? Store.get('tenants', ctx.session.tenantId) : null;
  const content = el('div', { class: 'm-content' });
  const headerHost = el('div', { class: 'm-header' });

  // Portal dapat mengisi header sendiri via ctx.setHeader(), default: judul + avatar
  ctx.setHeader = (node) => { clear(headerHost); headerHost.append(node); };
  ctx.setHeader(el('div', { class: 'row between' },
    el('div', {},
      el('div', { class: 'xs muted' }, tenant?.name || t('app.name')),
      el('div', { style: { fontWeight: 700, fontSize: '1.05rem' } }, t(findNavLabel(portal, routeName))),
    ),
    el('div', { class: 'row', style: { gap: '10px' } }, notifBell(ctx), avatar(ctx.session.name)),
  ));

  const navBar = el('div', { class: 'bottom-nav' },
    portal.navGroups.flatMap((g) => g.items).map((item) =>
      el('button', {
        class: `tab ${item.route === routeName ? 'active' : ''}`,
        onclick: () => navigate(`${portal.id}/${item.route}`),
      },
        el('span', { class: 'ico' }, item.icon),
        el('span', {}, t(item.label)),
      )),
  );

  app.append(el('div', { class: 'shell-mobile' }, headerHost, content, navBar), offlineBadge());
  renderRoute(portal, routeName, content, ctx);
}

function renderRoute(portal, routeName, content, ctx) {
  if (routeName === 'settings') { renderSettings(content, ctx); return; }
  const fn = portal.routes[routeName] || portal.routes[portal.defaultRoute];
  try {
    fn(content, ctx);
  } catch (err) {
    console.error(err);
    content.append(el('div', { class: 'panel' },
      el('h3', {}, '⚠️ Error'),
      el('p', { class: 'muted small mono' }, String(err)),
    ));
  }
}

function findNavLabel(portal, routeName) {
  if (routeName === 'settings') return 'nav.settings';
  for (const g of portal.navGroups) {
    const item = g.items.find((i) => i.route === routeName);
    if (item) return item.label;
  }
  return 'nav.dashboard';
}

/* ---------- Notifikasi bell ---------- */
function notifBell(ctx) {
  const user = Store.get('users', ctx.session.userId);
  const items = user ? Store.notificationsFor(user).slice(0, 8) : [];
  const unread = items.filter((n) => !n.read).length;
  const btn = el('button', {
    class: 'btn ghost sm', style: { position: 'relative', fontSize: '17px' },
    'aria-label': 'Notifikasi',
    onclick: () => {
      import('./core/ui.js').then(({ drawer, timeline, fmtDate }) => {
        drawer({
          title: '🔔 Notifikasi',
          body: timeline(items.map((n) => ({
            when: new Date(n.at).toLocaleString(), what: n.title, detail: n.body, tone: n.kind === 'ok' ? 'ok' : n.kind === 'warn' ? 'warn' : '',
          }))),
        });
        items.forEach((n) => Store.update('notifications', n.id, { read: true }));
      });
    },
  }, '🔔');
  if (unread) {
    btn.append(el('span', {
      style: {
        position: 'absolute', top: '-2px', insetInlineEnd: '-2px',
        background: 'var(--danger)', color: '#fff', borderRadius: '999px',
        fontSize: '10px', minWidth: '16px', height: '16px', display: 'grid', placeItems: 'center', fontWeight: 700,
      },
    }, unread));
  }
  return btn;
}

/* ---------- Offline indicator ---------- */
function offlineBadge() {
  return el('div', { class: 'offline-badge' }, `📴 ${t('common.offline')}`);
}
function updateOnline() {
  document.body.classList.toggle('is-offline', !navigator.onLine);
  if (navigator.onLine) {
    const flushed = Store.flushDrafts((d) => {
      if (d.type === 'attendance') Store.insert('attendanceSessions', d.payload);
      else if (d.type === 'memorization') Store.insert('memorizationRecords', d.payload);
      else if (d.type === 'grade') Store.insert('gradeEntries', d.payload);
      else if (d.type === 'behavior') Store.insert('behaviorEvents', d.payload);
    });
    if (flushed > 0) toast(`✅ ${flushed} draf offline tersinkron`, 'ok');
  }
}
window.addEventListener('online', updateOnline);
window.addEventListener('offline', updateOnline);

/* ---------- Boot ---------- */
applyPrefs();
window.matchMedia?.('(prefers-color-scheme: light)').addEventListener?.('change', applyPrefs);
Store.load();
onLangChange(() => render());
window.addEventListener('hashchange', render);
updateOnline();
render();

/* Service worker (PWA) */
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
