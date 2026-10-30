-- ============================================================================
-- VisionPulse AI — Supabase Database Migration & RLS Security Script
-- Execute this script directly in the Supabase SQL Editor:
-- (Supabase Dashboard -> Project -> SQL Editor -> New Query)
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  organization VARCHAR(150) DEFAULT 'Default Operations',
  role VARCHAR(60) DEFAULT 'Visual Inspector',
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. INSPECTION SITES Table
CREATE TABLE IF NOT EXISTS public.inspection_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  location VARCHAR(200) NOT NULL,
  domain_category VARCHAR(60) NOT NULL,
  camera_or_source_type VARCHAR(80) DEFAULT 'Static Upload / Live Feed',
  status VARCHAR(40) DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. VISUAL INSPECTIONS Table
CREATE TABLE IF NOT EXISTS public.visual_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.inspection_sites(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  domain_category VARCHAR(60) NOT NULL,
  analysis_mode VARCHAR(60) NOT NULL,
  operator_notes TEXT,
  image_data_url TEXT NOT NULL,
  overall_status VARCHAR(40) NOT NULL,
  severity_level VARCHAR(30) NOT NULL,
  visual_health_score INTEGER NOT NULL CHECK (visual_health_score >= 0 AND visual_health_score <= 100),
  ai_summary TEXT NOT NULL,
  extracted_text_ocr TEXT,
  ai_raw_response JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. DETECTED ANOMALIES Table
CREATE TABLE IF NOT EXISTS public.detected_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.visual_inspections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  label VARCHAR(150) NOT NULL,
  category VARCHAR(80) NOT NULL,
  severity VARCHAR(30) NOT NULL,
  confidence_score NUMERIC(5,2) NOT NULL,
  location_region VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  root_cause_hypothesis TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  remediation_status VARCHAR(40) DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Indexes for High-Concurrency Performance
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON public.inspection_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_inspections_user_id ON public.visual_inspections(user_id);
CREATE INDEX IF NOT EXISTS idx_inspections_site_id ON public.visual_inspections(site_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_inspection_id ON public.detected_anomalies(inspection_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_user_id ON public.detected_anomalies(user_id);

-- 7. Supabase Storage Bucket Configuration (inspection-assets)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inspection-assets',
  'inspection-assets',
  true,
  12582912, -- 12MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Security Policy: Public read access for inspection assets
CREATE POLICY "Public Read Access for Inspection Assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'inspection-assets');

-- Storage Security Policy: Authenticated & Service Role upload access
CREATE POLICY "Service Role Upload Access for Inspection Assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'inspection-assets');

-- 8. Enable Row Level Security (RLS) on Tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visual_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detected_anomalies ENABLE ROW LEVEL SECURITY;

-- Allow service_role key full unrestricted access for backend API operations
CREATE POLICY "Service Role Full Access Users" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Sites" ON public.inspection_sites FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Inspections" ON public.visual_inspections FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Anomalies" ON public.detected_anomalies FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Allow anon key access for API operations managed via backend
CREATE POLICY "Anon Access Users" ON public.users FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon Access Sites" ON public.inspection_sites FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon Access Inspections" ON public.visual_inspections FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon Access Anomalies" ON public.detected_anomalies FOR ALL TO anon USING (true) WITH CHECK (true);

