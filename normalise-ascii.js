/*
  Normalises the trotro source files to pure ASCII.

  These files get edited by tools and shells that disagree about encoding
  (PowerShell, VS Code, git), which has already corrupted non-ASCII
  characters twice. ASCII-only source cannot be corrupted again, so every
  typographic character is replaced with a plain ASCII equivalent.

      node normalise-ascii.js              # normalise all three trotro files
      node normalise-ascii.js --check      # report only, change nothing
      node normalise-ascii.js foo.html     # normalise specific files
*/
const fs = require('fs');

const REPLACEMENTS = {
  '\u2014': '--',    // em dash
  '\u2013': '-',     // en dash
  '\u2018': "'", '\u2019': "'",
  '\u201C': '"', '\u201D': '"',
  '\u2026': '...',   // ellipsis
  '\u2192': '->',    // right arrow
  '\u00b7': '|',     // middle dot
  '\u2022': '*',     // bullet
  '\u00a2': '',      // cent sign: currency is written GHS in code
  '\u20ac': 'EUR',
  '\u00e9': 'e', '\u00e8': 'e', '\u00ea': 'e',
  '\u00ed': 'i', '\u00ee': 'i',
  '\u00e1': 'a', '\u00e0': 'a',
  '\u00f3': 'o', '\u00f2': 'o',
  '\u00fa': 'u', '\u00fc': 'u',
  '\u00f1': 'n'
};

const DEFAULT_FILES = ['trotro.html', 'trotro-pricing.js', 'trotro-network.js'];

const checkOnly = process.argv.includes('--check');
const named = process.argv.slice(2).filter(a => !a.startsWith('--'));
const targets = named.length ? named : DEFAULT_FILES;

let problem = false;
let failed = false;

for (const path of targets) {
  let source = fs.readFileSync(path, 'utf8');

  // strip a UTF-8 BOM if one crept in
  if (source.charCodeAt(0) === 0xfeff) source = source.slice(1);

  const seen = new Map();
  const unmapped = new Map();
  let ascii = '';
  for (const ch of source) {
    if (ch.codePointAt(0) < 128) { ascii += ch; continue; }
    problem = true;
    seen.set(ch, (seen.get(ch) || 0) + 1);
    if (REPLACEMENTS[ch] === undefined) {
      // A character with no mapping is not cosmetic. Em dashes and cent signs
      // have obvious ASCII equivalents; emoji and accented letters do not, and
      // writing '?' over them silently destroyed a whole set of result icons
      // once already. Record them so the file is never written blind.
      unmapped.set(ch, (unmapped.get(ch) || 0) + 1);
      ascii += '?';
    } else {
      ascii += REPLACEMENTS[ch];
    }
  }

  const fmt = m => [...m.entries()]
    .map(([ch, n]) => 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0') + ' x' + n)
    .join(', ');
  const detail = fmt(seen);
  const detailUnmapped = fmt(unmapped);

  if (!seen.size) {
    console.log(path + ': already pure ASCII');
  } else if (unmapped.size) {
    // Never guess. Add the character to REPLACEMENTS above, or fix the source.
    console.error(path + ': ' + detailUnmapped + ' has NO ASCII replacement. Not written.');
    console.error(path + '    add each one to REPLACEMENTS, then re-run. Nothing was changed.');
    failed = true;
  } else if (checkOnly) {
    console.log(path + ': ' + detail);
  } else {
    fs.writeFileSync(path, ascii, 'utf8');
    console.log(path + ': replaced ' + detail);
  }
}

if (failed) process.exitCode = 1;
if (checkOnly && problem) process.exitCode = 1;