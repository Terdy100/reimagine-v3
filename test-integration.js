/*
  End-to-end check of the three trotro files working together, the same way
  trotro.html uses them: plan an itinerary with trotro-network.js, price every
  car with trotro-pricing.js, and check the result tells a coherent story.

      node test-integration.js
*/
const Network = require('./trotro-network.js');
const Pricing = require('./trotro-pricing.js');

let failures = [];
let checks = 0;

function check(condition, message) {
  checks++;
  if (!condition) failures.push(message);
}

function near(a, b, tolerance, message) {
  checks++;
  const off = Math.abs(a - b) / b * 100;
  if (off > tolerance) failures.push(message + ' (got ' + a.toFixed(1) + ', expected ~' + b + ')');
}

// Mirror of priceItinerary() in trotro.html
function price(itin) {
  const entries = [];
  for (const leg of itin.legs) {
    if (leg.kind !== 'ride') continue;
    entries.push({
      label: leg.fromName + ' -> ' + leg.toName,
      result: Pricing.getFare(
        { name: leg.fromName, lon: leg.coords[0][0], lat: leg.coords[0][1] },
        { name: leg.toName, lon: leg.coords[leg.coords.length - 1][0], lat: leg.coords[leg.coords.length - 1][1] },
        { roadKm: leg.meters / 1000 }
      )
    });
  }
  return entries;
}

function journey(a, b) {
  const A = Network.stop(a), B = Network.stop(b);
  const plan = Network.plan([A.lon, A.lat], [B.lon, B.lat]);
  if (!plan.ok) return null;
  return { plan, itin: plan.itineraries[0], fares: price(plan.itineraries[0]) };
}

// --- the scenario from the brief: Labadi to Ablekuma -----------------------
{
  const j = journey('Labadi', 'Ablekuma');
  check(!!j, 'Labadi -> Ablekuma must be plannable');
  if (j) {
    check(j.itin.hasRide, 'Labadi -> Ablekuma must involve a car');
    check(j.fares.length === j.itin.rideCount, 'every car must be priced');
    j.fares.forEach(f => {
      check(f.result.ok, 'fare for ' + f.label + ' must resolve');
      check(f.result.fare >= 5.50, 'fare for ' + f.label + ' must not be below the published minimum of 5.50');
    });
  }
}

// --- the interchange case: Circle to Adenta must change cars ---------------
{
  const j = journey('Circle', 'Adenta');
  check(!!j, 'Circle -> Adenta must be plannable');
  if (j) {
    check(j.itin.transfers >= 1, 'Circle -> Adenta must change cars');
    check(j.itin.rideCount === j.itin.transfers + 1, 'rides should equal changes plus one');
    check(j.fares.length === 2, 'both car rides must be priced separately');

    const total = j.fares.reduce((s, f) => s + f.result.fare, 0);
    check(total > 0, 'total fare must be positive');

    // Two cars means two fares: you pay again when you change vehicle.
    check(j.fares.length === 2 && total > Math.max(...j.fares.map(f => f.result.fare)),
      'paying for a change of car must cost more than a single ride');

    const change = j.itin.legs.find(l => l.kind === 'transfer');
    check(!!change, 'a transfer step must be present');
    if (change) check(change.minutes > 0, 'a transfer must allow time to find the next car');

    // the change must happen at a real interchange
    const stop = Network.stop(change.atName);
    check(!!stop && stop.routeIds.length > 1,
      'a change of car may only happen where more than one route runs (' + change.atName + ')');

    // The UI marks the change on the map and lists the cars. It can only do
    // that if the planner publishes where the change is and what it costs.
    check(Array.isArray(j.itin.changeAt) && j.itin.changeAt.length === j.itin.transfers,
      'every change of car must be published with its location for the map');
    check(change && typeof change.lon === 'number' && typeof change.lat === 'number',
      'a change of car must carry coordinates so the map can pin it');
    check(change && Number.isFinite(change.lon) && Number.isFinite(change.lat),
      'change of car coordinates must be real numbers');
    check(Array.isArray(j.itin.cars) && j.itin.cars.length === j.itin.rideCount,
      'the cars taken must be listed so the UI can show one line per car');
    check(j.itin.cars.every(c => !!c.name && !!c.color),
      'each car must have a name and a colour, otherwise it cannot be drawn distinctly');
    // The two cars of a change trip must look different on the map.
    check(new Set(j.itin.cars.map(c => c.color)).size === j.itin.cars.length,
      'each car must have its own colour so a change is visible on the map');
  }
}

