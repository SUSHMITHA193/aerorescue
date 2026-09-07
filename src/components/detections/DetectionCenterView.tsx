import React, { useState } from 'react';
import { 
  Eye, Filter, CheckCircle, XCircle, AlertTriangle, 
  Search, Sliders, ShieldCheck, Sparkles, User, Flame
} from 'lucide-react';
import { commandStore } from '../../services/store';
import { Detection, VerificationStatus } from '../../types';

export const DetectionCenterView: React.FC = () => {
  const detections = commandStore.detections;

  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'People' | 'Hazards'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [droneFilter, setDroneFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [minConfidence, setMinConfidence] = useState<number>(0);

  const filteredDetections = detections.filter((det) => {
    if (categoryFilter !== 'ALL' && det.category !== categoryFilter) return false;
    if (severityFilter !== 'ALL' && det.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && det.verificationStatus !== statusFilter) return false;
    if (droneFilter !== 'ALL' && det.droneId !== droneFilter) return false;
    if (det.confidence < minConfidence) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        det.detectionId.toLowerCase().includes(q) ||
        det.detectionType.toLowerCase().includes(q) ||
        det.droneId.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleVerify = (detectionId: string) => {
    commandStore.detections = commandStore.detections.map((d) =>
      d.detectionId === detectionId ? { ...d, verificationStatus: 'Human Verified' } : d
    );
    // Also update corresponding survivor or hazard
    commandStore.survivors = commandStore.survivors.map((s) =>
      s.detectionId === detectionId ? { ...s, rescueStatus: 'Verified' } : s
    );
    commandStore.hazards = commandStore.hazards.map((h) =>
      h.detectionId === detectionId ? { ...h, status: 'Human Verified' } : h
    );
  };

  const handleFalsePositive = (detectionId: string) => {
    commandStore.detections = commandStore.detections.map((d) =>
      d.detectionId === detectionId ? { ...d, verificationStatus: 'False Positive' } : d
    );
    commandStore.hazards = commandStore.hazards.map((h) =>
      h.detectionId === detectionId ? { ...h, status: 'False Positive' } : h
    );
  };

  return (
    <div className="p-4 space-y-4 max-w-[1700px] mx-auto text-[#e0e0e0]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0a0a] border border-[#222] p-4 rounded">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-red-500" />
            <h1 className="text-sm font-bold font-mono tracking-wide text-white uppercase">
              AI DETECTION CENTER & STREAM
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#161616] border border-[#333] text-white font-mono font-bold">
              {filteredDetections.length} RECORDED
            </span>
          </div>
          <p className="text-xs text-[#666] font-mono mt-0.5">
            Real-time inference stream from onboard edge YOLOv8 & FLIR models. Human-in-the-loop verification required.
          </p>
        </div>

        {/* Human in the loop reassurance badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#111] border border-[#222] text-xs font-mono">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span className="text-[#888]">
            CONFIDENCE BADGE: <strong className="text-white">AI ESTIMATE</strong> (Requires confirmation)
          </span>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-[#0a0a0a] border border-[#222] p-3 rounded font-mono text-xs space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#555]" />
            <input
              type="text"
              placeholder="Search by ID, type, or drone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#111] border border-[#222] rounded text-white focus:outline-none focus:border-red-500 text-xs font-mono"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-[#111] p-1 rounded border border-[#222]">
            {(['ALL', 'People', 'Hazards'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded font-bold transition-colors ${
                  categoryFilter === cat ? 'bg-red-600 text-white' : 'text-[#666] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Severity Dropdown */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#111] border border-[#222] text-[#ccc] py-1.5 px-2.5 rounded focus:outline-none focus:border-red-500 font-mono"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Verification Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#111] border border-[#222] text-[#ccc] py-1.5 px-2.5 rounded focus:outline-none focus:border-red-500 font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="AI Detected">AI Detected</option>
            <option value="Human Verified">Human Verified</option>
            <option value="False Positive">False Positive</option>
          </select>

          {/* Drone Filter */}
          <select
            value={droneFilter}
            onChange={(e) => setDroneFilter(e.target.value)}
            className="bg-[#111] border border-[#222] text-[#ccc] py-1.5 px-2.5 rounded focus:outline-none focus:border-red-500 font-mono"
          >
            <option value="ALL">All Drones</option>
            {commandStore.drones.map((d) => (
              <option key={d.droneId} value={d.droneId}>
                {d.droneId}
              </option>
            ))}
          </select>
        </div>

        {/* Confidence Threshold Slider */}
        <div className="flex items-center gap-3 pt-2 border-t border-[#1a1a1a] text-[11px] text-[#666]">
          <span className="font-bold uppercase tracking-wider text-[#888]">MIN CONFIDENCE THRESHOLD:</span>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={minConfidence}
            onChange={(e) => setMinConfidence(Number(e.target.value))}
            className="w-40 accent-red-500"
          />
          <span className="font-bold text-red-500">{minConfidence}%</span>
        </div>
      </div>

      {/* Detections Feed List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredDetections.map((det) => {
          const isHighConf = det.confidence >= 90;
          const isMediumConf = det.confidence >= 75 && det.confidence < 90;

          return (
            <div
              key={det.detectionId}
              className="bg-[#0a0a0a] border border-[#222] rounded overflow-hidden flex flex-col hover:border-[#333] transition-all"
            >
              {/* Header */}
              <div className="p-3 bg-[#0d0d0d] border-b border-[#222] flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white">{det.detectionId}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      det.severity === 'CRITICAL'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : 'bg-orange-950 text-orange-400 border border-orange-800'
                    }`}
                  >
                    {det.severity}
                  </span>
                </div>
                <span className="text-[10px] text-[#666] font-mono">{det.droneId}</span>
              </div>

              {/* Dual Visuals */}
              <div className="grid grid-cols-2 gap-1 bg-black p-1 border-b border-[#222]">
                <div className="relative aspect-video">
                  <img
                    src={det.imageUrl}
                    alt="RGB Detection"
                    className="w-full h-full object-cover rounded"
                  />
                  <div className="absolute top-1 left-1 bg-black/80 text-[#888] font-mono text-[8px] px-1 rounded border border-[#222]">
                    RGB
                  </div>
                </div>
                <div className="relative aspect-video">
                  <img
                    src={det.thermalImageUrl || det.imageUrl}
                    alt="Thermal Detection"
                    className="w-full h-full object-cover rounded"
                  />
                  <div className="absolute top-1 left-1 bg-black/80 text-orange-400 font-mono text-[8px] px-1 rounded border border-[#222]">
                    FLIR
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5 font-mono text-xs">
                <div>
                  <div className="text-sm font-sans font-bold text-white mb-1">
                    {det.detectionType}
                  </div>
                  <div className="text-[11px] text-[#666]">
                    LAT: {det.latitude.toFixed(5)}° • LON: {det.longitude.toFixed(5)}°
                  </div>
                </div>

                {/* AI Confidence Gauge */}
                <div className="bg-[#111] p-2 rounded border border-[#1a1a1a]">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-[#666] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-red-500" /> AI Confidence:
                    </span>
                    <span
                      className={`font-bold ${
                        isHighConf ? 'text-green-500' : isMediumConf ? 'text-orange-400' : 'text-[#888]'
                      }`}
                    >
                      {det.confidence}% — {isHighConf ? 'Very High' : isMediumConf ? 'High' : 'Moderate'}
                    </span>
                  </div>
                  <div className="w-full bg-[#1e1e1e] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        isHighConf ? 'bg-green-500' : isMediumConf ? 'bg-orange-500' : 'bg-[#555]'
                      }`}
                      style={{ width: `${det.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Status & Human Verification Actions */}
                <div className="pt-2 border-t border-[#222] flex items-center justify-between">
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded border font-bold uppercase ${
                      det.verificationStatus === 'Human Verified'
                        ? 'bg-green-950 text-green-400 border border-green-800'
                        : det.verificationStatus === 'False Positive'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : 'bg-[#161616] text-[#888] border border-[#333]'
                    }`}
                  >
                    {det.verificationStatus}
                  </span>

                  {det.verificationStatus === 'AI Detected' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleVerify(det.detectionId)}
                        className="p-1 px-2 bg-green-950 hover:bg-green-900 border border-green-800 text-green-400 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                        title="Mark verified by responder"
                      >
                        <CheckCircle className="w-3 h-3" /> Verify
                      </button>
                      <button
                        onClick={() => handleFalsePositive(det.detectionId)}
                        className="p-1 px-2 bg-[#161616] hover:bg-[#252525] border border-[#333] text-[#777] hover:text-red-400 rounded text-[10px] flex items-center gap-1 transition-colors"
                        title="Flag as false positive"
                      >
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
