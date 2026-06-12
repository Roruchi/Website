const VALID_TYPES = new Set(['feed', 'ripple']);
const MAX_KEY_LENGTH = 240;

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0] || 'null',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(request, env, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request, env),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

async function hashVisitor(visitorId, env) {
  const input = new TextEncoder().encode((env.VISITOR_PEPPER || '') + ':' + visitorId);
  const digest = await crypto.subtle.digest('SHA-256', input);
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
}

function validKey(key) {
  return typeof key === 'string' && key.length > 0 && key.length <= MAX_KEY_LENGTH;
}

async function readCount(env, type, key) {
  const row = await env.DB.prepare(
    'SELECT count FROM counters WHERE type = ?1 AND item_key = ?2',
  ).bind(type, key).first();
  return row ? Number(row.count) : 0;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      return json(request, env, { ok: true });
    }

    const countMatch = url.pathname.match(/^\/v1\/counts\/([^/]+)\/(.+)$/);
    if (request.method === 'GET' && countMatch) {
      const type = decodeURIComponent(countMatch[1]);
      const key = decodeURIComponent(countMatch[2]);
      if (!VALID_TYPES.has(type) || !validKey(key)) {
        return json(request, env, { error: 'Invalid interaction' }, 400);
      }
      return json(request, env, { type, key, count: await readCount(env, type, key) });
    }

    if (request.method === 'POST' && url.pathname === '/v1/events') {
      let body;
      try {
        body = await request.json();
      } catch (_) {
        return json(request, env, { error: 'Invalid JSON' }, 400);
      }

      const { type, key, visitorId } = body || {};
      if (
        !VALID_TYPES.has(type) ||
        !validKey(key) ||
        typeof visitorId !== 'string' ||
        visitorId.length < 8 ||
        visitorId.length > 120
      ) {
        return json(request, env, { error: 'Invalid interaction' }, 400);
      }

      const visitorHash = await hashVisitor(visitorId, env);
      const period = type === 'feed' ? new Date().toISOString().slice(0, 10) : 'all';
      const result = await env.DB.prepare(
        `INSERT OR IGNORE INTO interactions (type, item_key, visitor_hash, period)
         VALUES (?1, ?2, ?3, ?4)`,
      ).bind(type, key, visitorHash, period).run();

      return json(request, env, {
        type,
        key,
        count: await readCount(env, type, key),
        recorded: result.meta.changes > 0,
      });
    }

    return json(request, env, { error: 'Not found' }, 404);
  },
};
