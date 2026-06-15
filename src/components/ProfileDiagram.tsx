import React from 'react';

interface ProfileDiagramProps {
  type: '7v Profile' | '6v Profile' | 'Standard';
}

export function ProfileDiagram({ type }: ProfileDiagramProps) {
  if (type === 'Standard' || !type) {
    return null;
  }

  const is7v = type === '7v Profile';
  const numPeaks = is7v ? 7 : 6;
  const coveredWidth = is7v ? 1188 : 960;
  const totalWidth = is7v ? 1253 : 1060;
  const pitch = 198;
  const peakHeight = 25;
  const peakBaseW = 65;
  const peakTopW = 28;
  const panW = 133;
  
  // Scale down for SVG visualization (e.g. 1mm = 1px, we'll use a responsive viewBox)
  const viewWidth = totalWidth + 40; // Add padding
  const viewHeight = 120; // 25 height + space for annotations
  
  const startX = 20;
  const baseY = 80;
  const topY = baseY - peakHeight * 2; // Stretch height for visibility
  
  const points = [];
  
  let currentX = startX;
  
  // Start flat bit
  points.push(`${currentX},${baseY}`);
  
  // Outer edge
  currentX += 13;
  points.push(`${currentX},${baseY}`);
  
  for (let i = 0; i < numPeaks; i++) {
    // Left slant up
    currentX += (peakBaseW - peakTopW) / 2;
    points.push(`${currentX},${topY}`);
    
    // Top flat
    currentX += peakTopW;
    points.push(`${currentX},${topY}`);
    
    // Right slant down
    currentX += (peakBaseW - peakTopW) / 2;
    points.push(`${currentX},${baseY}`);
    
    // Bottom flat (pan) except after last peak
    if (i < numPeaks - 1) {
      // First section of pan
      let pWidth = is7v ? 141 : 133;
      // Subtract width of minor ribs (2 * 15 = 30)
      let flatRem = pWidth - 30;
      let f1 = flatRem * 0.25;
      let f2 = flatRem * 0.5;
      let f3 = flatRem * 0.25;

      currentX += f1;
      points.push(`${currentX},${baseY}`);
      
      // Minor rib 1
      currentX += 5; points.push(`${currentX},${baseY - 5}`);
      currentX += 5; points.push(`${currentX},${baseY - 5}`);
      currentX += 5; points.push(`${currentX},${baseY}`);
      
      // Middle pan section
      currentX += f2;
      points.push(`${currentX},${baseY}`);
      
      // Minor rib 2
      currentX += 5; points.push(`${currentX},${baseY - 5}`);
      currentX += 5; points.push(`${currentX},${baseY - 5}`);
      currentX += 5; points.push(`${currentX},${baseY}`);
      
      // Last section of pan
      currentX += f3;
      points.push(`${currentX},${baseY}`);
    }
  }
  
  // Final bit
  currentX += 13;
  points.push(`${currentX},${baseY}`);
  
  const pathD = `M ${points.join(' L ')}`;
  
  return (
    <div className="bg-white p-4 border border-slate-200 rounded-lg overflow-x-auto mt-3">
      <h4 className="text-sm font-medium text-slate-800 mb-4">{type} Dimensions & Cross-Section</h4>
      <div className="min-w-[600px]">
        <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="w-full h-auto drop-shadow-sm" style={{ maxHeight: '160px' }}>
          {/* Dimension Lines */}
          {/* Covered Width */}
          <line x1={startX + 13 + peakBaseW/2} y1={topY - 15} x2={startX + 13 + peakBaseW/2 + coveredWidth} y2={topY - 15} stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
          <text x={startX + 13 + peakBaseW/2 + coveredWidth/2} y={topY - 25} textAnchor="middle" fill="#10b981" fontSize="14" fontWeight="600">{coveredWidth}mm Covered Width</text>
          
          {/* Pitch */}
          <line x1={startX + 13 + peakBaseW/2} y1={baseY + 25} x2={startX + 13 + peakBaseW/2 + pitch} y2={baseY + 25} stroke="#ef4444" strokeWidth="2" />
          <text x={startX + 13 + peakBaseW/2 + pitch/2} y={baseY + 40} textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="600">{pitch}mm Pitch</text>
          
          {/* Pan Width */}
          <line x1={startX + 13 + peakBaseW} y1={baseY - 10} x2={startX + 13 + peakBaseW + panW} y2={baseY - 10} stroke="#f59e0b" strokeWidth="2" />
          <text x={startX + 13 + peakBaseW + panW/2} y={baseY - 15} textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="600">{panW}mm</text>
          
          {/* Peak Height */}
          <line x1={startX + 5} y1={topY} x2={startX + 5} y2={baseY} stroke="#3b82f6" strokeWidth="2" strokeDasharray="2 2" />
          <text x={startX - 5} y={baseY - 5} textAnchor="end" fill="#3b82f6" fontSize="12" fontWeight="600">{peakHeight}mm</text>
          
          {/* Peak Top Width */}
          <text x={startX + 13 + peakBaseW/2} y={topY + 15} textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600">{peakTopW}mm</text>

          {/* Profile Path */}
          <path d={pathD} fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* End cap accents */}
          <circle cx={startX} cy={baseY} r="4" fill="#334155" />
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
