import React, { useState } from 'react';
import { 
  Bell, ShieldAlert, AlertTriangle, Info, 
  CheckCircle2, Check, Radio, Filter
} from 'lucide-react';
import { commandStore } from '../../services/store';
import { EmergencyAlert, AlertSeverity, AlertStatus } from '../../types';

export const AlertsView: React.FC = () => {
  const alerts = commandStore.alerts;

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    return true;
  });

  const handleUpdateStatus = (alertId: string, status: AlertStatus) => {
    commandStore.updateAlertStatus(alertId, status);
  };

  return (
    <div className="p-4 space-y-4 max-w-[1700px] mx-auto text-[#e0e0e0] font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0a0a] border border-[#222] p-4 rounded">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-red-500" />
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">
              REAL-TIME EMERGENCY ALERTS DISPATCH
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-400 font-bold">
              {alerts.filter((a) => a.status === 'NEW').length} UNACKNOWLEDGED
            </span>
          </div>
          <p className="text-xs text-[#666] font-mono mt-0.5 font-sans">
            High-priority trigger feed for critical survivors, thermal anomalies, low-battery recalls, and structural breach
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#111] border border-[#222] text-[#ccc] py-1.5 px-2.5 rounded focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Info</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#111] border border-[#222] text-[#ccc] py-1.5 px-2.5 rounded focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          const isWarning = alert.severity === 'WARNING';

          return (
            <div
              key={alert.alertId}
              className={`p-4 rounded border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                alert.status === 'RESOLVED'
                  ? 'bg-[#080808] border-[#1a1a1a] opacity-50'
                  : isCritical
                  ? 'bg-[#0d0707] border-red-900/60'
                  : isWarning
                  ? 'bg-[#0e0a05] border-amber-900/50'
                  : 'bg-[#0a0a0a] border-[#222]'
              }`}
            >
              {/* Left Column: Details */}
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      isCritical
                        ? 'bg-red-600 text-white'
                        : isWarning
                        ? 'bg-orange-600 text-white'
                        : 'bg-[#222] text-white'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="font-bold text-white text-sm">{alert.alertId}</span>
                  <span className="text-[#444]">|</span>
                  <span className="text-red-400 font-bold">{alert.droneId}</span>
                  <span className="text-[#666] text-[10px]">{alert.createdAt}</span>
                </div>

                <p className="text-sm font-sans font-medium text-white leading-snug">
                  {alert.message}
                </p>

                <div className="p-2 bg-[#111] rounded border border-[#1a1a1a] text-[11px] text-[#ccc]">
                  <strong className="text-red-400">RECOMMENDED ACTION:</strong> {alert.recommendation}
                </div>
              </div>

              {/* Right Column: Status & Operational Controls */}
              <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#222]">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                    alert.status === 'NEW'
                      ? 'bg-red-950 text-red-400 border-red-800 animate-pulse'
                      : alert.status === 'ACKNOWLEDGED'
                      ? 'bg-amber-950 text-amber-400 border-amber-800'
                      : alert.status === 'ASSIGNED'
                      ? 'bg-[#161616] text-white border-[#333]'
                      : 'bg-[#111] text-[#666] border-[#222]'
                  }`}
                >
                  STATUS: {alert.status}
                </span>

                <div className="flex items-center gap-1.5">
                  {alert.status === 'NEW' && (
                    <button
                      onClick={() => handleUpdateStatus(alert.alertId, 'ACKNOWLEDGED')}
                      className="px-3 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-400 font-bold rounded transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.status === 'ACKNOWLEDGED' && (
                    <button
                      onClick={() => handleUpdateStatus(alert.alertId, 'ASSIGNED')}
                      className="px-3 py-1.5 bg-[#161616] hover:bg-[#222] border border-[#333] text-white font-bold rounded transition-colors"
                    >
                      Assign Team
                    </button>
                  )}
                  {alert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleUpdateStatus(alert.alertId, 'RESOLVED')}
                      className="px-3 py-1.5 bg-green-950 hover:bg-green-900 border border-green-800 text-green-400 font-bold rounded flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /> Resolve
                    </button>
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
