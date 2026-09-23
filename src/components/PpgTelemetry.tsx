import React from 'react';
import { PpgData } from '../types/telemetry';
import { Heart, Activity, Zap, CheckCircle2, AlertCircle, Cpu, ShieldCheck } from 'lucide-react';

interface Props {
  ppg: PpgData;
}

export const PpgTelemetry: React.FC<Props> = ({ ppg }) => {
  return (
    <div className="lift-card rounded-3xl p-5 space-y-4 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-rose-950/80 border border-rose-700 text-rose-400 flex items-center justify-center font-bold">
            <Heart className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">MAX30102 PPG Health System</h3>
            <span className="text-[10px] font-mono text-slate-400">PaPaGei 512-D Embedding Engine</span>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full lift-dashed-tag text-xs font-mono font-extrabold text-emerald-400 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> {ppg.confidence}% CONF
        </span>
      </div>

      {/* Main Vital Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
        <div className="bg-[#000000] border border-white/10 p-3.5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 block font-semibold">HEART RATE</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-white">{ppg.heartRateBpm}</span>
            <span className="text-[10px] text-rose-400 font-bold">BPM</span>
          </div>
          <span className="text-[9px] text-emerald-400 mt-1">Normal Resting</span>
        </div>

        <div className="bg-[#000000] border border-white/10 p-3.5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 block font-semibold">BLOOD OXYGEN (SpO₂)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-white">{ppg.spO2Percentage}</span>
            <span className="text-[10px] text-cyan-400 font-bold">%</span>
          </div>
          <span className="text-[9px] text-emerald-400 mt-1">Optimal Saturation</span>
        </div>

        <div className="bg-[#000000] border border-white/10 p-3.5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 block font-semibold">PPG QUALITY</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-white">{ppg.ppgSignalQuality}</span>
            <span className="text-[10px] text-slate-400 font-bold">%</span>
          </div>
          <span className="text-[9px] text-emerald-400 mt-1">{ppg.contactQuality} Contact</span>
        </div>

        <div className="bg-[#000000] border border-white/10 p-3.5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 block font-semibold">MOTION ARTIFACT</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black text-white">{ppg.motionInterference}</span>
          </div>
          <span className="text-[9px] text-slate-400 mt-1">Latency {ppg.inferenceLatencyMs}ms</span>
        </div>
      </div>

      {/* PaPaGei 512-D Pipeline Summary Box */}
      <div className="bg-[#000000] border border-white/10 p-3.5 rounded-2xl text-xs font-mono space-y-1.5">
        <div className="flex justify-between items-center text-slate-400 text-[11px]">
          <span>PaPaGei Pipeline Embedding</span>
          <span className="text-white font-extrabold">{ppg.modelName}</span>
        </div>
        <div className="p-2 bg-[#12151E] rounded-xl text-[10px] text-slate-300 flex justify-between items-center">
          <span>512-D Feature Vector: <code className="text-emerald-400 font-bold">{ppg.embedding512dHash}</code></span>
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold">VALID</span>
        </div>
      </div>
    </div>
  );
};
