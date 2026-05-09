#!/usr/bin/env python3
"""
SYBER VAULT v8.0 - Python Backend Server
Deploy: Render.com
Run: python server.py
"""

import http.server
import json
import os
import urllib.parse
import datetime
import hashlib
import time
import sys

# Port from environment (Render sets this)
PORT = int(os.environ.get('PORT', 8080))
DATA_FILE = 'vault-data.json'
USERS_FILE = 'vault-users.json'

# ═══════════════════════════════════════
# DEFAULT DATA
# ═══════════════════════════════════════
DEFAULT_DATA = {
    "users": [
        {
            "username": "sybervault",
            "email": "sybervault@gmail.com",
            "password": "sybervault@209209",
            "role": "main_admin",
            "permissions": {}
        }
    ],
    "repos": [
        {
            "id": "d1",
            "name": "SyberVault",
            "icon": "fa-database",
            "type": "normal",
            "date": "2026-05-09"
        }
    ],
    "files": {
        "d1": []
    },
    "logs": [],
    "deployments": [],
    "settings": {
        "maintenanceMode": False,
        "sessionTimeout": "30min",
        "fileChangeAlert": True,
        "honeypotActive": False
    }
}

USERS_DEFAULT = [
    {
        "username": "sybervault",
        "email": "sybervault@gmail.com",
        "password": "sybervault@209209",
        "role": "main_admin",
        "permissions": {},
        "token": ""
    }
]

# ═══════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════
def load_json(filename, default=None):
    try:
        if os.path.exists(filename):
            with open(filename, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            if default is not None:
                save_json(filename, default)
            return default
    except Exception as e:
        print(f"[ERROR] Loading {filename}: {e}")
        return default if default is not None else {}

def save_json(filename, data):
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"[ERROR] Saving {filename}: {e}")
        return False

def generate_token():
    return hashlib.sha256(str(time.time()).encode()).hexdigest()[:32]

def get_time():
    return datetime.datetime.now().strftime('%H:%M:%S')

# ═══════════════════════════════════════
# HTTP HANDLER
# ═══════════════════════════════════════
class SyberVaultHandler(http.server.SimpleHTTPRequestHandler):
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
    
    def read_body(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            if length > 0:
                return json.loads(self.rfile.read(length).decode('utf-8'))
        except:
            pass
        return {}
    
    def serve_static(self, path):
        if os.path.exists(path):
            ext = os.path.splitext(path)[1]
            types = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json'}
            self.send_response(200)
            self.send_header('Content-Type', types.get(ext, 'text/plain'))
            self.end_headers()
            with open(path, 'rb') as f:
                self.wfile.write(f.read())
        else:
            self.send_json({'error':'Not found'}, 404)
    
    def do_GET(self):
        p = urllib.parse.urlparse(self.path).path
        
        routes = {
            '/api/health': lambda: self.send_json({
                'status': 'ACTIVE', 'server': 'SyberVault v8.0',
                'timestamp': datetime.datetime.now().isoformat()
            }),
            '/api/data': lambda: self.send_json(load_json(DATA_FILE, DEFAULT_DATA)),
            '/api/logs': lambda: self.send_json(load_json(DATA_FILE, DEFAULT_DATA).get('logs', [])),
            '/api/deployments': lambda: self.send_json(load_json(DATA_FILE, DEFAULT_DATA).get('deployments', []))
        }
        
        if p in routes:
            routes[p]()
        elif p == '/' or p == '':
            self.serve_static('index.html')
        else:
            filepath = p.lstrip('/')
            self.serve_static(filepath if os.path.exists(filepath) else 'index.html')
    
    def do_POST(self):
        p = urllib.parse.urlparse(self.path).path
        body = self.read_body()
        
        if p == '/api/login':
            username = body.get('username', '')
            password = body.get('password', '')
            
            users = load_json(USERS_FILE, USERS_DEFAULT)
            data_users = load_json(DATA_FILE, DEFAULT_DATA).get('users', [])
            all_users = users + data_users
            
            user = next((u for u in all_users if u['username'] == username), None)
            
            if user and user.get('password') == password:
                token = generate_token()
                user['token'] = token
                save_json(USERS_FILE, users)
                
                self.send_json({
                    'success': True, 'token': token,
                    'user': {
                        'username': user['username'],
                        'role': user.get('role', 'viewer'),
                        'email': user.get('email', ''),
                        'permissions': user.get('permissions', {})
                    }
                })
            else:
                self.send_json({'error': 'Invalid credentials'}, 401)
        
        elif p == '/api/save':
            new_data = body.get('data', {})
            if new_data:
                save_json(DATA_FILE, new_data)
                self.send_json({'success': True})
            else:
                self.send_json({'error': 'No data'}, 400)
        
        elif p == '/api/deploy/save':
            data = load_json(DATA_FILE, DEFAULT_DATA)
            deployments = body.get('deployments', [])
            data['deployments'] = deployments
            save_json(DATA_FILE, data)
            self.send_json({'success': True})
        
        elif p == '/api/users/add':
            username = body.get('username', '')
            password = body.get('password', '')
            role = body.get('role', 'viewer')
            
            if not username or not password:
                self.send_json({'error': 'Username and password required'}, 400)
                return
            
            users = load_json(USERS_FILE, USERS_DEFAULT)
            if any(u['username'] == username for u in users):
                self.send_json({'error': 'User exists'}, 400)
                return
            
            users.append({'username': username, 'email': body.get('email', ''), 'password': password, 'role': role, 'permissions': {}, 'token': ''})
            save_json(USERS_FILE, users)
            self.send_json({'success': True})
        
        else:
            self.send_json({'error': 'Not found'}, 404)
    
    def do_DELETE(self):
        p = urllib.parse.urlparse(self.path).path
        
        if p == '/api/logs':
            data = load_json(DATA_FILE, DEFAULT_DATA)
            data['logs'] = []
            save_json(DATA_FILE, data)
            self.send_json({'success': True})
        
        elif p.startswith('/api/users/'):
            username = p.split('/')[-1]
            users = load_json(USERS_FILE, USERS_DEFAULT)
            users = [u for u in users if u['username'] != username]
            save_json(USERS_FILE, users)
            self.send_json({'success': True})
        
        elif p.startswith('/api/deployments/'):
            dep_id = p.split('/')[-1]
            data = load_json(DATA_FILE, DEFAULT_DATA)
            data['deployments'] = [d for d in data.get('deployments', []) if d.get('id') != dep_id]
            save_json(DATA_FILE, data)
            self.send_json({'success': True})
        
        else:
            self.send_json({'error': 'Not found'}, 404)
    
    def log_message(self, format, *args):
        print(f"[{get_time()}] {args[0]}")

# ═══════════════════════════════════════
# MAIN
# ═══════════════════════════════════════
if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    print("╔══════════════════════════════════════╗")
    print("║     💀 SYBER VAULT v8.0             ║")
    print("║     Python Server Ready             ║")
    print(f"║     Port: {PORT}                       ║")
    print("╚══════════════════════════════════════╝")
    
    httpd = http.server.HTTPServer(('0.0.0.0', PORT), SyberVaultHandler)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[STOP] Server stopped")
        httpd.server_close()
