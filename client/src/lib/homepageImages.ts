import { ScrollStoryPhotos, WorkshopTourPhotos } from "@/lib/imageAssets";
import type { HomepageImageSlot } from "../../../shared/homepageMedia";

/** Bundled originals are only a fallback until their R2 replacement is published. */
export const DEFAULT_HOMEPAGE_IMAGES: Record<HomepageImageSlot, string> = {
  siteLogo: "/brand/seal-spruce.webp",
  hero: "/heroes/trosheen-hero-desktop-05-1920.webp",
  storyHeritage: "/photos/photo-g05.webp",
  storyMakers: "/photos/photo-i03.webp",
  storyLegacy: ScrollStoryPhotos.chapter4_family,
  storyPhilosophy: ScrollStoryPhotos.chapter5_mastery,
  materials: WorkshopTourPhotos.materialsArea,
  craftsmanship: WorkshopTourPhotos.castingStation,
  shopFeature: "/photos/piece-04.webp",
  galleryFeature: "",
  journalFeature: "",
  familyFeature: "/heroes/trosheen-hero-desktop-04-1920.jpg",
};
