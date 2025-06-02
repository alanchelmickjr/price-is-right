#!/usr/bin/env python3
"""
eBay API Proxy Server
Handles eBay API calls to bypass CORS restrictions
"""

import http.server
import json
import urllib.request
import urllib.parse
import urllib.error
import base64
import sys
from socketserver import ThreadingMixIn

class EbayProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def do_POST(self):
        """Handle POST requests to eBay API"""
        if self.path == '/ebay/oauth/token':
            self.handle_oauth_token()
        elif self.path == '/ebay/sell/inventory/item':
            self.handle_sell_item()
        elif self.path.startswith('/ebay/buy/browse/item_summary/search'):
            self.handle_search()
        else:
            self.send_error(404, "Endpoint not found")
    
    def do_GET(self):
        """Handle GET requests"""
        if self.path.startswith('/ebay/buy/browse/item_summary/search'):
            self.handle_search()
        else:
            self.send_error(404, "Endpoint not found")
    
    def send_cors_headers(self):
        """Add CORS headers to allow browser requests"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    def handle_oauth_token(self):
        """Proxy OAuth token requests to eBay"""
        try:
            # Get request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else None
            
            # Parse the JSON request to get credentials
            request_data = json.loads(body.decode('utf-8'))
            client_id = request_data.get('client_id')
            client_secret = request_data.get('client_secret')
            sandbox = request_data.get('sandbox', True)
            
            # Determine eBay endpoint
            base_url = 'https://api.sandbox.ebay.com' if sandbox else 'https://api.ebay.com'
            token_url = f'{base_url}/identity/v1/oauth2/token'
            
            # Create OAuth request
            auth_string = base64.b64encode(f'{client_id}:{client_secret}'.encode()).decode()
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': f'Basic {auth_string}'
            }
            
            oauth_body = 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
            
            # Make request to eBay
            req = urllib.request.Request(token_url, data=oauth_body.encode(), headers=headers)
            
            with urllib.request.urlopen(req, timeout=10) as response:
                response_data = response.read()
                
                # Send response
                self.send_response(response.getcode())
                self.send_header('Content-Type', 'application/json')
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(response_data)
                
        except urllib.error.HTTPError as e:
            error_data = {'error': f'eBay API error: {e.code}', 'details': e.read().decode()}
            self.send_error_response(e.code, error_data)
        except Exception as e:
            error_data = {'error': f'Proxy error: {str(e)}'}
            self.send_error_response(500, error_data)
    
    def handle_search(self):
        """Proxy search requests to eBay"""
        try:
            # Get request body for POST or parse query for GET
            if self.command == 'POST':
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length) if content_length > 0 else None
                request_data = json.loads(body.decode('utf-8')) if body else {}
            else:
                # Parse query parameters for GET
                from urllib.parse import urlparse, parse_qs
                parsed = urlparse(self.path)
                query_params = parse_qs(parsed.query)
                request_data = {k: v[0] if len(v) == 1 else v for k, v in query_params.items()}
            
            access_token = request_data.get('access_token')
            query = request_data.get('q', '')
            sandbox = request_data.get('sandbox', 'true').lower() == 'true'
            
            # Determine eBay endpoint
            base_url = 'https://api.sandbox.ebay.com' if sandbox else 'https://api.ebay.com'
            search_url = f'{base_url}/buy/browse/v1/item_summary/search'
            
            # Build search parameters
            params = {
                'q': query,
                'limit': '20',
                'filter': 'conditionIds:{1000|1500|2000|2500|3000}',  # Various conditions
                'sort': 'price'
            }
            
            search_url += '?' + urllib.parse.urlencode(params)
            
            # Make request to eBay
            headers = {
                'Authorization': f'Bearer {access_token}',
                'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
            }
            
            req = urllib.request.Request(search_url, headers=headers)
            
            with urllib.request.urlopen(req, timeout=10) as response:
                response_data = response.read()
                
                # Send response
                self.send_response(response.getcode())
                self.send_header('Content-Type', 'application/json')
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(response_data)
                
        except urllib.error.HTTPError as e:
            error_data = {'error': f'eBay API error: {e.code}', 'details': e.read().decode()}
            self.send_error_response(e.code, error_data)
        except Exception as e:
            error_data = {'error': f'Proxy error: {str(e)}'}
            self.send_error_response(500, error_data)
    
    def handle_sell_item(self):
        """Proxy sell item requests to eBay (for future listing functionality)"""
        try:
            # Get request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else None
            request_data = json.loads(body.decode('utf-8'))
            
            access_token = request_data.get('access_token')
            sandbox = request_data.get('sandbox', True)
            
            # For now, return a mock response indicating this feature is coming
            response_data = {
                'success': False,
                'message': 'Listing functionality coming soon!',
                'sandbox': sandbox
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            error_data = {'error': f'Proxy error: {str(e)}'}
            self.send_error_response(500, error_data)
    
    def send_error_response(self, status_code, error_data):
        """Send JSON error response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(error_data).encode())
    
    def log_message(self, format, *args):
        """Log proxy requests"""
        if '--verbose' in sys.argv:
            super().log_message(format, *args)
        else:
            print(f"📡 {self.command} {self.path}")

class ThreadedHTTPServer(ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8081
    
    print(f"🌐 Starting eBay API Proxy on port {port}")
    print(f"   Endpoints:")
    print(f"   • POST /ebay/oauth/token - OAuth token requests")
    print(f"   • GET/POST /ebay/buy/browse/item_summary/search - Price searches")
    print(f"   • POST /ebay/sell/inventory/item - Item listings (future)")
    print(f"")
    
    server = ThreadedHTTPServer(('0.0.0.0', port), EbayProxyHandler)
    
    print(f"✅ eBay proxy ready at http://localhost:{port}")
    print(f"   CORS enabled for browser requests")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 eBay proxy stopped")
        server.shutdown()

if __name__ == '__main__':
    main()
