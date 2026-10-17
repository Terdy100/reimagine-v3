/**
 * ============================================================================
 * MULTI-PROVIDER AI CLIENT & ENGINE (Groq + Gemini + Cloudflare + OpenRouter)
 * ============================================================================
 * Supports multi-model routing and automatic failover.
 */

const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.substring(0, idx).trim();
        const v = trimmed.substring(idx + 1).trim();
        env[k] = v.replace(/^['"](.*)['"]$/, '$1');
      }
    }
  }
  return env;
}

const env = loadEnv();

const PROVIDERS = {
  groq: {
    name: 'Groq (120B / Llama)',
    apiKey: process.env.GROQ_API_KEY || env.GROQ_API_KEY,
    call: async (prompt, systemPrompt, key) => {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        signal: AbortSignal.timeout(12000),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2
        })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Groq HTTP ${res.status}: ${errText}`);
      }
      const data = await res.json();
      return data.choices[0].message.content;
    }
  },
  gemini: {
    name: 'Google Gemini (3.8 Flash)',
    apiKey: process.env.GEMINI_API_KEY || env.GEMINI_API_KEY,
    call: async (prompt, systemPrompt, key) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: 'POST',
        signal: AbortSignal.timeout(12000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2
          }
        })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini HTTP ${res.status}: ${errText}`);
      }
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
  },
  cloudflare: {
    name: 'Cloudflare Workers AI',
    apiKey: process.env.CLOUDFLARE_API_TOKEN || env.CLOUDFLARE_API_TOKEN,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || env.CLOUDFLARE_ACCOUNT_ID,
    call: async (prompt, systemPrompt, token, accountId) => {
      if (!accountId) throw new Error('Cloudflare requires CLOUDFLARE_ACCOUNT_ID in .env');
      const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`;
      const res = await fetch(url, {
        method: 'POST',
        signal: AbortSignal.timeout(12000),
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ]
        })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Cloudflare HTTP ${res.status}: ${errText}`);
      }
      const data = await res.json();
      return data.result?.response || '';
    }
  },
  openrouter: {
    name: 'OpenRouter',
    apiKey: process.env.OPENROUTER_API_KEY || env.OPENROUTER_API_KEY,
    call: async (prompt, systemPrompt, key) => {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: AbortSignal.timeout(12000),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2
        })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OpenRouter HTTP ${res.status}: ${errText}`);
      }
      const data = await res.json();
      return data.choices[0].message.content;
    }
  }
};

/**
 * Call a specific provider by name ('groq', 'gemini', 'cloudflare', 'openrouter')
 */
async function callProvider(providerKey, prompt, systemPrompt) {
  const p = PROVIDERS[providerKey];
  if (!p || !p.apiKey) {
    throw new Error(`Provider ${providerKey} is not configured with an API key.`);
  }
  return await p.call(prompt, systemPrompt, p.apiKey, p.accountId);
}

/**
 * Execute a query with automatic failover across all configured providers.
 */
async function queryWithFailover(prompt, systemPrompt) {
  const order = ['groq', 'gemini', 'cloudflare', 'openrouter'];
  for (const k of order) {
    const p = PROVIDERS[k];
    if (!p.apiKey) continue;
    try {
      const text = await p.call(prompt, systemPrompt, p.apiKey, p.accountId);
      return { success: true, provider: p.name, text };
    } catch (e) {
      console.warn(`[Failover] ${p.name} failed (${e.message}). Trying next provider...`);
    }
  }
  return { success: false, reason: 'All configured AI providers failed.' };
}

module.exports = {
  PROVIDERS,
  callProvider,
  queryWithFailover,
  loadEnv
};
