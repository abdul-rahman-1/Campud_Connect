#!/usr/bin/env python3
"""
Water Monitoring API - Flask Server
Main entry point for the Water Monitoring API
"""

import os
import sys
import logging
import re
import subprocess
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
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
    CORS(app)  # Enable CORS for dashboard
    app.config.from_object(config)
    
    # Initialize MongoDB
    try:
        mongo_client = MongoClient(config.MONGO_URI, serverSelectionTimeoutMS=2000)
        db = mongo_client[config.DB_NAME]
        
        # Store in app context
        app.mongo_client = mongo_client
        app.db = db
        # Quick ping check
        mongo_client.admin.command('ping')
        logger.info("✓ MongoDB connected successfully")
    except Exception as e:
        logger.error(f"✗ MongoDB connection failed: {e}")
        # We don't raise here so the server can still run to show errors in the dashboard
        app.db = None
    
    # Register routes
    register_routes(app)
    register_admin_routes(app)
    
    return app

# ============================================================================
# API ROUTES
# ============================================================================

def register_routes(app):
    """Register all API routes"""
    
    @app.route('/data/<tank_id>', methods=['GET'])
    def get_tank_data(tank_id):
        try:
            db = app.db
            if db is None:
                return jsonify({'success': False, 'error': 'Database not connected'}), 503
                
            tank_doc = db[config.TANKS_COLLECTION].find_one({'unit_id': tank_id}, {
                'unit_id': 1,
                'last_reading.timestamp': 1,
                'last_reading.voltage_V': 1,
                'last_reading.pressure_MPa': 1,
                'last_reading.mac_address': 1
            })
            
            if not tank_doc:
                tank_doc = db[config.TEMP_COLLECTION].find_one({'unit_id': tank_id}, {
                    'unit_id': 1,
                    'last_reading.timestamp': 1,
                    'last_reading.voltage_V': 1,
                    'last_reading.pressure_MPa': 1,
                    'last_reading.mac_address': 1
                })
            
            if not tank_doc:
                return jsonify({'success': False, 'error': f'Tank {tank_id} not found'}), 404
            
            if '_id' in tank_doc:
                tank_doc['_id'] = str(tank_doc['_id'])
            
            if 'last_reading' in tank_doc and 'timestamp' in tank_doc['last_reading']:
                tank_doc['last_reading']['timestamp'] = tank_doc['last_reading']['timestamp'].isoformat()
            
            return jsonify({
                'success': True,
                'timestamp': datetime.utcnow().isoformat(),
                'data': tank_doc
            }), 200
            
        except Exception as e:
            logger.error(f"✗ /data/{tank_id} error: {e}")
            return jsonify({'success': False, 'error': str(e)}), 500
    
    @app.route('/health', methods=['GET'])
    def health_check():
        try:
            if app.mongo_client is None:
                return jsonify({'success': False, 'status': 'unhealthy', 'error': 'DB client not initialized'}), 500
            app.mongo_client.admin.command('ping')
            return jsonify({'success': True, 'status': 'healthy', 'database': 'connected'}), 200
        except Exception as e:
            return jsonify({'success': False, 'status': 'unhealthy', 'error': str(e)}), 500

# ============================================================================
# ADMIN ROUTES
# ============================================================================

