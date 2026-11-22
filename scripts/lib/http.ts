// HTTP helpers for the content pipeline: polite rate limiting, retries with
// backoff, and an on-disk response cache so re-running a step is cheap and
// does not hammer the source APIs.

import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { CACHE_DIR } from './paths.ts';

// A generic client name. Wikimedia asks for an identifying User-Agent; this
// one names the tool without sending anything personal.
export const USER_AGENT = 'FirstLinesContentBuilder/1.0 (static-site content pipeline; node fetch)';

const lastCall = new Map<string, number>();

/** Minimum gap between requests to the same host, in ms. */
const HOST_GAP: Record<string, number> = {
  'collectionapi.metmuseum.org': 60,
  'api.artic.edu': 120,
  'www.wikidata.org': 1000,
  'query.wikidata.org': 1500,
  'commons.wikimedia.org': 1000,
  'upload.wikimedia.org': 1000,
  'gutendex.com': 500,
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function throttle(url: string) {
  const host = new URL(url).host;
  const gap = HOST_GAP[host] ?? 200;
  const now = Date.now();
  // Reserve the next free slot for this host, so concurrent callers queue up.
  const slot = Math.max(now, (lastCall.get(host) ?? 0) + gap);
  lastCall.set(host, slot);
  if (slot > now) await sleep(slot - now);
}

export interface FetchOpts {
  method?: 'GET' | 'POST';
  body?: string;
  headers?: Record<string, string>;
  /** Cache the response on disk (default true). */
  cache?: boolean;
  /** Per-attempt timeout in ms. */
  timeout?: number;
  retries?: number;
}

function cacheKey(url: string, opts: FetchOpts) {
  return createHash('sha1').update(`${opts.method ?? 'GET'} ${url} ${opts.body ?? ''}`).digest('hex');
}

async function rawFetch(url: string, opts: FetchOpts): Promise<Buffer> {
  const retries = opts.retries ?? 4;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    await throttle(url);
    try {
      const res = await fetch(url, {
        method: opts.method ?? 'GET',
        body: opts.body,
        headers: { 'User-Agent': USER_AGENT, 'Api-User-Agent': USER_AGENT, 'AIC-User-Agent': USER_AGENT, ...opts.headers },
        signal: AbortSignal.timeout(opts.timeout ?? 60_000),
        redirect: 'follow',
      });
      if (res.status === 404) throw Object.assign(new Error(`404 ${url}`), { status: 404 });
      if (res.status === 429 || res.status === 503) {
        // Back off as the server asks (Wikimedia sends Retry-After), and slow
        // every later request to this host as well.
        const after = Number(res.headers.get('retry-after')) || 10 * (attempt + 1);
        const host = new URL(url).host;
        HOST_GAP[host] = Math.min(5000, (HOST_GAP[host] ?? 200) * 2);
        console.warn(`  ${res.status} from ${host}; waiting ${after}s`);
        await sleep(after * 1000);
        throw Object.assign(new Error(`HTTP ${res.status} ${url}`), { status: res.status });
      }
      if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status} ${url}`), { status: res.status });
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      lastErr = err;
      if ((err as { status?: number }).status === 404) break; // not worth retrying
      const backoff = 1000 * 2 ** attempt + Math.random() * 500;
      if (attempt < retries) await sleep(backoff);
    }
  }
  throw lastErr;
}

/** Fetch bytes, served from the disk cache when available. */
export async function fetchBuffer(url: string, opts: FetchOpts = {}): Promise<Buffer> {
  const useCache = opts.cache ?? true;
  const file = path.join(CACHE_DIR, 'http', cacheKey(url, opts));
  if (useCache && existsSync(file)) return readFile(file);
  const buf = await rawFetch(url, opts);
  if (useCache) {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, buf);
  }
  return buf;
}

export async function fetchText(url: string, opts: FetchOpts = {}): Promise<string> {
  return (await fetchBuffer(url, opts)).toString('utf8');
}

export async function fetchJson<T = any>(url: string, opts: FetchOpts = {}): Promise<T> {
  const text = await fetchText(url, opts);
  try {
    return JSON.parse(text) as T;
  } catch {
    // An error or bot-challenge page served with status 200 must not stay in
    // the cache and poison later runs.
    await rm(path.join(CACHE_DIR, 'http', cacheKey(url, opts)), { force: true });
    throw new Error(`Non-JSON response from ${url}: ${text.slice(0, 120)}`);
  }
}

/** Fetch the first URL in the list that answers. */
export async function fetchFirst(urls: string[], opts: FetchOpts = {}): Promise<{ url: string; text: string }> {
  const errors: string[] = [];
  for (const url of urls) {
    try {
      return { url, text: await fetchText(url, { retries: 1, ...opts }) };
    } catch (err) {
      errors.push(String((err as Error).message));
    }
  }
  throw new Error(`All sources failed:\n  ${errors.join('\n  ')}`);
}

/** Run an async mapper over items with bounded concurrency. */
export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
}
