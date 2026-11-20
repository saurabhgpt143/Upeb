import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ProposalSettings {
  // Company / Letterhead
  companyName: string;
  companySubtitle: string;
  companyGroup: string;
  companyTagline: string;
  companyGstin: string;
  companyUdyam: string;
  companyFax: string;
  companyState: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyLogoUrl?: string;

  // Client & Reference
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  proposalDate: string;
  proposalSubject: string;
  proposalRefNo: string;

  // Material Brands
  roofingBrand: string;
  claddingBrand: string;
  accessoriesBrand: string;
  pipeBrand: string;
  sectionBrand: string;

  // Scope & Building Metadata
  buildingQuantity: string;
  buildingUsage: string;
  brickWallHeight: string;
  endFramesType: 'Non expandable' | 'Expandable';
  canopyCount: number;
  includeErectionInQuote: boolean;
  includeCivilInQuote: boolean;

  // Bank Details
  bankName: string;
  bankAccountNo: string;
  bankIfsc: string;
  bankBranch: string;
  bankUpiId: string;
}

export const MG_LETTERHEAD_IMAGE_URL = '/assets/aistudio/IMG-20261119-WA0038_5e68c4ee.jpg';

export const formatTodayDate = (): string => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

export const UPEB_MG_PRESET: Partial<ProposalSettings> = {
  companyName: 'M.G. Industries: UPEB',
  companySubtitle: 'MANUFACTURER OF ROOFING SHEET, ACCESSORIES, MS SHED, PEB SHED',
  companyGroup: 'M.G. INDUSTRIES',
  companyTagline: 'Strengthening the Universe',
  companyGstin: '23BWVPG5505L1Z7',
  companyUdyam: 'UDYAM-MP-24-0005020',
  companyFax: 'mgindustriesjbp@print.brother.com',
  companyState: '23-Madhya Pradesh',
  companyAddress: 'Vinoba Bhave Ward, Panagar, Jabalpur',
  companyPhone: '9752556113',
  companyEmail: 'mgindustriesjbp@gmail.com',
  companyLogoUrl: MG_LETTERHEAD_IMAGE_URL,
  proposalRefNo: 'MGI/UPEB/1185',
  bankName: 'BANK OF MAHARASHTRA',
  bankAccountNo: '6031 6466 239',
  bankIfsc: 'MAHB0000341',
  bankBranch: 'WRIGHT TOWN, OPP. TELEPHONE EXCH',
  bankUpiId: 'saurabhgpt143-1@okaxis',
};

export const GR_INFRA_PRESET: Partial<ProposalSettings> = {
  companyName: 'GR INFRA',
  companySubtitle: 'MANUFACTURER OF ROOFING SHEET, ACCESSORIES, MS SHED, PEB SHED',
  companyGroup: 'BY GR GROUP',
  companyTagline: 'WE DEAL QUALITY',
  companyGstin: '23AGUPA2253R1Z1',
  companyUdyam: '',
  companyFax: '',
  companyState: '23-Madhya Pradesh',
  companyAddress: 'Plot no. E-4, Anmol Commercial Park, Soortalai, Katangi road, Jabalpur (M.P.) 482002',
  companyPhone: '8962643926, 7223849316',
  companyEmail: 'grindustriesjbp@gmail.com',
  companyLogoUrl: '',
  proposalRefNo: 'GRI/Ref/1185',
  bankName: 'Central Bank of India',
  bankAccountNo: '5737018459',
  bankIfsc: 'CBIN0281618',
  bankBranch: 'DHOBHIGHAT',
  bankUpiId: '',
};

export const DEFAULT_PROPOSAL_SETTINGS: ProposalSettings = {
  companyName: 'M.G. Industries: UPEB',
  companySubtitle: 'MANUFACTURER OF ROOFING SHEET, ACCESSORIES, MS SHED, PEB SHED',
  companyGroup: 'M.G. INDUSTRIES',
  companyTagline: 'Strengthening the Universe',
  companyGstin: '23BWVPG5505L1Z7',
  companyUdyam: 'UDYAM-MP-24-0005020',
  companyFax: 'mgindustriesjbp@print.brother.com',
  companyState: '23-Madhya Pradesh',
  companyAddress: 'Vinoba Bhave Ward, Panagar, Jabalpur',
  companyPhone: '9752556113',
  companyEmail: 'mgindustriesjbp@gmail.com',
  companyLogoUrl: MG_LETTERHEAD_IMAGE_URL,
  clientName: '',
  clientAddress: 'Jabalpur (M.P.)',
  clientEmail: '',
  proposalDate: formatTodayDate(),
  proposalSubject: 'Pre-engineered structure',
  proposalRefNo: 'MGI/UPEB/1185',
  roofingBrand: 'JSW BGL AZ150 (0.50mm)',
  claddingBrand: 'JSW (0.50mm)',
  accessoriesBrand: 'JSW / M.G. Industries Standard',
  pipeBrand: 'APL Apollo / Surya / Jindal',
  sectionBrand: 'JSW / TATA / SAIL',
  buildingQuantity: '01',
  buildingUsage: 'FACTORY SHED',
  brickWallHeight: 'N/A',
  endFramesType: 'Non expandable',
  canopyCount: 1,
  includeErectionInQuote: true,
  includeCivilInQuote: false,
  bankName: 'BANK OF MAHARASHTRA',
  bankAccountNo: '6031 6466 239',
  bankIfsc: 'MAHB0000341',
  bankBranch: 'WRIGHT TOWN, OPP. TELEPHONE EXCH',
  bankUpiId: 'saurabhgpt143-1@okaxis',
};

