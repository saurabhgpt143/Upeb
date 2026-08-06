const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `
        {/* Foundation & Subsurface visualized */}
        {specs.hasPrimarySteel !== false && (
          <>
            {/* Left Column Footing */}
            <rect x={pLeftGround.x - 6} y={groundY} width="12" height={1.5 * scale} fill="#94a3b8" opacity="0.6" />
            <rect x={pLeftGround.x - 12} y={groundY + 1.5 * scale} width="24" height={0.5 * scale} fill="#64748b" opacity="0.8" />
            {/* Right Column Footing */}
            <rect x={pRightGround.x - 6} y={groundY} width="12" height={1.5 * scale} fill="#94a3b8" opacity="0.6" />
            <rect x={pRightGround.x - 12} y={groundY + 1.5 * scale} width="24" height={0.5 * scale} fill="#64748b" opacity="0.8" />
            
            {specs.frameType === 'Multi-Span' && (
              <>
                 <rect x={centerX - 6} y={groundY} width="12" height={1.5 * scale} fill="#94a3b8" opacity="0.6" />
                 <rect x={centerX - 12} y={groundY + 1.5 * scale} width="24" height={0.5 * scale} fill="#64748b" opacity="0.8" />
              </>
            )}
            
            {/* Depth label */}
            <line x1={pLeftGround.x - 24} y1={groundY} x2={pLeftGround.x - 24} y2={groundY + 2 * scale} stroke="#64748b" strokeWidth="1" />
            <line x1={pLeftGround.x - 28} y1={groundY} x2={pLeftGround.x - 20} y2={groundY} stroke="#64748b" strokeWidth="1" />
            <line x1={pLeftGround.x - 28} y1={groundY + 2 * scale} x2={pLeftGround.x - 20} y2={groundY + 2 * scale} stroke="#64748b" strokeWidth="1" />
            <text x={pLeftGround.x - 30} y={groundY + scale + 4} fill="#64748b" fontSize="12" textAnchor="end">2.0m</text>
          </>
        )}
        
        {/* Ground */}
`;

app = app.replace('{/* Ground */}', replacement);

fs.writeFileSync('src/App.tsx', app);
console.log('Foundation SVG added');
