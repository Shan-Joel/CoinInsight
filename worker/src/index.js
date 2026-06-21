// CoinInsight — Anthropic proxy (Cloudflare Worker)
//
// Holds the Claude API key as a server-side secret and forwards the app's
// /v1/messages request bodies to Anthropic. The key never reaches the client.
//
// Secrets (set with `wrangler secret put …`, or a local `.dev.vars` file):
//   ANTHROPIC_API_KEY  (required) — your Claude API key
//   APP_TOKEN          (optional) — shared token the app must send as x-app-token

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, x-app-token',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(obj, status, origin) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== 'POST') {
      return json({ error: { type: 'method_not_allowed', message: 'Use POST.' } }, 405, origin);
    }

    // Optional shared-token gate to keep the endpoint from being used by others.
    if (env.APP_TOKEN && request.headers.get('x-app-token') !== env.APP_TOKEN) {
      return json({ error: { type: 'unauthorized', message: 'Invalid app token.' } }, 401, origin);
    }
    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: { type: 'config', message: 'Proxy is missing ANTHROPIC_API_KEY.' } }, 500, origin);
    }

    const body = await request.text();

    let upstream;
    try {
      upstream = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body,
      });
    } catch (e) {
      return json({ error: { type: 'upstream', message: 'Could not reach Claude.' } }, 502, origin);
    }

    // Pass Anthropic's response straight through (status + JSON), with CORS added.
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    });
  },
};
