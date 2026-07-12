import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

interface SiteConfig {
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
    telegram: string;
  };
  businessHours: {
    monFri: string;
    satSun: string;
  };
}

const DEFAULT_CONFIG: SiteConfig = {
  contact: {
    email: import.meta.env.VITE_CONTACT_EMAIL || 'hello@trosheen.crafts',
    phone: import.meta.env.VITE_CONTACT_PHONE || '+371 XXX XXXXX',
    address: import.meta.env.VITE_CONTACT_ADDRESS || 'Daugavpils, Latvia',
  },
  social: {
    facebook: import.meta.env.VITE_SOCIAL_FACEBOOK || 'https://facebook.com/trosheencrafts',
    instagram: import.meta.env.VITE_SOCIAL_INSTAGRAM || 'https://instagram.com/trosheen.crafts',
    twitter: import.meta.env.VITE_SOCIAL_TWITTER || '',
    youtube: '',
    telegram: '',
  },
  businessHours: {
    monFri: '09:00 - 18:00',
    satSun: 'Family Time',
  },
};

export function useSiteConfig() {
  const { data } = useQuery<SiteConfig>({
    queryKey: ['siteConfig'],
    queryFn: async () => {
      try {
        return await apiClient.get<SiteConfig>('/site-config');
      } catch (error) {
        console.warn('Failed to fetch site config, using defaults:', error);
        return DEFAULT_CONFIG;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Return data merged with defaults, or just defaults if loading
  return data || DEFAULT_CONFIG;
}
