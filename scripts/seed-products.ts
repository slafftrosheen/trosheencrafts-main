import { db } from '../server/config/database';
import { products } from '../shared/schema';
import { eq } from 'drizzle-orm';

const seedProducts = [
  // === CANDLES ===
  {
    slug: 'heart-vessel-candle-1',
    name: 'Heart Vessel Candle',
    nameTranslations: {
      en: 'Heart Vessel Candle',
      lv: 'Sirds Trauka Svece',
      ru: 'Свеча в Сосуде Сердца'
    },
    price: 4500,
    category: 'candles',
    image: '/assets/images/candle1.jpg',
    images: ['/assets/images/candle1.jpg', '/assets/images/candle2.jpg'],
    description: {
      en: 'Burns away to reveal a hand-sculpted concrete vessel. Second life guaranteed. Hand-sculpted concrete vessel shaped like cupped hands cradling a heart.',
      lv: 'Ar rokām veidots betonā trauks saliktu roku formā, kas tur sirdi. Liets arhitektūras betonā.',
      ru: 'Вручную вылепленный бетонный сосуд в форме ладоней, держащих сердце. Отлит из архитектурного бетона.'
    },
    features: ['Hand-sculpted', 'Metallic gold accents', 'Natural soy wax', 'Frost-proof'],
    dimensions: '12cm × 12cm × 8cm',
    weight: '480g',
    materials: ['Concrete', 'Gold leaf', 'Soy wax'],
    techniques: ['Hand sculpting', 'Casting'],
    madeBy: 'oleg',
    stock: 10,
    status: 'active',
    isHandmade: true,
    featured: true
  },
  {
    slug: 'organic-candle-holder-1',
    name: 'Organic Form Candle Holder',
    nameTranslations: {
      en: 'Organic Form Candle Holder',
      lv: 'Organiskas Formas Svečturis',
      ru: 'Подсвечник Органической Формы'
    },
    price: 5200,
    category: 'candles',
    image: '/assets/images/candle2.jpg',
    images: ['/assets/images/candle2.jpg', '/assets/images/candle3.jpg'],
    description: {
      en: 'Textured concrete with copper oxide patina. Holds standard pillar candles. Soft, organic shapes define this candle holder.',
      lv: 'Teksturēts betons ar vara oksīda patīnu. Mīkstas, organiskas formas.',
      ru: 'Текстурированный бетон с патиной оксида меди. Мягкие, органичные формы.'
    },
    features: ['Organic shape', 'Smooth finish', 'Copper oxide patina'],
    dimensions: '15cm × 12cm × 15cm',
    weight: '300g',
    materials: ['Fine concrete', 'Copper oxide'],
    techniques: ['Molding', 'Polishing', 'Burnishing'],
    madeBy: 'family',
    stock: 15,
    status: 'active',
    isHandmade: true,
    featured: false
  },

  // === PLANTERS ===
  {
    slug: 'botanical-impression-planter-1',
    name: 'Botanical Impression Planter',
    nameTranslations: {
      en: 'Botanical Impression Planter',
      lv: 'Botānisko Iespaidu Puķu Pods',
      ru: 'Кашпо с Ботаническим Оттиском'
    },
    price: 6800,
    category: 'planters',
    image: '/assets/images/planter1.jpg',
    images: ['/assets/images/planter1.jpg', '/assets/images/planter2.jpg'],
    description: {
      en: 'Fern leaves pressed into wet concrete. Drainage hole pre-drilled. Textured concrete planter with real botanical impressions.',
      lv: 'Papardes lapas iespiestas mitrā betonā. Teksturēts betona puķu pods.',
      ru: 'Листья папоротника вдавлены в мокрый бетон. Текстурное бетонное кашпо.'
    },
    features: ['Real plant impressions', 'Hand-painted', 'Drainage hole'],
    dimensions: '18cm × 16cm × 18cm',
    weight: '900g',
    materials: ['Concrete', 'Mineral pigments', 'Pressed botanicals'],
    techniques: ['Botanical casting', 'Pigment staining'],
    madeBy: 'oleg',
    stock: 5,
    status: 'active',
    isHandmade: true,
    featured: true
  },
];

async function main() {
  console.log('Seeding products...');

  // Need to ensure DATABASE_URL is available.
  // If running via tsx, it might pick up .env if loaded, but here we depend on env vars.
  if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL not set. Skipping seed.');
      process.exit(0);
  }

  for (const p of seedProducts) {
    const [existing] = await db.select().from(products).where(eq(products.slug, p.slug));

    if (!existing) {
        await db.insert(products).values(p as any);
        console.log(`Inserted ${p.name}`);
    } else {
        console.log(`Skipped ${p.name} (already exists)`);
    }
  }

  console.log('Done.');
  process.exit(0);
}

main().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
