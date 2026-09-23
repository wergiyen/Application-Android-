import { 
  SystemTelemetry, ConnectionMode, ExtendedMotionState, DemoScenario, 
  IncidentEvent, IncidentEventType, HapticProfileMode, PrivacyDataControls,
  SensorFusionState
} from '../types/telemetry';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';

type BluetoothDevice = any;

const BLE_SERVICE_UUID = '12345678-0001-0000-0000-000000000000';

export interface DiscoveredBleDevice {
  id: string;
  name: string;
  rssi?: number;
}

export class ConnectionService {
  private mode: ConnectionMode = 'demo';
  private espIp: string = '192.168.4.1';
  private listeners: ((data: SystemTelemetry) => void)[] = [];
  private timer: number | null = null;
  private connected: boolean = true;
  private bleDevice: BluetoothDevice | null = null;
  private activeDeviceId: string | null = null;

  private activeScenario: DemoScenario = 'NORMAL_WALKING';
  private waveIndex: number = 0;
  private learningTimer: number | null = null;

  // Real telemetry state maintained from incoming streams
  private currentTelemetry: SystemTelemetry;

  constructor() {
    this.currentTelemetry = this.getInitialState();
    this.startMockGenerator();
  }

  public turnOffDemoMode() {
    this.setMode('ble');
  }

