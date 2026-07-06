/* ============================================================
   router.js — route matching sederhana (method + segmen + :param).
   Setiap route boleh membawa opsi { auth, roles } yang
   dievaluasi oleh server sebelum handler dipanggil.
   ============================================================ */
export class Router {
  constructor() {
    this.routes = [];
  }

  add(method, pattern, opts, handler) {
    if (typeof opts === 'function') {
      handler = opts;
      opts = {};
    }
    this.routes.push({
      method: method.toUpperCase(),
      segments: pattern.split('/').filter(Boolean),
      opts: opts || {},
      handler,
    });
  }

  get(pattern, opts, handler) { this.add('GET', pattern, opts, handler); }
  post(pattern, opts, handler) { this.add('POST', pattern, opts, handler); }

  /** @returns {null | {route, params}} */
  match(method, pathname) {
    const segs = pathname.split('/').filter(Boolean);
    let pathExists = false;
    for (const route of this.routes) {
      if (route.segments.length !== segs.length) continue;
      const params = {};
      let ok = true;
      for (let i = 0; i < segs.length; i++) {
        const pat = route.segments[i];
        if (pat.startsWith(':')) params[pat.slice(1)] = decodeURIComponent(segs[i]);
        else if (pat !== segs[i]) { ok = false; break; }
      }
      if (!ok) continue;
      pathExists = true;
      if (route.method === method.toUpperCase()) return { route, params };
    }
    return pathExists ? { methodMismatch: true } : null;
  }
}

/* ---------- helper respons ---------- */
export function send(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}

export function sendError(res, status, code, message) {
  send(res, status, { error: { code, message } });
}

export const err = {
  unauthorized: (res, message = 'Token tidak ada atau tidak valid') => sendError(res, 401, 'unauthorized', message),
  forbidden: (res, message = 'Akses ditolak untuk scope Anda') => sendError(res, 403, 'forbidden', message),
  notFound: (res, message = 'Resource tidak ditemukan') => sendError(res, 404, 'not_found', message),
  validation: (res, message = 'Field wajib tidak lengkap') => sendError(res, 422, 'validation_error', message),
};
