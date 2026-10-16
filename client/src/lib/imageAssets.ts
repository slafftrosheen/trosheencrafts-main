/**
 * Centralized Image Asset Management System
 * Maps all REAL renamed photos to their intended usage
 * Each image should be assigned to ONE primary context to ensure uniqueness
 * Last updated: February 1, 2026
 */

// Photography now lives in /public and is served as static files (the previous
// bundled client/src/assets folder is no longer part of the repository, so these
// were broken imports). Every path below is a real Trosheen photo from the
// v4.3 website kit.

// CANDLE PRODUCTS
const handsHoldingHeartCandle = '/photos/piece-16.webp';
const heartShapedMugCandle = '/photos/piece-02.webp';
const handsVaseShapeCandle = '/photos/piece-03.webp';
const seaShellCandle = '/photos/piece-06.webp';
const seaStarGelCandle = '/photos/piece-07.webp';
const womanFaceCandle = '/photos/photo-g05.webp';
const latvianMotiffCandle = '/photos/photo-g06.webp';
const valentineSelection = '/photos/photo-i03.webp';
const valentineSelection2 = '/heroes/trosheen-hero-mobile-01-750.webp';

// WORKSHOP & PROCESS
const alisijaFillingCandle = '/heroes/trosheen-hero-mobile-02-750.webp';
const nikPaintingCandle = '/heroes/trosheen-hero-mobile-03-750.webp';
const castingProcess = '/heroes/trosheen-hero-mobile-04-750.webp';

// GARDEN & DECORATIVE
const leafSteppingStone = '/heroes/trosheen-hero-mobile-05-750.webp';
const handsShapedTray = '/heroes/trosheen-hero-mobile-06-750.webp';

// HERO & STORY
const heroPhoto = '/heroes/trosheen-hero-desktop-01-1920.webp';
const storyPhoto = '/heroes/trosheen-hero-mobile-07-750.webp';
const storyPhoto2 = '/heroes/trosheen-hero-mobile-08-750.webp';
const storyPhoto3 = '/heroes/trosheen-hero-desktop-03-1920.webp';
const heroWorkshop = '/heroes/trosheen-hero-desktop-02-1920.webp';

// UI ASSETS
const logoImg = '/brand/seal-spruce.svg';
const teamPortraitImg = '/heroes/trosheen-hero-mobile-09-750.webp';

// Product photos - exclusively for product display
export const ProductPhotos = {
  hero: handsHoldingHeartCandle, // Hero product shot
  candles: {
    heartHands: handsHoldingHeartCandle,
    heartMug: heartShapedMugCandle,
    vaseShape: handsVaseShapeCandle,
    seaShell: seaShellCandle,
    seaStar: seaStarGelCandle,
    womanFace: womanFaceCandle,
    latvianMotif: latvianMotiffCandle,
    valentineCollection: valentineSelection,
    valentineCollection2: valentineSelection2,
  },
  garden: {
    leafStone: leafSteppingStone,
    handsTray: handsShapedTray,
  },
  workshop: {
    alisija: alisijaFillingCandle,
    nikolass: nikPaintingCandle,
    casting: castingProcess,
  },
};

// Hero section photos - unique to hero
export const HeroPhotos = {
  main: heroPhoto,
  secondary: heroWorkshop, // Changed to unique workshop hero image
  story: storyPhoto3, // Changed to unique story photo
};

// Timeline photos - each era gets a unique photo
export const TimelinePhotos = {
  era1995: castingProcess,
  era2005: storyPhoto3,
  era2012: storyPhoto,
  era2015: storyPhoto2, // Changed from alisijaFillingCandle
  era2019: nikPaintingCandle,
  era2023: valentineSelection2, // Changed from valentineSelection
  era2026: latvianMotiffCandle, // Changed from handsHoldingHeartCandle
};

// Scroll story photos - each chapter gets a unique photo
export const ScrollStoryPhotos = {
  chapter1_heritage: storyPhoto,
  chapter2_materials: leafSteppingStone, // Changed from castingProcess  
  chapter3_crafting: storyPhoto2,
  chapter4_family: alisijaFillingCandle,
  chapter5_mastery: womanFaceCandle, // Changed from handsHoldingHeartCandle
};

