const fs = require('fs');
const html = fs.readFileSync('trotro.html', 'utf8');
const ids = [...html.matchAll(/id="([a-zA-Z]+)"/g)].map(m => m[1]);
console.log('IDs in HTML: ' + JSON.stringify(ids));
const js = ['search','startSearch','results','status','headline','subline','routeInfo','routeTitle','etaMain','etaSub','etaArrival','journey','fare','routeCars','routeChange','legend','startRow','bottom','locate','searchBtn'];
const missing = js.filter(j => !ids.includes(j));
console.log('JS wants but HTML lacks: ' + JSON.stringify(missing));
// which getElementById calls exist?
const calls = [...html.matchAll(/getElementById\('([^']+)'\)/g)].map(m => m[1]);
console.log('getElementById calls: ' + JSON.stringify([...new Set(calls)]));
const missing2 = [...new Set(calls)].filter(c => !ids.includes(c));
console.log('calls with no element: ' + JSON.stringify(missing2));
