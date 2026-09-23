export type ConnectionMode = 'wifi' | 'ble' | 'serial' | 'demo';

export type ExtendedMotionState = 
  | 'STANDING' 
  | 'WALKING' 
  | 'FAST_WALKING' 
  | 'RUNNING' 
  | 'SITTING' 
  | 'FAST_SITTING' 
  | 'BENDING' 
  | 'STAIRS' 
  | 'FALL_LIKE' 
  | 'DEVICE_DROP' 
  | 'UNKNOWN';

export interface TofData {
  zones: number[]; // 64 length (8x8 matrix)
  minZone: { index: number; distance: number };
  avgDistance: number;
}

export interface ImuData {
  ax: number;
  ay: number;
  az: number;
  gx: number;
  gy: number;
  gz: number;
  pitch: number;
  roll: number;
  gForce: number;
  motionState: ExtendedMotionState;
  confidence: number;
  samplingRateHz: number;
  windowSizeMs: number;
  inferenceLatencyMs: number;
  modelVersion: string;
}

export interface PpgData {
  heartRateBpm: number;
  spO2Percentage: number;
  rawRedWaveform: number[];
  rawIrWaveform: number[];
  ppgSignalQuality: number; // 0-100%
  contactQuality: 'EXCELLENT' | 'GOOD' | 'POOR' | 'NO_CONTACT';
  motionInterference: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  embedding512dHash: string; // PaPaGei 512-D feature vector hash
  modelName: string;
  inferenceLatencyMs: number;
  isSensorConnected: boolean;
  intelligenceStatus?: string;
}

export interface FallState {
  phase: 'NORMAL' | 'IMPACT_DETECTED' | 'PRE_EMERGENCY' | 'EMERGENCY_ACTIVE';
  recoveryMsRemaining: number;
  requiresAlert: boolean;
  lastIncidentTime?: number;
}

export interface ObstacleState {
  direction: 'CENTER' | 'LEFT' | 'RIGHT' | 'GROUND' | 'NONE';
  distanceMm: number;
  filteredDistanceMm: number;
  rawDistanceMm: number;
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'CRITICAL';
  confidence: number;
  safePath: boolean;
  zoneClassification: 'FAR' | 'MID' | 'NEAR' | 'GROUND' | 'IMMINENT';
  hazardClassification: 'NONE' | 'OVERHEAD_BARRIER' | 'LOW_OBSTACLE' | 'DROP_OFF' | 'STAIR_ASCENT';
}

export interface GuidanceState {
  direction: 'GO_STRAIGHT' | 'GO_LEFT' | 'GO_RIGHT' | 'STOP' | 'CAUTION';
  leftSpaceMm: number;
  centerSpaceMm: number;
  rightSpaceMm: number;
  confidence: number;
}

export interface BatteryData {
  voltageMv: number;
  percentage: number;
  status: 'NORMAL' | 'LOW' | 'CRITICAL';
  isCharging?: boolean;
  currentConsumptionMa: number;
  estimatedRemainingMins: number;
  blePowerState: 'ACTIVE_CONNECTED' | 'LOW_POWER_SCAN' | 'OFF';
  gpsPowerState: 'HIGH_PRECISION' | 'ADAPTIVE_POLL' | 'SLEEP';
  ppgPowerState: 'CONTINUOUS' | 'PULSED' | 'OFF';
}

export interface SensorHealth {
  vl53l5cx: boolean;
  mpu6050: boolean;
  max30102: boolean;
  i2c: boolean;
  ble: boolean;
  battery: boolean;
  motors: boolean;
}

export interface AlgorithmDebugStep {
  id: string;
  name: string;
  status: 'PASS' | 'WARN' | 'FAIL' | 'ACTIVE';
  rawInput: string;
  processedOutput: string;
  explanation: string;
}

export interface FirmwareInfo {
  currentFirmware: string;
  version: string;
  buildDate: string;
  hardwareRev: string;
  updateAvailable: boolean;
  latestVersion?: string;
}

export interface AiModelMetrics {
  modelVersion: string;
  imuModelVersion: string;
  ppgModelVersion: string;
  datasetVersion: string;
  personalProfileVersion: string;
  trainingSamplesCount: number;
  feedbackCount: number;
  confidence: number; // e.g. 96.4
  falsePositiveRate: number; // e.g. 1.2
  falseNegativeRate: number; // e.g. 0.4
  detectionRate: number; // e.g. 98.8
  modelDrift: number; // e.g. 0.03
}

export interface FamilyLocation {
  latitude: number;
  longitude: number;
  address: string;
  accuracyMeters: number;
  lastUpdated: number;
  userSharingEnabled: boolean;
  gpsPollingMode: 'STATIONARY' | 'KNOWN_ROUTE' | 'UNKNOWN_ROUTE' | 'EMERGENCY_FREQUENT' | 'ADAPTIVE_POLL';
  distanceTodayKm: number;
  familiarPlacesCount: number;
}

export interface WalkingTrends {
  stepsToday: number;
  activeMinutes: number;
  distanceKm: number;
  weeklySteps: { day: string; steps: number }[];
}

