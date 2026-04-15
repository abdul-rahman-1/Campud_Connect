/**
 * Water Tank Sensor Calculation Utilities
 * 
 * Tank Specifications:
 * - Volume: 5000 liters
 * - Height: 6 feet (1.8288 meters)
 * - Diameter: 6 feet (1.8288 meters)
 * - Shape: Cylindrical
 * 
 * Sensor: 1.2 MPa Stainless Steel Pressure Transducer
 * - Pressure-to-height conversion using hydrostatic pressure formula
 */

// ─── Tank Constants ───────────────────────────────────────────────────────────

const TANK_HEIGHT_M = 1.8288; // 6 feet in meters
const TANK_RADIUS_M = 0.9144; // 3 feet (diameter/2) in meters
const TANK_CAPACITY_LITERS = 5000;
const TANK_AREA_M2 = Math.PI * TANK_RADIUS_M * TANK_RADIUS_M; // ~2.625 m²

// ─── Physics Constants ────────────────────────────────────────────────────────

/** Water density at standard conditions (kg/m³) */
const WATER_DENSITY = 1000;

/** Gravitational acceleration (m/s²) */
const GRAVITY = 9.81;

/** Conversion factor: 1 MPa = 1,000,000 Pascals */
const PA_PER_MPA = 1_000_000;

// ─── Calculated Constants ────────────────────────────────────────────────────

/** Pressure per meter of water: ρ × g = 1000 × 9.81 = 9810 Pa/m */
const PA_PER_METER_WATER = WATER_DENSITY * GRAVITY;

// ─── Calculation Functions ────────────────────────────────────────────────────

/**
 * Calculate water height in meters from pressure reading
 * 
 * Formula: h = P / (ρ × g)
 * Where P is pressure in Pascals, ρ is water density (1000 kg/m³), g is 9.81 m/s²
 * 
 * @param pressureMPa - Pressure reading in MPa from sensor
 * @returns Water column height in meters
 */
export const calculateHeightFromPressure = (pressureMPa: number): number => {
  // Convert MPa to Pascals, then divide by pressure per meter
  const heightMeters = (pressureMPa * PA_PER_MPA) / PA_PER_METER_WATER;
  
  // Cap at tank height to avoid overflow (sensor can measure beyond tank capacity)
  return Math.min(Math.max(heightMeters, 0), TANK_HEIGHT_M);
};

/**
 * Calculate water volume in liters from height
 * 
 * Formula: V = π × r² × h (cylinder volume)
 * 
 * @param heightM - Water height in meters
 * @returns Water volume in liters
 */
export const calculateVolumeFromHeight = (heightM: number): number => {
  const volumeM3 = TANK_AREA_M2 * heightM;
  const volumeLiters = volumeM3 * 1000; // 1 m³ = 1000 liters
  return Math.round(volumeLiters);
};

/**
 * Calculate fill percentage from water volume
 * 
 * @param volumeLiters - Water volume in liters
 * @returns Fill percentage (0-100)
 */
export const calculateFillPercentage = (volumeLiters: number): number => {
  const percentage = (volumeLiters / TANK_CAPACITY_LITERS) * 100;
  return Math.round(percentage * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate fill percentage from pressure reading
 * Convenience function that combines height → volume → percentage conversion
 * 
 * @param pressureMPa - Pressure reading in MPa
 * @returns Fill percentage (0-100)
 */
export const calculateFillPercentageFromPressure = (
  pressureMPa: number
): number => {
  const heightM = calculateHeightFromPressure(pressureMPa);
  const volumeLiters = calculateVolumeFromHeight(heightM);
  return calculateFillPercentage(volumeLiters);
};

/**
 * Calculate all derived values from pressure reading
 * 
 * @param pressureMPa - Pressure reading in MPa
 * @returns Object containing height, volume, and fill percentage
 */
export const calculateTankMetrics = (pressureMPa: number) => {
  const height_m = calculateHeightFromPressure(pressureMPa);
  const volume_liters = calculateVolumeFromHeight(height_m);
  const level_percentage = calculateFillPercentage(volume_liters);
  
  return {
    height_m: Math.round(height_m * 1000) / 1000, // Round to 3 decimals
    volume_liters,
    level_percentage,
  };
};

// ─── Tank Specification Constants (for reference) ────────────────────────────

export const TANK_SPECS = {
  capacity_liters: TANK_CAPACITY_LITERS,
  height_m: TANK_HEIGHT_M,
  diameter_m: TANK_RADIUS_M * 2,
  radius_m: TANK_RADIUS_M,
  area_m2: TANK_AREA_M2,
} as const;

/**
 * Sensor Specifications
 * 1.2 MPa Stainless Steel Pressure Transducer
 */
export const SENSOR_SPECS = {
  max_pressure_MPa: 1.2,
  max_measurable_height_m: calculateHeightFromPressure(1.2),
  type: 'Stainless Steel Pressure Transducer',
} as const;
