const width = 6;
const length = 6;
const eaveHeight = 6;
const roofSlope = 10;
const frameType = 'Clear Span'; 

const numFrames = Math.ceil(length / 6) + 1;
const colsPerFrame = frameType === 'Clear Span' ? 2 : 3;
const totalColumns = numFrames * colsPerFrame;

let columnLinearMeasurement = 0;
if (frameType === 'Clear Span') {
  columnLinearMeasurement = totalColumns * eaveHeight;
} else {
  let outerColsLen = numFrames * 2 * eaveHeight;
  let innerColHeight = eaveHeight + (width / 2) * (roofSlope / 100);
  columnLinearMeasurement = outerColsLen + (numFrames * innerColHeight);
}

const colPcscalc = Math.ceil(columnLinearMeasurement / 6);

console.log({ totalColumns, columnLinearMeasurement, colPcscalc });
