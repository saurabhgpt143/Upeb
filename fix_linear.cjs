const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const oldLogic = `
  let columnLinearMeasurement = 0;
  if (specs.frameType === 'Clear Span') {
    columnLinearMeasurement = totalColumns * specs.eaveHeight;
  } else {
    // 2 outer columns per frame
    let outerColsLen = numFrames * 2 * specs.eaveHeight;
    // 1 inner column per frame (usually at center)
    let innerColHeight = specs.eaveHeight;
    if (specs.roofType === 'Single Slope') {
       innerColHeight = specs.eaveHeight + (specs.width / 2) * (specs.roofSlope / 100);
    } else if (specs.roofType === 'Multi-Sloped Hut') {
       innerColHeight = specs.eaveHeight + (specs.width / 4) * (specs.roofSlope * 1.5 / 100) + (specs.width / 4) * (specs.roofSlope * 0.5 / 100);
    } else if (specs.roofType === 'Curved') {
       innerColHeight = specs.eaveHeight + (specs.width / 2) * (specs.roofSlope / 100) * 1.5;
    } else {
       innerColHeight = specs.eaveHeight + (specs.width / 2) * (specs.roofSlope / 100);
    }
    columnLinearMeasurement = outerColsLen + (numFrames * innerColHeight);
  }
`;

const newLogic = `
  const embedmentDepth = Math.max(0.6, Math.round(specs.eaveHeight * 0.2 * 10) / 10);
  let columnLinearMeasurement = 0;
  if (specs.frameType === 'Clear Span') {
    columnLinearMeasurement = totalColumns * (specs.eaveHeight + embedmentDepth);
  } else {
    // 2 outer columns per frame
    let outerColsLen = numFrames * 2 * (specs.eaveHeight + embedmentDepth);
    // 1 inner column per frame (usually at center)
    let innerColHeight = specs.eaveHeight;
    if (specs.roofType === 'Single Slope') {
       innerColHeight = specs.eaveHeight + (specs.width / 2) * (specs.roofSlope / 100);
    } else if (specs.roofType === 'Multi-Sloped Hut') {
       innerColHeight = specs.eaveHeight + (specs.width / 4) * (specs.roofSlope * 1.5 / 100) + (specs.width / 4) * (specs.roofSlope * 0.5 / 100);
    } else if (specs.roofType === 'Curved') {
       innerColHeight = specs.eaveHeight + (specs.width / 2) * (specs.roofSlope / 100) * 1.5;
    } else {
       innerColHeight = specs.eaveHeight + (specs.width / 2) * (specs.roofSlope / 100);
    }
    // Add embedment to inner columns as well
    columnLinearMeasurement = outerColsLen + (numFrames * (innerColHeight + embedmentDepth));
  }
`;

app = app.replace(oldLogic.trim(), newLogic.trim());

const oldLengthLabel = "{ label: 'Length', value: \`Columns: ~${specs.eaveHeight}m, Rafters: ~${rafterLength}m\`, category: 'Specifications' },";
const newLengthLabel = "{ label: 'Length', value: \`Columns: ~${(specs.eaveHeight + embedmentDepth).toFixed(1)}m (includes ${embedmentDepth}m embedment), Rafters: ~${rafterLength}m\`, category: 'Specifications' },";
app = app.replace(oldLengthLabel, newLengthLabel);

const oldEmbedmentStr = "{ label: 'Standard Embedment Depth', value: \`${Math.max(0.6, Math.round(specs.eaveHeight * 0.2 * 10) / 10).toFixed(1)}m\`, category: 'Foundation & Civil' },";
const newEmbedmentStr = "{ label: 'Standard Embedment Depth', value: \`${embedmentDepth.toFixed(1)}m\`, category: 'Foundation & Civil' },";
app = app.replace(oldEmbedmentStr, newEmbedmentStr);


fs.writeFileSync('src/App.tsx', app);
console.log('Done');
