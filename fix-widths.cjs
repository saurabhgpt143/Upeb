const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/max-w-\[120px\]/g, 'min-w-[140px]');
content = content.replace(/max-w-\[140px\] truncate/g, 'whitespace-nowrap');
content = content.replace(/w-32 text-right/g, 'min-w-[140px] text-right');

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed widths');
