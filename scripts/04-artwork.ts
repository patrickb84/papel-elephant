// Step 4 - find a public-domain painting for each book.
//
// Searches The Metropolitan Museum of Art (Collection API v1.1) and the Art
// Institute of Chicago (API v1) for paintings made around the book's
// publication year, using search terms derived from the book's subjects,
// genres and setting. Candidates are scored on:
//   - date: how close the painting is to the publication year
//   - theme: overlap between the book's themes and the painting's title/tags
//   - region: the artist's nationality against the author's / the book's country
//   - suitability: landscape-friendly aspect ratio, a painting rather than a
//     study or sketch, no unrelated portrait or devotional subject
//   - museum signal: Met "highlight" / AIC "boosted" works
// Each painting is used at most once, and each artist at most twice.
//
//   node scripts/04-artwork.ts [gutenbergId ...]

import { fetchJson, mapLimit } from './lib/http.ts';
import { FILES } from './lib/paths.ts';
import type { ArtCandidate, ArtResult, Candidate, Confidence, MetadataResult } from './lib/types.ts';
import { fold, loadConfig, loadOverrides, log, readJson, writeJson } from './lib/util.ts';
import { ruleFromConfig, yearCheck, type YearRule } from './lib/year-rule.ts';

// ---------------------------------------------------------------------------
// Themes

interface Theme { name: string; match: RegExp; queries: string[]; tags: string[] }

