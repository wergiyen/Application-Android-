import React from 'react';
import { SystemTelemetry } from '../../types/telemetry';
import { ActivityRecognition } from '../ActivityRecognition';
import { AiConfidence } from '../AiConfidence';
import { SensorFusion } from '../SensorFusion';
import { BrainCircuit, ShieldCheck, HeartPulse, Footprints, Zap } from 'lucide-react';

interface Props {
  telemetry: SystemTelemetry;
}

export const IntelligencePage: React.FC<Props> = ({ telemetry }) => {
  const intel = telemetry.intelligence;

  return (
    <div className="space-y-4 font-sans text-slate-100 page-transition pb-20">
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">SAFETY & AI CONSOLE</span>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Intelligence Dashboard <BrainCircuit className="w-5 h-5 text-white" />
          </h2>
        </div>
        <span className="px-3 py-1 rounded-full lift-dashed-tag text-xs font-mono text-emerald-400 font-extrabold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> {intel.overallSafetyState}
        </span>
      </div>

      {/* Main Intelligence Overview Card */}
      <div className="lift-card rounded-3xl p-5 space-y-4 border border-white/10">
        <h3 className="text-xs font-mono uppercase text-slate-400 font-extrabold">Overall AI Safety Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
          <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl">
            <span className="text-[10px] text-slate-400 block font-semibold">CURRENT ACTIVITY</span>
            <span className="text-sm font-black text-white mt-1 block uppercase">{intel.currentActivity}</span>
          </div>

          <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl">
            <span className="text-[10px] text-slate-400 block font-semibold">BASELINE MATCH</span>
            <span className="text-sm font-black text-emerald-400 mt-1 block">{intel.personalBaselineMatch}%</span>
          </div>

          <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl">
            <span className="text-[10px] text-slate-400 block font-semibold">FALL STATUS</span>
            <span className="text-xs font-extrabold text-white mt-1 block">{intel.fallStatus}</span>
          </div>

          <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl">
            <span className="text-[10px] text-slate-400 block font-semibold">PPG AI STATUS</span>
            <span className="text-xs font-extrabold text-cyan-400 mt-1 block truncate">{intel.ppgAiStatus}</span>
          </div>
        </div>
      </div>

      {/* IMU AI Recognition Component */}
      <ActivityRecognition
        activity={telemetry.imu.motionState}
        confidence={telemetry.imu.confidence}
        stability={intel.movementStability}
        modelVersion={telemetry.imu.modelVersion}
      />

      {/* Multi-Sensor Fusion Matrix */}
      <SensorFusion fusion={telemetry.sensorFusion} />

      {/* AI Confidence Meter */}
      <AiConfidence
        imuConfidence={telemetry.imu.confidence}
        ppgConfidence={telemetry.ppg.confidence}
        overallConfidence={telemetry.aiMetrics.confidence}
      />
    </div>
  );
};
