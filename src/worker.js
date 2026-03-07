export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/r2-db') {
      return handleR2Db(request, env, url);
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

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
