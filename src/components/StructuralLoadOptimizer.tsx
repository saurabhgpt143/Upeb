import React, { useState } from 'react';
import { 
  Scale, 
  Wind, 
  Snowflake, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  ShieldCheck, 
  ArrowRight, 
  RotateCcw, 
  Info, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Activity
} from 'lucide-react';

interface ProjectSpecs {
  width: number;
  length: number;
  eaveHeight: number;
  roofSlope: number;
  roofType: 'Single Slope' | 'Hut-shaped' | 'Multi-Sloped Hut' | 'Curved';
  roofProfile?: '7v Profile' | '6v Profile' | 'Standard';
  wallProfile?: '7v Profile' | '6v Profile' | 'Standard';
  frameType: 'Clear Span' | 'Multi-Span' | 'Truss';
  roofColor?: string;
  wallColor?: string;
  hasRoof?: boolean;
  hasWalls?: boolean;
  hasPrimarySteel?: boolean;
  hasSecondarySteel?: boolean;
  hasGirts?: boolean;
  alternateRoofColors?: boolean;
  alternateWallColors?: boolean;
  alternateRoofColor?: string;
  alternateWallColor?: string;
  alternateRoofPattern?: 'stripes' | 'checkerboard' | 'bands' | 'edges' | 'center';
  alternateWallPattern?: 'stripes' | 'checkerboard' | 'bands' | 'edges' | 'center';
  alternateRoofRatio?: number;
  alternateWallRatio?: number;
  hasRidgeCap?: boolean;
  ridgeCapColor?: string;
  hasGutters?: boolean;
  gutterColor?: string;
  hasGables?: boolean;
  gableColor?: string;
  hasCornerFlashing?: boolean;
  cornerFlashingColor?: string;
  hasEndFlashing?: boolean;
  endFlashingColor?: string;
  hasDownPipes?: boolean;
  downPipeColor?: string;
  hasTurboVents?: boolean;
  hasLouvers?: boolean;
  louversPosition?: 'Front' | 'Back' | 'Left' | 'Right' | 'Left & Right' | 'Front & Back' | 'All Sides';
  hasInsulation?: boolean;
  distinctSheetColors?: boolean;
  hasPolySheets?: boolean;
  hasMSFlats?: boolean;
  hasSDScrews?: boolean;
  hasSilicon?: boolean;
  hasPVCCaps?: boolean;
  pvcCapColor?: string;
  hasFlanges?: boolean;
  hasProfileGate?: boolean;
  profileGatePosition?: 'Front' | 'Back' | 'Left' | 'Right';
  hasWindows?: boolean;
  windowsPosition?: 'Front' | 'Back' | 'Left' | 'Right' | 'Left & Right' | 'Front & Back' | 'All Sides';
  hasCrimpedSheets?: boolean;
  crimpedSheetsColor?: string;
  highWindVelocity?: boolean;
  snowLoad?: boolean;
  deliveryAddress?: string;
  deliveryDistance?: number;
  dieselPrice?: number;
  columnProfile?: string;
  rafterProfile?: string;
  purlinProfile?: string;
  girtProfile?: string;
  basePlateProfile?: string;
  nutBoltProfile?: string;
  accessoryOverrides?: {
    [key: string]: { qty?: number; price?: number };
  };
  materialOverrides?: { [key: string]: { qty?: number | ''; price?: number | ''; name?: string } };
  additionalItems?: { id: string; name: string; unit: string; qty: number | ''; price: number | '' }[];
}

interface StructuralLoadOptimizerProps {
  specs: ProjectSpecs;
  setSpecs: React.Dispatch<React.SetStateAction<ProjectSpecs>>;
  dimensionUnit: string;
}

