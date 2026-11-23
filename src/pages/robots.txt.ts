// robots.txt: everything may be indexed; points crawlers at the sitemap.
import { SITE } from '../lib/site';

export const GET = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', SITE.url).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
