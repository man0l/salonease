#!/usr/bin/env python3
"""Throwaway Paperclip API stub for the bundled skill helper tests.

Serves canned PATCH responses so the shell helpers can be exercised end to end
without touching the real Paperclip API. Every request is appended to the log
file named by --log so the test can assert on headers and payloads.

Usage: paperclip_api_stub.py <port-file> <log-file> [behaviour]
"""

from __future__ import annotations

import http.server
import json
import sys
import threading
from typing import Any

port_file = sys.argv[1]
log_file = sys.argv[2]
behaviour = sys.argv[3] if len(sys.argv) > 3 else "ok"

requests: list[dict[str, Any]] = []
lock = threading.Lock()


class Handler(http.server.BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, *args: object) -> None:
        return

    def _record(self, body: str) -> int:
        with lock:
            requests.append(
                {
                    "method": self.command,
                    "path": self.path,
                    "authorization": self.headers.get("Authorization"),
                    "run_id": self.headers.get("X-Paperclip-Run-Id"),
                    "content_type": self.headers.get("Content-Type"),
                    "body": body,
                }
            )
            with open(log_file, "w", encoding="utf-8") as handle:
                json.dump(requests, handle)
            return len(requests)

    def _reply(self, code: int, payload: str) -> None:
        raw = payload.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_PATCH(self) -> None:  # noqa: N802 - http.server API
        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length).decode("utf-8") if length else ""
        self._record(body)

        if behaviour == "ok":
            request = json.loads(body or "{}")
            self._reply(
                200,
                json.dumps(
                    {
                        "id": "issue-1",
                        "status": request.get("status", "todo"),
                        "updatedAt": "2026-01-01T00:00:00.000Z",
                    }
                ),
            )
        elif behaviour == "status-mismatch":
            self._reply(200, json.dumps({"id": "issue-1", "status": "in_progress"}))
        elif behaviour == "empty-body":
            self.send_response(200)
            self.send_header("Content-Length", "0")
            self.end_headers()
        elif behaviour == "client-error":
            self._reply(422, json.dumps({"error": "status not allowed"}))
        elif behaviour == "server-error":
            self._reply(500, json.dumps({"error": "boom"}))
        elif behaviour == "drop-connection":
            self.close_connection = True
            self.connection.close()
        else:
            self._reply(500, json.dumps({"error": f"unknown behaviour {behaviour}"}))

    def do_GET(self) -> None:  # noqa: N802 - http.server API
        self._record("")
        self._reply(200, json.dumps([]))


server = http.server.HTTPServer(("127.0.0.1", 0), Handler)
with open(port_file, "w", encoding="utf-8") as handle:
    handle.write(str(server.server_address[1]))
server.serve_forever()
