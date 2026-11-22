// Shapes of the pipeline's working files. Each step reads the previous
// step's file and writes its own, keyed by Project Gutenberg ebook id.

export interface Person {
  name: string;
  birthYear: number | null;
  deathYear: number | null;
}

/** 01-discover */
export interface Candidate {
  gutenbergId: number;
  title: string;
  /** Gutendex names are "Surname, Given"; `displayName` is "Given Surname". */
  authors: (Person & { displayName: string })[];
  translators: (Person & { displayName: string })[];
  subjects: string[];
  bookshelves: string[];
  downloads: number;
  textUrls: string[];
  /** Wikidata work item (Q-id) matched through P2034, when known. */
  wikidataWork?: string;
  /** Wikidata sitelinks of the work: the "how classic" ranking signal. */
  links?: number;
}

export type Confidence = 'high' | 'medium' | 'low';

/** 02-opening-lines */
export interface LineResult {
  gutenbergId: number;
  ok: boolean;
  error?: string;
  sourceUrl?: string;
  /** The heading the narrative was found under, e.g. "CHAPTER I." */
  anchor?: string;
  anchorKind?: 'chapter' | 'roman' | 'part' | 'fallback' | 'override';
  /** First sentence of the narrative, cleaned for display. */
  sentence?: string;
  /** The first paragraph, for context when reviewing. */
  paragraph?: string;
  /** A few lines before the paragraph in the source text, for review. */
  context?: string;
  confidence?: Confidence;
  flags: string[];
  /** sha1 of `sentence`; review approvals are tied to it. */
  hash?: string;
}

export interface ImageLicense {
  /** e.g. "Public domain", "CC BY-SA 4.0" */
  name: string;
  url?: string;
  /** True for public domain / CC0 — no attribution legally required. */
  publicDomain: boolean;
}

/** 03-metadata */
export interface MetadataResult {
  gutenbergId: number;
  wikidataId?: string;
  wikidataVia?: 'gutenberg-id' | 'title-search';
  workLabel?: string;
  year?: number;
  yearSource?: string;
  /** Wikidata P1922 "first line", when the work has one. */
  wikidataFirstLine?: string;
  genres: string[];
  mainSubjects: string[];
  countries: string[];
  author?: {
    wikidataId: string;
    name: string;
    nationality: string[];
    portrait?: {
      file: string;
      pageUrl: string;
      thumbUrl: string;
      width: number;
      height: number;
      artist?: string;
      credit?: string;
      date?: string;
      license: ImageLicense;
    };
  };
  flags: string[];
}

/** 04-artwork */
export interface ArtCandidate {
  museum: 'met' | 'aic';
  id: string;
  title: string;
  artist: string;
  artistNationality?: string;
  /** where the museum says the work was made (AIC place_of_origin) */
  placeOfOrigin?: string;
  date: string;
  yearStart: number;
  yearEnd: number;
  medium?: string;
  classification?: string;
  keywords: string[];
  imageUrl: string;
  sourceUrl: string;
  creditLine?: string;
  /** width / height, when known before download */
  aspect?: number;
  /** painting type detected from museum metadata and title (landscape, still life, ...) */
  kind?: string;
  score?: number;
  reasons?: string[];
}

export interface ArtResult {
  gutenbergId: number;
  chosen?: ArtCandidate;
  alternates: ArtCandidate[];
  themes: string[];
  confidence?: Confidence;
  flags: string[];
}

export interface LocalImage {
  src: string;
  srcSmall: string;
  width: number;
  height: number;
  color: string;
}

/** 05-images */
export interface ImagesResult {
  gutenbergId: number;
  artwork?: LocalImage & { key: string };
  portrait?: LocalImage & { key: string };
  flags: string[];
}

export interface Review {
  status: 'approved' | 'rejected';
  /** For lines: the hash of the approved sentence. For art: museum:id. */
  ref: string;
  by: string;
  date: string;
  note?: string;
}

export interface Reviews {
  lines: Record<string, Review>;
  art: Record<string, Review>;
  portraits: Record<string, Review>;
}

export interface BookOverride {
  /** Replace the extracted opening line (must come from the text). */
  openingLine?: string;
  /** Text to search for in the source text to locate the narrative start. */
  startsWith?: string;
  /** Search text for finding the work on Wikidata when the Gutenberg title does not match. */
  wikidataSearch?: string;
  year?: number;
  yearNote?: string;
  /** Force an artwork, e.g. { "museum": "met", "id": "437153" }. */
  artwork?: { museum: 'met' | 'aic'; id: string };
  /** Extra search themes for artwork matching. */
  themes?: string[];
  /** Skip the author portrait. */
  noPortrait?: boolean;
  /** Use a specific Commons file for the portrait. */
  portraitFile?: string;
  title?: string;
  note?: string;
}

export interface Overrides {
  /** Gutenberg ids to leave out, with a reason. */
  exclude: Record<string, string>;
  /** Gutenberg ids to add even if discovery does not find them. */
  include: number[];
  books: Record<string, BookOverride>;
}

export interface Config {
  /** How many candidate books discovery should keep. */
  candidateTarget: number;
  /** Gutendex listing pages to scan (32 books per page). */
  maxPages: number;
  /** A painting must be dated within this many years of publication. */
  artYearTolerance: number;
  /** Museum date ranges ("1803–15", "c. 1850") wider than this don't count. */
  artMaxDateRange: number;
  /** Subjects/bookshelves that disqualify a book (case-insensitive substrings). */
  excludeSubjects: string[];
  /** Title fragments that disqualify a book. */
  excludeTitles: string[];
}