export const THEMES: Theme[] = [
  { name: 'sea', match: /\b(sea|seas|ocean|oceans|whal\w*|ships?|sail\w*|voyages?|pirat\w*|islands?|shipwrecks?|naval|maritime|castaways?|submarines?|marine)\b/i,
    queries: ['sea', 'ships', 'coast'], tags: ['sea', 'seascape', 'ship', 'ships', 'boat', 'boats', 'ocean', 'coast', 'harbor', 'harbour', 'beach', 'waves', 'marine', 'shipwreck', 'storm'] },
  { name: 'war', match: /\b(war|wars|battles?|soldiers?|revolution|military|napoleonic|siege|army)\b/i,
    queries: ['battle', 'soldiers'], tags: ['battle', 'soldier', 'soldiers', 'war', 'army', 'military', 'cavalry', 'revolution'] },
  { name: 'city', match: /\b(london|paris|city|cities|urban|street|petersburg|dublin|new york|city and town life|rome)\b/i,
    queries: ['city street', 'bridge'], tags: ['city', 'cityscape', 'street', 'streets', 'town', 'bridge', 'boulevard', 'architecture', 'square'] },
  { name: 'domestic', match: /\b(domestic|manners|courtship|marriage|families|family|sisters|young women|love stories|romance|governess|women)\b/i,
    queries: ['woman reading', 'interior', 'garden'], tags: ['woman', 'women', 'interior', 'interiors', 'garden', 'reading', 'letter', 'flowers', 'girl', 'domestic', 'drawing room', 'lady'] },
  { name: 'country', match: /\b(country life|rural|village|farm|countryside|country homes|estates|pastoral)\b/i,
    queries: ['countryside', 'village'], tags: ['landscape', 'landscapes', 'village', 'farm', 'countryside', 'fields', 'pastoral', 'cottage', 'meadow'] },
  { name: 'gothic', match: /\b(horror\w*|gothic|vampires?|monsters?|ghosts?|supernatural|haunted|occult|dracula|frankenstein|cthulhu|terror)\b/i,
    queries: ['moonlight', 'ruins', 'night'], tags: ['moon', 'moonlight', 'night', 'ruins', 'ruin', 'castle', 'storm', 'darkness', 'cemetery', 'abbey', 'nocturne'] },
  { name: 'detective', match: /\b(detective|crime|murder|mystery|mysteries|police|holmes)\b/i,
    queries: ['night street', 'fog'], tags: ['night', 'street', 'fog', 'city', 'lamp', 'nocturne', 'evening'] },
  { name: 'wilderness', match: /\b(frontier|wilderness|indians of north america|wolves|wolf|dogs|klondike|yukon|alaska|hunting|forest|forests|adventure stories)\b/i,
    queries: ['wilderness', 'forest', 'mountains'], tags: ['forest', 'wilderness', 'mountain', 'mountains', 'hunting', 'wolf', 'dog', 'trees', 'woods', 'canyon', 'lake', 'river'] },
  { name: 'winter', match: /\b(winter|snow|russia|siberia|arctic|polar|antarctic|north pole)\b/i,
    queries: ['winter', 'snow'], tags: ['winter', 'snow', 'ice', 'frozen', 'skating'] },
  { name: 'childhood', match: /\b(child|children|boys|girls|orphan|orphans|school|juvenile|kittens|rabbits)\b/i,
    queries: ['children', 'girl'], tags: ['child', 'children', 'girl', 'boy', 'boys', 'girls', 'school', 'mother'] },
  { name: 'fantasy', match: /\b(fantasy|fairy|fairies|wonderland|magic|imaginary|dreams?|allegor\w*)\b/i,
    queries: ['fairy', 'dream'], tags: ['fairy', 'fairies', 'dream', 'fantasy', 'allegory', 'mythology', 'nymph', 'enchanted'] },
  { name: 'skies', match: /\b(science fiction|time travel|space|moon|mars|martians|invention|inventors|balloon|interplanetary|aeronaut|flight)\b/i,
    queries: ['night sky', 'moon', 'clouds'], tags: ['moon', 'sky', 'night', 'stars', 'balloon', 'clouds', 'moonlight', 'comet'] },
  { name: 'exotic', match: /\b(africa|jungles?|india|egypt|orient|arabia|arabs?|tropic\w*|south america|mines|deserts?|turkey|algeria)\b/i,
    queries: ['desert', 'jungle', 'caravan'], tags: ['desert', 'jungle', 'palm', 'camel', 'tropical', 'caravan', 'oasis', 'india', 'egypt', 'africa', 'orientalism'] },
  { name: 'antiquity', match: /\b(christian|bible|rome|roman|ancient|jesus|religious|pilgrim|carthage|nero|greece|greek)\b/i,
    queries: ['ancient rome', 'temple'], tags: ['roman', 'rome', 'ruins', 'temple', 'ancient', 'religious', 'classical', 'antiquity', 'forum'] },
  { name: 'medieval', match: /\b(knights|chivalry|middle ages|medieval|arthur|crusade|crusades|feudal|castle)\b/i,
    queries: ['knight', 'castle'], tags: ['knight', 'knights', 'armor', 'castle', 'medieval', 'chivalry', 'tournament'] },
  { name: 'river', match: /\b(river|rivers|mississippi|thames|boating|rowing|canal)\b/i,
    queries: ['river', 'boating'], tags: ['river', 'boat', 'boating', 'rowing', 'canal', 'bank', 'riverbank'] },
  { name: 'mountains', match: /\b(alps|alpine|mountain|mountains|switzerland|swiss)\b/i,
    queries: ['alps', 'mountains'], tags: ['mountain', 'mountains', 'alps', 'alpine', 'valley', 'peak'] },
  { name: 'horses', match: /\b(horse|horses|ponies|riding)\b/i,
    queries: ['horses'], tags: ['horse', 'horses', 'riding', 'carriage', 'stable'] },
  { name: 'labour', match: /\b(poverty|poor|working class|miners|mining|prison|prisons|prisoners|labor|labour|strikes|peasant|serfs)\b/i,
    queries: ['peasants', 'workers'], tags: ['peasant', 'peasants', 'workers', 'laborer', 'labor', 'poverty', 'harvest', 'mine', 'work'] },
  { name: 'society', match: /\b(aristocracy|upper class|social classes|society|gambling|wealth|nobility|salon|social life and customs)\b/i,
    queries: ['ballroom', 'elegant lady', 'cafe'], tags: ['ball', 'ballroom', 'salon', 'lady', 'elegant', 'cafe', 'opera', 'theater', 'party', 'dance'] },
  { name: 'music', match: /\b(music|musicians|opera|singers|artists|painters)\b/i,
    queries: ['opera', 'music'], tags: ['music', 'opera', 'musician', 'piano', 'violin', 'singer', 'theater', 'stage'] },
  { name: 'solitude', match: /\b(psychological|existential|alienation|insanity|mentally ill|philosophical|identity|guilt|bildungsroman)\b/i,
    queries: ['solitude', 'evening', 'window'], tags: ['solitude', 'evening', 'twilight', 'window', 'melancholy', 'night', 'alone', 'interior'] },
];
/** Extra subjects searched when themed searches find too few same-year paintings. */
const BROAD_QUERIES = ['landscape', 'river', 'garden', 'city', 'interior', 'coast', 'figures'];

