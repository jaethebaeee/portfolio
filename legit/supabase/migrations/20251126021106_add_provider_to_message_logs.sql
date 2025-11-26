-- Add provider field to message_logs table to track SMS provider (nhn, coolsms, etc.)
ALTER TABLE message_logs
ADD COLUMN provider TEXT CHECK (provider IN ('nhn', 'coolsms'));

-- Add index for provider field
CREATE INDEX IF NOT EXISTS idx_message_logs_provider ON message_logs(provider);

-- Update existing records to have default provider (nhn for SMS records)
UPDATE message_logs
SET provider = 'nhn'
WHERE channel = 'sms' AND provider IS NULL;
