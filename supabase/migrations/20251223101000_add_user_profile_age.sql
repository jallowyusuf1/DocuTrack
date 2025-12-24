-- Add age fields to user_profiles for general signup

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Generated age column (keeps age consistent without manual updates)
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS age_years INTEGER GENERATED ALWAYS AS (date_part('year', age(date_of_birth))) STORED;


