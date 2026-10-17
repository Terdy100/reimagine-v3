/*
  run-page.js - boots trotro.html's real inline script in a sandbox and
  simulates full user journeys (search -> pick -> route rendered).
  Used to find runtime errors that unit tests cannot see. Not shipped.
*/
const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync(__dirname + '/trotro.html', 'utf8');

// --- extract the main inline script (the one after trotro-pricing.js) -----
const lines = html.split('\n');
let startLine = -1;
lines.forEach((l, i) => { if (i > 150 && l.trim() === '<script>') startLine = i; });
let endLine = -1;
for (let i = lines.length - 1; i > startLine; i--) { if (lines[i].includes('</script>')) { endLine = i; break; } }
const mainSrc = lines.slice(startLine + 1, endLine).join('\n');
if (startLine < 0 || endLine < 0) { console.log('EXTRACT FAIL'); process.exit(1); }

const sleep = ms => new Promise(r => setTimeout(r, ms));

// --- element / DOM stubs ---------------------------------------------------
function makeEl(tag, id) {
  const listeners = {};
  const el = {
    tagName: String(tag || 'div').toUpperCase(), id: id || '', className: '', title: '',
    style: {}, dataset: {}, children: [], _q: {}, value: '', textContent: '',
    _innerHTML: '', onclick: null, parentNode: null,
    get innerHTML() { return this._innerHTML; },
    set innerHTML(v) { this._innerHTML = String(v); if (v === '') this.children.length = 0; },
    appendChild(c) { this.children.push(c); if (c) c.parentNode = this; return c; },
    append(...cs) { cs.forEach(c => { if (c && typeof c === 'object') this.children.push(c); }); },
    removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); },
    remove() { if (this.parentNode) this.parentNode.removeChild(this); },
    addEventListener(t, fn) { (listeners[t] = listeners[t] || []).push(fn); },
    removeEventListener(t, fn) { if (listeners[t]) listeners[t] = listeners[t].filter(f => f !== fn); },
    dispatch(t, ev) { (listeners[t] || []).slice().forEach(fn => fn(ev || {})); },
    querySelector(sel) { if (!this._q[sel]) this._q[sel] = makeEl('div'); return this._q[sel]; },
    querySelectorAll() { return []; },
    setAttribute(k, v) { this['attr_' + k] = v; }, getAttribute(k) { return this['attr_' + k] ?? null; },
    hasAttribute(k) { return ('attr_' + k) in this; },
    focus() {}, blur() {}, click() { if (this.onclick) this.onclick(); },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 }; },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } }
  };
  return el;
}
const elements = new Map();
const documentStub = {
  getElementById(id) { if (!elements.has(id)) elements.set(id, makeEl('div', id)); return elements.get(id); },
  createElement(tag) { return makeEl(tag); },
  createTextNode(t) { const n = makeEl('#text'); n.textContent = t; return n; },
  addEventListener() {}, removeEventListener() {},
  body: makeEl('body'), documentElement: makeEl('html'),
  querySelector() { return null; }, querySelectorAll() { return []; }
};

