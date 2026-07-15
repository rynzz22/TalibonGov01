-- SUPABASE MUNICIPALITY OF TALIBON CMS DATABASE SCHEMA
-- This SQL script creates the required database tables, configures Row Level Security (RLS) rules,
-- and inserts default values to initialize the admin CMS portal.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. EXTEND PROFILES TABLE (OR CREATE IF NOT EXISTS)
-- Assuming 'profiles' table exists for user profiles and roles.
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'editor' check (role in ('super_admin', 'admin', 'editor', 'municipal_admin', 'barangay_admin')),
  barangay_id text,
  is_verified boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. NEWS TABLE
create table if not exists public.news (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  summary text not null,
  content text not null,
  image_url text,
  file_url text, -- optional downloadable form
  category text not null default 'ARTICLE',
  author text,
  date date not null default current_date,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  barangay_id text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. DOWNLOADABLES TABLE
create table if not exists public.downloadables (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text not null default 'forms',
  file_url text not null,
  file_size text default '1.2 MB',
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. TOURISM SPOTS TABLE
create table if not exists public.tourism_spots (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  gallery_images text[] default array[]::text[],
  location text not null,
  google_maps_link text,
  opening_hours text default 'Always Open',
  contact_details text,
  featured_image text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. OFFICIALS TABLE (REUSES OR CREATES)
create table if not exists public.officials (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null, -- Position/Title
  level integer not null default 3, -- 1: Mayor, 2: Vice Mayor, 3: Council, etc.
  display_order integer not null default 0,
  image_url text,
  biography text,
  contact_info text,
  department text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. DEPARTMENTS TABLE
create table if not exists public.departments (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  head_of_office text,
  contact_number text,
  email text,
  office_hours text default 'Monday to Friday, 8:00 AM - 5:00 PM',
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 7. SERVICES TABLE (POWERS THE SERVICE INFORMATION PAGES)
create table if not exists public.services_cms (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text not null,
  purpose text,
  requirements text[] default array[]::text[],
  processing_time text not null default '3 to 5 business days',
  fees text default 'None',
  office_responsible text not null,
  office_hours text default 'Monday to Friday, 8:00 AM - 5:00 PM',
  contact_info text,
  physical_address text,
  status text not null default 'available' check (status in ('available', 'coming-soon', 'maintenance')),
  downloadable_forms jsonb default '[]'::jsonb, -- Array of { title: string, url: string, fileSize: string }
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 8. CITIZEN'S CHARTER TABLE
create table if not exists public.citizens_charter_cms (
  id uuid default gen_random_uuid() primary key,
  office text not null,
  service_name text not null,
  requirements text[] default array[]::text[],
  processing_time text not null,
  fees text not null default 'No Fees',
  steps jsonb default '[]'::jsonb, -- Array of { stepNumber: number, activity: string, officeResponsible: string, duration: string, clientSteps: string }
  downloadable_forms jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 9. EVENTS TABLE
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  date date not null,
  time text not null,
  venue text not null,
  banner_image text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 10. AUDIT LOGS TABLE
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_email text not null,
  action text not null,
  target_table text not null,
  target_id text,
  timestamp timestamp with time zone default timezone('utc'::text, now())
);

-- ROW LEVEL SECURITY RULES (RLS)
alter table public.profiles enable row level security;
alter table public.news enable row level security;
alter table public.downloadables enable row level security;
alter table public.tourism_spots enable row level security;
alter table public.officials enable row level security;
alter table public.departments enable row level security;
alter table public.services_cms enable row level security;
alter table public.citizens_charter_cms enable row level security;
alter table public.events enable row level security;
alter table public.audit_logs enable row level security;

-- SELECT RULES: PUBLIC READ ACCESS FOR PUBLIC CONTENT
create policy "Allow public read on news" on public.news for select using (true);
create policy "Allow public read on downloadables" on public.downloadables for select using (true);
create policy "Allow public read on tourism_spots" on public.tourism_spots for select using (true);
create policy "Allow public read on officials" on public.officials for select using (true);
create policy "Allow public read on departments" on public.departments for select using (true);
create policy "Allow public read on services_cms" on public.services_cms for select using (true);
create policy "Allow public read on citizens_charter_cms" on public.citizens_charter_cms for select using (true);
create policy "Allow public read on events" on public.events for select using (true);

-- WRITE/MODIFY RULES: REQUIRES VERIFIED ADMIN/EDITOR ROLES
create policy "Allow verified admins to edit profiles" on public.profiles
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid()
      and public.profiles.is_verified = true
      and public.profiles.role in ('super_admin', 'admin', 'municipal_admin')
    )
  );

create policy "Allow authorized verified staff to edit news" on public.news
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid()
      and public.profiles.is_verified = true
      and public.profiles.role in ('super_admin', 'admin', 'editor', 'municipal_admin', 'barangay_admin')
    )
  );

create policy "Allow authorized verified staff to edit downloadables" on public.downloadables
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid()
      and public.profiles.is_verified = true
      and public.profiles.role in ('super_admin', 'admin', 'editor', 'municipal_admin')
    )
  );

