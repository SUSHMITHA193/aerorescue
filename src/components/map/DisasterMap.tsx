import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, Navigation, ShieldAlert, Heart, Eye,
  Info, CheckCircle, RefreshCw, X, AlertTriangle
} from 'lucide-react';
import { commandStore } from '../../services/store';
import { Drone, Survivor, Hazard, Waypoint } from '../../types';

interface DisasterMapProps {
  onSelectSurvivor?: (survivor: Survivor) => void;
  onSelectHazard?: (hazard: Hazard) => void;
  onSelectDrone?: (drone: Drone) => void;
  selectedEntity?: { type: 'survivor' | 'hazard' | 'drone'; id: string } | null;
  heightClass?: string;
}

export const DisasterMap: React.FC<DisasterMapProps> = ({
  onSelectSurvivor,
  onSelectHazard,
  onSelectDrone,
  selectedEntity,
  heightClass = 'h-full min-h-[500px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    drones: L.LayerGroup;
    survivors: L.LayerGroup;
    hazards: L.LayerGroup;
    zones: L.LayerGroup;
    waypoints: L.LayerGroup;
    paths: L.LayerGroup;
  } | null>(null);

  const [activeLayers, setActiveLayers] = useState({
    drones: true,
    survivors: true,
    hazards: true,
    zones: true,
    waypoints: true,
    flightPaths: true,
  });

  const [inspectedSurvivor, setInspectedSurvivor] = useState<Survivor | null>(null);
  const [inspectedHazard, setInspectedHazard] = useState<Hazard | null>(null);
  const [inspectedDrone, setInspectedDrone] = useState<Drone | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Chennai Flood Center: Lat 13.030, Lng 80.225
    const map = L.map(mapContainerRef.current, {
      center: [13.030, 80.225],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // CartoDB Dark Matter Tiles (ideal for mission control command center)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Layer groups
    const droneGroup = L.layerGroup().addTo(map);
    const survivorGroup = L.layerGroup().addTo(map);
    const hazardGroup = L.layerGroup().addTo(map);
    const zoneGroup = L.layerGroup().addTo(map);
    const waypointGroup = L.layerGroup().addTo(map);
    const pathGroup = L.layerGroup().addTo(map);

    layersRef.current = {
      drones: droneGroup,
      survivors: survivorGroup,
      hazards: hazardGroup,
      zones: zoneGroup,
      waypoints: waypointGroup,
      paths: pathGroup,
    };

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Layers when store changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layersRef.current;
    if (!map || !layers) return;

    // 1. Drones Layer
    layers.drones.clearLayers();
    if (activeLayers.drones) {
      commandStore.drones.forEach((drone) => {
        const isSelected = selectedEntity?.type === 'drone' && selectedEntity.id === drone.droneId;
        const iconHtml = `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-9 h-9 rounded-full bg-sky-500/30 animate-ping"></div>
            <div class="w-8 h-8 rounded-full ${
              drone.status === 'ACTIVE' ? 'bg-sky-500 text-black' : 'bg-slate-700 text-white'
            } border-2 ${isSelected ? 'border-amber-400 ring-2 ring-amber-400' : 'border-white'} flex items-center justify-center font-bold text-[10px] shadow-lg transform transition-transform" style="transform: rotate(${drone.heading}deg)">
              ▲
            </div>
            <div class="absolute -bottom-4 bg-slate-950/90 text-sky-300 font-mono text-[9px] px-1 rounded border border-slate-700 whitespace-nowrap">
              ${drone.droneId} • ${drone.battery}%
            </div>
          </div>
        `;
        const marker = L.marker([drone.latitude, drone.longitude], {
          icon: L.divIcon({ html: iconHtml, className: 'drone-marker', iconSize: [36, 36], iconAnchor: [18, 18] }),
        });
        marker.on('click', () => {
          setInspectedDrone(drone);
          setInspectedSurvivor(null);
          setInspectedHazard(null);
          if (onSelectDrone) onSelectDrone(drone);
        });
        marker.addTo(layers.drones);
      });
    }

    // 2. Survivors Layer
    layers.survivors.clearLayers();
    if (activeLayers.survivors) {
      commandStore.survivors.forEach((survivor) => {
        const isRescued = survivor.rescueStatus === 'Rescued';
        const isCritical = survivor.priorityLevel === 'CRITICAL';
        const isHigh = survivor.priorityLevel === 'HIGH';

        const ringColor = isRescued
          ? 'border-emerald-400 bg-emerald-950/90 text-emerald-400'
          : isCritical
          ? 'border-rose-500 bg-rose-950/90 text-rose-300 ring-2 ring-rose-500 animate-pulse'
          : isHigh
          ? 'border-amber-500 bg-amber-950/90 text-amber-300 ring-1 ring-amber-400'
          : 'border-emerald-500 bg-emerald-950/90 text-emerald-300';

        const iconHtml = `
          <div class="relative flex items-center justify-center group cursor-pointer">
            <div class="w-6 h-6 rounded-full border-2 ${ringColor} flex items-center justify-center font-bold text-[11px] shadow-md">
              ${isRescued ? '✓' : '👤'}
            </div>
            <div class="absolute -bottom-4 bg-slate-900/90 font-mono text-[8px] text-slate-200 px-1 rounded border border-slate-700 whitespace-nowrap">
              ${survivor.survivorId} (${survivor.priorityScore})
            </div>
          </div>
        `;

        const marker = L.marker([survivor.latitude, survivor.longitude], {
          icon: L.divIcon({ html: iconHtml, className: 'survivor-marker', iconSize: [26, 26], iconAnchor: [13, 13] }),
        });

        marker.on('click', () => {
          setInspectedSurvivor(survivor);
          setInspectedHazard(null);
          setInspectedDrone(null);
          if (onSelectSurvivor) onSelectSurvivor(survivor);
        });
        marker.addTo(layers.survivors);
      });
    }

    // 3. Hazards Layer
    layers.hazards.clearLayers();
    if (activeLayers.hazards) {
      commandStore.hazards.forEach((hazard) => {
        if (hazard.status === 'Resolved') return;

        let iconSymbol = '⚠️';
        let colorClass = 'border-amber-500 bg-amber-950/90 text-amber-300';
        let circleColor = '#f59e0b';

        if (hazard.hazardType.includes('Fire')) {
          iconSymbol = '🔥';
          colorClass = 'border-rose-600 bg-rose-950/90 text-rose-300';
          circleColor = '#ef4444';
        } else if (hazard.hazardType.includes('Flood')) {
          iconSymbol = '🌊';
          colorClass = 'border-sky-500 bg-sky-950/90 text-sky-300';
          circleColor = '#0ea5e9';
        } else if (hazard.hazardType.includes('Electrical')) {
          iconSymbol = '⚡';
          colorClass = 'border-yellow-400 bg-yellow-950/90 text-yellow-300';
          circleColor = '#eab308';
        } else if (hazard.hazardType.includes('structure') || hazard.hazardType.includes('building')) {
          iconSymbol = '🏚️';
          colorClass = 'border-orange-500 bg-orange-950/90 text-orange-300';
          circleColor = '#f97316';
        } else if (hazard.hazardType.includes('Landslide')) {
          iconSymbol = '⛰️';
          colorClass = 'border-purple-500 bg-purple-950/90 text-purple-300';
          circleColor = '#a855f7';
        } else {
          iconSymbol = '🪨';
          colorClass = 'border-stone-500 bg-stone-900/90 text-stone-300';
          circleColor = '#78716c';
        }

        // Draw danger radius circle
        L.circle([hazard.latitude, hazard.longitude], {
          radius: hazard.radiusMeters,
          color: circleColor,
          weight: 1,
          opacity: 0.8,
          fillColor: circleColor,
          fillOpacity: 0.15,
          dashArray: '4, 4',
        }).addTo(layers.hazards);

        const iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-6 h-6 rounded-full border-2 ${colorClass} flex items-center justify-center text-[10px] shadow-lg">
              ${iconSymbol}
            </div>
            <div class="absolute -bottom-4 bg-slate-900/90 font-mono text-[8px] text-slate-300 px-1 rounded border border-slate-700 whitespace-nowrap">
              ${hazard.hazardType}
            </div>
          </div>
        `;

        const marker = L.marker([hazard.latitude, hazard.longitude], {
          icon: L.divIcon({ html: iconHtml, className: 'hazard-marker', iconSize: [26, 26], iconAnchor: [13, 13] }),
        });

        marker.on('click', () => {
          setInspectedHazard(hazard);
          setInspectedSurvivor(null);
          setInspectedDrone(null);
          if (onSelectHazard) onSelectHazard(hazard);
        });
        marker.addTo(layers.hazards);
      });
    }

    // 4. Search Zones Layer
    layers.zones.clearLayers();
    if (activeLayers.zones) {
      // Zone A (Adyar Basin)
      L.polygon(
        [
          [13.045, 80.200],
          [13.055, 80.245],
          [13.020, 80.260],
          [13.005, 80.210],
        ],
        {
          color: '#38bdf8',
          weight: 2,
          opacity: 0.6,
          fillColor: '#0284c7',
          fillOpacity: 0.08,
          dashArray: '5, 5',
        }
      ).addTo(layers.zones);

      // Safe Corridor Evacuation Line
      L.polyline(
        [
          [13.048, 80.205],
          [13.030, 80.220],
          [13.010, 80.240],
        ],
        {
          color: '#10b981',
          weight: 3,
          opacity: 0.8,
          dashArray: '8, 4',
        }
      ).addTo(layers.zones);
    }

    // 5. Waypoints Layer
    layers.waypoints.clearLayers();
    if (activeLayers.waypoints) {
      commandStore.waypoints.forEach((wp) => {
        const wpIcon = `
          <div class="w-5 h-5 rounded-full bg-slate-900 border border-sky-400 text-sky-300 flex items-center justify-center font-mono text-[9px] font-bold">
            ${wp.sequence}
          </div>
        `;
        L.marker([wp.latitude, wp.longitude], {
          icon: L.divIcon({ html: wpIcon, className: 'wp-marker', iconSize: [20, 20], iconAnchor: [10, 10] }),
        }).addTo(layers.waypoints);
      });

      // Connect waypoints with flight line
      const wpPoints = commandStore.waypoints.map((w) => [w.latitude, w.longitude] as [number, number]);
      if (wpPoints.length > 1) {
        L.polyline(wpPoints, {
          color: '#38bdf8',
          weight: 1.5,
          opacity: 0.5,
          dashArray: '4, 4',
        }).addTo(layers.waypoints);
      }
    }
  }, [activeLayers, selectedEntity]);

  return (
    <div className={`relative w-full ${heightClass} bg-[#080808] overflow-hidden flex flex-col`}>
      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full flex-1 z-0" />

      {/* Map Control Overlay Toolbar */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 bg-[#0a0a0a]/90 backdrop-blur-md border border-[#222] p-1.5 rounded text-xs font-mono shadow-2xl">
        <span className="text-[10px] text-[#555] uppercase px-1 flex items-center gap-1 font-bold">
          <Layers className="w-3 h-3 text-red-500" />
          LAYERS:
        </span>
        <button
          onClick={() => setActiveLayers((p) => ({ ...p, drones: !p.drones }))}
          className={`px-2 py-0.5 rounded transition-colors ${
            activeLayers.drones ? 'bg-[#1a1a1a] border border-[#333] text-white font-bold' : 'bg-[#0f0f0f] text-[#555]'
          }`}
        >
          ▲ Drones ({commandStore.drones.length})
        </button>
        <button
          onClick={() => setActiveLayers((p) => ({ ...p, survivors: !p.survivors }))}
          className={`px-2 py-0.5 rounded transition-colors ${
            activeLayers.survivors ? 'bg-[#1a1a1a] border border-[#333] text-green-400 font-bold' : 'bg-[#0f0f0f] text-[#555]'
          }`}
        >
          👤 Survivors ({commandStore.survivors.length})
        </button>
        <button
          onClick={() => setActiveLayers((p) => ({ ...p, hazards: !p.hazards }))}
          className={`px-2 py-0.5 rounded transition-colors ${
            activeLayers.hazards ? 'bg-[#1a1a1a] border border-[#333] text-orange-400 font-bold' : 'bg-[#0f0f0f] text-[#555]'
          }`}
        >
          ⚠️ Hazards ({commandStore.hazards.filter((h) => h.status !== 'Resolved').length})
        </button>
        <button
          onClick={() => setActiveLayers((p) => ({ ...p, zones: !p.zones }))}
          className={`px-2 py-0.5 rounded transition-colors ${
            activeLayers.zones ? 'bg-[#1a1a1a] border border-[#333] text-red-400 font-bold' : 'bg-[#0f0f0f] text-[#555]'
          }`}
        >
          Corridors
        </button>
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([13.030, 80.225], 13);
            }
          }}
          className="p-1 rounded bg-[#111] hover:bg-[#1a1a1a] text-[#777] hover:text-white transition-colors"
          title="Recenter Map"
        >
          <Navigation className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-10 bg-[#0a0a0a]/90 backdrop-blur-md border border-[#222] p-2.5 rounded text-[10px] font-mono text-[#aaa] shadow-2xl space-y-1">
        <div className="font-bold text-[#555] uppercase border-b border-[#222] pb-1 mb-1 tracking-wider">MAP LEGEND</div>
        <div className="flex items-center gap-2">
          <span className="text-green-500 font-bold">🟢</span> <span>Survivor (Critical/High Priority)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-red-500 font-bold">🔴</span> <span>Active Fire / Thermal Anomaly</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-blue-400 font-bold">🔵</span> <span>Inundated Flood Surge Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-orange-400 font-bold">🟠</span> <span>Damaged / Unstable Structure</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 font-bold">🟡</span> <span>Exposed 11kV Electrical Line</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-500 font-bold">---</span> <span>Safe Evacuation Waterway</span>
        </div>
      </div>

      {/* Detailed Inspection Drawer / Modal for Survivor */}
      {inspectedSurvivor && (
        <div className="absolute top-3 right-3 bottom-3 w-80 md:w-96 z-20 bg-[#0a0a0a]/95 backdrop-blur-lg border border-[#222] rounded shadow-2xl p-4 overflow-y-auto flex flex-col text-[#e0e0e0] animate-in fade-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-[#222] pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-green-950 border border-green-800 text-green-400 font-mono font-bold text-xs">
                SURVIVOR {inspectedSurvivor.survivorId}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                  inspectedSurvivor.priorityLevel === 'CRITICAL'
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : 'bg-orange-950 text-orange-400 border border-orange-800'
                }`}
              >
                {inspectedSurvivor.priorityLevel}
              </span>
            </div>
            <button
              onClick={() => setInspectedSurvivor(null)}
              className="p-1 text-[#666] hover:text-white rounded hover:bg-[#1a1a1a]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dual Visual Evidence (RGB Camera + Thermal Heat Signature) */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <div className="text-[10px] font-mono text-[#777] mb-1 flex items-center gap-1">
                <Eye className="w-3 h-3 text-red-500" /> RGB CAM EVIDENCE
              </div>
              <img
                src={inspectedSurvivor.imageUrl}
                alt="Survivor RGB Recon"
                className="w-full h-28 object-cover rounded border border-[#222]"
              />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#777] mb-1 flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-500" /> THERMAL FLIR
              </div>
              <img
                src={inspectedSurvivor.thermalImageUrl}
                alt="Survivor Thermal FLIR"
                className="w-full h-28 object-cover rounded border border-[#222]"
              />
            </div>
          </div>

          {/* AI Priority Scoring Breakdown */}
          <div className="bg-[#111] border border-[#222] rounded p-2.5 mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-[#888] font-bold uppercase">
                AI-GENERATED PRIORITY SCORE
              </span>
              <span className="text-base font-mono font-black text-red-500">
                {inspectedSurvivor.priorityScore}/100
              </span>
            </div>
            <div className="w-full bg-[#1a1a1a] h-1.5 rounded overflow-hidden mb-2">
              <div
                className="h-full bg-red-600"
                style={{ width: `${inspectedSurvivor.priorityScore}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-[#777]">
              <div>Confidence: <span className="text-white font-bold">{inspectedSurvivor.confidence}%</span></div>
              <div>Estimated People: <span className="text-white font-bold">{inspectedSurvivor.peopleCount}</span></div>
              <div>Detected By: <span className="text-[#bbb] font-bold">{inspectedSurvivor.droneId}</span></div>
              <div>Time: <span className="text-[#888]">{inspectedSurvivor.detectedAt}</span></div>
            </div>
          </div>

          {/* GPS Coordinates & Hazards */}
          <div className="space-y-2 text-xs font-mono mb-3">
            <div className="p-2 bg-[#111] rounded border border-[#222] text-[11px]">
              <span className="text-[#666]">LAT:</span> {inspectedSurvivor.latitude.toFixed(5)}°N{' '}
              <span className="text-[#666] ml-2">LON:</span> {inspectedSurvivor.longitude.toFixed(5)}°E
            </div>

            <div>
              <div className="text-[10px] text-orange-400 font-bold mb-1 uppercase tracking-wider">PROXIMATE HAZARDS:</div>
              <div className="space-y-1">
                {inspectedSurvivor.nearbyHazards.map((hz, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] text-[#ccc] bg-[#111] px-2 py-1 rounded border border-[#222]">
                    <AlertTriangle className="w-3 h-3 text-orange-400 shrink-0" />
                    <span>{hz}</span>
                  </div>
                ))}
              </div>
            </div>

            {inspectedSurvivor.notes && (
              <div className="text-[11px] text-[#aaa] italic bg-[#111] p-2 rounded border border-[#222]">
                "{inspectedSurvivor.notes}"
              </div>
            )}
          </div>

          {/* Human-in-the-loop Override Actions */}
          <div className="mt-auto pt-3 border-t border-[#222] space-y-2">
            <div className="text-[10px] font-mono text-[#555] uppercase font-bold tracking-wider">
              Rescue Status Action:
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
              <button
                onClick={() => {
                  commandStore.updateSurvivorStatus(inspectedSurvivor.survivorId, 'Verified');
                  setInspectedSurvivor({ ...inspectedSurvivor, rescueStatus: 'Verified' });
                }}
                className={`py-1.5 rounded border text-center font-bold transition-colors ${
                  inspectedSurvivor.rescueStatus === 'Verified'
                    ? 'bg-[#222] text-white border-[#444]'
                    : 'bg-[#111] border-[#222] text-[#888] hover:text-white'
                }`}
              >
                Mark Verified
              </button>
              <button
                onClick={() => {
                  commandStore.updateSurvivorStatus(inspectedSurvivor.survivorId, 'Rescue Assigned');
                  setInspectedSurvivor({ ...inspectedSurvivor, rescueStatus: 'Rescue Assigned' });
                }}
                className={`py-1.5 rounded border text-center font-bold transition-colors ${
                  inspectedSurvivor.rescueStatus === 'Rescue Assigned'
                    ? 'bg-orange-950 text-orange-400 border-orange-800'
                    : 'bg-[#111] border-[#222] text-[#888] hover:text-white'
                }`}
              >
                Assign Rescue
              </button>
              <button
                onClick={() => {
                  commandStore.updateSurvivorStatus(inspectedSurvivor.survivorId, 'Rescued');
                  setInspectedSurvivor({ ...inspectedSurvivor, rescueStatus: 'Rescued' });
                }}
                className={`py-1.5 rounded border text-center font-bold col-span-2 transition-colors ${
                  inspectedSurvivor.rescueStatus === 'Rescued'
                    ? 'bg-green-600 text-white border-green-500'
                    : 'bg-green-950 border-green-800 text-green-400 hover:bg-green-900'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> Mark Rescued & Safe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Drawer for Hazard */}
      {inspectedHazard && (
        <div className="absolute top-3 right-3 bottom-3 w-80 md:w-96 z-20 bg-[#0a0a0a]/95 backdrop-blur-lg border border-[#222] rounded shadow-2xl p-4 overflow-y-auto flex flex-col text-[#e0e0e0] animate-in fade-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-[#222] pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-orange-950 border border-orange-800 text-orange-400 font-mono font-bold text-xs">
                {inspectedHazard.hazardId}
              </span>
              <span className="text-xs font-bold text-white uppercase font-mono">{inspectedHazard.hazardType}</span>
            </div>
            <button
              onClick={() => setInspectedHazard(null)}
              className="p-1 text-[#666] hover:text-white rounded hover:bg-[#1a1a1a]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <img
            src={inspectedHazard.imageUrl}
            alt={inspectedHazard.hazardType}
            className="w-full h-36 object-cover rounded border border-[#222] mb-3"
          />

          <div className="space-y-2 text-xs font-mono mb-3">
            <div className="flex items-center justify-between bg-[#111] p-2 rounded border border-[#1a1a1a]">
              <span className="text-[#666]">Severity Level:</span>
              <span className={`font-bold px-2 py-0.5 rounded ${
                inspectedHazard.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-orange-950 text-orange-400'
              }`}>
                {inspectedHazard.severity}
              </span>
            </div>
            <div className="flex items-center justify-between bg-[#111] p-2 rounded border border-[#1a1a1a]">
              <span className="text-[#666]">AI Confidence:</span>
              <span className="font-bold text-red-500">{inspectedHazard.confidence}%</span>
            </div>
            <div className="flex items-center justify-between bg-[#111] p-2 rounded border border-[#1a1a1a]">
              <span className="text-[#666]">Detecting Drone:</span>
              <span className="font-bold text-white">{inspectedHazard.droneId}</span>
            </div>
            <div className="flex items-center justify-between bg-[#111] p-2 rounded border border-[#1a1a1a]">
              <span className="text-[#666]">Hazard Danger Radius:</span>
              <span className="font-bold text-orange-400">{inspectedHazard.radiusMeters} meters</span>
            </div>

            <div className="p-2.5 bg-[#111] border-l-2 border-orange-500 rounded-r">
              <div className="text-[10px] text-orange-400 font-bold uppercase mb-1">Recommended Response:</div>
              <div className="text-[11px] text-[#ccc]">{inspectedHazard.recommendedResponse}</div>
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-[#222] flex gap-2">
            <button
              onClick={() => {
                commandStore.updateHazardStatus(inspectedHazard.hazardId, 'Human Verified');
                setInspectedHazard({ ...inspectedHazard, status: 'Human Verified' });
              }}
              className="flex-1 py-1.5 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] text-white rounded font-mono text-xs font-bold transition-colors"
            >
              Verify Hazard
            </button>
            <button
              onClick={() => {
                commandStore.updateHazardStatus(inspectedHazard.hazardId, 'Resolved');
                setInspectedHazard({ ...inspectedHazard, status: 'Resolved' });
              }}
              className="flex-1 py-1.5 bg-green-950 hover:bg-green-900 border border-green-800 text-green-400 rounded font-mono text-xs font-bold transition-colors"
            >
              Mark Resolved
            </button>
          </div>
        </div>
      )}

      {/* Inspection Drawer for Drone */}
      {inspectedDrone && (
        <div className="absolute top-3 right-3 bottom-3 w-80 md:w-96 z-20 bg-[#0a0a0a]/95 backdrop-blur-lg border border-[#222] rounded shadow-2xl p-4 overflow-y-auto flex flex-col text-[#e0e0e0] animate-in fade-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-[#222] pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#161616] border border-[#333] text-white font-mono font-bold text-xs">
                {inspectedDrone.droneId}
              </span>
              <span className="text-xs font-bold text-white font-mono">{inspectedDrone.name}</span>
            </div>
            <button
              onClick={() => setInspectedDrone(null)}
              className="p-1 text-[#666] hover:text-white rounded hover:bg-[#1a1a1a]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] font-mono text-[#666] mb-2">{inspectedDrone.model}</div>

          <div className="space-y-2 text-xs font-mono mb-4">
            <div className="flex items-center justify-between bg-[#111] p-2 rounded border border-[#1a1a1a]">
              <span className="text-[#666]">Status / Mode:</span>
              <span className="text-green-500 font-bold">{inspectedDrone.status} • {inspectedDrone.navMode}</span>
            </div>
            <div className="flex items-center justify-between bg-[#111] p-2 rounded border border-[#1a1a1a]">
              <span className="text-[#666]">Battery Level:</span>
              <span className={`font-bold ${inspectedDrone.battery > 30 ? 'text-green-500' : 'text-red-500'}`}>
                {inspectedDrone.battery}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#111] p-2 rounded border border-[#1a1a1a]">
                <div className="text-[#666] text-[10px]">ALTITUDE</div>
                <div className="text-white font-bold text-sm">{inspectedDrone.altitude} m</div>
              </div>
              <div className="bg-[#111] p-2 rounded border border-[#1a1a1a]">
                <div className="text-[#666] text-[10px]">SPEED</div>
                <div className="text-white font-bold text-sm">{inspectedDrone.speed} m/s</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#111] p-2 rounded border border-[#1a1a1a]">
                <div className="text-[#666] text-[10px]">GPS FIX</div>
                <div className="text-green-500 font-bold text-xs">{inspectedDrone.gpsStatus}</div>
              </div>
              <div className="bg-[#111] p-2 rounded border border-[#1a1a1a]">
                <div className="text-[#666] text-[10px]">IMU STATUS</div>
                <div className="text-green-500 font-bold text-xs">{inspectedDrone.imuStatus}</div>
              </div>
            </div>
            <div className="bg-[#111] p-2 rounded border border-[#1a1a1a] text-[11px]">
              <div className="text-[#666] text-[10px]">ASSIGNED ZONE</div>
              <div className="text-white">{inspectedDrone.zone}</div>
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-[#222] flex gap-2">
            <button
              onClick={() => {
                commandStore.setDroneStatus(inspectedDrone.droneId, 'RETURNING');
                commandStore.setDroneNavMode(inspectedDrone.droneId, 'RETURN_TO_HOME');
                setInspectedDrone({ ...inspectedDrone, status: 'RETURNING', navMode: 'RETURN_TO_HOME' });
              }}
              className="flex-1 py-1.5 bg-orange-950 hover:bg-orange-900 border border-orange-800 text-orange-400 rounded font-mono text-xs font-bold transition-colors"
            >
              Return Home (RTH)
            </button>
            <button
              onClick={() => {
                const nextStatus = inspectedDrone.status === 'ACTIVE' ? 'STANDBY' : 'ACTIVE';
                commandStore.setDroneStatus(inspectedDrone.droneId, nextStatus);
                setInspectedDrone({ ...inspectedDrone, status: nextStatus });
              }}
              className="flex-1 py-1.5 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] text-white rounded font-mono text-xs font-bold transition-colors"
            >
              {inspectedDrone.status === 'ACTIVE' ? 'Pause Mission' : 'Resume Mission'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