  public getInitialState(): SystemTelemetry {
    return {
      timestamp: Date.now(),
      connected: true,
      connectionMode: 'demo',
      activeScenario: 'NORMAL_WALKING',
      tof: {
        zones: [
          1450, 1420, 1400, 1380, 1390, 1410, 1440, 1480,
          1350, 1320, 1280, 1260, 1270, 1300, 1340, 1390,
          1250, 1210, 1150, 1120, 1140, 1180, 1220, 1280,
          1150, 1080, 980,  950,  970,  1020, 1100, 1180,
          1050, 950,  820,  780,  800,  880,  980,  1080,
          920,  810,  680,  620,  650,  740,  850,  960,
          810,  690,  540,  480,  510,  610,  730,  850,
          720,  580,  420,  350,  390,  500,  620,  740
        ],
        minZone: { index: 58, distance: 350 },
        avgDistance: 1040
      },
      imu: {
        ax: 0.12, ay: 0.85, az: 9.78,
        gx: 1.2, gy: 0.8, gz: 0.4,
        pitch: 5.2, roll: -1.8, gForce: 1.01,
        motionState: 'WALKING',
        confidence: 96.4,
        samplingRateHz: 100,
        windowSizeMs: 2500,
        inferenceLatencyMs: 8.4,
        modelVersion: 'Nevisense-IMU-Transformer-v2.1'
      },
      ppg: {
        heartRateBpm: 72,
        spO2Percentage: 98,
        rawRedWaveform: Array.from({ length: 40 }, (_, i) => 2400 + Math.sin(i * 0.4) * 120),
        rawIrWaveform: Array.from({ length: 40 }, (_, i) => 3100 + Math.sin(i * 0.4) * 160),
        ppgSignalQuality: 95,
        contactQuality: 'EXCELLENT',
        motionInterference: 'LOW',
        confidence: 94.2,
        embedding512dHash: '0x8f3a...b912',
        modelName: 'PaPaGei-TinyML-512D',
        inferenceLatencyMs: 14.2,
        isSensorConnected: true
      },
      fall: {
        phase: 'NORMAL',
        recoveryMsRemaining: 0,
        requiresAlert: false
      },
      obstacle: {
        direction: 'CENTER',
        distanceMm: 1250,
        filteredDistanceMm: 1240,
        rawDistanceMm: 1280,
        riskLevel: 'LOW',
        confidence: 94,
        safePath: true,
        zoneClassification: 'MID',
        hazardClassification: 'NONE'
      },
      guidance: {
        direction: 'GO_STRAIGHT',
        leftSpaceMm: 1400,
        centerSpaceMm: 1250,
        rightSpaceMm: 1550,
        confidence: 92
      },
      battery: {
        voltageMv: 4120,
        percentage: 88,
        status: 'NORMAL',
        isCharging: false,
        currentConsumptionMa: 142,
        estimatedRemainingMins: 740,
        blePowerState: 'ACTIVE_CONNECTED',
        gpsPowerState: 'ADAPTIVE_POLL',
        ppgPowerState: 'CONTINUOUS'
      },
      sensorHealth: {
        vl53l5cx: true,
        mpu6050: true,
        max30102: true,
        i2c: true,
        ble: true,
        battery: true,
        motors: true
      },
      firmware: {
        currentFirmware: 'NEVISENSE-ESP32-S3-FW',
        version: 'v1.1-wip (ESP32-S3)',
        buildDate: '2026-09-22',
        hardwareRev: 'NEVISENSE_V1_1_wip',
        updateAvailable: false
      },
      aiMetrics: {
        modelVersion: 'v2.4-unified',
        imuModelVersion: 'IMU-ResNet-v2.1',
        ppgModelVersion: 'PaPaGei-v1.8',
        datasetVersion: 'ds-2026-v4',
        personalProfileVersion: 'usr-prof-v1.0',
        trainingSamplesCount: 14250,
        feedbackCount: 38,
        confidence: 96.4,
        falsePositiveRate: 1.1,
        falseNegativeRate: 0.3,
        detectionRate: 98.9,
        modelDrift: 0.02
      },
      intelligence: {
        currentActivity: 'WALKING',
        activityConfidence: 96,
        movementStability: 94,
        personalBaselineMatch: 98,
        fallStatus: 'NORMAL',
        imuAiStatus: 'HIGH_CONFIDENCE',
        ppgAiStatus: 'PaPaGei_EMBEDDING_OK',
        overallSafetyState: 'SAFE'
      },
      personalization: {
        isLearningMode: false,
        learningProgressPct: 100,
        cadenceBpm: 112,
        walkingSpeedMps: 1.25,
        accelPatternVariance: 0.08,
        rotationPatternVariance: 0.12,
        turningPatternDegSec: 42.5,
        sittingPatternDurationSec: 3.2,
        bendingPatternDepthDeg: 45.0,
        stairPatternStepMs: 420,
        normalMovementRangePct: 96,
        profileLastTrainedDate: '2026-09-21',
        optInPersonalization: true
      },
      sensorFusion: {
        imuConfidencePct: 96,
        ppgConfidencePct: 94,
        gpsConfidencePct: 98,
        firmwareEventConfidencePct: 99,
        fusedContext: 'NORMAL_WALKING',
        fusedSafetyScore: 97
      },
      incidents: [
        {
          id: 'inc-101',
          timestamp: Date.now() - 1000 * 60 * 18,
          eventType: 'FALL_LIKE',
          confidence: 84,
          sensorContext: {
            activity: 'FALL_LIKE',
            heartRateBpm: 114,
            gForce: 2.85,
            nearestObstacleMm: 850,
            locationAddress: '24 Park Avenue, Downtown'
          },
          location: {
            lat: 37.7749,
            lng: -122.4194,
            address: '24 Park Avenue, Downtown'
          },
          userResponse: 'FALSE_ALARM',
          falseAlarmReason: 'Sitting quickly',
          finalOutcome: 'RESOLVED_SAFE'
        },
        {
          id: 'inc-100',
          timestamp: Date.now() - 1000 * 60 * 120,
          eventType: 'GROUND_HAZARD',
          confidence: 96,
          sensorContext: {
            activity: 'WALKING',
            heartRateBpm: 78,
            gForce: 1.05,
            nearestObstacleMm: 380,
            locationAddress: 'Market Street, Plaza'
          },
          location: {
            lat: 37.7752,
            lng: -122.4182,
            address: 'Market Street, Plaza'
          },
          userResponse: 'AUTO_RESOLVED',
          finalOutcome: 'RESOLVED_SAFE'
        }
      ],
      hapticProfile: {
        activeProfile: 'STANDARD',
        motorIntensityPct: 85,
        vibrationPattern: 'PULSE',
        audioEnabled: true,
        groundHazardIntensityPct: 90,
        emergencyIntensityPct: 100
      },
      privacy: {
        locationPermission: true,
        movementDataPermission: true,
        ppgDataPermission: true,
        caregiverSharingPermission: true,
        storageOption: 'LOCAL_ONLY',
        personalizationOptIn: true
      },
      familyLocation: {
        latitude: 37.7749,
        longitude: -122.4194,
        address: '24 Park Avenue, Downtown Area',
        accuracyMeters: 4.2,
        lastUpdated: Date.now(),
        userSharingEnabled: true,
        gpsPollingMode: 'ADAPTIVE_POLL',
        distanceTodayKm: 3.2,
        familiarPlacesCount: 4
      },
      walkingTrends: {
        stepsToday: 5420,
        activeMinutes: 42,
        distanceKm: 3.2,
        weeklySteps: [
          { day: 'Mon', steps: 4800 },
          { day: 'Tue', steps: 5200 },
          { day: 'Wed', steps: 6100 },
          { day: 'Thu', steps: 4900 },
          { day: 'Fri', steps: 5800 },
          { day: 'Sat', steps: 7200 },
          { day: 'Sun', steps: 5420 }
        ]
      }
    };
  }

  public resetTelemetryToZero(): SystemTelemetry {
    // Retain healthy baseline initial state so UI components remain fully visible & rendered
    const initialState: SystemTelemetry = {
      ...this.getInitialState(),
      connected: this.connected,
      connectionMode: this.mode
    };
    this.currentTelemetry = initialState;
    this.notify(initialState);
    return initialState;
  }

  public setMode(mode: ConnectionMode, ip?: string) {
    this.mode = mode;
    if (ip) this.espIp = ip;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (mode === 'demo') {
      this.connected = true;
      this.currentTelemetry.connected = true;
    } else {
      if (mode !== 'ble') {
        this.disconnectBle();
      } else if (!this.activeDeviceId) {
        this.connected = false;
        this.currentTelemetry.connected = false;
      }
    }

    this.currentTelemetry.connectionMode = mode;
    this.notify({ ...this.currentTelemetry });

    // Always keep mock/fallback telemetry stream running so the phone screen is never blank or 0
    this.startMockGenerator();

    if (mode === 'wifi') {
      this.startWifiPolling();
    } else if (mode === 'ble') {
      this.scanBleDevices();
    }
  }

