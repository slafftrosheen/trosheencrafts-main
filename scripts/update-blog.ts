import { db } from '../server/db/index';
import { blogPosts } from '../server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

async function updateBlog() {
  console.log('📝 Updating blog posts...');

  try {
    // 1. Update existing stories with realistic past dates
    const existingPosts = await db.select().from(blogPosts).where(inArray(blogPosts.slug, ['art-of-slow-batch', 'winter-workshop']));
    
    for (const post of existingPosts) {
      let publishedAt = new Date();
      if (post.slug === 'art-of-slow-batch') {
        publishedAt.setMonth(publishedAt.getMonth() - 2); // 2 months ago
      } else if (post.slug === 'winter-workshop') {
        publishedAt = new Date(publishedAt.getFullYear() - 1, 11, 15); // Dec 15 last year
      }
      
      await db.update(blogPosts).set({ publishedAt }).where(eq(blogPosts.id, post.id));
      console.log(`✅ Updated date for ${post.slug}`);
    }

    // 2. Add the new story from yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const lvText = `Aizvadītais festivāls "Dinaburga 1812" Daugavpilī bija vienkārši neaizmirstams! Pat pelēkie mākoņi un lietus nespēja sabojāt šī vēsturiskā tirdziņa brīnišķīgo un dzīvīgo atmosfēru.\n\nMūsu ģimenes darbnīcai Trosheen Crafts šis bija ļoti īpašs notikums. Ir tik patīkami redzēt jūsu patieso interesi par mūsu arhitektūras eko-akmeni. Katrs trauks, dārza strūklaka un svece ir radīta ar lielu rūpību un mīlestību. Mans tēvs Oļegs iegulda milzu darbu, dvēseli un savu meistara pieskārienu katras formas izliešanā un apstrādē, lai jūs saņemtu patiešām unikālu, pamatīgu un izturīgu mākslas darbu, kas kalpos gadiem.\n\nLiels paldies par jūsu smaidiem, aizrautīgajām sarunām un par to, ka atbalstāt ilgtspējīgu roku darbu un mūsu Zero Waste filozofiju! Jūsu enerģijas uzlādēti, mēs jau atgriežamies darbnīcā un gatavojam jaunus projektus. Uz drīzu tikšanos! ✨🌿\n\n![Dinaburg 1](/uploads/gallery/20260711_112325.jpg)\n![Dinaburg 2](/uploads/gallery/20260711_112331.jpg)`;

    const ruText = `Прошедший фестиваль «Динабург 1812» в Даугавпилсе выдался по-настоящему незабываемым! И даже хмурое небо и дождь не смогли испортить эту удивительную, живую атмосферу ярмарки.\n\nДля нашей семейной мастерской Trosheen Crafts это событие стало особенным. Невероятно приятно видеть ваш искренний интерес к нашему архитектурному эко-камню. Каждое кашпо, садовый фонтан или свеча — это результат огромного кропотливого труда. Мой отец Олег вкладывает всю душу и свое мастерство в создание, отливку и детальную обработку каждой формы, чтобы в ваших руках оказалось по-настоящему уникальное, монолитное и долговечное изделие.\n\nСпасибо за ваши улыбки, интересные беседы у стенда и за то, что выбираете экологичный ручной труд и разделяете наш подход Zero Waste! Заряженные вашей энергией, мы уже вернулись в мастерскую и готовим для вас новые идеи. До новых встреч! ✨🌿\n\n![Dinaburg 1](/uploads/gallery/20260711_112325.jpg)\n![Dinaburg 2](/uploads/gallery/20260711_112331.jpg)`;

    const enText = `The recent "Dinaburg 1812" festival in Daugavpils was truly unforgettable! Even the grey clouds and rain couldn't dampen the amazing, lively atmosphere of the historical fair.\n\nFor our family workshop, Trosheen Crafts, this was a very special event. It’s incredibly rewarding to see your genuine interest in our architectural eco-stone. Every planter, garden fountain, and candle is crafted with ultimate care. My father, Oleg, puts his heart, soul, and masterful skills into sculpting, casting, and finishing each piece, ensuring you get a truly unique, solid, and durable work of art that will last for years.\n\nThank you for your smiles, wonderful conversations at our stand, and for choosing sustainable, Zero Waste handmade creations! Fueled by your amazing energy, we are already back in the workshop working on new projects. See you next time! ✨🌿\n\n![Dinaburg 1](/uploads/gallery/20260711_112325.jpg)\n![Dinaburg 2](/uploads/gallery/20260711_112331.jpg)`;

    // Construct the multilingual content as a JSON object
    const multiLingualContent = {
      en: enText,
      lv: lvText,
      ru: ruText,
    };

    // Check if the post already exists to prevent duplicates
    const [existingNewPost] = await db.select().from(blogPosts).where(eq(blogPosts.slug, 'dinaburg-1812-festival')).limit(1);

    if (!existingNewPost) {
      await db.insert(blogPosts).values({
        title: 'Dinaburg 1812 Festival',
        slug: 'dinaburg-1812-festival',
        content: multiLingualContent as any, // Storing as JSON object (or string depending on DB mapping)
        excerpt: 'A historical fortress, summer rain, and endless inspiration...',
        author: 'Oleg Trosheen',
        image: '/uploads/gallery/20260711_112316.jpg', // Using the first photo as the main thumbnail
        publishedAt: yesterday,
      });
      console.log('✅ Added new Dinaburg 1812 festival story!');
    } else {
      await db.update(blogPosts).set({
        content: multiLingualContent as any,
        image: '/uploads/gallery/20260711_112316.jpg',
        publishedAt: yesterday,
      }).where(eq(blogPosts.id, existingNewPost.id));
      console.log('✅ Updated Dinaburg 1812 festival story!');
    }

    console.log('✅ Database update complete');
  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    process.exit(0);
  }
}

updateBlog();
