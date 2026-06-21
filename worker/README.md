# CoinInsight proxy (Cloudflare Worker)

A tiny serverless proxy so the Claude API key stays **off the client**. The app
POSTs Anthropic message bodies here; the Worker injects the key and forwards them.

## One-time deploy

```bash
cd worker
npx wrangler login                       # opens browser, links your Cloudflare account
npx wrangler secret put ANTHROPIC_API_KEY   # paste your Claude key (stored server-side)
npx wrangler secret put APP_TOKEN           # optional: a long random string
npx wrangler deploy                      # prints your worker URL
```

Then point the app at the printed URL (in the app's local env config):

```
EXPO_PUBLIC_PROXY_URL=https://coininsight-proxy.<you>.workers.dev
EXPO_PUBLIC_PROXY_TOKEN=<the same APP_TOKEN, if you set one>
```

Restart the Expo dev server so it picks up the values.

## Run it locally (offline iteration)

```bash
cd worker
# create worker/.dev.vars with your secrets (git-ignored), then:
npm install                        # or: npx wrangler dev
npm run dev                        # serves at http://localhost:8787
```

- Web app → set `EXPO_PUBLIC_PROXY_URL=http://localhost:8787`.
- Phone (Expo Go) → use your Mac's LAN IP, e.g. `http://192.168.1.215:8787`
  (run `wrangler dev --ip 0.0.0.0` so the phone can reach it).

## Recommended hardening
- Set a low **spend cap** in the Anthropic console.
- Keep the **APP_TOKEN** check on, and enable Cloudflare **rate limiting** on the route.