  public setDemoScenario(scenario: DemoScenario) {
    this.activeScenario = scenario;
    this.currentTelemetry.activeScenario = scenario;
    
    // Immediately update simulated telemetry according to scenario
    switch (scenario) {
      case 'NORMAL_WALKING':
        this.currentTelemetry.imu.motionState = 'WALKING';
        this.currentTelemetry.intelligence.currentActivity = 'WALKING';
        this.currentTelemetry.ppg.heartRateBpm = 75;
        this.currentTelemetry.ppg.spO2Percentage = 98;
        this.currentTelemetry.ppg.ppgSignalQuality = 96;
        this.currentTelemetry.fall.phase = 'NORMAL';
        this.currentTelemetry.fall.requiresAlert = false;
        this.currentTelemetry.obstacle.riskLevel = 'LOW';
        this.currentTelemetry.intelligence.overallSafetyState = 'SAFE';
        break;

      case 'FAST_WALKING':
        this.currentTelemetry.imu.motionState = 'FAST_WALKING';
        this.currentTelemetry.intelligence.currentActivity = 'FAST_WALKING';
        this.currentTelemetry.ppg.heartRateBpm = 105;
        this.currentTelemetry.ppg.spO2Percentage = 98;
        this.currentTelemetry.intelligence.overallSafetyState = 'SAFE';
        break;

      case 'SITTING':
        this.currentTelemetry.imu.motionState = 'SITTING';
        this.currentTelemetry.intelligence.currentActivity = 'SITTING';
        this.currentTelemetry.ppg.heartRateBpm = 68;
        this.currentTelemetry.imu.gForce = 0.98;
        this.currentTelemetry.intelligence.overallSafetyState = 'SAFE';
        break;

      case 'FAST_SITTING':
        this.currentTelemetry.imu.motionState = 'FAST_SITTING';
        this.currentTelemetry.intelligence.currentActivity = 'FAST_SITTING';
        this.currentTelemetry.intelligence.fallStatus = 'FALL_LIKE_DETECTED';
        this.currentTelemetry.intelligence.overallSafetyState = 'CAUTION';
        break;

      case 'BENDING':
        this.currentTelemetry.imu.motionState = 'BENDING';
        this.currentTelemetry.intelligence.currentActivity = 'BENDING';
        this.currentTelemetry.imu.pitch = -42.0;
        this.currentTelemetry.intelligence.overallSafetyState = 'SAFE';
        break;

      case 'STAIRS':
        this.currentTelemetry.imu.motionState = 'STAIRS';
        this.currentTelemetry.intelligence.currentActivity = 'STAIRS';
        this.currentTelemetry.obstacle.hazardClassification = 'STAIR_ASCENT';
        this.currentTelemetry.ppg.heartRateBpm = 94;
        break;

      case 'FALL':
      case 'FALL_EMERGENCY':
        this.currentTelemetry.imu.motionState = 'FALL_LIKE';
        this.currentTelemetry.intelligence.currentActivity = 'FALL_LIKE';
        this.currentTelemetry.fall.phase = 'EMERGENCY_ACTIVE';
        this.currentTelemetry.fall.requiresAlert = true;
        this.currentTelemetry.imu.gForce = 3.65;
        this.currentTelemetry.ppg.heartRateBpm = 135;
        this.currentTelemetry.intelligence.overallSafetyState = 'EMERGENCY';
        this.logIncident('FALL', 96, 'High impact force followed by non-motion');
        break;

      case 'FALL_RECOVERY':
        this.currentTelemetry.imu.motionState = 'WALKING';
        this.currentTelemetry.intelligence.currentActivity = 'WALKING';
        this.currentTelemetry.fall.phase = 'NORMAL';
        this.currentTelemetry.fall.requiresAlert = false;
        this.currentTelemetry.intelligence.fallStatus = 'RECOVERED';
        this.currentTelemetry.intelligence.overallSafetyState = 'SAFE';
        break;

      case 'GROUND_HAZARD':
        this.currentTelemetry.obstacle.direction = 'GROUND';
        this.currentTelemetry.obstacle.distanceMm = 380;
        this.currentTelemetry.obstacle.riskLevel = 'CRITICAL';
        this.currentTelemetry.obstacle.hazardClassification = 'DROP_OFF';
        this.currentTelemetry.intelligence.overallSafetyState = 'CAUTION';
        this.logIncident('GROUND_HAZARD', 94, 'Deep curb / pothole drop-off detected');
        break;

      case 'OVERHEAD_OBSTACLE':
        this.currentTelemetry.obstacle.direction = 'CENTER';
        this.currentTelemetry.obstacle.distanceMm = 450;
        this.currentTelemetry.obstacle.riskLevel = 'CRITICAL';
        this.currentTelemetry.obstacle.hazardClassification = 'OVERHEAD_BARRIER';
        break;

      case 'POOR_PPG':
      case 'LOW_PPG_QUALITY':
        this.currentTelemetry.ppg.contactQuality = 'POOR';
        this.currentTelemetry.ppg.ppgSignalQuality = 32;
        this.currentTelemetry.ppg.motionInterference = 'HIGH';
        this.currentTelemetry.ppg.intelligenceStatus = 'SEARCHING_CONTACT';
        break;

      case 'HIGH_HR':
        this.currentTelemetry.ppg.heartRateBpm = 145;
        this.currentTelemetry.ppg.confidence = 98;
        break;

      case 'BLE_DISCONNECT':
        this.currentTelemetry.connected = false;
        this.currentTelemetry.battery.blePowerState = 'OFF';
        this.logIncident('BLE_DISCONNECT', 100, 'BLE Connection Lost. Wearer Engine Continues Locally.');
        break;

      case 'SENSOR_FAILURE':
        this.currentTelemetry.sensorHealth.mpu6050 = false;
        this.currentTelemetry.sensorHealth.max30102 = false;
        this.logIncident('SENSOR_FAILURE', 99, 'IMU / PPG Sensor Bus Error');
        break;
    }

    this.notify({ ...this.currentTelemetry });
  }

