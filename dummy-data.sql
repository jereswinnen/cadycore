-- Insert dummy photos
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
INSERT INTO payments (photo_id, bib_number, stripe_session_id, amount, currency, status)
SELECT id, '1001', 'cs_test_completed_12345', 1000, 'USD', 'completed'
FROM photos WHERE bib_number = '1001';

-- Update photo access for bib 1001 to show payment completed and photo unlocked
UPDATE photo_access 
SET payment_completed = true, is_unlocked = true, unlocked_at = NOW()
WHERE bib_number = '1001';