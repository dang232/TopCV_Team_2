import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
  process.env.SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
);

const SEED_JOBS = [
  { id: '1', company: 'VNG Corporation', logo: '🎮', title: 'Senior Product Manager', salaryGross: '50-80M VND', salaryNet: '40-64M VND', location: 'Q.7, HCM', tags: ['Hybrid', 'Tech', 'Insurance'], description: 'Leading product strategy for gaming platform with 10M+ users', requirements: ['5+ years PM experience', 'Gaming industry knowledge', 'Data-driven mindset'] },
  { id: '2', company: 'Shopee', logo: '🛍️', title: 'Marketing Manager', salaryGross: '45-70M VND', salaryNet: '36-56M VND', location: 'Q.1, HCM', tags: ['Remote', 'E-commerce', '13th month'], description: "Drive marketing campaigns for Southeast Asia's leading marketplace", requirements: ['3+ years marketing', 'E-commerce background', 'English fluent'] },
  { id: '3', company: 'Tiki', logo: '📦', title: 'Data Analyst Lead', salaryGross: '40-60M VND', salaryNet: '32-48M VND', location: 'Q.Tân Bình, HCM', tags: ['Hybrid', 'Data', 'Stock Options'], description: 'Lead analytics team to optimize supply chain and customer experience', requirements: ['SQL & Python', '4+ years experience', 'Team management'] },
  { id: '4', company: 'Grab', logo: '🚗', title: 'Senior Business Analyst', salaryGross: '55-85M VND', salaryNet: '44-68M VND', location: 'Q.2, HCM', tags: ['Remote', 'Fintech', 'RSU'], description: 'Strategic analysis for GrabPay expansion across Vietnam', requirements: ['5+ years BA experience', 'Fintech knowledge', 'Stakeholder management'] },
  { id: '5', company: 'Momo', logo: '💰', title: 'Product Owner - Payments', salaryGross: '60-90M VND', salaryNet: '48-72M VND', location: 'Q.1, HCM', tags: ['Hybrid', 'Fintech', 'Premium Health'], description: "Own payment product roadmap for Vietnam's super app", requirements: ['Payment domain expertise', 'Agile/Scrum', '4+ years PO'] },
  { id: '6', company: 'FPT Software', logo: '💻', title: 'Senior Frontend Engineer', salaryGross: '35-55M VND', salaryNet: '28-44M VND', location: 'Q.Cầu Giấy, Hà Nội', tags: ['Onsite', 'Tech', '13th month'], description: 'Build enterprise web apps with React, TypeScript and modern tooling for global clients', requirements: ['4+ years React', 'TypeScript fluent', 'English communication'] },
  { id: '7', company: 'Techcombank', logo: '🏦', title: 'DevOps Engineer', salaryGross: '45-70M VND', salaryNet: '36-56M VND', location: 'Q.Hoàn Kiếm, Hà Nội', tags: ['Hybrid', 'Banking', 'Insurance'], description: 'Build and maintain CI/CD pipelines and Kubernetes infrastructure for digital banking', requirements: ['K8s + Docker', 'Terraform / Ansible', '3+ years DevOps'] },
  { id: '8', company: 'VinAI', logo: '🤖', title: 'AI/ML Engineer', salaryGross: '70-120M VND', salaryNet: '56-96M VND', location: 'Q.Long Biên, Hà Nội', tags: ['Hybrid', 'AI', 'RSU'], description: 'Develop computer vision and NLP models for VinFast smart vehicles', requirements: ['PyTorch / TensorFlow', 'PhD or 3+ years ML', 'Published research a plus'] },
  { id: '9', company: 'Zalo', logo: '💬', title: 'Mobile Engineer (iOS)', salaryGross: '40-65M VND', salaryNet: '32-52M VND', location: 'Q.7, HCM', tags: ['Hybrid', 'Tech', 'Stock Options'], description: 'Ship features used by 75M+ Vietnamese users on the Zalo iOS app', requirements: ['Swift / SwiftUI', '3+ years iOS', 'Performance optimization'] },
  { id: '10', company: 'Be Group', logo: '🛵', title: 'Backend Engineer (Go)', salaryGross: '38-60M VND', salaryNet: '30-48M VND', location: 'Q.4, HCM', tags: ['Hybrid', 'Tech', '13th month'], description: 'Scale ride-hailing backend services handling millions of trips per month', requirements: ['Go / Golang', 'Microservices', 'Kafka / Redis'] },
  { id: '11', company: 'Sendo', logo: '📮', title: 'UX/UI Designer', salaryGross: '25-40M VND', salaryNet: '20-32M VND', location: 'Q.3, HCM', tags: ['Remote', 'E-commerce', 'Insurance'], description: 'Design intuitive shopping experiences for the leading domestic marketplace', requirements: ['Figma fluency', 'Design system experience', '3+ years UX'] },
  { id: '12', company: 'Lazada', logo: '🛒', title: 'Senior QA Automation', salaryGross: '35-55M VND', salaryNet: '28-44M VND', location: 'Q.1, HCM', tags: ['Hybrid', 'E-commerce', 'Premium Health'], description: 'Build automated test suites for checkout and seller-facing products', requirements: ['Cypress / Playwright', 'API testing', '4+ years QA'] },
  { id: '13', company: 'Viettel Digital', logo: '📡', title: 'Cloud Architect', salaryGross: '70-100M VND', salaryNet: '56-80M VND', location: 'Q.Ba Đình, Hà Nội', tags: ['Onsite', 'Telecom', '13th month'], description: 'Architect multi-cloud solutions for ViettelPay and digital services', requirements: ['AWS / GCP certified', '7+ years cloud', 'Solution design'] },
  { id: '14', company: 'Axie Infinity', logo: '🎮', title: 'Smart Contract Engineer', salaryGross: '80-130M VND', salaryNet: '64-104M VND', location: 'Remote', tags: ['Remote', 'Web3', 'Stock Options'], description: 'Write and audit Solidity contracts powering the largest play-to-earn ecosystem', requirements: ['Solidity expert', 'Security mindset', '2+ years on-chain'] },
  { id: '15', company: 'Topica EdTech', logo: '📚', title: 'Content Marketing Lead', salaryGross: '30-50M VND', salaryNet: '24-40M VND', location: 'Q.Đống Đa, Hà Nội', tags: ['Hybrid', 'EdTech', '13th month'], description: 'Lead a content team producing learning materials across SEA markets', requirements: ['5+ years content', 'SEO + analytics', 'Team leadership'] },
];

