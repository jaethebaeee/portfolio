-- Prevent duplicate patients for the same user (clinic)
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_user_phone ON patients(user_id, phone);