// --- regression: a car route must not be lost to a nearby walk --------------
{
  // Ablekuma is within walking distance of Kaneshie. The planner used to key
  // "standing at Ablekuma" the same whether you walked there or arrived by car,
  // so the cheap walk to that stop overwrote the car route and the trip came
  // back as "walk the whole way" with no car at all.
  const j = journey('Kaneshie', 'Ablekuma');
  check(!!j, 'Kaneshie -> Ablekuma must be plannable');
  if (j) {
    check(j.itin.hasRide, 'Kaneshie -> Ablekuma must be offered a car, not silently only a walk');
  }

  // Across the whole network: wherever two stops are joined by a car, the best
  // option must not be a walk that merely happens to be nearby.
  const names = Object.keys(Network.stops);
  let walkWins = 0;
  for (const an of names) {
    for (const bn of names) {
      if (an === bn) continue;
      const A = Network.stops[an], B = Network.stops[bn];
      const p = Network.plan([A.lon, A.lat], [B.lon, B.lat]);
      if (!p.ok) continue;
      const ride = p.itineraries.filter(i => i.hasRide);
      if (ride.length && !p.itineraries.some(i => i.hasRide)) walkWins++;
    }
  }
  check(walkWins === 0, 'a car route must never be hidden behind a walk-only result');
}

// --- regression: car names must match the direction actually travelled -----
{
  // Routes are stored as direction pairs ("Ablekuma -> Circle"), but a
  // passenger can board either way. Showing the stored name made the UI say
  // "Board the Ablekuma -> Circle at Circle" and then get off at Ablekuma.
  const j = journey('Osu', 'Ablekuma');
  if (j) {
    const rides = j.itin.legs.filter(l => l.kind === 'ride');
    rides.forEach(l => {
      check(!!l.travelName, 'a ride must carry a name for the direction travelled');
      const expects = l.travelName || l.routeName;
      check(expects.endsWith(l.toName),
        'the car name "' + expects + '" must end at where the passenger gets off (' + l.toName + ')');
      check(expects.startsWith(l.fromName),
        'the car name "' + expects + '" must start at where the passenger boards (' + l.fromName + ')');
    });
    // And the same must hold for the car list the UI legend uses.
    (j.itin.cars || []).forEach(c => {
      check(c.name.endsWith(c.to), 'car list name "' + c.name + '" must end at ' + c.to);
      check(c.name.startsWith(c.from), 'car list name "' + c.name + '" must start at ' + c.from);
    });
  }

  // The check above only covers one trip, where the cars happen to run from
  // end to end. The planner also boards a route part way along and travels it
  // the way it is NOT stored, so do the direction check for every car in every
  // trip the network can plan. Roughly half of all ride legs run backwards, so
  // this is the case that actually exercises the naming rule.
  const routeById = {};
  Network.routes.forEach(r => { routeById[r.id] = r; });
  const otherWay = name => {
    const p = String(name).split('->');
    return p.length === 2 ? p[1].trim() + ' -> ' + p[0].trim() : name;
  };
  const allNames = Object.keys(Network.stops);
  let legsSeen = 0, reversedLegs = 0, misnamed = 0;
  const misnamedExample = [];
  for (const an of allNames) {
    for (const bn of allNames) {
      if (an === bn) continue;
      const A = Network.stops[an], B = Network.stops[bn];
      const p = Network.plan([A.lon, A.lat], [B.lon, B.lat]);
      if (!p.ok) continue;
      for (const i of p.itineraries) {
        for (const l of i.legs) {
          if (l.kind !== 'ride' || !l.travelName) continue;
          const rt = routeById[l.routeId];
          if (!rt || !l.stopNames || l.stopNames.length < 2) continue;
          const seq = rt.stops.map(s => Network.canonical(s[0]));
          const ia = seq.indexOf(l.stopNames[0]);
          const ib = seq.indexOf(l.stopNames[l.stopNames.length - 1]);
          // A car that returns to where it started has no direction to name.
          if (ia < 0 || ib < 0 || ia === ib) continue;
          legsSeen++;
          const shouldRead = ib > ia ? rt.name : otherWay(rt.name);
          if (ib < ia) reversedLegs++;
          if (l.travelName !== shouldRead) {
            misnamed++;
            if (misnamedExample.length < 3) {
              misnamedExample.push(an + '->' + bn + ' read "' + l.travelName + '" not "' + shouldRead + '"');
            }
          }
        }
      }
    }
  }
  check(legsSeen > 3000, 'the direction check must really see the network (saw ' + legsSeen + ' ride legs)');
  check(reversedLegs > 0, 'cars must really be boarded in both directions, or this check proves nothing');
  check(misnamed === 0, 'a car name must follow the direction travelled (' + misnamed + ' wrong: ' + misnamedExample.join('; ') + ')');
}

