-- Supabase Database Schema for CadyCore Photo Sales System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Photos table
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bib_number VARCHAR(20) NOT NULL UNIQUE,
  preview_url TEXT NOT NULL,
  highres_url TEXT NOT NULL,
  watermark_url TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Survey responses table
CREATE TABLE survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  bib_number VARCHAR(20) NOT NULL,
  runner_name VARCHAR(100),
  runner_email VARCHAR(255),
  age_group VARCHAR(50),
  race_experience VARCHAR(100),
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  would_recommend BOOLEAN,
  feedback TEXT,
  marketing_consent BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  bib_number VARCHAR(20) NOT NULL,
  stripe_session_id VARCHAR(255) UNIQUE,
  stripe_payment_intent_id VARCHAR(255),
  amount INTEGER NOT NULL DEFAULT 1000, -- $10.00 in cents
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Photo access table (tracks unlocked photos)
CREATE TABLE photo_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  bib_number VARCHAR(20) NOT NULL,
  survey_completed BOOLEAN DEFAULT FALSE,
  payment_completed BOOLEAN DEFAULT FALSE,
  is_unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_photos_bib_number ON photos(bib_number);
CREATE INDEX idx_survey_responses_photo_id ON survey_responses(photo_id);
CREATE INDEX idx_payments_photo_id ON payments(photo_id);
CREATE INDEX idx_payments_stripe_session_id ON payments(stripe_session_id);
CREATE INDEX idx_photo_access_photo_id ON photo_access(photo_id);
CREATE INDEX idx_photo_access_bib_number ON photo_access(bib_number);

-- Row Level Security (RLS) policies
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_access ENABLE ROW LEVEL SECURITY;

-- Public read access for photos
CREATE POLICY "Public can view active photos" ON photos
  FOR SELECT USING (is_active = TRUE);

-- Public insert for survey responses
CREATE POLICY "Public can insert survey responses" ON survey_responses
  FOR INSERT WITH CHECK (TRUE);

-- Public read access for own survey responses
CREATE POLICY "Public can view own survey responses" ON survey_responses
  FOR SELECT USING (TRUE);

-- Public insert for payments
CREATE POLICY "Public can insert payments" ON payments
  FOR INSERT WITH CHECK (TRUE);

-- Public read access for own payments
CREATE POLICY "Public can view own payments" ON payments
  FOR SELECT USING (TRUE);

-- Public access for photo_access
CREATE POLICY "Public can manage photo access" ON photo_access
  FOR ALL USING (TRUE);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', false);

-- Create storage policy for photos
CREATE POLICY "Public can view photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Service can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos');