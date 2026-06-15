const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const oldStr = '<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex justify-between items-center relative overflow-hidden">';
const newStr = '<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex justify-start items-center gap-6 relative overflow-x-auto whitespace-nowrap hide-scrollbar">';

if (app.includes(oldStr)) {
   app = app.replace(oldStr, newStr);
   // add minimal css to index.css for hiding scrollbar
   let css = fs.readFileSync('src/index.css', 'utf8');
   if (!css.includes('.hide-scrollbar')) {
      css += `\\n\\n.hide-scrollbar::-webkit-scrollbar { display: none; }\\n.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`;
      fs.writeFileSync('src/index.css', css);
   }
   fs.writeFileSync('src/App.tsx', app);
   console.log('Made wizard scrollable horizonally!');
} else {
   console.log('Could not find the navigation container in App.tsx');
}
