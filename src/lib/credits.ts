// The credits row on First Lines: who made the painting, the portrait and the
// text on screen. Shared by the build (first render) and the browser (shuffles),
// so both always say the same thing.
import type { FirstLine } from './first-lines';

/** A run of credit text: plain words, a work's title, or a link. */
export type Part = string | { cite: string } | { href: string; text: string };

export interface CreditLabels {
  selfPortrait: string;
  textSource: string;
  portraitSource: string;
}

type Entry = Pick<FirstLine, 'author' | 'readUrl' | 'artwork' | 'portrait'>;

/** "Winslow Homer, Croquet Scene, 1866, Art Institute of Chicago" (museum linked). */
export const paintingCredit = ({ artwork: a }: Entry): Part[] => [
  `${a.artist}, `,
  { cite: a.title },
  `, ${a.date}, `,
  { href: a.sourceUrl, text: a.museum },
];

/**
 * "Nadar, Wikimedia Commons", with the licence only where the licence asks to
 * be shown (CC BY / BY-SA). Public-domain and CC0 portraits don't need it.
 */
export const portraitCredit = (x: Entry, l: CreditLabels): Part[] => {
  const p = x.portrait;
  if (!p) return [];
  const parts: Part[] = [];
  if (p.artist) parts.push(p.artist === x.author ? `${x.author}, ${l.selfPortrait}, ` : `${p.artist}, `);
  if (p.attributionRequired) {
    parts.push(p.licenseUrl ? { href: p.licenseUrl, text: p.license } : p.license, ', ');
  }
  parts.push({ href: p.sourceUrl, text: l.portraitSource });
  return parts;
};

/** "Project Gutenberg", linked to this book. */
export const textCredit = (x: Entry, l: CreditLabels): Part[] => [{ href: x.readUrl, text: l.textSource }];
