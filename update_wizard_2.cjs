const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const navControlsIdx = app.indexOf('{/* Step Navigation Controls */}');
const configProjectIdx = app.indexOf("{configTab === 'project' && (");

const before = app.substring(0, configProjectIdx);
const after = app.substring(navControlsIdx);

// We need to construct the panels.

const newPanels = `
            {configTab === 'project' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-500" />
                    Project Details
                  </h3>
                </div>
                <div className="p-5 flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Project Name</label>
                      <input 
                        type="text" 
                        value={projectName} 
                        onChange={(e) => setProjectName(e.target.value)}
                        className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Target Budget</label>
                      <input 
                        type="number" 
                        value={targetBudget} 
                        onChange={(e) => setTargetBudget(Number(e.target.value))}
                        className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-100">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Width (m)</label>
                      <input type="number" value={specs.width} onChange={(e) => setSpecs({...specs, width: Number(e.target.value)})} className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Length (m)</label>
                      <input type="number" value={specs.length} onChange={(e) => setSpecs({...specs, length: Number(e.target.value)})} className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Eave Height (m)</label>
                      <input type="number" value={specs.eaveHeight} onChange={(e) => setSpecs({...specs, eaveHeight: Number(e.target.value)})} className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {configTab === 'primary' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-500" />
                    Primary Structure
                  </h3>
                </div>
                <div className="p-5 flex flex-col gap-5">
                   <label className="flex items-center gap-2 cursor-pointer p-4 border rounded-xl bg-slate-50 border-slate-200">
                     <input type="checkbox" checked={specs.hasPrimarySteel !== false} onChange={(e) => setSpecs({...specs, hasPrimarySteel: e.target.checked})} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                     <div>
                       <span className="text-base font-medium text-slate-800 block">Include Primary Steel</span>
                       <span className="text-xs text-slate-500">Columns & Rafters</span>
                     </div>
                   </label>
                   
                   {specs.hasPrimarySteel !== false && (
                     <div className="flex flex-col gap-1 pt-2">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Frame Design</label>
                        <select className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" value={specs.frameType} onChange={(e) => setSpecs({...specs, frameType: e.target.value as any})}>
                          <option value="Clear Span">Clear Span</option>
                          <option value="Multi-Span">Multi-Span (Interior Columns)</option>
                        </select>
                     </div>
                   )}
                </div>
              </div>
            )}

            {configTab === 'secondary' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <AlignJustify className="w-4 h-4 text-slate-500" />
                    Supporting Structure
                  </h3>
                </div>
                <div className="p-5 flex flex-col gap-5">
                   <label className="flex items-center gap-2 cursor-pointer p-4 border rounded-xl bg-slate-50 border-slate-200">
                     <input type="checkbox" checked={specs.hasSecondarySteel !== false} onChange={(e) => setSpecs({...specs, hasSecondarySteel: e.target.checked})} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                     <div>
                       <span className="text-base font-medium text-slate-800 block">Include Purlins (Roof)</span>
                       <span className="text-xs text-slate-500">Secondary structure for the roof</span>
                     </div>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer p-4 border rounded-xl bg-slate-50 border-slate-200">
                     <input type="checkbox" checked={specs.hasGirts !== false} onChange={(e) => setSpecs({...specs, hasGirts: e.target.checked})} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                     <div>
                       <span className="text-base font-medium text-slate-800 block">Include Girts (Walls)</span>
                       <span className="text-xs text-slate-500">Secondary structure for the walls</span>
                     </div>
                   </label>
                </div>
              </div>
            )}

            {configTab === 'hardware' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-slate-500" />
                    Hardware
                  </h3>
                </div>
                <div className="p-5 flex flex-col gap-5">
                   <p className="text-sm text-slate-600">
                     Base plates, splice plates, high-strength bolts, and welding consumables are calculated automatically based on the primary and secondary structural requirements.
                   </p>
                </div>
              </div>
            )}

            {configTab === 'roofing' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-slate-500" />
                    Roofing
                  </h3>
                </div>
                <div className="p-5 flex flex-col gap-5">
                   <label className="flex items-center gap-2 cursor-pointer p-4 border rounded-xl bg-slate-50 border-slate-200">
                     <input type="checkbox" checked={specs.hasRoof !== false} onChange={(e) => setSpecs({...specs, hasRoof: e.target.checked})} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                     <div>
                       <span className="text-base font-medium text-slate-800 block">Include Roof Sheeting</span>
                       <span className="text-xs text-slate-500">Outer cladding for the roof</span>
                     </div>
                   </label>

                   {specs.hasRoof !== false && (
                     <>
                        <div className="flex flex-col gap-1 pt-2">
                          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Roof Type</label>
                          <select className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" value={specs.roofType} onChange={(e) => setSpecs({...specs, roofType: e.target.value as any})}>
                            <option value="Single Slope">Single Slope</option>
                            <option value="Hut-shaped">Hut-shaped (Gable)</option>
                            <option value="Multi-Sloped Hut">Multi-Sloped (Monitor/Dropped)</option>
                            <option value="Curved">Curved Pitch</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Slope / Pitch (%)</label>
                          <input type="number" value={specs.roofSlope} onChange={(e) => setSpecs({...specs, roofSlope: Number(e.target.value)})} className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Profile</label>
                          <select className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" value={specs.roofProfile} onChange={(e) => setSpecs({...specs, roofProfile: e.target.value as any})}>
                            <option value="7v Profile">7v Profile (210mm pitch, 28-30mm depth)</option>
                            <option value="6v Profile">6v Profile (330mm pitch, 32-35mm depth)</option>
                            <option value="Standard">Standard Corrugated</option>
                          </select>
                        </div>
                        
                        <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
                           <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Primary Color</label>
                           <div className="flex gap-2 flex-wrap items-center">
                             {STANDARD_COLORS.map(c => (
                               <button key={c.hex} className={\`w-7 h-7 rounded-full border transition-transform \${specs.roofColor === c.hex ? 'border-slate-900 scale-125 shadow-md' : 'border-slate-300 shadow-sm hover:scale-110'}\`} style={{ backgroundColor: c.hex }} onClick={() => setSpecs({...specs, roofColor: c.hex})} title={c.name} />
                             ))}
                             <RALInput value={specs.roofColor || '#0089b6'} onChange={(v) => setSpecs({...specs, roofColor: v})} />
                           </div>
                        </div>

                        <div className="pt-2">
                           <label className="flex items-center gap-2 cursor-pointer pb-2">
                             <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" checked={specs.alternateColors} onChange={(e) => setSpecs({...specs, alternateColors: e.target.checked})} />
                             <span className="text-sm font-medium text-slate-700">Enable Alternate Sheet Colors</span>
                           </label>
                           {specs.alternateColors && (
                             <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                               <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Alternate Color</label>
                               <div className="flex gap-2 flex-wrap items-center">
                                 {STANDARD_COLORS.map(c => (
                                   <button key={\`alt-roof-\${c.hex}\`} className={\`w-6 h-6 rounded-full border \${specs.alternateRoofColor === c.hex ? 'border-slate-900 scale-125' : 'border-slate-300'}\`} style={{ backgroundColor: c.hex }} onClick={() => setSpecs({...specs, alternateRoofColor: c.hex})} />
                                 ))}
                                 <RALInput value={specs.alternateRoofColor || '#d3d3d3'} onChange={(v) => setSpecs({...specs, alternateRoofColor: v})} />
                               </div>
                               <div className="flex gap-2 items-center mt-2">
                                 <label className="text-xs font-semibold text-slate-600">Ratio (Standard : Alt)</label>
                                 <select className="p-1 text-sm border border-slate-300 rounded w-24 bg-white" value={specs.alternateRoofRatio || 2} onChange={(e) => setSpecs({...specs, alternateRoofRatio: parseInt(e.target.value)})}>
                                   <option value={2}>1 : 1</option>
                                   <option value={3}>2 : 1</option>
                                   <option value={4}>3 : 1</option>
                                   <option value={5}>4 : 1</option>
                                 </select>
                               </div>
                             </div>
                           )}
                        </div>
                     </>
                   )}
                </div>
              </div>
            )}

            {configTab === 'walling' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-slate-500" />
                    Walling
                  </h3>
                </div>
                <div className="p-5 flex flex-col gap-5">
                   <label className="flex items-center gap-2 cursor-pointer p-4 border rounded-xl bg-slate-50 border-slate-200">
                     <input type="checkbox" checked={specs.hasWalls !== false} onChange={(e) => setSpecs({...specs, hasWalls: e.target.checked})} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                     <div>
                       <span className="text-base font-medium text-slate-800 block">Include Wall Cladding</span>
                       <span className="text-xs text-slate-500">Outer sheeting for the walls</span>
                     </div>
                   </label>

                   {specs.hasWalls !== false && (
                     <>
                        <div className="flex flex-col gap-1 pt-2">
                          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Profile</label>
                          <select className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" value={specs.wallProfile} onChange={(e) => setSpecs({...specs, wallProfile: e.target.value as any})}>
                            <option value="7v Profile">7v Profile</option>
                            <option value="6v Profile">6v Profile</option>
                            <option value="Standard">Standard Corrugated</option>
                          </select>
                        </div>
                        
                        <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
                           <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Primary Color</label>
                           <div className="flex gap-2 flex-wrap items-center">
                             {STANDARD_COLORS.map(c => (
                               <button key={c.hex} className={\`w-7 h-7 rounded-full border transition-transform \${specs.wallColor === c.hex ? 'border-slate-900 scale-125 shadow-md' : 'border-slate-300 shadow-sm hover:scale-110'}\`} style={{ backgroundColor: c.hex }} onClick={() => setSpecs({...specs, wallColor: c.hex})} title={c.name} />
                             ))}
                             <RALInput value={specs.wallColor || '#e7ebda'} onChange={(v) => setSpecs({...specs, wallColor: v})} />
                           </div>
                        </div>

                        <div className="pt-2">
                           <label className="flex items-center gap-2 cursor-pointer pb-2">
                             <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" checked={specs.alternateColors} onChange={(e) => setSpecs({...specs, alternateColors: e.target.checked})} />
                             <span className="text-sm font-medium text-slate-700">Enable Alternate Sheet Colors</span>
                           </label>
                           {specs.alternateColors && (
                             <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                               <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Alternate Color</label>
                               <div className="flex gap-2 flex-wrap items-center">
                                 {STANDARD_COLORS.map(c => (
                                   <button key={\`alt-wall-\${c.hex}\`} className={\`w-6 h-6 rounded-full border \${specs.alternateWallColor === c.hex ? 'border-slate-900 scale-125' : 'border-slate-300'}\`} style={{ backgroundColor: c.hex }} onClick={() => setSpecs({...specs, alternateWallColor: c.hex})} />
                                 ))}
                                 <RALInput value={specs.alternateWallColor || '#d3d3d3'} onChange={(v) => setSpecs({...specs, alternateWallColor: v})} />
                               </div>
                               <div className="flex gap-2 items-center mt-2">
                                 <label className="text-xs font-semibold text-slate-600">Ratio (Standard : Alt)</label>
                                 <select className="p-1 text-sm border border-slate-300 rounded w-24 bg-white" value={specs.alternateWallRatio || 2} onChange={(e) => setSpecs({...specs, alternateWallRatio: parseInt(e.target.value)})}>
                                   <option value={2}>1 : 1</option>
                                   <option value={3}>2 : 1</option>
                                   <option value={4}>3 : 1</option>
                                   <option value={5}>4 : 1</option>
                                 </select>
                               </div>
                             </div>
                           )}
                        </div>
                     </>
                   )}
                </div>
              </div>
            )}

            {configTab === 'accessories' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <List className="w-4 h-4 text-slate-500" />
                    Accessories
                  </h3>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {[
                     { k: 'hasRidgeCap', lbl: 'Ridge Cap' },
                     { k: 'hasGutters', lbl: 'Gutters' },
                     { k: 'hasGables', lbl: 'Gable/Rake Flashing' },
                     { k: 'hasCornerFlashing', lbl: 'Corner Flashing' },
                     { k: 'hasEndFlashing', lbl: 'End Flashing' },
                     { k: 'hasDownPipes', lbl: 'Down Pipes' },
                     { k: 'hasTurboVents', lbl: 'Turbo Vents' },
                     { k: 'hasLouvers', lbl: 'Louvers' },
                     { k: 'hasInsulation', lbl: 'Bubble Insulation' },
                     { k: 'hasPolySheets', lbl: 'Polycarbonate Sheets' },
                     { k: 'hasMSFlats', lbl: 'Mild Steel Flats' },
                     { k: 'hasFlanges', lbl: 'Flanges' },
                     { k: 'hasProfileGate', lbl: 'Profile Gate' },
                     { k: 'hasWindows', lbl: 'Windows' },
                     { k: 'hasCrimpedSheets', lbl: 'Crimped Sheets' }
                   ].map(opt => (
                     <label key={opt.k} className="flex items-center gap-2 cursor-pointer border border-slate-200 rounded p-2 hover:bg-slate-50">
                        <input type="checkbox" checked={(specs as any)[opt.k] !== false} onChange={(e) => setSpecs({...specs, [opt.k]: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                        <span className="text-sm font-medium text-slate-700">{opt.lbl}</span>
                     </label>
                   ))}
                </div>
              </div>
            )}

            {configTab === 'fasteners' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-slate-500" />
                    Fasteners
                  </h3>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {[
                     { k: 'hasSDScrews', lbl: 'Self-Drilling Screws' },
                     { k: 'hasSilicon', lbl: 'Silicon Sealant' },
                     { k: 'hasPVCCaps', lbl: 'PVC Caps' }
                   ].map(opt => (
                     <label key={opt.k} className="flex items-center gap-2 cursor-pointer border border-slate-200 rounded p-2 hover:bg-slate-50">
                        <input type="checkbox" checked={(specs as any)[opt.k] !== false} onChange={(e) => setSpecs({...specs, [opt.k]: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded border-slate-300" />
                        <span className="text-sm font-medium text-slate-700">{opt.lbl}</span>
                     </label>
                   ))}
                </div>
              </div>
            )}

            {configTab === 'takeoff' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-slate-500" />
                    Required Materials Estimate
                  </h3>
                  <button onClick={() => setShowMaterialEstimate(true)} className="p-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 text-xs font-semibold">View BOM</button>
                </div>
              <div className="p-5">
                <MaterialVisualizer 
                  primary={parseFloat(primarySteel)} 
                  secondary={parseFloat(secondarySteel)}
                  roof={roofAreaNum}
                  wall={wallAreaNum}
                  specs={specs}
                />
              </div>
            </div>
            )}
`;

app = before + newPanels + after;

// Now remove the ColorVisualizer component completely and its usage in the bottom.
const colorVisDefStart = "function ColorVisualizer({ specs, setSpecs }: { specs: ProjectSpecs, setSpecs: (specs: ProjectSpecs) => void }) {";
const colorVisDefStartIdx = app.indexOf(colorVisDefStart);
if (colorVisDefStartIdx !== -1) {
    let brackets = 0;
    let colorVisEndIdx = -1;
    for (let i = colorVisDefStartIdx; i < app.length; i++) {
        if (app[i] === '{') brackets++;
        else if (app[i] === '}') {
            brackets--;
            if (brackets === 0) {
                colorVisEndIdx = i;
                break;
            }
        }
    }
    if (colorVisEndIdx !== -1) {
        app = app.substring(0, colorVisDefStartIdx) + app.substring(colorVisEndIdx + 1);
    }
}

app = app.replace('<ColorVisualizer specs={specs} setSpecs={setSpecs} />', '');

fs.writeFileSync('src/App.tsx', app);
console.log('Update 2 done');
