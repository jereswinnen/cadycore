-- Complete Database Seed for CadyCore Photo Sales System with Email Integration
-- This script clears all data and seeds with dummy data, including email tracking columns

-- Clear existing data (in correct order to handle foreign key constraints)
DELETE FROM order_items;
DELETE FROM photo_access;
DELETE FROM photo_selections;
DELETE FROM survey_responses;
DELETE FROM payments;
DELETE FROM photos;

-- Add email tracking columns to payments table if they don't exist
DO $$
BEGIN
    -- Add email_sent column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payments' AND column_name = 'email_sent') THEN
        ALTER TABLE payments ADD COLUMN email_sent BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add email_sent_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payments' AND column_name = 'email_sent_at') THEN
        ALTER TABLE payments ADD COLUMN email_sent_at TIMESTAMPTZ NULL;
    END IF;
    
    -- Add email_attempts column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payments' AND column_name = 'email_attempts') THEN
        ALTER TABLE payments ADD COLUMN email_attempts INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create index for email tracking queries if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payments_email_sent') THEN
        CREATE INDEX idx_payments_email_sent ON payments(email_sent, created_at);
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN payments.email_sent IS 'Whether photo zip has been emailed to customer';
COMMENT ON COLUMN payments.email_sent_at IS 'Timestamp when email was successfully sent';
COMMENT ON COLUMN payments.email_attempts IS 'Number of email delivery attempts made';

