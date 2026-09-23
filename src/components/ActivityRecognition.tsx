import React from 'react';
import { ExtendedMotionState } from '../types/telemetry';
import { Footprints, Activity, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  activity: ExtendedMotionState;
  confidence: number;
  stability: number;
  modelVersion: string;
}

export const ActivityRecognition: React.FC<Props> = ({
  activity,
  confidence,
  stability,
  modelVersion
}) => {
  const getActivityBadge = (act: ExtendedMotionState) => {
    switch (act) {
      case 'WALKING': return { label: 'Normal Walking', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'FAST_WALKING': return { label: 'Fast Walking', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      case 'RUNNING': return { label: 'Running', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'SITTING': return { label: 'Sitting', color: 'bg-slate-700/40 text-slate-300 border-slate-600' };
      case 'FAST_SITTING': return { label: 'Fast Sitting / Drop', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'BENDING': return { label: 'Bending Down', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'STAIRS': return { label: 'Stairs Ascent/Descent', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'FALL_LIKE': return { label: 'Fall-like Motion', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' };
      case 'DEVICE_DROP': return { label: 'Device Drop', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      default: return { label: 'Standing', color: 'bg-white/10 text-white border-white/20' };
    }
  };

  const badge = getActivityBadge(activity);

  return (
    <div className="lift-card rounded-3xl p-5 space-y-4 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-white text-black font-black flex items-center justify-center">
            <Footprints className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">IMU AI Activity Recognition</h3>
            <span className="text-[10px] font-mono text-slate-400">{modelVersion}</span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold border ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 font-mono text-xs">
        <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl">
          <span className="text-[10px] text-slate-400 block font-semibold">AI CONFIDENCE</span>
          <span className="text-xl font-black text-white mt-0.5 block">{confidence}%</span>
        </div>
        <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl">
          <span className="text-[10px] text-slate-400 block font-semibold">GAIT STABILITY</span>
          <span className="text-xl font-black text-emerald-400 mt-0.5 block">{stability}%</span>
        </div>
      </div>
    </div>
  );
};
