// We call Claude over plain fetch (not the SDK) so the same code runs on web
// AND native — the Node SDK pulls in `node:fs`, which Metro can't resolve.
//
// Preferred path: a serverless proxy (see /worker) holds the API key server-side
// and the client only knows the proxy URL. If no proxy is configured we fall
// back to calling Anthropic directly with a local key (handy for quick dev).
const PROXY_URL = process.env.EXPO_PUBLIC_PROXY_URL;
const PROXY_TOKEN = process.env.EXPO_PUBLIC_PROXY_TOKEN;
const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

const useProxy = () => Boolean(PROXY_URL && PROXY_URL.trim());

// True when the AI is reachable (via proxy, or a direct key for dev).
export function hasApiKey() {
  return useProxy() || Boolean(API_KEY && API_KEY.trim().length > 10);
}

// Claude Haiku 4.5 — fast, vision-capable, supports structured outputs.
const MODEL = 'claude-haiku-4-5';

const RARITY_TIERS = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary'];

// JSON schema the model is constrained to return (structured outputs).
const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    is_coin: { type: 'boolean', description: 'True only if the image shows a coin.' },
    name: { type: 'string', description: 'Common collector name, e.g. "Morgan Silver Dollar".' },
    country: { type: 'string', description: 'Issuing country in English.' },
    country_code: { type: 'string', description: 'ISO 3166-1 alpha-2 code, e.g. US, GB, FR. Empty if unknown.' },
    year: { type: 'string', description: 'Mint year if legible, else an approximate range like "1880–1920".' },
    metal: { type: 'string', description: 'Primary metal: Gold, Silver, Bronze, Copper, Nickel, Platinum, etc.' },
    value_low: { type: 'number', description: 'Low end of estimated collector value in USD.' },
    value_high: { type: 'number', description: 'High end of estimated collector value in USD.' },
    rarity: { type: 'string', enum: RARITY_TIERS },
    confidence: { type: 'number', description: 'Identification confidence, 0-100.' },
    notes: { type: 'string', description: 'One short sentence of context.' },
  },
  required: [
    'is_coin', 'name', 'country', 'country_code', 'year',
    'metal', 'value_low', 'value_high', 'rarity', 'confidence', 'notes',
  ],
};

const SYSTEM = `You are an expert numismatist identifying coins from photographs.
Identify the coin as specifically as possible, even from a single side or a worn example.
Estimate the current collector market value in USD as a low–high range for a typical example in the condition shown.
Use exactly these rarity tiers: ${RARITY_TIERS.join(', ')}.
Return country_code as an ISO 3166-1 alpha-2 code (US, GB, FR, CA, …).
If the image is not a coin, set is_coin to false and leave the other fields blank or zero.
Always respond with the structured JSON only.`;

// Metal → two-stop gradient used for the coin's rendered "disc" placeholder.
const DISC_BY_METAL = [
  [/gold/i, ['#F4D77A', '#A9801F']],
  [/silver/i, ['#D7D2C4', '#8E8979']],
  [/bronze/i, ['#7E5A2B', '#3A2A14']],
  [/copper/i, ['#C97A45', '#7A3E1E']],
  [/nickel|steel|cupro/i, ['#CFD3D6', '#83898E']],
  [/platin/i, ['#D9DDE0', '#9AA0A6']],
];

function discForMetal(metal = '') {
  const found = DISC_BY_METAL.find(([re]) => re.test(metal));
  return found ? found[1] : ['#E0B45C', '#7E5A20'];
}

// ISO alpha-2 → flag emoji via regional indicator symbols.
function flagFromCode(code) {
  if (!code || code.length !== 2) return '🌐';
  try {
    return code
      .toUpperCase()
      .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
  } catch {
    return '🌐';
  }
}

function normalize(data) {
  const low = Math.max(0, Number(data.value_low) || 0);
  const high = Math.max(low, Number(data.value_high) || low);
  return {
    id: 'scan-' + Date.now(),
    name: data.name || 'Unidentified Coin',
    country: data.country || 'Unknown',
    flag: flagFromCode(data.country_code),
    year: data.year || '—',
    metal: data.metal || 'Unknown',
    valueLow: low,
    valueHigh: high,
    rarity: RARITY_TIERS.includes(data.rarity) ? data.rarity : 'Common',
    confidence: Math.round(Number(data.confidence) || 0),
    notes: data.notes || '',
    disc: discForMetal(data.metal),
    addedAt: Date.now(),
  };
}

