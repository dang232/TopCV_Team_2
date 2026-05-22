# Deploy to Vercel

The frontend is a Vite SPA. The `/api/*` routes are served by a single Vercel
Serverless Function (`api/[...path].ts`) backed by **Vercel KV** (Upstash
Redis under the hood).

## One-time setup

1. Push this repo to GitHub.
2. On <https://vercel.com> → **Add New → Project**.
3. Import the repo and set:
   - **Root Directory**: `fe_prototype`
   - Framework Preset: Vite (auto)
   - Build Command: `pnpm build` (auto)
   - Output Directory: `dist` (auto)
4. Click **Deploy** once so the project exists. The first deploy will work for
   the static UI, but `/api/*` will return 500 until KV is attached.
5. In the project → **Storage → Create Database → KV**. Pick a name and
   region, attach it to the project. Vercel auto-injects `KV_REST_API_URL` and
   `KV_REST_API_TOKEN` (which `@vercel/kv` reads).
6. Trigger a redeploy (Deployments tab → ... → Redeploy).

## Local dev

Unchanged: `pnpm dev` runs both vite and json-server. The serverless code in
`api/` is only used in production. To smoke-test the function locally, run
`pnpm vercel dev` (requires `pnpm dlx vercel link` first).

## Data lifecycle

- The `jobs` collection is **auto-seeded** the first time it's read.
- All other collections (`users`, `applications`, `profiles`, `favorites`,
  `cvs`) start empty and grow as users register.
- KV is shared across all preview + production deployments of the same
  project.

## Limits to be aware of

- Serverless body size: 1 MB per request. CV uploads are capped to 500 KB on
  the client to leave headroom for base64 overhead and JSON envelope.
- KV value size: 1 MB per key. Each collection lives in one key, so heavy
  use of CV uploads will eventually need a different storage strategy
  (Vercel Blob is the natural next step).
- Free KV plan: ~30k commands/day. Plenty for a class demo, not a real app.

## Resetting the data

Use the Vercel KV dashboard → CLI tab and run:

```
DEL topcv:users topcv:applications topcv:profiles topcv:favorites topcv:cvs
```

Leave `topcv:jobs` alone unless you want to re-seed it.
