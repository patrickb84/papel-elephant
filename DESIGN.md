---
name: Paper Elephant Publishing
description: An independent press's site, set like the opening page of a printed chapter.
colors:
  laid-paper: "#f5f0e6"
  laid-paper-deep: "#ebe3d4"
  press-ink: "#1c1a17"
  ink-soft: "#57514a"
  ink-faint: "#6f685f"
  hairline: "#d8cfbf"
  gilt-leaf: "#a07c2c"
  gilt-leaf-soft: "#c9a75a"
  gilt-text: "#7d5a1c"
  foil-deep: "#a9792b"
  foil-warm: "#d9b768"
  foil-pale: "#f0d999"
  foil-honey: "#c49a4a"
  foil-umber: "#9c6f26"
  foil-mark-bright: "#a57a2e"
  foil-mark-pale: "#c29b4e"
  foil-mark-umber: "#87621f"
  rust-error: "#b0452f"
  night-paper: "#171511"
  night-paper-deep: "#211e18"
  night-ink: "#eee7da"
  night-ink-soft: "#b9b0a2"
  night-ink-faint: "#8c8478"
  night-hairline: "#3a352c"
  night-gilt: "#d0ae63"
  night-gilt-soft: "#9c7f3e"
  night-rust-error: "#e0846f"
typography:
  display:
    fontFamily: "'Playfair Display Variable', 'Playfair Display', Georgia, serif"
    fontSize: "clamp(2.6rem, 6vw, 4.6rem)"
    fontWeight: 450
    lineHeight: 1.02
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "'Playfair Display Variable', 'Playfair Display', Georgia, serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 450
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Playfair Display Variable', 'Playfair Display', Georgia, serif"
    fontSize: "1.45rem"
    fontWeight: 450
    letterSpacing: "-0.01em"
  numeral:
    fontFamily: "'Playfair Display Variable', 'Playfair Display', Georgia, serif"
    fontSize: "1.4rem"
  year-numeral:
    fontFamily: "'Playfair Display Variable', 'Playfair Display', Georgia, serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.01em"
    fontFeature: "'lnum'"
  epigraph:
    fontFamily: "'Playfair Display Variable', 'Playfair Display', Georgia, serif"
    fontSize: "clamp(1.6rem, 3vw, 2.2rem)"
    lineHeight: 1.2
  menu-entry:
    fontFamily: "'Playfair Display Variable', 'Playfair Display', Georgia, serif"
    fontSize: "clamp(1.9rem, 9vw, 2.4rem)"
    fontWeight: 450
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  first-line-short:
    fontFamily: "'Newsreader Variable', 'Iowan Old Style', Georgia, serif"
    fontSize: "clamp(2rem, 4.2vw, 3.5rem)"
    fontWeight: 380
    lineHeight: 1.12
    letterSpacing: "-0.01em"
  first-line:
    fontFamily: "'Newsreader Variable', 'Iowan Old Style', Georgia, serif"
    fontSize: "clamp(1.55rem, 2.7vw, 2.4rem)"
    fontWeight: 380
    lineHeight: 1.22
    letterSpacing: "-0.01em"
  first-line-long:
    fontFamily: "'Newsreader Variable', 'Iowan Old Style', Georgia, serif"
    fontSize: "clamp(1.3rem, 2vw, 1.8rem)"
    fontWeight: 380
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  first-line-xlong:
    fontFamily: "'Newsreader Variable', 'Iowan Old Style', Georgia, serif"
    fontSize: "clamp(1.08rem, 1.45vw, 1.35rem)"
    fontWeight: 380
    lineHeight: 1.42
    letterSpacing: "-0.01em"
  lede:
    fontFamily: "'Newsreader Variable', 'Iowan Old Style', Georgia, serif"
    fontSize: "clamp(1.2rem, 1.8vw, 1.45rem)"
    lineHeight: 1.45
  book-title:
    fontFamily: "'Newsreader Variable', 'Iowan Old Style', Georgia, serif"
    fontSize: "1.3rem"
    lineHeight: 1.25
  blurb:
    fontFamily: "'Newsreader Variable', 'Iowan Old Style', Georgia, serif"
    fontSize: "1.12rem"
    lineHeight: 1.6
  body:
    fontFamily: "'Newsreader Variable', 'Iowan Old Style', Georgia, serif"
    fontSize: "1.05rem"
    lineHeight: 1.5
  colophon:
    fontFamily: "'Newsreader Variable', 'Iowan Old Style', Georgia, serif"
    fontSize: "0.92rem"
    lineHeight: 1.4
  label:
    fontFamily: "'Instrument Sans Variable', system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 500
    letterSpacing: "0.02em"
  field-label:
    fontFamily: "'Instrument Sans Variable', system-ui, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 500
  wordmark:
    fontFamily: "'Playfair Display Variable', 'Playfair Display', Georgia, serif"
    fontSize: "1.04rem"
    fontWeight: 460
    lineHeight: 0.96
    letterSpacing: "0.005em"
rounded:
  hairline: "2px"
  field: "4px"
  panel: "6px"
  pill: "999px"
spacing:
  gutter: "clamp(1rem, 4vw, 3.5rem)"
  header: "5.5rem"
  stack-sm: "0.75rem"
  stack-md: "1.25rem"
  stack-lg: "2rem"
  section: "clamp(2.5rem, 7vw, 5.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.press-ink}"
    textColor: "{colors.laid-paper}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.6rem 1.25rem"
    height: "44px"
  button-primary-hover:
    backgroundColor: "transparent"
    textColor: "{colors.press-ink}"
  button-cta:
    backgroundColor: "{colors.press-ink}"
    textColor: "{colors.laid-paper}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.65rem 1.5rem"
    height: "46px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.press-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.6rem 1.25rem"
    height: "44px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.press-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 0.95rem"
    height: "44px"
  input:
    backgroundColor: "{colors.laid-paper}"
    textColor: "{colors.press-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "0.7rem 0.8rem"
    height: "44px"
  form-panel:
    backgroundColor: "{colors.laid-paper-deep}"
    rounded: "{rounded.panel}"
    padding: "clamp(1.25rem, 3vw, 2.25rem)"
  topic-note:
    textColor: "{colors.press-ink}"
    typography: "{typography.body}"
  nav-link:
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    padding: "0.5rem 0"
  nav-link-active:
    textColor: "{colors.press-ink}"
  menu-drawer:
    backgroundColor: "{colors.laid-paper}"
    width: "min(22rem, 86vw)"
  menu-entry:
    textColor: "{colors.ink-soft}"
    typography: "{typography.menu-entry}"
    padding: "0.85rem 0 0.95rem"
  menu-entry-active:
    textColor: "{colors.press-ink}"
  kicker:
    textColor: "{colors.gilt-leaf}"
    typography: "{typography.label}"
  section-numeral:
    textColor: "{colors.gilt-leaf}"
    typography: "{typography.numeral}"
  year-numeral:
    textColor: "{colors.gilt-text}"
    typography: "{typography.year-numeral}"
  portrait:
    backgroundColor: "{colors.laid-paper-deep}"
    size: "64px"
  floral:
    backgroundColor: "{colors.gilt-leaf-soft}"
  floral-rule:
    backgroundColor: "{colors.gilt-leaf}"
    width: "7.5rem"
  site-footer:
    textColor: "{colors.ink-faint}"
    padding: "2rem 0"
---

# Design System: Paper Elephant Publishing

## Overview

**Creative North Star: "The Chapter Opening"**

Every screen is set like the first page of a printed chapter. A warm paper ground, near-black ink, and a little gilt where a bookbinder would put it: on the mark, the initial, the rule under the heading. The home page is the purest expression. The opening line of a novel is typeset as a chapter opening, with a sunk gold drop cap, the first words in small capitals, and the press's elephant set as a fleuron on a hairline beneath. A period painting hangs beside it like a frontispiece.

The system is quiet and generous. Density is low, margins are wide, and nothing competes with the text or the painting. Character comes from typesetting detail (optical sizing, small caps, hanging punctuation, lining numerals, italic titles in `<cite>`) rather than colour or decoration. The press's botanical line drawings appear as a printer would use ornaments: a sprig laid on a section rule, a stem in an empty margin, always in clear paper. Motion is limited to slow crossfades and small settling gestures, and turns off under `prefers-reduced-motion`.

The site follows the reader's colour scheme. Light is laid paper and ink; dark is the same page by lamplight, with warm near-black paper and a brighter gilt. Both are first-class.

**Key Characteristics:**
- Warm paper and ink, with gold used sparingly as gilding.
- Three type voices with strict jobs: Playfair (display, marks and numerals), Newsreader (reading), Instrument Sans (small UI).
- Book typography as interface: drop caps, small capitals, fleurons, hairline rules, roman-numeral sequences, gilt year numerals.
- Flat page; the painting and the book cover are the only things that lift.
- Two ornament families only: the elephant mark, and the press's botanical line drawings in gilt.

## Colors

A warm, low-chroma paper-and-ink palette with a single antique gold accent and its foil gradient.

### Primary
- **Gilt Leaf** (`gilt-leaf`): kickers and their leading rule, drop caps, the fleuron, roman numerals, section-rule sprigs, focus rings and input focus borders. In dark mode it brightens to **Night Gilt** (`night-gilt`) to hold contrast.
- **Gilt Leaf Soft** (`gilt-leaf-soft`): resting link underlines (which deepen to Gilt Leaf on hover), the default ink of the florals, and the testimonial's left rule.
- **Gilt Text** (`gilt-text`): gilt that has to be read at text size, namely the year numerals. Deep enough for about 5.5:1 on Laid Paper. In dark mode it is Night Gilt.
- **Gold Foil** (gradient of `foil-deep`, `foil-warm`, `foil-pale`, `foil-honey`, `foil-umber`; full value in the sidecar): the brand's foil, a five-stop 135° gradient from deep to pale gold. Fills the elephant mark (through a CSS mask), the header's vertical rule, kicker rules, the Books byline rule, the topic-note dash, and the active/hover underline in the nav and the menu.
- **Mark Foil** (gradient of `gilt-text`, `foil-mark-bright`, `foil-mark-pale`, `foil-mark-umber`): a deeper four-stop foil for the small elephant marks (header, fleuron, menu foot) so they hold up on light paper. In dark mode it is the full Gold Foil.

### Neutral
- **Laid Paper** (`laid-paper`): the page ground everywhere, the menu drawer, the fill of form inputs, and the clear patch a section-rule sprig sits in.
- **Laid Paper Deep** (`laid-paper-deep`): one step down for inset surfaces (the contact form panel, the failed-image panel, the portrait placeholder).
- **Press Ink** (`press-ink`): headings, the first line, primary text, filled buttons and button outlines.
- **Ink Soft** (`ink-soft`): secondary reading text (About and Editing paragraphs, notes, author line, ledes on Books), resting nav and menu links, Books detail labels.
- **Ink Faint** (`ink-faint`): the small-capital labels in the colophon, the footer's copyright, placeholders. Small text only; held at 4.8:1 on Laid Paper so it passes AA.
- **Hairline** (`hairline`): every rule and border: header bottom, section dividers, the fleuron's rules, input borders, quiet button outlines, the rows of the menu and the Books details.
- **Night** values (`night-*`): the dark-mode counterpart of each neutral, applied under `prefers-color-scheme: dark`.

### Semantic
- **Rust Error** (`rust-error`, dark `night-rust-error`): invalid-field borders and inline error text. The only non-gold hue in the UI.

### Named Rules
**The Gilding Rule.** Gold is gilt, not paint. It appears on marks, drop caps, kickers, numerals, rules, ornaments, link underlines and focus, and nowhere else. Never on large fills, backgrounds, button fills or body text; a gilt border on hover is the most a control gets. Where gilt must be read as text (year numerals), it is Gilt Text, never the lighter Gilt Leaf.

**The Borrowed Colour Rule.** The only strong colour on a page comes from the painting, portrait or book cover. While an image loads, its frame is filled with the image's own average colour (`--art-color`, `--cover-bg`), never a UI grey.

## Typography

**Display Font:** Playfair Display Variable (with Georgia)
**Body Font:** Newsreader Variable, optical sizing on (with Iowan Old Style, Georgia)
**Label Font:** Instrument Sans Variable (with system-ui)

**Character:** A high-contrast transitional display face for the press's voice, a warm optically-sized book face for anything meant to be read, and a plain contemporary sans that stays small and out of the way.

### Hierarchy
- **Display** (Playfair 450, clamp 2.6–4.6rem, 1.02): the one big heading on a page (About, Editing and Books intros).
- **Headline** (Playfair 450, clamp 2–3rem, 1.05): section headings such as "Write to us", the Editing call to action, and each book's title on Books.
- **Title** (Playfair 450, 1.45rem): short sub-section heads (the About notes).
- **Numeral** (Playfair italic, 1.4rem, Gilt Leaf): the roman numerals above About notes and Editing services.
- **Year numeral** (Playfair 500, lining figures, 0.01em tracking, Gilt Text): every year on First Lines. In the byline and the colophon it takes the surrounding size; as the plate number under the painting it is 1rem, set right.
- **Epigraph** (Playfair italic, clamp 1.6–2.2rem, 1.2, `hanging-punctuation: first`): the client testimonial on Editing.
- **Menu entry** (Playfair 450, clamp 1.9–2.4rem, 1.05): the links in the phone menu, set like a contents page.
- **First Line** (Newsreader 380, four sizes by length: `first-line-short`, `first-line` (medium), `first-line-long`, `first-line-xlong`; `text-wrap: pretty`, `hanging-punctuation: first`): the signature setting. Size steps down as the sentence gets longer so every opening fits the column.
- **Lede** (Newsreader, clamp 1.2–1.45rem, 1.45): the opening paragraph under a display heading, and each book's hook.
- **Book title** (Newsreader italic in `<cite>`, 1.3rem): the book's title on First Lines. Titles of works are always italic.
- **Blurb** (Newsreader, 1.12rem, 1.6): a book's back-cover copy on Books, about 36rem measure.
- **Body** (Newsreader, 1.02–1.08rem, 1.5): reading text, held to about 34rem.
- **Label** (Instrument Sans 500, 0.8–0.95rem): kickers, nav, buttons, bylines, footer.
- **Field label** (Instrument Sans 500, 0.85rem, Press Ink): form labels above fields.
- **Colophon** (Newsreader, 0.92rem, 1.4, Ink Soft; labels in all-small-caps with 0.06em tracking, Ink Faint): the credits row. Credits are set in the reading face, like the credits page of a book.
- **Wordmark** (Playfair 460, 1.04rem, 0.96 leading): the three-line "Paper / Elephant / Publishing" lock-up, live text.

### Named Rules
**The Three Voices Rule.** Playfair speaks for the press (display, headings, wordmark, drop caps, numerals). Newsreader carries everything meant to be read. Instrument Sans is for small UI only (labels, buttons, the author line) and never sets a heading, a paragraph or a credit.

**The Chapter Opening Rule.** An opening passage starts with a Playfair drop cap in gilt: sunk three lines (`initial-letter: 3`), or raised two lines for a one-line opening, with a floated fallback where `initial-letter` is unsupported. The first few words follow in small capitals (`font-variant-caps: small-caps`). It opens the first line on First Lines and each book's blurb on Books.

**The Paired Years Rule.** The book's year and the painting's year are set alike (Year numeral, Gilt Text) so the eye pairs them across the page: in the byline, in the colophon, and as a small plate number under the painting's bottom-right corner. They stay at the size of the text around them; larger datelines and "Painted / Published" labels were tried and rejected as too prominent.

