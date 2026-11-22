// Step 3 - publication year, themes and author portrait.
//
// Wikidata supplies, per book:
//   - the work item (matched by Project Gutenberg ebook ID P2034 in step 1,
//     or found here by title search with an author check),
//   - the original publication year (P577, falling back to inception P571),
//   - the work's own "first line" (P1922), used to cross-check step 2,
//   - genres, main subjects, narrative locations and country (for art matching),
//   - the author (P50) and the author's image (P18) on Wikimedia Commons.
// Commons supplies the portrait's licence, author, credit line and date.
//
//   node scripts/03-metadata.ts [gutenbergId ...]

import { fetchJson, mapLimit } from './lib/http.ts';
import { FILES } from './lib/paths.ts';
import type { Candidate, ImageLicense, MetadataResult } from './lib/types.ts';
import { fold, loadOverrides, log, readJson, writeJson } from './lib/util.ts';

const WD_API = 'https://www.wikidata.org/w/api.php';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';

type Claim = { mainsnak: { snaktype: string; datavalue?: { value: any; type: string } }; rank: string };
interface Entity { id: string; labels?: Record<string, { value: string }>; claims?: Record<string, Claim[]> }

const entityCache = new Map<string, Entity>();

async function getEntities(ids: string[]): Promise<Map<string, Entity>> {
  const missing = [...new Set(ids)].filter((id) => !entityCache.has(id));
  for (let i = 0; i < missing.length; i += 50) {
    const chunk = missing.slice(i, i + 50);
    const url = `${WD_API}?action=wbgetentities&format=json&props=labels|claims&languages=en|mul&ids=${chunk.join('|')}`;
    const data = await fetchJson<{ entities: Record<string, Entity> }>(url);
    for (const [id, e] of Object.entries(data.entities)) entityCache.set(id, e);
  }
  return new Map(ids.flatMap((id): [string, Entity][] => (entityCache.has(id) ? [[id, entityCache.get(id)!]] : [])));
}

const values = (e: Entity | undefined, prop: string) =>
  (e?.claims?.[prop] ?? [])
    .filter((c) => c.rank !== 'deprecated' && c.mainsnak.snaktype === 'value')
    .map((c) => c.mainsnak.datavalue!.value);
const itemIds = (e: Entity | undefined, prop: string): string[] => values(e, prop).map((v) => v.id).filter(Boolean);
// Wikidata now keeps many names only under the language-neutral "mul" label.
const label = (e: Entity | undefined) => e?.labels?.en?.value ?? e?.labels?.mul?.value ?? '';
/** "Cervantes Saavedra, Miguel de" -> "cervantes" */
const surnameOf = (name = '') => fold(name.split(',')[0]).split(' ')[0];

function earliestYear(e: Entity | undefined, prop: string): number | undefined {
  const years = values(e, prop)
    .filter((v) => v.precision >= 9) // year precision or finer
    .map((v) => Number(String(v.time).match(/^([+-]\d+)/)?.[1]))
    .filter((y) => Number.isFinite(y));
  return years.length ? Math.min(...years) : undefined;
}

async function labelsFor(ids: string[]) {
  const ents = await getEntities(ids);
  return ids.map((id) => label(ents.get(id))).filter(Boolean);
}

