-- SQL script to seed test series data
-- Run this in Supabase SQL Editor

-- Insert test series
INSERT INTO "Series" (
  "id",
  "name",
  "slug",
  "description",
  "images",
  "totalPacks",
  "packsSold",
  "packsRemaining",
  "pricePerPack",
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES
(
  'series-' || gen_random_uuid()::text,
  'ShackPack Premium Series 2024',
  'premium-series-2024',
  'A limited edition series featuring premium gold and silver coins. Each pack contains 10 carefully curated coins.',
  ARRAY['/images/packs/shackpack-starter.jpg'],
  500,
  0,
  500,
  9999,  -- $99.99 in cents
  true,
  NOW(),
  NOW()
),
(
  'series-' || gen_random_uuid()::text,
  'Reign by Shackpack - Collector''s Edition',
  'reign-collectors-2024',
  'Exclusive Reign series with 1/10 oz gold coins and premium silver selections.',
  ARRAY['/images/packs/shackpack-reign.png'],
  300,
  0,
  300,
  14999,  -- $149.99 in cents
  true,
  NOW(),
  NOW()
),
(
  'series-' || gen_random_uuid()::text,
  'Apex by Shackpack - Limited Run',
  'apex-limited-2024',
  'Limited run of Apex packs featuring 1/4 oz gold coins and rare silver pieces.',
  ARRAY['/images/packs/shackpack-apex.png'],
  200,
  0,
  200,
  19999,  -- $199.99 in cents
  true,
  NOW(),
  NOW()
)
ON CONFLICT ("slug") DO NOTHING;

-- Verify series were created
SELECT "name", "slug", "totalPacks", "packsRemaining", "pricePerPack" FROM "Series" WHERE "isActive" = true;
