// Step 2 - extract each book's opening line from its Project Gutenberg text.
//
// 1. Download the plain text (mirrors first), cut the Gutenberg header and
//    licence footer at the "*** START/END OF THE PROJECT GUTENBERG EBOOK" marks.
// 2. Find where the narrative starts: the first "Chapter I" style heading that
//    is followed by real prose (a table of contents also lists "Chapter I", but
//    is followed by more short lines), skipping prefaces, introductions,
//    contents, illustrations and transcriber's notes.
// 3. Take the first prose paragraph and its first sentence.
//
// Every result carries a confidence and flags. Nothing here is "verified";
// verification happens in 06-assemble from Wikidata's first-line property or
// an approval in content/reviews.json tied to the exact sentence.
//
//   node scripts/02-opening-lines.ts [gutenbergId ...]

import { fetchFirst, mapLimit } from './lib/http.ts';
import { FILES } from './lib/paths.ts';
import type { Candidate, Confidence, LineResult } from './lib/types.ts';
import { loadOverrides, log, readJson, sha1, writeJson } from './lib/util.ts';

// ---------------------------------------------------------------------------
// Text cleanup

export function stripBoilerplate(raw: string): { body: string; flags: string[] } {
  const flags: string[] = [];
  let text = raw.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const start = text.search(/^\*{3}\s*START OF (THE|THIS) PROJECT GUTENBERG.*$/im);
  if (start >= 0) text = text.slice(text.indexOf('\n', start) + 1);
  else {
    // Very old files: header ends at "*END*THE SMALL PRINT!..." line
    const old = text.search(/^\*END\*THE SMALL PRINT.*$/im);
    if (old >= 0) text = text.slice(text.indexOf('\n', old) + 1);
    else flags.push('no-start-marker');
  }
  const end = text.search(/^\*{3}\s*END OF (THE|THIS) PROJECT GUTENBERG.*$/im);
  if (end >= 0) text = text.slice(0, end);
  else {
    const endOld = text.search(/^End of (the )?Project Gutenberg/im);
    if (endOld >= 0) text = text.slice(0, endOld);
    else flags.push('no-end-marker');
  }
  return { body: text, flags };
}

/** Split into paragraphs, remembering each one's raw lines. */
function paragraphs(body: string) {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+$/g, ''))
    .filter((p) => p.trim().length > 0);
}

const oneLine = (p: string) => p.replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();

