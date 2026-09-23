import React from 'react';
import { Cpu, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  imuConfidence: number;
  ppgConfidence: number;
  overallConfidence: number;
}

export const AiConfidence: React.FC<Props> = ({
  imuConfidence,
  ppgConfidence,
  overallConfidence
}) => {
  return (
    <div className="lift-card rounded-3xl p-4 space-y-3 border border-white/10">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="font-extrabold text-white flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-emerald-400" /> Multi-Model AI Confidence
        </span>
        <span className="text-emerald-400 font-extrabold">{overallConfidence}% Overall</span>
      </div>

      <div className="space-y-2 font-mono text-xs">
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-slate-300">
            <span>IMU Transformer Model</span>
            <span className="font-extrabold text-white">{imuConfidence}%</span>
          </div>
          <div className="w-full bg-[#000000] h-2 rounded-full overflow-hidden border border-white/10">
            <div className="bg-white h-full rounded-full transition-all duration-300" style={{ width: `${imuConfidence}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-slate-300">
            <span>MAX30102 PaPaGei PPG Model</span>
            <span className="font-extrabold text-white">{ppgConfidence}%</span>
          </div>
          <div className="w-full bg-[#000000] h-2 rounded-full overflow-hidden border border-white/10">
            <div className="bg-emerald-400 h-full rounded-full transition-all duration-300" style={{ width: `${ppgConfidence}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
