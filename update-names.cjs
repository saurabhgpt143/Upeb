const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /\`High-Strength & Machine Bolts \(\$\{nutBoltProfile\}\), Anchor Bolts\`/,
  '\`12*50mm Nut Bolt\`'
);

content = content.replace(
  /\`Base Plates \(\$\{basePlateProfile\}\), Gussets, Cleats, Stiffeners, Paint\`/,
  '\`Base Plates (8 x 200 x 200mm)\`'
);

fs.writeFileSync('src/App.tsx', content);
console.log('Names updated');
