// Replace table row rendering
const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetTable = `<tbody className="divide-y divide-slate-100">
                          {section.rows.map((row: any, rIdx: number) => (
                            <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3 text-slate-800 font-medium whitespace-normal min-w-[200px]">{row[0]}</td>
                              <td className="px-4 py-3 text-slate-500 text-center">{row[1]}</td>
                              <td className="px-4 py-3 text-slate-700 text-right font-mono">{row[2]}</td>
                              <td className="px-4 py-3 text-slate-700 text-right font-mono">{row[3]}</td>
                              <td className="px-4 py-3 text-slate-800 text-right font-mono font-medium">{row[4]}</td>
                            </tr>
                          ))}
                        </tbody>`;

const newTable = `<tbody className="divide-y divide-slate-100">
                          {section.rows.map((row: any, rIdx: number) => (
                            <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3 text-slate-800 font-medium whitespace-normal min-w-[200px]">{row.name}</td>
                              <td className="px-4 py-3 text-slate-500 text-center bg-slate-50/50">{row.unit}</td>
                              <td className="px-4 py-3 text-slate-700 text-right font-mono p-0">
                                <input
                                  type="number"
                                  className="w-full text-right bg-transparent border-0 focus:ring-2 focus:ring-inset focus:ring-indigo-500 px-4 py-3 hover:bg-slate-50 transition-colors"
                                  value={row.qty}
                                  onChange={(e) => {
                                      const val = e.target.value === '' ? undefined : Number(e.target.value);
                                      const o = specs.materialOverrides?.[row.id] || {};
                                      setSpecs({...specs, materialOverrides: {...specs.materialOverrides, [row.id]: {...o, qty: val}}});
                                  }}
                                  placeholder={row.qty?.toString()}
                                />
                              </td>
                              <td className="px-4 py-3 text-slate-700 text-right font-mono p-0 max-w-[120px]">
                                 <div className="flex items-center w-full">
                                   <span className="text-slate-400 pl-4">₹</span>
                                   <input
                                     type="number"
                                     className="w-full text-right bg-transparent border-0 focus:ring-2 focus:ring-inset focus:ring-indigo-500 px-4 py-3 hover:bg-slate-50 transition-colors"
                                     value={row.price}
                                     onChange={(e) => {
                                         const val = e.target.value === '' ? undefined : Number(e.target.value);
                                         const o = specs.materialOverrides?.[row.id] || {};
                                         setSpecs({...specs, materialOverrides: {...specs.materialOverrides, [row.id]: {...o, price: val}}});
                                     }}
                                     placeholder={row.price?.toString()}
                                   />
                                 </div>
                              </td>
                              <td className="px-4 py-3 text-slate-800 text-right font-mono font-medium max-w-[140px] truncate" title={\`₹\${row.total.toLocaleString('en-IN')}\`}>
                                 ₹{row.total.toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>`;

content = content.replace(targetTable, newTable);

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed table body');
