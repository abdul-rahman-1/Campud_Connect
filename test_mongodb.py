#!/usr/bin/env python3
"""Quick test to verify MongoDB data"""

from water_monitoring_system import WaterMonitoringSystem

system = WaterMonitoringSystem()

# Get last reading
reading = system.get_last_reading('TANK_B1_01')
if reading:
    print('✅ LATEST READING STORED IN MONGODB:')
    print('=' * 70)
    print(f'Unit: {reading.get("unit_id")}')
    print(f'Building: {reading.get("building")}')
    print(f'Location: {reading.get("location")}')
    print(f'Timestamp: {reading.get("timestamp")}')
    print()
    print('SENSOR DATA:')
    sensor = reading.get('sensor', {})
    print(f'  Voltage: {sensor.get("voltage_V"):.3f}V')
    print(f'  Pressure: {sensor.get("pressure_MPa"):.6f}MPa')
    print(f'  MAC Address: {sensor.get("mac_address")}')
    print(f'  Status: {sensor.get("http_status")}')
    print()
    print('CALCULATED VALUES:')
    calc = reading.get('calculated', {})
    print(f'  Water Height: {calc.get("height_m"):.4f}m')
    print(f'  Water Volume: {calc.get("volume_liters"):.1f} liters')
    print(f'  Water Level: {calc.get("level_percentage"):.2f}%')
else:
    print('No readings found')

print()
print('🚨 ACTIVE ALERTS:')
print('=' * 70)
alerts = system.get_recent_alerts(hours=24)
if alerts:
    for alert in alerts:
        print(f'Unit: {alert.get("unit_id")}')
        print(f'Type: {alert.get("alert_type")}')
        print(f'Severity: {alert.get("severity")}')
        print(f'Level: {alert.get("level_percentage"):.1f}%')
        print(f'Time: {alert.get("timestamp")}')
        print(f'Acknowledged: {alert.get("acknowledged")}')
        print()
else:
    print('No recent alerts')