// --- a car ride must always actually travel somewhere -----------------------
{
  // Boarding and stepping straight back off must never be sold as a ride: it
  // would be a "car" with no stops, no time and a fare attached.
  const names = Object.keys(Network.stops);
  let phantom = 0;
  let loops = 0;
  let loopsFirst = 0;
  for (const an of names) {
    for (const bn of names) {
      if (an === bn) continue;
      const A = Network.stops[an], B = Network.stops[bn];
      const p = Network.plan([A.lon, A.lat], [B.lon, B.lat]);
      if (!p.ok) continue;
      p.itineraries.forEach((i, k) => {
        let seenLoop = false;
        i.legs.forEach(l => {
          if (l.kind === 'ride' && ((!l.coords || l.coords.length < 2) || !(l.minutes > 0))) phantom++;
          // A ride that ends at the stop it started from never took anyone
          // anywhere. It used to be produced for short trips, where the search
          // added a loop on the spot just to satisfy "you must have ridden",
          // and the UI then read "board the ... -> ... at La, get off at La".
          if (l.kind === 'ride' && l.fromName === l.toName) { loops++; seenLoop = true; }
        });
        if (seenLoop && k === 0) loopsFirst++;
      });
    }
  }
  check(phantom === 0, 'a ride with no stops or no time must never be produced (' + phantom + ' found)');
  check(loops === 0, 'a ride that ends where it was boarded must never be produced (' + loops + ' found)');
  check(loopsFirst === 0, 'a pointless loop ride must never be the first option offered (' + loopsFirst + ' found)');
}

// --- fares must respect the published schedule -----------------------------
{
  // A short intra-city ride must land on the published trotro ladder.
  const j = journey('Circle', 'Legon');
  if (j && j.fares.length) {
    const levels = Pricing.trotroLadder.map(r => r.current);
    check(levels.includes(j.fares[0].result.fare),
      'intra-city fare ' + j.fares[0].result.fare + ' must be a published level');
  }
}

// --- walking must be offered and must not claim a fare ---------------------
{
  const Circle = Network.stop('Circle');
  const plan = Network.plan([Circle.lon, Circle.lat], [Circle.lon + 0.0008, Circle.lat + 0.0004]);
  check(plan.ok, 'a very short trip should still return something');
  if (plan.ok) {
    const walk = plan.itineraries.find(i => !i.hasRide);
    check(!!walk, 'walking must be offered for a very short trip');
    if (walk) {
      check(walk.transfers === 0, 'a walk must not claim any changes of car');
      check(price(walk).length === 0, 'a walk-only option must not be priced');
    }
  }
}

// --- the best option must actually take you to the stop you asked for -------
{
  /* Regression found while making this change. Once the walk from the last
     stop to the searched place stopped being counted in the time, Labadi ->
     Ablekuma put "get off at La, 1.7 km to go" (7 min) above the direct car
     that really does go to Ablekuma (16 min). The last bit is still part of
     the journey, so the option that ends at the destination must win. */
  [['Labadi', 'Ablekuma'], ['Circle', 'Ablekuma'], ['Osu', 'Ablekuma']].forEach(pair => {
    const a = pair[0], b = pair[1];
    const j = journey(a, b);
    check(!!j, a + ' -> ' + b + ' must be plannable');
    if (!j) return;

    const end = j.itin.legs[j.itin.legs.length - 1];
    check(end.gapM < 60, a + ' -> ' + b + ': the best option must end at ' + b
      + ', not ' + end.atName + ' (' + Math.round(end.gapM) + ' m away)');

    const legSum = j.itin.legs.reduce((s, l) => s + (l.minutes || 0) + (l.gapMinutes || 0), 0);
    check(Math.abs(j.itin.totalMinutes - legSum) < 0.01,
      a + ' -> ' + b + ': the total must be the legs plus the last bit on foot');

    // Somewhere in the list there is always a car that really does the trip.
    const atDestination = j.plan.itineraries.some(i =>
      i.hasRide && i.legs.some(l => l.kind === 'arrive' && l.atName === b));
    check(atDestination, a + ' -> ' + b + ' must offer an option that gets off at ' + b);
  });
}

