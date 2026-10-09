import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { HomepageImages, HomepageImageSlot } from "../../../shared/homepageMedia";
import { DEFAULT_HOMEPAGE_IMAGES } from "@/lib/homepageImages";

export const HOMEPAGE_IMAGES_QUERY_KEY = ["homepageImages"] as const;

export function useHomepageImages() {
  const query = useQuery<HomepageImages>({
    queryKey: HOMEPAGE_IMAGES_QUERY_KEY,
    queryFn: () => apiClient.get<HomepageImages>("/site-config/homepage-images"),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const image = (slot: HomepageImageSlot) => query.data?.[slot] || DEFAULT_HOMEPAGE_IMAGES[slot];
  return { ...query, image };
}
