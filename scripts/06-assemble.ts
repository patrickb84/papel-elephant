// Step 6 - assemble the collection the site reads, and write the report.
//
// An entry is published only when every part passes:
//   - opening line: extracted from the Project Gutenberg text AND either
//     approved in content/reviews.json (the approval is tied to the exact
//     sentence, so a changed extraction needs a fresh review) or matching
//     the work's "first line" on Wikidata (P1922);
//   - publication year from Wikidata (or an override with a note);
//   - a public-domain painting, downloaded, that was either approved in
//     reviews.json or matched with high confidence and not rejected;
// The author portrait is optional and is dropped when its licence is not
// usable or it was rejected in review.
// Everything left out is listed in content/REPORT.md with the reason.
//
//   node scripts/06-assemble.ts

import { FILES, DATA_FILE } from './lib/paths.ts';
import { writeFile } from 'node:fs/promises';
import type { ArtResult, Candidate, ImagesResult, LineResult, MetadataResult } from './lib/types.ts';
import type { FirstLine } from '../src/lib/first-lines.ts';
import { cleanArtist, fold, loadConfig, loadOverrides, loadReviews, log, readJson, slugify, writeJson } from './lib/util.ts';
import { ruleFromConfig, yearCheck } from './lib/year-rule.ts';

const MUSEUM = { met: 'The Metropolitan Museum of Art', aic: 'Art Institute of Chicago' };

