/*
  # Create User Profile Table and Trigger

  1. Changes
    - Create the public.users table
    - Create a function that automatically creates a user profile in the public.users table
    - Trigger this function when a new user signs up via Supabase Auth
    - Links auth.users.id to public.users.id
    
  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - Only creates records, doesn't modify existing ones
*/

-- Create users table
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  account_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  investment_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create index on email
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create a helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
SELECT EXISTS (
  SELECT 1 FROM public.users
  WHERE public.users.id = auth.uid()
  AND public.users.role = 'admin'
);
$$ LANGUAGE SQL SECURITY DEFINER;

-- Create RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (is_admin());

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Don't create user record for admin accounts
  IF NEW.email = 'vit88095@gmail.com' THEN
    RETURN NEW;
  END IF;
  
  INSERT INTO public.users (id, email, role, account_balance, investment_balance, status)
  VALUES (
    NEW.id,
    NEW.email,
    'user',
    0.00,
    0.00,
    'active'
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create admin user record manually (if not exists)
INSERT INTO public.users (id, email, role, account_balance, investment_balance, status)
SELECT id, email, 'admin', 0.00, 0.00, 'active'
FROM auth.users
WHERE email = 'vit88095@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';