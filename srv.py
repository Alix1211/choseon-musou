import http.server,socketserver
class H(http.server.SimpleHTTPRequestHandler):
    def guess_type(self,p):
        t=super().guess_type(p)
        return t+'; charset=utf-8' if t.startswith('text/html') else t
socketserver.TCPServer.allow_reuse_address=True
socketserver.TCPServer(('',8766),H).serve_forever()
