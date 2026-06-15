const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Define the new WIZARD_STEPS
const stepsStr = `
const WIZARD_STEPS = [
  { id: 'project', label: '1', name: 'Dimensions & Location' },
  { id: 'primary', label: '2', name: 'Primary Structure' },
  { id: 'secondary', label: '3', name: 'Supporting Structure' },
  { id: 'hardware', label: '4', name: 'Hardware' },
  { id: 'roofing', label: '5', name: 'Roofing' },
  { id: 'walling', label: '6', name: 'Walling' },
  { id: 'accessories', label: '7', name: 'Accessories' },
  { id: 'fasteners', label: '8', name: 'Fasteners' },
  { id: 'takeoff', label: '9', name: 'Takeoff' }
];
const WIZARD_KEYS = WIZARD_STEPS.map(s => s.id);
`;

// Insert it somewhere at the top, e.g. after VISUAL_DICTIONARY or right before the App component
const appCompStart = `export default function App() {`;
content = content.replace(appCompStart, stepsStr + '\n' + appCompStart);

// 2. Change the useState type for configTab
content = content.replace(
  `const [configTab, setConfigTab] = useState<'project' | 'envelope' | 'environment' | 'materials'>('project');`,
  `const [configTab, setConfigTab] = useState('project');`
);

// 3. Replace the wizard navigation renderer
const navRendererRe = /\{\[\s*\{\s*id:\s*'project'.*?\]\.map\(\s*\(tab,\s*idx\)\s*=>\s*\{\s*const\s*stepKeys\s*=\s*\['project',\s*'envelope',\s*'environment',\s*'materials'\];\s*const\s*currentIdx\s*=\s*stepKeys\.indexOf\(configTab\);/s;

content = content.replace(navRendererRe, `
              {WIZARD_STEPS.map((tab, idx) => {
                 const currentIdx = WIZARD_KEYS.indexOf(configTab);`);


const navCtrlRe = /const\s*stepKeys\s*=\s*\['project',\s*'envelope',\s*'environment',\s*'materials'\];\s*const\s*currentIdx\s*=\s*stepKeys\.indexOf\(configTab\);/s;

content = content.replace(navCtrlRe, `
                const stepKeys = WIZARD_KEYS;
                const currentIdx = stepKeys.indexOf(configTab);`);

fs.writeFileSync('src/App.tsx', content);
console.log('Update 1 done');
