/* Absensi: guru hanya unit yang diampu; idempotent per unit+date+session (replace). */
import { list, insert, update } from '../lib/db.js';
import { teacherOwnsUnit, teacherOwnsHalaqah, childIdsOf } from '../lib/rbac.js';
import { send, err } from '../lib/router.js';

const VALID_STATUS = new Set(['hadir', 'izin', 'sakit', 'alfa', 'terlambat']);

export default function register(router) {
  router.post('/v1/attendance/sessions', { auth: true, roles: ['teacher'] }, (req, res, ctx) => {
    const b = ctx.body || {};
    const { unitType, unitId, date, session, records } = b;
    if (!unitType || !unitId || !date || !session || !Array.isArray(records)) {
      return err.validation(res, 'unitType, unitId, date, session, records[] wajib diisi');
    }
    if (!['class', 'halaqah'].includes(unitType)) return err.validation(res, 'unitType harus class atau halaqah');
    for (const r of records) {
      if (!r.studentId || !VALID_STATUS.has(r.status)) {
        return err.validation(res, 'Setiap record butuh studentId dan status valid (hadir/izin/sakit/alfa/terlambat)');
      }
    }
    // Resource rule: guru hanya boleh menulis absensi unit yang diampunya.
    if (!teacherOwnsUnit(ctx.user, unitType, unitId)) {
      return err.forbidden(res, 'Anda tidak mengampu unit ini');
    }
    const cleanRecords = records.map((r) => ({ studentId: r.studentId, status: r.status, note: r.note || '' }));
    // Idempotent: satu sesi per unit+date+session — replace jika sudah ada.
    const existing = list('attendanceSessions', (a) =>
      a.tenantId === ctx.user.tenantId && a.unitId === unitId && a.date === date && a.session === session)[0];
    if (existing) {
      const rec = update('attendanceSessions', existing.id, {
        unitType, teacherId: ctx.user.id, records: cleanRecords,
      }, ctx.user.id);
      return send(res, 200, { ...rec, replaced: true });
    }
    const rec = insert('attendanceSessions', {
      tenantId: ctx.user.tenantId, unitType, unitId, date, session,
      teacherId: ctx.user.id, records: cleanRecords,
    }, ctx.user.id);
    send(res, 201, rec);
  });

  router.get('/v1/attendance/sessions', { auth: true }, (req, res, ctx) => {
    const { date, unitId } = ctx.query;
    const user = ctx.user;
    let sessions = list('attendanceSessions', (a) =>
      (user.role === 'super_admin' || a.tenantId === user.tenantId) &&
      (!date || a.date === date) &&
      (!unitId || a.unitId === unitId));

    if (user.role === 'teacher') {
      sessions = sessions.filter((a) =>
        teacherOwnsUnit(user, 'class', a.unitId) || teacherOwnsHalaqah(user, a.unitId));
    } else if (user.role === 'guardian') {
      const kids = new Set(childIdsOf(user));
      sessions = sessions
        .map((a) => ({ ...a, records: (a.records || []).filter((r) => kids.has(r.studentId)) }))
        .filter((a) => a.records.length > 0);
    }
    send(res, 200, { data: sessions });
  });
}
