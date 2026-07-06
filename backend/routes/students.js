/* Students: list sesuai scope, create oleh tenant_admin (+audit) */
import { insert } from '../lib/db.js';
import { visibleStudents } from '../lib/rbac.js';
import { send, err } from '../lib/router.js';

export default function register(router) {
  router.get('/v1/students', { auth: true }, (req, res, ctx) => {
    let students = visibleStudents(ctx.user);
    const { classId, q } = ctx.query;
    if (classId) students = students.filter((s) => s.classId === classId);
    if (q) {
      const needle = q.toLowerCase();
      students = students.filter((s) =>
        (s.name || '').toLowerCase().includes(needle) || (s.nis || '').includes(needle));
    }
    send(res, 200, { data: students });
  });

  router.post('/v1/students', { auth: true, roles: ['tenant_admin'] }, (req, res, ctx) => {
    const b = ctx.body || {};
    if (!b.name || !b.gender) return err.validation(res, 'name dan gender wajib diisi');
    const rec = insert('students', {
      tenantId: ctx.user.tenantId,
      nis: b.nis || `NIS-${Date.now().toString().slice(-6)}`,
      name: b.name,
      gender: b.gender,
      classId: b.classId || null,
      halaqahId: b.halaqahId || null,
      roomId: b.roomId || null,
      guardianIds: Array.isArray(b.guardianIds) ? b.guardianIds : [],
      birthDate: b.birthDate || null,
      status: 'active',
    }, ctx.user.id); // students termasuk koleksi ber-audit
    send(res, 201, rec);
  });
}
