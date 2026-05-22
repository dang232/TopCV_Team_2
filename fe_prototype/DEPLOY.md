# Deploy to Vercel

The frontend is a Vite SPA. The `/api/*` routes are served by a single Vercel
Serverless Function (`api/[...path].ts`) backed by **Supabase Postgres** (free
tier, no card).

## One-time setup

1. Create a free project at <https://supabase.com> (GitHub signup is fine).
2. In Supabase → **SQL Editor**, run the contents of `supabase/schema.sql`.
3. In Supabase → **Project Settings → API**, copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key (not anon) → `SUPABASE_SERVICE_ROLE_KEY`
4. Push this repo to GitHub and import on <https://vercel.com>:
   - **Root Directory**: `fe_prototype`
   - Framework Preset: Vite (auto)
5. In Vercel → **Settings → Environment Variables**, add both vars for
   Production (and Preview if you want).
6. Deploy / redeploy. `/api/jobs` should return the seeded job list.

### Set env vars via CLI (optional)

```bash
cd fe_prototype
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel --prod
```

## Local dev

Unchanged: `pnpm dev` runs Vite + json-server on port 3001. Vite proxies
`/api` → json-server. The Supabase function is only used on Vercel.

To test the serverless handler locally:

```bash
# .env.local with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
pnpm dlx vercel dev
```

## Data lifecycle

- `jobs` is **auto-seeded** on first read when the table is empty.
- Other collections start empty and grow as users register.
- Data is shared across preview + production for the same Supabase project.

## Resetting data

In Supabase → **Table Editor** → `entries`, delete rows by `collection`, or
run in SQL Editor:

```sql
delete from public.entries where collection in ('users', 'applications', 'profiles', 'favorites', 'cvs');
-- omit 'jobs' unless you want a fresh seed on next GET /api/jobs
```

## Limits

- Serverless body: 1 MB per request. CV uploads are capped at 500 KB client-side.
- Free Supabase: 500 MB DB, plenty for a class prototype.
- `service_role` must stay server-side only (Vercel env), never in the client.
