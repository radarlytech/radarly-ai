/**
 * Radarly AI — Supabase Auto Migration Script
 * Loads keys from .env.local and runs all SQL migrations
 * Usage: node scripts/migrate.mjs
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local manually
const envPath = resolve(process.cwd(), '.env.local');
const envVars = {};
readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length && !key.startsWith('#')) {
    envVars[key.trim()] = rest.join('=').trim();
  }
});

const SUPABASE_URL   = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const ACCESS_TOKEN   = envVars['SUPABASE_ACCESS_TOKEN'];
const PROJECT_REF    = SUPABASE_URL?.match(/https:\/\/([^.]+)\./)?.[1];

if (!SUPABASE_URL || !ACCESS_TOKEN) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_ACCESS_TOKEN in .env.local');
  process.exit(1);
}

const MIGRATIONS = [
  {
    name: '01_enable_pgcrypto',
    sql: `create extension if not exists pgcrypto;`
  },
  {
    name: '02_create_profiles',
    sql: `
      create table if not exists public.profiles (
        id uuid references auth.users(id) on delete cascade primary key,
        email text unique not null,
        name text,
        role text default 'Full Stack Engineer & AI Specialist',
        avatar_url text,
        skills text[] default array['Next.js','React','TypeScript','Tailwind CSS','Node.js','Python','AI Agents'],
        portfolio_url text default 'https://github.com',
        turnaround text default '24 - 48 Hours',
        pricing_anchor text default '$4,000 / project ($85/hr)',
        custom_pitch_instructions text default 'Be concise, lead with high-conviction ROI, highlight similar projects, and offer a clear next step.',
        plan text default 'free' check (plan in ('free','pro','founder')),
        stripe_customer_id text,
        created_at timestamptz default timezone('utc'::text, now()) not null,
        updated_at timestamptz default timezone('utc'::text, now()) not null
      );`
  },
  {
    name: '03_create_user_pipeline',
    sql: `
      create table if not exists public.user_pipeline (
        id uuid default gen_random_uuid() primary key,
        user_id uuid references public.profiles(id) on delete cascade not null,
        lead_id text not null,
        title text not null,
        body text,
        author text,
        source text not null,
        subreddit text,
        url text not null,
        intent_score integer default 90,
        urgency text default 'High',
        estimated_budget text,
        matched_keywords text[],
        status text default 'new' check (status in ('new','researching','pitch_sent','follow_up','negotiation','won','lost','contacted','replied','proposal_sent')),
        deal_value numeric default 0,
        notes text,
        generated_pitch text,
        created_at timestamptz default timezone('utc'::text, now()) not null,
        updated_at timestamptz default timezone('utc'::text, now()) not null,
        unique(user_id, lead_id)
      );`
  },
  {
    name: '04_enable_rls',
    sql: `
      alter table public.profiles enable row level security;
      alter table public.user_pipeline enable row level security;`
  },
  {
    name: '05_profiles_rls_policies',
    sql: `
      drop policy if exists "Users can view their own profile" on public.profiles;
      drop policy if exists "Users can update their own profile" on public.profiles;
      drop policy if exists "Users can insert their own profile" on public.profiles;
      create policy "Users can view their own profile"   on public.profiles for select using (auth.uid() = id);
      create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
      create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);`
  },
  {
    name: '06_pipeline_rls_policies',
    sql: `
      drop policy if exists "Users can view their own pipeline"           on public.user_pipeline;
      drop policy if exists "Users can insert into their own pipeline"    on public.user_pipeline;
      drop policy if exists "Users can update their own pipeline"         on public.user_pipeline;
      drop policy if exists "Users can delete from their own pipeline"    on public.user_pipeline;
      create policy "Users can view their own pipeline"           on public.user_pipeline for select using (auth.uid() = user_id);
      create policy "Users can insert into their own pipeline"    on public.user_pipeline for insert with check (auth.uid() = user_id);
      create policy "Users can update their own pipeline"         on public.user_pipeline for update using (auth.uid() = user_id);
      create policy "Users can delete from their own pipeline"    on public.user_pipeline for delete using (auth.uid() = user_id);`
  },
  {
    name: '07_auto_profile_trigger',
    sql: `
      create or replace function public.handle_new_user()
      returns trigger as $$
      begin
        insert into public.profiles (id, email, name, avatar_url, plan)
        values (
          new.id,
          new.email,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
          coalesce(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/initials/svg?seed=' || split_part(new.email, '@', 1)),
          'free'
        )
        on conflict (id) do nothing;
        return new;
      end;
      $$ language plpgsql security definer;

      drop trigger if exists on_auth_user_created on auth.users;
      create trigger on_auth_user_created
        after insert on auth.users
        for each row execute procedure public.handle_new_user();`
  }
];

async function runSQL(name, sql) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql.trim() }),
    }
  );

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { message: text }; }

  if (res.ok) {
    console.log(`  ✓  ${name}`);
    return;
  }

  const msg = data?.message || data?.error || JSON.stringify(data);

  // Idempotent — skip if object already exists
  if (msg.includes('already exists') || msg.includes('duplicate')) {
    console.log(`  ⚠️  ${name} — already exists (skipped)`);
    return;
  }

  throw new Error(`[${res.status}] ${msg}`);
}

async function main() {
  console.log('\n🚀  Radarly AI — Supabase Migrations');
  console.log(`    Project : ${PROJECT_REF}`);
  console.log(`    Runs    : ${MIGRATIONS.length} migrations\n`);

  for (const { name, sql } of MIGRATIONS) {
    try {
      await runSQL(name, sql);
    } catch (err) {
      console.error(`\n❌  Migration "${name}" failed: ${err.message}\n`);
      process.exit(1);
    }
  }

  console.log('\n✅  All migrations complete — database is ready!\n');
}

main();
