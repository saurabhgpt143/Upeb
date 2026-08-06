const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/onClick=\{\(e\) => handlePanelClick\(e, `\$\{keyLeft\}_\$\{j\}`, specs\.wallColor \|\| '#0089b6', 'wall'\)\}_\$\{j\}`, specs\.wallColor \|\| '#0089b6', 'wall'\)}>/g, "onClick={(e) => handlePanelClick(e, `${keyLeft}_${j}`, specs.wallColor || '#0089b6', 'wall')}>");
c = c.replace(/onClick=\{\(e\) => handlePanelClick\(e, `\$\{keyRight\}_\$\{j\}`, specs\.wallColor \|\| '#0089b6', 'wall'\)\}_\$\{j\}`, specs\.wallColor \|\| '#0089b6', 'wall'\)}>/g, "onClick={(e) => handlePanelClick(e, `${keyRight}_${j}`, specs.wallColor || '#0089b6', 'wall')}>");
c = c.replace(/onClick=\{\(e\) => handlePanelClick\(e, keyFront, specs\.wallColor \|\| '#0089b6', 'wall'\)\}, keyFront, specs\.wallColor \|\| '#0089b6', 'wall'\)}>/g, "onClick={(e) => handlePanelClick(e, keyFront, specs.wallColor || '#0089b6', 'wall')}>");
c = c.replace(/onClick=\{\(e\) => handlePanelClick\(e, keyBack, specs\.wallColor \|\| '#0089b6', 'wall'\)\}, keyBack, specs\.wallColor \|\| '#0089b6', 'wall'\)}>/g, "onClick={(e) => handlePanelClick(e, keyBack, specs.wallColor || '#0089b6', 'wall')}>");
c = c.replace(/onClick=\{\(e\) => handlePanelClick\(e, segKey, isSkylight \? 'transparent' : \(specs\.roofColor \|\| '#0089b6'\), 'roof'\)\}, segKey, isSkylight \? 'transparent' : \(specs\.roofColor \|\| '#0089b6'\), 'roof'\)}>/g, "onClick={(e) => handlePanelClick(e, segKey, isSkylight ? 'transparent' : (specs.roofColor || '#0089b6'), 'roof')}>");
c = c.replace(/onClick=\{\(e\) => handlePanelClick\(e, key, isSkylight \? 'transparent' : \(specs\.roofColor \|\| '#0089b6'\), 'roof'\)\}, key, isSkylight \? 'transparent' : \(specs\.roofColor \|\| '#0089b6'\), 'roof'\)}>/g, "onClick={(e) => handlePanelClick(e, key, isSkylight ? 'transparent' : (specs.roofColor || '#0089b6'), 'roof')}>");

fs.writeFileSync('src/App.tsx', c);
