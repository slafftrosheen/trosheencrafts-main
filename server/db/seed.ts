import { db } from "./index";
import { products, blogPosts } from "./schema";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Development/sample-content seed.
 *
 * IMPORTANT:
 * - This script deliberately does not read, create, update, or delete users.
 * - Admin accounts and passwords are production data and must never be changed by content seeding.
 */
async function seed() {
  console.log("Seeding sample content...");

  try {
    console.log("Removing existing sample blog/product data...");
    await db.delete(blogPosts);
    await db.delete(products);

    const sampleProducts = [
      {
        name: "Heart Vessel Candle",
        slug: "heart-vessel-candle",
        description:
          "A hand-sculpted concrete vessel holding a high-quality scented candle. The vessel can be reused as a planter or decorative object.",
        price: "48.00",
        category: "Candles",
        images: ["/assets/Hands holding heart candle-CqdhwrTV.webp"],
        stock: 15,
        featured: true,
      },
      {
        name: "Leaf Stepping Stone",
        slug: "leaf-stepping-stone",
        description:
          "Large architectural concrete stepping stone with a detailed natural leaf impression. Perfect for garden paths.",
        price: "38.00",
        category: "Garden",
        images: ["/assets/Leaf Stepping stone-y8E5m1G_.webp"],
        stock: 8,
        featured: true,
      },
      {
        name: "Sea Star Gel Candle",
        slug: "sea-star-gel-candle",
        description: "Delicate sea star shaped gel candle, hand-cast with Baltic sea inspiration.",
        price: "24.00",
        category: "Candles",
        images: ["/assets/sea star shaped gel candle-DgZcMKLl.webp"],
        stock: 20,
        featured: false,
      },
    ];

    await db.insert(products).values(sampleProducts);
    console.log("Created sample products");

    const samplePosts = [
      {
        title: "The Art of the Slow Batch",
        slug: "art-of-slow-batch",
        content:
          "Our process starts with raw minerals and ends with something that feels alive. We believe in the slow rhythm of the workshop, where every bubble and texture tells a story of patience...",
        excerpt: "Why we choose to make things by hand in a world of mass production.",
        author: "Oleg Trosheen",
        image: "/assets/concrete casting process-DHsS8MbC.webp",
        publishedAt: new Date(),
      },
      {
        title: "Winter in the Daugavpils Workshop",
        slug: "winter-workshop",
        content:
          "When the Baltic frost settles on the windows, the workshop transforms. The concrete cures differently, the pigments take on a new depth, and the quiet moments between the casts become longer...",
        excerpt: "How the seasons influence our crafting process.",
        author: "Oleg Trosheen",
        image: "/assets/story photo-Dner3Ksw.webp",
        publishedAt: new Date(),
      },
    ];

    await db.insert(blogPosts).values(samplePosts);
    console.log("Created sample blog posts");
    console.log("Sample-content seeding complete; user accounts were not touched.");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed().then(() => process.exit(0));
