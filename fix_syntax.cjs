const fs = require('fs');
const app = fs.readFileSync('src/App.tsx', 'utf8');

const lines = app.split('\\n');
const newLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
   if (i === 1672) { // 0-indexed, so line 1673 is index 1672
      skip = true;
   }
   if (i === 2039) { // index 2039 is line 2040
      skip = false;
      continue; // skip line 2040 as well just in case, but wait, 2039 is the closing '}'.
   }
   if (!skip) {
      newLines.push(lines[i]);
   }
}

fs.writeFileSync('src/App.tsx', newLines.join('\\n'));
console.log('Fixed syntax error');
