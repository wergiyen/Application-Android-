import React from 'react';
import { SystemTelemetry } from '../../types/telemetry';
import { PpgTelemetry } from '../PpgTelemetry';
import { PpgWaveform } from '../PpgWaveform';
import { Heart, Activity, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  telemetry: SystemTelemetry;
}

export const HealthPage: React.FC<Props> = ({ telemetry }) => {
  return (
    <div className="space-y-4 font-sans text-slate-100 page-transition pb-20">
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">MAX30102 PPG HEALTH CONSOLE</span>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Cardio & Vitals <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
          </h2>
        </div>
        <span className="px-3 py-1 rounded-full lift-dashed-tag text-xs font-mono text-emerald-400 font-extrabold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> PPG AI ACTIVE
        </span>
      </div>

      {/* PPG Telemetry Dashboard Card */}
      <PpgTelemetry ppg={telemetry.ppg} />

      {/* Real-time PPG Dual Waveform Trace */}
      <div className="lift-card rounded-3xl p-5 space-y-3 border border-white/10">
        <h3 className="text-xs font-mono text-slate-400 uppercase font-extrabold">Real-Time PPG Signal Traces</h3>
        <PpgWaveform
          redWave={telemetry.ppg.rawRedWaveform}
          irWave={telemetry.ppg.rawIrWaveform}
          height={140}
        />
      </div>
    </div>
  );
};