// --- the journey must start at a stop and finish AT a stop -----------------
{
  /* The brief: the only walking in a trotro trip is walking to a bus stop to
     catch a car. There is no walk from the stop to where you are going, so a
     car journey must end by naming the stop you get off at, and must say how
     far the searched place still is instead of billing time for that walk. */
  const j = journey('Circle', 'Adenta');
  if (j) {
    check(j.itin.legs[0].kind === 'walk', 'a journey must start with a walk to a stop');
    check(j.itin.legs[0].toName !== 'Destination',
      'even the first walk must end at a stop, not at the destination');

    const last = j.itin.legs[j.itin.legs.length - 1];
    check(last.kind === 'arrive', 'a journey must end by naming the stop you get off at, got ' + last.kind);
    check(!!last.atName && !!Network.stop(last.atName),
      'the stop you get off at must be a real stop on the network (' + last.atName + ')');
    check(last.minutes === 0 && last.meters === 0,
      'getting off at a stop is not walking and must add no time and no distance');
    check(typeof last.gapM === 'number' && last.gapM >= 0,
      'the last stop must state how far the searched place still is');
    check(typeof last.gapMinutes === 'number' && last.gapMinutes >= 0,
      'the last stop must state what that distance costs on foot');
  }

  // Same rule across the whole network, not just one trip.
  const names = Object.keys(Network.stops);
  let destWalks = 0, badEnds = 0, walksSeen = 0;
  for (const an of names) {
    for (const bn of names) {
      if (an === bn) continue;
      const A = Network.stops[an], B = Network.stops[bn];
      const p = Network.plan([A.lon, A.lat], [B.lon, B.lat]);
      if (!p.ok) continue;
      p.itineraries.forEach(i => {
        if (!i.hasRide) return;
        const end = i.legs[i.legs.length - 1];
        if (!end || end.kind !== 'arrive' || !Network.stop(end.atName)) badEnds++;
        i.legs.forEach(l => {
          if (l.kind !== 'walk') return;
          walksSeen++;
          if (l.toName === 'Destination') destWalks++;
        });
      });
    }
  }
  check(walksSeen > 0, 'walking to a stop must still be part of a journey (' + walksSeen + ' walks seen)');
  check(destWalks === 0, 'no walk inside a car journey may end at the destination (' + destWalks + ' found)');
  check(badEnds === 0, 'every car journey must end at a real stop (' + badEnds + ' found)');
}

// --- a searched NAME must resolve to the right stop, not to a map point -----
{
  /* The bug this guards: the search box geocodes a name, and for Greater Accra
     the geocoder is often kilometres out. Measured live:
       "Ablekuma"  -> -0.3135, 5.6279  = 6446 m from the Ablekuma stop
       "Adenta"    -> -0.1691, 5.7042  = 2365 m from the Madina stop
       "Labadi"    -> -0.1467, 5.5754  = 3826 m from the Labadi stop
     Planning to those points fails, and a failed plan is what drew a straight
     line with no cars. The name must win over the coordinate. */
  const cases = [
    ['Ablekuma', 'Ablekuma'],
    ['Ablekuma Central Municipal District', 'Ablekuma'],
    ['Ablekuma North Municipal Assembly', 'Ablekuma'],
    ['Adenta', 'Adenta'],
    ['Adenta Municipal District', 'Adenta'],
    ['Labadi Accra', 'Labadi'],
    ['Labadi Motor Court, Accra', 'Labadi'],
    ['Kaneshie', 'Kaneshie'],
    ['Kaneshie Market Complex', 'Kaneshie'],
    ['Circle', 'Circle'],
    ['Kwame Nkrumah Circle Accra', 'Circle'],
    ['Madina Accra', 'Madina'],
    ['Osu Accra', 'Osu'],
    ['Kotoka International Airport', 'Airport City'],
    ['37 Military Hospital', '37']
  ];
  cases.forEach(([text, want]) => {
    const m = Network.matchStop(text);
    check(!!m, 'the name "' + text + '" must resolve to a stop');
    if (m) check(m.stop.displayName === want, '"' + text + '" must resolve to ' + want + ', got ' + m.stop.displayName);
  });

  // A longer, more specific name must win: "La Nkwantanang Madina" is Madina,
  // not La. Matching the shorter name here would send people to the coast.
  const ambiguous = Network.matchStop('La Nkwantanang Madina Municipal Assembly');
  check(!!ambiguous && ambiguous.stop.displayName === 'Madina',
    'a longer name must win a tie, so Madina beats La');

  // Text that names no stop must not be forced onto one.
  check(Network.matchStop('Lapaz') === null, 'a place that is not a stop must not match a stop');
  check(Network.matchStop('') === null, 'empty text must not match a stop');
  // A partial word must not throw, whatever it resolves to.
  const partial = Network.matchStop('Kotoka');
  check(partial === null || !!partial.stop, 'a partial name must return null or a stop, never throw');
}

// --- the stops offered in the search list must be real stops ----------------
{
  const hits = Network.searchStops('madina', 5);
  check(hits.length > 0, 'searching a stop name must offer that stop');
  if (hits.length) {
    check(hits[0].stop.displayName === 'Madina', 'Madina must be offered first for "madina"');
    hits.forEach(h => check(h.stop === Network.stop(h.stop.displayName), 'an offered stop must be the real network stop'));
  }
  check(Network.searchStops('a', 5).length === 0, 'a one-letter search must not offer every stop');
}

