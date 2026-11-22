// Run the whole content pipeline in order. Every step caches its downloads,
// so re-running is cheap; delete .cache/ to fetch everything fresh.
//
//   node scripts/run-all.ts [--from=3]       start at a later step
//   node scripts/run-all.ts --source=catalog  passed through to step 1

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { ROOT } from './lib/paths.ts';

const steps = ['01-discover.ts', '02-opening-lines.ts', '03-metadata.ts', '04-artwork.ts', '05-images.ts', '06-assemble.ts', 'review.ts'];
const from = Number(process.argv.find((a) => a.startsWith('--from='))?.split('=')[1] ?? 1);
const source = process.argv.find((a) => a.startsWith('--source='));

for (const [i, step] of steps.entries()) {
  if (i + 1 < from) continue;
  console.log(`\n=== ${step} ===`);
  const extra = step === '01-discover.ts' && source ? [source] : [];
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts', step), ...extra], { stdio: 'inherit', cwd: ROOT });
  if (r.status !== 0) {
    console.error(`\n${step} failed (exit ${r.status}). Fix it and resume with: node scripts/run-all.ts --from=${i + 1}`);
    process.exit(r.status ?? 1);
  }
}
