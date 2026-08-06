const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const baseQty = `className={\`w-full text-right bg-transparent border-b border-dashed focus:border-solid border-slate-300 focus:border-indigo-500 focus:ring-0 px-4 py-3 hover:bg-slate-50 transition-colors \${row.overrideQty !== undefined ? 'text-indigo-600 font-medium' : ''}\`}`;
const newQty = `className={\`w-full text-right bg-transparent border-b border-dashed focus:border-solid border-slate-300 focus:border-indigo-500 focus:ring-0 px-4 py-3 hover:bg-slate-50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none \${row.overrideQty !== undefined ? 'text-indigo-600 font-medium' : ''}\`}`;

const basePrice = `className={\`w-full text-right bg-transparent border-b border-dashed focus:border-solid border-slate-300 focus:border-indigo-500 focus:ring-0 pl-8 pr-4 py-3 hover:bg-slate-50 transition-colors \${row.overridePrice !== undefined ? 'text-indigo-600 font-medium' : ''}\`}`;
const newPrice = `className={\`w-full text-right bg-transparent border-b border-dashed focus:border-solid border-slate-300 focus:border-indigo-500 focus:ring-0 pl-8 pr-4 py-3 hover:bg-slate-50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none \${row.overridePrice !== undefined ? 'text-indigo-600 font-medium' : ''}\`}`;

content = content.replace(baseQty, newQty);
content = content.replace(basePrice, newPrice);

fs.writeFileSync('src/App.tsx', content);
console.log('Removed spinners from number inputs');