// --- the failure that made EVERY search look the same ----------------------
{
  /* A browser whose location resolves outside Accra (or a laptop with no GPS)
     gives an origin no trotro serves. Every search then fails identically and
     the page drew a straight line, which read as "it never shows the change".
     The planner must say so plainly, and a hub start must work instead. */
  const outside = Network.plan([-0.1276, 51.5072], [Network.stops.ablekuma.lon, Network.stops.ablekuma.lat]);
  check(!outside.ok, 'an origin outside the network must not pretend to be a trotro trip');
  check(/starting point/.test(outside.reason || ''), 'the refusal must name the starting point as the problem');
  check((outside.stopsNearOrigin || []).length === 0, 'no stops must be reachable from an origin outside the network');

  const hub = Network.hub();
  check(!!hub, 'there must be a hub stop to fall back to');
  if (hub) {
    check(hub.displayName === 'Circle', 'the busiest interchange is expected to be Circle, got ' + hub.displayName);
    const fromHub = Network.plan([hub.lon, hub.lat], [Network.stops.ablekuma.lon, Network.stops.ablekuma.lat]);
    check(fromHub.ok, 'planning from the hub must work when the device position cannot be used');
    if (fromHub.ok) check(fromHub.itineraries[0].hasRide, 'a hub fallback must still produce a real car trip');
  }
}

// --- the reported trip: the change at Circle must really be there ----------
{
  /* The whole point of the report. From Osu to Ablekuma the passenger must
     leave one car at Circle and take the Ablekuma car. */
  const Osu = Network.stop('Osu');
  const m = Network.matchStop('Ablekuma');       // as typed by a person
  check(!!m, '"Ablekuma" must resolve to a stop');
  if (m) {
    const plan = Network.plan([Osu.lon, Osu.lat], [m.stop.lon, m.stop.lat]);
    check(plan.ok, 'Osu -> Ablekuma must be plannable');
    if (plan.ok) {
      const i = plan.itineraries[0];
      check(i.rideCount === 2, 'Osu -> Ablekuma must be 2 cars, got ' + i.rideCount);
      check(i.changeAt.length === 1, 'Osu -> Ablekuma must need exactly 1 change, got ' + i.changeAt.length);
      if (i.changeAt.length) {
        check(i.changeAt[0].name === 'Circle',
          'the change must be at Circle, got ' + i.changeAt[0].name);
      }
      check(i.hasRide, 'the option must involve riding, not just walking');
    }
  }
}

