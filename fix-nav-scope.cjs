const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldStr = `            {/* Step Navigation Controls */}
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">`;

const newStr = `            )}
            
            {/* Step Navigation Controls */}
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">`;

content = content.replace(oldStr, newStr);

const oldStr2 = `                  </>
                );
              })()}
            </div>
            )}
          </div>

          {/* Right Column: Workflow Phase Timeline & Visualizer */}`;

const newStr2 = `                  </>
                );
              })()}
            </div>
          </div>

          {/* Right Column: Workflow Phase Timeline & Visualizer */}`;

content = content.replace(oldStr2, newStr2);
fs.writeFileSync('src/App.tsx', content);
console.log('Fixed nav buttons scope');
