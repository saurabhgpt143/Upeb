const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetTotal = `<td className="px-4 py-3 text-slate-800 text-right font-mono font-medium whitespace-nowrap" title={\`₹\${row.total.toLocaleString('en-IN')}\`}>
                                 ₹{row.total.toLocaleString('en-IN')}
                              </td>`;

const replTotal = `<td className="px-4 py-3 text-slate-800 text-right font-mono font-medium whitespace-nowrap" title={\`₹\${row.total.toLocaleString('en-IN')}\`}>
                                <div className="flex items-center justify-end gap-2">
                                  <span>₹{row.total.toLocaleString('en-IN')}</span>
                                  {row.isAdditional && (
                                    <button
                                      onClick={() => {
                                        setSpecs(s => ({
                                          ...s,
                                          additionalItems: s.additionalItems?.filter(item => item.id !== row.id)
                                        }));
                                      }}
                                      className="text-red-400 hover:text-red-600 transition-colors"
                                      title="Remove item"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>`;

content = content.replace(targetTotal, replTotal);

// Also need to fix the case where item.unit might be editable. Let's make unit an input if isAdditional.
const targetUnit = `<td className="px-4 py-3 text-slate-500 text-center bg-slate-50/50">{row.unit}</td>`;
const replUnit = `<td className="px-4 py-3 text-slate-500 text-center bg-slate-50/50 p-0 relative">
                                {row.isAdditional ? (
                                  <input
                                    type="text"
                                    className="w-full text-center bg-transparent border-0 focus:ring-2 focus:ring-inset focus:ring-indigo-500 px-2 py-3 hover:bg-slate-50 transition-colors"
                                    value={row.unit}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setSpecs(s => ({
                                        ...s,
                                        additionalItems: s.additionalItems?.map(item => item.id === row.id ? { ...item, unit: val } : item)
                                      }));
                                    }}
                                  />
                                ) : (
                                  <div className="py-3 px-4">{row.unit}</div>
                                )}
                              </td>`;

content = content.replace(targetUnit, replUnit);

fs.writeFileSync('src/App.tsx', content);
console.log('Added remove functionality and unit editing');
