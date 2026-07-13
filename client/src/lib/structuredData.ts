export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Trosheen.Crafts',
  url: 'https://trosheen.shop',
  logo: 'https://trosheen.shop/logo.webp',
  description: 'Handcrafted concrete art and home decor from Latvia',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Daugavpils',
    addressCountry: 'LV',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'hello@trosheen.shop',
  },
  sameAs: [
    'https://www.instagram.com/trosheen.shop',
    'https://www.facebook.com/trosheencrafts',
  ],
};

export function productSchema(product: {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: 'Trosheen.Crafts',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: `https://trosheen.shop/shop/${product.id}`,
      seller: {
        '@type': 'Organization',
        name: 'Trosheen.Crafts',
      },
    },
  };
}

export function blogPostSchema(post: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image,
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Trosheen.Crafts',
      logo: {
        '@type': 'ImageObject',
        url: 'https://trosheen.shop/logo.webp',
      },
    },
  };
}

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Trosheen.Crafts',
  url: 'https://trosheen.shop',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://trosheen.shop/shop?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};
