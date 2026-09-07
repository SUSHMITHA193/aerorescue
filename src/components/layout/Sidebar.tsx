import React from 'react';
import { 
  LayoutDashboard, Map, Plane, Eye, Users, AlertOctagon, 
  Compass, Navigation, Bell, FileText, BarChart3, Settings,
  Activity, Radio
} from 'lucide-react';
import { commandStore } from '../../services/store';

export type NavigationPage = 
  | 'overview'
  | 'map'
  | 'drones'
  | 'detections'
  | 'survivors'
  | 'hazards'
  | 'missions'
  | 'navigation'
  | 'alerts'
  | 'reports'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  currentPage: NavigationPage;
  onSelectPage: (page: NavigationPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  collapsed,
  onToggleCollapse,
}) => {
  const activeDronesCount = commandStore.drones.filter((d) => d.status === 'ACTIVE').length;
  const criticalSurvivorsCount = commandStore.survivors.filter(
    (s) => s.priorityLevel === 'CRITICAL' && s.rescueStatus !== 'Rescued'
  ).length;
  const newAlertsCount = commandStore.alerts.filter((a) => a.status === 'NEW').length;
  const criticalHazardsCount = commandStore.hazards.filter(
    (h) => h.severity === 'CRITICAL' && h.status !== 'Resolved'
  ).length;

  const navItems: { id: NavigationPage; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number | string; badgeColor?: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'map', label: 'Live Disaster Map', icon: Map },
    { id: 'drones', label: 'Drone Fleet', icon: Plane, badge: `${activeDronesCount} Live`, badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-700/50' },
    { id: 'detections', label: 'AI Detection Center', icon: Eye, badge: commandStore.detections.length, badgeColor: 'bg-sky-950 text-sky-400 border-sky-800' },
    { id: 'survivors', label: 'Survivors', icon: Users, badge: criticalSurvivorsCount > 0 ? `${criticalSurvivorsCount} Crit` : undefined, badgeColor: 'bg-rose-950 text-rose-300 border-rose-600' },
    { id: 'hazards', label: 'Hazard Intelligence', icon: AlertOctagon, badge: criticalHazardsCount > 0 ? criticalHazardsCount : undefined, badgeColor: 'bg-amber-950 text-amber-300 border-amber-600' },
    { id: 'missions', label: 'Mission Planning', icon: Compass },
    { id: 'navigation', label: 'Autonomous Nav', icon: Navigation },
    { id: 'alerts', label: 'Emergency Alerts', icon: Bell, badge: newAlertsCount > 0 ? newAlertsCount : undefined, badgeColor: 'bg-rose-600 text-white font-bold' },
    { id: 'reports', label: 'SITREP Reports', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Edge AI Gateway', icon: Settings },
  ];

  return (
    <aside
      className={`bg-[#080808] border-r border-[#222] flex flex-col justify-between transition-all duration-200 shrink-0 ${
        collapsed ? 'w-16 p-2' : 'w-56 p-3.5'
      }`}
    >
      {/* Navigation List */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {!collapsed && (
          <div className="text-[10px] text-[#555] uppercase font-bold tracking-widest px-2">
            Navigation
          </div>
        )}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1a1a1a] text-white border border-[#333] shadow-inner font-semibold'
                    : 'text-[#666] hover:text-[#e0e0e0] hover:bg-[#121212] border border-transparent'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-red-500' : 'text-[#666]'
                  }`}
                />
                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden text-left">
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono shrink-0 ml-1 font-bold ${
                          isActive
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-[#161616] text-[#888] border border-[#262626]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Mission Stats Box (Geometric Balance design) */}
      {!collapsed && (
        <div className="mt-3 p-3.5 bg-[#0c0c0c] border border-[#1a1a1a] rounded-lg">
          <div className="text-[10px] text-[#555] uppercase font-bold mb-2 tracking-tighter">
            MISSION STATS
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-[11px] text-[#888]">Survivors Detected</div>
              <div className="text-base font-mono font-bold text-white leading-none mt-0.5">
                {commandStore.survivors.length}{' '}
                <span className="text-[10px] text-red-500 font-bold tracking-wider">
                  +{criticalSurvivorsCount} PRIORITY
                </span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#888]">Area Surveyed</div>
              <div className="text-base font-mono font-bold text-white leading-none mt-0.5">
                12.6 <span className="text-[10px] font-normal text-[#555]">KM²</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#888]">Drones Active</div>
              <div className="text-base font-mono font-bold text-white leading-none mt-0.5">
                0{activeDronesCount}{' '}
                <span className="text-[10px] text-green-500 font-bold tracking-wider">
                  NOMINAL
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collapse/Expand button */}
      <div className="pt-2 mt-2 border-t border-[#1a1a1a]">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center py-1 rounded hover:bg-[#141414] text-[#555] hover:text-[#999] text-[10px] font-mono transition-colors tracking-widest uppercase"
        >
          {collapsed ? '→' : '← Collapse'}
        </button>
      </div>
    </aside>
  );
};