-- Insert multiple photos for testing
INSERT INTO photos (id, bib_number, preview_url, highres_url, uploaded_at, is_active, photo_order) VALUES
  -- Bib 1001: 2 photos
  ('11111111-1111-4111-1111-111111111111', '1001', 'https://images.unsplash.com/photo-1752649937266-1900d9e176c3?w=600', 'https://images.unsplash.com/photo-1752649937266-1900d9e176c3?w=1200', NOW() - INTERVAL '1 day', TRUE, 1),
  ('11111111-1111-4111-1111-111111111112', '1001', 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600', 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200', NOW() - INTERVAL '1 day', TRUE, 2),
  
  -- Bib 1002: 3 photos
  ('22222222-2222-4222-2222-222222222221', '1002', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200', NOW() - INTERVAL '2 days', TRUE, 1),
  ('22222222-2222-4222-2222-222222222222', '1002', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200', NOW() - INTERVAL '2 days', TRUE, 2),
  ('22222222-2222-4222-2222-222222222223', '1002', 'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=600', 'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=1200', NOW() - INTERVAL '2 days', TRUE, 3),
  
  -- Bib 1003: 4 photos
  ('33333333-3333-4333-3333-333333333331', '1003', 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?w=600', 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?w=1200', NOW() - INTERVAL '3 days', TRUE, 1),
  ('33333333-3333-4333-3333-333333333332', '1003', 'https://images.unsplash.com/photo-1752649937266-1900d9e176c3?w=600', 'https://images.unsplash.com/photo-1752649937266-1900d9e176c3?w=1200', NOW() - INTERVAL '3 days', TRUE, 2),
  ('33333333-3333-4333-3333-333333333333', '1003', 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600', 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200', NOW() - INTERVAL '3 days', TRUE, 3),
  ('33333333-3333-4333-3333-333333333334', '1003', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200', NOW() - INTERVAL '3 days', TRUE, 4),
  
  -- Bib 1004: 5 photos (for testing 5+ pricing)
  ('44444444-4444-4444-4444-444444444441', '1004', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200', NOW() - INTERVAL '4 days', TRUE, 1),
  ('44444444-4444-4444-4444-444444444442', '1004', 'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=600', 'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=1200', NOW() - INTERVAL '4 days', TRUE, 2),
  ('44444444-4444-4444-4444-444444444443', '1004', 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?w=600', 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?w=1200', NOW() - INTERVAL '4 days', TRUE, 3),
  ('44444444-4444-4444-4444-444444444444', '1004', 'https://images.unsplash.com/photo-1752649937266-1900d9e176c3?w=600', 'https://images.unsplash.com/photo-1752649937266-1900d9e176c3?w=1200', NOW() - INTERVAL '4 days', TRUE, 4),
  ('44444444-4444-4444-4444-444444444445', '1004', 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600', 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200', NOW() - INTERVAL '4 days', TRUE, 5),
  
  -- Bib 1005: 1 photo (for testing single photo pricing)
  ('55555555-5555-4555-5555-555555555555', '1005', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200', NOW() - INTERVAL '5 days', TRUE, 1),
  
  -- Bib 1006: 6 photos (for testing 5+ pricing with more photos)
  ('66666666-6666-4666-6666-666666666661', '1006', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200', NOW() - INTERVAL '6 days', TRUE, 1),
  ('66666666-6666-4666-6666-666666666662', '1006', 'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=600', 'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=1200', NOW() - INTERVAL '6 days', TRUE, 2),
  ('66666666-6666-4666-6666-666666666663', '1006', 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?w=600', 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?w=1200', NOW() - INTERVAL '6 days', TRUE, 3),
  ('66666666-6666-4666-6666-666666666664', '1006', 'https://images.unsplash.com/photo-1752649937266-1900d9e176c3?w=600', 'https://images.unsplash.com/photo-1752649937266-1900d9e176c3?w=1200', NOW() - INTERVAL '6 days', TRUE, 4),
  ('66666666-6666-4666-6666-666666666665', '1006', 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600', 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200', NOW() - INTERVAL '6 days', TRUE, 5),
  ('66666666-6666-4666-6666-666666666666', '1006', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200', NOW() - INTERVAL '6 days', TRUE, 6);

-- Insert default photo selections (all photos selected by default)
INSERT INTO photo_selections (bib_number, photo_id, is_selected) VALUES
  -- Bib 1001 selections
  ('1001', '11111111-1111-4111-1111-111111111111', TRUE),
  ('1001', '11111111-1111-4111-1111-111111111112', TRUE),
  
  -- Bib 1002 selections
  ('1002', '22222222-2222-4222-2222-222222222221', TRUE),
  ('1002', '22222222-2222-4222-2222-222222222222', TRUE),
  ('1002', '22222222-2222-4222-2222-222222222223', TRUE),
  
  -- Bib 1003 selections
  ('1003', '33333333-3333-4333-3333-333333333331', TRUE),
  ('1003', '33333333-3333-4333-3333-333333333332', TRUE),
  ('1003', '33333333-3333-4333-3333-333333333333', TRUE),
  ('1003', '33333333-3333-4333-3333-333333333334', TRUE),
  
  -- Bib 1004 selections
  ('1004', '44444444-4444-4444-4444-444444444441', TRUE),
  ('1004', '44444444-4444-4444-4444-444444444442', TRUE),
  ('1004', '44444444-4444-4444-4444-444444444443', TRUE),
  ('1004', '44444444-4444-4444-4444-444444444444', TRUE),
  ('1004', '44444444-4444-4444-4444-444444444445', TRUE),
  
  -- Bib 1005 selection
  ('1005', '55555555-5555-4555-5555-555555555555', TRUE),
  
  -- Bib 1006 selections
  ('1006', '66666666-6666-4666-6666-666666666661', TRUE),
  ('1006', '66666666-6666-4666-6666-666666666662', TRUE),
  ('1006', '66666666-6666-4666-6666-666666666663', TRUE),
  ('1006', '66666666-6666-4666-6666-666666666664', TRUE),
  ('1006', '66666666-6666-4666-6666-666666666665', TRUE),
  ('1006', '66666666-6666-4666-6666-666666666666', TRUE);

-- Insert photo access records for all photos (initially locked)
INSERT INTO photo_access (photo_id, bib_number, survey_completed, payment_completed, is_unlocked) 
SELECT id, bib_number, FALSE, FALSE, FALSE 
FROM photos;

-- Insert sample survey responses for testing different scenarios
INSERT INTO survey_responses (id, bib_number, selected_photo_ids, runner_name, runner_email, age_group, race_experience, satisfaction_rating, would_recommend, feedback, marketing_consent, completed_at) VALUES
  -- Bib 1001: Survey completed, ready for payment
  ('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', '1001', 
   ARRAY['11111111-1111-4111-1111-111111111111', '11111111-1111-4111-1111-111111111112']::uuid[], 
   'John Runner', 'hey@jeremys.be', '30-39', 'intermediate', 5, TRUE, 'Great race experience!', TRUE, NOW() - INTERVAL '2 hours'),
  
  -- Bib 1002: Survey completed, ready for payment
  ('bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', '1002', 
   ARRAY['22222222-2222-4222-2222-222222222221', '22222222-2222-4222-2222-222222222222', '22222222-2222-4222-2222-222222222223']::uuid[], 
   'Sarah Fast', 'hey@jeremys.be', '25-29', 'advanced', 4, TRUE, 'Well organized event', TRUE, NOW() - INTERVAL '3 hours'),
   
  -- Bib 1003: Survey completed, ready for payment
  ('cccccccc-cccc-4ccc-cccc-cccccccccccc', '1003', 
   ARRAY['33333333-3333-4333-3333-333333333331', '33333333-3333-4333-3333-333333333332', '33333333-3333-4333-3333-333333333333', '33333333-3333-4333-3333-333333333334']::uuid[], 
   'Mike Swift', 'hey@jeremys.be', '40-49', 'beginner', 5, TRUE, 'First race, loved it!', FALSE, NOW() - INTERVAL '1 hour');

-- Insert sample payment records with different email statuses for testing
INSERT INTO payments (id, bib_number, selected_photo_ids, stripe_session_id, stripe_payment_intent_id, total_photos, price_per_photo, total_amount, currency, status, created_at, completed_at, email_sent, email_sent_at, email_attempts) VALUES
  -- Bib 1001: Payment completed, email sent successfully
  ('10011001-1001-4001-8001-100110011001', '1001', 
   ARRAY['11111111-1111-4111-1111-111111111111', '11111111-1111-4111-1111-111111111112']::uuid[],
   'cs_test_1001', 'pi_test_1001', 2, 1500, 3000, 'usd', 'completed', 
   NOW() - INTERVAL '1 hour', NOW() - INTERVAL '50 minutes', TRUE, NOW() - INTERVAL '45 minutes', 1),
   
  -- Bib 1002: Payment completed, email failed (for testing manual email)
  ('10021002-1002-4002-8002-100210021002', '1002', 
   ARRAY['22222222-2222-4222-2222-222222222221', '22222222-2222-4222-2222-222222222222', '22222222-2222-4222-2222-222222222223']::uuid[],
   'cs_test_1002', 'pi_test_1002', 3, 1200, 3600, 'usd', 'completed', 
   NOW() - INTERVAL '2 hours', NOW() - INTERVAL '110 minutes', FALSE, NULL, 2),
   
  -- Bib 1003: Payment completed, email pending (for testing automatic email)
  ('10031003-1003-4003-8003-100310031003', '1003', 
   ARRAY['33333333-3333-4333-3333-333333333331', '33333333-3333-4333-3333-333333333332', '33333333-3333-4333-3333-333333333333', '33333333-3333-4333-3333-333333333334']::uuid[],
   'cs_test_1003', 'pi_test_1003', 4, 1000, 4000, 'usd', 'completed', 
   NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '25 minutes', FALSE, NULL, 0);

-- Update photo access records to reflect completed payments and surveys
UPDATE photo_access SET 
  survey_completed = TRUE,
  payment_completed = TRUE,
  is_unlocked = TRUE,
  unlocked_at = NOW() - INTERVAL '45 minutes'
WHERE bib_number IN ('1001', '1002', '1003');

-- Insert order items for the completed payments
INSERT INTO order_items (payment_id, photo_id, price_paid, created_at) VALUES
  -- Order items for Bib 1001
  ('10011001-1001-4001-8001-100110011001', '11111111-1111-4111-1111-111111111111', 1500, NOW() - INTERVAL '45 minutes'),
  ('10011001-1001-4001-8001-100110011001', '11111111-1111-4111-1111-111111111112', 1500, NOW() - INTERVAL '45 minutes'),
  
  -- Order items for Bib 1002
  ('10021002-1002-4002-8002-100210021002', '22222222-2222-4222-2222-222222222221', 1200, NOW() - INTERVAL '105 minutes'),
  ('10021002-1002-4002-8002-100210021002', '22222222-2222-4222-2222-222222222222', 1200, NOW() - INTERVAL '105 minutes'),
  ('10021002-1002-4002-8002-100210021002', '22222222-2222-4222-2222-222222222223', 1200, NOW() - INTERVAL '105 minutes'),
  
  -- Order items for Bib 1003
  ('10031003-1003-4003-8003-100310031003', '33333333-3333-4333-3333-333333333331', 1000, NOW() - INTERVAL '20 minutes'),
  ('10031003-1003-4003-8003-100310031003', '33333333-3333-4333-3333-333333333332', 1000, NOW() - INTERVAL '20 minutes'),
  ('10031003-1003-4003-8003-100310031003', '33333333-3333-4333-3333-333333333333', 1000, NOW() - INTERVAL '20 minutes'),
  ('10031003-1003-4003-8003-100310031003', '33333333-3333-4333-3333-333333333334', 1000, NOW() - INTERVAL '20 minutes');

-- Display summary of seeded data
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database seeding completed successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Photos created: %', (SELECT COUNT(*) FROM photos);
    RAISE NOTICE 'Photo selections: %', (SELECT COUNT(*) FROM photo_selections);
    RAISE NOTICE 'Photo access records: %', (SELECT COUNT(*) FROM photo_access);
    RAISE NOTICE 'Survey responses: %', (SELECT COUNT(*) FROM survey_responses);
    RAISE NOTICE 'Payments: %', (SELECT COUNT(*) FROM payments);
    RAISE NOTICE 'Order items: %', (SELECT COUNT(*) FROM order_items);
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Test Bib Numbers Available:';
    RAISE NOTICE '- 1001: 2 photos, payment completed, email sent';
    RAISE NOTICE '- 1002: 3 photos, payment completed, email failed';
    RAISE NOTICE '- 1003: 4 photos, payment completed, email pending';
    RAISE NOTICE '- 1004: 5 photos, no payment (test checkout)';
    RAISE NOTICE '- 1005: 1 photo, no payment (test single photo)';
    RAISE NOTICE '- 1006: 6 photos, no payment (test bulk pricing)';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Email Integration Testing:';
    RAISE NOTICE '- Bib 1001: Test success page with email sent status';
    RAISE NOTICE '- Bib 1002: Test manual email sending (failed email)';
    RAISE NOTICE '- Bib 1003: Test automatic email after webhook';
    RAISE NOTICE '========================================';
END $$;