const FALLBACK: Theme = { name: 'landscape', match: /./, queries: ['landscape'], tags: ['landscape', 'view'] };

export function themesFor(c: Candidate, m: MetadataResult | undefined, extra: string[] = []): Theme[] {
  const text = [c.title, ...c.subjects, ...c.bookshelves.filter((b) => !/^Category: (Novels|Classics)/.test(b)), ...(m?.genres ?? []), ...(m?.mainSubjects ?? [])].join(' | ');
  const found = THEMES.filter((t) => t.match.test(text));
  const forced = THEMES.filter((t) => extra.includes(t.name));
  const out = [...new Set([...forced, ...found])];
  return out.length ? out.slice(0, 4) : [FALLBACK];
}

// ---------------------------------------------------------------------------
// Nationality

const NATIONALITY: [RegExp, string][] = [
  [/united kingdom|england|scotland|wales|great britain|kingdom of great britain|british|ireland|irish/i, 'british'],
  [/united states|america/i, 'american'],
  [/france|french/i, 'french'],
  [/russia|russian|soviet/i, 'russian'],
  [/german|prussia|austria|bohemia/i, 'german'],
  [/ital/i, 'italian'],
  [/spain|spanish/i, 'spanish'],
  [/netherland|dutch|flemish|belgi/i, 'dutch'],
  [/sweden|norway|denmark|swed|norw|dan/i, 'scandinavian'],
  [/switzerland|swiss/i, 'swiss'],
  [/canada/i, 'american'],
];
const nat = (s: string) => NATIONALITY.find(([re]) => re.test(s))?.[1];

// ---------------------------------------------------------------------------
// Museum searches

const MET = 'https://collectionapi.metmuseum.org/public/collection';
const AIC = 'https://api.artic.edu/api/v1';

interface MetObject {
  objectID: number; isPublicDomain: boolean; primaryImage: string; title: string; artistDisplayName: string;
  artistNationality: string; objectDate: string; objectBeginDate: number; objectEndDate: number; medium: string;
  classification: string; objectName: string; objectURL: string; creditLine: string; isHighlight: boolean;
  tags: { term: string }[] | null; measurements: { elementName: string; elementMeasurements: { Height?: number; Width?: number } }[] | null;
}

