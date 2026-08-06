const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  'const colPcscalc = totalColumns;',
  'const colPcscalc = Math.ceil(columnLinearMeasurement / 6);'
);
app = app.replace(
  'const rafPcscalc = totalRafters;',
  'const rafPcscalc = Math.ceil(rafterLinearMeasurement / 6);'
);

app = app.replace(
  'const colPcs = totalColumns;',
  'const colPcs = Math.ceil(columnLinearMeasurement / 6);'
);
app = app.replace(
  'const rafPcs = totalRafters;',
  'const rafPcs = Math.ceil(rafterLinearMeasurement / 6);'
);

app = app.replace(
  'const purlinPcs = totalPurlins;',
  'const purlinPcs = Math.ceil((purlinRunsPerFrame * specs.length) / 6);'
);
app = app.replace(
  'const girtPcs = totalGirts;',
  'const girtPcs = Math.ceil((girtRuns * specs.length * 2 + girtRuns * specs.width * 2) / 6);'
);

fs.writeFileSync('src/App.tsx', app);
console.log('Fixed pieces calculations to assume 6m standard stock.');
