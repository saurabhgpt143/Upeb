const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace accessoryOverrides with materialOverrides
content = content.replace(/specs\\.accessoryOverrides/g, 'specs.materialOverrides');
content = content.replace(/accessoryOverrides\\?:/g, 'materialOverrides?:');

// Also update the EditableAccessoryRow to use materialOverrides key in setSpecs
content = content.replace(/accessoryOverrides: \\{ \\.\\.\\.overrides/g, 'materialOverrides: { ...overrides');

fs.writeFileSync('src/App.tsx', content);
console.log('Unified overrides');
