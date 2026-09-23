import React, { useState, useEffect } from 'react';
import { ConnectionMode, BatteryData } from '../types/telemetry';
import { Wifi, Bluetooth, BatteryCharging, Radio, Settings, CheckCircle2, XCircle, Cpu, Volume2, VolumeX } from 'lucide-react';
import { talkbackService } from '../services/talkback';

interface Props {
  connected: boolean;
  mode: ConnectionMode;
  battery: BatteryData;
  onModeChange: (mode: ConnectionMode, ip?: string) => void;
}

export const Header: React.FC<Props> = ({ connected, mode, battery, onModeChange }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [ipInput, setIpInput] = useState('192.168.4.1');
  const [talkBackEnabled, setTalkBackEnabled] = useState(talkbackService.isEnabled());

  useEffect(() => {
    const unsub = talkbackService.subscribe((enabled) => {
      setTalkBackEnabled(enabled);
    });
    return () => unsub();
  }, []);

  const handleToggleTalkBack = () => {
    if (talkBackEnabled) {
      talkbackService.stop();
    } else {
      talkbackService.setEnabled(true);
    }
  };

  return (
    <header className="bg-[#000000]/95 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 px-4 pt-16 pb-4 sm:pt-8 sm:pb-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center font-black text-lg shadow-md">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight">NEVISENSE</h1>
              <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full lift-dashed-tag">
                V1 PERCEPTION
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Tactile AI Perception Wearable</p>
          </div>
        </div>

        {/* Status Indicators (Monochrome with Alert status exception) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* TalkBack Close / Toggle Button */}
          <button
            onClick={handleToggleTalkBack}
            title={talkBackEnabled ? "Click to Close / Turn Off TalkBack Voice" : "Click to Enable TalkBack Voice"}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-mono font-extrabold transition-all border ${
              talkBackEnabled
                ? 'bg-white text-black border-white shadow-md'
                : 'bg-rose-950 text-rose-300 border-rose-700'
            }`}
          >
            {talkBackEnabled ? <Volume2 className="w-3.5 h-3.5 text-black" /> : <VolumeX className="w-3.5 h-3.5 text-rose-300" />}
            <span className="text-[10px] font-mono font-black uppercase tracking-tight">
              {talkBackEnabled ? 'TalkBack ON' : 'TalkBack OFF'}
            </span>
          </button>

          {/* Battery pill */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-[#12151E] border border-white/10 rounded-full text-xs font-mono text-white">
            <BatteryCharging className={`w-3.5 h-3.5 ${battery.percentage <= 20 ? 'text-rose-500' : 'text-slate-300'}`} />
            <span className="font-extrabold text-[11px]">{battery.percentage}%</span>
          </div>

          {/* Connection mode button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-extrabold transition-all border ${
              connected
                ? 'bg-white text-black border-white shadow'
                : 'bg-rose-950 text-rose-300 border-rose-700'
            }`}
          >
            {mode === 'wifi' ? <Wifi className="w-3.5 h-3.5" /> : mode === 'ble' ? <Bluetooth className="w-3.5 h-3.5" /> : mode === 'serial' ? <Cpu className="w-3.5 h-3.5" /> : <Radio className="w-3.5 h-3.5" />}
            <span className="uppercase font-mono text-[10px] tracking-wider">{mode}</span>
          </button>
        </div>
      </div>

      {/* Protocol Selector Box */}
      {showSettings && (
        <div className="max-w-4xl mx-auto mt-3 p-4 bg-[#12151E] border border-white/15 rounded-3xl space-y-3 font-sans shadow-2xl animate-slideUpFade">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-slate-300" /> Protocol & Connection Mode
            </span>
            <button onClick={() => setShowSettings(false)} className="text-xs text-slate-400 hover:text-white font-bold">Close</button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => { onModeChange('wifi', ipInput); setShowSettings(false); }}
              className={`p-3 rounded-2xl border text-xs font-extrabold flex flex-col items-center gap-1.5 transition-all ${
                mode === 'wifi' ? 'bg-white text-black border-white shadow-lg' : 'bg-[#000000] text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              <Wifi className="w-4 h-4" /> Wi-Fi SoftAP
            </button>

            <button
              onClick={() => { onModeChange('ble'); setShowSettings(false); }}
              className={`p-3 rounded-2xl border text-xs font-extrabold flex flex-col items-center gap-1.5 transition-all ${
                mode === 'ble' ? 'bg-white text-black border-white shadow-lg' : 'bg-[#000000] text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              <Bluetooth className="w-4 h-4" /> Bluetooth BLE
            </button>

            <button
              onClick={() => { onModeChange('serial'); setShowSettings(false); }}
              className={`p-3 rounded-2xl border text-xs font-extrabold flex flex-col items-center gap-1.5 transition-all ${
                mode === 'serial' ? 'bg-white text-black border-white shadow-lg' : 'bg-[#000000] text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              <Cpu className="w-4 h-4" /> USB Serial
            </button>

            <button
              onClick={() => { onModeChange('demo'); setShowSettings(false); }}
              className={`p-3 rounded-2xl border text-xs font-extrabold flex flex-col items-center gap-1.5 transition-all ${
                mode === 'demo' ? 'bg-white text-black border-white shadow-lg' : 'bg-[#000000] text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              <Radio className="w-4 h-4" /> Demo Mode
            </button>
          </div>

          {mode === 'wifi' && (
            <div className="pt-1 flex gap-2 font-mono">
              <input
                type="text"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                placeholder="192.168.4.1"
                className="flex-1 bg-[#000000] border border-white/15 px-3 py-2 rounded-2xl text-xs text-white"
              />
              <button
                onClick={() => onModeChange('wifi', ipInput)}
                className="px-5 py-2 bg-white text-black rounded-2xl text-xs font-extrabold font-sans shadow"
              >
                Connect IP
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
