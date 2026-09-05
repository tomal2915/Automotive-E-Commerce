import { Helmet } from "react-helmet-async";

interface Props {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
  jsonLd?: Record<string, unknown>; // structured data, page-specific
}

// Centralizes how every page sets its title/meta/Open-Graph tags, so the
// same defaults and format apply everywhere and a page only overrides
// what's actually different about it
export default function SEO({
  title,
  description,
  image,
  url,
  type = "website",
  jsonLd,
}: Props) {
  const siteName = "AutoParts BD";
  const fullTitle = `${title} | ${siteName}`;
  const defaultImage = `${window.location.origin}/og-default.png`;
  const canonicalUrl = url || window.location.href;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph — controls how the page looks when shared on Facebook/WhatsApp/LinkedIn */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card — same purpose, for Twitter/X previews */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image || defaultImage} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
