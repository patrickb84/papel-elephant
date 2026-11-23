# Paper Elephant Publishing: First Lines

A static Astro page that shows the opening line of a classic novel beside a public-domain painting from the years it was published, with the author's portrait and a link to read the book free on Project Gutenberg. The page shows a random book on load, and **Another book** shuffles to a different one.

There's no backend, database, CMS or runtime API call. The collection is a JSON file and a folder of WebP images, both produced by the content pipeline in `scripts/`.

```
npm install
npm run dev        # http://localhost:4321
npm run build      # static site in dist/
npm run check      # type-check the site and the scripts
```

## How the page works

- `src/pages/index.astro` loads `src/data/first-lines.json` and renders `src/components/FirstLines.astro`.
- The build renders one entry as plain HTML, so the page works without JavaScript. With JavaScript, the page waits for a random entry, then fades it in. `#<id>` in the URL (for example `#pride-and-prejudice`) opens a specific book, and the hash updates as you shuffle.
- Shuffling preloads and decodes the next painting before the crossfade, and avoids the last ~20 books shown, not just the current one.
- While an image loads, the frame shows the painting's average colour. If the image fails, a paper-coloured panel replaces it. If a portrait fails, it's hidden.
- Accessibility: real `<button>` and `<a>` controls, visible focus, a polite live region that announces each new book, and `prefers-reduced-motion` turns the fades off.
- Every painting carries its title, artist, date, museum and a link to the museum's object page. Portraits link to their Wikimedia Commons page with the licence, and CC BY/BY-SA portraits show their artist and licence as the licence requires.

## The content pipeline

Each step reads the previous step's file in `content/work/` and writes its own. Every download is cached in `.cache/` (safe to delete), so re-running is cheap.

