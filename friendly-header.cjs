const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetHeader = `<h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 whitespace-nowrap">
                  <ClipboardList className="w-5 h-5 text-indigo-500" />
                  Bill of Materials.
                </h2>`;

const replHeader = `<div className="flex flex-col">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 whitespace-nowrap">
                    <ClipboardList className="w-5 h-5 text-indigo-500" />
                    Bill of Materials
                  </h2>
                  <p className="text-sm text-slate-500 ml-7 mt-0.5">
                    Click any field below to edit descriptions, quantities, and prices.
                  </p>
                </div>`;

content = content.replace(targetHeader, replHeader);

fs.writeFileSync('src/App.tsx', content);
console.log('Friendly header added');
