const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `{row.isAdditional && (
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
                                  )}`;

const replStr = `{row.isAdditional ? (
                                    <button
                                      onClick={() => {
                                        setSpecs(s => ({
                                          ...s,
                                          additionalItems: s.additionalItems?.filter(item => item.id !== row.id)
                                        }));
                                      }}
                                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                                      title="Remove item"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  ) : (row.overrideName !== undefined || row.overrideQty !== undefined || row.overridePrice !== undefined) ? (
                                    <button
                                      onClick={() => {
                                        const o = { ...specs.materialOverrides };
                                        delete o[row.id];
                                        setSpecs(s => ({
                                          ...s,
                                          materialOverrides: o
                                        }));
                                      }}
                                      className="text-indigo-400 hover:text-indigo-600 transition-colors p-1"
                                      title="Reset to default"
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                    </button>
                                  ) : <div className="w-6" />}`;

content = content.replace(targetStr, replStr);
fs.writeFileSync('src/App.tsx', content);
console.log('Fixed row resets');
