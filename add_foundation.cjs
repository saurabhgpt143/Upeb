const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `
      {/* Foundation & Subsurface Visualization */}
      <group position={[0, -0.05, l / 2]}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[w * 3, l * 3]} />
          <meshStandardMaterial color="#d4d4d8" roughness={0.9} transparent opacity={0.3} depthWrite={false} />
        </mesh>
        
        {/* Soil/Depth Grid indicator */}
        <gridHelper args={[Math.max(w, l) * 3, Math.max(w, l) * 3, '#a1a1aa', '#e4e4e7']} position={[0, -1.5, 0]} />
        
        {specs.hasPrimarySteel !== false && (
          <group position={[0, 0, -l / 2]}>
            {Array.from({ length: Math.ceil(l / 6) + 1 }).map((_, i) => {
              const z = (i / Math.ceil(l / 6)) * l;
              return (
                <React.Fragment key={'foundation_pit_' + i}>
                  <mesh position={[-w / 2 + 0.1, -0.75, z]}>
                    <boxGeometry args={[1.0, 1.5, 1.0]} />
                    <meshStandardMaterial color="#a1a1aa" roughness={0.9} transparent opacity={0.8} />
                  </mesh>
                  <mesh position={[w / 2 - 0.1, -0.75, z]}>
                    <boxGeometry args={[1.0, 1.5, 1.0]} />
                    <meshStandardMaterial color="#a1a1aa" roughness={0.9} transparent opacity={0.8} />
                  </mesh>
                  {specs.frameType === 'Multi-Span' && (
                    <mesh position={[0, -0.75, z]}>
                      <boxGeometry args={[1.0, 1.5, 1.0]} />
                      <meshStandardMaterial color="#a1a1aa" roughness={0.9} transparent opacity={0.8} />
                    </mesh>
                  )}
                </React.Fragment>
              );
            })}
          </group>
        )}
      </group>

      {/* Wall Sheets */}
`;

app = app.replace('{/* Wall Sheets */}', replacement);

fs.writeFileSync('src/App.tsx', app);
console.log('Foundation added');
