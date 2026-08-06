const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /materialOverrides\?: \{ \[key: string\]: \{ qty\?: number \| ''; price\?: number \| ''; name\?: string \} \};/,
  "materialOverrides?: { [key: string]: { qty?: number | ''; price?: number | ''; name?: string } };\n  additionalItems?: { id: string; name: string; unit: string; qty: number | ''; price: number | '' }[];"
);

// We need to add the "Additional Items" section in generateMaterialsEstimate.
// Look for "return { sections, totalCost };"
const miscSectionLastLine = "       }\n    }";

content = content.replace(
  /return \{ sections, totalCost \};\n  \}, \[specs, /g,
  `if (specs.additionalItems && specs.additionalItems.length > 0) {
      const additionalRows = specs.additionalItems.map(item => {
        const q = item.qty === '' ? 0 : Number(item.qty);
        const p = item.price === '' ? 0 : Number(item.price);
        return {
          id: item.id,
          name: item.name,
          unit: item.unit,
          qty: q,
          price: p,
          defaultQty: q,
          defaultPrice: p,
          overrideQty: item.qty,
          overridePrice: item.price,
          total: Math.round(q * p),
          isAdditional: true,
          formatted: [item.name, item.unit, q.toLocaleString('en-IN'), \`Rs. \${p.toLocaleString('en-IN')}\`, \`Rs. \${Math.round(q * p).toLocaleString('en-IN')}\`]
        };
      });
      createSection('Additional Items', additionalRows);
    }
    
    return { sections, totalCost };\n  }, [specs, `
);

// We need to render the "Add Item" button in the Bill of Materials Modal.
const addBtnHtml = `
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => {
                          const newItem = { id: 'add_item_' + Date.now(), name: 'New Item', unit: 'pcs', qty: 1, price: 0 };
                          setSpecs(s => ({...s, additionalItems: [...(s.additionalItems || []), newItem]}));
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Custom Item
                      </button>
                    </div>`;

// Insert after the sections mapping loop
content = content.replace(
  /\{\/\* Estimate Summary \*\/\}/,
  `${addBtnHtml}\n            {/* Estimate Summary */}`
);

// We need to make sure Plus icon is imported from lucide-react if not already. But Plus is probably imported?
// Let's check imports. Just append Plus to lucide imports if not there.

fs.writeFileSync('src/App.tsx', content);
console.log('Additional items support added.');