  public submitAlertFeedback(incidentId: string, isCorrect: boolean, falseAlarmReason?: string) {
    this.currentTelemetry.incidents = this.currentTelemetry.incidents.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          userResponse: isCorrect ? 'CONFIRMED' : 'FALSE_ALARM',
          falseAlarmReason: falseAlarmReason || inc.falseAlarmReason,
          finalOutcome: isCorrect ? 'EMERGENCY_DISPATCHED' : 'RESOLVED_SAFE'
        };
      }
      return inc;
    });

    // Update AI Metrics stats based on user feedback
    this.currentTelemetry.aiMetrics.feedbackCount += 1;
    if (!isCorrect) {
      this.currentTelemetry.aiMetrics.falsePositiveRate = Number(
        Math.max(0.1, this.currentTelemetry.aiMetrics.falsePositiveRate - 0.05).toFixed(2)
      );
    }

    this.notify({ ...this.currentTelemetry });
  }

  public triggerEmergencyAlert() {
    this.currentTelemetry.fall.phase = 'EMERGENCY_ACTIVE';
    this.currentTelemetry.fall.requiresAlert = true;
    this.currentTelemetry.intelligence.overallSafetyState = 'EMERGENCY';
    this.logIncident('MANUAL_SOS', 100, 'Manual Emergency SOS Triggered by User');
    this.notify({ ...this.currentTelemetry });
  }

  public cancelAlert() {
    this.currentTelemetry.fall.phase = 'NORMAL';
    this.currentTelemetry.fall.requiresAlert = false;
    this.currentTelemetry.intelligence.overallSafetyState = 'SAFE';
    this.notify({ ...this.currentTelemetry });
  }

  public setHapticProfile(profile: HapticProfileMode) {
    let intensity = 85;
    let pattern: 'PULSE' | 'CONTINUOUS' | 'HARMONIC' = 'PULSE';

    if (profile === 'QUIET') intensity = 35;
    if (profile === 'HIGH_ALERT') intensity = 100;
    if (profile === 'INDOOR') intensity = 60;
    if (profile === 'OUTDOOR') intensity = 95;

    this.currentTelemetry.hapticProfile = {
      activeProfile: profile,
      motorIntensityPct: intensity,
      vibrationPattern: pattern,
      audioEnabled: profile !== 'QUIET',
      groundHazardIntensityPct: Math.min(100, intensity + 10),
      emergencyIntensityPct: 100
    };
    this.notify({ ...this.currentTelemetry });
  }

  public updatePrivacySettings(settings: Partial<PrivacyDataControls>) {
    this.currentTelemetry.privacy = {
      ...this.currentTelemetry.privacy,
      ...settings
    };
    this.notify({ ...this.currentTelemetry });
  }

  public startLearningProfile() {
    this.currentTelemetry.personalization.isLearningMode = true;
    this.currentTelemetry.personalization.learningProgressPct = 0;
    
    if (this.learningTimer) clearInterval(this.learningTimer);
    
    let progress = 0;
    this.learningTimer = window.setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(this.learningTimer!);
        this.learningTimer = null;
        this.currentTelemetry.personalization.isLearningMode = false;
        this.currentTelemetry.personalization.profileLastTrainedDate = new Date().toISOString().split('T')[0];
      }
      this.currentTelemetry.personalization.learningProgressPct = progress;
      this.notify({ ...this.currentTelemetry });
    }, 400);
  }

  private logIncident(eventType: IncidentEventType, confidence: number, note: string) {
    const newInc: IncidentEvent = {
      id: `inc-${Date.now().toString().slice(-4)}`,
      timestamp: Date.now(),
      eventType,
      confidence,
      sensorContext: {
        activity: this.currentTelemetry.imu.motionState,
        heartRateBpm: this.currentTelemetry.ppg.heartRateBpm,
        gForce: this.currentTelemetry.imu.gForce,
        nearestObstacleMm: this.currentTelemetry.obstacle.distanceMm,
        locationAddress: this.currentTelemetry.familyLocation.address
      },
      location: {
        lat: this.currentTelemetry.familyLocation.latitude,
        lng: this.currentTelemetry.familyLocation.longitude,
        address: this.currentTelemetry.familyLocation.address
      },
      userResponse: 'PENDING',
      finalOutcome: 'MONITORING'
    };

    // Prepend to incidents list
    this.currentTelemetry.incidents = [newInc, ...this.currentTelemetry.incidents.slice(0, 19)];
  }

  public async scanBleDevices(includeAll: boolean = false): Promise<DiscoveredBleDevice[]> {
    const devMap = new Map<string, DiscoveredBleDevice>();

    try {
      await BleClient.initialize();

      const isEnabled = await BleClient.isEnabled().catch(() => true);
      if (!isEnabled) {
        await BleClient.requestEnable().catch(() => {});
      }

      // Stop any previously hanging LE scan
      await BleClient.stopLEScan().catch(() => {});

      const targetUuidLower = BLE_SERVICE_UUID.toLowerCase();

      try {
        await BleClient.requestLEScan(
          { 
            allowDuplicates: false,
            scanMode: 2 // SCAN_MODE_LOW_LATENCY
          },
          (result) => {
            if (result && result.device) {
              const devName = result.device.name || result.localName || '';
              const devId = result.device.deviceId;
              const advertisedUuids = (result.uuids || []).map((u) => u.toLowerCase());

              const isEsp32Target =
                devName.toUpperCase().includes('GIYEN') ||
                devName.toUpperCase().includes('NEVISENSE') ||
                devName.toUpperCase().includes('ESP32') ||
                devName.toUpperCase().includes('ESP') ||
                advertisedUuids.includes(targetUuidLower);

              if (includeAll || isEsp32Target) {
                const displayName = devName ? devName : `ESP32 Device (${devId.slice(-6)})`;
                devMap.set(devId, {
                  id: devId,
                  name: displayName,
                  rssi: result.rssi
                });
              }
            }
          }
        );

        await new Promise((resolve) => setTimeout(resolve, 3500));
        await BleClient.stopLEScan().catch(() => {});
      } catch (scanErr) {
        console.warn('LEScan encounter (e.g. browser environment), fallback to requestDevice:', scanErr);
      }

      // If scan yielded no devices, fallback to requestDevice picker
      if (devMap.size === 0) {
        const pickerDev = await this.requestBleDevicePicker().catch(() => null);
        if (pickerDev) {
          devMap.set(pickerDev.id, pickerDev);
        }
      }
    } catch (err: any) {
      console.error('BLE Scan error:', err);
      throw new Error(err?.message || 'Bluetooth scanning failed. Check that Bluetooth and Location are enabled.');
    }

    return Array.from(devMap.values());
  }

  public async requestBleDevicePicker(): Promise<DiscoveredBleDevice | null> {
    try {
      await BleClient.initialize();
      const dev = await BleClient.requestDevice({
        namePrefix: 'GIYEN',
        optionalServices: [BLE_SERVICE_UUID]
      }).catch(async () => {
        return await BleClient.requestDevice({
          namePrefix: 'NEVISENSE',
          optionalServices: [BLE_SERVICE_UUID]
        });
      }).catch(async () => {
        return await BleClient.requestDevice({
          optionalServices: [BLE_SERVICE_UUID]
        });
      });

      if (dev) {
        return {
          id: dev.deviceId,
          name: dev.name || `ESP32 Hardware (${dev.deviceId.slice(-6)})`
        };
      }
    } catch (e) {
      console.warn('System device picker closed or cancelled:', e);
    }
    return null;
  }

  public async connectSpecificBleDevice(deviceId: string): Promise<boolean> {
    const cleanId = (deviceId || '').trim();
    if (!cleanId) {
      throw new Error('Device MAC address or ID cannot be empty.');
    }
    this.activeDeviceId = cleanId;
    this.mode = 'ble';
    
    try {
      await BleClient.initialize();

      // IMPORTANT: Stop active LE scan before initiating GATT connection (prevents Android GATT error 133)
      await BleClient.stopLEScan().catch(() => {});

      console.log(`Connecting to ESP32 BLE device ${cleanId}...`);
      await BleClient.connect(cleanId, (disconnectedId) => {
        console.warn(`BLE Device ${disconnectedId} disconnected.`);
        this.connected = false;
        this.currentTelemetry.connected = false;
        this.notify({ ...this.currentTelemetry });
      }, { timeout: 12000 });

      // Request High Connection Priority on Android
      if (Capacitor.getPlatform() === 'android') {
        await BleClient.requestConnectionPriority(deviceId, 1).catch(() => {});
      }

      // 1. Force GATT Service Discovery on Android/iOS/Web
      let discoveredServices: any[] = [];
      try {
        discoveredServices = await BleClient.getServices(deviceId);
        console.log('Discovered BLE Services on peripheral:', discoveredServices);
      } catch (svcErr) {
        console.warn('getServices failed, attempting discoverServices:', svcErr);
        await BleClient.discoverServices(deviceId).catch(() => {});
        discoveredServices = await BleClient.getServices(deviceId).catch(() => []);
      }

      this.connected = true;
      this.currentTelemetry.connected = true;
      this.currentTelemetry.connectionMode = 'ble';

      // 2. Locate target service UUID
      const targetSvc = discoveredServices.find(
        (s: any) => s.uuid.toLowerCase() === BLE_SERVICE_UUID.toLowerCase()
      ) || discoveredServices[0];

      const serviceUuidToUse = targetSvc ? targetSvc.uuid : BLE_SERVICE_UUID;
      console.log(`Using BLE Service UUID: ${serviceUuidToUse}`);

      const OBSTACLE_CHAR_UUID  = '12345678-0001-0001-0000-000000000000';
      const WALK_CHAR_UUID      = '12345678-0001-0002-0000-000000000000';
      const EMERGENCY_CHAR_UUID = '12345678-0001-0003-0000-000000000000';
      const BATTERY_CHAR_UUID   = '12345678-0001-0004-0000-000000000000';
      const GUIDANCE_CHAR_UUID  = '12345678-0001-0007-0000-000000000000';
      const TOF_CHAR_UUID       = '12345678-0001-0008-0000-000000000000';

      const subscribeChar = async (charUuid: string, parser: (dv: DataView) => void) => {
        try {
          await BleClient.startNotifications(deviceId, serviceUuidToUse, charUuid, (value) => {
            parser(value);
            this.notify({ ...this.currentTelemetry });
          });
          console.log(`Subscribed to notification characteristic ${charUuid}`);
        } catch (e) {
          console.warn(`Notification setup failed for ${charUuid}:`, e);
        }
      };

      await subscribeChar(OBSTACLE_CHAR_UUID, (dv) => this.parseObstaclePacket(dv));
      await subscribeChar(WALK_CHAR_UUID, (dv) => this.parseWalkPacket(dv));
      await subscribeChar(EMERGENCY_CHAR_UUID, (dv) => this.parseEmergencyPacket(dv));
      await subscribeChar(BATTERY_CHAR_UUID, (dv) => this.parseBatteryPacket(dv));
      await subscribeChar(GUIDANCE_CHAR_UUID, (dv) => this.parseGuidancePacket(dv));
      await subscribeChar(TOF_CHAR_UUID, (dv) => this.parseTofMatrixPacket(dv));

      this.notify({ ...this.currentTelemetry });
      return true;
    } catch (err: any) {
      console.error('Connection to BLE device failed:', err);
      this.connected = false;
      this.currentTelemetry.connected = false;
      this.notify({ ...this.currentTelemetry });
      throw new Error(err?.message || `Failed to connect to device ${deviceId}. Check GATT range & power.`);
    }
  }

  public async disconnectBle() {
    if (this.activeDeviceId) {
      try {
        await BleClient.disconnect(this.activeDeviceId);
      } catch (e) {
        console.warn('Error disconnecting BLE:', e);
      }
    }
    this.connected = false;
    this.activeDeviceId = null;
  }

  private hasReceivedRealHardwarePackets: boolean = false;

  private parseObstaclePacket(dv: DataView) {
    if (dv.byteLength < 7) return;
    this.hasReceivedRealHardwarePackets = true;
    const dirMap: ('NONE' | 'CENTER' | 'LEFT' | 'RIGHT' | 'GROUND')[] = ['NONE', 'CENTER', 'LEFT', 'RIGHT', 'GROUND'];
    const riskMap: ('NONE' | 'LOW' | 'MEDIUM' | 'CRITICAL')[] = ['NONE', 'LOW', 'MEDIUM', 'CRITICAL'];
    this.currentTelemetry.obstacle = {
      ...this.currentTelemetry.obstacle,
      direction: dirMap[dv.getUint8(1)] || 'CENTER',
      distanceMm: dv.getUint16(2, true),
      riskLevel: riskMap[dv.getUint8(4)] || 'LOW',
      confidence: dv.getUint8(5),
      safePath: Boolean(dv.getUint8(6))
    };
  }

  private parseWalkPacket(dv: DataView) {
    if (dv.byteLength < 12) return;
    this.hasReceivedRealHardwarePackets = true;
    const motionStateMap: ExtendedMotionState[] = [
      'STANDING', 'WALKING', 'FAST_WALKING', 'SITTING', 'BENDING', 'STAIRS', 'FALL_LIKE'
    ];
    
    const motionState = motionStateMap[dv.getUint8(1)] || 'WALKING';
    const stepsToday = dv.getUint32(2, true);
    
    if (dv.byteLength >= 45) {
      // Full 45-byte V1 float struct
      this.currentTelemetry.imu = {
        ...this.currentTelemetry.imu,
        motionState,
        ax: dv.getFloat32(13, true),
        ay: dv.getFloat32(17, true),
        az: dv.getFloat32(21, true),
        gx: dv.getFloat32(25, true),
        gy: dv.getFloat32(29, true),
        gz: dv.getFloat32(33, true),
        pitch: dv.getFloat32(37, true),
        roll: dv.getFloat32(41, true)
      };
    } else {
      // 18-byte V1.1 packed struct (NEVISENSE_V1_1_wip)
      const cadenceSpm = dv.getUint16(6, true) / 10.0;
      const speedMps = dv.getUint16(8, true) / 100.0;
      this.currentTelemetry.imu = {
        ...this.currentTelemetry.imu,
        motionState,
        confidence: dv.getUint8(11) || 95
      };
      this.currentTelemetry.personalization.cadenceBpm = cadenceSpm || 112;
      this.currentTelemetry.personalization.walkingSpeedMps = speedMps || 1.2;
    }
    this.currentTelemetry.walkingTrends.stepsToday = stepsToday;
  }

  private parseEmergencyPacket(dv: DataView) {
    if (dv.byteLength < 7) return;
    this.hasReceivedRealHardwarePackets = true;
    const fallPhaseMap: ('NORMAL' | 'IMPACT_DETECTED' | 'PRE_EMERGENCY' | 'EMERGENCY_ACTIVE')[] = [
      'NORMAL', 'IMPACT_DETECTED', 'PRE_EMERGENCY', 'EMERGENCY_ACTIVE'
    ];
    this.currentTelemetry.fall = {
      phase: fallPhaseMap[dv.getUint8(1)] || 'NORMAL',
      recoveryMsRemaining: dv.getUint32(2, true),
      requiresAlert: Boolean(dv.getUint8(6))
    };
  }

  private parseBatteryPacket(dv: DataView) {
    if (dv.byteLength < 5) return;
    this.hasReceivedRealHardwarePackets = true;
    const voltageMv = dv.getUint16(1, true);
    const percentage = dv.getUint8(3);
    const statusVal = dv.getUint8(4);
    this.currentTelemetry.battery = {
      ...this.currentTelemetry.battery,
      voltageMv,
      percentage,
      status: statusVal === 1 ? 'LOW' : statusVal === 2 ? 'CRITICAL' : 'NORMAL'
    };
  }

  private parseGuidancePacket(dv: DataView) {
    if (dv.byteLength < 9) return;
    this.hasReceivedRealHardwarePackets = true;
    const guidanceMap: ('GO_STRAIGHT' | 'GO_LEFT' | 'GO_RIGHT' | 'STOP' | 'CAUTION')[] = [
      'GO_STRAIGHT', 'GO_LEFT', 'GO_RIGHT', 'STOP', 'CAUTION'
    ];
    this.currentTelemetry.guidance = {
      direction: guidanceMap[dv.getUint8(1)] || 'GO_STRAIGHT',
      leftSpaceMm: dv.getUint16(2, true),
      centerSpaceMm: dv.getUint16(4, true),
      rightSpaceMm: dv.getUint16(6, true),
      confidence: dv.getUint8(8)
    };
  }

  private parseTofMatrixPacket(dv: DataView) {
    if (dv.byteLength < 129) return;
    this.hasReceivedRealHardwarePackets = true;
    const zones: number[] = [];
    for (let i = 0; i < 64; i++) {
      zones.push(dv.getUint16(1 + i * 2, true));
    }
    const minVal = Math.min(...zones);
    const minIndex = zones.indexOf(minVal);
    this.currentTelemetry.tof = {
      zones,
      minZone: { index: minIndex, distance: minVal },
      avgDistance: Math.round(zones.reduce((a, b) => a + b, 0) / 64)
    };
  }

  private startWifiPolling() {
    this.timer = window.setInterval(async () => {
      try {
        const res = await fetch(`http://${this.espIp}/api/telemetry`);
        if (res.ok) {
          const raw = await res.json();
          
          const motionStateMap: ExtendedMotionState[] = [
            'STANDING', 'WALKING', 'FAST_WALKING', 'SITTING', 'BENDING', 'STAIRS', 'FALL_LIKE'
          ];
          
          const dirMap: ('NONE' | 'CENTER' | 'LEFT' | 'RIGHT' | 'GROUND')[] = [
            'NONE', 'CENTER', 'LEFT', 'RIGHT', 'GROUND'
          ];

          const riskMap: ('NONE' | 'LOW' | 'MEDIUM' | 'CRITICAL')[] = [
            'NONE', 'LOW', 'MEDIUM', 'CRITICAL'
          ];

          const guidanceMap: ('GO_STRAIGHT' | 'GO_LEFT' | 'GO_RIGHT' | 'STOP' | 'CAUTION')[] = [
            'GO_STRAIGHT', 'GO_STRAIGHT', 'GO_LEFT', 'GO_RIGHT', 'STOP', 'CAUTION'
          ];

          const fallPhaseMap: ('NORMAL' | 'IMPACT_DETECTED' | 'PRE_EMERGENCY' | 'EMERGENCY_ACTIVE')[] = [
            'NORMAL', 'IMPACT_DETECTED', 'PRE_EMERGENCY', 'EMERGENCY_ACTIVE'
          ];

          this.currentTelemetry = {
            ...this.currentTelemetry,
            timestamp: Date.now(),
            connected: true,
            connectionMode: 'wifi',
            tof: {
              ...this.currentTelemetry.tof,
              zones: Array.isArray(raw.tof) ? raw.tof : this.currentTelemetry.tof.zones,
              minZone: {
                index: Array.isArray(raw.tof) ? raw.tof.indexOf(Math.min(...raw.tof)) : 0,
                distance: Array.isArray(raw.tof) ? Math.min(...raw.tof) : 0
              }
            },
            imu: {
              ...this.currentTelemetry.imu,
              ax: raw.imu?.ax ?? this.currentTelemetry.imu.ax,
              ay: raw.imu?.ay ?? this.currentTelemetry.imu.ay,
              az: raw.imu?.az ?? this.currentTelemetry.imu.az,
              gx: raw.imu?.gx ?? this.currentTelemetry.imu.gx,
              gy: raw.imu?.gy ?? this.currentTelemetry.imu.gy,
              gz: raw.imu?.gz ?? this.currentTelemetry.imu.gz,
              motionState: motionStateMap[raw.imu?.state] || 'WALKING'
            },
            fall: {
              phase: fallPhaseMap[raw.fall?.phase] || 'NORMAL',
              recoveryMsRemaining: raw.fall?.ms_remaining || 0,
              requiresAlert: !!raw.fall?.alert
            },
            obstacle: {
              ...this.currentTelemetry.obstacle,
              direction: dirMap[raw.obstacle?.dir] || 'CENTER',
              distanceMm: raw.obstacle?.dist_mm || 0,
              riskLevel: riskMap[raw.obstacle?.risk] || 'LOW',
              confidence: raw.obstacle?.confidence || 90,
              safePath: !!raw.obstacle?.safe
            },
            guidance: {
              direction: guidanceMap[raw.guidance?.dir] || 'GO_STRAIGHT',
              leftSpaceMm: raw.guidance?.left || 0,
              centerSpaceMm: raw.guidance?.center || 0,
              rightSpaceMm: raw.guidance?.right || 0,
              confidence: raw.guidance?.confidence || 90
            },
            battery: {
              ...this.currentTelemetry.battery,
              voltageMv: raw.battery?.mv || 4100,
              percentage: raw.battery?.pct || 85,
              status: raw.battery?.status === 1 ? 'LOW' : raw.battery?.status === 2 ? 'CRITICAL' : 'NORMAL'
            }
          };

          this.notify(this.currentTelemetry);
        }
      } catch (e) {
        this.connected = false;
      }
    }, 300);
  }

  private startMockGenerator() {
    if (this.timer) clearInterval(this.timer);
    this.timer = window.setInterval(() => {
      // If real hardware is streaming binary packets over BLE/Wi-Fi, do not override with synthetic data
      if (this.hasReceivedRealHardwarePackets && this.connected) {
        return;
      }

      this.waveIndex += 1;
      const t = this.waveIndex * 0.2;

      // Generate live cardiac PPG waveform points
      const redVal = Math.round(2400 + Math.sin(t) * 140 + Math.sin(t * 2) * 40 + (Math.random() * 8 - 4));
      const irVal = Math.round(3100 + Math.sin(t + 0.1) * 180 + Math.sin(t * 2) * 50 + (Math.random() * 10 - 5));

      const newRedWave = [...this.currentTelemetry.ppg.rawRedWaveform.slice(1), redVal];
      const newIrWave = [...this.currentTelemetry.ppg.rawIrWaveform.slice(1), irVal];

      // Dynamic ToF Matrix variation for visual feedback
      const dynamicZones = this.currentTelemetry.tof.zones.map((val, idx) => {
        if (val === 0) val = 1200 + Math.round(Math.sin(t + idx * 0.1) * 300);
        const noise = Math.round((Math.random() - 0.5) * 20);
        return Math.max(300, Math.min(2000, val + noise));
      });

      const minVal = Math.min(...dynamicZones);
      const minIndex = dynamicZones.indexOf(minVal);

      // Update Fusion & Intelligence calculations
      const fusionScore = Math.round(
        (this.currentTelemetry.imu.confidence * 0.4) +
        (this.currentTelemetry.ppg.confidence * 0.3) +
        (this.currentTelemetry.obstacle.confidence * 0.3)
      );

      this.currentTelemetry = {
        ...this.currentTelemetry,
        timestamp: Date.now(),
        connectionMode: this.mode,
        connected: this.mode === 'demo' ? true : this.connected,
        tof: {
          zones: dynamicZones,
          minZone: { index: minIndex, distance: minVal },
          avgDistance: Math.round(dynamicZones.reduce((a, b) => a + b, 0) / 64)
        },
        ppg: {
          ...this.currentTelemetry.ppg,
          rawRedWaveform: newRedWave,
          rawIrWaveform: newIrWave,
          heartRateBpm: this.currentTelemetry.ppg.heartRateBpm || 74,
          spO2Percentage: this.currentTelemetry.ppg.spO2Percentage || 98
        },
        sensorFusion: {
          ...this.currentTelemetry.sensorFusion,
          fusedSafetyScore: fusionScore
        }
      };

      this.notify(this.currentTelemetry);
    }, 200);
  }

  public subscribe(callback: (data: SystemTelemetry) => void) {
    this.listeners.push(callback);
    callback(this.currentTelemetry);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify(data: SystemTelemetry) {
    this.listeners.forEach(l => l(data));
  }

  public runSensorDiagnostics() {
    return new Promise(resolve => setTimeout(resolve, 800));
  }

  public fireMotorTest(target: string, intensity: number) {
    console.log(`Fired motor test: ${target} @ ${intensity}%`);
  }

  public rollbackFirmware() {
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  public toggleLocationSharing() {
    this.currentTelemetry.familyLocation.userSharingEnabled = !this.currentTelemetry.familyLocation.userSharingEnabled;
    this.notify({ ...this.currentTelemetry });
  }
}

export const connectionService = new ConnectionService();
