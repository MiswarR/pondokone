/* SaaS billing — invoice tenant (hanya super_admin / Web Master). */
import { list, get, insert, uid } from '../lib/db.js';
import { send, err } from '../lib/router.js';

export default function register(router) {
  router.get('/v1/saas/invoices', { auth: true, roles: ['super_admin'] }, (req, res, ctx) => {
    const { status } = ctx.query;
    let invoices = list('saasInvoices');
    if (status) invoices = invoices.filter((i) => i.status === status);
    send(res, 200, invoices);
  });

  router.post('/v1/saas/invoices/generate', { auth: true, roles: ['super_admin'] }, (req, res, ctx) => {
    const { tenantId, period } = ctx.body || {};
    if (!tenantId || !period) return err.validation(res, 'tenantId dan period wajib diisi');
    const tenant = get('tenants', tenantId);
    if (!tenant) return err.notFound(res, 'Tenant tidak ditemukan');
    const plan = get('plans', tenant.planId);
    if (!plan) return err.notFound(res, 'Plan tenant tidak ditemukan');

    const dup = list('saasInvoices', (i) => i.tenantId === tenantId && i.period === period)[0];
    if (dup) return err.validation(res, `Invoice periode ${period} untuk tenant ini sudah ada (${dup.number})`);

    const perStudentTotal = (plan.perStudent || 0) * (tenant.activeStudents || 0);
    const items = [
      { label: `${plan.name} base fee`, amount: plan.monthlyBase },
      ...(perStudentTotal > 0
        ? [{ label: `Per siswa aktif (${tenant.activeStudents} × ${plan.perStudent})`, amount: perStudentTotal }]
        : []),
    ];
    const due = new Date();
    due.setDate(due.getDate() + 14);
    const invoice = insert('saasInvoices', {
      id: uid('sin'),
      tenantId,
      number: `INV-SAAS-${Date.now().toString().slice(-8)}`,
      period,
      items,
      total: items.reduce((s, it) => s + it.amount, 0),
      status: 'draft',
      dueDate: due.toISOString().slice(0, 10),
      paidAt: null,
    }, ctx.user.id);
    send(res, 201, invoice);
  });
}
