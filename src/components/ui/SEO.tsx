import React from 'react';
import { Helmet } from 'react-helmet-async';
import { brandConfig } from '../../data/brand-config';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = `${brandConfig.name} — ${brandConfig.tagline}. Discover the latest fashion trends for Men, Women, and Kids.`,
  canonical,
  image = '/og-image.jpg',
  type = 'website',
}) => {
  const fullTitle = title
    ? `${title} | ${brandConfig.name}`
    : `${brandConfig.name} — ${brandConfig.tagline}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      {canonical && <link rel="canonical" href={canonical} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};
