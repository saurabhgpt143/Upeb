const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const startStr = ": { specs: ProjectSpecs, setSpecs: (specs: ProjectSpecs) => void }) {";
let startIdx = app.indexOf(startStr);
if (startIdx !== -1) {
  // Find the closing bracket of this ghost function
  let openBrackets = 0;
  let endIdx = -1;
  for (let i = startIdx + startStr.length; i < app.length; i++) {
     if (app[i] === '{') openBrackets++;
     else if (app[i] === '}') {
        openBrackets--;
        if (openBrackets === -1) {
           endIdx = i;
           break;
        }
     }
  }
  if (endIdx !== -1) {
     app = app.substring(0, startIdx) + app.substring(endIdx + 1);
     fs.writeFileSync('src/App.tsx', app);
     console.log('Cleaned up the ghost ColorVisualizer body!');
  } else {
     console.log('Could not find end bracket for the ghost body');
  }
} else {
  console.log('Ghost body start not found');
}
