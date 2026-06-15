const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("const [projectName, setProjectName] = useState('Alpha Warehouse');",
  "const [projectName, setProjectName] = useState('Alpha Warehouse');\n  const [dimensionUnit, setDimensionUnit] = useState<'m' | 'ft'>('m');");

const gridReplacement = `
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                    <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Dimension Unit</label>
                      <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                          onClick={() => setDimensionUnit('m')}
                          className={\`flex-1 py-1.5 text-xs font-medium rounded-md transition-all \${dimensionUnit === 'm' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}\`}
                        >
                          Meters
                        </button>
                        <button
                          onClick={() => setDimensionUnit('ft')}
                          className={\`flex-1 py-1.5 text-xs font-medium rounded-md transition-all \${dimensionUnit === 'ft' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}\`}
                        >
                          Feet
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-100">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Width ({dimensionUnit === 'm' ? 'm' : 'ft'})</label>
                      <input type="number" 
                        value={dimensionUnit === 'm' ? specs.width : Number((specs.width * 3.28084).toFixed(2))} 
                        onChange={(e) => setSpecs({...specs, width: dimensionUnit === 'm' ? Number(e.target.value) : Number(e.target.value) * 0.3048})} 
                        className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Length ({dimensionUnit === 'm' ? 'm' : 'ft'})</label>
                      <input type="number" 
                        value={dimensionUnit === 'm' ? specs.length : Number((specs.length * 3.28084).toFixed(2))} 
                        onChange={(e) => setSpecs({...specs, length: dimensionUnit === 'm' ? Number(e.target.value) : Number(e.target.value) * 0.3048})} 
                        className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Eave Height ({dimensionUnit === 'm' ? 'm' : 'ft'})</label>
                      <input type="number" 
                        value={dimensionUnit === 'm' ? specs.eaveHeight : Number((specs.eaveHeight * 3.28084).toFixed(2))} 
                        onChange={(e) => setSpecs({...specs, eaveHeight: dimensionUnit === 'm' ? Number(e.target.value) : Number(e.target.value) * 0.3048})} 
                        className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                      />
                    </div>
                  </div>
`;

code = code.replace(/<div className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-100">[\s\S]*?(?=<\/div>\s*<\/div>\s*<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">)/, gridReplacement);

fs.writeFileSync('src/App.tsx', code);