const SMALL = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'of', 'in', 'on', 'at', 'to', 'for', 'by', 'with', 'from', 'under', 'into', 'de', 'du', 'la', 'le', 'van', 'von']);
function titleCase(s: string) {
  return s.replace(/[A-Za-zÀ-ÿ'’]+/g, (w, i: number) => (i > 0 && SMALL.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)));
}

function displayTitle(c: Candidate, m: MetadataResult | undefined, override?: string) {
  if (override) return override;
  const base = c.title.replace(/,\s*Complete$/i, '').replace(/\s*\(\d{4}\)$/, '').trim();
  const wd = m?.workLabel;
  // Prefer Wikidata's label (better capitalisation, no edition subtitle) when it is clearly the same book.
  if (wd && (fold(base).includes(fold(wd)) || fold(wd).includes(fold(base)))) return wd.charAt(0).toUpperCase() + wd.slice(1);
  return /^[^A-Z]*[a-z]/.test(base.split(' ').slice(1).join(' ')) ? titleCase(base) : base;
}

const lineMatchesWikidata = (line: string, wd?: string) => {
  if (!wd) return false;
  const a = fold(line), b = fold(wd);
  const n = Math.min(60, a.length, b.length);
  return n >= 15 && a.slice(0, n) === b.slice(0, n);
};

async function main() {
  const candidates = await readJson<Candidate[]>(FILES.candidates);
  const lines = new Map((await readJson<LineResult[]>(FILES.lines)).map((r) => [r.gutenbergId, r]));
  const meta = new Map((await readJson<MetadataResult[]>(FILES.metadata)).map((r) => [r.gutenbergId, r]));
  const art = new Map((await readJson<ArtResult[]>(FILES.artwork)).map((r) => [r.gutenbergId, r]));
  const images = new Map((await readJson<ImagesResult[]>(FILES.images, [])).map((r) => [r.gutenbergId, r]));
  const overrides = await loadOverrides();
  const reviews = await loadReviews();
  const rule = ruleFromConfig(await loadConfig());

  const entries: FirstLine[] = [];
  const left: { c: Candidate; reasons: string[] }[] = [];
  const notes: { c: Candidate; notes: string[] }[] = [];
  const ids = new Set<string>();

  for (const c of candidates) {
    const key = String(c.gutenbergId);
    if (overrides.exclude[key]) {
      left.push({ c, reasons: [`excluded: ${overrides.exclude[key]}`] });
      continue;
    }
    const L = lines.get(c.gutenbergId), M = meta.get(c.gutenbergId), A = art.get(c.gutenbergId), I = images.get(c.gutenbergId);
    const o = overrides.books[key] ?? {};
    const reasons: string[] = [];
    const entryNotes: string[] = [];

    // Opening line
    let lineCheck = '';
    if (!L?.ok || !L.sentence) reasons.push(`no opening line (${L?.error ?? 'not extracted'})`);
    else {
      const rv = reviews.lines[key];
      if (rv?.status === 'rejected' && rv.ref === L.hash) reasons.push(`line rejected in review${rv.note ? `: ${rv.note}` : ''}`);
      else if (rv?.status === 'approved' && rv.ref === L.hash) lineCheck = `reviewed against the full text by ${rv.by} on ${rv.date}`;
      else if (lineMatchesWikidata(L.sentence, M?.wikidataFirstLine)) lineCheck = `matches Wikidata ${M!.wikidataId} first line (P1922)`;
      else if (rv?.status === 'approved') reasons.push('line changed since it was approved: review again');
      else reasons.push(`line not yet reviewed [${L.confidence}${L.flags.length ? `; ${L.flags.join(', ')}` : ''}]`);
    }

    // Year
    if (!M?.year) reasons.push('no publication year');

    // Artwork
    let artMatch = '';
    const chosen = A?.chosen;
    if (!chosen) reasons.push(`no artwork (${A?.flags.join(', ') || 'not matched'})`);
    else if (!I?.artwork) reasons.push('artwork image not downloaded');
    else if (M?.year && !yearCheck(M.year, chosen.yearStart, chosen.yearEnd, rule).ok)
      reasons.push(`painting is not from the publication year: ${yearCheck(M.year, chosen.yearStart, chosen.yearEnd, rule).why} - pick another`);
    else {
      const rv = reviews.art[key];
      const ref = `${chosen.museum}:${chosen.id}`;
      if (rv?.status === 'rejected' && rv.ref === ref) reasons.push(`artwork rejected in review${rv.note ? `: ${rv.note}` : ''} - choose another in overrides.json`);
      else if (rv?.status === 'approved' && rv.ref === ref) artMatch = `reviewed by ${rv.by} on ${rv.date}`;
      else if (A.confidence !== 'high') reasons.push(`artwork match is ${A.confidence} confidence [${A.flags.join(', ') || 'no flags'}] - review it`);
      else artMatch = `automatic (${A.confidence}): ${(chosen.reasons ?? []).join('; ')}`;
      if (A.flags.length) entryNotes.push(`art: ${A.flags.join(', ')}`);
    }

    if (reasons.length) {
      left.push({ c, reasons });
      continue;
    }

    // Portrait (optional)
    let portrait: FirstLine['portrait'];
    const P = M!.author?.portrait;
    const prv = reviews.portraits[key];
    if (P && I?.portrait && !(prv?.status === 'rejected')) {
      const usable = P.license.publicDomain || /^CC BY(-SA)? \d/i.test(P.license.name);
      if (usable) {
        portrait = {
          ...I.portrait,
          sourceUrl: P.pageUrl,
          artist: cleanArtist(P.artist),
          license: P.license.publicDomain ? 'Public domain' : P.license.name,
          licenseUrl: P.license.url,
          attributionRequired: !P.license.publicDomain,
        };
      } else entryNotes.push(`portrait dropped: licence ${P.license.name}`);
    } else if (!P) entryNotes.push('no portrait on Wikidata');

    const author = c.authors[0];
    const name = M!.author?.name && fold(M!.author.name).includes(fold(author.name.split(',')[0]).split(' ')[0]) ? M!.author.name : author.displayName;
    const title = displayTitle(c, M, o.title);
    let id = slugify(title);
    if (ids.has(id)) id = `${id}-${c.gutenbergId}`;
    ids.add(id);

    entries.push({
      id,
      gutenbergId: c.gutenbergId,
      title,
      author: name,
      authorLife: author.birthYear || author.deathYear ? `${author.birthYear ?? '?'}–${author.deathYear ?? '?'}` : undefined,
      coAuthors: c.authors.slice(1).map((a) => a.displayName),
      translators: c.translators.map((t) => t.displayName),
      year: M!.year!,
      line: L!.sentence!,
      abridged: /…$/.test(L!.sentence!),
      readUrl: `https://www.gutenberg.org/ebooks/${c.gutenbergId}`,
      artwork: {
        ...I!.artwork!,
        title: chosen!.title,
        artist: chosen!.artist,
        date: chosen!.date,
        museum: MUSEUM[chosen!.museum],
        sourceUrl: chosen!.sourceUrl,
        creditLine: chosen!.creditLine,
        license: 'Public domain',
      },
      portrait,
      provenance: {
        lineSource: L!.sourceUrl!.replace(/^http:/, 'https:'),
        lineCheck,
        yearSource: M!.yearSource!,
        artMatch,
      },
    });
    if (entryNotes.length) notes.push({ c, notes: entryNotes });
  }

  // Strip local-only fields from the image objects.
  for (const e of entries) {
    delete (e.artwork as any).key;
    if (e.portrait) delete (e.portrait as any).key;
  }
  await writeJson(DATA_FILE, entries);

  const target = 50;
  const report = [
    '# First Lines - collection report',
    '',
    `Generated by \`npm run content:assemble\`. **${entries.length} entries published** from ${candidates.length} candidates (target: at least ${target}).`,
    entries.length < target ? `\n> **Shortfall: ${target - entries.length} entries below the target.** See "Left out" for what each one needs.\n` : '',
    '## Published',
    '',
    '| # | Book | Year | Line check | Artwork | Portrait |',
    '|---|---|---|---|---|---|',
    ...entries.map((e, i) =>
      `| ${i + 1} | ${e.title} - ${e.author} ([#${e.gutenbergId}](${e.readUrl})) | ${e.year} | ${e.provenance.lineCheck.startsWith('matches') ? 'Wikidata P1922' : 'reviewed'} | [${e.artwork.title.replace(/\|/g, '/')}](${e.artwork.sourceUrl}), ${e.artwork.artist}, ${e.artwork.date} - ${e.provenance.artMatch.startsWith('reviewed') ? 'reviewed' : 'auto'} | ${e.portrait ? e.portrait.license : '-'} |`,
    ),
    '',
    '## Published with notes',
    '',
    ...(notes.length ? notes.map((n) => `- **${n.c.title}** (#${n.c.gutenbergId}): ${n.notes.join('; ')}`) : ['None.']),
    '',
    '## Left out',
    '',
    ...(left.length ? left.map((l) => `- **${l.c.title}** (#${l.c.gutenbergId}): ${l.reasons.join('; ')}`) : ['None.']),
    '',
  ].join('\n');
  await writeFile(FILES.report, report, 'utf8');
  log('assemble', `${entries.length} entries written to src/data/first-lines.json; ${left.length} left out (see content/REPORT.md)`);
  if (entries.length < target) log('assemble', `SHORTFALL: ${target - entries.length} below the target of ${target}`);
}

if (import.meta.main) await main();
