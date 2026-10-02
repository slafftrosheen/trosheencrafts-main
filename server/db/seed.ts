import { db } from "./index";
import { users, products, blogPosts } from "./schema";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

async function seed() {
  console.log("Seeding database...");

  try {
    console.log("Removing existing seed data...");
    await db.delete(blogPosts);
    await db.delete(products);
    await db.delete(users);

    const adminPassword = process.env.SEED_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
    const adminEmail = process.env.SEED_ADMIN_EMAIL;
    const adminUsername = process.env.SEED_ADMIN_USERNAME;

    if (!adminPassword || adminPassword.length < 8 || !adminEmail || !adminUsername) {
      throw new Error(
        "Admin seed credentials are missing. Set SEED_ADMIN_EMAIL, SEED_ADMIN_USERNAME and SEED_ADMIN_PASSWORD (minimum 8 characters)."
      );
    }

    const adminUsers = [
      {
        email: adminEmail,
        username: adminUsername,
        password: await bcrypt.hash(adminPassword, 12),
        role: "admin",
      },
    ];

    const secondPassword = process.env.SEED_SECOND_ADMIN_PASSWORD;
    const secondEmail = process.env.SEED_SECOND_ADMIN_EMAIL;
    const secondUsername = process.env.SEED_SECOND_ADMIN_USERNAME;

    if (secondPassword && secondEmail && secondUsername) {
      if (secondPassword.length < 8) {
        throw new Error("SEED_SECOND_ADMIN_PASSWORD must be at least 8 characters.");
      }

      adminUsers.push({
        email: secondEmail,
        username: secondUsername,
        password: await bcrypt.hash(secondPassword, 12),
        role: "admin",
      });
    }

    await db.insert(users).values(adminUsers);
    console.log("Created admin seed user(s)");

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
    console.log("Database seeding complete");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed().then(() => process.exit(0));
