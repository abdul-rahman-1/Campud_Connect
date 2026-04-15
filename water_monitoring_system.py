"""
Water Tank Level Monitoring System
Fetches pressure sensor data from ESP32 units via HTTP every 30 minutes
Stores data in MongoDB and generates alerts
"""

import requests
import json
import time
from datetime import datetime, timedelta
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import logging
from typing import Dict, List, Tuple, Any, Optional
import math
from threading import Thread
from queue import Queue

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('water_monitoring.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ============== CONFIGURATION ==============

# MongoDB Configuration
MONGO_URI = "mongodb+srv://AdminClint0001:uTYZ4fPph7whTpXC@cluster0.eifjnhd.mongodb.net/"
DB_NAME = "water_monitoring"
COLLECTION_READINGS = "pressure_readings"
COLLECTION_ALERTS = "alerts"

# Monitoring Configuration
FETCH_INTERVAL = 30 * 60  # 30 minutes in seconds
ALERT_THRESHOLD_LOW = 20  # Percentage

# Tank Configurations (can handle different tank sizes per building)
# Format: "unit_id": {"diameter_m": float, "height_m": float, "capacity_liters": float, "ip": str, "building": str}
UNIT_CONFIGS = {
    "TANK_B1_01": {
        "diameter_m": 1.829,  # 6 feet
        "height_m": 1.829,    # 6 feet
        "capacity_liters": 5000,
        "ip": "172.25.52.247",
        "building": "Building_A",
        "location": "Roof_Tank_1",
        "sensor_offset_V": 0.40  # Voltage when no pressure (both tanks balanced)
    },
    "TANK_B1_02": {
        "diameter_m": 1.829,
        "height_m": 1.829,
        "capacity_liters": 5000,
        "ip": "192.168.1.100",  # Example IP for second tank
        "building": "Building_A",
        "location": "Roof_Tank_2",
        "sensor_offset_V": 0.40
    },
    # Add more units up to 17 as needed
    # "TANK_B2_01": {...},
    # "TANK_B2_02": {...},
}

# ============== PRESSURE TO WATER LEVEL CALCULATIONS ==============

class PressureCalculator:
    """
    Converts pressure readings to water level measurements
    Pressure sensor: G 1/4" 1.2MPa (0.5-4.5V output)
    """
    
    # Sensor calibration constants
    VOLTAGE_MIN = 0.5      # Voltage at 0 MPa
    VOLTAGE_MAX = 4.5      # Voltage at 1.2 MPa
    PRESSURE_MAX_MPA = 1.2 # Maximum pressure in MPa
    PRESSURE_MAX_PA = 1.2e6  # Maximum pressure in Pascal
    
    # Water properties
    WATER_DENSITY = 1000   # kg/m³
    GRAVITY = 9.81         # m/s²
    
    @staticmethod
    def voltage_to_pressure_mpa(voltage: float) -> float:
        """
        Convert sensor voltage to pressure in MPa
        Linear mapping: 0.5V = 0 MPa, 4.5V = 1.2 MPa
        """
        if voltage < PressureCalculator.VOLTAGE_MIN:
            return 0.0
        if voltage > PressureCalculator.VOLTAGE_MAX:
            return PressureCalculator.PRESSURE_MAX_MPA
        
        # Linear interpolation
        pressure_mpa = (voltage - PressureCalculator.VOLTAGE_MIN) * \
                       (PressureCalculator.PRESSURE_MAX_MPA / 
                        (PressureCalculator.VOLTAGE_MAX - PressureCalculator.VOLTAGE_MIN))
        return max(0, pressure_mpa)
    
    @staticmethod
    def voltage_to_pressure_pa(voltage: float) -> float:
        """Convert voltage to pressure in Pascal"""
        return PressureCalculator.voltage_to_pressure_mpa(voltage) * 1e6
    
    @staticmethod
    def pressure_to_height_m(pressure_pa: float) -> float:
        """
        Convert pressure to water column height
        P = ρ * g * h
        h = P / (ρ * g)
        
        Returns height in meters
        """
        if pressure_pa <= 0:
            return 0.0
        
        height = pressure_pa / (PressureCalculator.WATER_DENSITY * PressureCalculator.GRAVITY)
        return height
    
    @staticmethod
    def height_to_volume_liters(height_m: float, diameter_m: float) -> float:
        """
        Calculate volume in liters from height
        V = π * r² * h
        1 m³ = 1000 liters
        """
        radius_m = diameter_m / 2
        volume_m3 = math.pi * (radius_m ** 2) * height_m
        volume_liters = volume_m3 * 1000
        return volume_liters
    
    @staticmethod
    def water_level_percentage(volume_liters: float, tank_capacity_liters: float) -> float:
        """Calculate water level as percentage of tank capacity"""
        if tank_capacity_liters <= 0:
            return 0.0
        percentage = (volume_liters / tank_capacity_liters) * 100
        return min(100, max(0, percentage))  # Clamp between 0-100%


class WaterMonitoringSystem:
    """Main monitoring system that fetches data and manages alerts"""
    
    def __init__(self):
        """Initialize MongoDB connection and validation"""
        try:
            self.client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            # Verify connection
            self.client.admin.command('ping')
            logger.info("✓ MongoDB connection successful")
            
            self.db = self.client[DB_NAME]
            self.readings_collection = self.db[COLLECTION_READINGS]
            self.alerts_collection = self.db[COLLECTION_ALERTS]
            
            # Create indexes for better query performance
            self.readings_collection.create_index([("unit_id", 1), ("timestamp", -1)])
            self.alerts_collection.create_index([("unit_id", 1), ("timestamp", -1)])
            
        except ConnectionFailure as e:
            logger.error(f"✗ MongoDB connection failed: {e}")
            raise
    
    def fetch_sensor_data(self, unit_id: str, unit_config: Dict) -> Dict:
        """
        Fetch sensor data from ESP32 via HTTP
        Returns: {voltage_V, pressure_MPa, mac_address, timestamp, http_status}
        """
        try:
            url = f"http://{unit_config['ip']}/data"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            data['timestamp'] = datetime.utcnow().isoformat()
            data['http_status'] = 'success'
            data['unit_id'] = unit_id
            
            logger.info(f"✓ {unit_id} - Voltage: {data.get('voltage_V', 0):.3f}V, "
                       f"Pressure: {data.get('pressure_MPa', 0):.3f}MPa")
            
            return data
            
        except requests.exceptions.Timeout:
            logger.error(f"✗ {unit_id} - Request timeout")
            return {'unit_id': unit_id, 'http_status': 'timeout', 'timestamp': datetime.utcnow().isoformat()}
        except requests.exceptions.ConnectionError:
            logger.error(f"✗ {unit_id} - Connection error")
            return {'unit_id': unit_id, 'http_status': 'connection_error', 'timestamp': datetime.utcnow().isoformat()}
        except Exception as e:
            logger.error(f"✗ {unit_id} - Error: {e}")
            return {'unit_id': unit_id, 'http_status': 'error', 'error': str(e), 'timestamp': datetime.utcnow().isoformat()}
    
    def calculate_water_level(self, voltage: float, unit_config: Dict) -> Dict:
        """
        Calculate water level from voltage reading
        Returns: {pressure_mpa, height_m, volume_liters, level_percentage}
        """
        # Adjust voltage by sensor offset (when both tanks balanced)
        adjusted_voltage = voltage - unit_config.get('sensor_offset_V', 0.40)
        
        # Convert to pressure
        pressure_pa = PressureCalculator.voltage_to_pressure_pa(adjusted_voltage)
        
        # Convert pressure to water column height
        height_m = PressureCalculator.pressure_to_height_m(pressure_pa)
        
        # Cap height to tank height
        max_height = unit_config['height_m']
        height_m = min(height_m, max_height)
        
        # Calculate volume
        volume_liters = PressureCalculator.height_to_volume_liters(
            height_m, 
            unit_config['diameter_m']
        )
        
        # Calculate percentage
        level_percentage = PressureCalculator.water_level_percentage(
            volume_liters,
            unit_config['capacity_liters']
        )
        
        return {
            'voltage_V': voltage,
            'adjusted_voltage_V': adjusted_voltage,
            'pressure_mpa': PressureCalculator.voltage_to_pressure_mpa(adjusted_voltage),
            'height_m': height_m,
            'volume_liters': volume_liters,
            'level_percentage': level_percentage
        }
    
    def check_and_create_alerts(self, unit_id: str, unit_config: Dict, level_data: Dict) -> List[Dict]:
        """
        Check if alert conditions are met
        Returns: list of alert documents created
        """
        alerts_created = []
        level_pct = level_data['level_percentage']
        timestamp = datetime.utcnow()
        
        # Low water level alert
        if level_pct < ALERT_THRESHOLD_LOW:
            alert = {
                'unit_id': unit_id,
                'building': unit_config['building'],
                'location': unit_config.get('location', 'Unknown'),
                'alert_type': 'LOW_WATER_LEVEL',
                'severity': 'CRITICAL' if level_pct < 10 else 'WARNING',
                'level_percentage': level_pct,
                'volume_liters': level_data['volume_liters'],
                'timestamp': timestamp,
                'acknowledged': False
            }
            
            # Check if alert already exists (avoid duplicates in last 5 minutes)
            existing_alert = self.alerts_collection.find_one({
                'unit_id': unit_id,
                'alert_type': 'LOW_WATER_LEVEL',
                'timestamp': {'$gte': datetime.fromtimestamp(timestamp.timestamp() - 300)}  # Last 5 minutes
            })
            
            if not existing_alert:
                self.alerts_collection.insert_one(alert)
                alerts_created.append(alert)
                logger.warning(f"🚨 {unit_id} - LOW WATER ALERT: {level_pct:.1f}%")
        
        return alerts_created
    
    def store_reading(self, unit_id: str, unit_config: Dict, sensor_data: Dict, level_data: Dict) -> bool:
        """Store reading in MongoDB"""
        try:
            document = {
                'unit_id': unit_id,
                'building': unit_config['building'],
                'location': unit_config.get('location', 'Unknown'),
                'timestamp': datetime.fromisoformat(sensor_data['timestamp']),
                'sensor': {
                    'voltage_V': sensor_data.get('voltage_V'),
                    'pressure_MPa': sensor_data.get('pressure_MPa'),
                    'mac_address': sensor_data.get('mac_address'),
                    'http_status': sensor_data.get('http_status')
                },
                'calculated': {
                    'adjusted_voltage_V': level_data.get('adjusted_voltage_V'),
                    'height_m': level_data.get('height_m'),
                    'volume_liters': level_data.get('volume_liters'),
                    'level_percentage': level_data.get('level_percentage')
                }
            }
            
            result = self.readings_collection.insert_one(document)
            return bool(result.inserted_id)
            
        except Exception as e:
            logger.error(f"✗ {unit_id} - Error storing reading: {e}")
            return False
    
    def process_unit(self, unit_id: str, unit_config: Dict) -> Dict[str, Any]:
        """
        Process single unit: fetch data, calculate levels, check alerts, store
        Returns: processing result summary
        """
        result: Dict[str, Any] = {
            'unit_id': unit_id,
            'status': 'pending',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        try:
            # Fetch sensor data
            sensor_data = self.fetch_sensor_data(unit_id, unit_config)
            result['sensor_data'] = sensor_data
            
            # If fetch failed, return early
            if sensor_data.get('http_status') != 'success':
                result['status'] = 'error'
                return result
            
            # Calculate water level
            voltage = sensor_data.get('voltage_V', 0)
            level_data = self.calculate_water_level(voltage, unit_config)
            result['level_data'] = level_data
            
            # Check for alerts
            alerts = self.check_and_create_alerts(unit_id, unit_config, level_data)
            result['alerts_created'] = len(alerts)
            
            # Store in MongoDB
            stored = self.store_reading(unit_id, unit_config, sensor_data, level_data)
            result['stored'] = stored
            result['status'] = 'success'
            
        except Exception as e:
            logger.error(f"✗ {unit_id} - Processing failed: {e}")
            result['status'] = 'error'
            result['error'] = str(e)
        
        return result
    
    def run_monitoring_cycle(self):
        """
        Execute one complete monitoring cycle for all units
        """
        logger.info("=" * 60)
        logger.info(f"Starting monitoring cycle - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info("=" * 60)
        
        results = []
        for unit_id, unit_config in UNIT_CONFIGS.items():
            result = self.process_unit(unit_id, unit_config)
            results.append(result)
            time.sleep(1)  # Small delay between requests
        
        # Summary
        successful = sum(1 for r in results if r['status'] == 'success')
        logger.info(f"Cycle Complete: {successful}/{len(results)} units processed successfully")
        
        return results
    
    def start_continuous_monitoring(self):
        """
        Start continuous monitoring in a thread
        """
        def monitoring_loop():
            while True:
                try:
                    self.run_monitoring_cycle()
                    logger.info(f"Waiting {FETCH_INTERVAL//60} minutes until next cycle...")
                    time.sleep(FETCH_INTERVAL)
                except Exception as e:
                    logger.error(f"✗ Monitoring loop error: {e}")
                    time.sleep(60)  # Wait before retry
        
        thread = Thread(target=monitoring_loop, daemon=True)
        thread.start()
        logger.info("Continuous monitoring started (running in background)")
        
        return thread
    
    def get_last_reading(self, unit_id: str) -> Optional[Dict[str, Any]]:
        """Get the most recent reading for a unit"""
        return self.readings_collection.find_one(
            {'unit_id': unit_id},
            sort=[('timestamp', -1)]
        )
    
    def get_recent_alerts(self, unit_id: Optional[str] = None, hours: int = 24) -> List[Dict[str, Any]]:
        """Get recent alerts"""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        query: Dict[str, Any] = {'timestamp': {'$gte': cutoff_time}}
        if unit_id:
            query['unit_id'] = unit_id
        
        return list(self.alerts_collection.find(query).sort('timestamp', -1))


# ============== MAIN EXECUTION ==============

if __name__ == "__main__":
    try:
        # Verify all units have proper configuration
        logger.info(f"Configured units: {len(UNIT_CONFIGS)}")
        for unit_id, config in UNIT_CONFIGS.items():
            logger.info(f"  - {unit_id}: {config['building']} | IP: {config['ip']}")
        
        # Initialize system
        system = WaterMonitoringSystem()
        
        # Option 1: Run single cycle
        logger.info("\n>>> Running single monitoring cycle...")
        results = system.run_monitoring_cycle()
        
        # Print sample results
        for result in results:
            if result['status'] == 'success':
                level = result['level_data']['level_percentage']
                volume = result['level_data']['volume_liters']
                logger.info(f"{result['unit_id']}: {level:.1f}% ({volume:.0f}L)")
        
        # Option 2: Start continuous monitoring (uncomment to enable)
        # logger.info("\n>>> Starting continuous 24/7 monitoring...")
        # system.start_continuous_monitoring()
        # 
        # # Keep main thread alive
        # try:
        #     while True:
        #         time.sleep(1)
        # except KeyboardInterrupt:
        #     logger.info("Monitoring stopped by user")
        
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        raise
