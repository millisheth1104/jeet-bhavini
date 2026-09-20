#!/usr/bin/env python3
"""Static dev server that refuses to let the browser cache anything.

`python -m http.server` sends Last-Modified, so browsers keep serving stale
images after the files on disk change - which silently hides asset edits.
This sends no-store instead.

    python scripts/devserver.py [port]
"""
import functools
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class NoCacheHandler(SimpleHTTPRequestHandler):
    extensions_map = dict(SimpleHTTPRequestHandler.extensions_map)
    extensions_map.update({
        ".js":  "text/javascript",
        ".mjs": "text/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
        ".webp": "image/webp",
        ".ics": "text/calendar",
    })

    def do_GET(self):
        # SPA routing: if requesting a clean guest path that doesn't exist on disk, serve index.html
        clean_path = self.path.split("?")[0].split("#")[0]
        full_path = self.translate_path(clean_path)
        if not os.path.exists(full_path) and not os.path.splitext(clean_path)[1]:
            # Preserve query string if any
            query = ("?" + self.path.split("?", 1)[1]) if "?" in self.path else ""
            self.path = "/index.html" + query
        return super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        # keep 200s quiet, surface anything that isn't found
        msg = fmt % args
        if " 404 " in msg or " 500 " in msg:
            sys.stderr.write("%s\n" % msg)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5178
    handler = functools.partial(NoCacheHandler, directory=ROOT)
    srv = ThreadingHTTPServer(("127.0.0.1", port), handler)
    print("serving %s on http://localhost:%d (no-store)" % (ROOT, port), flush=True)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
