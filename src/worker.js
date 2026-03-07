export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/r2-db') {
      return handleR2Db(request, env, url);
    }

    if (url.pathname === '/api/r2-validations') {
      if (request.method === 'GET') return handleGetR2Validations(request, env, url);
      if (request.method === 'POST') return handlePostR2Validation(request, env);
      return json({ error: 'Method not allowed' }, 405);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleR2Db(request, env, url) {
  if (!env.DB_BUCKET) {
    return json({ error: 'R2 binding DB_BUCKET não configurada.' }, 500);
  }

  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const keyFromQuery = (url.searchParams.get('key') || '').trim();
  const key = keyFromQuery || env.R2_DEFAULT_KEY || '';

  if (!key) {
    return json({ error: 'Chave do ficheiro em falta. Use ?key=... ou R2_DEFAULT_KEY.' }, 400);
  }

  const object = await env.DB_BUCKET.get(key);
  if (!object) {
    return json({ error: `Ficheiro não encontrado em R2: ${key}` }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'no-store');

  const ct = headers.get('content-type');
  if (!ct || ct === 'application/octet-stream') {
    headers.set('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }

  headers.set('x-r2-key', key);
  return new Response(object.body, { status: 200, headers });
}

async function handleGetR2Validations(request, env, url) {
  if (!env.DB_BUCKET) return json({ error: 'R2 binding DB_BUCKET não configurada.' }, 500);
  const key = (url.searchParams.get('key') || env.R2_DEFAULT_KEY || '').trim();
  if (!key) return json({ error: 'Parâmetro key em falta.' }, 400);

  const validationKey = getValidationObjectKey(key, env);
  const obj = await env.DB_BUCKET.get(validationKey);
  if (!obj) {
    return json({ key, validationKey, items: [] }, 200);
  }

  const data = await obj.json().catch(() => ({ items: [] }));
  const items = Array.isArray(data?.items) ? data.items : [];
  return json({ key, validationKey, items }, 200);
}

async function handlePostR2Validation(request, env) {
  if (!env.DB_BUCKET) return json({ error: 'R2 binding DB_BUCKET não configurada.' }, 500);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'JSON inválido no body.' }, 400);
  }

  const key = String(body?.key || env.R2_DEFAULT_KEY || '').trim();
  const bilhete = String(body?.bilhete || '').trim();
  const validadoEm = String(body?.validadoEm || '').trim();
  const validador = String(body?.validador || '').trim();

  if (!key || !bilhete || !validadoEm) {
    return json({ error: 'Campos obrigatórios: key, bilhete, validadoEm.' }, 400);
  }

  const validationKey = getValidationObjectKey(key, env);
  const existing = await env.DB_BUCKET.get(validationKey);
  let payload = { key, updatedAt: new Date().toISOString(), items: [] };

  if (existing) {
    try {
      const parsed = await existing.json();
      if (parsed && Array.isArray(parsed.items)) payload = parsed;
    } catch {
      // fallback to fresh payload
    }
  }

  const norm = s => String(s || '').trim().toUpperCase();
  const idx = payload.items.findIndex(it => norm(it?.bilhete) === norm(bilhete));
  const item = { bilhete, validadoEm, validador, source: 'worker-r2', updatedAt: new Date().toISOString() };

  if (idx >= 0) payload.items[idx] = { ...payload.items[idx], ...item };
  else payload.items.push(item);

  payload.updatedAt = new Date().toISOString();

  await env.DB_BUCKET.put(validationKey, JSON.stringify(payload, null, 2), {
    httpMetadata: { contentType: 'application/json; charset=utf-8' },
  });

  return json({ ok: true, key, validationKey, total: payload.items.length }, 200);
}

function getValidationObjectKey(dbKey, env) {
  const suffix = String(env.R2_VALIDATIONS_SUFFIX || '.validations.json');
  return `${dbKey}${suffix}`;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
