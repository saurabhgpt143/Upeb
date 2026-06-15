const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  "{ label: 'Standard Embedment Depth', value: `${Math.max(0.6, Math.round(specs.eaveHeight * 0.15 * 10) / 10).toFixed(1)}m`, category: 'Foundation & Civil' },",
  "{ label: 'Standard Embedment Depth', value: `${Math.max(0.6, Math.round(specs.eaveHeight * 0.2 * 10) / 10).toFixed(1)}m`, category: 'Foundation & Civil' },"
);

app = app.replace(
  "const fDepth = Math.max(0.6, Math.round(h * 0.15 * 10) / 10) + 0.3;",
  "const fDepth = Math.max(0.6, Math.round(h * 0.2 * 10) / 10) + 0.3;"
);

app = app.replace(
  "const fDepth = Math.max(0.6, Math.round(specs.eaveHeight * 0.15 * 10) / 10);",
  "const fDepth = Math.max(0.6, Math.round(specs.eaveHeight * 0.2 * 10) / 10);"
);

fs.writeFileSync('src/App.tsx', app);
console.log('Fixed depth scale');
