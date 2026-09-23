import React from 'react';
import { SystemTelemetry } from '../../types/telemetry';
import { connectionService } from '../../services/connection';
import { PersonalBaseline } from '../PersonalBaseline';
import { Sparkles, Sliders, HeartPulse, CheckCircle2 } from 'lucide-react';

interface Props {
  telemetry: SystemTelemetry;
}

export const PersonalizationPage: React.FC<Props> = ({ telemetry }) => {
  const handleStartLearning = () => {
    connectionService.startLearningProfile();
  };

  return (
    <div className="space-y-4 font-sans text-slate-100 page-transition pb-20">
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">ADAPTIVE GAIT & MOVEMENT LEARNING</span>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Personalization Portal <Sparkles className="w-5 h-5 text-white" />
          </h2>
        </div>
        <span className="px-3 py-1 rounded-full lift-dashed-tag text-xs font-mono text-emerald-400 font-extrabold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> PROFILE ACTIVE
        </span>
      </div>

      <PersonalBaseline
        profile={telemetry.personalization}
        onStartLearning={handleStartLearning}
      />

      <div className="lift-card rounded-3xl p-5 space-y-3 border border-white/10 font-mono text-xs">
        <h3 className="text-xs text-slate-400 uppercase font-extrabold">Movement Range Calibration</h3>
        <p className="text-slate-300 font-sans text-xs">
          The Personalization Engine continually fine-tunes baseline thresholds for cadence, acceleration variance, and sitting/bending patterns to eliminate false alarm notifications.
        </p>
        <div className="p-3 bg-[#000000] rounded-2xl border border-white/10 flex justify-between items-center text-[11px]">
          <span className="text-slate-400">Profile Version: <strong className="text-white">{telemetry.aiMetrics.personalProfileVersion}</strong></span>
          <span className="text-slate-400">Last Trained: <strong className="text-white">{telemetry.personalization.profileLastTrainedDate}</strong></span>
        </div>
      </div>
    </div>
  );
};
