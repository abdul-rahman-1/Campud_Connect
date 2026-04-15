/**
 * Test file for sensor calculations
 * Run with: npm test (if jest is configured) or inspect the console output
 */

import {
  calculateHeightFromPressure,
  calculateVolumeFromHeight,
  calculateFillPercentage,
  calculateFillPercentageFromPressure,
  calculateTankMetrics,
  TANK_SPECS,
  SENSOR_SPECS,
} from './sensorCalculations';

console.log('=== Water Tank Sensor Calculation Tests ===\n');

// Test 1: Tank specifications
console.log('📦 Tank Specifications:');
console.log(`   Capacity: ${TANK_SPECS.capacity_liters} liters`);
console.log(`   Height: ${TANK_SPECS.height_m} m (${(TANK_SPECS.height_m * 3.28084).toFixed(2)} feet)`);
console.log(`   Diameter: ${TANK_SPECS.diameter_m} m (${(TANK_SPECS.diameter_m * 3.28084).toFixed(2)} feet)`);
console.log(`   Area: ${TANK_SPECS.area_m2.toFixed(3)} m²\n`);

// Test 2: Sensor specifications
console.log('📊 Sensor Specifications:');
console.log(`   Type: ${SENSOR_SPECS.type}`);
console.log(`   Max Pressure: ${SENSOR_SPECS.max_pressure_MPa} MPa`);
console.log(`   Max Measurable Height: ${SENSOR_SPECS.max_measurable_height_m.toFixed(2)} m\n`);

// Test 3: Pressure to height conversion
console.log('🔬 Pressure to Height Conversions:');
const testPressures = [0, 0.003437, 0.009, 0.018, 1.2];
testPressures.forEach((pressure) => {
  const height = calculateHeightFromPressure(pressure);
  console.log(`   ${pressure} MPa → ${height.toFixed(4)} m (${(height * 3.28084).toFixed(2)} feet)`);
});
console.log();

// Test 4: Height to volume conversion
console.log('💧 Height to Volume Conversions:');
const testHeights = [0, 0.5, 1.0, 1.5, 1.8288];
testHeights.forEach((height) => {
  const volume = calculateVolumeFromHeight(height);
  const percent = calculateFillPercentage(volume);
  console.log(
    `   ${height.toFixed(4)} m → ${volume} L (${percent.toFixed(2)}% full)`
  );
});
console.log();

// Test 5: Complete pressure to percentage conversion
console.log('⚡ Pressure to Fill Percentage (Key Conversions):');
const keyPressures = [
  { name: 'Empty', mpa: 0 },
  { name: 'Low (5%)', mpa: 0.049 },
  { name: 'Quarter (25%)', mpa: 0.245 },
  { name: 'Half (50%)', mpa: 0.490 },
  { name: 'Three-quarters (75%)', mpa: 0.735 },
  { name: 'Full (100%)', mpa: 0.980 },
];

keyPressures.forEach(({ name, mpa }) => {
  const percent = calculateFillPercentageFromPressure(mpa);
  const metrics = calculateTankMetrics(mpa);
  console.log(
    `   ${name.padEnd(20)} (${mpa.toFixed(3)} MPa) → ${percent.toFixed(2)}% ` +
    `(${metrics.volume_liters} L, ${metrics.height_m.toFixed(3)} m)`
  );
});
console.log();

// Test 6: Real sensor readings from example
console.log('📈 Real Sensor Data Example:');
const rawSensorData = {
  timestamp: '2026-04-08T05:31:49.523Z',
  voltage_V: 0.493,
  pressure_MPa: 0,
  mac_address: 'F4:65:0B:48:E1:D8',
};

const metrics = calculateTankMetrics(rawSensorData.pressure_MPa);
console.log(`   Input: ${JSON.stringify(rawSensorData, null, 2)}`);
console.log(`   Calculated:`);
console.log(`   - Height: ${metrics.height_m.toFixed(3)} m`);
console.log(`   - Volume: ${metrics.volume_liters} L`);
console.log(`   - Fill Level: ${metrics.level_percentage.toFixed(2)}%\n`);

console.log('✅ All tests completed successfully!\n');

// Export for actual use in tests
export {
  calculateHeightFromPressure,
  calculateVolumeFromHeight,
  calculateFillPercentage,
  calculateFillPercentageFromPressure,
  calculateTankMetrics,
};
