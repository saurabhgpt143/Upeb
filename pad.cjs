const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const modelOld = `
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
`;

const modelNew = `
                    <React.Fragment key={'foundation_pit_' + i}>
                      <mesh position={[-w / 2 + 0.1, -(fDepth - 0.3) / 2, z]}>
                        <boxGeometry args={[0.5, fDepth - 0.3, 0.5]} />
                        <meshStandardMaterial color="#94a3b8" roughness={0.9} transparent opacity={0.6} />
                      </mesh>
                      <mesh position={[-w / 2 + 0.1, -(fDepth - 0.3) - 0.3 / 2, z]}>
                        <boxGeometry args={[1.2, 0.3, 1.2]} />
                        <meshStandardMaterial color="#64748b" roughness={0.9} transparent opacity={0.8} />
                      </mesh>
                      
                      <mesh position={[w / 2 - 0.1, -(fDepth - 0.3) / 2, z]}>
                        <boxGeometry args={[0.5, fDepth - 0.3, 0.5]} />
                        <meshStandardMaterial color="#94a3b8" roughness={0.9} transparent opacity={0.6} />
                      </mesh>
                      <mesh position={[w / 2 - 0.1, -(fDepth - 0.3) - 0.3 / 2, z]}>
                        <boxGeometry args={[1.2, 0.3, 1.2]} />
                        <meshStandardMaterial color="#64748b" roughness={0.9} transparent opacity={0.8} />
                      </mesh>
                      
                      {specs.frameType === 'Multi-Span' && (
                        <>
                          <mesh position={[0, -(fDepth - 0.3) / 2, z]}>
                            <boxGeometry args={[0.5, fDepth - 0.3, 0.5]} />
                            <meshStandardMaterial color="#94a3b8" roughness={0.9} transparent opacity={0.6} />
                          </mesh>
                          <mesh position={[0, -(fDepth - 0.3) - 0.3 / 2, z]}>
                            <boxGeometry args={[1.2, 0.3, 1.2]} />
                            <meshStandardMaterial color="#64748b" roughness={0.9} transparent opacity={0.8} />
                          </mesh>
                        </>
                      )}
                    </React.Fragment>
`;

app = app.replace(modelOld.trim(), modelNew.trim());

// Specs
app = app.replace(
  "{ label: 'Standard Length Grounded (Column)', value: `${(Math.max(0.6, specs.eaveHeight * 0.12) + 0.3).toFixed(2)}m`, category: 'Foundation & Civil' },",
  `{ label: 'Standard Embedment Depth', value: \`\${(Math.max(0.6, specs.eaveHeight * 0.12)).toFixed(2)}m\`, category: 'Foundation & Civil' },
    { label: 'Concrete Footing Pad', value: '1.2m x 1.2m x 0.3m thickness', category: 'Foundation & Civil' },`
);

fs.writeFileSync('src/App.tsx', app);
console.log('Fixed pad');
