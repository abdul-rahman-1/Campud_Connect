#!/usr/bin/env python3
"""
Water Monitoring API - Entry Point
Run this to start the API server
"""

import os
import sys
import logging

# Add parent directory to path so we can import the api package
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api import create_app
from api.config import config

logger = logging.getLogger(__name__)

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
    print("  GET  /overall              - Get all tanks fill % + alert count")
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
