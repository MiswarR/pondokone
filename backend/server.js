/* ============================================================
   PondokOne API server — Node 20, tanpa dependensi eksternal.
   - REST /v1 sesuai kontrak spesifikasi (JWT + RBAC 3 lapis)
   - Static file server untuk ../web (frontend PWA)
   - CORS terbuka untuk pengembangan
   Jalankan: node server.js   (PORT env, default 3000)
   ============================================================ */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Router, send, err } from './lib/router.js';
import { verify, getSecret } from './lib/jwt.js';
import { get as dbGet, load } from './lib/db.js';

import registerAuth from './routes/auth.js';
import registerStudents from './routes/students.js';
import registerAttendance from './routes/attendance.js';
import registerMemorization from './routes/memorization.js';
import registerGrades from './routes/grades.js';
import registerBehavior from './routes/behavior.js';
import registerBills from './routes/bills.js';
import registerPayments from './routes/payments.js';
import registerSaas from './routes/saas.js';

const PORT = Number(process.env.PORT || 3000);
const WEB_DIR = fileURLToPath(new URL('../web', import.meta.url));

const router = new Router();
router.get('/v1/health', (req, res) => send(res, 200, { ok: true, at: new Date().toISOString() }));
for (const register of [
  registerAuth, registerStudents, registerAttendance, registerMemorization,
  registerGrades, registerBehavior, registerBills, registerPayments, registerSaas,
]) register(router);

/* ---------- util ---------- */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > 2 * 1024 * 1024) { reject(new Error('payload too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve(null);
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { resolve(null); }
    });
    req.on('error', reject);
  });
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
};

function serveStatic(pathname, res) {
  let rel = decodeURIComponent(pathname);
  if (rel === '/' || rel === '') rel = '/index.html';
  const filePath = path.normalize(path.join(WEB_DIR, rel));
  if (!filePath.startsWith(path.normalize(WEB_DIR))) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.readFile(filePath, (e, data) => {
    if (e) {
      // SPA fallback: rute hash tidak sampai server, tapi jaga-jaga 404 → index
      if (!path.extname(filePath)) {
        fs.readFile(path.join(WEB_DIR, 'index.html'), (e2, idx) => {
          if (e2) { res.writeHead(404); res.end('Not found'); return; }
          res.writeHead(200, { 'Content-Type': MIME['.html'] });
          res.end(idx);
        });
        return;
      }
      res.writeHead(404); res.end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}

/* ---------- server ---------- */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (!url.pathname.startsWith('/v1/')) {
    if (req.method !== 'GET') { res.writeHead(405); res.end(); return; }
    serveStatic(url.pathname, res);
    return;
  }

  const matched = router.match(req.method, url.pathname);
  if (!matched) return err.notFound(res, `Endpoint ${url.pathname} tidak ditemukan`);
  if (matched.methodMismatch) return err.notFound(res, `Method ${req.method} tidak didukung untuk ${url.pathname}`);

  const { route, params } = matched;
  const ctx = {
    params,
    query: Object.fromEntries(url.searchParams.entries()),
    body: await readBody(req).catch(() => null),
    user: null,
  };

  // Lapis 1-2: auth + role; lapis 3 (resource rule) ditegakkan di tiap handler.
  if (route.opts.auth) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    const payload = token ? verify(token, getSecret()) : null;
    if (!payload || payload.typ !== 'access') return err.unauthorized(res);
    const user = dbGet('users', payload.sub);
    if (!user || user.status === 'inactive') return err.unauthorized(res, 'User tidak aktif');
    ctx.user = user;
    if (route.opts.roles && !route.opts.roles.includes(user.role)) {
      return err.forbidden(res, `Role ${user.role} tidak diizinkan mengakses endpoint ini`);
    }
  }

  try {
    await route.handler(req, res, ctx);
  } catch (e) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${url.pathname} →`, e);
    if (!res.headersSent) send(res, 500, { error: { code: 'internal', message: 'Terjadi kesalahan internal' } });
  }
});

load(); // pastikan seed dibangun sebelum menerima request
server.listen(PORT, () => {
  console.log(`PondokOne API + frontend siap di http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/v1/health`);
});
