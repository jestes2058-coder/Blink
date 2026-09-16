-- ==============================================================================
-- BloodLink Database Schema for Supabase
-- Copy and paste this script into your Supabase project's SQL Editor and click RUN.
-- ==============================================================================

-- 1. Create Profiles / Users Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  blood_group TEXT,
  district TEXT,
  is_donor BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Donors Table
CREATE TABLE IF NOT EXISTS public.donors (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  district TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  last_donation TIMESTAMPTZ,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  total_donations INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true
);

-- 3. Create Blood Requests Table
CREATE TABLE IF NOT EXISTS public.blood_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  requestor_id TEXT NOT NULL,
  requestor_name TEXT NOT NULL,
  requestor_phone TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  district TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'urgent',
  hospital TEXT NOT NULL,
  units_needed INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'open',
  matches JSONB DEFAULT '[]'::jsonb
);

-- 4. Create Blood Banks Table
CREATE TABLE IF NOT EXISTS public.blood_banks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  timing TEXT NOT NULL,
  is_emergency_24x7 BOOLEAN DEFAULT true,
  available_stock JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_banks ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active donors for emergency matching
CREATE POLICY "Public read donors" ON public.donors FOR SELECT USING (true);
CREATE POLICY "Public insert donors" ON public.donors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update donors" ON public.donors FOR UPDATE USING (true);

-- Allow public read & insert for blood requests
CREATE POLICY "Public read requests" ON public.blood_requests FOR SELECT USING (true);
CREATE POLICY "Public insert requests" ON public.blood_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update requests" ON public.blood_requests FOR UPDATE USING (true);
CREATE POLICY "Public delete requests" ON public.blood_requests FOR DELETE USING (true);

-- Allow read for blood banks
CREATE POLICY "Public read blood banks" ON public.blood_banks FOR SELECT USING (true);

-- Allow profile access
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public write profiles" ON public.profiles FOR ALL USING (true);

-- ==============================================================================
-- Initial Seed Data for Blood Banks
-- ==============================================================================
INSERT INTO public.blood_banks (id, name, district, address, phone, timing, is_emergency_24x7, available_stock)
VALUES
  ('bb-1', 'Central Red Cross Blood Center', 'Central District', '450 Healthcare Ave, Medical Enclave', '+1-555-8001', 'Open 24/7 (Emergency Service)', true, '{"O+": "moderate", "O-": "critical", "A+": "high", "A-": "moderate", "B+": "high", "B-": "low", "AB+": "high", "AB-": "low"}'::jsonb),
  ('bb-2', 'North General Hospital Blood Bank', 'North District', '12 Hospital Way, North Valley', '+1-555-8002', 'Open 24/7', true, '{"O+": "high", "O-": "low", "A+": "moderate", "A-": "critical", "B+": "moderate", "B-": "moderate", "AB+": "high", "AB-": "moderate"}'::jsonb),
  ('bb-3', 'South District Rotary Blood Care', 'South District', '89 Civic Center Blvd, Southside', '+1-555-8003', '8:00 AM – 10:00 PM', false, '{"O+": "moderate", "O-": "moderate", "A+": "high", "A-": "high", "B+": "critical", "B-": "low", "AB+": "moderate", "AB-": "critical"}'::jsonb),
  ('bb-4', 'Riverside Community Blood Foundation', 'Riverside', '304 Riverfront Road', '+1-555-8004', 'Open 24/7', true, '{"O+": "high", "O-": "low", "A+": "high", "A-": "moderate", "B+": "high", "B-": "low", "AB+": "moderate", "AB-": "low"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
