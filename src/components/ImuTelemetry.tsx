import React from 'react';
import { ImuData } from '../types/telemetry';
import { Activity, Compass, Flame, Footprints } from 'lucide-react';

interface Props {
  imu: ImuData;
}

export const ImuTelemetry: React.FC<Props> = ({ imu }) => {
  return (
    <div className="bg-[#151C28] border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-950 border border-blue-800 rounded-lg text-blue-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
              MPU6050 IMU Telemetry
            </h2>
            <p className="text-[11px] text-gray-400">6-Axis Motion Data</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0B0F17] rounded-lg border border-slate-800">
          <Footprints className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-bold text-cyan-300 font-mono">
            {imu.motionState}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Pitch & Roll Horizon */}
        <div className="bg-[#0B0F17] border border-slate-800 p-3 rounded-lg flex flex-col items-center justify-center relative">
          <div className="text-[11px] font-semibold text-gray-400 mb-2 flex items-center gap-1 self-start">
            <Compass className="w-3.5 h-3.5 text-cyan-400" /> Attitude Horizon
          </div>

          <div className="relative w-32 h-32 rounded-full border-2 border-slate-700 overflow-hidden bg-slate-900 flex items-center justify-center">
            <div
              className="absolute w-full h-full bg-amber-900/60 border-t-2 border-cyan-400"
              style={{
                transform: `rotate(${imu.roll}deg) translateY(${imu.pitch * 1.2}px)`
              }}
            />
            <div className="absolute w-4 h-0.5 bg-cyan-400 z-10" />
            <div className="absolute h-4 w-0.5 bg-cyan-400 z-10" />
          </div>

          <div className="grid grid-cols-2 gap-2 w-full mt-3 text-center font-mono">
            <div className="bg-[#151C28] p-1.5 rounded border border-slate-800">
              <span className="text-[9px] text-gray-500 block uppercase">Pitch</span>
              <span className="text-xs font-bold text-cyan-300">{imu.pitch}°</span>
            </div>
            <div className="bg-[#151C28] p-1.5 rounded border border-slate-800">
              <span className="text-[9px] text-gray-500 block uppercase">Roll</span>
              <span className="text-xs font-bold text-cyan-300">{imu.roll}°</span>
            </div>
          </div>
        </div>

        {/* Accelerometer & Gyroscope Flat Cards */}
        <div className="space-y-2 font-mono text-xs">
          <div className="bg-[#0B0F17] border border-slate-800 p-3 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-gray-400 font-sans">
              <span>Accelerometer (g)</span>
              <span className="text-amber-400 font-bold">{imu.gForce} g</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-[#151C28] p-1.5 rounded border border-slate-800">
                <span className="text-gray-500 block text-[9px]">AX</span>
                <span className="text-white font-bold">{imu.ax.toFixed(3)}</span>
              </div>
              <div className="bg-[#151C28] p-1.5 rounded border border-slate-800">
                <span className="text-gray-500 block text-[9px]">AY</span>
                <span className="text-white font-bold">{imu.ay.toFixed(3)}</span>
              </div>
              <div className="bg-[#151C28] p-1.5 rounded border border-slate-800">
                <span className="text-gray-500 block text-[9px]">AZ</span>
                <span className="text-white font-bold">{imu.az.toFixed(3)}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0B0F17] border border-slate-800 p-3 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-gray-400 font-sans">
              <span>Gyroscope (°/s)</span>
              <Flame className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-[#151C28] p-1.5 rounded border border-slate-800">
                <span className="text-gray-500 block text-[9px]">GX</span>
                <span className="text-cyan-300 font-bold">{imu.gx.toFixed(1)}</span>
              </div>
              <div className="bg-[#151C28] p-1.5 rounded border border-slate-800">
                <span className="text-gray-500 block text-[9px]">GY</span>
                <span className="text-cyan-300 font-bold">{imu.gy.toFixed(1)}</span>
              </div>
              <div className="bg-[#151C28] p-1.5 rounded border border-slate-800">
                <span className="text-gray-500 block text-[9px]">GZ</span>
                <span className="text-cyan-300 font-bold">{imu.gz.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
