import React, { useState } from 'react';
import { SystemTelemetry, DemoScenario } from '../../types/telemetry';
import { connectionService } from '../../services/connection';
import { TofHeatmap } from '../TofHeatmap';
import { ImuTelemetry } from '../ImuTelemetry';
import { PpgTelemetry } from '../PpgTelemetry';
import { PpgWaveform } from '../PpgWaveform';
import { SensorFusion } from '../SensorFusion';
import { AreaTrendGraph } from '../common/AreaTrendGraph';
import {
  Code, Sliders, Cpu, Activity, Zap, CheckCircle2,
  AlertOctagon, RefreshCw, Layers,
  Terminal, Server, BrainCircuit, ArrowRight, RotateCcw, Trash2,
  Radio, Database, FileText, Sparkles, TrendingUp, Heart
} from 'lucide-react';

interface Props {
  telemetry: SystemTelemetry;
}

export type DevSectionType = 'telemetry' | 'debugger' | 'testmode' | 'firmware' | 'aiml' | 'scenarios';

export const DeveloperPage: React.FC<Props> = ({ telemetry }) => {
  const [activeSection, setActiveSection] = useState<DevSectionType>('telemetry');
  const [selectedDebugStage, setSelectedDebugStage] = useState<number>(0);
  const [motorTarget, setMotorTarget] = useState<'LEFT' | 'CENTER' | 'RIGHT' | 'GROUND' | 'ALL'>('ALL');
  const [motorIntensity, setMotorIntensity] = useState<number>(80);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);

  const obstacle = telemetry.obstacle;

  const distanceHistoryData = [
    { label: 'T-5s', value: obstacle.filteredDistanceMm + 120 },
    { label: 'T-4s', value: obstacle.filteredDistanceMm + 80 },
    { label: 'T-3s', value: obstacle.filteredDistanceMm + 30 },
    { label: 'T-2s', value: obstacle.filteredDistanceMm - 20 },
    { label: 'T-1s', value: obstacle.filteredDistanceMm + 10 },
    { label: 'NOW', value: obstacle.filteredDistanceMm }
  ];

  const handleSelectScenario = (scen: DemoScenario) => {
    connectionService.setDemoScenario(scen);
  };

  const scenariosList: { id: DemoScenario; label: string }[] = [
    { id: 'NORMAL_WALKING', label: 'Normal Walking' },
    { id: 'FAST_WALKING', label: 'Fast Walking' },
    { id: 'SITTING', label: 'Sitting' },
    { id: 'FAST_SITTING', label: 'Fast Sitting' },
    { id: 'BENDING', label: 'Bending' },
    { id: 'STAIRS', label: 'Stairs' },
    { id: 'FALL', label: 'Fall' },
    { id: 'FALL_RECOVERY', label: 'Fall → Recovery' },
    { id: 'FALL_EMERGENCY', label: 'Fall → Emergency' },
    { id: 'GROUND_HAZARD', label: 'Ground Hazard' },
    { id: 'OVERHEAD_OBSTACLE', label: 'Overhead Obstacle' },
    { id: 'POOR_PPG', label: 'Poor PPG' },
    { id: 'HIGH_HR', label: 'High HR' },
    { id: 'BLE_DISCONNECT', label: 'BLE Disconnect' },
    { id: 'SENSOR_FAILURE', label: 'Sensor Failure' }
  ];

  const sections: { id: DevSectionType; label: string; icon: React.ReactNode }[] = [
    { id: 'telemetry', label: 'Telemetry', icon: <Activity className="w-4 h-4" /> },
    { id: 'scenarios', label: '15 Scenarios Demo', icon: <Radio className="w-4 h-4" /> },
    { id: 'debugger', label: 'Debugger', icon: <Terminal className="w-4 h-4" /> },
    { id: 'testmode', label: 'Test Console', icon: <Sliders className="w-4 h-4" /> },
    { id: 'firmware', label: 'Firmware & OTA', icon: <Server className="w-4 h-4" /> },
    { id: 'aiml', label: 'AI / Data Portal', icon: <BrainCircuit className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4 font-sans text-slate-100 page-transition pb-20">
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">DEVELOPER PORTAL</span>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Engineering Tools <Code className="w-5 h-5 text-white" />
          </h2>
        </div>
        <span className="px-3 py-1 rounded-full lift-dashed-tag text-xs font-mono text-slate-300 font-extrabold">
          v1.4.2-AI
        </span>
      </div>

      <div className="lift-card p-1.5 rounded-full flex gap-1 overflow-x-auto">
        {sections.map(s => {
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-full text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all duration-300 ${
                isActive
                  ? 'bg-white text-black shadow-lg scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {s.icon}
              <span className="truncate">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* 15 SCENARIOS DEMO SIMULATOR */}
      {activeSection === 'scenarios' && (
        <div className="lift-card rounded-3xl p-5 space-y-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400" /> 15 Demo Scenario Simulator
              </h3>
              <p className="text-xs text-slate-400">Instantly simulate edge-case hardware telemetry scenarios</p>
            </div>
            <span className="px-3 py-1 rounded-full lift-dashed-tag text-xs font-mono text-emerald-400 font-extrabold">
              Active: {telemetry.activeScenario || 'NORMAL_WALKING'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
            {scenariosList.map(scen => (
              <button
                key={scen.id}
                onClick={() => handleSelectScenario(scen.id)}
                className={`p-3 rounded-2xl border text-left font-extrabold transition-all ${
                  telemetry.activeScenario === scen.id
                    ? 'bg-white text-black border-white shadow-xl'
                    : 'bg-[#000000] text-slate-300 border-white/10 hover:border-slate-500'
                }`}
              >
                ▶ {scen.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TELEMETRY PAGE */}
      {activeSection === 'telemetry' && (
        <div className="space-y-4">
          <PpgTelemetry ppg={telemetry.ppg} />
          <PpgWaveform redWave={telemetry.ppg.rawRedWaveform} irWave={telemetry.ppg.rawIrWaveform} />
          <TofHeatmap tof={telemetry.tof} />
          <ImuTelemetry imu={telemetry.imu} />
        </div>
      )}

      {/* AI / DATA PORTAL */}
      {activeSection === 'aiml' && (
        <div className="lift-card rounded-3xl p-5 space-y-4 border border-white/10">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-white" /> AI & Dataset Management Console
          </h3>

          <SensorFusion fusion={telemetry.sensorFusion} />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 font-mono text-xs">
            <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl">
              <span className="text-[10px] text-slate-400 block font-semibold">IMU MODEL VER</span>
              <span className="text-xs font-extrabold text-white">{telemetry.aiMetrics.imuModelVersion}</span>
            </div>

            <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl">
              <span className="text-[10px] text-slate-400 block font-semibold">PPG MODEL VER</span>
              <span className="text-xs font-extrabold text-white">{telemetry.aiMetrics.ppgModelVersion}</span>
            </div>

            <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl">
              <span className="text-[10px] text-slate-400 block font-semibold">DATASET VER</span>
              <span className="text-xs font-extrabold text-white">{telemetry.aiMetrics.datasetVersion}</span>
            </div>

            <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl">
              <span className="text-[10px] text-slate-400 block font-semibold">TRAINING SAMPLES</span>
              <span className="text-sm font-black text-white">{telemetry.aiMetrics.trainingSamplesCount}</span>
            </div>

            <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl">
              <span className="text-[10px] text-slate-400 block font-semibold">FALSE POS RATE</span>
              <span className="text-sm font-black text-slate-300">{telemetry.aiMetrics.falsePositiveRate}%</span>
            </div>

            <div className="bg-[#000000] border border-white/10 p-3 rounded-2xl">
              <span className="text-[10px] text-slate-400 block font-semibold">MODEL DRIFT</span>
              <span className="text-xs font-extrabold text-emerald-400">{telemetry.aiMetrics.modelDrift} (Low)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