| Step | Command | What it does |
|---|---|---|
| 1 | `npm run content:discover` | Finds English public-domain fiction in the Project Gutenberg metadata. It tries Gutendex first and falls back to Gutenberg's own catalog CSV (Gutendex is often slow or down). It drops drama, poetry, essays and collections, keeps one edition per work, and ranks by how many Wikipedia language editions cover the work. Keeps 140 plus `include` overrides. |
| 2 | `npm run content:lines` | Downloads each plain text from the Gutenberg mirrors and cuts the licence header and footer. It finds where the narrative starts, skipping contents, prefaces, dedications, epigraphs and chapter summaries, then takes the first sentence. |
| 3 | `npm run content:metadata` | From Wikidata: the original publication year, the work's own "first line" property when it has one, genres and settings, the author and the author's portrait. From Commons: the portrait's licence and credit. All requests are batched, because Wikimedia rate-limits hard. |
| 4 | `npm run content:art` | Searches The Met and the Art Institute of Chicago for public-domain paintings **from the publication year** (within ±1 year; a museum date range or "c." date counts only if it's at most 5 years wide; see `scripts/lib/year-rule.ts` and `artYearTolerance`/`artMaxDateRange` in `content/config.json`). Besides the themed searches it always searches by type (landscape, seascape, still life, cityscape, abstraction), so the pool isn't only whatever the themes find; if there are still too few it widens the subjects, never the years. It scores each candidate on **type** (a strong bonus for landscapes, seascapes, cityscapes, still lifes, flowers and abstract, tonal or atmospheric work, and a strong penalty for portraits, figure groups, genre scenes and religious or mythological subjects, read from the museum's own metadata: AIC subject, term and style titles, Met tags and objectName, as well as the title), **themes**, **country** (the painter's nationality or the work's place of origin against the author's nationality and the book's country, weighted enough to break ties between similar paintings; Russian novels also lean to other European painters) and shape, then proposes one per book with 11 alternates. A painting is used once, and an artist at most twice. |
| 5 | `npm run content:images` | Downloads the paintings and portraits and writes WebP files to `public/first-lines/`, plus each image's average colour. |
| 6 | `npm run content:assemble` | Writes `src/data/first-lines.json` with only the entries that pass every check, and `content/REPORT.md`, which lists everything published, everything left out and why, and any shortfall. |
| - | `npm run content:review` | Writes `content/REVIEW.md` with everything still awaiting a decision. |

Run everything with `npm run content` (or `node scripts/run-all.ts --from=4` to resume at a step).

### What gets published

An entry reaches the site only when all of these hold:

- **Opening line:** taken from the Gutenberg text, and either approved in `content/reviews.json` or identical to the work's first line on Wikidata. An approval stores a hash of the exact sentence, so if a later run extracts something different, the approval no longer counts and the book goes back for review.
- **Year:** Wikidata's publication date, or an override with a note saying where it came from.
- **Painting:** from the publication year under the rule above (checked again here, so a hand-pinned painting can't break it), public domain, downloaded, and either approved in review or matched with high confidence and not rejected. Medium- and low-confidence matches wait for review.
- The **portrait** is optional. It's dropped if its licence isn't public domain, CC0, CC BY or CC BY-SA.

Nothing is invented to fill gaps. If fewer than 50 entries pass, `REPORT.md` states the shortfall.

### Reviewing

```
npm run content:review                                   # what's waiting, in content/REVIEW.md
node scripts/review.ts contact-sheet                     # JPG grids of the chosen paintings in .cache/contact/
node scripts/review.ts approve lines 1342 2701 --by "Your name"
node scripts/review.ts approve art 1342
node scripts/review.ts reject art 1342 --note "a portrait of a stranger"
npm run content:assemble
```

The first review pass (November 2026) was done by Claude, which read each extracted line against the Gutenberg text, so these approvals are marked as an AI review in `reviews.json`. A human spot-check is still worthwhile.

### Adding, removing or fixing entries

Everything hand-made lives in `content/overrides.json`:

```jsonc
{
  "exclude": { "1200": "why it's left out" },   // never publish this Gutenberg id
  "include": [768],                              // always consider this Gutenberg id
  "books": {
    "4300": { "startsWith": "Stately, plump Buck Mulligan" },  // where the narrative starts
    "1023": { "openingLine": "London. Michaelmas term lately over, …" }, // exact line; must appear in the text ("…" at the end marks an abridgement)
    "521":  { "wikidataSearch": "Robinson Crusoe" }, // help Wikidata matching
    "23700": { "year": 1353, "yearNote": "where the year comes from" },
    "1342": { "artwork": { "museum": "met", "id": "436965" } },  // choose a painting
    "84":   { "themes": ["gothic", "mountains"] },  // steer the painting search
    "105":  { "noPortrait": true, "title": "Persuasion" }
  }
}
```

- **Add a book:** put its Gutenberg id in `include`, then run `npm run content`.
- **Remove one:** add it to `exclude` with a reason, then run `npm run content:assemble`.
- **Swap a painting:** pick one from the alternates in `content/REVIEW.md` (or any public-domain object at either museum), put it in `books.<id>.artwork`, then run `node scripts/run-all.ts --from=4`.
- **Fix a line:** use `startsWith` or `openingLine`, run `node scripts/02-opening-lines.ts <id>`, approve it again, then reassemble.

`node scripts/peek.ts <gutenbergId> "<regex>"` searches a book's text, which helps when writing overrides.

## Brand and pages

- **All site text is in `content/site.yaml`:** the press name and email, the top-bar links, button labels, the About page copy, the contact form's labels, topics and messages. Edit it and rebuild; `npm run dev` picks up changes live.
- **Books:** `/books/` lists every file in `content/books/` (one YAML file per book, newest first by `published`; the file name is the book's `#anchor`). Covers go in `public/books/` as `<name>-425.webp` and `<name>-850.webp`. In book copy, `_Title_` is set in italics.
- `/` is First Lines, `/books/` the press's books, `/editing/` is the Editing & Ghostwriting page, and `/about/` is the About page with the contact form. The editing page's links open the form with a topic chosen (`/about/?topic=Ghostwriting#contact`); the topic must match one in `about.contact.topics`.
- Source logos are in `assets/`. `node scripts/brand-assets.ts` builds the web versions in `public/brand/`: the elephant mask the header colours with a gold foil gradient, the gold nested mark on the About page, and the link-preview image. `node scripts/favicons.ts` builds the site icons (`public/favicon.ico`, the Apple touch icon, the web-app icons and `public/site.webmanifest`), thickening the elephant's hairlines so it still reads at tab size.
- Below 720px the top-bar links collapse into a Menu button that opens a drawer (`src/components/SiteHeader.astro`, a modal `<dialog>`, so Escape, focus and the backdrop work natively). Without JavaScript the links stay in the bar.
- The header wordmark is live text in Playfair Display, laid out like the logo lock-up (elephant, thin rule, three lines).
- Each opening line is set like the start of a printed chapter: a gold Playfair drop cap (sunk three lines, or raised for short one-line openings), the first words in small capitals, and the elephant as an ornament on the rule below.
- **Open decisions:** entries marked `TODO` in `content/site.yaml` still need sign-off (the Editing services).
- **Contact form:** messages are emailed to `site.email` (`hello@paperelephantpublishing.com`) by [FormSubmit](https://formsubmit.co), a free service that needs no account. The very first message sends a confirmation email to that address; click its link once and every message after arrives in the inbox. To use another service instead (Formspree, say), set `PUBLIC_CONTACT_ENDPOINT` to its endpoint and rebuild. Topics listed under `about.contact.topicNotes` show who the message goes to and suggest what to write; the Editing page's links pick those topics. The form validates fields with inline messages and includes a hidden spam-trap field.

## Hosting

The site is hosted on [Netlify](https://www.netlify.com), set up from the GitHub repo. `netlify.toml` holds the settings: it runs `npm run build` on Node 24, publishes `dist/`, and sets cache headers.

- **Going live:** every push to `main` rebuilds and publishes the site. Other branches and pull requests get their own preview URLs.
- **The content pipeline doesn't run on Netlify.** Its output (`src/data/first-lines.json` and the images in `public/`) is committed, so regenerate locally and push.
- **Contact form:** emailed to the press's address by FormSubmit (see Brand and pages); nothing to set up in Netlify.
- **Also served:** `404.html` for unknown addresses (`src/pages/404.astro`), `robots.txt` and `sitemap.xml` (built from the top-bar links).

## Sources and licences

- Texts: [Project Gutenberg](https://www.gutenberg.org) (US public domain). The site links to each book rather than hosting it.
- Paintings: [The Met Open Access](https://www.metmuseum.org/hubs/open-access) and the [Art Institute of Chicago API](https://api.artic.edu/docs/), public-domain works only (CC0).
- Portraits and metadata: [Wikimedia Commons](https://commons.wikimedia.org) (each file's own licence, recorded per portrait) and [Wikidata](https://www.wikidata.org) (CC0).
