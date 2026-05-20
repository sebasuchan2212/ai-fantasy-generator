create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  credits integer not null default 20 check (credits >= 0),
  created_at timestamp with time zone not null default now()
);

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('npc', 'monster')),
  title text not null,
  settings jsonb not null default '{}'::jsonb,
  results jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_type text not null check (generation_type in ('npc', 'monster')),
  item jsonb not null,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  reason text not null,
  stripe_session_id text unique,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.saved_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('npc', 'monster')),
  items jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists generations_user_created_idx on public.generations (user_id, created_at desc);
create index if not exists favorites_user_created_idx on public.favorites (user_id, created_at desc);
create index if not exists favorites_item_id_idx on public.favorites ((item->>'id'));
create index if not exists credit_transactions_user_created_idx on public.credit_transactions (user_id, created_at desc);
create index if not exists saved_sets_user_created_idx on public.saved_sets (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.generations enable row level security;
alter table public.favorites enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.saved_sets enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "generations_select_own" on public.generations;
create policy "generations_select_own"
  on public.generations for select
  using (auth.uid() = user_id);

drop policy if exists "generations_insert_own" on public.generations;
create policy "generations_insert_own"
  on public.generations for insert
  with check (auth.uid() = user_id);

drop policy if exists "generations_delete_own" on public.generations;
create policy "generations_delete_own"
  on public.generations for delete
  using (auth.uid() = user_id);

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own"
  on public.favorites for select
  using (auth.uid() = user_id);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own"
  on public.favorites for insert
  with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own"
  on public.favorites for delete
  using (auth.uid() = user_id);

drop policy if exists "credit_transactions_select_own" on public.credit_transactions;
create policy "credit_transactions_select_own"
  on public.credit_transactions for select
  using (auth.uid() = user_id);

drop policy if exists "saved_sets_select_own" on public.saved_sets;
create policy "saved_sets_select_own"
  on public.saved_sets for select
  using (auth.uid() = user_id);

drop policy if exists "saved_sets_insert_own" on public.saved_sets;
create policy "saved_sets_insert_own"
  on public.saved_sets for insert
  with check (auth.uid() = user_id);

drop policy if exists "saved_sets_delete_own" on public.saved_sets;
create policy "saved_sets_delete_own"
  on public.saved_sets for delete
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, credits)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    20
  )
  on conflict (id) do nothing;

  insert into public.credit_transactions (user_id, amount, reason)
  values (new.id, 20, 'initial_signup_bonus')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.consume_credits_for_user(
  target_user_id uuid,
  credit_cost integer,
  transaction_reason text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  current_credits integer;
  next_credits integer;
begin
  if credit_cost <= 0 then
    raise exception 'credit_cost must be positive';
  end if;

  select credits
  into current_credits
  from public.profiles
  where id = target_user_id
  for update;

  if current_credits is null then
    raise exception 'profile not found';
  end if;

  if current_credits < credit_cost then
    raise exception 'insufficient credits';
  end if;

  next_credits := current_credits - credit_cost;

  update public.profiles
  set credits = next_credits
  where id = target_user_id;

  insert into public.credit_transactions (user_id, amount, reason)
  values (target_user_id, credit_cost * -1, transaction_reason);

  return next_credits;
end;
$$;

create or replace function public.add_credits_for_user(
  target_user_id uuid,
  credit_amount integer,
  transaction_reason text,
  checkout_session_id text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_credits integer;
begin
  if credit_amount <= 0 then
    raise exception 'credit_amount must be positive';
  end if;

  insert into public.credit_transactions (
    user_id,
    amount,
    reason,
    stripe_session_id
  )
  values (
    target_user_id,
    credit_amount,
    transaction_reason,
    checkout_session_id
  );

  update public.profiles
  set credits = credits + credit_amount
  where id = target_user_id
  returning credits into next_credits;

  return next_credits;
end;
$$;

insert into storage.buckets (id, name, public)
values ('generated-assets', 'generated-assets', true)
on conflict (id) do nothing;
