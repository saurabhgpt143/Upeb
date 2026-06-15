const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  'const colPcscalc = Math.ceil((effectivePrimary * colRatio * 1000) / colUnitWt);',
  'const colPcscalc = totalColumns;'
);
app = app.replace(
  'const rafPcscalc = Math.ceil((effectivePrimary * (1 - colRatio) * 1000) / rafUnitWt);',
  'const rafPcscalc = totalRafters;'
);

app = app.replace(
  'const colPcs = Math.ceil((colTons * 1000) / colUnitWt);',
  'const colPcs = totalColumns;'
);

app = app.replace(
  'const rafPcs = Math.ceil((rafTons * 1000) / rafUnitWt);',
  'const rafPcs = totalRafters;'
);

app = app.replace(
  'const purlinPcs = Math.ceil((purlinTons * 1000) / purlinUnitWt);',
  'const purlinPcs = totalPurlins;'
);

app = app.replace(
  'const girtPcs = Math.ceil((girtTons * 1000) / girtUnitWt);',
  'const girtPcs = totalGirts;'
);

app = app.replace(
  "primaryPcsForBasePlates = colPcs + rafPcs;",
  "primaryPcsForBasePlates = totalColumns + totalRafters;"
);

fs.writeFileSync('src/App.tsx', app);
console.log('BOM counts updated');
