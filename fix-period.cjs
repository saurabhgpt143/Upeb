const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'Life Cycle.',
  'Life Cycle'
);

fs.writeFileSync('src/App.tsx', content);
