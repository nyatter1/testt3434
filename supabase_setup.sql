-- ------------------------------------------
-- 1. PROFILES TABLE (Core User Data)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  pfp TEXT,
  banner TEXT,
  about_me TEXT,
  mood TEXT,
  age INTEGER,
  gender TEXT,
  last_online TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  language TEXT,
  current_room TEXT DEFAULT 'main',
  rank TEXT DEFAULT 'USER',
  likes INTEGER DEFAULT 0,
  effect TEXT DEFAULT 'none',
  border TEXT DEFAULT 'none',
  border_thickness TEXT DEFAULT '2px',
  card_bg TEXT,
  email TEXT,
  coins INTEGER DEFAULT 1000,
  rubies INTEGER DEFAULT 10,
  total_xp INTEGER DEFAULT 0,
  weekly_xp INTEGER DEFAULT 0,
  monthly_xp INTEGER DEFAULT 0,
  chat_background TEXT,
  custom_status TEXT DEFAULT 'online'
);

-- Safely verify all columns exist (adds them if missing from older versions)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pfp TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banner TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS about_me TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mood TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_online TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_room TEXT DEFAULT 'main';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rank TEXT DEFAULT 'USER';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS effect TEXT DEFAULT 'none';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS border TEXT DEFAULT 'none';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS border_thickness TEXT DEFAULT '2px';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS card_bg TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 1000;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rubies INTEGER DEFAULT 10;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weekly_xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS chat_background TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_status TEXT DEFAULT 'online';

-- Enable replica identity FULL so realtime broadcasts all profile changes (including large profiles/pfps)
ALTER TABLE profiles REPLICA IDENTITY FULL;

-- ------------------------------------------
-- 2. MESSAGES TABLE (Chat log & Commands)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  room TEXT DEFAULT 'main'
);

ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Enable replica identity FULL for messages
ALTER TABLE messages REPLICA IDENTITY FULL;

-- ------------------------------------------
-- 3. RATINGS TABLE (Star Ratings)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------
-- 4. REALTIME ENABLEMENT
-- ------------------------------------------
-- Add tables to the 'supabase_realtime' publication for realtime updates safely
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'profiles') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'ratings') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE ratings;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'profile_likes') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profile_likes;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'custom_ranks') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE custom_ranks;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'announcements') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
  END IF;
END $$;

-- ------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- --- PROFILES POLICIES ---
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT USING ( true );

DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT WITH CHECK ( auth.uid() = id );

DROP POLICY IF EXISTS "Anyone can update profiles" ON profiles;
CREATE POLICY "Anyone can update profiles"
  ON profiles FOR UPDATE USING ( true ) WITH CHECK ( true );

-- --- MESSAGES POLICIES ---
DROP POLICY IF EXISTS "Messages are viewable by everyone." ON messages;
CREATE POLICY "Messages are viewable by everyone."
  ON messages FOR SELECT USING ( true );

DROP POLICY IF EXISTS "Users can insert their own messages." ON messages;
CREATE POLICY "Users can insert their own messages."
  ON messages FOR INSERT WITH CHECK ( auth.uid() = profile_id );

DROP POLICY IF EXISTS "Users can delete messages" ON messages;
CREATE POLICY "Users can delete messages"
  ON messages FOR DELETE USING ( true );

-- --- RATINGS POLICIES ---
DROP POLICY IF EXISTS "Ratings are viewable by everyone." ON ratings;
CREATE POLICY "Ratings are viewable by everyone."
  ON ratings FOR SELECT USING ( true );

DROP POLICY IF EXISTS "Users can insert ratings." ON ratings;
CREATE POLICY "Users can insert ratings."
  ON ratings FOR INSERT WITH CHECK ( auth.uid() = author_id );

-- ------------------------------------------
-- 6. INDEXES FOR HIGH-SPEED PERFORMANCE
-- ------------------------------------------
CREATE INDEX IF NOT EXISTS idx_ratings_target_id ON ratings(target_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_created_at ON messages(room, created_at DESC);

-- ------------------------------------------
-- 7. AUTOMATIC HOUSEKEEPING (Message Limits)
-- ------------------------------------------
CREATE OR REPLACE FUNCTION clean_old_messages()
RETURNS trigger AS $$
BEGIN
  DELETE FROM messages
  WHERE id IN (
    SELECT id
    FROM (
      SELECT id,
             row_number() OVER (PARTITION BY room ORDER BY created_at DESC) as rn
      FROM messages
    ) t
    WHERE t.rn > 150
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_clean_messages ON messages;
CREATE TRIGGER trigger_clean_messages
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION clean_old_messages();

-- ------------------------------------------
-- 8. PROFILE LIKES TABLE (Likes tracking)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS profile_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  liker_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  liked_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(liker_id, liked_id)
);

-- ------------------------------------------
-- 9. NOTIFICATIONS TABLE (Alerts & System messages)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target_id UUID, -- if NULL, it's global (everyone)
  sender_id UUID,
  sender_username TEXT,
  sender_pfp TEXT,
  sender_rank TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------
-- 10. CUSTOM RANKS TABLE (User added ranks)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS custom_ranks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rank_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  priority INTEGER NOT NULL,
  is_staff BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------
-- 11. ANNOUNCEMENTS TABLE (Sticky chat header)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --- Enable RLS on New Tables ---
ALTER TABLE profile_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- --- RLS policies for new tables ---
DROP POLICY IF EXISTS "Likes viewable by everyone" ON profile_likes;
CREATE POLICY "Likes viewable by everyone" ON profile_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Likes manageable by anyone" ON profile_likes;
CREATE POLICY "Likes manageable by anyone" ON profile_likes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Notifications viewable by everyone" ON notifications;
CREATE POLICY "Notifications viewable by everyone" ON notifications FOR SELECT USING (true);
DROP POLICY IF EXISTS "Notifications manageable by anyone" ON notifications;
CREATE POLICY "Notifications manageable by anyone" ON notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Custom ranks viewable by everyone" ON custom_ranks;
CREATE POLICY "Custom ranks viewable by everyone" ON custom_ranks FOR SELECT USING (true);
DROP POLICY IF EXISTS "Custom ranks manageable by anyone" ON custom_ranks;
CREATE POLICY "Custom ranks manageable by anyone" ON custom_ranks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Announcements viewable by everyone" ON announcements;
CREATE POLICY "Announcements viewable by everyone" ON announcements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Announcements manageable by anyone" ON announcements;
CREATE POLICY "Announcements manageable by anyone" ON announcements FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------
-- 12. FORCE SCHEMA CACHE RELOAD
-- ------------------------------------------
NOTIFY pgrst, 'reload schema';


-- -------------------------------------------------------------
-- 14. SECRET MESSAGES TABLE (Encrypted/Confidential messages)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS secret_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sender_username TEXT NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  revealed BOOLEAN DEFAULT FALSE,
  request_reveal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP POLICY IF EXISTS "Secret messages viewable by anyone" ON secret_messages;
CREATE POLICY "Secret messages viewable by anyone" ON secret_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Secret messages manageable by anyone" ON secret_messages;
CREATE POLICY "Secret messages manageable by anyone" ON secret_messages FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE secret_messages ENABLE ROW LEVEL SECURITY;

