const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const oldStr = `<div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Eave Height (m)</label>
                      <input type="number" value={specs.eaveHeight} onChange={(e) => setSpecs({...specs, eaveHeight: Number(e.target.value)})} className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}`;

const newStr = `<div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Eave Height (m)</label>
                      <input type="number" value={specs.eaveHeight} onChange={(e) => setSpecs({...specs, eaveHeight: Number(e.target.value)})} className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                     <label className="flex items-center gap-2 cursor-pointer border rounded-lg p-3 bg-slate-50 flex-1 hover:border-blue-300">
                        <input type="checkbox" checked={specs.highWindVelocity} onChange={(e) => setSpecs({...specs, highWindVelocity: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                        <span className="text-sm font-medium text-slate-700">High Wind Velocity</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer border rounded-lg p-3 bg-slate-50 flex-1 hover:border-blue-300">
                        <input type="checkbox" checked={specs.snowLoad} onChange={(e) => setSpecs({...specs, snowLoad: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                        <span className="text-sm font-medium text-slate-700">Snow Load Conditions</span>
                     </label>
                  </div>
                </div>
              </div>
            )}`;

app = app.replace(oldStr, newStr);
fs.writeFileSync('src/App.tsx', app);
console.log('Added env factors internally');
