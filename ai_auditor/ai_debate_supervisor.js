/**
 * ============================================================================
 * GHANA-WIDE MULTI-AGENT AI DEBATE & ROUTE SUPERVISOR
 * ============================================================================
 * Supports custom routes via CLI:
 *   node network_trainer/ai_auditor/ai_debate_supervisor.js "Kumasi" "Circle"
 *   node network_trainer/ai_auditor/ai_debate_supervisor.js "Kasoa" "Tema"
 *   node network_trainer/ai_auditor/ai_debate_supervisor.js --random
 * 
 * Agents:
 *   1. Kofi (Ghanaian Commuter) -> Groq (120B)
 *   2. Dr. Mensah (Transit Engineer) -> Gemini (3.8 Flash)
 *   3. Commissioner Synthesis -> Cloudflare / OpenRouter / Groq
 */

const fs = require('fs');
const path = require('path');
const { callProvider } = require('./multi_provider_client.js');

const trainedNetworkPath = path.resolve(__dirname, '..', 'dist', 'trotro-network.trained.js');
const TrotroNetwork = require(trainedNetworkPath).default || require(trainedNetworkPath);

const COMMUTER_ADVOCATE_PROMPT = `You are "Kofi", a seasoned Ghanaian commuter. You know trotro routes across Greater Accra and Ghana (Circle, 37, Kaneshie, Lapaz, Madina, Spintex, Osu, Bush Canteen, Kasoa, Tema, Kumasi, Cape Coast, Takoradi, etc.).
You care about:
1. Walking fatigue: A passenger must NOT be told to walk far when a car passes near them.
2. Honest cars: People queue at known lorry parks or flag cars down at proper junctions.
3. No micro-hopping: Nobody wants 4 cars for a trip that needs 1 or 2 cars.

Give your street verdict in 2-3 sentences. Grade it out of 5 stars.`;

const TRANSIT_ENGINEER_PROMPT = `You are "Dr. Mensah", a Transit Systems Engineer specializing in West African paratransit graph optimization.
You care about:
1. Graph continuity and transfer logic (are transfers at designated transit hubs like 37, Circle, Kaneshie, Kejetia?).
2. Micro-hop penalties: Flag if the route makes pointless short switches between overlapping routes.
3. Realistic travel times and corridor efficiency.

Provide an analytical engineering critique in 2-3 sentences. Grade it out of 5 stars.`;

const DEBATE_MODERATOR_PROMPT = `You are the Chief Transit Commissioner. Synthesize the debate between Kofi (Commuter) and Dr. Mensah (Engineer) into a consensus.
Respond strictly in JSON:
{
  "consensusApproved": true/false,
  "averageScore": 1-5,
  "debateSummary": "Brief 2-sentence summary.",
  "requiredGraphTuning": "Specific recommendation or 'None needed'."
}`;

