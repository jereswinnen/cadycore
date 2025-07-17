-- Manually unlock bib 1002 for testing
UPDATE photo_access 
SET survey_completed = true, 
    payment_completed = true, 
    is_unlocked = true, 
    unlocked_at = NOW()
WHERE bib_number = '1002';

-- Check the status
SELECT pa.*, p.bib_number, p.preview_url, p.highres_url 
FROM photo_access pa 
JOIN photos p ON pa.photo_id = p.id 
WHERE pa.bib_number = '1002';