// --- maplibre stubs --------------------------------------------------------
class MapStub {
  constructor(opts) { this.opts = opts; this._h = {}; this._src = {}; this._lay = {}; MapStub.last = this; }
  on(t, fn) { (this._h[t] = this._h[t] || []).push(fn); }
  once(t, fn) { this.on(t, fn); }
  fire(t) { (this._h[t] || []).slice().forEach(fn => fn()); }
  addControl() {} flyTo() {} fitBounds() {} setCenter() {} getCenter() { return { lng: 0, lat: 0 }; }
  getSource(id) { return this._src[id] || null; } addSource(id, s) { this._src[id] = Object.assign({ setData() {} }, s || {}); } removeSource(id) { delete this._src[id]; }
  getLayer(id) { return this._lay[id] || null; } addLayer(l) { this._lay[l.id] = l; } removeLayer(id) { delete this._lay[id]; }
  getCanvas() { return { style: {}, addEventListener() {} }; }
  remove() {} resize() {}
}
class MarkerStub { setLngLat() { return this; } setPopup() { return this; } addTo() { return this; } remove() { return this; } }
class PopupStub { setLngLat() { return this; } setHTML() { return this; } setDOMContent() { return this; } addTo() { return this; } remove() {} }
class NavigationControlStub {}
class LngLatBoundsStub { extend() { return this; } }
// --- scenario runner -------------------------------------------------------
async function scenario(name, opts) {
  console.log('\n=== ' + name + ' ===');
  elements.clear(); // fresh DOM per scenario
  const errs = [];
  const sandbox = {
    console, setTimeout, clearTimeout, setInterval, clearInterval,
    Promise, URLSearchParams, AbortController, Date, Math, JSON,
    encodeURIComponent, decodeURIComponent, parseInt, parseFloat, isNaN, isFinite,
    document: documentStub,
    maplibregl: opts.noMaplibre ? undefined : {
      Map: MapStub, Marker: MarkerStub, Popup: PopupStub,
      NavigationControl: NavigationControlStub, LngLatBounds: LngLatBoundsStub
    },
    navigator: {
      geolocation: {
        getCurrentPosition(ok, err) {
          if (opts.geo === 'grant') setTimeout(() => ok({ coords: { latitude: opts.lat, longitude: opts.lon, accuracy: 25 }, timestamp: Date.now() }), 0);
          else setTimeout(() => err({ code: 1, message: 'User denied Geolocation' }), 0);
        },
        watchPosition(ok, err) {
          if (opts.geo === 'grant') { setTimeout(() => ok({ coords: { latitude: opts.lat, longitude: opts.lon, accuracy: 25 }, timestamp: Date.now() }), 0); return 1; }
          setTimeout(() => err({ code: 1, message: 'User denied Geolocation' }), 0); return 2;
        },
        clearWatch() {}
      }
    },
    fetch: async (url) => {
      if (/nominatim\.openstreetmap\.org\/search|photon\.komoot/.test(String(url)))
        return { ok: true, json: async () => [] };
      if (/router\.project-osrm/.test(String(url))) throw new Error('OSRM offline');
      throw new Error('offline: ' + String(url).slice(0, 60));
    },
    location: { href: 'file:///trotro.html', protocol: 'file:' },
    addEventListener() {}, removeEventListener() {}
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  vm.createContext(sandbox);
  const run = (label, src) => {
    try { vm.runInContext(src, sandbox, { filename: label }); }
    catch (e) { errs.push(label + ': ' + e.message); }
  };
  run('ghana_all_stops.js', fs.readFileSync(__dirname + '/ghana_all_stops.js', 'utf8'));
  run('trotro-network.js', fs.readFileSync(__dirname + '/trotro-network.js', 'utf8'));
  run('trotro-pricing.js', fs.readFileSync(__dirname + '/trotro-pricing.js', 'utf8'));
  if (errs.length) { console.log('BOOT ERRORS: ' + JSON.stringify(errs)); if (opts.noMaplibre) return; }

  try { vm.runInContext(mainSrc, sandbox, { filename: 'inline-main.js' }); }
  catch (e) { console.log('MAIN SCRIPT BOOT FAILED -> ' + e.constructor.name + ': ' + e.message); return; }
  console.log('boot OK');

  if (!opts.noMaplibre && MapStub.last) MapStub.last.fire('load');
  await sleep(120); // geolocation + reverse-geocode catch

  const searchEl = documentStub.getElementById('search');
  const startEl = documentStub.getElementById('startSearch');
  const resultsEl = documentStub.getElementById('results');
  const routeTitle = documentStub.getElementById('routeTitle');
  const routeMeta = documentStub.getElementById('routeMeta');
  const journeyEl = documentStub.getElementById('journey');
  const headline = documentStub.getElementById('headline');

  async function searchAndPick(inputEl, q) {
    inputEl.dispatch('focus');                 // sets activeInput
    inputEl.value = q;
    inputEl.dispatch('keydown', { key: 'Enter', preventDefault() {} }); // doSearch
    await sleep(150);
    const rows = resultsEl.children.filter(c => c.onclick);
    if (!rows.length) {
      console.log('  search "' + q + '": NO RESULTS (msg=' + JSON.stringify(resultsEl.innerHTML.slice(0, 90)) + ')');
      return false;
    }
    const hit = rows.find(r => (r.querySelector('.result-name').textContent || '').toLowerCase() === q.toLowerCase()) || rows[0];
    console.log('  search "' + q + '": picked row "' + hit.querySelector('.result-name').textContent + '"');
    try { hit.onclick(); } catch (e) { console.log('  row.onclick THREW ' + e.message); return false; }
    await sleep(400); // selectPlace -> hydrate (osrm rejects) -> render
    return true;
  }

  if (opts.typeStart) await searchAndPick(startEl, opts.typeStart);
  await searchAndPick(searchEl, opts.dest);

  console.log('  headline: ' + JSON.stringify(headline.textContent));
  console.log('  routeTitle: ' + JSON.stringify(routeTitle.textContent));
  console.log('  routeMeta: ' + JSON.stringify(routeMeta.textContent).slice(0, 140));
  console.log('  journey children: ' + journeyEl.children.length + (journeyEl.innerHTML ? ' innerHTML:' + JSON.stringify(journeyEl.innerHTML.slice(0, 80)) : ''));
  const rendered = journeyEl.children.length > 0 && !/No trotro|Location unavailable|Route data unavailable|Working out/.test(routeTitle.textContent);
  if (opts.expectGuidance) {
    const guided = /Where are you starting from/.test(headline.textContent);
    console.log(guided ? '  GUIDANCE SHOWN OK (no silent dead-end)' : '  *** WRONG: expected guidance, got ' + JSON.stringify(headline.textContent));
    if (errs.length) console.log('  errors: ' + JSON.stringify(errs));
    return guided;
  }
  console.log(rendered ? '  ROUTE RENDERED OK' : '  *** NO ROUTE ***');
  if (errs.length) console.log('  errors: ' + JSON.stringify(errs));
  return rendered;
}

process.on('unhandledRejection', e => console.log('UNHANDLED REJECTION: ' + (e && e.message)));
process.on('uncaughtException', e => console.log('UNCAUGHT: ' + e.message));

(async () => {
  const a = await scenario('A: GPS granted at Labadi, search Ablekuma', { geo: 'grant', lat: 5.567, lon: -0.283, dest: 'Ablekuma' });
  const b = await scenario('B: GPS DENIED, type start Circle, search Ablekuma', { geo: 'deny', typeStart: 'Circle', dest: 'Ablekuma' });
  const c = await scenario('C: maplibre CDN missing (boot failure probe)', { geo: 'deny', dest: 'Ablekuma', noMaplibre: true });
  const d = await scenario('D: GPS DENIED, no start typed, search Ablekuma (expect guidance)', { geo: 'deny', dest: 'Ablekuma', expectGuidance: true });
  console.log('\nRESULT: A=' + a + ' B=' + b + ' C=' + (c === undefined ? 'boot-failed (CDN down => page dead)' : c) + ' D=' + d);
})();