async function metSearch(q: string, from: number, to: number, departmentId: number): Promise<ArtCandidate[]> {
  const url = `${MET}/v1.1/search?q=${encodeURIComponent(q)}&hasImages=true&departmentId=${departmentId}&dateBegin=${from}&dateEnd=${to}&limit=15`;
  const res = await fetchJson<{ objectIDs: number[] | null }>(url).catch(() => ({ objectIDs: [] }));
  const objs = await mapLimit((res.objectIDs ?? []).slice(0, 15), 4, (id) =>
    fetchJson<MetObject>(`${MET}/v1/objects/${id}`).catch(() => null),
  );
  return objs
    .filter((o): o is MetObject => !!o && o.isPublicDomain && !!o.primaryImage && /painting/i.test(`${o.classification} ${o.objectName}`))
    .map((o) => {
      const overall = o.measurements?.find((m) => m.elementName === 'Overall')?.elementMeasurements;
      return {
        museum: 'met' as const,
        id: String(o.objectID),
        title: o.title,
        artist: o.artistDisplayName || 'Unknown artist',
        artistNationality: o.artistNationality,
        date: o.objectDate,
        yearStart: o.objectBeginDate,
        yearEnd: o.objectEndDate,
        medium: o.medium,
        classification: o.classification,
        keywords: (o.tags ?? []).map((t) => t.term.toLowerCase()),
        imageUrl: o.primaryImage,
        sourceUrl: o.objectURL,
        creditLine: o.creditLine,
        aspect: overall?.Width && overall?.Height ? overall.Width / overall.Height : undefined,
        score: o.isHighlight ? 5 : 0,
      };
    });
}

interface AicArtwork {
  id: number; title: string; artist_display: string; artist_title: string | null; date_display: string;
  date_start: number; date_end: number; image_id: string | null; is_public_domain: boolean; is_boosted: boolean;
  medium_display: string; classification_titles: string[]; subject_titles: string[]; term_titles: string[];
  credit_line: string; place_of_origin: string; thumbnail: { width: number; height: number } | null;
}

async function aicSearch(q: string, from: number, to: number): Promise<ArtCandidate[]> {
  const body = JSON.stringify({
    q,
    limit: 25,
    fields: ['id', 'title', 'artist_display', 'artist_title', 'date_display', 'date_start', 'date_end', 'image_id',
      'is_public_domain', 'is_boosted', 'medium_display', 'classification_titles', 'subject_titles', 'term_titles',
      'credit_line', 'place_of_origin', 'thumbnail'],
    query: { bool: { filter: [
      { term: { is_public_domain: true } },
      { term: { artwork_type_id: 1 } },
      { exists: { field: 'image_id' } },
      { range: { date_start: { gte: from, lte: to } } },
    ] } },
  });
  const res = await fetchJson<{ data: AicArtwork[] }>(`${AIC}/artworks/search`, {
    method: 'POST', body, headers: { 'Content-Type': 'application/json' },
  }).catch(() => ({ data: [] as AicArtwork[] }));
  return res.data
    .filter((a) => a.is_public_domain && a.image_id && !a.classification_titles.includes('asian art'))
    .filter((a) => /oil|tempera|panel|canvas|watercolor|gouache|pastel/i.test(a.medium_display ?? ''))
    .map((a) => {
      const nationality = a.artist_display?.split('\n')[1]?.split(',')[0]?.trim();
      return {
        museum: 'aic' as const,
        id: String(a.id),
        title: a.title,
        artist: a.artist_title ?? a.artist_display?.split('\n')[0] ?? 'Unknown artist',
        artistNationality: nationality ?? a.place_of_origin,
        date: a.date_display,
        yearStart: a.date_start,
        yearEnd: a.date_end,
        medium: a.medium_display,
        classification: a.classification_titles.join(', '),
        keywords: [...a.subject_titles, ...a.term_titles].map((t) => t.toLowerCase()),
        imageUrl: `https://www.artic.edu/iiif/2/${a.image_id}/full/1686,/0/default.jpg`,
        sourceUrl: `https://www.artic.edu/artworks/${a.id}`,
        creditLine: a.credit_line,
        aspect: a.thumbnail ? a.thumbnail.width / a.thumbnail.height : undefined,
        score: a.is_boosted ? 5 : 0,
      };
    });
}

