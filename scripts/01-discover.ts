// Step 1 - discover public-domain classics.
//
// Source of books: Project Gutenberg metadata. By default this tries
// Gutendex's popularity-sorted English fiction listing; if Gutendex does not
// answer (it is often slow or returns 503), it falls back to Project
// Gutenberg's own catalog CSV, which is the data Gutendex is built from.
//
// Ranking: how "classic" a book is, measured by the number of Wikipedia
// language editions that cover the work (Wikidata sitelinks, joined on
// Wikidata's Project Gutenberg ebook ID property P2034), with Gutenberg
// download counts as a tie-breaker when Gutendex supplied them.
//
// Filters: English text, has an author, not drama/poetry/essays/collections
// (see content/config.json), and one edition per work.
//
//   node scripts/01-discover.ts [--source=gutendex|catalog]

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fetchBuffer, fetchJson } from './lib/http.ts';
import { CACHE_DIR, FILES } from './lib/paths.ts';
import type { Candidate, Person } from './lib/types.ts';
import { displayName, fold, loadConfig, loadOverrides, log, writeJson } from './lib/util.ts';

type P = Person & { displayName: string };
interface RawBook {
  id: number;
  title: string;
  authors: P[];
  translators: P[];
  subjects: string[];
  bookshelves: string[];
  language: string[];
  downloads: number;
}

/** Plain-text locations for an ebook: the official Gutenberg mirrors first
 * (gutenberg.org itself rate-limits and is sometimes down for maintenance). */
export function textUrls(id: number): string[] {
  const s = String(id);
  const dir = s.length === 1 ? `0/${s}` : `${s.slice(0, -1).split('').join('/')}/${s}`;
  return [
    `https://gutenberg.pglaf.org/cache/epub/${id}/pg${id}.txt`,
    `https://mirror.csclub.uwaterloo.ca/gutenberg/${dir}/${id}-0.txt`,
    `http://mirrors.xmission.com/gutenberg/${dir}/${id}-0.txt`,
    `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,
    `https://mirror.csclub.uwaterloo.ca/gutenberg/${dir}/${id}.txt`,
    `http://mirrors.xmission.com/gutenberg/${dir}/${id}.txt`,
  ];
}

/** "Moby Dick; Or, The Whale" -> "Moby Dick" ; keeps "Twenty Thousand Leagues under the Sea". */
export function cleanTitle(t: string) {
  let title = t.split(/\r?\n/)[0];
  title = title.split(/;\s*(?:or,?\s)/i)[0];
  title = title.split(/[:,]\s*(?:or,?\s|a novel|a romance|a tale|being\s)/i)[0];
  title = title.split(/;\s/)[0];
  return title.replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// Gutendex

interface GutendexPerson { name: string; birth_year: number | null; death_year: number | null }
interface GutendexBook {
  id: number; title: string; authors: GutendexPerson[]; translators: GutendexPerson[];
  subjects: string[]; bookshelves: string[]; languages: string[]; media_type: string;
  copyright: boolean | null; download_count: number;
}
const gPerson = (p: GutendexPerson): P => ({ name: p.name, displayName: displayName(p.name), birthYear: p.birth_year, deathYear: p.death_year });

async function fromGutendex(maxPages: number): Promise<RawBook[]> {
  const out: RawBook[] = [];
  let url: string | null = 'https://gutendex.com/books/?languages=en&topic=fiction&mime_type=text%2Fplain';
  for (let page = 1; url && page <= maxPages; page++) {
    log('discover', `gutendex page ${page}`);
    const data: { next: string | null; results: GutendexBook[] } = await fetchJson(url, { timeout: 150_000, retries: 1 });
    for (const b of data.results) {
      if (b.media_type !== 'Text' || b.copyright === true) continue;
      out.push({
        id: b.id, title: b.title, authors: b.authors.map(gPerson), translators: b.translators.map(gPerson),
        subjects: b.subjects, bookshelves: b.bookshelves, language: b.languages, downloads: b.download_count,
      });
    }
    url = data.next;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Project Gutenberg catalog CSV

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else q = false;
      } else field += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (ch !== '\r') field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

/** "Tolstoy, Leo, graf, 1828-1910; Maude, Aylmer, 1858-1938 [Translator]" */
function parsePeople(s: string): { authors: P[]; translators: P[] } {
  const authors: P[] = [], translators: P[] = [];
  for (const part of s.split(/;\s*/).filter(Boolean)) {
    const role = part.match(/\[([^\]]+)\]\s*$/)?.[1];
    const clean = part.replace(/\s*\[[^\]]+\]\s*$/, '');
    const dates = clean.match(/,\s*(BCE?\s*)?(\d{1,4})?\??(?:\s*BCE?)?-(\d{1,4})?\??(?:\s*BCE?)?\s*$/);
    const name = dates ? clean.slice(0, dates.index) : clean;
    const cleanName = name.replace(/,\s*(graf|baron|count|sir|Sir|vicomte|comte)\b/g, '');
    const person: P = {
      name: cleanName,
      displayName: displayName(cleanName),
      birthYear: dates?.[2] ? Number(dates[2]) : null,
      deathYear: dates?.[3] ? Number(dates[3]) : null,
    };
    if (!role) authors.push(person);
    else if (/translator/i.test(role)) translators.push(person);
  }
  return { authors, translators };
}

