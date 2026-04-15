"""
Water Monitoring API Routes
Endpoints for frontend tank data
"""

from flask import Blueprint, jsonify
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

api_bp = Blueprint('api', __name__)

# ============== ROUTE: /data/<tank_id> ==============

@api_bp.route('/data/<tank_id>', methods=['GET'])
def get_tank_data(tank_id):
    """
    Fetch full data for a specific tank from both collections
    Returns: unit_id, last_reading with voltage, pressure, mac_address, timestamp
    """
    try:
        from . import db
        from .config import config
        
        # Search in tanks collection first
        tank_doc = db[config.TANKS_COLLECTION].find_one({'unit_id': tank_id}, {
            'unit_id': 1,
            'last_reading.timestamp': 1,
            'last_reading.voltage_V': 1,
            'last_reading.pressure_MPa': 1,
            'last_reading.mac_address': 1
        })
        
        # If not found, search in temp collection
        if not tank_doc:
            tank_doc = db[config.TEMP_COLLECTION].find_one({'unit_id': tank_id}, {
                'unit_id': 1,
                'last_reading.timestamp': 1,
                'last_reading.voltage_V': 1,
                'last_reading.pressure_MPa': 1,
                'last_reading.mac_address': 1
            })
        
        if not tank_doc:
            logger.warning(f"⚠ Tank not found: {tank_id}")
            return jsonify({
                'success': False,
                'error': f'Tank {tank_id} not found'
            }), 404
        
        # Convert ObjectId to string for JSON serialization
        if '_id' in tank_doc:
            tank_doc['_id'] = str(tank_doc['_id'])
        
        # Convert datetime objects to ISO format strings
        if 'last_reading' in tank_doc and 'timestamp' in tank_doc['last_reading']:
            tank_doc['last_reading']['timestamp'] = tank_doc['last_reading']['timestamp'].isoformat()
        
        logger.info(f"✓ /data/{tank_id} - Retrieved tank data")
        
        return jsonify({
            'success': True,
            'timestamp': datetime.utcnow().isoformat(),
            'data': tank_doc
        }), 200
        
    except Exception as e:
        logger.error(f"✗ /data/{tank_id} error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============== HEALTH CHECK ROUTE ==============

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        from . import mongo_client
        mongo_client.admin.command('ping')
        
        return jsonify({
            'success': True,
            'status': 'healthy',
            'database': 'connected'
        }), 200
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'error': str(e)
        }), 500
