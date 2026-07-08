-- SUPABASE SQL SCHEMA FOR TALIBON DIGITAL CORE
-- Execute this in your Supabase SQL Editor

-- 1. Profiles table for RBAC
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'barangay_admin' CHECK (role IN ('municipal_admin', 'barangay_admin')),
  barangay_id TEXT, -- Scope for barangay admins (slug)
  is_verified BOOLEAN DEFAULT FALSE, -- Only verified admins can edit
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewab le by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. News/Articles (Macro and Micro)
CREATE TABLE news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  category TEXT NOT NULL, -- ARTICLE, ADVISORY, DISASTER, UPDATE, etc.
  image_url TEXT,
  file_url TEXT,
  date DATE DEFAULT CURRENT_DATE,
  barangay_id TEXT, -- NULL for municipal, slug for barangay
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News is viewable by everyone." ON news FOR SELECT USING (true);
CREATE POLICY "Municipal admins can manage all news." ON news FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'municipal_admin' AND is_verified = true)
);
CREATE POLICY "Barangay admins can manage their own news." ON news FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'barangay_admin' AND barangay_id = news.barangay_id AND is_verified = true)
);

-- 3. Ordinances
CREATE TABLE ordinances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  no TEXT NOT NULL,
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  date_enacted DATE,
  pdf_url TEXT,
  barangay_id TEXT, -- NULL for municipal, slug for barangay
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ordinances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ordinances are viewable by everyone." ON ordinances FOR SELECT USING (true);
CREATE POLICY "Admins can manage ordinances based on scope." ON ordinances FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_verified = true AND (
    role = 'municipal_admin' OR (role = 'barangay_admin' AND barangay_id = ordinances.barangay_id)
  ))
);

-- 4. Resolutions
CREATE TABLE resolutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  no TEXT NOT NULL,
  title TEXT NOT NULL,
  date DATE,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE resolutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resolutions are viewable by everyone." ON resolutions FOR SELECT USING (true);
CREATE POLICY "Municipal admins can manage resolutions." ON resolutions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'municipal_admin' AND is_verified = true)
);

-- 5. Officials (Organizational Chart)
CREATE TABLE officials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  level INTEGER NOT NULL, -- 1: Mayor, 2: SB/Admin, 3: Dept
  display_order INTEGER DEFAULT 0,
  barangay_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE officials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Officials are viewable by everyone." ON officials FOR SELECT USING (true);
CREATE POLICY "Municipal admins can manage officials." ON officials FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'municipal_admin' AND is_verified = true)
);

-- 6. Navigation
CREATE TABLE navigation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  href TEXT NOT NULL,
  section TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  is_external BOOLEAN DEFAULT FALSE
);

ALTER TABLE navigation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Navigation is viewable by everyone." ON navigation FOR SELECT USING (true);
CREATE POLICY "Municipal admins can manage navigation." ON navigation FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'municipal_admin' AND is_verified = true)
);

-- 7. Content (Static Sections)
CREATE TABLE content (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content is viewable by everyone." ON content FOR SELECT USING (true);
CREATE POLICY "Municipal admins can manage content." ON content FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'municipal_admin' AND is_verified = true)
);

-- 8. Meetings
CREATE TABLE meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  transcription TEXT,
  author TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Meetings are viewable by admins." ON meetings FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_verified = true)
);
CREATE POLICY "Admins can manage meetings." ON meetings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_verified = true)
);

-- 9. GAD Beneficiaries (Individual Profiling)
CREATE TABLE gad_beneficiaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unique_id TEXT UNIQUE, -- Custom generated or system ID
  full_name TEXT NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('Male', 'Female', 'Other')),
  birthdate DATE,
  age INTEGER, -- Can be calculated or stored
  barangay_id TEXT NOT NULL, -- References BARANGAYS config slugs
  civil_status TEXT CHECK (civil_status IN ('Single', 'Married', 'Widowed', 'Separated', 'Common-law')),
  sectoral_classification TEXT[], -- Array for multiple (PWD, Senior, etc.)
  contact_info TEXT,
  encoded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gad_beneficiaries ENABLE ROW LEVEL SECURITY;

-- Only verified admins/encoders can manage GAD data
CREATE POLICY "GAD data is viewable by authorized personnel." ON gad_beneficiaries FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_verified = true)
);

CREATE POLICY "Authorized personnel can manage GAD beneficiaries." ON gad_beneficiaries FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_verified = true)
);

-- STORAGE BUCKET: public-assets
-- Ensure you create a bucket named 'public-assets' in Supabase Storage with public access.
