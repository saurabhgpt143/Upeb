const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `    const createSection = (title: string, rows: any[]) => {
      if (rows.length === 0) return;
      sections.push({ title, rows });
      rows.forEach(row => {
          totalCost += parseInt(row[4].replace(/[^\\d]/g, ''), 10);
      });
    };`;

const replacement1 = `    const createSection = (title: string, rows: any[]) => {
      if (rows.length === 0) return;
      sections.push({ title, rows });
      rows.forEach(row => {
          totalCost += row.total;
      });
    };`;

content = content.replace(target1, replacement1);

const target2 = `    const formatRow = (name: string, unit: string, qty: number, price: number) => {
       if (qty > 0) {
          return [name, unit, qty.toLocaleString('en-IN'), \`Rs. \${price.toLocaleString('en-IN')}\`, \`Rs. \${Math.round(qty * price).toLocaleString('en-IN')}\`];
       }
       return null;
    };`;

const replacement2 = `    const formatRow = (id: string, name: string, unit: string, defaultQty: number, defaultPrice: number) => {
       const o = specs.materialOverrides?.[id];
       const q = o?.qty !== undefined ? o.qty : defaultQty;
       const p = o?.price !== undefined ? o.price : defaultPrice;
       if (q > 0) {
          return { id, name, unit, qty: q, price: p, total: Math.round(q * p), formatted: [name, unit, q.toLocaleString('en-IN'), \`Rs. \${p.toLocaleString('en-IN')}\`, \`Rs. \${Math.round(q * p).toLocaleString('en-IN')}\`] };
       }
       return null;
    };`;

content = content.replace(target2, replacement2);

const target3 = `    const override = (key: string, name: string, unit: string, defaultQty: number, defaultPrice: number) => {
        const o = specs.accessoryOverrides?.[key];
        return formatRow(name, unit, o?.qty ?? defaultQty, o?.price ?? defaultPrice);
    };`;
    
const replacement3 = `    const override = (key: string, name: string, unit: string, defaultQty: number, defaultPrice: number) => {
        return formatRow(key, name, unit, defaultQty, defaultPrice);
    };`;

content = content.replace(target3, replacement3);

fs.writeFileSync('src/App.tsx', content);
console.log('Done replacement');
