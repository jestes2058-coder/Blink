-- ==============================================================================
-- BloodLink Database Schema for Supabase
--
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Go to your project -> SQL Editor
-- 3. Paste the entirety of this script and click "RUN"
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. Create Profiles / Users Table
-- ==============================================================================
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

-- ==============================================================================
-- 2. Create Donors Table
-- ==============================================================================
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

-- ==============================================================================
-- 3. Create Blood Requests Table
-- ==============================================================================
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

-- ==============================================================================
-- 4. Create Blood Banks Table
-- ==============================================================================
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
-- Performance Optimization Indexes
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_donors_blood_district ON public.donors (blood_group, district);
CREATE INDEX IF NOT EXISTS idx_donors_available ON public.donors (available);
CREATE INDEX IF NOT EXISTS idx_requests_district ON public.blood_requests (district);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.blood_requests (status);
CREATE INDEX IF NOT EXISTS idx_requests_urgency ON public.blood_requests (urgency);
CREATE INDEX IF NOT EXISTS idx_blood_banks_district ON public.blood_banks (district);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_banks ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if re-running
DO $$
BEGIN
  -- Profiles
  DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Public write profiles" ON public.profiles;
  
  -- Donors
  DROP POLICY IF EXISTS "Public read donors" ON public.donors;
  DROP POLICY IF EXISTS "Public insert donors" ON public.donors;
  DROP POLICY IF EXISTS "Public update donors" ON public.donors;
  
  -- Blood Requests
  DROP POLICY IF EXISTS "Public read requests" ON public.blood_requests;
  DROP POLICY IF EXISTS "Public insert requests" ON public.blood_requests;
  DROP POLICY IF EXISTS "Public update requests" ON public.blood_requests;
  DROP POLICY IF EXISTS "Public delete requests" ON public.blood_requests;
  
  -- Blood Banks
  DROP POLICY IF EXISTS "Public read blood banks" ON public.blood_banks;
  DROP POLICY IF EXISTS "Public write blood banks" ON public.blood_banks;
END $$;

-- Policies for public profiles
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public write profiles" ON public.profiles FOR ALL USING (true);

-- Policies for donors (Public lookup for emergency matching)
CREATE POLICY "Public read donors" ON public.donors FOR SELECT USING (true);
CREATE POLICY "Public insert donors" ON public.donors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update donors" ON public.donors FOR UPDATE USING (true);

-- Policies for emergency blood requests
CREATE POLICY "Public read requests" ON public.blood_requests FOR SELECT USING (true);
CREATE POLICY "Public insert requests" ON public.blood_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update requests" ON public.blood_requests FOR UPDATE USING (true);
CREATE POLICY "Public delete requests" ON public.blood_requests FOR DELETE USING (true);

-- Policies for blood banks
CREATE POLICY "Public read blood banks" ON public.blood_banks FOR SELECT USING (true);
CREATE POLICY "Public write blood banks" ON public.blood_banks FOR ALL USING (true);

-- ==============================================================================
-- Realtime Replication Setup
-- ==============================================================================
DO $$
BEGIN
  -- Enable Realtime on core matching tables
  ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_requests;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.donors;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_banks;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Already in publication, safely ignore
END $$;

-- ==============================================================================
-- Initial Seed Data for Blood Banks
-- ==============================================================================
INSERT INTO public.blood_banks (id, name, district, address, phone, timing, is_emergency_24x7, available_stock)
VALUES
  ('bb-1', 'Central Red Cross Blood Center', 'Central District', '450 Healthcare Ave, Medical Enclave', '+1-555-8001', 'Open 24/7 (Emergency Service)', true, '{"O+": "moderate", "O-": "critical", "A+": "high", "A-": "moderate", "B+": "high", "B-": "low", "AB+": "high", "AB-": "low"}'::jsonb),
  ('bb-2', 'North General Hospital Blood Bank', 'North District', '12 Hospital Way, North Valley', '+1-555-8002', 'Open 24/7', true, '{"O+": "high", "O-": "low", "A+": "moderate", "A-": "critical", "B+": "moderate", "B-": "moderate", "AB+": "high", "AB-": "moderate"}'::jsonb),
  ('bb-3', 'South District Rotary Blood Care', 'South District', '89 Civic Center Blvd, Southside', '+1-555-8003', '8:00 AM – 10:00 PM', false, '{"O+": "moderate", "O-": "moderate", "A+": "high", "A-": "high", "B+": "critical", "B-": "low", "AB+": "moderate", "AB-": "critical"}'::jsonb),
  ('bb-4', 'Riverside Community Blood Foundation', 'Riverside', '304 Riverfront Road', '+1-555-8004', 'Open 24/7', true, '{"O+": "high", "O-": "low", "A+": "high", "A-": "moderate", "B+": "high", "B-": "low", "AB+": "moderate", "AB-": "low"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  district = EXCLUDED.district,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  timing = EXCLUDED.timing,
  is_emergency_24x7 = EXCLUDED.is_emergency_24x7,
  available_stock = EXCLUDED.available_stock;
