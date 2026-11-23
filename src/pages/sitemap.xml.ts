// sitemap.xml: the site's pages, from the top-bar links in content/site.yaml.
import { NAV, SITE } from '../lib/site';

export const GET = () => {
  const urls = NAV.map((item) => `  <url><loc>${new URL(item.href, SITE.url).href}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
