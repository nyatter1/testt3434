-- Run this in your Supabase SQL editor to enable fully customizable profiles
-- 1. Enable custom profiles boolean
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_profile_enabled BOOLEAN DEFAULT FALSE;

-- 2. Store layout data as JSONB
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_layout JSONB DEFAULT '{}'::jsonb;

-- Give current users default false
UPDATE profiles SET custom_profile_enabled = FALSE WHERE custom_profile_enabled IS NULL;
