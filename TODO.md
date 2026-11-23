# Later

Things to pick up when there's time. None of them block the live site.

## Get found

- [ ] **Google Search Console.** Add `https://paperelephantpublishing.com` (free) and submit the sitemap at `https://paperelephantpublishing.com/sitemap.xml`, so the pages show up in search sooner.

## Visitor counts

- [ ] **Free, privacy-friendly analytics.** Netlify's own analytics are paid. Cloudflare Web Analytics or GoatCounter are free and need one script tag in `src/layouts/Base.astro`.

## First Lines

- [ ] **More books.** 29 published against the original target of 50. Run the pipeline for more (see README, "The content pipeline"), with the same rules: lines checked against the Gutenberg text, a painting within a year of publication, landscapes / still lifes / abstract work preferred.
- [ ] **Missing author portraits.** Wuthering Heights (768), Jane Eyre (1260) and Three Men in a Boat (308) have none; Wikimedia rate-limited the downloads. Retry with `node scripts/05-images.ts 768 1260 308`, then `node scripts/06-assemble.ts`.
- [ ] **Soft paintings.** Sense and Sensibility (Constable) and The Wind in the Willows (Hartley) come from small source files and look soft on large screens. Look for higher-resolution copies or alternatives that still pass the same-year rule.
