const fs = require('fs');

// We will simulate loading trotro-network.js to see what nearestStops returns
const networkCode = fs.readFileSync('c:/Users/Spark Marley/Desktop/reimagine/trotro-network.js', 'utf8');

// We need to evaluate it in a context
const script = `
  var globalThis = {};
  var window = globalThis;
  var module = { exports: {} };
  ${networkCode}
  module.exports.nearestStops([-0.1554, 5.5682], 10);
`;

try {
  const result = eval(script);
  console.log(result);
} catch(e) {
  console.error(e);
}
