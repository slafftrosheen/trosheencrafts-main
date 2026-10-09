import { HeroPhotos, ScrollStoryPhotos, WorkshopTourPhotos, BrandAssets } from "@/lib/imageAssets";
import type { HomepageImageSlot } from "../../../shared/homepageMedia";

/** Bundled originals are only a fallback until their R2 replacement is published. */
export const DEFAULT_HOMEPAGE_IMAGES: Record<HomepageImageSlot, string> = {
  siteLogo: BrandAssets.logo,
  hero: HeroPhotos.main,
  storyHeritage: ScrollStoryPhotos.chapter1_heritage,
  storyMakers: ScrollStoryPhotos.chapter3_crafting,
  storyLegacy: ScrollStoryPhotos.chapter4_family,
  storyPhilosophy: ScrollStoryPhotos.chapter5_mastery,
  materials: WorkshopTourPhotos.materialsArea,
  craftsmanship: WorkshopTourPhotos.castingStation,
  shopFeature: WorkshopTourPhotos.completedPieces,
  familyFeature: BrandAssets.teamPortrait,
};
