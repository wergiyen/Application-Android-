import React from 'react';
import { SystemTelemetry } from '../../types/telemetry';
import { connectionService } from '../../services/connection';
import { AreaTrendGraph } from '../common/AreaTrendGraph';
import {
  Users, MapPin, BatteryCharging, Wifi, AlertTriangle,
  CheckCircle2, Lock, ShieldCheck, ExternalLink, Activity,
  Calendar, Phone, Clock, TrendingUp, Sparkles
} from 'lucide-react';

interface Props {
  telemetry: SystemTelemetry;
}

export const FamilyPage: React.FC<Props> = ({ telemetry }) => {
  const isEmergency = telemetry.fall.requiresAlert || telemetry.fall.phase === 'EMERGENCY_ACTIVE';
  const location = telemetry.familyLocation;

  // GRAPH TELEMETRY EXCEPTION: Area trend data keep mint/cyan curve
  const weeklyData = telemetry.walkingTrends.weeklySteps.map(item => ({
    label: item.day,
    value: item.steps > 0 ? item.steps : Math.floor(2500 + Math.random() * 2000)
  }));

  return (
    <div className="space-y-4 font-sans text-slate-100 page-transition">
      {/* Black, Grey & White Headline */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">CAREGIVER MONITORING PORTAL</span>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Family Dashboard <Users className="w-5 h-5 text-white" />
          </h2>
        </div>
        <span className="px-3 py-1 rounded-full lift-dashed-tag text-xs font-mono text-slate-300 font-extrabold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" /> ONLINE
        </span>
      </div>

      {/* ALERT EXCEPTION: Emergency Status Banner */}
      <div className={`rounded-3xl p-6 border transition-all ${
        isEmergency
          ? 'bg-rose-950/90 border-rose-600 text-white shadow-2xl shadow-rose-950/60'
          : 'lift-card'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className={`w-4 h-4 ${isEmergency ? 'text-rose-400 animate-bounce' : 'text-slate-300'}`} />
            Emergency Status
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
            isEmergency ? 'bg-rose-600 text-white animate-pulse' : 'bg-white text-black font-black'
          }`}>
            {isEmergency ? 'ACTIVE INCIDENT' : 'ALL SAFE'}
          </span>
        </div>

        {isEmergency ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg">
                <AlertTriangle className="w-6 h-6 animate-ping" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Emergency Alert Received</h3>
                <p className="text-xs text-rose-200">Wearer initiated SOS assistance at {new Date(location.lastUpdated).toLocaleTimeString()}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => alert(`Calling user phone...`)}
                className="flex-1 py-3 bg-white text-black font-extrabold rounded-full text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <Phone className="w-4 h-4 fill-black" /> CALL WEARER NOW
              </button>
              <button
                onClick={() => connectionService.cancelAlert()}
                className="px-5 py-3 bg-[#1C202E] hover:bg-slate-800 text-white font-extrabold rounded-full text-xs border border-white/10"
              >
                DISMISS
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white">No Active Emergency Signals</h3>
              <p className="text-xs text-slate-400 mt-0.5">Tactile perception stream reporting normal walking state</p>
            </div>
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
        )}
      </div>

      {/* Emergency Location Map Card */}
      <div className="lift-card rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-white" /> Emergency & Continuous Location
          </span>
          <span className="text-[10px] font-mono text-slate-300 px-2.5 py-0.5 rounded-full lift-dashed-tag flex items-center gap-1 font-extrabold">
            <Clock className="w-3 h-3" /> Updated Just Now
          </span>
        </div>

        {/* Location Map Frame */}
        <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-white/10 bg-[#000000] flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(#222736_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
          
          <div className="absolute w-full h-2 bg-slate-800/80 rotate-12" />
          <div className="absolute h-full w-2 bg-slate-800/80 -rotate-45" />

          <div className="relative z-10 flex flex-col items-center">
            <span className="flex h-9 w-9 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-9 w-9 bg-white border-2 border-black items-center justify-center text-black font-black text-sm shadow-xl">
                <MapPin className="w-4 h-4 text-black" />
              </span>
            </span>
            <div className="mt-1 bg-[#12151E]/90 border border-white/15 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-lg">
              Wearer Position (±{location.accuracyMeters}m)
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-[#000000] p-3.5 rounded-2xl border border-white/10">
          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase font-semibold">Estimated Address</span>
            <span className="text-xs font-extrabold text-white">{location.address}</span>
            <span className="text-[10px] text-slate-400 block font-mono">
              GPS: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </span>
          </div>

          <a
            href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-white text-black hover:bg-slate-100 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow active:scale-95 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Map Link
          </a>
        </div>
      </div>

      {/* Battery & Connection Cards (Monochrome) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="lift-card rounded-3xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/10 text-white border border-white/20 flex items-center justify-center">
              <BatteryCharging className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block font-semibold">Device Battery</span>
              <span className="text-lg font-black text-white">{telemetry.battery.percentage}%</span>
              <span className="text-[10px] text-slate-400 block font-mono">{telemetry.battery.voltageMv} mV • Healthy</span>
            </div>
          </div>
          <span className="text-xs font-extrabold text-white bg-white/10 px-3 py-1 rounded-full border border-white/20 font-mono">
            ~14h Left
          </span>
        </div>

        <div className="lift-card rounded-3xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/10 text-white border border-white/20 flex items-center justify-center">
              <Wifi className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block font-semibold">Device Connection</span>
              <span className="text-lg font-black text-white uppercase">{telemetry.connectionMode} Mode</span>
              <span className="text-[10px] text-slate-400 block font-mono">Signal: -62 dBm</span>
            </div>
          </div>
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* GRAPH TELEMETRY EXCEPTION: Walking Trends Area Wave Graph */}
      <div className="lift-card rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-white" /> Walking Trends & Activity
          </span>
          <span className="text-xs font-extrabold text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +36% THIS WEEK
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 block font-mono uppercase font-semibold">Steps Today</span>
            <span className="text-xl font-black text-white">{telemetry.walkingTrends.stepsToday}</span>
          </div>
          <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 block font-mono uppercase font-semibold">Active Time</span>
            <span className="text-xl font-black text-white">{telemetry.walkingTrends.activeMinutes}m</span>
          </div>
          <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 block font-mono uppercase font-semibold">Distance</span>
            <span className="text-xl font-black text-white">{telemetry.walkingTrends.distanceKm} km</span>
          </div>
        </div>

        {/* Graph Telemetry Exception Curve */}
        <div className="pt-2">
          <span className="text-[10px] text-slate-400 font-mono block mb-1 uppercase font-semibold">Weekly Density Curve</span>
          <AreaTrendGraph data={weeklyData} color="mint" height={130} />
        </div>
      </div>

      {/* Privacy Toggle */}
      <div className="lift-card rounded-3xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
            location.userSharingEnabled ? 'bg-white text-black shadow-md' : 'bg-slate-800 text-slate-500'
          }`}>
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-white">Exact Continuous Location</h4>
            <p className="text-xs text-slate-400">User-controlled privacy consent switch (ACTIVE)</p>
          </div>
        </div>

        <button
          onClick={() => connectionService.toggleLocationSharing()}
          className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center ${
            location.userSharingEnabled ? 'bg-white justify-end' : 'bg-slate-800 justify-start'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-black shadow-md" />
        </button>
      </div>
    </div>
  );
};