export interface ProposalComputedData {
  specs: {
    width: number;
    length: number;
    eaveHeight: number;
    roofSlope: number;
    roofType: string;
    roofProfile?: string;
    wallProfile?: string;
    frameType: string;
    hasRoof?: boolean;
    hasWalls?: boolean;
    hasPrimarySteel?: boolean;
    hasSecondarySteel?: boolean;
    hasGirts?: boolean;
    hasRidgeCap?: boolean;
    hasGutters?: boolean;
    hasGables?: boolean;
    hasCornerFlashing?: boolean;
    hasEndFlashing?: boolean;
    hasDownPipes?: boolean;
    hasTurboVents?: boolean;
    hasLouvers?: boolean;
    hasInsulation?: boolean;
    hasPolySheets?: boolean;
    hasFlanges?: boolean;
    hasProfileGate?: boolean;
    hasWindows?: boolean;
    hasCrimpedSheets?: boolean;
    hasSDScrews?: boolean;
    hasSilicon?: boolean;
    highWindVelocity?: boolean;
    snowLoad?: boolean;
  };
  dimensionUnit: 'm' | 'ft';
  areaSqM: number;
  areaSqFt: number;
  baySpacing: number;
  numFrames: number;
  endBayCount: number;
  endBaySpacing: number;
  totalSteelWeightMT: number;
  supplyAmountBeforeGst: number;
  erectionAmountBeforeGst: number;
  civilAmountBeforeGst: number;
  totalBeforeGst: number;
  gstAmount: number;
  grandTotalWithGst: number;
  supplyWithGst: number;
  erectionWithGst: number;
  turboVentUnitRate: number;
  pcpSheetUnitRate: number;
  roofColorName: string;
  wallColorName: string;
}

const fmtINR = (val: number): string => {
  return `Rs. ${Math.round(val).toLocaleString('en-IN')}/-`;
};

export const MATERIAL_DESIGN_SPECS = [
  { sno: '1', material: 'Build-up members', spec: 'ASTM A572M Gr50 / IS 2062 E 250 / Equivalent', yield: 'Fy = 345 Mpa' },
  { sno: '2', material: 'Hot Rolled Secondary Members', spec: 'IS : 2062 Gr. A / Equivalent', yield: 'Fy = 250 Mpa' },
  { sno: '3', material: 'Cold Formed Secondary Members', spec: 'ASTM A572M Gr50 / Equivalent', yield: 'Fy = 345 Mpa' },
  { sno: '4', material: 'Sheeting Panels', spec: 'ASTM A 792M', yield: 'Fy = 550 Mpa' },
  { sno: '5', material: 'X-Bracing members, rods, anchor Bolts', spec: 'IS : 2062 Gr A', yield: 'Fy = 250 Mpa' },
  { sno: '6', material: 'Anchor Bolts', spec: 'IS : 2062 Gr A', yield: 'Fy = 250 Mpa' },
  { sno: '7', material: 'High Strength Bolts for Primary Connections', spec: 'ASTM A 345M – ANSI 18.2.3.7 / 18.2.3.6 M', yield: '-' },
  { sno: '8', material: 'Machine Bolts for Secondary', spec: 'IS : 1364 Class 4.6 (Part 1 to 3)', yield: '-' },
];

export const WORK_SCHEDULE_ROWS = [
  { activity: 'Submission of GA drawings', start: 'NA', end: 'NA' },
  { activity: 'Approval of GA drawings', start: 'NA', end: 'NA' },
  { activity: 'Supply of primary and secondary structures', start: '0', end: '25' },
  { activity: 'Supply of sheets and accessories', start: '35', end: '40' },
  { activity: 'Erection of primary and secondary structures', start: '26', end: '35' },
  { activity: 'Roof sheeting and side sheeting', start: '35', end: '40' },
  { activity: 'Accessories and installation of flashings', start: '40', end: '45' },
];

