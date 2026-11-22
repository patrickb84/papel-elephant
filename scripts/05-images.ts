// Step 5 - download, optimise and cache the artwork and portraits.
//
// Originals are cached in .cache/http (safe to delete). The site gets WebP
// files in public/first-lines/:
//   art/<museum>-<id>-1800.webp   large painting (long side ≤ 1800px)
//   art/<museum>-<id>-900.webp    small painting, for phones and placeholders
//   portraits/<file>-320.webp     author portrait
// Each image also gets its average colour, used as the loading background.
// Existing outputs are reused; pass --force to rebuild them.
//
//   node scripts/05-images.ts [--force] [gutenbergId ...]

import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { fetchBuffer, mapLimit } from './lib/http.ts';
import { FILES, PUBLIC_IMG_DIR } from './lib/paths.ts';
import type { ArtResult, ImagesResult, LocalImage, MetadataResult } from './lib/types.ts';
import { log, readJson, slugify, writeJson } from './lib/util.ts';

sharp.cache(false);

const force = process.argv.includes('--force');
const only = process.argv.slice(2).map(Number).filter(Boolean);

const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');

async function make(url: string, key: string, dir: 'art' | 'portraits', sizes: [number, number]): Promise<LocalImage & { key: string; sourceWidth: number; sourceHeight: number }> {
  const outDir = path.join(PUBLIC_IMG_DIR, dir);
  await mkdir(outDir, { recursive: true });
  const [big, small] = sizes;
  const bigFile = path.join(outDir, `${key}-${big}.webp`);
  const smallFile = path.join(outDir, `${key}-${small}.webp`);

  const original = await fetchBuffer(url, { timeout: 180_000 });
  const img = sharp(original, { limitInputPixels: false }).rotate();
  const meta = await img.metadata();
  if (!meta.width || !meta.height) throw new Error(`not an image: ${url}`);

  if (force || !existsSync(bigFile)) {
    await sharp(original, { limitInputPixels: false }).rotate()
      .resize({ width: big, height: big, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 }).toFile(bigFile);
  }
  if (force || !existsSync(smallFile)) {
    await sharp(original, { limitInputPixels: false }).rotate()
      .resize({ width: small, height: small, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 74 }).toFile(smallFile);
  }
  const out = await sharp(bigFile).metadata();
  const { channels } = await sharp(smallFile).stats();
  const color = `#${toHex(channels[0].mean)}${toHex(channels[1].mean)}${toHex(channels[2].mean)}`;
  return {
    key,
    src: `/first-lines/${dir}/${key}-${big}.webp`,
    srcSmall: `/first-lines/${dir}/${key}-${small}.webp`,
    width: out.width!,
    height: out.height!,
    color,
    sourceWidth: meta.width,
    sourceHeight: meta.height,
  };
}

async function main() {
  const art = await readJson<ArtResult[]>(FILES.artwork);
  const metadata = new Map((await readJson<MetadataResult[]>(FILES.metadata)).map((m) => [m.gutenbergId, m]));
  const previous = await readJson<ImagesResult[]>(FILES.images, []);
  const byId = new Map(previous.map((r) => [r.gutenbergId, r]));
  const todo = art.filter((a) => !only.length || only.includes(a.gutenbergId));

  const results = await mapLimit(todo, 3, async (a): Promise<ImagesResult> => {
    const flags: string[] = [];
    const r: ImagesResult = { gutenbergId: a.gutenbergId, flags };
    if (a.chosen) {
      try {
        const img = await make(a.chosen.imageUrl, `${a.chosen.museum}-${a.chosen.id}`, 'art', [1800, 900]);
        if (Math.max(img.sourceWidth, img.sourceHeight) < 1200) flags.push(`art-low-resolution-${img.sourceWidth}x${img.sourceHeight}`);
        r.artwork = { key: img.key, src: img.src, srcSmall: img.srcSmall, width: img.width, height: img.height, color: img.color };
      } catch (err) {
        flags.push('art-download-failed');
        log('images', `${a.gutenbergId} art FAILED: ${(err as Error).message.slice(0, 120)}`);
      }
    }
    const portrait = metadata.get(a.gutenbergId)?.author?.portrait;
    if (portrait) {
      try {
        const key = slugify(portrait.file.replace(/\.[a-z]+$/i, ''));
        const img = await make(portrait.thumbUrl, key, 'portraits', [480, 160]);
        r.portrait = { key: img.key, src: img.src, srcSmall: img.srcSmall, width: img.width, height: img.height, color: img.color };
      } catch (err) {
        flags.push('portrait-download-failed');
        log('images', `${a.gutenbergId} portrait FAILED: ${(err as Error).message.slice(0, 120)}`);
      }
    }
    log('images', `${a.gutenbergId}: ${r.artwork ? 'art' : '-'} ${r.portrait ? 'portrait' : '-'} ${flags.join(' ')}`);
    return r;
  });
  for (const r of results) byId.set(r.gutenbergId, r);
  await writeJson(FILES.images, art.map((a) => byId.get(a.gutenbergId)).filter(Boolean));
  log('images', `done: ${results.filter((r) => r.artwork).length} artworks, ${results.filter((r) => r.portrait).length} portraits`);
}

if (import.meta.main) await main();
