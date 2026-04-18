"""
Water Monitoring API Configuration
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration"""
    # MongoDB
    MONGO_URI = os.getenv('MONGO_URI')
    DB_NAME = os.getenv('DB_NAME')
    TANKS_COLLECTION = os.getenv('TANKS_COLLECTION')
    TEMP_COLLECTION = os.getenv('TEMP_COLLECTION')
    ALERTS_COLLECTION = os.getenv('ALERTS_COLLECTION')

    # Flask
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    API_PORT = int(os.getenv('API_PORT', 8338))
    API_HOST = os.getenv('API_HOST', '0.0.0.0')
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True

# Select config based on environment
config_name = os.getenv('FLASK_ENV', 'development')
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig
}.get(config_name, DevelopmentConfig)