async function loadImageAsDataUrl(url: string): Promise<{ dataUrl: string; width: number; height: number } | null> {
  try {
    return await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.drawImage(img, 0, 0);
          resolve({
            dataUrl: canvas.toDataURL('image/jpeg', 0.92),
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  } catch {
    return null;
  }
}

export async function exportProposalPDF(settings: ProposalSettings, data: ProposalComputedData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const letterheadImg = settings.companyLogoUrl ? await loadImageAsDataUrl(settings.companyLogoUrl) : null;

  const { specs } = data;
  const widthFt = (specs.width * 3.28084).toFixed(1);
  const lengthFt = (specs.length * 3.28084).toFixed(1);
  const heightFt = (specs.eaveHeight * 3.28084).toFixed(1);
  const slopeRatio = specs.roofSlope > 0 ? `1:${Math.round(100 / specs.roofSlope)}` : 'Flat';
  const slopeDesc = `${slopeRatio} (${specs.roofType === 'Single Slope' ? 'single side slope' : specs.roofType})`;

  const clientDisplay = settings.clientName?.trim()
    ? (settings.clientName.trim().toLowerCase().startsWith('m/s') ? settings.clientName.trim() : `M/s – ${settings.clientName.trim()}`)
    : 'M/s – Valued Client';
  const clientEmailDisplay = settings.clientEmail?.trim() || 'NA';

  const roofingBrandStr = settings.roofingBrand?.trim() || '0.50mm JSW BGL AZ150';
  const claddingBrandStr = settings.claddingBrand?.trim() || '0.50mm JSW';
  const accessoriesBrandStr = settings.accessoriesBrand?.trim() || 'Standard';
  const pipeBrandStr = settings.pipeBrand?.trim() || 'APL Apollo / Surya / Jindal';
  const sectionBrandStr = settings.sectionBrand?.trim() || 'JSW / TATA / SAIL';

  const enabledOpenings: string[] = [];
  if (specs.hasWalls !== false) {
    if (specs.hasProfileGate !== false) enabledOpenings.push('Profile Gate');
    if (specs.hasWindows !== false) enabledOpenings.push('Windows');
    if (specs.hasLouvers !== false) enabledOpenings.push('Louvers');
  }
  const openingsStr = enabledOpenings.length > 0 ? `On the wall (${enabledOpenings.join(', ')})` : (specs.hasWalls !== false ? 'On the wall' : 'N/A');

  const enabledAccessories: string[] = [];
  if (specs.hasRoof !== false) {
    if (specs.hasRidgeCap !== false && specs.roofType !== 'Single Slope') enabledAccessories.push('Ridge');
    if (specs.hasGutters !== false) enabledAccessories.push('Gutter');
    if (specs.hasGables !== false) enabledAccessories.push('Gable Flashing');
    if (specs.hasDownPipes !== false) enabledAccessories.push('Downpipe');
    if (specs.hasTurboVents !== false) enabledAccessories.push('Turbo Vents');
    if (specs.hasPolySheets !== false) enabledAccessories.push('Polycarbonate Sheets');
  }
  if (specs.hasSDScrews !== false) enabledAccessories.push('Screws/Rivet');
  const accessoriesStr = enabledAccessories.length > 0
    ? `${enabledAccessories.join(', ')} (${accessoriesBrandStr})`
    : `N/A (${accessoriesBrandStr})`;

  const enabledFinishing: string[] = [];
  if (specs.hasWalls !== false) {
    if (specs.hasEndFlashing !== false) enabledFinishing.push('Bottom trim');
    if (specs.hasCornerFlashing !== false) enabledFinishing.push('Corner flashing');
    if (specs.hasCrimpedSheets !== false) enabledFinishing.push('Crimped sheets');
  }
  if (specs.hasRoof !== false && specs.hasGables !== false) enabledFinishing.push('Gable');
  const finishingStr = enabledFinishing.length > 0 ? enabledFinishing.join(', ') : 'N/A';

  const drawWatermark = () => {
    doc.setTextColor(245, 247, 250);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${settings.companyName} ${settings.companyPhone ? settings.companyPhone.split(',')[0].trim() : ''}`, pageWidth / 2, pageHeight / 2, { angle: 45, align: 'center' });
    doc.setTextColor(15, 23, 42);
  };

  const drawPageHeader = (pageNumLabel: string): number => {
    drawWatermark();
    let y = 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(pageNumLabel, pageWidth / 2, y, { align: 'center' });
    y += 4;

    // Company banner box
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, contentWidth, 12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(settings.companyName, pageWidth / 2, y + 5, { align: 'center' });
    doc.setFontSize(8.5);
    doc.text(settings.companyTagline || 'Strengthening the Universe', pageWidth / 2, y + 10, { align: 'center' });
    y += 15;

    // Client & Ref box
    doc.rect(margin, y, contentWidth, 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(clientDisplay, margin + 3, y + 5);
    doc.text(`This ref no. ${settings.proposalRefNo || '-'}`, margin + 3, y + 10);
    if (clientEmailDisplay !== 'NA') {
      doc.text(`Email: ${clientEmailDisplay}`, pageWidth - margin - 3, y + 5, { align: 'right' });
    }
    y += 18;
    return y;
  };

  // =========================================================================
  // COVER LETTER PAGE
  // =========================================================================
  drawWatermark();
  let y = 14;
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.4);

  if (letterheadImg) {
    const imgWidth = contentWidth - 4;
    const imgHeight = (letterheadImg.height / letterheadImg.width) * imgWidth;
    const boxHeight = imgHeight + 16;
    doc.rect(margin, y, contentWidth, boxHeight);
    doc.addImage(letterheadImg.dataUrl, 'JPEG', margin + 2, y + 2, imgWidth, imgHeight);

    // UPEB Product bar below letterhead image
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y + imgHeight + 4, contentWidth, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(`${settings.companyName}  •  ${settings.companyTagline}`, pageWidth / 2, y + imgHeight + 9.5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(settings.companySubtitle, pageWidth / 2, y + imgHeight + 14, { align: 'center' });
    doc.setTextColor(15, 23, 42);
    y += boxHeight + 8;
  } else {
    doc.rect(margin, y, contentWidth, 62);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text(settings.companyName, pageWidth / 2, y + 12, { align: 'center' });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(37, 99, 235);
    doc.text(settings.companyTagline || 'Strengthening the Universe', pageWidth / 2, y + 18, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(settings.companySubtitle, pageWidth / 2, y + 25, { align: 'center' });

    let infoLineY = y + 32;
    const regParts: string[] = [];
    if (settings.companyGstin) regParts.push(`GSTIN: ${settings.companyGstin}`);
    if (settings.companyUdyam) regParts.push(`Udyam: ${settings.companyUdyam}`);
    if (settings.companyState) regParts.push(`State: ${settings.companyState}`);
    if (regParts.length > 0) {
      doc.text(regParts.join('  |  '), pageWidth / 2, infoLineY, { align: 'center' });
      infoLineY += 5;
    }
    if (settings.companyAddress) {
      doc.text(`Add - ${settings.companyAddress}`, pageWidth / 2, infoLineY, { align: 'center' });
      infoLineY += 5;
    }
    const contactParts: string[] = [];
    if (settings.companyPhone) contactParts.push(`Ph: ${settings.companyPhone}`);
    if (settings.companyEmail) contactParts.push(`Email: ${settings.companyEmail}`);
    if (settings.companyFax) contactParts.push(`Fax: ${settings.companyFax}`);
    if (contactParts.length > 0) {
      doc.text(contactParts.join('  |  '), pageWidth / 2, infoLineY, { align: 'center' });
    }
    y += 70;
  }

  autoTable(doc, {
    startY: y,
    body: [
      [clientDisplay],
      [`Address- ${settings.clientAddress || 'NA'}`],
      [`DATE- ${settings.proposalDate || formatTodayDate()}`],
      [`Email - ${clientEmailDisplay}`],
      [`Subject – ${settings.proposalSubject || 'Pre-engineered structure'}`],
      [`Ref no. – ${settings.proposalRefNo || '-'}`],
    ],
    theme: 'grid',
    styles: { fontSize: 9.5, cellPadding: 2.5, textColor: [15, 23, 42], lineColor: [100, 116, 139] },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('Dear sir,', margin, y);
  y += 8;

  const p1 = `We are thankful for your enquiry for supply of PEB-shedding structure for the subject work. As per the telephonic discussions and dimensions received, we are pleased to submit our proposal for your perusal and kind consideration. Our scope of work includes engineering and fabrication of materials, supply and ${settings.includeErectionInQuote ? 'erection/sheeting thereafter ' : ''}in accordance with the annexed specifications.`;
  const p1Lines = doc.splitTextToSize(p1, contentWidth);
  doc.text(p1Lines, margin, y);
  y += p1Lines.length * 5.2 + 6;

  const p2 = `We hope that this is found in order and as per requirement. Please call us for any clarification / information as may be desired.`;
  const p2Lines = doc.splitTextToSize(p2, contentWidth);
  doc.text(p2Lines, margin, y);
  y += p2Lines.length * 5.2 + 22;

  doc.text('Yours Faithfully', margin, y);
  y += 16;
  doc.setFont('helvetica', 'bold');
  doc.text(`For ${settings.companyName}`, margin, y);
  y += 5;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(settings.companyTagline || 'Strengthening the Universe', margin, y);

  // =========================================================================
  // PAGE 1: SCOPE OF SUPPLY & BASIC DESCRIPTION
  // =========================================================================
  doc.addPage();
  y = drawPageHeader('Page 1');

  autoTable(doc, {
    startY: y,
    head: [[{ content: 'SCOPE OF SUPPLY', colSpan: 2, styles: { halign: 'center', fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' } }]],
    body: [
      ['•  Quantity', settings.buildingQuantity || '01'],
      ['•  Usage', settings.buildingUsage || 'FACTORY SHED'],
      ['•  Covered area', `${Math.round(data.areaSqFt).toLocaleString('en-IN')} SQ.FT. (${Math.round(data.areaSqM).toLocaleString('en-IN')} SQ.M.)`],
    ],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2, textColor: [15, 23, 42], lineColor: [100, 116, 139] },
    columnStyles: { 0: { cellWidth: 65, fontStyle: 'bold' }, 1: { fontStyle: 'bold' } },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('BASIC DESCRIPTION – Pre-Engineered Building – As per our drawing', margin, y);
  doc.line(margin, y + 1, margin + 108, y + 1);
  y += 4;

  const widthDisplay = data.dimensionUnit === 'ft' ? `${widthFt} ft (${specs.width.toFixed(2)} m)` : `${specs.width.toFixed(2)} m (${widthFt} ft)`;
  const lengthDisplay = data.dimensionUnit === 'ft' ? `${lengthFt} ft (${specs.length.toFixed(2)} m)` : `${specs.length.toFixed(2)} m (${lengthFt} ft)`;
  const heightDisplay = data.dimensionUnit === 'ft' ? `${heightFt} ft (${specs.eaveHeight.toFixed(2)} m)` : `${specs.eaveHeight.toFixed(2)} m (${heightFt} ft)`;

  autoTable(doc, {
    startY: y,
    body: [
      ['•  Frame type', specs.frameType],
      ['•  Width', widthDisplay],
      ['•  Length', lengthDisplay],
      ['•  Clear height', heightDisplay],
      ['•  Brick wall (M)', settings.brickWallHeight || 'N/A'],
      ['•  Roof slope', slopeDesc],
      ['•  Width module (M)', specs.frameType === 'Multi-Span' ? 'Multi-Span Module' : 'None'],
      ['•  Bay spacing (M)', `${Math.max(1, data.numFrames - 1)} @ ${data.baySpacing.toFixed(3)}M c/c of steel line`],
      ['•  End frames', settings.endFramesType || 'Non expandable'],
      ['•  End wall bay spacing (M)', `${data.endBayCount} @ ${data.endBaySpacing.toFixed(3)}M c/c of steel line`],
      ['•  Pipe & Section brands', `Pipes: ${pipeBrandStr} | Sections: ${sectionBrandStr}`],
      ['•  Wind bracing', 'MS round'],
      ['•  Openings', openingsStr],
      ['•  Roofing', specs.hasRoof !== false ? `${roofingBrandStr} (${specs.roofProfile || '6v Profile'})` : 'N/A'],
      ['•  Cladding', specs.hasWalls !== false ? `${claddingBrandStr} (${specs.wallProfile || '7v Profile'})` : 'N/A'],
      ['•  Accessories', accessoriesStr],
      ['•  Finishing', finishingStr],
      ['•  Canopy', settings.canopyCount > 0 ? `${settings.canopyCount} nos` : 'N/A'],
      ['•  Kg/m Loadings', `DL: 20, LL: ${specs.snowLoad ? '100' : '75'} KG/M sq, Wind ${specs.highWindVelocity ? '50' : '39'} m/sec`],
    ],
    theme: 'grid',
    styles: { fontSize: 8.2, cellPadding: 1.6, textColor: [15, 23, 42], lineColor: [100, 116, 139] },
    columnStyles: { 0: { cellWidth: 65 } },
    margin: { left: margin, right: margin },
  });

  // =========================================================================
  // PAGE 2: LIST OF SUPPLY ITEMS & EXCLUSIONS
  // =========================================================================
  doc.addPage();
  y = drawPageHeader('Page 2');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('LIST OF SUPPLY ITEMS', pageWidth / 2, y, { align: 'center' });
  y += 6;

  doc.setFontSize(9.5);
  doc.text('A - STRUCTURE', margin, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    body: [
      [`•  Portal frame : ${specs.hasPrimarySteel !== false ? `Built-up Plate / Section (${sectionBrandStr}) - YST-350MPA (MIN)` : 'N/A'}`],
      [`•  Pipes, Roof, Side & Gable Girt : ${specs.hasSecondarySteel !== false ? `MS Pipe / GI Z Purlin (${pipeBrandStr}) - YST-350 MPA` : 'N/A'}`],
      [`•  Canopy : ${settings.canopyCount > 0 ? `${settings.canopyCount} nos` : 'N/A'}`],
      ['•  Wind braces : Rafter and tie level of beams and columns'],
      [`•  Flange bracing : ${specs.hasFlanges !== false ? 'Included' : 'N/A'}`],
      ['•  Foundation bolts : MS round (black)'],
      ['•  Sag rods : MS round 12 dia'],
      ['•  Fasteners : MS/HSFG nut-bolts'],
    ],
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2, textColor: [15, 23, 42], lineColor: [100, 116, 139] },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('B - SHEETS AND ACCESSORIES', margin, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    body: [
      [specs.hasRoof !== false ? `Sheets for roof – ${roofingBrandStr} (${specs.roofProfile || '6v Profile'})` : 'Sheets for roof – N/A'],
      [specs.hasWalls !== false ? `Sides and Gable – ${claddingBrandStr} (${specs.wallProfile || '7v Profile'})` : 'Sides and Gable – N/A'],
      [specs.hasWalls !== false ? `Sheets for cladding – ${claddingBrandStr}` : 'Sheets for cladding – N/A'],
      [`Accessories & Flashings Brand – ${accessoriesBrandStr}`],
      [specs.hasInsulation !== false ? 'Air Bubble Insulation Layer (Roof & Wall)' : 'N/A'],
      [specs.hasPolySheets !== false || specs.hasTurboVents !== false ? `Skylight / Ventilation: ${[specs.hasPolySheets !== false ? 'Polycarbonate Sheets' : '', specs.hasTurboVents !== false ? 'Turbo Vents' : ''].filter(Boolean).join(', ')}` : 'N/A'],
      [specs.hasGutters !== false ? `Eave gutter (${specs.roofType === 'Single Slope' ? 'eave end' : 'both ends'}) ${specs.hasDownPipes !== false ? 'with down pipe' : ''}` : 'N/A'],
      ['Self-threading screws, pop rivet and silicone sealant'],
      [`THE COLOUR COAT SCHEME will be as per your suggestion (Roof: ${data.roofColorName}, Wall: ${data.wallColorName})`],
    ],
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2, textColor: [15, 23, 42], lineColor: [100, 116, 139] },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('EXCLUSIONS', pageWidth / 2, y, { align: 'center' });
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('•   Any product or service not clearly specified in this proposal.', margin, y);
  y += 6;
  const exclLines = doc.splitTextToSize('•   The work excludes any kind of civil work as foundation, grouting, flooring, brick work, joineries, etc.', contentWidth);
  doc.text(exclLines, margin, y);

  // =========================================================================
  // PAGE 3: COMMERCIALS & TAX AND DUTIES
  // =========================================================================
  doc.addPage();
  y = drawPageHeader('Page 3');

  const unitLabel = data.dimensionUnit === 'ft' ? 'SQFT' : 'SQM';
  const qtyDisplay = data.dimensionUnit === 'ft' ? Math.round(data.areaSqFt) : Math.round(data.areaSqM);
  const rateDisplay = qtyDisplay > 0 ? (data.supplyAmountBeforeGst / qtyDisplay).toFixed(1) : '0.0';

  autoTable(doc, {
    startY: y,
    head: [['Description of work', 'Quantity', 'Unit', 'Rate', 'Amount']],
    body: [
      [
        'A - Designing, Fabrication of Steel Structure & PCP sheets Along with the Transportation',
        qtyDisplay.toLocaleString('en-IN'),
        unitLabel,
        `${rateDisplay}/-`,
        fmtINR(data.supplyAmountBeforeGst),
      ],
      [
        'B – Erection / sheeting',
        settings.includeErectionInQuote ? `${Math.round(data.totalSteelWeightMT * 1000).toLocaleString('en-IN')}` : 'NA',
        'KGS',
        settings.includeErectionInQuote && data.totalSteelWeightMT > 0 ? `${(data.erectionAmountBeforeGst / (data.totalSteelWeightMT * 1000)).toFixed(1)}/-` : '',
        settings.includeErectionInQuote ? fmtINR(data.erectionAmountBeforeGst) : 'NA',
      ],
      ...(settings.includeCivilInQuote ? [[
        'C – Civil Foundation Estimate (Included)',
        qtyDisplay.toLocaleString('en-IN'),
        unitLabel,
        `${qtyDisplay > 0 ? (data.civilAmountBeforeGst / qtyDisplay).toFixed(1) : '0'}/-`,
        fmtINR(data.civilAmountBeforeGst),
      ]] : []),
      [
        { content: settings.includeCivilInQuote ? 'Total (A+B+C)' : 'Total (A+B)', colSpan: 4, styles: { fontStyle: 'bold' } },
        { content: fmtINR(data.totalBeforeGst), styles: { fontStyle: 'bold' } },
      ],
      [
        { content: 'Final amount with 18% GST', colSpan: 4, styles: { fontStyle: 'bold' } },
        { content: fmtINR(data.grandTotalWithGst), styles: { fontStyle: 'bold' } },
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255], fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 2.5, textColor: [15, 23, 42], lineColor: [100, 116, 139] },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`NOTE – The estimated weight of the structure is ${data.totalSteelWeightMT.toFixed(1)} MT (metric ton)`, margin + 6, y);
  y += 7;
  doc.text(`TURBO - Rs. ${data.turboVentUnitRate.toLocaleString('en-IN')} EACH`, margin + 6, y);
  y += 7;
  doc.text(`PCP SHEET - Rs. ${data.pcpSheetUnitRate.toLocaleString('en-IN')} EACH`, margin + 6, y);
  y += 12;

  doc.text('TAX AND DUTIES', margin, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.text('•   Our Rates are Ex-site.', margin + 6, y);
  y += 6;
  const taxLines = doc.splitTextToSize('•   If there is any change in other statutory taxes / duties or GST in the currency of works, they will be charged extra in full.', contentWidth - 6);
  doc.text(taxLines, margin + 6, y);

  // =========================================================================
  // PAGE 4 & 5: DESIGN SPECIFICATIONS & PAYMENT SCHEDULE
  // =========================================================================
  doc.addPage();
  y = drawPageHeader('Page 4 & 5');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Design –', margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('The design, supply and fabrication of all the structural members will be made as per your approved drawings and specifications.', margin, y, { maxWidth: contentWidth });
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [['S. No.', 'Materials', 'Specifications', 'Yield strength']],
    body: MATERIAL_DESIGN_SPECS.map(r => [r.sno, r.material, r.spec, r.yield]),
    theme: 'grid',
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', fontSize: 8.5 },
    styles: { fontSize: 8, cellPadding: 1.8, textColor: [15, 23, 42], lineColor: [100, 116, 139] },
    columnStyles: { 0: { cellWidth: 14 }, 3: { cellWidth: 32 } },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('TERMS OF PAYMENT – PAYMENT SCHEDULE', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.text('A', pageWidth / 2, y, { align: 'center' });
  y += 3;

  const supplyBaseForSched = settings.includeCivilInQuote ? (data.supplyWithGst + data.civilAmountBeforeGst * 1.18) : data.supplyWithGst;

  autoTable(doc, {
    startY: y,
    head: [['Description', 'Day', 'Amount (including GST 18%)']],
    body: [
      ['50% after dumping of pipe and other fabrication material (except sheet)', 'Day 1', fmtINR(supplyBaseForSched * 0.5)],
      ['35% Payment before dispatch of truss', 'Day 20 to day 30', fmtINR(supplyBaseForSched * 0.35)],
      ['Remaining 15% payment before dispatch of Sheet', 'Day 30 to day 40', fmtINR(supplyBaseForSched * 0.15)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255], fontSize: 8.5 },
    styles: { fontSize: 8.5, cellPadding: 2.2, textColor: [15, 23, 42], lineColor: [100, 116, 139] },
    columnStyles: { 1: { halign: 'center', cellWidth: 36 }, 2: { halign: 'right', cellWidth: 48 } },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('B', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.text('ERECTION PAYMENT SCHEDULE', pageWidth / 2, y, { align: 'center' });
  y += 3;

  autoTable(doc, {
    startY: y,
    head: [['Description', 'Day', 'Amount (includes 18% GST)']],
    body: [
      ['30% payment before the start of the Erection', 'Advance', settings.includeErectionInQuote ? fmtINR(data.erectionWithGst * 0.3) : 'NA'],
      ['60% payment after completion of erection', 'Day 35', settings.includeErectionInQuote ? fmtINR(data.erectionWithGst * 0.6) : 'NA'],
      ['10% after completion of sheeting and Accessories', 'Day 45-50', settings.includeErectionInQuote ? fmtINR(data.erectionWithGst * 0.1) : 'NA'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255], fontSize: 8.5 },
    styles: { fontSize: 8.5, cellPadding: 2.2, textColor: [15, 23, 42], lineColor: [100, 116, 139] },
    columnStyles: { 1: { halign: 'center', cellWidth: 36 }, 2: { halign: 'right', cellWidth: 48 } },
    margin: { left: margin, right: margin },
  });

  // =========================================================================
  // PAGE 6: TERMS AND CONDITIONS & WORK SCHEDULE
  // =========================================================================
  doc.addPage();
  y = drawPageHeader('Page 6');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TERMS AND CONDITIONS', pageWidth / 2, y, { align: 'center' });
  y += 8;

  const drawClause = (title: string, body: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    const titlePrefix = `${title} – `;
    doc.text(titlePrefix, margin, y);
    const titleW = doc.getTextWidth(titlePrefix);
    doc.setFont('helvetica', 'normal');
    const firstLineMax = contentWidth - titleW;
    const words = body.split(' ');
    let firstLine = '';
    let restIdx = words.length;
    for (let i = 0; i < words.length; i++) {
      const test = firstLine ? `${firstLine} ${words[i]}` : words[i];
      if (doc.getTextWidth(test) <= firstLineMax) {
        firstLine = test;
      } else {
        restIdx = i;
        break;
      }
    }
    doc.text(firstLine, margin + titleW, y);
    y += 5;
    if (restIdx < words.length) {
      const remaining = words.slice(restIdx).join(' ');
      const remLines = doc.splitTextToSize(remaining, contentWidth);
      doc.text(remLines, margin, y);
      y += remLines.length * 5;
    }
    y += 4;
  };

  drawClause('Confirmation of Order', 'The order is confirmed once we receive the 50% clean advance as mentioned in payment terms on Page 4 & 5.');
  drawClause('Delivery Period', 'After receiving the 50% clean advance, purchase order is placed for procuring the materials required. The commencement of the structural dispatches is subject to civil works and so is the completion time. The payment is the essence of contract and any deviation from payment schedule will affect the timeline of works. It shall take up to 20 - 25 days for completion.');

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Work schedule –', margin, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Activity', 'Start day', 'End day']],
    body: WORK_SCHEDULE_ROWS.map(r => [r.activity, r.start, r.end]),
    theme: 'grid',
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', fontSize: 9 },
    styles: { fontSize: 8.8, cellPadding: 2.2, textColor: [15, 23, 42], lineColor: [100, 116, 139] },
    columnStyles: { 1: { halign: 'center', cellWidth: 32 }, 2: { halign: 'center', cellWidth: 32 } },
    margin: { left: margin, right: margin },
  });

  // =========================================================================
  // PAGE 7: ADDITIONAL TERMS & SIGNATURES
  // =========================================================================
  doc.addPage();
  y = drawPageHeader('Page 7');

  drawClause('Painting', 'The structure will have two coats of Direct to Metal (DTM) (BERGER INDUSTRIAL PAINTS) prior to dispatches.');
  drawClause('Validity', 'Our Rates are valid for 3 days & subject to our confirmation thereafter.');
  drawClause('Force majeure', 'Standard force majeure condition will apply.');
  drawClause('Price escalation', 'If there are any major changes (+/- 4%) in the price during the currency of works, there will be a revision in the supply prices.');
  drawClause('Inspection', 'The finished goods will be inspected by your authorized representative at our works. Our responsibility regarding the dimensional correctness shall be ceased after the inspection.');
  drawClause('Facilities required', 'Nominal amenities such as workmen rest shelter with water / electricity at site on no cost basis will be provided during full currency of work.');
  drawClause('Erection / sheeting', 'Erection and sheeting means lifting of the structures to their respective position, excluding any civil works such as foundation bolts grouting, flooring, etc.');

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Thanking you and assuring our best and prompt attention all the time.', margin, y);
  y += 6;
  doc.text('Yours faithfully', margin, y);
  y += 14;
  doc.setFont('helvetica', 'bold');
  doc.text(`For ${settings.companyName}`, margin, y);
  if (settings.companyEmail) {
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(`Mail - ${settings.companyEmail}`, margin, y);
  }
  if (settings.companyPhone) {
    y += 5;
    doc.text(`Phone - ${settings.companyPhone}`, margin, y);
  }

  const sigY = pageHeight - 28;
  const sigW = 52;
  doc.line(margin + 4, sigY, margin + 4 + sigW, sigY);
  doc.line(pageWidth - margin - 4 - sigW, sigY, pageWidth - margin - 4, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`For ${settings.companyName}`, margin + 4 + sigW / 2, sigY + 5, { align: 'center' });
  doc.text('Accepted By Client', pageWidth - margin - 4 - sigW / 2, sigY + 5, { align: 'center' });

  // =========================================================================
  // PAGE 8: BANK DETAILS
  // =========================================================================
  doc.addPage();
  y = drawPageHeader('Page 8');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('Bank & Payment Details', margin, y);
  y += 8;

  const bankRows: string[][] = [
    ['Bank Name', settings.bankName || 'Not specified'],
    ['Branch', settings.bankBranch || 'Not specified'],
    ['Account Number', settings.bankAccountNo || 'Not specified'],
    ['IFSC Code', settings.bankIfsc || 'Not specified'],
  ];
  if (settings.bankUpiId?.trim()) {
    bankRows.push(['UPI ID', settings.bankUpiId.trim()]);
  }

  autoTable(doc, {
    startY: y,
    body: bankRows,
    theme: 'grid',
    styles: { fontSize: 9.5, cellPadding: 3, textColor: [15, 23, 42], lineColor: [100, 116, 139] },
    columnStyles: { 0: { cellWidth: 44, fontStyle: 'bold' } },
    margin: { left: margin, right: margin },
  });

  const safeRef = (settings.proposalRefNo || 'Proposal').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${safeRef}_PEB_Proposal.pdf`);
}
