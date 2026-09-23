import React, { useEffect, useState } from 'react';
import { FallState } from '../types/telemetry';
import { AlertTriangle, Bell, BellOff, ShieldAlert, CheckCircle2, Siren } from 'lucide-react';

interface Props {
  fall: FallState;
  onCancelAlert: () => Promise<void>;
}

export const FallDetector: React.FC<Props> = ({ fall, onCancelAlert }) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [manualSos, setManualSos] = useState<boolean>(false);

  const isAlerting = fall.phase !== 'NORMAL' || fall.requiresAlert || manualSos;

  useEffect(() => {
    if (!isAlerting || !soundEnabled) return;

    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const startTime = audioContext.currentTime;
    [0, 0.35, 0.7].forEach((offset) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, startTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.35, startTime + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + offset + 0.18);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(startTime + offset);
      oscillator.stop(startTime + offset + 0.2);
    });

    const closeTimer = window.setTimeout(() => {
      void audioContext.close();
    }, 1200);
    return () => {
      window.clearTimeout(closeTimer);
      void audioContext.close();
    };
  }, [isAlerting, soundEnabled]);

  return (
    <div className={`border rounded-xl p-4 transition-none ${
      isAlerting ? 'bg-red-950 border-red-600' : 'bg-[#151C28] border-slate-800'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg border ${
            isAlerting ? 'bg-red-600 text-white border-red-400' : 'bg-rose-950 text-rose-400 border-rose-900'
          }`}>
            <Siren className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
              Fall Detection & Safety
            </h2>
            <p className="text-[11px] text-gray-400">IMU Impact & Emergency Monitoring</p>
          </div>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-lg border transition-none ${
            soundEnabled ? 'bg-cyan-950 border-cyan-800 text-cyan-400' : 'bg-slate-800 border-slate-700 text-gray-400'
          }`}
          title="Toggle Alert Audio"
        >
          {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
        </button>
      </div>

      {isAlerting ? (
        <div className="bg-red-900 border border-red-600 p-3 rounded-lg space-y-2 font-sans text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-red-100 font-extrabold">
              <AlertTriangle className="w-4 h-4 text-red-300" />
              EMERGENCY ALERT TRIGGERED
            </div>
            <span className="px-2 py-0.5 bg-red-700 text-white text-[10px] font-bold rounded">
              {manualSos ? 'MANUAL SOS' : fall.phase}
            </span>
          </div>

          <p className="text-red-200">
            High impact/fall incident detected. Haptic buzzer and emergency signal active.
          </p>

          {fall.recoveryMsRemaining > 0 && (
            <div className="bg-red-950 p-2 rounded border border-red-800 flex items-center justify-between font-mono text-xs">
              <span className="text-red-300">Auto Cancel Timer:</span>
              <span className="text-white font-bold">{(fall.recoveryMsRemaining / 1000).toFixed(1)}s</span>
            </div>
          )}

          <div className="pt-1">
            <button
              onClick={async () => {
                setManualSos(false);
                try {
                  await onCancelAlert();
                } catch (error) {
                  console.warn('Unable to cancel device alert', error);
                }
              }}
              className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded text-xs"
            >
              Cancel Alert / Stand Down
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#0B0F17] border border-slate-800 p-3 rounded-lg space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-gray-300">System Status:</span>
            </div>
            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold rounded">
              NORMAL & SECURE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono">
            <div className="bg-[#151C28] p-2 rounded border border-slate-800">
              <span className="text-gray-500 block text-[9px] uppercase font-sans">IMU Impact Threshold</span>
                <span className="text-cyan-300 font-bold">1.50 g X delta</span>
            </div>
            <div className="bg-[#151C28] p-2 rounded border border-slate-800">
              <span className="text-gray-500 block text-[9px] uppercase font-sans">Recovery Window</span>
              <span className="text-cyan-300 font-bold">5.0 sec</span>
            </div>
          </div>

          <button
            onClick={() => setManualSos(true)}
            className="w-full py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded text-xs flex items-center justify-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4" /> Trigger Manual SOS Emergency
          </button>
        </div>
      )}
    </div>
  );
};