create policy "Allow authorized verified staff to edit tourism_spots" on public.tourism_spots
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid()
      and public.profiles.is_verified = true
      and public.profiles.role in ('super_admin', 'admin', 'editor', 'municipal_admin')
    )
  );

create policy "Allow authorized verified staff to edit officials" on public.officials
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid()
      and public.profiles.is_verified = true
      and public.profiles.role in ('super_admin', 'admin', 'municipal_admin')
    )
  );

create policy "Allow authorized verified staff to edit departments" on public.departments
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid()
      and public.profiles.is_verified = true
      and public.profiles.role in ('super_admin', 'admin', 'municipal_admin')
    )
  );

create policy "Allow authorized verified staff to edit services_cms" on public.services_cms
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid()
      and public.profiles.is_verified = true
      and public.profiles.role in ('super_admin', 'admin', 'municipal_admin')
    )
  );

create policy "Allow authorized verified staff to edit citizens_charter_cms" on public.citizens_charter_cms
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid()
      and public.profiles.is_verified = true
      and public.profiles.role in ('super_admin', 'admin', 'municipal_admin')
    )
  );

create policy "Allow authorized verified staff to edit events" on public.events
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid()
      and public.profiles.is_verified = true
      and public.profiles.role in ('super_admin', 'admin', 'editor', 'municipal_admin')
    )
  );

create policy "Allow staff to view/write audit logs" on public.audit_logs
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid()
      and public.profiles.is_verified = true
    )
  );

-- INSERT INITIAL DEFAULT DATA FOR TESTING FALLBACK
insert into public.services_cms (name, slug, description, purpose, requirements, processing_time, office_responsible, physical_address, status, downloadable_forms)
values 
  ('Apply for Permit', 'apply-permit', 'Secure municipal permits, zoning clearance, and construction approvals.', 'To regulate and support business establishment.', array['Application Form', 'Barangay Clearance'], '3 to 5 business days', 'BPLO', 'Ground Floor, Executive Building', 'available', '[]'::jsonb)
on conflict do nothing;

-- ====================================================================
-- SPRINT 4C: NOTIFICATION CENTER SCHEMA
-- ====================================================================

create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  message text not null,
  category text not null check (category in (
    'Citizen Applications',
    'Workflow Updates',
    'Staff Verification',
    'News Approval',
    'Document Updates',
    'System Messages',
    'Department Announcements'
  )),
  department_id text,           -- e.g. "dept-1" (BPLO), "dept-2" (MTO), or NULL for broadcast
  user_id uuid,                 -- Optional: target specific user (references auth.users)
  is_read boolean not null default false,
  is_archived boolean not null default false,
  action_url text,              -- Tab or route target on View
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policies
create policy "Allow users to view authorized notifications" on public.notifications
  for select using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid()
      and (
        public.profiles.role in ('super_admin', 'admin') 
        or public.notifications.department_id is null   
        or public.notifications.department_id = public.profiles.department_id 
        or public.notifications.user_id = auth.uid()    
      )
    )
  );

create policy "Allow authorized staff to modify notifications" on public.notifications
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid()
      and public.profiles.is_verified = true
    )
  );
