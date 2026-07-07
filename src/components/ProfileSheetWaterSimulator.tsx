import React, { useState, useEffect, useRef } from 'react';
import { 
  Droplet, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Settings2, 
  ArrowUpToLine, 
  Wind, 
  Play, 
  Pause, 
  RefreshCw,
  Info
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
}

interface ProfileSheetWaterSimulatorProps {
  specs: ProjectSpecs;
  setSpecs: React.Dispatch<React.SetStateAction<ProjectSpecs>>;
  activeSymptom: 'overlap' | 'screw' | 'ridge' | 'gutter' | null;
  setActiveSymptom: (s: 'overlap' | 'screw' | 'ridge' | 'gutter' | null) => void;
}

export function ProfileSheetWaterSimulator({ 
  specs, 
  setSpecs, 
  activeSymptom, 
  setActiveSymptom 
}: ProfileSheetWaterSimulatorProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [screwLocation, setScrewLocation] = useState<'crest' | 'trough' | 'unfastened'>('trough');
  const [windForce, setWindForce] = useState(0.5); // 0 to 1
  const [droplets, setDroplets] = useState<Array<{ id: number; x: number; y: number; progress: number; type: string; isLeaking: boolean }>>([]);
  const [leakedDrips, setLeakedDrips] = useState<Array<{ id: number; x: number; y: number; opacity: number }>>([]);
  
  const dropletIdCounter = useRef(0);
  const dripIdCounter = useRef(0);
  const lastSpawnTime = useRef(0);

  // Auto select overlap as default view if none selected
  useEffect(() => {
    if (!activeSymptom) {
      setActiveSymptom('overlap');
    }
  }, [activeSymptom, setActiveSymptom]);

  // Sync screw position recommendation
  useEffect(() => {
    if (specs.hasPVCCaps) {
      setScrewLocation('crest');
    }
  }, [specs.hasPVCCaps]);

  // Animation Loop for droplets
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const now = Date.now();
      
      // 1. Spawn droplets
      if (now - lastSpawnTime.current > 400) {
        lastSpawnTime.current = now;
        
        let newDrop = null;
        const id = dropletIdCounter.current++;

        if (activeSymptom === 'overlap') {
          // Starting at top-left of the overlapped sheet
          newDrop = {
            id,
            x: 60,
            y: 80,
            progress: 0,
            type: 'overlap',
            isLeaking: !(specs.roofSlope >= (specs.roofType === 'Single Slope' ? 12 : 10) && specs.hasSilicon && specs.roofProfile === '6v Profile')
          };
        } else if (activeSymptom === 'screw') {
          newDrop = {
            id,
            x: 40,
            y: 70,
            progress: 0,
            type: 'screw',
            isLeaking: screwLocation === 'trough' || !specs.hasPVCCaps || screwLocation === 'unfastened'
          };
        } else if (activeSymptom === 'ridge') {
          newDrop = {
            id,
            x: 180,
            y: 110,
            progress: 0,
            type: 'ridge',
            isLeaking: windForce > 0.4 && !specs.hasRidgeCap
          };
        } else if (activeSymptom === 'gutter') {
          newDrop = {
            id,
            x: 80,
            y: 70,
            progress: 0,
            type: 'gutter',
            isLeaking: !specs.hasGutters
          };
        }

        if (newDrop) {
          setDroplets(prev => [...prev, newDrop]);
        }
      }

      // 2. Update droplet positions
      setDroplets(prev => {
        return prev.map(drop => {
          const nextProgress = drop.progress + 0.015;
          let nx = drop.x;
          let ny = drop.y;

          if (drop.type === 'overlap') {
            const hasSilicon = specs.hasSilicon;
            // Overlap geometry coordinates:
            // Top overlapping sheet starts at (60, 80) slides down to (240, 160)
            const startX = 60;
            const startY = 80;
            const midX = 180; // silicon bead location
            const midY = 135;
            const endX = 280;
            const endY = 180;

            if (nextProgress < 0.5) {
              const p = nextProgress / 0.5;
              nx = startX + (midX - startX) * p;
              ny = startY + (midY - startY) * p;
            } else {
              const p = (nextProgress - 0.5) / 0.5;
              if (drop.isLeaking && !hasSilicon) {
                // Sucked inside overlap gap (capillary action)
                // Deviates down between joints
                nx = midX + (175 - midX) * p;
                ny = midY + (165 - midY) * p;
              } else {
                // Slides safely over overlap
                nx = midX + (endX - midX) * p;
                ny = midY + (endY - midY) * p;
              }
            }
          } 
          else if (drop.type === 'screw') {
            // Fastener geometry:
            // Slope path starts at (40, 70), passes screw at (150, 120), ends at (280, 180)
            const startX = 40;
            const startY = 70;
            const screwX = 150;
            const screwY = screwLocation === 'crest' ? 100 : 130;
            const endX = 280;
            const endY = 180;

            if (nextProgress < 0.45) {
              const p = nextProgress / 0.45;
              nx = startX + (screwX - startX) * p;
              ny = startY + (screwY - 5 - startY) * p;
            } else if (nextProgress < 0.55) {
              const p = (nextProgress - 0.45) / 0.1;
              if (drop.isLeaking) {
                // Seeps into screw shaft
                nx = screwX;
                ny = screwY - 5 + 15 * p;
              } else {
                // Bypasses around crest screw head
                nx = screwX + 15 * Math.sin(p * Math.PI);
                ny = (screwY - 5) + 10 * p;
              }
            } else {
              const p = (nextProgress - 0.55) / 0.45;
              if (drop.isLeaking) {
                nx = screwX;
                ny = screwY + 10 + 20 * p; // travels straight down interior shaft
              } else {
                nx = screwX + (endX - screwX) * p;
                ny = screwY + 5 + (endY - screwY - 5) * p;
              }
            }
          }
          else if (drop.type === 'ridge') {
            // Ridge Cap geometry:
            // Water flows from peak (180, 110) down left/right. Let's do right side: (180, 110) to (280, 150)
            const startX = 180;
            const startY = 110;
            const edgeX = 230; // edge of cap
            const edgeY = 130;
            const endX = 320;
            const endY = 165;

            if (nextProgress < 0.4) {
              const p = nextProgress / 0.4;
              nx = startX + (edgeX - startX) * p;
              ny = startY + (edgeY - startY) * p;
            } else {
              const p = (nextProgress - 0.4) / 0.6;
              if (drop.isLeaking) {
                // Blown back under cap by wind pressure
                const windBackX = edgeX - 25 * p * windForce;
                const windBackY = edgeY - 5 * p;
                nx = windBackX;
                ny = windBackY;
              } else {
                nx = edgeX + (endX - edgeX) * p;
                ny = edgeY + (endY - edgeY) * p;
              }
            }
          }
          else if (drop.type === 'gutter') {
            // Eave edge geometry:
            // Roof sheet ends at (180, 120). Gutter sits at (185, 135).
            const startX = 80;
            const startY = 70;
            const edgeX = 180;
            const edgeY = 118;
            
            if (nextProgress < 0.6) {
              const p = nextProgress / 0.6;
              nx = startX + (edgeX - startX) * p;
              ny = startY + (edgeY - startY) * p;
            } else {
              const p = (nextProgress - 0.6) / 0.4;
              if (drop.isLeaking) {
                // Capillary runback / surface tension crawls backward under sheet
                const backX = edgeX - 15 * Math.sin(p * Math.PI / 2);
                const backY = edgeY + 12 * Math.sin(p * Math.PI / 2);
                nx = backX;
                ny = backY;
              } else {
                // Drops cleanly into the gutter
                nx = edgeX + 8 * p;
                ny = edgeY + 20 * p * p;
              }
            }
          }

          return {
            ...drop,
            x: nx,
            y: ny,
            progress: nextProgress
          };
        }).filter(drop => {
          // Check if droplet hits leak terminal to spawn a drip
          if (drop.progress >= 0.98) {
            if (drop.isLeaking) {
              // Spawn a vertical dripping particle under structural sheets
              const dripId = dripIdCounter.current++;
              setLeakedDrips(prevDrips => [
                ...prevDrips,
                { id: dripId, x: drop.x, y: drop.y, opacity: 1 }
              ]);
            }
            return false;
          }
          return true;
        });
      });

      // Update falling leaked drips
      setLeakedDrips(prevDrips => {
        return prevDrips.map(drip => ({
          ...drip,
          y: drip.y + 3.0,
          opacity: drip.opacity - 0.04
        })).filter(drip => drip.y < 280 && drip.opacity > 0.05);
      });

    }, 25);

    return () => clearInterval(interval);
  }, [isPlaying, activeSymptom, specs.roofSlope, specs.hasSilicon, specs.roofProfile, specs.hasPVCCaps, specs.hasRidgeCap, specs.hasGutters, screwLocation, windForce]);

  // Toggle helpers
  const toggleSilicone = () => setSpecs(prev => ({ ...prev, hasSilicon: !prev.hasSilicon }));
  const togglePVCCaps = () => setSpecs(prev => ({ ...prev, hasPVCCaps: !prev.hasPVCCaps }));
  const toggleRidgeCap = () => setSpecs(prev => ({ ...prev, hasRidgeCap: !prev.hasRidgeCap }));
  const toggleGutters = () => setSpecs(prev => ({ ...prev, hasGutters: !prev.hasGutters, hasDownPipes: !prev.hasGutters }));
  
  const isOverlapFixed = specs.roofSlope >= (specs.roofType === 'Single Slope' ? 12 : 10) && specs.hasSilicon && specs.roofProfile === '6v Profile';
  const isScrewFixed = screwLocation === 'crest' && specs.hasPVCCaps;
  const isRidgeFixed = specs.hasRidgeCap;
  const isGutterFixed = specs.hasGutters;

  const currentStatus = {
    overlap: isOverlapFixed,
    screw: isScrewFixed,
    ridge: isRidgeFixed,
    gutter: isGutterFixed
  }[activeSymptom || 'overlap'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      {/* Interactive SVG Animation Panel */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative min-h-[300px] flex flex-col">
        {/* Visual Header HUD */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800/60 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${currentStatus ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-ping'}`} />
            <span className="text-slate-300 font-bold tracking-wider uppercase">
              {activeSymptom === 'overlap' && "Capillary Overlap Simulation"}
              {activeSymptom === 'screw' && "Fastener Screwhole Entry Path"}
              {activeSymptom === 'ridge' && "Apex Ridge Suction Dynamics"}
              {activeSymptom === 'gutter' && "Surface Tension Runback (Eaves)"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <button 
              type="button" 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 hover:bg-slate-800 rounded transition"
              title={isPlaying ? "Pause Flow" : "Start Flow"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-blue-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
            <button 
              type="button" 
              onClick={() => { setDroplets([]); setLeakedDrips([]); }}
              className="p-1 hover:bg-slate-800 rounded transition"
              title="Clear Particles"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live SVG Stage */}
        <div className="flex-1 relative flex items-center justify-center p-4 bg-radial-gradient">
          <svg viewBox="0 0 360 220" className="w-full max-w-md h-auto" id="profile_sheet_svg">
            <defs>
              {/* Profile metal sheet gradients */}
              <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="50%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              <linearGradient id="metalGradientUnder" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
              <linearGradient id="waterDropletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Render Stage Grid */}
            <g stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3">
              <line x1="0" y1="50" x2="360" y2="50" />
              <line x1="0" y1="110" x2="360" y2="110" />
              <line x1="0" y1="170" x2="360" y2="170" />
              <line x1="90" y1="0" x2="90" y2="220" />
              <line x1="180" y1="0" x2="180" y2="220" />
              <line x1="270" y1="0" x2="270" y2="220" />
            </g>

            {/* TAB 1: Overlap Schematic */}
            {activeSymptom === 'overlap' && (
              <g>
                {/* Structural Purlin support beam beneath */}
                <rect x="130" y="158" width="100" height="15" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                <text x="180" y="169" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">STEEL PURLIN</text>

                {/* Bottom Sheet (Underlap) */}
                <path d="M 120 162 L 150 148 L 180 148 L 210 162 L 240 148 L 330 148" 
                      fill="none" stroke="url(#metalGradientUnder)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                <text x="310" y="138" fill="#64748b" fontSize="8" fontFamily="sans-serif">Underlap Sheet</text>

                {/* Silicone Sealant bead */}
                {specs.hasSilicon ? (
                  <circle cx="180" cy="138" r="4.5" fill="#10b981" filter="url(#glow)" opacity="0.9" />
                ) : (
                  <g opacity="0.4">
                    <circle cx="180" cy="140" r="3.5" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2 2" />
                    <text x="180" y="130" textAnchor="middle" fill="#f43f5e" fontSize="7" fontWeight="bold">NO SEALANT</text>
                  </g>
                )}

                {/* Top Sheet (Overlap) */}
                <path d="M 30 90 L 120 135 L 150 135 L 180 135 L 210 149" 
                      fill="none" stroke="url(#metalGradient)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
                <text x="50" y="105" fill="#cbd5e1" fontSize="9" fontWeight="bold">Overlap Sheet</text>

                {/* Capillary gap highlight (vulnerable indicator) */}
                {!specs.hasSilicon && (
                  <path d="M 152 142 L 208 155" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 2" className="animate-pulse" />
                )}

                {/* Capillary effect indicator text */}
                {!isOverlapFixed && (
                  <g className="animate-pulse">
                    <path d="M 160 142 Q 170 149 160 156" fill="none" stroke="#f43f5e" strokeWidth="1.5" />
                    <text x="120" y="123" fill="#f43f5e" fontSize="7" fontWeight="bold">CAPILLARY DRAW</text>
                    <path d="M 140 125 L 165 140" stroke="#f43f5e" strokeWidth="0.8" markerEnd="url(#arrow)" />
                  </g>
                )}

                {/* Inside Drip Origin (ceiling leak point) */}
                <g transform="translate(160, 163)">
                  {!isOverlapFixed && (
                    <text x="-5" y="14" fill="#f43f5e" fontSize="7" fontWeight="bold">LEAK</text>
                  )}
                </g>
              </g>
            )}

            {/* TAB 2: Fasteners & Screws Schematic */}
            {activeSymptom === 'screw' && (
              <g>
                {/* Steel purlin support underneath */}
                <rect x="100" y="140" width="160" height="20" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                <text x="180" y="153" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">PURLIN SUPPORT BEAM</text>

                {/* Metal roofing sheet cross section (High-rib corrugated profile) */}
                {/* Crest is around 150, trough is around 250 */}
                <g 
                  transform={screwLocation === 'unfastened' ? "translate(15, -25) rotate(-12, 100, 140)" : ""}
                  className={screwLocation === 'unfastened' ? "animate-bounce" : ""}
                  style={screwLocation === 'unfastened' ? { animationDuration: '2s' } : {}}
                >
                  <path d="M 30 75 L 80 120 L 130 95 L 170 95 L 220 135 L 260 135 L 310 90" 
                        fill="none" stroke="url(#metalGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  
                  {screwLocation === 'unfastened' && (
                    <g>
                      {/* Open unsealed screw hole on the crest of the dislodged sheet */}
                      <circle cx="150" cy="95" r="4" fill="#ef4444" className="animate-pulse" />
                      <line x1="150" y1="95" x2="150" y2="125" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 2" />
                      <text x="110" y="80" fill="#f43f5e" fontSize="7" fontWeight="bold">HOLE EXPOSED & SLIDING</text>
                      
                      {/* Big critical sheet dislodged label */}
                      <text x="180" y="112" fill="#f43f5e" fontSize="9" fontWeight="extrabold" className="animate-pulse">⚠️ SHEET DISLODGING!</text>
                    </g>
                  )}
                </g>

                {/* Fastener screw line */}
                {(() => {
                  const sX = 150; // crest screw position
                  const sY = 95;  // crest screw height
                  const tX = 240; // trough screw position
                  const tY = 135; // trough screw height
                  const screwX = screwLocation === 'crest' ? sX : tX;
                  const screwY = screwLocation === 'crest' ? sY : tY;

                  if (screwLocation === 'unfastened') {
                    return (
                      <g>
                        {/* Wind gusts lifting the unanchored sheet */}
                        <g stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 3" opacity="0.8" className="animate-pulse">
                          <path d="M 120 160 Q 150 110 180 80" fill="none" markerEnd="url(#arrow)" />
                          <path d="M 90 150 Q 130 95 160 65" fill="none" markerEnd="url(#arrow)" />
                          <text x="75" y="110" fill="#38bdf8" fontSize="8" fontWeight="bold" transform="rotate(-30 75 110)">WIND UPLIFT</text>
                        </g>

                        {/* Exposed fastener hole on the dislodged sheet */}
                        <g transform="translate(175, 170) rotate(85)">
                          {/* Screw lying on the ground/purlin */}
                          <line x1="0" y1="-15" x2="0" y2="15" stroke="#94a3b8" strokeWidth="3" />
                          <ellipse cx="0" cy="-6" rx="9" ry="2.2" fill="#0f172a" />
                          <rect x="-7" y="-14" width="14" height="7" rx="1" fill="#64748b" stroke="#475569" strokeWidth="0.8" />
                          <text x="15" y="-5" fill="#f43f5e" fontSize="7" fontWeight="bold" transform="rotate(-85)">UNFASTENED SCREW</text>
                        </g>
                      </g>
                    );
                  }

                  return (
                    <g>
                      {/* Screw thread line cutting through sheet */}
                      <line x1={screwX} y1={screwY - 15} x2={screwX} y2={screwY + 15} stroke="#64748b" strokeWidth="3" />
                      <line x1={screwX - 4} y1={screwY - 5} x2={screwX + 4} y2={screwY - 2} stroke="#475569" strokeWidth="1.2" />
                      <line x1={screwX - 4} y1={screwY} x2={screwX + 4} y2={screwY + 3} stroke="#475569" strokeWidth="1.2" />
                      <line x1={screwX - 4} y1={screwY + 5} x2={screwX + 4} y2={screwY + 8} stroke="#475569" strokeWidth="1.2" />

                      {/* Washer / EPDM Seal */}
                      {specs.hasPVCCaps ? (
                        // PVC Cap
                        <path d={`M ${screwX - 11} ${screwY - 10} L ${screwX - 11} ${screwY - 18} Q ${screwX} ${screwY - 24} ${screwX + 11} ${screwY - 18} L ${screwX + 11} ${screwY - 10} Z`} 
                              fill={specs.roofColor || "#383e42"} stroke="#1e293b" strokeWidth="1" />
                      ) : (
                        // Standard hex head and rubber washer
                        <g>
                          {/* EPDM Rubber washer black */}
                          <ellipse cx={screwX} cy={screwY - 6} rx="9" ry="2.2" fill="#0f172a" />
                          {/* Steel hex head */}
                          <rect x={screwX - 7} y={screwY - 14} width="14" height="7" rx="1" fill="#94a3b8" stroke="#475569" strokeWidth="0.8" />
                          <rect x={screwX - 3} y={screwY - 14} width="6" height="7" fill="#cbd5e1" />
                        </g>
                      )}

                      {/* Fastener location warning helper */}
                      {screwLocation === 'trough' && (
                        <g className="animate-pulse">
                          <circle cx={tX} cy={tY} r="18" fill="none" stroke="#f43f5e" strokeWidth="1.2" strokeDasharray="3 2" />
                          <text x={tX + 22} y={tY - 5} fill="#f43f5e" fontSize="7" fontWeight="bold">TROUGH SCREW</text>
                          <text x={tX + 22} y={tY + 4} fill="#f43f5e" fontSize="6">(High Water Path - Leaks!)</text>
                        </g>
                      )}

                      {screwLocation === 'crest' && (
                        <g>
                          <text x={sX + 18} y={sY - 25} fill="#10b981" fontSize="7" fontWeight="bold">CREST ASSEMBLY</text>
                          <text x={sX + 18} y={sY - 17} fill="#94a3b8" fontSize="6">(Correct engineering standard)</text>
                        </g>
                      )}
                    </g>
                  );
                })()}
              </g>
            )}

            {/* TAB 3: Ridge Centerline Schematic */}
            {activeSymptom === 'ridge' && (
              <g>
                {/* Main rafters forming the apex */}
                <path d="M 50 180 L 180 120 L 310 180" fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
                <circle cx="180" cy="120" r="6" fill="#1e293b" stroke="#475569" />

                {/* Left roof sheet */}
                <path d="M 60 170 L 175 117" fill="none" stroke="url(#metalGradientUnder)" strokeWidth="4.5" />
                {/* Right roof sheet */}
                <path d="M 185 117 L 300 170" fill="none" stroke="url(#metalGradientUnder)" strokeWidth="4.5" />

                {/* Wind gusts blowing horizontally (left-to-right) */}
                {windForce > 0.3 && (
                  <g stroke="#60a5fa" strokeDasharray="10 5" opacity={windForce} className="animate-pulse">
                    <path d="M 15 130 L 140 130" strokeWidth="1.5" />
                    <path d="M 30 110 L 160 110" strokeWidth="1.5" />
                    <path d="M 10 150 L 130 150" strokeWidth="1.5" />
                    <Wind className="w-4 h-4 text-sky-400" x="40" y="80" />
                    <text x="20" y="100" fill="#60a5fa" fontSize="7" fontWeight="mono">WIND FORCE</text>
                  </g>
                )}

                {/* Ridge Cap Flashing */}
                {specs.hasRidgeCap ? (
                  <path d="M 130 115 Q 180 90 230 115 L 240 122" 
                        fill="none" stroke="#f59e0b" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <g opacity="0.5">
                    <path d="M 150 112 Q 180 102 210 112" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="3 3" />
                    <text x="180" y="93" textAnchor="middle" fill="#f43f5e" fontSize="7" fontWeight="bold">NO RIDGE CAP</text>
                  </g>
                )}

                {/* Apex entry path leak warnings */}
                {!specs.hasRidgeCap && windForce > 0.4 && (
                  <g className="animate-pulse">
                    <path d="M 185 113 Q 190 123 180 135" fill="none" stroke="#f43f5e" strokeWidth="1.5" />
                    <text x="180" y="148" textAnchor="middle" fill="#f43f5e" fontSize="7" fontWeight="bold">APEX RAIN ENTRY</text>
                  </g>
                )}
              </g>
            )}

            {/* TAB 4: Eaves & Gutters Schematic */}
            {activeSymptom === 'gutter' && (
              <g>
                {/* Structural wall section */}
                <rect x="110" y="118" width="45" height="80" fill="#334155" stroke="#475569" strokeWidth="1.5" />
                <text x="132" y="160" textAnchor="middle" fill="#94a3b8" fontSize="8" transform="rotate(-90 132 160)">WALL CLADDING</text>

                {/* Steel roof profile extending beyond wall */}
                <path d="M 40 50 L 180 118" fill="none" stroke="url(#metalGradient)" strokeWidth="6.5" strokeLinecap="round" />
                <text x="70" y="65" fill="#94a3b8" fontSize="8">ROOFING SHEET</text>

                {/* Guttering System */}
                {specs.hasGutters ? (
                  <g>
                    {/* Gutter bracket & body */}
                    <path d="M 175 118 L 175 138 C 175 145 200 145 200 132 L 200 118" 
                          fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
                    <rect x="178" y="121" width="19" height="15" fill="#0369a1" opacity="0.3" />
                    
                    {/* Gutter text */}
                    <text x="210" y="133" fill="#38bdf8" fontSize="7" fontWeight="bold">GUTTER ACTIVE</text>

                    {/* Downpipe */}
                    {specs.hasDownPipes && (
                      <g>
                        <path d="M 182 140 L 182 195 L 175 205" fill="none" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
                        <text x="190" y="175" fill="#64748b" fontSize="6" fontFamily="sans-serif">DOWNPIPE</text>
                      </g>
                    )}
                  </g>
                ) : (
                  <g opacity="0.5">
                    <circle cx="180" cy="135" r="10" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2 2" />
                    <text x="215" y="136" fill="#f43f5e" fontSize="7" fontWeight="bold">NO GUTTER (Eave Overflow)</text>
                  </g>
                )}

                {/* Surface tension crawl path warning (backs up onto wall fascia) */}
                {!specs.hasGutters && (
                  <g className="animate-pulse">
                    <path d="M 180 120 Q 165 125 155 130" fill="none" stroke="#f43f5e" strokeWidth="1.2" />
                    <text x="140" y="145" textAnchor="middle" fill="#f43f5e" fontSize="6" fontWeight="bold">ROT PATH</text>
                    <text x="140" y="152" textAnchor="middle" fill="#f43f5e" fontSize="5">(Wall face dampness)</text>
                  </g>
                )}
              </g>
            )}

            {/* WATER DROPLET (ANIMATED PARTICLE) */}
            {droplets.map(drop => (
              <g key={drop.id} transform={`translate(${drop.x}, ${drop.y})`}>
                <ellipse cx="0" cy="0" rx="3.5" ry="5.5" fill="url(#waterDropletGrad)" filter="url(#glow)" />
                <path d="M -3.5 -1.5 Q 0 -6.5 3.5 -1.5 Z" fill="url(#waterDropletGrad)" />
                {/* Highlight inside the droplet */}
                <circle cx="-1" cy="-2" r="1.2" fill="#fff" opacity="0.8" />
              </g>
            ))}

            {/* INDOOR CEILING DRIPS (FALLING WATER SPLASHES) */}
            {leakedDrips.map(drip => (
              <g key={drip.id} transform={`translate(${drip.x}, ${drip.y})`} opacity={drip.opacity}>
                <ellipse cx="0" cy="0" rx="1.8" ry="3.5" fill="#38bdf8" />
                {/* Small puddle or splash at the bottom */}
                {drip.y > 195 && (
                  <circle cx="0" cy="10" r={Math.min(10, (drip.y - 195) * 0.8)} fill="none" stroke="#38bdf8" strokeWidth="1" opacity={drip.opacity} />
                )}
              </g>
            ))}
          </svg>

          {/* Diagnostic Overlay HUD text */}
          <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-300">
            <div className="flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                {activeSymptom === 'overlap' && (
                  isOverlapFixed ? (
                    <span className="text-emerald-400 font-semibold">Active overlaps are completely sealed with dual-line silicone sealant & optimal slope pitch! Water exits the sheet safely.</span>
                  ) : (
                    <span className="text-rose-400">Capillary Leak Active: Water is pulled horizontally between sheets because overlap is dry (no silicone) and pitch is too flat.</span>
                  )
                )}
                {activeSymptom === 'screw' && (
                  isScrewFixed ? (
                    <span className="text-emerald-400 font-semibold">Assembly uses correct crest-fastened self-drilling screws with matching EPDM washers and protective PVC caps!</span>
                  ) : screwLocation === 'unfastened' ? (
                    <span className="text-rose-400 font-bold animate-pulse">⚠️ CRITICAL DISLODGEMENT DETECTED: Roofing sheet is completely unanchored! Wind forces can lift, flutter, and dislodge the sheet. Heavy leaking through exposed screw hole.</span>
                  ) : (
                    <span className="text-rose-400">Fastener Leak Active: Screwing into roofing troughs places screws directly in the flood channel, causing high water pressure leaks. PVC cap protection missing.</span>
                  )
                )}
                {activeSymptom === 'ridge' && (
                  isRidgeFixed ? (
                    <span className="text-emerald-400 font-semibold">Custom wide plain ridge flashing blocks wind-driven rain. Structural framing is insulated and dry!</span>
                  ) : (
                    <span className="text-rose-400">Wind-blown Apex Leak: High-velocity winds blow sheeting water backwards *under* the open ridge gap. Ridge cap assembly missing!</span>
                  )
                )}
                {activeSymptom === 'gutter' && (
                  isGutterFixed ? (
                    <span className="text-emerald-400 font-semibold">Pre-engineered high-flow gutters catch all runoff safely, routing water into downpipes rather than wall panels.</span>
                  ) : (
                    <span className="text-rose-400">Eave Runback / Cladding Rot: Without gutters, surface tension draws water backwards onto the wall cladding causing joint weathering.</span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel / Engineering Remedies */}
      <div className="lg:col-span-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Simulation Controls</h4>
            
            {/* Tab-specific Controls */}
            {activeSymptom === 'overlap' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">Roof Slope Pitch</span>
                    <span className="font-mono font-bold text-slate-800">{specs.roofSlope}%</span>
                  </div>
                  <input 
                    type="range"
                    min="3"
                    max="20"
                    step="1"
                    value={specs.roofSlope}
                    onChange={(e) => setSpecs(prev => ({ ...prev, roofSlope: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                  <p className="text-[10px] text-slate-400">Slope &ge; 10% (double) or 12% (single) is needed to clear water quickly.</p>
                </div>

                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100">
                  <div className="text-xs">
                    <span className="font-bold block text-slate-700">Overlap Silicone</span>
                    <span className="text-slate-400 text-[10px]">Butyl mastic sealant line</span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleSilicone}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      specs.hasSilicon 
                        ? 'bg-emerald-500 text-white shadow-sm' 
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {specs.hasSilicon ? 'Equipped' : 'Missing'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100">
                  <div className="text-xs">
                    <span className="font-bold block text-slate-700">Sheeting Profile</span>
                    <span className="text-slate-400 text-[10px]">Anti-capillary channel depth</span>
                  </div>
                  <select
                    value={specs.roofProfile || '7v Profile'}
                    onChange={(e) => setSpecs(prev => ({ ...prev, roofProfile: e.target.value as any }))}
                    className="p-1 text-xs border border-slate-200 rounded bg-white text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="7v Profile">7v Profile (Flat joint)</option>
                    <option value="6v Profile">6v Profile (28-30mm Anti-Cap)</option>
                  </select>
                </div>
              </div>
            )}

            {activeSymptom === 'screw' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100">
                  <div className="text-xs">
                    <span className="font-bold block text-slate-700">Screw Fastening State</span>
                    <span className="text-slate-400 text-[10px]">Portal roof cladding anchorage</span>
                  </div>
                  <div className="flex gap-1 bg-slate-100 p-0.5 rounded">
                    <button
                      type="button"
                      onClick={() => setScrewLocation('crest')}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        screwLocation === 'crest' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Crest
                    </button>
                    <button
                      type="button"
                      onClick={() => setScrewLocation('trough')}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        screwLocation === 'trough' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Trough
                    </button>
                    <button
                      type="button"
                      onClick={() => setScrewLocation('unfastened')}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        screwLocation === 'unfastened' ? 'bg-amber-500 text-white shadow-xs animate-pulse' : 'text-slate-600'
                      }`}
                    >
                      Unfastened
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100">
                  <div className="text-xs">
                    <span className="font-bold block text-slate-700">PVC Protective Caps</span>
                    <span className="text-slate-400 text-[10px]">Color-matching caps with seals</span>
                  </div>
                  <button
                    type="button"
                    onClick={togglePVCCaps}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      specs.hasPVCCaps 
                        ? 'bg-emerald-500 text-white shadow-sm' 
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {specs.hasPVCCaps ? 'Equipped' : 'Missing'}
                  </button>
                </div>
              </div>
            )}

            {activeSymptom === 'ridge' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">Wind Force (Storm simulation)</span>
                    <span className="font-mono font-bold text-slate-800">{Math.round(windForce * 120)} km/h</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={windForce}
                    onChange={(e) => setWindForce(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100">
                  <div className="text-xs">
                    <span className="font-bold block text-slate-700">Ridge Apex Cap</span>
                    <span className="text-slate-400 text-[10px]">Wide plain ridge flashing</span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleRidgeCap}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      specs.hasRidgeCap 
                        ? 'bg-emerald-500 text-white shadow-sm' 
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {specs.hasRidgeCap ? 'Equipped' : 'Missing'}
                  </button>
                </div>
              </div>
            )}

            {activeSymptom === 'gutter' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100">
                  <div className="text-xs">
                    <span className="font-bold block text-slate-700">Eave Guttering System</span>
                    <span className="text-slate-400 text-[10px]">High-flow gutter and downpipes</span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleGutters}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      specs.hasGutters 
                        ? 'bg-emerald-500 text-white shadow-sm' 
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {specs.hasGutters ? 'Equipped' : 'Missing'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Apply Engineering Remedy Button */}
        <div className="mt-4">
          {currentStatus ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="text-xs font-medium">
                <span className="font-bold block">Engineering Integrity Secure</span>
                Active design complies with structural water management codes.
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (activeSymptom === 'overlap') {
                  setSpecs(prev => ({
                    ...prev,
                    roofSlope: Math.max(prev.roofSlope, prev.roofType === 'Single Slope' ? 12 : 10),
                    hasSilicon: true,
                    roofProfile: '6v Profile'
                  }));
                } else if (activeSymptom === 'screw') {
                  setScrewLocation('crest');
                  setSpecs(prev => ({
                    ...prev,
                    hasPVCCaps: true,
                    hasSDScrews: true
                  }));
                } else if (activeSymptom === 'ridge') {
                  setSpecs(prev => ({
                    ...prev,
                    hasRidgeCap: true
                  }));
                } else if (activeSymptom === 'gutter') {
                  setSpecs(prev => ({
                    ...prev,
                    hasGutters: true,
                    hasDownPipes: true
                  }));
                }
              }}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              {activeSymptom === 'overlap' && "Apply Overlap Sealant & Optimize Pitch"}
              {activeSymptom === 'screw' && "Remount Crest Screws & PVC Caps"}
              {activeSymptom === 'ridge' && "Equip Plain Ridge Flashing"}
              {activeSymptom === 'gutter' && "Install Pre-engineered High-Flow Gutters"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
