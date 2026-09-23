import React from 'react';
import { SystemTelemetry } from '../../types/telemetry';
import { AreaTrendGraph } from '../common/AreaTrendGraph';
import { Footprints, Activity, BarChart2, TrendingUp, Sparkles } from 'lucide-react';

interface Props {
  telemetry: SystemTelemetry;
}

export const ActivityPage: React.FC<Props> = ({ telemetry }) => {
  const trends = telemetry.walkingTrends;

  const stepsData = trends.weeklySteps.map(item => ({
    label: item.day,
    value: item.steps
  }));

  return (
    <div className="space-y-4 font-sans text-slate-100 page-transition pb-20">
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">GAIT & MOVEMENT ANALYTICS</span>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Activity & Motion <Footprints className="w-5 h-5 text-white" />
          </h2>
        </div>
        <span className="px-3 py-1 rounded-full lift-dashed-tag text-xs font-mono text-slate-300 font-extrabold flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> +24% TARGET
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
        <div className="lift-card p-3.5 rounded-2xl">
          <span className="text-[10px] text-slate-400 block font-semibold">STEPS TODAY</span>
          <span className="text-xl font-black text-white mt-1 block">{trends.stepsToday}</span>
        </div>

        <div className="lift-card p-3.5 rounded-2xl">
          <span className="text-[10px] text-slate-400 block font-semibold">ACTIVE TIME</span>
          <span className="text-xl font-black text-white mt-1 block">{trends.activeMinutes} mins</span>
        </div>

        <div className="lift-card p-3.5 rounded-2xl">
          <span className="text-[10px] text-slate-400 block font-semibold">DISTANCE</span>
          <span className="text-xl font-black text-white mt-1 block">{trends.distanceKm} km</span>
        </div>

        <div className="lift-card p-3.5 rounded-2xl">
          <span className="text-[10px] text-slate-400 block font-semibold">GAIT STATE</span>
          <span className="text-xs font-extrabold text-emerald-400 mt-1 block uppercase">{telemetry.imu.motionState}</span>
        </div>
      </div>

      <div className="lift-card rounded-3xl p-5 space-y-3 border border-white/10">
        <h3 className="text-xs font-mono text-slate-400 uppercase font-extrabold">Weekly Step Activity Curve</h3>
        <AreaTrendGraph data={stepsData} color="mint" height={130} />
      </div>
    </div>
  );
};
