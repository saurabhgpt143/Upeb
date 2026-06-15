const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/\s*totalCost \+= parseInt.*?;/g, '');
content = content.replace(/\s*sheetingRows\.forEach\(row => \(totalCost \+= parseInt.*?\)\);/g, '');
content = content.replace(/\s*validAccRows\.forEach\(row => \(totalCost \+= parseInt.*?\)\);/g, '');
content = content.replace(/\s*validHardwareRows\.forEach\(row => \(totalCost \+= parseInt.*?\)\);/g, '');
fs.writeFileSync('src/App.tsx', content);
