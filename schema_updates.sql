-- Add moderation fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_kicked BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kick_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kick_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_muted BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mute_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mute_expires_at TIMESTAMP WITH TIME ZONE;

-- Add customization fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username_color TEXT DEFAULT '#ffffff';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username_font TEXT DEFAULT 'Inter';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username_effect TEXT DEFAULT 'none';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username_format TEXT DEFAULT 'normal';

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS message_color TEXT DEFAULT '#e9d5ff';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS message_font TEXT DEFAULT 'Inter';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS message_effect TEXT DEFAULT 'none';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS message_format TEXT DEFAULT 'normal';

-- Force schema reload to fix "Could not query the database for the schema cache" errors
NOTIFY pgrst, 'reload schema';