// Workshop tour photos - each station gets a unique photo
export const WorkshopTourPhotos = {
  entrance: heroWorkshop, // Changed from storyPhoto to unique workshop hero
  materialsArea: handsShapedTray, // Changed from castingProcess
  castingStation: castingProcess, // Now unique in this context
  finishingStudio: nikPaintingCandle,
  completedPieces: valentineSelection,
};

// Custom builder preview photos - each type gets a unique photo
export const CustomBuilderPhotos = {
  candlePreview: seaShellCandle, // Changed from heartShapedMugCandle
  planterPreview: handsShapedTray,
  sculpturePreview: womanFaceCandle,
  gardenStonePreview: leafSteppingStone,
  collectionPreview: handsVaseShapeCandle, // Changed from valentineSelection
};

export const BrandAssets = {
  logo: logoImg,
  teamPortrait: teamPortraitImg,
};

export interface ProductItem {
  id: string;
  name: string;
  category: 'candles' | 'garden' | 'decorative' | 'collections';
  price: string;
  images: string[];
  featured: boolean;
  description?: string;
  materials?: string[];
  inStock?: boolean;
  madeBy?: 'Oleg' | 'Alisija' | 'Nikolass' | 'Family';
}

// NOTE: This ProductCatalog is for reference only - actual products should come from the backend API
// Do not use this data in the frontend directly
export const ProductCatalog: ProductItem[] = [
  {
    id: 'heart-hands-candle',
    name: 'Heart in Hands Candle',
    category: 'candles',
    price: '€48',
    images: [handsHoldingHeartCandle],
    featured: true,
    description: 'Our signature piece. Burns away to reveal hands cradling a heart.',
    materials: ['Concrete', 'Soy wax', 'Hand-burnished'],
    inStock: true,
    madeBy: 'Oleg',
  },
  {
    id: 'heart-mug-candle',
    name: 'Heart Mug Vessel',
    category: 'candles',
    price: '€42',
    images: [heartShapedMugCandle],
    featured: true,
    materials: ['Concrete', 'Soy wax'],
    inStock: true,
    madeBy: 'Family',
  },
  {
    id: 'sea-shell-candle',
    name: 'Sea Shell Vessel',
    category: 'candles',
    price: '€45',
    images: [seaShellCandle],
    featured: false,
    materials: ['Concrete', 'Gel wax'],
    inStock: true,
    madeBy: 'Alisija',
  },
  {
    id: 'sea-star-gel',
    name: 'Sea Star Gel Candle',
    category: 'candles',
    price: '€50',
    images: [seaStarGelCandle],
    featured: true,
    inStock: true,
    madeBy: 'Nikolass',
  },
  {
    id: 'woman-face-candle',
    name: 'Woman Face Sculpture',
    category: 'candles',
    price: '€68',
    images: [womanFaceCandle],
    featured: true,
    materials: ['Concrete', 'Bronze oxide'],
    inStock: false,
    madeBy: 'Oleg',
  },
  {
    id: 'latvian-motif',
    name: 'Latvian Heritage Candle',
    category: 'candles',
    price: '€52',
    images: [latvianMotiffCandle],
    featured: false,
    inStock: true,
    madeBy: 'Family',
  },
  {
    id: 'leaf-stone',
    name: 'Botanical Stepping Stone',
    category: 'garden',
    price: '€38',
    images: [leafSteppingStone],
    featured: false,
    inStock: true,
    madeBy: 'Nikolass',
  },
  {
    id: 'hands-tray',
    name: 'Hands Offering Tray',
    category: 'decorative',
    price: '€45',
    images: [handsShapedTray],
    featured: false,
    inStock: true,
    madeBy: 'Alisija',
  },
  {
    id: 'valentine-collection',
    name: "Valentine's Collection",
    category: 'collections',
    price: '€180',
    images: [valentineSelection, valentineSelection2],
    featured: true,
    inStock: true,
    madeBy: 'Family',
  },
];

export function getProductById(id: string) {
  return ProductCatalog.find(p => p.id === id);
}

export function getProductsByCategory(category: ProductItem['category']) {
  return ProductCatalog.filter(p => p.category === category);
}

export function getFeaturedProducts() {
  return ProductCatalog.filter(p => p.featured);
}

export default {
  ProductPhotos,
  HeroPhotos,
  TimelinePhotos,
  ScrollStoryPhotos,
  WorkshopTourPhotos,
  CustomBuilderPhotos,
  BrandAssets,
  ProductCatalog,
};