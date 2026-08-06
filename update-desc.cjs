const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Update ProjectSpecs
content = content.replace(
  /materialOverrides\?: \{ \[key: string\]: \{ qty\?: number \| ''; price\?: number \| '' \} \};/,
  "materialOverrides?: { [key: string]: { qty?: number | ''; price?: number | ''; name?: string } };"
);

// 2. Update formatRow
const formatRowTarget = `          return { id, name, unit, qty: q, price: p, defaultQty, defaultPrice, overrideQty: o?.qty, overridePrice: o?.price, total: Math.round(q * p), formatted: [name, unit, q.toLocaleString('en-IN'), \`Rs. \${p.toLocaleString('en-IN')}\`, \`Rs. \${Math.round(q * p).toLocaleString('en-IN')}\`] };`;
const formatRowReplacement = `          return { id, name: o?.name !== undefined ? o.name : name, defaultName: name, overrideName: o?.name, unit, qty: q, price: p, defaultQty, defaultPrice, overrideQty: o?.qty, overridePrice: o?.price, total: Math.round(q * p), formatted: [o?.name !== undefined ? o.name : name, unit, q.toLocaleString('en-IN'), \`Rs. \${p.toLocaleString('en-IN')}\`, \`Rs. \${Math.round(q * p).toLocaleString('en-IN')}\`] };`;

content = content.replace(formatRowTarget, formatRowReplacement);

// 3. Update table rendering
const rowNameTarget = `<td className="px-4 py-3 text-slate-800 font-medium whitespace-normal min-w-[200px]">{row.name}</td>`;
const rowNameReplacement = `<td className="px-4 py-3 text-slate-800 font-medium whitespace-normal min-w-[200px] p-0">
                                <textarea
                                  className={\`w-full bg-transparent border-0 focus:ring-2 focus:ring-inset focus:ring-indigo-500 px-4 py-3 hover:bg-slate-50 transition-colors resize-none overflow-hidden \${row.overrideName !== undefined ? 'text-indigo-600 font-bold' : ''}\`}
                                  value={row.overrideName !== undefined ? row.overrideName : row.defaultName}
                                  onChange={(e) => {
                                      const val = e.target.value;
                                      const o = specs.materialOverrides?.[row.id] || {};
                                      setSpecs({...specs, materialOverrides: {...specs.materialOverrides, [row.id]: {...o, name: val}}});
                                  }}
                                  rows={1}
                                  onInput={(e: any) => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                  }}
                                  placeholder={row.defaultName}
                                />
                              </td>`;

content = content.replace(rowNameTarget, rowNameReplacement);

fs.writeFileSync('src/App.tsx', content);
console.log('Description edit implemented');
