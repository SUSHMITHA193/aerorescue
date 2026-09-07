import React, { useState, useEffect } from 'react';
import { 
  Eye, Zap, Camera, Shield, Crosshair, 
  Maximize2, Radio, Sliders, RefreshCw, Cpu
} from 'lucide-react';
import { commandStore } from '../../services/store';
import { createSvgImageDataUrl } from '../../services/seedData';

interface LiveVisionViewProps {
  initialDroneId?: string;
}

export const LiveVisionView: React.FC<LiveVisionViewProps> = ({ initialDroneId = 'DRONE-01' }) => {
  const [activeDroneId, setActiveDroneId] = useState<string>(initialDroneId);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showTelemetryHUD, setShowTelemetryHUD] = useState(true);
  const [thermalPalette, setThermalPalette] = useState<'IRONBOW' | 'WHITE_HOT' | 'RAINBOW'>('IRONBOW');
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  const drone = commandStore.drones.find((d) => d.droneId === activeDroneId) || commandStore.drones[0];
  const activeDetections = commandStore.detections.filter((det) => det.droneId === drone?.droneId);

  const handleCaptureSnapshot = () => {
    setSnapshotSuccess(true);
    setTimeout(() => setSnapshotSuccess(false), 2000);
  };

  return (
    <div className="p-4 space-y-4 max-w-[1700px] mx-auto text-[#e0e0e0]">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0a0a] border border-[#222] p-3 rounded font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
            <h1 className="text-xs font-bold text-white uppercase tracking-wider">
              DUAL-SPECTRUM LIVE SENSOR VISION
            </h1>
          </div>

          <div className="h-4 w-[1px] bg-[#222]" />

          {/* Drone Selector Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#555] text-[10px] font-bold uppercase">DRONE FEED:</span>
            {commandStore.drones.map((d) => (
              <button
                key={d.droneId}
                onClick={() => setActiveDroneId(d.droneId)}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  activeDroneId === d.droneId
                    ? 'bg-red-600 text-white'
                    : 'bg-[#111] text-[#777] hover:text-white border border-[#1a1a1a]'
                }`}
              >
                {d.droneId}
              </button>
            ))}
          </div>
        </div>

        {/* Vision Display Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            className={`px-2.5 py-1 rounded border transition-colors ${
              showBoundingBoxes
                ? 'bg-[#161616] border-[#444] text-white font-bold'
                : 'bg-[#111] border-[#1a1a1a] text-[#555]'
            }`}
          >
            AI Bounding Boxes: {showBoundingBoxes ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setShowTelemetryHUD(!showTelemetryHUD)}
            className={`px-2.5 py-1 rounded border transition-colors ${
              showTelemetryHUD
                ? 'bg-[#161616] border-[#444] text-white font-bold'
                : 'bg-[#111] border-[#1a1a1a] text-[#555]'
            }`}
          >
            HUD Overlay: {showTelemetryHUD ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={handleCaptureSnapshot}
            className="px-3 py-1 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] text-white rounded font-bold flex items-center gap-1.5 transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-red-500" />
            <span>{snapshotSuccess ? 'Snapshot Saved!' : 'Snapshot'}</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Cameras Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT: RGB CAMERA */}
        <div className="bg-[#0a0a0a] border border-[#222] rounded overflow-hidden flex flex-col">
          <div className="p-3 bg-[#0c0c0c] border-b border-[#222] flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-red-500" />
              <span className="font-bold text-white uppercase text-[11px]">PRIMARY RGB OPTICS (4K 60FPS)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#161616] border border-[#333] text-[#aaa]">
                EDGE YOLOv8-X
              </span>
            </div>
            <div className="text-[10px] text-green-500 font-bold">BITRATE: 18.4 Mbps</div>
          </div>

          <div className="relative aspect-video bg-[#000] overflow-hidden select-none flex items-center justify-center">
            {/* Aerial Simulated Disaster Feed */}
            <img
              src={createSvgImageDataUrl('survivor')}
              alt="Simulated Aerial RGB Drone Feed"
              className="w-full h-full object-cover"
            />

            {/* Simulated Live Tactical HUD Overlay with Crosshair Reticles */}
            {showTelemetryHUD && (
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between font-mono text-green-400 text-xs">
                {/* Geometric Balance red crosshair reticle lines */}
                <div className="w-full h-[1px] bg-red-500/30 absolute top-1/2 left-0 pointer-events-none" />
                <div className="h-full w-[1px] bg-red-500/30 absolute top-0 left-1/2 pointer-events-none" />

                <div className="flex justify-between items-start z-10">
                  <div className="bg-black/70 p-1.5 rounded border border-[#222] text-[10px]">
                    <div>CAM: SONY EXMOR 4K</div>
                    <div>FPS: 59.8 | EXP: 1/1200</div>
                    <div>FOV: 84° WIDE</div>
                  </div>
                  <div className="bg-black/70 p-1.5 rounded border border-[#222] text-[10px] text-right">
                    <div>ALT: {drone?.altitude} M AGL</div>
                    <div>SPD: {drone?.speed} M/S</div>
                    <div>HDG: {drone?.heading}°</div>
                  </div>
                </div>

                {/* Center Pitch / Roll Horizon Ladder */}
                <div className="self-center flex flex-col items-center z-10">
                  <div className="w-20 h-[1px] bg-green-500/80 my-1" />
                  <div className="w-12 h-[1px] bg-green-500/60 my-1" />
                  <Crosshair className="w-6 h-6 text-red-500 animate-pulse my-1" />
                  <div className="w-12 h-[1px] bg-green-500/60 my-1" />
                  <div className="w-20 h-[1px] bg-green-500/80 my-1" />
                </div>

                <div className="flex justify-between items-end z-10">
                  <div className="bg-black/70 p-1.5 rounded border border-[#222] text-[10px]">
                    <div>LAT: {drone?.latitude.toFixed(5)}° N</div>
                    <div>LON: {drone?.longitude.toFixed(5)}° E</div>
                  </div>
                  <div className="bg-black/70 p-1.5 rounded border border-[#222] text-[10px] text-right text-green-400 font-bold">
                    SLAM LOCALIZATION LOCKED
                  </div>
                </div>
              </div>
            )}

            {/* AI Bounding Boxes */}
            {showBoundingBoxes && (
              <div className="absolute top-[38%] left-[40%] w-[25%] h-[28%] border border-red-500 bg-red-500/15 pointer-events-none rounded flex flex-col justify-start">
                <span className="bg-red-600 text-white font-mono font-bold text-[9px] px-1 py-0.5 leading-none w-fit uppercase tracking-wider">
                  SURVIVOR GROUP x4 (96%)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: THERMAL CAMERA (FLIR) */}
        <div className="bg-[#0a0a0a] border border-[#222] rounded overflow-hidden flex flex-col">
          <div className="p-3 bg-[#0c0c0c] border-b border-[#222] flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-red-500" />
              <span className="font-bold text-white uppercase text-[11px]">THERMAL LWIR FLIR (640x512)</span>
              <span className="text-[8px] text-white bg-red-900 px-1.5 py-0.5 rounded font-bold uppercase">
                FLIR THERMAL
              </span>
            </div>
            <div className="text-[10px] text-red-500 font-bold">SPOT PEAK: 37.8°C</div>
          </div>

          <div className="relative aspect-video bg-[#000] overflow-hidden select-none flex items-center justify-center">
            {/* Simulated Radiometric FLIR Thermal Feed */}
            <img
              src={createSvgImageDataUrl('thermal_person')}
              alt="Simulated Radiometric FLIR Drone Thermal Feed"
              className="w-full h-full object-cover"
            />

            {/* Thermal HUD with Reticles */}
            {showTelemetryHUD && (
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between font-mono text-orange-400 text-xs">
                {/* Reticle crosshair lines */}
                <div className="w-full h-[1px] bg-red-500/30 absolute top-1/2 left-0 pointer-events-none" />
                <div className="h-full w-[1px] bg-red-500/30 absolute top-0 left-1/2 pointer-events-none" />

                <div className="flex justify-between items-start z-10">
                  <div className="bg-black/70 p-1.5 rounded border border-[#222] text-[10px]">
                    <div>SENSOR: FLIR BOSON 640</div>
                    <div>NETD: &lt; 40 mK</div>
                    <div>RANGE: -20°C to +150°C</div>
                  </div>
                  <div className="bg-black/70 p-1.5 rounded border border-[#222] text-[10px] text-right">
                    <div>HUMAN HEAT SIG: 2 POSITIVE</div>
                    <div>WATER TEMP: 18.2°C</div>
                    <div>ISOTHERM: ACTIVE</div>
                  </div>
                </div>

                <div className="self-center z-10">
                  <Crosshair className="w-8 h-8 text-red-500/80 animate-pulse" />
                </div>

                <div className="flex justify-between items-end z-10">
                  <div className="bg-black/70 p-1.5 rounded border border-[#222] text-[10px] text-red-400 font-bold">
                    EDGE INFERENCE: CORAL DUAL-CORE
                  </div>
                  <div className="bg-black/70 p-1.5 rounded border border-[#222] text-[10px] text-right">
                    SURFACE TEMP: 37.4°C
                  </div>
                </div>
              </div>
            )}

            {/* Thermal Hotspot Bounding Box */}
            {showBoundingBoxes && (
              <div className="absolute top-[42%] left-[42%] w-[22%] h-[25%] border border-red-500 bg-red-500/20 pointer-events-none rounded">
                <span className="bg-red-600 text-white font-mono font-bold text-[8px] px-1 py-0.5 leading-none uppercase">
                  BIOLOGICAL HEAT: 37.2°C (94%)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Telemetry & Detection Meta Banner Below Cameras */}
      <div className="bg-[#0a0a0a] border border-[#222] rounded p-4 font-mono text-xs">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center border-b border-[#222] pb-3 mb-3">
          <div>
            <div className="text-[#555] text-[9px] uppercase font-bold">ACTIVE DRONE</div>
            <div className="text-white font-bold text-sm">{drone?.droneId}</div>
          </div>
          <div>
            <div className="text-[#555] text-[9px] uppercase font-bold">MISSION ID</div>
            <div className="text-white font-bold text-sm">{drone?.currentMissionId}</div>
          </div>
          <div>
            <div className="text-[#555] text-[9px] uppercase font-bold">GPS COORDINATES</div>
            <div className="text-green-500 font-bold text-xs">{drone?.latitude.toFixed(5)}°N, {drone?.longitude.toFixed(5)}°E</div>
          </div>
          <div>
            <div className="text-[#555] text-[9px] uppercase font-bold">ALTITUDE / SPEED</div>
            <div className="text-white font-bold text-sm">{drone?.altitude}m @ {drone?.speed}m/s</div>
          </div>
          <div>
            <div className="text-[#555] text-[9px] uppercase font-bold">AI CONFIDENCE PEAK</div>
            <div className="text-green-500 font-bold text-sm">96%</div>
          </div>
          <div>
            <div className="text-[#555] text-[9px] uppercase font-bold">EDGE LATENCY</div>
            <div className="text-white font-bold text-sm">24 ms (On-device)</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-[#666] text-[10px] gap-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-red-500" />
            <span>VIDEO PIPELINE READY: Architecture prepared for RTSP / WebRTC low-latency streaming pipeline</span>
          </div>
          <span className="text-green-500 font-bold">
            ON-DEVICE EDGE INFERENCE ACTIVE (NVIDIA JETSON / GOOGLE CORAL)
          </span>
        </div>
      </div>
    </div>
  );
};
