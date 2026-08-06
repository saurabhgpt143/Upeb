const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// remove lines like: totalCost += parseInt(colRow[4].replace(/[^\\d]/g, ''), 10);
content = content.replace(/\\s*totalCost \\+= parseInt\\([^\\)]+\\)\\.replace[^;]+;/g, '');

fs.writeFileSync('src/App.tsx', content);
console.log('Removed duplicate totalCost additions');
