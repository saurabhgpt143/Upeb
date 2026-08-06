const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Update materialOverrides type
content = content.replace(/materialOverrides\?:\s*\{\s*\[key: string\]:\s*\{\s*qty\?:\s*number;\s*price\?:\s*number\s*\}\s*;\s*\}/g, 
  "materialOverrides?: { [key: string]: { qty?: number | ''; price?: number | '' } }");

// 2. Update formatRow
content = content.replace(/const q = o\?\.qty !== undefined \? o\.qty : defaultQty;/g, "const q = o?.qty !== undefined ? (o.qty === '' ? 0 : Number(o.qty)) : defaultQty;");
content = content.replace(/const p = o\?\.price !== undefined \? o\.price : defaultPrice;/g, "const p = o?.price !== undefined ? (o.price === '' ? 0 : Number(o.price)) : defaultPrice;");
content = content.replace(/if \(q > 0\) \{/g, "if (q >= 0) {");

// 3. Update inputs
content = content.replace(/value=\{row\.overrideQty !== undefined \? row\.overrideQty : ''\}/g, "value={row.overrideQty !== undefined ? row.overrideQty : row.defaultQty}");
content = content.replace(/const val = e\.target\.value === '' \? undefined : Number\(e\.target\.value\);\s*const o = specs\.materialOverrides\?\.\[row\.id\] \|\| \{\};\s*setSpecs\(\{\.\.\.specs, materialOverrides: \{\.\.\.specs\.materialOverrides, \[row\.id\]: \{\.\.\.o, qty: val\}\}\}\);/g, "const val = e.target.value === '' ? '' : Number(e.target.value);\n                                      const o = specs.materialOverrides?.[row.id] || {};\n                                      setSpecs({...specs, materialOverrides: {...specs.materialOverrides, [row.id]: {...o, qty: val}}});");

content = content.replace(/value=\{row\.overridePrice !== undefined \? row\.overridePrice : ''\}/g, "value={row.overridePrice !== undefined ? row.overridePrice : row.defaultPrice}");
content = content.replace(/const val = e\.target\.value === '' \? undefined : Number\(e\.target\.value\);\s*const o = specs\.materialOverrides\?\.\[row\.id\] \|\| \{\};\s*setSpecs\(\{\.\.\.specs, materialOverrides: \{\.\.\.specs\.materialOverrides, \[row\.id\]: \{\.\.\.o, price: val\}\}\}\);/g, "const val = e.target.value === '' ? '' : Number(e.target.value);\n                                         const o = specs.materialOverrides?.[row.id] || {};\n                                         setSpecs({...specs, materialOverrides: {...specs.materialOverrides, [row.id]: {...o, price: val}}});");

fs.writeFileSync('src/App.tsx', content);
console.log("Fixed values");
