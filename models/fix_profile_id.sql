
-- 1. Enable UUID extension (Required for generating IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Make the ID auto-generate a random UUID (Fixes the "null value in column id" error)
ALTER TABLE profiles
ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 3. Remove the link to Supabase Auth (Fixes "Foreign Key violation" for custom auth users)
-- We drop the constraint that forces every profile to have a matching user in auth.users
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;
