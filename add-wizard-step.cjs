const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace tab navigation component
const tabNavStart = `            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex gap-1 overflow-x-auto">
              {[
                { id: 'project', label: 'Project', icon: <Building className="w-4 h-4" /> },
                { id: 'envelope', label: 'Envelope', icon: <DraftingCompass className="w-4 h-4" /> },
                { id: 'environment', label: 'Environment', icon: <Wind className="w-4 h-4" /> },
                { id: 'materials', label: 'Materials', icon: <ClipboardList className="w-4 h-4" /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setConfigTab(tab.id as any)}
                  className={\`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors \${
                    configTab === tab.id 
                      ? 'bg-blue-50 text-blue-700 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }\`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>`;

const newTabNav = `            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
              {[
                { id: 'project', label: '1', name: 'Project' },
                { id: 'envelope', label: '2', name: 'Envelope' },
                { id: 'environment', label: '3', name: 'Structure' },
                { id: 'materials', label: '4', name: 'Takeoff' }
              ].map((tab, idx) => {
                 const stepKeys = ['project', 'envelope', 'environment', 'materials'];
                 const currentIdx = stepKeys.indexOf(configTab);
                 let status = 'upcoming';
                 if (currentIdx === idx) status = 'current';
                 else if (idx < currentIdx) status = 'completed';
                 
                 return (
                 <button
                  key={tab.id}
                  onClick={() => setConfigTab(tab.id as any)}
                  className="flex flex-col items-center gap-1.5 z-10 px-2 transition-colors focus:outline-none"
                >
                  <div className={\`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all duration-300 \${
                    status === 'current' ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-110' :
                    status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' :
                    'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                  }\`}>
                    {status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-white" /> : tab.label}
                  </div>
                  <span className={\`text-[10px] uppercase tracking-wider font-bold \${status === 'current' ? 'text-blue-700' : status === 'completed' ? 'text-emerald-600' : 'text-slate-400'}\`}>
                    {tab.name}
                  </span>
                </button>
               )})}
            </div>`;

content = content.replace(tabNavStart, newTabNav);


// Add Next/Previous buttons at the end of the config tabs
const configEndMarker = `            )}
          </div>

          {/* Right Column: Workflow Phase Timeline & Visualizer */}`;

const navButtons = `
            {/* Step Navigation Controls */}
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
              {(() => {
                const stepKeys = ['project', 'envelope', 'environment', 'materials'];
                const currentIdx = stepKeys.indexOf(configTab);
                
                return (
                  <>
                    <button
                      onClick={() => currentIdx > 0 && setConfigTab(stepKeys[currentIdx - 1] as any)}
                      disabled={currentIdx === 0}
                      className={\`px-4 py-2 rounded-lg text-sm font-semibold transition-colors \${
                        currentIdx === 0 
                          ? 'text-slate-300 cursor-not-allowed opacity-50' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }\`}
                    >
                      &larr; Previous Step
                    </button>
                    
                    <button
                      onClick={() => currentIdx < stepKeys.length - 1 ? setConfigTab(stepKeys[currentIdx + 1] as any) : setShowMaterialEstimate(true)}
                      className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                      {currentIdx < stepKeys.length - 1 ? 'Next Step &rarr;' : 'View Complete BOM'}
                    </button>
                  </>
                );
              })()}
            </div>
            )}
          </div>

          {/* Right Column: Workflow Phase Timeline & Visualizer */}`;

content = content.replace(configEndMarker, navButtons);


fs.writeFileSync('src/App.tsx', content);
console.log('Wizard UI added.');
