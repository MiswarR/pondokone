/* Pembayaran: checkout membuat payment pending; status final HANYA
   lewat webhook gateway (verifikasi signature HMAC). */
import crypto from 'node:crypto';
import { list, get, insert, update, notify } from '../lib/db.js';
import { getSecret } from '../lib/jwt.js';
import { guardianOwnsStudent } from '../lib/rbac.js';
import { send, err, sendError } from '../lib/router.js';

export function webhookSignature(reference, status) {
  return crypto.createHmac('sha256', getSecret()).update(`${reference}${status}`).digest('hex');
}

export default function register(router) {
  router.post('/v1/payments/checkout', { auth: true, roles: ['guardian', 'tenant_admin'] }, (req, res, ctx) => {
    const { billId, method, amount } = ctx.body || {};
    if (!billId || !method || amount === undefined || amount === null) {
      return err.validation(res, 'billId, method, amount wajib diisi');
    }
    if (typeof amount !== 'number' || amount <= 0) return err.validation(res, 'amount harus angka > 0');
    const bill = get('bills', billId);
    if (!bill || bill.tenantId !== ctx.user.tenantId) return err.notFound(res, 'Tagihan tidak ditemukan');
    // Resource rule: wali hanya boleh membayar tagihan anaknya sendiri.
    if (ctx.user.role === 'guardian' && !guardianOwnsStudent(ctx.user, bill.studentId)) {
      return err.forbidden(res, 'Tagihan ini bukan milik anak Anda');
    }
    if (bill.status === 'paid') return err.validation(res, 'Tagihan sudah lunas');

    const payment = insert('payments', {
      tenantId: bill.tenantId,
      billId: bill.id,
      studentId: bill.studentId,
      guardianId: ctx.user.role === 'guardian' ? ctx.user.id : null,
      method,
      amount,
      reference: `PAY-${Date.now().toString().slice(-8)}-${crypto.randomBytes(2).toString('hex')}`,
      status: 'pending',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    }, ctx.user.id);
    update('bills', bill.id, { status: 'pending' }, ctx.user.id);
    send(res, 201, payment);
  });

  /* SATU-SATUNYA jalur finalisasi status pembayaran. Tanpa JWT — diverifikasi signature. */
  router.post('/v1/webhooks/payment-gateway', (req, res, ctx) => {
    const { reference, status, signature } = ctx.body || {};
    if (!reference || !status || !signature) {
      return err.validation(res, 'reference, status, signature wajib diisi');
    }
    if (!['paid', 'failed'].includes(status)) return err.validation(res, "status harus 'paid' atau 'failed'");

    const expected = webhookSignature(reference, status);
    const a = Buffer.from(String(signature));
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return sendError(res, 401, 'invalid_signature', 'Signature webhook tidak valid');
    }

    const payment = list('payments', (p) => p.reference === reference)[0];
    if (!payment) return err.notFound(res, 'Payment dengan reference itu tidak ditemukan');
    if (payment.status !== 'pending') {
      return send(res, 200, { ok: true, idempotent: true, payment });
    }

    const now = new Date().toISOString();
    const updatedPayment = update('payments', payment.id, {
      status, paidAt: status === 'paid' ? now : null,
    }, 'gateway');

    const bill = get('bills', payment.billId);
    let receipt = null;
    if (bill && status === 'paid') {
      const paidAmount = (bill.paidAmount || 0) + payment.amount;
      const billStatus = paidAmount >= bill.amount ? 'paid' : 'partial';
      update('bills', bill.id, { paidAmount, status: billStatus }, 'gateway');
      receipt = insert('receipts', {
        tenantId: bill.tenantId,
        paymentId: payment.id,
        billId: bill.id,
        studentId: bill.studentId,
        number: `RCP-${Date.now().toString().slice(-8)}`,
        amount: payment.amount,
        method: payment.method,
        paidAt: now,
      }, 'gateway');
      const student = get('students', bill.studentId);
      (student?.guardianIds || []).forEach((gid) =>
        notify(bill.tenantId, gid, 'Pembayaran berhasil', `${bill.name} ${bill.period} — pembayaran diterima.`, 'ok'));
    } else if (bill && status === 'failed') {
      update('bills', bill.id, { status: (bill.paidAmount || 0) > 0 ? 'partial' : 'unpaid' }, 'gateway');
      const student = get('students', bill.studentId);
      (student?.guardianIds || []).forEach((gid) =>
        notify(bill.tenantId, gid, 'Pembayaran gagal', `${bill.name} ${bill.period} — silakan coba lagi.`, 'warn'));
    }
    send(res, 200, { ok: true, payment: updatedPayment, receipt });
  });
}