export async function fetchArtwork(museum: 'met' | 'aic', id: string): Promise<ArtCandidate | undefined> {
  if (museum === 'met') {
    const o = await fetchJson<MetObject>(`${MET}/v1/objects/${id}`);
    if (!o.isPublicDomain || !o.primaryImage) return undefined;
    return {
      museum, id, title: o.title, artist: o.artistDisplayName || 'Unknown artist', artistNationality: o.artistNationality,
      date: o.objectDate, yearStart: o.objectBeginDate, yearEnd: o.objectEndDate, medium: o.medium,
      classification: o.classification, keywords: (o.tags ?? []).map((t) => t.term.toLowerCase()),
      imageUrl: o.primaryImage, sourceUrl: o.objectURL, creditLine: o.creditLine,
    };
  }
  const { data: a } = await fetchJson<{ data: AicArtwork }>(`${AIC}/artworks/${id}`);
  if (!a.is_public_domain || !a.image_id) return undefined;
  return {
    museum, id, title: a.title, artist: a.artist_title ?? a.artist_display.split('\n')[0], date: a.date_display,
    yearStart: a.date_start, yearEnd: a.date_end, medium: a.medium_display, classification: a.classification_titles.join(', '),
    keywords: [...a.subject_titles, ...a.term_titles].map((t) => t.toLowerCase()),
    imageUrl: `https://www.artic.edu/iiif/2/${a.image_id}/full/1686,/0/default.jpg`,
    sourceUrl: `https://www.artic.edu/artworks/${a.id}`, creditLine: a.credit_line,
    aspect: a.thumbnail ? a.thumbnail.width / a.thumbnail.height : undefined,
  };
}

// ---------------------------------------------------------------------------
// Scoring

const PORTRAIT = /\b(portrait|self-portrait|bust of|head of|study of a head|mrs\.|mr\.|madame|monsieur|lady [A-Z]|captain [A-Z])/i;
const DEVOTIONAL = /\b(madonna|virgin|saint|st\.|christ|crucifixion|annunciation|holy family|nativity|deposition|pieta|altarpiece)\b/i;
const ROUGH = /\b(study|sketch|esquisse|copy after|fragment)\b/i;
const GENERIC_TAGS = new Set(['woman', 'women', 'girl', 'lady', 'landscape', 'landscapes', 'view', 'city', 'street', 'streets', 'town', 'night', 'interior', 'interiors', 'work', 'evening', 'boy', 'child', 'children', 'mother', 'trees']);

/** Grim subjects that clash with most books' mood (fine for gothic or war novels). */
const GRIM = /\b(death|dead|dying|hanged|hanging|execution|corpse|martyrdom|massacre|murder|wounded|attacked|slaughter|mourning|suicide|drowned|plague|skull|crucifixion)\b/i;

function score(a: ArtCandidate, year: number, themes: Theme[], natPref: Set<string>): ArtCandidate {
  const reasons: string[] = [];
  let s = a.score ?? 0;
  if (s) reasons.push('museum highlight');
  // Every candidate already passes the year rule; an exact, single-year date scores best.
  const gap = year < a.yearStart ? a.yearStart - year : year > a.yearEnd ? year - a.yearEnd : 0;
  const exact = gap === 0 && a.yearStart === a.yearEnd;
  s += exact ? 40 : gap === 0 ? 34 : 28;
  reasons.push(exact ? 'painted in the publication year' : gap === 0 ? `dated ${a.date}, which includes the publication year` : `painted ${gap} year from publication`);

  // Theme hits: a match in the painting's own title counts double, and the
  // book's first (most specific) theme counts more than later ones.
  const titleHay = fold(a.title);
  const tagHay = fold(a.keywords.join(' '));
  const hits: string[] = [];
  let themeScore = 0;
  themes.forEach((t, rank) => {
    const weight = rank === 0 ? 1.4 : rank === 1 ? 1 : 0.7;
    let best = 0;
    for (const tag of t.tags) {
      const re = new RegExp(`\\b${fold(tag)}s?\\b`);
      // Generic words ("woman", "street") say little about a painting's mood.
      const generic = GENERIC_TAGS.has(tag);
      const w = re.test(titleHay) ? (generic ? 1 : 2) : re.test(tagHay) ? (generic ? 0.5 : 1) : 0;
      if (w) hits.push(`${t.name}:${tag}${w === 2 ? ' (title)' : ''}`);
      best = Math.max(best, w);
    }
    themeScore += best * 12 * weight;
  });
  s += Math.min(50, themeScore);
  if (hits.length) reasons.push(`themes ${hits.join(', ')}`);
  const grimOk = themes.some((t) => t.name === 'gothic' || t.name === 'war');
  if (GRIM.test(`${a.title} ${a.keywords.join(' ')}`) && !grimOk) { s -= 30; reasons.push('grim subject (penalised)'); }

  const n = nat(a.artistNationality ?? '');
  if (n && natPref.has(n)) { s += 10; reasons.push(`${n} artist`); }

  if (a.aspect) {
    if (a.aspect >= 1.1 && a.aspect <= 2.0) s += 10;
    else if (a.aspect >= 0.72) s += 4;
    else s -= 10;
  }
  if (PORTRAIT.test(a.title) && !themes.some((t) => t.name === 'society')) { s -= 20; reasons.push('portrait subject (penalised)'); }
  if (DEVOTIONAL.test(a.title) && !themes.some((t) => t.name === 'antiquity')) { s -= 15; reasons.push('devotional subject (penalised)'); }
  if (ROUGH.test(a.title)) { s -= 12; reasons.push('study or sketch (penalised)'); }
  return { ...a, score: Math.round(s * 10) / 10, reasons };
}

