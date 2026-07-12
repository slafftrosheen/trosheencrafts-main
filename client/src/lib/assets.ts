// Asset management system - All images are unique and replaceable
export const PLACEHOLDER_BASE = 'https://placehold.co';

export interface Asset {
  id: string;
  path: string;
  alt: string;
  description: string;
  placeholder: string;
}

// Hero Section Assets
export const heroAssets = {
  mainBanner: {
    id: 'hero-main-banner',
    path: '/assets/hero/main-banner.jpg',
    placeholder: `${PLACEHOLDER_BASE}/1920x1080/2c5f2d/ffffff?text=Hero+Banner`,
    alt: 'Main Hero Banner',
    description: 'Main hero banner (1920x1080)',
  },
  secondaryBanner: {
    id: 'hero-secondary',
    path: '/assets/hero/secondary-banner.jpg',
    placeholder: `${PLACEHOLDER_BASE}/1920x1080/4a7c59/ffffff?text=Secondary+Banner`,
    alt: 'Secondary Banner',
    description: 'Secondary hero image (1920x1080)',
  },
} as const;

// About Section Assets
export const aboutAssets = {
  workshop: {
    id: 'about-workshop',
    path: '/assets/about/workshop.jpg',
    placeholder: `${PLACEHOLDER_BASE}/800x600/5d4e37/ffffff?text=Workshop`,
    alt: 'Workshop',
    description: 'Workshop or studio image (800x600)',
  },
  team: {
    id: 'about-team',
    path: '/assets/about/team.jpg',
    placeholder: `${PLACEHOLDER_BASE}/800x600/8b7355/ffffff?text=Team`,
    alt: 'Team',
    description: 'Team or artisan image (800x600)',
  },
  process: {
    id: 'about-process',
    path: '/assets/about/process.jpg',
    placeholder: `${PLACEHOLDER_BASE}/800x600/a0826d/ffffff?text=Process`,
    alt: 'Our Process',
    description: 'Crafting process image (800x600)',
  },
} as const;

// Category Assets
export const categoryAssets = {
  category1: {
    id: 'category-1',
    path: '/assets/categories/category-1.jpg',
    placeholder: `${PLACEHOLDER_BASE}/600x400/7b68ee/ffffff?text=Category+1`,
    alt: 'Category 1',
    description: 'Product category 1 (600x400)',
  },
  category2: {
    id: 'category-2',
    path: '/assets/categories/category-2.jpg',
    placeholder: `${PLACEHOLDER_BASE}/600x400/d2691e/ffffff?text=Category+2`,
    alt: 'Category 2',
    description: 'Product category 2 (600x400)',
  },
  category3: {
    id: 'category-3',
    path: '/assets/categories/category-3.jpg',
    placeholder: `${PLACEHOLDER_BASE}/600x400/8b4513/ffffff?text=Category+3`,
    alt: 'Category 3',
    description: 'Product category 3 (600x400)',
  },
  category4: {
    id: 'category-4',
    path: '/assets/categories/category-4.jpg',
    placeholder: `${PLACEHOLDER_BASE}/600x400/ffd700/ffffff?text=Category+4`,
    alt: 'Category 4',
    description: 'Product category 4 (600x400)',
  },
} as const;

// Feature/Process Assets
export const processAssets = {
  step1: {
    id: 'process-step-1',
    path: '/assets/process/step-1.jpg',
    placeholder: `${PLACEHOLDER_BASE}/400x400/4682b4/ffffff?text=Step+1`,
    alt: 'Process Step 1',
    description: 'Process step 1 (400x400)',
  },
  step2: {
    id: 'process-step-2',
    path: '/assets/process/step-2.jpg',
    placeholder: `${PLACEHOLDER_BASE}/400x400/228b22/ffffff?text=Step+2`,
    alt: 'Process Step 2',
    description: 'Process step 2 (400x400)',
  },
  step3: {
    id: 'process-step-3',
    path: '/assets/process/step-3.jpg',
    placeholder: `${PLACEHOLDER_BASE}/400x400/dc143c/ffffff?text=Step+3`,
    alt: 'Process Step 3',
    description: 'Process step 3 (400x400)',
  },
  step4: {
    id: 'process-step-4',
    path: '/assets/process/step-4.jpg',
    placeholder: `${PLACEHOLDER_BASE}/400x400/ff8c00/ffffff?text=Step+4`,
    alt: 'Process Step 4',
    description: 'Process step 4 (400x400)',
  },
} as const;

