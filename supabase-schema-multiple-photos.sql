-- Supabase Database Schema for CadyCore Photo Sales System (Multiple Photos Support)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Photos table (UPDATED: removed unique constraint on bib_number)
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bib_number VARCHAR(20) NOT NULL, -- CHANGED: Removed UNIQUE constraint
  preview_url TEXT NOT NULL,
  highres_url TEXT NOT NULL,
  watermark_url TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Add photo ordering for consistent display
  photo_order INTEGER DEFAULT 1
);

-- Survey responses table (UPDATED: can reference multiple photos)
CREATE TABLE survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bib_number VARCHAR(20) NOT NULL, -- CHANGED: Primary reference instead of photo_id
  selected_photo_ids UUID[] NOT NULL, -- NEW: Array of photo IDs
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

-- Photo selections table (NEW: tracks individual photo selections)
CREATE TABLE photo_selections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bib_number VARCHAR(20) NOT NULL,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  is_selected BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bib_number, photo_id)
);

-- Payments table (UPDATED: supports multiple photos)
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bib_number VARCHAR(20) NOT NULL,
  selected_photo_ids UUID[] NOT NULL, -- NEW: Array of photo IDs
  stripe_session_id VARCHAR(255) UNIQUE,
  stripe_payment_intent_id VARCHAR(255),
  total_photos INTEGER NOT NULL DEFAULT 1, -- NEW: Number of photos purchased
  price_per_photo INTEGER NOT NULL, -- NEW: Price per photo in cents
  total_amount INTEGER NOT NULL, -- NEW: Total amount in cents
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Photo access table (UPDATED: tracks individual photo unlocks)
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(photo_id, bib_number) -- Ensure one access record per photo per bib
);

-- Order items table (NEW: tracks individual photo purchases)
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  price_paid INTEGER NOT NULL, -- Price paid for this specific photo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_photos_bib_number ON photos(bib_number);
CREATE INDEX idx_photos_bib_number_active ON photos(bib_number, is_active);
CREATE INDEX idx_survey_responses_bib_number ON survey_responses(bib_number);
CREATE INDEX idx_photo_selections_bib_number ON photo_selections(bib_number);
CREATE INDEX idx_photo_selections_photo_id ON photo_selections(photo_id);
CREATE INDEX idx_payments_bib_number ON payments(bib_number);
CREATE INDEX idx_payments_stripe_session_id ON payments(stripe_session_id);
CREATE INDEX idx_photo_access_photo_id ON photo_access(photo_id);
CREATE INDEX idx_photo_access_bib_number ON photo_access(bib_number);
CREATE INDEX idx_photo_access_bib_photo ON photo_access(bib_number, photo_id);
CREATE INDEX idx_order_items_payment_id ON order_items(payment_id);
CREATE INDEX idx_order_items_photo_id ON order_items(photo_id);

-- Row Level Security (RLS) policies
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Public read access for photos
CREATE POLICY "Public can view active photos" ON photos
  FOR SELECT USING (is_active = TRUE);

-- Public insert for survey responses
CREATE POLICY "Public can insert survey responses" ON survey_responses
  FOR INSERT WITH CHECK (TRUE);

-- Public read access for own survey responses
CREATE POLICY "Public can view own survey responses" ON survey_responses
  FOR SELECT USING (TRUE);

-- Public access for photo selections
CREATE POLICY "Public can manage photo selections" ON photo_selections
  FOR ALL USING (TRUE);

-- Public insert for payments
CREATE POLICY "Public can insert payments" ON payments
  FOR INSERT WITH CHECK (TRUE);

-- Public read access for own payments
CREATE POLICY "Public can view own payments" ON payments
  FOR SELECT USING (TRUE);

-- Public access for photo_access
CREATE POLICY "Public can manage photo access" ON photo_access
  FOR ALL USING (TRUE);

-- Public read access for order items
CREATE POLICY "Public can view order items" ON order_items
  FOR SELECT USING (TRUE);

-- Public insert for order items
CREATE POLICY "Public can insert order items" ON order_items
  FOR INSERT WITH CHECK (TRUE);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', false);

-- Create storage policy for photos
CREATE POLICY "Public can view photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Service can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos');