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
  first-line:
    fontFamily: "'Newsreader Variable', 'Iowan Old Style', Georgia, serif"
    fontSize: "clamp(1.55rem, 2.7vw, 2.4rem)"
    fontWeight: 380
    lineHeight: 1.22
    letterSpacing: "-0.01em"
  lede:
    fontFamily: "'Newsreader Variable', 'Iowan Old Style', Georgia, serif"
    fontSize: "clamp(1.2rem, 1.8vw, 1.45rem)"
    lineHeight: 1.45
  body:
    fontFamily: "'Newsreader Variable', 'Iowan Old Style', Georgia, serif"
    fontSize: "1.05rem"
    lineHeight: 1.5
  label:
    fontFamily: "'Instrument Sans Variable', system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 500
    letterSpacing: "0.02em"
  colophon:
    fontFamily: "'Newsreader Variable', 'Iowan Old Style', Georgia, serif"
    fontSize: "0.92rem"
    lineHeight: 1.4
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
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.press-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.6rem 1.25rem"
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
  nav-link:
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    padding: "0.5rem 0"
  nav-link-active:
    textColor: "{colors.press-ink}"
  kicker:
    textColor: "{colors.gilt-leaf}"
    typography: "{typography.label}"
  portrait:
    backgroundColor: "{colors.laid-paper-deep}"
    size: "64px"
---

# Design System: Paper Elephant Publishing

## Overview

**Creative North Star: "The Chapter Opening"**

Every screen is set like the first page of a printed chapter. A warm paper ground, near-black ink, and a little gilt where a bookbinder would put it: on the mark, the initial, the rule under the heading. The home page is the purest expression. The opening line of a novel is typeset as a chapter opening, with a sunk gold drop cap, the first words in small capitals, and the press's elephant set as a fleuron on a hairline beneath. A period painting hangs beside it like a frontispiece.

The system is quiet and generous. Density is low, margins are wide, and nothing competes with the text or the painting. Character comes from typesetting detail (optical sizing, small caps, hanging punctuation, italic titles in `<cite>`) rather than colour or decoration. Motion is limited to slow crossfades and small settling gestures, and turns off under `prefers-reduced-motion`.

The site follows the reader's colour scheme. Light is laid paper and ink; dark is the same page by lamplight, with warm near-black paper and a brighter gilt. Both are first-class.

**Key Characteristics:**
- Warm paper and ink, with gold used sparingly as gilding.
- Three type voices with strict jobs: Playfair (display and marks), Newsreader (reading), Instrument Sans (small UI).
- Book typography as interface: drop caps, small capitals, fleurons, hairline rules, roman-numeral sequences.
- Flat page; the painting is the only thing that lifts.
- The elephant mark is the one recurring ornament.

## Colors

A warm, low-chroma paper-and-ink palette with a single antique gold accent and its foil gradient.

### Primary
- **Gilt Leaf** (`gilt-leaf`): kickers and their leading rule, drop caps, the fleuron, roman numerals, focus rings and input focus borders. In dark mode it brightens to **Night Gilt** (`night-gilt`) to hold contrast.
- **Gilt Leaf Soft** (`gilt-leaf-soft`): resting link underlines, which deepen to Gilt Leaf on hover.
- **Gold Foil** (gradient, see sidecar): the brand's foil, a five-stop 135° gradient from deep to pale gold. Fills the elephant mark (through a CSS mask), the header's vertical rule, kicker rules on About, and the active/hover underline in the nav. The small header mark uses a deeper foil (`--foil-mark`) so it holds up on light paper.

### Neutral
- **Laid Paper** (`laid-paper`): the page ground everywhere, and the fill of form inputs.
- **Laid Paper Deep** (`laid-paper-deep`): one step down for inset surfaces (the contact form panel, the failed-image panel, the portrait placeholder).
- **Press Ink** (`press-ink`): headings, the first line, primary text, filled buttons and button outlines.
- **Ink Soft** (`ink-soft`): secondary reading text (About paragraphs, notes, author line), resting nav links.
- **Ink Faint** (`ink-faint`): the small-capital labels in the colophon. Small text only; held at 4.8:1 on Laid Paper so it passes AA.
- **Hairline** (`hairline`): every rule and border: header bottom, section dividers, the fleuron's rules, input borders.
- **Night** values (`night-*`): the dark-mode counterpart of each neutral, applied under `prefers-color-scheme: dark`.

### Semantic
- **Rust Error** (`rust-error`, dark `night-rust-error`): invalid-field borders and inline error text. The only non-gold hue in the UI.

### Named Rules
**The Gilding Rule.** Gold is gilt, not paint. It appears on marks, drop caps, kickers, numerals, rules, link underlines and focus, and nowhere else. Never on large fills, backgrounds, button fills or body text; a gilt border on hover is the most a control gets.

**The Borrowed Colour Rule.** The only strong colour on a page comes from the painting or portrait. While an image loads, its frame is filled with the painting's own average colour (`--art-color`), never a UI grey.

## Typography

**Display Font:** Playfair Display Variable (with Georgia)
**Body Font:** Newsreader Variable, optical sizing on (with Iowan Old Style, Georgia)
**Label Font:** Instrument Sans Variable (with system-ui)

**Character:** A high-contrast transitional display face for the press's voice, a warm optically-sized book face for anything meant to be read, and a plain contemporary sans that stays small and out of the way.

### Hierarchy
- **Display** (Playfair 450, clamp 2.6–4.6rem, 1.02): the one big heading on a page, such as the About intro.
- **Headline** (Playfair 450, clamp 2–3rem, 1.05): section headings such as "Write to us".
- **Title** (Playfair 450, 1.45rem): short sub-section heads (the About notes).
- **First Line** (Newsreader 380, four sizes by length: short clamp 2–3.5rem at 1.12, medium clamp 1.55–2.4rem at 1.22, long clamp 1.3–1.8rem at 1.3, xlong clamp 1.08–1.35rem at 1.42; `text-wrap: pretty`, `hanging-punctuation: first`): the signature setting. Size steps down as the sentence gets longer so every opening fits the column.
- **Lede** (Newsreader, clamp 1.2–1.45rem, 1.45): the opening paragraph under a display heading.
- **Body** (Newsreader, 1.02–1.08rem, 1.5): reading text, held to about 34rem.
- **Book title** (Newsreader italic in `<cite>`, 1.3rem): titles of works are always italic.
- **Label** (Instrument Sans 500, 0.8–0.95rem): kickers, nav, buttons, form labels.
- **Colophon** (Newsreader, 0.92rem, 1.4, Ink Soft; labels in all-small-caps with 0.06em tracking, Ink Faint): the credits row. Credits are set in the reading face, like the credits page of a book.
- **Wordmark** (Playfair 460, 1.04rem, 0.96 leading): the three-line "Paper / Elephant / Publishing" lock-up, live text.

### Named Rules
**The Three Voices Rule.** Playfair speaks for the press (display, headings, wordmark, drop caps, numerals). Newsreader carries everything meant to be read. Instrument Sans is for small UI only (labels, buttons, the author line) and never sets a heading, a paragraph or a credit.

**The Chapter Opening Rule.** An opening passage starts with a Playfair drop cap in gilt: sunk three lines (`initial-letter: 3`), or raised two lines for a one-line opening, with a floated fallback where `initial-letter` is unsupported. The first few words follow in small capitals (`font-variant-caps: small-caps`, 0.045em tracking).

## Layout

Content sits inside a fluid gutter (`spacing.gutter`, clamp 1–3.5rem) under a fixed-height header (`spacing.header`, 5.5rem) with a hairline beneath.

- **First Lines** fills the viewport below the header (`100svh` minus the header). From 960px it is a two-column grid, painting about 1.3fr and text about 1fr (minimum 20rem), vertically centred, with the full-width colophon below a hairline. Below 960px it stacks: painting, then text. The painting is capped at 58svh on small screens and at the full available height on large ones. The text column is held to 36rem.
- **About** is a centred 72rem column. The intro is a 1.15fr / 1fr split (text, nested mark) from 860px; the notes are three equal columns between hairlines from 760px; the contact section is 1fr / 1.25fr (text, form panel) from 860px.
- Vertical rhythm comes from fluid section padding (clamp 2.5–7vw) and hairline dividers, not from cards or background bands.
- Kickers are always a short horizontal rule (2.5rem) followed by a sans label in gilt.

## Elevation & Depth

The page is flat. Depth comes from tone: Laid Paper Deep insets one step below the ground, and Hairline rules divide sections.