// ---------------------------------------------------------------------------

async function main() {
  const config = await loadConfig();
  const rule: YearRule = ruleFromConfig(config);
  const overrides = await loadOverrides();
  const candidates = await readJson<Candidate[]>(FILES.candidates);
  const metadata = new Map((await readJson<MetadataResult[]>(FILES.metadata)).map((m) => [m.gutenbergId, m]));
  const only = process.argv.slice(2).map(Number).filter(Boolean);
  const previous = await readJson<ArtResult[]>(FILES.artwork, []);
  const byId = new Map(previous.map((r) => [r.gutenbergId, r]));

  // Paintings already taken by books we are not re-running.
  const used = new Set<string>();
  const artistCount = new Map<string, number>();
  const take = (a: ArtCandidate) => {
    used.add(`${a.museum}:${a.id}`);
    artistCount.set(a.artist, (artistCount.get(a.artist) ?? 0) + 1);
  };
  if (only.length) for (const r of previous) if (!only.includes(r.gutenbergId) && r.chosen) take(r.chosen);

  const todo = candidates.filter((c) => (only.length ? only.includes(c.gutenbergId) : true) && !overrides.exclude[c.gutenbergId]);

  // Search in parallel, choose sequentially (choices depend on what is taken).
  const pools = await mapLimit(todo, 3, async (c) => {
    const m = metadata.get(c.gutenbergId);
    const o = overrides.books[c.gutenbergId] ?? {};
    const year = m?.year;
    const themes = themesFor(c, m, o.themes);
    if (!year) return { c, year, themes, pool: [] as ArtCandidate[], forced: undefined };
    let forced: ArtCandidate | undefined;
    if (o.artwork) forced = await fetchArtwork(o.artwork.museum, o.artwork.id);

    const american = /american|united states/i.test(`${m?.author?.nationality.join(' ')} ${m?.countries.join(' ')}`);
    // Search a little wider than the rule (so "c." dates and short ranges that
    // start earlier are found), then keep only candidates that pass the rule.
    const from = year - rule.tolerance - rule.maxRange, to = year + rule.tolerance;
    const search = async (queries: string[]) => {
      const results = await Promise.all(
        queries.flatMap((q) => [
          metSearch(q, from, to, 11),
          ...(american ? [metSearch(q, from, to, 1)] : []),
          aicSearch(q, from, to),
        ]),
      );
      return results.flat();
    };
    const fits = (a: ArtCandidate) => yearCheck(year, a.yearStart, a.yearEnd, rule).ok;
    let pool = (await search([...new Set(themes.flatMap((t) => t.queries))].slice(0, 5))).filter(fits);
    // So few paintings are dated to a single year that themed searches can come
    // up short; widen the subjects (never the years) until there's a choice.
    if (pool.length < 8) pool = [...pool, ...(await search(BROAD_QUERIES)).filter(fits)];
    log('art', `${c.gutenbergId} ${c.title}: ${pool.length} candidates within ±${rule.tolerance}y (${themes.map((t) => t.name).join(', ')})`);
    return { c, year, themes, pool, forced };
  });

  for (const { c, year, themes, pool, forced } of pools) {
    const m = metadata.get(c.gutenbergId);
    const flags: string[] = [];
    if (!year) {
      byId.set(c.gutenbergId, { gutenbergId: c.gutenbergId, alternates: [], themes: [], flags: ['no-year'] });
      continue;
    }
    const natPref = new Set(
      [...(m?.author?.nationality ?? []), ...(m?.countries ?? [])].map(nat).filter((x): x is string => !!x),
    );
    const seen = new Set<string>();
    const ranked = pool
      .filter((a) => {
        const k = `${a.museum}:${a.id}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .map((a) => score(a, year, themes, natPref))
      .sort((a, b) => b.score! - a.score!);
    const available = ranked.filter((a) => !used.has(`${a.museum}:${a.id}`) && (artistCount.get(a.artist) ?? 0) < 2);
    let chosen = forced ? { ...forced, reasons: ['chosen in overrides.json'] } : available[0];
    if (!chosen) {
      byId.set(c.gutenbergId, { gutenbergId: c.gutenbergId, alternates: [], themes: themes.map((t) => t.name), flags: ['no-artwork-found'] });
      log('art', `${c.gutenbergId} ${c.title}: NO ARTWORK`);
      continue;
    }
    take(chosen);

    // Confidence is deliberately strict: automatic matching can't judge mood,
    // so "high" needs a title-level theme match, a close date and no penalties.
    let confidence: Confidence = 'low';
    const check = yearCheck(year, chosen.yearStart, chosen.yearEnd, rule);
    const reasons = chosen.reasons ?? [];
    const themed = reasons.some((r) => r.startsWith('themes'));
    const titleThemed = reasons.some((r) => r.startsWith('themes') && r.includes('(title)'));
    const penalised = reasons.some((r) => r.includes('penalised'));
    if (forced) confidence = check.ok ? 'high' : 'low';
    else if (titleThemed && !penalised) confidence = 'high';
    else if (themed && !penalised) confidence = 'medium';
    if (!check.ok) flags.push(`outside-year-rule: ${check.why}`);
    if (penalised) flags.push('penalised-subject');
    if (!themed && !forced) flags.push('no-theme-match');
    if (chosen.aspect && chosen.aspect < 0.72) flags.push('tall-format');
    if (themes[0] === FALLBACK) flags.push('generic-themes');

    byId.set(c.gutenbergId, {
      gutenbergId: c.gutenbergId,
      chosen,
      alternates: available.filter((a) => a !== chosen).slice(0, 11),
      themes: themes.map((t) => t.name),
      confidence,
      flags,
    });
    log('art', `${c.gutenbergId} ${c.title} (${year}) -> [${confidence}] ${chosen.title} — ${chosen.artist}, ${chosen.date} (${chosen.museum}) ${flags.join(' ')}`);
  }

  await writeJson(FILES.artwork, candidates.map((c) => byId.get(c.gutenbergId)).filter(Boolean));
  const all = [...byId.values()];
  log('art', `done: ${all.filter((r) => r.chosen).length} with artwork; high ${all.filter((r) => r.confidence === 'high').length}, medium ${all.filter((r) => r.confidence === 'medium').length}, low ${all.filter((r) => r.confidence === 'low').length}`);
}

if (import.meta.main) await main();
