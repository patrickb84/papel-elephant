import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { FILES } from './paths.ts';
import type { Config, Overrides, Reviews } from './types.ts';

export async function readJson<T>(file: string, fallback?: T): Promise<T> {
  if (!existsSync(file)) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing ${path.relative(process.cwd(), file)} - run the earlier pipeline step first.`);
  }
  return JSON.parse(await readFile(file, 'utf8')) as T;
}

export async function writeJson(file: string, data: unknown) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

export const sha1 = (s: string) => createHash('sha1').update(s).digest('hex').slice(0, 12);

export function slugify(s: string) {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');
}

/** "Austen, Jane" -> "Jane Austen"; "Twain, Mark, 1835-1910" handled too. */
export function displayName(gutendexName: string) {
  const parts = gutendexName.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    // "Doyle, Arthur Conan" ; "Shelley, Mary Wollstonecraft" ; "Dumas, Alexandre (père)"
    const given = parts.slice(1).join(' ').replace(/\s*\(([^)]*)\)\s*/g, ' ').trim();
    return `${given} ${parts[0]}`.replace(/\s+/g, ' ');
  }
  return gutendexName;
}

/** Fold accents and case, drop punctuation: for fuzzy comparison. */
export function fold(s: string) {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const loadConfig = () => readJson<Config>(FILES.config);
export const loadOverrides = () =>
  readJson<Overrides>(FILES.overrides, { exclude: {}, include: [], books: {} });
export const loadReviews = () => readJson<Reviews>(FILES.reviews, { lines: {}, art: {}, portraits: {} });

export function log(step: string, msg: string) {
  console.log(`[${step}] ${msg}`);
}

export function byId<T extends { gutenbergId: number }>(rows: T[]) {
  return new Map(rows.map((r) => [r.gutenbergId, r]));
}

/**
 * Tidy a Commons "Artist" field. Its {{Unknown|author}} template renders as
 * "Unknown author Unknown author" once the HTML is stripped; show that, and
 * the other "Unknown" variants, as a plain "unknown artist".
 */
export function cleanArtist(s: string | undefined) {
  if (!s) return s;
  return s
    .replace(/^(?:unknown(?:\s+author)?\s*)+/i, 'unknown artist ')
    .replace(/\s+,/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
}
