import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://trosheen.crafts';

// Static pages
const staticPages = [
  { url: '/', priority: 1.0, changefreq: 'daily' },
  { url: '/shop', priority: 0.9, changefreq: 'daily' },
  { url: '/blog', priority: 0.8, changefreq: 'weekly' },
  { url: '/contact', priority: 0.7, changefreq: 'monthly' },
  { url: '/privacy', priority: 0.3, changefreq: 'yearly' },
  { url: '/terms', priority: 0.3, changefreq: 'yearly' },
  { url: '/cookies', priority: 0.3, changefreq: 'yearly' },
];

// Dynamic pages (you would fetch these from your database/API)
const products = [
  'concrete-candle-heart',
  'stone-planter-leaf',
  'decorative-concrete-sphere',
  // Add all your product IDs here
];

const blogPosts = [
  'welcome-to-our-workshop',
  'concrete-casting-technique',
  // Add all your blog post IDs here
];

function generateSitemap() {
  const productPages = products.map(id => ({
    url: `/shop/${id}`,
    priority: 0.8,
    changefreq: 'weekly',
  }));

  const blogPages = blogPosts.map(id => ({
    url: `/blog/${id}`,
    priority: 0.6,
    changefreq: 'monthly',
  }));

  const allPages = [...staticPages, ...productPages, ...blogPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`).join('\n')}
</urlset>`;

  // Modified path to point to client/public
  const outputPath = path.join(process.cwd(), 'client', 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, sitemap);
  console.log('✅ Sitemap generated at client/public/sitemap.xml');
}

generateSitemap();
