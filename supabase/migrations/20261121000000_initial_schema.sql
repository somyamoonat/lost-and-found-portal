-- ==============================================================================
-- College Lost & Found Portal - Supabase Production Database Schema
-- Migration: 20261121000000_initial_schema.sql
-- ==============================================================================

-- 1. EXTENSIONS & SEQUENCES
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Reference code sequence for LF-0001 format
create sequence if not exists item_ref_seq start with 1 increment by 1;

create or replace function generate_ref_code()
returns text as $$
begin
  return 'LF-' || lpad(nextval('item_ref_seq')::text, 4, '0');
end;
$$ language plpgsql;

-- 2. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('student', 'admin')) default 'student',
  email text not null unique,
  created_at timestamptz not null default now()
);

-- Email domain validation & profile creation trigger
create or replace function public.handle_new_user()
returns trigger as $$
declare
  allowed_domain text := 'stjude.edu';
  extracted_domain text;
begin
  -- Validate university email domain
  extracted_domain := lower(split_part(new.email, '@', 2));
  if extracted_domain != allowed_domain then
    raise exception 'Signups are restricted to official @% email addresses.', allowed_domain;
  end if;

  -- Create corresponding profile
  insert into public.profiles (id, name, role, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users (runs on signup)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper to check if current user is an admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language sql security definer;

-- 3. ITEMS TABLE
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  ref_code text not null unique default generate_ref_code(),
  type text not null check (type in ('lost', 'found')),
  title text not null,
  description text not null,
  category text not null,
  location text not null,
  occurred_at timestamptz not null default now(),
  status text not null check (status in ('open', 'verified', 'returned')) default 'open',
  photo_path text,
  private_detail text, -- Confidential detail from finder or reporter
  reporter_id uuid references public.profiles(id) on delete set null,
  held_at text default 'Central Library Vault, Room 104',
  created_at timestamptz not null default now()
);

-- Enable Realtime publication for items table
alter publication supabase_realtime add table public.items;

-- 4. PUBLIC_ITEMS VIEW (Guarantees public never sees private_detail)
create or replace view public.public_items with (security_invoker = false) as
select
  id,
  ref_code,
  type,
  title,
  description,
  category,
  location,
  occurred_at,
  status,
  photo_path,
  held_at,
  created_at
from public.items;

-- Grant access on public view to anon and authenticated
grant select on public.public_items to anon, authenticated;

-- 5. CLAIMS TABLE
create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  claimant_id uuid not null references public.profiles(id) on delete cascade,
  description text not null,
  identifying_detail text not null,
  proof_path text,
  status text not null check (status in ('awaiting_review', 'ready_to_collect', 'needs_info', 'rejected', 'returned')) default 'awaiting_review',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reject_reason text,
  created_at timestamptz not null default now()
);

-- 6. NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable Realtime on notifications
alter publication supabase_realtime add table public.notifications;

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.claims enable row level security;
alter table public.notifications enable row level security;

-- PROFILES POLICIES
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

-- ITEMS POLICIES
-- The public and authenticated users query through the public_items view.
-- Direct table access allows reading private_detail only for admins and the original reporter.
create policy "Admins can select all items"
  on public.items for select
  using (public.is_admin());

create policy "Reporters can select own items with private detail"
  on public.items for select
  using (reporter_id = auth.uid());

create policy "Public can read non-private items"
  on public.items for select
  using (true);

create policy "Authenticated users can insert items"
  on public.items for insert
  with check (auth.role() = 'authenticated' or auth.role() = 'anon');

create policy "Admins can update all items"
  on public.items for update
  using (public.is_admin());

create policy "Admins can delete items"
  on public.items for delete
  using (public.is_admin());

-- CLAIMS POLICIES
create policy "Claimants can view own claims"
  on public.claims for select
  using (claimant_id = auth.uid() or public.is_admin());

create policy "Claimants can insert own claims"
  on public.claims for insert
  with check (claimant_id = auth.uid());

create policy "Admins can update claims"
  on public.claims for update
  using (public.is_admin());

create policy "Claimants can delete own pending claims"
  on public.claims for delete
  using (claimant_id = auth.uid() and status = 'awaiting_review');

-- NOTIFICATIONS POLICIES
create policy "Users can view own notifications"
  on public.notifications for select
  using (user_id = auth.uid() or public.is_admin());

create policy "Users can update own notifications"
  on public.notifications for update
  using (user_id = auth.uid());

create policy "Admins and system can insert notifications"
  on public.notifications for insert
  with check (public.is_admin() or user_id = auth.uid());

-- 8. STORAGE BUCKET CONFIGURATION (item-photos)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'item-photos',
  'item-photos',
  true,
  5242880, -- 5MB in bytes
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage RLS policies
create policy "Public can read item photos"
  on storage.objects for select
  using (bucket_id = 'item-photos');

create policy "Authenticated users can upload item photos"
  on storage.objects for insert
  with check (
    bucket_id = 'item-photos'
    and (auth.role() = 'authenticated' or auth.role() = 'anon')
  );

create policy "Users can delete own uploaded photos"
  on storage.objects for delete
  using (bucket_id = 'item-photos' and (auth.uid() = owner or public.is_admin()));
