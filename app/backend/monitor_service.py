#!/usr/bin/env python3
"""
24x7 Water Tank Monitoring Service
Runs continuously on server to fetch ESP32 sensor data
Calculates water levels and stores in MongoDB
"""

import requests
import json
import time
import logging
from datetime import datetime, timedelta
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from threading import Thread
import signal
import sys
from typing import Dict, List, Any, Optional

# ============== LOGGING CONFIGURATION ==============

# Create logs directory if it doesn't exist
import os
if not os.path.exists('logs'):
    os.makedirs('logs')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/water_monitor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ============== CONFIGURATION ==============

# MongoDB Configuration
MONGO_URI = "mongodb+srv://AdminClint0001:uTYZ4fPph7whTpXC@cluster0.eifjnhd.mongodb.net/"
DB_NAME = "water_monitoring"
TANKS_COLLECTION = "tanks"
ALERTS_COLLECTION = "alerts"

# Monitoring Configuration
FETCH_INTERVAL = .02  # seconds (for testing - change to 30*60 for production 30 min)
ALERT_THRESHOLD_LOW = 20  # Percentage
REQUEST_TIMEOUT = 10  # seconds
CONFIG_FILE = "esp32_config.json"

# Load ESP32 devices from config file
def load_esp32_config():
    """Load ESP32 device configuration from JSON file"""
    try:
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r') as f:
                return json.load(f).get('devices', [])
    except Exception as e:
        logger.error(f"Failed to load ESP32 config: {e}")
    return []

# ============== PRESSURE CALCULATOR ==============

class PressureCalculator:
    """
    Converts pressure readings to water level measurements
    Pressure sensor: G 1/4" 1.2MPa (0.5-4.5V output)
    
    Calibration: 0.51V = 0L, 0.6V = 1875L
    After sensor offset (0.51V subtracted):
    - 0.0V adjusted → 0 MPa (empty)
    - 0.24V adjusted → ~0.018 MPa (full tank 5000L)
    """
    
    # Sensor calibration constants (FOR THIS SPECIFIC TANK)
    VOLTAGE_MIN = 0.0           # Adjusted voltage at 0 MPa
    VOLTAGE_MAX = 0.24          # Adjusted voltage at full tank pressure
    PRESSURE_MAX_MPA = 0.01793  # Maximum pressure in MPa (~0.018 for 1.829m water column)
    PRESSURE_MAX_PA = 17930     # Maximum pressure in Pascal
    
    # Water properties
    WATER_DENSITY = 1000        # kg/m³
    GRAVITY = 9.81              # m/s²
    
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


# ============== MONITORING SERVICE ==============

