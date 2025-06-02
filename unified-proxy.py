#!/usr/bin/env python3
"""
Unified Proxy Server for Simply eBay
Handles both AI server and eBay API requests with CORS support
"""

import ssl
import socket
import threading
import http.server
import urllib.request
import urllib.parse
import urllib.error
import json
import sys
import base64
from socketserver import ThreadingMixIn

class UnifiedProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.proxy_request()
    
    def do_POST(self):
        self.proxy_request()
    
    def do_OPTIONS(self):
        # Handle CORS preflight
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def send_cors_headers(self):
        """Add CORS headers to all responses"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-eBay-API-AppID, X-eBay-API-Token')
        self.send_header('Access-Control-Max-Age', '86400')
    
    def proxy_request(self):
        try:
            # Route based on path
            if self.path.startswith('/api/ebay/'):
                self.proxy_ebay_request()
            elif self.path.startswith('/v1/') or self.path.startswith('/health'):
                self.proxy_ai_request()
            else:
                self.send_error(404, "Unknown endpoint")
                
        except Exception as e:
            print(f"Proxy error: {e}")
            self.send_error(500, f"Proxy error: {e}")
    
    def proxy_ai_request(self):
        """Proxy AI server requests"""
        target_url = f"http://localhost:8080{self.path}"
        self._forward_request(target_url)
    
    def proxy_ebay_request(self):
        """Proxy eBay API requests"""
        # Remove /api/ebay prefix and build eBay URL
        ebay_path = self.path[10:]  # Remove '/api/ebay/'
        
        # Determine if sandbox or production
        sandbox = self.headers.get('X-eBay-Sandbox', 'true').lower() == 'true'
        base_url = 'https://api.sandbox.ebay.com' if sandbox else 'https://api.ebay.com'
        target_url = f"{base_url}{ebay_path}"
        
        print(f"🔄 Proxying eBay API: {target_url}")
        self._forward_request(target_url)
    
    def _forward_request(self, target_url):
        """Forward request to target URL"""
        # Prepare headers
        headers = {}
        for header, value in self.headers.items():
            if header.lower() not in ['host', 'connection']:
                headers[header] = value
        
        # Handle request body for POST/PUT
        content_length = int(self.headers.get('Content-Length', 0))
        body = None
        if content_length > 0:
            body = self.rfile.read(content_length)
        
        # Create request
        req = urllib.request.Request(target_url, data=body, headers=headers, method=self.command)
        
        # Make request to backend
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                # Send response status
                self.send_response(response.getcode())
                
                # Forward headers
                for header, value in response.headers.items():
                    if header.lower() not in ['connection', 'transfer-encoding']:
                        self.send_header(header, value)
                
                # Add CORS headers
                self.send_cors_headers()
                self.end_headers()
                
                # Forward response body
                self.wfile.write(response.read())
                
        except urllib.error.HTTPError as e:
            # Forward HTTP errors with CORS headers
            self.send_response(e.code)
            self.send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            error_body = e.read() if hasattr(e, 'read') else b'{"error": "HTTP Error"}'
            self.wfile.write(error_body)
            
        except urllib.error.URLError as e:
            self.send_error(502, f"Backend server error: {e}")
    
    def log_message(self, format, *args):
        # Always log proxy requests for debugging
        print(f"🌐 {self.command} {self.path} - {format % args}")

class ThreadedHTTPServer(ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

def main():
    # Configuration
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8443
    use_ssl = '--ssl' in sys.argv or port == 8443
    
    print(f"🚀 Starting Unified Proxy on port {port}")
    print(f"   📱 AI Server: /v1/* → http://localhost:8080")
    print(f"   🛒 eBay API: /api/ebay/* → https://api.sandbox.ebay.com")
    
    # Create server
    server = ThreadedHTTPServer(('0.0.0.0', port), UnifiedProxyHandler)
    
    if use_ssl:
        # Add SSL context
        cert_file = 'server.crt'
        key_file = 'server.key'
        
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(cert_file, key_file)
        server.socket = context.wrap_socket(server.socket, server_side=True)
        
        print(f"✅ HTTPS Unified proxy ready at https://localhost:{port}")
    else:
        print(f"✅ HTTP Unified proxy ready at http://localhost:{port}")
    
    print("\n📋 Usage Examples:")
    print(f"   AI Health: GET {('https' if use_ssl else 'http')}://localhost:{port}/health")
    print(f"   AI Chat: POST {('https' if use_ssl else 'http')}://localhost:{port}/v1/chat/completions")
    print(f"   eBay Search: GET {('https' if use_ssl else 'http')}://localhost:{port}/api/ebay/buy/browse/v1/item_summary/search?q=...")
    print(f"   eBay OAuth: POST {('https' if use_ssl else 'http')}://localhost:{port}/api/ebay/identity/v1/oauth2/token")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Unified proxy stopped")
        server.shutdown()

if __name__ == '__main__':
    main()
