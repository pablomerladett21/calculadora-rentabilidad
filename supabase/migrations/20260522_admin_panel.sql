-- ============================================
-- BizTracker: Admin panel support
-- Add email + billing status to profiles
-- ============================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email text;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS billing_status text NOT NULL DEFAULT 'trial';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_billing_status_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_billing_status_check
      CHECK (billing_status IN ('trial', 'paid', 'disabled'));
  END IF;
END $$;

UPDATE profiles
SET billing_status = 'trial'
WHERE billing_status IS NULL;
