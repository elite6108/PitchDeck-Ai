/*
  # Create admin user

  1. Changes
    - Insert an admin user with email and password
    - Email: admin@example.com
    - Password: admin123 (hashed)

  Note: In production, you should use a more secure password and change it immediately after creation
*/

-- Insert admin user with a secure password hash
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  encode(gen_random_bytes(32), 'hex'),
  encode(gen_random_bytes(32), 'hex')
)
ON CONFLICT (email) DO NOTHING;