/* ============================================================
   rbac.js — otorisasi 3 lapis:
   1) role (super_admin / tenant_admin / teacher / guardian)
   2) scope tenant (query difilter tenant_id dari token)
   3) resource rule (guru hanya unit yang diampu; wali hanya anaknya)
   ============================================================ */
import { list, get } from './db.js';

export const PERMISSIONS = {
  super_admin: [
    'tenants.read', 'tenants.manage',
    'saas.invoices.read', 'saas.invoices.generate',
    'students.read', 'bills.read',
  ],
  tenant_admin: [
    'students.read', 'students.write',
    'attendance.read', 'memorization.read', 'grades.read', 'behavior.read',
    'bills.read', 'bills.generate', 'payments.checkout',
  ],
  teacher: [
    'students.read',
    'attendance.read', 'attendance.write',
    'memorization.read', 'memorization.write',
    'grades.read', 'grades.write',
    'behavior.read', 'behavior.write',
  ],
  guardian: [
    'students.read',
    'attendance.read', 'memorization.read', 'grades.read', 'behavior.read',
    'bills.read', 'payments.checkout',
  ],
};

export function permissionsOf(user) {
  return PERMISSIONS[user.role] || [];
}

/* ---------- Guru: unit yang diampu ---------- */
export function unitsOf(teacher) {
  const cls = (teacher.classIds || []).map((id) => {
    const c = get('classes', id);
    return c ? { ...c, unitType: 'class' } : null;
  });
  const hlq = (teacher.halaqahIds || []).map((id) => {
    const h = get('halaqahs', id);
    return h ? { ...h, unitType: 'halaqah' } : null;
  });
  return [...cls, ...hlq].filter(Boolean);
}

export function teacherOwnsUnit(teacher, unitType, unitId) {
  if (unitType === 'class') return (teacher.classIds || []).includes(unitId);
  if (unitType === 'halaqah') return (teacher.halaqahIds || []).includes(unitId);
  return false;
}

export function teacherOwnsHalaqah(teacher, halaqahId) {
  return (teacher.halaqahIds || []).includes(halaqahId);
}

export function teacherTeaches(teacher, { subjectId, classId }) {
  if (subjectId && (teacher.subjectIds || []).includes(subjectId)) return true;
  if (classId && (teacher.classIds || []).includes(classId)) return true;
  return false;
}

/* ---------- Wali: anak yang terhubung ---------- */
export function childIdsOf(guardian) {
  return guardian.childIds || [];
}

export function guardianOwnsStudent(guardian, studentId) {
  return childIdsOf(guardian).includes(studentId);
}

/* ---------- Siswa yang terlihat sesuai role ---------- */
export function visibleStudents(user) {
  switch (user.role) {
    case 'super_admin':
      return list('students');
    case 'tenant_admin':
      return list('students', (s) => s.tenantId === user.tenantId);
    case 'teacher': {
      const clsIds = user.classIds || [];
      const hlqIds = user.halaqahIds || [];
      return list('students', (s) =>
        s.tenantId === user.tenantId &&
        (clsIds.includes(s.classId) || hlqIds.includes(s.halaqahId)));
    }
    case 'guardian':
      return childIdsOf(user).map((id) => get('students', id)).filter(Boolean);
    default:
      return [];
  }
}

export function visibleStudentIds(user) {
  return new Set(visibleStudents(user).map((s) => s.id));
}

/* ---------- Context untuk respons login / me ---------- */
export function contextOf(user) {
  const tenant = user.tenantId ? get('tenants', user.tenantId) : null;
  const ctx = { tenant: tenant ? { id: tenant.id, name: tenant.name, type: tenant.type, modules: tenant.modules, accentColor: tenant.accentColor } : null };
  if (user.role === 'teacher') {
    ctx.units = unitsOf(user).map((u) => ({ id: u.id, name: u.name, unitType: u.unitType }));
  }
  if (user.role === 'guardian') {
    ctx.children = childIdsOf(user)
      .map((id) => get('students', id))
      .filter(Boolean)
      .map((s) => ({ id: s.id, name: s.name, nis: s.nis, classId: s.classId, halaqahId: s.halaqahId }));
  }
  return ctx;
}

/* Bersihkan field sensitif user sebelum dikirim ke klien. */
export function publicUser(user) {
  const { passwordHash, passwordSalt, password, ...rest } = user;
  return rest;
}
