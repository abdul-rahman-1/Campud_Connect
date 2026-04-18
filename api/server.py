#!/usr/bin/env python3
"""
Water Monitoring API - Flask Server
Main entry point for the Water Monitoring API
"""

import os
import sys
import logging
from datetime import datetime
from flask import Flask, jsonify
from pymongo import MongoClient
from config import config

# ============================================================================
# LOGGING SETUP
# ============================================================================

logging.basicConfig(
    level=config.LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# FLASK APP INITIALIZATION
# ============================================================================

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    app.config.from_object(config)
    
    # Initialize MongoDB
    try:
        mongo_client = MongoClient(config.MONGO_URI)
        db = mongo_client[config.DB_NAME]
        
        # Store in app context
        app.mongo_client = mongo_client
        app.db = db
        logger.info("✓ MongoDB connected successfully")
    except Exception as e:
        logger.error(f"✗ MongoDB connection failed: {e}")
        raise
    
    # Register routes
    register_routes(app)
    
    return app

# ============================================================================
# ROUTES
# ============================================================================

def register_routes(app):
    """Register all API routes"""
    
    @app.route('/data/<tank_id>', methods=['GET'])
    def get_tank_data(tank_id):
        """
        Fetch full data for a specific tank from both collections
        Returns: unit_id, last_reading with voltage, pressure, mac_address, timestamp
        """
        try:
            db = app.db
            
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
    
    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        try:
            app.mongo_client.admin.command('ping')
            
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

# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    # Print startup banner
    banner = """
    ╔════════════════════════════════════════════════════════════╗
    ║                                                            ║
    ║      🚀 WATER MONITORING API SERVICE                       ║
    ║                                                            ║
    ║      Continuous water tank monitoring & alerts             ║
    ║                                                            ║
    ╚════════════════════════════════════════════════════════════╝
    """
    print(banner)
    
    # Create Flask app
    try:
        app = create_app()
    except Exception as e:
        print(f"✗ Failed to initialize app: {e}")
        sys.exit(1)
    
    # Print routes
    print("📋 Available Routes:")
    print("=" * 70)
    print("  GET  /data/<tank_id>       - Get full tank data by ID")
    print("  GET  /health               - Health check")
    print("=" * 70)
    
    # Print configuration
    print(f"\n⚙️  Configuration:")
    print(f"  Environment: {os.getenv('FLASK_ENV', 'development')}")
    print(f"  Host: {config.API_HOST}")
    print(f"  Port: {config.API_PORT}")
    print(f"  Debug: {config.DEBUG}")
    print(f"  Database: {config.DB_NAME}")
    print("\n" + "=" * 70)
    print(f"🌐 API running at: http://{config.API_HOST}:{config.API_PORT}")
    print("=" * 70)
    print("\nPress Ctrl+C to stop the server\n")
    
    # Start server
    try:
        app.run(
            host=config.API_HOST,
            port=config.API_PORT,
            debug=config.DEBUG
        )
    except KeyboardInterrupt:
        print("\n\n📴 Shutting down API service...")
        sys.exit(0)
    except Exception as e:
        print(f"\n✗ Fatal error: {e}")
        sys.exit(1)
