import React from 'react';
import { ObstacleState, GuidanceState } from '../types/telemetry';
import { Navigation, ArrowLeft, ArrowRight, ArrowUp, OctagonAlert, ShieldCheck } from 'lucide-react';

interface Props {
  obstacle: ObstacleState;
  guidance: GuidanceState;
}

export const ObstacleGuidance: React.FC<Props> = ({ obstacle, guidance }) => {
  const getGuidanceIcon = (dir: string) => {
    switch (dir) {
      case 'GO_LEFT':
        return <ArrowLeft className="w-8 h-8 text-cyan-400" />;
      case 'GO_RIGHT':
        return <ArrowRight className="w-8 h-8 text-cyan-400" />;
      case 'STOP':
        return <OctagonAlert className="w-8 h-8 text-red-500" />;
      default:
        return <ArrowUp className="w-8 h-8 text-emerald-400" />;
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold rounded">CRITICAL</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold rounded">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 bg-yellow-950 text-yellow-400 border border-yellow-800 text-[10px] font-bold rounded">LOW</span>;
      default:
        return <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold rounded">NONE / CLEAR</span>;
    }
  };

  return (
    <div className="bg-[#151C28] border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-950 border border-emerald-800 rounded-lg text-emerald-400">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
              Obstacle Classification & Guidance
            </h2>
            <p className="text-[11px] text-gray-400">Tactical Navigation Decision Engine</p>
          </div>
        </div>

        {getRiskBadge(obstacle.riskLevel)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Tactical Action Vector */}
        <div className="bg-[#0B0F17] border border-slate-800 p-3 rounded-lg flex flex-col items-center justify-center text-center">
          <div className="text-[10px] text-gray-400 font-semibold uppercase font-mono">Tactical Action</div>
          
          <div className="p-3 bg-[#151C28] rounded-full border border-slate-700 my-2">
            {getGuidanceIcon(guidance.direction)}
          </div>

          <div className="text-lg font-extrabold text-white">
            {guidance.direction.replace('_', ' ')}
          </div>

          <div className="text-xs text-gray-400 mt-1 flex items-center gap-1 font-mono">
            <span>Confidence:</span>
            <span className="text-cyan-400 font-bold">{guidance.confidence}%</span>
          </div>
        </div>

        {/* Free Space Analysis Card */}
        <div className="bg-[#0B0F17] border border-slate-800 p-3 rounded-lg space-y-2.5">
          <div className="text-xs font-semibold text-gray-300 flex items-center justify-between">
            <span>Free Space Corridor (mm)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Left Band</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-900 rounded overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded"
                    style={{ width: `${Math.min(100, (guidance.leftSpaceMm / 2000) * 100)}%` }}
                  />
                </div>
                <span className="text-white font-bold w-10 text-right">{guidance.leftSpaceMm}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Center Band</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-900 rounded overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded"
                    style={{ width: `${Math.min(100, (guidance.centerSpaceMm / 2000) * 100)}%` }}
                  />
                </div>
                <span className="text-white font-bold w-10 text-right">{guidance.centerSpaceMm}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Right Band</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-900 rounded overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded"
                    style={{ width: `${Math.min(100, (guidance.rightSpaceMm / 2000) * 100)}%` }}
                  />
                </div>
                <span className="text-white font-bold w-10 text-right">{guidance.rightSpaceMm}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-gray-400 flex justify-between font-mono">
            <span>Primary Obstacle:</span>
            <span className="text-amber-400 font-bold">{obstacle.direction} ({obstacle.distanceMm > 0 ? `${obstacle.distanceMm}mm` : '--'})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
