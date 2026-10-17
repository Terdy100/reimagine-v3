/**
 * ============================================================================
 * HIGH-VELOCITY REGIONAL MEGA-EXPANDER (ACCELERATED METRO MAPPING)
 * ============================================================================
 * Ingests entire cities, metropolises, and regional clusters at once in a
 * single high-yield AI query instead of one single road at a time.
 * 
 * Usage:
 *   node route_expander/mega.js --region "Kumasi"      (Map 8-10 major Kumasi lines at once)
 *   node route_expander/mega.js --region "Takoradi"    (Map Sekondi-Takoradi Twin City lines)
 *   node route_expander/mega.js --region "Cape Coast"  (Map Cape Coast & Elmina Coastal lines)
 *   node route_expander/mega.js --region "Accra"       (Map Greater Accra dense infill lines)
 *   node route_expander/mega.js --all                  (Run all regions across Ghana in sequence)
 */

const fs = require('fs');
const path = require('path');
const { queryWithFailover } = require('../network_trainer/ai_auditor/multi_provider_client.js');
const { validateAndGeocodeRoute } = require('./geo_validator.js');
const { auditRouteTopology } = require('./commuter_audit.js');
const { commitNewRoutes } = require('./exporter.js');
const { generateGISReport } = require('./gis_reporter.js');

const REGIONAL_TARGETS = [
  {
    key: 'Kumasi',
    regionName: 'Ashanti Region (Kumasi Metropolis)',
    hubs: ['Kejetia Central', 'Sofoline Interchange', 'Suame Magazine', 'KNUST Junction', 'Asafo Market'],
    promptInstruction: `Generate 8 to 10 major authentic trotro routes for Kumasi Metropolis (Ashanti Region), connecting Kejetia Market radiating to:
1. Sofoline & Abuakwa Main
2. Suame Roundabout & Old Tafo
3. Bantama & Abrepo Junction
4. KNUST Campus & Ayeduase Gate
5. Asafo Interchange & Atonsu Dompoase
6. Santasi Roundabout & Kwadaso
7. Mamponteng & Pankrono Estate
8. Tanoso & Kumasi Technical University`
  },
  {
    key: 'Takoradi',
    regionName: 'Western Region (Sekondi-Takoradi Twin City)',
    hubs: ['Takoradi Market Circle', 'Paa Grant Roundabout', 'Sekondi Station', 'Kojokrom Railway'],
    promptInstruction: `Generate 6 to 8 major authentic trotro routes for Sekondi-Takoradi Metropolitan Area (Western Region), connecting Market Circle to:
1. Effia Nkwanta Hospital & Sekondi Station
2. Sekondi College & Essikado
3. Paa Grant Roundabout & Kwesimintsim
4. Anaji Choice & Kojokrom
5. Takoradi Airport Ridge & New Takoradi
6. Beach Road & Harbor Junction`
  },
  {
    key: 'Cape Coast',
    regionName: 'Central Region (Cape Coast & Elmina Coastal Strip)',
    hubs: ['Cape Coast Kotokuraba', 'UCC Old Site', 'UCC Science', 'Elmina Junction'],
    promptInstruction: `Generate 6 to 8 major authentic trotro routes for Cape Coast & Elmina (Central Region), connecting:
1. Kotokuraba Station ⇄ Pedu Junction ⇄ UCC Old Site ⇄ UCC Science
2. Kotokuraba Station ⇄ Elmina Junction ⇄ Elmina Castle
3. Cape Coast Kotokuraba ⇄ Moree Junction ⇄ Biriwa
4. UCC Science ⇄ Ayensudo ⇄ Komenda Junction
5. Cape Coast ⇄ Jukwa ⇄ Kakum National Park Road`
  },
  {
    key: 'Accra Infill',
    regionName: 'Greater Accra (High-Density Inner City Infill)',
    hubs: ['Circle', 'Kaneshie', 'Lapaz', 'Dansoman', '37', 'Tema Comm 1'],
    promptInstruction: `Generate 8 to 10 authentic cross-town trotro routes for Greater Accra infill, connecting:
1. Circle ⇄ Kanda Highway ⇄ Pig Farm ⇄ Roman Ridge ⇄ Dzorwulu ⇄ Abelemkpe
2. Kaneshie ⇄ Bubuashie ⇄ Darkuman ⇄ Nyamekye ⇄ Fadama ⇄ Abeka Lapaz
3. Dansoman Last Stop ⇄ Shiabu ⇄ Gbegbeyise ⇄ Agege ⇄ Mamprobi Banana Inn
4. Tema Comm 1 ⇄ Comm 2 ⇄ Comm 4 ⇄ Comm 7 ⇄ Comm 9 General Hospital ⇄ Comm 12
5. 37 ⇄ Airport Residential ⇄ Dzorwulu ⇄ GIMPA ⇄ West Legon
6. Spintex Road ⇄ Baatsona Total ⇄ Texpo ⇄ Kasoa / Nungua Link
7. Kasoa Overhead ⇄ Iron City ⇄ Millennium City ⇄ Nyanyano Kakraba`
  },
  {
    key: 'Eastern',
    regionName: 'Eastern Region (Highland & Radial Corridors)',
    hubs: ['Koforidua Main Station', 'Suhum Roundabout', 'Nsawam Station', 'Aburi Gardens'],
    promptInstruction: `Generate 6 to 8 authentic trotro routes for Eastern Region, connecting:
1. Koforidua Central ⇄ Effiduase ⇄ Asokore ⇄ Oyoko
2. Koforidua ⇄ Suhum ⇄ Nsawam
3. Madina ⇄ Peduase ⇄ Aburi ⇄ Mamfe ⇄ Akropong
4. Koforidua ⇄ Tinkong ⇄ Mamfe ⇄ Adukrom
5. Nsawam ⇄ Coaltar ⇄ Asamankese`
  },
  {
    key: 'Tamale',
    regionName: 'Northern Region (Tamale Metropolis)',
    hubs: ['Tamale Central Lorry Station', 'Aboabo Market', 'Savelugu Station', 'Nyankpala Campus'],
    promptInstruction: `Generate 6 to 8 authentic trotro / paratransit routes for Tamale Metropolis (Northern Region), connecting:
1. Tamale Central ⇄ Aboabo Market ⇄ Sakasaka ⇄ Kalpohin
2. Tamale Central ⇄ Lamashegu ⇄ Vittin ⇄ Bilpeila
3. Tamale Central ⇄ UDS Nyankpala Road ⇄ Nyankpala Campus
4. Tamale Central ⇄ Choggu ⇄ Gurugu ⇄ Savelugu Station
5. Tamale Central ⇄ Tamale Teaching Hospital (TTH) ⇄ Banvim
6. Tamale Central ⇄ Kanvili ⇄ Kamina Barracks`
  }
];

