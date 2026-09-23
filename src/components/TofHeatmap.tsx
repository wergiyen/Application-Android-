import React, { useState } from 'react';
import { TofData } from '../types/telemetry';
import { Layers, ShieldAlert, Maximize2 } from 'lucide-react';

interface Props {
  tof: TofData;
}

export const TofHeatmap: React.FC<Props> = ({ tof }) => {
  const [viewMode, setViewMode] = useState<'grid' | '3d'>('grid');
  const [selectedZone, setSelectedZone] = useState<number | null>(null);

  // High-performance flat colors without heavy CSS gradients/shadows for older devices
  const getZoneColor = (distMm: number) => {
    if (distMm <= 0) return 'bg-[#1E293B] border-slate-700 text-slate-500';
    if (distMm < 300) return 'bg-red-600 border-red-400 text-white font-bold';
    if (distMm < 700) return 'bg-orange-600 border-orange-400 text-white font-semibold';
    if (distMm < 1400) return 'bg-amber-600 border-amber-400 text-yellow-100';
    return 'bg-[#0F172A] border-slate-700 text-cyan-300';
  };

  return (
    <div className="bg-[#151C28] border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-950 border border-cyan-800 rounded-lg text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
              VL53L5CX ToF Matrix <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">8x8</span>
            </h2>
            <p className="text-[11px] text-gray-400">64-Zone Distance Telemetry</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#0B0F17] p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-none ${
              viewMode === 'grid' ? 'bg-cyan-600 text-white' : 'text-gray-400'
            }`}
          >
            2D Heatmap
          </button>
          <button
            onClick={() => setViewMode('3d')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-none ${
              viewMode === '3d' ? 'bg-cyan-600 text-white' : 'text-gray-400'
            }`}
          >
            Spatial Map
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 mb-4 font-mono">
        <div className="bg-[#0B0F17] border border-slate-800 p-2.5 rounded-lg">
          <div className="text-[10px] text-gray-400 uppercase font-semibold">Closest Zone</div>
          <div className="text-lg font-black text-rose-400 mt-0.5">
            {tof.minZone.distance > 0 ? tof.minZone.distance : '--'} <span className="text-xs text-gray-400 font-normal">mm</span>
          </div>
          <div className="text-[10px] text-gray-500">Zone #{tof.minZone.index}</div>
        </div>

        <div className="bg-[#0B0F17] border border-slate-800 p-2.5 rounded-lg">
          <div className="text-[10px] text-gray-400 uppercase font-semibold">Avg Distance</div>
          <div className="text-lg font-black text-cyan-400 mt-0.5">
            {tof.avgDistance > 0 ? tof.avgDistance : '--'} <span className="text-xs text-gray-400 font-normal">mm</span>
          </div>
          <div className="text-[10px] text-gray-500">Field of View</div>
        </div>

        <div className="bg-[#0B0F17] border border-slate-800 p-2.5 rounded-lg">
          <div className="text-[10px] text-gray-400 uppercase font-semibold">Hazard Status</div>
          <div className={`text-xs font-bold mt-1.5 flex items-center gap-1 ${
            tof.minZone.distance > 0 && tof.minZone.distance < 300 ? 'text-red-400' : tof.minZone.distance < 700 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            <ShieldAlert className="w-3.5 h-3.5 inline" />
            {tof.minZone.distance <= 0 ? 'NO DATA' : tof.minZone.distance < 300 ? 'CRITICAL' : tof.minZone.distance < 700 ? 'WARNING' : 'CLEAR'}
          </div>
        </div>
      </div>

      {/* Flat Grid Heatmap */}
      {viewMode === 'grid' ? (
        <div className="space-y-2">
          <div className="grid grid-cols-8 gap-1 aspect-square bg-[#0B0F17] p-1.5 rounded-lg border border-slate-800">
            {tof.zones.map((dist, idx) => {
              const isSelected = selectedZone === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedZone(idx)}
                  className={`aspect-square rounded border text-[10px] sm:text-xs font-mono flex items-center justify-center p-0.5 transition-none ${getZoneColor(
                    dist
                  )} ${isSelected ? 'ring-2 ring-white z-10' : ''}`}
                >
                  <span className="font-bold tracking-tighter truncate w-full text-center">
                    {dist > 0 ? dist : '--'}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedZone !== null && (
            <div className="bg-[#0B0F17] border border-slate-800 p-2 rounded-lg flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-gray-300">Selected Zone <strong className="text-white">#{selectedZone}</strong></span>
              </div>
              <div className="text-cyan-400 font-bold">
                {tof.zones[selectedZone] > 0 ? `${tof.zones[selectedZone]} mm` : '--'}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Flat 3D Lateral Column View */
        <div className="bg-[#0B0F17] p-3 rounded-lg border border-slate-800 space-y-2 font-mono">
          {[0, 1, 2, 3, 4, 5, 6, 7].map(col => {
            const colDistances = [0, 1, 2, 3, 4, 5, 6, 7].map(r => tof.zones[r * 8 + col]);
            const colMin = Math.min(...colDistances);
            const pct = Math.max(5, Math.min(100, (colMin / 2500) * 100));

            return (
              <div key={col} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>Col #{col + 1}</span>
                  <span className="text-cyan-300">{colMin > 0 ? `${colMin} mm` : '--'}</span>
                </div>
                <div className="h-2.5 bg-gray-900 rounded overflow-hidden p-0 border border-slate-800">
                  <div
                    className={`h-full ${
                      colMin > 0 && colMin < 400 ? 'bg-red-600' : colMin < 800 ? 'bg-orange-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${colMin > 0 ? pct : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Flat Legend */}
      <div className="flex items-center justify-between text-[10px] text-gray-400 mt-3 pt-2 border-t border-slate-800 font-mono">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-xs bg-red-600" /> &lt;300mm
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-xs bg-orange-600" /> &lt;700mm
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-xs bg-cyan-900" /> &gt;1400mm
        </span>
      </div>
    </div>
  );
};
