import React, { useState } from 'react';
import { 
  Navigation, Radio, ShieldCheck, AlertTriangle, 
  RotateCcw, Crosshair, Cpu, CheckCircle2, Radar
} from 'lucide-react';
import { commandStore } from '../../services/store';
import { NavigationMode } from '../../types';

export const AutonomousNavView: React.FC = () => {
  const [activeDroneId, setActiveDroneId] = useState<string>(commandStore.drones[0]?.droneId || 'DRONE-01');
  const drone = commandStore.drones.find((d) => d.droneId === activeDroneId) || commandStore.drones[0];

  const handleSetNavMode = (mode: NavigationMode) => {
    commandStore.setDroneNavMode(drone.droneId, mode);
  };

  // 360-Degree Obstacle Sensor Proximity (Simulated Real-time LiDAR & Sonar Array)
  const proximitySensors = [
    { dir: 'FORWARD', distMeters: 6.4, status: 'CLEAR', icon: '▲' },
    { dir: 'FRONT-RIGHT', distMeters: 3.2, status: 'CAUTION', icon: '↗' },
    { dir: 'RIGHT', distMeters: 7.1, status: 'CLEAR', icon: '▶' },
    { dir: 'REAR-RIGHT', distMeters: 8.5, status: 'CLEAR', icon: '↘' },
    { dir: 'REAR', distMeters: 9.0, status: 'CLEAR', icon: '▼' },
    { dir: 'REAR-LEFT', distMeters: 8.8, status: 'CLEAR', icon: '↙' },
    { dir: 'LEFT', distMeters: 4.5, status: 'CAUTION', icon: '◀' },
    { dir: 'FRONT-LEFT', distMeters: 5.9, status: 'CLEAR', icon: '↖' },
    { dir: 'ALTITUDE / GROUND', distMeters: drone.altitude, status: 'CLEAR', icon: '⬇' },
  ];

  const reroutingLogs = [
    { time: '10:42:15', event: 'Power line detected at 3.2m bearing 045° — Initiated +8m vertical ceiling hop' },
    { time: '10:38:02', event: 'GPS Multipath drop in alleyway — Auto-engaged Edge SLAM feature tracking' },
    { time: '10:29:40', event: 'Dense smoke plume thermal plume — Diverted flight corridor 25m West' },
    { time: '10:15:10', event: 'Takeoff clearance confirmed — Barometric lock established at 45m MSL' },
  ];

  return (
    <div className="p-4 space-y-4 max-w-[1700px] mx-auto text-[#e0e0e0] font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0a0a] border border-[#222] p-4 rounded">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-red-500" />
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">
              AUTONOMOUS NAVIGATION & COLLISION AVOIDANCE
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-green-950 border border-green-800 text-green-400 font-bold">
              SLAM & LIDAR ACTIVE
            </span>
          </div>
          <p className="text-xs text-[#666] mt-0.5 font-sans">
            Real-time visual-inertial odometry for GPS-denied environments and dynamic obstacle rerouting
          </p>
        </div>

        {/* Drone Select */}
        <div className="flex items-center gap-1.5 bg-[#111] p-1.5 rounded border border-[#222]">
          <span className="text-[10px] text-[#555] uppercase px-1 font-bold">INSPECT DRONE:</span>
          {commandStore.drones.map((d) => (
            <button
              key={d.droneId}
              onClick={() => setActiveDroneId(d.droneId)}
              className={`px-2.5 py-1 rounded font-bold transition-colors ${
                activeDroneId === d.droneId
                  ? 'bg-red-600 text-white'
                  : 'text-[#666] hover:text-white'
              }`}
            >
              {d.droneId}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Modes Deck */}
      <div className="bg-[#0a0a0a] border border-[#222] rounded p-4">
        <div className="text-[10px] font-bold text-[#888] uppercase tracking-wider mb-3 flex items-center justify-between border-b border-[#222] pb-2">
          <span>Flight Control & Autonomy Modes</span>
          <span className="text-white font-bold">CURRENT ACTIVE: <span className="text-green-500">{drone.navMode}</span></span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
          <button
            onClick={() => handleSetNavMode('GPS_GUIDED')}
            className={`p-3 rounded border text-left transition-all ${
              drone.navMode === 'GPS_GUIDED'
                ? 'bg-[#161616] border-[#444] text-white'
                : 'bg-[#111] border-[#1a1a1a] text-[#777] hover:text-white'
            }`}
          >
            <div className="font-bold text-white text-xs mb-1">GPS GUIDED</div>
            <div className="text-[10px] text-[#666] font-sans leading-tight">
              Standard satellite waypoint following with RTK 2cm accuracy.
            </div>
          </button>

          <button
            onClick={() => handleSetNavMode('GPS_DENIED_SLAM')}
            className={`p-3 rounded border text-left transition-all ${
              drone.navMode === 'GPS_DENIED_SLAM'
                ? 'bg-[#161616] border-[#444] text-white'
                : 'bg-[#111] border-[#1a1a1a] text-[#777] hover:text-white'
            }`}
          >
            <div className="font-bold text-white text-xs mb-1">GPS-DENIED SLAM</div>
            <div className="text-[10px] text-[#666] font-sans leading-tight">
              Visual-Inertial Odometry in tunnels, bridge undersides, & collapsed zones.
            </div>
          </button>

          <button
            onClick={() => handleSetNavMode('RETURN_TO_HOME')}
            className={`p-3 rounded border text-left transition-all ${
              drone.navMode === 'RETURN_TO_HOME'
                ? 'bg-[#161616] border-orange-500 text-orange-400'
                : 'bg-[#111] border-[#1a1a1a] text-[#777] hover:text-white'
            }`}
          >
            <div className="font-bold text-white text-xs mb-1">RETURN HOME (RTH)</div>
            <div className="text-[10px] text-[#666] font-sans leading-tight">
              Direct backtrack on safe pre-planned corridor to deployment base.
            </div>
          </button>

          <button
            onClick={() => handleSetNavMode('MANUAL_OVERRIDE')}
            className={`p-3 rounded border text-left transition-all ${
              drone.navMode === 'MANUAL_OVERRIDE'
                ? 'bg-[#161616] border-green-600 text-green-400'
                : 'bg-[#111] border-[#1a1a1a] text-[#777] hover:text-white'
            }`}
          >
            <div className="font-bold text-white text-xs mb-1">MANUAL ASSIST</div>
            <div className="text-[10px] text-[#666] font-sans leading-tight">
              Pilot hands-on-throttle with autonomous obstacle envelope enforcement.
            </div>
          </button>

          <button
            onClick={() => handleSetNavMode('EMERGENCY_LAND')}
            className={`p-3 rounded border text-left transition-all ${
              drone.navMode === 'EMERGENCY_LAND'
                ? 'bg-red-950 border-red-600 text-red-400'
                : 'bg-[#111] border-[#1a1a1a] text-[#777] hover:text-white'
            }`}
          >
            <div className="font-bold text-white text-xs mb-1">EMERGENCY LAND</div>
            <div className="text-[10px] text-[#666] font-sans leading-tight">
              Immediate vertical descent onto flat terrain using downward sonar.
            </div>
          </button>
        </div>
      </div>

      {/* Center Grid: 360-degree Radar Obstacle Sensor Display & Rerouting Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Radar & Sensor Array Display */}
        <div className="lg:col-span-6 bg-[#0a0a0a] border border-[#222] rounded p-4 flex flex-col items-center">
          <div className="w-full text-[10px] font-bold text-[#888] uppercase tracking-wider mb-2 flex items-center justify-between border-b border-[#222] pb-2">
            <span className="flex items-center gap-1.5 text-white">
              <Radar className="w-4 h-4 text-green-500" /> 360° LIDAR & ULTRASONIC ENVELOPE
            </span>
            <span className="text-[10px] text-green-500 font-bold">COLLISION RISK: LOW</span>
          </div>

          {/* Radar Visual Canvas Container */}
          <div className="relative w-64 h-64 rounded-full border border-[#222] bg-[#000] flex items-center justify-center my-4 overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            {/* Concentric distance rings */}
            <div className="absolute w-48 h-48 rounded-full border border-[#222]" />
            <div className="absolute w-32 h-32 rounded-full border border-[#222]" />
            <div className="absolute w-16 h-16 rounded-full border border-[#222]" />

            {/* Radar crosshairs with red accent as per Geometric Balance */}
            <div className="absolute w-full h-[1px] bg-red-500/30" />
            <div className="absolute h-full w-[1px] bg-red-500/30" />

            {/* Rotating sweep line */}
            <div
              className="absolute w-1/2 h-[1px] bg-gradient-to-r from-transparent to-green-500 origin-left"
              style={{
                top: '50%',
                left: '50%',
                animation: 'spin 4s linear infinite',
              }}
            />

            {/* Drone Center Core */}
            <div className="relative z-10 w-6 h-6 rounded-full bg-white text-black font-bold flex items-center justify-center shadow-lg text-[9px]">
              ▲
            </div>

            {/* Proximity Obstacle Blips */}
            <div
              className="absolute top-10 right-14 w-3 h-3 rounded-full bg-orange-500 border border-black animate-pulse"
              title="Obstacle: Tree/Pole at 3.2m"
            />
            <div
              className="absolute bottom-16 left-12 w-2.5 h-2.5 rounded-full bg-green-500 border border-black"
              title="Obstacle: Building Wall at 4.5m"
            />
          </div>

          {/* Sensor breakdown pills */}
          <div className="grid grid-cols-3 gap-2 w-full text-[10px]">
            {proximitySensors.slice(0, 6).map((s, idx) => (
              <div key={idx} className="bg-[#111] p-1.5 rounded border border-[#1a1a1a] flex items-center justify-between">
                <span className="text-[#666]">{s.dir}</span>
                <span className={`font-bold ${s.status === 'CAUTION' ? 'text-orange-400' : 'text-green-500'}`}>
                  {s.distMeters.toFixed(1)}m
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Rerouting Events & SLAM Localization Log */}
        <div className="lg:col-span-6 bg-[#0a0a0a] border border-[#222] rounded p-4 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-white uppercase mb-3 flex items-center justify-between pb-2 border-b border-[#222] tracking-wider">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-red-500" />
                AUTONOMOUS REROUTING & COLLISION LOG
              </span>
              <span className="text-[10px] text-[#555]">EDGE AUTONOMY ENGINE</span>
            </div>

            <div className="space-y-2 mb-4">
              {reroutingLogs.map((log, i) => (
                <div key={i} className="p-2.5 rounded-r bg-[#111] border-l-2 border-red-600 flex items-start gap-2.5">
                  <span className="text-[10px] text-[#777] font-bold shrink-0">{log.time}</span>
                  <p className="text-[11px] text-[#ccc] font-sans leading-snug">{log.event}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Safe Corridor Status */}
          <div className="p-3 bg-[#111] border-l-2 border-green-600 rounded-r">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-white font-mono uppercase tracking-wider">SAFE FLIGHT CORRIDOR INTEGRITY</span>
              <span className="text-[10px] text-green-500 font-bold">DEVIATION: 0.8m</span>
            </div>
            <p className="text-[10px] text-[#777] font-sans">
              Auto-fenced within civil aviation emergency corridor clearance. No restricted airspace conflicts detected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