export function StructuralLoadOptimizer({ specs, setSpecs, dimensionUnit }: StructuralLoadOptimizerProps) {
  // Simulator inputs (adjustable by sliders)
  const [windSpeed, setWindSpeed] = useState<number>(specs.highWindVelocity ? 180 : 110); // in km/h
  const [liveSnowLoad, setLiveSnowLoad] = useState<number>(specs.snowLoad ? 1.5 : 0.2); // in kN/m²
  const [collapsedCategories, setCollapsedCategories] = useState<{ [key: string]: boolean }>({});

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Extract profiles weight to see if they're robust enough
  const getWeightFromProfile = (profileStr: string | undefined, defaultWt: number): number => {
    if (!profileStr) return defaultWt;
    const match = profileStr.match(/-(\d+(?:\.\d+)?)kg/);
    return match ? parseFloat(match[1]) : defaultWt;
  };

  const colWeight = getWeightFromProfile(specs.columnProfile, 27);
  const rafWeight = getWeightFromProfile(specs.rafterProfile, 27);
  const purlinWeight = getWeightFromProfile(specs.purlinProfile, 14);

  // --- Real-time engineering calculators ---
  const span = specs.width;
  const height = specs.eaveHeight;
  const slope = specs.roofSlope;

  // 1. Deflection Factor (Span/Thickness ratio)
  // Clear spans deflection limit (L/180 or L/240). Safe limit is usually span < 14m for solid beam of weight 27kg.
  let deflectionRatio = 1.0;
  if (specs.frameType === 'Clear Span') {
    deflectionRatio = (span * 1.5) / (rafWeight / 20 + 0.1);
  } else if (specs.frameType === 'Multi-Span') {
    deflectionRatio = (span * 0.75) / (rafWeight / 20 + 0.1);
  } else { // Truss
    deflectionRatio = (span * 0.45) / (rafWeight / 20 + 0.1);
  }
  const deflectionScore = Math.max(0, Math.min(100, 100 - (deflectionRatio - 8) * 12));

  // 2. Wind Uplift Force (based on wind speed, building height, and roof pitch)
  // Simple pressure formula: P = 0.0006 * V² * Cp (where Cp is higher for steeper/higher buildings)
  const isHighPitch = slope > 15;
  const pressureCoef = 0.8 + (height > 10 ? 0.2 : 0) + (isHighPitch ? 0.15 : -0.1);
  const designWindPressure = 0.0006 * windSpeed * windSpeed * pressureCoef; // kN/m²
  
  // Resistance depends on purlin spacing, SDS screws, PVC caps
  const purlinSpacing = specs.highWindVelocity || specs.snowLoad ? 1.0 : 1.5;
  const screwsPerOverlap = specs.hasPVCCaps && specs.hasSDScrews ? 6 : specs.hasSDScrews ? 4 : 2;
  const upliftResistance = (purlinWeight / 14) * (screwsPerOverlap / 4) * (1.5 / purlinSpacing) * 1.8;
  const windUpliftRatio = designWindPressure / (upliftResistance || 1);
  const windSafetyScore = Math.max(0, Math.min(100, 100 - (windUpliftRatio - 0.7) * 140));

  // 3. Gravity Snow & Ice Load Accumulation Risk
  // Snow load decreases if slope is steep (shedding effect)
  const slopeReductionFactor = Math.max(0.2, Math.min(1.0, 1 - (slope - 10) * 0.025));
  const activeSnowAccumulation = liveSnowLoad * slopeReductionFactor; // active load in kN/m²
  
  // Beam bearing capacity (resistance)
  let bearingCapacity = 1.0;
  if (specs.frameType === 'Clear Span') {
    bearingCapacity = (rafWeight / 27) * (15 / span) * 1.5;
  } else if (specs.frameType === 'Multi-Span') {
    bearingCapacity = (rafWeight / 27) * (15 / (span / 2)) * 2.0;
  } else { // Truss
    bearingCapacity = (rafWeight / 27) * (15 / span) * 3.5;
  }
  const snowSafetyRatio = activeSnowAccumulation / bearingCapacity;
  const snowSafetyScore = Math.max(0, Math.min(100, 100 - (snowSafetyRatio - 0.6) * 150));

  // 4. Column Buckling Stress (due to eave height and column weight)
  // Buckling depends on Slenderness ratio: H_eave / Column stiffness
  const slendernessFactor = height / (colWeight / 10 + 0.5);
  const bucklingResistance = 120 / (slendernessFactor * slendernessFactor || 1);
  const actingHorizontalWindShear = (windSpeed * windSpeed * 0.0003 * height) / 10;
  const bucklingRatio = actingHorizontalWindShear / bucklingResistance;
  const columnSafetyScore = Math.max(0, Math.min(100, 100 - (bucklingRatio - 0.5) * 120));

  // Combined overall structural safety score
  const overallSafetyIndex = Math.round(
    deflectionScore * 0.3 + 
    windSafetyScore * 0.25 + 
    snowSafetyScore * 0.25 + 
    columnSafetyScore * 0.2
  );

  // Safety status color & message
  const getSafetyColor = (score: number) => {
    if (score >= 85) return { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' };
    if (score >= 60) return { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' };
    return { border: 'border-rose-200', bg: 'bg-rose-50', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-800' };
  };

  const safetyMeta = getSafetyColor(overallSafetyIndex);

  // Pre-configured recommendations based on current specifications and loads
  const failureVulnerabilities = [
    {
      id: 'span-deflection',
      title: 'Rafter Deflection & Sagging risk',
      category: 'Frame Integrity',
      condition: deflectionScore < 75,
      score: Math.round(deflectionScore),
      symptom: `At ${span}m width, the current ${specs.frameType} rafters exhibit high central bending moment stress. Standard solid-web profiles are prone to visual deflection of span/150 under full load.`,
      remedy: 'Upgrade Frame Type to Truss-Framed or choose a heavier rafter section.',
      actionLabel: 'Convert to Truss Frame',
      onResolve: () => setSpecs(prev => ({ ...prev, frameType: 'Truss' }))
    },
    {
      id: 'wind-uplift',
      title: 'Roof Sheet Blow-Off & Girt Shear failure',
      category: 'Wind Resistance',
      condition: windSafetyScore < 75,
      score: Math.round(windSafetyScore),
      symptom: `Wind pressure of ${designWindPressure.toFixed(2)} kN/m² causes aerodynamic suction at eaves. Standard purlin spacing (${purlinSpacing}m) with default fasteners risks joint tearing.`,
      remedy: 'Reduce purlin spacing, enable SDS self-drilling screws, and add profile PVC caps.',
      actionLabel: 'Optimize Fasteners & Purlins',
      onResolve: () => setSpecs(prev => ({ 
        ...prev, 
        highWindVelocity: true, 
        hasSDScrews: true, 
        hasPVCCaps: true,
        purlinProfile: '2 x 38 x 38 x 6000mm -14kg' // secure standard purlin
      }))
    },
    {
      id: 'snow-collapse',
      title: 'Gravity/Snow overload accumulation',
      category: 'Gravity Load',
      condition: snowSafetyScore < 75,
      score: Math.round(snowSafetyScore),
      symptom: `Low slope of ${slope}% restricts gravitational shedding. Snow density combined with dead load exceeds the allowable elastic modulus of the rafter section.`,
      remedy: 'Increase roof pitch (slope) to at least 15% or enable snow-load secondary structures.',
      actionLabel: 'Increase Roof Slope to 15%',
      onResolve: () => setSpecs(prev => ({ ...prev, roofSlope: 15, snowLoad: true }))
    },
    {
      id: 'column-buckling',
      title: 'Column Buckling & Joint Rotation stress',
      category: 'Lateral Stability',
      condition: columnSafetyScore < 75,
      score: Math.round(columnSafetyScore),
      symptom: `Eave height of ${height}m creates high wind lever arm moment at base connections. Standard lightweight column profiles (${colWeight}kg) are vulnerable to Euler elastic buckling.`,
      remedy: 'Upgrade columns to heavy-duty profiles (35kg+) and ensure rigid base plate flanges.',
      actionLabel: 'Upgrade Columns to Heavier Profiles',
      onResolve: () => setSpecs(prev => ({ 
        ...prev, 
        columnProfile: '2 x 72 x 72 x 6000mm -35kg',
        hasFlanges: true 
      }))
    }
  ];

  // Active vulnerabilities count
  const activeCount = failureVulnerabilities.filter(v => v.condition).length;

  return (
    <div id="structural-load-optimizer" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
            Structural Load Optimizer & Failure Risk Analyzer
          </h3>
          <p className="text-xs text-slate-500">
            Simulate real-time physical loads and optimize specifications to prevent portal frame or cladding failure.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${safetyMeta.badge}`}>
            Safety Index: {overallSafetyIndex}%
          </span>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Sliders and Live Physics Indicators */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-blue-500" />
              Adjust Applied External Loads
            </h4>

            {/* Slider 1: Wind Speed */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-sky-500" />
                  Wind Velocity (V)
                </span>
                <span className="font-mono font-bold text-slate-900 bg-sky-50 px-2 py-0.5 rounded">
                  {windSpeed} km/h
                </span>
              </div>
              <input 
                type="range"
                min="80"
                max="250"
                step="5"
                value={windSpeed}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setWindSpeed(val);
                  if (val > 140 && !specs.highWindVelocity) {
                    setSpecs(prev => ({ ...prev, highWindVelocity: true }));
                  }
                }}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500 focus:outline-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>80 km/h (Light Wind)</span>
                <span>250 km/h (Extreme Cyclone)</span>
              </div>
            </div>

            {/* Slider 2: Snow / Gravity Live Load */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <Snowflake className="w-3.5 h-3.5 text-blue-500" />
                  Snow / Live Gravity Load
                </span>
                <span className="font-mono font-bold text-slate-900 bg-blue-50 px-2 py-0.5 rounded">
                  {liveSnowLoad.toFixed(2)} kN/m²
                </span>
              </div>
              <input 
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={liveSnowLoad}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setLiveSnowLoad(val);
                  if (val > 1.0 && !specs.snowLoad) {
                    setSpecs(prev => ({ ...prev, snowLoad: true }));
                  }
                }}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.1 kN/m² (Standard Gutter Runoff)</span>
                <span>3.0 kN/m² (Severe Blizzard)</span>
              </div>
            </div>
          </div>

          {/* Physics Stress Breakdown Meters */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Design Stress Ratios</h4>
            
            <div className="space-y-2.5">
              {/* Rafter Bending */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Rafter Bending Moment (Deflection)</span>
                  <span className={`font-semibold ${deflectionScore > 80 ? 'text-emerald-600' : deflectionScore > 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {deflectionScore > 80 ? 'Safe' : deflectionScore > 50 ? 'Warning' : 'Critical Deflection'} ({Math.round(deflectionScore)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${deflectionScore > 80 ? 'bg-emerald-500' : deflectionScore > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${deflectionScore}%` }}
                  />
                </div>
              </div>

              {/* Wind Uplift Tension */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Overlapping Sheet Pull-out Force</span>
                  <span className={`font-semibold ${windSafetyScore > 80 ? 'text-emerald-600' : windSafetyScore > 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {windSafetyScore > 80 ? 'Safe' : windSafetyScore > 50 ? 'Vulnerable' : 'Tearing Threat'} ({Math.round(windSafetyScore)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${windSafetyScore > 80 ? 'bg-emerald-500' : windSafetyScore > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${windSafetyScore}%` }}
                  />
                </div>
              </div>

              {/* Gravity Snow Weight */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Gravity Bearing Modulus</span>
                  <span className={`font-semibold ${snowSafetyScore > 80 ? 'text-emerald-600' : snowSafetyScore > 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {snowSafetyScore > 80 ? 'Safe' : snowSafetyScore > 50 ? 'High Deadweight' : 'Yield Failure'} ({Math.round(snowSafetyScore)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${snowSafetyScore > 80 ? 'bg-emerald-500' : snowSafetyScore > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${snowSafetyScore}%` }}
                  />
                </div>
              </div>

              {/* Column Buckling */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Slenderness & Buckling Limit</span>
                  <span className={`font-semibold ${columnSafetyScore > 80 ? 'text-emerald-600' : columnSafetyScore > 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {columnSafetyScore > 80 ? 'Safe' : columnSafetyScore > 50 ? 'Buckling Risk' : 'Elastic Failure'} ({Math.round(columnSafetyScore)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${columnSafetyScore > 80 ? 'bg-emerald-500' : columnSafetyScore > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${columnSafetyScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Interactive 2D Vector Physics Diagram */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-slate-900 rounded-xl p-4 text-white relative border border-slate-800">
          <div className="absolute top-3 left-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-blue-400" />
            2D Physics Stress Distribution
          </div>

          {/* SVG Frame Drawing */}
          <div className="w-full h-52 flex items-center justify-center mt-6">
            <svg viewBox="0 0 300 200" className="w-full h-full overflow-visible">
              {/* Ground level */}
              <line x1="20" y1="170" x2="280" y2="170" stroke="#475569" strokeWidth="3" />
              
              {/* Force Vectors: Wind Uplift */}
              {windSpeed > 130 && (
                <g className="animate-pulse">
                  {/* Cyan arrows pulling upwards */}
                  <path d="M 150 50 L 150 30 M 150 30 L 146 36 M 150 30 L 154 36" stroke="#06b6d4" strokeWidth="2" fill="none" />
                  <path d="M 90 70 L 90 50 M 90 50 L 86 56 M 90 50 L 94 56" stroke="#06b6d4" strokeWidth="2" fill="none" />
                  <path d="M 210 70 L 210 50 M 210 50 L 206 56 M 210 50 L 214 56" stroke="#06b6d4" strokeWidth="2" fill="none" />
                  <text x="155" y="28" fill="#06b6d4" className="text-[9px] font-mono font-bold">WIND UPLIFT SUCTION</text>
                </g>
              )}

              {/* Force Vectors: Snow Weight */}
              {liveSnowLoad > 0.8 && (
                <g className="animate-pulse">
                  {/* White/Blue arrows pushing downwards */}
                  <path d="M 120 40 L 120 60 M 120 60 L 116 54 M 120 60 L 124 54" stroke="#e2e8f0" strokeWidth="2" fill="none" />
                  <path d="M 180 40 L 180 60 M 180 60 L 176 54 M 180 60 L 184 54" stroke="#e2e8f0" strokeWidth="2" fill="none" />
                  <text x="125" y="38" fill="#cbd5e1" className="text-[9px] font-mono font-bold">GRAVITY SNOW WEIGHT</text>
                </g>
              )}

              {/* Rafter Members (Stress color-coded) */}
              {/* Left Rafter */}
              <line 
                x1="60" 
                y1="100" 
                x2="150" 
                y2="60" 
                stroke={deflectionScore > 80 ? '#10b981' : deflectionScore > 50 ? '#f59e0b' : '#ef4444'} 
                strokeWidth={specs.frameType === 'Truss' ? '3' : '5'} 
                className="transition-all duration-300"
              />
              {/* Right Rafter */}
              <line 
                x1="150" 
                y1="60" 
                x2="240" 
                y2="100" 
                stroke={deflectionScore > 80 ? '#10b981' : deflectionScore > 50 ? '#f59e0b' : '#ef4444'} 
                strokeWidth={specs.frameType === 'Truss' ? '3' : '5'} 
                className="transition-all duration-300"
              />

              {/* Columns (Stress color-coded based on Column Buckling Score) */}
              {/* Left Column */}
              <line 
                x1="60" 
                y1="170" 
                x2="60" 
                y2="100" 
                stroke={columnSafetyScore > 80 ? '#10b981' : columnSafetyScore > 50 ? '#f59e0b' : '#ef4444'} 
                strokeWidth="6" 
                className="transition-all duration-300"
              />
              {/* Right Column */}
              <line 
                x1="240" 
                y1="170" 
                x2="240" 
                y2="100" 
                stroke={columnSafetyScore > 80 ? '#10b981' : columnSafetyScore > 50 ? '#f59e0b' : '#ef4444'} 
                strokeWidth="6" 
                className="transition-all duration-300"
              />

              {/* Interior Columns if Multi-Span */}
              {specs.frameType === 'Multi-Span' && (
                <line x1="150" y1="170" x2="150" y2="60" stroke="#10b981" strokeWidth="4" strokeDasharray="2 2" />
              )}

              {/* Truss webbing representation */}
              {specs.frameType === 'Truss' && (
                <g stroke="#10b981" strokeWidth="1.5" opacity="0.8">
                  {/* Bottom Chord */}
                  <line x1="60" y1="100" x2="240" y2="100" />
                  {/* Diagonal webs */}
                  <line x1="105" y1="100" x2="105" y2="80" />
                  <line x1="105" y1="80" x2="150" y2="100" />
                  <line x1="150" y1="100" x2="150" y2="60" /> {/* King post */}
                  <line x1="195" y1="100" x2="195" y2="80" />
                  <line x1="195" y1="80" x2="150" y2="100" />
                </g>
              )}

              {/* Ground Anchor Bolts and Base Plate circles */}
              <circle cx="60" cy="170" r="4" fill="#64748b" />
              <circle cx="240" cy="170" r="4" fill="#64748b" />

              {/* Labels for interactive metrics */}
              <text x="35" y="125" fill="#94a3b8" className="text-[8px] font-mono">H={height}m</text>
              <text x="135" y="115" fill="#94a3b8" className="text-[8px] font-mono">Span={span}m</text>
              <text x="140" y="52" fill="#94a3b8" className="text-[8px] font-mono">{slope}°</text>

              {/* Red warning heat halos around dangerous failure points */}
              {deflectionScore < 60 && (
                <g className="animate-ping">
                  <circle cx="150" cy="60" r="6" stroke="#ef4444" strokeWidth="1.5" fill="none" opacity="0.6" />
                </g>
              )}
              {columnSafetyScore < 60 && (
                <g className="animate-ping">
                  <circle cx="60" cy="135" r="6" stroke="#ef4444" strokeWidth="1.5" fill="none" opacity="0.6" />
                  <circle cx="240" cy="135" r="6" stroke="#ef4444" strokeWidth="1.5" fill="none" opacity="0.6" />
                </g>
              )}
            </svg>
          </div>

          {/* Quick analysis output info */}
          <div className="bg-slate-800 rounded-lg p-2.5 mt-2 text-[10px] space-y-1 text-slate-300 font-mono">
            <div className="flex justify-between">
              <span>Primary Steel Mass:</span>
              <span className="text-white">{(span * height * 0.15).toFixed(2)} Tons per Frame</span>
            </div>
            <div className="flex justify-between">
              <span>Max Safe Wind Velocity:</span>
              <span className={windSafetyScore < 60 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                {Math.round(110 * Math.sqrt(upliftResistance || 1))} km/h
              </span>
            </div>
            <div className="flex justify-between">
              <span>Symmetric Load Elastic Limit:</span>
              <span className="text-white">{(bearingCapacity * 1.5).toFixed(1)} kN/m²</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Warnings & Remedies */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Remedy Recommendations ({activeCount})
              </h4>
              {activeCount === 0 && (
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Fully Optimized
                </span>
              )}
            </div>

            {activeCount === 0 ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center space-y-2 animate-in fade-in duration-300">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                <h5 className="text-xs font-bold text-emerald-800">No Structural Vulnerabilities Found</h5>
                <p className="text-[10px] text-emerald-600">
                  The current combination of portal spans, frame profiles, slopes, and purlin fasteners is fully optimized to withstand the configured snow loads and cyclone uplift forces.
                </p>
                <button
                  onClick={() => {
                    setWindSpeed(210);
                    setLiveSnowLoad(2.2);
                  }}
                  className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-100/60 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors inline-block"
                >
                  Simulate Hurricane Loads
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[310px] overflow-y-auto pr-1">
                {failureVulnerabilities.map(vuln => {
                  if (!vuln.condition) return null;
                  const isCollapsed = collapsedCategories[vuln.id];
                  return (
                    <div 
                      key={vuln.id} 
                      className="border border-rose-100 bg-rose-50/45 rounded-xl p-3 text-xs space-y-2 transition-all duration-300 hover:shadow-sm"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-rose-800 flex items-center gap-1 shrink-0">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                          {vuln.category}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-100 px-1.5 py-0.2 rounded">
                          Risk: {100 - vuln.score}%
                        </span>
                      </div>

                      <div className="text-slate-700 space-y-1">
                        <p className="font-medium text-slate-800 text-[11px]">{vuln.title}</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed">{vuln.symptom}</p>
                      </div>

                      <div className="pt-1.5 border-t border-rose-100/60 flex flex-col gap-1.5">
                        <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                          <Wrench className="w-3 h-3 text-slate-400" />
                          Remedy: {vuln.remedy}
                        </span>
                        <button
                          onClick={vuln.onResolve}
                          className="w-full text-center bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-2 rounded-lg text-[10px] transition-colors flex items-center justify-center gap-1"
                        >
                          {vuln.actionLabel}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Direct structural optimization manual action buttons */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
            <button
              onClick={() => {
                setSpecs(prev => ({
                  ...prev,
                  frameType: 'Truss',
                  roofSlope: Math.max(prev.roofSlope, 12),
                  columnProfile: '2 x 72 x 72 x 6000mm -35kg',
                  rafterProfile: '2 x 48 x 96 x 6000mm -35kg',
                  highWindVelocity: true,
                  snowLoad: true,
                  hasSDScrews: true,
                  hasPVCCaps: true,
                  hasFlanges: true
                }));
                setWindSpeed(110);
                setLiveSnowLoad(0.2);
              }}
              className="w-full text-center bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              Reset & Auto-Optimize Frame Design
            </button>
            <p className="text-[9px] text-slate-400 text-center italic">
              Applies standard safety code combinations dynamically.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
