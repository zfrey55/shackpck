-- SQL script to create admin user manually
-- Run this in Supabase SQL Editor
-- Replace the email, password hash, and name as needed

-- First, generate a password hash using bcrypt
-- You can use an online bcrypt generator: https://bcrypt-generator.com/
-- Or use: SELECT crypt('your-password', gen_salt('bf', 10));
-- For this example, password is "password123" (hash: $2a$10$rOzJqZqZqZqZqZqZqZqZqO)

-- Create admin user
-- Note: You'll need to generate the bcrypt hash for your password
-- Use: https://bcrypt-generator.com/ or run: node -e "const bcrypt=require('bcryptjs');bcrypt.hash('password123',10).then(h=>console.log(h))"

INSERT INTO "User" (
  "id",
  "email",
  "passwordHash",
  "name",
  "role",
  "isShadowUser",
  "loyaltyPoints",
  "earlyAccessEligible",
  "createdAt",
  "updatedAt"
) VALUES (
  'admin-' || gen_random_uuid()::text,
  'admin@test.com',  -- Change this to your email
  '$2a$10$PxVJT6qi6e.j2jRngsExyO/bpTHXMsJSOLCzXJvXj1k1XuMdQiIN6',  -- Hash for password: password123
  'Admin User',  -- Change this to your name
  'ADMIN',
  false,
  0,
  false,
  NOW(),
  NOW()
)
ON CONFLICT ("email") DO NOTHING;

-- Verify the user was created
SELECT "id", "email", "role", "name" FROM "User" WHERE "email" = 'admin@test.com';