## Layout

Content sits inside a fluid gutter (`spacing.gutter`, clamp 1–3.5rem) under a fixed-height header (`spacing.header`, 5.5rem) with a hairline beneath. Every page but First Lines ends with the site footer.

- **First Lines** fills the viewport below the header (`100svh` minus the header). From 960px it is a two-column grid, painting about 1.3fr and text about 1fr (minimum 20rem), vertically centred, with the full-width colophon below a hairline. Below 960px it stacks: painting, then text. The painting is sized from its aspect ratio (`--ar`) to fill its column up to a maximum height (62svh on small screens, the full available height on large ones), so small source files scale up rather than sit small. The text column is held to 36rem.
- **About, Editing, Books and 404** share a centred 72rem column.
- **About**: the intro is a 1.15fr / 1fr split (text, nested mark) from 860px; the notes are three equal columns between hairlines from 760px; the contact section is 1fr / 1.25fr (text, form panel) from 860px.
- **Editing**: the intro is 1.15fr / 1fr (text, testimonial) from 860px; the services sit between hairlines in one column, two from 640px and four from 1020px; a centred call to action closes the page.
- **Books**: a page head, then one entry per book under a hairline. Each entry's hero is cover (up to 22rem) / title page from 860px; below it the blurb (up to 36rem) and the details (up to 26rem) sit apart from 860px.
- **404**: a single centred stack: a stem, the headline, a line, and links.
- Vertical rhythm comes from fluid section padding (clamp 2.5–7vw) and hairline dividers, not from cards or background bands.
- **Phones (below 720px)**: the nav moves into a drawer behind a Menu button; without JavaScript the links stay in the bar and wrap under the brand.

## Elevation & Depth

The page is flat. Depth comes from tone: Laid Paper Deep insets one step below the ground, and Hairline rules divide sections. The phone menu is the one layer above the page, and it is set apart by a hairline and a dimmed page behind it, not by a shadow.

