import React from 'react';
import { PersonalMovementProfile } from '../types/telemetry';
import { HeartPulse, Sparkles, RefreshCw, CheckCircle2, Sliders } from 'lucide-react';

interface Props {
  profile: PersonalMovementProfile;
  onStartLearning: () => void;
}

export const PersonalBaseline: React.FC<Props> = ({ profile, onStartLearning }) => {
  return (
    <div className="lift-card rounded-3xl p-5 space-y-4 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-white text-black font-black flex items-center justify-center">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">Personal Movement Profile</h3>
            <span className="text-[10px] font-mono text-slate-400">Adaptive Baseline Learning System</span>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full lift-dashed-tag text-xs font-mono font-extrabold text-emerald-400">
          {profile.normalMovementRangePct}% Match
        </span>
      </div>

      {profile.isLearningMode ? (
        <div className="bg-[#000000] border border-white/20 p-4 rounded-2xl space-y-2 font-mono text-xs">
          <div className="flex justify-between text-white font-extrabold">
            <span>Learning Movement Profile...</span>
            <span>{profile.learningProgressPct}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div className="bg-white h-full transition-all duration-300" style={{ width: `${profile.learningProgressPct}%` }} />
          </div>
        </div>
      ) : (
        <button
          onClick={onStartLearning}
          className="w-full py-3.5 bg-white text-black font-black rounded-full text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-slate-200 transition-all"
        >
          <Sparkles className="w-4 h-4 fill-black" /> LEARN MY MOVEMENT PROFILE
        </button>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs">
        <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl">
          <span className="text-[10px] text-slate-400 block font-semibold">CADENCE</span>
          <span className="text-sm font-black text-white mt-1 block">{profile.cadenceBpm} steps/min</span>
        </div>

        <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl">
          <span className="text-[10px] text-slate-400 block font-semibold">WALKING SPEED</span>
          <span className="text-sm font-black text-white mt-1 block">{profile.walkingSpeedMps} m/s</span>
        </div>

        <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl">
          <span className="text-[10px] text-slate-400 block font-semibold">ACCEL VAR</span>
          <span className="text-sm font-black text-white mt-1 block">±{profile.accelPatternVariance}g</span>
        </div>

        <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl">
          <span className="text-[10px] text-slate-400 block font-semibold">TURNING SPEED</span>
          <span className="text-sm font-black text-white mt-1 block">{profile.turningPatternDegSec}°/s</span>
        </div>

        <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl">
          <span className="text-[10px] text-slate-400 block font-semibold">SITTING DURATION</span>
          <span className="text-sm font-black text-white mt-1 block">{profile.sittingPatternDurationSec}s</span>
        </div>

        <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl">
          <span className="text-[10px] text-slate-400 block font-semibold">STAIR STEP MS</span>
          <span className="text-sm font-black text-white mt-1 block">{profile.stairPatternStepMs} ms</span>
        </div>
      </div>
    </div>
  );
};
