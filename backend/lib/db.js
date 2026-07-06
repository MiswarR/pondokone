/* ============================================================
   db.js — storage file JSON (backend/data/db.json).
   Dibuat otomatis dari seed saat pertama jalan.
   Semua mutasi lewat insert/update agar audit log konsisten.
   ============================================================ */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildSeed } from '../seed.js';

const DATA_DIR = fileURLToPath(new URL('../data', import.meta.url));
const DB_FILE = fileURLToPath(new URL('../data/db.json', import.meta.url));

let db = null;
let idCounter = 1000;

export function uid(prefix = 'id') {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter}`;
}

export function load() {
  if (db) return db;
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    return db;
  } catch { /* belum ada / korup — bangun dari seed */ }
  db = buildSeed();
  save();
  return db;
}

export function save() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

/* Koleksi yang setiap mutasinya dicatat di audit log (edit sensitif). */
const AUDITED = new Set([
  'gradeEntries', 'behaviorEvents', 'bills', 'payments', 'receipts',
  'saasInvoices', 'tenants', 'students', 'users', 'attendanceSessions',
  'memorizationRecords',
]);

export function list(name, filterFn) {
  const col = load()[name] || [];
  return filterFn ? col.filter(filterFn) : [...col];
}

export function get(name, id) {
  return (load()[name] || []).find((x) => x.id === id) || null;
}

export function insert(name, obj, actor) {
  load();
  if (!db[name]) db[name] = [];
  const rec = { id: obj.id || uid(name.slice(0, 3)), createdAt: new Date().toISOString(), ...obj };
  db[name].push(rec);
  if (AUDITED.has(name)) audit(actor, 'create', name, rec.id, null, rec);
  save();
  return rec;
}

export function update(name, id, patch, actor) {
  load();
  const idx = (db[name] || []).findIndex((x) => x.id === id);
  if (idx < 0) return null;
  const before = { ...db[name][idx] };
  db[name][idx] = { ...before, ...patch, updatedAt: new Date().toISOString() };
  if (AUDITED.has(name)) audit(actor, 'update', name, id, before, db[name][idx]);
  save();
  return db[name][idx];
}

export function audit(actor, action, entity, entityId, before, after) {
  load();
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift({
    id: uid('aud'),
    at: new Date().toISOString(),
    actor: actor || 'system',
    action, entity, entityId,
    before: before ? JSON.stringify(before).slice(0, 400) : null,
    after: after ? JSON.stringify(after).slice(0, 400) : null,
  });
  if (db.auditLogs.length > 1000) db.auditLogs.length = 1000;
  save();
}

export function notify(tenantId, target, title, body, kind = 'info') {
  return insert('notifications', { tenantId, target, title, body, kind, read: false, at: new Date().toISOString() });
}