/** Turn Gutenberg markup into display text. */
export function cleanForDisplay(s: string) {
  return s
    .replace(/\[(Illustration|Footnote|Sidenote)[^\]]*\]/gi, '')
    .replace(/\[\d+\]/g, '') // footnote markers
    .replace(/\{\d+\}\s*/g, '') // page markers
    .replace(/(^|[\s(“"‘'—-])_([^_]+)_(?=[\s.,;:!?)”"’'—-]|$)/g, '$1$2') // _italics_
    .replace(/=([^=\n]+)=/g, '$1') // =bold=
    .replace(/(\w)--(\w)/g, '$1—$2')
    .replace(/\s?--\s?/g, '—')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Narrative start

const ROMAN = 'I|ONE|1|FIRST|THE FIRST|I\\.';
const HEADING_PATTERNS: { kind: LineResult['anchorKind']; re: RegExp }[] = [
  { kind: 'chapter', re: new RegExp(`^\\s*(CHAPTER|Chapter|CHAP\\.|Chap\\.|STAVE|Stave|LETTER|Letter)\\s+(${ROMAN})(\\b|\\.|:|$)`) },
  { kind: 'part', re: new RegExp(`^\\s*(BOOK|Book|PART|Part|VOLUME|Volume)\\s+(${ROMAN})(\\b|\\.|:|$)`) },
  { kind: 'chapter', re: /^\s*(CHAPTER|Chapter)\s+1\b/ },
  { kind: 'roman', re: /^\s*(I|1)\.?\s*$/ },
  { kind: 'roman', re: /^\s*(I|1)\.\s+[A-Z][A-Za-z ,'’\-]{2,60}\.?\s*$/ }, // "I. THE PERIOD"
];

const FRONT_MATTER = /^\s*(PREFACE|Preface|INTRODUCTION|Introduction|CONTENTS|Contents|TABLE OF CONTENTS|ILLUSTRATIONS|List of Illustrations|TRANSCRIBER|Transcriber|EDITOR|FOREWORD|Foreword|DEDICATION|PROLOGUE NOTE|NOTE|AUTHOR'S NOTE|ETYMOLOGY|EXTRACTS)\b/;

const HEADINGISH = /^\s*(CHAPTER|Chapter|CHAP\.|STAVE|Stave|BOOK|Book|PART|Part|LETTER|Letter|[IVXLC]+\.?\s|[IVXLC]+\.?$|\d+\.\s)/;

/** A paragraph that lists several headings: a table of contents. */
function isToc(p: string) {
  const lines = p.split('\n').filter((l) => l.trim());
  return lines.filter((l) => HEADINGISH.test(l)).length >= 2;
}

/** "Three invalids.—Sufferings of George and Harris.—A victim to..." */
function isChapterSummary(p: string) {
  const text = oneLine(p);
  return text.length < 700 && (text.match(/(—|--)\s*[A-Z]/g) ?? []).length >= 2 && (text.match(/\.\s*(—|--)/g) ?? []).length >= 1;
}

/** A quotation set before a chapter, usually followed by an attribution. */
function isEpigraph(p: string, next: string | undefined) {
  const lines = p.split('\n').filter((l) => l.trim());
  const last = lines[lines.length - 1]?.trim() ?? '';
  if (/^(—|--|-)\s*\S/.test(last) || /^(—|--)\s*[A-Z]/.test(next?.trim() ?? '')) return true;
  const indented = lines.filter((l) => /^\s{2,}\S/.test(l)).length;
  return indented / Math.max(1, lines.length) > 0.6;
}

/** Most words capitalised: a title, not a sentence. */
function isTitleCase(text: string) {
  const words = text.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w) && w.length > 3);
  if (words.length < 2) return true;
  return words.filter((w) => /^[A-Z]/.test(w)).length / words.length > 0.7;
}

/** Is this paragraph narrative prose (not a heading, title, list or note)? */
function isProse(p: string) {
  const lines = p.split('\n').map((l) => l.trim()).filter(Boolean);
  const text = oneLine(p);
  if (text.length < 40) return false;
  if (/^\[(Illustration|Transcriber|Footnote|Sidenote)/i.test(text)) return false;
  if (/^(Produced by|Transcribed|E-text|This e-?book|Note:)/i.test(text)) return false;
  if (/^(CHAPTER|BOOK|PART|CONTENTS)\b/.test(text)) return false;
  if (isToc(p)) return false;
  const letters = text.replace(/[^A-Za-z]/g, '');
  if (letters && letters.replace(/[^A-Z]/g, '').length / letters.length > 0.6) return false; // shouting = headings
  if (!/[.!?;:,—]["”’')\]]*$/.test(text) && lines.length < 3) return false;
  if (text.length < 120 && (text.split(/\s+/).length < 7 || isTitleCase(text))) return false;
  return /[a-z]/.test(text);
}

interface StartPoint {
  index: number; // paragraph index of the first prose paragraph
  anchor: string;
  kind: LineResult['anchorKind'];
  gap: number; // paragraphs skipped between heading and prose
}

export function findStart(paras: string[], startsWith?: string): StartPoint | null {
  if (startsWith) {
    const needle = startsWith.replace(/\s+/g, ' ').trim();
    const i = paras.findIndex((p) => oneLine(p).includes(needle));
    if (i >= 0) return { index: i, anchor: `override: "${needle.slice(0, 40)}"`, kind: 'override', gap: 0 };
  }
  for (const { kind, re } of HEADING_PATTERNS) {
    for (let i = 0; i < paras.length; i++) {
      const first = paras[i].split('\n')[0];
      if (!re.test(first)) continue;
      if (isToc(paras[i])) continue; // "Chapter I ... Chapter II ..." is a contents list
      // Look ahead a few paragraphs for prose. Chapter titles, datelines,
      // salutations ("To Mrs. Saville, England"), chapter summaries and
      // epigraphs get skipped. A contents list hits another heading first.
      for (let j = i + 1, steps = 0; j < paras.length && steps < 6; j++, steps++) {
        const p = paras[j];
        if (HEADING_PATTERNS.some((h) => h.re.test(p.split('\n')[0]))) break;
        if (isToc(p)) break;
        if (isChapterSummary(p) || isEpigraph(p, paras[j + 1])) continue;
        if (isProse(p)) return { index: j, anchor: oneLine(paras[i]).slice(0, 80), kind, gap: j - i };
      }
    }
  }
  // Fallback: first prose paragraph after skipping recognised front matter.
  let skipping = false;
  for (let i = 0; i < paras.length; i++) {
    const p = paras[i];
    if (FRONT_MATTER.test(p)) {
      skipping = true;
      continue;
    }
    if (skipping && !/^\s*[A-Z][A-Z .,'’-]{3,}$/.test(p.split('\n')[0])) continue;
    skipping = false;
    if (isProse(p)) return { index: i, anchor: '(no chapter heading)', kind: 'fallback', gap: 0 };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Sentences

const ABBREV = /\b(Mr|Mrs|Ms|Dr|St|Mt|Messrs|MM|Mme|Mlle|Jr|Sr|Capt|Col|Gen|Lt|Rev|Hon|Prof|Sir|No|vol|viz|cf|i\.e|e\.g|vs|[A-Z])\.$/i;

/** "THE YEAR 1866 was marked" -> "The year 1866 was marked": undo the
 * small-capitals convention on a chapter's first words, keeping words that
 * are capitalised elsewhere in the paragraph (names). */
const SMALL_WORDS = new Set('a an the and but or of in on at to for by with from as it is was were be i my his her its our their this that these those year day night dear dearest when while once there here after before'.split(' '));

export function unSmallCaps(sentence: string, paragraph: string) {
  const m = sentence.match(/^([“"‘']?)((?:[A-Z][A-Z'’.-]*\s+)*[A-Z][A-Z'’.-]+)(?=[\s,;:!?—]|$)/);
  if (!m || m[2].length < 2 || !/[a-z]/.test(sentence)) return sentence;
  const words = m[2].split(/\s+/);
  const rest = paragraph.slice(m[0].length);
  const fixed = words.map((w, i) => {
    const lower = w.toLowerCase();
    const title = w.charAt(0) + lower.slice(1);
    if (i === 0) return title;
    if (SMALL_WORDS.has(lower)) return lower;
    // A word written with a capital elsewhere in the paragraph is a name.
    const escaped = title.replace(/[.'’-]/g, (c) => `\\${c}`);
    return new RegExp(`(^|[^A-Za-z])${escaped}([^A-Za-z]|$)`).test(rest) ? title : lower;
  });
  return m[1] + fixed.join(' ') + sentence.slice(m[0].length);
}

/** First sentence of a paragraph (keeps closing quotes; ignores abbreviations). */
export function firstSentence(text: string): string {
  const re = /[.!?]+["”’')\]]*(?=\s+["“‘'(\[]?[A-Z0-9_—]|\s*$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const upto = text.slice(0, m.index + m[0].length);
    const head = text.slice(0, m.index + 1);
    if (ABBREV.test(head)) continue;
    // "P. M.," style times
    if (/\b[AP]\.\s?M\.$/.test(head) && /^\s+[a-z]/.test(text.slice(m.index + m[0].length))) continue;
    return upto.trim();
  }
  return text.trim();
}

// ---------------------------------------------------------------------------

function assess(start: StartPoint, sentence: string, paragraph: string, flags: string[]): Confidence {
  let score = 0;
  if (start.kind === 'chapter' || start.kind === 'override') score += 2;
  else if (start.kind === 'part' || start.kind === 'roman') score += 1;
  else flags.push('no-chapter-heading');
  if (start.gap > 2) flags.push(`skipped-${start.gap - 1}-paragraphs-after-heading`);
  if (sentence.length < 12) flags.push('very-short');
  if (sentence.length > 600) flags.push('very-long');
  if (/^[“"‘']/.test(sentence)) flags.push('opens-with-dialogue');
  if (/^\d|^[A-Z][a-z]+\.? \d{1,2}(st|nd|rd|th)?[.,]/.test(sentence)) flags.push('starts-with-date');
  if (/^(To |Dear |My dear )/.test(sentence)) flags.push('salutation');
  if (/\b(edition|translator|publisher|copyright|reprinted|this book|this volume|this work|the author)\b/i.test(paragraph))
    flags.push('mentions-book-or-edition');
  if (/[\[\]{}]|_/.test(sentence)) flags.push('markup-left');
  if (flags.some((f) => /edition|markup|salutation/.test(f))) score -= 2;
  if (score >= 2 && !flags.some((f) => /very|skipped/.test(f))) return 'high';
  return score >= 1 ? 'medium' : 'low';
}

export async function extract(c: Candidate, startsWith?: string, fixedLine?: string): Promise<LineResult> {
  const flags: string[] = [];
  let sourceUrl: string, raw: string;
  try {
    ({ url: sourceUrl, text: raw } = await fetchFirst(c.textUrls, { timeout: 90_000 }));
  } catch (err) {
    return { gutenbergId: c.gutenbergId, ok: false, error: (err as Error).message, flags: ['no-text'] };
  }
  const { body, flags: bpFlags } = stripBoilerplate(raw);
  flags.push(...bpFlags);
  const paras = paragraphs(body);
  const start = findStart(paras, startsWith);
  if (!start) return { gutenbergId: c.gutenbergId, ok: false, sourceUrl, error: 'no narrative start found', flags };

  if (startsWith && start.kind !== 'override') flags.push('override-startsWith-not-found');
  const paragraph = cleanForDisplay(oneLine(paras[start.index]));
  let sentence = unSmallCaps(cleanForDisplay(firstSentence(oneLine(paras[start.index]))), paragraph);
  if (fixedLine) {
    // An override line must still be present in the source text.
    const plain = (s: string) => cleanForDisplay(s).replace(/[“”"]/g, '"').replace(/[‘’']/g, "'").replace(/\s+/g, ' ');
    // A trailing "…" marks an abridged line: the text before it must match.
    const abridged = /\s*…$/.test(fixedLine);
    if (abridged) flags.push('abridged');
    if (!plain(oneLine(body)).toLowerCase().includes(plain(fixedLine.replace(/\s*…$/, '')).toLowerCase())) {
      return { gutenbergId: c.gutenbergId, ok: false, sourceUrl, error: 'override openingLine not found in text', flags: [...flags, 'override-not-in-text'] };
    }
    sentence = cleanForDisplay(fixedLine);
    flags.push('line-from-override');
  }
  const context = paras
    .slice(Math.max(0, start.index - 3), start.index)
    .map((p) => oneLine(p).slice(0, 100))
    .join(' ¶ ');
  const confidence = assess(start, sentence, paragraph, flags);
  return {
    gutenbergId: c.gutenbergId,
    ok: true,
    sourceUrl,
    anchor: start.anchor,
    anchorKind: start.kind,
    sentence,
    paragraph: paragraph.slice(0, 1200),
    context,
    confidence,
    flags,
    hash: sha1(sentence),
  };
}

async function main() {
  const candidates = await readJson<Candidate[]>(FILES.candidates);
  const overrides = await loadOverrides();
  const only = process.argv.slice(2).map(Number).filter(Boolean);
  const previous = await readJson<LineResult[]>(FILES.lines, []);
  const prevById = new Map(previous.map((r) => [r.gutenbergId, r]));
  const todo = only.length ? candidates.filter((c) => only.includes(c.gutenbergId)) : candidates;

  const results = await mapLimit(todo, 4, async (c) => {
    const o = overrides.books[c.gutenbergId] ?? {};
    const r = await extract(c, o.startsWith, o.openingLine);
    log('lines', `${c.gutenbergId} ${c.title}: ${r.ok ? `[${r.confidence}] ${r.sentence!.slice(0, 70)}` : `FAILED ${r.error}`}`);
    return r;
  });
  for (const r of results) prevById.set(r.gutenbergId, r);
  const ordered = candidates.map((c) => prevById.get(c.gutenbergId)).filter((r): r is LineResult => !!r);
  await writeJson(FILES.lines, ordered);
  const counts = { high: 0, medium: 0, low: 0, failed: 0 };
  for (const r of ordered) r.ok ? counts[r.confidence!]++ : counts.failed++;
  log('lines', `done: ${JSON.stringify(counts)}`);
}

if (import.meta.main) await main();
