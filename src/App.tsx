/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Center, Text, Line as DreiLine, Bounds, useBounds } from '@react-three/drei';
import * as THREE from 'three';
import {
  Building,
  Ruler,
  Calendar,
  DraftingCompass,
  Truck,
  Wrench,
  CheckCircle2,
  Clock,
  Layers,
  Activity,
  ClipboardList,
  Monitor,
  X,
  Search,
  Scissors,
  Zap,
  Wind,
  Paintbrush,
  PenTool,
  Palette,
  Square,
  Plus,
  Flame,
  PaintBucket,
  Brush,
  List,
  ArrowUpToLine,
  Tractor,
  Hammer,
  Disc,
  Settings,
  Cpu,
  AlignJustify,
  Maximize2,
  Minus,
  Maximize,
  Paperclip,
  Target,
  Settings2,
  Circle,
  Sun,
  Droplet,
  Fan,
  Shield,
  ChevronDown,
  FileText,
  Download,
  RotateCcw,
  Image as ImageIcon,
  Camera,
  ScanLine,
  Share2,
  Minimize,
  UploadCloud,
  CloudRain,
  Snowflake,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { rainSynthesizer } from './utils/rainAudio';
import { ProfileDiagram } from './components/ProfileDiagram';
import { ProfileSheetWaterSimulator } from './components/ProfileSheetWaterSimulator';
import { StructuralLoadOptimizer } from './components/StructuralLoadOptimizer';
import { InstallPWA } from './components/InstallPWA';
import VoiceChatAssistant from './components/VoiceChatAssistant';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MaterialIcon } from './components/MaterialIcons';

type Phase = 'planning' | 'engineering' | 'fabrication' | 'delivery' | 'erection';

export interface ProjectSpecs {
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
  accessoryOverrides?: {
    [key: string]: { qty?: number; price?: number };
  };
  materialOverrides?: { [key: string]: { qty?: number | ''; price?: number | ''; name?: string } };
  additionalItems?: { id: string; name: string; unit: string; qty: number | ''; price: number | '' }[];
  columnProfile?: string;
  rafterProfile?: string;
  purlinProfile?: string;
  girtProfile?: string;
  basePlateProfile?: string;
  nutBoltProfile?: string;
}

export function calculateSDScrews(specs: ProjectSpecs, type: 'roof' | 'wall' | 'all' = 'all'): number {
  const purlinSpacing = specs.highWindVelocity || specs.snowLoad ? 1.0 : 1.5;
  const girtSpacing = specs.highWindVelocity || specs.snowLoad ? 1.0 : 1.5;
  const rafterLength = Math.sqrt(Math.pow(specs.width / 2, 2) + Math.pow(((specs.width / 2) * specs.roofSlope) / 100, 2)).toFixed(2);
  let purlinRunsPerFrame = 0;

  if (specs.roofType === 'Single Slope') {
    const totRoofH = specs.width * (specs.roofSlope / 100);
    const rl = Math.sqrt(specs.width * specs.width + totRoofH * totRoofH);
    purlinRunsPerFrame = Math.max(1, Math.round(rl / purlinSpacing)) + 1;
  } else if (specs.roofType === 'Multi-Sloped Hut') {
    const h_steep = (specs.width / 4) * (specs.roofSlope * 1.5 / 100);
    const h_shallow = (specs.width / 4) * (specs.roofSlope * 0.5 / 100);
    const rl_steep = Math.sqrt((specs.width / 4) * (specs.width / 4) + h_steep * h_steep);
    const rl_shallow = Math.sqrt((specs.width / 4) * (specs.width / 4) + h_shallow * h_shallow);
    purlinRunsPerFrame = (Math.max(1, Math.round(rl_steep / purlinSpacing)) + Math.max(1, Math.round(rl_shallow / purlinSpacing))) * 2 + 1;
  } else if (specs.roofType === 'Curved') {
    const arcLen = specs.width * 1.1; 
    purlinRunsPerFrame = Math.max(1, Math.round(arcLen / purlinSpacing)) + 1;
  } else {
    purlinRunsPerFrame = Math.max(1, Math.round(parseFloat(rafterLength) / purlinSpacing)) * 2 + 1;
  }
  
  const girtRuns = Math.ceil(specs.eaveHeight / girtSpacing) + 1; // +1 for base girt
  
  let count = 0;
  if ((type === 'roof' || type === 'all') && specs.hasRoof !== false) {
    count += Math.max(0, Math.ceil((6 * specs.length * purlinRunsPerFrame) - ((specs.length - 1) * purlinRunsPerFrame)));
  }
  if ((type === 'wall' || type === 'all') && specs.hasWalls !== false) {
    count += Math.ceil((6 / 1.2) * specs.length * girtRuns * 2);
    count += Math.ceil((6 / 1.2) * specs.width * girtRuns * 2);
  }
  return count;
}

export const STANDARD_COLORS = [
  { name: 'RAL 5012 Light Blue', hex: '#0089b6' },
  { name: 'RAL 5010 Gentian Blue', hex: '#004f7c' },
  { name: 'RAL 5015 Sky Blue', hex: '#2271b3' },
  { name: 'RAL 5002 Ultramarine Blue', hex: '#20214f' },
  { name: 'RAL 3020 Traffic Red', hex: '#cc0605' },
  { name: 'RAL 3000 Flame Red', hex: '#af2b1e' },
  { name: 'RAL 3009 Oxide Red', hex: '#642424' },
  { name: 'RAL 8004 Copper Brown', hex: '#8f4e35' },
  { name: 'RAL 8011 Nut Brown', hex: '#5b3a29' },
  { name: 'RAL 8017 Chocolate Brown', hex: '#45322e' },
  { name: 'RAL 6005 Moss Green', hex: '#114232' },
  { name: 'RAL 6011 Reseda Green', hex: '#68825b' },
  { name: 'RAL 6002 Leaf Green', hex: '#276235' },
  { name: 'RAL 6020 Chrome Green', hex: '#37422f' },
  { name: 'RAL 9002 Grey White', hex: '#e7ebda' },
  { name: 'RAL 9001 Cream', hex: '#e9e5ce' },
  { name: 'RAL 9003 Signal White', hex: '#f4f4f4' },
  { name: 'RAL 9005 Jet Black', hex: '#0a0a0a' },
  { name: 'RAL 1015 Light Ivory', hex: '#e6d690' },
  { name: 'RAL 1013 Oyster White', hex: '#e3d9c6' },
  { name: 'RAL 1001 Beige', hex: '#d4b58e' },
  { name: 'RAL 1021 Colza Yellow', hex: '#f3a505' },
  { name: 'RAL 2004 Pure Orange', hex: '#e15501' },
  { name: 'RAL 7035 Light Grey', hex: '#d3d3d3' },
  { name: 'RAL 7015 Slate Grey', hex: '#434750' },
  { name: 'RAL 7016 Anthracite Grey', hex: '#383e42' },
  { name: 'RAL 7024 Graphite Grey', hex: '#474a51' },
  { name: 'RAL 9006 White Aluminium', hex: '#a5a5a5' },
];

export const getPanelColor = (key: string, baseColor: string, type: 'roof' | 'wall', specs: ProjectSpecs, panelColors: Record<string, string>) => {
  if (panelColors[key]) return panelColors[key];

  if (specs.distinctSheetColors) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = Math.imul(31, hash) + key.charCodeAt(i) | 0;
    }
    hash ^= hash >>> 16;
    hash = Math.imul(0x85ebca6b, hash);
    hash ^= hash >>> 13;
    hash = Math.imul(0xc2b2ae35, hash);
    hash ^= hash >>> 16;

    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  const isAltEnabled = type === 'roof' ? specs.alternateRoofColors : specs.alternateWallColors;
  if (isAltEnabled) {
    let isAlt = false;
    let colIndex = -1;
    let segIndex = 0;
    let sideStr = '';
    
    let match = key.match(/sheet_(\d+)(?:_seg_(\d+))?/);
    if (match) {
      colIndex = parseInt(match[1], 10);
      segIndex = match[2] !== undefined ? parseInt(match[2], 10) : 0;
      sideStr = 'roof';
    } else {
      match = key.match(/wall_([lrfb])_(\d+)(?:_(\d+))?/);
      if (match) {
        sideStr = match[1];
        colIndex = parseInt(match[2], 10);
        segIndex = match[3] !== undefined ? parseInt(match[3], 10) : 0;
      }
    }

    if (colIndex !== -1) {
      const pattern = type === 'roof' ? (specs.alternateRoofPattern || 'stripes') : (specs.alternateWallPattern || 'stripes');
      const ratio = type === 'roof' ? (specs.alternateRoofRatio || 2) : (specs.alternateWallRatio || 2);
      
      if (pattern === 'checkerboard') {
        isAlt = (colIndex + segIndex) % ratio === (ratio - 1);
      } else if (pattern === 'bands') {
        isAlt = (segIndex % ratio) === (ratio - 1);
      } else if (pattern === 'edges' || pattern === 'center') {
        const profile = type === 'roof' ? specs.roofProfile : specs.wallProfile;
        const effWidth = profile === '6v Profile' ? 0.99 : (profile === '7v Profile' ? 1.188 : 1.0);
        const blockLen = sideStr === 'f' || sideStr === 'b' ? specs.width : specs.length;
        const numSheets = Math.ceil(blockLen / effWidth - 0.001);
        
        if (pattern === 'edges') {
          isAlt = colIndex === 0 || colIndex === numSheets - 1;
        } else {
          const mid = Math.floor(numSheets / 2);
          const spread = Math.max(1, Math.floor(numSheets / (ratio * 2)));
          isAlt = Math.abs(colIndex - mid) < spread;
        }
      } else {
        isAlt = (colIndex % ratio) === (ratio - 1);
      }
      
      if (isAlt) {
         return type === 'roof' ? (specs.alternateRoofColor || '#d3d3d3') : (specs.alternateWallColor || '#d3d3d3');
      }
    }
  }
  return baseColor;
};

function CameraManager({ isInside, specs }: { isInside: boolean, specs: ProjectSpecs }) {
  const { camera, controls } = useThree();

  React.useEffect(() => {
    if (controls) {
      if (isInside) {
        camera.position.set(0, 1.6, specs.length / 4);
        (camera as THREE.PerspectiveCamera).near = 0.1;
        (camera as THREE.PerspectiveCamera).fov = 85;
        (controls as any).target.set(0, 1.6, specs.length / 2);
        (controls as any).maxPolarAngle = Math.PI;
        (controls as any).minDistance = 0.1;
        (controls as any).maxDistance = Math.max(specs.width, specs.length);
      } else {
        camera.position.set(specs.width * 1.5, specs.eaveHeight * 2, specs.length * 1.5);
        (camera as THREE.PerspectiveCamera).near = 0.5;
        (camera as THREE.PerspectiveCamera).fov = 45;
        (controls as any).target.set(0, specs.eaveHeight / 2, 0);
        (controls as any).maxPolarAngle = Math.PI / 2 - 0.05;
        (controls as any).minDistance = 1;
        (controls as any).maxDistance = 500;
      }
      camera.updateProjectionMatrix();
      (controls as any).update();
    }
  }, [isInside, specs, camera, controls]);

  return null;
}

function SpinningTurboVent({ position, weatherType }: { position: [number, number, number]; weatherType: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      let speed = 1.0;
      if (weatherType === 'storm') {
        speed = 12.0;
      } else if (weatherType === 'rain') {
        speed = 4.0;
      } else if (weatherType === 'snow') {
        speed = 0.2;
      } else {
        speed = 1.0;
      }
      groupRef.current.rotation.y += speed * delta;
    }
  });

  return (
    <group position={position}>
      {/* Base: cylinder */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.2, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Spinning dome */}
      <group ref={groupRef}>
        <mesh receiveShadow position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Fins */}
        {Array.from({ length: 8 }).map((_, idx) => {
          const angle = (idx * Math.PI) / 4;
          return (
            <mesh key={idx} position={[0.2 * Math.cos(angle), 0.15, 0.2 * Math.sin(angle)]} rotation={[0, -angle, 0.3]}>
              <boxGeometry args={[0.02, 0.15, 0.08]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function LightningController() {
  const [intensity, setIntensity] = useState(0);
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const check = Math.sin(elapsed * 0.3) + Math.cos(elapsed * 0.85);
    if (check > 1.85 && Math.random() < 0.1) {
      setIntensity(4.5);
      // Trigger rolling thunder rumble with a realistic speed-of-sound delay
      const delay = 0.6 + Math.random() * 1.2;
      rainSynthesizer.triggerThunder(delay);
    } else if (intensity > 0) {
      setIntensity(prev => prev * 0.78);
    }
  });
  if (intensity < 0.1) return null;
  return (
    <directionalLight
      position={[-10, 35, -5]}
      intensity={intensity}
      color="#e0f2fe"
    />
  );
}

function ForceVectorArrows({ specs, weatherType }: { specs: ProjectSpecs; weatherType: string }) {
  if (weatherType === 'clear' || weatherType === 'rain') return null;

  const w = specs.width;
  const l = specs.length;
  const h = specs.eaveHeight;

  return (
    <group>
      {/* Snow Load Downward Force Vectors */}
      {weatherType === 'snow' && (
        <group>
          {Array.from({ length: 5 }).map((_, idx) => {
            const z = -l / 2 + (idx / 4) * l;
            return (
              <React.Fragment key={`snow_force_${idx}`}>
                <group position={[-w / 4, h + (w / 4) * (specs.roofSlope / 100) + 1.2, z]}>
                  <mesh>
                    <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
                    <meshBasicMaterial color="#ef4444" />
                  </mesh>
                  <mesh position={[0, -0.4, 0]}>
                    <coneGeometry args={[0.08, 0.2, 8]} />
                    <meshBasicMaterial color="#ef4444" />
                  </mesh>
                </group>
                <group position={[w / 4, h + (w / 4) * (specs.roofSlope / 100) + 1.2, z]}>
                  <mesh>
                    <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
                    <meshBasicMaterial color="#ef4444" />
                  </mesh>
                  <mesh position={[0, -0.4, 0]}>
                    <coneGeometry args={[0.08, 0.2, 8]} />
                    <meshBasicMaterial color="#ef4444" />
                  </mesh>
                </group>
              </React.Fragment>
            );
          })}
        </group>
      )}

      {/* Wind Load Uplift and Lateral Force Vectors */}
      {weatherType === 'storm' && (
        <group>
          {Array.from({ length: 5 }).map((_, idx) => {
            const z = -l / 2 + (idx / 4) * l;
            return (
              <React.Fragment key={`wind_force_${idx}`}>
                {/* Uplift Arrow Left */}
                <group position={[-w / 4, h + (w / 4) * (specs.roofSlope / 100) + 0.6, z]} rotation={[0, 0, Math.PI / 6]}>
                  <mesh position={[0, 0.4, 0]}>
                    <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
                    <meshBasicMaterial color="#06b6d4" />
                  </mesh>
                  <mesh position={[0, 0.8, 0]}>
                    <coneGeometry args={[0.08, 0.2, 8]} />
                    <meshBasicMaterial color="#06b6d4" />
                  </mesh>
                </group>
                {/* Uplift Arrow Right */}
                <group position={[w / 4, h + (w / 4) * (specs.roofSlope / 100) + 0.6, z]} rotation={[0, 0, -Math.PI / 6]}>
                  <mesh position={[0, 0.4, 0]}>
                    <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
                    <meshBasicMaterial color="#06b6d4" />
                  </mesh>
                  <mesh position={[0, 0.8, 0]}>
                    <coneGeometry args={[0.08, 0.2, 8]} />
                    <meshBasicMaterial color="#06b6d4" />
                  </mesh>
                </group>
                {/* Lateral Wind Force (Windward Wall) */}
                <group position={[-w / 2 - 1.2, h / 2, z]} rotation={[0, 0, -Math.PI / 2]}>
                  <mesh>
                    <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
                    <meshBasicMaterial color="#06b6d4" />
                  </mesh>
                  <mesh position={[0, -0.4, 0]}>
                    <coneGeometry args={[0.08, 0.2, 8]} />
                    <meshBasicMaterial color="#06b6d4" />
                  </mesh>
                </group>
              </React.Fragment>
            );
          })}
        </group>
      )}
    </group>
  );
}

function WeatherEffects({ weatherType, specs }: { weatherType: string; specs: ProjectSpecs }) {
  const rainRef = useRef<THREE.Points>(null);
  const snowRef = useRef<THREE.Points>(null);
  const windRef = useRef<THREE.Group>(null);

  const particleCount = 600;

  // Rain initialization
  const rainPositions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * specs.width * 3.0;
      arr[i * 3 + 1] = Math.random() * specs.eaveHeight * 3.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * specs.length * 2.5;
    }
    return arr;
  }, [specs.width, specs.length, specs.eaveHeight]);

  const rainVelocities = useMemo(() => {
    const arr = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      arr[i] = 12.0 + Math.random() * 8.0;
    }
    return arr;
  }, []);

  // Snow initialization
  const snowPositions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * specs.width * 3.0;
      arr[i * 3 + 1] = Math.random() * specs.eaveHeight * 3.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * specs.length * 2.5;
    }
    return arr;
  }, [specs.width, specs.length, specs.eaveHeight]);

  const snowVelocities = useMemo(() => {
    const arr = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      arr[i] = 1.2 + Math.random() * 1.5;
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Rain Animation
    if (weatherType === 'rain' || weatherType === 'storm') {
      if (rainRef.current) {
        const geo = rainRef.current.geometry;
        const posAttr = geo.attributes.position;
        const arr = posAttr.array as Float32Array;
        const speedMultiplier = weatherType === 'storm' ? 1.8 : 1.0;
        const windDrift = weatherType === 'storm' ? 4.0 : 0.5;

        for (let i = 0; i < particleCount; i++) {
          arr[i * 3 + 1] -= rainVelocities[i] * delta * speedMultiplier; // Fall downward
          arr[i * 3] += windDrift * delta; // Wind drift

          // Reset when hitting ground
          if (arr[i * 3 + 1] < -0.1) {
            arr[i * 3 + 1] = specs.eaveHeight * 3.0 + Math.random() * 5.0;
            arr[i * 3] = (Math.random() - 0.5) * specs.width * 3.0 - (weatherType === 'storm' ? 4.0 : 0.0);
            arr[i * 3 + 2] = (Math.random() - 0.5) * specs.length * 2.5;
          }
        }
        posAttr.needsUpdate = true;
      }
    }

    // Snow Animation
    if (weatherType === 'snow') {
      if (snowRef.current) {
        const geo = snowRef.current.geometry;
        const posAttr = geo.attributes.position;
        const arr = posAttr.array as Float32Array;

        for (let i = 0; i < particleCount; i++) {
          arr[i * 3 + 1] -= snowVelocities[i] * delta; // Fall slower
          arr[i * 3] += Math.sin(time + i) * delta * 0.4; // Soft floating drift
          arr[i * 3 + 2] += Math.cos(time * 0.5 + i) * delta * 0.2;

          // Reset when hitting ground
          if (arr[i * 3 + 1] < -0.1) {
            arr[i * 3 + 1] = specs.eaveHeight * 3.0 + Math.random() * 3.0;
            arr[i * 3] = (Math.random() - 0.5) * specs.width * 3.0;
            arr[i * 3 + 2] = (Math.random() - 0.5) * specs.length * 2.5;
          }
        }
        posAttr.needsUpdate = true;
      }
    }

    // Wind streaks rotation and drift (Storm)
    if (weatherType === 'storm' && windRef.current) {
      windRef.current.position.x += delta * 25.0;
      if (windRef.current.position.x > specs.width * 1.5) {
        windRef.current.position.x = -specs.width * 1.5;
      }
    }
  });

  return (
    <group>
      {/* Rain Particle System */}
      {(weatherType === 'rain' || weatherType === 'storm') && (
        <points ref={rainRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[rainPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#a5f3fc"
            size={0.12}
            transparent
            opacity={weatherType === 'storm' ? 0.75 : 0.5}
            sizeAttenuation
            depthWrite={false}
          />
        </points>
      )}

      {/* Snow Particle System */}
      {weatherType === 'snow' && (
        <points ref={snowRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[snowPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#ffffff"
            size={0.2}
            transparent
            opacity={0.8}
            sizeAttenuation
            depthWrite={false}
          />
        </points>
      )}

      {/* Wind Streaks (Storm) */}
      {weatherType === 'storm' && (
        <group ref={windRef} position={[-specs.width, specs.eaveHeight, 0]}>
          {Array.from({ length: 8 }).map((_, i) => {
            const rx = (Math.random() - 0.5) * specs.width;
            const ry = Math.random() * specs.eaveHeight;
            const rz = (Math.random() - 0.5) * specs.length;
            const len = 4 + Math.random() * 6;
            return (
              <mesh key={i} position={[rx, ry, rz]} rotation={[0, 0, 0.1]}>
                <boxGeometry args={[len, 0.02, 0.02]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
}

function Building3DModel({ specs, panelColors, setPanelColors, framingOnly = false, weatherType = 'clear' }: { specs: ProjectSpecs, panelColors: Record<string, string>, setPanelColors: React.Dispatch<React.SetStateAction<Record<string, string>>>, framingOnly?: boolean, weatherType?: string }) {
  const w = specs.width;
  const l = Math.max(specs.length, 1);
  const h = specs.eaveHeight;

  if (!w || !l || !h || isNaN(w) || isNaN(l) || isNaN(h) || w <= 0 || l <= 0 || h <= 0) {
    return null;
  }

  const isTrussModel = specs.frameType === 'Truss';
  const modelPurlinYOffset = isTrussModel
    ? (specs.roofType === 'Curved' ? 0.255 : specs.roofType === 'Multi-Sloped Hut' ? 0.235 : 0.25)
    : (specs.roofType === 'Curved' ? 0.325 : 0.5);

  const panelCanvasH = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, 256, 256);

      const toPx = (val: number) => Math.round((val / 198) * 256);
      const sections = [
        { width: 12.5, startColor: '#ffffff', endColor: '#ffffff' }, // half main crest
        { width: 20,   startColor: '#ffffff', endColor: '#111111' }, // main slope down
        { width: 26,   startColor: '#111111', endColor: '#111111' }, // flat
        { width: 4,    startColor: '#111111', endColor: '#777777' }, // minor slope up
        { width: 20,   startColor: '#777777', endColor: '#777777' }, // minor crest
        { width: 4,    startColor: '#777777', endColor: '#111111' }, // minor slope down
        { width: 25,   startColor: '#111111', endColor: '#111111' }, // center flat
        { width: 4,    startColor: '#111111', endColor: '#777777' }, // minor slope up
        { width: 20,   startColor: '#777777', endColor: '#777777' }, // minor crest
        { width: 4,    startColor: '#777777', endColor: '#111111' }, // minor slope down
        { width: 26,   startColor: '#111111', endColor: '#111111' }, // flat
        { width: 20,   startColor: '#111111', endColor: '#ffffff' }, // main slope up
        { width: 12.5, startColor: '#ffffff', endColor: '#ffffff' }  // half main crest
      ];

      let currentPx = 0;
      for (const t of sections) {
        const px = toPx(t.width);
        if (t.startColor === t.endColor) {
           ctx.fillStyle = t.startColor;
           ctx.fillRect(currentPx, 0, px, 256);
        } else {
           const grad = ctx.createLinearGradient(currentPx, 0, currentPx + px, 0);
           grad.addColorStop(0, t.startColor);
           grad.addColorStop(1, t.endColor);
           ctx.fillStyle = grad;
           ctx.fillRect(currentPx, 0, px, 256);
        }
        currentPx += px;
      }
    }
    return canvas;
  }, []);

  const panelCanvasV = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, 256, 256);

      const toPx = (val: number) => Math.round((val / 198) * 256);
      const sections = [
        { width: 12.5, startColor: '#ffffff', endColor: '#ffffff' }, // half main crest
        { width: 20,   startColor: '#ffffff', endColor: '#111111' }, // main slope down
        { width: 26,   startColor: '#111111', endColor: '#111111' }, // flat
        { width: 4,    startColor: '#111111', endColor: '#777777' }, // minor slope up
        { width: 20,   startColor: '#777777', endColor: '#777777' }, // minor crest
        { width: 4,    startColor: '#777777', endColor: '#111111' }, // minor slope down
        { width: 25,   startColor: '#111111', endColor: '#111111' }, // center flat
        { width: 4,    startColor: '#111111', endColor: '#777777' }, // minor slope up
        { width: 20,   startColor: '#777777', endColor: '#777777' }, // minor crest
        { width: 4,    startColor: '#777777', endColor: '#111111' }, // minor slope down
        { width: 26,   startColor: '#111111', endColor: '#111111' }, // flat
        { width: 20,   startColor: '#111111', endColor: '#ffffff' }, // main slope up
        { width: 12.5, startColor: '#ffffff', endColor: '#ffffff' }  // half main crest
      ];

      let currentPx = 0;
      for (const t of sections) {
        const px = toPx(t.width);
        if (t.startColor === t.endColor) {
           ctx.fillStyle = t.startColor;
           ctx.fillRect(0, currentPx, 256, px);
        } else {
           const grad = ctx.createLinearGradient(0, currentPx, 0, currentPx + px);
           grad.addColorStop(0, t.startColor);
           grad.addColorStop(1, t.endColor);
           ctx.fillStyle = grad;
           ctx.fillRect(0, currentPx, 256, px);
        }
        currentPx += px;
      }
    }
    return canvas;
  }, []);

  const createNormalMapFromHeightMap = (heightCanvas: HTMLCanvasElement, isVerticalPattern: boolean, strength: number = 3.5) => {
    const width = heightCanvas.width;
    const height = heightCanvas.height;
    
    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = width;
    normalCanvas.height = height;
    
    const hCtx = heightCanvas.getContext('2d');
    const nCtx = normalCanvas.getContext('2d');
    if (!hCtx || !nCtx) return normalCanvas;
    
    const hData = hCtx.getImageData(0, 0, width, height);
    const nData = nCtx.createImageData(width, height);
    
    const getVal = (x: number, y: number) => {
      const cx = Math.max(0, Math.min(width - 1, x));
      const cy = Math.max(0, Math.min(height - 1, y));
      return hData.data[(cy * width + cx) * 4] / 255.0;
    };
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let du = 0;
        let dv = 0;
        
        if (!isVerticalPattern) {
          // Horizontal variation
          du = (getVal(x - 1, y) - getVal(x + 1, y)) * strength;
          dv = 0;
        } else {
          // Vertical variation
          du = 0;
          dv = (getVal(x, y - 1) - getVal(x, y + 1)) * strength;
        }
        
        const len = Math.sqrt(du * du + dv * dv + 1.0);
        const nx = du / len;
        const ny = dv / len;
        const nz = 1.0 / len;
        
        const idx = (y * width + x) * 4;
        nData.data[idx]     = Math.round((nx * 0.5 + 0.5) * 255);
        nData.data[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
        nData.data[idx + 2] = Math.round((nz * 0.5 + 0.5) * 255);
        nData.data[idx + 3] = 255;
      }
    }
    
    nCtx.putImageData(nData, 0, 0);
    return normalCanvas;
  };

  const panelNormalCanvasH = useMemo(() => {
    return createNormalMapFromHeightMap(panelCanvasH, false, 3.5);
  }, [panelCanvasH]);

  const panelTexH = useMemo(() => {
    const tex = new THREE.CanvasTexture(panelCanvasH);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1.0 / (specs.wallProfile === '6v Profile' ? 0.198 : specs.wallProfile === '7v Profile' ? 0.198 : 0.2), 1);
    return tex;
  }, [panelCanvasH, specs.wallProfile]);

  const panelNormalTexH = useMemo(() => {
    const tex = new THREE.CanvasTexture(panelNormalCanvasH);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1.0 / (specs.wallProfile === '6v Profile' ? 0.198 : specs.wallProfile === '7v Profile' ? 0.198 : 0.2), 1);
    return tex;
  }, [panelNormalCanvasH, specs.wallProfile]);

  const panelTexV = useMemo(() => {
    const tex = new THREE.CanvasTexture(panelCanvasV);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1.0 / (specs.roofProfile === '6v Profile' ? 0.198 : specs.roofProfile === '7v Profile' ? 0.198 : 0.2));
    return tex;
  }, [panelCanvasV, specs.roofProfile]);

  const wallTexCache = useRef<Record<string, THREE.Texture>>({});
  const wallNormalTexCache = useRef<Record<string, THREE.Texture>>({});
  const roofTexCache = useRef<Record<string, THREE.Texture>>({});

  const getWallTexture = (wShape: number, startCoord: number) => {
    const profile = specs.wallProfile || '7v Profile';
    const pitch = (profile === '6v Profile' || profile === '7v Profile') ? 0.198 : 0.076;
    const cacheKey = `${wShape}_${startCoord}_${profile}`;
    if (!wallTexCache.current[cacheKey]) {
      const cloned = panelTexH.clone();
      cloned.repeat.set(wShape / pitch, 1);
      cloned.offset.set((startCoord / pitch) % 1, 0);
      cloned.wrapS = THREE.RepeatWrapping;
      cloned.wrapT = THREE.RepeatWrapping;
      cloned.needsUpdate = true;
      wallTexCache.current[cacheKey] = cloned;
    }
    return wallTexCache.current[cacheKey];
  };

  const getWallNormalTexture = (wShape: number, startCoord: number) => {
    const profile = specs.wallProfile || '7v Profile';
    const pitch = (profile === '6v Profile' || profile === '7v Profile') ? 0.198 : 0.076;
    const cacheKey = `${wShape}_${startCoord}_${profile}`;
    if (!wallNormalTexCache.current[cacheKey]) {
      const cloned = panelNormalTexH.clone();
      cloned.repeat.set(wShape / pitch, 1);
      cloned.offset.set((startCoord / pitch) % 1, 0);
      cloned.wrapS = THREE.RepeatWrapping;
      cloned.wrapT = THREE.RepeatWrapping;
      cloned.needsUpdate = true;
      wallNormalTexCache.current[cacheKey] = cloned;
    }
    return wallNormalTexCache.current[cacheKey];
  };

  const getRoofTexture = (wSheet: number, startZ: number) => {
    const profile = specs.roofProfile || '7v Profile';
    const pitch = (profile === '6v Profile' || profile === '7v Profile') ? 0.198 : 0.076;
    const cacheKey = `${wSheet}_${startZ}_${profile}`;
    if (!roofTexCache.current[cacheKey]) {
      const cloned = panelTexV.clone();
      cloned.repeat.set(1, wSheet / pitch);
      cloned.offset.set(0, (startZ / pitch) % 1);
      cloned.wrapS = THREE.RepeatWrapping;
      cloned.wrapT = THREE.RepeatWrapping;
      cloned.needsUpdate = true;
      roofTexCache.current[cacheKey] = cloned;
    }
    return roofTexCache.current[cacheKey];
  };

  const handlePanelClick = (e: any, key: string, baseColor: string, type: 'roof' | 'wall') => {
    e.stopPropagation();
    const currentColor = getPanelColor(key, baseColor, type, specs, panelColors);
    const currentIndex = STANDARD_COLORS.findIndex(c => c.hex === currentColor);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % STANDARD_COLORS.length : 0;
    setPanelColors(prev => ({ ...prev, [key]: STANDARD_COLORS[nextIndex].hex }));
  };

  const getRoofY = (x: number) => {
    const roofOffset = 0.6; // To account for rafter and purlin thickness
    if (specs.roofType === 'Single Slope') {
       return h + (x + w/2) * (specs.roofSlope / 100) + roofOffset;
    } else if (specs.roofType === 'Multi-Sloped Hut') {
       const h_steep = (w / 4) * (specs.roofSlope * 1.5 / 100);
       const h_shallow = (w / 4) * (specs.roofSlope * 0.5 / 100);
       const absX = Math.abs(x);
       if (absX >= w/4) {
          return h + (w/2 - absX) * (h_steep / (w/4)) + roofOffset;
       } else {
          return h + h_steep + (w/4 - absX) * (h_shallow / (w/4)) + roofOffset;
       }
    } else if (specs.roofType === 'Curved') {
       const roofH = (w / 2) * (specs.roofSlope / 100) * 1.5;
       const t = x / w + 0.5;
       return h + 4 * roofH * (t - t * t) + roofOffset;
    } else {
       const roofH = (w / 2) * (specs.roofSlope / 100);
       const absX = Math.abs(x);
       return h + (w/2 - absX) * (roofH / (w/2)) + roofOffset;
    }
  };

  const renderWallSheets = () => {
    if (specs.hasWalls === false) return null;
    const elements = [];
    const effWidth = specs.wallProfile === '6v Profile' ? 0.99 : (specs.wallProfile === '7v Profile' ? 1.188 : 1.0);
    const numZSheets = Math.ceil(l / effWidth - 0.001);
    
    for (let i = 0; i < numZSheets; i++) {
      const isLast = i === numZSheets - 1;
      const wSheet = isLast ? l - (numZSheets - 1) * effWidth : effWidth;
      const zCenter = i * effWidth + wSheet / 2;
      const heightLeft = getRoofY(-w/2);
      const heightRight = getRoofY(w/2);

      const createSideSegmentShape = (yMin: number, yMax: number, cStartX: number, cEndX: number, gH: number, hVal: number) => {
          const s = new THREE.Shape();
          if (yMin >= gH || cStartX < 0 || cEndX <= cStartX) {
             s.moveTo(0, yMin);
             s.lineTo(wSheet - overlapGap, yMin);
             s.lineTo(wSheet - overlapGap, yMax);
             s.lineTo(0, yMax);
             s.closePath();
          } else {
             const cutoffY = Math.min(yMax, gH);
             if (cStartX === 0 && cEndX >= wSheet - overlapGap) {
                s.moveTo(0, cutoffY);
                s.lineTo(wSheet - overlapGap, cutoffY);
             } else if (cStartX === 0) {
                s.moveTo(0, cutoffY);
                s.lineTo(cEndX, cutoffY);
                s.lineTo(cEndX, yMin);
                s.lineTo(wSheet - overlapGap, yMin);
             } else if (cEndX >= wSheet - overlapGap) {
                s.moveTo(0, yMin);
                s.lineTo(cStartX, yMin);
                s.lineTo(cStartX, cutoffY);
                s.lineTo(wSheet - overlapGap, cutoffY);
             } else {
                s.moveTo(0, yMin);
                s.lineTo(cStartX, yMin);
                s.lineTo(cStartX, cutoffY);
                s.lineTo(cEndX, cutoffY);
                s.lineTo(cEndX, yMin);
                s.lineTo(wSheet - overlapGap, yMin);
             }
             s.lineTo(wSheet - overlapGap, yMax);
             s.lineTo(0, yMax);
             s.closePath();
          }
          return s;
      };

      const gateW = Math.min(4, l * 0.6);
      const gateH = Math.min(3, h * 0.8);
      const gateStartZ = l / 2 - gateW / 2;
      const gateEndZ = l / 2 + gateW / 2;
      
      let cutStartZ = -1;
      let cutEndZ = -1;
      const zStartX = i * effWidth;
      const zEndX = zStartX + wSheet;
      const overlapGap = 0.0;

      if (zEndX > gateStartZ && zStartX < gateEndZ) {
          cutStartZ = Math.max(0, gateStartZ - zStartX);
          cutEndZ = Math.min(wSheet - overlapGap, gateEndZ - zStartX);
      }
      
      const isLeftGate = specs.hasProfileGate !== false && specs.profileGatePosition === 'Left';
      const isRightGate = specs.hasProfileGate !== false && specs.profileGatePosition === 'Right';

      const keyLeft = `wall_l_${i}`;
      const segmentsLeft = Math.ceil(heightLeft / 6);
      const segHLeft = heightLeft / segmentsLeft;

      elements.push(
        <group 
          key={keyLeft} 
          position={[-w / 2 - 0.01, 0, zCenter - wSheet / 2]} 
          rotation={[0, -Math.PI / 2, 0]}
        >
          {Array.from({ length: segmentsLeft }).map((_, j) => {
            const yMin = j * segHLeft;
            const yMax = (j + 1) * segHLeft;
            const cStartX = isLeftGate ? cutStartZ : -1;
            const cEndX = isLeftGate ? cutEndZ : -1;
            return render3DWallSheet(
              `${keyLeft}_${j}`,
              wSheet - overlapGap,
              yMin,
              yMax,
              cStartX,
              cEndX,
              gateH,
              i * effWidth,
              specs.wallProfile || '7v Profile',
              specs.wallColor || '#0089b6',
              `${keyLeft}_${j}`,
              undefined,
              true,
              isLast
            );
          })}
        </group>
      );
      
      const keyRight = `wall_r_${i}`;
      const segmentsRight = Math.ceil(heightRight / 6);
      const segHRight = heightRight / segmentsRight;
 
      elements.push(
        <group 
          key={keyRight} 
          position={[w / 2 + 0.01, 0, zCenter + wSheet / 2]} 
          rotation={[0, Math.PI / 2, 0]}
        >
          {Array.from({ length: segmentsRight }).map((_, j) => {
            const yMin = j * segHRight;
            const yMax = (j + 1) * segHRight;
            const cStartX = isRightGate ? wSheet - overlapGap - cutEndZ : -1;
            const cEndX = isRightGate ? wSheet - overlapGap - cutStartZ : -1;
            const sortedStartX = Math.min(cStartX, cEndX);
            const sortedEndX = Math.max(cStartX, cEndX);
            return render3DWallSheet(
              `${keyRight}_${j}`,
              wSheet - overlapGap,
              yMin,
              yMax,
              sortedStartX,
              sortedEndX,
              gateH,
              -(i * effWidth + wSheet),
              specs.wallProfile || '7v Profile',
              specs.wallColor || '#0089b6',
              `${keyRight}_${j}`,
              undefined,
              true,
              isLast
            );
          })}
        </group>
      );
    }
    
    const numXSheets = Math.ceil(w / effWidth - 0.001);
    for (let i = 0; i < numXSheets; i++) {
      const isLast = i === numXSheets - 1;
      const wSheet = isLast ? w - (numXSheets - 1) * effWidth : effWidth;
      const startX = -w / 2 + i * effWidth;
      const endX = startX + wSheet;
      
      const overlapGap = 0.0;
      const wShape = Math.max(0.01, wSheet - overlapGap);
      
      let cutStartX = -1;
      let cutEndX = -1;
      let gateH = 0;
      
      if (specs.hasProfileGate !== false && (!specs.profileGatePosition || specs.profileGatePosition === 'Front')) {
          const gateW = Math.min(4, w * 0.6);
          gateH = Math.min(3, h * 0.8);
          const gateStartX = -gateW / 2;
          const gateEndX = gateW / 2;
          if (endX > gateStartX && startX < gateEndX) {
              cutStartX = Math.max(0, gateStartX - startX);
              cutEndX = Math.min(wShape, gateEndX - startX);
          }
      }

      const createSegmentShape = (yMin: number, yMax: number, cStartX: number, cEndX: number, gH: number, roofL: number, roofR: number) => {
          const s = new THREE.Shape();
          if (yMin >= gH || cStartX < 0 || cEndX <= cStartX) {
             s.moveTo(0, yMin);
             s.lineTo(wShape, yMin);
             s.lineTo(wShape, Math.min(yMax, roofR));
             s.lineTo(0, Math.min(yMax, roofL));
             s.closePath();
          } else {
             const cutoffY = Math.min(yMax, gH);
             if (cStartX === 0 && cEndX === wShape) {
                s.moveTo(0, cutoffY);
                s.lineTo(wShape, cutoffY);
             } else if (cStartX === 0) {
                s.moveTo(0, cutoffY);
                s.lineTo(cEndX, cutoffY);
                s.lineTo(cEndX, yMin);
                s.lineTo(wShape, yMin);
             } else if (cEndX === wShape) {
                s.moveTo(0, yMin);
                s.lineTo(cStartX, yMin);
                s.lineTo(cStartX, cutoffY);
                s.lineTo(wShape, cutoffY);
             } else {
                s.moveTo(0, yMin);
                s.lineTo(cStartX, yMin);
                s.lineTo(cStartX, cutoffY);
                s.lineTo(cEndX, cutoffY);
                s.lineTo(cEndX, yMin);
                s.lineTo(wShape, yMin);
             }
             s.lineTo(wShape, Math.min(yMax, roofR));
             s.lineTo(0, Math.min(yMax, roofL));
             s.closePath();
          }
          return s;
      };

      const maxHFront = Math.max(getRoofY(startX), getRoofY(startX + wShape));
      const segmentsFront = Math.ceil(maxHFront / 6);
      const segHFront = maxHFront / segmentsFront;
      
      const seamMeshesFront: any[] = [];
      for (let j = 1; j < segmentsFront; j++) {
         const cutY = j * segHFront;
         const addSeam = (x1: number, x2: number) => {
             if (x2 <= x1) return;
             const sw = x2 - x1;
             const cx = x1 + sw / 2;
             seamMeshesFront.push(
               <mesh key={`seam_${j}_${x1}`} position={[cx, cutY, -0.01]} receiveShadow>
                 <boxGeometry args={[sw, 0.005, 0.01]} />
                 <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
               </mesh>
             );
         };
         if (cutY <= gateH && cutStartX >= 0 && cutEndX > cutStartX) {
             addSeam(0, cutStartX);
             addSeam(cutEndX, wShape);
         } else {
             addSeam(0, wShape);
         }
      }
      
      elements.push(
        <group key={`wall_f_${i}`} position={[startX, 0, -0.01]}>
          {Array.from({ length: segmentsFront }).map((_, j) => {
             const keyFront = `wall_f_${i}_${j}`;
             const yMin = j * segHFront;
             const yMax = (j + 1) * segHFront;
             return render3DWallSheet(
               keyFront,
               wShape,
               yMin,
               yMax,
               cutStartX,
               cutEndX,
               gateH,
               startX,
               specs.wallProfile || '7v Profile',
               specs.wallColor || '#0089b6',
               keyFront,
               (localX: number) => getRoofY(startX + localX),
               false,
               isLast
             );
           })}
          {seamMeshesFront}
        </group>
      );

      let cutStartXBack = -1;
      let cutEndXBack = -1;
      let gateHBack = 0;
      
      if (specs.hasProfileGate !== false && specs.profileGatePosition === 'Back') {
          const gateW = Math.min(4, w * 0.6);
          gateHBack = Math.min(3, h * 0.8);
          const gateStartX = -gateW / 2;
          const gateEndX = gateW / 2;
          if (endX > gateStartX && startX < gateEndX) {
              cutStartXBack = Math.max(0, gateStartX - startX);
              cutEndXBack = Math.min(wShape, gateEndX - startX);
          }
      }

      const maxHBack = Math.max(getRoofY(startX), getRoofY(startX + wShape));
      const segmentsBack = Math.ceil(maxHBack / 6);
      const segHBack = maxHBack / segmentsBack;
      const seamMeshesBack: any[] = [];
      for (let j = 1; j < segmentsBack; j++) {
         const cutY = j * segHBack;
         const addSeam = (x1: number, x2: number) => {
             if (x2 <= x1) return;
             const sw = x2 - x1;
             const cx = x1 + sw / 2;
             seamMeshesBack.push(
               <mesh key={`seam_${j}_${x1}`} position={[cx, cutY, +0.01]} receiveShadow>
                 <boxGeometry args={[sw, 0.005, 0.01]} />
                 <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
               </mesh>
             );
         };
         if (cutY <= gateHBack && cutStartXBack >= 0 && cutEndXBack > cutStartXBack) {
             addSeam(0, cutStartXBack);
             addSeam(cutEndXBack, wShape);
         } else {
             addSeam(0, wShape);
         }
      }

      elements.push(
        <group key={`wall_b_${i}`} position={[startX, 0, l + 0.01]}>
          {Array.from({ length: segmentsBack }).map((_, j) => {
             const keyBack = `wall_b_${i}_${j}`;
             const yMin = j * segHBack;
             const yMax = (j + 1) * segHBack;
             return render3DWallSheet(
               keyBack,
               wShape,
               yMin,
               yMax,
               cutStartXBack,
               cutEndXBack,
               gateHBack,
               startX,
               specs.wallProfile || '7v Profile',
               specs.wallColor || '#0089b6',
               keyBack,
               (localX: number) => getRoofY(startX + localX),
               true,
               isLast
             );
          })}
          {seamMeshesBack}
        </group>
      );
    }
    return elements;
  };

  const getProfilePoints = (wSheet: number, profileType: string, isLast?: boolean) => {
    const is7v = profileType === '7v Profile';
    const is6v = profileType === '6v Profile';
    const isStandard = profileType === 'Standard' || (!is7v && !is6v);

    let numPeaks = 6;
    let pitch = 0.198;
    let peakHeight = 0.030;
    let peakBaseW = 0.065;
    let peakTopW = 0.025;
    let edgeOffset = 0.010;

    if (is7v) {
      numPeaks = 7;
      pitch = 0.198;
      peakHeight = 0.030;
      peakBaseW = 0.065;
      peakTopW = 0.025;
      edgeOffset = 0.010;
    } else if (is6v) {
      numPeaks = 6;
      pitch = 0.198;
      peakHeight = 0.030;
      peakBaseW = 0.065;
      peakTopW = 0.025;
      edgeOffset = 0.010;
    }

    const points: { x: number; y: number }[] = [];
    let currentX = 0;

    if (isStandard) {
      points.push({ x: 0, y: 0 });
      currentX += 0.013;
      points.push({ x: currentX, y: 0 });

      // Standard wave profile
      const stdPitch = 0.076;
      const stdHeight = 0.018;
      const totalSteps = 200;
      for (let s = 1; s <= totalSteps; s++) {
        const xVal = (s / totalSteps) * wSheet;
        const yVal = ((Math.sin((xVal / stdPitch) * Math.PI * 2 - Math.PI / 2) + 1) / 2) * stdHeight;
        points.push({ x: xVal, y: yVal });
      }
    } else {
      const slopeW = (peakBaseW - peakTopW) / 2;
      const shortLegLen = 0.0181; // 18.1mm
      const stdLegLen = 0.0351;  // 35.1mm
      const ratio = shortLegLen / stdLegLen;
      const drawShortW = slopeW * ratio;
      const drawShortH = peakHeight * ratio;
      const stepH = 0.003; // 3mm step height

      // Start at the bottom-left of the short leg
      points.push({ x: 0, y: peakHeight - stepH - drawShortH });
      
      // Slant up to top-left of first peak but 3mm below topY
      currentX = drawShortW;
      points.push({ x: currentX, y: peakHeight - stepH });

      // Vertical step UP of 3mm to peakHeight
      points.push({ x: currentX, y: peakHeight });

      for (let k = 0; k < numPeaks; k++) {
        if (k === 0) {
          // Top flat
          currentX += peakTopW;
          points.push({ x: currentX, y: peakHeight });

          // Right slant down
          currentX += slopeW;
          points.push({ x: currentX, y: 0 });
        } else {
          // Left slant up
          currentX += slopeW;
          points.push({ x: currentX, y: peakHeight });

          // Top flat
          currentX += peakTopW;
          points.push({ x: currentX, y: peakHeight });

          // Right slant down
          currentX += slopeW;
          points.push({ x: currentX, y: 0 });
        }

        if (k < numPeaks - 1) {
          // Minor ribs in the pan: 26mm flat, 28mm rib, 25mm flat, 28mm rib, 26mm flat
          // Rib height is 3.5mm in the 3D visualizer to ensure clear visibility
          // Rib rises over 4mm, flat for 20mm, drops over 4mm
          const ribH3D = 0.0035;
          
          // First section of pan: length 26mm
          currentX += 0.026;
          points.push({ x: currentX, y: 0 });
          
          // Minor rib 1: 4mm rise, 20mm flat, 4mm drop
          currentX += 0.004;
          points.push({ x: currentX, y: ribH3D });
          currentX += 0.020;
          points.push({ x: currentX, y: ribH3D });
          currentX += 0.004;
          points.push({ x: currentX, y: 0 });
          
          // Middle flat section: length 25mm
          currentX += 0.025;
          points.push({ x: currentX, y: 0 });
          
          // Minor rib 2: 4mm rise, 20mm flat, 4mm drop
          currentX += 0.004;
          points.push({ x: currentX, y: ribH3D });
          currentX += 0.020;
          points.push({ x: currentX, y: ribH3D });
          currentX += 0.004;
          points.push({ x: currentX, y: 0 });
          
          // Last section of pan: length 26mm
          currentX += 0.026;
          points.push({ x: currentX, y: 0 });
        }
      }

      currentX += edgeOffset;
      points.push({ x: currentX, y: 0 });
    }

    let adjustedWSheet = wSheet;
    if (isLast) {
      const idx = points.findIndex(p => p.x > wSheet);
      if (idx !== -1) {
        const cutY = points[idx - 1]
          ? points[idx - 1].y + (wSheet - points[idx - 1].x) / (points[idx].x - points[idx - 1].x) * (points[idx].y - points[idx - 1].y)
          : points[idx].y;
        if (cutY > 0.001) {
          for (let k = idx; k < points.length; k++) {
            if (points[k].y <= 0.001) {
              adjustedWSheet = points[k].x;
              break;
            }
          }
          if (adjustedWSheet === wSheet && points.length > 0) {
            adjustedWSheet = points[points.length - 1].x;
          }
        }
      }
    }

    const clippedPoints: { x: number; y: number }[] = [];
    for (let k = 0; k < points.length; k++) {
      const p = points[k];
      if (p.x <= adjustedWSheet) {
        clippedPoints.push(p);
      } else {
        const prev = points[k - 1];
        if (prev && prev.x < adjustedWSheet) {
          const ratio = (adjustedWSheet - prev.x) / (p.x - prev.x);
          const intersectedY = prev.y + ratio * (p.y - prev.y);
          clippedPoints.push({ x: adjustedWSheet, y: intersectedY });
        }
        break;
      }
    }

    if (clippedPoints.length > 0 && clippedPoints[clippedPoints.length - 1].x < adjustedWSheet) {
      const last = clippedPoints[clippedPoints.length - 1];
      clippedPoints.push({ x: adjustedWSheet, y: last.y });
    }

    return clippedPoints;
  };

  const createTrapezoidalShape = (wSheet: number, profileType: string, isLast?: boolean) => {
    const pts = getProfilePoints(wSheet, profileType, isLast);
    const shape = new THREE.Shape();
    if (pts.length === 0) return shape;

    shape.moveTo(pts[0].x, pts[0].y);
    for (let k = 1; k < pts.length; k++) {
      shape.lineTo(pts[k].x, pts[k].y);
    }

    const thickness = 0.002;
    for (let k = pts.length - 1; k >= 0; k--) {
      shape.lineTo(pts[k].x, pts[k].y - thickness);
    }

    shape.closePath();
    return shape;
  };

  const getProfilePointsOffset = (wSheet: number, profileType: string, xOffset: number, isLast?: boolean) => {
    const is7v = profileType === '7v Profile';
    const is6v = profileType === '6v Profile';
    const pitch = (is7v || is6v) ? 0.198 : 0.076;
    
    let phase = xOffset % pitch;
    if (phase < 0) phase += pitch;

    const widerWidth = wSheet + phase + 0.2;
    const pts = getProfilePoints(widerWidth, profileType, false);

    const rawShifted = pts.map(p => ({ x: p.x - phase, y: p.y }));

    let adjustedWSheet = wSheet;
    if (isLast) {
      const idx = rawShifted.findIndex(p => p.x > wSheet);
      if (idx !== -1) {
        const cutY = rawShifted[idx - 1]
          ? rawShifted[idx - 1].y + (wSheet - rawShifted[idx - 1].x) / (rawShifted[idx].x - rawShifted[idx - 1].x) * (rawShifted[idx].y - rawShifted[idx - 1].y)
          : rawShifted[idx].y;
        if (cutY > 0.001) {
          for (let k = idx; k < rawShifted.length; k++) {
            if (rawShifted[k].y <= 0.001) {
              adjustedWSheet = rawShifted[k].x;
              break;
            }
          }
          if (adjustedWSheet === wSheet && rawShifted.length > 0) {
            adjustedWSheet = rawShifted[rawShifted.length - 1].x;
          }
        }
      }
    }

    const finalPts: { x: number; y: number }[] = [];

    for (let k = 0; k < rawShifted.length; k++) {
      const p = rawShifted[k];
      const prev = k > 0 ? rawShifted[k - 1] : null;

      if (p.x >= 0 && p.x <= adjustedWSheet) {
        if (prev && prev.x < 0) {
          const ratio = (0 - prev.x) / (p.x - prev.x);
          const yAt0 = prev.y + ratio * (p.y - prev.y);
          finalPts.push({ x: 0, y: yAt0 });
        }
        finalPts.push(p);
      } else if (p.x > adjustedWSheet) {
        if (prev && prev.x <= adjustedWSheet) {
          const ratio = (adjustedWSheet - prev.x) / (p.x - prev.x);
          const yAtW = prev.y + ratio * (p.y - prev.y);
          finalPts.push({ x: adjustedWSheet, y: yAtW });
        }
        break;
      }
    }

    if (finalPts.length === 0) {
      finalPts.push({ x: 0, y: 0 });
      finalPts.push({ x: adjustedWSheet, y: 0 });
    }

    return finalPts;
  };

  const createTrapezoidalShapeOffset = (wSheet: number, profileType: string, xOffset: number, invertY?: boolean, isLast?: boolean) => {
    const pts = getProfilePointsOffset(wSheet, profileType, xOffset, isLast);
    const shape = new THREE.Shape();
    if (pts.length === 0) return shape;

    const sign = invertY ? -1 : 1;

    shape.moveTo(pts[0].x, pts[0].y * sign);
    for (let k = 1; k < pts.length; k++) {
      shape.lineTo(pts[k].x, pts[k].y * sign);
    }

    const thickness = 0.002;
    for (let k = pts.length - 1; k >= 0; k--) {
      shape.lineTo(pts[k].x, (pts[k].y - thickness) * sign);
    }

    shape.closePath();
    return shape;
  };

  const render3DWallSheet = (
    key: string,
    wSheet: number,
    yMin: number,
    yMax: number,
    cStartX: number,
    cEndX: number,
    gH: number,
    xOffset: number,
    profileType: string,
    color: string,
    panelKey: string,
    getSlopeY?: (localX: number) => number,
    invertY?: boolean,
    isLast?: boolean
  ) => {
    const subPanels: { xStart: number; xEnd: number; yStart: number; yEnd: number }[] = [];

    if (cStartX < 0 || cEndX <= cStartX || yMin >= gH) {
      subPanels.push({ xStart: 0, xEnd: wSheet, yStart: yMin, yEnd: yMax });
    } else {
      const cutoffY = Math.min(yMax, gH);

      if (cStartX > 0) {
        subPanels.push({ xStart: 0, xEnd: cStartX, yStart: yMin, yEnd: yMax });
      }

      if (yMax > cutoffY && cEndX > cStartX) {
        subPanels.push({ xStart: cStartX, xEnd: cEndX, yStart: cutoffY, yEnd: yMax });
      }

      if (cEndX < wSheet) {
        subPanels.push({ xStart: cEndX, xEnd: wSheet, yStart: yMin, yEnd: yMax });
      }
    }

    return (
      <group key={key}>
        {subPanels.map((sub, idx) => {
          const wSub = sub.xEnd - sub.xStart;
          if (wSub <= 0.001) return null;

          let subYEnd = sub.yEnd;
          if (getSlopeY) {
            const roofL = getSlopeY(sub.xStart);
            const roofR = getSlopeY(sub.xEnd);
            const roofMax = Math.max(roofL, roofR);
            subYEnd = Math.min(sub.yEnd, roofMax);
          }

          const hSub = subYEnd - sub.yStart;
          if (hSub <= 0.001) return null;

          const subXOffset = xOffset + sub.xStart;
          const shape = createTrapezoidalShapeOffset(wSub, profileType, subXOffset, invertY, isLast);

          return (
            <mesh
              key={idx}
              receiveShadow
              castShadow
              position={[sub.xStart, sub.yStart, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              onClick={(e) => handlePanelClick(e, panelKey, color, 'wall')}
            >
              <extrudeGeometry args={[
                shape,
                { depth: hSub, bevelEnabled: false }
              ]} />
              <meshStandardMaterial
                color={getPanelColor(panelKey, color, 'wall', specs, panelColors)}
                metalness={0.6}
                roughness={0.3}
                envMapIntensity={1.2}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
      </group>
    );
  };

  const renderRoofPanelArea = (keyPrefix: string, cx: number, cy: number, length: number, angle: number) => {
    const roofEffWidth = specs.roofProfile === '6v Profile' ? 0.99 : (specs.roofProfile === '7v Profile' ? 1.188 : 1.0);
    const numSheets = Math.ceil(l / roofEffWidth - 0.001);
    const roofSegments = Math.ceil(length / 6);
    const segLength = length / roofSegments;
    const overlapGap = 0.0; // A small visual gap to illustrate the division

    return Array.from({ length: numSheets }).map((_, i) => {
      const isLast = i === numSheets - 1;
      let wSheet = roofEffWidth;
      let zCenter = i * roofEffWidth + wSheet / 2;

      if (isLast && numSheets > 1) {
        const pitch = (specs.roofProfile === '6v Profile' || specs.roofProfile === '7v Profile') ? 0.198 : 0.076;
        let m = 1;
        let z_last = (numSheets - 1) * roofEffWidth - m * pitch;
        while (z_last > l - roofEffWidth + 0.001) {
          m++;
          z_last = (numSheets - 1) * roofEffWidth - m * pitch;
        }
        m = Math.max(1, m - 1);
        z_last = (numSheets - 1) * roofEffWidth - m * pitch;
        wSheet = l - z_last;
        zCenter = z_last + wSheet / 2;
      } else if (isLast) {
        wSheet = l;
        zCenter = wSheet / 2;
      }

      const key = `${keyPrefix}_sheet_${i}`;
      
      const isSkylightCol = specs.hasPolySheets !== false && (i % 6 === 3);

      return (
        <group key={key} position={[cx, cy, zCenter]} rotation={[0, 0, angle]}>
          {Array.from({ length: roofSegments }).map((_, j) => {
            const locX = -length / 2 + (segLength / 2) + j * segLength;
            const segKey = `${key}_seg_${j}`;
            const isSkylight = isSkylightCol && (roofSegments >= 3 ? j === Math.floor(roofSegments / 2) : true);
            return (
              <group key={j}>
                <mesh receiveShadow 
                  position={[locX - (segLength - overlapGap) / 2, 0, (wSheet - overlapGap) / 2]} 
                  rotation={[0, Math.PI / 2, 0]}
                  onClick={(e) => handlePanelClick(e, segKey, isSkylight ? 'transparent' : (specs.roofColor || '#0089b6'), 'roof')}
                >
                  <extrudeGeometry args={[
                    createTrapezoidalShape(wSheet - overlapGap, specs.roofProfile || '7v Profile', isLast),
                    { depth: segLength - overlapGap, bevelEnabled: false }
                  ]} />
                  {isSkylight ? (
                    <meshStandardMaterial color="#e0f2fe" roughness={0.1} metalness={0.1} transparent opacity={0.6} depthWrite={false} side={THREE.DoubleSide} />
                  ) : (
                    <meshStandardMaterial 
                      color={getPanelColor(segKey, specs.roofColor || '#0089b6', 'roof', specs, panelColors)} 
                      metalness={0.6} 
                      roughness={0.3} 
                      envMapIntensity={1.2} 
                      side={THREE.DoubleSide}
                    />
                  )}
                </mesh>
                {/* Real-time Insulation layer beneath Roof Panel */}
                {specs.hasInsulation !== false && !isSkylight && (
                  <mesh position={[locX, -0.012, 0]}>
                    <boxGeometry args={[segLength - overlapGap, 0.002, wSheet - overlapGap]} />
                    <meshStandardMaterial color="#b0bec5" roughness={0.3} metalness={0.8} />
                  </mesh>
                )}
                {/* Real-time Snow Accumulation layer on Roof Panel */}
                {weatherType === 'snow' && !isSkylight && (() => {
                  const is7v = specs.roofProfile === '7v Profile';
                  const is6v = specs.roofProfile === '6v Profile';
                  const peakHeight = is7v ? 0.029 : (is6v ? 0.035 : 0.018);
                  return (
                    <mesh position={[locX, peakHeight + 0.01, 0]}>
                      <boxGeometry args={[segLength - overlapGap + 0.01, 0.02, wSheet - overlapGap + 0.01]} />
                      <meshStandardMaterial color="#ffffff" roughness={0.9} metalness={0.0} />
                    </mesh>
                  );
                })()}
              </group>
            );
          })}
        </group>
      );
    });
  };

  // Unified Gutter coordinate calculations across all roof types
  let gutterL_X = -w / 2 - 0.3;
  let gutterR_X = w / 2 + 0.3;
  let gutterY = h + 0.35;

  if (specs.roofType === 'Curved') {
    const basePurlinTopOffset = modelPurlinYOffset + 0.075;
    gutterL_X = -w / 2 - 0.5 - 0.05;
    gutterR_X = w / 2 + 0.5 + 0.05;
    gutterY = h + basePurlinTopOffset - 0.1 - 0.15;
  } else if (specs.roofType === 'Single Slope') {
    const totRoofH = w * (specs.roofSlope / 100);
    const angle = Math.atan(totRoofH / w);
    const panelYOffset = modelPurlinYOffset + 0.075;
    const X_eave = -w / 2 - 0.5 * Math.cos(angle) - 0.1 * Math.sin(angle);
    const Y_eave = h + panelYOffset - 0.5 * Math.sin(angle);
    gutterL_X = X_eave - 0.05;
    gutterR_X = w / 2 + 0.3; // Unused for Single Slope
    gutterY = Y_eave - 0.15;
  } else if (specs.roofType === 'Multi-Sloped Hut') {
    const h_steep = (w / 4) * (specs.roofSlope * 1.5 / 100);
    const a_steep = Math.atan(h_steep / (w / 4));
    const offsetSteep = modelPurlinYOffset + 0.075;
    const X_eave = -w / 2 - 0.5 * Math.cos(a_steep);
    const Y_eave = h + offsetSteep - 0.5 * Math.sin(a_steep);
    gutterL_X = X_eave - 0.05;
    gutterR_X = w / 2 + 0.5 * Math.cos(a_steep) + 0.05;
    gutterY = Y_eave - 0.15;
  } else {
    const roofH = (w / 2) * (specs.roofSlope / 100);
    const angle = Math.atan(roofH / (w / 2));
    const panelYOffset = modelPurlinYOffset + 0.075;
    const X_eave = -w / 2 - 0.5 * Math.cos(angle);
    const Y_eave = h + panelYOffset - 0.5 * Math.sin(angle);
    gutterL_X = X_eave - 0.05;
    gutterR_X = w / 2 + 0.5 * Math.cos(angle) + 0.05;
    gutterY = Y_eave - 0.15;
  }

  const roofPanels = [];
  if (specs.roofType === 'Single Slope') {
    const totRoofH = w * (specs.roofSlope / 100);
    const angle = Math.atan(totRoofH / w);
    const base_rl = Math.sqrt(w * w + totRoofH * totRoofH);
    const rl = base_rl + 0.5; // low eave overhang only
    const panelYOffset = modelPurlinYOffset + 0.075;
    
    const cx = -0.25 * Math.cos(angle) - panelYOffset * Math.sin(angle);
    const cy = h + totRoofH / 2 - 0.25 * Math.sin(angle) + panelYOffset * Math.cos(angle);
    roofPanels.push(...renderRoofPanelArea('single', cx, cy, rl, angle));
  } else if (specs.roofType === 'Multi-Sloped Hut') {
    const h_steep = (w / 4) * (specs.roofSlope * 1.5 / 100);
    const h_shallow = (w / 4) * (specs.roofSlope * 0.5 / 100);
    
    const rl_steep = Math.sqrt(Math.pow(w / 4, 2) + Math.pow(h_steep, 2));
    const rl_shallow = Math.sqrt(Math.pow(w / 4, 2) + Math.pow(h_shallow, 2));

    const a_steep = Math.atan(h_steep / (w / 4));
    const a_shallow = Math.atan(h_shallow / (w / 4));

    const offsetSteep = modelPurlinYOffset + 0.075;
    const offsetShallow = modelPurlinYOffset + 0.075;

    const cx1 = -w * 0.375 - 0.25 * Math.cos(a_steep) - offsetSteep * Math.sin(a_steep);
    const cy1 = h + h_steep / 2 - 0.25 * Math.sin(a_steep) + offsetSteep * Math.cos(a_steep);
    
    const cx2 = -w * 0.125 - offsetShallow * Math.sin(a_shallow);
    const cy2 = h + h_steep + h_shallow / 2 + offsetShallow * Math.cos(a_shallow);
    
    const cx3 = w * 0.125 + offsetShallow * Math.sin(a_shallow);
    const cy3 = h + h_steep + h_shallow / 2 + offsetShallow * Math.cos(a_shallow);
    
    const cx4 = w * 0.375 + 0.25 * Math.cos(a_steep) + offsetSteep * Math.sin(a_steep);
    const cy4 = h + h_steep / 2 - 0.25 * Math.sin(a_steep) + offsetSteep * Math.cos(a_steep);

    roofPanels.push(...renderRoofPanelArea('m1', cx1, cy1, rl_steep + 0.5, a_steep));
    roofPanels.push(...renderRoofPanelArea('m2', cx2, cy2, rl_shallow, a_shallow));
    roofPanels.push(...renderRoofPanelArea('m3', cx3, cy3, rl_shallow, -a_shallow));
    roofPanels.push(...renderRoofPanelArea('m4', cx4, cy4, rl_steep + 0.5, -a_steep));
  } else if (specs.roofType === 'Curved') {
    const roofH = (w / 2) * (specs.roofSlope / 100) * 1.5;
    
    const roofEffWidth = specs.roofProfile === '6v Profile' ? 0.99 : (specs.roofProfile === '7v Profile' ? 1.188 : 1.0);
    const numSheets = Math.ceil(l / roofEffWidth - 0.001);

    const roofSlopeFactor = Math.sqrt(1 + Math.pow(specs.roofSlope / 100, 2));
    const sheetLengthRoof = (specs.width / 2) * roofSlopeFactor; 
    const roofSegments = Math.ceil(sheetLengthRoof / 6);
    const totalSegs = roofSegments * 2; 

    const basePurlinTopOffset = modelPurlinYOffset + 0.075;

    const arcLeftSlope = (4 * roofH) / w;
    const curveEaveAngle = Math.atan(arcLeftSlope);
    const cosA = Math.cos(curveEaveAngle);
    const sinA = Math.sin(curveEaveAngle);

    const I0 = {x: -w / 2 - 0.5 - basePurlinTopOffset * sinA, y: h + basePurlinTopOffset * cosA};
    const I1 = {x: 0, y: h + roofH * 2 + basePurlinTopOffset};
    const I2 = {x: w / 2 + 0.5 + basePurlinTopOffset * sinA, y: h + basePurlinTopOffset * cosA};

    const O0 = {x: I0.x - 0.002 * sinA, y: I0.y + 0.002 * cosA};
    const O1 = {x: I1.x, y: I1.y + 0.002};
    const O2 = {x: I2.x + 0.002 * sinA, y: I2.y + 0.002 * cosA};

    const getQuadPoint = (p0: any, p1: any, p2: any, t: number) => {
      const invT = 1 - t;
      return {
        x: invT * invT * p0.x + 2 * invT * t * p1.x + t * t * p2.x,
        y: invT * invT * p0.y + 2 * invT * t * p1.y + t * t * p2.y
      };
    };
    
    const getQuadControlPoint = (p0: any, p1: any, p2: any, t0: number, t1: number) => {
      const c0 = (1 - t0) * (1 - t1);
      const c1 = (1 - t0) * t1 + t0 * (1 - t1);
      const c2 = t0 * t1;
      return {
        x: c0 * p0.x + c1 * p1.x + c2 * p2.x,
        y: c0 * p0.y + c1 * p1.y + c2 * p2.y
      };
    };

    const curvedSheets = Array.from({ length: numSheets }).map((_, i) => {
      const isLast = i === numSheets - 1;
      let wSheet = roofEffWidth;
      let zStart = i * roofEffWidth;

      if (isLast && numSheets > 1) {
        const pitch = (specs.roofProfile === '6v Profile' || specs.roofProfile === '7v Profile') ? 0.198 : 0.076;
        let m = 1;
        let z_last = (numSheets - 1) * roofEffWidth - m * pitch;
        while (z_last > l - roofEffWidth + 0.001) {
          m++;
          z_last = (numSheets - 1) * roofEffWidth - m * pitch;
        }
        m = Math.max(1, m - 1);
        z_last = (numSheets - 1) * roofEffWidth - m * pitch;
        wSheet = l - z_last;
        zStart = z_last;
      } else if (isLast) {
        wSheet = l;
        zStart = 0;
      }

      const isSkylight = specs.hasPolySheets !== false && (i % 6 === 3);
      const overlapGap = 0.0;

      return (
        <group key={`curved_col_${i}`} position={[0, 0, zStart]}>
          {Array.from({ length: totalSegs }).map((_, j) => {
            const key = `curved_sheet_${i}_seg_${j}`;
            const t0 = j / totalSegs;
            const t1 = (j + 1) / totalSegs;
             
            const is = getQuadPoint(I0, I1, I2, t0);
            const ic = getQuadControlPoint(I0, I1, I2, t0, t1);
            const ie = getQuadPoint(I0, I1, I2, t1);

            const os = getQuadPoint(O0, O1, O2, t0);
            const oc = getQuadControlPoint(O0, O1, O2, t0, t1);
            const oe = getQuadPoint(O0, O1, O2, t1);

            const curveShape = new THREE.Shape();
            curveShape.moveTo(is.x, is.y);
            curveShape.quadraticCurveTo(ic.x, ic.y, ie.x, ie.y);
            curveShape.lineTo(oe.x, oe.y);
            curveShape.quadraticCurveTo(oc.x, oc.y, os.x, os.y);
            curveShape.closePath();

            return (
              <group key={key}>
                <mesh receiveShadow 
                  onClick={(e) => handlePanelClick(e, key, isSkylight ? 'transparent' : (specs.roofColor || '#0089b6'), 'roof')}
                >
                  <extrudeGeometry args={[curveShape, { depth: Math.max(0.01, wSheet - overlapGap), bevelEnabled: false }]} />
                  {isSkylight ? (
                    <meshStandardMaterial color="#e0f2fe" roughness={0.1} metalness={0.1} transparent opacity={0.6} depthWrite={false} side={THREE.DoubleSide} />
                  ) : (
                    <meshStandardMaterial color={getPanelColor(key, specs.roofColor || '#0089b6', 'roof', specs, panelColors)} metalness={0.6} roughness={0.3} bumpMap={getRoofTexture(wSheet, zStart)} envMapIntensity={1.2} bumpScale={0.025} side={THREE.DoubleSide} />
                  )}
                </mesh>
              </group>
            );
          })}
        </group>
      );
    });
    roofPanels.push(...curvedSheets);

  } else {
    const roofH = (w / 2) * (specs.roofSlope / 100);
    const angle = Math.atan(roofH / (w / 2));
    const base_rl = Math.sqrt((w / 2) * (w / 2) + roofH * roofH);
    const rl = base_rl + 0.5;
    const panelYOffset = modelPurlinYOffset + 0.075;
    
    // Shift perpendicularly by panelYOffset and tangentially by 0.25 to account for eave overhang!
    const cx1 = -w / 4 - 0.25 * Math.cos(angle) - panelYOffset * Math.sin(angle);
    const cy1 = h + roofH / 2 - 0.25 * Math.sin(angle) + panelYOffset * Math.cos(angle);
    
    const cx2 = w / 4 + 0.25 * Math.cos(angle) + panelYOffset * Math.sin(angle);
    const cy2 = h + roofH / 2 - 0.25 * Math.sin(angle) + panelYOffset * Math.cos(angle);
    
    roofPanels.push(...renderRoofPanelArea('d1', cx1, cy1, rl, angle));
    roofPanels.push(...renderRoofPanelArea('d2', cx2, cy2, rl, -angle));
  }

  const ancillaryElements = [];
  
  if (specs.hasRoof !== false && specs.hasGutters !== false) {
    const renderGutter = (keyStr: string, x: number, y: number, zLen: number) => {
      const gColor = specs.gutterColor || '#383e42';
      return (
        <group key={keyStr} position={[x, y, zLen / 2]}>
           <mesh receiveShadow position={[0, -0.15, 0]}>
              <boxGeometry args={[0.3, 0.05, zLen]} />
              <meshStandardMaterial color={gColor} roughness={0.7} />
           </mesh>
           <mesh receiveShadow position={[-0.125, 0, 0]}>
              <boxGeometry args={[0.05, 0.3, zLen]} />
              <meshStandardMaterial color={gColor} roughness={0.7} />
           </mesh>
           <mesh receiveShadow position={[0.125, 0, 0]}>
              <boxGeometry args={[0.05, 0.3, zLen]} />
              <meshStandardMaterial color={gColor} roughness={0.7} />
           </mesh>
        </group>
      );
    };

    // Left Gutter
    ancillaryElements.push(renderGutter("gutter_L", gutterL_X, gutterY, l));

    // Right Gutter
    if (specs.roofType !== 'Single Slope') {
      ancillaryElements.push(renderGutter("gutter_R", gutterR_X, gutterY, l));
    }
  }

  if (specs.hasRoof !== false && specs.hasRidgeCap !== false) {
    const rCapColor = specs.ridgeCapColor || '#383e42';
    const isStandard = specs.roofProfile === 'Standard';
    const peakHeight = isStandard ? 0.018 : 0.030;
    const renderInvertedVRidge = (keyStr: string, x: number, y: number, zLen: number, angle: number, offset: number) => (
      <group key={keyStr} position={[x, y + offset + peakHeight, l / 2]}>
        <mesh position={[-0.2, -0.01, 0]} rotation={[0, 0, angle]}>
           <boxGeometry args={[0.5, 0.01, zLen]} />
           <meshStandardMaterial color={rCapColor} roughness={0.7} />
        </mesh>
        <mesh position={[0.2, -0.01, 0]} rotation={[0, 0, -angle]}>
           <boxGeometry args={[0.5, 0.01, zLen]} />
           <meshStandardMaterial color={rCapColor} roughness={0.7} />
        </mesh>
      </group>
    );

    if (specs.roofType === 'Multi-Sloped Hut') {
      const h_steep = (w / 4) * (specs.roofSlope * 1.5 / 100);
      const h_shallow = (w / 4) * (specs.roofSlope * 0.5 / 100);
      const a_shallow = Math.atan(h_shallow / (w / 4));
      const offsetSteep = modelPurlinYOffset + 0.075;
      const offsetShallow = modelPurlinYOffset + 0.075;
      
      ancillaryElements.push(renderInvertedVRidge("ridge_cap_1", 0, h + h_steep + h_shallow, l + 0.1, a_shallow, offsetShallow));
      ancillaryElements.push(renderInvertedVRidge("ridge_cap_2", -w / 4, h + h_steep, l + 0.1, a_shallow, offsetSteep));
      ancillaryElements.push(renderInvertedVRidge("ridge_cap_3", w / 4, h + h_steep, l + 0.1, -a_shallow, offsetSteep));
    } else if (specs.roofType === 'Curved') {
      const roofH = (w / 2) * (specs.roofSlope / 100) * 1.5;
      const basePurlinTopOffset = modelPurlinYOffset + 0.075;
      ancillaryElements.push(renderInvertedVRidge("ridge_cap", 0, h + roofH, l + 0.1, 0.1, basePurlinTopOffset));
    } else {
      const roofH = (w / 2) * (specs.roofSlope / 100);
      const angle = Math.atan(roofH / (w / 2));
      const panelYOffset = modelPurlinYOffset + 0.075;
      ancillaryElements.push(renderInvertedVRidge("ridge_cap", 0, h + roofH, l + 0.1, angle, panelYOffset));
    }
  }

  if (specs.hasRoof !== false && specs.hasGables !== false) {
    const gw = 0.305;
    const gt = 0.02;
    
    const renderGable = (key: string, zPos: number, cx: number, cy: number, length: number, angle: number, isFront: boolean) => {
      const hzCenter = isFront ? (gw - gt)/2 : (gt - gw)/2;
      const hzSize = gw + gt;
      const vyCenter = 0.1 + (gt - gw)/2;
      const vzCenter = isFront ? -gt/2 : gt/2;
      const vSize = gw + gt;

      return (
        <group key={key} position={[cx, cy, zPos]} rotation={[0, 0, angle]}>
          <mesh receiveShadow position={[0, 0.1 + gt/2, hzCenter]}>
            <boxGeometry args={[length, gt, hzSize]} />
            <meshStandardMaterial color={specs.gableColor || '#383e42'} roughness={0.7} />
          </mesh>
          <mesh receiveShadow position={[0, vyCenter, vzCenter]}>
            <boxGeometry args={[length, vSize, gt]} />
            <meshStandardMaterial color={specs.gableColor || '#383e42'} roughness={0.7} />
          </mesh>
        </group>
      );
    };

    const renderLengthGable = (key: string, cx: number, cy: number, length: number, rotZ: number, isRight: boolean) => {
      const hzCenter = isRight ? (gt - gw)/2 : (gw - gt)/2;
      const hzSize = gw + gt;
      const vyCenter = 0.1 + (gt - gw)/2;
      const vxCenter = isRight ? gt/2 : -gt/2;
      const vSize = gw + gt;

      return (
        <group key={key} position={[cx, cy, l/2]} rotation={[0, 0, rotZ]}>
          <mesh receiveShadow position={[hzCenter, 0.1 + gt/2, 0]}>
            <boxGeometry args={[hzSize, gt, length]} />
            <meshStandardMaterial color={specs.gableColor || '#383e42'} roughness={0.7} />
          </mesh>
          <mesh receiveShadow position={[vxCenter, vyCenter, 0]}>
            <boxGeometry args={[gt, vSize, length]} />
            <meshStandardMaterial color={specs.gableColor || '#383e42'} roughness={0.7} />
          </mesh>
        </group>
      );
    };

    if (specs.roofType === 'Single Slope') {
      const totRoofH = w * (specs.roofSlope / 100);
      const angle = Math.atan(totRoofH / w);
      const base_rl = Math.sqrt(w * w + totRoofH * totRoofH);
      const rl = base_rl + 0.5; // low eave overhang only
      const cx = -0.25 * Math.cos(angle) - 0.1 * Math.sin(angle);
      const cy = (h + totRoofH / 2 + 0.6) - 0.25 * Math.sin(angle);
      ancillaryElements.push(renderGable('gable_front_single', 0, cx, cy, rl, angle, true));
      ancillaryElements.push(renderGable('gable_back_single', l, cx, cy, rl, angle, false));
      ancillaryElements.push(renderLengthGable('gable_high_single', w / 2, h + totRoofH + 0.6, l, 0, true));
    } else if (specs.roofType === 'Multi-Sloped Hut') {
      const h_steep = (w / 4) * (specs.roofSlope * 1.5 / 100);
      const h_shallow = (w / 4) * (specs.roofSlope * 0.5 / 100);
      
      const rl_steep = Math.sqrt((w / 4) * (w / 4) + h_steep * h_steep);
      const rl_shallow = Math.sqrt((w / 4) * (w / 4) + h_shallow * h_shallow);
      
      const a_steep = Math.atan(h_steep / (w / 4));
      const a_shallow = Math.atan(h_shallow / (w / 4));

      const cx1 = -w * 0.375 - 0.25 * Math.cos(a_steep);
      const cy1 = h + h_steep / 2 + 0.6 - 0.25 * Math.sin(a_steep);
      const cx4 = w * 0.375 + 0.25 * Math.cos(a_steep);
      const cy4 = h + h_steep / 2 + 0.6 - 0.25 * Math.sin(a_steep);

      ancillaryElements.push(renderGable('gable_front_m1', 0, cx1, cy1, rl_steep + 0.5, a_steep, true));
      ancillaryElements.push(renderGable('gable_back_m1', l, cx1, cy1, rl_steep + 0.5, a_steep, false));
      
      ancillaryElements.push(renderGable('gable_front_m2', 0, -w * 0.125, h + h_steep + h_shallow / 2 + 0.6, rl_shallow, a_shallow, true));
      ancillaryElements.push(renderGable('gable_back_m2', l, -w * 0.125, h + h_steep + h_shallow / 2 + 0.6, rl_shallow, a_shallow, false));

      ancillaryElements.push(renderGable('gable_front_m3', 0, w * 0.125, h + h_steep + h_shallow / 2 + 0.6, rl_shallow, -a_shallow, true));
      ancillaryElements.push(renderGable('gable_back_m3', l, w * 0.125, h + h_steep + h_shallow / 2 + 0.6, rl_shallow, -a_shallow, false));

      ancillaryElements.push(renderGable('gable_front_m4', 0, cx4, cy4, rl_steep + 0.5, -a_steep, true));
      ancillaryElements.push(renderGable('gable_back_m4', l, cx4, cy4, rl_steep + 0.5, -a_steep, false));
    } else if (specs.roofType === 'Curved') {
      const roofH = (w / 2) * (specs.roofSlope / 100) * 1.5;
      const curveShape = new THREE.Shape();
      curveShape.moveTo(-w / 2 - 0.5, h + 0.3);
      curveShape.quadraticCurveTo(0, h + roofH * 2 + 0.5, w / 2 + 0.5, h + 0.3);
      curveShape.lineTo(w / 2 + 0.5, h + 0.5);
      curveShape.quadraticCurveTo(0, h + roofH * 2 + 0.7, -w / 2 - 0.5, h + 0.5);
      curveShape.closePath();
      
      ancillaryElements.push(
        <mesh receiveShadow key="gable_front_curved" position={[0, 0, -gt]}>
          <extrudeGeometry args={[curveShape, { depth: gt, bevelEnabled: false }]} />
          <meshStandardMaterial color={specs.gableColor || '#383e42'} roughness={0.7} />
        </mesh>
      );
      ancillaryElements.push(
        <mesh receiveShadow key="gable_back_curved" position={[0, 0, l]}>
          <extrudeGeometry args={[curveShape, { depth: gt, bevelEnabled: false }]} />
          <meshStandardMaterial color={specs.gableColor || '#383e42'} roughness={0.7} />
        </mesh>
      );
    } else {
      const roofH = (w / 2) * (specs.roofSlope / 100);
      const angle = Math.atan(roofH / (w / 2));
      const base_rl = Math.sqrt((w / 2) * (w / 2) + roofH * roofH);
      const rl = base_rl + 0.5;
      const cx1 = -w / 4 - 0.25 * Math.cos(angle);
      const cy1 = h + roofH / 2 + 0.6 - 0.25 * Math.sin(angle);
      const cx2 = w / 4 + 0.25 * Math.cos(angle);

      ancillaryElements.push(renderGable('gable_front_d1', 0, cx1, cy1, rl, angle, true));
      ancillaryElements.push(renderGable('gable_back_d1', l, cx1, cy1, rl, angle, false));
      ancillaryElements.push(renderGable('gable_front_d2', 0, cx2, cy1, rl, -angle, true));
      ancillaryElements.push(renderGable('gable_back_d2', l, cx2, cy1, rl, -angle, false));
    }
    
    if (specs.hasWalls !== false && specs.hasCornerFlashing !== false) {
      const cw = 0.305;
      const ct = 0.02;
      const renderWallCornerTrim = (key: string, xPos: number, zPos: number, cornerHeight: number, rotY: number) => {
        return (
          <group key={key} position={[xPos, cornerHeight / 2, zPos]} rotation={[0, rotY, 0]}>
            <mesh receiveShadow position={[cw / 2, 0, ct / 2]}>
              <boxGeometry args={[cw, cornerHeight, ct]} />
              <meshStandardMaterial color={specs.cornerFlashingColor || '#383e42'} roughness={0.7} />
            </mesh>
            <mesh receiveShadow position={[ct / 2, 0, (cw + ct) / 2]}>
              <boxGeometry args={[ct, cornerHeight, cw - ct]} />
              <meshStandardMaterial color={specs.cornerFlashingColor || '#383e42'} roughness={0.7} />
            </mesh>
          </group>
        );
      };
      
      const hwLeftFront = getRoofY(-w/2);
      const hwRightFront = getRoofY(w/2);
      
      const o = 0.01;
      ancillaryElements.push(renderWallCornerTrim('wall_corner_lf', -w/2 - o - ct, -o - ct, hwLeftFront, 0));
      ancillaryElements.push(renderWallCornerTrim('wall_corner_rf', w/2 + o + ct, -o - ct, hwRightFront, -Math.PI/2));
      ancillaryElements.push(renderWallCornerTrim('wall_corner_lb', -w/2 - o - ct, l + o + ct, hwLeftFront, Math.PI/2));
      ancillaryElements.push(renderWallCornerTrim('wall_corner_rb', w/2 + o + ct, l + o + ct, hwRightFront, Math.PI));
    }
  }

  if (specs.hasRoof !== false && specs.hasDownPipes !== false) {
    const pipePoints = [
      [gutterR_X, gutterY - 0.175, 0.2], // front right
      [gutterR_X, gutterY - 0.175, l - 0.2], // back right
      [gutterL_X, gutterY - 0.175, 0.2], // front left
      [gutterL_X, gutterY - 0.175, l - 0.2], // back left
    ];
    pipePoints.forEach((pos, idx) => {
      let px = pos[0];
      
      // If single slope, only render downpipes on the left (lower) side
      if (specs.roofType === 'Single Slope' && px > 0) return;

      let ph = pos[1]; // Ends exactly at the bottom of the gutter
      let py = ph / 2;
      
      ancillaryElements.push(
        <group key={`downpipe_group_${idx}`}>
          <mesh receiveShadow position={[px, py, pos[2]]}>
            <cylinderGeometry args={[0.08, 0.08, ph, 8]} />
            <meshStandardMaterial color={specs.downPipeColor || '#383e42'} roughness={0.7} />
          </mesh>
          {(weatherType === 'rain' || weatherType === 'storm') && (
            <group>
              {/* Vertical running water stream on downpipe exterior */}
              <mesh position={[px, py, pos[2] + 0.09]}>
                <boxGeometry args={[0.04, ph, 0.01]} />
                <meshStandardMaterial color="#38bdf8" roughness={0.1} transparent opacity={0.6} />
              </mesh>
              {/* Splashing water at the base of the pipe discharge */}
              <mesh position={[px, 0.02, pos[2]]}>
                <cylinderGeometry args={[0.15, 0.22, 0.04, 12]} />
                <meshStandardMaterial color="#7dd3fc" roughness={0.05} transparent opacity={0.8} />
              </mesh>
            </group>
          )}
        </group>
      );
    });
  }



    if (specs.hasEndFlashing !== false && specs.hasWalls !== false) {
    // Render horizontal bottom flashing / trim along the base to support cladding
    const eflColor = specs.endFlashingColor || '#383e42';
    ancillaryElements.push(
      <mesh receiveShadow key="bottom_trim_front" position={[0, 0.05, -0.05]}>
        <boxGeometry args={[w + 0.2, 0.1, 0.15]} />
        <meshStandardMaterial color={eflColor} roughness={0.7} />
      </mesh>
    );
    ancillaryElements.push(
      <mesh receiveShadow key="bottom_trim_back" position={[0, 0.05, l + 0.05]}>
        <boxGeometry args={[w + 0.2, 0.1, 0.15]} />
        <meshStandardMaterial color={eflColor} roughness={0.7} />
      </mesh>
    );
    ancillaryElements.push(
      <mesh receiveShadow key="bottom_trim_left" position={[-w/2 - 0.05, 0.05, l/2]}>
        <boxGeometry args={[0.15, 0.1, l + 0.2]} />
        <meshStandardMaterial color={eflColor} roughness={0.7} />
      </mesh>
    );
    ancillaryElements.push(
      <mesh receiveShadow key="bottom_trim_right" position={[w/2 + 0.05, 0.05, l/2]}>
        <boxGeometry args={[0.15, 0.1, l + 0.2]} />
        <meshStandardMaterial color={eflColor} roughness={0.7} />
      </mesh>
    );
  }

  if (specs.hasRoof !== false && specs.hasTurboVents !== false) {
    const numVents = Math.floor(l / 4);
    if (numVents > 0) {
      const ventSpacing = l / (numVents + 1);
      for (let i = 1; i <= numVents; i++) {
        const vz = ventSpacing * i;

        let vxs = [];
        if (specs.roofType === 'Single Slope') {
            vxs = [0]; // Midpoint of the incline from -w/2 to w/2
        } else if (specs.roofType === 'Multi-Sloped Hut') {
            vxs = [-w / 4, w / 4];
        } else {
            vxs = [0]; // On the central ridge
        }

        vxs.forEach((vx, vidx) => {
            // The roof surface sits slightly higher than getRoofY due to purlins and panels
            const vy = getRoofY(vx) + 0.2;

            ancillaryElements.push(
              <SpinningTurboVent key={`vent_${i}_${vidx}`} position={[vx, vy, vz]} weatherType={weatherType} />
            );
        });
      }
    }
  }

  if (specs.hasLouvers !== false) {
    const pos = specs.louversPosition || 'Left & Right';
    
    // Sides
    if (pos === 'Left' || pos === 'Right' || pos === 'Left & Right' || pos === 'All Sides') {
      const numLouvers = Math.floor(l / 6);
      if (numLouvers > 0) {
        const louverSpacing = l / (numLouvers + 1);
        for (let i = 1; i <= numLouvers; i++) {
          const vz = louverSpacing * i;
          const ly = h * 0.6; 
          
          const renderLouver = (key: string, px: number, py: number, pz: number, rotY: number) => {
            const slats = [];
            for (let s = 0; s < 5; s++) {
              slats.push(
                <mesh receiveShadow key={`s_${s}`} position={[0, s * -0.2 + 0.4, 0]} rotation={[0.4, 0, 0]}>
                  <boxGeometry args={[1.5, 0.2, 0.05]} />
                  <meshStandardMaterial color={specs.wallColor || '#0089b6'} roughness={0.7} />
                </mesh>
              );
            }
            return (
              <group key={key} position={[px, py, pz]} rotation={[0, rotY, 0]}>
                <mesh receiveShadow position={[0, 0, -0.05]}>
                  <boxGeometry args={[1.6, 1.2, 0.1]} />
                  <meshStandardMaterial color="#383e42" roughness={0.7} />
                </mesh>
                {slats}
              </group>
            );
          };
          
          if (pos === 'Left' || pos === 'Left & Right' || pos === 'All Sides') ancillaryElements.push(renderLouver(`louver_L_${i}`, -w / 2 - 0.011, ly, vz, -Math.PI / 2));
          if (pos === 'Right' || pos === 'Left & Right' || pos === 'All Sides') ancillaryElements.push(renderLouver(`louver_R_${i}`, w / 2 + 0.011, ly, vz, Math.PI / 2));
        }
      }
    }

    // Front/Back
    if (pos === 'Front' || pos === 'Back' || pos === 'Front & Back' || pos === 'All Sides') {
      const numLouversFront = Math.floor(w / 6);
      if (numLouversFront > 0) {
        const louverSpacingFront = w / (numLouversFront + 1);
        for (let i = 1; i <= numLouversFront; i++) {
          const vx = -w/2 + louverSpacingFront * i;
          const ly = h * 0.6; 
          
          const renderLouver = (key: string, px: number, py: number, pz: number, rotY: number) => {
            const slats = [];
            for (let s = 0; s < 5; s++) {
              slats.push(
                <mesh receiveShadow key={`s_${s}`} position={[0, s * -0.2 + 0.4, 0]} rotation={[0.4, 0, 0]}>
                  <boxGeometry args={[1.5, 0.2, 0.05]} />
                  <meshStandardMaterial color={specs.wallColor || '#0089b6'} roughness={0.7} />
                </mesh>
              );
            }
            return (
              <group key={key} position={[px, py, pz]} rotation={[0, rotY, 0]}>
                <mesh receiveShadow position={[0, 0, -0.05]}>
                  <boxGeometry args={[1.6, 1.2, 0.1]} />
                  <meshStandardMaterial color="#383e42" roughness={0.7} />
                </mesh>
                {slats}
              </group>
            );
          };
          
          if (pos === 'Front' || pos === 'Front & Back' || pos === 'All Sides') ancillaryElements.push(renderLouver(`louver_F_${i}`, vx, ly, -0.011, Math.PI));
          if (pos === 'Back' || pos === 'Front & Back' || pos === 'All Sides') ancillaryElements.push(renderLouver(`louver_B_${i}`, vx, ly, l + 0.011, 0));
        }
      }
    }
  }

  if (specs.hasProfileGate !== false && specs.hasWalls !== false) {
    const pos = specs.profileGatePosition || 'Front';
    const isFrontOrBack = pos === 'Front' || pos === 'Back';
    const gateW = Math.min(4, (isFrontOrBack ? w : l) * 0.6);
    const gateH = Math.min(3, h * 0.8);
    
    let gatePos: [number, number, number] = [0, gateH / 2, -0.011];
    let gateRot: [number, number, number] = [0, 0, 0];
    
    if (pos === 'Front') {
        gatePos = [0, gateH / 2, -0.011];
        gateRot = [0, 0, 0];
    } else if (pos === 'Back') {
        gatePos = [0, gateH / 2, l + 0.011];
        gateRot = [0, Math.PI, 0];
    } else if (pos === 'Left') {
        gatePos = [-w / 2 - 0.011, gateH / 2, l / 2];
        gateRot = [0, -Math.PI / 2, 0];
    } else if (pos === 'Right') {
        gatePos = [w / 2 + 0.011, gateH / 2, l / 2];
        gateRot = [0, Math.PI / 2, 0];
    }

    ancillaryElements.push(
      <mesh receiveShadow key="profile_gate" position={gatePos} rotation={gateRot}>
        <planeGeometry args={[gateW, gateH]} />
        <meshStandardMaterial color="#2d3748" roughness={0.5} metalness={0.5} side={THREE.DoubleSide} />
      </mesh>
    );
    
    if (specs.hasCrimpedSheets !== false) {
      const awningRadius = 0.3;
      let awningMesh = null;
      if (pos === 'Front') {
        awningMesh = (
          <mesh receiveShadow position={[0, gateH, -0.011]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[awningRadius, awningRadius, gateW + 0.4, 32, 1, false, -Math.PI / 2, Math.PI / 2]} />
            <meshStandardMaterial color={specs.crimpedSheetsColor || specs.roofColor || '#0089b6'} side={THREE.DoubleSide} />
          </mesh>
        );
      } else if (pos === 'Back') {
        awningMesh = (
          <mesh receiveShadow position={[0, gateH, l + 0.011]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[awningRadius, awningRadius, gateW + 0.4, 32, 1, false, Math.PI / 2, Math.PI / 2]} />
            <meshStandardMaterial color={specs.crimpedSheetsColor || specs.roofColor || '#0089b6'} side={THREE.DoubleSide} />
          </mesh>
        );
      } else if (pos === 'Left') {
        awningMesh = (
          <mesh receiveShadow position={[-w / 2 - 0.011, gateH, l / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[awningRadius, awningRadius, gateW + 0.4, 32, 1, false, Math.PI / 2, Math.PI / 2]} />
            <meshStandardMaterial color={specs.crimpedSheetsColor || specs.roofColor || '#0089b6'} side={THREE.DoubleSide} />
          </mesh>
        );
      } else if (pos === 'Right') {
        awningMesh = (
          <mesh receiveShadow position={[w / 2 + 0.011, gateH, l / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[awningRadius, awningRadius, gateW + 0.4, 32, 1, false, 0, Math.PI / 2]} />
            <meshStandardMaterial color={specs.crimpedSheetsColor || specs.roofColor || '#0089b6'} side={THREE.DoubleSide} />
          </mesh>
        );
      }
      
      if (awningMesh) {
        ancillaryElements.push(
          <group key="gate_awning">
            {awningMesh}
          </group>
        );
      }
    }
  }

  if (specs.hasFlanges !== false) {
    // Flanges run around the entire perimeter (length * 2 + width * 2), typically at base or structural edges.
    const flangeThickness = 0.05;
    const flangeHeight = 0.15;
    ancillaryElements.push(
      <group key="flanges" position={[0, flangeHeight / 2, l / 2]}>
        {/* Left Flange */}
        {specs.hasProfileGate !== false && specs.profileGatePosition === 'Left' ? (
          <group>
            <mesh receiveShadow position={[-w / 2 - flangeThickness / 2, 0, -(l + Math.min(4, l * 0.6)) / 4]}>
              <boxGeometry args={[flangeThickness, flangeHeight, (l - Math.min(4, l * 0.6)) / 2]} />
              <meshStandardMaterial color="#475569" roughness={0.8} />
            </mesh>
            <mesh receiveShadow position={[-w / 2 - flangeThickness / 2, 0, (l + Math.min(4, l * 0.6)) / 4]}>
              <boxGeometry args={[flangeThickness, flangeHeight, (l - Math.min(4, l * 0.6)) / 2]} />
              <meshStandardMaterial color="#475569" roughness={0.8} />
            </mesh>
          </group>
        ) : (
          <mesh receiveShadow position={[-w / 2 - flangeThickness / 2, 0, 0]}>
            <boxGeometry args={[flangeThickness, flangeHeight, l]} />
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </mesh>
        )}
        
        {/* Right Flange */}
        {specs.hasProfileGate !== false && specs.profileGatePosition === 'Right' ? (
          <group>
            <mesh receiveShadow position={[w / 2 + flangeThickness / 2, 0, -(l + Math.min(4, l * 0.6)) / 4]}>
              <boxGeometry args={[flangeThickness, flangeHeight, (l - Math.min(4, l * 0.6)) / 2]} />
              <meshStandardMaterial color="#475569" roughness={0.8} />
            </mesh>
            <mesh receiveShadow position={[w / 2 + flangeThickness / 2, 0, (l + Math.min(4, l * 0.6)) / 4]}>
              <boxGeometry args={[flangeThickness, flangeHeight, (l - Math.min(4, l * 0.6)) / 2]} />
              <meshStandardMaterial color="#475569" roughness={0.8} />
            </mesh>
          </group>
        ) : (
          <mesh receiveShadow position={[w / 2 + flangeThickness / 2, 0, 0]}>
            <boxGeometry args={[flangeThickness, flangeHeight, l]} />
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </mesh>
        )}
        
        {/* Front Flange */}
        {specs.hasProfileGate !== false && (!specs.profileGatePosition || specs.profileGatePosition === 'Front') ? (
          <group>
            <mesh receiveShadow position={[-(w + Math.min(4, w * 0.6)) / 4, 0, -l / 2 - flangeThickness / 2]}>
              <boxGeometry args={[(w - Math.min(4, w * 0.6)) / 2, flangeHeight, flangeThickness]} />
              <meshStandardMaterial color="#475569" roughness={0.8} />
            </mesh>
            <mesh receiveShadow position={[(w + Math.min(4, w * 0.6)) / 4, 0, -l / 2 - flangeThickness / 2]}>
              <boxGeometry args={[(w - Math.min(4, w * 0.6)) / 2, flangeHeight, flangeThickness]} />
              <meshStandardMaterial color="#475569" roughness={0.8} />
            </mesh>
          </group>
        ) : (
          <mesh receiveShadow position={[0, 0, -l / 2 - flangeThickness / 2]}>
            <boxGeometry args={[w, flangeHeight, flangeThickness]} />
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </mesh>
        )}
        
        {/* Back Flange */}
        {specs.hasProfileGate !== false && specs.profileGatePosition === 'Back' ? (
          <group>
            <mesh receiveShadow position={[-(w + Math.min(4, w * 0.6)) / 4, 0, l / 2 + flangeThickness / 2]}>
              <boxGeometry args={[(w - Math.min(4, w * 0.6)) / 2, flangeHeight, flangeThickness]} />
              <meshStandardMaterial color="#475569" roughness={0.8} />
            </mesh>
            <mesh receiveShadow position={[(w + Math.min(4, w * 0.6)) / 4, 0, l / 2 + flangeThickness / 2]}>
              <boxGeometry args={[(w - Math.min(4, w * 0.6)) / 2, flangeHeight, flangeThickness]} />
              <meshStandardMaterial color="#475569" roughness={0.8} />
            </mesh>
          </group>
        ) : (
          <mesh receiveShadow position={[0, 0, l / 2 + flangeThickness / 2]}>
            <boxGeometry args={[w, flangeHeight, flangeThickness]} />
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </mesh>
        )}
      </group>
    );
  }

  if (specs.hasWindows !== false && specs.hasWalls !== false) {
    const pos = specs.windowsPosition || 'Left & Right';
    const wy = h * 0.4;
    const ww = 1.2;
    const wh = 0.8;
    const awningRadius = 0.3;

    // Sides
    if (pos === 'Left' || pos === 'Right' || pos === 'Left & Right' || pos === 'All Sides') {
      const numWindows = Math.floor(l / 5);
      if (numWindows > 0) {
        const windowSpacing = l / (numWindows + 1);
        for (let i = 1; i <= numWindows; i++) {
          const vz = windowSpacing * i;
          
          if (pos === 'Left' || pos === 'Left & Right' || pos === 'All Sides') {
            ancillaryElements.push(
              <mesh receiveShadow key={`window_L_${i}`} position={[-w / 2 - 0.01, wy, vz]} rotation={[0, -Math.PI/2, 0]}>
                <boxGeometry args={[ww, wh, 0.1]} />
                <meshStandardMaterial color="#87CEEB" roughness={0.1} metalness={0.8} />
              </mesh>
            );
            if (specs.hasCrimpedSheets !== false) {
              ancillaryElements.push(
                <group key={`window_awning_L_${i}`} position={[-w / 2 - 0.01, wy + wh / 2, vz]}>
                  <mesh receiveShadow rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[awningRadius, awningRadius, ww + 0.4, 32, 1, false, Math.PI / 2, Math.PI / 2]} />
                    <meshStandardMaterial color={specs.crimpedSheetsColor || specs.roofColor || '#0089b6'} side={THREE.DoubleSide} />
                  </mesh>
                </group>
              );
            }
          }

          if (pos === 'Right' || pos === 'Left & Right' || pos === 'All Sides') {
            ancillaryElements.push(
              <mesh receiveShadow key={`window_R_${i}`} position={[w / 2 + 0.01, wy, vz]} rotation={[0, Math.PI/2, 0]}>
                <boxGeometry args={[ww, wh, 0.1]} />
                <meshStandardMaterial color="#87CEEB" roughness={0.1} metalness={0.8} />
              </mesh>
            );
            if (specs.hasCrimpedSheets !== false) {
              ancillaryElements.push(
                <group key={`window_awning_R_${i}`} position={[w / 2 + 0.01, wy + wh / 2, vz]}>
                  <mesh receiveShadow rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[awningRadius, awningRadius, ww + 0.4, 32, 1, false, 0, Math.PI / 2]} />
                    <meshStandardMaterial color={specs.crimpedSheetsColor || specs.roofColor || '#0089b6'} side={THREE.DoubleSide} />
                  </mesh>
                </group>
              );
            }
          }
        }
      }
    }

    // Front/Back
    if (pos === 'Front' || pos === 'Back' || pos === 'Front & Back' || pos === 'All Sides') {
      const numWindowsFront = Math.floor(w / 5);
      if (numWindowsFront > 0) {
        const windowSpacingFront = w / (numWindowsFront + 1);
        for (let i = 1; i <= numWindowsFront; i++) {
          const vx = -w/2 + windowSpacingFront * i;

          if (pos === 'Front' || pos === 'Front & Back' || pos === 'All Sides') {
            ancillaryElements.push(
              <mesh receiveShadow key={`window_F_${i}`} position={[vx, wy, -0.01]} rotation={[0, 0, 0]}>
                <boxGeometry args={[ww, wh, 0.1]} />
                <meshStandardMaterial color="#87CEEB" roughness={0.1} metalness={0.8} />
              </mesh>
            );
            if (specs.hasCrimpedSheets !== false) {
              ancillaryElements.push(
                <group key={`window_awning_F_${i}`} position={[vx, wy + wh / 2, -0.01]}>
                  <mesh receiveShadow rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[awningRadius, awningRadius, ww + 0.4, 32, 1, false, -Math.PI / 2, Math.PI / 2]} />
                    <meshStandardMaterial color={specs.crimpedSheetsColor || specs.roofColor || '#0089b6'} side={THREE.DoubleSide} />
                  </mesh>
                </group>
              );
            }
          }

          if (pos === 'Back' || pos === 'Front & Back' || pos === 'All Sides') {
            ancillaryElements.push(
              <mesh receiveShadow key={`window_B_${i}`} position={[vx, wy, l + 0.01]} rotation={[0, Math.PI, 0]}>
                <boxGeometry args={[ww, wh, 0.1]} />
                <meshStandardMaterial color="#87CEEB" roughness={0.1} metalness={0.8} />
              </mesh>
            );
            if (specs.hasCrimpedSheets !== false) {
              ancillaryElements.push(
                <group key={`window_awning_B_${i}`} position={[vx, wy + wh / 2, l + 0.01]}>
                  <mesh receiveShadow rotation={[0, 0, -Math.PI / 2]}>
                    <cylinderGeometry args={[awningRadius, awningRadius, ww + 0.4, 32, 1, false, Math.PI / 2, Math.PI / 2]} />
                    <meshStandardMaterial color={specs.crimpedSheetsColor || specs.roofColor || '#0089b6'} side={THREE.DoubleSide} />
                  </mesh>
                </group>
              );
            }
          }
        }
      }
    }
  }

  const structuralElements = [];
  const baySpacing = 6;
  const numFrames = Math.ceil(l / baySpacing) + 1;
  let colColor = "#1e293b";
  let rafterColor = "#334155";
  let purlinColor = "#475569";
  let girtColor = "#475569";

  if (weatherType === 'snow') {
    rafterColor = "#ef4444"; // high downward compression stress (red)
    purlinColor = "#f97316"; // high bending stress (orange)
  } else if (weatherType === 'storm') {
    rafterColor = "#06b6d4"; // high uplift tension stress (cyan)
    purlinColor = "#0ea5e9"; // high suction shear (light blue)
  }

  const colMaterial = <meshStandardMaterial color={colColor} roughness={0.5} metalness={0.7} envMapIntensity={0.8} />;
  const rafterMaterial = <meshStandardMaterial color={rafterColor} roughness={0.5} metalness={0.7} envMapIntensity={0.8} />;
  const purlinMaterial = <meshStandardMaterial color={purlinColor} roughness={0.4} metalness={0.8} envMapIntensity={1.0} />;
  const girtMaterial = <meshStandardMaterial color={girtColor} roughness={0.3} metalness={0.9} envMapIntensity={1.2} />;

  const renderBasePlate = (x: number, y: number, z: number, keyStr: string) => (
    <group key={keyStr} position={[x, y, z]}>
       <mesh receiveShadow castShadow position={[0, 0.025, 0]}>
          <boxGeometry args={[0.5, 0.05, 0.5]} />
          <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.7} />
       </mesh>
       {/* Anchor bolts */}
       <mesh position={[-0.15, 0.075, -0.15]}><cylinderGeometry args={[0.015, 0.015, 0.1]} /><meshStandardMaterial color="#94a3b8" metalness={0.8} /></mesh>
       <mesh position={[0.15, 0.075, -0.15]}><cylinderGeometry args={[0.015, 0.015, 0.1]} /><meshStandardMaterial color="#94a3b8" metalness={0.8} /></mesh>
       <mesh position={[-0.15, 0.075, 0.15]}><cylinderGeometry args={[0.015, 0.015, 0.1]} /><meshStandardMaterial color="#94a3b8" metalness={0.8} /></mesh>
       <mesh position={[0.15, 0.075, 0.15]}><cylinderGeometry args={[0.015, 0.015, 0.1]} /><meshStandardMaterial color="#94a3b8" metalness={0.8} /></mesh>
    </group>
  );

  for (let i = 0; i < numFrames; i++) {
    let z = (i / (numFrames - 1)) * l;
    if (i === 0) z = 0.35;
    else if (i === numFrames - 1) z = l - 0.35;
    
    const gateW = Math.min(4, l * 0.6);
    const inLeftGate = specs.hasProfileGate !== false && specs.profileGatePosition === 'Left' && z >= l/2 - gateW/2 && z <= l/2 + gateW/2;
    const inRightGate = specs.hasProfileGate !== false && specs.profileGatePosition === 'Right' && z >= l/2 - gateW/2 && z <= l/2 + gateW/2;

    if (specs.hasPrimarySteel !== false) {
      if (!inLeftGate) {
        structuralElements.push(
          <mesh receiveShadow key={`col_L_${i}`} position={[-w / 2 + 0.35, h / 2, z]}>
            <boxGeometry args={[0.3, h, 0.3]} />
            {colMaterial}
          </mesh>
        );
        structuralElements.push(renderBasePlate(-w / 2 + 0.35, 0, z, `bp_L_${i}`));
      }

      let rightColH = h;
      if (specs.roofType === 'Single Slope') {
        rightColH = h + w * (specs.roofSlope / 100);
      }

      if (!inRightGate) {
        structuralElements.push(
          <mesh receiveShadow key={`col_R_${i}`} position={[w / 2 - 0.35, rightColH / 2, z]}>
            <boxGeometry args={[0.3, rightColH, 0.3]} />
            {colMaterial}
          </mesh>
        );
        structuralElements.push(renderBasePlate(w / 2 - 0.35, 0, z, `bp_R_${i}`));
      }
      
      if (specs.frameType === 'Multi-Span') {
        let interiorColH = h;
        if (specs.roofType === 'Single Slope') {
           interiorColH = h + (w / 2) * (specs.roofSlope / 100);
        } else if (specs.roofType === 'Multi-Sloped Hut') {
           interiorColH = h + (w / 4) * (specs.roofSlope * 1.5 / 100) + (w / 4) * (specs.roofSlope * 0.5 / 100);
        } else if (specs.roofType === 'Curved') {
           interiorColH = h + (w / 2) * (specs.roofSlope / 100) * 1.5;
        } else {
           interiorColH = h + (w / 2) * (specs.roofSlope / 100);
        }
        
        // Remove front or back center column if profile gate exists
        const isFrontGateCol = i === 0 && specs.hasProfileGate !== false && (!specs.profileGatePosition || specs.profileGatePosition === 'Front');
        const isBackGateCol = i === numFrames - 1 && specs.hasProfileGate !== false && specs.profileGatePosition === 'Back';
        
        if (!isFrontGateCol && !isBackGateCol) {
            structuralElements.push(
              <mesh receiveShadow key={`col_M_${i}`} position={[0, interiorColH / 2, z]}>
                <boxGeometry args={[0.3, interiorColH, 0.3]} />
                {colMaterial}
              </mesh>
            );
            structuralElements.push(renderBasePlate(0, 0, z, `bp_M_${i}`));
        }
      }
      
      if (specs.frameType === 'Truss') {
        const isSingle = specs.roofType === 'Single Slope';
        const isCurved = specs.roofType === 'Curved';
        const isMulti = specs.roofType === 'Multi-Sloped Hut';

        // Proportion chord sizing and web profiles based on overall truss span w
        const chordSize = Math.min(0.25, 0.15 + (w > 12 ? (w - 12) * 0.005 : 0));
        const webWidth = chordSize * 0.4;
        const webDepth = chordSize * 0.67;

        // Mathematical helper to calculate the exact inner bottom Y of the top chord at any x-position
        const getTopChordBottomY = (xVal: number) => {
          if (isSingle) {
            const totRoofH = w * (specs.roofSlope / 100);
            const angle = Math.atan(totRoofH / w);
            const rx = xVal; // x ranges from -w/2 to w/2
            const slopeY = h + (rx - (-w/2)) * Math.tan(angle) + 0.1;
            return slopeY - (chordSize / 2) / Math.cos(angle);
          } else if (isCurved) {
            const roofH = (w / 2) * (specs.roofSlope / 100) * 1.5;
            const tVal = (xVal + w / 2) / w;
            const curveY = h + 0.1 + 4 * roofH * tVal * (1 - tVal);
            return curveY - chordSize * 0.53;
          } else if (isMulti) {
            const h_steep = (w / 4) * (specs.roofSlope * 1.5 / 100);
            const h_shallow = (w / 4) * (specs.roofSlope * 0.5 / 100);
            const a_steep = Math.atan(h_steep / (w / 4));
            const a_shallow = Math.atan(h_shallow / (w / 4));
            const absX = Math.abs(xVal);
            let topChordCenterY = h + 0.1;
            let activeAngle = 0;
            if (absX >= w / 4) {
              topChordCenterY = h + (w / 2 - absX) * Math.tan(a_steep) + 0.1;
              activeAngle = a_steep;
            } else {
              topChordCenterY = h + h_steep + (w / 4 - absX) * Math.tan(a_shallow) + 0.1;
              activeAngle = a_shallow;
            }
            return topChordCenterY - (chordSize / 2) / Math.cos(activeAngle);
          } else {
            // Standard Gable
            const roofH = (w / 2) * (specs.roofSlope / 100);
            const angle = Math.atan(roofH / (w / 2));
            const absX = Math.abs(xVal);
            const topChordCenterY = h + (w / 2 - absX) * Math.tan(angle) + 0.1;
            return topChordCenterY - (chordSize / 2) / Math.cos(angle);
          }
        };

        if (isSingle) {
          const totRoofH = w * (specs.roofSlope / 100);
          const rl = Math.sqrt(w * w + totRoofH * totRoofH);
          const angle = Math.atan(totRoofH / w);

          structuralElements.push(
            <mesh receiveShadow key={`truss_top_${i}`} position={[0, h + totRoofH / 2 + 0.1, z]} rotation={[0, 0, angle]}>
              <boxGeometry args={[rl, chordSize, chordSize]} />
              {rafterMaterial}
            </mesh>
          );

          structuralElements.push(
            <mesh receiveShadow key={`truss_bot_${i}`} position={[0, h + chordSize / 2, z]}>
              <boxGeometry args={[w, chordSize, chordSize]} />
              {rafterMaterial}
            </mesh>
          );

          const numWebs = Math.max(3, Math.round(w / 1.8));
          const step = w / numWebs;
          const bottomChordTopY = h + chordSize;

          for (let j = 1; j < numWebs; j++) {
            const x = -w / 2 + j * step;
            const y_bottom = bottomChordTopY;
            const y_top = getTopChordBottomY(x);
            const v_length = y_top - y_bottom;
            const v_y_pos = (y_bottom + y_top) / 2;

            if (v_length > 0.05) {
              structuralElements.push(
                <mesh receiveShadow key={`truss_v_${j}_${i}`} position={[x, v_y_pos, z]}>
                  <boxGeometry args={[webWidth, v_length, webDepth]} />
                  {rafterMaterial}
                </mesh>
              );
            }

            // Diagonal
            const nextX = -w / 2 + (j + 1) * step;
            const y_top_next = getTopChordBottomY(nextX);
            const dx = nextX - x;
            const dy = y_top_next - y_bottom;
            const diagL = Math.sqrt(dx * dx + dy * dy);
            const diagAngle = Math.atan2(dy, dx);

            structuralElements.push(
              <mesh receiveShadow key={`truss_d_${j}_${i}`} position={[x + dx / 2, y_bottom + dy / 2, z]} rotation={[0, 0, diagAngle]}>
                <boxGeometry args={[diagL, webWidth * 0.8, webDepth * 0.8]} />
                {rafterMaterial}
              </mesh>
            );
          }

          // End Vertical
          const xEnd = w / 2 - chordSize / 2;
          const y_bottom_end = bottomChordTopY;
          const y_top_end = getTopChordBottomY(xEnd);
          const end_v_length = y_top_end - y_bottom_end;
          const end_v_y_pos = (y_bottom_end + y_top_end) / 2;
          if (end_v_length > 0.05) {
            structuralElements.push(
              <mesh receiveShadow key={`truss_vert_end_${i}`} position={[xEnd, end_v_y_pos, z]}>
                <boxGeometry args={[webWidth * 1.2, end_v_length, webDepth * 1.2]} />
                {rafterMaterial}
              </mesh>
            );
          }
        } else if (isCurved) {
          const roofH = (w / 2) * (specs.roofSlope / 100) * 1.5;
          const curvePath = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(-w/2, h + 0.1, z),
            new THREE.Vector3(0, h + roofH * 2 + 0.1, z),
            new THREE.Vector3(w/2, h + 0.1, z)
          );
          const tubeGeo = new THREE.TubeGeometry(curvePath, 16, chordSize / 2, 8, false);

          structuralElements.push(
            <mesh receiveShadow key={`truss_curved_top_${i}`} geometry={tubeGeo}>
              {rafterMaterial}
            </mesh>
          );

          structuralElements.push(
            <mesh receiveShadow key={`truss_curved_bot_${i}`} position={[0, h + chordSize / 2, z]}>
              <boxGeometry args={[w, chordSize, chordSize]} />
              {rafterMaterial}
            </mesh>
          );

          const numWebs = Math.max(4, Math.round(w / 1.5));
          const step = w / numWebs;
          const bottomChordTopY = h + chordSize;

          for (let j = 1; j < numWebs; j++) {
            const t = j / numWebs;
            const x = -w / 2 + t * w;
            const y_bottom = bottomChordTopY;
            const y_top = getTopChordBottomY(x);
            const v_length = y_top - y_bottom;
            const v_y_pos = (y_bottom + y_top) / 2;

            if (v_length > 0.05) {
              structuralElements.push(
                <mesh receiveShadow key={`truss_curv_v_${j}_${i}`} position={[x, v_y_pos, z]}>
                  <boxGeometry args={[webWidth, v_length, webDepth]} />
                  {rafterMaterial}
                </mesh>
              );
            }

            if (j < numWebs - 1) {
              const nextT = (j + 1) / numWebs;
              const nextX = -w / 2 + nextT * w;
              const y_top_next = getTopChordBottomY(nextX);
              const dx = nextX - x;
              const dy = y_top_next - y_bottom;
              const diagL = Math.sqrt(dx * dx + dy * dy);
              const diagAngle = Math.atan2(dy, dx);

              structuralElements.push(
                <mesh receiveShadow key={`truss_curv_d_${j}_${i}`} position={[x + dx / 2, y_bottom + dy / 2, z]} rotation={[0, 0, diagAngle]}>
                  <boxGeometry args={[diagL, webWidth * 0.8, webDepth * 0.8]} />
                  {rafterMaterial}
                </mesh>
              );
            }
          }
        } else if (isMulti) {
          const h_steep = (w / 4) * (specs.roofSlope * 1.5 / 100);
          const h_shallow = (w / 4) * (specs.roofSlope * 0.5 / 100);
          const rl_steep = Math.sqrt((w / 4) * (w / 4) + h_steep * h_steep);
          const rl_shallow = Math.sqrt((w / 4) * (w / 4) + h_shallow * h_shallow);
          const a_steep = Math.atan(h_steep / (w / 4));
          const a_shallow = Math.atan(h_shallow / (w / 4));

          structuralElements.push(
            <mesh receiveShadow key={`truss_m1_${i}`} position={[-w * 0.375, h + h_steep / 2 + 0.1, z]} rotation={[0, 0, a_steep]}>
              <boxGeometry args={[rl_steep, chordSize, chordSize]} />
              {rafterMaterial}
            </mesh>
          );
          structuralElements.push(
            <mesh receiveShadow key={`truss_m2_${i}`} position={[-w * 0.125, h + h_steep + h_shallow / 2 + 0.1, z]} rotation={[0, 0, a_shallow]}>
              <boxGeometry args={[rl_shallow, chordSize, chordSize]} />
              {rafterMaterial}
            </mesh>
          );
          structuralElements.push(
            <mesh receiveShadow key={`truss_m3_${i}`} position={[w * 0.125, h + h_steep + h_shallow / 2 + 0.1, z]} rotation={[0, 0, -a_shallow]}>
              <boxGeometry args={[rl_shallow, chordSize, chordSize]} />
              {rafterMaterial}
            </mesh>
          );
          structuralElements.push(
            <mesh receiveShadow key={`truss_m4_${i}`} position={[w * 0.375, h + h_steep / 2 + 0.1, z]} rotation={[0, 0, -a_steep]}>
              <boxGeometry args={[rl_steep, chordSize, chordSize]} />
              {rafterMaterial}
            </mesh>
          );

          structuralElements.push(
            <mesh receiveShadow key={`truss_bot_m_${i}`} position={[0, h + chordSize / 2, z]}>
              <boxGeometry args={[w, chordSize, chordSize]} />
              {rafterMaterial}
            </mesh>
          );

          const numPanelsHalf = Math.max(2, Math.round((w / 2) / 1.8));
          const step = (w / 2) / numPanelsHalf;
          const bottomChordTopY = h + chordSize;

          // Verticals
          for (let j = 1; j < 2 * numPanelsHalf; j++) {
            const x = -w / 2 + j * step;
            const y_bottom = bottomChordTopY;
            const y_top = getTopChordBottomY(x);
            const v_length = y_top - y_bottom;
            const v_y_pos = (y_bottom + y_top) / 2;

            if (v_length > 0.05) {
              structuralElements.push(
                <mesh receiveShadow key={`truss_m_v_${j}_${i}`} position={[x, v_y_pos, z]}>
                  <boxGeometry args={[webWidth, v_length, webDepth]} />
                  {rafterMaterial}
                </mesh>
              );
            }
          }

          // Diagonals: Left half
          for (let j = 0; j < numPanelsHalf; j++) {
            const x_start = -w / 2 + j * step;
            const x_end = -w / 2 + (j + 1) * step;
            const y_start = bottomChordTopY;
            const y_end = getTopChordBottomY(x_end);
            const dx = x_end - x_start;
            const dy = y_end - y_start;
            const diagL = Math.sqrt(dx * dx + dy * dy);
            const diagAngle = Math.atan2(dy, dx);

            structuralElements.push(
              <mesh receiveShadow key={`truss_m_d_l_${j}_${i}`} position={[x_start + dx / 2, y_start + dy / 2, z]} rotation={[0, 0, diagAngle]}>
                <boxGeometry args={[diagL, webWidth * 0.8, webDepth * 0.8]} />
                {rafterMaterial}
              </mesh>
            );
          }

          // Diagonals: Right half
          for (let j = numPanelsHalf; j < 2 * numPanelsHalf; j++) {
            const x_start = -w / 2 + (j + 1) * step;
            const x_end = -w / 2 + j * step;
            const y_start = bottomChordTopY;
            const y_end = getTopChordBottomY(x_end);
            const dx = x_end - x_start;
            const dy = y_end - y_start;
            const diagL = Math.sqrt(dx * dx + dy * dy);
            const diagAngle = Math.atan2(dy, dx);

            structuralElements.push(
              <mesh receiveShadow key={`truss_m_d_r_${j}_${i}`} position={[x_start + dx / 2, y_start + dy / 2, z]} rotation={[0, 0, diagAngle]}>
                <boxGeometry args={[diagL, webWidth * 0.8, webDepth * 0.8]} />
                {rafterMaterial}
              </mesh>
            );
          }
        } else {
          // Standard Gable Truss (Fink / Howe Pratt-Optimized Design)
          const roofH = (w / 2) * (specs.roofSlope / 100);
          const rl = Math.sqrt((w / 2) * (w / 2) + roofH * roofH);
          const angle = Math.atan(roofH / (w / 2));

          // Top Chords
          structuralElements.push(
            <mesh receiveShadow key={`truss_topL_${i}`} position={[-w / 4, h + roofH / 2 + 0.1, z]} rotation={[0, 0, angle]}>
              <boxGeometry args={[rl, chordSize, chordSize]} />
              {rafterMaterial}
            </mesh>
          );
          structuralElements.push(
            <mesh receiveShadow key={`truss_topR_${i}`} position={[w / 4, h + roofH / 2 + 0.1, z]} rotation={[0, 0, -angle]}>
              <boxGeometry args={[rl, chordSize, chordSize]} />
              {rafterMaterial}
            </mesh>
          );

          // Bottom Chord
          structuralElements.push(
            <mesh receiveShadow key={`truss_botG_${i}`} position={[0, h + chordSize / 2, z]}>
              <boxGeometry args={[w, chordSize, chordSize]} />
              {rafterMaterial}
            </mesh>
          );

          const numPanelsHalf = Math.max(2, Math.round((w / 2) / 1.8));
          const step = (w / 2) / numPanelsHalf;
          const bottomChordTopY = h + chordSize;

          // Verticals
          for (let j = 1; j < 2 * numPanelsHalf; j++) {
            const x = -w / 2 + j * step;
            const y_bottom = bottomChordTopY;
            const y_top = getTopChordBottomY(x);
            const v_length = y_top - y_bottom;
            const v_y_pos = (y_bottom + y_top) / 2;

            if (v_length > 0.05) {
              structuralElements.push(
                <mesh receiveShadow key={`truss_v_${j}_${i}`} position={[x, v_y_pos, z]}>
                  <boxGeometry args={[webWidth, v_length, webDepth]} />
                  {rafterMaterial}
                </mesh>
              );
            }
          }

          // Diagonals: Left half
          for (let j = 0; j < numPanelsHalf; j++) {
            const x_start = -w / 2 + j * step;
            const x_end = -w / 2 + (j + 1) * step;
            const y_start = bottomChordTopY;
            const y_end = getTopChordBottomY(x_end);
            const dx = x_end - x_start;
            const dy = y_end - y_start;
            const diagL = Math.sqrt(dx * dx + dy * dy);
            const diagAngle = Math.atan2(dy, dx);

            structuralElements.push(
              <mesh receiveShadow key={`truss_diagL_${j}_${i}`} position={[x_start + dx / 2, y_start + dy / 2, z]} rotation={[0, 0, diagAngle]}>
                <boxGeometry args={[diagL, webWidth * 0.8, webDepth * 0.8]} />
                {rafterMaterial}
              </mesh>
            );
          }

          // Diagonals: Right half
          for (let j = numPanelsHalf; j < 2 * numPanelsHalf; j++) {
            const x_start = -w / 2 + (j + 1) * step;
            const x_end = -w / 2 + j * step;
            const y_start = bottomChordTopY;
            const y_end = getTopChordBottomY(x_end);
            const dx = x_end - x_start;
            const dy = y_end - y_start;
            const diagL = Math.sqrt(dx * dx + dy * dy);
            const diagAngle = Math.atan2(dy, dx);

            structuralElements.push(
              <mesh receiveShadow key={`truss_diagR_${j}_${i}`} position={[x_start + dx / 2, y_start + dy / 2, z]} rotation={[0, 0, diagAngle]}>
                <boxGeometry args={[diagL, webWidth * 0.8, webDepth * 0.8]} />
                {rafterMaterial}
              </mesh>
            );
          }
        }
      } else if (specs.roofType === 'Single Slope') {
        const totRoofH = w * (specs.roofSlope / 100);
        const rl = Math.sqrt(w * w + totRoofH * totRoofH);
        const angle = Math.atan(totRoofH / w);
        structuralElements.push(
          <mesh receiveShadow key={`raf_${i}`} position={[0, h + totRoofH / 2 + 0.25, z]} rotation={[0, 0, angle]}>
            <boxGeometry args={[rl + 0.2, 0.4, 0.2]} />
            {rafterMaterial}
          </mesh>
        );
      } else if (specs.roofType === 'Multi-Sloped Hut') {
        const h_steep = (w / 4) * (specs.roofSlope * 1.5 / 100);
        const h_shallow = (w / 4) * (specs.roofSlope * 0.5 / 100);
        const rl_steep = Math.sqrt((w / 4) * (w / 4) + h_steep * h_steep);
        const rl_shallow = Math.sqrt((w / 4) * (w / 4) + h_shallow * h_shallow);
        const a_steep = Math.atan(h_steep / (w / 4));
        const a_shallow = Math.atan(h_shallow / (w / 4));
        
        structuralElements.push(
          <mesh receiveShadow key={`raf1_${i}`} position={[-w * 0.375, h + h_steep / 2 + 0.25, z]} rotation={[0, 0, a_steep]}>
            <boxGeometry args={[rl_steep, 0.4, 0.2]} />
            {rafterMaterial}
          </mesh>
        );
        structuralElements.push(
          <mesh receiveShadow key={`raf2_${i}`} position={[-w * 0.125, h + h_steep + h_shallow / 2 + 0.25, z]} rotation={[0, 0, a_shallow]}>
            <boxGeometry args={[rl_shallow, 0.4, 0.2]} />
            {rafterMaterial}
          </mesh>
        );
        structuralElements.push(
          <mesh receiveShadow key={`raf3_${i}`} position={[w * 0.125, h + h_steep + h_shallow / 2 + 0.25, z]} rotation={[0, 0, -a_shallow]}>
            <boxGeometry args={[rl_shallow, 0.4, 0.2]} />
            {rafterMaterial}
          </mesh>
        );
        structuralElements.push(
          <mesh receiveShadow key={`raf4_${i}`} position={[w * 0.375, h + h_steep / 2 + 0.25, z]} rotation={[0, 0, -a_steep]}>
            <boxGeometry args={[rl_steep, 0.4, 0.2]} />
            {rafterMaterial}
          </mesh>
        );
      } else if (specs.roofType === 'Curved') {
         const roofH = (w / 2) * (specs.roofSlope / 100) * 1.5;
         const curvePath = new THREE.QuadraticBezierCurve3(
           new THREE.Vector3(-w/2, h + 0.1, z),
           new THREE.Vector3(0, h + roofH * 2 + 0.1, z),
           new THREE.Vector3(w/2, h + 0.1, z)
         );
         const tubeGeo = new THREE.TubeGeometry(curvePath, 16, 0.15, 8, false);
         structuralElements.push(
           <mesh receiveShadow key={`raf_${i}`} geometry={tubeGeo}>
             {rafterMaterial}
           </mesh>
         );
      } else {
        const roofH = (w / 2) * (specs.roofSlope / 100);
        const rl = Math.sqrt((w / 2) * (w / 2) + roofH * roofH);
        const angle = Math.atan(roofH / (w / 2));
        structuralElements.push(
          <mesh receiveShadow key={`rafL_${i}`} position={[-w / 4, h + roofH / 2 + 0.25, z]} rotation={[0, 0, angle]}>
            <boxGeometry args={[rl, 0.4, 0.2]} />
            {rafterMaterial}
          </mesh>
        );
        structuralElements.push(
          <mesh receiveShadow key={`rafR_${i}`} position={[w / 4, h + roofH / 2 + 0.25, z]} rotation={[0, 0, -angle]}>
            <boxGeometry args={[rl, 0.4, 0.2]} />
            {rafterMaterial}
          </mesh>
        );
      }
    }
  }

  if (specs.hasSecondarySteel !== false) {
    const isTruss = specs.frameType === 'Truss';
    let purlinYOffset = 0.5;
    let cleatYOffset = 0.425;

    if (isTruss) {
      if (specs.roofType === 'Curved') {
        purlinYOffset = 0.255;
        cleatYOffset = 0.18;
      } else if (specs.roofType === 'Multi-Sloped Hut') {
        purlinYOffset = 0.235;
        cleatYOffset = 0.16;
      } else {
        // Standard Gable and Single Slope
        purlinYOffset = 0.25;
        cleatYOffset = 0.175;
      }
    } else {
      if (specs.roofType === 'Curved') {
        purlinYOffset = 0.325;
        cleatYOffset = 0.25;
      } else {
        purlinYOffset = 0.5;
        cleatYOffset = 0.425;
      }
    }

    const addPurlinWithCleats = (px: number, py: number, angle: number, keyStr: string) => {
      // 1. Purlin Beam aligned with slope (shortened slightly at each end to stay inside gable walls)
      structuralElements.push(
        <group key={`${keyStr}_purlin_grp`} position={[px, py, l/2]} rotation={[0, 0, angle]}>
          <mesh receiveShadow key={keyStr} position={[0, purlinYOffset, 0]}>
            <boxGeometry args={[0.15, 0.15, l - 0.04]} />
            {purlinMaterial}
          </mesh>
        </group>
      );

      // 2. Cleats aligned with slope
      const cleatOffsetX = px > 0 ? -0.05 : 0.05;
      for (let i = 0; i < numFrames; i++) {
        let z = (i / (numFrames - 1)) * l;
        if (i === 0) z = 0.35;
        else if (i === numFrames - 1) z = l - 0.35;
        structuralElements.push(
          <group key={`${keyStr}_cleat_grp_${i}`} position={[px, py, z]} rotation={[0, 0, angle]}>
            <group position={[cleatOffsetX, cleatYOffset, 0]}>
              <mesh receiveShadow>
                 <boxGeometry args={[0.02, 0.15, 0.15]} />
                 <meshStandardMaterial color="#94a3b8" roughness={0.6} metalness={0.8} />
              </mesh>
              <mesh position={[0, -0.03, -0.04]} rotation={[0, 0, Math.PI / 2]}>
                 <cylinderGeometry args={[0.012, 0.012, 0.06]} />
                 <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.5} />
              </mesh>
              <mesh position={[0, -0.03, 0.04]} rotation={[0, 0, Math.PI / 2]}>
                 <cylinderGeometry args={[0.012, 0.012, 0.06]} />
                 <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.5} />
              </mesh>
            </group>
          </group>
        );
      }

      // 3. SDScrews (Roof) aligned with slope
      if (specs.hasSDScrews !== false && specs.hasRoof !== false) {
        const hasCaps = specs.hasPVCCaps !== false;
        const r = hasCaps ? 0.015 : 0.0075;
        const d = hasCaps ? 0.01 : 0.005;
        const sdMat = hasCaps ? (
          <meshStandardMaterial color={specs.pvcCapColor || "#383e42"} roughness={0.8} />
        ) : (
          <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.9} />
        );
        const isStandard = specs.roofProfile === 'Standard';
        const peakH = isStandard ? 0.018 : 0.030;
        const screwYOffset = purlinYOffset + 0.075 + peakH + d/2;

        const roofEffWidthLoc = specs.roofProfile === '6v Profile' ? 0.99 : (specs.roofProfile === '7v Profile' ? 1.188 : 1.0);
        const numSheetsLoc = Math.ceil(l / roofEffWidthLoc - 0.001);

        const is7v = specs.roofProfile === '7v Profile';
        const is6v = specs.roofProfile === '6v Profile';

        for (let i = 0; i < numSheetsLoc; i++) {
          const isLastSheet = i === numSheetsLoc - 1;
          
          let sheetStart = i * roofEffWidthLoc;
          let sheetW = roofEffWidthLoc;
          
          if (isLastSheet && numSheetsLoc > 1) {
            const pitch = (is6v || is7v) ? 0.198 : 0.076;
            let m = 1;
            let z_last = (numSheetsLoc - 1) * roofEffWidthLoc - m * pitch;
            while (z_last > l - roofEffWidthLoc + 0.001) {
              m++;
              z_last = (numSheetsLoc - 1) * roofEffWidthLoc - m * pitch;
            }
            m = Math.max(1, m - 1);
            sheetStart = (numSheetsLoc - 1) * roofEffWidthLoc - m * pitch;
            sheetW = l - sheetStart;
          } else if (isLastSheet) {
            sheetW = l;
            sheetStart = 0;
          }

          if (is6v || is7v) {
            const numPeaks = is7v ? 7 : 6;
            // Peaks are at x_peak = 0.0228 + k * 0.198 in shape coordinates.
            // In world coordinates: z_peak = sheetStart + sheetW - x_peak.
            // Place screws at every second peak (k = 0, 2, 4, 6) for spacing ~0.396m
            for (let k = 0; k < numPeaks; k += 2) {
              const x_peak = 0.0228 + k * 0.198;
              if (x_peak > sheetW) break;
              const pz = sheetStart + sheetW - x_peak;
              if (pz < 0 || pz > l) continue;

              ancillaryElements.push(
                <group key={`${keyStr}_sheet_${i}_screw_${k}`} position={[px, py, pz]} rotation={[0, 0, angle]}>
                  <mesh receiveShadow position={[0, screwYOffset, 0]}>
                    <cylinderGeometry args={[r, r, d, 8]} />
                    {sdMat}
                  </mesh>
                </group>
              );
            }
          } else {
            // Standard wave profile peaks are at wave peak locations: (k + 0.5) * 0.076.
            // Place screws at every fourth wave peak for spacing ~0.304m
            const wavePitch = 0.076;
            const maxWaves = Math.floor(sheetW / wavePitch);
            for (let k = 0; k < maxWaves; k += 4) {
              const x_peak = (k + 0.5) * wavePitch;
              if (x_peak > sheetW) break;
              const pz = sheetStart + sheetW - x_peak;
              if (pz < 0 || pz > l) continue;

              ancillaryElements.push(
                <group key={`${keyStr}_sheet_${i}_screw_${k}`} position={[px, py, pz]} rotation={[0, 0, angle]}>
                  <mesh receiveShadow position={[0, screwYOffset, 0]}>
                    <cylinderGeometry args={[r, r, d, 8]} />
                    {sdMat}
                  </mesh>
                </group>
              );
            }
          }
        }
      }
    };
    const purlinSpacing = specs.highWindVelocity || specs.snowLoad ? 1.0 : 1.5;
    const inboardOffset = 0.15; // Shift outermost purlins 15cm inboard so they don't protrude past external side walls

    if (specs.roofType === 'Single Slope') {
      const totRoofH = w * (specs.roofSlope / 100);
      const rl = Math.sqrt(w * w + totRoofH * totRoofH);
      const runs = Math.max(1, Math.round(rl / purlinSpacing));
      const angle = Math.atan(totRoofH / w);
      for (let p = 0; p <= runs; p++) {
        // Shift range to be fully inboard at eave boundaries
        const px = (-w/2 + inboardOffset) + ((w - 2 * inboardOffset) * (p / runs));
        const py = h + (px + w/2) * (totRoofH / w);
        addPurlinWithCleats(px, py, angle, `purlin_${p}`);
      }
    } else if (specs.roofType === 'Curved') {
       const roofH = (w / 2) * (specs.roofSlope / 100) * 1.5;
       const arcLen = w * 1.1; // simple generic arc length approximation base
       const runs = Math.max(1, Math.round(arcLen / purlinSpacing));
       for (let p = 0; p <= runs; p++) {
         const t = p / runs;
         const px = (-w / 2 + inboardOffset) + (w - 2 * inboardOffset) * t;
         const t_curve = (px + w/2) / w;
         const py = h + 4 * roofH * (t_curve - t_curve * t_curve);
         const derivY = 4 * roofH * (1 - 2 * t_curve);
         const derivX = w;
         const angle = Math.atan(-derivY / derivX);
         addPurlinWithCleats(px, py, angle, `purlin_curved_${p}`);
       }
    } else if (specs.roofType === 'Multi-Sloped Hut') {
      const h_steep = (w / 4) * (specs.roofSlope * 1.5 / 100);
      const h_shallow = (w / 4) * (specs.roofSlope * 0.5 / 100);
      const rl_steep = Math.sqrt((w / 4) * (w / 4) + h_steep * h_steep);
      const rl_shallow = Math.sqrt((w / 4) * (w / 4) + h_shallow * h_shallow);

      const runsSteep = Math.max(1, Math.round(rl_steep / purlinSpacing));
      const runsShallow = Math.max(1, Math.round(rl_shallow / purlinSpacing));

      const a_steep = Math.atan(h_steep / (w / 4));
      const a_shallow = Math.atan(h_shallow / (w / 4));

      for (let side = -1; side <= 1; side += 2) {
        // Steep portion purlins - shifted inboard
        for (let p = 0; p < runsSteep; p++) {
          const startX = side * (w/2 - inboardOffset);
          const endX = side * (w/4);
          const t = p / runsSteep;
          const px = startX + (endX - startX) * t;
          const distFromWall = w/2 - Math.abs(px);
          const py = h + distFromWall * Math.tan(a_steep);
          addPurlinWithCleats(px, py, side * -a_steep, `purlin_steep_${side}_${p}`);
        }
        // Shallow portion purlins
        for (let p = 0; p < runsShallow; p++) {
          const px = side * (w/4 - (w/4 * (p / runsShallow)));
          const py = h + h_steep + (h_shallow * (p / runsShallow));
          addPurlinWithCleats(px, py, side * -a_shallow, `purlin_shallow_${side}_${p}`);
        }
      }
      addPurlinWithCleats(0, h + h_steep + h_shallow, 0, `purlin_ridge`);
    } else {
      const roofH = (w / 2) * (specs.roofSlope / 100);
      const rl = Math.sqrt((w / 2) * (w / 2) + roofH * roofH);
      const runs = Math.max(1, Math.round(rl / purlinSpacing));
      
      const angle = Math.atan(roofH / (w / 2));
      for (let side = -1; side <= 1; side += 2) {
        for (let p = 0; p < runs; p++) {
          const startX = side * (w/2 - inboardOffset);
          const endX = 0;
          const t = p / runs;
          const px = startX + (endX - startX) * t;
          const distFromWall = w/2 - Math.abs(px);
          const py = h + distFromWall * Math.tan(angle);
          addPurlinWithCleats(px, py, side * -angle, `purlin_${side}_${p}`);
        }
      }
      addPurlinWithCleats(0, h + roofH, 0, `purlin_ridge`);
    }

    const girtSpacing = specs.highWindVelocity || specs.snowLoad ? 1.0 : 1.5;
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

    if (specs.hasGirts !== false) {
      const girtRunsAll = Math.max(Math.ceil(h / girtSpacing), Math.ceil(rightWallH / girtSpacing), Math.ceil(maxFBH / girtSpacing));
      for (let p = 0; p <= girtRunsAll; p++) {
        const py = p === 0 ? 0.05 : p * girtSpacing;
        
        if (py <= h) {
          structuralElements.push(
            <mesh receiveShadow key={`girt_L_${p}`} position={[-w/2 + 0.1, py, l/2]}>
              <boxGeometry args={[0.2, 0.15, l]} />
              {girtMaterial}
            </mesh>
          );
          for (let i = 0; i < numFrames; i++) {
             let z = (i / (numFrames - 1)) * l;
             if (i === 0) z = 0.35; else if (i === numFrames - 1) z = l - 0.35;
             structuralElements.push(
               <group key={`girt_cleat_L_grp_${p}_${i}`} position={[-w/2 + 0.22, py, z]}>
                 <mesh receiveShadow>
                   <boxGeometry args={[0.04, 0.2, 0.18]} />
                   <meshStandardMaterial color="#94a3b8" roughness={0.6} metalness={0.8} />
                 </mesh>
                 <mesh position={[0.02, 0, -0.05]} rotation={[0, 0, Math.PI / 2]}>
                   <cylinderGeometry args={[0.012, 0.012, 0.06]} />
                   <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.5} />
                 </mesh>
                 <mesh position={[0.02, 0, 0.05]} rotation={[0, 0, Math.PI / 2]}>
                   <cylinderGeometry args={[0.012, 0.012, 0.06]} />
                   <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.5} />
                 </mesh>
               </group>
             );
          }
        }
        if (py <= rightWallH) {
          structuralElements.push(
            <mesh receiveShadow key={`girt_R_${p}`} position={[w/2 - 0.1, py, l/2]}>
              <boxGeometry args={[0.2, 0.15, l]} />
              {girtMaterial}
            </mesh>
          );
          for (let i = 0; i < numFrames; i++) {
             let z = (i / (numFrames - 1)) * l;
             if (i === 0) z = 0.35; else if (i === numFrames - 1) z = l - 0.35;
             structuralElements.push(
               <group key={`girt_cleat_R_grp_${p}_${i}`} position={[w/2 - 0.22, py, z]}>
                 <mesh receiveShadow>
                   <boxGeometry args={[0.04, 0.2, 0.18]} />
                   <meshStandardMaterial color="#94a3b8" roughness={0.6} metalness={0.8} />
                 </mesh>
                 <mesh position={[-0.02, 0, -0.05]} rotation={[0, 0, Math.PI / 2]}>
                   <cylinderGeometry args={[0.012, 0.012, 0.06]} />
                   <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.5} />
                 </mesh>
                 <mesh position={[-0.02, 0, 0.05]} rotation={[0, 0, Math.PI / 2]}>
                   <cylinderGeometry args={[0.012, 0.012, 0.06]} />
                   <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.5} />
                 </mesh>
               </group>
             );
          }
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
            
            const gateH = Math.min(3, h * 0.8);
            if (specs.hasProfileGate !== false && py <= gateH) {
                const gateW = Math.min(4, w * 0.6);
                const gateStartX = -gateW / 2;
                const gateEndX = gateW / 2;
                
                if (rxLeftFront < gateStartX) {
                    const leftFw = gateStartX - rxLeftFront;
                    const leftFcx = rxLeftFront + leftFw / 2;
                    structuralElements.push(
                      <mesh receiveShadow key={`girt_F_${p}_L`} position={[leftFcx, py, 0.1]}>
                        <boxGeometry args={[leftFw, 0.15, 0.2]} />
                        {girtMaterial}
                      </mesh>
                    );
                }
                if (gateEndX < rxRightFront) {
                    const rightFw = rxRightFront - gateEndX;
                    const rightFcx = gateEndX + rightFw / 2;
                    structuralElements.push(
                      <mesh receiveShadow key={`girt_F_${p}_R`} position={[rightFcx, py, 0.1]}>
                        <boxGeometry args={[rightFw, 0.15, 0.2]} />
                        {girtMaterial}
                      </mesh>
                    );
                }
            } else {
                structuralElements.push(
                  <mesh receiveShadow key={`girt_F_${p}`} position={[fcx, py, 0.1]}>
                    <boxGeometry args={[fw, 0.15, 0.2]} />
                    {girtMaterial}
                  </mesh>
                );
            }

            structuralElements.push(
              <mesh receiveShadow key={`girt_B_${p}`} position={[fcx, py, l - 0.1]}>
                <boxGeometry args={[fw, 0.15, 0.2]} />
                {girtMaterial}
              </mesh>
            );
          }
        }
      }
    }
  }

  if (specs.hasSDScrews !== false && (specs.hasWalls !== false || specs.hasRoof !== false)) {
    const hasCaps = specs.hasPVCCaps !== false;
    const r = hasCaps ? 0.015 : 0.0075;
    const d = hasCaps ? 0.01 : 0.005;
    
    // Left/Right Wall Screw Geometry
    const sdGeoL = new THREE.CylinderGeometry(r, r, d, 8);
    sdGeoL.rotateZ(Math.PI / 2);
    const sdGeoR = new THREE.CylinderGeometry(r, r, d, 8);
    sdGeoR.rotateZ(Math.PI / 2);

    // Front/Back Wall Screw Geometry
    const sdGeoF = new THREE.CylinderGeometry(r, r, d, 8);
    sdGeoF.rotateX(Math.PI / 2);
    
    // Roof Screws Geometry
    const sdGeoRoofL = new THREE.CylinderGeometry(r, r, d, 8);
    const roofAngle = Math.atan((specs.roofSlope || 0) / 100);
    sdGeoRoofL.rotateZ(-roofAngle);
    
    const sdGeoRoofR = new THREE.CylinderGeometry(r, r, d, 8);
    sdGeoRoofR.rotateZ(roofAngle);

    const sdMat = hasCaps ? <meshStandardMaterial color={specs.pvcCapColor || "#383e42"} roughness={0.8} /> : <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.9} />;
    const sdElements = [];
    const stepZ = 0.33; // Approx pitch distance along panels

    const girtSpacing = specs.highWindVelocity || specs.snowLoad ? 1.0 : 1.5;
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
    
    // Walls
    if (specs.hasWalls !== false) {
      const girtRunsAll = Math.max(Math.ceil(h / girtSpacing), Math.ceil(rightWallH / girtSpacing), Math.ceil(maxFBH / girtSpacing));
      
      for (let p = 0; p <= girtRunsAll; p++) {
        const py = p === 0 ? 0.05 : p * girtSpacing;
        
        // Left & Right Walls
        const isLeftGate = specs.hasProfileGate !== false && specs.profileGatePosition === 'Left';
        const isRightGate = specs.hasProfileGate !== false && specs.profileGatePosition === 'Right';
        const isFrontGate = specs.hasProfileGate !== false && (!specs.profileGatePosition || specs.profileGatePosition === 'Front');
        const isBackGate = specs.hasProfileGate !== false && specs.profileGatePosition === 'Back';
        const gateWL = Math.min(4, l * 0.6);
        const gateW = Math.min(4, w * 0.6);
        const gateH = Math.min(3, h * 0.8);
        
        // Left & Right Walls Peak-aligned z coordinates
        const is7vWall = specs.wallProfile === '7v Profile';
        const is6vWall = specs.wallProfile === '6v Profile';
        const wallEffWidth = is6vWall ? 0.99 : (is7vWall ? 1.188 : 1.0);
        const numZSheets = Math.ceil(l / wallEffWidth - 0.001);

        const wallZPZValues: number[] = [];
        for (let i = 0; i < numZSheets; i++) {
          const isLastSheet = i === numZSheets - 1;
          let sheetStart = i * wallEffWidth;
          let sheetW = wallEffWidth;
          if (isLastSheet && numZSheets > 1) {
            const pitch = (is6vWall || is7vWall) ? 0.198 : 0.076;
            let m = 1;
            let z_last = (numZSheets - 1) * wallEffWidth - m * pitch;
            while (z_last > l - wallEffWidth + 0.001) {
              m++;
              z_last = (numZSheets - 1) * wallEffWidth - m * pitch;
            }
            m = Math.max(1, m - 1);
            sheetStart = (numZSheets - 1) * wallEffWidth - m * pitch;
            sheetW = l - sheetStart;
          } else if (isLastSheet) {
            sheetW = l;
            sheetStart = 0;
          }

          if (is6vWall || is7vWall) {
            const numPeaks = is7vWall ? 7 : 6;
            // Valleys/pitch centers are located halfway between consecutive peaks
            // x_valley = x_peak + pitch/2 = 0.0228 + k * 0.198 + 0.099
            for (let k = 0; k < numPeaks - 1; k += 2) {
              const x_valley = 0.0228 + k * 0.198 + 0.099;
              if (x_valley > sheetW) break;
              const pz = sheetStart + sheetW - x_valley;
              if (pz >= 0 && pz <= l) {
                wallZPZValues.push(pz);
              }
            }
          } else {
            const wavePitch = 0.076;
            const maxWaves = Math.floor(sheetW / wavePitch);
            // Valleys for standard corrugated sheet are at (k + 1.5) * wavePitch
            for (let k = 0; k < maxWaves; k += 4) {
              const x_valley = (k + 1.5) * wavePitch;
              if (x_valley > sheetW) break;
              const pz = sheetStart + sheetW - x_valley;
              if (pz >= 0 && pz <= l) {
                wallZPZValues.push(pz);
              }
            }
          }
        }

        const wallOffset = 0.01 + d / 2;

        for (const pz of wallZPZValues) {
          if (py <= h) {
            const inLeftGate = isLeftGate && py <= gateH && pz >= l/2 - gateWL/2 && pz <= l/2 + gateWL/2;
            if (!inLeftGate) {
              sdElements.push(
                <mesh receiveShadow key={`sd_L_${py}_${pz}`} position={[-w/2 - wallOffset, py, pz]}>
                  <primitive object={sdGeoL} />
                  {sdMat}
                </mesh>
              );
            }
          }
          if (py <= rightWallH) {
            const inRightGate = isRightGate && py <= gateH && pz >= l/2 - gateWL/2 && pz <= l/2 + gateWL/2;
            if (!inRightGate) {
              sdElements.push(
                <mesh receiveShadow key={`sd_R_${py}_${pz}`} position={[w/2 + wallOffset, py, pz]}>
                  <primitive object={sdGeoR} />
                  {sdMat}
                </mesh>
              );
            }
          }
        }
        
        // Front & Back wall peak x values
        const wallXPXValues: number[] = [];
        const numXSheets = Math.ceil(w / wallEffWidth - 0.001);
        for (let i = 0; i < numXSheets; i++) {
          const isLastSheet = i === numXSheets - 1;
          let sheetStart = -w/2 + i * wallEffWidth;
          let sheetW = wallEffWidth;
          if (isLastSheet && numXSheets > 1) {
            const pitch = (is6vWall || is7vWall) ? 0.198 : 0.076;
            let m = 1;
            let x_last = -w/2 + (numXSheets - 1) * wallEffWidth - m * pitch;
            while (x_last > w/2 - wallEffWidth + 0.001) {
              m++;
              x_last = -w/2 + (numXSheets - 1) * wallEffWidth - m * pitch;
            }
            m = Math.max(1, m - 1);
            sheetStart = -w/2 + (numXSheets - 1) * wallEffWidth - m * pitch;
            sheetW = w/2 - sheetStart;
          } else if (isLastSheet) {
            sheetW = w/2 - sheetStart;
          }

          if (is6vWall || is7vWall) {
            const numPeaks = is7vWall ? 7 : 6;
            // Valleys/pitch centers are located halfway between consecutive peaks
            // x_valley = x_peak + pitch/2 = 0.0228 + k * 0.198 + 0.099
            for (let k = 0; k < numPeaks - 1; k += 2) {
              const x_valley = 0.0228 + k * 0.198 + 0.099;
              if (x_valley > sheetW) break;
              const px = sheetStart + sheetW - x_valley;
              if (px >= -w/2 && px <= w/2) {
                wallXPXValues.push(px);
              }
            }
          } else {
            const wavePitch = 0.076;
            const maxWaves = Math.floor(sheetW / wavePitch);
            // Valleys for standard corrugated sheet are at (k + 1.5) * wavePitch
            for (let k = 0; k < maxWaves; k += 4) {
              const x_valley = (k + 1.5) * wavePitch;
              if (x_valley > sheetW) break;
              const px = sheetStart + sheetW - x_valley;
              if (px >= -w/2 && px <= w/2) {
                wallXPXValues.push(px);
              }
            }
          }
        }

        for (const px of wallXPXValues) {
          const roofYFront = (specs.roofType === 'Single Slope') ? h + (px - (-w/2)) * Math.tan(roofAngle) : (px < 0 ? h + (px - (-w/2)) * Math.tan(roofAngle) : h + (w/2 - px) * Math.tan(roofAngle));
          
          if (py <= roofYFront) {
            // Front Wall Skip
            const inFrontGate = isFrontGate && py <= gateH && px >= -gateW/2 && px <= gateW/2;
            if (!inFrontGate) {
              sdElements.push(
                <mesh receiveShadow key={`sd_F_${py}_${px}`} position={[px, py, -wallOffset]}>
                  <primitive object={sdGeoF} />
                  {sdMat}
                </mesh>
              );
            }
            
            // Back Wall Skip
            const inBackGate = isBackGate && py <= gateH && px >= -gateW/2 && px <= gateW/2;
            if (!inBackGate) {
              sdElements.push(
                <mesh receiveShadow key={`sd_B_${py}_${px}`} position={[px, py, l + wallOffset]}>
                  <primitive object={sdGeoF} />
                  {sdMat}
                </mesh>
              );
            }
          }
        }
      }
    }


    
    ancillaryElements.push(<group key="sd_screws_group">{sdElements}</group>);
  }

  return (
    <group position={[0, 0, -l / 2]}>
      
      {/* Foundation & Subsurface Visualization */}
      {(() => {
        const fDepth = Math.max(0.6, Math.round(h * 0.2 * 10) / 10) + 0.3;
        return (
          <group position={[0, -0.05, l / 2]}>
            
            {specs.hasPrimarySteel !== false && (
              <group position={[0, 0, -l / 2]}>
                {Array.from({ length: Math.ceil(l / 6) + 1 }).map((_, i) => {
                  let z = (i / Math.ceil(l / 6)) * l;
                  if (i === 0) z = 0.35;
                  else if (i === Math.ceil(l / 6)) z = l - 0.35;
                  return (
                    <React.Fragment key={'foundation_pit_' + i}>
                      <mesh position={[-w / 2 + 0.35, -(fDepth - 0.3) / 2, z]}>
                        <boxGeometry args={[0.6, fDepth - 0.3, 0.6]} />
                        <meshStandardMaterial color="#94a3b8" roughness={0.9} transparent opacity={0.6} />
                      </mesh>
                      <mesh position={[-w / 2 + 0.35, -(fDepth - 0.3) - 0.3 / 2, z]}>
                        <boxGeometry args={[1.2, 0.3, 1.2]} />
                        <meshStandardMaterial color="#64748b" roughness={0.9} transparent opacity={0.8} />
                      </mesh>
                      
                      <mesh position={[w / 2 - 0.35, -(fDepth - 0.3) / 2, z]}>
                        <boxGeometry args={[0.6, fDepth - 0.3, 0.6]} />
                        <meshStandardMaterial color="#94a3b8" roughness={0.9} transparent opacity={0.6} />
                      </mesh>
                      <mesh position={[w / 2 - 0.35, -(fDepth - 0.3) - 0.3 / 2, z]}>
                        <boxGeometry args={[1.2, 0.3, 1.2]} />
                        <meshStandardMaterial color="#64748b" roughness={0.9} transparent opacity={0.8} />
                      </mesh>
                      
                      {specs.frameType === 'Multi-Span' && !(i === 0 && specs.hasProfileGate !== false && (!specs.profileGatePosition || specs.profileGatePosition === 'Front')) && !(i === Math.ceil(l / 6) && specs.hasProfileGate !== false && specs.profileGatePosition === 'Back') && (
                        <>
                          <mesh position={[0, -(fDepth - 0.3) / 2, z]}>
                            <boxGeometry args={[0.6, fDepth - 0.3, 0.6]} />
                            <meshStandardMaterial color="#94a3b8" roughness={0.9} transparent opacity={0.6} />
                          </mesh>
                          <mesh position={[0, -(fDepth - 0.3) - 0.3 / 2, z]}>
                            <boxGeometry args={[1.2, 0.3, 1.2]} />
                            <meshStandardMaterial color="#64748b" roughness={0.9} transparent opacity={0.8} />
                          </mesh>
                        </>
                      )}
                    </React.Fragment>
                  );
                })}
              </group>
            )}
          </group>
        );
      })()}\n\n      {/* Wall Sheets */}

      {!framingOnly && renderWallSheets()}

      {/* Roof Panels */}
      {!framingOnly && specs.hasRoof !== false && roofPanels}
      
      {/* Structural Elements */}
      {structuralElements}

      {/* Ancillary Elements */}
      {!framingOnly && ancillaryElements}
    </group>
  );
}

function UpdateBounds({ specs }: { specs: ProjectSpecs }) {
  const bounds = useBounds();
  useEffect(() => {
    // Only fit when dimensions or primary structural changes occur
    bounds.refresh().clip().fit();
  }, [specs.width, specs.length, specs.eaveHeight, specs.roofSlope, specs.roofType, bounds]);
  
  return null;
}

function Building3DVisualizer({ specs, dimensionUnit, panelColors, setPanelColors, framingOnly = false, weatherType = 'clear' }: { specs: ProjectSpecs, dimensionUnit: 'm' | 'ft', panelColors: Record<string, string>, setPanelColors: React.Dispatch<React.SetStateAction<Record<string, string>>>, framingOnly?: boolean, weatherType?: string }) {
  const [isInside, setIsInside] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    rainSynthesizer.setInside(isInside);
  }, [isInside]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleShare = async () => {
    if (!containerRef.current) return;
    const canvas = containerRef.current.querySelector('canvas');
    if (!canvas) return;
    
    try {
      // Create a new canvas to draw the WebGL canvas and add the watermark
      const watermarkedCanvas = document.createElement('canvas');
      watermarkedCanvas.width = canvas.width;
      watermarkedCanvas.height = canvas.height;
      const ctx = watermarkedCanvas.getContext('2d');
      if (!ctx) return;
      
      // Draw the original WebGL canvas
      ctx.drawImage(canvas, 0, 0);
      
      // Add watermark
      ctx.font = '24px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      const text = 'UPEB by M.G. INDUSTRIES 9752556113';
      const textWidth = ctx.measureText(text).width;
      
      // Add a slight shadow/stroke for visibility on light/dark backgrounds
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 3;
      ctx.strokeText(text, watermarkedCanvas.width - textWidth - 20, watermarkedCanvas.height - 20);
      ctx.fillText(text, watermarkedCanvas.width - textWidth - 20, watermarkedCanvas.height - 20);
      
      const dataUrl = watermarkedCanvas.toDataURL('image/png');
      
      // If Web Share API with files is supported
      if (navigator.canShare && navigator.canShare({ files: [new File([], '')] })) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'structure-visualization.png', { type: 'image/png' });
        await navigator.share({
          title: 'Structure Visualization',
          text: 'Here is the 3D visualization of the proposed structure.',
          files: [file]
        });
      } else {
        // Fallback to downloading the image
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'structure-visualization.png';
        a.click();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && !err.message?.includes('Share canceled')) {
        console.error('Error sharing visualization:', err);
      }
    }
  };

  return (
    <div ref={containerRef} className={isFullscreen ? "fixed inset-0 z-50 bg-slate-50 flex flex-col cursor-grab active:cursor-grabbing" : "relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] min-h-[400px] max-h-[800px] bg-slate-50 cursor-grab active:cursor-grabbing"}>
      <div className="absolute top-4 inset-x-4 z-10 flex flex-wrap justify-between gap-2 pointer-events-none">
        <div className="flex bg-white/80 backdrop-blur-sm shadow-sm rounded-lg p-1 border border-slate-200 pointer-events-auto">
          <button
            onClick={() => setIsInside(false)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${!isInside ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Outside
          </button>
          <button
            onClick={() => setIsInside(true)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${isInside ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Inside
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 pointer-events-auto">
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 text-xs font-medium rounded-md shadow-sm hover:bg-white hover:text-slate-900 transition-colors"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Full Screen' : 'Fit to Screen'}</span>
          </button>
          <button
            onClick={() => setPanelColors({})}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 text-xs font-medium rounded-md shadow-sm hover:bg-white hover:text-slate-900 transition-colors"
          >
            <Paintbrush className="w-3.5 h-3.5" />
            Reset Colors
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 text-xs font-medium rounded-md shadow-sm hover:bg-white hover:text-slate-900 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share View
          </button>
        </div>
      </div>

      <Canvas id="peb-3d-canvas" shadows gl={{ preserveDrawingBuffer: true }} camera={{ position: [specs.width * 1.5, specs.eaveHeight * 2, specs.length * 1.5], fov: 45 }}>
        <CameraManager isInside={isInside} specs={specs} />
        <ambientLight intensity={weatherType === 'storm' ? 0.3 : (weatherType === 'rain' ? 0.5 : (isInside ? 0.8 : 0.7))} />
        {isInside && <pointLight position={[0, specs.eaveHeight / 2, specs.length / 2]} intensity={2.0} distance={Math.max(specs.width, specs.length) * 2} decay={1.5} />}
        <directionalLight position={[20, 30, 20]} intensity={weatherType === 'storm' ? 0.4 : (weatherType === 'rain' ? 0.6 : 1.2)} castShadow shadow-bias={-0.0005} shadow-mapSize={[2048, 2048]}>
          <orthographicCamera attach="shadow-camera" args={[-Math.max(specs.width, specs.length, 20), Math.max(specs.width, specs.length, 20), Math.max(specs.width, specs.length, 20), -Math.max(specs.width, specs.length, 20), 0.1, 100]} />
        </directionalLight>
        <directionalLight position={[-10, 10, -10]} intensity={weatherType === 'storm' ? 0.2 : (weatherType === 'rain' ? 0.3 : 0.5)} />
        <Environment preset={weatherType === 'storm' || weatherType === 'rain' ? "night" : "city"} environmentIntensity={weatherType === 'storm' ? 0.3 : (weatherType === 'rain' ? 0.5 : 1.0)} />

        {weatherType === 'storm' && <LightningController />}
        <WeatherEffects weatherType={weatherType} specs={specs} />
        {!isInside && <ForceVectorArrows weatherType={weatherType} specs={specs} />}

        {!isInside ? (
          <Bounds margin={1.2}>
            <UpdateBounds specs={specs} />
            <Building3DModel specs={specs} panelColors={panelColors} setPanelColors={setPanelColors} framingOnly={framingOnly} weatherType={weatherType} />
          </Bounds>
        ) : (
          <Building3DModel specs={specs} panelColors={panelColors} setPanelColors={setPanelColors} framingOnly={framingOnly} weatherType={weatherType} />
        )}

        {/* Precision Guidelines / Dimensions */}
        {!isInside && (
          <group>
            {/* Width Dimension */}
            <DreiLine points={[[-specs.width / 2, 0.1, specs.length / 2 + 1], [specs.width / 2, 0.1, specs.length / 2 + 1]]} color="#3b82f6" lineWidth={2} />
            <DreiLine points={[[-specs.width / 2, 0.1, specs.length / 2 + 0.5], [-specs.width / 2, 0.1, specs.length / 2 + 1.5]]} color="#3b82f6" lineWidth={2} />
            <DreiLine points={[[specs.width / 2, 0.1, specs.length / 2 + 0.5], [specs.width / 2, 0.1, specs.length / 2 + 1.5]]} color="#3b82f6" lineWidth={2} />
            <Text position={[0, 0.1, specs.length / 2 + 1.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={Math.max(1, specs.width * 0.05)} color="#1e293b" anchorX="center" anchorY="top">
              {dimensionUnit === 'ft' ? (specs.width * 3.28084).toFixed(2) : specs.width}{dimensionUnit === 'ft' ? 'ft' : 'm'} Width
            </Text>

            {/* Length Dimension */}
            <DreiLine points={[[specs.width / 2 + 1, 0.1, specs.length / 2], [specs.width / 2 + 1, 0.1, -specs.length / 2]]} color="#3b82f6" lineWidth={2} />
            <DreiLine points={[[specs.width / 2 + 0.5, 0.1, specs.length / 2], [specs.width / 2 + 1.5, 0.1, specs.length / 2]]} color="#3b82f6" lineWidth={2} />
            <DreiLine points={[[specs.width / 2 + 0.5, 0.1, -specs.length / 2], [specs.width / 2 + 1.5, 0.1, -specs.length / 2]]} color="#3b82f6" lineWidth={2} />
            <Text position={[specs.width / 2 + 1.5, 0.1, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} fontSize={Math.max(1, Math.min(specs.length * 0.05, 3))} color="#1e293b" anchorX="center" anchorY="bottom">
              {dimensionUnit === 'ft' ? (specs.length * 3.28084).toFixed(2) : specs.length}{dimensionUnit === 'ft' ? 'ft' : 'm'} Length
            </Text>

            {/* Eave Height Dimension */}
            <DreiLine points={[[-specs.width / 2 - 1, 0, specs.length / 2], [-specs.width / 2 - 1, specs.eaveHeight, specs.length / 2]]} color="#3b82f6" lineWidth={2} />
            <DreiLine points={[[-specs.width / 2 - 1.5, 0, specs.length / 2], [-specs.width / 2 - 0.5, 0, specs.length / 2]]} color="#3b82f6" lineWidth={2} />
            <DreiLine points={[[-specs.width / 2 - 1.5, specs.eaveHeight, specs.length / 2], [-specs.width / 2 - 0.5, specs.eaveHeight, specs.length / 2]]} color="#3b82f6" lineWidth={2} />
            <Text position={[-specs.width / 2 - 1.5, specs.eaveHeight / 2, specs.length / 2]} rotation={[0, -Math.PI / 2, 0]} fontSize={Math.max(1, Math.min(specs.eaveHeight * 0.15, 3))} color="#1e293b" anchorX="center" anchorY="bottom">
              {dimensionUnit === 'ft' ? (specs.eaveHeight * 3.28084).toFixed(2) : specs.eaveHeight}{dimensionUnit === 'ft' ? 'ft' : 'm'} Height
            </Text>
          </group>
        )}

        {!isInside && <ContactShadows position={[0, -0.1, 0]} opacity={0.4} scale={Math.max(specs.width, specs.length) * 3} blur={2} far={10} />}
        <OrbitControls makeDefault enableZoom={true} enablePan={true} minPolarAngle={0} maxPolarAngle={isInside ? Math.PI : Math.PI / 2 - 0.05} target={[0, specs.eaveHeight / 2, 0]} />
      </Canvas>
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none opacity-50 bg-white/30 px-2 py-1 rounded backdrop-blur-sm">
        <p className="text-xs font-semibold text-slate-800">UPEB by M.G. INDUSTRIES<br/>9752556113</p>
      </div>
    </div>
  );
}

function TrussForceAnalyzer({ specs, dimensionUnit }: { specs: ProjectSpecs; dimensionUnit: string }) {
  const [pointLoad, setPointLoad] = useState<number>(50); // in kN
  const [selectedMember, setSelectedMember] = useState<string>('top_chord');

  const width = specs.width;
  const slopePercent = specs.roofSlope;
  const roofH = (width / 2) * (slopePercent / 100);
  const theta = Math.atan(roofH / (width / 2)); // angle in radians
  const thetaDeg = (theta * 180) / Math.PI;

  // Calculatings
  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);
  const tanTheta = Math.tan(theta);

  // Top Chord Compression force (kN)
  // C = P / (2 * sin(theta))
  const topChordForce = sinTheta > 0 ? -pointLoad / (2 * sinTheta) : 0;

  // Bottom Chord Tension force (kN)
  // T = P / (2 * tan(theta))
  const bottomChordForce = tanTheta > 0 ? pointLoad / (2 * tanTheta) : 0;

  // King Post Force
  const kingPostForce = pointLoad * 0.5;

  // Diagonal Struts force
  const diagonalForce = sinTheta > 0 ? -pointLoad * 0.35 / sinTheta : 0;

  const memberData: { [key: string]: { name: string; type: 'Compression' | 'Tension' | 'Mixed'; force: number; description: string; formula: string } } = {
    top_chord: {
      name: "Top Chord (Rafters)",
      type: "Compression",
      force: topChordForce,
      formula: "-P / (2 * sin(θ))",
      description: "Carries the major compressive loads directed downwards along the roof slope. Channels forces from the peak and intermediate purlins directly into the heels/bearing points.",
    },
    bottom_chord: {
      name: "Bottom Chord (Tie Runner)",
      type: "Tension",
      force: bottomChordForce,
      formula: "P / (2 * tan(θ))",
      description: "Acts as a primary tension tie, preventing the outward thrust of the sloping rafters. Keeps the vertical support columns from bowing outward.",
    },
    king_post: {
      name: "King Post (Central Strut)",
      type: "Tension",
      force: kingPostForce,
      formula: "P * 0.5",
      description: "A vertical member supporting the center of the bottom chord, preventing it from sagging under its own weight or carrying suspended loads.",
    },
    diagonals: {
      name: "Web Diagonals (Struts)",
      type: "Compression",
      force: diagonalForce,
      formula: "-0.35 * P / sin(θ)",
      description: "Triangular brace elements transferring intermediate shear forces between the top and bottom chords, preventing rafter bending.",
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-4 gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500 animate-pulse" />
            Truss Axial Forces & Stress Analyzer
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Visualizing tensile and compressive forces distributed through triangular structural units (Howe / Fink truss design).
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg text-indigo-700 text-xs font-semibold">
          Roof Pitch: {thetaDeg.toFixed(1)}° ({slopePercent}% slope)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Truss stress visualization SVG */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-50 rounded-xl p-4 border border-slate-100 relative min-h-[220px]">
          <span className="absolute top-3 left-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stress Diagram</span>
          
          <svg viewBox="0 0 400 180" className="w-full max-h-52">
            {/* Legend inside SVG */}
            <g transform="translate(15, 15)">
              <rect x="0" y="0" width="10" height="4" fill="#ef4444" />
              <text x="14" y="5" fontSize="8" className="fill-slate-500 font-medium">Compression (Red)</text>
              <rect x="0" y="10" width="10" height="4" fill="#3b82f6" />
              <text x="14" y="15" fontSize="8" className="fill-slate-500 font-medium">Tension (Blue)</text>
            </g>

            {/* Support Columns */}
            <line x1="50" y1="130" x2="50" y2="160" stroke="#94a3b8" strokeWidth="4" />
            <line x1="350" y1="130" x2="350" y2="160" stroke="#94a3b8" strokeWidth="4" />

            {/* Truss Bottom Chord */}
            <line 
              x1="50" y1="130" x2="350" y2="130" 
              className="cursor-pointer transition-all hover:stroke-indigo-600" 
              stroke={selectedMember === 'bottom_chord' ? '#4f46e5' : '#3b82f6'} 
              strokeWidth={selectedMember === 'bottom_chord' ? '5' : '3.5'} 
              onClick={() => setSelectedMember('bottom_chord')}
            />

            {/* Left Top Chord */}
            <line 
              x1="50" y1="130" x2="200" y2="50" 
              className="cursor-pointer transition-all hover:stroke-indigo-600" 
              stroke={selectedMember === 'top_chord' ? '#4f46e5' : '#ef4444'} 
              strokeWidth={selectedMember === 'top_chord' ? '5' : '3.5'} 
              onClick={() => setSelectedMember('top_chord')}
            />

            {/* Right Top Chord */}
            <line 
              x1="200" y1="50" x2="350" y2="130" 
              className="cursor-pointer transition-all hover:stroke-indigo-600" 
              stroke={selectedMember === 'top_chord' ? '#4f46e5' : '#ef4444'} 
              strokeWidth={selectedMember === 'top_chord' ? '5' : '3.5'} 
              onClick={() => setSelectedMember('top_chord')}
            />

            {/* King Post (vertical center) */}
            <line 
              x1="200" y1="130" x2="200" y2="50" 
              className="cursor-pointer transition-all hover:stroke-indigo-600" 
              stroke={selectedMember === 'king_post' ? '#4f46e5' : '#3b82f6'} 
              strokeWidth={selectedMember === 'king_post' ? '4' : '2.5'} 
              onClick={() => setSelectedMember('king_post')}
            />

            {/* Left Diagonals */}
            <line 
              x1="125" y1="130" x2="200" y2="50" 
              className="cursor-pointer transition-all hover:stroke-indigo-600" 
              stroke={selectedMember === 'diagonals' ? '#4f46e5' : '#ef4444'} 
              strokeWidth={selectedMember === 'diagonals' ? '3.5' : '2'} 
              onClick={() => setSelectedMember('diagonals')}
            />
            <line 
              x1="125" y1="130" x2="125" y2="90" 
              className="cursor-pointer transition-all hover:stroke-indigo-600" 
              stroke={selectedMember === 'diagonals' ? '#4f46e5' : '#ef4444'} 
              strokeWidth={selectedMember === 'diagonals' ? '3.5' : '2'} 
              onClick={() => setSelectedMember('diagonals')}
            />

            {/* Right Diagonals */}
            <line 
              x1="275" y1="130" x2="200" y2="50" 
              className="cursor-pointer transition-all hover:stroke-indigo-600" 
              stroke={selectedMember === 'diagonals' ? '#4f46e5' : '#ef4444'} 
              strokeWidth={selectedMember === 'diagonals' ? '3.5' : '2'} 
              onClick={() => setSelectedMember('diagonals')}
            />
            <line 
              x1="275" y1="130" x2="275" y2="90" 
              className="cursor-pointer transition-all hover:stroke-indigo-600" 
              stroke={selectedMember === 'diagonals' ? '#4f46e5' : '#ef4444'} 
              strokeWidth={selectedMember === 'diagonals' ? '3.5' : '2'} 
              onClick={() => setSelectedMember('diagonals')}
            />

            {/* Peak Applied Load Arrow */}
            <line x1="200" y1="15" x2="200" y2="40" stroke="#dc2626" strokeWidth="2.5" />
            <polygon points="196,40 204,40 200,46" fill="#dc2626" />
            <text x="210" y="30" fill="#dc2626" fontSize="10" fontWeight="bold">P = {pointLoad} kN</text>

            {/* Reactions */}
            <polygon points="46,160 54,160 50,154" fill="#16a34a" />
            <text x="35" y="172" fill="#16a34a" fontSize="8" fontWeight="bold">R = {(pointLoad / 2).toFixed(1)} kN</text>
            <polygon points="346,160 354,160 350,154" fill="#16a34a" />
            <text x="335" y="172" fill="#16a34a" fontSize="8" fontWeight="bold">R = {(pointLoad / 2).toFixed(1)} kN</text>

            {/* Node markers */}
            <circle cx="50" cy="130" r="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
            <circle cx="350" cy="130" r="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
            <circle cx="200" cy="50" r="3.5" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
            <circle cx="200" cy="130" r="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
            <circle cx="125" cy="130" r="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
            <circle cx="275" cy="130" r="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />

            {/* Text labels on diagram matching user upload */}
            <text x="200" y="145" fill="#475569" fontSize="8" textAnchor="middle" fontWeight="bold">Bottom Chord</text>
            <text x="95" y="80" fill="#475569" fontSize="8" textAnchor="middle" fontWeight="bold" transform="rotate(-28, 95, 80)">Top Chord</text>
            <text x="305" y="80" fill="#475569" fontSize="8" textAnchor="middle" fontWeight="bold" transform="rotate(28, 305, 80)">Top Chord</text>
            <text x="175" y="105" fill="#475569" fontSize="7" textAnchor="end">King Post</text>
            <text x="50" y="122" fill="#475569" fontSize="7" textAnchor="middle" fontWeight="bold">Heel</text>
            <text x="350" y="122" fill="#475569" fontSize="7" textAnchor="middle" fontWeight="bold">Heel</text>
            <text x="200" y="62" fill="#475569" fontSize="7" textAnchor="middle" fontWeight="bold">Peak</text>
          </svg>

          <p className="text-[10px] text-slate-400 mt-2 text-center">
            💡 Click on any truss member above to view its axial stress, formulas, and structural behavior.
          </p>
        </div>

        {/* Applied load slider & member description */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
              Peak Point Load (P): <span className="font-mono text-indigo-600 text-sm">{pointLoad} kN</span>
            </label>
            <input 
              type="range" 
              min="10" 
              max="200" 
              step="5" 
              value={pointLoad} 
              onChange={(e) => setPointLoad(Number(e.target.value))} 
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>10 kN (Light load)</span>
              <span>200 kN (High load)</span>
            </div>
          </div>

          {/* Selected Member Detail Card */}
          <div className="border border-indigo-100 rounded-xl bg-indigo-50/40 p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Active Element Details</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                memberData[selectedMember].type === 'Compression' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {memberData[selectedMember].type}
              </span>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-800 text-base">{memberData[selectedMember].name}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {memberData[selectedMember].description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1 pt-3 border-t border-indigo-100/60">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Formula (Longitudinal)</span>
                <code className="text-xs font-mono font-bold text-indigo-600">{memberData[selectedMember].formula}</code>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Calculated Stress Force</span>
                <span className={`text-sm font-bold font-mono ${
                  memberData[selectedMember].type === 'Compression' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {memberData[selectedMember].force.toFixed(1)} kN
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Anatomy checklist representing the user uploaded diagram */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 mt-0.5 flex-shrink-0">1</div>
          <div>
            <h5 className="font-bold text-xs text-slate-800">Heel (Support Pivot)</h5>
            <p className="text-[10px] text-slate-500 mt-0.5">The point where the top and bottom chords meet directly above the support column.</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 mt-0.5 flex-shrink-0">2</div>
          <div>
            <h5 className="font-bold text-xs text-slate-800">Truss Plates (Joint Connectors)</h5>
            <p className="text-[10px] text-slate-500 mt-0.5">Serrated galvanized steel plates pressed into timber/steel joints to transfer stress lines.</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 mt-0.5 flex-shrink-0">3</div>
          <div>
            <h5 className="font-bold text-xs text-slate-800">Panel Points</h5>
            <p className="text-[10px] text-slate-500 mt-0.5">Points where web struts intersect chords, forming structural hinge points.</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 mt-0.5 flex-shrink-0">4</div>
          <div>
            <h5 className="font-bold text-xs text-slate-800">Longitudinal Chords</h5>
            <p className="text-[10px] text-slate-500 mt-0.5">Elements along the outer boundaries (top/bottom) resisting global bending moment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuildingVisualizer({ specs, dimensionUnit, view = 'front' }: { specs: ProjectSpecs, dimensionUnit: 'm' | 'ft', view?: 'front' | 'side' | 'top' }) {
  const svgRef = useRef<SVGSVGElement>(null);

  const handleShare = async () => {
    if (!svgRef.current) return;
    try {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const file = new File([blob], `structure-visualization-${view}.svg`, { type: 'image/svg+xml' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Structure Visualization (${view.toUpperCase()})`,
          text: `Here is the ${view} elevation SVG visualization of the proposed structure.`,
          files: [file]
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `structure-visualization-${view}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && !err.message?.includes('Share canceled')) {
        console.error('Error sharing SVG visualization:', err);
      }
    }
  };

  if (view === 'side') {
    const lVal = Math.max(specs.length, 1);
    const maxW = Math.max(lVal, 10);
    const maxH = Math.max(specs.eaveHeight + (specs.width / 2) * (specs.roofSlope / 100) + 1, 5);

    const paddingX = 85;
    const paddingY = 60;
    const canvasW = 800;
    const canvasH = 400;

    const scaleX = (canvasW - 2 * paddingX) / maxW;
    const scaleY = (canvasH - 2 * paddingY) / maxH;
    const scale = Math.min(scaleX, scaleY);

    const drawL = lVal * scale;
    const drawEave = specs.eaveHeight * scale;

    const isSingle = specs.roofType === 'Single Slope';
    const isMulti = specs.roofType === 'Multi-Sloped Hut';
    const isCurved = specs.roofType === 'Curved';

    const h_steep = (specs.width / 4) * (specs.roofSlope * 1.5 / 100);
    const h_shallow = (specs.width / 4) * (specs.roofSlope * 0.5 / 100);
    const h_curved = (specs.width / 2) * (specs.roofSlope / 100) * 1.5;

    const totalRoofH = isSingle ? specs.width * (specs.roofSlope / 100) : (isMulti ? h_steep + h_shallow : (isCurved ? h_curved : (specs.width / 2) * (specs.roofSlope / 100)));
    const ridgeHeight = specs.eaveHeight + totalRoofH;

    const drawRidge = ridgeHeight * scale;

    const centerX = canvasW / 2;
    const groundY = canvasH - paddingY;

    const startX = centerX - drawL / 2;
    const endX = centerX + drawL / 2;

    const baySpacing = 6;
    const numFrames = Math.ceil(lVal / baySpacing) + 1;
    const fDepth = Math.max(0.6, Math.round(specs.eaveHeight * 0.2 * 10) / 10);
    const fDepthPx = fDepth * scale;

    const columns = [];
    for (let i = 0; i < numFrames; i++) {
      let frameZ = (i / (numFrames - 1)) * lVal;
      if (i === 0) frameZ = 0.35;
      else if (i === numFrames - 1) frameZ = lVal - 0.35;
      
      const colX = startX + frameZ * scale;
      columns.push(
        <g key={`side_col_${i}`}>
          {/* Foundation Pit */}
          {specs.hasPrimarySteel !== false && (
            <>
              <rect x={colX - 8} y={groundY} width="16" height={fDepthPx} fill="#94a3b8" opacity="0.6" />
              <rect x={colX - 14} y={groundY + fDepthPx} width="28" height={0.3 * scale} fill="#64748b" opacity="0.8" />
            </>
          )}
          {/* Column */}
          {specs.hasPrimarySteel !== false && (
            <rect x={colX - 4} y={groundY - drawEave} width="8" height={drawEave} fill="#1e293b" stroke="#334155" strokeWidth="1" />
          )}
          {/* Bay dimension line below (between columns) */}
          {i < numFrames - 1 && (
            <g>
              <line x1={colX} y1={groundY + 15} x2={startX + ((i + 1) / (numFrames - 1)) * lVal * scale} y2={groundY + 15} stroke="#94a3b8" strokeWidth="0.5" />
              <text x={colX + (lVal / (numFrames - 1)) * scale / 2} y={groundY + 28} fill="#94a3b8" fontSize="10" textAnchor="middle">
                {dimensionUnit === 'ft' ? (6 * 3.28084).toFixed(1) : '6.0'}{dimensionUnit === 'ft' ? 'ft' : 'm'}
              </text>
            </g>
          )}
        </g>
      );
    }

    // Horizontal girts
    const girts = [];
    if (specs.hasGirts !== false) {
      const girtRuns = Math.max(1, Math.floor(specs.eaveHeight / 1.5));
      for (let j = 0; j < girtRuns; j++) {
        const gy = groundY - (j + 1) * 1.5 * scale;
        girts.push(
          <line key={`side_girt_${j}`} x1={startX} y1={gy} x2={endX} y2={gy} stroke="#475569" strokeWidth="1.5" strokeDasharray="4 2" />
        );
      }
    }

    return (
      <div id="peb-side-container" className="w-full relative flex items-center justify-center p-6 bg-white h-[40vh] md:h-[50vh] min-h-[300px] max-h-[600px]">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-md shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share SVG
          </button>
        </div>
        <svg id="peb-side-svg" ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${canvasW} ${canvasH}`} className="max-h-72 w-full drop-shadow-sm bg-white" xmlns="http://www.w3.org/2000/svg">
          {/* Ground */}
          <line x1={0} y1={groundY} x2={canvasW} y2={groundY} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 4" />
          
          {/* Wall Sheeting / Side Frame outline */}
          {specs.hasWalls !== false ? (
            <rect x={startX} y={groundY - drawEave} width={drawL} height={drawEave} fill={specs.wallColor || '#f8fafc'} opacity="0.8" stroke="#334155" strokeWidth="2" />
          ) : (
            <rect x={startX} y={groundY - drawEave} width={drawL} height={drawEave} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
          )}

          {/* Render columns and foundations */}
          {columns}

          {/* Render girts */}
          {girts}

          {/* Roof Profile Outline seen from the side */}
          {specs.hasRoof !== false && (
            <g>
              {isSingle ? (
                // Slanted side roof line representation
                <line x1={startX - 10} y1={groundY - drawEave - 3} x2={endX + 10} y2={groundY - drawRidge - 3} stroke={specs.roofColor || '#0ea5e9'} strokeWidth="5" strokeLinecap="round" />
              ) : (
                // Standard gable roof seen from side: eave line and ridge line
                <>
                  {/* Roof ridge cap line */}
                  <line x1={startX - 10} y1={groundY - drawRidge} x2={endX + 10} y2={groundY - drawRidge} stroke={specs.roofColor || '#0ea5e9'} strokeWidth="3" strokeDasharray="3 3" opacity="0.5" />
                  {/* Outer roof boundary projection */}
                  <rect x={startX - 5} y={groundY - drawRidge} width={drawL + 10} height={drawRidge - drawEave} fill="rgba(14, 165, 233, 0.04)" stroke="none" />
                  {/* Roof eave sheet line */}
                  <line x1={startX - 10} y1={groundY - drawEave - 3} x2={endX + 10} y2={groundY - drawEave - 3} stroke={specs.roofColor || '#0ea5e9'} strokeWidth="5" strokeLinecap="round" />
                  {/* Hatch lines to show slanted roof slope facet */}
                  <line x1={startX} y1={groundY - drawEave} x2={startX} y2={groundY - drawRidge} stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />
                  <line x1={endX} y1={groundY - drawEave} x2={endX} y2={groundY - drawRidge} stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />
                </>
              )}
            </g>
          )}

          {/* Overall Dimensions */}
          {/* Length */}
          <text x={centerX} y={groundY + 45} fill="#1e293b" fontSize="14" textAnchor="middle" fontWeight="600">Total Length: {dimensionUnit === 'ft' ? (specs.length * 3.28084).toFixed(2) : specs.length}{dimensionUnit === 'ft' ? 'ft' : 'm'}</text>
          <line x1={startX} y1={groundY + 35} x2={endX} y2={groundY + 35} stroke="#1e293b" strokeWidth="1" />
          <line x1={startX} y1={groundY + 30} x2={startX} y2={groundY + 40} stroke="#1e293b" strokeWidth="1" />
          <line x1={endX} y1={groundY + 30} x2={endX} y2={groundY + 40} stroke="#1e293b" strokeWidth="1" />

          {/* Height */}
          <text x={startX - 20} y={groundY - drawEave / 2} fill="#1e293b" fontSize="14" textAnchor="end" dominantBaseline="middle" fontWeight="600">Eave Height: {dimensionUnit === 'ft' ? (specs.eaveHeight * 3.28084).toFixed(2) : specs.eaveHeight}{dimensionUnit === 'ft' ? 'ft' : 'm'}</text>
          <line x1={startX - 12} y1={groundY} x2={startX - 12} y2={groundY - drawEave} stroke="#1e293b" strokeWidth="1" />
          <line x1={startX - 17} y1={groundY} x2={startX - 7} y2={groundY} stroke="#1e293b" strokeWidth="1" />
          <line x1={startX - 17} y1={groundY - drawEave} x2={startX - 7} y2={groundY - drawEave} stroke="#1e293b" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  if (view === 'top') {
    const lVal = Math.max(specs.length, 1);
    const wVal = Math.max(specs.width, 1);
    const maxW = Math.max(lVal, 10);
    const maxH = Math.max(wVal, 10);

    const paddingX = 85;
    const paddingY = 60;
    const canvasW = 800;
    const canvasH = 400;

    const scaleX = (canvasW - 2 * paddingX) / maxW;
    const scaleY = (canvasH - 2 * paddingY) / maxH;
    const scale = Math.min(scaleX, scaleY);

    const drawL = lVal * scale;
    const drawW = wVal * scale;

    const centerX = canvasW / 2;
    const centerY = canvasH / 2;

    const startX = centerX - drawL / 2;
    const endX = centerX + drawL / 2;
    const startY = centerY - drawW / 2;
    const endY = centerY + drawW / 2;

    const baySpacing = 6;
    const numFrames = Math.ceil(lVal / baySpacing) + 1;

    const isSingle = specs.roofType === 'Single Slope';
    const isMulti = specs.roofType === 'Multi-Sloped Hut';
    const purlinSpacing = specs.highWindVelocity || specs.snowLoad ? 1.0 : 1.5;

    const frameLines = [];
    const purlinLines = [];

    // Columns and Main Rafter Frame lines
    for (let i = 0; i < numFrames; i++) {
      let frameZ = (i / (numFrames - 1)) * lVal;
      if (i === 0) frameZ = 0.35;
      else if (i === numFrames - 1) frameZ = lVal - 0.35;

      const frameX = startX + frameZ * scale;
      frameLines.push(
        <g key={`top_frame_${i}`}>
          {/* Main Rafter Frame Line */}
          <line x1={frameX} y1={startY} x2={frameX} y2={endY} stroke="#1e293b" strokeWidth="2.5" />
          
          {/* Column Footing Boxes on ends */}
          <rect x={frameX - 4} y={startY - 4} width="8" height="8" fill="#10b981" rx="1" />
          <rect x={frameX - 4} y={endY - 4} width="8" height="8" fill="#10b981" rx="1" />
          
          {/* Inner multi-span column */}
          {specs.frameType === 'Multi-Span' && (
            <circle cx={frameX} cy={centerY} r="4" fill="#ef4444" />
          )}

          {/* Dimension Line below */}
          {i < numFrames - 1 && (
            <g>
              <line x1={frameX} y1={endY + 15} x2={startX + ((i + 1) / (numFrames - 1)) * lVal * scale} y2={endY + 15} stroke="#94a3b8" strokeWidth="0.5" />
              <text x={frameX + (lVal / (numFrames - 1)) * scale / 2} y={endY + 28} fill="#94a3b8" fontSize="10" textAnchor="middle">
                {dimensionUnit === 'ft' ? (6 * 3.28084).toFixed(1) : '6.0'}{dimensionUnit === 'ft' ? 'ft' : 'm'}
              </text>
            </g>
          )}
        </g>
      );
    }

    // Purlin lines running horizontally across length
    if (specs.hasSecondarySteel !== false) {
      const ps = purlinSpacing * scale;
      const offset = 8; // Inboard offset in pixels

      const drawSlopePurlins = (y1: number, y2: number, slopeSlope: number) => {
        const flatW = Math.abs(y2 - y1);
        const slopedW = flatW * Math.sqrt(1 + Math.pow(slopeSlope / 100, 2));
        const runs = Math.max(1, Math.round(slopedW / ps));
        
        if (flatW > 2 * offset) {
          const startY_p = y1 + offset;
          const endY_p = y2 - offset;
          for (let k = 0; k <= runs; k++) {
            const t = runs > 0 ? k / runs : 0.5;
            const py = startY_p + (endY_p - startY_p) * t;
            purlinLines.push(
              <line key={`top_purlin_${y1}_${k}`} x1={startX} y1={py} x2={endX} y2={py} stroke="#475569" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
            );
          }
        } else {
          for (let k = 0; k <= runs; k++) {
            const py = y1 + (y2 - y1) * (k / (runs || 1));
            purlinLines.push(
              <line key={`top_purlin_${y1}_${k}`} x1={startX} y1={py} x2={endX} y2={py} stroke="#475569" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
            );
          }
        }
      };

      if (isSingle) {
        drawSlopePurlins(startY, endY, specs.roofSlope);
      } else if (isMulti) {
        // Multi-slope has 4 segments
        const quarter1 = startY + drawW / 4;
        const quarter3 = startY + 3 * drawW / 4;
        drawSlopePurlins(startY, quarter1, specs.roofSlope * 1.5);
        drawSlopePurlins(quarter1, centerY, specs.roofSlope * 0.5);
        drawSlopePurlins(centerY, quarter3, specs.roofSlope * 0.5);
        drawSlopePurlins(quarter3, endY, specs.roofSlope * 1.5);
      } else {
        // Standard gable or curved
        drawSlopePurlins(startY, centerY, specs.roofSlope);
        drawSlopePurlins(centerY, endY, specs.roofSlope);
      }
    }

    return (
      <div id="peb-top-container" className="w-full relative flex items-center justify-center p-6 bg-white h-[40vh] md:h-[50vh] min-h-[300px] max-h-[600px]">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-md shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share SVG
          </button>
        </div>
        <svg id="peb-top-svg" ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${canvasW} ${canvasH}`} className="max-h-72 w-full drop-shadow-sm bg-white" xmlns="http://www.w3.org/2000/svg">
          {/* Outline boundary of roof */}
          <rect x={startX - 5} y={startY - 5} width={drawL + 10} height={drawW + 10} fill="none" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="5 3" opacity="0.6" />
          
          {/* Building Slab/Base outline */}
          <rect x={startX} y={startY} width={drawL} height={drawW} fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />

          {/* Purlins */}
          {purlinLines}

          {/* Frames and Column Markers */}
          {frameLines}

          {/* Legends */}
          <g transform={`translate(${startX}, ${startY - 25})`}>
            <rect x="0" y="0" width="8" height="8" fill="#10b981" rx="1" />
            <text x="12" y="8" fontSize="10" fill="#475569" fontWeight="500">Columns (Primary Frame)</text>

            <rect x="150" y="0" width="8" height="8" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="2 2" />
            <text x="162" y="8" fontSize="10" fill="#475569" fontWeight="500">Roof Overhang (Eave Line)</text>

            {specs.frameType === 'Multi-Span' && (
              <>
                <circle cx="310" cy="4" r="3" fill="#ef4444" />
                <text x="318" y="8" fontSize="10" fill="#475569" fontWeight="500">Mid-Span Columns</text>
              </>
            )}
          </g>

          {/* Overall Dimensions */}
          {/* Length (Horizontal) */}
          <text x={centerX} y={endY + 45} fill="#1e293b" fontSize="14" textAnchor="middle" fontWeight="600">Total Length: {dimensionUnit === 'ft' ? (specs.length * 3.28084).toFixed(2) : specs.length}{dimensionUnit === 'ft' ? 'ft' : 'm'}</text>
          <line x1={startX} y1={endY + 35} x2={endX} y2={endY + 35} stroke="#1e293b" strokeWidth="1" />
          <line x1={startX} y1={endY + 30} x2={startX} y2={endY + 40} stroke="#1e293b" strokeWidth="1" />
          <line x1={endX} y1={endY + 30} x2={endX} y2={endY + 40} stroke="#1e293b" strokeWidth="1" />

          {/* Width (Vertical) */}
          <text x={startX - 20} y={centerY} fill="#1e293b" fontSize="14" textAnchor="end" dominantBaseline="middle" fontWeight="600" transform={`rotate(-90, ${startX - 20}, ${centerY})`}>Total Width: {dimensionUnit === 'ft' ? (specs.width * 3.28084).toFixed(2) : specs.width}{dimensionUnit === 'ft' ? 'ft' : 'm'}</text>
          <line x1={startX - 12} y1={startY} x2={startX - 12} y2={endY} stroke="#1e293b" strokeWidth="1" />
          <line x1={startX - 17} y1={startY} x2={startX - 7} y2={startY} stroke="#1e293b" strokeWidth="1" />
          <line x1={startX - 17} y1={endY} x2={startX - 7} y2={endY} stroke="#1e293b" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  const maxW = Math.max(specs.width, 10);
  
  const isSingle = specs.roofType === 'Single Slope';
  const isMulti = specs.roofType === 'Multi-Sloped Hut';
  const isCurved = specs.roofType === 'Curved';

  const h_steep = (specs.width / 4) * (specs.roofSlope * 1.5 / 100);
  const h_shallow = (specs.width / 4) * (specs.roofSlope * 0.5 / 100);
  const h_curved = (specs.width / 2) * (specs.roofSlope / 100) * 1.5;

  const totalRoofH = isSingle ? specs.width * (specs.roofSlope / 100) : (isMulti ? h_steep + h_shallow : (isCurved ? h_curved : (specs.width / 2) * (specs.roofSlope / 100)));
  const ridgeHeight = specs.eaveHeight + totalRoofH;

  const maxH = Math.max(ridgeHeight, 5);

  const paddingX = 80;
  const paddingY = 60;
  const canvasW = 800;
  const canvasH = 400;

  const scaleX = (canvasW - 2 * paddingX) / maxW;
  const scaleY = (canvasH - 2 * paddingY) / maxH;
  const scale = Math.min(scaleX, scaleY);

  const drawW = specs.width * scale;
  const drawEave = specs.eaveHeight * scale;

  const centerX = canvasW / 2;
  const groundY = canvasH - paddingY;

  const pLeftGround = { x: centerX - drawW / 2, y: groundY };
  const pRightGround = { x: centerX + drawW / 2, y: groundY };
  const pLeftEave = { x: pLeftGround.x, y: groundY - drawEave };
  
  // Base configuration points
  let pRightTop = { x: pRightGround.x, y: groundY - drawEave };
  
  let dPath = '';
  let dRoof = '';

  const fmtLen = (lenM: number) => {
    return dimensionUnit === 'ft' 
      ? (lenM * 3.28084).toFixed(1) + ' ft' 
      : lenM.toFixed(1) + ' m';
  };

  const renderDimensionLine = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    offset: number,
    label: string,
    key: string
  ) => {
    if (
      x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined ||
      isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)
    ) {
      return null;
    }

    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0 || isNaN(len)) return null;

    const dirX = dx / len;
    const dirY = dy / len;

    const px = -dirY;
    const py = dirX;

    const ox1 = x1 + px * offset;
    const oy1 = y1 + py * offset;
    const ox2 = x2 + px * offset;
    const oy2 = y2 + py * offset;

    if (isNaN(ox1) || isNaN(oy1) || isNaN(ox2) || isNaN(oy2)) {
      return null;
    }

    const mx = (ox1 + ox2) / 2;
    const my = (oy1 + oy2) / 2;

    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle > 90) angle -= 180;
    if (angle < -90) angle += 180;

    const rectWidth = Math.max(35, label.length * 5.5);

    return (
      <g key={key} className="select-none pointer-events-none">
        {/* Witness / Extension lines */}
        <line x1={x1 + px * 2} y1={y1 + py * 2} x2={ox1 + px * 3} y2={oy1 + py * 3} stroke="#94a3b8" strokeWidth="0.75" strokeDasharray="2 2" />
        <line x1={x2 + px * 2} y1={y2 + py * 2} x2={ox2 + px * 3} y2={oy2 + py * 3} stroke="#94a3b8" strokeWidth="0.75" strokeDasharray="2 2" />

        {/* Dimension line */}
        <line x1={ox1} y1={oy1} x2={ox2} y2={oy2} stroke="#4f46e5" strokeWidth="1" />

        {/* Tick marks (architectural slashes) */}
        <line x1={ox1 - dirX * 3 - px * 3} y1={oy1 - dirY * 3 - py * 3} x2={ox1 + dirX * 3 + px * 3} y2={oy1 + dirY * 3 + py * 3} stroke="#4f46e5" strokeWidth="1.25" />
        <line x1={ox2 - dirX * 3 - px * 3} y1={oy2 - dirY * 3 - py * 3} x2={ox2 + dirX * 3 + px * 3} y2={oy2 + dirY * 3 + py * 3} stroke="#4f46e5" strokeWidth="1.25" />

        {/* Text mask (white background) */}
        <rect
          x={mx - rectWidth / 2}
          y={my - 6}
          width={rectWidth}
          height={12}
          fill="#ffffff"
          rx="2"
          opacity="0.95"
          transform={`rotate(${angle}, ${mx}, ${my})`}
        />
        
        {/* Dimension text */}
        <text
          x={mx}
          y={my}
          transform={`rotate(${angle}, ${mx}, ${my})`}
          fill="#4f46e5"
          fontSize="8"
          fontWeight="700"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {label}
        </text>
      </g>
    );
  };
  
  if (isSingle) {
    pRightTop.y = groundY - (specs.eaveHeight + totalRoofH) * scale;
    dPath = `M ${pLeftGround.x} ${pLeftGround.y} L ${pLeftEave.x} ${pLeftEave.y} L ${pRightTop.x} ${pRightTop.y} L ${pRightGround.x} ${pRightGround.y}`;
    dRoof = `M ${pLeftEave.x - 5} ${pLeftEave.y + (5 * (pLeftEave.y - pRightTop.y) / drawW)} L ${pRightTop.x + 5} ${pRightTop.y - (5 * (pLeftEave.y - pRightTop.y) / drawW)}`;
  } else if (isMulti) {
    const quarter1 = centerX - drawW / 4;
    const quarter3 = centerX + drawW / 4;
    const h1Y = groundY - (specs.eaveHeight + h_steep) * scale;
    const pRidgeY = groundY - ridgeHeight * scale;
    dPath = `M ${pLeftGround.x} ${pLeftGround.y} L ${pLeftEave.x} ${pLeftEave.y} L ${quarter1} ${h1Y} L ${centerX} ${pRidgeY} L ${quarter3} ${h1Y} L ${pRightTop.x} ${pRightTop.y} L ${pRightGround.x} ${pRightGround.y}`;
    dRoof = `M ${pLeftEave.x} ${pLeftEave.y} L ${quarter1} ${h1Y} L ${centerX} ${pRidgeY} L ${quarter3} ${h1Y} L ${pRightTop.x} ${pRightTop.y}`;
  } else if (isCurved) {
    const cpY = groundY - (specs.eaveHeight + totalRoofH * 2) * scale;
    dPath = `M ${pLeftGround.x} ${pLeftGround.y} L ${pLeftEave.x} ${pLeftEave.y} Q ${centerX} ${cpY} ${pRightTop.x} ${pRightTop.y} L ${pRightGround.x} ${pRightGround.y}`;
    dRoof = `M ${pLeftEave.x} ${pLeftEave.y} Q ${centerX} ${cpY} ${pRightTop.x} ${pRightTop.y}`;
  } else {
    // Hut-shaped
    const pRidgeY = groundY - ridgeHeight * scale;
    dPath = `M ${pLeftGround.x} ${pLeftGround.y} L ${pLeftEave.x} ${pLeftEave.y} L ${centerX} ${pRidgeY} L ${pRightTop.x} ${pRightTop.y} L ${pRightGround.x} ${pRightGround.y}`;
    dRoof = `M ${pLeftEave.x} ${pLeftEave.y} L ${centerX} ${pRidgeY} L ${pRightTop.x} ${pRightTop.y}`;
  }

  return (
    <div id="peb-2d-container" className="w-full relative flex items-center justify-center p-6 bg-white h-[40vh] md:h-[50vh] min-h-[300px] max-h-[600px]">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-md shadow-sm hover:bg-slate-50 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share SVG
        </button>
      </div>
      <svg id="peb-2d-svg" ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${canvasW} ${canvasH}`} className="max-h-72 w-full drop-shadow-sm bg-white" xmlns="http://www.w3.org/2000/svg">
        
        {/* Foundation & Subsurface visualized */}
        {(() => {
          const fDepth = Math.max(0.6, Math.round(specs.eaveHeight * 0.2 * 10) / 10);
          const fDepthPx = fDepth * scale;
          return specs.hasPrimarySteel !== false && (
            <>
              {/* Left Column Footing */}
              <rect x={pLeftGround.x - 6} y={groundY} width="12" height={fDepthPx} fill="#94a3b8" opacity="0.6" />
              <rect x={pLeftGround.x - 12} y={groundY + fDepthPx} width="24" height={0.3 * scale} fill="#64748b" opacity="0.8" />
              <rect x={pLeftGround.x - 8} y={groundY - 3} width="16" height="4" fill="#334155" />
              {/* Right Column Footing */}
              <rect x={pRightGround.x - 6} y={groundY} width="12" height={fDepthPx} fill="#94a3b8" opacity="0.6" />
              <rect x={pRightGround.x - 12} y={groundY + fDepthPx} width="24" height={0.3 * scale} fill="#64748b" opacity="0.8" />
              <rect x={pRightGround.x - 8} y={groundY - 3} width="16" height="4" fill="#334155" />
              
              {specs.frameType === 'Multi-Span' && (
                <>
                   <rect x={centerX - 6} y={groundY} width="12" height={fDepthPx} fill="#94a3b8" opacity="0.6" />
                   <rect x={centerX - 12} y={groundY + fDepthPx} width="24" height={0.3 * scale} fill="#64748b" opacity="0.8" />
                   <rect x={centerX - 8} y={groundY - 3} width="16" height="4" fill="#334155" />
                </>
              )}
              
              {/* Depth label (Column) */}
              <line x1={pLeftGround.x - 24} y1={groundY} x2={pLeftGround.x - 24} y2={groundY + fDepthPx} stroke="#64748b" strokeWidth="1" />
              <line x1={pLeftGround.x - 28} y1={groundY} x2={pLeftGround.x - 20} y2={groundY} stroke="#64748b" strokeWidth="1" />
              <line x1={pLeftGround.x - 28} y1={groundY + fDepthPx} x2={pLeftGround.x - 20} y2={groundY + fDepthPx} stroke="#64748b" strokeWidth="1" />
              <text x={pLeftGround.x - 30} y={groundY + fDepthPx/2 + 4} fill="#64748b" fontSize="12" textAnchor="end">{dimensionUnit === 'ft' ? (fDepth * 3.28084).toFixed(1) : fDepth.toFixed(1)}{dimensionUnit === 'ft' ? 'ft' : 'm'}</text>

              {/* Depth label (Footing) */}
              <line x1={pLeftGround.x - 24} y1={groundY + fDepthPx} x2={pLeftGround.x - 24} y2={groundY + fDepthPx + 0.3 * scale} stroke="#64748b" strokeWidth="1" />
              <line x1={pLeftGround.x - 28} y1={groundY + fDepthPx + 0.3 * scale} x2={pLeftGround.x - 20} y2={groundY + fDepthPx + 0.3 * scale} stroke="#64748b" strokeWidth="1" />
              <text x={pLeftGround.x - 30} y={groundY + fDepthPx + (0.3 * scale)/2 + 4} fill="#64748b" fontSize="12" textAnchor="end">{dimensionUnit === 'ft' ? '1.0ft' : '0.3m'}</text>
            </>
          );
        })()}
        
        {/* Ground */}

        <line x1={0} y1={groundY} x2={canvasW} y2={groundY} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 4" />
        
        {/* Building Inner Fill and Primary Frame */}
        {specs.hasPrimarySteel !== false && (
          specs.frameType === 'Truss' ? (
            <g id="truss-frame-2d">
              {/* Columns */}
              <line x1={pLeftGround.x} y1={pLeftGround.y} x2={pLeftEave.x} y2={pLeftEave.y} stroke="#1e293b" strokeWidth="5" />
              <line x1={pRightGround.x} y1={pRightGround.y} x2={pRightTop.x} y2={pRightTop.y} stroke="#1e293b" strokeWidth="5" />

              {/* Bottom Chord (Tie Runner) */}
              <line x1={pLeftEave.x} y1={pLeftEave.y} x2={pRightTop.x} y2={pLeftEave.y} stroke="#1e293b" strokeWidth="4" />

              {/* Top Chords & Webs */}
              {(() => {
                const ridgeY = groundY - ridgeHeight * scale;
                const eaveY = pLeftEave.y;

                if (isSingle) {
                  // Single Slope Truss
                  // Top Chord
                  const slopeY = pRightTop.y;
                  const numWebs2D = Math.max(3, Math.round(specs.width / 1.8));
                  const step2D = drawW / numWebs2D;

                  const webs2D = [];
                  for (let j = 1; j < numWebs2D; j++) {
                    const x = pLeftEave.x + j * step2D;
                    const topY = eaveY - (j / numWebs2D) * (eaveY - slopeY);
                    webs2D.push(
                      <line key={`web_v_${j}`} x1={x} y1={eaveY} x2={x} y2={topY} stroke="#334155" strokeWidth="2.5" />
                    );

                    // Diagonal
                    const nextX = pLeftEave.x + (j + 1) * step2D;
                    const nextTopY = eaveY - ((j + 1) / numWebs2D) * (eaveY - slopeY);
                    webs2D.push(
                      <line key={`web_d_${j}`} x1={x} y1={eaveY} x2={nextX} y2={nextTopY} stroke="#334155" strokeWidth="2" />
                    );
                  }

                  // 1. Top Chord (Rafter) Length
                  const tcLen = Math.sqrt(Math.pow(specs.width, 2) + Math.pow(totalRoofH, 2));
                  const tcDim = renderDimensionLine(pLeftEave.x, eaveY, pRightTop.x, slopeY, -25, fmtLen(tcLen), 'tc_dim');

                  // 2. Truss Rise Height (offset negative to place inside the building, avoiding the outer High Eave dimension)
                  const riseDim = renderDimensionLine(pRightTop.x, eaveY, pRightTop.x, slopeY, -25, fmtLen(totalRoofH) + ' Rise', 'rise_dim');

                  // 3. Panel spacing chain (offset positive to place below the bottom chord, avoiding overlapping with the webs)
                  const panelWReal = specs.width / numWebs2D;
                  const panelDims = [];
                  for (let j = 0; j < numWebs2D; j++) {
                    const x1 = pLeftEave.x + j * step2D;
                    const x2 = pLeftEave.x + (j + 1) * step2D;
                    panelDims.push(
                      renderDimensionLine(x1, eaveY, x2, eaveY, 18, fmtLen(panelWReal), `panel_dim_${j}`)
                    );
                  }

                  return (
                    <>
                      <line x1={pLeftEave.x} y1={eaveY} x2={pRightTop.x} y2={slopeY} stroke="#1e293b" strokeWidth="4" />
                      <line x1={pRightTop.x} y1={eaveY} x2={pRightTop.x} y2={slopeY} stroke="#1e293b" strokeWidth="3" />
                      {webs2D}
                      {/* Truss Plates */}
                      <rect x={pLeftEave.x - 4} y={eaveY - 4} width="8" height="8" rx="1" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
                      <rect x={pRightTop.x - 4} y={slopeY - 4} width="8" height="8" rx="1" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
                      <rect x={pRightTop.x - 4} y={eaveY - 4} width="8" height="8" rx="1" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />

                      {/* Truss Labeled Dimensions */}
                      {tcDim}
                      {riseDim}
                      {panelDims}
                    </>
                  );
                } else if (isCurved) {
                  // Curved bowstring truss
                  const cpY = groundY - (specs.eaveHeight + totalRoofH * 2) * scale;
                  const getPt = (t: number) => ({
                     x: Math.pow(1-t, 2)*pLeftEave.x + 2*(1-t)*t*centerX + Math.pow(t, 2)*pRightTop.x,
                     y: Math.pow(1-t, 2)*pLeftEave.y + 2*(1-t)*t*cpY + Math.pow(t, 2)*pRightTop.y
                  });
                  const lines = [];
                  let ptPrev = getPt(0);
                  const segments = 16;
                  for (let j = 1; j <= segments; j++) {
                    const ptNext = getPt(j / segments);
                    lines.push(
                      <line key={`curv_chord_${j}`} x1={ptPrev.x} y1={ptPrev.y} x2={ptNext.x} y2={ptNext.y} stroke="#1e293b" strokeWidth="4" />
                    );
                    ptPrev = ptNext;
                  }

                  // Webbing
                  const numWebs2D = Math.max(4, Math.round(specs.width / 1.5));
                  const webs = [];
                  for (let j = 1; j < numWebs2D; j++) {
                    const t = j / numWebs2D;
                    const pt = getPt(t);
                    webs.push(
                      <line key={`curv_web_v_${j}`} x1={pt.x} y1={eaveY} x2={pt.x} y2={pt.y} stroke="#334155" strokeWidth="2.5" />
                    );
                    if (j < numWebs2D - 1) {
                      const nextPt = getPt((j + 1) / numWebs2D);
                      webs.push(
                        <line key={`curv_web_d_${j}`} x1={pt.x} y1={eaveY} x2={nextPt.x} y2={nextPt.y} stroke="#334155" strokeWidth="2" />
                      );
                    }
                  }

                  // 1. Truss Rise Height (offset negative to place on the left of the center-line, avoiding the centered ridge line)
                  const peakY = eaveY - totalRoofH * scale;
                  const riseDim = renderDimensionLine(centerX, eaveY, centerX, peakY, -25, fmtLen(totalRoofH) + ' Rise', 'curved_rise_dim');

                  // 2. Panel spacing chain (offset positive to place below bottom chord, avoiding webs)
                  const step2D = drawW / numWebs2D;
                  const panelWReal = specs.width / numWebs2D;
                  const panelDims = [];
                  for (let j = 0; j < numWebs2D; j++) {
                    const x1 = pLeftEave.x + j * step2D;
                    const x2 = pLeftEave.x + (j + 1) * step2D;
                    panelDims.push(
                      renderDimensionLine(x1, eaveY, x2, eaveY, 18, fmtLen(panelWReal), 'curved_panel_dim_' + j)
                    );
                  }

                  return (
                    <>
                      {lines}
                      {webs}
                      {/* Truss Plates */}
                      <rect x={pLeftEave.x - 4} y={eaveY - 4} width="8" height="8" rx="1" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
                      <rect x={pRightTop.x - 4} y={eaveY - 4} width="8" height="8" rx="1" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />

                      {/* Truss Labeled Dimensions */}
                      {riseDim}
                      {panelDims}
                    </>
                  );
                } else if (isMulti) {
                  // Multi slope truss - Pratt optimized 2D layout to match 3D perfectly
                  const h_steep_px = h_steep * scale;
                  const h_shallow_px = h_shallow * scale;
                  const h1Y = groundY - (specs.eaveHeight + h_steep) * scale;
                  const quarter1 = centerX - drawW / 4;
                  const quarter3 = centerX + drawW / 4;

                  const getTopChordY = (xVal: number) => {
                    const distFromCenter = Math.abs(xVal - centerX);
                    const halfW = drawW / 2;
                    if (distFromCenter >= drawW / 4) {
                      const ratio = (halfW - distFromCenter) / (drawW / 4);
                      return eaveY - ratio * h_steep_px;
                    } else {
                      const ratio = (drawW / 4 - distFromCenter) / (drawW / 4);
                      return h1Y - ratio * h_shallow_px;
                    }
                  };

                  const numPanelsHalf = Math.max(2, Math.round(specs.width / 3.6));
                  const step2D = (drawW / 2) / numPanelsHalf;

                  const webs2D = [];
                  // Verticals
                  for (let j = 1; j < 2 * numPanelsHalf; j++) {
                    const x = pLeftEave.x + j * step2D;
                    const topY = getTopChordY(x);
                    webs2D.push(
                      <line key={`multi_web_v_${j}`} x1={x} y1={eaveY} x2={x} y2={topY} stroke="#334155" strokeWidth="2.5" />
                    );
                  }

                  // Diagonals Left
                  for (let j = 0; j < numPanelsHalf; j++) {
                    const x_start = pLeftEave.x + j * step2D;
                    const x_end = pLeftEave.x + (j + 1) * step2D;
                    const y_end = getTopChordY(x_end);
                    webs2D.push(
                      <line key={`multi_web_d_l_${j}`} x1={x_start} y1={eaveY} x2={x_end} y2={y_end} stroke="#334155" strokeWidth="2" />
                    );
                  }

                  // Diagonals Right
                  for (let j = numPanelsHalf; j < 2 * numPanelsHalf; j++) {
                    const x_start = pLeftEave.x + (j + 1) * step2D;
                    const x_end = pLeftEave.x + j * step2D;
                    const y_end = getTopChordY(x_end);
                    webs2D.push(
                      <line key={`multi_web_d_r_${j}`} x1={x_start} y1={eaveY} x2={x_end} y2={y_end} stroke="#334155" strokeWidth="2" />
                    );
                  }

                  // 1. Lower Left Top Chord Length
                  const lowerLenReal = Math.sqrt(Math.pow(specs.width / 4, 2) + Math.pow(h_steep, 2));
                  const lowerChordDim = renderDimensionLine(pLeftEave.x, eaveY, quarter1, h1Y, -20, fmtLen(lowerLenReal), 'multi_lower_chord_dim');

                  // 2. Upper Left Top Chord Length
                  const upperLenReal = Math.sqrt(Math.pow(specs.width / 4, 2) + Math.pow(h_shallow, 2));
                  const upperChordDim = renderDimensionLine(quarter1, h1Y, centerX, ridgeY, -20, fmtLen(upperLenReal), 'multi_upper_chord_dim');

                  // 3. Truss Rise Height (offset negative to place on the left of the center-line, avoiding the centered ridge line)
                  const riseDim = renderDimensionLine(centerX, eaveY, centerX, ridgeY, -25, fmtLen(totalRoofH) + ' Rise', 'multi_rise_dim');

                  // 4. Panel spacing chain (offset positive to place below bottom chord, avoiding webs)
                  const panelWReal = (specs.width / 2) / numPanelsHalf;
                  const panelDims = [];
                  for (let j = 0; j < 2 * numPanelsHalf; j++) {
                    const x1 = pLeftEave.x + j * step2D;
                    const x2 = pLeftEave.x + (j + 1) * step2D;
                    panelDims.push(
                      renderDimensionLine(x1, eaveY, x2, eaveY, 18, fmtLen(panelWReal), 'multi_panel_dim_' + j)
                    );
                  }

                  return (
                    <>
                      {/* Top Chord lines */}
                      <line x1={pLeftEave.x} y1={eaveY} x2={quarter1} y2={h1Y} stroke="#1e293b" strokeWidth="4" />
                      <line x1={quarter1} y1={h1Y} x2={centerX} y2={ridgeY} stroke="#1e293b" strokeWidth="4" />
                      <line x1={centerX} y1={ridgeY} x2={quarter3} y2={h1Y} stroke="#1e293b" strokeWidth="4" />
                      <line x1={quarter3} y1={h1Y} x2={pRightTop.x} y2={eaveY} stroke="#1e293b" strokeWidth="4" />

                      {webs2D}

                      {/* Truss Plates */}
                      <rect x={pLeftEave.x - 4} y={eaveY - 4} width="8" height="8" rx="1" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
                      <rect x={pRightTop.x - 4} y={eaveY - 4} width="8" height="8" rx="1" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
                      <rect x={centerX - 5} y={ridgeY - 5} width="10" height="10" rx="1.5" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />

                      {/* Truss Labeled Dimensions */}
                      {lowerChordDim}
                      {upperChordDim}
                      {riseDim}
                      {panelDims}
                    </>
                  );
                } else {
                  // Standard Gable Truss (Fink / Howe Pratt-Optimized 2D design)
                  const numPanelsHalf = Math.max(2, Math.round(specs.width / 3.6));
                  const step2D = (drawW / 2) / numPanelsHalf;

                  const getTopChordY = (x: number) => {
                    const distFromCenter = Math.abs(x - centerX);
                    const ratio = distFromCenter / (drawW / 2);
                    return ridgeY + ratio * (eaveY - ridgeY);
                  };

                  const webs2D = [];
                  // Verticals
                  for (let j = 1; j < 2 * numPanelsHalf; j++) {
                    const x = pLeftEave.x + j * step2D;
                    const topY = getTopChordY(x);
                    webs2D.push(
                      <line key={`gable_web_v_${j}`} x1={x} y1={eaveY} x2={x} y2={topY} stroke="#334155" strokeWidth="2.5" />
                    );
                  }

                  // Diagonals Left
                  for (let j = 0; j < numPanelsHalf; j++) {
                    const x_start = pLeftEave.x + j * step2D;
                    const x_end = pLeftEave.x + (j + 1) * step2D;
                    const y_end = getTopChordY(x_end);
                    webs2D.push(
                      <line key={`gable_web_d_l_${j}`} x1={x_start} y1={eaveY} x2={x_end} y2={y_end} stroke="#334155" strokeWidth="2" />
                    );
                  }

                  // Diagonals Right
                  for (let j = numPanelsHalf; j < 2 * numPanelsHalf; j++) {
                    const x_start = pLeftEave.x + (j + 1) * step2D;
                    const x_end = pLeftEave.x + j * step2D;
                    const y_end = getTopChordY(x_end);
                    webs2D.push(
                      <line key={`gable_web_d_r_${j}`} x1={x_start} y1={eaveY} x2={x_end} y2={y_end} stroke="#334155" strokeWidth="2" />
                    );
                  }

                  // 1. Top Chord (Rafter) Length
                  const tcLen = Math.sqrt(Math.pow(specs.width / 2, 2) + Math.pow(totalRoofH, 2));
                  const tcDim = renderDimensionLine(pLeftEave.x, eaveY, centerX, ridgeY, -25, fmtLen(tcLen), 'gable_tc_dim');

                  // 2. Truss Rise Height (offset negative to place on the left of the center-line, avoiding the centered ridge line)
                  const riseDim = renderDimensionLine(centerX, eaveY, centerX, ridgeY, -25, fmtLen(totalRoofH) + ' Rise', 'gable_rise_dim');

                  // 3. Panel spacing chain (offset positive to place below bottom chord, avoiding webs)
                  const panelWReal = (specs.width / 2) / numPanelsHalf;
                  const panelDims = [];
                  for (let j = 0; j < 2 * numPanelsHalf; j++) {
                    const x1 = pLeftEave.x + j * step2D;
                    const x2 = pLeftEave.x + (j + 1) * step2D;
                    panelDims.push(
                      renderDimensionLine(x1, eaveY, x2, eaveY, 18, fmtLen(panelWReal), 'gable_panel_dim_' + j)
                    );
                  }

                  return (
                    <>
                      {/* Top Chords */}
                      <line x1={pLeftEave.x} y1={eaveY} x2={centerX} y2={ridgeY} stroke="#1e293b" strokeWidth="4" />
                      <line x1={centerX} y1={ridgeY} x2={pRightTop.x} y2={eaveY} stroke="#1e293b" strokeWidth="4" />

                      {webs2D}

                      {/* Truss Plates (Metal Connector plates) at Panel Points */}
                      <rect x={pLeftEave.x - 4} y={eaveY - 4} width="12" height="8" rx="1" fill="#94a3b8" stroke="#475569" strokeWidth="0.7" />
                      <rect x={pRightTop.x - 8} y={eaveY - 4} width="12" height="8" rx="1" fill="#94a3b8" stroke="#475569" strokeWidth="0.7" />
                      
                      {/* Peak joint */}
                      <polygon points={`${centerX - 6},${ridgeY + 8} ${centerX + 6},${ridgeY + 8} ${centerX},${ridgeY - 2}`} fill="#94a3b8" stroke="#475569" strokeWidth="0.7" />

                      {/* Bottom Chord Panel Points */}
                      <rect x={centerX - 5} y={eaveY - 4} width="10" height="8" rx="1" fill="#94a3b8" stroke="#475569" strokeWidth="0.7" />
                      {Array.from({ length: numPanelsHalf - 1 }).map((_, j) => {
                        const xL = pLeftEave.x + (j + 1) * step2D;
                        const xR = centerX + (j + 1) * step2D;
                        return (
                          <g key={`panel_pts_${j}`}>
                            <rect x={xL - 5} y={eaveY - 4} width="10" height="8" rx="1" fill="#94a3b8" stroke="#475569" strokeWidth="0.7" />
                            <rect x={xR - 5} y={eaveY - 4} width="10" height="8" rx="1" fill="#94a3b8" stroke="#475569" strokeWidth="0.7" />
                          </g>
                        );
                      })}

                      {/* Truss Labeled Dimensions */}
                      {tcDim}
                      {riseDim}
                      {panelDims}
                    </>
                  );
                }
              })()}
            </g>
          ) : (
            <path
              d={dPath}
              fill="rgba(59, 130, 246, 0.05)"
              stroke="#1e293b"
              strokeWidth="4"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          )
        )}

        {/* Secondary Members (Girts) */}
        {specs.hasGirts !== false && (
          <>
            {Array.from({ length: Math.floor(specs.eaveHeight / (specs.highWindVelocity || specs.snowLoad ? 1.0 : 1.5)) }).map((_, i) => {
               const y = groundY - (i + 1) * (specs.highWindVelocity || specs.snowLoad ? 1.0 : 1.5) * scale;
               return (
                 <React.Fragment key={`girt_${i}`}>
                   {/* Left side girt and plate */}
                   <rect x={pLeftGround.x - 4} y={y - 6} width="4" height="12" fill="#475569" />
                   <rect x={pLeftGround.x} y={y - 10} width="3" height="20" fill="#94a3b8" />
                   <circle cx={pLeftGround.x + 1.5} cy={y - 6} r="1" fill="#1e293b" />
                   <circle cx={pLeftGround.x + 1.5} cy={y + 6} r="1" fill="#1e293b" />
                   
                   {/* Right side girt and plate */}
                   <rect x={pRightGround.x} y={y - 6} width="4" height="12" fill="#475569" />
                   <rect x={pRightGround.x - 3} y={y - 10} width="3" height="20" fill="#94a3b8" />
                   <circle cx={pRightGround.x - 1.5} cy={y - 6} r="1" fill="#1e293b" />
                   <circle cx={pRightGround.x - 1.5} cy={y + 6} r="1" fill="#1e293b" />
                 </React.Fragment>
               );
            })}
          </>
        )}

        {/* Secondary Members (Purlins & Cleats) */}
        {specs.hasSecondarySteel !== false && (
          <g>
            {(() => {
               const ps = (specs.highWindVelocity || specs.snowLoad ? 1.0 : 1.5) * scale;
               const cleats: React.ReactNode[] = [];
               let keyIdx = 0;
               const drawPurlinStrut = (p1x: number, p1y: number, p2x: number, p2y: number) => {
                  const dx = p2x - p1x;
                  const dy = p2y - p1y;
                  const l = Math.sqrt(dx*dx + dy*dy);
                  const runs = Math.max(1, Math.round(l / ps));
                  const a = Math.atan2(dy, dx);
                  
                  // Inboard offset to position purlins properly relative to edges (e.g. eave and ridge)
                  const offset = 12;
                  if (l > 2 * offset) {
                     const startX = p1x + (dx / l) * offset;
                     const startY = p1y + (dy / l) * offset;
                     const endX = p2x - (dx / l) * offset;
                     const endY = p2y - (dy / l) * offset;
                     const newDx = endX - startX;
                     const newDy = endY - startY;
                     
                     for (let i = 0; i <= runs; i++) {
                        const t = runs > 0 ? i / runs : 0.5;
                        const rx = startX + newDx * t;
                        const ry = startY + newDy * t;
                        cleats.push(
                          <g key={`p_cleat_${keyIdx++}`} transform={`translate(${rx}, ${ry}) rotate(${a * 180 / Math.PI})`}>
                            <rect x="-2" y="-12" width="4" height="12" fill="#94a3b8" />
                            <rect x="-5" y="-20" width="10" height="8" fill="#475569" />
                            <circle cx="0" cy="-16" r="1.5" fill="#1e293b" />
                          </g>
                        );
                     }
                  } else {
                     for (let i = 0; i <= runs; i++) {
                        const rx = p1x + dx * (i / (runs || 1));
                        const ry = p1y + dy * (i / (runs || 1));
                        cleats.push(
                          <g key={`p_cleat_${keyIdx++}`} transform={`translate(${rx}, ${ry}) rotate(${a * 180 / Math.PI})`}>
                            <rect x="-2" y="-12" width="4" height="12" fill="#94a3b8" />
                            <rect x="-5" y="-20" width="10" height="8" fill="#475569" />
                            <circle cx="0" cy="-16" r="1.5" fill="#1e293b" />
                          </g>
                        );
                     }
                  }
               };
               
               if (isSingle) {
                 drawPurlinStrut(pLeftEave.x, pLeftEave.y, pRightTop.x, pRightTop.y);
               } else if (isMulti) {
                 const h1Y = groundY - (specs.eaveHeight + h_steep) * scale;
                 const pRidgeY = groundY - ridgeHeight * scale;
                 drawPurlinStrut(pLeftEave.x, pLeftEave.y, centerX - drawW / 4, h1Y);
                 drawPurlinStrut(centerX - drawW / 4, h1Y, centerX, pRidgeY);
                 drawPurlinStrut(centerX, pRidgeY, centerX + drawW / 4, h1Y);
                 drawPurlinStrut(centerX + drawW / 4, h1Y, pRightTop.x, pRightTop.y);
               } else if (isCurved) {
                 // Sample points along the quadratic curve
                 const cpY = groundY - (specs.eaveHeight + totalRoofH * 2) * scale;
                 const getPt = (t: number) => ({
                    x: Math.pow(1-t, 2)*pLeftEave.x + 2*(1-t)*t*centerX + Math.pow(t, 2)*pRightTop.x,
                    y: Math.pow(1-t, 2)*pLeftEave.y + 2*(1-t)*t*cpY + Math.pow(t, 2)*pRightTop.y
                 });
                 let ptPrev = getPt(0);
                 const segs = 10;
                 for (let i=1; i<=segs; i++) {
                    const ptNext = getPt(i/segs);
                    drawPurlinStrut(ptPrev.x, ptPrev.y, ptNext.x, ptNext.y);
                    ptPrev = ptNext;
                 }
               } else {
                 const pRidgeY = groundY - ridgeHeight * scale;
                 drawPurlinStrut(pLeftEave.x, pLeftEave.y, centerX, pRidgeY);
                 drawPurlinStrut(centerX, pRidgeY, pRightTop.x, pRightTop.y);
               }
               return cleats;
            })()}
          </g>
        )}

        {/* Wall Sheeting */}
        {specs.hasWalls !== false && (
          <>
            <line x1={pLeftGround.x - 4} y1={pLeftGround.y} x2={pLeftEave.x - 4} y2={pLeftEave.y} stroke={specs.wallColor || '#e2e8f0'} strokeWidth="4" strokeLinecap="square" />
            <line x1={pRightGround.x + 4} y1={pRightGround.y} x2={pRightTop.x + 4} y2={pRightTop.y} stroke={specs.wallColor || '#e2e8f0'} strokeWidth="4" strokeLinecap="square" />
          </>
        )}

        {/* Roof Sheeting */}
        {specs.hasRoof !== false && (
          <g transform="translate(0, -14)">
            <path
              d={dRoof}
              fill="none"
              stroke={specs.roofColor || '#0ea5e9'}
              strokeWidth="6"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {specs.hasRidgeCap !== false && (
              <path
                d={isSingle 
                  ? `M ${pRightTop.x - 12} ${pRightTop.y - 2} L ${pRightTop.x} ${pRightTop.y - 5} L ${pRightTop.x + 8} ${pRightTop.y - 1}`
                  : `M ${centerX - 12} ${groundY - ridgeHeight * scale + 6} L ${centerX} ${groundY - ridgeHeight * scale - 5} L ${centerX + 12} ${groundY - ridgeHeight * scale + 6}`
                }
                fill="none"
                stroke={specs.ridgeCapColor || '#383e42'}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </g>
        )}

        {/* Multi-span central column */}
        {specs.hasPrimarySteel !== false && specs.frameType === 'Multi-Span' && !isSingle && (
          <line x1={centerX} y1={groundY} x2={centerX} y2={isMulti ? (groundY - (specs.eaveHeight + h_steep) * scale) : groundY - ridgeHeight * scale} stroke="#1e293b" strokeWidth="4" strokeLinecap="square" />
        )}

        {/* Labels & Dimension Lines */}
        <text x={centerX} y={groundY + 28} fill="#64748b" fontSize="16" textAnchor="middle" fontWeight="500">Width: {dimensionUnit === 'ft' ? (specs.width * 3.28084).toFixed(2) : specs.width}{dimensionUnit === 'ft' ? 'ft' : 'm'}</text>
        <line x1={pLeftGround.x} y1={groundY + 15} x2={pRightGround.x} y2={groundY + 15} stroke="#94a3b8" strokeWidth="1" />
        <line x1={pLeftGround.x} y1={groundY + 10} x2={pLeftGround.x} y2={groundY + 20} stroke="#94a3b8" strokeWidth="1" />
        <line x1={pRightGround.x} y1={groundY + 10} x2={pRightGround.x} y2={groundY + 20} stroke="#94a3b8" strokeWidth="1" />

        <text x={pLeftGround.x - 20} y={groundY - drawEave / 2} fill="#64748b" fontSize="16" textAnchor="end" dominantBaseline="middle" fontWeight="500">Low Eave: {dimensionUnit === 'ft' ? (specs.eaveHeight * 3.28084).toFixed(2) : specs.eaveHeight}{dimensionUnit === 'ft' ? 'ft' : 'm'}</text>
        <line x1={pLeftGround.x - 12} y1={groundY} x2={pLeftGround.x - 12} y2={pLeftEave.y} stroke="#94a3b8" strokeWidth="1" />
        <line x1={pLeftGround.x - 18} y1={groundY} x2={pLeftGround.x - 6} y2={groundY} stroke="#94a3b8" strokeWidth="1" />
        <line x1={pLeftGround.x - 18} y1={pLeftEave.y} x2={pLeftGround.x - 6} y2={pLeftEave.y} stroke="#94a3b8" strokeWidth="1" />

        {isSingle ? (
          <>
            <text x={pRightGround.x + 20} y={groundY - (specs.eaveHeight + totalRoofH) * scale / 2} fill="#64748b" fontSize="16" textAnchor="start" dominantBaseline="middle" fontWeight="500">High Eave: {dimensionUnit === 'ft' ? ((specs.eaveHeight + totalRoofH) * 3.28084).toFixed(1) : (specs.eaveHeight + totalRoofH).toFixed(1)}{dimensionUnit === 'ft' ? 'ft' : 'm'}</text>
            <line x1={pRightGround.x + 12} y1={groundY} x2={pRightGround.x + 12} y2={pRightTop.y} stroke="#94a3b8" strokeWidth="1" />
            <line x1={pRightGround.x + 6} y1={groundY} x2={pRightGround.x + 18} y2={groundY} stroke="#94a3b8" strokeWidth="1" />
            <line x1={pRightGround.x + 6} y1={pRightTop.y} x2={pRightGround.x + 18} y2={pRightTop.y} stroke="#94a3b8" strokeWidth="1" />
          </>
        ) : (
          <>
            <text x={pRightGround.x + 20} y={groundY - drawEave / 2} fill="#64748b" fontSize="16" textAnchor="start" dominantBaseline="middle" fontWeight="500">Eave: {dimensionUnit === 'ft' ? (specs.eaveHeight * 3.28084).toFixed(2) : specs.eaveHeight}{dimensionUnit === 'ft' ? 'ft' : 'm'}</text>
            <line x1={pRightGround.x + 12} y1={groundY} x2={pRightGround.x + 12} y2={pRightTop.y} stroke="#94a3b8" strokeWidth="1" />
            <line x1={pRightGround.x + 6} y1={groundY} x2={pRightGround.x + 18} y2={groundY} stroke="#94a3b8" strokeWidth="1" />
            <line x1={pRightGround.x + 6} y1={pRightTop.y} x2={pRightGround.x + 18} y2={pRightTop.y} stroke="#94a3b8" strokeWidth="1" />
            
            <text x={centerX} y={groundY - ridgeHeight * scale - 15} fill="#64748b" fontSize="16" textAnchor="middle" fontWeight="500">Ridge: {dimensionUnit === 'ft' ? ((specs.eaveHeight + totalRoofH) * 3.28084).toFixed(1) : (specs.eaveHeight + totalRoofH).toFixed(1)}{dimensionUnit === 'ft' ? 'ft' : 'm'}</text>
            <line x1={centerX} y1={groundY} x2={centerX} y2={groundY - ridgeHeight * scale} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
          </>
        )}

        <text x={centerX + drawW / 4} y={pRightTop.y - ((ridgeHeight * scale) - drawEave)/2 - 16} fill="#64748b" fontSize="15" textAnchor="start" fontWeight="500">Slope: {specs.roofSlope}%</text>
      </svg>
    </div>
  );
}

function ProcessStepVisualizer({ onProcessClick }: { onProcessClick?: (name: string) => void }) {
  const steps = [
    { name: 'Detailing', icon: <PenTool className="w-5 h-5 flex-shrink-0" /> },
    { name: 'Cutting', icon: <Scissors className="w-5 h-5 flex-shrink-0" /> },
    { name: 'Welding', icon: <Zap className="w-5 h-5 flex-shrink-0" /> },
    { name: 'Blasting', icon: <Wind className="w-5 h-5 flex-shrink-0" /> },
    { name: 'Painting', icon: <Paintbrush className="w-5 h-5 flex-shrink-0" /> },
    { name: 'Logistics', icon: <Truck className="w-5 h-5 flex-shrink-0" /> },
    { name: 'Erection', icon: <Wrench className="w-5 h-5 flex-shrink-0" /> },
  ];

  return (
    <div className="w-full overflow-x-auto p-6 bg-white xl:overflow-hidden">
      <div className="flex items-center justify-between min-w-[700px] relative px-4 py-2 mx-auto">
        {/* Background connecting line */}
        <div className="absolute left-10 right-10 top-6 h-[2px] bg-slate-200 z-0"></div>

        {steps.map((step, idx) => (
          <div key={idx} className="relative z-10 flex flex-col items-center gap-3 w-20 group" onClick={() => onProcessClick && onProcessClick(step.name)}>
            <div className="w-12 h-12 rounded-full bg-white border-2 border-slate-200 text-slate-500 flex items-center justify-center shadow-sm group-hover:border-blue-500 group-hover:text-blue-500 group-hover:scale-110 transition-all cursor-pointer">
              {step.icon}
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-600 text-center uppercase tracking-wider group-hover:text-blue-600 transition-colors cursor-pointer">
              {step.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MaterialVisualizer({ primary, secondary, hardware }: { primary: number; secondary: number; hardware: number }) {
  const data = [
    { name: 'Primary Steel', value: primary, color: '#3b82f6' },
    { name: 'Secondary Steel', value: secondary, color: '#6366f1' },
    { name: 'Hardware', value: hardware, color: '#10b981' },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip 
            formatter={(value: number) => [`${value.toFixed(2)} t`, 'Weight']} 
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function RALInput({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [text, setText] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);
    
    const ralMatch = val.match(/(?:RAL\s*)?(\d{4})/i);
    if (ralMatch) {
      const code = ralMatch[1];
      const found = STANDARD_COLORS.find(c => c.name.includes(code));
      if (found) {
        onChange(found.hex);
      }
    } else if (/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(val)) {
      onChange(val);
    }
  };

  const handleBlur = () => {
    // If text is not empty and doesn't match a color, clear it or show error
    // For now, we'll just clear it if it didn't match to reset visual state slightly
    // but better to leave it so user knows what they typed
  };

  return (
    <div className="flex items-center gap-2 ml-2 border-l border-slate-200 pl-2">
      <input 
        type="text" 
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="e.g. 5012"
        className="w-20 text-xs border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
      />
      <div className="w-6 h-6 rounded-full border border-slate-300 overflow-hidden relative shadow-sm shrink-0">
        <input 
          type="color" 
          value={value}
          onChange={(e) => { onChange(e.target.value); setText(""); }}
          className="absolute inset-[-10px] w-10 h-10 cursor-pointer p-0 border-0"
          title="Custom Color"
        />
      </div>
    </div>
  );
}



const VISUAL_DICTIONARY: Record<string, { icon: React.ElementType; color: string; desc: string }> = {
  "Base plates": { icon: Square, color: "text-slate-700 bg-slate-100", desc: "Thick steel plates welded to the bottom of columns to distribute load to the concrete foundation." },
  "Splice plates": { icon: Layers, color: "text-blue-700 bg-blue-100", desc: "Steel plates used to join structural members together." },
  "Stiffeners": { icon: Plus, color: "text-indigo-700 bg-indigo-100", desc: "Steel elements welded to web or flanges to prevent buckling." },
  "Welding consumables": { icon: Flame, color: "text-orange-600 bg-orange-100", desc: "Materials like welding rod wires and flux used during the arc welding process." },
  "Welding rods": { icon: Flame, color: "text-orange-600 bg-orange-100", desc: "Electrodes used in arc welding to melt and create strong joints." },
  "Wire/Flux": { icon: Zap, color: "text-yellow-600 bg-yellow-100", desc: "Continuous wire and granular flux used in Submerged Arc Welding (SAW)." },
  "Red Oxide Primer": { icon: PaintBucket, color: "text-red-700 bg-red-100", desc: "Anti-corrosive primer applied to steel to prevent rusting." },
  "Synthetic Enamel Paint": { icon: Paintbrush, color: "text-teal-700 bg-teal-100", desc: "Final protective and decorative coating for steel members." },
  "Painting Brushes": { icon: Brush, color: "text-cyan-700 bg-cyan-100", desc: "Manual tools for applying touch-up paint or primer." },
  "Ladders": { icon: List, color: "text-slate-600 bg-slate-100", desc: "Portable access equipment used during site erection." },
  "Manlifts": { icon: ArrowUpToLine, color: "text-sky-600 bg-sky-100", desc: "Aerial work platforms for lifting site workers." },
  "Mobile Crane": { icon: Tractor, color: "text-amber-700 bg-amber-100", desc: "Heavy lifting equipment to erect columns and rafters." },
  "Hand tools": { icon: Hammer, color: "text-gray-700 bg-gray-100", desc: "Basic manual tools like wrenches and hammers used by fitters." },
  "Blades": { icon: Scissors, color: "text-zinc-600 bg-zinc-100", desc: "Circular saw blades or shear blades for cutting steel." },
  "Cutting wheels": { icon: Disc, color: "text-slate-800 bg-slate-200", desc: "Abrasive wheels used in angle grinders for cutting steel sections." },
  "SAW Welders": { icon: Settings, color: "text-red-600 bg-red-100", desc: "Submerged Arc Welding machines used for high-penetration continuous welds." },
  "CNC Plasma": { icon: Cpu, color: "text-blue-600 bg-blue-100", desc: "Automated computer-controlled plasma cutting machines for precise plate cutting." },
  "M.S. Pipe Purlins/Girts": { icon: AlignJustify, color: "text-slate-500 bg-slate-100", desc: "Tubular secondary steel sections supporting the roof and wall cladding." },
  "Eave struts": { icon: Maximize2, color: "text-indigo-500 bg-indigo-100", desc: "Structural members located at the eaves to support roof and wall columns." },
  "Sag rods": { icon: Minus, color: "text-gray-400 bg-gray-100", desc: "Thin tension rods connecting purlins to prevent sagging." },
  "Flange braces": { icon: Maximize, color: "text-blue-400 bg-blue-100", desc: "Angle braces connecting rafters to purlins for torsional stability." },
  "Cleats": { icon: Paperclip, color: "text-slate-600 bg-slate-200", desc: "Small steel connection brackets welded to primary frames to attach purlins." },
  "Gusset plates": { icon: Layers, color: "text-emerald-500 bg-emerald-100", desc: "Thick steel plates used for connecting pipes and transferring stresses." },
  "Pipe cutting tools": { icon: Activity, color: "text-teal-600 bg-teal-100", desc: "Specialized tools and band saws used to cut steel pipes to length." },
  "Hydraulic Punch/Shear": { icon: Target, color: "text-red-500 bg-red-100", desc: "Heavy machinery used to punch holes in steel plates or purlins." },
  "High-Strength Bolts": { icon: Wrench, color: "text-slate-800 bg-slate-200", desc: "Structural bolts (e.g. A325, A490) used for high-tension connections." },
  "Anchor Bolts": { icon: Wrench, color: "text-zinc-700 bg-zinc-200", desc: "Bolts embedded in concrete foundations to secure base plates." },
  "Machine Bolts": { icon: PenTool, color: "text-gray-600 bg-gray-100", desc: "Standard bolts used for secondary steel connections." },
  "Self-Drilling Screws": { icon: Settings2, color: "text-emerald-600 bg-emerald-100", desc: "Fasteners with a drill point used to secure cladding directly to purlins." },
  "12-14 x 55mm": { icon: Target, color: "text-emerald-700 bg-emerald-200", desc: "Common 55mm length self-drilling screw, often used for roofing." },
  "12-14 x 25mm": { icon: Target, color: "text-emerald-700 bg-emerald-200", desc: "Common 25mm length self-drilling screw, used for wall cladding." },
  "EPDM Washers": { icon: Circle, color: "text-slate-900 bg-slate-200", desc: "Rubber washers attached to screws to provide weather-tight seals." },
  "Bare Galvalume": { icon: Sun, color: "text-zinc-400 bg-zinc-100", desc: "Unpainted zinc-aluminum coated steel sheeting." },
  "Color Coated Galvalume": { icon: Palette, color: "text-blue-500 bg-blue-100", desc: "Pre-painted Galvalume sheeting used for architectural finishes." },
  "Polycarbonate": { icon: Droplet, color: "text-sky-300 bg-sky-50", desc: "Translucent plastic sheeting used for skylights." },
  "Ridge Ventilators": { icon: Wind, color: "text-cyan-500 bg-cyan-100", desc: "Static roof vents installed along the building apex for hot air exhaust." },
  "Turbo Ventilators": { icon: Fan, color: "text-teal-500 bg-teal-100", desc: "Wind-driven rotary vents used for active air circulation." },
  "Insulation (Glass Wool)": { icon: Shield, color: "text-yellow-500 bg-yellow-50", desc: "Thermal and acoustic insulation blanket installed under roofing." },
};

function EditableAccessoryRow({
  accKey, name, spec, defaultQty, defaultPrice, unit, specs, setSpecs
}: {
  accKey: string; name: string; spec: string; defaultQty: number; defaultPrice: number; unit: string; specs: ProjectSpecs; setSpecs: (s: ProjectSpecs) => void;
}) {
  const overrides = specs.accessoryOverrides || {};
  const data = overrides[accKey] || {};
  const qty = data.qty !== undefined ? data.qty : defaultQty;
  const price = data.price !== undefined ? data.price : defaultPrice;

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? undefined : Number(e.target.value);
    setSpecs({
      ...specs,
      materialOverrides: { ...overrides, [accKey]: { ...data, qty: val } }
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? undefined : Number(e.target.value);
    setSpecs({
      ...specs,
      materialOverrides: { ...overrides, [accKey]: { ...data, price: val } }
    });
  };

  const estCost = qty * price;

  return (
    <tr>
      <td className="px-3 py-2 font-medium">{name}</td>
      <td className="px-3 py-2 text-slate-500 text-xs text-nowrap">{spec}</td>
      <td className="px-3 py-2 text-right">
        <div className="flex items-center justify-end gap-1">
          <input type="number" min="0" value={data.qty ?? defaultQty} onChange={handleQtyChange} className="w-16 px-1.5 py-0.5 text-right border border-slate-200 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white shadow-sm" />
          <span className="text-slate-500 whitespace-nowrap text-xs">{unit}</span>
        </div>
      </td>
      <td className="px-3 py-2 text-right">
        <div className="flex items-center justify-end gap-1">
          <span className="text-slate-500 text-xs">₹</span>
          <input type="number" min="0" value={data.price ?? defaultPrice} onChange={handlePriceChange} className="w-16 px-1.5 py-0.5 text-right border border-slate-200 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white shadow-sm" />
          <span className="text-slate-500 whitespace-nowrap text-xs">/{unit.split(' ')[0]}</span>
        </div>
      </td>
      <td className="px-3 py-2 text-right font-medium">₹{Math.round(estCost).toLocaleString('en-IN')}</td>
    </tr>
  );
}

function InteractiveWordText({ text, onWordClick }: { text: string; onWordClick: (word: string) => void }) {
  const dictionaryKeys = useMemo(() => Object.keys(VISUAL_DICTIONARY).sort((a, b) => b.length - a.length), []);
  let result: (string | React.ReactNode)[] = [text];
  
  for (const key of dictionaryKeys) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedKey})`, 'gi');
    
    const newResult: (string | React.ReactNode)[] = [];
    for (const item of result) {
      if (typeof item === 'string') {
        const parts = item.split(regex);
        for (let i = 0; i < parts.length; i++) {
          if (parts[i].toLowerCase() === key.toLowerCase()) {
            newResult.push(
              <button 
                key={`${key}-${i}-${Math.random()}`}
                onClick={(e) => { e.preventDefault(); onWordClick(key); }}
                className="inline-flex items-center font-semibold text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 px-0.5 rounded transition-colors underline decoration-emerald-300/40 underline-offset-4 cursor-pointer align-baseline"
                title="View visual representation"
              >
                {parts[i]}
              </button>
            );
          } else if (parts[i]) {
            newResult.push(parts[i]);
          }
        }
      } else {
        newResult.push(item);
      }
    }
    result = newResult;
  }
  
  return <>{result.map((item, i) => <React.Fragment key={i}>{item}</React.Fragment>)}</>;
}

function TabBar() {
  const tabs = [
    { name: 'Dashboard', options: ['Overview', 'Analytics', 'Reports'] },
    { name: 'Project Details', options: ['Specifications', 'Timeline', 'Budget'] },
    { name: 'Materials', options: ['Primary Steel', 'Secondary Steel', 'Hardware'] },
    { name: 'Settings', options: ['Preferences', 'Account', 'Export'] }
  ];
  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 z-40 relative overflow-x-auto">
      <div className="max-w-7xl mx-auto w-full flex gap-4 sm:gap-6 min-w-max">
        {tabs.map(tab => (
          <div key={tab.name} className="relative group">
            <button className="flex items-center gap-1 px-1 py-4 text-sm font-medium text-slate-600 hover:text-slate-900 border-b-2 border-transparent group-hover:border-blue-600 focus:outline-none transition-colors">
              {tab.name}
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            </button>
            <div className="absolute left-0 mt-0 w-48 bg-white border border-slate-200 shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="py-1">
                {tab.options.map(opt => (
                  <a key={opt} href="#" onClick={(e) => e.preventDefault()} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-blue-600">
                    {opt}
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectCalendar({ estimatedDurationWeeks }: { estimatedDurationWeeks: number }) {
  const today = new Date();
  
  const addWeeks = (date: Date, weeks: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + weeks * 7);
    return d;
  };

  const milestones = [
    { name: 'Project Kickoff', date: addWeeks(today, 0), color: 'bg-slate-500', icon: <CheckCircle2 className="w-4 h-4 text-white" /> },
    { name: 'Fabrication Start', date: addWeeks(today, 2), color: 'bg-blue-500', icon: <Layers className="w-4 h-4 text-white" /> },
    { name: 'Material Delivery', date: addWeeks(today, Math.max(3, estimatedDurationWeeks - 4)), color: 'bg-amber-500', icon: <Truck className="w-4 h-4 text-white" /> },
    { name: 'Erection Complete', date: addWeeks(today, estimatedDurationWeeks), color: 'bg-emerald-500', icon: <CheckCircle2 className="w-4 h-4 text-white" /> },
  ];

  return (
    <div className="relative pt-6 pb-2 px-2 sm:px-6 w-full overflow-x-auto">
      <div className="min-w-[500px] sm:min-w-[600px] relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-10 right-10 h-0.5 bg-slate-200 z-0"></div>

        <div className="relative flex justify-between">
          {milestones.map((milestone, i) => (
            <div key={i} className="flex flex-col items-center relative z-10 w-28">
              <div className={`w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-transform hover:scale-110 ${milestone.color}`}>
                {milestone.icon}
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs font-bold text-slate-700 leading-tight mb-1.5">{milestone.name}</p>
                <div className="inline-block text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                  {milestone.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


const WIZARD_STEPS = [
  { id: 'project', label: '1', name: 'Dimensions & Location' },
  { id: 'primary', label: '2', name: 'Primary Structure' },
  { id: 'secondary', label: '3', name: 'Supporting Structure' },
  { id: 'hardware', label: '4', name: 'Hardware' },
  { id: 'roofing', label: '5', name: 'Roofing' },
  { id: 'walling', label: '6', name: 'Walling' },
  { id: 'accessories', label: '7', name: 'Accessories' },
  { id: 'fasteners', label: '8', name: 'Fasteners' },
  { id: 'takeoff', label: '9', name: 'Takeoff' }
];
const WIZARD_KEYS = WIZARD_STEPS.map(s => s.id);

export default function App() {
  const [specs, setSpecs] = useState<ProjectSpecs>({
    width: 30,
    length: 60,
    eaveHeight: 8,
    roofSlope: 10,
    roofType: 'Single Slope',
    roofProfile: '6v Profile',
    wallProfile: '7v Profile',
    frameType: 'Clear Span',
    deliveryAddress: '',
    deliveryDistance: 0,
    dieselPrice: 90,
    roofColor: '#0089b6',
    wallColor: '#0089b6',
    alternateRoofColors: false,
    alternateWallColors: false,
    alternateRoofColor: '#d3d3d3',
    alternateWallColor: '#d3d3d3',
    alternateRoofPattern: 'stripes',
    alternateWallPattern: 'stripes',
    alternateRoofRatio: 2,
    alternateWallRatio: 2,
    hasRoof: false,
    hasWalls: false,
    hasPrimarySteel: false,
    hasSecondarySteel: false,
    hasGirts: false,
    hasRidgeCap: false,
    ridgeCapColor: '#383e42',
    hasGutters: false,
    gutterColor: '#383e42',
    hasGables: false,
    gableColor: '#383e42',
    hasCornerFlashing: false,
    cornerFlashingColor: '#383e42',
    hasEndFlashing: false,
    endFlashingColor: '#383e42',
    hasDownPipes: false,
    downPipeColor: '#383e42',
    hasTurboVents: false,
    hasLouvers: false,
    louversPosition: 'Left & Right',
    hasInsulation: false,
    distinctSheetColors: false,
    hasPolySheets: false,
    hasMSFlats: false,
    hasSDScrews: false,
    hasSilicon: false,
    hasPVCCaps: false,
    pvcCapColor: '#383e42',
    hasFlanges: false,
    hasProfileGate: false,
    profileGatePosition: 'Front',
    hasWindows: false,
    windowsPosition: 'Left & Right',
    hasCrimpedSheets: false,
    highWindVelocity: false,
    snowLoad: false,
    columnProfile: '2 x 72 x 72 x 6000mm -27kg',
    rafterProfile: '2 x 48 x 96 x 6000mm -27kg',
    purlinProfile: '2 x 38 x 38 x 6000mm -14kg',
    girtProfile: '2 x 38 x 38 x 6000mm -14kg',
    basePlateProfile: '12 x 300 x 300mm -8.5kg',
    nutBoltProfile: '21 x 125mm -0.55kg',
  });

  const [configTab, setConfigTab] = useState('project');
  const [panelColors, setPanelColors] = useState<Record<string, string>>({});
  const [activePhase, setActivePhase] = useState<Phase>('planning');
  const [projectName, setProjectName] = useState('Alpha Warehouse');
  const [dimensionUnit, setDimensionUnit] = useState<'m' | 'ft'>('m');
  const [projectNotes, setProjectNotes] = useState('');
  const [targetBudget, setTargetBudget] = useState(5000000);
  const [showPrimaryDetails, setShowPrimaryDetails] = useState(false);
  const [showSecondaryDetails, setShowSecondaryDetails] = useState(false);
  const [showRoofDetails, setShowRoofDetails] = useState(false);
  const [showWallDetails, setShowWallDetails] = useState(false);
  const [showHardwareDetails, setShowHardwareDetails] = useState(false);
  const [showLifecycleDetails, setShowLifecycleDetails] = useState(false);
  const [showMaterialEstimate, setShowMaterialEstimate] = useState(false);
  const [selectedVisualWord, setSelectedVisualWord] = useState<string | null>(null);
  const [is3DMode, setIs3DMode] = useState(true);
  const [visualizerTab, setVisualizerTab] = useState<'3d-model' | '3d-frame' | 'front-elevation' | 'side-elevation' | 'top-plan'>('3d-model');
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherType, setWeatherType] = useState<'clear' | 'rain' | 'snow' | 'storm'>('clear');
  const [activeLeakSymptom, setActiveLeakSymptom] = useState<'overlap' | 'screw' | 'ridge' | 'gutter' | null>(null);

  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.5);

  // Auto-enable audio when user activates heavy rain or high wind storm
  useEffect(() => {
    if (weatherType === 'rain' || weatherType === 'storm') {
      setIsAudioEnabled(true);
    }
  }, [weatherType]);

  // Handle playing or stopping the procedural rain sound
  useEffect(() => {
    if (isAudioEnabled && (weatherType === 'rain' || weatherType === 'storm')) {
      rainSynthesizer.start(weatherType, audioVolume);
    } else {
      rainSynthesizer.stop();
    }
  }, [isAudioEnabled, weatherType]);

  // Update volume smoothly when volume state changes
  useEffect(() => {
    rainSynthesizer.setVolume(audioVolume);
  }, [audioVolume]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      rainSynthesizer.stop();
    };
  }, []);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [extractedSummary, setExtractedSummary] = useState<string | null>(null);

  // Basic Engineering Estimations
  const area = specs.width * specs.length;
  // Estimate ~35 kg/m2 for clear span, ~22 kg/m2 for truss frame, ~25 kg/m2 for multi-span (very rough conceptual metric)
  const weightFactor = specs.frameType === 'Clear Span' ? 35 : (specs.frameType === 'Truss' ? 22 : 25);
  const targetSteelWeight = (area * weightFactor) / 1000; // in metric tons

  const estimatedDuration = Math.ceil(area / 500) * 2 + 8; // base 8 weeks + variable

  // Material Estimates
  const primarySteel = (targetSteelWeight * 0.65).toFixed(1);
  const secondarySteelWeight = specs.hasGirts !== false ? (targetSteelWeight * 0.25) : (targetSteelWeight * 0.15); // Adjust for girts
  const secondarySteel = secondarySteelWeight.toFixed(1);
  const accessories = (targetSteelWeight * 0.10 * 1000).toFixed(0);
  const roofArea = (area * Math.sqrt(1 + Math.pow(specs.roofSlope / 100, 2))).toFixed(0);
  let calculatedWallArea = 0;
  let avgWallHeight = specs.eaveHeight;
  if (specs.hasWalls !== false) {
    if (specs.roofType === 'Single Slope') {
        const h_right = specs.eaveHeight + specs.width * (specs.roofSlope / 100);
        calculatedWallArea = specs.length * specs.eaveHeight + specs.length * h_right + specs.width * (specs.eaveHeight + h_right);
        avgWallHeight = calculatedWallArea / (2 * (specs.width + specs.length));
    } else if (specs.roofType === 'Multi-Sloped Hut') {
        const h_steep = (specs.width / 4) * (specs.roofSlope * 1.5 / 100);
        const h_shallow = (specs.width / 4) * (specs.roofSlope * 0.5 / 100);
        const endWallArea = specs.width * specs.eaveHeight + 2 * (0.5 * (specs.width / 4) * h_steep) + (specs.width / 2) * h_steep + 2 * (0.5 * (specs.width / 4) * h_shallow);
        calculatedWallArea = specs.length * specs.eaveHeight * 2 + endWallArea * 2;
        avgWallHeight = calculatedWallArea / (2 * (specs.width + specs.length));
    } else if (specs.roofType === 'Curved') {
        const roofH = (specs.width / 2) * (specs.roofSlope / 100) * 1.5;
        const endWallArea = specs.width * specs.eaveHeight + (2/3) * specs.width * roofH;
        calculatedWallArea = specs.length * specs.eaveHeight * 2 + endWallArea * 2;
        avgWallHeight = calculatedWallArea / (2 * (specs.width + specs.length));
    } else {
        const roofH = (specs.width / 2) * (specs.roofSlope / 100);
        const endWallArea = specs.width * specs.eaveHeight + 0.5 * specs.width * roofH;
        calculatedWallArea = specs.length * specs.eaveHeight * 2 + endWallArea * 2;
        avgWallHeight = calculatedWallArea / (2 * (specs.width + specs.length));
    }
  }
  const wallArea = calculatedWallArea.toFixed(0);

  // Detailed Primary Elements Breakdown
  const baySpacing = 6;
  const numFrames = Math.ceil(specs.length / baySpacing) + 1;
  const colsPerFrame = specs.frameType === 'Clear Span' || specs.frameType === 'Truss' ? 2 : 3;
  const totalColumns = numFrames * colsPerFrame;
  let totalRafters = numFrames * 2;
  const rafterLength = Math.sqrt(Math.pow(specs.width / 2, 2) + Math.pow(((specs.width / 2) * specs.roofSlope) / 100, 2)).toFixed(2);

  const embedmentDepth = Math.max(0.6, Math.round(specs.eaveHeight * 0.2 * 10) / 10);
  let columnLinearMeasurement = 0;
  if (specs.frameType === 'Clear Span' || specs.frameType === 'Truss') {
    columnLinearMeasurement = totalColumns * (specs.eaveHeight + embedmentDepth);
  } else {
    // 2 outer columns per frame
    let outerColsLen = numFrames * 2 * (specs.eaveHeight + embedmentDepth);
    // 1 inner column per frame (usually at center)
    let innerColHeight = specs.eaveHeight;
    if (specs.roofType === 'Single Slope') {
       innerColHeight = specs.eaveHeight + (specs.width / 2) * (specs.roofSlope / 100);
    } else if (specs.roofType === 'Multi-Sloped Hut') {
       innerColHeight = specs.eaveHeight + (specs.width / 4) * (specs.roofSlope * 1.5 / 100) + (specs.width / 4) * (specs.roofSlope * 0.5 / 100);
    } else if (specs.roofType === 'Curved') {
       innerColHeight = specs.eaveHeight + (specs.width / 2) * (specs.roofSlope / 100) * 1.5;
    } else {
       innerColHeight = specs.eaveHeight + (specs.width / 2) * (specs.roofSlope / 100);
    }
    // Add embedment to inner columns as well
    columnLinearMeasurement = outerColsLen + (numFrames * (innerColHeight + embedmentDepth));
  }

  let rafterLinearMeasurement = 0;
  let raftersPerFrame = 0;
  if (specs.roofType === 'Single Slope') {
    const totRoofH = specs.width * (specs.roofSlope / 100);
    const rl = Math.sqrt(Math.pow(specs.width, 2) + Math.pow(totRoofH, 2));
    raftersPerFrame = 1;
    rafterLinearMeasurement = rl * numFrames;
  } else if (specs.roofType === 'Multi-Sloped Hut') {
    const h_steep = (specs.width / 4) * (specs.roofSlope * 1.5 / 100);
    const h_shallow = (specs.width / 4) * (specs.roofSlope * 0.5 / 100);
    const rl_steep = Math.sqrt(Math.pow(specs.width / 4, 2) + Math.pow(h_steep, 2));
    const rl_shallow = Math.sqrt(Math.pow(specs.width / 4, 2) + Math.pow(h_shallow, 2));
    raftersPerFrame = 4;
    rafterLinearMeasurement = (rl_steep * 2 + rl_shallow * 2) * numFrames;
  } else if (specs.roofType === 'Curved') {
    const arcLen = specs.width * 1.1;
    raftersPerFrame = 1;
    rafterLinearMeasurement = arcLen * numFrames;
  } else {
    const roofH = (specs.width / 2) * (specs.roofSlope / 100);
    const rl = Math.sqrt(Math.pow(specs.width / 2, 2) + Math.pow(roofH, 2));
    raftersPerFrame = 2;
    rafterLinearMeasurement = (rl * 2) * numFrames;
  }
  totalRafters = numFrames * raftersPerFrame;

  const primaryUnitCost = 85000;
  const fabLaborCost = 15000;
  const erectLaborCost = 10000;
  const primaryTons = parseFloat(primarySteel);

  const getUnitWeight = (profile: string, defaultWeight: number) => {
    const match = profile.match(/-([\d.]+)kg/i);
    return match ? parseFloat(match[1]) : defaultWeight;
  };

  const effectivePrimary = primaryTons * 0.9;
  const colRatio = columnLinearMeasurement / (columnLinearMeasurement + rafterLinearMeasurement || 1);
  const colProfileStr = specs.columnProfile || '2 x 72 x 72 x 6000mm -27kg';
  const rafProfileStr = specs.rafterProfile || '2 x 48 x 96 x 6000mm -27kg';
  const bpsProfileStr = specs.basePlateProfile || '12 x 300 x 300mm -8.5kg';
  const colUnitWt = getUnitWeight(colProfileStr, 27);
  const rafUnitWt = getUnitWeight(rafProfileStr, 27);
  const colPcscalc = Math.ceil(columnLinearMeasurement / 6);
  const rafPcscalc = Math.ceil(rafterLinearMeasurement / 6);

  const primaryMaterialTotal = primaryUnitCost * primaryTons;
  const breakdownColCost = primaryMaterialTotal * 0.9 * colRatio;
  const breakdownRafCost = primaryMaterialTotal * 0.9 * (1 - colRatio);
  const breakdownMiscCost = primaryMaterialTotal * 0.1;

  const detailedSpecs = [
    { label: 'Standard Embedment Depth', value: `${embedmentDepth.toFixed(1)}m`, category: 'Foundation & Civil' },
    { label: 'Grounded Column (Pedestal)', value: '0.6m x 0.6m', category: 'Foundation & Civil' },
    { label: 'Concrete Footing Pad', value: '1.2m x 1.2m x 0.3m thickness (Ensures 0.3m separation from grounded column on all sides)', category: 'Foundation & Civil' },
    { label: 'Excavation Dimensions', value: 'What dimensions are required for the excavation?', category: 'Foundation & Civil' },
    { label: 'Mixing Ratio', value: 'Please specify the concrete mixing ratio.', category: 'Foundation & Civil' },
    { label: 'Required Foundation Materials', value: 'Please provide the necessary materials.', category: 'Foundation & Civil' },
    { label: 'Column Profile', value: colProfileStr, category: 'Specifications' },
    { label: 'Rafter Profile', value: rafProfileStr, category: 'Specifications' },
    { label: 'Base Plate Profiles', value: '12 x 300 x 300mm, 10 x 250 x 250mm, 8 x 200 x 200mm, 6 x 150 x 150mm, 2.5 x 62 x 150mm, 2 x 50 x 150mm', category: 'Specifications' },
    { label: 'Spacing', value: 'Columns & Rafters (Bay Spacing): 6.0m center-to-center', category: 'Specifications' },
    { label: 'Length', value: `Columns: ~${(specs.eaveHeight + embedmentDepth).toFixed(1)}m (includes ${embedmentDepth}m embedment), Rafters: ~${rafterLength}m`, category: 'Specifications' },
    { label: 'Thickness', value: 'What is the specified thickness?', category: 'Specifications' },
    { label: 'Weight', value: `${primarySteel} Metric Tons (Combined)`, category: 'Logistics & Quantity' },
    { label: 'Quantity (Calculated)', value: `${colPcscalc} sections & ${rafPcscalc} sections (6m stock)`, category: 'Logistics & Quantity' },
    { label: 'Anticipated Columns', value: `${totalColumns} columns`, category: 'Logistics & Quantity' },
    { label: 'Column Linear Measurement', value: `${dimensionUnit === 'ft' ? (columnLinearMeasurement * 3.28084).toFixed(1) : columnLinearMeasurement.toFixed(1)} ${dimensionUnit === 'ft' ? 'ft' : 'meters'}`, category: 'Specifications' },
    { label: 'Rafter Linear Measurement', value: `${dimensionUnit === 'ft' ? (rafterLinearMeasurement * 3.28084).toFixed(1) : rafterLinearMeasurement.toFixed(1)} ${dimensionUnit === 'ft' ? 'ft' : 'meters'}`, category: 'Specifications' },
    { label: 'Rafter Projected Rows', value: `${numFrames} rows (${raftersPerFrame} per frame)`, category: 'Specifications' },
    { label: 'Transport', value: `~${Math.ceil(primaryTons / 4.5)} journeys (4.5 MT payload limit)`, category: 'Logistics & Quantity' },
    { label: 'Full Address with pincode', value: specs.deliveryAddress || 'Not specified', category: 'Logistics & Quantity' },
    { label: 'Equipment & Tools', value: 'Pipe cutting tools, Welding machines, Cutting wheels, Grinders, Hand tools, 50t Mobile Crane, Manlifts, Ladders, Painting Brushes', category: 'Logistics & Quantity' },
    { label: 'Price (Material)', value: `₹${Math.round(primaryUnitCost * primaryTons).toLocaleString('en-IN')} (₹${primaryUnitCost.toLocaleString('en-IN')}/ton avg)`, category: 'Financials' },
    { label: 'Labor Cost', value: `₹${Math.round((fabLaborCost + erectLaborCost) * primaryTons).toLocaleString('en-IN')} (Fab + Erection)`, category: 'Financials' },
    { label: 'Total Est. Cost', value: `₹${Math.round((primaryUnitCost + fabLaborCost + erectLaborCost) * primaryTons).toLocaleString('en-IN')} (Turnkey Primary Steel)`, category: 'Financials' },
    { label: 'Components & Consumables', value: 'M.S. Pipe frames, Base plates, Gusset plates, Stiffeners, Welding consumables, Red Oxide Primer, Synthetic Enamel Paint', category: 'Components & Process' },
    { label: 'Hardware', value: 'ASTM A325/A490 High-Strength Bolts, Base Anchor Bolts', category: 'Components & Process' },
    { label: 'Steps', value: 'Pipe Cutting → Profiling → Fit-up → Welding → Shotblasting → Primer/Paint → Site Bolting', category: 'Components & Process' },
  ];

  // Detailed Secondary Elements Breakdown
  const secondaryUnitCost = 75000;
  const secondaryFabLaborCost = 8000;
  const secondaryErectLaborCost = 7000;
  const secondaryTons = parseFloat(secondarySteel);

  const purlinSpacing = specs.highWindVelocity || specs.snowLoad ? 1.0 : 1.5;
  let purlinRunsPerFrame = 0;

  if (specs.roofType === 'Single Slope') {
    const totRoofH = specs.width * (specs.roofSlope / 100);
    const rl = Math.sqrt(specs.width * specs.width + totRoofH * totRoofH);
    purlinRunsPerFrame = Math.max(1, Math.round(rl / purlinSpacing)) + 1;
  } else if (specs.roofType === 'Multi-Sloped Hut') {
    const h_steep = (specs.width / 4) * (specs.roofSlope * 1.5 / 100);
    const h_shallow = (specs.width / 4) * (specs.roofSlope * 0.5 / 100);
    const rl_steep = Math.sqrt((specs.width / 4) * (specs.width / 4) + h_steep * h_steep);
    const rl_shallow = Math.sqrt((specs.width / 4) * (specs.width / 4) + h_shallow * h_shallow);
    const runsSteep = Math.max(1, Math.round(rl_steep / purlinSpacing));
    const runsShallow = Math.max(1, Math.round(rl_shallow / purlinSpacing));
    purlinRunsPerFrame = (runsSteep + runsShallow) * 2 + 1;
  } else if (specs.roofType === 'Curved') {
    purlinRunsPerFrame = 1; // Just ridge for visualizer now, but maybe should be estimated roughly
    const arcLen = specs.width * 1.1; // generic approximation
    purlinRunsPerFrame = Math.max(1, Math.round(arcLen / purlinSpacing)) + 1;
  } else {
    // Standard Hut
    const runsPerSlope = Math.max(1, Math.round(parseFloat(rafterLength) / purlinSpacing));
    purlinRunsPerFrame = runsPerSlope * 2 + 1;
  }
  
  const purlinRuns = purlinRunsPerFrame;
  const totalPurlins = purlinRunsPerFrame * (numFrames - 1); 

  const girtSpacing = specs.highWindVelocity || specs.snowLoad ? 1.0 : 1.5;
  const girtRuns = Math.ceil(specs.eaveHeight / girtSpacing) + 1; // +1 for base girt
  const sideGirts = girtRuns * (numFrames - 1) * 2;
  const endGirts = girtRuns * Math.ceil(specs.width / baySpacing) * 2;
  const totalGirts = sideGirts + endGirts;

  const effectiveSecondary = secondaryTons * 0.9;
  const purlinRatio = totalPurlins / ((totalPurlins + totalGirts) || 1);
  const purlinProfileStr = specs.purlinProfile || '2 x 38 x 38 x 6000mm -14kg';
  const girtProfileStr = specs.girtProfile || '2 x 38 x 38 x 6000mm -14kg';

  const purlinUnitWt = getUnitWeight(purlinProfileStr, 14);
  const girtUnitWt = getUnitWeight(girtProfileStr, 14);
  const purlinPcsCalc = Math.ceil((effectiveSecondary * purlinRatio * 1000) / purlinUnitWt);
  const girtPcsCalc = Math.ceil((effectiveSecondary * (1 - purlinRatio) * 1000) / girtUnitWt);

  const secondaryDetailedSpecs = [
    { label: 'Purlin Profile', value: purlinProfileStr, category: 'Specifications' },
    { label: 'Girt Profile', value: girtProfileStr, category: 'Specifications' },
    { label: 'Spacing (Purlins)', value: `${purlinSpacing}m center-to-center`, category: 'Specifications' },
    ...(specs.hasGirts !== false ? [{ label: 'Spacing (Girts)', value: `${girtSpacing}m center-to-center`, category: 'Specifications' }] : []),
    { label: 'Length', value: `Standard Bay Length (~${baySpacing}m, continuous/overlapped)`, category: 'Specifications' },
    { label: 'Thickness', value: 'What is the specified thickness?', category: 'Specifications' },
    { label: 'Weight', value: `${secondarySteel} Metric Tons (Combined)`, category: 'Logistics & Quantity' },
    { label: 'Purlins Required Quantity (Calculated)', value: `${purlinPcsCalc} pieces`, category: 'Logistics & Quantity' },
    { label: 'Purlins Linear Measurement per Row', value: `${dimensionUnit === 'ft' ? (specs.length * 3.28084).toFixed(1) : specs.length} ${dimensionUnit === 'ft' ? 'ft' : 'meters'}`, category: 'Specifications' },
    { label: 'Purlins Anticipated Rows', value: `${purlinRuns} rows`, category: 'Specifications' },
    ...(specs.hasGirts !== false ? [
      { label: 'Girts Required Quantity (Calculated)', value: `${girtPcsCalc} pieces`, category: 'Logistics & Quantity' },
      { label: 'Girts Linear Measurement per Row (Side Walls)', value: `${dimensionUnit === 'ft' ? (specs.length * 3.28084).toFixed(1) : specs.length} ${dimensionUnit === 'ft' ? 'ft' : 'meters'}`, category: 'Specifications' },
      { label: 'Girts Anticipated Rows (Side Walls)', value: `${girtRuns} rows per side`, category: 'Specifications' },
      { label: 'Girts Linear Measurement per Row (End Walls)', value: `${dimensionUnit === 'ft' ? (specs.width * 3.28084).toFixed(1) : specs.width} ${dimensionUnit === 'ft' ? 'ft' : 'meters'}`, category: 'Specifications' },
      { label: 'Girts Anticipated Rows (End Walls)', value: `${girtRuns} rows per end`, category: 'Specifications' }
    ] : []),
    { label: 'Transport', value: `~${Math.ceil(secondaryTons / 4.5)} journeys (4.5 MT payload limit)`, category: 'Logistics & Quantity' },
    { label: 'Full Address with pincode', value: specs.deliveryAddress || 'Not specified', category: 'Logistics & Quantity' },
    { label: 'Equipment & Tools', value: 'Pipe cutting tools, Welding machines, Cutting wheels, Grinders, Hand tools', category: 'Logistics & Quantity' },
    { label: 'Price (Material)', value: `₹${Math.round(secondaryUnitCost * secondaryTons).toLocaleString('en-IN')} (₹${secondaryUnitCost.toLocaleString('en-IN')}/ton avg)`, category: 'Financials' },
    { label: 'Labor Cost', value: `₹${Math.round((secondaryFabLaborCost + secondaryErectLaborCost) * secondaryTons).toLocaleString('en-IN')} (Fabrication + Erection)`, category: 'Financials' },
    { label: 'Total Est. Cost', value: `₹${Math.round((secondaryUnitCost + secondaryFabLaborCost + secondaryErectLaborCost) * secondaryTons).toLocaleString('en-IN')} (Turnkey Secondary Steel)`, category: 'Financials' },
    { label: 'Components', value: `M.S. Pipe Purlins, ${specs.hasGirts !== false ? 'M.S. Pipe Girts, ' : ''}Eave struts, Sag rods, Brace pipes, Gusset plates`, category: 'Components & Process' },
    { label: 'Hardware', value: 'Machine Bolts, Self-drilling screws, Welding consumables', category: 'Components & Process' },
    { label: 'Steps', value: 'Pipe Cutting → Fit-up → Welding/Punching → Primer/Paint → Site Erection & Bolting', category: 'Components & Process' },
  ];

  const roofUnitCost = 450;
  const roofLaborCost = 50;
  const roofAreaNum = parseFloat(roofArea);

  const wallUnitCost = 420;
  const wallLaborCost = 45;
  const wallAreaNum = parseFloat(wallArea);

  // Sheet individual units
  const roofEffWidth = specs.roofProfile === '6v Profile' ? 0.99 : (specs.roofProfile === '7v Profile' ? 1.188 : 1.0);
  const roofSlopeFactor = Math.sqrt(1 + Math.pow(specs.roofSlope / 100, 2));
  const sheetLengthRoof = specs.roofType === 'Single Slope' ? (specs.width * roofSlopeFactor) : ((specs.width / 2) * roofSlopeFactor);
  const roofSides = specs.roofType === 'Single Slope' ? 1 : 2;
  const roofSegments = Math.ceil(sheetLengthRoof / 6);
  const roofOverlap = 0.2; // 200mm end overlap
  const actualRoofSheetLength = roofSegments > 1 ? (sheetLengthRoof + (roofSegments - 1) * roofOverlap) / roofSegments : sheetLengthRoof;
  
  const roofSheetsPerSideLength = Math.ceil(specs.length / roofEffWidth);
  let totalRoofSegments = roofSheetsPerSideLength * roofSides * roofSegments;

  let numPolySheets = 0;
  if (specs.hasPolySheets !== false) {
    let polyColsPerSide = 0;
    for (let i = 0; i < roofSheetsPerSideLength; i++) {
       if (i % 6 === 3) polyColsPerSide++;
    }
    const polySegmentsPerCol = roofSegments >= 3 ? 1 : roofSegments; 
    numPolySheets = polyColsPerSide * roofSides * polySegmentsPerCol;
  }

  const numRoofSheets = totalRoofSegments - numPolySheets;
  
  let numAltRoofSheets = 0;
  if (specs.alternateRoofColors) {
    const ratio = specs.alternateRoofRatio || 2;
    const pattern = specs.alternateRoofPattern || 'stripes';
    for (let s = 0; s < roofSides; s++) {
      for (let i = 0; i < roofSheetsPerSideLength; i++) {
        for (let j = 0; j < roofSegments; j++) {
          let isAlt = false;
          if (pattern === 'checkerboard') {
            isAlt = (i + j) % ratio === (ratio - 1);
          } else if (pattern === 'bands') {
            isAlt = (j % ratio) === (ratio - 1);
          } else if (pattern === 'edges') {
            isAlt = i === 0 || i === roofSheetsPerSideLength - 1;
          } else if (pattern === 'center') {
            const mid = Math.floor(roofSheetsPerSideLength / 2);
            const spread = Math.max(1, Math.floor(roofSheetsPerSideLength / (ratio * 2)));
            isAlt = Math.abs(i - mid) < spread;
          } else {
            isAlt = (i % ratio) === (ratio - 1);
          }
          if (isAlt) numAltRoofSheets++;
        }
      }
    }
    // We should probably subtract poly sheets from alternate sheets if poly happens on an alt row. 
    // But keeping it simple for now or adjusting it completely.
  }
  const numMainRoofSheets = numRoofSheets - numAltRoofSheets;

  const roofAreaPerSheet = roofEffWidth * actualRoofSheetLength;
  const costPerRoofSheet = roofAreaPerSheet * roofUnitCost;
  const laborPerRoofSheet = roofAreaPerSheet * roofLaborCost;

  const wallEffWidth = specs.wallProfile === '6v Profile' ? 0.99 : (specs.wallProfile === '7v Profile' ? 1.188 : 1.0);
  const wallSheetsLength = Math.ceil(specs.length / wallEffWidth);
  const wallSheetsWidth = Math.ceil(specs.width / wallEffWidth);
  const numWallSheetsLength = wallSheetsLength * 2;
  const numWallSheetsWidth = wallSheetsWidth * 2;
  const wallSegments = Math.ceil(avgWallHeight / 6);
  const wallOverlap = 0.15; // 150mm end lap
  const actualWallSheetLength = wallSegments > 1 ? (avgWallHeight + (wallSegments - 1) * wallOverlap) / wallSegments : avgWallHeight;
  const totalWallSheets = (numWallSheetsLength + numWallSheetsWidth) * wallSegments;

  let numAltWallSheets = 0;
  if (specs.alternateWallColors) {
    const ratio = specs.alternateWallRatio || 2;
    const pattern = specs.alternateWallPattern || 'stripes';
    
    const countSides = (count: number) => {
      let result = 0;
      for (let s = 0; s < 2; s++) { // 2 sides (left/right or front/back)
        for (let i = 0; i < count; i++) {
          for (let j = 0; j < wallSegments; j++) {
             let isAlt = false;
             if (pattern === 'checkerboard') {
               isAlt = (i + j) % ratio === (ratio - 1);
             } else if (pattern === 'bands') {
               isAlt = (j % ratio) === (ratio - 1);
             } else if (pattern === 'edges') {
               isAlt = i === 0 || i === count - 1;
             } else if (pattern === 'center') {
               const mid = Math.floor(count / 2);
               const spread = Math.max(1, Math.floor(count / (ratio * 2)));
               isAlt = Math.abs(i - mid) < spread;
             } else {
               isAlt = (i % ratio) === (ratio - 1);
             }
             if (isAlt) result++;
          }
        }
      }
      return result;
    }
    
    numAltWallSheets = countSides(wallSheetsLength) + countSides(wallSheetsWidth);
  }
  const numMainWallSheets = totalWallSheets - numAltWallSheets;

  const wallAreaPerSheet = wallEffWidth * actualWallSheetLength;
  const costPerWallSheet = wallAreaPerSheet * wallUnitCost;
  const laborPerWallSheet = wallAreaPerSheet * wallLaborCost;

  const roofColorName = STANDARD_COLORS.find(c => c.hex === specs.roofColor)?.name || 'Custom';
  const altRoofColorName = STANDARD_COLORS.find(c => c.hex === specs.alternateRoofColor)?.name || 'Custom';

  const roofDetailedSpecs = [
    { label: 'Profile', value: specs.roofType === 'Curved' ? 'Curved & Crimped' : (specs.roofProfile === '7v Profile' ? '7v Profile (Trapezoidal)' : (specs.roofProfile === '6v Profile' ? '6v Profile (Trapezoidal)' : 'Trapezoidal Profile Sheet')), category: 'Specifications' },
    { label: 'Quantity', value: specs.alternateRoofColors ? `${numRoofSheets} individual sheets total (${numMainRoofSheets} Primary, ${numAltRoofSheets} Alternate)` : `${numRoofSheets} individual sheets required (Total area ~${dimensionUnit === 'ft' ? (parseFloat(roofArea) * 10.7639).toFixed(0) : roofArea} ${dimensionUnit === 'ft' ? 'sq.ft' : 'm²'})`, category: 'Specifications' },
    { label: 'Length', value: roofSegments > 1 ? `Cut to ${dimensionUnit === 'ft' ? (actualRoofSheetLength * 3.28084).toFixed(1) + ' ft' : actualRoofSheetLength.toFixed(1) + ' m'} (${roofSegments} joined segments with ${dimensionUnit === 'ft' ? (roofOverlap * 3.28084).toFixed(1) + ' ft' : Math.round(roofOverlap * 1000) + ' mm'} end lap)` : `Cut to ${dimensionUnit === 'ft' ? (actualRoofSheetLength * 3.28084).toFixed(1) + ' ft' : actualRoofSheetLength.toFixed(1) + ' m'}`, category: 'Specifications' },
    { label: 'Width', value: specs.roofProfile === '7v Profile' ? 'Covered width: 1188mm / Total width: 1253mm / Required coil width: 1450mm' : (specs.roofProfile === '6v Profile' ? 'Covered width: 990mm / Total width: 1055mm / Required coil width: 1250mm' : '1060 mm (Effective Cover Width 1000 mm)'), category: 'Specifications' },
    { label: 'Thickness', value: specs.highWindVelocity || specs.snowLoad ? '0.60 mm / 0.65 mm (Reinforced thick gauge)' : '0.47 mm / 0.50 mm (Bare Galvalume or Color Coated)', category: 'Specifications' },
    { label: 'Color', value: specs.alternateRoofColors ? `${roofColorName} (Primary), ${altRoofColorName} (Alternate)` : `${roofColorName} / Color Coated Galvalume`, category: 'Specifications' },
    { label: 'Installation Steps', value: 'Eave alignment → Lifting sheets to roof → Fixing with 12-14 x 55mm self-drilling screws → Applying butyl tape at overlaps → Plain ridge & flashing installation', category: 'Installation Procedures' },
    { label: 'Full Address with pincode', value: specs.deliveryAddress || 'Not specified', category: 'Logistics' },
    { label: 'Price (Material)', value: `₹${Math.round(roofUnitCost * roofAreaNum).toLocaleString('en-IN')} (₹${roofUnitCost}/{dimensionUnit === 'ft' ? ' sq.ft' : ' m²'})`, category: 'Financials' },
    { label: 'Labor Cost', value: `₹${Math.round(roofLaborCost * roofAreaNum).toLocaleString('en-IN')} (Installation)`, category: 'Financials' },
    { label: 'Total Est. Cost', value: `₹${Math.round((roofUnitCost + roofLaborCost) * roofAreaNum).toLocaleString('en-IN')} (Installed)`, category: 'Financials' },
  ];

  const wallColorName = STANDARD_COLORS.find(c => c.hex === specs.wallColor)?.name || 'Custom';
  const altWallColorName = STANDARD_COLORS.find(c => c.hex === specs.alternateWallColor)?.name || 'Custom';

  const wallDetailedSpecs = [
    { label: 'Profile', value: specs.wallProfile === '7v Profile' ? '7v Profile (Trapezoidal)' : (specs.wallProfile === '6v Profile' ? '6v Profile (Trapezoidal)' : 'Trapezoidal Profile Sheet'), category: 'Specifications' },
    { label: 'Quantity', value: specs.alternateWallColors ? `${totalWallSheets} individual sheets total (${numMainWallSheets} Primary, ${numAltWallSheets} Alternate)` : `${totalWallSheets} individual sheets required (Total area ~${dimensionUnit === 'ft' ? (parseFloat(wallArea) * 10.7639).toFixed(0) : wallArea} ${dimensionUnit === 'ft' ? 'sq.ft' : 'm²'})`, category: 'Specifications' },
    { label: 'Length', value: wallSegments > 1 ? `Cut to ${dimensionUnit === 'ft' ? (actualWallSheetLength * 3.28084).toFixed(1) + ' ft' : actualWallSheetLength.toFixed(1) + ' m'} (${wallSegments} joined segments with ${dimensionUnit === 'ft' ? (wallOverlap * 3.28084).toFixed(1) + ' ft' : Math.round(wallOverlap * 1000) + ' mm'} end lap)` : `Cut to ${dimensionUnit === 'ft' ? (actualWallSheetLength * 3.28084).toFixed(1) + ' ft' : actualWallSheetLength.toFixed(1) + ' m'}`, category: 'Specifications' },
    { label: 'Width', value: specs.wallProfile === '7v Profile' ? 'Covered width: 1188mm / Total width: 1253mm / Required coil width: 1450mm' : (specs.wallProfile === '6v Profile' ? 'Covered width: 990mm / Total width: 1055mm / Required coil width: 1250mm' : '1060 mm (Effective Cover Width 1000 mm)'), category: 'Specifications' },
    { label: 'Thickness', value: specs.highWindVelocity || specs.snowLoad ? '0.60 mm / 0.65 mm (Reinforced thick gauge)' : '0.47 mm / 0.50 mm (Color Coated Galvalume)', category: 'Specifications' },
    { label: 'Color', value: specs.alternateWallColors ? `${wallColorName} (Primary), ${altWallColorName} (Alternate)` : `${wallColorName} / Color Coated Galvalume`, category: 'Specifications' },
    { label: 'Installation Steps', value: 'Setting base drip angle → Plumb alignment of first sheet → Fixing with 12-14 x 25mm self-drilling screws secured from the exterior side to girts (positioned at center of pitch, not on V-groove) → Successive overlapping → Corner & opening flashings', category: 'Installation Procedures' },
    { label: 'Full Address with pincode', value: specs.deliveryAddress || 'Not specified', category: 'Logistics' },
    { label: 'Price (Material)', value: `₹${Math.round(wallUnitCost * wallAreaNum).toLocaleString('en-IN')} (₹${wallUnitCost}/{dimensionUnit === 'ft' ? ' sq.ft' : ' m²'})`, category: 'Financials' },
    { label: 'Labor Cost', value: `₹${Math.round(wallLaborCost * wallAreaNum).toLocaleString('en-IN')} (Installation)`, category: 'Financials' },
    { label: 'Total Est. Cost', value: `₹${Math.round((wallUnitCost + wallLaborCost) * wallAreaNum).toLocaleString('en-IN')} (Installed)`, category: 'Financials' },
  ];

  const hardwareUnitCostPerKg = 180;
  const hardwareQty = parseFloat(accessories);
  const nutBoltProfileStr = specs.nutBoltProfile || '21 x 125mm -0.55kg';
  const nbUnitWt = getUnitWeight(nutBoltProfileStr, 0.45);
  const primaryPcsForBasePlatesEst = totalColumns;
  const hardwarePcsCalc = primaryPcsForBasePlatesEst > 0 ? primaryPcsForBasePlatesEst * 2 : Math.ceil(hardwareQty / nbUnitWt);

  const hardwareDetailedSpecs = [
    { label: 'Nut Bolt Profiles', value: '21 x 125mm, 18 x 100mm, 15 x 75mm, 12 x 50mm', category: 'Items' },
    { label: 'Components', value: 'High-Strength Bolts (A325/A490), Anchor Bolts, Machine Bolts', category: 'Items' },
    { label: 'Self-Drilling Screws', value: '12-14 x 55mm (Roofing) / 12-14 x 25mm (Wall) Hex Head (with EPDM Washers)', category: 'Items' },
    { label: 'Weight', value: `${accessories} kg`, category: 'Specifications' },
    { label: 'Quantity (Est)', value: `${primaryPcsForBasePlatesEst * 4} main bolts + ${primaryPcsForBasePlatesEst * 4} secondary bolts + purlin/girt bolts`, category: 'Specifications' },
    { label: 'Size', value: '21mm / 18mm / 15mm / 12mm', category: 'Specifications' },
    { label: 'Fastening Procedure', value: 'Foundation anchor bolt layout & casting → Base plate positioning & bolt tightening → Main frame connections with high-strength bolts (Torque wrench method) → Secondary members with standard machine bolts → Cladding & Roofing with self-drilling screws ensuring proper EPDM compression', category: 'Installation Procedures' },
    { label: 'Full Address with pincode', value: specs.deliveryAddress || 'Not specified', category: 'Logistics' },
    { label: 'Price (Material)', value: `₹${Math.round(hardwareUnitCostPerKg * hardwareQty).toLocaleString('en-IN')} (₹${hardwareUnitCostPerKg}/kg average)`, category: 'Financials' },
    { label: 'Total Est. Cost', value: `₹${Math.round(hardwareUnitCostPerKg * hardwareQty).toLocaleString('en-IN')} (Material only - Labor included in Primary/Secondary steel)`, category: 'Financials' },
  ];

  const lifecycleDetailedSpecs = [
    { label: 'Pressure Resistance', value: 'Designed to withstand calculated wind load (basic wind speed) and live load based on ASCE 7.', category: 'Structural Implications' },
    { label: 'Deformation Limits', value: 'Maximum allowable deflection for roof beams (L/180) and building drift (H/300) maintained.', category: 'Structural Implications' },
    { label: 'Total Base Weight', value: `Combined dead load equivalent: ~${targetSteelWeight.toFixed(2)} Metric Tons.`, category: 'Structural Implications' },
    { label: 'Lifecycle (Durability)', value: 'Designed for a 50+ year structural lifecycle with appropriate anti-corrosion coating maintenance.', category: 'Lifecycle Assessment' },
    { label: 'Depreciation', value: 'Accelerated depreciation potential (typically 3-10% per annum depending on regional tax codes) owing to pre-engineered steel asset classification.', category: 'Financials' },
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError(null);
    setExtractedSummary(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const response = await fetch("/api/identify-specs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: base64String,
            mimeType: file.type,
          }),
        });

        const text = await response.text();
        let resData: any;
        try {
          resData = JSON.parse(text);
        } catch (e) {
          throw new Error(text || "Failed to parse server response as JSON");
        }

        if (!response.ok) {
          throw new Error(resData?.error || resData?.message || text || "Failed to analyze image");
        }

        if (resData.success && resData.data) {
          const data = resData.data;

          const isFt = data.dimensionUnit === 'ft';
          setDimensionUnit(isFt ? 'ft' : 'm');

          setSpecs((prev: ProjectSpecs) => {
            const nextSpecs = { ...prev };
            
            if (data.width !== undefined) {
              nextSpecs.width = isFt ? data.width * 0.3048 : data.width;
            }
            if (data.length !== undefined) {
              nextSpecs.length = isFt ? data.length * 0.3048 : data.length;
            }
            if (data.eaveHeight !== undefined) {
              nextSpecs.eaveHeight = isFt ? data.eaveHeight * 0.3048 : data.eaveHeight;
            }
            if (data.roofSlope !== undefined) {
              nextSpecs.roofSlope = data.roofSlope;
            }
            if (data.roofType !== undefined) {
              nextSpecs.roofType = data.roofType;
            }
            if (data.hasWalls !== undefined) {
              nextSpecs.hasWalls = data.hasWalls;
            }
            if (data.hasRoof !== undefined) {
              nextSpecs.hasRoof = data.hasRoof;
            }

            nextSpecs.hasPrimarySteel = data.hasPrimarySteel !== false;
            nextSpecs.hasSecondarySteel = data.hasSecondarySteel !== false;
            nextSpecs.hasGirts = data.hasGirts !== false;

            if (data.columnProfile) nextSpecs.columnProfile = data.columnProfile;
            if (data.rafterProfile) nextSpecs.rafterProfile = data.rafterProfile;
            if (data.purlinProfile) nextSpecs.purlinProfile = data.purlinProfile;
            if (data.girtProfile) nextSpecs.girtProfile = data.girtProfile;

            if (data.additionalItems && Array.isArray(data.additionalItems)) {
              nextSpecs.additionalItems = data.additionalItems.map((item: any) => ({
                id: item.id || `item_${Math.random().toString(36).substr(2, 9)}`,
                name: item.name,
                unit: item.unit || 'units',
                qty: item.qty !== undefined ? item.qty : '',
                price: item.price !== undefined ? item.price : ''
              }));
            }

            return nextSpecs;
          });

          setExtractedSummary(data.summary || "Successfully identified specifications and updated Bill of Materials.");
          
          setTimeout(() => {
            setConfigTab('takeoff');
          }, 500);
        } else {
          throw new Error("Invalid response format from server");
        }
      } catch (error: any) {
        console.error("Error identifying specs:", error);
        setUploadError(error.message || "Failed to analyze image. Please try again.");
      } finally {
        setIsUploadingImage(false);
      }
    };

    reader.onerror = () => {
      setUploadError("Failed to read image file.");
      setIsUploadingImage(false);
    };

    reader.readAsDataURL(file);
  };

  const handleSpecChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSpecs((prev) => ({
      ...prev,
      [name]: (name === 'frameType' || name === 'roofType' || name === 'deliveryAddress') ? value : Number(value) || 0,
    }));
  };

  useEffect(() => {
    const address = specs.deliveryAddress;
    if (!address) return;
    
    const pincodeMatch = address.match(/\b\d{6}\b/);
    if (!pincodeMatch) return;
    
    const pincode = pincodeMatch[0];
    
    const timeoutId = setTimeout(async () => {
      try {
        const nominatimRes = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=india&format=json`);
        const geocode = await nominatimRes.json();
        
        if (geocode && geocode.length > 0) {
          const lat = parseFloat(geocode[0].lat);
          const lon = parseFloat(geocode[0].lon);
          
          const originLat = 23.2941;
          const originLon = 79.9863;
          
          const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${originLon},${originLat};${lon},${lat}?overview=false`);
          const routeData = await osrmRes.json();
          
          if (routeData.routes && routeData.routes.length > 0) {
            const distanceKm = Math.round(routeData.routes[0].distance / 1000);
            setSpecs(prev => prev.deliveryDistance === distanceKm ? prev : { ...prev, deliveryDistance: distanceKm });
          }
        }
      } catch (e) {
        console.error("Failed to geocode or route", e);
      }
    }, 1500);
    
    return () => clearTimeout(timeoutId);
  }, [specs.deliveryAddress]);

  const phases = [
    {
      id: 'planning',
      title: 'Conceptual Planning',
      icon: <Building className="w-5 h-5" />,
      description: 'Define dimensions, loads, and functional requirements.',
      status: 'active',
    },
    {
      id: 'engineering',
      title: 'Structural Engineering',
      icon: <DraftingCompass className="w-5 h-5" />,
      description: 'Detailing and creation of fabrication blueprints.',
      status: 'pending',
    },
    {
      id: 'fabrication',
      title: 'Fabrication',
      icon: <Layers className="w-5 h-5" />,
      description: 'Cutting, welding, and painting primary & secondary members.',
      status: 'pending',
    },
    {
      id: 'delivery',
      title: 'Logistics & Delivery',
      icon: <Truck className="w-5 h-5" />,
      description: 'Site staging and sequential material delivery.',
      status: 'pending',
    },
    {
      id: 'erection',
      title: 'Assembly & Erection',
      icon: <Wrench className="w-5 h-5" />,
      description: 'On-site bolting, sheeting, and final inspections.',
      status: 'pending',
    },
  ];

  const louverCount = useMemo(() => {
    if (specs.hasLouvers === false || specs.hasWalls === false) return 0;
    const pos = specs.louversPosition || 'Left & Right';
    let count = 0;
    if (pos === 'Left' || pos === 'Right') count += Math.floor(specs.length / 6);
    if (pos === 'Left & Right' || pos === 'All Sides') count += Math.floor(specs.length / 6) * 2;
    if (pos === 'Front' || pos === 'Back') count += Math.floor(specs.width / 6);
    if (pos === 'Front & Back' || pos === 'All Sides') count += Math.floor(specs.width / 6) * 2;
    return count;
  }, [specs]);

  const windowCount = useMemo(() => {
    if (specs.hasWindows === false || specs.hasWalls === false) return 0;
    const pos = specs.windowsPosition || 'Left & Right';
    let count = 0;
    if (pos === 'Left' || pos === 'Right') count += Math.floor(specs.length / 5);
    if (pos === 'Left & Right' || pos === 'All Sides') count += Math.floor(specs.length / 5) * 2;
    if (pos === 'Front' || pos === 'Back') count += Math.floor(specs.width / 5);
    if (pos === 'Front & Back' || pos === 'All Sides') count += Math.floor(specs.width / 5) * 2;
    return count;
  }, [specs]);

  const totalPrimaryCost = specs.hasPrimarySteel !== false ? (primaryUnitCost + fabLaborCost + erectLaborCost) * primaryTons : 0;
  const totalSecondaryCost = specs.hasSecondarySteel !== false ? (secondaryUnitCost + secondaryFabLaborCost + secondaryErectLaborCost) * secondaryTons : 0;

  const totalRoofCost = specs.hasRoof !== false ? (costPerRoofSheet + laborPerRoofSheet) * numRoofSheets : 0;
  const totalWallCost = specs.hasWalls !== false ? (costPerWallSheet + laborPerWallSheet) * totalWallSheets : 0;
  const totalHardwareCost = (specs.hasPrimarySteel !== false || specs.hasSecondarySteel !== false) ? hardwareUnitCostPerKg * hardwareQty : 0;

  const getAcc = (key: string, defaultQty: number, defaultPrice: number) => {
    const o = specs.accessoryOverrides?.[key];
    const qty = o?.qty !== undefined ? o.qty : defaultQty;
    const price = o?.price !== undefined ? o.price : defaultPrice;
    return qty * price;
  };

  const getLinearSegments = (totalLen: number, segmentsConfig: {len: number, runs: number}[], costPerMeter: number, maxSeg: number = 3, minLap: number = 0.2) => {
    let totalCount = 0;
    let mainCutLen = 0;
    let validRuns = 0;
    segmentsConfig.forEach(cfg => {
        if (cfg.len <= 0 || cfg.runs <= 0) return;
        validRuns += cfg.runs;
        let countPerRun;
        let cutLen;
        if (cfg.len <= maxSeg) {
            countPerRun = 1;
            cutLen = cfg.len;
        } else {
            countPerRun = Math.ceil((cfg.len - minLap) / (maxSeg - minLap));
            cutLen = (cfg.len + (countPerRun - 1) * minLap) / countPerRun;
        }
        totalCount += countPerRun * cfg.runs;
        mainCutLen = cutLen;
    });
    if (validRuns === 0) return { count: 0, cutLength: 0, piecePrice: 0 };
    return { count: totalCount, cutLength: Number(mainCutLen.toFixed(2)), piecePrice: Number((mainCutLen * costPerMeter).toFixed(2)) };
  };

  const calcAcc = (configList: {len: number, runs: number}[], costPerMeter: number) => {
     let totalLen = 0;
     configList.forEach(c => totalLen += c.len * c.runs);
     return getLinearSegments(totalLen, configList, costPerMeter);
  };

  let totalAccessoriesCost = 0;
  if (specs.hasRoof !== false) {
    if (specs.hasRidgeCap !== false && specs.roofType !== 'Single Slope') {
      const seg = calcAcc([{len: specs.length, runs: 1}], 350);
      totalAccessoriesCost += getAcc("ridgeCap", seg.count, seg.piecePrice);
    }
    if (specs.hasGutters !== false) {
      const runs = specs.roofType === 'Single Slope' ? 1 : 2;
      const seg = calcAcc([{len: Math.max(0, specs.length), runs}], 400);
      totalAccessoriesCost += getAcc("gutters", seg.count, seg.piecePrice);
    }
    if (specs.hasGables !== false) {
      const gConfig = specs.roofType === 'Single Slope' ? [{len: specs.width, runs: 2}, {len: specs.length, runs: 1}] : [{len: specs.width, runs: 2}];
      const seg = calcAcc(gConfig, 250);
      totalAccessoriesCost += getAcc("gables", seg.count, seg.piecePrice);
    }
    if (specs.hasDownPipes !== false) {
      const runs = specs.roofType === 'Single Slope' ? 2 : 4;
      const seg = calcAcc([{len: specs.eaveHeight, runs}], 150);
      totalAccessoriesCost += getAcc("downPipes", seg.count, seg.piecePrice);
    }
    if (specs.hasTurboVents !== false) totalAccessoriesCost += getAcc("turboVents", Math.floor(specs.length / 4), 3500);
  }
  if (specs.hasCornerFlashing !== false && specs.hasWalls !== false) {
    const seg = calcAcc([{len: specs.eaveHeight, runs: 4}], 250);
    totalAccessoriesCost += getAcc("cornerFlashing", seg.count, seg.piecePrice);
  }
  if (specs.hasEndFlashing !== false && specs.hasWalls !== false) {
    const seg = calcAcc([{len: specs.width, runs: 2}, {len: specs.length, runs: 2}], 200);
    totalAccessoriesCost += getAcc("endFlashing", seg.count, seg.piecePrice);
  }
  if (specs.hasLouvers !== false && specs.hasWalls !== false && louverCount > 0) totalAccessoriesCost += getAcc("louvers", louverCount, 2500);
  if (specs.hasInsulation !== false) totalAccessoriesCost += getAcc("insulation", Math.ceil(specs.width * specs.length * 1.1), 120);
  if (specs.hasPolySheets !== false) totalAccessoriesCost += getAcc("polySheets", numPolySheets, 1200);
  if (specs.hasSDScrews !== false && specs.hasRoof !== false) totalAccessoriesCost += getAcc("sdScrewsRoof", calculateSDScrews(specs, 'roof'), 3.5);
  if (specs.hasSDScrews !== false && specs.hasWalls !== false) totalAccessoriesCost += getAcc("sdScrewsWall", calculateSDScrews(specs, 'wall'), 3.5);
  if (specs.hasSilicon !== false) totalAccessoriesCost += getAcc("silicon", Math.ceil(specs.length * specs.width * 0.1), 250);
  if (specs.hasPVCCaps !== false) totalAccessoriesCost += getAcc("pvcCaps", calculateSDScrews(specs), 0.5);
  if (specs.hasFlanges !== false) {
     const seg = calcAcc([{len: specs.width, runs: 2}, {len: specs.length, runs: 2}], 150);
     totalAccessoriesCost += getAcc("flanges", seg.count, seg.piecePrice);
  }
  if (specs.hasProfileGate !== false && specs.hasWalls !== false) totalAccessoriesCost += getAcc("profileGate", 1, 45000);
  if (specs.hasWindows !== false && specs.hasWalls !== false && windowCount > 0) totalAccessoriesCost += getAcc("windows", windowCount, 6500);
  if (specs.hasCrimpedSheets !== false && specs.hasWalls !== false) {
     const seg = calcAcc([{len: specs.width, runs: 2}], 500);
     totalAccessoriesCost += getAcc("crimpedSheets", seg.count, seg.piecePrice);
  }

  const subTotal = totalPrimaryCost + totalSecondaryCost + totalRoofCost + totalWallCost + totalHardwareCost + totalAccessoriesCost;

  const civilFoundationCost = area * 1500; // Estimated ₹1,500 per sq meter
  const totalTransportTons = (specs.hasPrimarySteel !== false ? primaryTons : 0) + 
                             (specs.hasSecondarySteel !== false || specs.hasGirts !== false ? secondaryTons : 0) + 
                             (hardwareQty / 1000) + 
                             (specs.hasRoof !== false ? (roofAreaNum * 4.5 / 1000) : 0) + 
                             (specs.hasWalls !== false ? (wallAreaNum * 4.5 / 1000) : 0);
  const numberOfJourneys = Math.ceil(totalTransportTons > 0 ? totalTransportTons / 4.5 : 0);
  const costPerJourney = ((specs.deliveryDistance || 0) * (specs.dieselPrice || 0)) / 2; 
  const logisticsCost = numberOfJourneys * costPerJourney;

  const totalBeforeTax = subTotal + civilFoundationCost + logisticsCost;
  const taxAmount = totalBeforeTax * 0.18; // 18% GST

  const grandTotal = totalBeforeTax + taxAmount;

  const annualComparativeData = useMemo(() => {
    const data = [];
    let pebAccumulatedCost = grandTotal;
    let tradAccumulatedCost = grandTotal * 1.25; // Traditional assumes 25% higher initial cost

    for (let year = 0; year <= 20; year += 5) {
      if (year > 0) {
        pebAccumulatedCost += grandTotal * 0.01 * 5; // 1% annual maintenance
        tradAccumulatedCost += (grandTotal * 1.25) * 0.04 * 5; // 4% annual maintenance for traditional RC over time
      }
      data.push({
        year: `Year ${year}`,
        PEB: Math.round(pebAccumulatedCost),
        Traditional: Math.round(tradAccumulatedCost),
      });
    }
    return data;
  }, [grandTotal]);

  const monthlySpendingData = useMemo(() => {
    const months = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
    const estimatedTotal = targetBudget > 0 ? targetBudget : grandTotal;
    
    // Predetermined tracking percentages for estimated spend
    const estimatedPercentages = [0.10, 0.30, 0.60, 0.85, 0.95, 1.0];
    // Simulated tracking for actual spend (up to Month 4)
    const actualPercentages = [0.12, 0.35, 0.58, 0.88, null, null];
    
    return months.map((month, index) => ({
      month,
      Estimated: estimatedTotal * estimatedPercentages[index],
      Actual: actualPercentages[index] !== null ? grandTotal * actualPercentages[index] : null,
    }));
  }, [targetBudget, grandTotal]);

  const pvcCapsTally = useMemo(() => {
    const tallies: { [color: string]: number } = {};

    const effWall = specs.wallProfile === '6v Profile' ? 0.99 : (specs.wallProfile === '7v Profile' ? 1.188 : 1.0);
    const effRoof = specs.roofProfile === '6v Profile' ? 0.99 : (specs.roofProfile === '7v Profile' ? 1.188 : 1.0);

    const getCol = (key: string, base: string, type: 'roof'|'wall') => getPanelColor(key, base, type, specs, panelColors);

    if (specs.hasWalls !== false) {
       const lSheets = Math.ceil(specs.length / effWall - 0.001);
       const wSheets = Math.ceil(specs.width / effWall - 0.001);
       const girtSpacing = specs.highWindVelocity || specs.snowLoad ? 1.0 : 1.5;
       const girtRuns = Math.ceil(specs.eaveHeight / girtSpacing) + 1;
       const leftRightTotal = Math.ceil((6 / 1.2) * specs.length * girtRuns * 2);
       const perLShoot = leftRightTotal / (2 * lSheets);

       for (let i = 0; i < lSheets; i++) {
           ['l', 'r'].forEach(side => {
               const c = getCol(`wall_${side}_${i}_0`, specs.wallColor || '#0089b6', 'wall');
               tallies[c] = (tallies[c] || 0) + perLShoot;
           });
       }

       const frontBackTotal = Math.ceil((6 / 1.2) * specs.width * girtRuns * 2);
       const perWShoot = frontBackTotal / (2 * wSheets);
       for (let i = 0; i < wSheets; i++) {
           ['f', 'b'].forEach(side => {
               const c = getCol(`wall_${side}_${i}_0`, specs.wallColor || '#0089b6', 'wall');
               tallies[c] = (tallies[c] || 0) + perWShoot;
           });
       }
    }

    if (specs.hasRoof !== false) {
       let purlinRunsPerFrame = 0;
       const purlinSpacing = specs.highWindVelocity || specs.snowLoad ? 1.0 : 1.5;
       const rafterLength = Math.sqrt(Math.pow(specs.width / 2, 2) + Math.pow(((specs.width / 2) * specs.roofSlope) / 100, 2)).toFixed(2);
       if (specs.roofType === 'Single Slope') {
          const rl = Math.sqrt(specs.width * specs.width + Math.pow(specs.width * (specs.roofSlope / 100), 2));
          purlinRunsPerFrame = Math.max(1, Math.round(rl / purlinSpacing)) + 1;
       } else if (specs.roofType === 'Multi-Sloped Hut') {
          const hw_steep = (specs.width / 4) * (specs.roofSlope * 1.5 / 100);
          const hw_sh = (specs.width / 4) * (specs.roofSlope * 0.5 / 100);
          purlinRunsPerFrame = (Math.max(1, Math.round(Math.sqrt(Math.pow(specs.width / 4, 2) + hw_steep * hw_steep) / purlinSpacing)) + Math.max(1, Math.round(Math.sqrt(Math.pow(specs.width / 4, 2) + hw_sh * hw_sh) / purlinSpacing))) * 2 + 1;
       } else if (specs.roofType === 'Curved') {
          purlinRunsPerFrame = Math.max(1, Math.round((specs.width * 1.1) / purlinSpacing)) + 1;
       } else {
          purlinRunsPerFrame = Math.max(1, Math.round(parseFloat(rafterLength) / purlinSpacing)) * 2 + 1;
       }
       const roofTotal = Math.max(0, Math.ceil((6 * specs.length * purlinRunsPerFrame) - ((specs.length - 1) * purlinRunsPerFrame)));
       
       const roofSheets = Math.ceil(specs.length / effRoof - 0.001);
       let numSections = specs.roofType === 'Single Slope' || specs.roofType === 'Curved' ? 1 : (specs.roofType === 'Multi-Sloped Hut' ? 4 : 2);
       const perRoofShoot = roofTotal / (roofSheets * numSections);
       
       for (let i = 0; i < roofSheets; i++) {
           const isSkylightCol = specs.hasPolySheets !== false && (i % 6 === 3);
           for (let sec = 0; sec < numSections; sec++) {
               let pfx = 'roof';
               if (specs.roofType === 'Single Slope') pfx = 'single';
               if (specs.roofType === 'Multi-Sloped Hut') pfx = `m${sec+1}`;
               const c = isSkylightCol ? (specs.roofColor || '#0089b6') : getCol(`${pfx}_sheet_${i}_seg_0`, specs.roofColor || '#0089b6', 'roof');
               tallies[c] = (tallies[c] || 0) + perRoofShoot;
           }
       }
    }

    const rounded: { [c: string]: number } = {};
    Object.keys(tallies).forEach(c => {
       if (tallies[c] > 0) rounded[c] = Math.round(tallies[c]);
    });
    return rounded;
  }, [specs, panelColors]);

  const materialEstimateData = useMemo(() => {
    const sections: { title: string, rows: any[] }[] = [];
    let totalCost = 0;

    const createSection = (title: string, rows: any[]) => {
      if (rows.length === 0) return;
      sections.push({ title, rows });
      rows.forEach(row => {
          totalCost += row.total;
      });
    };



    const formatRow = (id: string, name: string, unit: string, defaultQty: number, defaultPrice: number) => {
       const o = specs.materialOverrides?.[id];
       const q = o?.qty !== undefined ? (o.qty === '' ? 0 : Number(o.qty)) : defaultQty;
       const p = o?.price !== undefined ? (o.price === '' ? 0 : Number(o.price)) : defaultPrice;
       if (q >= 0) {
          return { id, name: o?.name !== undefined ? o.name : name, defaultName: name, overrideName: o?.name, unit, qty: q, price: p, defaultQty, defaultPrice, overrideQty: o?.qty, overridePrice: o?.price, total: Math.round(q * p), formatted: [o?.name !== undefined ? o.name : name, unit, q.toLocaleString('en-IN'), `Rs. ${p.toLocaleString('en-IN')}`, `Rs. ${Math.round(q * p).toLocaleString('en-IN')}`] };
       }
       return null;
    };

    const getUnitWeight = (profile: string, defaultWeight: number) => {
      const match = profile.match(/-([\d.]+)kg/i);
      return match ? parseFloat(match[1]) : defaultWeight;
    };

    // Columns & Rafters (from Primary Steel)
    let primaryPcsForBasePlates = 0;
    
    if (specs.hasPrimarySteel !== false) {
      const effectivePrimary = primaryTons * 0.9;
      const colRatio = columnLinearMeasurement / (columnLinearMeasurement + rafterLinearMeasurement || 1);
      
      const colProfile = specs.columnProfile || '2 x 72 x 72 x 6000mm -27kg';
      const colUnitWt = getUnitWeight(colProfile, 27);
      const colTons = effectivePrimary * colRatio;
      const colPcs = Math.ceil(columnLinearMeasurement / 6);
      const colPricePerPc = (primaryUnitCost / 1000) * colUnitWt;
      
      const colRow = formatRow('columns_colprofile', `Columns (${colProfile}) - Total: ${dimensionUnit === 'ft' ? (columnLinearMeasurement * 3.28084).toFixed(1) : columnLinearMeasurement.toFixed(1)}${dimensionUnit === 'ft' ? 'ft' : 'm'}`, dimensionUnit === 'ft' ? '20ft pcs' : '6m pcs', colPcs, Math.round(colPricePerPc));
      if (colRow) {
        createSection('Columns', [colRow]);
      }
      
      const rafProfile = specs.rafterProfile || '2 x 48 x 96 x 6000mm -27kg';
      const rafUnitWt = getUnitWeight(rafProfile, 27);
      const rafTons = effectivePrimary * (1 - colRatio);
      const rafPcs = Math.ceil(rafterLinearMeasurement / 6);
      const rafPricePerPc = (primaryUnitCost / 1000) * rafUnitWt;

      primaryPcsForBasePlates = totalColumns;

      if (specs.frameType === 'Truss') {
        let specificTrussType = 'Fink / Howe Triangular Truss';
        if (specs.roofType === 'Single Slope') {
          specificTrussType = 'Mono-pitch Pratt Truss';
        } else if (specs.roofType === 'Curved') {
          specificTrussType = 'Bowstring / Bow-chord Truss';
        } else if (specs.roofType === 'Multi-Sloped Hut') {
          specificTrussType = 'Gambrel / Cambered Truss';
        }

        const trussRows: any[] = [];
        
        // 1. Truss Top Chords
        const tcProfile = '2*50*50*6000mm - 18kg';
        const tcUnitWt = 18;
        const tcPcs = Math.ceil(rafterLinearMeasurement / 6);
        const tcPricePerPc = (primaryUnitCost / 1000) * tcUnitWt;
        const tcRow = formatRow('truss_top_chords', `Truss Top Chords (${tcProfile}) - Total: ${dimensionUnit === 'ft' ? (rafterLinearMeasurement * 3.28084).toFixed(1) : rafterLinearMeasurement.toFixed(1)}${dimensionUnit === 'ft' ? 'ft' : 'm'}`, dimensionUnit === 'ft' ? '20ft pcs' : '6m pcs', tcPcs, Math.round(tcPricePerPc));
        if (tcRow) trussRows.push(tcRow);

        // 2. Truss Bottom Chords
        const bcProfile = '2*50*50*6000mm - 18kg';
        const bcUnitWt = 18;
        const bcLength = specs.width * numFrames;
        const bcPcs = Math.ceil(bcLength / 6);
        const bcPricePerPc = (primaryUnitCost / 1000) * bcUnitWt;
        const bcRow = formatRow('truss_bottom_chords', `Truss Bottom Chords (${bcProfile}) - Total: ${dimensionUnit === 'ft' ? (bcLength * 3.28084).toFixed(1) : bcLength.toFixed(1)}${dimensionUnit === 'ft' ? 'ft' : 'm'}`, dimensionUnit === 'ft' ? '20ft pcs' : '6m pcs', bcPcs, Math.round(bcPricePerPc));
        if (bcRow) trussRows.push(bcRow);

        // 3. Truss Webbing
        const webProfile = '2*38*38*6000mm - 14kg';
        const webUnitWt = 14;
        
        let singleTrussWebLength = 0;
        const tw = specs.width;
        const tslope = specs.roofSlope;

        if (specs.roofType === 'Single Slope') {
          const totRoofH = tw * (tslope / 100);
          const vertLen = 2.5 * totRoofH;
          let diagLen = 0;
          for (let j = 1; j <= 3; j++) {
            const dx = tw / 4;
            const dy = ((j + 1) / 4) * totRoofH;
            diagLen += Math.sqrt(dx * dx + dy * dy);
          }
          singleTrussWebLength = vertLen + diagLen;
        } else if (specs.roofType === 'Curved') {
          const roofH = (tw / 2) * (tslope / 100) * 1.5;
          const numWebs = 6;
          let vertLen = 0;
          let diagLen = 0;
          for (let j = 1; j < numWebs; j++) {
            const t = j / numWebs;
            const topY = 2 * roofH * t * (1 - t) * 4;
            vertLen += topY;
            if (j < numWebs - 1) {
              const nextT = (j + 1) / numWebs;
              const nextTopY = 2 * roofH * nextT * (1 - nextT) * 4;
              const dx = tw / numWebs;
              const dy = nextTopY;
              diagLen += Math.sqrt(dx * dx + dy * dy);
            }
          }
          singleTrussWebLength = vertLen + diagLen;
        } else if (specs.roofType === 'Multi-Sloped Hut') {
          const h_steep = (tw / 4) * (tslope * 1.5 / 100);
          const h_shallow = (tw / 4) * (tslope * 0.5 / 100);
          const vertLen = (h_steep + h_shallow) + 2 * h_steep;
          const dx = tw * 0.25;
          const dy = h_steep + h_shallow;
          const diagLen = 2 * Math.sqrt(dx * dx + dy * dy);
          singleTrussWebLength = vertLen + diagLen;
        } else {
          const roofH = (tw / 2) * (tslope / 100);
          const vertLen = 2 * roofH;
          const diag1 = 2 * Math.sqrt((tw / 4) * (tw / 4) + (roofH / 2) * (roofH / 2));
          const diag2 = 2 * Math.sqrt((tw / 4) * (tw / 4) + (roofH / 2) * (roofH / 2));
          singleTrussWebLength = vertLen + diag1 + diag2;
        }

        const webLength = singleTrussWebLength * numFrames;
        const webPcs = Math.ceil(webLength / 6);
        const webPricePerPc = (primaryUnitCost / 1000) * webUnitWt;
        const webRow = formatRow('truss_webbing', `Truss Webbing Braces (${webProfile}) - Total: ${dimensionUnit === 'ft' ? (webLength * 3.28084).toFixed(1) : webLength.toFixed(1)}${dimensionUnit === 'ft' ? 'ft' : 'm'}`, dimensionUnit === 'ft' ? '20ft pcs' : '6m pcs', webPcs, Math.round(webPricePerPc));
        if (webRow) trussRows.push(webRow);

        // 4. Gusset Plates
        const gussetCount = numFrames * (specs.roofType === 'Single Slope' ? 6 : 8);
        const gussetRow = formatRow('truss_gussets', `Truss Gusset Plates (6mm Steel Plate)`, 'pcs', gussetCount, 250);
        if (gussetRow) trussRows.push(gussetRow);

        createSection(`Truss Structure (${specificTrussType})`, trussRows);
      } else {
        const rafRow = formatRow('rafters_rafprofile', `Rafters (${rafProfile}) - Total: ${dimensionUnit === 'ft' ? (rafterLinearMeasurement * 3.28084).toFixed(1) : rafterLinearMeasurement.toFixed(1)}${dimensionUnit === 'ft' ? 'ft' : 'm'}`, dimensionUnit === 'ft' ? '20ft pcs' : '6m pcs', rafPcs, Math.round(rafPricePerPc));
        if (rafRow) {
          createSection('Rafters', [rafRow]);
        }
      }
    }

    // Purlins & Girts (from Secondary Steel)
    let secondaryMiscTons = 0;
    if (specs.hasSecondarySteel !== false) {
      const purlinRatio = totalPurlins / ((totalPurlins + totalGirts) || 1);
      const effectiveSecondary = secondaryTons * 0.9;
      secondaryMiscTons = secondaryTons * 0.1;
      
      const purlinProfile = specs.purlinProfile || '2 x 38 x 38 x 6000mm -14kg';
      const purlinUnitWt = getUnitWeight(purlinProfile, 14);
      const purlinTons = effectiveSecondary * purlinRatio;
      const purlinPcs = Math.ceil((purlinRunsPerFrame * specs.length) / 6);
      const purlinPricePerPc = (secondaryUnitCost / 1000) * purlinUnitWt;

      const purlinRow = formatRow('purlins_purlinprofile', `Purlins (${purlinProfile}) - Total: ${dimensionUnit === 'ft' ? (purlinRunsPerFrame * specs.length * 3.28084).toFixed(1) : (purlinRunsPerFrame * specs.length).toFixed(1)}${dimensionUnit === 'ft' ? 'ft' : 'm'}`, dimensionUnit === 'ft' ? '20ft pcs' : '6m pcs', purlinPcs, Math.round(purlinPricePerPc));
      if (purlinRow) {
        createSection('Purlins', [purlinRow]);
      }

      if (specs.hasGirts !== false) {
        const girtProfile = specs.girtProfile || '2 x 38 x 38 x 6000mm -14kg';
        const girtUnitWt = getUnitWeight(girtProfile, 14);
        const girtTons = effectiveSecondary * (1 - purlinRatio);
        const girtPcs = Math.ceil((girtRuns * specs.length * 2 + girtRuns * specs.width * 2) / 6);
        const girtPricePerPc = (secondaryUnitCost / 1000) * girtUnitWt;

        const girtRow = formatRow('girts_girtprofile', `Girts (${girtProfile}) - Total: ${dimensionUnit === 'ft' ? ((girtRuns * specs.length * 2 + girtRuns * specs.width * 2) * 3.28084).toFixed(1) : (girtRuns * specs.length * 2 + girtRuns * specs.width * 2).toFixed(1)}${dimensionUnit === 'ft' ? 'ft' : 'm'}`, dimensionUnit === 'ft' ? '20ft pcs' : '6m pcs', girtPcs, Math.round(girtPricePerPc));
        if (girtRow) {
           createSection('Girts', [girtRow]);
        }
      }
    }

    // Sheeting
    const sheetingRows: any[] = [];
    const getColorName = (hex: string | undefined, defaultColorVal: string) => {
        const colorHex = hex || defaultColorVal;
        const standardColor = STANDARD_COLORS.find(c => c.hex.toLowerCase() === colorHex.toLowerCase());
        return standardColor ? standardColor.name : colorHex;
    };

    if (specs.hasRoof !== false) {
      const formattedLength = dimensionUnit === 'ft' ? (actualRoofSheetLength * 3.28084).toFixed(1) : actualRoofSheetLength.toFixed(1);
      const mainColName = getColorName(specs.roofColor, '#0089b6');
      
      if (specs.alternateRoofColors) {
        const altColName = getColorName(specs.alternateRoofColor, '#d3d3d3');
        const rRowMain = formatRow('roof_sheeting_main', `Roof Sheeting - ${mainColName} (${formattedLength}${dimensionUnit === 'ft' ? 'ft' : 'm'} pcs)`, 'units', numMainRoofSheets, Math.round(costPerRoofSheet));
        if (rRowMain) sheetingRows.push(rRowMain);
        
        const rRowAlt = formatRow('roof_sheeting_alt', `Roof Sheeting - ${altColName} (${formattedLength}${dimensionUnit === 'ft' ? 'ft' : 'm'} pcs)`, 'units', numAltRoofSheets, Math.round(costPerRoofSheet));
        if (rRowAlt) sheetingRows.push(rRowAlt);
      } else {
        const rRow = formatRow('roof_sheeting', `Roof Sheeting - ${mainColName} (${formattedLength}${dimensionUnit === 'ft' ? 'ft' : 'm'} pcs)`, 'units', numRoofSheets, Math.round(costPerRoofSheet));
        if (rRow) sheetingRows.push(rRow);
      }
    }
    if (specs.hasWalls !== false) {
      const wFormattedLength = dimensionUnit === 'ft' ? (actualWallSheetLength * 3.28084).toFixed(1) : actualWallSheetLength.toFixed(1);
      const mainColName = getColorName(specs.wallColor, '#0089b6');
      
      if (specs.alternateWallColors) {
        const altColName = getColorName(specs.alternateWallColor, '#d3d3d3');
        const wRowMain = formatRow('wall_cladding_main', `Wall Cladding - ${mainColName} (${wFormattedLength}${dimensionUnit === 'ft' ? 'ft' : 'm'} pcs)`, 'units', numMainWallSheets, Math.round(costPerWallSheet));
        if (wRowMain) sheetingRows.push(wRowMain);
        
        const wRowAlt = formatRow('wall_cladding_alt', `Wall Cladding - ${altColName} (${wFormattedLength}${dimensionUnit === 'ft' ? 'ft' : 'm'} pcs)`, 'units', numAltWallSheets, Math.round(costPerWallSheet));
        if (wRowAlt) sheetingRows.push(wRowAlt);
      } else {
        const wRow = formatRow('wall_cladding', `Wall Cladding - ${mainColName} (${wFormattedLength}${dimensionUnit === 'ft' ? 'ft' : 'm'} pcs)`, 'units', totalWallSheets, Math.round(costPerWallSheet));
        if (wRow) sheetingRows.push(wRow);
      }
    }
    if (sheetingRows.length > 0) {
      createSection('Sheeting', sheetingRows);
    }

    // Helpers for Accessories and Fasteners
    const override = (key: string, name: string, unit: string, defaultQty: number, defaultPrice: number) => {
        return formatRow(key, name, unit, defaultQty, defaultPrice);
    };

    // Accessories
    const accRows: any[] = [];
    const formatAccUnit = (meters: number) => {
        if (!meters || meters <= 0) return dimensionUnit === 'ft' ? '0ft pcs' : '0m pcs';
        return dimensionUnit === 'ft' ? `${(meters * 3.28084).toFixed(1)}ft pcs` : `${meters.toFixed(1)}m pcs`;
    };
    if (specs.hasRoof !== false) {
        if (specs.hasRidgeCap !== false && specs.roofType !== 'Single Slope') {
            const seg = calcAcc([{len: specs.length, runs: 1}], 350);
            accRows.push(override("ridgeCap", "Plain Ridge", formatAccUnit(seg.cutLength), seg.count, seg.piecePrice));
        }
        if (specs.hasGutters !== false) {
            const runs = specs.roofType === 'Single Slope' ? 1 : 2;
            const seg = calcAcc([{len: Math.max(0, specs.length), runs}], 400);
            accRows.push(override("gutters", "Gutters", formatAccUnit(seg.cutLength), seg.count, seg.piecePrice));
        }
        if (specs.hasGables !== false) {
            const gConfig = specs.roofType === 'Single Slope' ? [{len: specs.width, runs: 2}, {len: specs.length, runs: 1}] : [{len: specs.width, runs: 2}];
            const seg = calcAcc(gConfig, 250);
            accRows.push(override("gables", "Gable / Rake Flashing", formatAccUnit(seg.cutLength), seg.count, seg.piecePrice));
        }
        if (specs.hasDownPipes !== false) {
            const runs = specs.roofType === 'Single Slope' ? 2 : 4;
            const seg = calcAcc([{len: specs.eaveHeight, runs}], 150);
            accRows.push(override("downPipes", "Down Pipes", formatAccUnit(seg.cutLength), seg.count, seg.piecePrice));
        }
        if (specs.hasTurboVents !== false) accRows.push(override("turboVents", "Turbo Vents", "units", Math.floor(specs.length / 4), 3500));
    }
    if (specs.hasCornerFlashing !== false && specs.hasWalls !== false) {
        const seg = calcAcc([{len: specs.eaveHeight, runs: 4}], 250);
        accRows.push(override("cornerFlashing", "Corner Flashing", formatAccUnit(seg.cutLength), seg.count, seg.piecePrice));
    }
    if (specs.hasEndFlashing !== false && specs.hasWalls !== false) {
        const seg = calcAcc([{len: specs.width, runs: 2}, {len: specs.length, runs: 2}], 200);
        accRows.push(override("endFlashing", "Bottom Trim", formatAccUnit(seg.cutLength), seg.count, seg.piecePrice));
    }
    if (specs.hasLouvers !== false && specs.hasWalls !== false && louverCount > 0) accRows.push(override("louvers", "Louvers", "units", louverCount, 2500));
    if (specs.hasInsulation !== false) accRows.push(override("insulation", "Air Bubble Insulation", "sqm", Math.ceil(specs.width * specs.length * 1.1), 120));
    if (specs.hasPolySheets !== false) {
        accRows.push(override("polySheets", "Polycarbonate Sheets", formatAccUnit(actualRoofSheetLength), numPolySheets, 1200));
    }
    if (specs.hasSilicon !== false) accRows.push(override("silicon", "Silicon Sealant", "tubes", Math.ceil(specs.length * specs.width * 0.1), 250));
    if (specs.hasProfileGate !== false && specs.hasWalls !== false) accRows.push(override("profileGate", "Profile Gate (Sliding)", "unit", 1, 45000));
    if (specs.hasWindows !== false && specs.hasWalls !== false && windowCount > 0) accRows.push(override("windows", "Aluminum Windows", "units", windowCount, 6500));
    if (specs.hasCrimpedSheets !== false && specs.hasWalls !== false) {
        const seg = calcAcc([{len: specs.width, runs: 2}], 500);
        accRows.push(override("crimpedSheets", "Crimped Sheets", formatAccUnit(seg.cutLength), seg.count, seg.piecePrice));
    }
    
    const validAccRows = accRows.filter(Boolean);
    if (validAccRows.length > 0) {
      createSection('Accessories', validAccRows);
    }

    // Fasteners and hardware
    const hardwareRows = [];
    if (specs.hasPrimarySteel !== false || specs.hasSecondarySteel !== false) {
      const mainNutBoltProfile = '21 x 125mm -0.55kg';
      const mainNutBoltUnitWt = getUnitWeight(mainNutBoltProfile, 0.55);
      const mainNutBoltPcs = specs.hasPrimarySteel !== false ? totalColumns * 4 : 0;
      const mainNutBoltPricePerPc = hardwareUnitCostPerKg * mainNutBoltUnitWt;
      if (mainNutBoltPcs > 0) hardwareRows.push(formatRow('bolts_main', `Nut Bolts (21 x 125mm)`, 'pcs', mainNutBoltPcs, Math.round(mainNutBoltPricePerPc)));

      const secNutBoltProfile = '18 x 100mm -0.35kg';
      const secNutBoltUnitWt = getUnitWeight(secNutBoltProfile, 0.35);
      
      let tempMiscTons = secondaryMiscTons;
      if (specs.hasPrimarySteel !== false) tempMiscTons += (primaryTons * 0.1);
      const tempBpSecUnitWt = getUnitWeight('8 x 200 x 200mm -2.5kg', 2.5);
      const tempBpSecPcs = specs.hasPrimarySteel !== false ? totalColumns * 2 : 0;
      const secNutBoltPcs = tempBpSecPcs * 2;

      const purlinPlatePcs = specs.hasSecondarySteel !== false ? purlinRunsPerFrame * (numFrames - 1) * 2 : 0;
      const girtPlatePcs = (specs.hasSecondarySteel !== false && specs.hasGirts !== false) ? totalGirts * 2 : 0;
      const girtNutBoltProfile = '15 x 75mm -0.2kg';
      const girtNutBoltUnitWt = getUnitWeight(girtNutBoltProfile, 0.2);
      const girtNutBoltPcs = girtPlatePcs * 2;
      const girtNutBoltPricePerPc = hardwareUnitCostPerKg * girtNutBoltUnitWt;
      if (girtNutBoltPcs > 0) hardwareRows.push(formatRow('bolts_girt', 'Nut Bolts (15 x 75mm)', 'pcs', girtNutBoltPcs, Math.round(girtNutBoltPricePerPc)));

      const purlinNutBoltProfile = '12 x 50mm -0.1kg';
      const purlinNutBoltUnitWt = getUnitWeight(purlinNutBoltProfile, 0.1);
      const purlinNutBoltPcs = purlinPlatePcs * 2;
      const purlinNutBoltPricePerPc = hardwareUnitCostPerKg * purlinNutBoltUnitWt;
      if (purlinNutBoltPcs > 0) hardwareRows.push(formatRow('bolts_purlin', 'Nut Bolts (12 x 50mm)', 'pcs', purlinNutBoltPcs, Math.round(purlinNutBoltPricePerPc)));
  
      const secNutBoltPricePerPc = hardwareUnitCostPerKg * secNutBoltUnitWt;

      if (secNutBoltPcs > 0) hardwareRows.push(formatRow('bolts_sec', `Nut Bolts (18 x 100mm)`, 'pcs', secNutBoltPcs, Math.round(secNutBoltPricePerPc)));
    }
    if (specs.hasSDScrews !== false && specs.hasRoof !== false) hardwareRows.push(override("sdScrewsRoof", "SD Screws (Roof)", "pcs", calculateSDScrews(specs, 'roof'), 3.5));
    if (specs.hasSDScrews !== false && specs.hasWalls !== false) hardwareRows.push(override("sdScrewsWall", "SD Screws (Wall)", "pcs", calculateSDScrews(specs, 'wall'), 3.5));
    if (specs.hasFlanges !== false && (specs.hasRoof !== false || specs.hasWalls !== false)) {
        const seg = calcAcc([{len: specs.width, runs: 2}, {len: specs.length, runs: 2}], 150);
        hardwareRows.push(override("flanges", "Flanges", formatAccUnit(seg.cutLength), seg.count, seg.piecePrice));
    }
    if (specs.hasPVCCaps !== false && (specs.hasRoof !== false || specs.hasWalls !== false)) {
        Object.entries(pvcCapsTally).forEach(([color, count], index) => {
            const colorName = STANDARD_COLORS.find(c => c.hex === color)?.name || color;
            hardwareRows.push(override(`pvcCaps_${index}`, `PVC Caps (${colorName})`, "pcs", count, 0.5));
        });
    }

    const validHardwareRows = hardwareRows.filter(Boolean);
    if (validHardwareRows.length > 0) {
      createSection('Fasteners and hardware', validHardwareRows);
    }

    // Miscellaneous components
    let miscTons = secondaryMiscTons;
    let miscAvgCost = secondaryUnitCost;
    if (specs.hasPrimarySteel !== false) {
       miscTons += (primaryTons * 0.1);
       if (specs.hasSecondarySteel !== false) {
           miscAvgCost = (primaryUnitCost + secondaryUnitCost) / 2;
       } else {
           miscAvgCost = primaryUnitCost;
       }
    }
    
    if (miscTons > 0 || totalColumns > 0) {
       const miscRows = [];
       if (totalColumns > 0 && specs.hasPrimarySteel !== false) {
           const bpMainProfile = '12 x 300 x 300mm -8.5kg';
           const bpMainUnitWt = getUnitWeight(bpMainProfile, 8.5);
           const bpMainPcs = totalColumns * 2;
           const bpMainPricePerPc = (miscAvgCost / 1000) * bpMainUnitWt;
           miscRows.push(formatRow('base_plates_main', `Base Plates (12 x 300 x 300mm)`, 'pcs', bpMainPcs, Math.round(bpMainPricePerPc)));
       }

       if ((miscTons > 0 || totalColumns > 0) && specs.hasPrimarySteel !== false) {
           const bpSecProfile = '10 x 250 x 250mm -4.9kg';
           const bpSecUnitWt = getUnitWeight(bpSecProfile, 4.9);
           const bpSecPcs = totalColumns > 0 ? totalColumns * 2 : Math.ceil((miscTons * 1000) / bpSecUnitWt);
           const bpSecPricePerPc = (miscAvgCost / 1000) * bpSecUnitWt;
           miscRows.push(formatRow('base_plates_sec', `Base Plates (10 x 250 x 250mm)`, 'pcs', bpSecPcs, Math.round(bpSecPricePerPc)));
       }

       
       if (purlinRunsPerFrame > 0 && numFrames > 0 && specs.hasSecondarySteel !== false) {
           const rpBasePlateProfile = '6 x 150 x 150mm -1.06kg';
           const rpBasePlateUnitWt = getUnitWeight(rpBasePlateProfile, 1.06);
           const rpBasePlatePcs = purlinRunsPerFrame * numFrames;
           const rpBasePlatePricePerPc = (miscAvgCost / 1000) * rpBasePlateUnitWt;
           miscRows.push(formatRow('rafter_purlin_bp', 'Rafter Base Plates (6 x 150 x 150mm)', 'pcs', rpBasePlatePcs, Math.round(rpBasePlatePricePerPc)));

           const purlinPlateProfile = '2 x 50 x 150mm -0.12kg';
           const purlinPlateUnitWt = getUnitWeight(purlinPlateProfile, 0.12);
           const purlinPlatePcs = purlinRunsPerFrame * (numFrames - 1) * 2;
           const purlinPlatePricePerPc = (secondaryUnitCost / 1000) * purlinPlateUnitWt;
           miscRows.push(formatRow('purlin_plates', 'Purlin Plates (2 x 50 x 150mm)', 'pcs', purlinPlatePcs, Math.round(purlinPlatePricePerPc)));
       }
       if (totalGirts > 0 && totalColumns > 0 && specs.hasSecondarySteel !== false && specs.hasGirts !== false && specs.hasPrimarySteel !== false) {
           const cgBasePlateProfile = '8 x 200 x 200mm -2.5kg';
           const cgBasePlateUnitWt = getUnitWeight(cgBasePlateProfile, 2.5);
           const cgBasePlatePcs = girtRuns * totalColumns;
           const cgBasePlatePricePerPc = (miscAvgCost / 1000) * cgBasePlateUnitWt;
           miscRows.push(formatRow('column_girt_bp', 'Column Girt Base Plates (8 x 200 x 200mm)', 'pcs', cgBasePlatePcs, Math.round(cgBasePlatePricePerPc)));

           const girtPlateProfile = '2.5 x 62 x 150mm -0.19kg';
           const girtPlateUnitWt = getUnitWeight(girtPlateProfile, 0.19);
           const girtPlatePcs = totalGirts * 2;
           const girtPlatePricePerPc = (secondaryUnitCost / 1000) * girtPlateUnitWt;
           miscRows.push(formatRow('girt_plates', 'Girt Plates (2.5 x 62 x 150mm)', 'pcs', girtPlatePcs, Math.round(girtPlatePricePerPc)));
       }


       const validMiscRows = miscRows.filter(Boolean);
       if (validMiscRows.length > 0) {
           createSection('Base Plates & Connections', validMiscRows);
       }
    }

    if (specs.additionalItems && specs.additionalItems.length > 0) {
      const additionalRows = specs.additionalItems.map(item => {
        const q = item.qty === '' ? 0 : Number(item.qty);
        const p = item.price === '' ? 0 : Number(item.price);
        return {
          id: item.id,
          name: item.name,
          unit: item.unit,
          qty: q,
          price: p,
          defaultQty: q,
          defaultPrice: p,
          overrideQty: item.qty,
          overridePrice: item.price,
          total: Math.round(q * p),
          isAdditional: true,
          formatted: [item.name, item.unit, q.toLocaleString('en-IN'), `Rs. ${p.toLocaleString('en-IN')}`, `Rs. ${Math.round(q * p).toLocaleString('en-IN')}`]
        };
      });
      createSection('Additional Items', additionalRows);
      additionalRows.forEach(row => totalCost += row.total);
    }
    
    return { sections, totalCost };
  }, [specs, primaryTons, secondaryTons, accessories, totalPurlins, totalGirts, primaryUnitCost, secondaryUnitCost, roofAreaNum, wallAreaNum, roofUnitCost, wallUnitCost, columnLinearMeasurement, rafterLinearMeasurement, hardwareUnitCostPerKg]);

  const handleExportMaterialsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Material Details & Bill of Materials`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Dimensions: ${specs.width}m x ${specs.length}m, H: ${specs.eaveHeight}m PEB`, 14, 28);
    
    let currentY = 35;

    materialEstimateData.sections.forEach(sec => {
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text(sec.title, 14, currentY);
      
      autoTable(doc, {
        startY: currentY + 3,
        head: [['Material / Description', 'Unit', 'Qty', 'Unit Price', 'Total Price']],
        body: sec.rows.map((r: any) => r.formatted),
        theme: 'grid',
        headStyles: { fillColor: [51, 65, 85] }
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 12;
      
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
    });

    doc.setFontSize(14);
    doc.text(`Total Projected Cost: Rs. ${Math.round(materialEstimateData.totalCost).toLocaleString('en-IN')}`, 14, currentY + 10);
    doc.save('UPEB_Material_Estimate.pdf');
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const addWatermark = () => {
      doc.setTextColor(248, 248, 250);
      doc.setFontSize(18);
      doc.text("UPEB by M.G. INDUSTRIES 9752556113", pageWidth / 2, pageHeight / 2, { angle: 45, align: 'center' });
      doc.setTextColor(0, 0, 0);
    };

    addWatermark();
    
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("TURNKEY CONTRACT AGREEMENT", pageWidth / 2, 22, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text("Universe Pre-Engineered Building (UPEB)", pageWidth / 2, 30, { align: 'center' });
    doc.setFontSize(11);
    doc.text("by M.G. Industries", pageWidth / 2, 36, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`1. Project Specifications`, 14, 50);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Building Dimensions (W x L): ${specs.width}m x ${specs.length}m`, 14, 57);
    doc.text(`Eave Height: ${specs.eaveHeight}m`, 14, 63);
    doc.text(`Roof Slope: ${specs.roofSlope}:10`, 14, 69);
    doc.text(`Total Floor Area: ${Math.round(specs.width * specs.length).toLocaleString('en-IN')} sqm`, 14, 75);
    
    let currentY = 85;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`2. Commercials & Turnkey Quote`, 14, currentY);
    
    currentY += 8;
    
    autoTable(doc, {
      startY: currentY,
      head: [['Description', 'Amount (INR)']],
      body: [
        ['Primary & Secondary Steel Framing', `Rs. ${Math.round(primaryMaterialTotal + totalSecondaryCost).toLocaleString('en-IN')}`],
        ['Roof & Wall Cladding Solutions', `Rs. ${Math.round(totalRoofCost + totalWallCost).toLocaleString('en-IN')}`],
        ['Fasteners, Accessories & Hardware', `Rs. ${Math.round(totalHardwareCost + totalAccessoriesCost).toLocaleString('en-IN')}`],
        ['Fabrication & Preparation', `Rs. ${Math.round(fabLaborCost * primaryTons).toLocaleString('en-IN')}`],
        ['Delivery & Logistics', `Rs. ${Math.round(logisticsCost).toLocaleString('en-IN')}`],
        ['Erection Details & Labor', `Rs. ${Math.round(erectLaborCost * primaryTons).toLocaleString('en-IN')}`],
        ['Overall PEB Turnkey Total', `Rs. ${Math.round(grandTotal).toLocaleString('en-IN')}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], cellPadding: 2 },
      bodyStyles: { cellPadding: 2 },
      margin: { bottom: 10 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;

    if (currentY > pageHeight - 95) {
      doc.addPage();
      addWatermark();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`3. Payment Terms`, 14, currentY);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    const paymentTerms = [
      "• 40% Advance accompanied by the formalized work order.",
      "• 30% After the primary materials are delivered to the site.",
      "• 20% After the secondary materials and sheeting are delivered to the site.",
      "• 10% Upon completion of erection and hand-over."
    ];
    
    paymentTerms.forEach(term => {
      currentY += 5;
      doc.text(term, 14, currentY);
    });

    currentY += 8;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`4. Standard Terms & Conditions`, 14, currentY);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    const tnc = [
      "1. Taxes (GST) and unforeseen local levies as applicable are charged separately.",
      "2. Estimated timeline: 4 to 6 weeks from the receipt of clearance and advance.",
      "3. Scope strictly excludes any civil foundation works or masonry execution unless mutually specified.",
      "4. The delivery site must be cleared, leveled, and prepared before deployment for erection.",
      "5. Necessary utilities (power, water) at the erection site shall be supplied by the client directly.",
      "6. Delays occurring due to unavoidable natural occurrences (force majeure) remain excluded."
    ];
    
    tnc.forEach(term => {
      currentY += 5;
      const splitTerm = doc.splitTextToSize(term, pageWidth - 28);
      doc.text(splitTerm, 14, currentY);
      currentY += (splitTerm.length - 1) * 4;
    });

    // Provide enough space for stamp/signatures but avoid forced pagination if possible
    currentY = Math.max(currentY + 25, pageHeight - 35);
    
    const sigWidth = 50;
    const margin = 20;
    
    doc.line(margin, currentY, margin + sigWidth, currentY); // Authorized Signatory line
    doc.line(pageWidth - margin - sigWidth, currentY, pageWidth - margin, currentY); // Client Signature line
    
    currentY += 5;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("For M.G. INDUSTRIES", margin + (sigWidth / 2), currentY, { align: 'center' });
    doc.text("Accepted By Client", pageWidth - margin - (sigWidth / 2), currentY, { align: 'center' });
    
    currentY += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Authorized Signatory", margin + (sigWidth / 2), currentY, { align: 'center' });
    doc.text("Signature / Client Seal", pageWidth - margin - (sigWidth / 2), currentY, { align: 'center' });
    
    // Additional Page for Supplementary Notes
    doc.addPage();
    addWatermark();
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("5. Supplementary Notes & Details", 14, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Please use this space for any additional arrangements, sketches, or specific requirements:", 14, 35);
    
    // Draw lines for notes
    let notesY = 45;
    for (let i = 0; i < 20; i++) {
        doc.setDrawColor(200, 200, 200);
        doc.line(14, notesY, pageWidth - 14, notesY);
        notesY += 10;
    }
    
    doc.save('UPEB_Turnkey_Contract_Agreement.pdf');
  };

  const handleExportModalPDF = (title: string, data: { label: string; value: string; category: string }[]) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    
    autoTable(doc, {
      startY: 30,
      head: [['Metric / Item', 'Details', 'Category']],
      body: data.map(d => [d.label, d.value, d.category]),
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85] }
    });
    
    doc.save(`UPEB_${title.replace(/\s+/g, '_')}.pdf`);
  };

  const trendData = useMemo(() => {
    const data = [];
    for (let scale = 0.5; scale <= 1.5; scale += 0.25) {
      const simWidth = specs.width * scale;
      const simLength = specs.length * scale;
      const simArea = simWidth * simLength;
      
      const weightFactor = specs.frameType === 'Clear Span' ? 35 : 25;
      const targetSteelWeight = (simArea * weightFactor) / 1000;
      
      const simPrimaryTons = targetSteelWeight * 0.65;
      const simSecondaryTons = targetSteelWeight * 0.25;
      
      const steelCost = simPrimaryTons * 85000 + simSecondaryTons * 90000;
      const laborCost = simPrimaryTons * (15000 + 10000) + simSecondaryTons * (12000 + 8000);
      const roofCost = (simArea * Math.sqrt(1 + Math.pow(specs.roofSlope / 100, 2))) * 650;
      const civilCost = simArea * 1500;
      
      data.push({
        size: dimensionUnit === 'ft' ? `${Math.round(simArea * 10.7639)}` : `${Math.round(simArea)}`, // simpler label for X-axis
        Steel: Math.round(steelCost),
        Roofing: Math.round(roofCost),
        Labor: Math.round(laborCost),
        Civil: Math.round(civilCost),
      });
    }
    return data;
  }, [specs.width, specs.length, specs.frameType, specs.roofSlope, dimensionUnit]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      {/* Top Navbar */}
      <nav className="bg-slate-900 text-white px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b-4 border-blue-600">
        <div className="flex items-center gap-3">
          <Building className="w-6 h-6 text-blue-400 shrink-0" />
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold tracking-tight leading-tight">UPEB</h1>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">by M.G. Industries</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm font-medium text-slate-300">
          <span className="hidden sm:inline">Project: <span className="text-white">{projectName || 'Unnamed Project'}</span></span>
          <span className="hidden sm:inline w-px h-4 bg-slate-700"></span>
          <span>Status: <span className="text-emerald-400">On Track</span></span>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-800">Construction Planner & Estimator</h2>
          <p className="text-slate-500 mt-2 text-sm max-w-2xl">
            Pre-engineered buildings facilitate streamlined construction planning. Adjust the building specifications below to see real-time updates on estimated schedules, structural weight, and workflow phases.
          </p>
        </div>

        {/* Top Key Metrics Banner */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Area</p>
              <p className="text-lg font-semibold text-slate-800 font-mono leading-none">{dimensionUnit === 'ft' ? (area * 10.7639).toLocaleString('en-US', {maximumFractionDigits:0}) : area.toLocaleString('en-US', {maximumFractionDigits:0})} {dimensionUnit === 'ft' ? 'sq.ft' : 'm²'}</p>
            </div>
          </div>
          
          <div className="hidden sm:block w-px h-10 bg-slate-100"></div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Est. Weight</p>
              <p className="text-lg font-semibold text-slate-800 font-mono leading-none">{targetSteelWeight.toFixed(1)} tons</p>
            </div>
          </div>

          <div className="hidden md:block w-px h-10 bg-slate-100"></div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Timeline</p>
              <p className="text-lg font-semibold text-slate-800 font-mono leading-none">~{estimatedDuration} weeks</p>
            </div>
          </div>
        </div>

        {/* Project Calendar Component */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 overflow-hidden">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-slate-500" />
            Estimated Project Timeline
          </h3>
          <ProjectCalendar estimatedDurationWeeks={estimatedDuration} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Specifications configurator */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Configurator Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex justify-start items-center gap-6 relative overflow-x-auto whitespace-nowrap hide-scrollbar">
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
              
              {WIZARD_STEPS.map((tab, idx) => {
                 const currentIdx = WIZARD_KEYS.indexOf(configTab);
                 let status = 'upcoming';
                 if (currentIdx === idx) status = 'current';
                 else if (idx < currentIdx) status = 'completed';
                 
                 return (
                 <button
                  key={tab.id}
                  onClick={() => setConfigTab(tab.id as any)}
                  className="flex flex-col items-center gap-1.5 z-10 px-2 transition-colors focus:outline-none shrink-0"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all duration-300 ${
                    status === 'current' ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-110' :
                    status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' :
                    'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}>
                    {status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-white" /> : tab.label}
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-bold ${status === 'current' ? 'text-blue-700' : status === 'completed' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {tab.name}
                  </span>
                </button>
               )})}
            </div>

            
            {configTab === 'project' && (
              <div className="flex flex-col gap-4 w-full">
                {/* AI Plan Upload Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-blue-500" />
                      AI Specification & Plan Parser
                    </h3>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    <p className="text-xs text-slate-500">
                      Have a specification sheet, blueprint, or structural plan (such as a gabled or curved shed drawing)? Upload it here. Gemini AI will automatically detect dimensions, structure configurations, and generate the complete Bill of Materials (BOM) instantly.
                    </p>
                    
                    <div className="relative border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        disabled={isUploadingImage}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                      />
                      <div className="flex flex-col items-center justify-center gap-2">
                        {isUploadingImage ? (
                          <>
                            <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
                            <span className="text-xs font-semibold text-blue-600 mt-1">Analyzing drawing & identifying BOM...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-8 h-8 text-slate-400" />
                            <span className="text-xs font-medium text-slate-700">Click or drag structure drawing here</span>
                            <span className="text-[10px] text-slate-400">PNG, JPG or JPEG specification sheets</span>
                          </>
                        )}
                      </div>
                    </div>

                    {uploadError && (
                      <div className="text-xs bg-rose-50 text-rose-600 p-2.5 rounded-lg border border-rose-100 font-medium">
                        {uploadError}
                      </div>
                    )}

                    {extractedSummary && (
                      <div className="text-xs bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-100 space-y-1.5 animate-in fade-in duration-200">
                        <div className="font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Specs Identified Successfully!
                        </div>
                        <p className="leading-relaxed font-mono text-[10px] bg-white/50 p-2 rounded border border-emerald-50 text-slate-700">{extractedSummary}</p>
                        <p className="text-[10px] text-emerald-600/90 font-medium italic">Applied to 3D View & complete BOM is generated.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-500" />
                    Project Details
                  </h3>
                </div>
                <div className="p-5 flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Project Name</label>
                      <input 
                        type="text" 
                        value={projectName} 
                        onChange={(e) => setProjectName(e.target.value)}
                        className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Target Budget</label>
                      <input 
                        type="number" 
                        value={targetBudget} 
                        onChange={(e) => setTargetBudget(Number(e.target.value))}
                        className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Delivery Address with Pincode</label>
                      <input 
                        type="text" 
                        name="deliveryAddress"
                        value={specs.deliveryAddress || ''} 
                        onChange={handleSpecChange}
                        placeholder="e.g. 482001, Jabalpur"
                        className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Diesel Price (Panagar)</label>
                      <input 
                        type="number"
                        name="dieselPrice"
                        value={specs.dieselPrice || 0} 
                        onChange={handleSpecChange}
                        className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Distance from Panagar (km)</label>
                      <input 
                        type="number"
                        name="deliveryDistance"
                        value={specs.deliveryDistance || 0} 
                        onChange={handleSpecChange}
                        className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                    <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Dimension Unit</label>
                      <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                          onClick={() => setDimensionUnit('m')}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${dimensionUnit === 'm' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          Meters
                        </button>
                        <button
                          onClick={() => setDimensionUnit('ft')}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${dimensionUnit === 'ft' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          Feet
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-100">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Width ({dimensionUnit === 'm' ? 'm' : 'ft'})</label>
                      <input type="number" 
                        value={dimensionUnit === 'm' ? specs.width : Number((specs.width * 3.28084).toFixed(2))} 
                        onChange={(e) => setSpecs({...specs, width: dimensionUnit === 'm' ? Number(e.target.value) : Number(e.target.value) * 0.3048})} 
                        className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Length ({dimensionUnit === 'm' ? 'm' : 'ft'})</label>
                      <input type="number" 
                        value={dimensionUnit === 'm' ? specs.length : Number((specs.length * 3.28084).toFixed(2))} 
                        onChange={(e) => setSpecs({...specs, length: dimensionUnit === 'm' ? Number(e.target.value) : Number(e.target.value) * 0.3048})} 
                        className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Eave Height ({dimensionUnit === 'm' ? 'm' : 'ft'})</label>
                      <input type="number" 
                        value={dimensionUnit === 'm' ? specs.eaveHeight : Number((specs.eaveHeight * 3.28084).toFixed(2))} 
                        onChange={(e) => setSpecs({...specs, eaveHeight: dimensionUnit === 'm' ? Number(e.target.value) : Number(e.target.value) * 0.3048})} 
                        className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                      />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                     <label className="flex items-center gap-2 cursor-pointer border rounded-lg p-3 bg-slate-50 flex-1 hover:border-blue-300">
                        <input type="checkbox" checked={specs.highWindVelocity} onChange={(e) => setSpecs({...specs, highWindVelocity: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                        <span className="text-sm font-medium text-slate-700">High Wind Velocity</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer border rounded-lg p-3 bg-slate-50 flex-1 hover:border-blue-300">
                        <input type="checkbox" checked={specs.snowLoad} onChange={(e) => setSpecs({...specs, snowLoad: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                        <span className="text-sm font-medium text-slate-700">Snow Load Conditions</span>
                     </label>
                  </div>
                </div>
              </div>
            </div>
          )}

            {configTab === 'primary' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-500" />
                    Primary Structure
                  </h3>
                </div>
                <div className="p-5 flex flex-col gap-5">
                   <label className="flex items-center gap-2 cursor-pointer p-4 border rounded-xl bg-slate-50 border-slate-200">
                     <input type="checkbox" checked={specs.hasPrimarySteel !== false} onChange={(e) => setSpecs({...specs, hasPrimarySteel: e.target.checked})} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                     <div>
                       <span className="text-base font-medium text-slate-800 block">Include Primary Steel</span>
                       <span className="text-xs text-slate-500">Columns & Rafters</span>
                     </div>
                   </label>
                   
                   {specs.hasPrimarySteel !== false && (
                     <div className="flex flex-col gap-4">
                       <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Frame Design</label>
                          <select className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" value={specs.frameType} onChange={(e) => setSpecs({...specs, frameType: e.target.value as any})}>
                            <option value="Clear Span">Clear Span</option>
                            <option value="Multi-Span">Multi-Span (Interior Columns)</option>
                            <option value="Truss">Truss-Framed (Triangular Webbing)</option>
                          </select>
                       </div>

                       {/* Truss and Span Structural Advisor Card */}
                       {(() => {
                         const wMeters = specs.width;
                         const wFeet = wMeters * 3.28084;
                         const displayWidth = dimensionUnit === 'm' ? `${wMeters.toFixed(1)} m` : `${wFeet.toFixed(0)} ft`;
                         
                         let recommendedFrame: 'Clear Span' | 'Truss' = 'Clear Span';
                         let spanCategory = 'Short Span';
                         let advisorText = '';
                         
                         if (wMeters < 10) {
                           recommendedFrame = 'Clear Span';
                           spanCategory = 'Short Span';
                           advisorText = `Under 10m (${(10*3.28084).toFixed(0)} ft), solid-web Clear Span portals are easy to install. However, lightweight prefabricated Trusses are a highly viable alternative if heavy lifting machinery is restricted.`;
                         } else if (wMeters >= 10 && wMeters < 18) {
                           recommendedFrame = 'Truss';
                           spanCategory = 'Medium Span';
                           advisorText = `For a ${displayWidth} span, a Truss-Framed system is highly recommended. At this medium span, standard rafters begin to deflect under self-weight. Trusses distribute forces axially, maximizing stiffness while reducing total steel weight by up to 25%.`;
                         } else {
                           recommendedFrame = 'Truss';
                           spanCategory = 'Large Span';
                           advisorText = `At ${displayWidth}, a Truss-Framed configuration is the optimal, professional choice. Solid beams over 18m require extremely deep web sections, increasing material costs and transport issues. Trusses effectively channel high bending stresses into pure tension and compression.`;
                         }

                         // Get Specific Truss Type recommendation based on Roof Type
                         let specificTrussType = 'Fink / Howe Triangular Truss';
                         let specificTrussDesc = 'Excellent for standard gable roof lines. Diagonal web struts divide the top chord into smaller sections to resist high snow/wind loads.';
                         
                         if (specs.roofType === 'Single Slope') {
                           specificTrussType = 'Mono-pitch Pratt Truss';
                           specificTrussDesc = 'Ideal for single-slope drainage. Diagonal webs slant upwards to higher supports to act in tension under gravity load, ensuring maximum material efficiency.';
                         } else if (specs.roofType === 'Curved') {
                           specificTrussType = 'Bowstring / Bow-chord Truss';
                           specificTrussDesc = 'Curved top chord matches bending moment profiles, eliminating high stress points. Visually elegant and superior for architectural open spans.';
                         } else if (specs.roofType === 'Multi-Sloped Hut') {
                           specificTrussType = 'Gambrel / Cambered Truss';
                           specificTrussDesc = 'Multi-pitch design offering high interior clearance and vertical headroom. Ideal for agricultural barns and custom storage silos.';
                         }

                         const isOptimalSelected = specs.frameType === recommendedFrame || (recommendedFrame === 'Truss' && specs.frameType === 'Truss');

                         return (
                           <div className="border border-indigo-100 rounded-xl bg-indigo-50/20 p-4 flex flex-col gap-4" id="truss-span-advisor-card">
                             <div className="flex items-center justify-between border-b border-indigo-100/60 pb-2.5">
                               <div className="flex items-center gap-1.5">
                                 <DraftingCompass className="w-4 h-4 text-indigo-600" />
                                 <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Truss & Span Advisor</span>
                               </div>
                               <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-700">
                                 {spanCategory} ({displayWidth})
                               </span>
                             </div>

                             <div className="flex flex-col gap-2">
                               <div className="text-xs text-slate-600 leading-relaxed">
                                 {advisorText}
                               </div>

                               <div className="mt-2 bg-white rounded-lg border border-slate-200 p-3 flex flex-col gap-2">
                                 <div className="flex justify-between items-center">
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Necessitated Truss Type</span>
                                   <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 border border-amber-200 text-amber-700 uppercase tracking-wider">
                                     Structural Best Match
                                   </span>
                                 </div>
                                 <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                   <Activity className="w-3.5 h-3.5 text-indigo-500" />
                                   {specificTrussType}
                                 </h4>
                                 <p className="text-[10px] text-slate-500 leading-normal">
                                   {specificTrussDesc}
                                 </p>
                                </div>
                             </div>

                             <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                               <div className="flex items-center gap-1.5">
                                 {isOptimalSelected ? (
                                   <div className="flex items-center gap-1.5">
                                     <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                     <span className="text-[11px] font-semibold text-emerald-700">Optimal Frame Selected</span>
                                   </div>
                                 ) : (
                                   <div className="flex items-center gap-1.5">
                                     <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                     <span className="text-[11px] font-semibold text-amber-700">Truss Frame Recommended</span>
                                   </div>
                                 )}
                               </div>

                               {!isOptimalSelected && (
                                 <button
                                   onClick={() => setSpecs({ ...specs, frameType: 'Truss' })}
                                   className="w-full sm:w-auto px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold transition-all shadow-sm hover:shadow active:scale-[0.98] flex items-center justify-center gap-1"
                                 >
                                   <Wrench className="w-3 h-3" />
                                   Optimize to Truss Design
                                 </button>
                               )}
                             </div>
                           </div>
                         );
                       })()}
                     </div>
                   )}
                </div>
              </div>
            )}

            {configTab === 'secondary' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <AlignJustify className="w-4 h-4 text-slate-500" />
                    Supporting Structure
                  </h3>
                </div>
                <div className="p-5 flex flex-col gap-5">
                   <label className="flex items-center gap-2 cursor-pointer p-4 border rounded-xl bg-slate-50 border-slate-200">
                     <input type="checkbox" checked={specs.hasSecondarySteel !== false} onChange={(e) => setSpecs({...specs, hasSecondarySteel: e.target.checked})} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                     <div>
                       <span className="text-base font-medium text-slate-800 block">Include Purlins (Roof)</span>
                       <span className="text-xs text-slate-500">Secondary structure for the roof</span>
                     </div>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer p-4 border rounded-xl bg-slate-50 border-slate-200">
                     <input type="checkbox" checked={specs.hasGirts !== false} onChange={(e) => setSpecs({...specs, hasGirts: e.target.checked})} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                     <div>
                       <span className="text-base font-medium text-slate-800 block">Include Girts (Walls)</span>
                       <span className="text-xs text-slate-500">Secondary structure for the walls</span>
                     </div>
                   </label>
                </div>
              </div>
            )}

            {configTab === 'hardware' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-slate-500" />
                    Hardware
                  </h3>
                </div>
                <div className="p-5 flex flex-col gap-5">
                   <p className="text-sm text-slate-600">
                     Base plates, splice plates, high-strength bolts, and welding consumables are calculated automatically based on the primary and secondary structural requirements.
                   </p>
                </div>
              </div>
            )}

            {configTab === 'roofing' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-slate-500" />
                    Roofing
                  </h3>
                </div>
                <div className="p-5 flex flex-col gap-5">
                   <label className="flex items-center gap-2 cursor-pointer p-4 border rounded-xl bg-slate-50 border-slate-200">
                     <input type="checkbox" checked={specs.hasRoof !== false} onChange={(e) => setSpecs({...specs, hasRoof: e.target.checked})} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                     <div>
                       <span className="text-base font-medium text-slate-800 block">Include Roof Sheeting</span>
                       <span className="text-xs text-slate-500">Outer cladding for the roof</span>
                     </div>
                   </label>

                   {specs.hasRoof !== false && (
                     <>
                        <div className="flex flex-col gap-1 pt-2">
                          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Roof Type</label>
                          <select className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" value={specs.roofType} onChange={(e) => setSpecs({...specs, roofType: e.target.value as any})}>
                            <option value="Single Slope">Single Slope</option>
                            <option value="Hut-shaped">Hut-shaped (Gable)</option>
                            <option value="Multi-Sloped Hut">Multi-Sloped (Monitor/Dropped)</option>
                            <option value="Curved">Curved Pitch</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Slope / Pitch (%)</label>
                          <input type="number" value={specs.roofSlope} onChange={(e) => setSpecs({...specs, roofSlope: Number(e.target.value)})} className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        </div>

                        {/* Slope Recommendation Advisor */}
                        {(() => {
                          let recommendedSlope = 10;
                          let explanation = '';
                          let title = '';

                          if (specs.roofType === 'Single Slope') {
                            recommendedSlope = specs.width > 12 ? 12 : 10;
                            title = 'Single Slope Drainage Recommendation';
                            explanation = `Single slope roofs have longer continuous sheet runs. A ${recommendedSlope}% pitch (approx. 1:${Math.round(100/recommendedSlope)}) is recommended for a ${specs.width.toFixed(1)}m span to guarantee high-velocity storm water drainage and completely prevent water backup at the sheet overlaps.`;
                          } else if (specs.roofType === 'Curved') {
                            recommendedSlope = 10;
                            title = 'Curved Arch Pitch Advisor';
                            explanation = 'For curved profiles, a 10% rise-to-span ratio creates an aerodynamically stable arch. This minimizes drag forces under high wind conditions while ensuring smooth runoff of debris and rainwater.';
                          } else if (specs.roofType === 'Multi-Sloped Hut') {
                            recommendedSlope = 10;
                            title = 'Monitor Multi-Pitch Advisor';
                            explanation = 'Multi-sloped monitor configurations are best suited to a baseline 10% slope. This creates a clean structural drop at the center monitor line, optimizing natural ridge-level ventilation and daylight penetration.';
                          } else { // Hut-shaped / Gable
                            if (specs.snowLoad) {
                              recommendedSlope = 15;
                              title = 'High Snow Shedding Design';
                              explanation = 'Under snow load conditions, a steep 15% slope is highly recommended. This promotes gravity-driven snow sliding, reducing heavy weight accumulations and protecting the primary rafters from overloading.';
                            } else if (specs.highWindVelocity) {
                              recommendedSlope = 8;
                              title = 'Low-Profile Wind Resistant Design';
                              explanation = 'For high-velocity wind zones, a lower 8% slope is optimal. This reduces the building’s frontal profile and lowers the wind drag coefficient, minimizing uplift force (suction) on the roof sheets.';
                            } else {
                              recommendedSlope = 10;
                              title = 'Standard PEB Gable Standard';
                              explanation = 'A standard 10% (1:10) slope is the optimal engineering benchmark for industrial gable sheds. It minimizes raw steel weight (shorter rafters and webs) while keeping water drainage reliable.';
                            }
                          }

                          const isOptimal = specs.roofSlope === recommendedSlope;

                          return (
                            <div className="border border-indigo-100 rounded-xl bg-indigo-50/20 p-4 flex flex-col gap-3" id="roof-slope-advisor-card">
                              <div className="flex items-center justify-between border-b border-indigo-100/60 pb-2">
                                <div className="flex items-center gap-1.5">
                                  <DraftingCompass className="w-3.5 h-3.5 text-indigo-600" />
                                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Roof Slope Advisor</span>
                                </div>
                                <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-[9px] font-bold text-indigo-700">
                                  Recommended: {recommendedSlope}%
                                </span>
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <h4 className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                                  <Activity className="w-3 h-3 text-indigo-500" />
                                  {title}
                                </h4>
                                <p className="text-[10px] text-slate-500 leading-relaxed">
                                  {explanation}
                                </p>
                              </div>

                              <div className="pt-1.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  {isOptimal ? (
                                    <div className="flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                      <span className="text-[10px] font-semibold text-emerald-700">Matches Best Practice</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                      <span className="text-[10px] font-semibold text-amber-700">Current: {specs.roofSlope}%</span>
                                    </div>
                                  )}
                                </div>

                                {!isOptimal && (
                                  <button
                                    onClick={() => setSpecs({ ...specs, roofSlope: recommendedSlope })}
                                    className="w-full sm:w-auto px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-1"
                                  >
                                    <Wrench className="w-2.5 h-2.5" />
                                    Apply Proposed {recommendedSlope}% Slope
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Profile</label>
                          <select className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" value={specs.roofProfile} onChange={(e) => setSpecs({...specs, roofProfile: e.target.value as any})}>
                            <option value="7v Profile">7v Profile (198mm pitch, 30mm depth)</option>
                            <option value="6v Profile">6v Profile (198mm pitch, 30mm depth)</option>
                            <option value="Standard">Standard Corrugated</option>
                          </select>
                          <ProfileDiagram type={specs.roofProfile || '7v Profile'} />
                        </div>
                        
                        <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
                           <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Primary Color</label>
                           <div className="flex gap-2 flex-wrap items-center">
                             {STANDARD_COLORS.map(c => (
                               <button key={c.hex} className={`w-7 h-7 rounded-full border transition-transform ${specs.roofColor === c.hex ? 'border-slate-900 scale-125 shadow-md' : 'border-slate-300 shadow-sm hover:scale-110'}`} style={{ backgroundColor: c.hex }} onClick={() => setSpecs({...specs, roofColor: c.hex})} title={c.name} />
                             ))}
                             <RALInput value={specs.roofColor || '#0089b6'} onChange={(v) => setSpecs({...specs, roofColor: v})} />
                           </div>
                        </div>

                        <div className="pt-2">
                           <label className="flex items-center gap-2 cursor-pointer pb-2">
                             <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" checked={specs.alternateRoofColors} onChange={(e) => setSpecs({...specs, alternateRoofColors: e.target.checked})} />
                             <span className="text-sm font-medium text-slate-700">Enable Alternate Sheet Colors</span>
                           </label>
                           {specs.alternateRoofColors && (
                             <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                               <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Alternate Color</label>
                               <div className="flex gap-2 flex-wrap items-center">
                                 {STANDARD_COLORS.map(c => (
                                   <button key={`alt-roof-${c.hex}`} className={`w-6 h-6 rounded-full border ${specs.alternateRoofColor === c.hex ? 'border-slate-900 scale-125' : 'border-slate-300'}`} style={{ backgroundColor: c.hex }} onClick={() => setSpecs({...specs, alternateRoofColor: c.hex})} />
                                 ))}
                                 <RALInput value={specs.alternateRoofColor || '#d3d3d3'} onChange={(v) => setSpecs({...specs, alternateRoofColor: v})} />
                               </div>
                               <div className="flex gap-2 items-center mt-2 flex-wrap">
                                 <label className="text-xs font-semibold text-slate-600">Pattern</label>
                                 <select className="p-1 text-sm border border-slate-300 rounded bg-white" value={specs.alternateRoofPattern || 'stripes'} onChange={(e) => setSpecs({...specs, alternateRoofPattern: e.target.value as any})}>
                                   <option value="stripes">Vertical Stripes</option>
                                   <option value="bands">Horizontal Bands</option>
                                   <option value="checkerboard">Checkerboard</option>
                                   <option value="edges">Edges / Border</option>
                                   <option value="center">Center Highlight</option>
                                 </select>

                                 {(!specs.alternateRoofPattern || specs.alternateRoofPattern === 'stripes' || specs.alternateRoofPattern === 'checkerboard' || specs.alternateRoofPattern === 'bands' || specs.alternateRoofPattern === 'center') && (
                                    <>
                                       <label className="text-xs font-semibold text-slate-600 ml-2">Ratio/Spread</label>
                                       <select className="p-1 text-sm border border-slate-300 rounded w-20 bg-white" value={specs.alternateRoofRatio || 2} onChange={(e) => setSpecs({...specs, alternateRoofRatio: parseInt(e.target.value)})}>
                                         <option value={2}>1 : 1</option>
                                         <option value={3}>2 : 1</option>
                                         <option value={4}>3 : 1</option>
                                         <option value={5}>4 : 1</option>
                                         <option value={6}>5 : 1</option>
                                       </select>
                                    </>
                                 )}
                               </div>
                             </div>
                           )}
                        </div>
                     </>
                   )}
                </div>
              </div>
            )}

            {/* Profile Sheet Leak Diagnostics & Prevention Tool */}
            {configTab === 'roofing' && specs.hasRoof !== false && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-rose-500 animate-pulse" />
                    Profile Sheet Leak Diagnostics & Prevention
                  </h3>
                </div>
                <div className="p-5 flex flex-col gap-5">
                  <p className="text-sm text-slate-600">
                    Profile sheets can leak under high precipitation if overlapping joints, slope thresholds, or fastener washers are improperly designed. Use our interactive simulation below to observe how water droplets traverse the cladding profiles under different engineering remedies.
                  </p>

                  {/* Symptom Selector Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-1 rounded-xl">
                    {[
                      { id: 'overlap', label: 'Joint Overlaps', icon: Layers },
                      { id: 'screw', label: 'Fasteners & Screws', icon: Settings2 },
                      { id: 'ridge', label: 'Ridge Centerline', icon: ArrowUpToLine },
                      { id: 'gutter', label: 'Eaves & Gutters', icon: Droplet },
                    ].map(s => {
                      const IconComp = s.icon;
                      const isActive = activeLeakSymptom === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setActiveLeakSymptom(activeLeakSymptom === s.id ? null : s.id as any)}
                          className={`flex flex-col items-center justify-center gap-2 py-3 px-2 text-xs font-bold rounded-lg transition-all ${
                            isActive 
                              ? 'bg-rose-500 text-white shadow-md scale-[1.03] font-extrabold' 
                              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 bg-white border border-slate-200'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                          {s.label}
                        </button>
                      );
                    })}
                  </div>

                  <ProfileSheetWaterSimulator 
                    specs={specs} 
                    setSpecs={setSpecs} 
                    activeSymptom={activeLeakSymptom} 
                    setActiveSymptom={setActiveLeakSymptom} 
                  />

                  {/* Legacy Symptom Detail Display (Disabled) */}
                  {false && activeLeakSymptom ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                      {activeLeakSymptom === 'overlap' && (() => {
                        const hasGoodSlope = specs.roofSlope >= (specs.roofType === 'Single Slope' ? 12 : 10);
                        const isFixed = hasGoodSlope && specs.hasSilicon && specs.roofProfile === '6v Profile';
                        return (
                          <>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-slate-800">Symptom: Capillary Overlap Leakage</h4>
                                {isFixed ? (
                                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Fully Resolved
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 animate-pulse">
                                    Vulnerable
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                Rainwater is drawn inside sheet side-laps via capillary draw or backs up at horizontal sheet overlaps (end-laps) under high winds. This is extremely common on shallow roofs (under 10%) without sealant.
                              </p>
                            </div>
                            <div className="bg-white border border-slate-100 p-3.5 rounded-lg space-y-2 text-xs text-slate-600">
                              <span className="font-bold text-slate-700 block">Engineering Standard Specifications Required:</span>
                              <ul className="space-y-1.5 pl-1">
                                <li className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${hasGoodSlope ? "bg-emerald-500" : "bg-slate-300"}`} />
                                  <span className={hasGoodSlope ? "text-emerald-700 font-medium" : ""}>Roof slope pitch &ge; {specs.roofType === 'Single Slope' ? '12%' : '10%'} (Current: {specs.roofSlope}%)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${specs.hasSilicon ? "bg-emerald-500" : "bg-slate-300"}`} />
                                  <span className={specs.hasSilicon ? "text-emerald-700 font-medium" : ""}>Dual-line silicon sealant or butyl mastic tape on overlaps (Current: {specs.hasSilicon ? "Equipped" : "Missing"})</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${specs.roofProfile === '6v Profile' ? "bg-emerald-500" : "bg-slate-300"}`} />
                                  <span className={specs.roofProfile === '6v Profile' ? "text-emerald-700 font-medium" : ""}>High-Rib 6v Profile sheeting (28-30mm depth with built-in anti-capillary groove)</span>
                                </li>
                              </ul>
                            </div>
                            {!isFixed && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSpecs(prev => ({
                                    ...prev,
                                    roofSlope: Math.max(prev.roofSlope, prev.roofType === 'Single Slope' ? 12 : 10),
                                    hasSilicon: true,
                                    roofProfile: '6v Profile'
                                  }));
                                }}
                                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]"
                              >
                                <Wrench className="w-3.5 h-3.5" />
                                Apply Standard Overlap Sealant & Optimize Pitch
                              </button>
                            )}
                          </>
                        );
                      })()}

                      {activeLeakSymptom === 'screw' && (() => {
                        const isFixed = specs.hasSDScrews && specs.hasPVCCaps;
                        return (
                          <>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-slate-800">Symptom: Fastener Screwhole Ingress</h4>
                                {isFixed ? (
                                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Fully Resolved
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 animate-pulse">
                                    Vulnerable
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                Rainwater enters through fastener drill holes. This is caused by over-tightened/skewed screws, missing or degraded EPDM rubber washers, or fastening into troughs instead of the profile crests.
                              </p>
                            </div>
                            <div className="bg-white border border-slate-100 p-3.5 rounded-lg space-y-2 text-xs text-slate-600">
                              <span className="font-bold text-slate-700 block">Engineering Standard Specifications Required:</span>
                              <ul className="space-y-1.5 pl-1">
                                <li className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${specs.hasSDScrews ? "bg-emerald-500" : "bg-slate-300"}`} />
                                  <span className={specs.hasSDScrews ? "text-emerald-700 font-medium" : ""}>Self-Drilling Screws (SDS) with integrated EPDM washers (Current: {specs.hasSDScrews ? "Equipped" : "Missing"})</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${specs.hasPVCCaps ? "bg-emerald-500" : "bg-slate-300"}`} />
                                  <span className={specs.hasPVCCaps ? "text-emerald-700 font-medium" : ""}>PVC Protective Caps matching the sheet profile color (Current: {specs.hasPVCCaps ? "Equipped" : "Missing"})</span>
                                </li>
                              </ul>
                            </div>
                            {!isFixed && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSpecs(prev => ({
                                    ...prev,
                                    hasSDScrews: true,
                                    hasPVCCaps: true
                                  }));
                                }}
                                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]"
                              >
                                <Wrench className="w-3.5 h-3.5" />
                                Upgrade to High-Tensile SDScrews & Protective PVC Caps
                              </button>
                            )}
                          </>
                        );
                      })()}

                      {activeLeakSymptom === 'ridge' && (() => {
                        const isFixed = specs.roofType === 'Single Slope' || specs.hasRidgeCap;
                        return (
                          <>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-slate-800">Symptom: Center Ridge Backflow</h4>
                                {isFixed ? (
                                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Fully Resolved
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 animate-pulse">
                                    Vulnerable
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                Heavy storms and wind-driven rain blow rainwater back up under the center ridge flashing, where it overflows the top of the sheets and runs down onto internal structural beams.
                              </p>
                            </div>
                            <div className="bg-white border border-slate-100 p-3.5 rounded-lg space-y-2 text-xs text-slate-600">
                              <span className="font-bold text-slate-700 block">Engineering Standard Specifications Required:</span>
                              <ul className="space-y-1.5 pl-1">
                                <li className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${isFixed ? "bg-emerald-500" : "bg-slate-300"}`} />
                                  <span className={isFixed ? "text-emerald-700 font-medium" : ""}>Heavy-gauge Plain Ridge Flashing with profile-matching overlaps (Current: {specs.hasRidgeCap ? "Equipped" : "Missing"})</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                  <span>Trough turn-up (crest-crimped sheet ends) at the ridge centerline to block high-velocity water backflow</span>
                                </li>
                              </ul>
                            </div>
                            {!isFixed && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSpecs(prev => ({
                                    ...prev,
                                    hasRidgeCap: true
                                  }));
                                }}
                                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]"
                              >
                                <Wrench className="w-3.5 h-3.5" />
                                Equip Custom Profile Plain Ridge Flashing
                              </button>
                            )}
                          </>
                        );
                      })()}

                      {activeLeakSymptom === 'gutter' && (() => {
                        const isFixed = specs.hasGutters && specs.hasDownPipes;
                        return (
                          <>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-slate-800">Symptom: Gutter & Eaves Overspill</h4>
                                {isFixed ? (
                                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Fully Resolved
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 animate-pulse">
                                    Vulnerable
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                Water cascades over the eave lines of the building too fast during monsoon-level storms, overflowing basic gutters and flooding down onto wall panels and causing leaks in sidewall cladding.
                              </p>
                            </div>
                            <div className="bg-white border border-slate-100 p-3.5 rounded-lg space-y-2 text-xs text-slate-600">
                              <span className="font-bold text-slate-700 block">Engineering Standard Specifications Required:</span>
                              <ul className="space-y-1.5 pl-1">
                                <li className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${specs.hasGutters ? "bg-emerald-500" : "bg-slate-300"}`} />
                                  <span className={specs.hasGutters ? "text-emerald-700 font-medium" : ""}>High-flow, wide eaves gutters (Current: {specs.hasGutters ? "Equipped" : "Missing"})</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${specs.hasDownPipes ? "bg-emerald-500" : "bg-slate-300"}`} />
                                  <span className={specs.hasDownPipes ? "text-emerald-700 font-medium" : ""}>Custom multi-outlet Down Pipes sized for peak flow drainage (Current: {specs.hasDownPipes ? "Equipped" : "Missing"})</span>
                                </li>
                              </ul>
                            </div>
                            {!isFixed && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSpecs(prev => ({
                                    ...prev,
                                    hasGutters: true,
                                    hasDownPipes: true
                                  }));
                                }}
                                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]"
                              >
                                <Wrench className="w-3.5 h-3.5" />
                                Add Custom High-Flow Gutters & Downpipes
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 p-5 rounded-xl text-center bg-slate-50/50">
                      <Droplet className="w-8 h-8 text-slate-300 mx-auto mb-2 text-rose-300 animate-pulse" />
                      <p className="text-xs font-semibold text-slate-600">Select a Leak Symptom Above to Diagnose</p>
                      <p className="text-[10px] text-slate-400 mt-1">Our PEB engine will evaluate active specifications and recommend design corrections.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {configTab === 'walling' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-slate-500" />
                    Walling
                  </h3>
                </div>
                <div className="p-5 flex flex-col gap-5">
                   <label className="flex items-center gap-2 cursor-pointer p-4 border rounded-xl bg-slate-50 border-slate-200">
                     <input type="checkbox" checked={specs.hasWalls !== false} onChange={(e) => setSpecs({...specs, hasWalls: e.target.checked})} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                     <div>
                       <span className="text-base font-medium text-slate-800 block">Include Wall Cladding</span>
                       <span className="text-xs text-slate-500">Outer sheeting for the walls</span>
                     </div>
                   </label>

                   {specs.hasWalls !== false && (
                     <>
                        <div className="flex flex-col gap-1 pt-2">
                          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Profile</label>
                         <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3.5 text-xs text-indigo-700 leading-relaxed mb-2">
                           <strong>Independent Wall Configuration</strong>
                           <p className="mt-0.5">Wall cladding profile, colors, patterns, and ratios can be configured independently from the roof settings.</p>
                         </div>
                          <select 
                            className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-800" 
                            value={specs.wallProfile || '7v Profile'} 
                            onChange={(e) => setSpecs({ ...specs, wallProfile: e.target.value as any })}
                          >
                            <option value="7v Profile">7v Profile (198mm pitch, 30mm depth)</option>
                            <option value="6v Profile">6v Profile (198mm pitch, 30mm depth)</option>
                            <option value="Standard">Standard Corrugated</option>
                          </select>
                          <ProfileDiagram type={specs.wallProfile || '7v Profile'} />
                          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800 leading-relaxed mt-2 flex gap-2 items-start">
                            <span className="text-amber-500 font-bold">💡</span>
                            <div>
                              <strong>Installation Recommendation:</strong>
                              <p className="mt-0.5">When installing wall panels, it is recommended to secure the self-drilling screws from the exterior side, ensuring they are fastened at the center of each pitch (rather than on the V-groove/crests) for optimal water-shedding and mechanical strength.</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
                           <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Primary Color</label>
                           <div className="flex gap-2 flex-wrap items-center">
                             {STANDARD_COLORS.map(c => (
                               <button 
                                 key={c.hex} 
                                 className={`w-7 h-7 rounded-full border transition-transform ${specs.wallColor === c.hex ? 'border-slate-900 scale-125 shadow-md' : 'border-slate-300 shadow-sm'}`} 
                                 style={{ backgroundColor: c.hex }} 
                                 onClick={() => setSpecs({ ...specs, wallColor: c.hex })}
                                 title={c.name} 
                               />
                             ))}
                             <RALInput value={specs.wallColor || '#d3d3d3'} onChange={(v) => setSpecs({ ...specs, wallColor: v })} />
                           </div>
                        </div>

                        <div className="pt-2">
                           <label className="flex items-center gap-2 cursor-pointer pb-2">
                             <input 
                               type="checkbox" 
                               className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" 
                               checked={specs.alternateWallColors} 
                               onChange={(e) => setSpecs({ ...specs, alternateWallColors: e.target.checked })}
                             />
                             <span className="text-sm font-medium text-slate-700">Enable Alternate Sheet Colors</span>
                           </label>
                           {specs.alternateWallColors && (
                             <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                               <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Alternate Color</label>
                               <div className="flex gap-2 flex-wrap items-center">
                                 {STANDARD_COLORS.map(c => (
                                   <button 
                                     key={`alt-wall-${c.hex}`} 
                                     className={`w-6 h-6 rounded-full border ${specs.alternateWallColor === c.hex ? 'border-slate-900 scale-125' : 'border-slate-300'}`} 
                                     style={{ backgroundColor: c.hex }} 
                                     onClick={() => setSpecs({ ...specs, alternateWallColor: c.hex })}
                                     title={c.name}
                                   />
                                 ))}
                                 <RALInput value={specs.alternateWallColor || '#d3d3d3'} onChange={(v) => setSpecs({ ...specs, alternateWallColor: v })} />
                               </div>
                               <div className="flex gap-2 items-center mt-2 flex-wrap">
                                 <label className="text-xs font-semibold text-slate-600">Pattern</label>
                                 <select 
                                   className="p-1 text-sm border border-slate-300 rounded bg-white" 
                                   value={specs.alternateWallPattern || 'stripes'} 
                                   onChange={(e) => setSpecs({ ...specs, alternateWallPattern: e.target.value as any })}
                                 >
                                   <option value="stripes">Vertical Stripes</option>
                                   <option value="bands">Horizontal Bands</option>
                                   <option value="checkerboard">Checkerboard</option>
                                   <option value="edges">Edges / Border</option>
                                   <option value="center">Center Highlight</option>
                                 </select>

                                 {(!specs.alternateWallPattern || specs.alternateWallPattern === 'stripes' || specs.alternateWallPattern === 'checkerboard' || specs.alternateWallPattern === 'bands' || specs.alternateWallPattern === 'center') && (
                                    <>
                                       <label className="text-xs font-semibold text-slate-600 ml-2">Ratio/Spread</label>
                                       <select 
                                         className="p-1 text-sm border border-slate-300 rounded w-20 bg-white" 
                                         value={specs.alternateWallRatio || 2} 
                                         onChange={(e) => setSpecs({ ...specs, alternateWallRatio: parseInt(e.target.value) })}
                                       >
                                         <option value={2}>1 : 1</option>
                                         <option value={3}>2 : 1</option>
                                         <option value={4}>3 : 1</option>
                                         <option value={5}>4 : 1</option>
                                         <option value={6}>5 : 1</option>
                                       </select>
                                    </>
                                 )}
                               </div>
                             </div>
                           )}
                        </div>
                     </>
                   )}
                </div>
              </div>
            )}

            {configTab === 'accessories' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <List className="w-4 h-4 text-slate-500" />
                    Accessories
                  </h3>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {[
                     { k: 'hasRidgeCap', lbl: 'Plain Ridge', colorKey: 'ridgeCapColor' },
                     { k: 'hasGutters', lbl: 'Gutters', colorKey: 'gutterColor' },
                     { k: 'hasGables', lbl: 'Gable / Rake Flashing', colorKey: 'gableColor' },
                     { k: 'hasCornerFlashing', lbl: 'Corner Flashing', colorKey: 'cornerFlashingColor' },
                     { k: 'hasEndFlashing', lbl: 'Bottom Trim', colorKey: 'endFlashingColor' },
                     { k: 'hasDownPipes', lbl: 'Down Pipes', colorKey: 'downPipeColor' },
                     { k: 'hasTurboVents', lbl: 'Turbo Vents' },
                     { k: 'hasLouvers', lbl: 'Louvers', selectKey: 'louversPosition', selectOptions: ['Front', 'Back', 'Left', 'Right', 'Left & Right', 'Front & Back', 'All Sides'] },
                     { k: 'hasInsulation', lbl: 'Bubble Insulation' },
                     { k: 'hasPolySheets', lbl: 'Polycarbonate Sheets' },
                     { k: 'hasFlanges', lbl: 'Flanges' },
                     { k: 'hasProfileGate', lbl: 'Profile Gate', selectKey: 'profileGatePosition', selectOptions: ['Front', 'Back', 'Left', 'Right'] },
                     { k: 'hasWindows', lbl: 'Windows', selectKey: 'windowsPosition', selectOptions: ['Front', 'Back', 'Left', 'Right', 'Left & Right', 'Front & Back', 'All Sides'] },
                     { k: 'hasCrimpedSheets', lbl: 'Crimped Sheets', colorKey: 'crimpedSheetsColor' }
                   ].filter(opt => !(specs.roofType === 'Single Slope' && opt.k === 'hasRidgeCap')).map(opt => (
                     <div key={opt.k} className="flex flex-col gap-1 border border-slate-200 rounded p-2 hover:bg-slate-50 transition-colors">
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={(specs as any)[opt.k] !== false} onChange={(e) => setSpecs({...specs, [opt.k]: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                          <span className="text-sm font-medium text-slate-700">{opt.lbl}</span>
                       </label>
                       {(specs as any)[opt.k] !== false && (opt as any).colorKey && (
                         <div className="flex items-center gap-2 pl-6 pt-1">
                           <span className="text-xs text-slate-500 font-medium">Color:</span>
                           <RALInput value={(specs as any)[(opt as any).colorKey] || '#383e42'} onChange={(v) => setSpecs({...specs, [(opt as any).colorKey]: v})} />
                         </div>
                       )}
                       {(specs as any)[opt.k] !== false && (opt as any).selectKey && (
                         <div className="flex items-center gap-2 pl-6 pt-1">
                           <span className="text-xs text-slate-500 font-medium">Position:</span>
                           <select 
                             className="text-sm bg-white border border-slate-200 rounded p-1 outline-none text-slate-700" 
                             value={(specs as any)[(opt as any).selectKey] || 'Front'} 
                             onChange={(e) => setSpecs({...specs, [(opt as any).selectKey]: e.target.value})}
                           >
                             {(opt as any).selectOptions.map((so: string) => (
                               <option key={so} value={so}>{so}</option>
                             ))}
                           </select>
                         </div>
                       )}
                     </div>
                   ))}
                </div>
              </div>
            )}

            {configTab === 'fasteners' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-slate-500" />
                    Fasteners
                  </h3>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {[
                     { k: 'hasSDScrews', lbl: 'Self-Drilling Screws' },
                     { k: 'hasSilicon', lbl: 'Silicon Sealant' },
                     { k: 'hasPVCCaps', lbl: 'PVC Caps', colorKey: 'pvcCapColor' }
                   ].map(opt => (
                     <div key={opt.k} className="flex flex-col gap-1 border border-slate-200 rounded p-2 hover:bg-slate-50 transition-colors">
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={(specs as any)[opt.k] !== false} onChange={(e) => setSpecs({...specs, [opt.k]: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded border-slate-300" />
                          <span className="text-sm font-medium text-slate-700">{opt.lbl}</span>
                       </label>
                       {(specs as any)[opt.k] !== false && (opt as any).colorKey && (
                         <div className="flex items-center gap-2 pl-6 pt-1">
                           <span className="text-xs text-slate-500 font-medium">Color:</span>
                           <RALInput value={(specs as any)[(opt as any).colorKey] || '#383e42'} onChange={(v) => setSpecs({...specs, [(opt as any).colorKey]: v})} />
                         </div>
                       )}
                     </div>
                   ))}
                </div>
              </div>
            )}

            {configTab === 'takeoff' && (
              <div className="flex flex-col gap-4 w-full">
                {/* AI Plan Upload Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-blue-500" />
                      AI Specification & Plan Parser
                    </h3>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    <p className="text-xs text-slate-500">
                      Upload any structural plan, drawing, or specification sheet. Gemini AI will automatically detect specifications, update the 3D model, and identify the complete Bill of Materials (BOM) instantly.
                    </p>
                    
                    <div className="relative border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        disabled={isUploadingImage}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                      />
                      <div className="flex flex-col items-center justify-center gap-2">
                        {isUploadingImage ? (
                          <>
                            <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
                            <span className="text-xs font-semibold text-blue-600 mt-1">Analyzing drawing & identifying BOM...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-8 h-8 text-slate-400" />
                            <span className="text-xs font-medium text-slate-700">Click or drag structure drawing here</span>
                            <span className="text-[10px] text-slate-400">PNG, JPG or JPEG specification sheets</span>
                          </>
                        )}
                      </div>
                    </div>

                    {uploadError && (
                      <div className="text-xs bg-rose-50 text-rose-600 p-2.5 rounded-lg border border-rose-100 font-medium">
                        {uploadError}
                      </div>
                    )}

                    {extractedSummary && (
                      <div className="text-xs bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-100 space-y-1.5 animate-in fade-in duration-200">
                        <div className="font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Specs Identified Successfully!
                        </div>
                        <p className="leading-relaxed font-mono text-[10px] bg-white/50 p-2 rounded border border-emerald-50 text-slate-700">{extractedSummary}</p>
                        <p className="text-[10px] text-emerald-600/90 font-medium italic">Applied to 3D View & complete BOM is generated.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-slate-500" />
                      Required Materials Estimate
                    </h3>
                    <button onClick={() => setShowMaterialEstimate(true)} className="p-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 text-xs font-semibold">View BOM</button>
                  </div>
                  <div className="p-5">
                    <MaterialVisualizer 
                      primary={parseFloat(primarySteel)} 
                      secondary={parseFloat(secondarySteel)}
                      hardware={parseFloat(accessories)}
                    />
                  </div>
                </div>
              </div>
            )}
{/* Step Navigation Controls */}
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
              {(() => {
                
                const stepKeys = WIZARD_KEYS;
                const currentIdx = stepKeys.indexOf(configTab);
                
                return (
                  <>
                    <button
                      onClick={() => currentIdx > 0 && setConfigTab(stepKeys[currentIdx - 1] as any)}
                      disabled={currentIdx === 0}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        currentIdx === 0 
                          ? 'text-slate-300 cursor-not-allowed opacity-50' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      &larr; Previous Step
                    </button>
                    
                    <button
                      onClick={() => currentIdx < stepKeys.length - 1 ? setConfigTab(stepKeys[currentIdx + 1] as any) : setShowMaterialEstimate(true)}
                      className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                      {currentIdx < stepKeys.length - 1 ? 'Next Step' : 'View Complete BOM'}
                    </button>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Right Column: Workflow Phase Timeline & Visualizer */}
          <div className="lg:col-span-8 space-y-6">
            {/* Visualizer & Colors */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 border-b border-slate-200 px-5 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-slate-500" />
                  Structure Views & Elevation Blueprints
                </h3>
                <div className="flex flex-wrap gap-1 bg-slate-200 p-1 rounded-lg w-full md:w-auto">
                  <button
                    onClick={() => setVisualizerTab('3d-model')}
                    className={`flex-1 md:flex-initial px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${visualizerTab === '3d-model' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                  >
                    3D Full Model
                  </button>
                  <button
                    onClick={() => setVisualizerTab('3d-frame')}
                    className={`flex-1 md:flex-initial px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${visualizerTab === '3d-frame' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                  >
                    3D Structural Frame
                  </button>
                  <button
                    onClick={() => setVisualizerTab('front-elevation')}
                    className={`flex-1 md:flex-initial px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${visualizerTab === 'front-elevation' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                  >
                    Front Elev.
                  </button>
                  <button
                    onClick={() => setVisualizerTab('side-elevation')}
                    className={`flex-1 md:flex-initial px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${visualizerTab === 'side-elevation' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                  >
                    Side Elev.
                  </button>
                  <button
                    onClick={() => setVisualizerTab('top-plan')}
                    className={`flex-1 md:flex-initial px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${visualizerTab === 'top-plan' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                  >
                    Top Plan
                  </button>
                </div>
              </div>
              <div className="relative">
                {visualizerTab === '3d-model' && (
                  <Building3DVisualizer specs={specs} dimensionUnit={dimensionUnit} panelColors={panelColors} setPanelColors={setPanelColors} framingOnly={false} weatherType={weatherType} />
                )}
                {visualizerTab === '3d-frame' && (
                  <Building3DVisualizer specs={specs} dimensionUnit={dimensionUnit} panelColors={panelColors} setPanelColors={setPanelColors} framingOnly={true} weatherType={weatherType} />
                )}
                {visualizerTab === 'front-elevation' && (
                  <BuildingVisualizer specs={specs} dimensionUnit={dimensionUnit} view="front" />
                )}
                {visualizerTab === 'side-elevation' && (
                  <BuildingVisualizer specs={specs} dimensionUnit={dimensionUnit} view="side" />
                )}
                {visualizerTab === 'top-plan' && (
                  <BuildingVisualizer specs={specs} dimensionUnit={dimensionUnit} view="top" />
                )}
              </div>
              <div className="border-t border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                      Environmental Simulator & Load Stress Testing
                    </h4>
                    <p className="text-xs text-slate-500">
                      Simulate extreme weather actions to visualize live water runoff paths and structural load stress distributions.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 bg-slate-200/80 p-1 rounded-lg">
                    <div className="flex flex-wrap gap-1">
                      {[
                        { type: 'clear', label: 'Clear Sky', icon: Sun, color: 'text-amber-500', activeBg: 'bg-white text-slate-800 shadow-sm' },
                        { type: 'rain', label: 'Heavy Rain', icon: CloudRain, color: 'text-blue-500', activeBg: 'bg-white text-slate-800 shadow-sm' },
                        { type: 'snow', label: 'Snow Load', icon: Snowflake, color: 'text-sky-400', activeBg: 'bg-white text-slate-800 shadow-sm' },
                        { type: 'storm', label: 'High Wind Storm', icon: Wind, color: 'text-indigo-500', activeBg: 'bg-white text-slate-800 shadow-sm' },
                      ].map(w => {
                        const IconComp = w.icon;
                        const isActive = weatherType === w.type;
                        return (
                          <button
                            key={w.type}
                            onClick={() => setWeatherType(w.type as any)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                              isActive ? w.activeBg : 'text-slate-600 hover:text-slate-800 hover:bg-slate-300/50'
                            }`}
                          >
                            <IconComp className={`w-3.5 h-3.5 ${w.color}`} />
                            {w.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Procedural Rain Sound Toggle & Volume Slider */}
                    {(weatherType === 'rain' || weatherType === 'storm') && (
                      <div className="flex items-center gap-2 px-2 border-l border-slate-300 ml-1 animate-in fade-in slide-in-from-left-1 duration-300">
                        <button
                          type="button"
                          title={isAudioEnabled ? "Mute Rain Sound" : "Unmute Rain Sound"}
                          onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                          className={`p-1.5 rounded transition-colors ${
                            isAudioEnabled 
                              ? 'text-blue-600 bg-white shadow-sm hover:bg-blue-50' 
                              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-300/40'
                          }`}
                        >
                          {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                        </button>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={audioVolume}
                            onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                            className="w-16 h-1 bg-slate-300 rounded appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                            style={{
                              background: `linear-gradient(to right, #2563eb 0%, #2563eb ${audioVolume * 100}%, #cbd5e1 ${audioVolume * 100}%, #cbd5e1 100%)`
                            }}
                          />
                          <span className="text-[9px] font-mono font-bold text-slate-500 w-6">
                            {Math.round(audioVolume * 100)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Stress / Runoff Feedback Ticker */}
                {weatherType !== 'clear' && (
                  <div className="mt-3 text-[11px] font-mono bg-white border border-slate-200/80 rounded-lg p-2.5 space-y-1.5 text-slate-600 animate-in fade-in slide-in-from-top-1 duration-200">
                    {weatherType === 'rain' && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping shrink-0" />
                        <div className="flex-1 flex justify-between items-center flex-wrap gap-2">
                          <span>
                            <strong className="text-blue-700">RUNOFF SIMULATION ACTIVE:</strong> Stormwater flowing down roof slope into gutters; downpipes discharging at <strong>{(specs.width * specs.length * 0.05).toFixed(1)} L/min</strong>. No leaks detected.
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                            <Volume2 className="w-3 h-3 text-blue-500 animate-pulse" /> Synthesized metal-roof rain audio active
                          </span>
                        </div>
                      </div>
                    )}
                    {weatherType === 'snow' && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                        <span>
                          <strong className="text-red-700">GRAVITY LOAD WARNING (Snow):</strong> Accumulating weight on roof sheeting. Rafter compression and purlin shear stressed. Rafter elements colored in <span className="text-rose-600 font-bold">RED</span> showing design stress limits.
                        </span>
                      </div>
                    )}
                    {weatherType === 'storm' && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                        <div className="flex-1 flex justify-between items-center flex-wrap gap-2">
                          <span>
                            <strong className="text-indigo-700">UPLIFT FORCE WARNING:</strong> High-velocity wind passing over eave peaks creates aerodynamic suction. Rafter & purlin anchors highlighted in <span className="text-cyan-600 font-bold">CYAN</span> showing tension resistance path.
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                            <Volume2 className="w-3 h-3 text-indigo-500 animate-pulse" /> Storm gusts & rain audio active
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <StructuralLoadOptimizer specs={specs} setSpecs={setSpecs} dimensionUnit={dimensionUnit} />

            {specs.frameType === 'Truss' && (
              <TrussForceAnalyzer specs={specs} dimensionUnit={dimensionUnit} />
            )}

            {/* Manufacturing & Construction Process Visualizer */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 border-b border-slate-200 px-5 py-4 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-500" />
                  Manufacturing & Construction Steps
                </h3>
              </div>
              <ProcessStepVisualizer onProcessClick={(processName) => {
                setSearchQuery(processName);
                setShowPrimaryDetails(true);
              }} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="bg-slate-100 border-b border-slate-200 px-5 py-4 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-500" />
                  Step-by-Step Guide
                </h3>
              </div>
              
              <div className="p-6">
                <p className="text-sm text-slate-500 mb-6">The comprehensive process is outlined in a step-by-step guide below:</p>
                <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
                  {phases.map((phase, idx) => {
                    const isActive = phase.status === 'active';
                    const isUpcoming = phase.status === 'pending';
                    
                    return (
                      <div 
                        key={phase.id} 
                        className={`relative pl-8 transition-opacity duration-300 ${isUpcoming && !isActive ? 'opacity-50' : 'opacity-100'}`}
                      >
                        {/* Timeline node marker */}
                        <div className={`absolute -left-[17px] top-1 rounded-full p-1.5 border-4 border-white ${
                          isActive ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-400'
                        }`}>
                          {isActive ? <Clock className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full" />}
                        </div>

                        <div 
                          className={`p-5 rounded-xl border ${
                            isActive ? 'border-blue-200 bg-blue-50 cursor-default' : 'border-slate-100 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors'
                          }`}
                          onClick={() => setActivePhase(phase.id as Phase)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>
                                {phase.icon}
                              </div>
                              <h4 className={`font-semibold ${isActive ? 'text-blue-900' : 'text-slate-700'}`}>
                                {idx + 1}. {phase.title}
                              </h4>
                            </div>
                            {isActive && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                Current Phase
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 text-sm ml-12 leading-relaxed">
                            {phase.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Overall Financial Estimate & Contract */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 border-b border-slate-800 px-6 py-5 flex justify-between items-center text-white">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Overall Project Financials & Turnkey Contract
                </h3>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleExportMaterialsPDF}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Material List
                  </button>
                  <button 
                    onClick={handleExportPDF}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Generate Quote / Contract
                  </button>
                </div>
              </div>
              <div className="p-6 md:p-8">
                {/* Budget Tracker */}
                <div className="mb-8 bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-4 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <Target className="w-4 h-4 text-slate-500" />
                        Target Budget Tracker
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">Monitor your allocated project costs against your estimated budget.</p>
                    </div>
                    <div className="flex items-center">
                      <label className="text-xs font-medium text-slate-500 mr-2 uppercase">Estimate (₹)</label>
                      <input 
                        type="number" 
                        value={targetBudget}
                        onChange={(e) => setTargetBudget(Number(e.target.value))}
                        className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
                        step={100000}
                        min={0}
                      />
                    </div>
                  </div>
                  
                  <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full transition-all duration-500 ${targetBudget > 0 && grandTotal > targetBudget ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, targetBudget > 0 ? (grandTotal / targetBudget) * 100 : 0)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-3 text-xs font-semibold">
                    <span className="text-slate-600">Allocated: ₹{Math.round(grandTotal).toLocaleString('en-IN')}</span>
                    <span className={targetBudget > 0 && grandTotal > targetBudget ? 'text-red-600' : 'text-slate-600'}>
                      {targetBudget > 0 ? `${((grandTotal / targetBudget) * 100).toFixed(1)}%` : '0%'}
                    </span>
                    <span className="text-slate-500">Target: ₹{Math.round(targetBudget).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                   <div className="flex-1 space-y-4">
                      <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Cost Breakdown Summary</h4>
                      <div className="space-y-3 text-sm">
                          {specs.hasPrimarySteel !== false && (
                             <div className="flex flex-col gap-1 pb-1">
                               <div className="flex justify-between text-slate-800 font-medium pb-1 border-b border-slate-100">
                                 <span>Primary Steel Structure</span>
                                 <span>₹{Math.round(totalPrimaryCost).toLocaleString('en-IN')}</span>
                               </div>
                               <div className="flex flex-col gap-0.5 text-slate-500 pl-4 text-xs">
                                 <div className="flex justify-between font-medium">
                                   <span>↳ Material Breakdown</span>
                                   <span>₹{Math.round(primaryMaterialTotal).toLocaleString('en-IN')}</span>
                                 </div>
                                 <div className="flex justify-between pl-3 text-[11px] text-slate-400 items-center">
                                   <span className="flex items-center gap-1.5"><MaterialIcon type="columns" className="w-3.5 h-3.5 text-slate-400" />- Columns</span>
                                   <span>₹{Math.round(breakdownColCost).toLocaleString('en-IN')}</span>
                                 </div>
                                 <div className="flex justify-between pl-3 text-[11px] text-slate-400 items-center mt-1">
                                   <span className="flex items-center gap-1.5"><MaterialIcon type="rafters" className="w-3.5 h-3.5 text-slate-400" />- Rafters</span>
                                   <span>₹{Math.round(breakdownRafCost).toLocaleString('en-IN')}</span>
                                 </div>
                                 <div className="flex justify-between pl-3 text-[11px] text-slate-400 items-center mt-1">
                                   <span className="flex items-center gap-1.5"><MaterialIcon type="accessories" className="w-3.5 h-3.5 text-slate-400" />- Base Plates & Misc (10%)</span>
                                   <span>₹{Math.round(breakdownMiscCost).toLocaleString('en-IN')}</span>
                                 </div>
                               </div>
                               <div className="flex justify-between text-slate-500 pl-4 text-xs mt-1">
                                 <span>↳ Fabrication</span>
                                 <span>₹{Math.round(fabLaborCost * primaryTons).toLocaleString('en-IN')}</span>
                               </div>
                               <div className="flex justify-between text-slate-500 pl-4 text-xs pb-1">
                                 <span>↳ Erection</span>
                                 <span>₹{Math.round(erectLaborCost * primaryTons).toLocaleString('en-IN')}</span>
                               </div>
                             </div>
                          )}
                          {specs.hasSecondarySteel !== false && <div className="flex justify-between text-slate-600 items-center mt-1"><span className="flex items-center gap-2"><MaterialIcon type="purlins" className="w-4 h-4 text-slate-400" />Secondary Framing</span> <span>₹{Math.round(totalSecondaryCost).toLocaleString('en-IN')}</span></div>}
                          {specs.hasRoof !== false && <div className="flex justify-between text-slate-600 items-center mt-1"><span className="flex items-center gap-2"><MaterialIcon type="sheeting" className="w-4 h-4 text-slate-400" />Roof Sheeting (inc. labor)</span> <span>₹{Math.round(totalRoofCost).toLocaleString('en-IN')}</span></div>}
                          {specs.hasWalls !== false && <div className="flex justify-between text-slate-600 items-center mt-1"><span className="flex items-center gap-2"><MaterialIcon type="sheeting" className="w-4 h-4 text-slate-400" />Wall Cladding (inc. labor)</span> <span>₹{Math.round(totalWallCost).toLocaleString('en-IN')}</span></div>}
                          {totalHardwareCost > 0 && <div className="flex justify-between text-slate-600 items-center mt-1"><span className="flex items-center gap-2"><MaterialIcon type="hardware" className="w-4 h-4 text-slate-400" />Fasteners & Hardware</span> <span>₹{Math.round(totalHardwareCost).toLocaleString('en-IN')}</span></div>}
                          {totalAccessoriesCost > 0 && <div className="flex justify-between text-slate-600 items-center mt-1"><span className="flex items-center gap-2"><MaterialIcon type="accessories" className="w-4 h-4 text-slate-400" />Accessories & Trims</span> <span>₹{Math.round(totalAccessoriesCost).toLocaleString('en-IN')}</span></div>}
                          <div className="flex justify-between text-slate-800 font-medium pt-2 border-t border-slate-100">
                             <div className="flex flex-col">
                                <span>PEB Subtotal</span>
                                <span className="text-xs text-slate-500 font-normal">₹{Math.round(subTotal / area).toLocaleString('en-IN')}/sqm | ₹{Math.round(subTotal / (area * 10.7639)).toLocaleString('en-IN')}/sq.ft</span>
                             </div>
                             <span>₹{Math.round(subTotal).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-slate-600 pt-1"><span>Target Civil Foundation (₹1,500/sqm{dimensionUnit === 'ft' ? ' or ~₹139/sq.ft' : ''})</span> <span>₹{Math.round(civilFoundationCost).toLocaleString('en-IN')}</span></div>
                          <div className="flex justify-between text-slate-600"><span>Estimated Logistics ({numberOfJourneys} journeys)</span> <span>₹{Math.round(logisticsCost).toLocaleString('en-IN')}</span></div>
                          <div className="flex justify-between text-slate-600 pb-1 border-b border-slate-100"><span>GST (18%)</span> <span>₹{Math.round(taxAmount).toLocaleString('en-IN')}</span></div>
                      </div>
                   </div>
                   
                   <div className="md:w-72 bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200 flex flex-col justify-center shadow-sm">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Turnkey Estimate</h4>
                      <div className="text-3xl font-bold text-slate-900 mb-1">₹{Math.round(grandTotal).toLocaleString('en-IN')}</div>
                      <div className="text-sm font-medium text-slate-600 mb-6 pl-1">
                         ≈ ₹{Math.round(grandTotal / area).toLocaleString('en-IN')} / sqm | ₹{Math.round(grandTotal / (area * 10.7639)).toLocaleString('en-IN')} / sq.ft
                      </div>
                      <div className="text-xs text-slate-500 mb-6">Includes civil foundation works, taxes, and freight.</div>
                      <button 
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors border border-slate-700 shadow-sm"
                        onClick={handleExportPDF}
                      >
                        Proceed to Contract
                      </button>
                   </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">Payment Terms Schedule</h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100/50 text-slate-500 uppercase text-xs">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium">Milestone</th>
                          <th className="px-4 py-3 text-right font-medium">Payment %</th>
                          <th className="px-4 py-3 text-right font-medium">Amount (Est.)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        <tr>
                          <td className="px-4 py-3">Upon agreement</td>
                          <td className="px-4 py-3 text-right font-medium text-slate-800">25% Advance</td>
                          <td className="px-4 py-3 text-right text-slate-800 font-medium">₹{Math.round(grandTotal * 0.25).toLocaleString('en-IN')}</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="px-4 py-3">Prior to the commencement of the primary structure</td>
                          <td className="px-4 py-3 text-right font-medium text-slate-800">25% Advance</td>
                          <td className="px-4 py-3 text-right text-slate-800 font-medium">₹{Math.round(grandTotal * 0.25).toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">Before the construction of the supporting structure</td>
                          <td className="px-4 py-3 text-right font-medium text-slate-800">25% Advance</td>
                          <td className="px-4 py-3 text-right text-slate-800 font-medium">₹{Math.round(grandTotal * 0.25).toLocaleString('en-IN')}</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="px-4 py-3">Before the initiation of roofing or walling</td>
                          <td className="px-4 py-3 text-right font-medium text-slate-800">25% Advance</td>
                          <td className="px-4 py-3 text-right text-slate-800 font-medium">₹{Math.round(grandTotal * 0.25).toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">Terms and Conditions</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                    <li>A tolerance of ±1% is acceptable on dimensions, weights, and positioning.</li>
                    <li>Pricing is subject to standard manufacturing tolerances and fluctuations.</li>
                    <li>All estimates are provisional and subject to final, certified engineering calculations.</li>
                    <li>The client bears full responsibility for preliminary soil analysis and securing necessary local permits.</li>
                    <li>Pre-Engineered Building (PEB) design conforms strictly to ASCE standard specifications.</li>
                    <li>Delays caused by force majeure, severe weather, or unforeseen logistical issues are excluded from the timeline.</li>
                  </ul>
                </div>

                {/* Monthly Spending Progression Chart */}
                <div className="mt-10 pt-8 border-t border-slate-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Budget Oversight: Actual vs Estimated Spend</h4>
                      <p className="text-xs text-slate-500 mt-1">Monthly progression comparing the estimated timeline baseline against actual cumulative costs.</p>
                    </div>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlySpendingData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: '#64748B' }} 
                          tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`} 
                          dx={-10}
                        />
                        <RechartsTooltip 
                          formatter={(value: number) => [`₹${Math.round(value).toLocaleString('en-IN')}`, undefined]}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                        <Line type="monotone" name="Estimated Baseline" dataKey="Estimated" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        <Line type="monotone" name="Actual Spend" dataKey="Actual" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} connectNulls={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Annual Comparative Analysis Chart */}
                <div className="mt-10 pt-8 border-t border-slate-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Annual Comparative Cost Analysis</h4>
                      <p className="text-xs text-slate-500 mt-1">Cumulative cost of ownership projecting upfront capital and maintenance over 20 years.</p>
                    </div>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={annualComparativeData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: '#64748B' }} 
                          tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`} 
                          dx={-10}
                        />
                        <RechartsTooltip 
                          formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, undefined]}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                        <Bar dataKey="PEB" name="PEB (Structural Steel)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                        <Bar dataKey="Traditional" name="Traditional RC Building" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Project Details: Cost Scaling Trends */}
                <div className="mt-10 pt-8 border-t border-slate-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Project Details: Cost Scaling Trends</h4>
                      <p className="text-xs text-slate-500 mt-1">Estimated cost breakdown components as a trend based on building size changes.</p>
                    </div>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="size" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#64748b' }} 
                          axisLine={false} 
                          tickLine={false} 
                          tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} 
                          dx={-10}
                        />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, undefined]}
                          labelFormatter={(label) => `Area: ${label} ${dimensionUnit === 'ft' ? 'sq.ft' : 'm²'}`}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                        <Line type="monotone" dataKey="Steel" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="Roofing" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Labor" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Civil" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Primary Details Modal */}
      {showPrimaryDetails && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-4 flex-1">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 whitespace-nowrap">
                  <Search className="w-5 h-5 text-blue-500" />
                  Primary Specification
                </h2>
                <div className="hidden sm:block relative max-w-sm w-full ml-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter specifications..." className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-normal transition-colors" />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleExportModalPDF('Primary Specification', detailedSpecs)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                  title="Export PDF"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button 
                  onClick={() => setShowPrimaryDetails(false)} 
                  className="p-2 -mr-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 md:p-8 overflow-y-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {['Specifications', 'Logistics & Quantity', 'Financials', 'Components & Process'].map(category => {
                  const filteredSpecs = detailedSpecs.filter(spec => spec.category === category && (spec.label.toLowerCase().includes(searchQuery.toLowerCase()) || spec.value.toLowerCase().includes(searchQuery.toLowerCase()) || spec.category.toLowerCase().includes(searchQuery.toLowerCase())));
                  if (filteredSpecs.length === 0) return null;
                  return (
                    <div key={category} className="space-y-4">
                      <h3 className="font-medium text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
                        {category}
                      </h3>
                      <dl className="space-y-4">
                        {filteredSpecs.map((spec, i) => (
                          <div key={i} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                            <dt className="text-sm text-slate-500 font-medium shrink-0 sm:w-1/3">{spec.label}</dt>
                            <dd className="text-sm text-slate-800 text-left sm:text-right font-medium"><InteractiveWordText text={spec.value} onWordClick={setSelectedVisualWord} /></dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Details Modal */}
      {showSecondaryDetails && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-4 flex-1">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 whitespace-nowrap">
                  <Search className="w-5 h-5 text-indigo-500" />
                  Supporting Specification
                </h2>
                <div className="hidden sm:block relative max-w-sm w-full ml-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter specifications..." className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-normal transition-colors" />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleExportModalPDF('Supporting Specification', secondaryDetailedSpecs)}
                  className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                  title="Export PDF"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button 
                  onClick={() => setShowSecondaryDetails(false)} 
                  className="p-2 -mr-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 md:p-8 overflow-y-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {['Specifications', 'Logistics & Quantity', 'Financials', 'Components & Process'].map(category => {
                  const filteredSpecs = secondaryDetailedSpecs.filter(spec => spec.category === category && (spec.label.toLowerCase().includes(searchQuery.toLowerCase()) || spec.value.toLowerCase().includes(searchQuery.toLowerCase()) || spec.category.toLowerCase().includes(searchQuery.toLowerCase())));
                  if (filteredSpecs.length === 0) return null;
                  return (
                    <div key={category} className="space-y-4">
                      <h3 className="font-medium text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
                        {category}
                      </h3>
                      <dl className="space-y-4">
                        {filteredSpecs.map((spec, i) => (
                          <div key={i} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                            <dt className="text-sm text-slate-500 font-medium shrink-0 sm:w-1/3">{spec.label}</dt>
                            <dd className="text-sm text-slate-800 text-left sm:text-right font-medium"><InteractiveWordText text={spec.value} onWordClick={setSelectedVisualWord} /></dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Roof Details Modal */}
      {showRoofDetails && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-4 flex-1">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 whitespace-nowrap">
                  <Search className="w-5 h-5 text-emerald-500" />
                  Roof Sheeting Extracted Data
                </h2>
                <div className="hidden sm:block relative max-w-sm w-full ml-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter specifications..." className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal transition-colors" />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleExportModalPDF('Roof Sheeting', roofDetailedSpecs)}
                  className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                  title="Export PDF"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button 
                  onClick={() => setShowRoofDetails(false)} 
                  className="p-2 -mr-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 md:p-8 overflow-y-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {['Specifications', 'Logistics', 'Financials'].map(category => {
                  const filteredSpecs = roofDetailedSpecs.filter(spec => spec.category === category && (spec.label.toLowerCase().includes(searchQuery.toLowerCase()) || spec.value.toLowerCase().includes(searchQuery.toLowerCase()) || spec.category.toLowerCase().includes(searchQuery.toLowerCase())));
                  if (filteredSpecs.length === 0) return null;
                  return (
                    <div key={category} className="space-y-4">
                      <h3 className="font-medium text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
                        {category}
                      </h3>
                      <dl className="space-y-4">
                        {filteredSpecs.map((spec, i) => (
                          <div key={i} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                            <dt className="text-sm text-slate-500 font-medium shrink-0 sm:w-1/3">{spec.label}</dt>
                            <dd className="text-sm text-slate-800 text-left sm:text-right font-medium"><InteractiveWordText text={spec.value} onWordClick={setSelectedVisualWord} /></dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wall Details Modal */}
      {showWallDetails && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-4 flex-1">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 whitespace-nowrap">
                  <Search className="w-5 h-5 text-blue-500" />
                  Wall Cladding Extracted Data
                </h2>
                <div className="hidden sm:block relative max-w-sm w-full ml-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter specifications..." className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-normal transition-colors" />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleExportModalPDF('Wall Cladding', wallDetailedSpecs)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                  title="Export PDF"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button 
                  onClick={() => setShowWallDetails(false)} 
                  className="p-2 -mr-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 md:p-8 overflow-y-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {['Specifications', 'Logistics', 'Financials'].map(category => {
                  const filteredSpecs = wallDetailedSpecs.filter(spec => spec.category === category && (spec.label.toLowerCase().includes(searchQuery.toLowerCase()) || spec.value.toLowerCase().includes(searchQuery.toLowerCase()) || spec.category.toLowerCase().includes(searchQuery.toLowerCase())));
                  if (filteredSpecs.length === 0) return null;
                  return (
                    <div key={category} className="space-y-4">
                      <h3 className="font-medium text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
                        {category}
                      </h3>
                      <dl className="space-y-4">
                        {filteredSpecs.map((spec, i) => (
                          <div key={i} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                            <dt className="text-sm text-slate-500 font-medium shrink-0 sm:w-1/3">{spec.label}</dt>
                            <dd className="text-sm text-slate-800 text-left sm:text-right font-medium"><InteractiveWordText text={spec.value} onWordClick={setSelectedVisualWord} /></dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hardware Details Modal */}
      {showHardwareDetails && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-4 flex-1">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 whitespace-nowrap">
                  <Search className="w-5 h-5 text-amber-500" />
                  Hardware and Fastener
                </h2>
                <div className="hidden sm:block relative max-w-sm w-full ml-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter specifications..." className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-normal transition-colors" />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleExportModalPDF('Hardware Fasteners', hardwareDetailedSpecs)}
                  className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                  title="Export PDF"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button 
                  onClick={() => setShowHardwareDetails(false)} 
                  className="p-2 -mr-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 md:p-8 overflow-y-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {['Items', 'Specifications', 'Logistics', 'Financials'].map(category => {
                  const filteredSpecs = hardwareDetailedSpecs.filter(spec => spec.category === category && (spec.label.toLowerCase().includes(searchQuery.toLowerCase()) || spec.value.toLowerCase().includes(searchQuery.toLowerCase())));
                  if (filteredSpecs.length === 0) return null;
                  return (
                    <div key={category} className="space-y-4">
                      <h3 className="font-medium text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
                        {category}
                      </h3>
                      <dl className="space-y-4">
                        {filteredSpecs.map((spec, i) => (
                          <div key={i} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                            <dt className="text-sm text-slate-500 font-medium shrink-0 sm:w-1/3">{spec.label}</dt>
                            <dd className="text-sm text-slate-800 text-left sm:text-right font-medium"><InteractiveWordText text={spec.value} onWordClick={setSelectedVisualWord} /></dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lifecycle Details Modal */}
      {showLifecycleDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-300">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4 flex-1">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 whitespace-nowrap">
                  <Search className="w-5 h-5 text-emerald-500" />
                  Life Cycle
                </h2>
                <div className="hidden sm:block relative max-w-sm w-full ml-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter specifications..." className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal transition-colors" />
                </div>
              </div>
              <button 
                onClick={() => setShowLifecycleDetails(false)} 
                className="p-2 -mr-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 md:p-8 overflow-y-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {['Structural Implications', 'Lifecycle Assessment', 'Financials'].map(category => {
                  const filteredSpecs = lifecycleDetailedSpecs.filter(spec => spec.category === category && (spec.label.toLowerCase().includes(searchQuery.toLowerCase()) || spec.value.toLowerCase().includes(searchQuery.toLowerCase())));
                  if (filteredSpecs.length === 0) return null;
                  return (
                    <div key={category} className="space-y-4">
                      <h3 className="font-medium text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
                        {category}
                      </h3>
                      <dl className="space-y-4">
                        {filteredSpecs.map((spec, i) => (
                          <div key={i} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                            <dt className="text-sm text-slate-500 font-medium shrink-0 sm:w-1/3">{spec.label}</dt>
                            <dd className="text-sm text-slate-800 text-left sm:text-right font-medium"><InteractiveWordText text={spec.value} onWordClick={setSelectedVisualWord} /></dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Material Estimate Modal */}
      {showMaterialEstimate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-300">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 whitespace-nowrap">
                    <ClipboardList className="w-5 h-5 text-indigo-500" />
                    Bill of Materials
                  </h2>
                  <p className="text-sm text-slate-500 ml-7 mt-0.5">
                    Click any field below to edit descriptions, quantities, and prices.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {(specs.materialOverrides && Object.keys(specs.materialOverrides).length > 0 || specs.additionalItems && specs.additionalItems.length > 0) && (
                  <button
                    onClick={() => setSpecs(s => ({ ...s, materialOverrides: undefined, additionalItems: [] }))}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                    title="Reset All Changes"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Reset All</span>
                  </button>
                )}
                <button
                  onClick={handleExportMaterialsPDF}
                  className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium mr-2"
                  title="Export PDF"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
              <button 
                onClick={() => setShowMaterialEstimate(false)} 
                className="p-2 -mr-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 md:p-8 overflow-y-auto w-full bg-slate-50/50">
              <div className="space-y-8">
                {materialEstimateData.sections.map((section, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
                      <h3 className="font-semibold text-slate-800 text-sm">{section.title}</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-2">
                              <div className="flex items-center gap-1.5">
                                Description
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                              </div>
                            </th>
                            <th className="px-4 py-2 w-20 text-center">Unit</th>
                            <th className="px-4 py-2 min-w-[140px] text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                Quantity
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                              </div>
                            </th>
                            <th className="px-4 py-2 min-w-[140px] text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                Unit Price
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                              </div>
                            </th>
                            <th className="px-4 py-2 min-w-[140px] text-right">Total Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {section.rows.map((row: any, rIdx: number) => (
                            <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3 text-slate-800 font-medium whitespace-normal min-w-[200px] p-0">
                                <div className="flex items-center gap-3 pr-2">
                                  <div className="pl-4 text-emerald-600/80">
                                    <MaterialIcon type={row.id} className="w-5 h-5" />
                                  </div>
                                  <textarea
                                    ref={(el) => {
                                      if (el) {
                                        el.style.height = 'auto';
                                        el.style.height = el.scrollHeight + 'px';
                                      }
                                    }}
                                    className={`flex-1 min-w-0 bg-transparent border-b border-dashed focus:border-solid border-slate-300 focus:border-indigo-500 focus:ring-0 py-3 hover:bg-slate-50 transition-colors resize-none overflow-hidden ${row.overrideName !== undefined ? 'text-indigo-600 font-medium' : ''}`}
                                    value={row.overrideName !== undefined ? row.overrideName : row.defaultName}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (row.isAdditional) {
                                          setSpecs(s => ({
                                            ...s,
                                            additionalItems: s.additionalItems?.map(item => item.id === row.id ? { ...item, name: val } : item)
                                          }));
                                        } else {
                                          const o = specs.materialOverrides?.[row.id] || {};
                                          setSpecs({...specs, materialOverrides: {...specs.materialOverrides, [row.id]: {...o, name: val}}});
                                        }
                                    }}
                                    rows={1}
                                    onInput={(e: any) => {
                                      e.target.style.height = 'auto';
                                      e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                    placeholder={row.defaultName}
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-500 text-center bg-slate-50/50 p-0 relative">
                                {row.isAdditional ? (
                                  <input
                                    type="text"
                                    className="w-full text-center bg-transparent border-b border-dashed focus:border-solid border-slate-300 focus:border-indigo-500 focus:ring-0 px-2 py-3 hover:bg-slate-50 transition-colors"
                                    value={row.unit}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setSpecs(s => ({
                                        ...s,
                                        additionalItems: s.additionalItems?.map(item => item.id === row.id ? { ...item, unit: val } : item)
                                      }));
                                    }}
                                  />
                                ) : (
                                  <div className="py-3 px-4">{row.unit}</div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-slate-700 text-right font-mono p-0">
                                <input
                                  type="number"
                                  className={`w-full text-right bg-transparent border-b border-dashed focus:border-solid border-slate-300 focus:border-indigo-500 focus:ring-0 px-4 py-3 hover:bg-slate-50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${row.overrideQty !== undefined ? 'text-indigo-600 font-medium' : ''}`}
                                  value={row.overrideQty !== undefined ? row.overrideQty : row.defaultQty}
                                  onChange={(e) => {
                                      const val = e.target.value === '' ? '' : Number(e.target.value);
                                      if (row.isAdditional) {
                                        setSpecs(s => ({
                                          ...s,
                                          additionalItems: s.additionalItems?.map(item => item.id === row.id ? { ...item, qty: val } : item)
                                        }));
                                      } else {
                                        const o = specs.materialOverrides?.[row.id] || {};
                                        setSpecs({...specs, materialOverrides: {...specs.materialOverrides, [row.id]: {...o, qty: val}}});
                                      }
                                  }}
                                  placeholder={row.defaultQty?.toString()}
                                />
                              </td>
                              <td className="px-4 py-3 text-slate-700 text-right font-mono p-0 min-w-[140px]">
                                 <div className="flex items-center w-full relative">
                                   <span className={`absolute left-4 ${row.overridePrice !== undefined ? 'text-indigo-600' : 'text-slate-400'}`}>₹</span>
                                   <input
                                     type="number"
                                     className={`w-full text-right bg-transparent border-b border-dashed focus:border-solid border-slate-300 focus:border-indigo-500 focus:ring-0 pl-8 pr-4 py-3 hover:bg-slate-50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${row.overridePrice !== undefined ? 'text-indigo-600 font-medium' : ''}`}
                                     value={row.overridePrice !== undefined ? row.overridePrice : row.defaultPrice}
                                     onChange={(e) => {
                                         const val = e.target.value === '' ? '' : Number(e.target.value);
                                         if (row.isAdditional) {
                                            setSpecs(s => ({
                                              ...s,
                                              additionalItems: s.additionalItems?.map(item => item.id === row.id ? { ...item, price: val } : item)
                                            }));
                                         } else {
                                            const o = specs.materialOverrides?.[row.id] || {};
                                            setSpecs({...specs, materialOverrides: {...specs.materialOverrides, [row.id]: {...o, price: val}}});
                                         }
                                     }}
                                     placeholder={row.defaultPrice?.toString()}
                                   />
                                 </div>
                              </td>
                              <td className="px-4 py-3 text-slate-800 text-right font-mono font-medium whitespace-nowrap" title={`₹${row.total.toLocaleString('en-IN')}`}>
                                <div className="flex items-center justify-end gap-2">
                                  <span>₹{row.total.toLocaleString('en-IN')}</span>
                                  {row.isAdditional ? (
                                    <button
                                      onClick={() => {
                                        setSpecs(s => ({
                                          ...s,
                                          additionalItems: s.additionalItems?.filter(item => item.id !== row.id)
                                        }));
                                      }}
                                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                                      title="Remove item"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  ) : (row.overrideName !== undefined || row.overrideQty !== undefined || row.overridePrice !== undefined) ? (
                                    <button
                                      onClick={() => {
                                        const o = { ...specs.materialOverrides };
                                        delete o[row.id];
                                        setSpecs(s => ({
                                          ...s,
                                          materialOverrides: o
                                        }));
                                      }}
                                      className="text-indigo-400 hover:text-indigo-600 transition-colors p-1"
                                      title="Reset to default"
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                    </button>
                                  ) : <div className="w-6" />}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
                
                <div className="bg-slate-900 rounded-xl p-5 shadow-sm text-white flex justify-between items-center">
                  <span className="font-semibold text-sm">Estimated Materials Cost Component</span>
                  <span className="font-bold text-xl font-mono">₹{materialEstimateData.totalCost.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Representation Modal */}
      {selectedVisualWord && VISUAL_DICTIONARY[selectedVisualWord] && (() => {
        const visual = VISUAL_DICTIONARY[selectedVisualWord];
        const Icon = visual.icon as any;
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 opacity-100 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
              <div className="relative p-6 flex flex-col items-center justify-center bg-slate-50 border-b border-slate-100">
                <button 
                  onClick={() => setSelectedVisualWord(null)} 
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className={`p-6 rounded-2xl mb-4 ${visual.color}`}>
                  <Icon className="w-16 h-16 opacity-80" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 text-center">{selectedVisualWord}</h3>
              </div>
              <div className="p-6 bg-white">
                <p className="text-slate-600 text-center leading-relaxed">
                  {visual.desc}
                </p>
                <button 
                  onClick={() => setSelectedVisualWord(null)}
                  className="mt-6 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <InstallPWA />

      <VoiceChatAssistant
        specs={specs}
        setSpecs={setSpecs}
        dimensionUnit={dimensionUnit}
        setDimensionUnit={setDimensionUnit}
        weatherType={weatherType}
        setWeatherType={setWeatherType}
        projectName={projectName}
        setProjectName={setProjectName}
        configTab={configTab}
        setConfigTab={setConfigTab}
        visualizerTab={visualizerTab}
        setVisualizerTab={setVisualizerTab}
        projectNotes={projectNotes}
        setProjectNotes={setProjectNotes}
      />

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/916232101154"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#128C7E] text-white shadow-xl shadow-[#25D366]/30 px-5 py-3 rounded-full font-semibold flex items-center gap-2 transition-transform hover:scale-105 z-50 hover:-translate-y-1"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          className="w-6 h-6 fill-current"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
        </svg>
        Chat with us
      </a>
    </div>
  );
}