async function fromCatalog(): Promise<RawBook[]> {
  const file = path.join(CACHE_DIR, 'pg_catalog.csv');
  let text: string;
  if (existsSync(file)) text = await readFile(file, 'utf8');
  else {
    log('discover', 'downloading Project Gutenberg catalog (21 MB)');
    text = (await fetchBuffer('https://gutenberg.pglaf.org/cache/epub/feeds/pg_catalog.csv', { timeout: 300_000 })).toString('utf8');
  }
  const [header, ...rows] = parseCsv(text);
  const col = (n: string) => header.indexOf(n);
  const [cId, cType, cTitle, cLang, cAuthors, cSubjects, cShelves] =
    ['Text#', 'Type', 'Title', 'Language', 'Authors', 'Subjects', 'Bookshelves'].map(col);
  return rows
    .filter((r) => r[cType] === 'Text')
    .map((r) => ({
      id: Number(r[cId]),
      title: r[cTitle],
      ...parsePeople(r[cAuthors] ?? ''),
      subjects: (r[cSubjects] ?? '').split(/;\s*/).filter(Boolean),
      bookshelves: (r[cShelves] ?? '').split(/;\s*/).filter(Boolean),
      language: (r[cLang] ?? '').split(/;\s*/),
      downloads: 0,
    }));
}

// ---------------------------------------------------------------------------
// Wikidata ranking

interface WikiRank { work: string; links: number }

