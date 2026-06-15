const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace standard input styles
const classTextArea = `className={\`w-full bg-transparent border-0 focus:ring-2 focus:ring-inset focus:ring-indigo-500 px-4 py-3 hover:bg-slate-50 transition-colors resize-none overflow-hidden \${row.overrideName !== undefined ? 'text-indigo-600 font-bold' : ''}\`}`;
const newClassTextArea = `className={\`w-full bg-transparent border-b border-dashed focus:border-solid border-slate-300 focus:border-indigo-500 focus:ring-0 px-4 py-3 hover:bg-slate-50 transition-colors resize-none overflow-hidden \${row.overrideName !== undefined ? 'text-indigo-600 font-medium' : ''}\`}`;

const classInputQty = `className={\`w-full text-right bg-transparent border-0 focus:ring-2 focus:ring-inset focus:ring-indigo-500 px-4 py-3 hover:bg-slate-50 transition-colors \${row.overrideQty !== undefined ? 'text-indigo-600 font-bold' : ''}\`}`;
const newClassInputQty = `className={\`w-full text-right bg-transparent border-b border-dashed focus:border-solid border-slate-300 focus:border-indigo-500 focus:ring-0 px-4 py-3 hover:bg-slate-50 transition-colors \${row.overrideQty !== undefined ? 'text-indigo-600 font-medium' : ''}\`}`;

const classInputPrice = `className={\`w-full text-right bg-transparent border-0 focus:ring-2 focus:ring-inset focus:ring-indigo-500 pl-8 pr-4 py-3 hover:bg-slate-50 transition-colors \${row.overridePrice !== undefined ? 'text-indigo-600 font-bold' : ''}\`}`;
const newClassInputPrice = `className={\`w-full text-right bg-transparent border-b border-dashed focus:border-solid border-slate-300 focus:border-indigo-500 focus:ring-0 pl-8 pr-4 py-3 hover:bg-slate-50 transition-colors \${row.overridePrice !== undefined ? 'text-indigo-600 font-medium' : ''}\`}`;

const classInputUnit = `className="w-full text-center bg-transparent border-0 focus:ring-2 focus:ring-inset focus:ring-indigo-500 px-2 py-3 hover:bg-slate-50 transition-colors"`;
const newClassInputUnit = `className="w-full text-center bg-transparent border-b border-dashed focus:border-solid border-slate-300 focus:border-indigo-500 focus:ring-0 px-2 py-3 hover:bg-slate-50 transition-colors"`;

content = content.replace(classTextArea, newClassTextArea);
content = content.replace(classInputQty, newClassInputQty);
content = content.replace(classInputPrice, newClassInputPrice);
content = content.replace(classInputUnit, newClassInputUnit);

fs.writeFileSync('src/App.tsx', content);
console.log('User friendliness added to inputs');
