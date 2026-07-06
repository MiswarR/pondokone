/* Nilai: guru hanya mapel/kelas yang diampu (body boleh array untuk batch);
   wali hanya melihat nilai anaknya yang sudah published. */
import { list, get, insert } from '../lib/db.js';
import { teacherTeaches, guardianOwnsStudent } from '../lib/rbac.js';
import { send, err } from '../lib/router.js';

export default function register(router) {
  router.post('/v1/grade-entries', { auth: true, roles: ['teacher'] }, (req, res, ctx) => {
    const entries = Array.isArray(ctx.body) ? ctx.body : [ctx.body || {}];
    if (!entries.length) return err.validation(res, 'Body kosong');

    // Validasi seluruh batch dulu — semua-atau-tidak-sama-sekali.
    for (const e of entries) {
      if (!e.studentId || !e.subjectId || !e.componentId || e.score === undefined || e.score === null) {
        return err.validation(res, 'Setiap entri butuh studentId, subjectId, componentId, score');
      }
      if (typeof e.score !== 'number' || e.score < 0 || e.score > 100) {
        return err.validation(res, 'score harus angka 0–100');
      }
      const student = get('students', e.studentId);
      if (!student || student.tenantId !== ctx.user.tenantId) {
        return err.notFound(res, `Siswa ${e.studentId} tidak ditemukan`);
      }
      const classId = e.classId || student.classId;
      if (!teacherTeaches(ctx.user, { subjectId: e.subjectId, classId })) {
        return err.forbidden(res, `Anda tidak mengampu mapel/kelas untuk siswa ${e.studentId}`);
      }
    }

    const created = entries.map((e) => {
      const student = get('students', e.studentId);
      return insert('gradeEntries', {
        tenantId: ctx.user.tenantId,
        studentId: e.studentId,
        subjectId: e.subjectId,
        componentId: e.componentId,
        classId: e.classId || student.classId,
        teacherId: ctx.user.id,
        date: e.date || new Date().toISOString().slice(0, 10),
        score: e.score,
        note: e.note || '',
        published: e.published !== undefined ? !!e.published : true,
      }, ctx.user.id);
    });
    send(res, 201, { data: created, count: created.length });
  });

  router.get('/v1/grade-entries', { auth: true }, (req, res, ctx) => {
    const { studentId, classId } = ctx.query;
    const user = ctx.user;
    if (user.role === 'guardian' && studentId && !guardianOwnsStudent(user, studentId)) {
      return err.forbidden(res, 'Siswa ini bukan anak Anda');
    }
    let entries = list('gradeEntries', (g) =>
      (user.role === 'super_admin' || g.tenantId === user.tenantId) &&
      (!studentId || g.studentId === studentId) &&
      (!classId || g.classId === classId));
    if (user.role === 'teacher') {
      entries = entries.filter((g) => teacherTeaches(user, { subjectId: g.subjectId, classId: g.classId }));
    } else if (user.role === 'guardian') {
      entries = entries.filter((g) => guardianOwnsStudent(user, g.studentId) && g.published === true);
    }
    send(res, 200, { data: entries });
  });
}
