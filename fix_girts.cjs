const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const girtsLogicOld = `    const girtSpacing = specs.highWindVelocity || specs.snowLoad ? 1.0 : 1.5;
    const girtRuns = Math.ceil(h / girtSpacing);
    if (specs.hasWalls !== false && specs.hasGirts !== false) {
      for (let p = 0; p <= girtRuns; p++) {
        const py = p === 0 ? 0.05 : p * girtSpacing;
        structuralElements.push(
          <mesh castShadow receiveShadow key={\`girt_L_\${p}\`} position={[-w/2 + 0.05, py, l/2]}>
            <boxGeometry args={[0.1, 0.1, l]} />
            {purlinMaterial}
          </mesh>
        );
        structuralElements.push(
          <mesh castShadow receiveShadow key={\`girt_R_\${p}\`} position={[w/2 - 0.05, py, l/2]}>
            <boxGeometry args={[0.1, 0.1, l]} />
            {purlinMaterial}
          </mesh>
        );
        structuralElements.push(
          <mesh castShadow receiveShadow key={\`girt_F_\${p}\`} position={[0, py, 0.05]}>
            <boxGeometry args={[w, 0.1, 0.1]} />
            {purlinMaterial}
          </mesh>
        );
        structuralElements.push(
          <mesh castShadow receiveShadow key={\`girt_B_\${p}\`} position={[0, py, l - 0.05]}>
            <boxGeometry args={[w, 0.1, 0.1]} />
            {purlinMaterial}
          </mesh>
        );
      }
    }`;

const girtsLogicNew = `    const girtSpacing = specs.highWindVelocity || specs.snowLoad ? 1.0 : 1.5;
    let rightWallH = h;
    let maxFBH = h;
    
    if (specs.roofType === 'Single Slope') {
        rightWallH = h + w * (specs.roofSlope / 100);
        maxFBH = rightWallH;
    } else if (specs.roofType === 'Multi-Sloped Hut') {
        maxFBH = h + (w / 4) * (specs.roofSlope * 1.5 / 100) + (w / 4) * (specs.roofSlope * 0.5 / 100);
    } else if (specs.roofType === 'Curved') {
        maxFBH = h + (w / 2) * (specs.roofSlope / 100) * 1.5;
    } else {
        maxFBH = h + (w / 2) * (specs.roofSlope / 100);
    }

    if (specs.hasWalls !== false && specs.hasGirts !== false) {
      const girtRunsAll = Math.max(Math.ceil(h / girtSpacing), Math.ceil(rightWallH / girtSpacing), Math.ceil(maxFBH / girtSpacing));
      for (let p = 0; p <= girtRunsAll; p++) {
        const py = p === 0 ? 0.05 : p * girtSpacing;
        
        if (py <= h) {
          structuralElements.push(
            <mesh castShadow receiveShadow key={\`girt_L_\${p}\`} position={[-w/2 + 0.05, py, l/2]}>
              <boxGeometry args={[0.1, 0.1, l]} />
              {purlinMaterial}
            </mesh>
          );
        }
        if (py <= rightWallH) {
          structuralElements.push(
            <mesh castShadow receiveShadow key={\`girt_R_\${p}\`} position={[w/2 - 0.05, py, l/2]}>
              <boxGeometry args={[0.1, 0.1, l]} />
              {purlinMaterial}
            </mesh>
          );
        }
        if (py <= maxFBH) {
          // Instead of drawing the full width which extends out of the roof shape, 
          // we use getRoofY bounds.
          let rxLeftFront = -w/2; let rxRightFront = w/2;
          // Approximate the width clipping to keep it inside the roof bounds.
          if (py > h) {
             const step = w / 40;
             let newLeft = -w/2;
             while (getRoofY(newLeft) < py && newLeft < w/2) newLeft += step;
             let newRight = w/2;
             while (getRoofY(newRight) < py && newRight > -w/2) newRight -= step;
             rxLeftFront = newLeft;
             rxRightFront = newRight;
          }
          
          if (rxLeftFront < rxRightFront) {
            const fw = rxRightFront - rxLeftFront;
            const fcx = (rxLeftFront + rxRightFront) / 2;
            
            structuralElements.push(
              <mesh castShadow receiveShadow key={\`girt_F_\${p}\`} position={[fcx, py, 0.05]}>
                <boxGeometry args={[fw, 0.1, 0.1]} />
                {purlinMaterial}
              </mesh>
            );
            structuralElements.push(
              <mesh castShadow receiveShadow key={\`girt_B_\${p}\`} position={[fcx, py, l - 0.05]}>
                <boxGeometry args={[fw, 0.1, 0.1]} />
                {purlinMaterial}
              </mesh>
            );
          }
        }
      }
    }`;

app = app.replace(girtsLogicOld, girtsLogicNew);
if (app.includes(girtsLogicNew)) {
  console.log('Successfully replaced girt logic.');
} else {
  console.log('Failed to replace girt logic.');
}
fs.writeFileSync('src/App.tsx', app);
