/*
  One-off repair for characters that were destroyed by an earlier encoding
  round-trip (they had already become U+FFFD replacement characters, so they
  can no longer be recovered automatically).

  Only these are touched. Question marks that are JavaScript ternary
  operators are left alone.

      node repair-text.js
*/
const fs = require('fs');

const EDITS = {
  'trotro-pricing.js': [
    ['trotro-pricing.js  ?  Ghana public transport fare engine', 'trotro-pricing.js - Ghana public transport fare engine'],
    ['PROVENANCE ? read this', 'PROVENANCE - read this'],
    ["currency: 'GH?'", "currency: 'GHS '"],
    ['Shared taxi ? priced by distance bands', 'Shared taxi is priced by distance bands'],
    ['communiqu? describes', 'communique describes'],
    ['ROUTE OVERRIDES  ? precedence 1', 'ROUTE OVERRIDES - precedence 1'],
    ['PLACES  ? for region lookup', 'PLACES - for region lookup'],
    ["'STC' ? used when a route override", "'STC' - used when a route override"],
    ["if (amount == null) return '?';", "if (amount == null) return '-';"],
    ["+ ' ? ' +", "+ ' - ' +"],
    ['GH?', 'GHS']            // every remaining currency mention
  ],
  'trotro-network.js': [
    ['trotro-network.js ? Ghana trotro stop network', 'trotro-network.js - Ghana trotro stop network'],
    ['1. TUNING ? change these', '1. TUNING - change these']
  ],
  'trotro.html': [
    ['<span class="icon">?</span>', ''],
    ['<button id="locate" class="locate" title="Show my location">?</button>',
     '<button id="locate" class="locate" title="Show my location">Locate</button>']
  ]
};

for (const [path, pairs] of Object.entries(EDITS)) {
  let text = fs.readFileSync(path, 'utf8');
  const report = [];
  for (const [from, to] of pairs) {
    if (!text.includes(from)) continue;
    const count = text.split(from).length - 1;
    text = text.split(from).join(to);
    report.push(count + 'x ' + JSON.stringify(from.slice(0, 40)));
  }
  fs.writeFileSync(path, text, 'utf8');
  console.log(path + ': ' + (report.length ? report.join(', ') : 'no changes needed'));
}