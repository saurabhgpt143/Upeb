const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

let replaced = content.replace(/formatRow\((['\`][^,]+?['\`]),\s*(['\`][^,]+?['\`]),\s*([^,]+?),\s*(.+?)\)/g, (match, param1, param2, param3, param4) => {
    let idSrc = param1;
    let id = idSrc.replace(/['\`]/g, '').replace(/\\$\\{[^}]+\\}/g, '').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().replace(/_+/g, '_').replace(/^_|_$/g, '');
    return "formatRow('" + id + "', " + param1 + ", " + param2 + ", " + param3 + ", " + param4 + ")";
});

fs.writeFileSync('src/App.tsx', replaced);
console.log('Fixed formatRow calls');
