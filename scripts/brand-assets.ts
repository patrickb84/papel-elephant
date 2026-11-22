// Build the web brand images in public/brand/ from the source logos in assets/.
//
//   node scripts/brand-assets.ts
//
//   elephant-mask.png   the line elephant (assets/EllyWhite.png), trimmed, used
//                       as a CSS mask so the header can colour it per theme
//   nested-mark.webp    the gold nested elephant (assets/NestedLogo1.png) for the About page
//   (site icons are built separately by scripts/favicons.ts)
//   og-image.png        the gold wordmark (assets/PEPplayfair (1).png) on ink, for link previews
//   florals/*.png       line drawings from assets/FLORALS & ELEMENTS/BLACK, trimmed and
//                       downsized, used as CSS masks (src/components/Floral.astro)

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { ROOT } from './lib/paths.ts';

const SRC = path.join(ROOT, 'assets');
const OUT = path.join(ROOT, 'public', 'brand');
const INK = '#1c1a17';

await mkdir(OUT, { recursive: true });

await sharp(path.join(SRC, 'EllyWhite.png')).trim().resize({ height: 240 }).png({ compressionLevel: 9 }).toFile(path.join(OUT, 'elephant-mask.png'));
await sharp(path.join(SRC, 'NestedLogo1.png')).trim().resize(900, 900, { fit: 'inside' }).webp({ quality: 86 }).toFile(path.join(OUT, 'nested-mark.webp'));

const word = await sharp(path.join(SRC, 'PEPplayfair (1).png')).trim().resize(900).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: INK } })
  .composite([{ input: word, gravity: 'center' }])
  .png()
  .toFile(path.join(OUT, 'og-image.png'));

// Botanical line drawings: only the alpha channel matters (they're CSS masks),
// so each is trimmed and downsized; thin lines stay delicate at this size.
// [element number, rotation]. The *-rule drawings are turned to lie along a
// section's hairline (src/components/FloralRule.astro).
const FLORALS: Record<string, [number, number]> = {
  sprig: [4, 0], branch: [3, 0], stem: [5, 0], leaves: [13, 0], vine: [18, 0], pen: [30, 0],
  'vine-rule': [18, 90], 'sprig-rule': [13, 90], 'stem-rule': [14, 90], seedling: [28, 0],
};
await mkdir(path.join(OUT, 'florals'), { recursive: true });
for (const [name, [n, deg]] of Object.entries(FLORALS)) {
  const file = path.join(SRC, 'FLORALS & ELEMENTS', 'BLACK', `BLACK_ELEMENT-${String(n).padStart(2, '0')}.png`);
  const turned = await sharp(file).rotate(deg, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await sharp(turned).trim().resize(700, 700, { fit: 'inside' }).png({ compressionLevel: 9, palette: true }).toFile(path.join(OUT, 'florals', `${name}.png`));
}

console.log('brand assets written to public/brand/');
