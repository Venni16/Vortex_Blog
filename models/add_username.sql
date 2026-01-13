-- Migration to add username column to profiles table

-- Add username column
ALTER TABLE profiles ADD COLUMN username text UNIQUE;

-- Create a unique index on username
-- CREATE UNIQUE INDEX profiles_username_idx ON profiles (username);

-- Note: You may need to backfill existing users.
-- UPDATE profiles SET username = substring(email from '^[^@]+') WHERE username IS NULL;
