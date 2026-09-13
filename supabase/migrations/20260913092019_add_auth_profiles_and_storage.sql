-- ============================================================
-- PROFILES TABLE — links Supabase auth users to app data
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  role text DEFAULT 'collector',
  language text DEFAULT 'en',
  location text,
  latitude double precision,
  longitude double precision,
  profile_photo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- A user can read their own profile
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- A user can insert their own profile
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- A user can update their own profile
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow anyone authenticated to read all profiles (for recycler matching etc.)
DROP POLICY IF EXISTS "select_all_profiles" ON profiles;
CREATE POLICY "select_all_profiles" ON profiles FOR SELECT
  TO authenticated USING (true);

-- ============================================================
-- Add user_id to collectors table (nullable for backward compat)
-- ============================================================
ALTER TABLE collectors ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "select_own_collector" ON collectors;
CREATE POLICY "select_own_collector" ON collectors FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_collector" ON collectors;
CREATE POLICY "insert_own_collector" ON collectors FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "update_own_collector" ON collectors;
CREATE POLICY "update_own_collector" ON collectors FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ============================================================
-- Add user_id to lots table
-- ============================================================
ALTER TABLE lots ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "auth_select_lots" ON lots;
CREATE POLICY "auth_select_lots" ON lots FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_lots" ON lots;
CREATE POLICY "auth_insert_lots" ON lots FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "auth_update_lots" ON lots;
CREATE POLICY "auth_update_lots" ON lots FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ============================================================
-- STORAGE BUCKET for product/lot images
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: authenticated users can upload, everyone can read
DROP POLICY IF EXISTS "allow_public_read_product_images" ON storage.objects;
CREATE POLICY "allow_public_read_product_images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "allow_auth_upload_product_images" ON storage.objects;
CREATE POLICY "allow_auth_upload_product_images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "allow_auth_update_product_images" ON storage.objects;
CREATE POLICY "allow_auth_update_product_images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'product-images');
