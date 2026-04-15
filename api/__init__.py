"""
Water Monitoring API
Flask application factory
"""

from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import logging
import os

# Global variables
mongo_client = None
db = None

def create_app():
    """Create and configure Flask application"""
    global mongo_client, db
    
    # Initialize Flask app
    app = Flask(__name__)
    
    # Load configuration
    from .config import config
    app.config.from_object(config)
    
    # Configure logging
    setup_logging(app)
    logger = logging.getLogger(__name__)
    
    # Enable CORS
    CORS(app)
    
    # Connect to MongoDB
    logger.info("🔗 Connecting to MongoDB...")
    try:
        mongo_client = MongoClient(config.MONGO_URI, serverSelectionTimeoutMS=5000)
        mongo_client.admin.command('ping')
        db = mongo_client[config.DB_NAME]
        logger.info("✓ Connected to MongoDB")
    except ConnectionFailure as e:
        logger.error(f"✗ MongoDB connection failed: {e}")
        raise
    
    # Register blueprints
    from .routes import api_bp
    app.register_blueprint(api_bp)
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        from flask import jsonify
        return jsonify({
            'success': False,
            'error': 'Route not found'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        from flask import jsonify
        logger.error(f"Internal server error: {error}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500
    
    logger.info("\n✅ Flask app initialized successfully\n")
    
    return app

def setup_logging(app):
    """Configure application logging"""
    from .config import config
    
    # Create logs directory if it doesn't exist
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    # Configure logging
    logging.basicConfig(
        level=getattr(logging, config.LOG_LEVEL),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('logs/api.log'),
            logging.StreamHandler()
        ]
    )
