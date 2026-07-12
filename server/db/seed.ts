import { db } from './index';
import { users, products, blogPosts } from './schema';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Remove all existing data to ensure a clean start
    console.log('🗑️  Removing existing data...');
    await db.delete(blogPosts);
    await db.delete(products);
    await db.delete(users);

    // Create requested users
    console.log('👤 Creating users...');
    
    const user1 = {
      email: 'slaff.trosheen@gmail.com',
      username: 'slaff.trosheen',
      password: await bcrypt.hash('Slaff18118810208', 12),
      role: 'admin',
    };

    const user2 = {
      email: 'trosheen.crafts@gmail.com',
      username: 'trosheen.crafts',
      password: await bcrypt.hash('Oleg1965', 12),
      role: 'admin',
    };

    await db.insert(users).values([user1, user2]);
    console.log('✅ Created admin users');

    // Create sample products
    console.log('🏺 Creating sample products...');
    const sampleProducts = [
      {
        name: 'Heart Vessel Candle',
        slug: 'heart-vessel-candle',
        description: 'A hand-sculpted concrete vessel holding a high-quality scented candle. The vessel can be reused as a planter or decorative object.',
        price: '48.00',
        category: 'Candles',
        images: ['/assets/Hands holding heart candle-CqdhwrTV.jpeg'],
        stock: 15,
        featured: true,
      },
      {
        name: 'Leaf Stepping Stone',
        slug: 'leaf-stepping-stone',
        description: 'Large architectural concrete stepping stone with a detailed natural leaf impression. Perfect for garden paths.',
        price: '38.00',
        category: 'Garden',
        images: ['/assets/Leaf Stepping stone-y8E5m1G_.jpeg'],
        stock: 8,
        featured: true,
      },
      {
        name: 'Sea Star Gel Candle',
        slug: 'sea-star-gel-candle',
        description: 'Delicate sea star shaped gel candle, hand-cast with Baltic sea inspiration.',
        price: '24.00',
        category: 'Candles',
        images: ['/assets/sea star shaped gel candle-DgZcMKLl.jpeg'],
        stock: 20,
        featured: false,
      }
    ];

    await db.insert(products).values(sampleProducts);
    console.log('✅ Created sample products');

    // Create sample blog posts
    console.log('📝 Creating sample blog posts...');
    const samplePosts = [
      {
        title: 'The Art of the Slow Batch',
        slug: 'art-of-slow-batch',
        content: 'Our process starts with raw minerals and ends with something that feels alive. We believe in the slow rhythm of the workshop, where every bubble and texture tells a story of patience...',
        excerpt: 'Why we choose to make things by hand in a world of mass production.',
        author: 'Oleg Trosheen',
        image: '/assets/concrete casting process-DHsS8MbC.png',
        publishedAt: new Date(),
      },
      {
        title: 'Winter in the Daugavpils Workshop',
        slug: 'winter-workshop',
        content: 'When the Baltic frost settles on the windows, the workshop transforms. The concrete cures differently, the pigments take on a new depth, and the quiet moments between the casts become longer...',
        excerpt: 'How the seasons influence our crafting process.',
        author: 'Oleg Trosheen',
        image: '/assets/story photo-Dner3Ksw.png',
        publishedAt: new Date(),
      }
    ];

    await db.insert(blogPosts).values(samplePosts);
    console.log('✅ Created sample blog posts');

    console.log('✅ Database seeding complete');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed().then(() => process.exit(0));