### Shadow Vocabulary
- **Laid print** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.12), 0 18px 40px -18px rgb(0 0 0 / 0.45)`): the painting only, as if a print were laid on the page.
- **Focus halo** (`box-shadow: 0 0 0 3px color-mix(in srgb, var(--gold) 25%, transparent)`): a gilt halo on focused inputs. A focus state, not elevation.

### Named Rules
**The Laid Print Rule.** Only artwork lifts off the page. UI elements (buttons, panels, inputs, nav) never cast shadows.

## Shapes

Mostly square, book-like geometry with a few deliberate exceptions: buttons are full pills (999px), portraits are circles, the form panel has a barely softened 6px corner, inputs 4px, focus outlines 2px. Paintings are never rounded or cropped; they keep their own proportions. Lines are 1px hairlines; the header's vertical rule between mark and wordmark is 1.5px foil.

## Components

### Buttons
Quiet, letterpress-plain controls in ink.
- **Shape:** full pill (999px), at least 44px tall.
- **Primary:** Press Ink fill, Laid Paper text, Instrument Sans 500 0.95rem, padding 0.6rem 1.25rem. Reserved for the action that keeps the visitor on the site ("Another book", "Send message").
- **Secondary:** transparent with a 1px Press Ink outline, for actions that leave the site ("Read the book").
- **Hover:** the primary empties to an outline; the border warms to Gilt Leaf on both. 160ms colour transitions.
- **Focus:** the global 2px Gilt Leaf outline, 3px offset.
- **Busy/disabled:** 0.6 opacity with a progress cursor.

### Inputs / Fields
- **Style:** Laid Paper fill inside the Laid Paper Deep form panel, 1px Hairline border, 4px radius, Newsreader 1.02rem, at least 44px tall. The select uses a two-gradient CSS chevron in Ink Soft.
- **Labels:** Instrument Sans 500 0.85rem in Press Ink, above the field.
- **Focus:** border turns Gilt Leaf with a 3px gilt halo; no outline.
- **Error:** Rust Error border and an inline Instrument Sans 0.8rem message below the field.

### Form Panel
- **Corner Style:** 6px. **Background:** Laid Paper Deep. **Border:** 1px Hairline. **Shadow:** none. **Padding:** clamp 1.25–2.25rem.

### Navigation
- **Style:** Instrument Sans 500 0.92rem in Ink Soft, no underline at rest.
- **Hover / current page:** text goes to Press Ink and a 1px Gold Foil underline grows from the left (scaleX, 220ms).
- **Brand lock-up:** the foil elephant (masked PNG), a 1.5px foil rule, then the three-line Playfair wordmark. On hover the elephant tilts by -4°.

### Kicker
A 2.5rem rule (currentColor on First Lines, Gold Foil on About) and an Instrument Sans 500 0.8rem label in Gilt Leaf. It introduces the major sections on About. The First Lines page has none on screen: the quote starts the column, and the label is kept only as the section name for screen readers.

### First Line (signature)
The opening sentence in the First Line style, with the Chapter Opening drop cap and small-capital lead. Below it, the **fleuron**: the foil elephant (1.05 × 1.25rem) between two flexible hairlines. Then the book block: a 64px circular author portrait, the title in italic Newsreader, the author and year in Instrument Sans Ink Soft, and the buttons.

### Painting Frame
The painting at its natural proportions with the Laid Print shadow, over its own average colour while it loads. It fades in over 380ms. If it fails, a Laid Paper Deep panel with a sans message replaces it. It has no caption: the painting stands alone, like a frontispiece, and its credit is in the colophon.

### Colophon
Every credit for the book on screen, gathered in one row under a hairline at the foot of the page: **Painting** (artist, *title*, date, museum linked to the object page), **Portrait** (artist, or "self-portrait"; the licence only when CC BY/BY-SA requires it; Wikimedia Commons linked) and **Text** (Project Gutenberg, linked to the book). Labels are small capitals in Ink Faint, values in Ink Soft, left-aligned. One line on desktop; a two-column label/value list on phones. Links are underlined in Hairline and warm to Gilt Leaf on hover. No "public domain" boilerplate and no separators like middle dots.

### Section Numerals
Notes are numbered i., ii., iii. in italic Playfair 1.4rem Gilt Leaf, above a Title.

## Do's and Don'ts

### Do:
- **Do** use Laid Paper as the page ground and Press Ink for text, and provide the Night counterparts for dark mode on every new surface.
- **Do** keep gold to gilding: marks, drop caps, kickers, numerals, rules, link underlines and focus (The Gilding Rule).
- **Do** set titles of works in italic `<cite>`, and credit the painting, portrait and text in the colophon, never in scattered captions.
- **Do** open any featured passage with the Chapter Opening treatment (gilt Playfair drop cap and small-capital lead).
- **Do** use the elephant mark (foil, via the mask) as the system's only ornament and fleuron.
- **Do** keep crossfades near 380ms and small UI transitions near 160–220ms, and disable all motion under `prefers-reduced-motion`.
- **Do** keep touch targets at least 44px and the 2px Gilt Leaf focus outline visible.

### Don't:
- **Don't** put gold on large fills, button fills, backgrounds or body text.
- **Don't** give UI elements shadows; only paintings lift (The Laid Print Rule).
- **Don't** set headings or paragraphs in Instrument Sans, or UI labels in Playfair (The Three Voices Rule).
- **Don't** crop, round or recolour paintings, or use a grey placeholder where the painting's average colour belongs.
- **Don't** introduce new accent hues; Rust Error is the only exception, and only for errors.
- **Don't** redraw or restyle the elephant logo or the nested mark; they are binding brand assets.
