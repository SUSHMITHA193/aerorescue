import React, { useState, useEffect } from 'react';
import { 
  Radio, ShieldAlert, Cpu, Play, Pause, RotateCcw, 
  Wifi, WifiOff, AlertTriangle, ChevronDown, User, Volume2, VolumeX 
} from 'lucide-react';
import { commandStore } from '../../services/store';
import { ConnectivityStatus, UserRole } from '../../types';

interface HeaderProps {
  onNavigateToAlerts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateToAlerts }) => {
  const [timeStr, setTimeStr] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showConnMenu, setShowConnMenu] = useState(false);
  const [audioBeacon, setAudioBeacon] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toUTCString().replace('GMT', 'UTC') + ' | ' + now.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const criticalAlertsCount = commandStore.alerts.filter(
    (a) => a.severity === 'CRITICAL' && (a.status === 'NEW' || a.status === 'ASSIGNED')
  ).length;

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'MISSION_COMMANDER', label: 'Mission Commander', desc: 'Missions, alerts, dispatch, reports' },
    { role: 'ADMIN', label: 'System Admin', desc: 'Full permissions & configuration' },
    { role: 'RESPONDER', label: 'Field Responder', desc: 'Survivors, hazards, rescue triage' },
    { role: 'VIEWER', label: 'Disaster Observer', desc: 'Read-only situational overview' },
  ];

  return (
    <header className="h-16 border-b border-[#222] bg-[#0a0a0a] text-[#e0e0e0] sticky top-0 z-50 flex flex-col justify-center px-4 md:px-6 shrink-0">
      {/* Offline Alert Warning Banner */}
      {commandStore.connectivity === 'OFFLINE' && (
        <div className="absolute top-full left-0 right-0 bg-red-950/95 border-b border-red-800 text-red-400 px-6 py-1 text-[11px] font-mono flex items-center justify-between z-50">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="font-bold">OFFLINE MODE:</span>
            <span>Uplink disconnected. Edge AI continues onboard. ({commandStore.offlineQueue.length} actions queued).</span>
          </div>
          <button 
            onClick={() => commandStore.setConnectivity('ONLINE')}
            className="text-[10px] bg-red-600 hover:bg-red-500 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider"
          >
            Reconnect
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand & Geometric Logo */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold text-white italic shadow-[0_0_12px_rgba(239,68,68,0.4)] shrink-0">
            A
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tighter leading-none text-white">
              AERORESCUE AI
            </h1>
            <p className="text-[9px] md:text-[10px] text-[#888] uppercase tracking-widest leading-tight mt-0.5">
              Autonomous Disaster Command Center
            </p>
          </div>

          <div className="hidden xl:block h-8 w-[1px] bg-[#222] mx-2" />

          {/* System Status Display (Geometric balance style) */}
          <div className="hidden xl:flex flex-col items-start">
            <span className="text-[10px] text-[#555] uppercase font-bold tracking-wider">System Status</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              <span className="text-xs font-mono text-green-500 font-bold">EDGE-AI ENABLED</span>
            </div>
          </div>

          <div className="hidden lg:block h-8 w-[1px] bg-[#222] mx-1" />

          {/* Active Mission */}
          <div className="hidden lg:flex flex-col items-start">
            <span className="text-[10px] text-[#555] uppercase font-bold tracking-wider">Active Mission</span>
            <span className="text-xs font-mono text-orange-400 font-medium truncate max-w-[200px]">
              {commandStore.missions.find((m) => m.status === 'ACTIVE')?.missionName || 'CHENNAI_FLOOD_S&R_04'}
            </span>
          </div>
        </div>

        {/* Center/Right: Tickers, Simulation Controls, Critical Alert Badge */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Critical Alerts Badge */}
          <button
            onClick={onNavigateToAlerts}
            className={`px-3 py-1 rounded text-[10px] font-bold font-mono tracking-wider transition-all flex items-center gap-1.5 ${
              criticalAlertsCount > 0
                ? 'bg-red-950 border border-red-800 text-red-500 animate-pulse hover:bg-red-900'
                : 'bg-[#111] border border-[#222] text-[#888] hover:text-white'
            }`}
            title="Emergency Alerts Feed"
          >
            <span>🚨</span>
            <span>{criticalAlertsCount} CRITICAL ALERTS</span>
          </button>

          {/* Connectivity Mode Pill */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowConnMenu(!showConnMenu)}
              className="flex items-center gap-1.5 bg-[#0e0e0e] hover:bg-[#161616] border border-[#222] px-2.5 py-1 rounded text-xs font-mono transition-colors"
            >
              {commandStore.connectivity === 'ONLINE' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-green-400 text-[11px] font-bold">ONLINE</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="text-red-400 text-[11px] font-bold">OFFLINE</span>
                </>
              )}
              <ChevronDown className="w-3 h-3 text-[#555]" />
            </button>

            {showConnMenu && (
              <div className="absolute top-full right-0 mt-1 w-44 bg-[#0a0a0a] border border-[#222] rounded shadow-2xl py-1 z-50 text-xs font-mono">
                <div className="px-2 py-1 text-[10px] text-[#555] border-b border-[#222] uppercase font-bold">CONNECTIVITY MODE</div>
                {(['ONLINE', 'LIMITED', 'OFFLINE'] as ConnectivityStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      commandStore.setConnectivity(st);
                      setShowConnMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#161616] ${
                      commandStore.connectivity === st ? 'text-white font-bold bg-[#141414]' : 'text-[#888]'
                    }`}
                  >
                    <span>{st}</span>
                    {st === 'ONLINE' && <span className="text-green-500">●</span>}
                    {st === 'LIMITED' && <span className="text-orange-400">●</span>}
                    {st === 'OFFLINE' && <span className="text-red-500">●</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Simulation Mode Controls */}
          <div className="hidden md:flex items-center bg-[#0c0c0c] border border-[#222] rounded p-0.5">
            <button
              onClick={() => commandStore.toggleSimulation()}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider ${
                commandStore.isSimulating ? 'bg-[#1e1e1e] text-green-400 border border-[#333]' : 'bg-[#111] text-[#666] hover:text-white'
              }`}
            >
              {commandStore.isSimulating ? <Pause className="w-3 h-3 text-green-400" /> : <Play className="w-3 h-3 text-[#666]" />}
              <span>{commandStore.isSimulating ? 'SIM_RUNNING' : 'PAUSED'}</span>
            </button>

            <div className="flex items-center gap-0.5 px-1">
              {[1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => commandStore.setSimulationSpeed(spd)}
                  className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                    commandStore.simulationSpeed === spd
                      ? 'bg-[#222] text-white font-bold'
                      : 'text-[#555] hover:text-[#999]'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (window.confirm('Reset disaster scenario to initial baseline?')) {
                  commandStore.resetToSeed();
                }
              }}
              className="p-1 hover:bg-[#1a1a1a] rounded text-[#555] hover:text-red-400 transition-colors"
              title="Reset Simulation Scenario"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <div className="h-8 w-[1px] bg-[#222] hidden sm:block" />

          {/* Audio Alert Toggle */}
          <button
            onClick={() => setAudioBeacon(!audioBeacon)}
            className={`p-1.5 rounded border transition-colors ${
              audioBeacon ? 'bg-red-950 border-red-800 text-red-400' : 'bg-[#0e0e0e] border-[#222] text-[#555] hover:text-[#888]'
            }`}
            title={audioBeacon ? 'Audio beacon sound active' : 'Audio beacon muted'}
          >
            {audioBeacon ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* User / Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 bg-[#0e0e0e] hover:bg-[#161616] border border-[#222] px-2.5 py-1 rounded text-xs transition-colors"
            >
              <div className="w-5 h-5 rounded bg-[#222] text-white font-bold flex items-center justify-center text-[10px] font-mono">
                {commandStore.currentUser.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[#e0e0e0] font-bold leading-none text-xs">{commandStore.currentUser.name}</div>
                <div className="text-[9px] text-[#777] font-mono leading-tight uppercase">{commandStore.currentUser.role.replace('_', ' ')}</div>
              </div>
              <ChevronDown className="w-3 h-3 text-[#555]" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 top-full mt-1 w-60 bg-[#0a0a0a] border border-[#222] rounded shadow-2xl py-1 z-50">
                <div className="px-3 py-2 border-b border-[#222]">
                  <div className="text-xs text-white font-bold">{commandStore.currentUser.name}</div>
                  <div className="text-[10px] text-[#777] font-mono">CALLSIGN: {commandStore.currentUser.callsign}</div>
                </div>
                <div className="px-3 py-1 text-[9px] text-[#555] uppercase tracking-wider font-mono">
                  Switch Operator Role
                </div>
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      commandStore.setUserRole(r.role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[#161616] transition-colors ${
                      commandStore.currentUser.role === r.role ? 'bg-[#1a1a1a] border-l-2 border-red-500' : ''
                    }`}
                  >
                    <div className="font-medium text-[#e0e0e0]">{r.label}</div>
                    <div className="text-[10px] text-[#666]">{r.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
