#!/usr/bin/env python3
"""Demo server with caching off, so an edited stylesheet is never stale."""
import http.server, socketserver

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

if __name__ == "__main__":
    with socketserver.TCPServer(("127.0.0.1", 3114), NoCache) as httpd:
        httpd.serve_forever()
