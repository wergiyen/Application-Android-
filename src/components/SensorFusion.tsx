import React from 'react';
import { SensorFusionState } from '../types/telemetry';
import { Layers, Activity, Heart, MapPin, ShieldCheck } from 'lucide-react';

interface Props {
  fusion: SensorFusionState;
}

export const SensorFusion: React.FC<Props> = ({ fusion }) => {
  return (
    <div className="lift-card rounded-3xl p-5 space-y-4 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-white text-black font-black flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">Multi-Sensor Fusion Engine</h3>
            <span className="text-[10px] font-mono text-slate-400">IMU + PPG + Phone GPS + Firmware</span>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full lift-dashed-tag text-xs font-mono font-extrabold text-emerald-400">
          Fused Score: {fusion.fusedSafetyScore}%
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-white" /> IMU
          </span>
          <span className="font-extrabold text-white">{fusion.imuConfidencePct}%</span>
        </div>

        <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Heart className="w-3.5 h-3.5 text-rose-400" /> PPG
          </span>
          <span className="font-extrabold text-white">{fusion.ppgConfidencePct}%</span>
        </div>

        <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Phone GPS
          </span>
          <span className="font-extrabold text-white">{fusion.gpsConfidencePct}%</span>
        </div>

        <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Firmware
          </span>
          <span className="font-extrabold text-white">{fusion.firmwareEventConfidencePct}%</span>
        </div>
      </div>

      <div className="bg-[#000000] border border-white/10 p-3.5 rounded-2xl flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400 font-semibold">Synthesized Context:</span>
        <span className="px-3 py-1 rounded-full bg-white text-black font-black uppercase text-[11px]">
          {fusion.fusedContext}
        </span>
      </div>
    </div>
  );
};
