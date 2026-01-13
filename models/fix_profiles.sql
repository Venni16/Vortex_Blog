
-- Fix for missing password column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS password text;
