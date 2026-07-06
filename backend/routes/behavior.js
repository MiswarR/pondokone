/* Perilaku: catat oleh guru; wali hanya melihat anaknya. */
import { list, get, insert, notify } from '../lib/db.js';
import { guardianOwnsStudent } from '../lib/rbac.js';
import { send, err } from '../lib/router.js';

export default function register(router) {
  router.post('/v1/behavior-events', { auth: true, roles: ['teacher'] }, (req, res, ctx) => {
    const b = ctx.body || {};
    if (!b.studentId || !b.kind || !b.date) {
      return err.validation(res, 'studentId, kind, date wajib diisi');
    }
    if (!['violation', 'good'].includes(b.kind)) return err.validation(res, 'kind harus violation atau good');
    const student = get('students', b.studentId);
    if (!student || student.tenantId !== ctx.user.tenantId) return err.notFound(res, 'Siswa tidak ditemukan');
    let points = b.points ?? 0;
    if (b.ruleId) {
      const rule = get('behaviorRules', b.ruleId);
      if (!rule || rule.tenantId !== ctx.user.tenantId) return err.notFound(res, 'Aturan perilaku tidak ditemukan');
      if (b.points === undefined) points = rule.points;
    }
    const rec = insert('behaviorEvents', {
      tenantId: ctx.user.tenantId,
      studentId: b.studentId,
      teacherId: ctx.user.id,
      date: b.date,
      kind: b.kind,
      ruleId: b.ruleId || null,
      points,
      chronology: b.chronology || '',
      followUp: b.followUp || '',
      notifyGuardian: !!b.notifyGuardian,
      status: b.status || 'process',
    }, ctx.user.id);
    if (rec.notifyGuardian) {
      (student.guardianIds || []).forEach((gid) =>
        notify(ctx.user.tenantId, gid, 'Catatan perilaku baru',
          `${student.name}: ${rec.kind === 'good' ? 'catatan positif' : 'pelanggaran'} pada ${rec.date}.`,
          rec.kind === 'good' ? 'ok' : 'warn'));
    }
    send(res, 201, rec);
  });

  router.get('/v1/behavior-events', { auth: true }, (req, res, ctx) => {
    const { studentId } = ctx.query;
    const user = ctx.user;
    if (user.role === 'guardian' && studentId && !guardianOwnsStudent(user, studentId)) {
      return err.forbidden(res, 'Siswa ini bukan anak Anda');
    }
    let events = list('behaviorEvents', (e) =>
      (user.role === 'super_admin' || e.tenantId === user.tenantId) &&
      (!studentId || e.studentId === studentId));
    if (user.role === 'guardian') {
      events = events.filter((e) => guardianOwnsStudent(user, e.studentId));
    }
    send(res, 200, { data: events });
  });
}
