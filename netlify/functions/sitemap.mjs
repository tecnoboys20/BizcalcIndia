export default async (req, context) => {
  const NETLIFY_URL = 'https://bizcalcindia.netlify.app';
  
  // Base URLs
  const urls = [
    { loc: '/', changefreq: 'daily', priority: 1.0 },
    { loc: '/blog', changefreq: 'daily', priority: 0.9 },
    { loc: '/pricing', changefreq: 'weekly', priority: 0.8 },
  ];

  // We could fetch dynamic blog posts here if they were in a DB.
  // Since they are hardcoded in src/data/blogPosts.js, this function won't easily read them 
  // without importing that file (which might be tricky in a Netlify function if not built together).
  // For now, we will just return the static routes. To properly index dynamic routes, 
  // we would need an API or a pre-build step.

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(url => `
  <url>
    <loc>${NETLIFY_URL}${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

export const config = {
  path: '/sitemap.xml',
};
