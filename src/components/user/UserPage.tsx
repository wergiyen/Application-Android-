import React, { useState, useEffect } from 'react';
import { SystemTelemetry, HapticProfileMode } from '../../types/telemetry';
import { talkbackService } from '../../services/talkback';
import { connectionService } from '../../services/connection';
import { IntelligencePage } from '../intelligence/IntelligencePage';
import { HealthPage } from '../health/HealthPage';
import { ActivityPage } from '../activity/ActivityPage';
import { PersonalizationPage } from '../personalization/PersonalizationPage';
import { EventsPage } from '../events/EventsPage';
import {
  Volume2, VolumeX, ShieldAlert, ShieldCheck, Navigation,
  Footprints, AlertTriangle, Battery, RefreshCw, Cpu,
  Radio, CheckCircle2, Siren, ArrowRight, Play, TrendingUp, Sparkles,
  Lock, Clock, Activity, Settings, SlidersHorizontal, MapPin, Phone,
  HeartPulse, Compass, BarChart2, Zap, ArrowUp, ArrowLeft, ArrowRight as ArrowRightIcon,
  ChevronDown, Sliders, Check, WifiOff, Bluetooth, Heart, BrainCircuit, Shield
} from 'lucide-react';

interface Props {
  telemetry: SystemTelemetry;
}

export type UserSubTab = 'home' | 'nav' | 'intelligence' | 'health' | 'activity' | 'personalization' | 'events' | 'emergency' | 'baseline' | 'history' | 'settings';

