import React, { useState } from 'react';
import { 
  Compass, Plus, Play, CheckCircle2, 
  MapPin, Clock, Battery, Navigation, Sliders
} from 'lucide-react';
import { commandStore } from '../../services/store';
import { Mission, SearchPattern, DisasterType, MissionPriority } from '../../types';

export const MissionPlanningView: React.FC = () => {
  const missions = commandStore.missions;
  const drones = commandStore.drones;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [missionName, setMissionName] = useState('');
  const [disasterType, setDisasterType] = useState<DisasterType>('Flood');
  const [assignedDroneId, setAssignedDroneId] = useState<string>(drones[0]?.droneId || 'DRONE-01');
  const [priority, setPriority] = useState<MissionPriority>('HIGH');
  const [searchPattern, setSearchPattern] = useState<SearchPattern>('LAWNMOWER');
  const [altitude, setAltitude] = useState<number>(45);
  const [speed, setSpeed] = useState<number>(12);
  const [cameraMode, setCameraMode] = useState<'BOTH' | 'RGB' | 'THERMAL'>('BOTH');

  // Computed estimates based on pattern & altitude
  const estDistanceKm = (searchPattern === 'LAWNMOWER' ? 4.8 : searchPattern === 'EXPANDING_SQUARE' ? 3.6 : 2.5);
  const estTimeMin = Math.round((estDistanceKm * 1000) / speed / 60);
  const estBatteryNeeded = Math.min(85, Math.round(estTimeMin * 1.8));

  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionName.trim()) return;

    const newMission: Mission = {
      missionId: `MSN-${String(missions.length + 1).padStart(3, '0')}`,
      name: missionName.trim(),
      disasterType,
      assignedDroneIds: [assignedDroneId],
      priority,
      status: 'SCHEDULED',
      searchPattern,
      targetZone: 'North Basin Sector',
      altitudeMeters: altitude,
      speedMps: speed,
      areaCoveredKm2: 0,
      totalAreaKm2: 3.5,
      estimatedDurationMinutes: estTimeMin,
      startedAt: new Date().toLocaleTimeString(),
      completedAt: null,
      waypointCount: searchPattern === 'LAWNMOWER' ? 12 : 8,
    };

    commandStore.createMission(newMission);
    setShowCreateModal(false);
    setMissionName('');
  };

  const handleStartMission = (missionId: string) => {
    commandStore.updateMissionStatus(missionId, 'IN_PROGRESS');
  };

  const handleCompleteMission = (missionId: string) => {
    commandStore.updateMissionStatus(missionId, 'COMPLETED');
  };

  return (
    <div className="p-4 space-y-4 max-w-[1700px] mx-auto text-[#e0e0e0] font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0a0a] border border-[#222] p-4 rounded">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-red-500" />
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">
              AUTONOMOUS MISSION PLANNING & DISPATCH
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#161616] border border-[#333] text-white font-bold">
              {missions.length} MISSIONS ARCHIVED
            </span>
          </div>
          <p className="text-xs text-[#666] font-mono mt-0.5 font-sans">
            Define automated search corridors, lawnmower sweep patterns, and drone squadron assignments
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow-lg transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>PLAN NEW SEARCH MISSION</span>
        </button>
      </div>

      {/* Search Patterns Reference Guide */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#0a0a0a] border border-[#222] p-3 rounded">
          <div className="text-white font-bold mb-1">LAWNMOWER (PARALLEL)</div>
          <p className="text-[11px] text-[#666] font-sans leading-tight">
            Optimal for wide flood basins and flat plains. Systematic parallel sweeps with 70% camera overlap.
          </p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#222] p-3 rounded">
          <div className="text-white font-bold mb-1">EXPANDING SQUARE</div>
          <p className="text-[11px] text-[#666] font-sans leading-tight">
            Ideal when last known survivor coordinate is pinned. Radiates outwards in growing concentric rings.
          </p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#222] p-3 rounded">
          <div className="text-white font-bold mb-1">SECTOR SEARCH</div>
          <p className="text-[11px] text-[#666] font-sans leading-tight">
            Pie-slice directional sweep along river bends, canal embankments, and linear road corridors.
          </p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#222] p-3 rounded">
          <div className="text-white font-bold mb-1">PERIMETER ISOLATION</div>
          <p className="text-[11px] text-[#666] font-sans leading-tight">
            Circumnavigates disaster boundaries (firelines or flash flood rims) to assess structural breach risk.
          </p>
        </div>
      </div>

      {/* Active & Scheduled Missions Table */}
      <div className="bg-[#0a0a0a] border border-[#222] rounded overflow-hidden">
        <div className="p-3 bg-[#0d0d0d] border-b border-[#222] flex items-center justify-between">
          <span className="font-bold text-white uppercase text-xs">MISSION SQUADRON DISPATCH LOG</span>
          <span className="text-[#666] text-[11px]">Auto-synchronized with onboard flight computers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#111] text-[#777] border-b border-[#222] text-[10px] uppercase">
              <tr>
                <th className="p-3">Mission ID</th>
                <th className="p-3">Mission Name</th>
                <th className="p-3">Disaster Type</th>
                <th className="p-3">Pattern</th>
                <th className="p-3">Assigned Drone</th>
                <th className="p-3">Alt / Spd</th>
                <th className="p-3">Area Coverage</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c1c1c]">
              {missions.map((m) => (
                <tr key={m.missionId} className="hover:bg-[#121212] transition-colors">
                  <td className="p-3 font-bold text-white">{m.missionId}</td>
                  <td className="p-3">
                    <div className="text-white font-bold font-sans">{m.name}</div>
                    <div className="text-[10px] text-[#666]">{m.targetZone}</div>
                  </td>
                  <td className="p-3 text-[#aaa]">{m.disasterType}</td>
                  <td className="p-3 text-red-400 font-bold">{m.searchPattern}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-[#111] border border-[#222] text-[#ccc] font-bold">
                      {m.assignedDroneIds.join(', ')}
                    </span>
                  </td>
                  <td className="p-3 text-[#aaa]">{m.altitudeMeters}m @ {m.speedMps}m/s</td>
                  <td className="p-3 text-[#aaa]">
                    <div className="w-28 bg-[#1e1e1e] h-1.5 rounded-full overflow-hidden mb-1">
                      <div
                        className="bg-green-500 h-full"
                        style={{ width: `${Math.min(100, (m.areaCoveredKm2 / m.totalAreaKm2) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#666]">
                      {m.areaCoveredKm2.toFixed(1)} / {m.totalAreaKm2.toFixed(1)} km²
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        m.status === 'IN_PROGRESS'
                          ? 'bg-green-950 text-green-400 border border-green-800 animate-pulse'
                          : m.status === 'COMPLETED'
                          ? 'bg-[#161616] text-[#888] border border-[#333]'
                          : 'bg-[#161616] text-white border border-[#333]'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {m.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleStartMission(m.missionId)}
                        className="px-2.5 py-1 bg-green-950 hover:bg-green-900 border border-green-800 text-green-400 font-bold rounded text-[10px] inline-flex items-center gap-1 transition-colors"
                      >
                        <Play className="w-3 h-3" /> Launch
                      </button>
                    )}
                    {m.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleCompleteMission(m.missionId)}
                        className="px-2.5 py-1 bg-[#161616] hover:bg-[#252525] border border-[#333] text-[#ccc] font-bold rounded text-[10px] inline-flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan New Mission Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateMission}
            className="bg-[#0a0a0a] border border-[#222] rounded p-5 max-w-xl w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#222] pb-2">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-red-500" />
                <h3 className="font-bold text-white uppercase text-sm">
                  AUTONOMOUS MISSION DISPATCH GENERATOR
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-[#666] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">
                Mission Name / Sector Identifier:
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Adyar Canal Flash Survey Bravo"
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
                className="w-full px-3 py-2 bg-[#111] border border-[#222] rounded text-white focus:outline-none focus:border-red-500 font-sans text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">
                  Disaster Scenario:
                </label>
                <select
                  value={disasterType}
                  onChange={(e) => setDisasterType(e.target.value as DisasterType)}
                  className="w-full px-2 py-1.5 bg-[#111] border border-[#222] rounded text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Flood">Flood / Inundation</option>
                  <option value="Earthquake">Earthquake Collapsed</option>
                  <option value="Fire">Wildfire / Industrial</option>
                  <option value="Landslide">Landslide Barrier</option>
                  <option value="Cyclone">Cyclone / Hurricane</option>
                </select>
              </div>

              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">
                  Assign Autonomous Drone:
                </label>
                <select
                  value={assignedDroneId}
                  onChange={(e) => setAssignedDroneId(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#111] border border-[#222] rounded text-white focus:outline-none focus:border-red-500"
                >
                  {drones.map((d) => (
                    <option key={d.droneId} value={d.droneId}>
                      {d.droneId} ({d.name} - Bat: {d.battery}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">
                  Search Geometry Pattern:
                </label>
                <select
                  value={searchPattern}
                  onChange={(e) => setSearchPattern(e.target.value as SearchPattern)}
                  className="w-full px-2 py-1.5 bg-[#111] border border-[#222] rounded text-white focus:outline-none focus:border-red-500"
                >
                  <option value="LAWNMOWER">Lawnmower (Parallel Grid)</option>
                  <option value="EXPANDING_SQUARE">Expanding Concentric Square</option>
                  <option value="SECTOR_SEARCH">Sector Pie Sweep</option>
                  <option value="PERIMETER">Perimeter Containment</option>
                </select>
              </div>

              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">
                  Priority Rating:
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as MissionPriority)}
                  className="w-full px-2 py-1.5 bg-[#111] border border-[#222] rounded text-white focus:outline-none focus:border-red-500"
                >
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">
                  Survey Altitude: {altitude}m AGL
                </label>
                <input
                  type="range"
                  min="20"
                  max="120"
                  step="5"
                  value={altitude}
                  onChange={(e) => setAltitude(Number(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>

              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">
                  Cruise Speed: {speed} m/s
                </label>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="1"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>
            </div>

            {/* Calculations Box */}
            <div className="p-3 bg-[#111] rounded border border-[#1a1a1a] space-y-1 text-[#ccc]">
              <div className="text-[10px] text-red-500 font-bold uppercase mb-1">
                PRE-FLIGHT COMPUTED ESTIMATES:
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="bg-[#0a0a0a] p-1.5 rounded border border-[#1a1a1a]">
                  <div className="text-[#666] text-[9px]">TOTAL DISTANCE</div>
                  <div className="font-bold text-white">{estDistanceKm} km</div>
                </div>
                <div className="bg-[#0a0a0a] p-1.5 rounded border border-[#1a1a1a]">
                  <div className="text-[#666] text-[9px]">EST FLIGHT TIME</div>
                  <div className="font-bold text-white">{estTimeMin} min</div>
                </div>
                <div className="bg-[#0a0a0a] p-1.5 rounded border border-[#1a1a1a]">
                  <div className="text-[#666] text-[9px]">BATTERY REQ</div>
                  <div className="font-bold text-green-500">~{estBatteryNeeded}%</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#222]">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2 rounded bg-[#161616] hover:bg-[#222] border border-[#333] text-[#888] font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-bold transition-colors"
              >
                Deploy Autonomous Mission
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