// Testimonial Assets
export const testimonialAssets = {
  customer1: {
    id: 'testimonial-1',
    path: '/assets/testimonials/customer-1.jpg',
    placeholder: `${PLACEHOLDER_BASE}/150x150/9370db/ffffff?text=1`,
    alt: 'Customer Photo',
    description: 'Customer photo 1 (150x150)',
  },
  customer2: {
    id: 'testimonial-2',
    path: '/assets/testimonials/customer-2.jpg',
    placeholder: `${PLACEHOLDER_BASE}/150x150/20b2aa/ffffff?text=2`,
    alt: 'Customer Photo',
    description: 'Customer photo 2 (150x150)',
  },
  customer3: {
    id: 'testimonial-3',
    path: '/assets/testimonials/customer-3.jpg',
    placeholder: `${PLACEHOLDER_BASE}/150x150/ff69b4/ffffff?text=3`,
    alt: 'Customer Photo',
    description: 'Customer photo 3 (150x150)',
  },
} as const;

// Blog Assets
export const blogAssets = {
  placeholder: {
    id: 'blog-placeholder',
    path: '/assets/blog/placeholder.jpg',
    placeholder: `${PLACEHOLDER_BASE}/800x450/708090/ffffff?text=Blog+Post`,
    alt: 'Blog Post',
    description: 'Default blog post image (800x450)',
  },
} as const;

// Logo and Brand Assets
export const brandAssets = {
  logo: {
    id: 'brand-logo',
    path: '/assets/brand/logo.svg',
    placeholder: `${PLACEHOLDER_BASE}/200x80/2c5f2d/ffffff?text=LOGO`,
    alt: 'Logo',
    description: 'Main logo (SVG, 200x80)',
  },
  logoWhite: {
    id: 'brand-logo-white',
    path: '/assets/brand/logo-white.svg',
    placeholder: `${PLACEHOLDER_BASE}/200x80/ffffff/2c5f2d?text=LOGO`,
    alt: 'Logo White',
    description: 'White logo for dark backgrounds (SVG, 200x80)',
  },
  favicon: {
    id: 'brand-favicon',
    path: '/favicon.svg',
    placeholder: `${PLACEHOLDER_BASE}/32x32/2c5f2d/ffffff?text=F`,
    alt: 'Favicon',
    description: 'Browser favicon (32x32)',
  },
} as const;

// Meta/OG Images
export const metaAssets = {
  ogImage: {
    id: 'meta-og-image',
    path: '/assets/meta/og-image.jpg',
    placeholder: `${PLACEHOLDER_BASE}/1200x630/2c5f2d/ffffff?text=Social+Share`,
    alt: 'Open Graph Image',
    description: 'Social media share image (1200x630)',
  },
} as const;

// Helper function
export function getAssetUrl(asset: Asset, useRealPath: boolean = true): string {
  // Always try to load the actual asset path.
  // If the file does not exist, our LazyImage component will gracefully
  // fallback to a sleek SVG placeholder without hitting external APIs.
  return asset.path;
}

export const ALL_ASSETS = {
  hero: heroAssets,
  about: aboutAssets,
  categories: categoryAssets,
  process: processAssets,
  testimonials: testimonialAssets,
  blog: blogAssets,
  brand: brandAssets,
  meta: metaAssets,
} as const;