"""Focused black-box checks for scripts/upload-file.sh."""

import base64
import http.server
import json
import os
from pathlib import Path
import subprocess
import tempfile
import threading
import unittest
from urllib.parse import parse_qs, urlsplit


ROOT = Path(__file__).resolve().parents[1]
UPLOAD = ROOT / "scripts/upload-file.sh"
DECRYPT = ROOT / "scripts/decrypt-file.sh"
PART = 5_242_816


class UploadServer(http.server.ThreadingHTTPServer):
    def __init__(self):
        super().__init__(("127.0.0.1", 0), UploadHandler)
        self.requests = []
        self.parts = {}
        self.failure = None
        self.commit_status = 204

    @property
    def url(self):
        return f"http://127.0.0.1:{self.server_port}/"


class UploadHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, *_args):
        pass

    def respond(self, status, body=b"", content_type="text/plain", headers=None):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        for name, value in (headers or {}).items():
            self.send_header(name, value)
        self.end_headers()
        self.wfile.write(body)

    def handle_request(self):
        body = self.rfile.read(int(self.headers.get("Content-Length", "0")))
        path = urlsplit(self.path)
        self.server.requests.append((self.command, self.path, dict(self.headers), body))
        stage = "create" if path.path == "/file/upload" and self.command == "POST" else (
            "presign" if self.command == "GET" else
            "part" if path.path.startswith("/presigned/") else "commit"
        )
        if self.server.failure == stage:
            self.respond(503, b"upload stage unavailable")
            return
        if stage == "create":
            self.respond(200, b'{"id":"test-id"}', "application/json")
        elif stage == "presign":
            number = parse_qs(path.query)["part"][0]
            data = json.dumps({"url": self.server.url + "presigned/" + number}).encode()
            self.respond(200, data, "application/json")
        elif stage == "part":
            self.server.parts[int(path.path.rsplit("/", 1)[1])] = body
            self.respond(200, headers={"ETag": '"part-' + path.path.rsplit("/", 1)[1] + '"'})
        else:
            self.respond(self.server.commit_status)

    do_POST = handle_request
    do_GET = handle_request
    do_PUT = handle_request


class UploadFileTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix="not3-upload-test-")
        self.addCleanup(self.tmp.cleanup)
        self.directory = Path(self.tmp.name)
        self.server = UploadServer()
        thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        thread.start()
        self.addCleanup(self.server.server_close)
        self.addCleanup(self.server.shutdown)

    def run_upload(self, *args, env=None):
        return subprocess.run(
            ["/bin/bash", str(UPLOAD), "--server", self.server.url, *map(str, args)],
            capture_output=True, text=True, env=env,
        )

    def make_file(self, size, name="input.bin"):
        path = self.directory / name
        with path.open("wb") as output:
            remaining = size
            while remaining:
                data = os.urandom(min(remaining, 1_048_576))
                output.write(data)
                remaining -= len(data)
        return path

    def test_help_and_bad_seed_do_not_create(self):
        help_result = subprocess.run(["bash", str(UPLOAD), "--help"], capture_output=True, text=True)
        self.assertEqual(help_result.returncode, 0, help_result.stderr)
        self.assertIn("--name", help_result.stdout)
        file = self.make_file(1)
        for seed in ("invalid!", base64.b64encode(b"short").decode()):
            with self.subTest(seed=seed):
                result = self.run_upload("--seed", seed, file)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("seed", result.stderr.lower())
        self.assertEqual(self.server.requests, [])

    def test_missing_curl_is_reported_before_create(self):
        bin_dir = self.directory / "bin"
        bin_dir.mkdir()
        for name in ("openssl", "base64", "xxd", "sha256sum", "head", "tail", "dd", "stat", "mktemp", "rm"):
            (bin_dir / name).symlink_to(Path("/usr/bin") / name)
        env = dict(os.environ, PATH=str(bin_dir))
        result = self.run_upload(self.make_file(1), env=env)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("curl", result.stderr)
        self.assertEqual(self.server.requests, [])

    def test_boundary_parts_and_decrypt_round_trip(self):
        for size, lengths in (
            (0, [64]),
            (1, [64]),
            (PART, [5_242_880]),
            (PART + 1, [5_242_880, 64]),
            (12_582_912, [5_242_880, 5_242_880, 2_097_344]),
        ):
            with self.subTest(size=size):
                self.server.parts.clear()
                self.server.requests.clear()
                original = self.make_file(size)
                result = self.run_upload("--password", "secret", original)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual([len(self.server.parts[i]) for i in sorted(self.server.parts)], lengths)
                self.assertEqual(result.stderr.count("Uploading part"), len(lengths))
                seed = next(line[6:] for line in result.stdout.splitlines() if line.startswith("Seed  "))
                encrypted = self.directory / "encrypted.bin"
                encrypted.write_bytes(b"".join(self.server.parts.values()))
                output = self.directory / "decrypted.bin"
                output.unlink(missing_ok=True)
                decrypted = subprocess.run(
                    ["bash", str(DECRYPT), str(encrypted), seed, str(output)],
                    capture_output=True, text=True,
                )
                self.assertEqual(decrypted.returncode, 0, decrypted.stdout + decrypted.stderr)
                self.assertEqual(subprocess.run(["cmp", str(original), str(output)]).returncode, 0)
                for method, path, headers, _ in self.server.requests:
                    if path.startswith("/presigned/"):
                        self.assertNotIn("Authorization", headers)
                    else:
                        self.assertEqual(headers.get("Authorization"), "Bearer secret")
                commits = [json.loads(body) for method, path, _, body in self.server.requests
                           if method == "PUT" and path == "/file/upload/test-id"]
                self.assertEqual(commits, [{"etags": [f'"part-{i}"' for i in range(1, len(lengths) + 1)]}])

    def test_name_and_fragment_and_quiet_output(self):
        original = self.make_file(1, "a b.txt")
        seed = base64.b64encode(bytes(range(32))).decode()
        env = dict(os.environ, NOT3_SERVER="https://ignored.example", NOT3_SEED="wrong")
        result = self.run_upload("--seed", seed, "--name", 'a b+".txt', "--quiet", original, env=env)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(self.server.requests[0][3]), {"name": "a_b__.txt"})
        self.assertEqual(len(result.stdout.splitlines()), 1)
        share = urlsplit(result.stdout.strip())
        self.assertEqual(share.path, "/f/test-id")
        self.assertEqual(parse_qs(base64.b64decode(share.fragment).decode()),
                         {"k": [seed], "s": [self.server.url]})

    def test_unicode_name_replaces_each_character_once(self):
        result = self.run_upload("--name", "é.txt", self.make_file(1))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(self.server.requests[0][3]), {"name": "_.txt"})

    def test_api_failure_reports_status_body_and_id(self):
        self.server.failure = "commit"
        result = self.run_upload(self.make_file(1))
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("503", result.stderr)
        self.assertIn("upload stage unavailable", result.stderr)
        self.assertIn("test-id", result.stderr)
        self.assertFalse(any("abort" in path for _, path, _, _ in self.server.requests))

    def test_presigned_put_failure_reports_id(self):
        self.server.failure = "part"
        result = self.run_upload(self.make_file(1))
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("503", result.stderr)
        self.assertIn("test-id", result.stderr)

    def test_commit_requires_204(self):
        self.server.commit_status = 200
        result = self.run_upload(self.make_file(1))
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("200", result.stderr)
        self.assertIn("test-id", result.stderr)


if __name__ == "__main__":
    unittest.main()
