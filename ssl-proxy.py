#!/usr/bin/env python3
"""
SSL Proxy for llama-server
Provides HTTPS frontend for HTTP llama-server backend
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
from socketserver import ThreadingMixIn

class SSLProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.proxy_request()
    
    def do_POST(self):
        self.proxy_request()
    
    def do_OPTIONS(self):
        self.proxy_request()
    
    def proxy_request(self):
        try:
            # Build target URL for AI server
            target_url = f"http://localhost:8080{self.path}"  # Ensure correct AI server port
            
            # Prepare headers
            headers = {}
            for header, value in self.headers.items():
                if header.lower() not in ['host', 'connection']:
                    headers[header] = value
            
            # Handle request body for POST
            content_length = int(self.headers.get('Content-Length', 0))
            body = None
            if content_length > 0:
                body = self.rfile.read(content_length)
            
            # Create request
            req = urllib.request.Request(target_url, data=body, headers=headers, method=self.command)
            
            # Make request to backend
            with urllib.request.urlopen(req, timeout=30) as response:
                # Send response status
                self.send_response(response.getcode())
                
                # Forward headers
                for header, value in response.headers.items():
                    if header.lower() not in ['connection', 'transfer-encoding']:
                        self.send_header(header, value)
                
                # Add CORS headers
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                self.end_headers()
                
                # Forward response body
                self.wfile.write(response.read())
                
        except urllib.error.URLError as e:
            self.send_error(502, f"Backend server error: {e}")
        except Exception as e:
            self.send_error(500, f"Proxy error: {e}")
    
    def log_message(self, format, *args):
        # Suppress logs unless verbose
        if '--verbose' in sys.argv:
            super().log_message(format, *args)

class ThreadedHTTPServer(ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

def main():
    # Configuration
    ssl_port = int(sys.argv[1]) if len(sys.argv) > 1 else 8443
    backend_port = 8080
    cert_file = 'server.crt'
    key_file = 'server.key'
    
    print(f"🔐 Starting SSL proxy on port {ssl_port}")
    print(f"   Forwarding to HTTP backend on port {backend_port}")
    
    # Create server
    server = ThreadedHTTPServer(('0.0.0.0', ssl_port), SSLProxyHandler)
    
    # Add SSL context
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(cert_file, key_file)
    server.socket = context.wrap_socket(server.socket, server_side=True)
    
    print(f"✅ SSL proxy ready at https://localhost:{ssl_port}")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 SSL proxy stopped")
        server.shutdown()

if __name__ == '__main__':
    main()
