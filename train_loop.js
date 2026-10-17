/**
 * ============================================================================
 * CONTINUOUS TROTRO ROUTE TRAINING & AUDIT LOOP
 * ============================================================================
 * 1. Compiles the latest routes.
 * 2. Runs the benchmark test suite.
 * 3. Audits failing or warning journeys via configured AI providers (Groq/Gemini/OpenRouter).
 * 4. Reports readiness for deployment to live app.
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('====================================================');
console.log('STARTING TROTRO ROUTE TRAINING & AUDIT WORKFLOW');
console.log('====================================================\n');

try {
  // Step 1: Autonomous Territorial Corridor Expansion
  console.log('[Step 1/4] Expanding next unmapped transit corridor into network...');
  try {
    execSync('node route_expander/expand.js --next', {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit'
    });
  } catch (expErr) {
    console.warn('[Expansion Note] Could not expand next corridor:', expErr.message);
  }

  // Step 2: Compile & Reconcile Network
  console.log('\n[Step 2/4] Compiling and reconciling routes...');
  execSync('node compiler/build_trained_network.js', {
    cwd: __dirname,
    stdio: 'inherit'
  });

  // Step 3: Run Benchmark Suite
  console.log('\n[Step 3/4] Running automated commute test suite...');
  execSync('node test_runner.js', {
    cwd: __dirname,
    stdio: 'inherit'
  });

  // Step 4: Run AI Commuter Auditor
  console.log('\n[Step 4/4] Running AI Commuter Knowledge Auditor...');
  execSync('node ai_auditor/ai_route_evaluator.js', {
    cwd: __dirname,
    stdio: 'inherit'
  });

  console.log('\n====================================================');
  console.log('TRAINING RUN COMPLETE');
  console.log('Trained bundle ready in: network_trainer/dist/trotro-network.trained.js');
  console.log('====================================================');
} catch (err) {
  console.error('\nTraining loop encountered an error:', err.message);
}