export interface AiIntelligenceState {
  currentActivity: ExtendedMotionState;
  activityConfidence: number;
  movementStability: number; // 0-100%
  personalBaselineMatch: number; // 0-100%
  fallStatus: 'NORMAL' | 'FALL_LIKE_DETECTED' | 'FALL_CONFIRMED' | 'RECOVERED';
  imuAiStatus: 'ACTIVE_NORMAL' | 'HIGH_CONFIDENCE' | 'DEGRADED';
  ppgAiStatus: 'PaPaGei_EMBEDDING_OK' | 'MOTION_INTERFERENCE' | 'SEARCHING_CONTACT';
  overallSafetyState: 'SAFE' | 'CAUTION' | 'ALERT_MONITORING' | 'EMERGENCY';
}

export interface PersonalMovementProfile {
  isLearningMode: boolean;
  learningProgressPct: number;
  cadenceBpm: number;
  walkingSpeedMps: number;
  accelPatternVariance: number;
  rotationPatternVariance: number;
  turningPatternDegSec: number;
  sittingPatternDurationSec: number;
  bendingPatternDepthDeg: number;
  stairPatternStepMs: number;
  normalMovementRangePct: number;
  profileLastTrainedDate: string;
  optInPersonalization: boolean;
}

export interface SensorFusionState {
  imuConfidencePct: number;
  ppgConfidencePct: number;
  gpsConfidencePct: number;
  firmwareEventConfidencePct: number;
  fusedContext: 'NORMAL_WALKING' | 'STAIR_ASCENT' | 'UNUSUAL_MOVEMENT' | 'RECOVERY_MONITORING' | 'SUSPECTED_FALL' | 'EMERGENCY';
  fusedSafetyScore: number; // 0-100
}

export type IncidentEventType = 
  | 'MANUAL_SOS' 
  | 'FALL' 
  | 'FALL_LIKE' 
  | 'GROUND_HAZARD' 
  | 'UNUSUAL_MOVEMENT' 
  | 'SENSOR_FAILURE' 
  | 'BLE_DISCONNECT';

export interface IncidentEvent {
  id: string;
  timestamp: number;
  eventType: IncidentEventType;
  confidence: number;
  sensorContext: {
    activity: ExtendedMotionState;
    heartRateBpm: number;
    gForce: number;
    nearestObstacleMm: number;
    locationAddress: string;
  };
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  userResponse: 'PENDING' | 'CONFIRMED' | 'FALSE_ALARM' | 'AUTO_RESOLVED';
  falseAlarmReason?: string;
  finalOutcome: 'RESOLVED_SAFE' | 'EMERGENCY_DISPATCHED' | 'USER_DISMISSED' | 'MONITORING';
}

export type HapticProfileMode = 'STANDARD' | 'INDOOR' | 'OUTDOOR' | 'QUIET' | 'HIGH_ALERT' | 'CUSTOM';

export interface HapticProfileSettings {
  activeProfile: HapticProfileMode;
  motorIntensityPct: number;
  vibrationPattern: 'PULSE' | 'CONTINUOUS' | 'HARMONIC';
  audioEnabled: boolean;
  groundHazardIntensityPct: number;
  emergencyIntensityPct: number;
}

export interface PrivacyDataControls {
  locationPermission: boolean;
  movementDataPermission: boolean;
  ppgDataPermission: boolean;
  caregiverSharingPermission: boolean;
  storageOption: 'LOCAL_ONLY' | 'ENCRYPTED_CLOUD';
  personalizationOptIn: boolean;
}

export type DemoScenario = 
  | 'NORMAL_WALKING' 
  | 'FAST_WALKING' 
  | 'SITTING' 
  | 'FAST_SITTING' 
  | 'BENDING' 
  | 'STAIRS' 
  | 'FALL' 
  | 'FALL_RECOVERY' 
  | 'FALL_EMERGENCY' 
  | 'GROUND_HAZARD' 
  | 'OVERHEAD_OBSTACLE' 
  | 'POOR_PPG' 
  | 'HIGH_HR' 
  | 'LOW_PPG_QUALITY' 
  | 'BLE_DISCONNECT' 
  | 'SENSOR_FAILURE';

export interface SystemTelemetry {
  timestamp: number;
  connected: boolean;
  connectionMode: ConnectionMode;
  tof: TofData;
  imu: ImuData;
  ppg: PpgData;
  fall: FallState;
  obstacle: ObstacleState;
  guidance: GuidanceState;
  battery: BatteryData;
  sensorHealth: SensorHealth;
  firmware: FirmwareInfo;
  aiMetrics: AiModelMetrics;
  intelligence: AiIntelligenceState;
  personalization: PersonalMovementProfile;
  sensorFusion: SensorFusionState;
  incidents: IncidentEvent[];
  hapticProfile: HapticProfileSettings;
  privacy: PrivacyDataControls;
  familyLocation: FamilyLocation;
  walkingTrends: WalkingTrends;
  activeScenario?: DemoScenario;
}
