import React from 'react';

interface ProfileDiagramProps {
  type: '7v Profile' | '6v Profile' | 'Standard';
}

export function ProfileDiagram({ type }: ProfileDiagramProps) {
  if (type === 'Standard' || !type) {
    return null;
  }

  const is7v = type === '7v Profile';
  const is6v = type === '6v Profile';
  
  const numPeaks = is7v ? 7 : (is6v ? 6 : 6);
  const pitch = 198;
  const peakHeight = 30;
  const peakBaseW = 65;
  const peakTopW = 25;
  
  const coveredWidth = is7v ? 1188 : (is6v ? 990 : 960);
  const totalWidth = is7v ? 1253 : (is6v ? 1055 : 1060);
  const edgeOffset = 10;
  const panW = pitch - peakBaseW;
  
  // Scale down for SVG visualization (e.g. 1mm = 1px, we'll use a responsive viewBox)
  const viewHeight = 125; // space for annotations
  
  const startX = 35;
  const baseY = 85;
  const topY = baseY - peakHeight * 1.8; // Stretch height slightly for beautiful visual proportions
  
  const points = [];
  
  let currentX = startX;
  const slopeW = (peakBaseW - peakTopW) / 2;
  const shortLegLen = 18.1;
  const stdLegLen = 35.1;
  const ratio = shortLegLen / stdLegLen;
  const drawShortW = slopeW * ratio;
  const drawShortH = (baseY - topY) * ratio;

  // Start at the bottom-left of the short leg
  points.push(`${currentX},${topY + drawShortH}`);
  
  // Slant up to top-left of first peak but 3mm below topY (scaled)
  currentX += drawShortW;
  points.push(`${currentX},${topY + 3 * 1.8}`);

  // Vertical step UP of 3mm (scaled) to topY
  points.push(`${currentX},${topY}`);
  
  for (let i = 0; i < numPeaks; i++) {
    if (i === 0) {
      // Top flat of peak 0
      currentX += peakTopW;
      points.push(`${currentX},${topY}`);
      
      // Right slant down of peak 0
      currentX += slopeW;
      points.push(`${currentX},${baseY}`);
    } else {
      // Left slant up
      currentX += slopeW;
      points.push(`${currentX},${topY}`);
      
      // Top flat
      currentX += peakTopW;
      points.push(`${currentX},${topY}`);
      
      // Right slant down
      currentX += slopeW;
      points.push(`${currentX},${baseY}`);
    }
    
    // Bottom flat (pan) with minor ribs (26mm flat, 28mm rib, 25mm flat, 28mm rib, 26mm flat)
    if (i < numPeaks - 1) {
      // Left flat section: length 26
      currentX += 26;
      points.push(`${currentX},${baseY}`);
      
      // Minor rib 1: total width 28, height 1.5
      // rise over 4, flat 20, drop over 4
      currentX += 4;
      points.push(`${currentX},${baseY - 1.5 * 1.8}`);
      currentX += 20;
      points.push(`${currentX},${baseY - 1.5 * 1.8}`);
      currentX += 4;
      points.push(`${currentX},${baseY}`);
      
      // Middle flat section: length 25
      currentX += 25;
      points.push(`${currentX},${baseY}`);
      
      // Minor rib 2: total width 28, height 1.5
      currentX += 4;
      points.push(`${currentX},${baseY - 1.5 * 1.8}`);
      currentX += 20;
      points.push(`${currentX},${baseY - 1.5 * 1.8}`);
      currentX += 4;
      points.push(`${currentX},${baseY}`);
      
      // Right flat section: length 26
      currentX += 26;
      points.push(`${currentX},${baseY}`);
    }
  }
  
  // Final bit (rightmost edgeOffset = 10mm)
  currentX += edgeOffset;
  points.push(`${currentX},${baseY}`);
  
  const pathD = `M ${points.join(' L ')}`;
  const finalDrawnWidth = currentX - startX;
  const viewWidth = finalDrawnWidth + 60;
  
  const firstPeakCenter = startX + drawShortW + peakTopW / 2;
  
  return (
    <div className="bg-white p-4 border border-slate-200 rounded-lg overflow-x-auto mt-3">
      <h4 className="text-sm font-medium text-slate-800 mb-4">{type} Dimensions & Cross-Section</h4>
      <div className="min-w-[600px]">
        <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="w-full h-auto drop-shadow-sm" style={{ maxHeight: '160px' }}>
          {/* Dimension Lines */}
          {/* Covered Width */}
          <line x1={firstPeakCenter} y1={topY - 15} x2={firstPeakCenter + coveredWidth} y2={topY - 15} stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
          <text x={firstPeakCenter + coveredWidth/2} y={topY - 25} textAnchor="middle" fill="#10b981" fontSize="13" fontWeight="600">{coveredWidth}mm Covered Width</text>
          
          {/* Pitch */}
          <line x1={firstPeakCenter} y1={baseY + 25} x2={firstPeakCenter + pitch} y2={baseY + 25} stroke="#ef4444" strokeWidth="2" />
          <text x={firstPeakCenter + pitch/2} y={baseY + 40} textAnchor="middle" fill="#ef4444" fontSize="13" fontWeight="600">{pitch}mm Pitch</text>
          
          {/* Pan Width */}
          <line x1={startX + drawShortW + peakTopW + slopeW} y1={baseY - 10} x2={startX + drawShortW + peakTopW + slopeW + panW} y2={baseY - 10} stroke="#f59e0b" strokeWidth="2" />
          <text x={startX + drawShortW + peakTopW + slopeW + panW/2} y={baseY - 15} textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="600">{panW}mm (26 | 28 | 25 | 28 | 26)</text>
          
          {/* Peak Height */}
          <line x1={startX - 18} y1={topY} x2={startX - 18} y2={baseY} stroke="#3b82f6" strokeWidth="2" strokeDasharray="2 2" />
          <text x={startX - 24} y={baseY - 5} textAnchor="end" fill="#3b82f6" fontSize="11" fontWeight="600">{peakHeight}mm</text>
          
          {/* Peak Top Width */}
          <text x={firstPeakCenter} y={topY + 15} textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="600">{peakTopW}mm</text>

          {/* Short Outer Leg Length (Left end overlap) */}
          <line x1={startX - 8} y1={topY + drawShortH + 4} x2={startX + drawShortW - 8} y2={topY + 4} stroke="#ef4444" strokeWidth="1" />
          <text x={startX + drawShortW / 2 - 14} y={topY + drawShortH / 2 + 14} textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="700">18.1</text>

          {/* Standard Leg Length */}
          <line x1={startX + drawShortW + peakTopW + 10} y1={topY + 4} x2={startX + drawShortW + peakTopW + slopeW + 10} y2={baseY + 4} stroke="#ef4444" strokeWidth="1" />
          <text x={startX + drawShortW + peakTopW + slopeW / 2 + 16} y={topY + (baseY - topY) / 2 + 8} textAnchor="start" fill="#22c55e" fontSize="11" fontWeight="700">35.1</text>

          {/* Profile Path */}
          <path d={pathD} fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* End cap accents */}
          <circle cx={startX} cy={topY + drawShortH} r="4" fill="#334155" />
          <circle cx={currentX} cy={baseY} r="4" fill="#334155" />
        </svg>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-100">
        <div>
          <div className="text-xs text-slate-500 uppercase">Total Width</div>
          <div className="font-semibold text-slate-800">{totalWidth} mm</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase">Covered Width</div>
          <div className="font-semibold text-slate-800">{coveredWidth} mm</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase">Pitch / Spacing</div>
          <div className="font-semibold text-slate-800">{pitch} mm</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase">Peak Dimensions</div>
          <div className="font-semibold text-slate-800">{peakHeight}H x {peakBaseW}W max mm</div>
        </div>
      </div>
    </div>
  );
}