export const UserPage: React.FC<Props> = ({ telemetry }) => {
  const [activeSubTab, setActiveSubTab] = useState<UserSubTab>('home');
  const [talkBackEnabled, setTalkBackEnabled] = useState(true);
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);
  const [hapticIntensity, setHapticIntensity] = useState<number>(85);
  const [vibrationPattern, setVibrationPattern] = useState<string>('PULSE');
  const [audioVolume, setAudioVolume] = useState<number>(90);
  const [autoStartNav, setAutoStartNav] = useState<boolean>(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English (US)');

  // Auto-announce priority warnings
  useEffect(() => {
    if (!talkBackEnabled) return;

    if (telemetry.fall.requiresAlert || telemetry.fall.phase === 'EMERGENCY_ACTIVE') {
      talkbackService.speak('Emergency alert active! Location shared with family.', true);
    } else if (telemetry.obstacle.riskLevel === 'CRITICAL') {
      talkbackService.speak(`Critical obstacle detected ${telemetry.obstacle.distanceMm} millimeters ahead. Stop!`, true);
    } else if (telemetry.obstacle.riskLevel === 'MEDIUM') {
      talkbackService.speak(`Caution, obstacle on ${telemetry.obstacle.direction.toLowerCase()}`, false);
    }
  }, [telemetry.obstacle.riskLevel, telemetry.fall.phase, talkBackEnabled]);

  const handleTalkBackToggle = () => {
    const nextState = !talkBackEnabled;
    setTalkBackEnabled(nextState);
    talkbackService.setEnabled(nextState);
  };

  const handleTriggerSos = () => {
    setSosCountdown(10);
    talkbackService.speak('Emergency SOS initiated. Tap cancel within 10 seconds to stop.', true);
  };

  const handleCancelSos = () => {
    setSosCountdown(null);
    connectionService.cancelAlert();
    talkbackService.speak('Emergency SOS cancelled.', true);
  };

  const handleSelectHapticProfile = (prof: HapticProfileMode) => {
    connectionService.setHapticProfile(prof);
  };

  useEffect(() => {
    if (sosCountdown === null) return;
    if (sosCountdown <= 0) {
      setSosCountdown(null);
      connectionService.triggerEmergencyAlert();
      talkbackService.speak('Emergency alert transmitted to family members!', true);
      return;
    }
    const timer = setTimeout(() => {
      setSosCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [sosCountdown]);

  const isEmergency = telemetry.obstacle.riskLevel === 'CRITICAL' || telemetry.fall.phase !== 'NORMAL';

  return (
    <div className="space-y-4 font-sans text-slate-100 page-transition pb-20">
      
      {/* Top TalkBack Audio Control Card */}
      <div className="lift-card rounded-3xl p-3.5 bg-[#141416] border border-white/15 flex items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black ${
            talkBackEnabled ? 'bg-white text-black' : 'bg-rose-950 text-rose-300 border border-rose-700'
          }`}>
            {talkBackEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-xs font-extrabold text-white block">
              TalkBack Audio Voice: <span className={talkBackEnabled ? 'text-emerald-400 font-mono font-black' : 'text-rose-400 font-mono font-black'}>{talkBackEnabled ? 'ACTIVE (ON)' : 'CLOSED (OFF)'}</span>
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              {talkBackEnabled ? 'Voice reads obstacle alerts out loud' : 'Voice announcements disabled (silent mode)'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {talkBackEnabled && (
            <button
              onClick={() => talkbackService.testVoice()}
              title="Test TalkBack Audio Output"
              className="px-3 py-2 bg-white text-black rounded-2xl text-xs font-mono font-black hover:bg-slate-200 transition-all shadow flex items-center gap-1"
            >
              <Volume2 className="w-3.5 h-3.5" /> TEST
            </button>
          )}
          <button
            onClick={handleTalkBackToggle}
            className={`px-3.5 py-2 rounded-2xl text-xs font-mono font-black transition-all shrink-0 border ${
              talkBackEnabled
                ? 'bg-rose-950 text-rose-200 border-rose-700 hover:bg-rose-900 shadow'
                : 'bg-white text-black border-white shadow-xl hover:bg-slate-200'
            }`}
          >
            {talkBackEnabled ? 'CLOSE TALKBACK' : 'ENABLE TALKBACK'}
          </button>
        </div>
      </div>

      {/* Module Navigation Sub-Header */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'home', label: 'Home', icon: ShieldCheck },
          { id: 'nav', label: 'Navigation', icon: Compass },
          { id: 'intelligence', label: 'Intelligence', icon: BrainCircuit },
          { id: 'health', label: 'Health PPG', icon: Heart },
          { id: 'activity', label: 'Activity', icon: Footprints },
          { id: 'personalization', label: 'Personalize', icon: Sparkles },
          { id: 'events', label: 'Events', icon: Clock },
          { id: 'emergency', label: 'Emergency', icon: Siren },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as UserSubTab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-extrabold whitespace-nowrap transition-all duration-200 border flex items-center gap-1.5 ${
                isActive
                  ? 'bg-white text-black border-white shadow-lg scale-[1.02]'
                  : 'bg-[#141416] text-slate-400 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Priority Callout Banner */}
      <div className="lift-card rounded-3xl p-4 bg-gradient-to-r from-[#141416] to-[#1A1A1E] border border-white/10 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase text-slate-400 font-extrabold">STATUS DIRECTIVE</span>
          <h2 className="text-base font-extrabold text-white">What do I need to know right now?</h2>
        </div>
        <span className="px-3 py-1 rounded-full lift-dashed-tag text-xs font-mono font-extrabold text-white">
          {isEmergency ? 'ACTION NEEDED' : 'ALL SYSTEMS NORMAL'}
        </span>
      </div>

      {/* 1. HOME SCREEN */}
      {activeSubTab === 'home' && (
        <div className="space-y-4">
          <div className="lift-card rounded-3xl p-6 space-y-5 border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white text-black font-black flex items-center justify-center text-sm shadow">
                  N
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-wider">NEVISENSE V1</h3>
                  <span className="text-[10px] font-mono text-slate-400">AI Tactile Safety Engine</span>
                </div>
              </div>

              <div className={`px-4 py-1.5 rounded-full font-black text-xs flex items-center gap-2 shadow-lg ${
                telemetry.obstacle.riskLevel === 'CRITICAL' || telemetry.fall.requiresAlert
                  ? 'bg-rose-600 text-white animate-pulse'
                  : telemetry.obstacle.riskLevel === 'MEDIUM'
                  ? 'bg-amber-500 text-black'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                <span className="w-2.5 h-2.5 rounded-full bg-current" />
                <span>
                  {telemetry.fall.requiresAlert
                    ? 'FALL DETECTED'
                    : telemetry.obstacle.riskLevel === 'CRITICAL'
                    ? 'OBSTACLE DETECTED'
                    : 'YOU ARE SAFE'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="lift-card-inner rounded-2xl p-3 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Device</span>
                <span className="text-white font-extrabold flex items-center gap-1">
                  {telemetry.connected ? (
                    <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Connected</>
                  ) : (
                    <><WifiOff className="w-3.5 h-3.5 text-rose-400" /> Disconnected</>
                  )}
                </span>
              </div>

              <div className="lift-card-inner rounded-2xl p-3 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Battery</span>
                <span className="text-white font-extrabold flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-white" /> {telemetry.battery.percentage}%
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                talkbackService.speak('Tactile Navigation started. Scanning ahead.', true);
                setActiveSubTab('nav');
              }}
              className="w-full py-4 lift-button-primary flex items-center justify-center gap-2 text-sm font-black shadow-xl rounded-full"
            >
              <Navigation className="w-4 h-4 text-white fill-white" />
              <span>Start Navigation</span>
            </button>
          </div>
        </div>
      )}

      {/* Sub-Pages Routing */}
      {activeSubTab === 'nav' && (
        <div className="lift-card rounded-3xl p-6 space-y-5 border border-white/10">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-white" /> Navigation Guidance & Haptic Matrix
          </h3>
          <div className="lift-card-inner rounded-2xl p-4 space-y-2 border border-white/10">
            <p className="text-sm font-extrabold text-white font-mono">
              “{telemetry.obstacle.riskLevel === 'CRITICAL'
                ? `Critical obstacle detected ${telemetry.obstacle.distanceMm} mm ahead. Stop!`
                : `Path clear. Next obstacle ${telemetry.obstacle.distanceMm} mm ahead.`}”
            </p>
          </div>
        </div>
      )}

      {activeSubTab === 'intelligence' && <IntelligencePage telemetry={telemetry} />}
      {activeSubTab === 'health' && <HealthPage telemetry={telemetry} />}
      {activeSubTab === 'activity' && <ActivityPage telemetry={telemetry} />}
      {activeSubTab === 'personalization' && <PersonalizationPage telemetry={telemetry} />}
      {activeSubTab === 'events' && <EventsPage telemetry={telemetry} />}

      {/* Emergency Tab */}
      {activeSubTab === 'emergency' && (
        <div className="lift-card rounded-3xl p-6 space-y-5 border border-white/10">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Siren className="w-5 h-5 text-rose-500" /> Emergency Assistance Console
          </h3>
          <div className="lift-card-inner rounded-3xl p-6 text-center space-y-4 border border-rose-500/30 bg-rose-950/20">
            {sosCountdown !== null ? (
              <div className="space-y-3">
                <div className="w-20 h-20 bg-rose-600 text-white rounded-full mx-auto flex items-center justify-center text-3xl font-black animate-bounce shadow-2xl">
                  {sosCountdown}
                </div>
                <button onClick={handleCancelSos} className="w-full py-3.5 bg-slate-900 text-white font-extrabold rounded-full text-xs">
                  CANCEL EMERGENCY SOS
                </button>
              </div>
            ) : (
              <button onClick={handleTriggerSos} className="w-full py-6 bg-rose-600 text-white font-black text-lg rounded-full shadow-2xl">
                EMERGENCY SOS
              </button>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeSubTab === 'settings' && (
        <div className="lift-card rounded-3xl p-6 space-y-5 border border-white/10">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-white" /> Controls, Battery & Haptic Profiles
          </h3>

          <div className="space-y-4 text-xs font-mono">
            {/* Battery Intelligence Section */}
            <div className="lift-card-inner p-4 rounded-2xl space-y-3 border border-white/10 bg-[#12151E]">
              <div className="flex justify-between items-center text-white">
                <span className="font-extrabold flex items-center gap-2">
                  <Battery className="w-4 h-4 text-emerald-400" /> Battery Intelligence
                </span>
                <span className="text-emerald-400 font-black">{telemetry.battery.percentage}% ({telemetry.battery.voltageMv} mV)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div className="p-2 bg-[#000000] rounded-xl border border-white/10">
                  <span className="text-slate-400 block">Current Consumption</span>
                  <span className="text-white font-bold">{telemetry.battery.currentConsumptionMa} mA</span>
                </div>
                <div className="p-2 bg-[#000000] rounded-xl border border-white/10">
                  <span className="text-slate-400 block">Est. Time Remaining</span>
                  <span className="text-white font-bold">{Math.round(telemetry.battery.estimatedRemainingMins / 60)} hrs</span>
                </div>
                <div className="p-2 bg-[#000000] rounded-xl border border-white/10">
                  <span className="text-slate-400 block">BLE Status</span>
                  <span className="text-emerald-400 font-bold">{telemetry.battery.blePowerState}</span>
                </div>
                <div className="p-2 bg-[#000000] rounded-xl border border-white/10">
                  <span className="text-slate-400 block">GPS Mode</span>
                  <span className="text-cyan-400 font-bold">{telemetry.familyLocation.gpsPollingMode}</span>
                </div>
              </div>
            </div>

            {/* Haptic Profiles Control Card */}
            <div className="lift-card-inner p-4 rounded-2xl space-y-3 border border-white/10">
              <span className="font-extrabold text-white block">Haptic Vibration Profile Selector</span>
              <div className="grid grid-cols-3 gap-2">
                {(['STANDARD', 'INDOOR', 'OUTDOOR', 'QUIET', 'HIGH_ALERT', 'CUSTOM'] as HapticProfileMode[]).map(prof => (
                  <button
                    key={prof}
                    onClick={() => handleSelectHapticProfile(prof)}
                    className={`py-2 rounded-xl text-[10px] font-extrabold border transition-all ${
                      telemetry.hapticProfile.activeProfile === prof
                        ? 'bg-white text-black border-white shadow'
                        : 'bg-[#141416] text-slate-400 border-white/10'
                    }`}
                  >
                    {prof}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
