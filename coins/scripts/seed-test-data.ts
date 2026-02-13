// Script to seed test data for development
// Run with: npx tsx scripts/seed-test-data.ts

import { prisma } from '../lib/db';

const testSeries = [
  {
    name: 'ShackPack Premium Series 2024',
    slug: 'premium-series-2024',
    description: 'A limited edition series featuring premium gold and silver coins. Each pack contains 10 carefully curated coins.',
    images: ['/images/packs/shackpack-starter.jpg'],
    totalPacks: 500,
    pricePerPack: 9999, // $99.99 in cents
    isActive: true,
  },
  {
    name: 'Reign by Shackpack - Collector\'s Edition',
    slug: 'reign-collectors-2024',
    description: 'Exclusive Reign series with 1/10 oz gold coins and premium silver selections.',
    images: ['/images/packs/shackpack-reign.png'],
    totalPacks: 300,
    pricePerPack: 14999, // $149.99 in cents
    isActive: true,
  },
  {
    name: 'Apex by Shackpack - Limited Run',
    slug: 'apex-limited-2024',
    description: 'Limited run of Apex packs featuring 1/4 oz gold coins and rare silver pieces.',
    images: ['/images/packs/shackpack-apex.png'],
    totalPacks: 200,
    pricePerPack: 19999, // $199.99 in cents
    isActive: true,
  },
];

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...\n');

    // Create test series
    for (const seriesData of testSeries) {
      const existing = await prisma.series.findUnique({
        where: { slug: seriesData.slug },
      });

      if (existing) {
        console.log(`⏭️  Series "${seriesData.name}" already exists, skipping...`);
        continue;
      }

      const series = await prisma.series.create({
        data: seriesData,
      });

      console.log(`✅ Created series: ${series.name} (${series.slug})`);
      console.log(`   - Total packs: ${series.totalPacks}`);
      console.log(`   - Price: $${(series.pricePerPack / 100).toFixed(2)} per pack`);
      console.log(`   - Packs remaining: ${series.packsRemaining}\n`);
    }

    console.log('✨ Seeding complete!\n');
    console.log('You can now:');
    console.log('1. Visit http://localhost:3000 to see the series on the home page');
    console.log('2. Click on a series to view details and add to cart');
    console.log('3. Test the checkout flow with Stripe test cards\n');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error seeding test data:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedTestData();
