import axios from 'axios';
import { calculateTankMetrics } from '../utils/sensorCalculations';
import type { TankReading } from '../types';

// Base URL: e.g. http://localhost:8338  (Water Monitoring API)
const BASE_URL =
  (import.meta.env.VITE_API_URL as string) || 'http://localhost:8338';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ─── ID helpers ──────────────────────────────────────────────────────────────

/**
 * Convert a 1-based fleet number to the unit_id format stored in MongoDB.
 * e.g.  1  →  "TANK_B01_01"
 *        16 →  "TANK_B16_01"
 */
export const tankNumberToUnitId = (n: number): string =>
  `TANK_B${String(n).padStart(2, '0')}_01`;

/**
 * Parse the /overall tank key ("tank01") into a 1-based fleet number.
 */
export const overallKeyToNumber = (key: string): number =>
  parseInt(key.replace('tank', ''), 10);

// ─── Data Transformation ─────────────────────────────────────────────────────

/**
 * Transform raw sensor reading to calculated TankReading
 * Calculates height, volume, and fill percentage from pressure reading
 */
const transformSensorReading = (rawReading: {
  timestamp: string;
  voltage_V: number;
  pressure_MPa: number;
  mac_address: string;
}): TankReading => {
  const metrics = calculateTankMetrics(rawReading.pressure_MPa);

  return {
    timestamp: rawReading.timestamp,
    voltage_V: rawReading.voltage_V,
    pressure_MPa: rawReading.pressure_MPa,
    mac_address: rawReading.mac_address,
    ...metrics,
  };
};

// ─── API Response Types ────────────────────────────────────────────────────────

/** Raw API response for /overall endpoint: tank fill percentages as strings */
export interface OverallResponse {
  success: boolean;
  timestamp: string;
  data: Record<string, string>; // { tank01: "79%", ..., alert_no: "02" }
}

/**
 * Raw API response format for /data/<unit_id>
 * Contains raw sensor data (pressure_MPa only, no pre-calculated height/volume)
 */
export interface RawTankDocResponse {
  success: boolean;
  timestamp: string;
  data: {
    _id: string;
    unit_id: string;
    status?: string;
    building?: string;
    location?: string;
    diameter_m?: number;
    height_m?: number;
    capacity_liters?: number;
    last_reading: {
      timestamp: string;
      voltage_V: number;
      pressure_MPa: number;
      mac_address: string;
      http_status?: string;
    };
    updated_at?: string;
  };
}

/**
 * Processed API response with calculated metrics
 * height_m, volume_liters, and level_percentage are calculated on frontend
 */
export interface TankDocResponse {
  success: boolean;
  timestamp: string;
  data: {
    _id: string;
    unit_id: string;
    status?: string;
    building?: string;
    location?: string;
    diameter_m?: number;
    height_m?: number;
    capacity_liters?: number;
    last_reading: TankReading; // Includes calculated metrics
    updated_at?: string;
  };
}

export interface HealthResponse {
  success: boolean;
  status: 'healthy' | 'unhealthy';
  database?: string;
  error?: string;
}

// ─── API Calls ─────────────────────────────────────────────────────────────

/** GET /overall - Fleet overview with tank fill percentages */
export const fetchOverall = async (): Promise<OverallResponse> => {
  const res = await api.get<OverallResponse>('/overall');
  return res.data;
};

/** GET /data/<unit_id> - Fetch single tank data with calculated metrics */
export const fetchTankData = async (unitId: string): Promise<TankDocResponse> => {
  try {
    const res = await api.get<RawTankDocResponse>(`/data/${unitId}`);

    // Transform raw sensor data to include calculated metrics
    return {
      success: res.data.success,
      timestamp: res.data.timestamp,
      data: {
        ...res.data.data,
        last_reading: transformSensorReading(res.data.data.last_reading),
      },
    };
  } catch (error) {
    // Fallback to _temp suffix if main ID fails
    if (!unitId.endsWith('_temp')) {
      const tempUnitId = `${unitId}_temp`;
      console.warn(
        `Fetch for ${unitId} failed. Trying fallback: ${tempUnitId}`
      );
      const res = await api.get<RawTankDocResponse>(`/data/${tempUnitId}`);

      return {
        success: res.data.success,
        timestamp: res.data.timestamp,
        data: {
          ...res.data.data,
          last_reading: transformSensorReading(res.data.data.last_reading),
        },
      };
    }
    throw error;
  }
};

/** GET /health - Health check */
export const fetchHealth = async (): Promise<HealthResponse> => {
  const res = await api.get<HealthResponse>('/health');
  return res.data;
};
