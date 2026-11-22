// Build the site icons from the line elephant (assets/EllyWhite.png).
//
//   node scripts/favicons.ts
//
// The elephant is drawn in hairlines, which vanish at tab size, so each icon
// thickens the lines to suit its size before scaling down:
//
//   public/favicon.ico              16, 32 and 48 px, for browser tabs (browsers also ask for /favicon.ico)
//   public/brand/favicon-32.png     the 32 px tab icon as a PNG
//   public/brand/apple-touch-icon.png  180 px, iOS home screen (iOS rounds the corners)
//   public/brand/icon-192.png, icon-512.png  for the web app manifest
//   public/brand/icon-maskable-512.png       the same with Android's safe-zone padding
//   public/site.webmanifest
//
// Gold elephant on ink, the same pairing as the link-preview image.

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { ROOT } from './lib/paths.ts';

const SOURCE = path.join(ROOT, 'assets', 'EllyWhite.png');
const PUBLIC = path.join(ROOT, 'public');
const BRAND = path.join(PUBLIC, 'brand');
const INK = '#1c1a17';
const WORK = 512; // every icon is drawn at this size, then scaled down

/** A gold square with a diagonal sheen, like the foil on the logo. */
const gold = (size: number) =>
  sharp(
    Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#d9b768"/><stop offset="0.5" stop-color="#f0d999"/><stop offset="1" stop-color="#c49a4a"/>
      </linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`),
  ).removeAlpha();

/** Grow every opaque pixel of a one-channel mask into a disc of radius `r`. */
function dilate(mask: Buffer, size: number, r: number) {
  const out = Buffer.alloc(mask.length);
  const disc: [number, number][] = [];
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r) disc.push([dx, dy]);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v = mask[y * size + x];
      if (v < 96) continue;
      for (const [dx, dy] of disc) {
        const xx = x + dx, yy = y + dy;
        if (xx >= 0 && yy >= 0 && xx < size && yy < size) out[yy * size + xx] = 255;
      }
    }
  }
  return out;
}

/**
 * The elephant in gold, `scale` of the canvas wide, with each line thickened
 * by `thicken` pixels (at the 512 px working size). Each step runs as its own
 * pass, since sharp applies operations in a fixed order, not call order.
 */
async function elephant(scale: number, thicken: number) {
  const inner = Math.round(WORK * scale);
  const pad = Math.round((WORK - inner) / 2);
  const clear = { r: 0, g: 0, b: 0, alpha: 0 };
  const placed = await sharp(SOURCE)
    .trim()
    .resize(inner, inner, { fit: 'contain', background: clear })
    .extend({ top: pad, bottom: WORK - inner - pad, left: pad, right: WORK - inner - pad, background: clear })
    .png()
    .toBuffer();
  let alpha = await sharp(placed).extractChannel('alpha').raw().toBuffer();
  if (thicken > 0) {
    // Grow the strokes, then soften the stair-steps a touch before scaling down.
    alpha = await sharp(dilate(alpha, WORK, thicken), { raw: { width: WORK, height: WORK, channels: 1 } })
      .blur(0.7)
      .extractChannel(0) // blur hands back three channels; keep one
      .raw()
      .toBuffer();
  }
  const rgb = await gold(WORK).raw().toBuffer();
  return sharp(rgb, { raw: { width: WORK, height: WORK, channels: 3 } })
    .joinChannel(alpha, { raw: { width: WORK, height: WORK, channels: 1 } })
    .png()
    .toBuffer();
}

/** Ink ground, square or with rounded corners, with the elephant on it. */
async function icon(opts: { scale: number; thicken: number; radius: number }) {
  const r = Math.round(WORK * opts.radius);
  const ground = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WORK}" height="${WORK}"><rect width="${WORK}" height="${WORK}" rx="${r}" fill="${INK}"/></svg>`,
  );
  return sharp(ground)
    .composite([{ input: await elephant(opts.scale, opts.thicken) }])
    .png()
    .toBuffer();
}

const at = (image: Buffer, size: number) => sharp(image).resize(size, size, { kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toBuffer();

/** A .ico file holding PNG images (supported by every current browser). */
function ico(images: { size: number; png: Buffer }[]) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4); // colour planes
    header.writeUInt16LE(32, e + 6); // bits per pixel
    header.writeUInt32LE(png.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.png)]);
}

// Tab icons: big, bold lines on a rounded tile so they hold up at 16 px.
const tab = await icon({ scale: 0.84, thicken: 9, radius: 0.22 });
const tabSizes = await Promise.all([16, 32, 48].map(async (size) => ({ size, png: await at(tab, size) })));
await writeFile(path.join(PUBLIC, 'favicon.ico'), ico(tabSizes));
await writeFile(path.join(BRAND, 'favicon-32.png'), tabSizes[1].png);

// Larger icons keep more of the drawing's delicacy.
const large = await icon({ scale: 0.72, thicken: 2, radius: 0 });
await writeFile(path.join(BRAND, 'apple-touch-icon.png'), await at(large, 180));
await writeFile(path.join(BRAND, 'icon-192.png'), await at(large, 192));
await writeFile(path.join(BRAND, 'icon-512.png'), await at(large, 512));
// Maskable: Android may crop to a circle, so the elephant stays inside the middle 80%.
await writeFile(path.join(BRAND, 'icon-maskable-512.png'), await at(await icon({ scale: 0.56, thicken: 3, radius: 0 }), 512));

const manifest = {
  name: 'Paper Elephant Publishing',
  short_name: 'Paper Elephant',
  icons: [
    { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/brand/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
  background_color: '#f5f0e6',
  theme_color: '#f5f0e6',
  display: 'browser',
};
await writeFile(path.join(PUBLIC, 'site.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');

console.log('icons written to public/ and public/brand/');
