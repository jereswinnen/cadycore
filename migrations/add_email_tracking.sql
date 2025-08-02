-- Add email tracking columns to payments table
-- This migration adds minimal email tracking functionality to the existing payments table

ALTER TABLE payments 
ADD COLUMN email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN email_sent_at TIMESTAMPTZ NULL,
ADD COLUMN email_attempts INTEGER DEFAULT 0;

-- Create index for email tracking queries (improves performance for email status lookups)
CREATE INDEX idx_payments_email_sent ON payments(email_sent, created_at);

-- Add comments for documentation
COMMENT ON COLUMN payments.email_sent IS 'Whether photo zip has been emailed to customer';
COMMENT ON COLUMN payments.email_sent_at IS 'Timestamp when email was successfully sent';
COMMENT ON COLUMN payments.email_attempts IS 'Number of email delivery attempts made';

-- Grant necessary permissions (adjust if using different roles)
-- GRANT SELECT, UPDATE ON payments TO authenticated;