async function runRouteDebate(origin, destination) {
  console.log(`\n================================================================`);
  console.log(`  MULTI-AGENT AI DEBATE: ${origin} ➔ ${destination}`);
  console.log(`================================================================`);

  const res = TrotroNetwork.findBestTrotroPath(origin, destination);
  if (!res || !res.ok || !res.itineraries || res.itineraries.length === 0) {
    console.log(`[Error] No path found between ${origin} and ${destination}.`);
    return null;
  }

  const it = res.itineraries[0];
  const steps = it.legs.map((l, i) => {
    if (l.kind === 'walk') return `Step ${i + 1}: Walk ${Math.round(l.meters || 0)}m to ${l.toName}`;
    if (l.kind === 'ride') return `Step ${i + 1}: Ride ${l.travelName || l.routeName} (${l.fromName} -> ${l.toName}) [${Math.round(l.minutes)}m]`;
    if (l.kind === 'transfer') return `Step ${i + 1}: Change cars at ${l.atName || 'station'}`;
    return `Step ${i + 1}: Arrive at destination`;
  }).join('\n');

  console.log('\n[PROPOSED ITINERARY]:');
  console.log(steps);
  console.log(`Total Duration: ${it.totalMinutes.toFixed(1)} mins | Cars: ${it.legs.filter(l => l.kind === 'ride').length}\n`);

  const routeDescription = `Origin: ${origin}
Destination: ${destination}
Steps:
${steps}
Total Duration: ${it.totalMinutes.toFixed(1)} minutes.
Number of cars: ${it.legs.filter(l => l.kind === 'ride').length}.`;

  console.log('⚡ Debating across AI models (Groq 120B + Gemini)...');
  const t0 = Date.now();

  const [kofiResponse, mensahResponse] = await Promise.all([
    callProvider('groq', `Critique this trotro trip:\n${routeDescription}`, COMMUTER_ADVOCATE_PROMPT)
      .catch(e => `Groq error: ${e.message}`),
    callProvider('gemini', `Analyze this transit route:\n${routeDescription}`, TRANSIT_ENGINEER_PROMPT)
      .catch(e => `Gemini error: ${e.message}`)
  ]);

  const debateTime = Date.now() - t0;
  console.log(`⚡ Debate concluded in ${(debateTime / 1000).toFixed(1)}s!\n`);

  console.log(`----------------------------------------------------------------`);
  console.log(`🗣  AGENT 1: KOFI (Ghanaian Commuter Advocate via Groq 120B):`);
  console.log(`----------------------------------------------------------------`);
  console.log(kofiResponse.trim());

  console.log(`\n----------------------------------------------------------------`);
  console.log(`📐 AGENT 2: DR. MENSAH (Transit Systems Engineer via Gemini):`);
  console.log(`----------------------------------------------------------------`);
  console.log(mensahResponse.trim());

  // Synthesis via Groq / Cloudflare
  const synthesisPrompt = `Trip: ${origin} to ${destination}
Steps:
${steps}

Kofi's View (Commuter):
${kofiResponse}

Dr. Mensah's View (Engineer):
${mensahResponse}`;

  try {
    const verdictRaw = await callProvider('groq', synthesisPrompt, DEBATE_MODERATOR_PROMPT);
    const jsonMatch = verdictRaw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const verdict = JSON.parse(jsonMatch[0]);
      console.log(`\n================================================================`);
      console.log(`🏆 CONSENSUS VERDICT & OUTCOME:`);
      console.log(`================================================================`);
      console.log(`Approved by Consensus : ${verdict.consensusApproved ? 'YES (PASSED)' : 'NEEDS TUNING'}`);
      console.log(`Average Score         : ${verdict.averageScore} / 5 Stars`);
      console.log(`Summary               : ${verdict.debateSummary}`);
      console.log(`Tuning Action         : ${verdict.requiredGraphTuning}`);
      console.log(`================================================================\n`);
      return verdict;
    }
  } catch (err) {
    console.log(`Moderator synthesis note: ${err.message}`);
  }
}

// Ghana-Wide Sample Corridors
const GHANA_SCENARIOS = [
  ['Palmwine Bush Canteen', 'Osu'],
  ['Adenta', 'Kaneshie'],
  ['Kumasi', 'Circle'],
  ['Kasoa', 'Tema'],
  ['Cape Coast', 'Circle'],
  ['Lapaz', 'Spintex'],
  ['Madina', 'Dansoman'],
  ['Achimota', 'Airport']
];

async function main() {
  const args = process.argv.slice(2);

  if (args.length >= 2 && !args[0].startsWith('--')) {
    // Custom pair from user
    await runRouteDebate(args[0], args[1]);
    return;
  }

  if (args.includes('--random')) {
    const randomPair = GHANA_SCENARIOS[Math.floor(Math.random() * GHANA_SCENARIOS.length)];
    await runRouteDebate(randomPair[0], randomPair[1]);
    return;
  }

  // Default: Run 2 key scenarios
  for (const [orig, dest] of GHANA_SCENARIOS.slice(0, 2)) {
    await runRouteDebate(orig, dest);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runRouteDebate };