function err(code, message) {
  const e = new Error(message || code);
  e.code = code;
  return e;
}

// Shared Messages API call (fetch — no SDK, so it runs on web and native).
async function postMessages(body) {
  if (!hasApiKey()) throw err('NO_API_KEY', 'AI is not configured (no proxy URL or API key).');

  let url, headers;
  if (useProxy()) {
    // Talk to our serverless proxy — no key on the client.
    url = PROXY_URL;
    headers = { 'content-type': 'application/json' };
    if (PROXY_TOKEN) headers['x-app-token'] = PROXY_TOKEN;
  } else {
    // Dev fallback: call Anthropic directly with a local key.
    url = 'https://api.anthropic.com/v1/messages';
    headers = {
      'content-type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    };
  }

  let resp, data;
  try {
    resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    data = await resp.json();
  } catch (e) {
    throw err('API_ERROR', e?.message || 'Network request to Claude failed.');
  }
  if (!resp.ok) throw err('API_ERROR', data?.error?.message || `Claude API error (${resp.status}).`);
  if (data.stop_reason === 'refusal') throw err('REFUSAL', 'The request could not be completed.');
  return data;
}

function textOf(message) {
  return (message.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
}

/**
 * Identify a coin from a base64 image using Claude Haiku.
 * @returns {Promise<object>} a normalized coin ready for the store.
 * @throws  Error with .code: NO_API_KEY | NOT_A_COIN | REFUSAL | API_ERROR
 */
export async function identifyCoin(base64, mediaType = 'image/jpeg') {
  const message = await postMessages({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM,
    tools: [
      {
        name: 'record_coin',
        description: 'Record the structured identification of the coin in the image.',
        input_schema: SCHEMA,
      },
    ],
    tool_choice: { type: 'tool', name: 'record_coin' },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: 'Identify this coin and record the structured data.' },
        ],
      },
    ],
  });

  const toolUse = message.content?.find((b) => b.type === 'tool_use');
  const data = toolUse?.input;
  if (!data) throw err('API_ERROR', 'Claude did not return a structured result.');

  if (!data.is_coin) {
    const e = err('NOT_A_COIN', "That doesn't look like a coin.");
    e.data = data;
    throw e;
  }

  return normalize(data);
}

const STORY_SYSTEM = `You are a numismatic historian. In 2-3 vivid, specific sentences, tell the story of the coin the user names: its historical context, who or what is depicted, and why collectors prize it. Write plain prose — no preamble, no markdown, no bullet points, no lists.`;

/** A short historical blurb for a coin. */
export async function coinStory(coin) {
  const message = await postMessages({
    model: MODEL,
    max_tokens: 260,
    system: STORY_SYSTEM,
    messages: [
      {
        role: 'user',
        content: `Coin: ${coin.name}. Country: ${coin.country}. Year: ${coin.year}. Metal: ${coin.metal}.`,
      },
    ],
  });
  return textOf(message);
}

function expertSystem(coin) {
  return `You are a warm, expert numismatist helping a collector with a specific coin from their collection: ${coin.name} (${coin.country}, ${coin.year}, ${coin.metal}, rarity: ${coin.rarity}). Answer their questions about its history, design, value drivers, authenticity, grading, and care. Keep replies concise (2-4 sentences), friendly, and specific to this coin. Plain text only — no markdown, no bullet points.`;
}

/**
 * Continue an "ask the expert" conversation about a coin.
 * @param {object} coin
 * @param {Array<{role:'user'|'assistant', content:string}>} history - must start with a user turn
 * @returns {Promise<string>} the assistant's reply text
 */
export async function askExpert(coin, history) {
  const message = await postMessages({
    model: MODEL,
    max_tokens: 500,
    system: expertSystem(coin),
    messages: history.map((m) => ({ role: m.role, content: m.content })),
  });
  return textOf(message);
}
