-- Run once in Supabase → SQL Editor (https://supabase.com/dashboard → SQL)
-- Mirrors json-server: one row per document, keyed by collection + id.

create table if not exists public.entries (
  collection text not null,
  id text not null,
  data jsonb not null,
  primary key (collection, id)
);

create index if not exists idx_entries_collection on public.entries (collection);
