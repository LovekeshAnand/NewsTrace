import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create sample topics
  const topics = [
    { name: 'politics', category: 'Politics' },
    { name: 'business', category: 'Business' },
    { name: 'technology', category: 'Technology' },
    { name: 'sports', category: 'Sports' },
    { name: 'entertainment', category: 'Entertainment' },
    { name: 'science', category: 'Science' },
    { name: 'health', category: 'Health' },
    { name: 'education', category: 'Education' },
    { name: 'environment', category: 'Environment' },
    { name: 'world', category: 'World' }
  ];

  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { name: topic.name },
      update: {},
      create: topic
    });
  }

  console.log('✅ Created topics');

  // Create sample outlet (optional - for testing)
  const sampleOutlet = await prisma.outlet.upsert({
    where: { name: 'Sample News' },
    update: {},
    create: {
      name: 'Sample News',
      website: 'https://samplenews.com',
      domain: 'samplenews.com',
      metadata: {
        description: 'Sample news outlet for testing'
      }
    }
  });

  console.log('✅ Created sample outlet');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });