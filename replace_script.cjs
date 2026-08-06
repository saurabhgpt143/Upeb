const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /\`\$\{roofArea\} m² \(\~\$\{/g, 
  '`${dimensionUnit === \'ft\' ? (parseFloat(roofArea) * 10.7639).toFixed(0) : roofArea} ${dimensionUnit === \'ft\' ? \'sq.ft\' : \'m²\'} (~${'
);

code = code.replace(
  /\`\$\{wallArea\} m² \(\~\$\{/g,
  '`${dimensionUnit === \'ft\' ? (parseFloat(wallArea) * 10.7639).toFixed(0) : wallArea} ${dimensionUnit === \'ft\' ? \'sq.ft\' : \'m²\'} (~${'
);

code = code.replace(
  /linear meters\)\`/g,
  '${dimensionUnit === \'ft\' ? \'linear ft\' : \'linear meters\'})`'
);

code = code.replace(
  /: \`\$\{(columnLinearMeasurement|rafterLinearMeasurement)\.toFixed\(1\)\} meters\`/g,
  ': `${dimensionUnit === \'ft\' ? ($1 * 3.28084).toFixed(1) : $1.toFixed(1)} ${dimensionUnit === \'ft\' ? \'ft\' : \'meters\'}`'
);

code = code.replace(
  /: \`\$\{specs\.(length|width)\} meters\`/g,
  ': `${dimensionUnit === \'ft\' ? (specs.$1 * 3.28084).toFixed(1) : specs.$1} ${dimensionUnit === \'ft\' ? \'ft\' : \'meters\'}`'
);

code = code.replace(
  /<p className="text-lg font-semibold text-slate-800 font-mono leading-none">\{area.toLocaleString\(\)\} \{dimensionUnit === 'ft' \? ' sq.ft' : ' m²'\}<\/p>/g,
  '<p className="text-lg font-semibold text-slate-800 font-mono leading-none">{dimensionUnit === \'ft\' ? (area * 10.7639).toLocaleString(\'en-US\', {maximumFractionDigits:0}) : area.toLocaleString(\'en-US\', {maximumFractionDigits:0})} {dimensionUnit === \'ft\' ? \'sq.ft\' : \'m²\'}</p>'
);

fs.writeFileSync('src/App.tsx', code);
