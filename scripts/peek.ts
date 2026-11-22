// Search a book's Project Gutenberg text, for writing overrides.
//
//   node scripts/peek.ts <gutenbergId> [regex] [lines-of-context]
//
// With no regex it prints the first 60 lines after the Gutenberg header.

import { fetchFirst } from './lib/http.ts';
import { stripBoilerplate } from './02-opening-lines.ts';
import { textUrls } from './01-discover.ts';

const [id, pattern, ctx = '2'] = process.argv.slice(2);
if (!id) {
  console.error('usage: node scripts/peek.ts <gutenbergId> [regex] [context]');
  process.exit(1);
}
const { url, text } = await fetchFirst(textUrls(Number(id)));
const { body } = stripBoilerplate(text);
const lines = body.split('\n');
console.log(`# ${url}`);
if (!pattern) {
  console.log(lines.slice(0, 60).join('\n'));
} else {
  const re = new RegExp(pattern, 'i');
  let shown = 0;
  lines.forEach((l, i) => {
    if (shown < 5 && re.test(l)) {
      shown++;
      const n = Number(ctx);
      console.log(`--- line ${i}`);
      console.log(lines.slice(Math.max(0, i - n), i + n + 1).join('\n'));
    }
  });
}
