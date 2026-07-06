/* Hafalan: guru hanya halaqah yang diampu; wali hanya anaknya. */
import { list, get, insert } from '../lib/db.js';
import { teacherOwnsHalaqah, guardianOwnsStudent } from '../lib/rbac.js';
import { send, err } from '../lib/router.js';

export default function register(router) {
  router.post('/v1/memorization-records', { auth: true, roles: ['teacher'] }, (req, res, ctx) => {
    const b = ctx.body || {};
    if (!b.studentId || !b.halaqahId || !b.date || !b.material || !b.result) {
      return err.validation(res, 'studentId, halaqahId, date, material, result wajib diisi');
    }
    if (!teacherOwnsHalaqah(ctx.user, b.halaqahId)) {
      return err.forbidden(res, 'Anda tidak mengampu halaqah ini');
    }
    const student = get('students', b.studentId);
    if (!student || student.tenantId !== ctx.user.tenantId) return err.notFound(res, 'Siswa tidak ditemukan');
    const rec = insert('memorizationRecords', {
      tenantId: ctx.user.tenantId,
      studentId: b.studentId,
      halaqahId: b.halaqahId,
      teacherId: ctx.user.id,
      date: b.date,
      type: b.type || 'quran',
      material: b.material,
      fromAyah: b.fromAyah ?? null,
      toAyah: b.toAyah ?? null,
      result: b.result,
      score: b.score ?? null,
      note: b.note || '',
    }, ctx.user.id);
    send(res, 201, rec);
  });

  router.get('/v1/memorization-records', { auth: true }, (req, res, ctx) => {
    const { studentId } = ctx.query;
    const user = ctx.user;
    if (user.role === 'guardian' && studentId && !guardianOwnsStudent(user, studentId)) {
      return err.forbidden(res, 'Siswa ini bukan anak Anda');
    }
    let records = list('memorizationRecords', (m) =>
      (user.role === 'super_admin' || m.tenantId === user.tenantId) &&
      (!studentId || m.studentId === studentId));
    if (user.role === 'teacher') {
      records = records.filter((m) => teacherOwnsHalaqah(user, m.halaqahId));
    } else if (user.role === 'guardian') {
      records = records.filter((m) => guardianOwnsStudent(user, m.studentId));
    }
    send(res, 200, { data: records });
  });
}
