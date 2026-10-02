-- ==============================================================================
-- Radarly AI — Supabase Database Schema & Row Level Security (RLS)
-- ==============================================================================

-- 1. Create PROFILES Table
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  name text,
  role text default 'Full Stack Engineer & AI Specialist',
  avatar_url text,
  skills text[] default array['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Python', 'AI Agents'],
  portfolio_url text default 'https://github.com',
  turnaround text default '24 - 48 Hours',
  pricing_anchor text default '$4,000 / project ($85/hr)',
  custom_pitch_instructions text default 'Be concise, lead with high-conviction ROI, highlight similar projects, and offer a clear next step.',
  plan text default 'free' check (plan in ('free', 'pro', 'founder')),
  stripe_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create SAVED LEADS / CRM PIPELINE Table
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
  status text default 'new' check (status in ('new', 'researching', 'pitch_sent', 'follow_up', 'negotiation', 'won', 'lost', 'contacted', 'replied', 'proposal_sent')),
  deal_value numeric default 0,
  notes text,
  generated_pitch text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, lead_id)
);

-- 3. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.user_pipeline enable row level security;

-- 4. RLS Policies for Profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 5. RLS Policies for Pipeline
create policy "Users can view their own pipeline"
  on public.user_pipeline for select
  using (auth.uid() = user_id);

create policy "Users can insert into their own pipeline"
  on public.user_pipeline for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own pipeline"
  on public.user_pipeline for update
  using (auth.uid() = user_id);

create policy "Users can delete from their own pipeline"
  on public.user_pipeline for delete
  using (auth.uid() = user_id);

-- 6. Trigger to automatically create a profile when a new user signs up in Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url, plan)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || encode(digest(new.email, 'sha256'), 'hex')),
    'free'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
