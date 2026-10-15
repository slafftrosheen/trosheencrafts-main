import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export function SEO({ title, description, keywords, image, url }: SEOProps) {
  // Never publish checkout tokens, search terms or tracking parameters in metadata.
  const siteUrl = url || (typeof window !== 'undefined'
    ? window.location.origin + window.location.pathname
    : 'https://trosheen.shop/');
  const defaultImage = 'https://trosheen.shop/brand/social-share.webp';
  const imageUrl = image ? new URL(image, 'https://trosheen.shop').href : defaultImage;
  const fullTitle = title.toLowerCase().includes('trosheen') ? title : `${title} — Trosheen`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <link rel="canonical" href={siteUrl} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:type" content="website" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
}