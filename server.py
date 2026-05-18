#!/usr/bin/env python3
"""SYBER VAULT v8.0 - Server with Bot API"""
import http.server, json, os, urllib.parse, subprocess, threading, time

PORT = int(os.environ.get('PORT', 8080))
DATA_FILE = 'vault-data.json'
bot_processes = {}

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE,'r') as f: return json.load(f)
    return {"repos":[],"files":{}}

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        p = urllib.parse.urlparse(self.path).path
        
        # Bot APIs
        if p == '/api/bot/list':
            bots = []
            for name, proc in bot_processes.items():
                bots.append({'name':name, 'pid':proc.pid, 'running':proc.poll() is None})
            self.send_json(bots)
            return
        
        if p == '/api/bot/logs':
            name = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query).get('name',[''])[0]
            self.send_json({'logs':['Bot log line 1','Bot log line 2']})
            return
        
        # Vault API
        if p.startswith('/vault/'):
            repo_name = p.split('/vault/')[-1]
            token = self.headers.get('Authorization','').replace('Bearer ','')
            data = load_data()
            repo = next((r for r in data.get('repos',[]) if r['name']==repo_name),None)
            if not repo: self.send_json({'error':'Not found'},404); return
            if repo.get('isPublic',False) or token == repo.get('token',''):
                self.send_json({'name':repo_name,'files':data.get('files',{}).get(repo['id'],[])})
            else:
                self.send_json({'error':'PRIVATE. Use token.','hint':'curl -H "Authorization: Bearer TOKEN" '+self.path},403)
            return
        
        # Static files
        if p == '/' or p == '': p = '/index.html'
        filepath = '.' + p
        if os.path.exists(filepath):
            self.send_response(200)
            ext = os.path.splitext(filepath)[1]
            ct = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json'}
            self.send_header('Content-Type',ct.get(ext,'text/plain'))
            self.send_header('X-Frame-Options','DENY')
            self.end_headers()
            with open(filepath,'rb') as f: self.wfile.write(f.read())
        else:
            self.send_json({'error':'Not found'},404)
    
    def do_POST(self):
        p = urllib.parse.urlparse(self.path).path
        content_len = int(self.headers.get('Content-Length',0))
        body = json.loads(self.rfile.read(content_len)) if content_len > 0 else {}
        
        # Start Bot
        if p == '/api/bot/start':
            name = body.get('name','bot')
            bot_type = body.get('type','facebook')
            repo_id = body.get('repoId','')
            
            # Kill existing
            if name in bot_processes:
                try: bot_processes[name].kill()
                except: pass
            
            # Start new bot (simulation for testing)
            cmd = ['node', '-e', 'console.log("🤖 Bot started: '+name+'"); setInterval(function(){console.log("[LOG] Bot running... "+new Date().toLocaleTimeString());},3000);']
            try:
                proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                bot_processes[name] = proc
                self.send_json({'ok':True,'pid':proc.pid,'name':name})
            except Exception as e:
                self.send_json({'ok':False,'error':str(e)})
            return
        
        # Stop Bot
        if p == '/api/bot/stop':
            name = body.get('name','')
            if name in bot_processes:
                try: bot_processes[name].kill()
                except: pass
                del bot_processes[name]
                self.send_json({'ok':True})
            else:
                self.send_json({'ok':False,'error':'Not found'})
            return
        
        self.send_json({'error':'Not found'},404)
    
    def send_json(self,data,status=200):
        self.send_response(status)
        self.send_header('Content-Type','application/json')
        self.send_header('Access-Control-Allow-Origin','*')
        self.send_header('Access-Control-Allow-Methods','GET,POST,OPTIONS')
        self.send_header('Access-Control-Allow-Headers','Content-Type,Authorization')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin','*')
        self.send_header('Access-Control-Allow-Methods','GET,POST,OPTIONS')
        self.send_header('Access-Control-Allow-Headers','Content-Type,Authorization')
        self.end_headers()

if __name__ == '__main__':
    httpd = http.server.HTTPServer(('0.0.0.0',PORT),Handler)
    print(f'💀 SYBER VAULT v8.0 | Port {PORT}')
    print(f'🤖 Bot API: /api/bot/start | /api/bot/stop | /api/bot/list')
    httpd.serve_forever()
