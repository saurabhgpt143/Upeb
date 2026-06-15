const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  'const totalRafters = numFrames * 2;',
  'let totalRafters = numFrames * 2;'
);

app = app.replace(
  'rafterLinearMeasurement = (rl * 2) * numFrames;\n  }',
  `rafterLinearMeasurement = (rl * 2) * numFrames;
  }
  totalRafters = numFrames * raftersPerFrame;`
);

fs.writeFileSync('src/App.tsx', app);
console.log('Fixed rafters');
