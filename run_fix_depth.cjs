const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// Fix text label
app = app.replace(
  '{(Math.max(1.5, specs.eaveHeight * 0.2) + 0.5).toFixed(1)}m',
  '{(Math.max(0.6, specs.eaveHeight * 0.12) + 0.3).toFixed(2)}m'
);

// Fix model 
app = app.replace(
  'const fDepth = Math.max(1.5, h * 0.2);',
  'const fDepth = Math.max(0.6, h * 0.12) + 0.3;'
);

// Fix SVG - Part 1
app = app.replace(
  'const fDepth = Math.max(1.5, specs.eaveHeight * 0.2);',
  'const fDepth = Math.max(0.6, specs.eaveHeight * 0.12);' // Will add footing base dynamically
);

// Fix SVG rects
app = app.replace(/height=\{0\.5 \* scale\}/g, 'height={0.3 * scale}');

// Fix SVG labels
app = app.replace(/\+ 0\.5 \* scale/g, '+ 0.3 * scale');
app = app.replace(/\(fDepth \+ 0\.5\)\.toFixed\(1\)/g, '(fDepth + 0.3).toFixed(2)');

fs.writeFileSync('src/App.tsx', app);
console.log('Fixed depth');
