const numFrames = Math.ceil(6 / 6) + 1;
const colsPerFrame = 2;
const totalColumns = numFrames * colsPerFrame;
const eaveHeight = 6;
let fDepth = Math.max(0.6, Math.round(eaveHeight * 0.2 * 10) / 10);
console.log("total columns", totalColumns);
console.log("fDepth", fDepth);
