# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Readers who love books.** They arrive for First Lines: read an opening line beside a painting, shuffle to another, and sometimes follow the link to read the whole book free on Project Gutenberg. Success means they enjoy it, stay a while and come back.
- **Writers thinking about submitting.** Submissions are open. They want to know whether the press is real and right for their manuscript, then get in touch through the contact form's Submissions topic.
- **Writers looking for an editor or ghostwriter.** The press's owner, Railee Bradshaw, takes on editing and ghostwriting. They want to know what she offers and whether their project fits, then send an inquiry through the contact form with the matching topic.
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
- Pages: `/` (First Lines), `/books/` (the press's books, from `content/books/`), `/editing/` (Railee's editing and ghostwriting services) and `/about/` (about the press plus the contact form). Links to `/about/?topic=<topic>#contact` pre-select a contact topic.

## Capabilities and Constraints

- First Lines: a random book on load, **Another book** to shuffle (skipping about the last 20 shown), `#<id>` deep links, image preloading with a crossfade, an average-colour placeholder and fallbacks for failed images, full painting and portrait credits, and licence attribution where CC BY or BY-SA requires it.
- The page works without JavaScript. The build renders one entry as plain HTML.
- Nothing is invented to fill gaps. A first line, year, painting or portrait that doesn't pass the pipeline's checks isn't published.
- Submissions are open. The About page says so plainly and frames the press as small (few books at a time, slow replies), without terms that aren't set yet. Contact topics: General enquiry, Submissions, Editing, Ghostwriting, Research / story support, Books and publications, Rights and permissions, Press and events.
- **Open:** three of the four services on `/editing/` (Developmental Editing, Ghostwriting, Research / Story Support) are unconfirmed descriptions carried over from raileebradshaw.com and marked `TODO` in `content/site.yaml`. They need Railee's sign-off before launch.
- `/books/` lists the press's books newest first. _The Gingerbread House_ by R.M. Whitaker (Railee's pen name) shows its cover, back-cover copy, listing facts and links to Amazon and its page on raileebradshaw.com. Reader quotes, ratings and prices stay on the author's site.
- Navigation: First lines, Books, Editing, About. Below 720px the links collapse into a Menu button that opens a drawer (a modal `<dialog>`); without JavaScript they stay in the bar.
- **Open:** the About copy and the contact address `hello@paperelephantpublishing.com` are placeholders (marked `PLACEHOLDER` in `content/site.yaml`).
- **Open:** the terms for submissions (genres, what to send, response times).

## Brand Commitments

- **Name:** Paper Elephant Publishing.
- **Logos are binding:** the elephant logo and the nested mark (source files in `assets/`, web versions built into `public/brand/` by `scripts/brand-assets.ts`) are the press's real identity.
- **First Lines stays the home page.** Future work must not replace it with a catalogue or marketing landing page.
- The current voice in `site.yaml` (warm and plain, e.g. "Small books, made with care.") is provisional and not yet confirmed as binding.

## Evidence on Hand

- The First Lines collection: real opening lines, paintings and portraits, all with recorded sources and licences (`src/data/first-lines.json`, `content/REPORT.md`).
- The brand logos in `assets/`.
- Railee Bradshaw owns the press (Paper Elephant Publishing LLC). She has a degree in English/Writing and Communications from Eastern Oregon University, has edited books for other authors, ghostwrote a spiritual memoir, and wrote and published her own novel, The Gingerbread House (as R.M. Whitaker).
- _The Gingerbread House_ cover (`public/books/`), from raileebradshaw.com.
- One editing testimonial: AmyJae Springer, an author and editing client, in her Amazon review of The Gingerbread House (December 11, 2025): "…the brilliant editor behind my own books." The review is of the novel, so the attribution must say so.
- **Absent, so never fabricate:** About copy, other reviews or testimonials, editing rates, packages, turnaround times, years of experience, client results, sales or reader numbers, author bios, a submissions policy, team members, and any other titles.

## Product Principles

1. **Show care rather than claim it.** The press proves its seriousness through how well First Lines is sourced, credited and made, not through promotional copy.
2. **The press is real; keep it truthful.** One published book is the true scale. Never imply a bigger list, team or track record than exists.
3. **Reading comes first.** The home page is for reading and lingering. Everything else (About, contact, future book pages) supports it without crowding it.
4. **Every source is credited.** Texts, paintings and portraits keep full attribution and honour their licences.
5. **Make getting in touch easy for anyone with a reason to.** Writers and trade contacts should find a way in without hunting for it.

## Accessibility & Inclusion

Already in place and to be kept: real `<button>` and `<a>` controls, visible focus, a polite live region announcing each new book, `prefers-reduced-motion` disabling fades, and a page that works without JavaScript. No formal standard has been set; WCAG 2.2 AA is the working floor.
