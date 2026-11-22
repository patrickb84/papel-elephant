// The shape of src/data/first-lines.json, written by scripts/06-assemble.ts.

export interface SiteImage {
  /** Large WebP, long side up to 1800px (paintings) or 480px (portraits). */
  src: string;
  /** Small WebP for phones and low-bandwidth loading. */
  srcSmall: string;
  width: number;
  height: number;
  /** Average colour, shown while the image loads. */
  color: string;
}

export interface Artwork extends SiteImage {
  title: string;
  artist: string;
  date: string;
  museum: string;
  /** The object's page at the museum. */
  sourceUrl: string;
  creditLine?: string;
  license: string;
}

export interface Portrait extends SiteImage {
  /** The file's page on Wikimedia Commons. */
  sourceUrl: string;
  artist?: string;
  license: string;
  licenseUrl?: string;
  /** True when the licence requires the attribution to be shown. */
  attributionRequired: boolean;
}

export interface FirstLine {
  /** URL-safe id, e.g. "pride-and-prejudice". */
  id: string;
  gutenbergId: number;
  title: string;
  author: string;
  authorLife?: string;
  coAuthors: string[];
  translators: string[];
  /** Original publication year. */
  year: number;
  /** The opening line as printed in the Project Gutenberg text. */
  line: string;
  /** True when the line is cut short (ends with "…"). */
  abridged: boolean;
  /** The book's page on Project Gutenberg. */
  readUrl: string;
  artwork: Artwork;
  portrait?: Portrait;
  /** How each part was checked; see content/REPORT.md. */
  provenance: {
    lineSource: string;
    lineCheck: string;
    yearSource: string;
    artMatch: string;
  };
}
