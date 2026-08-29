import { Helmet } from 'react-helmet-async';

// Reusable SEO component — gives each page a UNIQUE title, description,
// canonical URL, and social-share (Open Graph / Twitter) tags.
//
// Why this exists: MithilaVahan is a client-rendered React SPA, so without
// this every route shipped the SAME <title>/<description> in the HTML, which
// made pages look identical to Google and slowed indexing. Mirrors the
// Promedicoz SEO.jsx pattern.
//
// Props:
//   title       - page-specific title (site name is appended automatically)
//   description - page-specific meta description
//   path        - path for the canonical/OG url (e.g. "/vehicles")
//   type        - og:type ("website" default, "article" for blog posts)
//   image       - optional absolute image URL for social previews
export default function SEO({ title, description, path = '/', type = 'website', image }) {
  const siteName = 'MithilaVahan';
  const baseUrl = 'https://mithilavahan.in';
  const fullTitle = title
    ? `${title} | ${siteName}`
    : 'MithilaVahan — Rent vehicles & book rides in Mithilanchal';
  const desc =
    description ||
    'Book cars, autos, tempos, buses and trucks with a driver in Darbhanga and Muzaffarpur. Local vehicle owners rent out; locals ride.';
  const url = `${baseUrl}${path}`;
  const img = image || `${baseUrl}/icon-512.png`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      {/* Open Graph — WhatsApp, Facebook, LinkedIn sharing previews */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={img} />

      {/* Twitter card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
    </Helmet>
  );
}