def register_admin_routes(app):
    """Register dashboard admin routes"""

    @app.route('/admin/status', methods=['GET'])
    def get_admin_status():
        # Check DB
        db_status = "connected"
        try:
            if app.mongo_client:
                app.mongo_client.admin.command('ping')
            else:
                db_status = "disconnected"
        except:
            db_status = "error"

        # Check Tunnel URL from log
        tunnel_url = "Offline"
        if os.path.exists("logs/cloudflared.log"):
            with open("logs/cloudflared.log", "r") as f:
                content = f.read()
                # Find trycloudflare URL
                match = re.search(r'https://[a-zA-Z0-9-]+\.trycloudflare\.com', content)
                if match:
                    tunnel_url = match.group(0)

        # Check if cloudflared is running (approximate check)
        is_tunnel_running = False
        try:
            output = subprocess.check_output('tasklist', shell=True).decode()
            if 'cloudflared.exe' in output:
                is_tunnel_running = True
        except:
            pass

        return jsonify({
            'success': True,
            'server_status': 'running',
            'db_status': db_status,
            'tunnel_status': 'online' if is_tunnel_running else 'offline',
            'tunnel_url': tunnel_url,
            'api_url': f"http://{config.API_HOST}:{config.API_PORT}",
            'config': {
                'DB_NAME': config.DB_NAME,
                'API_PORT': config.API_PORT,
                'LOG_LEVEL': config.LOG_LEVEL
            }
        })

    @app.route('/admin/logs/<service>', methods=['GET'])
    def get_logs(service):
        log_file = "logs/server.log" if service == "server" else "logs/cloudflared.log"
        if not os.path.exists(log_file):
            return jsonify({'success': False, 'error': 'Log file not found'}), 404
            
        try:
            with open(log_file, "r") as f:
                lines = f.readlines()
                return jsonify({'success': True, 'logs': lines[-100:]}) # Last 100 lines
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/admin/service/<action>', methods=['POST'])
    def service_control(action):
        # target can be 'tunnel' or 'server'
        target = request.json.get('target')
        
        # Path to cloudflared
        cf_path = "cloudflared.exe" if os.path.exists("cloudflared.exe") else "cloudflared"

        if target == 'tunnel':
            if action == 'start':
                cmd = f'start "Cloudflare Tunnel" /min cmd /c "{cf_path} tunnel --url http://localhost:{config.API_PORT} > logs/cloudflared.log 2>&1"'
                subprocess.Popen(cmd, shell=True)
                return jsonify({'success': True, 'message': 'Tunnel start initiated'})
            elif action == 'stop':
                os.system('taskkill /IM cloudflared.exe /F')
                return jsonify({'success': True, 'message': 'Tunnel stopped'})
        elif target == 'server':
            if action == 'restart':
                def restart():
                    import time
                    time.sleep(1)
                    # Use subprocess to restart - handles paths with spaces better
                    script_path = os.path.abspath(__file__)
                    subprocess.Popen([sys.executable, script_path])
                import threading
                threading.Thread(target=restart).start()
                return jsonify({'success': True, 'message': 'Server restarting...'})
        elif target == 'system':
            if action == 'fix-admin':
                # This command triggers the Windows UAC prompt
                # It opens a new admin CMD that runs start.bat to re-verify and fix dependencies/tunnel
                root_dir = os.path.dirname(os.path.abspath(__file__))
                cmd = f'powershell -Command "Start-Process cmd -ArgumentList \'/c cd /d {root_dir} && start.bat\' -Verb RunAs"'
                subprocess.Popen(cmd, shell=True)
                return jsonify({'success': True, 'message': 'Elevation requested. Please accept the UAC prompt on your desktop.'})
        
        return jsonify({'success': False, 'error': 'Invalid action or target'}), 400

    @app.route('/admin/files', methods=['GET'])
    def list_admin_files():
        return jsonify({
            'success': True,
            'files': ['server.py', 'config.py', '.env', 'requirements.txt']
        })

    @app.route('/admin/files/content', methods=['GET'])
    def get_file_content():
        filename = request.args.get('filename')
        allowed_files = ['server.py', 'config.py', '.env', 'requirements.txt']
        if filename not in allowed_files:
            return jsonify({'success': False, 'error': 'Invalid file'}), 400
        try:
            with open(filename, 'r') as f:
                return jsonify({'success': True, 'content': f.read()})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/admin/files/save', methods=['POST'])
    def save_file_content():
        filename = request.json.get('filename')
        content = request.json.get('content')
        allowed_files = ['server.py', 'config.py', '.env', 'requirements.txt']
        if filename not in allowed_files:
            return jsonify({'success': False, 'error': 'Invalid file'}), 400
        try:
            with open(filename, 'w') as f:
                f.write(content)
            return jsonify({'success': True, 'message': f'{filename} saved successfully'})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/admin/config', methods=['GET', 'POST'])
    def manage_config():
        # Very basic password check
        password = request.headers.get('X-Admin-Password')
        expected = "Abdul_Rahman-Developer"
        if password != expected:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 401

        if request.method == 'GET':
            with open('.env', 'r') as f:
                return jsonify({'success': True, 'env': f.read()})
        else:
            new_env = request.json.get('env')
            with open('.env', 'w') as f:
                f.write(new_env)
            return jsonify({'success': True, 'message': 'Config updated. Please restart server.'})

    @app.route('/admin/shutdown', methods=['POST'])
    def shutdown():
        os.system('taskkill /IM cloudflared.exe /F')
        os.system('taskkill /IM node.exe /F')
        # Final kill self
        def kill_self():
            import time
            time.sleep(1)
            os.system(f'taskkill /PID {os.getpid()} /F')
        import threading
        threading.Thread(target=kill_self).start()
        return jsonify({'success': True, 'message': 'Shutting down everything...'})

# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    banner = """
    ╔════════════════════════════════════════════════════════════╗
    ║                                                            ║
    ║      🚀 CAMPUS CONNECT API SERVER                          ║
    ║                                                            ║
    ║      HydroPulse // TankWatch v2.0                          ║
    ║                                                            ║
    ╚════════════════════════════════════════════════════════════╝
    """
    print(banner)
    
    try:
        app = create_app()
    except Exception as e:
        print(f"✗ Failed to initialize app: {e}")
        sys.exit(1)
    
    print(f"🌐 API running at: http://{config.API_HOST}:{config.API_PORT}")
    
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
