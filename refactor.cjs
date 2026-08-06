const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStartSnippet = `  const handleExportMaterialsPDF = () => {
    const doc = new jsPDF();
    doc.text(\`Material Requirements & Pricing - \${specs.width}x\${specs.length}x\${specs.eaveHeight}m PEB\`, 14, 20);
    
    let currentY = 30;`;

const targetEndSnippet = `    if (miscTons > 0 || primaryPcsForBasePlates > 0) {
       const basePlateProfile = specs.basePlateProfile || '8 x 200 x 200mm -2.5kg';
       const bpUnitWt = getUnitWeight(basePlateProfile, 2.5);
       const bpPcs = primaryPcsForBasePlates > 0 ? primaryPcsForBasePlates : Math.ceil((miscTons * 1000) / bpUnitWt);
       const bpPricePerPc = (miscAvgCost / 1000) * bpUnitWt;

       const miscRow = formatRow(\`Base Plates (\${basePlateProfile}), Gussets, Cleats, Stiffeners, Paint\`, 'pcs', bpPcs, Math.round(bpPricePerPc));
       if (miscRow) {
           createSection('Miscellaneous components', [miscRow]);
           totalMaterialsCost += parseInt(miscRow[4].replace(/[^\\d]/g, ''), 10);
       }
    }`;

const startIndex = content.indexOf(targetStartSnippet);
const endIndex = content.indexOf(targetEndSnippet) + targetEndSnippet.length;

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find start or end snippet");
  process.exit(1);
}

const originalBlock = content.slice(startIndex, endIndex);

// Extract the createSection and everything below
const afterDocVars = originalBlock.replace(targetStartSnippet, '');

// Build the new code block
const newBlock = `  const materialEstimateData = useMemo(() => {
    const sections: { title: string, rows: any[] }[] = [];
    let totalCost = 0;

    const createSection = (title: string, rows: any[]) => {
      if (rows.length === 0) return;
      sections.push({ title, rows });
      rows.forEach(row => {
          totalCost += parseInt(row[4].replace(/[^\\d]/g, ''), 10);
      });
    };
` + afterDocVars.replace(/doc.*?;\n/g, '').replace(/totalMaterialsCost/g, 'totalCost').replace(/currentY = (.*?);\n/g, '').replace(/autoTable\(doc, \{[\s\S]*?\}\);\n      /g, '') + `

    return { sections, totalCost };
  }, [specs, primaryTons, secondaryTons, accessories, totalPurlins, totalGirts, primaryUnitCost, secondaryUnitCost, roofAreaNum, wallAreaNum, roofUnitCost, wallUnitCost, columnLinearMeasurement, rafterLinearMeasurement, hardwareUnitCostPerKg]);

  const handleExportMaterialsPDF = () => {
    const doc = new jsPDF();
    doc.text(\`Material Requirements & Pricing - \${specs.width}x\${specs.length}x\${specs.eaveHeight}m PEB\`, 14, 20);
    
    let currentY = 30;

    materialEstimateData.sections.forEach(sec => {
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text(sec.title, 14, currentY);
      
      (autoTable as any)(doc, {
        startY: currentY + 5,
        head: [['Material / Description', 'Unit', 'Qty', 'Unit Price (INR)', 'Total Price (INR)']],
        body: sec.rows,
        theme: 'grid',
        headStyles: { fillColor: [51, 65, 85] }
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 15;
    });

    const totalMaterialsCost = materialEstimateData.totalCost;`;

content = content.replace(originalBlock, newBlock);

fs.writeFileSync('src/App.tsx', content);
console.log("Refactoring complete");
