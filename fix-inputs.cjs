const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const nameOnChangeTarget = `                                  onChange={(e) => {
                                      const val = e.target.value;
                                      const o = specs.materialOverrides?.[row.id] || {};
                                      setSpecs({...specs, materialOverrides: {...specs.materialOverrides, [row.id]: {...o, name: val}}});
                                  }}`;

const nameOnChangeRepl = `                                  onChange={(e) => {
                                      const val = e.target.value;
                                      if (row.isAdditional) {
                                        setSpecs(s => ({
                                          ...s,
                                          additionalItems: s.additionalItems?.map(item => item.id === row.id ? { ...item, name: val } : item)
                                        }));
                                      } else {
                                        const o = specs.materialOverrides?.[row.id] || {};
                                        setSpecs({...specs, materialOverrides: {...specs.materialOverrides, [row.id]: {...o, name: val}}});
                                      }
                                  }}`;

const qtyOnChangeTarget = `                                  onChange={(e) => {
                                      const val = e.target.value === '' ? '' : Number(e.target.value);
                                      const o = specs.materialOverrides?.[row.id] || {};
                                      setSpecs({...specs, materialOverrides: {...specs.materialOverrides, [row.id]: {...o, qty: val}}});
                                  }}`;

const qtyOnChangeRepl = `                                  onChange={(e) => {
                                      const val = e.target.value === '' ? '' : Number(e.target.value);
                                      if (row.isAdditional) {
                                        setSpecs(s => ({
                                          ...s,
                                          additionalItems: s.additionalItems?.map(item => item.id === row.id ? { ...item, qty: val } : item)
                                        }));
                                      } else {
                                        const o = specs.materialOverrides?.[row.id] || {};
                                        setSpecs({...specs, materialOverrides: {...specs.materialOverrides, [row.id]: {...o, qty: val}}});
                                      }
                                  }}`;

const priceOnChangeTarget = `                                     onChange={(e) => {
                                         const val = e.target.value === '' ? '' : Number(e.target.value);
                                         const o = specs.materialOverrides?.[row.id] || {};
                                         setSpecs({...specs, materialOverrides: {...specs.materialOverrides, [row.id]: {...o, price: val}}});
                                     }}`;

const priceOnChangeRepl = `                                     onChange={(e) => {
                                         const val = e.target.value === '' ? '' : Number(e.target.value);
                                         if (row.isAdditional) {
                                            setSpecs(s => ({
                                              ...s,
                                              additionalItems: s.additionalItems?.map(item => item.id === row.id ? { ...item, price: val } : item)
                                            }));
                                         } else {
                                            const o = specs.materialOverrides?.[row.id] || {};
                                            setSpecs({...specs, materialOverrides: {...specs.materialOverrides, [row.id]: {...o, price: val}}});
                                         }
                                     }}`;

content = content.replace(nameOnChangeTarget, nameOnChangeRepl);
content = content.replace(qtyOnChangeTarget, qtyOnChangeRepl);
content = content.replace(priceOnChangeTarget, priceOnChangeRepl);

// For additional items, we should also track them being added to the overall cost, if we didn't already
// The issue is `additionalRows` doesn't get added to the `totalCost` variable inside generateMaterialsEstimate. Let's fix that.
const additionalSectionTarget = `      createSection('Additional Items', additionalRows);
    }`;

const additionalSectionRepl = `      createSection('Additional Items', additionalRows);
      additionalRows.forEach(row => totalCost += row.total);
    }`;

content = content.replace(additionalSectionTarget, additionalSectionRepl);

fs.writeFileSync('src/App.tsx', content);
console.log('Inputs fixed for additional items');
