const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const oldStr = 'className="flex flex-col items-center gap-1.5 z-10 px-2 transition-colors focus:outline-none"';
const newStr = 'className="flex flex-col items-center gap-1.5 z-10 px-2 transition-colors focus:outline-none shrink-0"';

if (app.includes(oldStr)) {
  app = app.replace(oldStr, newStr);
  fs.writeFileSync('src/App.tsx', app);
  console.log('Fixed flex shrink!');
}