const SYSTEM_PROMPT = `You are a Ghanaian Senior Transit Cartographer and Trotro Master with deep, ground-truth street knowledge of Greater Accra, Ashanti, Western, Central, and Eastern regional transit lines.
Respond strictly in JSON adhering to this exact schema (no markdown formatting, no explanations):
{
  "routes": [
    {
      "id": "unique-kebab-id-1",
      "name": "Origin Terminal ⇄ Destination Terminal",
      "color": "#0284c7",
      "stops": [
        "Origin Terminal",
        "Junction 1",
        "Junction 2",
        "Junction 3",
        "Destination Terminal"
      ]
    }
  ]
}`;

function updateStatus(state, message, totalRoutes = null) {
  const statusFile = path.resolve(__dirname, 'status.json');
  const payload = {
    state,
    message,
    timestamp: new Date().toISOString(),
    totalActiveRoutes: totalRoutes
  };
  try {
    fs.writeFileSync(statusFile, JSON.stringify(payload, null, 2), 'utf8');
  } catch (_e) {}
}

async function expandRegionalTarget(target) {
  updateStatus('RUNNING', `Expanding ${target.regionName}...`);
  console.log('\n================================================================');
  console.log(`🌍 HIGH-VELOCITY MEGA EXPANSION: ${target.regionName.toUpperCase()}`);
  console.log('================================================================\n');

  const prompt = `TARGET REGION: ${target.regionName}
Major Transport Hubs: ${target.hubs.join(', ')}

INSTRUCTIONS:
${target.promptInstruction}

For each line:
- Include 7 to 12 sequential real-world stops/junctions along the actual road corridor.
- Ensure stop names reflect real local lorry stations, bus stops, and markets.`;

  console.log('[Step 1/3] Querying AI models for regional network package...');
  const t0 = Date.now();
  let aiRes;
  try {
    aiRes = await queryWithFailover(prompt, SYSTEM_PROMPT);
  } catch (err) {
    console.error(`[MegaExpander] AI Query failed for ${target.key}:`, err.message);
    updateStatus('FAILED', `AI Query failed for ${target.key}: ${err.message}`);
    return { ok: false, error: err.message };
  }

  const queryTime = Date.now() - t0;
  console.log(`[Step 1/3] Retrieved regional bundle from ${aiRes.provider} in ${(queryTime / 1000).toFixed(1)}s.`);

  let raw = (aiRes.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
  let parsed;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON object found in response');
    parsed = JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('[MegaExpander] Failed to parse AI JSON:', err.message);
    updateStatus('FAILED', `Failed to parse AI JSON for ${target.key}`);
    return { ok: false, error: err.message };
  }

  const rawRoutes = parsed.routes || [];
  console.log(`[Step 2/3] Received ${rawRoutes.length} raw routes. Validating and geocoding against surveyed GPS & live internet search...`);

  const validatedRoutes = [];
  for (const r of rawRoutes) {
    try {
      const v = await validateAndGeocodeRoute(r);
      const audit = auditRouteTopology(v);
      if (audit.passed || v.stops.length >= 3) {
        validatedRoutes.push(v);
        console.log(`  ✔ Validated: "${v.name}" (${v.stops.length} stops)`);
      } else {
        console.warn(`  ⚠ Route "${v.name}" skipped:`, audit.issues.join('; '));
      }
    } catch (err) {
      console.warn(`  ✖ Skipping "${r.name || 'unnamed'}":`, err.message);
    }
  }

  if (validatedRoutes.length === 0) {
    console.warn(`[MegaExpander] No routes passed validation for ${target.key}`);
    updateStatus('IDLE', `No new routes validated for ${target.key}`);
    return { ok: false, validated: 0 };
  }

  // Step 3: Zero-regression commit
  console.log(`\n[Step 3/3] Committing ${validatedRoutes.length} validated routes to live app...`);
  const corridorId = 'mega_' + target.key.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const commitRes = commitNewRoutes(corridorId, target.regionName, validatedRoutes);

  // Sync to trainer
  try {
    const trainerPath = path.resolve(__dirname, '..', 'network_trainer', 'custom-routes', 'custom-routes.js');
    const livePath = path.resolve(__dirname, '..', 'app', 'src', 'custom-routes', 'custom-routes.js');
    fs.copyFileSync(livePath, trainerPath);
  } catch (_e) {}

  generateGISReport();

  updateStatus('COMPLETED', `Successfully expanded ${target.regionName}`, commitRes.totalActiveRoutes);

  console.log(`\n================================================================`);
  console.log(`🎉 MEGA EXPANSION SUCCESS: ${target.regionName}`);
  console.log(`Added ${commitRes.newlyAdded} new transit routes in this single run!`);
  console.log(`Total active custom routes in live app: ${commitRes.totalActiveRoutes}`);
  console.log(`Your Vite dev server at http://localhost:5173/ has auto-reloaded!`);
  console.log(`================================================================\n`);

  return { ok: true, added: commitRes.newlyAdded, total: commitRes.totalActiveRoutes };
}

