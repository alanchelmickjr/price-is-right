#!/usr/bin/env python3
"""
HTTPS server for Simply eBay PWA
Enables camera permissions and PWA installation
"""

import http.server
import ssl
import socketserver
import os
import sys

# Set up HTTPS server
PORT = 8443
Handler = http.server.SimpleHTTPRequestHandler

class CustomHTTPRequestHandler(Handler):
    def end_headers(self):
        # Add security headers for PWA
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Permissions-Policy', 'camera=*, microphone=*, geolocation=*')
        super().end_headers()

def run_https_server():
    print(f"🔒 Starting HTTPS server on port {PORT}")
    print(f"📱 App will be available at: https://localhost:{PORT}")
    print("⚠️  You'll need to accept the self-signed certificate")
    
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        # Create SSL context
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain('cert.pem', 'key.pem')
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        
        print(f"✅ HTTPS Server started at https://localhost:{PORT}")
        httpd.serve_forever()

if __name__ == "__main__":
    if not os.path.exists('cert.pem') or not os.path.exists('key.pem'):
        print("❌ SSL certificates not found. Please run the certificate generation first.")
        sys.exit(1)
    
    run_https_server()