### Shadow Vocabulary
- **Laid print** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.12), 0 18px 40px -18px rgb(0 0 0 / 0.45)`): paintings on First Lines and covers on Books only, as if a print were laid on the page.
- **Focus halo** (`box-shadow: 0 0 0 3px color-mix(in srgb, var(--gold) 25%, transparent)`): a gilt halo on focused inputs. A focus state, not elevation.
- **Menu scrim** (`rgb(23 21 17 / 0.45)` backdrop): dims the page behind the open drawer.

### Named Rules
**The Laid Print Rule.** Only artwork lifts off the page. UI elements (buttons, panels, inputs, nav, the drawer) never cast shadows.

## Shapes

Mostly square, book-like geometry with a few deliberate exceptions: buttons are full pills (999px), portraits are circles, the form panel has a barely softened 6px corner, inputs 4px, focus outlines 2px. Paintings and covers are never rounded or cropped; they keep their own proportions. Lines are 1px hairlines; the header's vertical rule between mark and wordmark is 1.5px foil. The botanical drawings are the only organic shapes, and they are always drawn as line, never filled.

## Components

### Buttons
Quiet, letterpress-plain controls in ink.
- **Shape:** full pill (999px), at least 44px tall.
- **Primary:** Press Ink fill, Laid Paper text, Instrument Sans 500 0.95rem, padding 0.6rem 1.25rem. Reserved for the action that keeps the visitor on the site ("Another book").
- **Call to action:** the same fill a little larger (46px, padding 0.65rem 1.5rem): "Send message", the Editing call to action, each book's first link.
- **Secondary:** transparent with a 1px Press Ink outline, for actions that leave the site ("Read the book").
- **Quiet:** transparent with a 1px Hairline outline: the Menu and Close buttons, and a book's further links.
- **Hover:** filled buttons empty to an outline; every border warms to Gilt Leaf. 160ms colour transitions.
- **Focus:** the global 2px Gilt Leaf outline, 3px offset.
- **Busy/disabled:** 0.6 opacity with a progress cursor.

### Inputs / Fields
- **Style:** Laid Paper fill inside the Laid Paper Deep form panel, 1px Hairline border, 4px radius, Newsreader 1.02rem, at least 44px tall. The select uses a two-gradient CSS chevron in Ink Soft. Placeholders are italic Ink Faint.
- **Labels:** Field label style, above the field.
- **Focus:** border turns Gilt Leaf with a 3px gilt halo; no outline.
- **Error:** Rust Error border and an inline Instrument Sans 0.8rem message below the field.
- **Topic note:** when the chosen topic has a note, an italic Newsreader line in Press Ink appears at the top of the form saying who the message goes to, led by a 1.5rem Gold Foil dash.

### Form Panel
- **Corner Style:** 6px. **Background:** Laid Paper Deep. **Border:** 1px Hairline. **Shadow:** none. **Padding:** clamp 1.25–2.25rem.

### Navigation
- **Style:** Instrument Sans 500 0.92rem in Ink Soft, no underline at rest.
- **Hover / current page:** text goes to Press Ink and a 1px Gold Foil underline grows from the left (scaleX, 220ms).
- **Brand lock-up:** the foil elephant (masked PNG), a 1.5px foil rule, then the three-line Playfair wordmark. On hover the elephant tilts by -4°.

### Phone Menu
Below 720px a quiet pill "Menu" button (line-drawn SVG, 1.5 stroke) opens a `<dialog>` drawer from the right: Laid Paper, min(22rem, 86vw) wide, full height, a Hairline on its left edge, sliding in over 320ms while the page dims behind it. A quiet "Close" pill sits top right. The links are set like a contents page: an italic Gilt Leaf roman numeral, then the Menu entry in Ink Soft, each row closed by a Hairline. Hover and the current page go to Press Ink with a Gold Foil underline that grows under the label (260ms). The entries settle in one after another (60ms apart). At the foot, Contact and Instagram in Instrument Sans 0.95rem on the left and a Mark Foil elephant on the right. Links close the drawer; widening past 720px closes it.

### Site Footer
Centred, under a Hairline, with the seedling laid on that rule (a Floral Rule at 1.9rem). The copyright in Instrument Sans 0.78rem Ink Faint, and the Instagram link in Ink Soft.

### Florals
The press's botanical line drawings (sprig, stem, branch, leaves, vine, pen, seedling and three rule-shaped sprigs), drawn as CSS masks so they take the page's ink: Gilt Leaf Soft at 0.75 opacity by default, eased to 0.6 for the larger margin drawings. Purely decorative and hidden from assistive technology. Current placements: a sprig beside the contact form on About; a stem under the Editing testimonial; the writing hand (pen) above the Editing call to action; a branch under each book's details; a stem above the 404 headline.

**The Clear Paper Rule.** Florals sit in clear space, never behind text. They fill a quiet margin or column the layout already leaves empty. White watermarks behind text were tried and rejected.

**The Phone Sprig Rule.** On phones only the section-rule sprigs, the footer seedling and the Editing pen show; margin drawings hide below 860px.

### Floral Rule
A turned sprig laid on a section's hairline, centred, with the rule broken around it by a patch of Laid Paper (0.9rem each side), like a printer's ornament between sections. Small and fine-lined, so it is drawn in full Gilt Leaf at 0.85 opacity. Used on Editing's services rule, on each Books entry's top rule, and as the footer seedling. The About notes rule deliberately has none, because it sits right under the nested elephant mark.

### Kicker
A 2.5rem rule (Gold Foil) and an Instrument Sans 500 0.8rem label in Gilt Leaf. It introduces the major sections on About and Editing. The First Lines page has none on screen: the quote starts the column, and the label is kept only as the section name for screen readers.

### First Line (signature)
The opening sentence in the First Line style, with the Chapter Opening drop cap and small-capital lead. Below it, the **fleuron**: the Mark Foil elephant (1.05 × 1.25rem) between two flexible hairlines. Then the book block: a 64px circular author portrait, the title in the Book title style, the author in Instrument Sans Ink Soft followed by the year as a Year numeral, and the buttons.

### Painting Frame
The painting at its natural proportions with the Laid Print shadow, over its own average colour while it loads. It fades in over 380ms. If it fails, a Laid Paper Deep panel with a sans message replaces it. Under its bottom-right corner sits the plate number, the year it was painted (Paired Years Rule), hidden from screen readers. It has no caption: its credit is in the colophon.

### Colophon
Every credit for the book on screen, gathered in one row under a hairline at the foot of the page: **Painting** (artist, *title*, date as a Year numeral, museum linked to the object page), **Portrait** (artist, or "self-portrait"; the licence only when CC BY/BY-SA requires it; Wikimedia Commons linked) and **Text** (Project Gutenberg, linked to the book). Labels are small capitals in Ink Faint, values in Ink Soft, left-aligned. One line on desktop; a two-column label/value list on phones. Links are underlined in Hairline and warm to Gilt Leaf on hover. No "public domain" boilerplate and no separators like middle dots.

### Book Entry
A book's title page on Books: the cover as frontispiece (Laid Print, over its own colour), then the Headline title, an italic Playfair subtitle, a byline led by a 2.5rem Gold Foil rule, the hook in the Lede style, and the links. Below, the blurb opens with the Chapter Opening; beside it the details are a hairline-ruled list of Instrument Sans labels (0.8rem, Ink Soft, a 6.5rem column) and Newsreader values.

### Testimonial
On Editing, a client's words set as an epigraph: the Epigraph style, a 1px Gilt Leaf Soft rule on its left, and a Newsreader 0.95rem attribution with the work in `<cite>`.

### Section Numerals
About notes and Editing services are numbered i., ii., iii. in the Numeral style, above their heads.

## Do's and Don'ts

### Do:
- **Do** use Laid Paper as the page ground and Press Ink for text, and provide the Night counterparts for dark mode on every new surface.
- **Do** keep gold to gilding: marks, drop caps, kickers, numerals, rules, ornaments, link underlines and focus (The Gilding Rule).
- **Do** set years in gilt Playfair lining numerals in Gilt Text, at the size of the text around them (The Paired Years Rule).
- **Do** set titles of works in italic `<cite>`, and credit the painting, portrait and text in the colophon, never in scattered captions.
- **Do** open any featured passage with the Chapter Opening treatment (gilt Playfair drop cap and small-capital lead).
- **Do** use the elephant mark (foil, via the mask) as the press's mark and fleuron, and the press's own botanical drawings (via the Floral component) as its only other ornament.
- **Do** place florals in clear paper: in an empty margin or column, or laid on a hairline with the rule broken around them (The Clear Paper Rule).
- **Do** keep crossfades near 380ms and small UI transitions near 160–220ms, and disable all motion under `prefers-reduced-motion`.
- **Do** keep touch targets at least 44px and the 2px Gilt Leaf focus outline visible.

### Don't:
- **Don't** put gold on large fills, button fills, backgrounds or body text.
- **Don't** give UI elements shadows; only paintings and covers lift (The Laid Print Rule).
- **Don't** set headings or paragraphs in Instrument Sans, or UI labels in Playfair (The Three Voices Rule).
- **Don't** crop, round or recolour paintings or covers, or use a grey placeholder where the image's average colour belongs.
- **Don't** introduce new accent hues; Rust Error is the only exception, and only for errors.
- **Don't** redraw or restyle the elephant logo or the nested mark; they are binding brand assets.
- **Don't** put a floral behind text, or use one as a pale watermark (The Clear Paper Rule).
- **Don't** show margin florals on phones; only section-rule sprigs, the footer seedling and the Editing pen (The Phone Sprig Rule).
- **Don't** enlarge the years into datelines or label them "Painted" / "Published" (The Paired Years Rule).
- **Don't** lay a floral rule directly under the nested elephant mark; one ornament per view is enough.
