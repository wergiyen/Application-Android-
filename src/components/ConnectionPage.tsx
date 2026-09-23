import React, { useState, useEffect } from 'react';
import { ConnectionMode } from '../types/telemetry';
import { connectionService, DiscoveredBleDevice } from '../services/connection';
import { Wifi, Bluetooth, Radio, RefreshCw, CheckCircle2, AlertCircle, Cpu, Signal, ShieldCheck, Zap, Activity } from 'lucide-react';

interface Props {
  mode: ConnectionMode;
  connected: boolean;
  onModeChange: (mode: ConnectionMode, ip?: string) => void;
}

export const ConnectionPage: React.FC<Props> = ({
  mode,
  connected,
  onModeChange
}) => {
  const [wifiIp, setWifiIp] = useState('192.168.4.1');
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredBleDevice[]>([]);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [showAllDevices, setShowAllDevices] = useState(false);
  const [manualMacAddress, setManualMacAddress] = useState('');
  const [connectingDeviceId, setConnectingDeviceId] = useState<string | null>(null);

  const isDemo = mode === 'demo';

  const handleScan = async (overrideShowAll?: boolean) => {
    setIsScanning(true);
    const filterAll = overrideShowAll !== undefined ? overrideShowAll : showAllDevices;
    setStatusMsg(filterAll ? 'Scanning for ALL nearby Bluetooth devices...' : 'Scanning for ESP32 / NEVISENSE / GIYEN hardware...');
    try {
      const devices = await connectionService.scanBleDevices(filterAll);
      setDiscoveredDevices(devices);
      if (devices.length === 0) {
        setStatusMsg(filterAll ? 'No Bluetooth devices found. Ensure Bluetooth and Location are ON.' : 'No ESP32 hardware found. Check device power or toggle "Show All Devices".');
      } else {
        setStatusMsg(`Found ${devices.length} ${filterAll ? 'device(s)' : 'ESP32 compatible device(s)'}. Ready to pair.`);
      }
    } catch (e: any) {
      console.warn('Scan error:', e);
      setStatusMsg(e.message || 'Scan error. Please check Bluetooth permissions.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualConnect = async () => {
    const mac = manualMacAddress.trim();
    if (!mac) {
      setStatusMsg('Please enter a valid ESP32 MAC address (e.g. 34:85:18:9A:BC:D1).');
      return;
    }
    await handleConnectDevice({ id: mac, name: `ESP32 (${mac.slice(-6)})` });
  };

  const handleConnectDevice = async (device: DiscoveredBleDevice) => {
    setConnectingDeviceId(device.id);
    setStatusMsg(`Connecting to ${device.name} (${device.id})...`);
    try {
      if (mode !== 'ble') {
        onModeChange('ble');
      }
      await connectionService.connectSpecificBleDevice(device.id);
      setStatusMsg(`Connected to ${device.name}! Streaming real telemetry.`);
    } catch (e: any) {
      setStatusMsg(`Connection failed: ${e.message}`);
    } finally {
      setConnectingDeviceId(null);
    }
  };

  const handleToggleDemoReal = (targetDemo: boolean) => {
    if (targetDemo) {
      onModeChange('demo');
      setStatusMsg('Switched to Demo Mode (Simulated Synthetic Telemetry)');
    } else {
      onModeChange('ble');
      setStatusMsg('Switched to Real Hardware Connection Mode (Bluetooth BLE)');
    }
  };

  const handleSystemPicker = async () => {
    setIsScanning(true);
    setStatusMsg('Opening System Bluetooth Device Selector...');
    try {
      const dev = await connectionService.requestBleDevicePicker();
      if (dev) {
        setDiscoveredDevices(prev => {
          const exists = prev.some(d => d.id === dev.id);
          return exists ? prev : [dev, ...prev];
        });
        setStatusMsg(`Selected ${dev.name}. Ready to connect.`);
      } else {
        setStatusMsg('No device selected from system picker.');
      }
    } catch (e: any) {
      setStatusMsg(`System picker error: ${e.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-4 font-sans text-slate-100 page-transition pb-20">
      
      {/* 1. Master Mode Toggle Switch Banner (Demo Mode vs Real Hardware) */}
      <div className="lift-card rounded-3xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-extrabold">DATA STREAM SOURCE</span>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-white" /> Data Source Mode Selector
            </h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold border ${
            isDemo
              ? 'bg-white text-black border-white'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}>
            {isDemo ? 'DEMO SIMULATION' : 'REAL HARDWARE STREAM'}
          </span>
        </div>

        {/* Big Dual Toggle Pills */}
        <div className="grid grid-cols-2 gap-2 bg-[#000000] p-1.5 rounded-2xl border border-white/10 font-mono">
          <button
            onClick={() => handleToggleDemoReal(true)}
            className={`py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
              isDemo
                ? 'bg-white text-black shadow-xl font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" /> Demo Mode (Simulated)
          </button>

          <button
            onClick={() => handleToggleDemoReal(false)}
            className={`py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
              !isDemo
                ? 'bg-white text-black shadow-xl font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bluetooth className="w-4 h-4" /> Real Hardware (BLE / Wi-Fi)
          </button>
        </div>

        {isDemo ? (
          <div className="p-3 bg-[#12151E] rounded-2xl border border-white/10 flex items-center justify-between gap-3 font-mono text-xs">
            <span className="text-slate-300 font-medium">Currently using synthetic demo data. Click to switch to real hardware mode:</span>
            <button
              onClick={() => handleToggleDemoReal(false)}
              className="px-4 py-2 bg-white text-black rounded-xl font-black shrink-0 hover:bg-slate-200 transition-all shadow"
            >
              TURN OFF DEMO MODE
            </button>
          </div>
        ) : (
          <div className="p-3 bg-emerald-950/40 rounded-2xl border border-emerald-500/30 font-mono text-xs text-emerald-200">
            <strong>Demo Mode OFF</strong> — Telemetry reset to 0 (0 mm, 0 m/s, 0 steps, 0% battery) until live binary packets arrive from your connected ESP32 hardware.
          </div>
        )}

        {statusMsg && (
          <div className="text-xs font-mono text-slate-300 p-3 bg-[#141416] rounded-2xl border border-white/10 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}
      </div>

      {/* 2. Active Connection Status Card */}
      <div className="lift-card rounded-3xl p-5 space-y-4 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${
              connected ? 'bg-emerald-500 text-black' : 'bg-rose-900 text-rose-200'
            }`}>
              {mode === 'wifi' ? <Wifi className="w-5 h-5" /> : mode === 'ble' ? <Bluetooth className="w-5 h-5" /> : mode === 'serial' ? <Cpu className="w-5 h-5" /> : <Radio className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                Connection Status: <span className="uppercase text-white font-mono">{mode}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {connected ? 'Live telemetry binary stream active' : 'Waiting for hardware connection...'}
              </p>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-mono font-black border ${
            connected
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-rose-950 text-rose-300 border-rose-700'
          }`}>
            {connected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>

        {/* Firmware Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono pt-1">
          <div className="lift-card-inner p-3 rounded-2xl">
            <span className="text-[10px] text-slate-400 block">Device Name</span>
            <span className="text-white font-extrabold">NEVISENSE</span>
          </div>

          <div className="lift-card-inner p-3 rounded-2xl">
            <span className="text-[10px] text-slate-400 block">BLE Service UUID</span>
            <span className="text-white font-extrabold truncate block">12345678-0001</span>
          </div>

          <div className="lift-card-inner p-3 rounded-2xl">
            <span className="text-[10px] text-slate-400 block">Target Architecture</span>
            <span className="text-white font-extrabold">ESP32-S3 NimBLE</span>
          </div>
        </div>
      </div>

      {/* 3. Bluetooth Low Energy Discovery Console */}
      <div className={`lift-card rounded-3xl p-6 space-y-4 border ${
        mode === 'ble' ? 'border-white' : 'border-white/10'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center">
              <Bluetooth className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Bluetooth LE Hardware Scanner</h3>
              <p className="text-xs text-slate-400">Discover and pair ESP32 NimBLE device</p>
            </div>
          </div>
          {mode === 'ble' && <span className="px-3 py-1 rounded-full lift-dashed-tag text-xs font-mono font-extrabold">ACTIVE MODE</span>}
        </div>

        <div className="space-y-3">
          {/* Scanner Filter Header */}
          <div className="flex items-center justify-between font-mono text-xs bg-[#0a0a0c] p-2.5 rounded-2xl border border-white/10">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Filter: <strong className="text-white font-black">{showAllDevices ? 'ALL NEARBY DEVICES' : 'ESP32 / NEVISENSE / GIYEN ONLY'}</strong>
            </span>
            <button
              onClick={() => {
                const nextMode = !showAllDevices;
                setShowAllDevices(nextMode);
                handleScan(nextMode);
              }}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] font-extrabold border border-white/10 transition-all"
            >
              {showAllDevices ? 'Filter ESP32 Only' : 'Show All Devices'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => handleScan()}
              disabled={isScanning}
              className="py-3.5 lift-button-primary flex items-center justify-center gap-2 text-xs font-black shadow-xl rounded-full disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Scan ESP32 Hardware'}</span>
            </button>

            <button
              onClick={handleSystemPicker}
              disabled={isScanning}
              className="py-3.5 bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2 text-xs font-bold rounded-full border border-white/20 disabled:opacity-50"
            >
              <Signal className="w-4 h-4 text-emerald-400" />
              <span>Open System BLE Dialog</span>
            </button>
          </div>

          {/* Direct Manual MAC Address Connect Row */}
          <div className="lift-card-inner p-3 rounded-2xl flex gap-2 border border-white/10 font-mono text-xs">
            <input
              type="text"
              value={manualMacAddress}
              onChange={(e) => setManualMacAddress(e.target.value)}
              placeholder="Direct Connect MAC (e.g. 34:85:18:9A:BC:D1)"
              className="flex-1 bg-[#000000] border border-white/20 px-3 py-2 rounded-xl text-xs text-white uppercase placeholder:normal-case placeholder:text-slate-500"
            />
            <button
              onClick={handleManualConnect}
              disabled={connectingDeviceId !== null}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl shadow shrink-0 disabled:opacity-50 flex items-center gap-1.5"
            >
              {connectingDeviceId === manualMacAddress.trim() && (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              )}
              <span>Direct Connect</span>
            </button>
          </div>

          {/* Discovered BLE Devices List */}
          {discoveredDevices.length > 0 && (
            <div className="space-y-2 pt-2 font-mono">
              <span className="text-xs text-slate-400 font-bold block">
                Discovered ESP32 Devices ({discoveredDevices.length})
              </span>
              <div className="space-y-2">
                {discoveredDevices.map((dev) => (
                  <div key={dev.id} className="lift-card-inner p-4 rounded-2xl flex items-center justify-between border border-white/10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{dev.name}</span>
                        {dev.rssi !== undefined && (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <Signal className="w-3 h-3" /> {dev.rssi} dBm
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block">MAC / ID: {dev.id}</span>
                    </div>

                    <button
                      onClick={() => handleConnectDevice(dev)}
                      disabled={connectingDeviceId !== null}
                      className="px-4 py-2 bg-white text-black font-extrabold text-xs rounded-full shadow hover:bg-slate-200 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {connectingDeviceId === dev.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-800" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <span>Connect</span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Troubleshooting tips callout box */}
          <div className="p-3 bg-[#121214] rounded-2xl border border-white/10 text-[11px] font-mono text-slate-400 space-y-1">
            <span className="text-slate-200 font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Connecting to GIYEN / ESP32 Hardware
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-400">
              <li>ESP32 NimBLE device advertises as <strong>"GIYEN device"</strong> or <strong>"NEVISENSE"</strong>.</li>
              <li>Ensure <strong>Location Services (GPS)</strong> is turned ON on your phone.</li>
              <li>If you know your ESP32 MAC address, enter it above and tap <strong>"Direct Connect"</strong>.</li>
            </ul>
          </div>

          {mode !== 'ble' && (
            <button
              onClick={() => onModeChange('ble')}
              className="w-full py-2.5 bg-[#141416] hover:bg-slate-800 text-white font-extrabold rounded-full text-xs border border-white/10"
            >
              Switch to Bluetooth BLE Mode
            </button>
          )}
        </div>
      </div>

      {/* 4. Wi-Fi SoftAP Stream Configuration */}
      <div className={`lift-card rounded-3xl p-6 space-y-4 border ${
        mode === 'wifi' ? 'border-white' : 'border-white/10'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Wi-Fi SoftAP Gateway</h3>
              <p className="text-xs text-slate-400">Connect to ESP32 Access Point (SSID: NEVISENSE_V1)</p>
            </div>
          </div>
          {mode === 'wifi' && <span className="px-3 py-1 rounded-full lift-dashed-tag text-xs font-mono font-extrabold">ACTIVE MODE</span>}
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div className="flex gap-2">
            <input
              type="text"
              value={wifiIp}
              onChange={(e) => setWifiIp(e.target.value)}
              placeholder="192.168.4.1"
              className="flex-1 bg-[#000000] border border-white/20 px-3 py-2.5 rounded-2xl text-xs text-white"
            />
            <button
              onClick={() => onModeChange('wifi', wifiIp)}
              className="px-5 py-2.5 bg-white text-black font-extrabold rounded-2xl text-xs shadow"
            >
              Connect IP
            </button>
          </div>

          {mode !== 'wifi' && (
            <button
              onClick={() => onModeChange('wifi', wifiIp)}
              className="w-full py-2.5 bg-[#141416] hover:bg-slate-800 text-white font-extrabold rounded-full text-xs border border-white/10"
            >
              Switch to Wi-Fi SoftAP Mode
            </button>
          )}
        </div>
      </div>

      {/* 5. USB Serial COM Port */}
      <div className="lift-card rounded-3xl p-5 flex items-center justify-between border border-white/10 text-xs font-mono">
        <div className="flex items-center gap-3">
          <Cpu className="w-5 h-5 text-white" />
          <div>
            <strong className="block text-white font-extrabold">USB Serial COM Port (115200 Baud)</strong>
            <span className="text-slate-400 text-[11px]">Direct USB cable telemetry connection</span>
          </div>
        </div>
        <button
          onClick={() => onModeChange('serial')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold border transition-all ${
            mode === 'serial' ? 'bg-white text-black border-white shadow' : 'bg-[#141416] text-slate-300 border-white/10'
          }`}
        >
          {mode === 'serial' ? 'Active' : 'Connect USB Serial'}
        </button>
      </div>

    </div>
  );
};

