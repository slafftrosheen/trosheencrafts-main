import { db } from './index';
import { constructorOptions } from './schema';

const FINISHES = [
  { key: 'white-stone', name: 'White Stone', price: '0.00', color: '#F0F0F0', border: '#E5E5E5' },
  { key: 'grey-stone', name: 'Grey Stone', price: '0.00', color: '#A0A0A0', border: '#888888' },
  { key: 'white-marble', name: 'White Marble', price: '5.00', color: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', border: '#c3cfe2' },
  { key: 'bronze', name: 'Bronze', price: '8.00', color: 'linear-gradient(135deg, #b08d57, #805a2b)', border: '#805a2b' },
  { key: 'gold', name: 'Gold', price: '10.00', color: 'linear-gradient(135deg, #ffd700, #b8860b)', border: '#b8860b' },
  { key: 'custom', name: 'Fully Custom Coloring', price: '15.00', color: 'conic-gradient(from 90deg, #ff9a9e, #fecfef, #a1c4fd, #c2e9fb, #d4fc79, #96e6a1)', border: '#ff9a9e' },
];

const WAX_TYPES = [
  { key: 'soy', name: 'Soy Wax (Eco)', price: '0.00', desc: 'Clean burning, eco-friendly soy wax.' },
  { key: 'gel', name: 'Clear Gel Wax', price: '3.00', desc: 'Transparent gel for a unique luminous effect.' },
  { key: 'beeswax', name: 'Natural Beeswax', price: '5.00', desc: 'Purifying, long-lasting natural beeswax.' },
];

const AROMAS = [
  { key: 'none', name: 'Unscented', price: '0.00' },
  { key: 'lavender', name: 'Lavender Breeze', price: '2.00' },
  { key: 'vanilla', name: 'Warm Vanilla', price: '2.00' },
  { key: 'pine', name: 'Baltic Pine', price: '2.00' },
];

async function seed() {
  console.log('Seeding Constructor Options...');

  try {
    let order = 0;
    for (const f of FINISHES) {
      await db.insert(constructorOptions).values({
        type: 'finish',
        key: f.key,
        nameTranslations: { en: f.name, lv: f.name, ru: f.name, pl: f.name, uk: f.name },
        descTranslations: {},
        price: f.price,
        color: f.color,
        border: f.border,
        sortOrder: order++,
      }).onConflictDoNothing();
    }

    order = 0;
    for (const w of WAX_TYPES) {
      await db.insert(constructorOptions).values({
        type: 'wax',
        key: w.key,
        nameTranslations: { en: w.name, lv: w.name, ru: w.name, pl: w.name, uk: w.name },
        descTranslations: { en: w.desc, lv: w.desc, ru: w.desc, pl: w.desc, uk: w.desc },
        price: w.price,
        sortOrder: order++,
      }).onConflictDoNothing();
    }

    order = 0;
    for (const a of AROMAS) {
      await db.insert(constructorOptions).values({
        type: 'aroma',
        key: a.key,
        nameTranslations: { en: a.name, lv: a.name, ru: a.name, pl: a.name, uk: a.name },
        descTranslations: {},
        price: a.price,
        sortOrder: order++,
      }).onConflictDoNothing();
    }

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
  }
  process.exit(0);
}

seed();