/** Find the work on Wikidata by title, checking the author. */
async function searchWork(c: Candidate, search?: string): Promise<string | undefined> {
  const surname = surnameOf(c.authors[0]?.name);
  const url = `${WD_API}?action=wbsearchentities&format=json&language=en&type=item&limit=10&search=${encodeURIComponent(search ?? c.title)}`;
  const data = await fetchJson<{ search: { id: string }[] }>(url);
  const ids = data.search.map((s) => s.id);
  const ents = await getEntities(ids);
  for (const id of ids) {
    const e = ents.get(id);
    const authors = await labelsFor(itemIds(e, 'P50'));
    if (authors.some((a) => fold(a).includes(surname)) && (earliestYear(e, 'P577') || earliestYear(e, 'P571'))) return id;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Commons

const stripHtml = (s?: string) =>
  s?.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#039;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim() || undefined;

export function classifyLicense(meta: Record<string, { value: string }>): ImageLicense {
  const name = stripHtml(meta.LicenseShortName?.value) ?? 'Unknown';
  const url = stripHtml(meta.LicenseUrl?.value);
  const publicDomain = /public domain|^pd\b|^pd-|cc0|no restrictions/i.test(name) || meta.Copyrighted?.value === 'False';
  return { name, url, publicDomain };
}

/** Licences the site can display: public domain, CC0, CC BY, CC BY-SA (with attribution). */
export const licenseAcceptable = (l: ImageLicense) => l.publicDomain || /^CC BY(-SA)? \d/i.test(l.name);

const commonsCache = new Map<string, any>();
const normFile = (f: string) => f.replace(/_/g, ' ').trim();

/** Fetch Commons image info for many files, 50 titles per request. */
async function prefetchCommons(files: string[]) {
  const todo = [...new Set(files.map(normFile))].filter((f) => !commonsCache.has(f));
  for (let i = 0; i < todo.length; i += 50) {
    const titles = todo.slice(i, i + 50).map((f) => `File:${f}`).join('|');
    const url = `${COMMONS_API}?action=query&format=json&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=900&titles=${encodeURIComponent(titles)}`;
    const data = await fetchJson<any>(url);
    const renamed = new Map<string, string>();
    for (const n of data.query?.normalized ?? []) renamed.set(n.to, n.from);
    for (const page of Object.values<any>(data.query?.pages ?? {})) {
      const name = normFile(String(page.title).replace(/^File:/, ''));
      commonsCache.set(name, page.imageinfo?.[0] ?? null);
      const from = renamed.get(page.title);
      if (from) commonsCache.set(normFile(from.replace(/^File:/, '')), page.imageinfo?.[0] ?? null);
    }
  }
}

async function commonsImage(file: string) {
  await prefetchCommons([file]);
  const info = commonsCache.get(normFile(file));
  if (!info) return undefined;
  const meta = info.extmetadata ?? {};
  return {
    file,
    pageUrl: info.descriptionurl as string,
    thumbUrl: (info.thumburl ?? info.url) as string,
    width: info.thumbwidth ?? info.width,
    height: info.thumbheight ?? info.height,
    artist: stripHtml(meta.Artist?.value),
    credit: stripHtml(meta.Credit?.value),
    date: stripHtml(meta.DateTimeOriginal?.value),
    license: classifyLicense(meta),
  };
}

// ---------------------------------------------------------------------------

async function process1(c: Candidate, o: { year?: number; yearNote?: string; noPortrait?: boolean; portraitFile?: string; wikidataSearch?: string }): Promise<MetadataResult> {
  const flags: string[] = [];
  const r: MetadataResult = { gutenbergId: c.gutenbergId, genres: [], mainSubjects: [], countries: [], flags };

  let workId = c.wikidataWork;
  r.wikidataVia = 'gutenberg-id';
  if (!workId) {
    workId = await searchWork(c, o.wikidataSearch);
    r.wikidataVia = 'title-search';
    if (workId) flags.push('wikidata-by-title-search');
  }
  if (!workId) {
    flags.push('no-wikidata');
    if (o.year) Object.assign(r, { year: o.year, yearSource: `override: ${o.yearNote ?? 'manual'}` });
    return r;
  }
  r.wikidataId = workId;
  const work = (await getEntities([workId])).get(workId);
  r.workLabel = label(work);

  // Year: P577 publication date, else P571 inception.
  const pub = earliestYear(work, 'P577');
  const inc = earliestYear(work, 'P571');
  if (o.year) Object.assign(r, { year: o.year, yearSource: `override: ${o.yearNote ?? 'manual'}` });
  else if (pub) Object.assign(r, { year: pub, yearSource: `Wikidata ${workId} P577 publication date` });
  else if (inc) Object.assign(r, { year: inc, yearSource: `Wikidata ${workId} P571 inception` }), flags.push('year-from-inception');
  else flags.push('no-year');

  const firstLine = values(work, 'P1922').find((v) => v.language === 'en')?.text;
  if (firstLine) r.wikidataFirstLine = firstLine;

  r.genres = await labelsFor(itemIds(work, 'P136'));
  r.mainSubjects = await labelsFor([...itemIds(work, 'P921'), ...itemIds(work, 'P840')]);
  r.countries = await labelsFor(itemIds(work, 'P495'));

  // Author: P50, checked against the Gutenberg author's surname.
  const surname = surnameOf(c.authors[0]?.name);
  const authorIds = itemIds(work, 'P50');
  const authors = await getEntities(authorIds);
  const authorId = authorIds.find((id) => fold(label(authors.get(id))).includes(surname)) ?? authorIds[0];
  if (!authorId) {
    flags.push('no-wikidata-author');
    return r;
  }
  const author = authors.get(authorId);
  if (!fold(label(author)).includes(surname)) flags.push('author-name-mismatch');
  r.author = {
    wikidataId: authorId,
    name: label(author),
    nationality: await labelsFor(itemIds(author, 'P27')),
  };

  // Sanity check the year against the author's life (posthumous publication is allowed).
  const a = c.authors[0];
  if (r.year && a?.birthYear && r.year < a.birthYear + 12) flags.push('year-before-author-adulthood');
  if (r.year && a?.deathYear && r.year > a.deathYear + 40) flags.push('year-long-after-author-death');

  if (o.noPortrait) return r;
  const file = o.portraitFile ?? values(author, 'P18')[0];
  if (!file) {
    flags.push('no-portrait-on-wikidata');
    return r;
  }
  const img = await commonsImage(file);
  if (!img) flags.push('portrait-missing-on-commons');
  else {
    r.author.portrait = img;
    if (!licenseAcceptable(img.license)) flags.push(`portrait-license-unusable: ${img.license.name}`);
    else if (!img.license.publicDomain) flags.push(`portrait-needs-attribution: ${img.license.name}`);
  }
  return r;
}

async function main() {
  const candidates = await readJson<Candidate[]>(FILES.candidates);
  const overrides = await loadOverrides();
  const only = process.argv.slice(2).map(Number).filter(Boolean);
  const previous = await readJson<MetadataResult[]>(FILES.metadata, []);
  const byId = new Map(previous.map((r) => [r.gutenbergId, r]));
  const todo = only.length ? candidates.filter((c) => only.includes(c.gutenbergId)) : candidates;

  // Batch everything Wikidata/Commons will be asked for, 50 per request, so
  // the per-book pass below reads from memory. Wikimedia rate-limits
  // anonymous clients hard; ~a dozen requests instead of ~1,000.
  log('meta', 'prefetching works, linked items, authors and portraits from Wikidata/Commons');
  const works = await getEntities(todo.map((c) => c.wikidataWork).filter((x): x is string => !!x));
  const linked = [...works.values()].flatMap((w) => ['P136', 'P921', 'P840', 'P495', 'P50'].flatMap((p) => itemIds(w, p)));
  const linkedEnts = await getEntities(linked);
  const authorEnts = [...works.values()].flatMap((w) => itemIds(w, 'P50')).map((id) => linkedEnts.get(id));
  await getEntities(authorEnts.flatMap((a) => itemIds(a, 'P27')));
  await prefetchCommons([
    ...authorEnts.map((a) => values(a, 'P18')[0]).filter(Boolean),
    ...Object.values(overrides.books).map((b) => b.portraitFile).filter((f): f is string => !!f),
  ]);

  const results = await mapLimit(todo, 1, async (c) => {
    try {
      const r = await process1(c, overrides.books[c.gutenbergId] ?? {});
      log('meta', `${c.gutenbergId} ${c.title}: ${r.year ?? '????'} ${r.author?.portrait ? `portrait ${r.author.portrait.license.name}` : 'no portrait'} ${r.flags.join(', ')}`);
      return r;
    } catch (err) {
      log('meta', `${c.gutenbergId} ${c.title}: FAILED ${(err as Error).message}`);
      return { gutenbergId: c.gutenbergId, genres: [], mainSubjects: [], countries: [], flags: ['metadata-error'] } as MetadataResult;
    }
  });
  for (const r of results) byId.set(r.gutenbergId, r);
  await writeJson(FILES.metadata, candidates.map((c) => byId.get(c.gutenbergId)).filter(Boolean));
  log('meta', `done: ${results.filter((r) => r.year).length}/${results.length} with a year, ${results.filter((r) => r.author?.portrait).length} with a portrait`);
}

if (import.meta.main) await main();
