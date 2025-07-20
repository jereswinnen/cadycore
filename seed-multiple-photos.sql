-- Seed data for CadyCore Photo Sales System (Multiple Photos Support)

-- Clear existing data
DELETE FROM order_items;
DELETE FROM photo_access;
DELETE FROM photo_selections;
DELETE FROM survey_responses;
DELETE FROM payments;
DELETE FROM photos;

-- Insert multiple photos for testing
INSERT INTO photos (id, bib_number, preview_url, highres_url, uploaded_at, is_active, photo_order) VALUES
  -- Bib 1001: 2 photos
  ('11111111-1111-4111-1111-111111111111', '1001', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200', NOW() - INTERVAL '1 day', TRUE, 1),
  ('11111111-1111-4111-1111-111111111112', '1001', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200', NOW() - INTERVAL '1 day', TRUE, 2),
  
  -- Bib 1002: 3 photos
  ('22222222-2222-4222-2222-222222222221', '1002', 'https://images.unsplash.com/photo-1544746504-4f37c90309bb?w=600', 'https://images.unsplash.com/photo-1544746504-4f37c90309bb?w=1200', NOW() - INTERVAL '2 days', TRUE, 1),
  ('22222222-2222-4222-2222-222222222222', '1002', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200', NOW() - INTERVAL '2 days', TRUE, 2),
  ('22222222-2222-4222-2222-222222222223', '1002', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200', NOW() - INTERVAL '2 days', TRUE, 3),
  
  -- Bib 1003: 4 photos
  ('33333333-3333-4333-3333-333333333331', '1003', 'https://images.unsplash.com/photo-1566003711743-bb38f7ac0f21?w=600', 'https://images.unsplash.com/photo-1566003711743-bb38f7ac0f21?w=1200', NOW() - INTERVAL '3 days', TRUE, 1),
  ('33333333-3333-4333-3333-333333333332', '1003', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200', NOW() - INTERVAL '3 days', TRUE, 2),
  ('33333333-3333-4333-3333-333333333333', '1003', 'https://images.unsplash.com/photo-1544746504-4f37c90309bb?w=600', 'https://images.unsplash.com/photo-1544746504-4f37c90309bb?w=1200', NOW() - INTERVAL '3 days', TRUE, 3),
  ('33333333-3333-4333-3333-333333333334', '1003', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200', NOW() - INTERVAL '3 days', TRUE, 4),
  
  -- Bib 1004: 5 photos (for testing 5+ pricing)
  ('44444444-4444-4444-4444-444444444441', '1004', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200', NOW() - INTERVAL '4 days', TRUE, 1),
  ('44444444-4444-4444-4444-444444444442', '1004', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200', NOW() - INTERVAL '4 days', TRUE, 2),
  ('44444444-4444-4444-4444-444444444443', '1004', 'https://images.unsplash.com/photo-1566003711743-bb38f7ac0f21?w=600', 'https://images.unsplash.com/photo-1566003711743-bb38f7ac0f21?w=1200', NOW() - INTERVAL '4 days', TRUE, 3),
  ('44444444-4444-4444-4444-444444444444', '1004', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200', NOW() - INTERVAL '4 days', TRUE, 4),
  ('44444444-4444-4444-4444-444444444445', '1004', 'https://images.unsplash.com/photo-1544746504-4f37c90309bb?w=600', 'https://images.unsplash.com/photo-1544746504-4f37c90309bb?w=1200', NOW() - INTERVAL '4 days', TRUE, 5),
  
  -- Bib 1005: 1 photo (for testing single photo pricing)
  ('55555555-5555-4555-5555-555555555555', '1005', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200', NOW() - INTERVAL '5 days', TRUE, 1),
  
  -- Bib 1006: 6 photos (for testing 5+ pricing with more photos)
  ('66666666-6666-4666-6666-666666666661', '1006', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200', NOW() - INTERVAL '6 days', TRUE, 1),
  ('66666666-6666-4666-6666-666666666662', '1006', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200', NOW() - INTERVAL '6 days', TRUE, 2),
  ('66666666-6666-4666-6666-666666666663', '1006', 'https://images.unsplash.com/photo-1566003711743-bb38f7ac0f21?w=600', 'https://images.unsplash.com/photo-1566003711743-bb38f7ac0f21?w=1200', NOW() - INTERVAL '6 days', TRUE, 3),
  ('66666666-6666-4666-6666-666666666664', '1006', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200', NOW() - INTERVAL '6 days', TRUE, 4),
  ('66666666-6666-4666-6666-666666666665', '1006', 'https://images.unsplash.com/photo-1544746504-4f37c90309bb?w=600', 'https://images.unsplash.com/photo-1544746504-4f37c90309bb?w=1200', NOW() - INTERVAL '6 days', TRUE, 5),
  ('66666666-6666-4666-6666-666666666666', '1006', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200', NOW() - INTERVAL '6 days', TRUE, 6);

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