export async function sparql(query: string): Promise<Record<string, string>[]> {
  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`;
  const data = await fetchJson<{ results: { bindings: Record<string, { value: string }>[] } }>(url, {
    timeout: 120_000,
    headers: { Accept: 'application/sparql-results+json' },
  });
  return data.results.bindings.map((b) =>
    Object.fromEntries(Object.entries(b).map(([k, v]) => [k, v.value.replace('http://www.wikidata.org/entity/', '')])),
  );
}

async function wikidataRanks(): Promise<Map<number, WikiRank>> {
  // For each Gutenberg ebook ID on Wikidata: the work it belongs to (the item
  // itself, or the work an edition/translation item is an "edition of", P629)
  // and how many Wikipedia/Wikisource sitelinks that work has. Three small
  // queries joined here; one combined query times out on the public endpoint.
  const items = await sparql('SELECT ?item ?pg ?links WHERE { ?item wdt:P2034 ?pg . ?item wikibase:sitelinks ?links . }');
  const editionOf = await sparql('SELECT ?item ?w WHERE { ?item wdt:P2034 ?pg . ?item wdt:P629 ?w . }');
  const workLinks = await sparql('SELECT ?w ?links WHERE { ?item wdt:P2034 ?pg . ?item wdt:P629 ?w . ?w wikibase:sitelinks ?links . }');
  const parent = new Map(editionOf.map((r) => [r.item, r.w]));
  const linksOf = new Map<string, number>(items.map((r) => [r.item, Number(r.links)]));
  for (const r of workLinks) linksOf.set(r.w, Number(r.links));

  const map = new Map<number, WikiRank>();
  for (const r of items) {
    const id = Number(r.pg);
    if (!id) continue;
    const work = parent.get(r.item) ?? r.item;
    const rank = { work, links: linksOf.get(work) ?? 0 };
    if ((map.get(id)?.links ?? -1) < rank.links) map.set(id, rank);
  }
  return map;
}

// ---------------------------------------------------------------------------

async function main() {
  const config = await loadConfig();
  const overrides = await loadOverrides();
  const forced = process.argv.find((a) => a.startsWith('--source='))?.split('=')[1];

  let books: RawBook[] = [];
  let source = forced ?? 'gutendex';
  if (source === 'gutendex') {
    try {
      books = await fromGutendex(config.maxPages);
    } catch (err) {
      log('discover', `Gutendex unavailable (${(err as Error).message.slice(0, 80)}); using the Project Gutenberg catalog`);
      source = 'catalog';
    }
  }
  if (source === 'catalog') books = await fromCatalog();
  log('discover', `${books.length} books from ${source}`);

  const ranks = await wikidataRanks();
  log('discover', `${ranks.size} Gutenberg ebooks are linked from Wikidata`);

  const rejected: Record<string, number> = {};
  const reject = (why: string) => { rejected[why] = (rejected[why] ?? 0) + 1; return false; };
  const keep = (b: RawBook) => {
    if (overrides.include.includes(b.id)) return true;
    if (overrides.exclude[b.id]) return reject('excluded by overrides');
    if (!b.language.includes('en')) return reject('not English');
    if (!b.authors.length) return reject('no author');
    if (b.authors.some((a) => /anonymous|various|unknown/i.test(a.name))) return reject('anonymous/various');
    const tags = [...b.subjects, ...b.bookshelves].map((s) => s.toLowerCase());
    if (config.excludeSubjects.some((x) => tags.some((t) => t.includes(x)))) return reject('subject excluded');
    const lowerTitle = b.title.toLowerCase();
    if (config.excludeTitles.some((x) => lowerTitle.includes(x))) return reject('title excluded');
    if (!tags.some((t) => /fiction|novels|stories/.test(t))) return reject('not fiction');
    if (!ranks.has(b.id)) return reject('not on Wikidata');
    return true;
  };

  // One edition per work: same Wikidata work, or same title + author surname.
  const byWork = new Map<string, Candidate & { links: number }>();
  for (const b of books.filter(keep)) {
    const rank = ranks.get(b.id);
    const title = cleanTitle(b.title);
    const key = rank?.work ?? `${fold(title)}|${fold(b.authors[0]?.name.split(',')[0] ?? '')}`;
    const altKey = `${fold(title)}|${fold(b.authors[0]?.name.split(',')[0] ?? '')}`;
    const existing = byWork.get(key) ?? byWork.get(altKey);
    const candidate = {
      gutenbergId: b.id, title, authors: b.authors, translators: b.translators, subjects: b.subjects,
      bookshelves: b.bookshelves, downloads: b.downloads, textUrls: textUrls(b.id), links: rank?.links ?? 0,
      wikidataWork: rank?.work,
    };
    // Prefer the edition with more downloads, else the lower (older, usually canonical) ebook id.
    if (existing) {
      const better = b.downloads > existing.downloads || (b.downloads === existing.downloads && b.id < existing.gutenbergId);
      if (!better) { reject('duplicate edition'); continue; }
      reject('duplicate edition');
    }
    byWork.set(key, candidate);
    byWork.set(altKey, candidate);
  }

  const unique = [...new Set(byWork.values())];
  unique.sort((a, b) => b.links - a.links || b.downloads - a.downloads);
  const candidates = unique.slice(0, config.candidateTarget);
  for (const c of unique.slice(config.candidateTarget)) if (overrides.include.includes(c.gutenbergId)) candidates.push(c);

  await writeJson(FILES.candidates, candidates);
  log('discover', `kept ${candidates.length} candidates (of ${unique.length} eligible works)`);
  log('discover', `rejected: ${Object.entries(rejected).map(([k, v]) => `${k} ${v}`).join(', ')}`);
}

if (import.meta.main) await main();