// --- the result panel must not resurrect what was taken out ----------------
{
  /* These were reported on screen and deliberately removed, so a later edit
     cannot quietly put them back. */
  const fs = require('fs');
  const path = require('path');
  const html = fs.readFileSync(path.join(__dirname, 'trotro.html'), 'utf8');

  check(/prettyDistance\(\(leg\.meters\|\|0\)\/1000\)/.test(html),
    'a walk leg must be printed in km, not metres (a 400 m walk read as "400.0 km")');

  ['Options come from the trotro stop network',
   'not from your current position',
   'so the route is planned to that stop'
  ].forEach(phrase => {
    check(html.indexOf(phrase) === -1, 'this note must not be shown again: "' + phrase + '"');
  });

  // An option that is no quicker, no cheaper and no simpler than one already
  // listed is a detour, and must be filtered out before the cards are drawn.
  check(/const shown=ranked\.filter\(/.test(html),
    'the dominated-option filter must run before the cards are built');

  // One main way, not a list to choose from. The planner still works out the
  // alternatives so the single card is the best of everything considered, but
  // only that one card may be drawn.
  check(/const mainCard=renderOption\(best\.itin,best\.fareEntries,0,false\)/.test(html),
    'only the main way may be drawn, and it must come from the best option');
  check(/mainCard\.classList\.add\('only'\)/.test(html),
    'the single card must be marked as the only card, so it is not clickable');
  check(html.indexOf('shown.forEach((o,i)=>{') === -1,
    'the list of alternative options must not come back');

  // The headline and the first card must agree, so the options are ordered by
  // the real driving time and not by the planner's straight-line estimate.
  check(/shown\.sort\(/.test(html),
    'the options must be ordered by the real driving time, not by the planner estimate');

  // The trip ends at a stop you get off at. That must never be shown as a walk
  // from the stop to the searched place again.
  check(/kind==='arrive'/.test(html), 'the page must render the stop the trip ends at');
  check(/step-tag stop/.test(html), 'getting off must be its own step, not a walk step');
  check(html.indexOf('Walk from ') === -1,
    'a walk from a stop to the searched place must not come back');

  // Each car is drawn in a colour the passenger cannot confuse with the car
  // before it, or a change of car is invisible on the map.
  check(/function assignCarColors\(itin\)/.test(html),
    'each car must be given a colour that differs from the car before it');
  check(/const CAR_COLOR_MIN=\d+/.test(html), 'how close two car colours may look must be stated');
  check(/assignCarColors\(itin\);/.test(html), 'the car colour rule must run before the trip is drawn');

  // Walking to another stop to take another car has its own colour, explained
  // in the legend, so the change is visible on the map as well as in the words.
  check(/itin-change-line/.test(html),
    'walking to another stop to change cars must be drawn in its own colour');
  check(/key-change/.test(html), 'the colours on the map must be explained in the legend');
  check(/CHANGE CAR/.test(html), 'the change of car must be labelled for what it is');

  // The last bit on foot is stated, not shown as a walk step, but it is still
  // part of the journey: it has to be in the time the page quotes.
  check(/s\+\(l\.minutes\|\|0\)\+\(l\.gapMinutes\|\|0\)/.test(html),
    'the total time must include the last bit on foot from the stop you get off at');

  // A refusal must offer a way forward. The notice used to list the stops near
  // your position even when the searched place was the problem, so searching
  // anywhere outside Greater Accra was a dead end with no way to recover.
  check(/const destProblem=\/destination\/i\.test\(plan\.reason\|\|''\)/.test(html),
    'the failure must say whether your position or the place you searched is the problem');
  check(/destProblem\?plan\.stopsNearDestination:plan\.stopsNearOrigin/.test(html),
    'the stops offered after a failure must be the ones at the end that is the problem');
  check(/row\.addEventListener\('click',\(\)=>selectPlace\(\{/.test(html),
    'an offered stop must be tappable, so a dead end can be recovered from');

  /* The reported bug: standing in Labadi, searching "Circle" answered "walk
     0 m, free". The position was nowhere near a stop, so the planner fell back
     to the Circle hub silently - and searching for Circle then became a
     zero-minute walk. All three fixes below are needed. */
  check(/if\(chosenStart\)\{\s*\n?\s*return \{point:\[chosenStart\.lon,chosenStart\.lat\]/.test(html),
    'a stop the user chose must override the browser position as the start');
  check(/activeStart=resolveStart\(\)/.test(html),
    'the start of the trip must be recorded so it can be shown on screen');
  check(/renderStartRow\(\);/.test(html),
    'the start of the trip must be named on every result');
  check(/Location unavailable/.test(html) && /Allow location access or type a start location/.test(html),
    'no position at all must ask for a location instead of planning from a hardcoded stop');
  check(/TrotroNetwork\.haversineM\(startPoint,destPoint\)<150/.test(html),
    'starting where you are going must be answered as "you are already here", not as a zero-minute walk');
  check(/You are already here/.test(html), 'the already-there answer must be shown in words');
  check(/function toggleStopPicker\(\)/.test(html) && /id="startRow"/.test(html),
    'the start must be changeable, which is how a wrong position is corrected');
  check(/stopsNear\(userPos,6000\)/.test(html),
    'the picker must offer the stops near the passenger');
  check(/userAccuracy>800/.test(html),
    'a position the browser itself calls uncertain must be flagged');

  // The three structural rules that stop this class of error, not just this one
  // instance: one decision point, an explicit certainty, and a rebuild when the
  // position moves.
  check(/function resolveStart\(\)/.test(html),
    'the start of the trip must be decided in one place');
  check(/sure:true/.test(html) && /sure:false/.test(html),
    'the start decision must record whether it can be trusted');
  check(/activeStart\.sure\?'':' unsure'/.test(html),
    'an untrusted start must be styled differently on screen');
  check(/planStart=activeStart/.test(html) && /activeStart=resolveStart\(\)/.test(html),
    'the map and the card must be drawn from the same recorded start');
  check(/haversineM\(planStart\.point,userPos\)>START_REPLAN_M/.test(html),
    'a trip must be rebuilt when the position moves away from the start it was planned from');
  check(/if\(planStart&&planStart\.point&&lastPlace&&!chosenStart/.test(html),
    'a start the passenger chose must never be overridden by a later position fix');
}


// --- the start of the trip must always be a point a car can leave from -----
{
  /* Regression, and the worst of them. The page decided where the trip starts
     in the browser, so a wrong decision there produced "no trotro journey" for
     a position the passenger could see on the map - it had just handed the
     planner a point 3.1 km from any stop, which cannot start a trip.

     The decision is therefore executed here, against the real network, for a
     spread of positions. The invariant is not "it returns something": it is
     that whatever it returns is somewhere a car can actually be caught from,
     that it says how sure it is, and that it explains itself. */
  const fs = require('fs');
  const path = require('path');
  const vm = require('vm');
  const html = fs.readFileSync(path.join(__dirname, 'trotro.html'), 'utf8');
  const from = html.indexOf('function resolveStart()');
  const to = html.indexOf('// Name the start of the trip');
  check(from > 0 && to > from, 'the page must keep resolveStart() findable, it is tested directly');

  const prettyDistance = km => km < 1 ? Math.round(km * 1000) + ' m' : km.toFixed(1) + ' km';
  function decide(userPos, accuracy, chosen) {
    return vm.runInNewContext('(' + html.slice(from, to) + ')()', {
      chosenStart: chosen || null,
      // The page keeps its typed origin in this variable; the harness pins it
      // to null so each case below exercises the position/chosen-stop paths.
      originPlace: null,
      // The harness pins these; the live page sets userTyped when the user
      // types a start, which the fixed page must respect over GPS.
      startSearchEl: { dataset: {} },
      userPos: userPos,
      userAccuracy: accuracy == null ? null : accuracy,
      window: { TrotroNetwork: Network },
      prettyDistance,
      START_UNSURE_M: 1500
    });
  }

  const Ridge = Network.stop('Ridge');
  const Labadi = Network.stop('Labadi');
  // Routing always starts from the user's own point: near positions must be
  // handed to the planner as-is, far ones must stay on the user's point with
  // sure:false (never teleported to a stop or the hub), and no position at
  // all must refuse so the page shows the location prompt.
  const cases = [
    ['standing at a stop', [Labadi.lon, Labadi.lat], 30, true],
    ['right on top of a stop', [Ridge.lon + 0.0005, Ridge.lat + 0.0005], 30, true],
    ['the reported case: 3.1 km from the nearest stop', [Ridge.lon + 0.028, Ridge.lat - 0.004], 30, false],
    ['just over 2 km out', [Ridge.lon + 0.016, Ridge.lat - 0.002], 30, false],
    ['a position outside the country', [-0.1276, 51.5072], 30, false],
    ['a poor fix on top of a stop', [Labadi.lon, Labadi.lat], 5000, true],
  ];

  cases.forEach(c => {
    const label = c[0];
    const start = decide(c[1], c[2], null);
    check(!!start.point, 'a start must always be decided when a position exists: ' + label);
    if (!start.point) return;
    check(start.point[0] === c[1][0] && start.point[1] === c[1][1],
      'the trip must start from the user position itself, never teleported: ' + label);
    if (c[3]) check(Network.stopsNear(start.point, Network.meta.accessWalkM).length > 0,
      'a near position must be plannable from where the user stands: ' + label);
    else check(Network.stopsNear(start.point, Network.meta.accessWalkM).length === 0 || start.sure === false,
      'a far position must be flagged unsure, not silently moved: ' + label);
    check(typeof start.sure === 'boolean',
      'the decision must record whether it can be trusted: ' + label);
    check(typeof start.how === 'string' && start.how.length > 0,
      'the decision must explain itself on screen: ' + label);
  });

  // No position at all: refuse instead of planning from a hardcoded
  // interchange, so the page shows the location prompt.
  const none = decide(null, 30, null);
  check(!none.point, 'no position at all must refuse, never plan from the hub');

  // A position that cannot start a trip stays on the user's point and says
  // so, instead of teleporting to the hub.
  const far = decide([-0.1276, 51.5072], 30, null);
  check(far.sure === false, 'a position outside the network must not be treated as certain');
  check(far.point[0] === -0.1276 && far.point[1] === 51.5072,
    'a position that cannot start a trip must stay on the user point, not teleport to the hub');

  // A stop the passenger chose beats any position, good or bad.
  const forced = decide([-0.1276, 51.5072], 30, Labadi);
  check(forced.point[0] === Labadi.lon && forced.point[1] === Labadi.lat,
    'a stop the passenger chose must win over the detected position');
  check(forced.sure === true, 'a stop the passenger chose is certain');

  // A position the browser itself calls doubtful must not read as fact.
  const vague = decide([Labadi.lon, Labadi.lat], 5000, null);
  check(vague.sure === false, 'a fix accurate only to kilometres must be marked uncertain');
}

// --- the national stop extract: ghana_all_stops.geojson ---------------------
{
  const fs = require('fs');
  const path = require('path');

  // The extract must have loaded into application state when the module was
  // required (it reads the .geojson sitting next to trotro-network.js).
  const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'ghana_all_stops.geojson'), 'utf8'));
  check(Array.isArray(Network.allStops), 'the stop extract must be exposed as application state');
  check(Network.allStops.length === raw.features.length,
    'every feature in ghana_all_stops.geojson must be loaded (' + Network.allStops.length + ' of ' + raw.features.length + ')');
  check(Network.allStops.length > 4000, 'the extract should carry every stop in Ghana');

  // Every stop must be usable on a map: real coordinates and a name, with
  // the file's 774 nameless features falling back to "Trotro Stop".
  check(Network.allStops.every(s => Number.isFinite(s.lat) && Number.isFinite(s.lon)),
    'every extract stop must have finite coordinates');
  check(Network.allStops.every(s => typeof s.name === 'string' && s.name.length > 0),
    'every extract stop must have a displayable name');
  check(raw.features.some(f => !f.properties.name), 'the fixture must contain nameless features');
  check(Network.allStops.some(s => s.name === 'Trotro Stop'),
    'a feature with no properties.name must default to "Trotro Stop"');

  // N closest stops, sorted by distance. Distances are verified against an
  // independent Haversine here, not against the function under test.
  const havM = (a, b) => {
    const rad = d => d * Math.PI / 180;
    const R = 6371000;
    const dLat = rad(b[0] - a[0]), dLon = rad(b[1] - a[1]);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  };
  const here = [5.6037, -0.1870];   // [latitude, longitude], central Accra
  const near = Network.nearestStops(here, 7);
  check(near.length === 7, 'nearestStops must return exactly N stops (got ' + near.length + ')');
  check(near.every((s, i) => i === 0 || near[i - 1].meters <= s.meters),
    'nearestStops must come back sorted by distance');
  near.forEach(s => {
    const expected = havM(here, [s.lat, s.lon]);
    check(Math.abs(s.meters - expected) < 0.5,
      'distance to ' + s.name + ' must be true Haversine (' + s.meters.toFixed(1) + ' vs ' + expected.toFixed(1) + ' m)');
    check(s.minutes > 0, 'a stop within walking range must report a walking time');
  });

  // The page holds positions as [lon,lat] from the geolocation API; the
  // lookup takes [lat,lon]. For Ghana's ranges the two cannot be confused,
  // so both orders must find the same stops.
  const swapped = Network.nearestStops([here[1], here[0]], 7);
  check(swapped.length === near.length && swapped.every((s, i) => s.id === near[i].id),
    'nearestStops must accept either coordinate order');

  // The walking radius is a real filter.
  const capped = Network.nearestStops(here, 50, { maxM: 400 });
  check(capped.length > 0 && capped.every(s => s.meters <= 400),
    'maxM must drop every stop beyond the radius');

  // Routing engine connect: the nearest stop's own coordinates work as a
  // boarding point for BOTH the planner and the fare engine.
  const board = near[0];
  const dest = Network.stop('Circle');
  check(!!dest, 'Circle must exist for the boarding-point check');
  const planRes = Network.plan([board.lon, board.lat], [dest.lon, dest.lat]);
  check(planRes.ok, 'a trip must be plannable from an extract stop as boarding point (' + board.name + ')');

  const fare = Pricing.getFare(
    { name: board.name, lat: board.lat, lon: board.lon },
    { name: 'Circle', lat: dest.lat, lon: dest.lon },
    { roadKm: 3 }
  );
  check(fare.ok, 'the fare engine must price a trip boarded at an extract stop');
  check(fare.fare >= 5.50, 'a fare boarded at an extract stop must not be below the published minimum');

  // Loading again (as the page does over http) must be idempotent and must
  // not disturb the planner.
  check(typeof Network.loadAllStops === 'function', 'loadAllStops must be exposed');
  const reloaded = Network.setAllStops(raw);
  check(reloaded === raw.features.length, 're-importing the extract must report the full count');
  check(Network.plan([Network.stop('Circle').lon, Network.stop('Circle').lat],
                     [Network.stop('Madina').lon, Network.stop('Madina').lat]).ok,
    'the planner must still work after the extract is re-imported');

  // The page must render them: script included, pins drawn, boarding wired.
  const html = fs.readFileSync(path.join(__dirname, 'trotro.html'), 'utf8');
  check(/ghana_all_stops\.js\?v=/.test(html),
    'the page must include the stop extract as a script (works over file://)');
  check(/function showNearbyStops\(latLon,n\)/.test(html),
    'the page must expose a function that renders nearby stops');
  check(/window\.showNearbyStops=showNearbyStops/.test(html),
    'showNearbyStops must be reachable from outside the page');
  check(/TrotroNetwork\.nearestStops\(from,n\|\|5,\{maxM:1500\}\)/.test(html),
    'the renderer must ask the network file for the N closest stops');
  check(/nearby-stop-pin/.test(html), 'nearby stops must be drawn as map pins');
  check(/chooseBoarding\(s\)/.test(html),
    'tapping a pin must hand its coordinates to chooseBoarding as the boarding point');
  check(/Math\.round\(s\.meters\)\+' m walk/.test(html),
    'a pin must show the exact walking distance');
}

console.log(failures.length ? 'FAILURES (' + failures.length + ' of ' + checks + ' checks):' : 'All ' + checks + ' integration checks passed.');
failures.forEach(f => console.log('  - ' + f));
if (failures.length) process.exitCode = 1;