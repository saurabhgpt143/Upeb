const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  /`\$\{colPcscalc\} Columns & \$\{rafPcscalc\} Rafters`/,
  '`${colPcscalc} sections & ${rafPcscalc} sections (6m stock)`'
);

app = app.replace(
  /formatRow\('columns_colprofile', `Columns \(\$\{colProfile\}\)`, 'pcs', colPcs, Math.round\(colPricePerPc\)\)/g,
  "formatRow('columns_colprofile', `Columns (${colProfile})`, '6m pcs', colPcs, Math.round(colPricePerPc))"
);

app = app.replace(
  /formatRow\('rafters_rafprofile', `Rafters \(\$\{rafProfile\}\)`, 'pcs', rafPcs, Math.round\(rafPricePerPc\)\)/g,
  "formatRow('rafters_rafprofile', `Rafters (${rafProfile})`, '6m pcs', rafPcs, Math.round(rafPricePerPc))"
);

app = app.replace(
  /formatRow\('purlins_purlinprofile', `Purlins \(\$\{purlinProfile\}\)`, 'pcs', purlinPcs, Math.round\(purlinPricePerPc\)\)/g,
  "formatRow('purlins_purlinprofile', `Purlins (${purlinProfile})`, '6m pcs', purlinPcs, Math.round(purlinPricePerPc))"
);

app = app.replace(
  /formatRow\('girts_girtprofile', `Girts \(\$\{girtProfile\}\)`, 'pcs', girtPcs, Math.round\(girtPricePerPc\)\)/g,
  "formatRow('girts_girtprofile', `Girts (${girtProfile})`, '6m pcs', girtPcs, Math.round(girtPricePerPc))"
);

fs.writeFileSync('src/App.tsx', app);
console.log('Fixed labels');