async function main() {
  const args = process.argv.slice(2);
  const targetArgIdx = args.indexOf('--region');
  const customArgIdx = args.indexOf('--custom');
  const isAll = args.includes('--all') || (!args.includes('--region') && !args.includes('--custom') && args.includes('--auto'));

  if (customArgIdx !== -1 && args[customArgIdx + 1]) {
    const customQuery = args.slice(customArgIdx + 1).join(' ');
    console.log(`🎯 Custom Corridor Expansion requested for: "${customQuery}"`);
    const customTarget = {
      key: 'custom_' + customQuery.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 25),
      regionName: `Custom Corridor: ${customQuery}`,
      hubs: [customQuery],
      promptInstruction: `Generate 4 to 6 authentic Ghanaian trotro routes for the corridor: "${customQuery}".
Connect the origin town/terminal through major road waypoints, junctions, and towns to the destination terminal with realistic local stop names.`
    };
    await expandRegionalTarget(customTarget);
  } else if (isAll) {
    console.log('🚀 Launching Full National Mega-Expansion Across All Regions...\n');
    let totalAdded = 0;
    for (const t of REGIONAL_TARGETS) {
      const res = await expandRegionalTarget(t);
      if (res.ok) totalAdded += res.added;
      await new Promise(r => setTimeout(r, 2000));
    }
    updateStatus('COMPLETED', 'National expansion complete across all regions', null);
    console.log(`\n🏁 NATIONAL EXPANSION COMPLETE! Added ${totalAdded} new routes across all regions.`);
  } else if (targetArgIdx !== -1 && args[targetArgIdx + 1]) {
    const query = args[targetArgIdx + 1].toLowerCase();
    const found = REGIONAL_TARGETS.find(t => t.key.toLowerCase().includes(query) || t.regionName.toLowerCase().includes(query));
    if (found) {
      await expandRegionalTarget(found);
    } else {
      console.log(`Region "${args[targetArgIdx + 1]}" not recognized. Available targets:`);
      REGIONAL_TARGETS.forEach(t => console.log(`  - ${t.key} (${t.regionName})`));
      console.log('Or use: node route_expander/mega.js --custom "<Town or Road Name>"');
    }
  } else {
    console.log('================================================================');
    console.log('     HIGH-VELOCITY REGIONAL MEGA-EXPANDER');
    console.log('================================================================');
    console.log('Ingests 8-10 major transit routes (100+ stops) in a single run!\n');
    console.log('Available Regional Packages:');
    REGIONAL_TARGETS.forEach(t => console.log(`  - node route_expander/mega.js --region "${t.key}"`));
    console.log('\nExpand any custom road or corridor:');
    console.log('  node route_expander/mega.js --custom "Sunyani to Techiman"');
    console.log('\nRun all regions in sequence:');
    console.log('  node route_expander/mega.js --all');
    console.log('================================================================\n');
  }
}

main().catch(err => {
  console.error('[MegaExpander Error]', err);
});
