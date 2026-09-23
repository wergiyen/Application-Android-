import React, { useState, useEffect, useRef } from 'react';
import { SystemTelemetry, ConnectionMode } from './types/telemetry';
import { connectionService } from './services/connection';
import { Header } from './components/Header';
import { UserPage } from './components/user/UserPage';
import { FamilyPage } from './components/family/FamilyPage';
import { DeveloperPage } from './components/developer/DeveloperPage';
import { ConnectionPage } from './components/ConnectionPage';
import { NavigationTabs, RoleTabType } from './components/NavigationTabs';
import { Radio, WifiOff, Bluetooth, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [telemetry, setTelemetry] = useState<SystemTelemetry | null>(null);
  const [activeTab, setActiveTab] = useState<RoleTabType>('user');
  const displayedTelemetry = useRef<SystemTelemetry | null>(null);
  const activeTabRef = useRef<RoleTabType>('user');

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const smoothTelemetryForDisplay = (next: SystemTelemetry): SystemTelemetry => {
    const previous = displayedTelemetry.current;
    if (!previous || next.connectionMode !== 'ble') {
      displayedTelemetry.current = next;
      return next;
    }

    const blend = (oldValue: number, newValue: number, amount = 0.18) => {
      if (!Number.isFinite(oldValue) || !Number.isFinite(newValue)) return newValue;
      const delta = newValue - oldValue;
      const safeDelta = Math.abs(delta) > 180 ? Math.sign(delta || 1) * 180 : delta;
      return Math.round(oldValue + safeDelta * amount);
    };

    const clampValue = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

    const smoothed: SystemTelemetry = {
      ...next,
      tof: {
        ...next.tof,
        zones: next.tof.zones.map((value, index) => {
          const prev = previous.tof.zones[index] ?? value;
          const clamped = clampValue(value, 0, 2000);
          return blend(prev, clamped, 0.14);
        }),
        minZone: {
          ...next.tof.minZone,
          distance: blend(previous.tof.minZone.distance, clampValue(next.tof.minZone.distance, 0, 2000), 0.12)
        },
        avgDistance: blend(previous.tof.avgDistance, clampValue(next.tof.avgDistance, 0, 2000), 0.12)
      },
      imu: {
        ...next.imu,
        ax: blend(previous.imu.ax, next.imu.ax, 0.16),
        ay: blend(previous.imu.ay, next.imu.ay, 0.16),
        az: blend(previous.imu.az, next.imu.az, 0.16),
        gx: blend(previous.imu.gx, next.imu.gx, 0.16),
        gy: blend(previous.imu.gy, next.imu.gy, 0.16),
        gz: blend(previous.imu.gz, next.imu.gz, 0.16),
        pitch: blend(previous.imu.pitch, next.imu.pitch, 0.16),
        roll: blend(previous.imu.roll, next.imu.roll, 0.16),
        gForce: blend(previous.imu.gForce, clampValue(next.imu.gForce, 0, 8), 0.16)
      },
      obstacle: {
        ...next.obstacle,
        distanceMm: blend(previous.obstacle.distanceMm, clampValue(next.obstacle.distanceMm, 0, 2000), 0.18),
        filteredDistanceMm: blend(previous.obstacle.filteredDistanceMm, clampValue(next.obstacle.filteredDistanceMm, 0, 2000), 0.18),
        rawDistanceMm: blend(previous.obstacle.rawDistanceMm, clampValue(next.obstacle.rawDistanceMm, 0, 2000), 0.18),
        confidence: clampValue(Math.round(next.obstacle.confidence), 0, 100)
      },
      guidance: {
        ...next.guidance,
        leftSpaceMm: blend(previous.guidance.leftSpaceMm, clampValue(next.guidance.leftSpaceMm, 0, 2000), 0.18),
        centerSpaceMm: blend(previous.guidance.centerSpaceMm, clampValue(next.guidance.centerSpaceMm, 0, 2000), 0.18),
        rightSpaceMm: blend(previous.guidance.rightSpaceMm, clampValue(next.guidance.rightSpaceMm, 0, 2000), 0.18),
        confidence: clampValue(Math.round(next.guidance.confidence), 0, 100)
      },
      battery: {
        ...next.battery,
        percentage: blend(previous.battery.percentage, clampValue(next.battery.percentage, 0, 100), 0.12)
      }
    };

    displayedTelemetry.current = smoothed;
    return smoothed;
  };

  useEffect(() => {
    const unsubscribe = connectionService.subscribe((data) => {
      const next = activeTabRef.current === 'user' ? smoothTelemetryForDisplay(data) : data;
      setTelemetry(next);
    });
    return () => unsubscribe();
  }, []);

  const handleModeChange = (mode: ConnectionMode, ip?: string) => {
    connectionService.setMode(mode, ip);
  };

  if (!telemetry) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 text-center text-slate-100">
        <div className="space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-white text-black mx-auto flex items-center justify-center animate-pulse shadow-xl font-black text-xl">
            N
          </div>
          <p className="text-sm font-bold text-slate-300 font-mono">Initializing NEVISENSE V1 Safety Platform...</p>
        </div>
      </div>
    );
  }

  const isDisconnected = !telemetry.connected;
  const hasEmergencyAlert = telemetry.fall.requiresAlert || telemetry.fall.phase === 'EMERGENCY_ACTIVE';

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 pb-24 selection:bg-white selection:text-black font-sans">
      {/* Top Header */}
      <Header
        connected={telemetry.connected}
        mode={telemetry.connectionMode}
        battery={telemetry.battery}
        onModeChange={handleModeChange}
      />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Improved Disconnection Warning Banner */}
        {isDisconnected && (
          <div className="bg-rose-950/90 border border-rose-700 p-4 rounded-3xl flex items-center justify-between gap-3 text-xs text-rose-200 shadow-2xl">
            <div className="flex items-center gap-3">
              <WifiOff className="w-6 h-6 text-rose-400 flex-shrink-0 animate-pulse" />
              <div>
                <strong className="block text-white text-sm font-black flex items-center gap-1.5">
                  ⚠ PHONE DISCONNECTED
                </strong>
                <span className="text-[11px] text-rose-200 block">
                  NeviSense wearable safety engine continues running locally on device.
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('connection')}
              className="px-4 py-2.5 bg-white text-black font-black rounded-full flex items-center gap-1.5 flex-shrink-0 shadow hover:bg-slate-200 transition-all text-xs"
            >
              <Bluetooth className="w-4 h-4" /> RECONNECT
            </button>
          </div>
        )}

        {/* Dynamic Navigation Role Views */}
        {activeTab === 'user' && (
          <UserPage telemetry={telemetry} />
        )}

        {activeTab === 'family' && (
          <FamilyPage telemetry={telemetry} />
        )}

        {activeTab === 'developer' && (
          <DeveloperPage telemetry={telemetry} />
        )}

        {activeTab === 'connection' && (
          <ConnectionPage
            mode={telemetry.connectionMode}
            connected={telemetry.connected}
            onModeChange={handleModeChange}
          />
        )}
      </main>

      {/* Bottom Floating Navigation Bar */}
      <NavigationTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasEmergencyAlert={hasEmergencyAlert}
      />
    </div>
  );
};

export default App;
