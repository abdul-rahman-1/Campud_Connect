#!/usr/bin/env python3
"""
MongoDB Setup Script for Water Monitoring System
Creates fresh database structure with collections:
- tanks: 15 tanks (1 with real IoT data, others placeholder)
- temp: dummy test data (identical structure, different values)
- alerts: alert logs
"""

from pymongo import MongoClient
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB Configuration
MONGO_URI = "mongodb+srv://AdminClint0001:uTYZ4fPph7whTpXC@cluster0.eifjnhd.mongodb.net/"
DB_NAME = "water_monitoring"

def setup_database():
    """Initialize MongoDB database with fresh collections"""
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        logger.info("✓ Connected to MongoDB")
        
        # Get database
        db = client[DB_NAME]
        
        # Drop existing collections if they exist
        logger.info("Dropping existing collections...")
        for collection_name in ['tanks', 'temp', 'alerts']:
            if collection_name in db.list_collection_names():
                db[collection_name].drop()
                logger.info(f"  ✓ Dropped {collection_name}")
        
        # ========== TANKS COLLECTION ==========
        logger.info("\nCreating 'tanks' collection...")
        tanks_collection = db['tanks']
        
        # ONLY ONE REAL TANK - TANK_B1_01
        tanks_data = [
            {
                'name': 'TANK_B1_01',
                'unit_id': 'TANK_B1_01',
                'building': 'Building_A',
                'location': 'Roof_Tank_1',
                'floor': 'Roof',
                'diameter_m': 1.829,
                'height_m': 1.829,
                'capacity_liters': 5000,
                'ip': '172.25.52.247',
                'sensor_offset_V': 0.40,
                'status': 'active',
                'is_real_data': True,
                'last_reading': {
                    'timestamp': datetime.utcnow(),
                    'voltage_V': 2.5,
                    'pressure_MPa': 0.625,
                    'height_m': 0.637,
                    'volume_liters': 2840,
                    'level_percentage': 56.8,
                    'mac_address': 'AA:BB:CC:DD:EE:01',
                    'http_status': 'success'
                }
            }
        ]
        
        # Insert tank
        result = tanks_collection.insert_many(tanks_data)
        logger.info(f"  ✓ Inserted {len(result.inserted_ids)} tank (TANK_B1_01 - REAL DATA)")
        
        # Create index on unit_id
        tanks_collection.create_index('unit_id')
        
        # ========== TEMP COLLECTION (Test Data - 15 Tanks) ==========
        logger.info("\nCreating 'temp' collection with 15 test tanks...")
        temp_collection = db['temp']
        
        temp_data = [
            # Test Tank 1 - High water level
            {
                'name': 'TANK_B1_02',
                'unit_id': 'TANK_B1_02',
                'building': 'Building_A',
                'location': 'Roof_Tank_2',
                'floor': 'Roof',
                'diameter_m': 1.829,
                'height_m': 1.829,
                'capacity_liters': 5000,
                'ip': '192.168.1.100',
                'sensor_offset_V': 0.40,
                'status': 'active',
                'is_temp': True,
                'last_reading': {
                    'timestamp': datetime.utcnow(),
                    'voltage_V': 4.0,
                    'pressure_MPa': 0.875,
                    'height_m': 0.892,
                    'volume_liters': 4000,
                    'level_percentage': 80.0,
                    'mac_address': 'FF:FF:FF:FF:FF:02',
                    'http_status': 'success'
                }
            },
            # Test Tank 2 - Medium water level
            {
                'name': 'TANK_B2_01',
                'unit_id': 'TANK_B2_01',
                'building': 'Building_B',
                'location': 'Roof_Tank_1',
                'floor': 'Roof',
                'diameter_m': 1.829,
                'height_m': 1.829,
                'capacity_liters': 5000,
                'ip': '192.168.1.101',
                'sensor_offset_V': 0.40,
                'status': 'active',
                'is_temp': True,
                'last_reading': {
                    'timestamp': datetime.utcnow(),
                    'voltage_V': 2.5,
                    'pressure_MPa': 0.625,
                    'height_m': 0.637,
                    'volume_liters': 2850,
                    'level_percentage': 57.0,
                    'mac_address': 'FF:FF:FF:FF:FF:03',
                    'http_status': 'success'
                }
            },
            # Test Tank 3 - Low water level
            {
                'name': 'TANK_B2_02',
                'unit_id': 'TANK_B2_02',
                'building': 'Building_B',
                'location': 'Roof_Tank_2',
                'floor': 'Roof',
                'diameter_m': 1.829,
                'height_m': 1.829,
                'capacity_liters': 5000,
                'ip': '192.168.1.102',
                'sensor_offset_V': 0.40,
                'status': 'active',
                'is_temp': True,
                'last_reading': {
                    'timestamp': datetime.utcnow(),
                    'voltage_V': 1.0,
                    'pressure_MPa': 0.125,
                    'height_m': 0.127,
                    'volume_liters': 570,
                    'level_percentage': 11.4,
                    'mac_address': 'FF:FF:FF:FF:FF:04',
                    'http_status': 'success'
                }
            },
            # Test Tank 4 - Very High
            {
                'name': 'TANK_B3_01',
                'unit_id': 'TANK_B3_01',
                'building': 'Building_C',
                'location': 'Roof_Tank_1',
                'floor': 'Roof',
                'diameter_m': 1.829,
                'height_m': 1.829,
                'capacity_liters': 5000,
                'ip': '192.168.1.103',
                'sensor_offset_V': 0.40,
                'status': 'active',
                'is_temp': True,
                'last_reading': {
                    'timestamp': datetime.utcnow(),
                    'voltage_V': 4.3,
                    'pressure_MPa': 0.95,
                    'height_m': 0.968,
                    'volume_liters': 4350,
                    'level_percentage': 87.0,
                    'mac_address': 'FF:FF:FF:FF:FF:05',
                    'http_status': 'success'
                }
            },
            # Test Tank 5 - Critical Low
            {
                'name': 'TANK_B3_02',
                'unit_id': 'TANK_B3_02',
                'building': 'Building_C',
                'location': 'Roof_Tank_2',
                'floor': 'Roof',
                'diameter_m': 1.829,
                'height_m': 1.829,
                'capacity_liters': 5000,
                'ip': '192.168.1.104',
                'sensor_offset_V': 0.40,
                'status': 'active',
                'is_temp': True,
                'last_reading': {
                    'timestamp': datetime.utcnow(),
                    'voltage_V': 0.7,
                    'pressure_MPa': 0.05,
                    'height_m': 0.051,
                    'volume_liters': 230,
                    'level_percentage': 4.6,
                    'mac_address': 'FF:FF:FF:FF:FF:06',
                    'http_status': 'success'
                }
            },
            # Test Tank 6
            {
                'name': 'TANK_B4_01',
                'unit_id': 'TANK_B4_01',
                'building': 'Building_D',
                'location': 'Roof_Tank_1',
                'floor': 'Roof',
                'diameter_m': 1.829,
                'height_m': 1.829,
                'capacity_liters': 5000,
                'ip': '192.168.1.105',
                'sensor_offset_V': 0.40,
                'status': 'active',
                'is_temp': True,
                'last_reading': {
                    'timestamp': datetime.utcnow(),
                    'voltage_V': 3.2,
                    'pressure_MPa': 0.675,
                    'height_m': 0.688,
                    'volume_liters': 3090,
                    'level_percentage': 61.8,
                    'mac_address': 'FF:FF:FF:FF:FF:07',
                    'http_status': 'success'
                }
            },
            # Test Tank 7
            {
                'name': 'TANK_B4_02',
                'unit_id': 'TANK_B4_02',
                'building': 'Building_D',
                'location': 'Roof_Tank_2',
                'floor': 'Roof',
                'diameter_m': 1.829,
                'height_m': 1.829,
                'capacity_liters': 5000,
                'ip': '192.168.1.106',
                'sensor_offset_V': 0.40,
                'status': 'active',
                'is_temp': True,
                'last_reading': {
                    'timestamp': datetime.utcnow(),
                    'voltage_V': 1.8,
                    'pressure_MPa': 0.325,
                    'height_m': 0.331,
                    'volume_liters': 1490,
                    'level_percentage': 29.8,
                    'mac_address': 'FF:FF:FF:FF:FF:08',
                    'http_status': 'success'
                }
            },
            # Test Tank 8
            {
                'name': 'TANK_B5_01',
                'unit_id': 'TANK_B5_01',
                'building': 'Building_E',
                'location': 'Roof_Tank_1',
                'floor': 'Roof',
                'diameter_m': 1.829,
                'height_m': 1.829,
                'capacity_liters': 5000,
                'ip': '192.168.1.107',
                'sensor_offset_V': 0.40,
                'status': 'active',
                'is_temp': True,
                'last_reading': {
                    'timestamp': datetime.utcnow(),
                    'voltage_V': 3.5,
                    'pressure_MPa': 0.75,
                    'height_m': 0.764,
                    'volume_liters': 3435,
                    'level_percentage': 68.7,
                    'mac_address': 'FF:FF:FF:FF:FF:09',
                    'http_status': 'success'
                }
            },
            # Test Tank 9
            {
                'name': 'TANK_B5_02',
                'unit_id': 'TANK_B5_02',
                'building': 'Building_E',
                'location': 'Roof_Tank_2',
                'floor': 'Roof',
                'diameter_m': 1.829,
                'height_m': 1.829,
                'capacity_liters': 5000,
                'ip': '192.168.1.108',
                'sensor_offset_V': 0.40,
                'status': 'active',
                'is_temp': True,
                'last_reading': {
                    'timestamp': datetime.utcnow(),
                    'voltage_V': 2.2,
                    'pressure_MPa': 0.425,
                    'height_m': 0.433,
                    'volume_liters': 1950,
                    'level_percentage': 39.0,
                    'mac_address': 'FF:FF:FF:FF:FF:0A',
                    'http_status': 'success'
                }
            },
            # Test Tank 10
            {
                'name': 'TANK_B6_01',
                'unit_id': 'TANK_B6_01',
                'building': 'Building_F',
                'location': 'Roof_Tank_1',
                'floor': 'Roof',
                'diameter_m': 1.829,
                'height_m': 1.829,
                'capacity_liters': 5000,
                'ip': '192.168.1.109',
                'sensor_offset_V': 0.40,
                'status': 'active',
                'is_temp': True,
                'last_reading': {
                    'timestamp': datetime.utcnow(),
                    'voltage_V': 3.8,
                    'pressure_MPa': 0.825,
                    'height_m': 0.840,
                    'volume_liters': 3780,
                    'level_percentage': 75.6,
                    'mac_address': 'FF:FF:FF:FF:FF:0B',
                    'http_status': 'success'
                }
            },
            # Test Tank 11
            {
                'name': 'TANK_B6_02',
                'unit_id': 'TANK_B6_02',
                'building': 'Building_F',
                'location': 'Roof_Tank_2',
                'floor': 'Roof',
                'diameter_m': 1.829,
                'height_m': 1.829,
                'capacity_liters': 5000,
                'ip': '192.168.1.110',
                'sensor_offset_V': 0.40,
                'status': 'active',
                'is_temp': True,
                'last_reading': {
                    'timestamp': datetime.utcnow(),
                    'voltage_V': 1.5,
                    'pressure_MPa': 0.25,
                    'height_m': 0.255,
                    'volume_liters': 1150,
                    'level_percentage': 23.0,
                    'mac_address': 'FF:FF:FF:FF:FF:0C',
                    'http_status': 'success'
                }
            },
            # Test Tank 12
            {
                'name': 'TANK_B7_01',
                'unit_id': 'TANK_B7_01',
                'building': 'Building_G',
                'location': 'Roof_Tank_1',
                'floor': 'Roof',
                'diameter_m': 1.829,
                'height_m': 1.829,
                'capacity_liters': 5000,
                'ip': '192.168.1.111',
                'sensor_offset_V': 0.40,
                'status': 'active',
                'is_temp': True,
                'last_reading': {
                    'timestamp': datetime.utcnow(),
                    'voltage_V': 2.8,
                    'pressure_MPa': 0.575,
                    'height_m': 0.586,
                    'volume_liters': 2635,
                    'level_percentage': 52.7,
                    'mac_address': 'FF:FF:FF:FF:FF:0D',
                    'http_status': 'success'
                }
            },
            # Test Tank 13
            {
                'name': 'TANK_B7_02',
                'unit_id': 'TANK_B7_02',
                'building': 'Building_G',
                'location': 'Roof_Tank_2',
                'floor': 'Roof',
                'diameter_m': 1.829,
                'height_m': 1.829,
                'capacity_liters': 5000,
                'ip': '192.168.1.112',
                'sensor_offset_V': 0.40,
                'status': 'active',
                'is_temp': True,
                'last_reading': {
                    'timestamp': datetime.utcnow(),
                    'voltage_V': 3.9,
                    'pressure_MPa': 0.85,
                    'height_m': 0.866,
                    'volume_liters': 3895,
                    'level_percentage': 77.9,
                    'mac_address': 'FF:FF:FF:FF:FF:0E',
                    'http_status': 'success'
                }
            },
            # Test Tank 14
            {
                'name': 'TANK_B8_01',
                'unit_id': 'TANK_B8_01',
                'building': 'Building_H',
                'location': 'Roof_Tank_1',
                'floor': 'Roof',
                'diameter_m': 1.829,
                'height_m': 1.829,
                'capacity_liters': 5000,
                'ip': '192.168.1.113',
                'sensor_offset_V': 0.40,
                'status': 'active',
                'is_temp': True,
                'last_reading': {
                    'timestamp': datetime.utcnow(),
                    'voltage_V': 1.3,
                    'pressure_MPa': 0.2,
                    'height_m': 0.204,
                    'volume_liters': 920,
                    'level_percentage': 18.4,
                    'mac_address': 'FF:FF:FF:FF:FF:0F',
                    'http_status': 'success'
                }
            },
            # Test Tank 15
            {
                'name': 'TANK_B8_02',
                'unit_id': 'TANK_B8_02',
                'building': 'Building_H',
                'location': 'Roof_Tank_2',
                'floor': 'Roof',
                'diameter_m': 1.829,
                'height_m': 1.829,
                'capacity_liters': 5000,
                'ip': '192.168.1.114',
                'sensor_offset_V': 0.40,
                'status': 'active',
                'is_temp': True,
                'last_reading': {
                    'timestamp': datetime.utcnow(),
                    'voltage_V': 3.3,
                    'pressure_MPa': 0.7,
                    'height_m': 0.713,
                    'volume_liters': 3205,
                    'level_percentage': 64.1,
                    'mac_address': 'FF:FF:FF:FF:FF:10',
                    'http_status': 'success'
                }
            },
        ]
        
        # Insert temp data
        result = temp_collection.insert_many(temp_data)
        logger.info(f"  ✓ Inserted {len(result.inserted_ids)} test tanks (marked as is_temp: True)")
        
        # Create index on unit_id
        temp_collection.create_index('unit_id')
        
        # ========== ALERTS COLLECTION ==========
        logger.info("\nCreating 'alerts' collection with dummy alerts...")
        alerts_collection = db['alerts']
        
        # Dummy alerts for 2 tanks
        alerts_data = [
            {
                'unit_id': 'TANK_B1_01',
                'name': 'TANK_B1_01',
                'building': 'Building_A',
                'location': 'Roof_Tank_1',
                'alert_type': 'LOW_WATER_LEVEL',
                'severity': 'WARNING',
                'level_percentage': 18.5,
                'volume_liters': 925,
                'timestamp': datetime.utcnow() - timedelta(hours=2),
                'acknowledged': False,
                'acknowledged_by': None,
                'acknowledged_at': None,
                'message': 'Water level below 20% threshold'
            },
            {
                'unit_id': 'TANK_B3_02',
                'name': 'TANK_B3_02',
                'building': 'Building_C',
                'location': 'Roof_Tank_2',
                'alert_type': 'LOW_WATER_LEVEL',
                'severity': 'CRITICAL',
                'level_percentage': 4.6,
                'volume_liters': 230,
                'timestamp': datetime.utcnow() - timedelta(hours=1),
                'acknowledged': False,
                'acknowledged_by': None,
                'acknowledged_at': None,
                'message': 'CRITICAL: Water level below 5%'
            }
        ]
        
        # Insert alerts
        result = alerts_collection.insert_many(alerts_data)
        logger.info(f"  ✓ Inserted {len(result.inserted_ids)} dummy alerts (for TANK_B1_01 and TANK_B3_02)")
        
        # Create indexes
        alerts_collection.create_index([('unit_id', 1), ('timestamp', -1)])
        alerts_collection.create_index('acknowledged')
        
        # ========== Summary ==========
        logger.info("\n" + "="*60)
        logger.info("✅ DATABASE SETUP COMPLETE")
        logger.info("="*60)
        logger.info(f"Database: {DB_NAME}")
        logger.info(f"Collections created: tanks, temp, alerts")
        logger.info(f"  • tanks: 1 tank (TANK_B1_01 - REAL IoT DATA)")
        logger.info(f"  • temp: 15 test tanks (marked is_temp: True)")
        logger.info(f"  • alerts: 2 dummy alerts (for testing)")
        logger.info("="*60)
        
        client.close()
        
    except Exception as e:
        logger.error(f"✗ Error setting up database: {e}")
        raise

if __name__ == "__main__":
    setup_database()
