/* Tagihan: generate massal per siswa (tenant_admin), list sesuai scope. */
import { list, get, insert } from '../lib/db.js';
import { childIdsOf } from '../lib/rbac.js';
import { send, err } from '../lib/router.js';

export default function register(router) {
  router.post('/v1/bills/generate', { auth: true, roles: ['tenant_admin'] }, (req, res, ctx) => {
    const b = ctx.body || {};
    const { productId, period, targetClassIds, all, amountOverride, dueDate, note } = b;
    if (!productId || !period || !dueDate) {
      return err.validation(res, 'productId, period, dueDate wajib diisi');
    }
    if (!all && (!Array.isArray(targetClassIds) || targetClassIds.length === 0)) {
      return err.validation(res, 'Isi targetClassIds[] atau all:true');
    }
    const product = get('billProducts', productId);
    if (!product || product.tenantId !== ctx.user.tenantId) return err.notFound(res, 'Produk tagihan tidak ditemukan');
    const amount = amountOverride ?? product.amount;
    if (typeof amount !== 'number' || amount <= 0) return err.validation(res, 'amountOverride harus angka > 0');

    const targets = list('students', (s) =>
      s.tenantId === ctx.user.tenantId && s.status === 'active' &&
      (all ? true : targetClassIds.includes(s.classId)));

    const created = [];
    let skipped = 0;
    for (const s of targets) {
      // Skip duplikat: satu tagihan per siswa+produk+periode.
      const dup = list('bills', (x) =>
        x.tenantId === ctx.user.tenantId && x.studentId === s.id &&
        x.productId === productId && x.period === period)[0];
      if (dup) { skipped += 1; continue; }
      created.push(insert('bills', {
        tenantId: ctx.user.tenantId,
        studentId: s.id,
        productId,
        name: product.name,
        period,
        amount,
        paidAmount: 0,
        dueDate,
        status: 'unpaid',
        note: note || '',
      }, ctx.user.id));
    }
    send(res, 201, { created: created.length, skipped, bills: created });
  });

  router.get('/v1/bills', { auth: true, roles: ['super_admin', 'tenant_admin', 'guardian'] }, (req, res, ctx) => {
    const { status, studentId } = ctx.query;
    const user = ctx.user;
    if (user.role === 'guardian' && studentId && !childIdsOf(user).includes(studentId)) {
      return err.forbidden(res, 'Siswa ini bukan anak Anda');
    }
    let bills = list('bills', (b) =>
      (user.role === 'super_admin' || b.tenantId === user.tenantId) &&
      (!status || b.status === status) &&
      (!studentId || b.studentId === studentId));
    if (user.role === 'guardian') {
      const kids = new Set(childIdsOf(user));
      bills = bills.filter((b) => kids.has(b.studentId));
    }
    send(res, 200, { data: bills });
  });
}
