import React, { useState } from 'react';
import { 
  Users, ShieldAlert, Heart, Eye, CheckCircle2, 
  Clock, AlertTriangle, Edit3, Filter, Check, X, Sparkles
} from 'lucide-react';
import { commandStore } from '../../services/store';
import { Survivor, SurvivorPriority, RescueStatus } from '../../types';

interface SurvivorsViewProps {
  onFocusOnMap?: (survivor: Survivor) => void;
}

export const SurvivorsView: React.FC<SurvivorsViewProps> = ({ onFocusOnMap }) => {
  const survivors = commandStore.survivors;

  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [editingSurvivor, setEditingSurvivor] = useState<Survivor | null>(null);
  const [overridePriority, setOverridePriority] = useState<SurvivorPriority>('CRITICAL');
  const [overrideNotes, setOverrideNotes] = useState('');

  const filteredSurvivors = survivors.filter((s) => {
    if (filterPriority !== 'ALL' && s.priorityLevel !== filterPriority) return false;
    if (filterStatus !== 'ALL' && s.rescueStatus !== filterStatus) return false;
    return true;
  });

  const handleOpenOverride = (s: Survivor) => {
    setEditingSurvivor(s);
    setOverridePriority(s.priorityLevel);
    setOverrideNotes(s.manualOverride?.notes || '');
  };

  const handleSaveOverride = () => {
    if (!editingSurvivor) return;
    commandStore.overrideSurvivorPriority(editingSurvivor.survivorId, overridePriority, overrideNotes);
    setEditingSurvivor(null);
  };

  const handleStatusUpdate = (survivorId: string, status: RescueStatus) => {
    commandStore.updateSurvivorStatus(survivorId, status);
  };

  return (
    <div className="p-4 space-y-4 max-w-[1700px] mx-auto text-[#e0e0e0]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0a0a] border border-[#222] p-4 rounded">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-500" />
            <h1 className="text-sm font-bold font-mono tracking-wide text-white uppercase">
              SURVIVOR SEARCH & RESCUE TRIAGE
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-green-950 border border-green-800 text-green-400 font-mono font-bold">
              {survivors.length} TOTAL DETECTED
            </span>
          </div>
          <p className="text-xs text-[#666] font-mono mt-0.5">
            AI-prioritized survivor queue with multi-factor risk scoring and responder override audit trails
          </p>
        </div>

        {/* Priority Filter Tabs */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-[#111] border border-[#222] text-[#ccc] py-1.5 px-2.5 rounded focus:outline-none focus:border-red-500 font-mono"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#111] border border-[#222] text-[#ccc] py-1.5 px-2.5 rounded focus:outline-none focus:border-red-500 font-mono"
          >
            <option value="ALL">All Rescue Statuses</option>
            <option value="Detected">Detected</option>
            <option value="Verified">Verified</option>
            <option value="Rescue Assigned">Rescue Assigned</option>
            <option value="Rescued">Rescued</option>
            <option value="Monitoring">Monitoring</option>
          </select>
        </div>
      </div>

      {/* Survivor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSurvivors.map((surv) => {
          const isCritical = surv.priorityLevel === 'CRITICAL';
          const isHigh = surv.priorityLevel === 'HIGH';
          const isRescued = surv.rescueStatus === 'Rescued';

          return (
            <div
              key={surv.survivorId}
              className={`bg-[#0a0a0a] border rounded overflow-hidden flex flex-col transition-all ${
                isRescued
                  ? 'border-green-900/60 opacity-80'
                  : isCritical
                  ? 'border-red-600/70 ring-1 ring-red-600/30'
                  : isHigh
                  ? 'border-orange-700/60'
                  : 'border-[#222]'
              }`}
            >
              {/* Card Header */}
              <div className="p-3 bg-[#0d0d0d] border-b border-[#222] flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-sm">{surv.survivorId}</span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      isCritical
                        ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                        : isHigh
                        ? 'bg-orange-950 text-orange-400 border border-orange-800'
                        : 'bg-green-950 text-green-400 border border-green-800'
                    }`}
                  >
                    {surv.priorityLevel}
                  </span>
                  {surv.manualOverride && (
                    <span className="text-[9px] px-1 bg-[#222] text-[#aaa] border border-[#333] rounded" title="Human override">
                      OVERRIDDEN
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-[#666] font-mono">{surv.droneId}</span>
              </div>

              {/* Dual Imagery (RGB + FLIR) */}
              <div className="grid grid-cols-2 gap-1 bg-black p-1 border-b border-[#222]">
                <div className="relative aspect-video">
                  <img
                    src={surv.imageUrl}
                    alt="RGB Detection"
                    className="w-full h-full object-cover rounded"
                  />
                  <div className="absolute top-1 left-1 bg-black/80 text-[#888] font-mono text-[8px] px-1 rounded border border-[#222]">
                    RGB
                  </div>
                </div>
                <div className="relative aspect-video">
                  <img
                    src={surv.thermalImageUrl}
                    alt="Thermal FLIR Detection"
                    className="w-full h-full object-cover rounded"
                  />
                  <div className="absolute top-1 left-1 bg-black/80 text-red-400 font-mono text-[8px] px-1 rounded border border-[#222]">
                    THERMAL 37°C
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-3 font-mono text-xs">
                {/* AI Score */}
                <div className="bg-[#111] p-2.5 rounded border border-[#1a1a1a]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-white font-bold uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-red-500" /> AI PRIORITY SCORE
                    </span>
                    <span className="text-base font-black text-red-500">
                      {surv.priorityScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-[#1e1e1e] h-1.5 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-red-600"
                      style={{ width: `${surv.priorityScore}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-[#666]">
                    <div>Count: <strong className="text-white">{surv.peopleCount}</strong></div>
                    <div>Confidence: <strong className="text-green-500">{surv.confidence}%</strong></div>
                  </div>
                </div>

                {/* Location & Hazards */}
                <div>
                  <div className="text-[11px] text-[#888] mb-1">
                    LAT: {surv.latitude.toFixed(5)}° • LON: {surv.longitude.toFixed(5)}°
                  </div>
                  <div className="space-y-1">
                    {surv.nearbyHazards.map((hz, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 text-[10px] text-orange-400 bg-orange-950/40 px-2 py-0.5 rounded border border-orange-900/60"
                      >
                        <AlertTriangle className="w-3 h-3 text-orange-400 shrink-0" />
                        <span className="truncate">{hz}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rescue Status Dropdown & Override Trigger */}
                <div className="pt-2 border-t border-[#222] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#666]">STATUS:</span>
                    <select
                      value={surv.rescueStatus}
                      onChange={(e) => handleStatusUpdate(surv.survivorId, e.target.value as RescueStatus)}
                      className="bg-[#111] border border-[#222] text-xs py-1 px-2 rounded text-white focus:outline-none focus:border-red-500 font-bold font-mono"
                    >
                      <option value="Detected">Detected</option>
                      <option value="Verified">Verified</option>
                      <option value="Rescue Assigned">Rescue Assigned</option>
                      <option value="Rescued">Rescued</option>
                      <option value="Monitoring">Monitoring</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleOpenOverride(surv)}
                    className="p-1 px-2 rounded bg-[#161616] hover:bg-[#252525] border border-[#333] text-[#ccc] hover:text-white flex items-center gap-1 text-[10px] transition-colors"
                    title="Manual Priority Override"
                  >
                    <Edit3 className="w-3 h-3" /> Override
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Override Modal */}
      {editingSurvivor && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-[#222] rounded p-5 max-w-md w-full shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#222] pb-2">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-red-500" />
                <h3 className="font-bold text-white uppercase text-sm">
                  PRIORITY OVERRIDE — {editingSurvivor.survivorId}
                </h3>
              </div>
              <button
                onClick={() => setEditingSurvivor(null)}
                className="text-[#666] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 bg-[#111] rounded border border-[#1a1a1a] text-[11px] text-[#aaa]">
              AI Calculated Priority: <strong className="text-red-500">{editingSurvivor.priorityLevel} ({editingSurvivor.priorityScore}/100)</strong>
              <br />
              Human override will be audited under current responder callsign: <strong className="text-white">{commandStore.currentUser.callsign}</strong>
            </div>

            <div>
              <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">
                Select New Operational Priority:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as SurvivorPriority[]).map((pr) => (
                  <button
                    key={pr}
                    onClick={() => setOverridePriority(pr)}
                    className={`py-1.5 rounded border text-center font-bold text-[10px] ${
                      overridePriority === pr
                        ? 'bg-red-600 text-white border-red-500'
                        : 'bg-[#111] border-[#222] text-[#888] hover:text-white'
                    }`}
                  >
                    {pr}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">
                Override Justification / Ground Assessment:
              </label>
              <textarea
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                placeholder="E.g. Inflatable boat squad on site confirmed water level stable; elderly resident requires insulin."
                className="w-full h-20 p-2 bg-[#111] border border-[#222] rounded text-white focus:outline-none focus:border-red-500 text-xs resize-none font-mono"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#222]">
              <button
                onClick={() => setEditingSurvivor(null)}
                className="flex-1 py-2 rounded bg-[#161616] hover:bg-[#222] border border-[#333] text-[#888] font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOverride}
                className="flex-1 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-bold transition-colors"
              >
                Save Override to Store
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
