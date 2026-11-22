# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Readers who love books.** They arrive for First Lines: read an opening line beside a painting, shuffle to another, and sometimes follow the link to read the whole book free on Project Gutenberg. Success means they enjoy it, stay a while and come back.
- **Writers thinking about submitting.** They want to know whether the press is real and right for their manuscript, then get in touch through the contact form's Submissions topic.
- **Trade contacts.** Agents, journalists, booksellers and event organisers looking for a way to reach the press about rights, press or events.
- **The owner's own circle.** For now, a lot of traffic will be friends and family. The site also works as the press's calling card.

## Product Purpose

Paper Elephant Publishing is a real, independent press run by its owner. It has published one book. The website shows that the press exists and is cared for, gives it a presence that readers want to spend time with, and gives writers and trade contacts a clear way to get in touch.

First Lines is the home page and the main reason to visit. It shows the opening line of a classic novel beside a public-domain painting from the years the book was published, with the author's portrait and a link to read it on Project Gutenberg.

## Positioning

The press doesn't open with a catalogue. It opens with a curated reading experience: each first line is checked against the source text, paired with a period painting from The Met or the Art Institute of Chicago, and fully credited. That shows the press's care for books through the site itself, before it has many books of its own to show.

## Operating Context

- A static Astro site with no backend, database, CMS or runtime API. The collection is `src/data/first-lines.json` plus WebP images in `public/first-lines/`, produced by the content pipeline in `scripts/` and checked by hand through `content/reviews.json` and `content/overrides.json`.
- All site copy lives in `content/site.yaml`.
- The contact form posts to a third-party form service (`PUBLIC_CONTACT_ENDPOINT`) when one is set. Until then it opens the visitor's email app.
- Pages: `/` (First Lines) and `/about/` (about the press plus the contact form).

## Capabilities and Constraints

- First Lines: a random book on load, **Another book** to shuffle (skipping about the last 20 shown), `#<id>` deep links, image preloading with a crossfade, an average-colour placeholder and fallbacks for failed images, full painting and portrait credits, and licence attribution where CC BY or BY-SA requires it.
- The page works without JavaScript. The build renders one entry as plain HTML.
- Nothing is invented to fill gaps. A first line, year, painting or portrait that doesn't pass the pipeline's checks isn't published.
- Contact topics: General enquiry, Submissions, Rights and permissions, Press and events.
- **Open:** the published book's title, details and where to buy it aren't on the site yet. Whether and how the site will show the press's own books is undecided.
- **Open:** the About copy and the contact address `hello@paperelephantpublishing.com` are placeholders (marked `PLACEHOLDER` in `content/site.yaml`).
- **Open:** whether the press is currently open to submissions, and on what terms.

## Brand Commitments

- **Name:** Paper Elephant Publishing.
- **Logos are binding:** the elephant logo and the nested mark (source files in `assets/`, web versions built into `public/brand/` by `scripts/brand-assets.ts`) are the press's real identity.
- **First Lines stays the home page.** Future work must not replace it with a catalogue or marketing landing page.
- The current voice in `site.yaml` (warm and plain, e.g. "Small books, made with care.") is provisional and not yet confirmed as binding.

## Evidence on Hand

- The First Lines collection: real opening lines, paintings and portraits, all with recorded sources and licences (`src/data/first-lines.json`, `content/REPORT.md`).
- The brand logos in `assets/`.
- **Absent, so never fabricate:** About copy, the published book's details, cover art, reviews, testimonials, sales or reader numbers, author bios, a submissions policy, team members, and any other titles.

## Product Principles

1. **Show care rather than claim it.** The press proves its seriousness through how well First Lines is sourced, credited and made, not through promotional copy.
2. **The press is real; keep it truthful.** One published book is the true scale. Never imply a bigger list, team or track record than exists.
3. **Reading comes first.** The home page is for reading and lingering. Everything else (About, contact, future book pages) supports it without crowding it.
4. **Every source is credited.** Texts, paintings and portraits keep full attribution and honour their licences.
5. **Make getting in touch easy for anyone with a reason to.** Writers and trade contacts should find a way in without hunting for it.

## Accessibility & Inclusion

Already in place and to be kept: real `<button>` and `<a>` controls, visible focus, a polite live region announcing each new book, `prefers-reduced-motion` disabling fades, and a page that works without JavaScript. No formal standard has been set; WCAG 2.2 AA is the working floor.
