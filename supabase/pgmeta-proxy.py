import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
from urllib.request import Request, urlopen

PG_META_URL = os.environ.get("PG_META_URL", "http://supabase-meta:8080").rstrip("/")


def _error_payload(message: str, code: str = "proxy_error"):
    return {
        "message": message,
        "code": code,
        "formattedError": message,
    }


class ProxyHandler(BaseHTTPRequestHandler):
    def _forward(self, method: str, path: str, body: bytes | None = None):
        url = f"{PG_META_URL}{path}"
        req = Request(url, method=method, data=body)
        if body is not None:
            req.add_header("Content-Type", "application/json")
        try:
            with urlopen(req, timeout=15) as resp:
                data = resp.read()
                self.send_response(resp.status)
                for k, v in resp.headers.items():
                    if k.lower() == "content-length":
                        continue
                    self.send_header(k, v)
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
        except Exception as exc:
            payload = json.dumps(_error_payload(str(exc))).encode()
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

    def do_GET(self):
        self._forward("GET", self.path)

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path.endswith("/query"):
            key = parse_qs(parsed.query).get("key", [""])[0]
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length) if length > 0 else b"{}"
            try:
                preview = body[:200].decode(errors="replace")
            except Exception:
                preview = "<unreadable>"
            hdr_key = self.headers.get("x-query-key") or self.headers.get("x-supabase-query-key")
            hdr_ref = self.headers.get("referer")
            print(
                f"proxy /query key={key!r} hdr_key={hdr_key!r} referer={hdr_ref!r} len={length} body_preview={preview!r}",
                flush=True,
            )
            if key == "schemas":
                return self._forward("GET", "/schemas")
            if key in ("fdws", "foreign-tables"):
                return self._forward("GET", "/foreign-tables")
            if key.startswith("entity-types"):
                return self._forward("GET", "/types")
            if key == "tables":
                return self._forward("GET", "/tables")
            if key.startswith("foreign-key-constraints"):
                payload = json.dumps({"data": [], "count": 0}).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
                return
            if not key and body.strip() in (b"{}", b""):
                payload = json.dumps({"data": [], "count": 0}).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
                return
            # Fallback: forward to pg-meta /query if provided
            return self._forward("POST", "/query", body)

        self.send_response(404)
        payload = json.dumps(_error_payload("Not found", "not_found")).encode()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)


def main():
    host = "0.0.0.0"
    port = int(os.environ.get("PORT", "8082"))
    server = HTTPServer((host, port), ProxyHandler)
    server.serve_forever()


if __name__ == "__main__":
    main()
