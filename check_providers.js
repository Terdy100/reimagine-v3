/**
 * ============================================================================
 * AI PROVIDERS CONNECTIVITY & HEALTH CHECK DASHBOARD
 * ============================================================================
 */

const { PROVIDERS, callProvider, loadEnv } = require('./ai_auditor/multi_provider_client.js');

const env = loadEnv();

async function testProvider(key, name, fn) {
  const start = Date.now();
  try {
    const res = await fn();
    const ms = Date.now() - start;
    return { name, status: 'ONLINE', latency: `${ms}ms`, detail: String(res).slice(0, 100).replace(/\n/g, ' ') };
  } catch (err) {
    const ms = Date.now() - start;
    return { name, status: 'ERROR', latency: `${ms}ms`, detail: err.message };
  }
}

async function main() {
  console.log('================================================================');
  console.log('         AI PROVIDERS CONNECTIVITY & HEALTH CHECK DASHBOARD');
  console.log('================================================================\n');

  const checks = [];

  // 1. Groq
  if (env.GROQ_API_KEY) {
    checks.push(testProvider('groq', 'Groq (120B / Llama)', async () => {
      return await callProvider('groq', 'Respond with: "Groq Online"', 'You are a health checker.');
    }));
  } else {
    checks.push(Promise.resolve({ name: 'Groq', status: 'NOT CONFIGURED', detail: 'Missing GROQ_API_KEY in .env' }));
  }

  // 2. Gemini
  if (env.GEMINI_API_KEY) {
    checks.push(testProvider('gemini', 'Google Gemini (2.5 Flash)', async () => {
      return await callProvider('gemini', 'Respond with: "Gemini Online"', 'You are a health checker.');
    }));
  } else {
    checks.push(Promise.resolve({ name: 'Google Gemini', status: 'NOT CONFIGURED', detail: 'Missing GEMINI_API_KEY in .env' }));
  }

  // 3. Cloudflare
  if (env.CLOUDFLARE_API_TOKEN) {
    checks.push(testProvider('cloudflare', 'Cloudflare Workers AI', async () => {
      return await callProvider('cloudflare', 'Respond with: "Cloudflare Online"', 'You are a health checker.');
    }));
  } else {
    checks.push(Promise.resolve({ name: 'Cloudflare Workers AI', status: 'NOT CONFIGURED', detail: 'Missing CLOUDFLARE_API_TOKEN in .env' }));
  }

  // 4. OpenRouter
  if (env.OPENROUTER_API_KEY) {
    checks.push(testProvider('openrouter', 'OpenRouter', async () => {
      return await callProvider('openrouter', 'Respond with: "OpenRouter Online"', 'You are a health checker.');
    }));
  } else {
    checks.push(Promise.resolve({ name: 'OpenRouter', status: 'NOT CONFIGURED', detail: 'Missing OPENROUTER_API_KEY in .env' }));
  }

  const results = await Promise.all(checks);

  results.forEach((r, idx) => {
    const symbol = r.status === 'ONLINE' ? '✔' : (r.status === 'ERROR' ? '✖' : '○');
    console.log(`${idx + 1}. [${symbol}] ${r.name}`);
    console.log(`   Status  : ${r.status}`);
    if (r.latency) console.log(`   Latency : ${r.latency}`);
    console.log(`   Detail  : ${r.detail}\n`);
  });

  const online = results.filter(r => r.status === 'ONLINE');
  console.log('================================================================');
  console.log(`READY DEBATE AGENTS: ${online.length} / ${results.length}`);
  if (online.length >= 2) {
    console.log(`✔ SUFFICIENT AGENTS FOR MULTI-MODEL DEBATE & CONSENSUS!`);
  } else if (online.length === 1) {
    console.log(`✔ Single AI Supervisor active.`);
  }
  console.log('================================================================\n');
}

main().catch(console.error);
