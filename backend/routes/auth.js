/* Auth: login, refresh, me, tenants/current */
import { list, get } from '../lib/db.js';
import { sign, verify, getSecret, ACCESS_TTL, REFRESH_TTL } from '../lib/jwt.js';
import { hashPassword } from '../seed.js';
import { permissionsOf, contextOf, publicUser } from '../lib/rbac.js';
import { send, err } from '../lib/router.js';

function issueAccess(user) {
  return sign({ sub: user.id, role: user.role, tenantId: user.tenantId || null, typ: 'access' }, getSecret(), ACCESS_TTL);
}

export default function register(router) {
  router.post('/v1/auth/login', (req, res, ctx) => {
    const { identifier, password } = ctx.body || {};
    if (!identifier || !password) return err.validation(res, 'identifier dan password wajib diisi');
    const user = list('users').find(
      (u) => (u.identifier === identifier || u.email === identifier || u.phone === identifier) && u.status !== 'inactive'
    );
    if (!user || hashPassword(password, user.passwordSalt) !== user.passwordHash) {
      return err.unauthorized(res, 'Identifier atau password salah');
    }
    const refreshToken = sign({ sub: user.id, typ: 'refresh' }, getSecret(), REFRESH_TTL);
    send(res, 200, {
      accessToken: issueAccess(user),
      refreshToken,
      user: { id: user.id, name: user.name, role: user.role, tenantId: user.tenantId || null },
      permissions: permissionsOf(user),
      context: contextOf(user),
    });
  });

  router.post('/v1/auth/refresh', (req, res, ctx) => {
    const { refreshToken } = ctx.body || {};
    if (!refreshToken) return err.validation(res, 'refreshToken wajib diisi');
    const payload = verify(refreshToken, getSecret());
    if (!payload || payload.typ !== 'refresh') return err.unauthorized(res, 'Refresh token tidak valid atau kedaluwarsa');
    const user = get('users', payload.sub);
    if (!user || user.status === 'inactive') return err.unauthorized(res, 'User tidak aktif');
    send(res, 200, { accessToken: issueAccess(user) });
  });

  router.get('/v1/me', { auth: true }, (req, res, ctx) => {
    const user = ctx.user;
    send(res, 200, {
      user: publicUser(user),
      permissions: permissionsOf(user),
      context: contextOf(user),
    });
  });

  router.get('/v1/tenants/current', { auth: true }, (req, res, ctx) => {
    if (!ctx.user.tenantId) return err.notFound(res, 'User ini tidak terikat ke tenant');
    const tenant = get('tenants', ctx.user.tenantId);
    if (!tenant) return err.notFound(res, 'Tenant tidak ditemukan');
    send(res, 200, tenant);
  });
}
