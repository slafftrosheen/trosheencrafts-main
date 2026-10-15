import { ScrollStoryPhotos, WorkshopTourPhotos } from "@/lib/imageAssets";
import type { HomepageImageSlot } from "../../../shared/homepageMedia";

/** Bundled originals are only a fallback until their R2 replacement is published. */
export const DEFAULT_HOMEPAGE_IMAGES: Record<HomepageImageSlot, string> = {
  siteLogo: "/brand/seal-spruce.webp",
  hero: "/brand/hero-wide.webp",
  storyHeritage: "/brand/collection-mould.webp",
  storyMakers: "/brand/collection-heirloom.webp",
  storyLegacy: ScrollStoryPhotos.chapter4_family,
  storyPhilosophy: ScrollStoryPhotos.chapter5_mastery,
  materials: WorkshopTourPhotos.materialsArea,
  craftsmanship: WorkshopTourPhotos.castingStation,
  shopFeature: "/brand/newsletter.webp",
  familyFeature: "/brand/story.webp",
};
