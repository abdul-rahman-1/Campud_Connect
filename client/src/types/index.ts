// Shared TypeScript types for the Water Monitoring frontend

/** Raw sensor reading from API */
export interface SensorReading {
  timestamp: string;
  voltage_V: number;
  pressure_MPa: number;
  mac_address: string;
}

/** A single sensor reading with calculated metrics (derived from raw sensor data) */
export interface TankReading extends SensorReading {
  /** Water height in metres (calculated from pressure_MPa) */
  height_m: number;
  /** Water volume in liters (calculated from height) */
  volume_liters: number;
  /** Fill percentage (0-100, calculated from volume) */
  level_percentage: number;
}

/** Full tank document returned by GET /data/<unit_id> */
export interface TankDoc {
  _id: string;
  unit_id: string;
  /** Optional metadata fields (may be included depending on API configuration) */
  status?: string;
  building?: string;
  location?: string;
  diameter_m?: number;
  /** Physical tank height in metres (stock tank spec: 1.8288 m / 6 feet) */
  height_m?: number;
  /** Tank capacity in liters (stock tank spec: 5000 L) */
  capacity_liters?: number;
  /** Last reading with raw sensor data (height/volume/percentage calculated on frontend) */
  last_reading: TankReading;
  updated_at?: string;
}

/** Parsed fleet data after transforming /overall response */
export interface FleetTankInfo {
  /** 1-based fleet number (1-16) */
  number: number;
  /** e.g. "TANK_B01_01" */
  unit_id: string;
  fill_percent: number;
}

/** Full parsed /overall payload */
export interface FleetOverallData {
  tanks: FleetTankInfo[];
  alert_count: number;
  timestamp: string;
}