class WaterMonitoringService:
    """24x7 water tank monitoring service"""
    
    def __init__(self):
        """Initialize MongoDB connection"""
        try:
            self.client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            self.client.admin.command('ping')
            logger.info("✓ Connected to MongoDB")
            
            self.db = self.client[DB_NAME]
            self.tanks_collection = self.db[TANKS_COLLECTION]
            self.alerts_collection = self.db[ALERTS_COLLECTION]
            
            # Create indexes
            self.tanks_collection.create_index('unit_id')
            self.alerts_collection.create_index([('unit_id', 1), ('timestamp', -1)])
            
        except ConnectionFailure as e:
            logger.error(f"✗ MongoDB connection failed: {e}")
            raise
    
    def fetch_esp32_data(self, unit_id: str, ip_address: str) -> Optional[Dict]:
        """
        Fetch sensor data from ESP32 via HTTP
        
        Returns:
            Dict with voltage_V, pressure_MPa, mac_address
            None if request fails
        """
        try:
            url = f"http://{ip_address}/data"
            
            logger.info(f"Fetching data from {unit_id}: {url}")
            response = requests.get(url, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"✓ {unit_id} - Voltage: {data.get('voltage_V', 0):.3f}V, "
                       f"Pressure: {data.get('pressure_MPa', 0):.6f}MPa, "
                       f"MAC: {data.get('mac_address', 'N/A')}")
            
            return data
            
        except requests.exceptions.Timeout:
            logger.error(f"✗ {unit_id} - Request timeout (no response from {ip_address})")
            return None
        except requests.exceptions.ConnectionError:
            logger.error(f"✗ {unit_id} - Connection error (cannot reach {ip_address})")
            return None
        except requests.exceptions.HTTPError as e:
            logger.error(f"✗ {unit_id} - HTTP error: {e}")
            return None
        except json.JSONDecodeError:
            logger.error(f"✗ {unit_id} - Invalid JSON response")
            return None
        except Exception as e:
            logger.error(f"✗ {unit_id} - Fetch error: {e}")
            return None
    
    def calculate_water_metrics(self, voltage: float) -> Dict:
        """
        Calculate water pressure from voltage (for alert checking)
        Simplified calculation - only returns pressure and estimated level
        
        Returns:
            Dict with pressure_MPa and level_percentage
        """
        # Use default sensor offset
        adjusted_voltage = voltage - 0.51
        
        # Convert to pressure (MPa)
        pressure_mpa = PressureCalculator.voltage_to_pressure_mpa(adjusted_voltage)
        
        # Estimate level percentage from pressure for alert thresholds
        level_percentage = (pressure_mpa / PressureCalculator.PRESSURE_MAX_MPA) * 100
        
        return {
            'pressure_MPa': pressure_mpa,
            'level_percentage': min(100, max(0, level_percentage))
        }
    
    def check_and_create_alerts(self, unit_id: str, metrics: Dict) -> List[Dict]:
        """
        Check alert conditions and create alerts in MongoDB
        
        Returns:
            List of created alerts
        """
        alerts_created = []
        level_pct = metrics['level_percentage']
        timestamp = datetime.utcnow()
        
        # Check for low water level
        if level_pct < ALERT_THRESHOLD_LOW:
            # Determine severity
            if level_pct < 5:
                severity = 'CRITICAL'
            elif level_pct < 10:
                severity = 'URGENT'
            else:
                severity = 'WARNING'
            
            alert = {
                'unit_id': unit_id,
                'alert_type': 'LOW_WATER_LEVEL',
                'severity': severity,
                'level_percentage': level_pct,
                'timestamp': timestamp,
                'acknowledged': False,
                'message': f"{severity}: Water level at {level_pct:.1f}%"
            }
            
            # Check if alert already exists (avoid duplicates in last 5 minutes)
            existing_alert = self.alerts_collection.find_one({
                'unit_id': unit_id,
                'alert_type': 'LOW_WATER_LEVEL',
                'acknowledged': False,
                'timestamp': {'$gte': timestamp - timedelta(minutes=5)}
            })
            
            if not existing_alert:
                self.alerts_collection.insert_one(alert)
                alerts_created.append(alert)
                logger.warning(f"🚨 ALERT [{severity}] {unit_id}: Water level {level_pct:.1f}%")
        
        return alerts_created
    
    def update_tank_reading(self, unit_id: str, tank_config: Dict, esp32_data: Dict, metrics: Dict) -> bool:
        """
        Update tank document with latest reading in MongoDB
        - First creation: Stores only specified fields
        - Subsequent updates: Only updates timestamp, voltage_V, pressure_MPa
        
        Returns:
            True if successful
        """
        try:
            # Check if document already exists
            existing_doc = self.tanks_collection.find_one({'unit_id': unit_id})
            
            if existing_doc is None:
                # First creation: Store only required fields
                last_reading = {
                    'timestamp': datetime.utcnow(),
                    'voltage_V': esp32_data.get('voltage_V'),
                    'pressure_MPa': metrics['pressure_MPa'],
                    'mac_address': esp32_data.get('mac_address')
                }
                
                result = self.tanks_collection.insert_one({
                    'unit_id': unit_id,
                    'status': 'active',
                    'last_reading': last_reading
                })
                logger.debug(f"✓ Created new tank document {unit_id} in MongoDB")
                return result.inserted_id is not None
            else:
                # Subsequent updates: Only update timestamp, voltage_V, pressure_MPa
                result = self.tanks_collection.update_one(
                    {'unit_id': unit_id},
                    {
                        '$set': {
                            'last_reading.timestamp': datetime.utcnow(),
                            'last_reading.voltage_V': esp32_data.get('voltage_V'),
                            'last_reading.pressure_MPa': metrics['pressure_MPa']
                        }
                    }
                )
                logger.debug(f"✓ Updated {unit_id} (timestamp, voltage_V, pressure_MPa) in MongoDB")
                return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"✗ {unit_id} - Error updating tank reading: {e}")
            return False
    
    def process_tank(self, unit_id: str, device: Dict) -> Dict[str, Any]:
        """
        Process single tank: fetch, calculate, alert, store
        
        Returns:
            Processing result
        """
        result = {
            'unit_id': unit_id,
            'status': 'pending',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        try:
            # Step 1: Fetch data from ESP32
            esp32_data = self.fetch_esp32_data(unit_id, device['ip_address'])
            if not esp32_data:
                result['status'] = 'fetch_error'
                logger.warning(f"⚠ {unit_id} - Could not fetch data, will retry next cycle")
                return result
            
            result['esp32_data'] = esp32_data # type: ignore
            
            # Step 2: Calculate water metrics
            voltage = esp32_data.get('voltage_V', 0)
            metrics = self.calculate_water_metrics(voltage)
            result['metrics'] = metrics # type: ignore
            
            logger.info(f"  📊 {unit_id} Level: {metrics['level_percentage']:.1f}% "
                       f"Pressure: {metrics['pressure_MPa']:.6f} MPa")
            
            # Step 3: Check for alerts
            alerts = self.check_and_create_alerts(unit_id, metrics)
            result['alerts_created'] = len(alerts) # type: ignore
            
            # Step 4: Update MongoDB
            updated = self.update_tank_reading(unit_id, device, esp32_data, metrics)
            result['stored'] = updated # type: ignore
            result['status'] = 'success'
            
        except Exception as e:
            logger.error(f"✗ {unit_id} - Processing error: {e}")
            result['status'] = 'error'
            result['error'] = str(e)
        
        return result
    
    def run_monitoring_cycle(self):
        """Execute one complete monitoring cycle for all devices"""
        logger.info("\n" + "="*70)
        logger.info(f"🔄 Monitoring Cycle: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"   Checking device data...")
        logger.info("="*70)
        
        # Load devices from config
        devices = load_esp32_config()
        if not devices:
            logger.warning("No devices configured in esp32_config.json")
            return []
        
        results = []
        for device in devices:
            if not device.get('ip_address'):
                logger.warning(f"Skipping device {device.get('unit_id', 'Unknown')} - no IP address")
                continue
            
            result = self.process_tank(device['unit_id'], device)
            results.append(result)
            time.sleep(0.5)  # Small delay between requests
        
        # Cycle summary
        successful = sum(1 for r in results if r['status'] == 'success')
        logger.info(f"✅ Cycle Complete: {successful}/{len(results)} successful")
        logger.info("="*70)
        
        return results
    
    def start_24x7_monitoring(self):
        """Start 24x7 continuous monitoring"""
        logger.info("\n" + "="*70)
        logger.info("🚀 STARTING 24x7 WATER MONITORING SERVICE")
        logger.info("="*70)
        logger.info(f"Monitoring Interval: {FETCH_INTERVAL} seconds")
        logger.info(f"Alert Threshold: {ALERT_THRESHOLD_LOW}%")
        logger.info(f"Config File: {CONFIG_FILE}")
        logger.info(f"Database: {DB_NAME}")
        
        # Load and display configured devices
        devices = load_esp32_config()
        logger.info(f"Configured Devices: {len(devices)}")
        for device in devices:
            logger.info(f"  📍 {device.get('unit_id', 'Unknown')}: {device.get('name', 'Unknown')} ({device.get('ip_address', 'N/A')})")
        
        logger.info("="*70)
        
        def monitoring_loop():
            """Infinite monitoring loop"""
            cycle_count = 0
            while True:
                try:
                    cycle_count += 1
                    self.run_monitoring_cycle()
                    
                    # Log cycle interval
                    next_cycle_time = FETCH_INTERVAL
                    logger.info(f"⏳ Next cycle in {next_cycle_time}s (Cycle #{cycle_count})")
                    
                    time.sleep(FETCH_INTERVAL)
                    
                except KeyboardInterrupt:
                    logger.info("📴 Monitoring stopped by user")
                    break
                except Exception as e:
                    logger.error(f"✗ Monitoring loop error: {e}")
                    time.sleep(5)  # Wait before retry
        
        # Run in daemon thread
        thread = Thread(target=monitoring_loop, daemon=True)
        thread.start()
        logger.info("✓ Monitoring thread started (daemon mode)\n")
        
        return thread
    
    def close(self):
        """Close MongoDB connection"""
        try:
            self.client.close()
            logger.info("✓ MongoDB connection closed")
        except Exception as e:
            logger.error(f"Error closing MongoDB: {e}")


# ============== SIGNAL HANDLERS ==============

def signal_handler(signum, frame):
    """Handle termination signals"""
    logger.info("\n📴 Shutting down water monitoring service...")
    sys.exit(0)


# ============== MAIN EXECUTION ==============

if __name__ == "__main__":
    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        # Initialize service
        logger.info("Initializing Water Monitoring Service...")
        service = WaterMonitoringService()
        
        # Load and log configured devices
        devices = load_esp32_config()
        logger.info(f"Configured devices: {len(devices)}")
        for device in devices:
            logger.info(f"  📍 {device.get('unit_id', 'Unknown')}: {device.get('name', 'Unknown')} ({device.get('ip_address', 'N/A')})")
        
        # Start 24x7 monitoring
        service.start_24x7_monitoring()
        
        # Keep main thread alive
        logger.info("Service running. Press Ctrl+C to stop.")
        while True:
            time.sleep(1)
        
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        raise