const COLLECTIONS = ['users', 'jobs', 'applications', 'profiles', 'favorites', 'cvs'] as const;
type Collection = (typeof COLLECTIONS)[number];

function rowId(row: { id?: string | number }): string {
  return String(row.id);
}

async function read<T extends { id?: string | number }>(c: Collection): Promise<T[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('data')
    .eq('collection', c);
  if (error) throw error;
  const rows = (data ?? []).map((r) => r.data as T);
  if (c === 'jobs' && rows.length === 0) {
    await write(c, SEED_JOBS as unknown as T[]);
    return SEED_JOBS as unknown as T[];
  }
  return rows;
}

async function write<T extends { id?: string | number }>(c: Collection, rows: T[]): Promise<void> {
  const { error: delError } = await supabase.from('entries').delete().eq('collection', c);
  if (delError) throw delError;
  if (rows.length === 0) return;
  const { error: insError } = await supabase.from('entries').insert(
    rows.map((row) => ({
      collection: c,
      id: rowId(row),
      data: row as Record<string, unknown>,
    }))
  );
  if (insError) throw insError;
}

function pickFilters(query: VercelRequest['query']) {
  const filters: Record<string, string> = {};
  let sort: string | null = null;
  let order: 'asc' | 'desc' = 'asc';
  for (const [k, v] of Object.entries(query)) {
    const value = Array.isArray(v) ? v[0] : v;
    if (value === undefined) continue;
    if (k === '_sort') sort = value;
    else if (k === '_order') order = value === 'desc' ? 'desc' : 'asc';
    else filters[k] = value;
  }
  return { filters, sort, order };
}

function applyQuery<T extends Record<string, unknown>>(rows: T[], query: VercelRequest['query']) {
  const { filters, sort, order } = pickFilters(query);
  let out = rows;
  for (const [k, v] of Object.entries(filters)) {
    out = out.filter((r) => String((r as Record<string, unknown>)[k] ?? '').toLowerCase() === v.toLowerCase());
  }
  if (sort) {
    const s = sort;
    const o = order === 'desc' ? -1 : 1;
    out = [...out].sort((a, b) => {
      const av = (a as Record<string, unknown>)[s] as string | number | undefined;
      const bv = (b as Record<string, unknown>)[s] as string | number | undefined;
      if (av === bv) return 0;
      if (av === undefined) return 1;
      if (bv === undefined) return -1;
      return av > bv ? o : -o;
    });
  }
  return out;
}

function nextNumericId(rows: Array<{ id?: string | number }>): number {
  const max = rows.reduce((m, r) => {
    const n = typeof r.id === 'number' ? r.id : Number(r.id);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return max + 1;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
      });
    }

    const path = (req.query.path as string[] | undefined) ?? [];
    const [collectionName, idParam] = path;
    if (!collectionName || !COLLECTIONS.includes(collectionName as Collection)) {
      return res.status(404).json({ error: 'Unknown collection' });
    }
    const collection = collectionName as Collection;

    if (req.method === 'GET' && !idParam) {
      const rows = await read<Record<string, unknown>>(collection);
      return res.status(200).json(applyQuery(rows, req.query));
    }

    if (req.method === 'GET' && idParam) {
      const rows = await read<Record<string, unknown>>(collection);
      const found = rows.find((r) => String(r.id) === idParam);
      if (!found) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(found);
    }

    if (req.method === 'POST') {
      const rows = await read<Record<string, unknown>>(collection);
      const body = (req.body ?? {}) as Record<string, unknown>;
      const id = body.id ?? nextNumericId(rows as Array<{ id?: string | number }>);
      const row = { ...body, id };
      rows.push(row);
      await write(collection, rows);
      return res.status(201).json(row);
    }

    if (req.method === 'PATCH' && idParam) {
      const rows = await read<Record<string, unknown>>(collection);
      const idx = rows.findIndex((r) => String(r.id) === idParam);
      if (idx === -1) return res.status(404).json({ error: 'Not found' });
      const merged = { ...rows[idx], ...(req.body as Record<string, unknown>) };
      rows[idx] = merged;
      await write(collection, rows);
      return res.status(200).json(merged);
    }

    if (req.method === 'DELETE' && idParam) {
      const rows = await read<Record<string, unknown>>(collection);
      const next = rows.filter((r) => String(r.id) !== idParam);
      if (next.length === rows.length) return res.status(404).json({ error: 'Not found' });
      await write(collection, next);
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return res.status(500).json({ error: message });
  }
}
