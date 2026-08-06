const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const replacementSVG = `
        {/* Foundation & Subsurface visualized */}
        {(() => {
          const fDepth = Math.max(1.5, specs.eaveHeight * 0.2);
          const fDepthPx = fDepth * scale;
          return specs.hasPrimarySteel !== false && (
            <>
              {/* Left Column Footing */}
              <rect x={pLeftGround.x - 6} y={groundY} width="12" height={fDepthPx} fill="#94a3b8" opacity="0.6" />
              <rect x={pLeftGround.x - 12} y={groundY + fDepthPx} width="24" height={0.5 * scale} fill="#64748b" opacity="0.8" />
              {/* Right Column Footing */}
              <rect x={pRightGround.x - 6} y={groundY} width="12" height={fDepthPx} fill="#94a3b8" opacity="0.6" />
              <rect x={pRightGround.x - 12} y={groundY + fDepthPx} width="24" height={0.5 * scale} fill="#64748b" opacity="0.8" />
              
              {specs.frameType === 'Multi-Span' && (
                <>
                   <rect x={centerX - 6} y={groundY} width="12" height={fDepthPx} fill="#94a3b8" opacity="0.6" />
                   <rect x={centerX - 12} y={groundY + fDepthPx} width="24" height={0.5 * scale} fill="#64748b" opacity="0.8" />
                </>
              )}
              
              {/* Depth label */}
              <line x1={pLeftGround.x - 24} y1={groundY} x2={pLeftGround.x - 24} y2={groundY + fDepthPx + 0.5 * scale} stroke="#64748b" strokeWidth="1" />
              <line x1={pLeftGround.x - 28} y1={groundY} x2={pLeftGround.x - 20} y2={groundY} stroke="#64748b" strokeWidth="1" />
              <line x1={pLeftGround.x - 28} y1={groundY + fDepthPx + 0.5 * scale} x2={pLeftGround.x - 20} y2={groundY + fDepthPx + 0.5 * scale} stroke="#64748b" strokeWidth="1" />
              <text x={pLeftGround.x - 30} y={groundY + (fDepthPx + 0.5 * scale)/2 + 4} fill="#64748b" fontSize="12" textAnchor="end">{(fDepth + 0.5).toFixed(1)}m</text>
            </>
          );
        })()}
        
        {/* Ground */}
`;

let svgReplaced = false;
app = app.replace(/\{\/\* Foundation & Subsurface visualized \*\/\}[\s\S]*?\{\/\* Ground \*\/\}/g, function(match) {
    if (!svgReplaced) {
        svgReplaced = true;
        return replacementSVG.trim();
    }
    return match;
});

const replacementModel = `
      {/* Foundation & Subsurface Visualization */}
      {(() => {
        const fDepth = Math.max(1.5, h * 0.2);
        return (
          <group position={[0, -0.05, l / 2]}>
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[w * 3, l * 3]} />
              <meshStandardMaterial color="#d4d4d8" roughness={0.9} transparent opacity={0.3} depthWrite={false} />
            </mesh>
            
            {/* Soil/Depth Grid indicator */}
            <gridHelper args={[Math.max(w, l) * 3, Math.max(w, l) * 3, '#a1a1aa', '#e4e4e7']} position={[0, -fDepth, 0]} />
            
            {specs.hasPrimarySteel !== false && (
              <group position={[0, 0, -l / 2]}>
                {Array.from({ length: Math.ceil(l / 6) + 1 }).map((_, i) => {
                  const z = (i / Math.ceil(l / 6)) * l;
                  return (
                    <React.Fragment key={'foundation_pit_' + i}>
                      <mesh position={[-w / 2 + 0.1, -fDepth / 2, z]}>
                        <boxGeometry args={[1.0, fDepth, 1.0]} />
                        <meshStandardMaterial color="#a1a1aa" roughness={0.9} transparent opacity={0.8} />
                      </mesh>
                      <mesh position={[w / 2 - 0.1, -fDepth / 2, z]}>
                        <boxGeometry args={[1.0, fDepth, 1.0]} />
                        <meshStandardMaterial color="#a1a1aa" roughness={0.9} transparent opacity={0.8} />
                      </mesh>
                      {specs.frameType === 'Multi-Span' && (
                        <mesh position={[0, -fDepth / 2, z]}>
                          <boxGeometry args={[1.0, fDepth, 1.0]} />
                          <meshStandardMaterial color="#a1a1aa" roughness={0.9} transparent opacity={0.8} />
                        </mesh>
                      )}
                    </React.Fragment>
                  );
                })}
              </group>
            )}
          </group>
        );
      })()}
`;

let modelReplaced = false;
app = app.replace(/\{\/\* Foundation & Subsurface Visualization \*\/\}[\s\S]*?\{\/\* Wall Sheets \*\/\}/g, function(match) {
    if (!modelReplaced) {
        modelReplaced = true;
        return replacementModel.trim() + '\\n\\n      {/* Wall Sheets */}';
    }
    return match;
});

fs.writeFileSync('src/App.tsx', app);
console.log('Done');
