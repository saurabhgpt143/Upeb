const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove import
code = code.replace(/import jsQR from 'jsqr';\n/, '');

// Remove QRScanner component
const qrRegex = /const QRScanner = \(\{ onScan, onClose(.|[\r\n])*?\n};\n/m;
code = code.replace(qrRegex, '');

// Remove projectHistory state
const historyRegex = /  interface HistoryLog \{[\s\S]*?const \[projectHistory, setProjectHistory\] = useState<HistoryLog\[\]>\(\[[\s\S]*?\]\);\n/m;
code = code.replace(historyRegex, '');

// Remove projectHistory useEffect
const effectRegex = /  const isFirstRender = React.useRef\(true\);\n\n  React.useEffect\(\(\) => \{[\s\S]*?setProjectHistory\(prev => \[newLog, \.\.\.prev\]\);\n  \}, \[specs\.width, specs\.length, specs\.eaveHeight, specs\.roofType, specs\.frameType\]\);\n/m;
code = code.replace(effectRegex, '');

// Remove handleQRCodeScan
const scanRegex = /  const handleQRCodeScan = useCallback\(\(data: string\) => \{[\s\S]*?\}, \[\]\);\n/m;
code = code.replace(scanRegex, '');

// Remove showScanner state
const showScannerRegex = /  const \[showScanner, setShowScanner\] = useState\(false\);\n/m;
code = code.replace(showScannerRegex, '');

// Remove Project History Log HTML block
const logBlockRegex = /            \{\/\* Project History Log \*\/\}[\s\S]*?<\/div>\n            <\/div>\n/m;
code = code.replace(logBlockRegex, '');

// Remove QR Scanner modal rendering
const modalRegex = /      \{showScanner && <QRScanner onScan=\{handleQRCodeScan\} onClose=\{\(\) => setShowScanner\(false\)\} \/>\}\n/m;
code = code.replace(modalRegex, '');

fs.writeFileSync('src/App.tsx', code);
console.log('Refactoring finished.');
