import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, products, blogPosts } from '../shared/schema';

// Use DATABASE_URL from environment or fallback
const connectionString = process.env.DATABASE_URL || 'postgresql://trosheenuser:18118810208@localhost:5432/trosheencrafts';

// Create a direct DB connection for seeding
const queryClient = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

const db = drizzle(queryClient);

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  try {
    // Create initial admin user if it doesn't exist
    let adminUser;
    try {
      const [newUser] = await db.insert(users).values({
        email: 'admin@trosheen.crafts',
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date(),
      }).returning();
      adminUser = newUser;
      console.log('✅ Admin user created');
    } catch (error) {
      // If user already exists, fetch the existing one
      const existingUsers = await db.select().from(users).where(eq(users.email, 'admin@trosheen.crafts'));
      if (existingUsers.length > 0) {
        adminUser = existingUsers[0];
        console.log('✅ Found existing admin user');
      } else {
        throw error;
      }
    }

    // Add sample products
    const sampleProducts = [
      {
        slug: 'handmade-concrete-candle',
        name: 'Handmade Concrete Candle',
        nameTranslations: { en: 'Handmade Concrete Candle', lv: 'Rokas izgatavots betona svece' },
        description: { en: 'Beautiful handmade concrete candle with natural wax', lv: 'Skaista rokas izgatavota betona svece ar dabīgu vasku' },
        price: 2499, // 24.99 in cents
        category: 'candles',
        stock: 10,
        image: '/uploads/sample-candle.jpg',
        status: 'active' as const,
        isHandmade: true,
        featured: true,
        dimensions: '10cm x 8cm',
        weight: '450g',
        materials: ['Concrete', 'Natural Wax', 'Cotton Wick'],
        techniques: ['Hand-poured', 'Concrete Casting'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        slug: 'latvian-motif-decor',
        name: 'Latvian Motif Decor',
        nameTranslations: { en: 'Latvian Motif Decor', lv: 'Latviešu rakstu dekorācija' },
        description: { en: 'Decorative piece featuring traditional Latvian motifs', lv: 'Dekoratīvs izstrādājums ar tradicionāliem latviešu rakstiem' },
        price: 3999, // 39.99 in cents
        category: 'decor',
        stock: 5,
        image: '/uploads/sample-decor.jpg',
        status: 'active' as const,
        isHandmade: true,
        featured: true,
        dimensions: '15cm x 15cm',
        weight: '600g',
        materials: ['Concrete', 'Paint'],
        techniques: ['Hand-carved', 'Painted'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        slug: 'eco-friendly-garden-light',
        name: 'Eco-Friendly Garden Light',
        nameTranslations: { en: 'Eco-Friendly Garden Light', lv: 'Ēkoloģiski draudzīga dārza gaisma' },
        description: { en: 'Solar-powered garden light made from recycled concrete', lv: 'Saules enerģijas dārza gaisma no pārstrādāta betona' },
        price: 2999, // 29.99 in cents
        category: 'lighting',
        stock: 8,
        image: '/uploads/sample-light.jpg',
        status: 'active' as const,
        isHandmade: true,
        featured: false,
        dimensions: '12cm x 12cm x 20cm',
        weight: '800g',
        materials: ['Recycled Concrete', 'Solar Panel'],
        techniques: ['Molded', 'Solar Integration'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    for (const product of sampleProducts) {
      await db.insert(products).values(product);
    }

    console.log('✅ Sample products added');

    // Add test blog posts
    const sampleBlogPosts = [
      {
        title: 'Our Story: From Daugavpils to the World',
        slug: 'our-story-from-daugavpils-to-the-world',
        excerpt: 'Learn about our journey from a small town in Latvia to creating beautiful concrete crafts',
        content: {
          en: '# Our Story\n\nWe started Trosheen.Crafts in Daugavpils, Latvia, with a passion for combining traditional craftsmanship with modern design. Our journey began in 2020 when our founders discovered the beauty of concrete as a medium for creating lasting, functional art.\n\n## Our Mission\n\nWe believe in creating products that are not only beautiful but also sustainable and long-lasting. Every piece is carefully crafted to bring warmth and character to your home.',
          lv: '# Mūsu stāsts\n\nMēs sākām Trosheen.Crafts Daugavpilī, Latvijā, ar vēlmi apvienot tradicionālo amatniecību ar modernu dizainu. Mūsu ceļš sākās 2020. gadā, kad mūsu dibinātāji atklāja betona skaistumu kā materiālu ilgtspējīgu funkcionālu mākslas izstrādājumu radīšanai.\n\n## Mūsu misija\n\nMēs ticam produktu radīšanai, kas ir ne tikai skaisti, bet arī ilgtspējīgi un pastāvīgi. Katrs izstrādājums tiek rūpīgi veidots, lai jūsu mājās radītu siltumu un raksturu.'
        },
        featuredImage: '/uploads/blog-story.jpg',
        authorId: adminUser.id,
        category: 'behind-scenes' as const,
        status: 'published' as const,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        seoTitle: 'Our Story: From Daugavpils to the World',
        seoDescription: 'Learn about our journey from a small town in Latvia to creating beautiful concrete crafts',
      },
      {
        title: 'The Art of Concrete Candle Making',
        slug: 'the-art-of-concrete-candle-making',
        excerpt: 'Discover the intricate process of creating our signature concrete candles',
        content: {
          en: '# The Art of Concrete Candle Making\n\nCreating our concrete candles is a meticulous process that involves several stages:\n\n1. **Mixing**: We carefully mix our proprietary concrete blend\n2. **Molding**: Each piece is individually molded using custom-made molds\n3. **Curing**: The concrete is left to cure for 48 hours\n4. **Finishing**: Each piece is hand-finished to perfection\n5. **Wax Pouring**: Natural soy wax is poured and a cotton wick is placed\n\n## Why Concrete?\n\nConcrete offers unique thermal properties that make it ideal for candle holders. It stays cool to the touch while containing the heat of the flame, and its natural texture adds to the aesthetic appeal.',
          lv: '# Betona sveču veidošanas māksla\n\nMūsu betona sveču radīšana ir rūpīgs process, kas ietver vairākas stadijas:\n\n1. **Maisīšana**: Mēs rūpīgi sajaucam mūsu īpašo betona maisījumu\n2. **Formēšana**: Katrs izstrādājums tiek individuāli formēts, izmantojot uz pasūtījumu izgatavotas formas\n3. **Ķērēšana**: Betons tiek atstāts 48 stundas ilgai ķērēšanai\n4. **Apdare**: Katrs izstrādājums tiek manuāli apstrādāts līdz pilnībai\n5. **Vaska ielejšana**: Tiek ielejams dabīgais sojas vasks un novietots kokvilnas knābis\n\n## Kāpēc betons?\n\nBetons piedāvā unikālas termiskās īpašības, kas padara to par ideālu svečturēm. Tas paliek auksts pieskaroties, vienlaikus saturējot liesmas siltumu, un tā dabīgā struktūra pievieno estētisko pievilcību.'
        },
        featuredImage: '/uploads/blog-candle-making.jpg',
        authorId: adminUser.id,
        category: 'craftsmanship' as const,
        status: 'published' as const,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        seoTitle: 'The Art of Concrete Candle Making',
        seoDescription: 'Discover the intricate process of creating our signature concrete candles',
      }
    ];

    for (const post of sampleBlogPosts) {
      await db.insert(blogPosts).values(post);
    }

    console.log('✅ Sample blog posts added');
    
    console.log('🎉 Database seeding completed successfully!');
    
    // Close the database connection
    await queryClient.end();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await queryClient.end();
    process.exit(1);
  }
}

seedDatabase();