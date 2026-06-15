const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// Fix text label in specs
app = app.replace(
  "{ label: 'Standard Embedment Depth', value: `${(Math.max(0.6, specs.eaveHeight * 0.12)).toFixed(2)}m`, category: 'Foundation & Civil' },",
  "{ label: 'Standard Embedment Depth', value: `${Math.max(0.6, Math.round(specs.eaveHeight * 0.15 * 10) / 10).toFixed(1)}m`, category: 'Foundation & Civil' },"
);

// Fix in visualizer
app = app.replace(
  "const fDepth = Math.max(0.6, h * 0.12) + 0.3;",
  "const fDepth = Math.max(0.6, Math.round(h * 0.15 * 10) / 10) + 0.3;"
);

// Fix in SVG
app = app.replace(
  "const fDepth = Math.max(0.6, specs.eaveHeight * 0.12);",
  "const fDepth = Math.max(0.6, Math.round(specs.eaveHeight * 0.15 * 10) / 10);"
);
app = app.replace(
  "{(fDepth + 0.3).toFixed(2)}m</text>",
  "{(fDepth + 0.3).toFixed(1)}m</text>"
);

fs.writeFileSync('src/App.tsx', app);
console.log('Fixed depth precision');
