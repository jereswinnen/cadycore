-- Clean up existing data (in correct order due to foreign key constraints)
DELETE FROM survey_responses;
DELETE FROM payments;
DELETE FROM photo_access;
DELETE FROM photos;

-- Reset sequences (optional, but keeps IDs clean)
-- Note: Supabase uses UUID by default, so this may not be necessary

-- Re-insert dummy photos
INSERT INTO photos (bib_number, preview_url, highres_url, watermark_url, metadata) VALUES
('1001', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=90', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', '{"event": "Marathon 2024", "photographer": "John Doe"}'),
('1002', 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&q=80', 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=1920&q=90', 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&q=80', '{"event": "Marathon 2024", "photographer": "Jane Smith"}'),
('1003', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1920&q=90', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80', '{"event": "Marathon 2024", "photographer": "Mike Johnson"}'),
('1004', 'https://images.unsplash.com/photo-1486218119243-13883505764c?w=800&q=80', 'https://images.unsplash.com/photo-1486218119243-13883505764c?w=1920&q=90', 'https://images.unsplash.com/photo-1486218119243-13883505764c?w=800&q=80', '{"event": "Marathon 2024", "photographer": "Sarah Wilson"}'),
('1005', 'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?w=800&q=80', 'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?w=1920&q=90', 'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?w=800&q=80', '{"event": "Marathon 2024", "photographer": "David Brown"}');

-- Insert photo access records (these will be created automatically when photos are accessed, but we can pre-create some for testing)
INSERT INTO photo_access (photo_id, bib_number, survey_completed, payment_completed, is_unlocked) 
SELECT id, bib_number, false, false, false 
FROM photos 
WHERE bib_number IN ('1001', '1002', '1003', '1004', '1005');

-- Insert a completed survey response for testing (bib 1001)
INSERT INTO survey_responses (photo_id, bib_number, runner_name, runner_email, age_group, race_experience, satisfaction_rating, would_recommend, feedback, marketing_consent)
SELECT id, '1001', 'John Runner', 'john@example.com', '30-39', 'intermediate', 5, true, 'Great race! Amazing organization and support.', true
FROM photos WHERE bib_number = '1001';

-- Update photo access for bib 1001 to show survey completed
UPDATE photo_access 
SET survey_completed = true 
WHERE bib_number = '1001';

-- Insert a payment record for testing (bib 1001)
INSERT INTO payments (photo_id, bib_number, stripe_session_id, amount, currency, status, completed_at)
SELECT id, '1001', 'cs_test_completed_12345', 1000, 'USD', 'completed', NOW()
FROM photos WHERE bib_number = '1001';

-- Update photo access for bib 1001 to show payment completed and photo unlocked
UPDATE photo_access 
SET payment_completed = true, is_unlocked = true, unlocked_at = NOW()
WHERE bib_number = '1001';

-- Verify the data was inserted correctly
SELECT 'Photos' as table_name, COUNT(*) as count FROM photos
UNION ALL
SELECT 'Photo Access' as table_name, COUNT(*) as count FROM photo_access
UNION ALL
SELECT 'Survey Responses' as table_name, COUNT(*) as count FROM survey_responses
UNION ALL
SELECT 'Payments' as table_name, COUNT(*) as count FROM payments;

-- Show the status of each bib
SELECT 
    p.bib_number,
    pa.survey_completed,
    pa.payment_completed,
    pa.is_unlocked,
    pa.download_count,
    py.status as payment_status
FROM photos p
LEFT JOIN photo_access pa ON p.id = pa.photo_id
LEFT JOIN payments py ON p.id = py.photo_id
ORDER BY p.bib_number;