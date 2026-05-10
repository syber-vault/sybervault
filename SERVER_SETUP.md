# 🔧 Server Setup Guide

## Python Backend Server Configuration

### Installation

```bash
pip install -r requirements.txt
```

### Requirements (requirements.txt)

```
Flask==2.3.2
Flask-CORS==4.0.0
PyJWT==2.8.0
cryptography==41.0.0
python-dotenv==1.0.0
gunicorn==21.2.0
```

### Environment Setup

```bash
# Create .env file
echo "PORT=5000" > .env
echo "FLASK_ENV=production" >> .env
echo "SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(32))')" >> .env
```

### Running Server

```bash
# Development
python server.py

# Production
gunicorn -w 4 -b 0.0.0.0:5000 server:app
```

### API Endpoints

#### Login
```
POST /api/login
Body: { "username": "user", "password": "pass" }
Response: { "success": true, "token": "...", "user": {...} }
```

#### Data Sync
```
POST /api/data/sync
Headers: { "Authorization": "Bearer TOKEN" }
Body: { "data": {...} }
Response: { "success": true }
```

#### Audit Logs
```
GET /api/audit/logs
Headers: { "Authorization": "Bearer TOKEN" }
Response: [{...log entries...}]

POST /api/audit/logs
Headers: { "Authorization": "Bearer TOKEN" }
Body: { "log": {...} }
Response: { "success": true }
```

#### Health Check
```
GET /api/health
Response: { "status": "ACTIVE", "version": "8.0" }
```

### CORS Configuration

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "https://yourdomain.com"],
        "methods": ["GET", "POST", "PATCH", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

### JWT Token Setup

```python
import jwt
from datetime import datetime, timedelta

def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=24),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, os.getenv('SECRET_KEY'), algorithm='HS256')

def verify_token(token):
    try:
        return jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=['HS256'])
    except jwt.InvalidTokenError:
        return None
```

### Database (Optional SQLite)

```python
import sqlite3

def init_db():
    conn = sqlite3.connect('vault.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, role TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS audit_logs
                 (id INTEGER PRIMARY KEY, user_id INTEGER, event_type TEXT, timestamp TEXT, details TEXT)''')
    conn.commit()
    conn.close()

init_db()
```

---

**Version:** 8.0  
**Last Updated:** 2026-05-09
