import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
/** Downloaded API responses, book texts and original images. Safe to delete. */
export const CACHE_DIR = path.join(ROOT, '.cache');
/** Pipeline working files, overrides and review decisions (committed). */
export const CONTENT_DIR = path.join(ROOT, 'content');
export const WORK_DIR = path.join(CONTENT_DIR, 'work');
/** Optimised images served by the site. */
export const PUBLIC_IMG_DIR = path.join(ROOT, 'public', 'first-lines');
/** The collection the site reads. */
export const DATA_FILE = path.join(ROOT, 'src', 'data', 'first-lines.json');

export const FILES = {
  config: path.join(CONTENT_DIR, 'config.json'),
  overrides: path.join(CONTENT_DIR, 'overrides.json'),
  reviews: path.join(CONTENT_DIR, 'reviews.json'),
  candidates: path.join(WORK_DIR, '01-candidates.json'),
  lines: path.join(WORK_DIR, '02-lines.json'),
  metadata: path.join(WORK_DIR, '03-metadata.json'),
  artwork: path.join(WORK_DIR, '04-artwork.json'),
  images: path.join(WORK_DIR, '05-images.json'),
  report: path.join(CONTENT_DIR, 'REPORT.md'),
  reviewSheet: path.join(CONTENT_DIR, 'REVIEW.md'),
};
