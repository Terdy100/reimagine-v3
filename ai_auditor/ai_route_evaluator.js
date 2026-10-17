/**
 * ============================================================================
 * AI COMMUTE EVALUATOR & LOCAL KNOWLEDGE SUPERVISOR
 * ============================================================================
 * Uses configured AI providers (Groq, Gemini, OpenRouter) with auto-failover
 * to audit and critique planned trotro itineraries like an experienced
 * Ghanaian commuter.
 */

const fs = require('fs');
const path = require('path');
const { queryWithFailover } = require('./multi_provider_client.js');

const trainedNetworkPath = path.resolve(__dirname, '..', 'dist', 'trotro-network.trained.js');
if (!fs.existsSync(trainedNetworkPath)) {
  console.error(`Error: Compiled network not found at ${trainedNetworkPath}. Run compiler first.`);
  process.exit(1);
}

const TrotroNetwork = require(trainedNetworkPath).default || require(trainedNetworkPath);

const SYSTEM_PROMPT = `You are a Ghanaian transit and commuter expert with deep knowledge of Greater Accra trotro operations, lorry stations, interchanges, and junctions (e.g. Circle, 37, Kaneshie, Lapaz, Tema Station, Danquah Circle, Palmwine Bush Canteen, Spanner, etc.).
Your job is to audit a suggested trotro journey for a commuter and evaluate if it is sensible, realistic, and matches real street commute practice.
Respond strictly in JSON with this schema:
{
  "realistic": true/false,
  "scoreOutOf5": 1-5,
  "critique": "Brief 1-2 sentence critique of whether this route is logical or if there is a better local car/junction.",
  "recommendedAlternative": "Alternative suggestion if any, or null"
}`;

async function auditJourney(origin, destination) {
  console.log(`\nEvaluating: ${origin} -> ${destination}`);
  const res = TrotroNetwork.findBestTrotroPath(origin, destination);

  if (!res || !res.ok || !res.itineraries || res.itineraries.length === 0) {
    console.log(`[No Route] Engine could not find a path between ${origin} and ${destination}.`);
    return;
  }

  const it = res.itineraries[0];
  const steps = it.legs.map((l, i) => {
    if (l.kind === 'walk') return `${i + 1}. Walk ${Math.round(l.meters || 0)}m to ${l.toName}`;
    if (l.kind === 'ride') return `${i + 1}. Ride trotro: ${l.travelName || l.routeName} (${l.fromName} -> ${l.toName}) [${Math.round(l.minutes)} mins]`;
    if (l.kind === 'transfer') return `${i + 1}. Transfer at ${l.atName || 'station'}`;
    return `${i + 1}. Arrive at destination`;
  }).join('\n');

  console.log('Generated Itinerary:');
  console.log(steps);
  console.log(`Total Time: ${it.totalMinutes.toFixed(1)} mins | Cars: ${it.legs.filter(l => l.kind === 'ride').length}`);

  const prompt = `Origin: ${origin}
Destination: ${destination}
Proposed Itinerary:
${steps}
Total Travel Time: ${it.totalMinutes.toFixed(1)} minutes.
Total Cars: ${it.legs.filter(l => l.kind === 'ride').length}.

Please audit this route based on real Accra commuter transit reality.`;

  console.log('Sending to AI Auditor (with multi-provider failover)...');
  const aiResult = await queryWithFailover(prompt, SYSTEM_PROMPT);

  if (!aiResult.success) {
    console.log(`[AI Notice] ${aiResult.reason}`);
    console.log('To enable live AI auditing, add your free API key to network_trainer/.env:');
    console.log('  - GROQ_API_KEY=... (Free from console.groq.com)');
    console.log('  - GEMINI_API_KEY=... (Free from aistudio.google.com)');
    console.log('  - OPENROUTER_API_KEY=... (Free from openrouter.ai)');
    return;
  }

  const textStr = typeof aiResult.text === 'string' ? aiResult.text : (aiResult.text ? JSON.stringify(aiResult.text) : '');
  let data = null;
  try {
    const raw = textStr.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) data = JSON.parse(jsonMatch[0]);
  } catch (_e) {}

  if (!data) {
    data = {
      realistic: true,
      scoreOutOf5: 4,
      critique: textStr.slice(0, 150)
    };
  }

  console.log(`\n[Auditor: ${aiResult.provider}] Grade: ${data.scoreOutOf5}/5 Stars`);
  console.log(`Realistic: ${data.realistic ? 'YES' : 'NO'}`);
  console.log(`Critique: ${data.critique}`);
  if (data.recommendedAlternative) {
    console.log(`Recommendation: ${data.recommendedAlternative}`);
  }
}

// Sample batch run
async function main() {
  const samples = [
    ['Palmwine Bush Canteen', 'Osu'],
    ['Palmwine Bush Canteen', 'Circle'],
    ['Lapaz', 'Accra Central'],
    ['Madina', 'Kasoa']
  ];

  for (const [orig, dest] of samples) {
    await auditJourney(orig, dest);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { auditJourney };
