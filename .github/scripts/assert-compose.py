#!/usr/bin/env python3
"""Fail CI when a compose edit breaks a property production depends on.

SLA-332. `docs/vps-deploy-policy.md` §8 in the slashloop repo claims this gate
exists; until now it did not, so a prod compose edit (published queue port,
non-GHCR queue-api image, an edited router rule, a dropped secret file) could
reach green master and be pulled to the VPS. That is how the SLA-330 mirror
drift shipped unnoticed.

Scope and non-goals, stated so the next editor does not over-read it:

  * This asserts the Slashloop queue services only: queue-db, queue-api and
    queue-backup, plus the top-level volumes/secrets entries they depend on.
    It asserts nothing about the Salonease services that share the file.
  * It reads the COMMITTED docker-compose.prod.yml and nothing else. It never
    reads the VPS project .env, never reads a secret file, and takes no
    credentials. A green run here says "this file still says what it must
    say", not "prod is healthy" — see §8 for the residual VPS-local risk.
  * Expected values are deliberately byte-exact for the router rule and
    flow-sequence healthcheck lines. Reformatting those lines is a policy
    change: update EXPECTED here in the same PR that reformats, so the diff
    shows the intent.
  * Python standard library only, by design: this runs on a bare Actions
    runner with no dependency install, so there is no supply-chain surface
    and no phantom dependency to keep in sync.

Usage:
  assert-compose.py [--compose docker-compose.prod.yml] [--self-test]

`--self-test` re-runs the same checks against deliberately broken copies of
the real file and fails if any mutation slips through, so "the gate bites" is
re-proven on every compose edit instead of once by hand.
"""

from __future__ import annotations

import argparse
import sys

# ---------------------------------------------------------------------------
# Expected properties. One entry per thing that, if changed silently, changes
# production behaviour without changing anything a reviewer would notice.
# ---------------------------------------------------------------------------

EXPECTED_QUEUE_API_IMAGE = "ghcr.io/man0l/slashloop-queue-api:master"
EXPECTED_QUEUE_DB_IMAGE = "postgres:17"
EXPECTED_QUEUE_BACKUP_IMAGE = "postgres:17"
EXPECTED_QUEUE_DB_EXPOSE = ["5432"]
EXPECTED_QUEUE_API_EXPOSE = ["4100"]

# The queue ingress edge. Backticks and spacing are load-bearing: Traefik
# parses this string, and a one-character edit silently changes routing.
EXPECTED_QUEUE_API_LABELS = [
    "traefik.enable=true",
    "traefik.http.routers.queue-api.rule=Host(`queue.slashloop.dev`) && (Path(`/healthz`) || PathPrefix(`/v1/jobs`))",
    "traefik.http.routers.queue-api.entrypoints=websecure",
    "traefik.http.routers.queue-api.tls.certresolver=myresolver",
    "traefik.http.routers.queue-api.middlewares=queue-body-limit@docker,queue-ratelimit@docker",
    "traefik.http.services.queue-api.loadbalancer.server.port=4100",
    "traefik.http.services.queue-api.loadbalancer.passHostHeader=true",
    "traefik.http.middlewares.queue-body-limit.buffering.maxRequestBodyBytes=65536",
    "traefik.http.middlewares.queue-ratelimit.ratelimit.average=1",
    "traefik.http.middlewares.queue-ratelimit.ratelimit.burst=120",
    "traefik.http.middlewares.queue-ratelimit.ratelimit.period=1s",
]

EXPECTED_SECRET_NAME = "slashloop_queue_db_password"
EXPECTED_SECRET_FILE = "/root/salonease/slashloop-queue/db_password"

EXPECTED_SECRETS_ON = {
    "queue-db": [EXPECTED_SECRET_NAME],
    "queue-backup": [EXPECTED_SECRET_NAME],
}

# The db password reaches Postgres and pg_dump through a compose secret file,
# never as an environment value that could land in `docker inspect` output.
EXPECTED_SECRET_ENV = {
    ("queue-db", "POSTGRES_PASSWORD_FILE"): "/run/secrets/slashloop_queue_db_password",
    ("queue-backup", "PGPASSWORD_FILE"): "/run/secrets/slashloop_queue_db_password",
}

# queue-api's own credentials must stay interpolated from the host project
# .env. If one of these is ever inlined as a literal, that is a committed
# secret, and this gate should stop the PR that does it.
EXPECTED_QUEUE_API_ENV = {
    "QUEUE_API_PORT": "4100",
    "QUEUE_DATABASE_URL": "postgresql://slashloop_queue:${SLASHLOOP_QUEUE_DB_PASSWORD:?missing SLASHLOOP_QUEUE_DB_PASSWORD}@queue-db:5432/slashloop_queue",
    "QUEUE_API_KEY_ACTIVE_ID": "${SLASHLOOP_QUEUE_KEY_ACTIVE_ID:?missing SLASHLOOP_QUEUE_KEY_ACTIVE_ID}",
    "QUEUE_API_KEY_ACTIVE_SECRET": "${SLASHLOOP_QUEUE_HMAC_SECRET:?missing SLASHLOOP_QUEUE_HMAC_SECRET}",
}

EXPECTED_QUEUE_DB_HEALTHCHECK = {
    "test": '["CMD-SHELL", "pg_isready -U slashloop_queue -d slashloop_queue"]',
    "interval": "10s",
    "timeout": "5s",
    "retries": "5",
    "start_period": "30s",
}

EXPECTED_QUEUE_API_HEALTHCHECK = {
    "test": '["CMD-SHELL", "bun -e \\"fetch(\'http://localhost:4100/readyz\').then(r=>{if(!r.ok)process.exit(1)})\\" || exit 1"]',
    "interval": "15s",
    "timeout": "5s",
    "retries": "3",
    "start_period": "20s",
}

# Resource ceilings. queue-db runs Postgres; queue-api runs Bun workers. Both
# sit on a box that also serves the Salonease app, so a raised ceiling (or a
# dropped `limits` block, which makes the cap unlimited) starves production
# traffic instead of failing loudly.
EXPECTED_RESOURCES = {
    "queue-db": {
        "limits": {"cpus": "1.0", "memory": "1G"},
        "reservations": {"memory": "256M"},
    },
    "queue-api": {
        "limits": {"cpus": "0.5", "memory": "512M"},
        "reservations": {"memory": "128M"},
    },
    # `reservations` is a soft, single-host scheduling hint rather than a
    # production-safety property, so it is asserted only where one exists
    # today. Missing entries are left free rather than pinned to absent.
    "queue-backup": {
        "limits": {"cpus": "0.5", "memory": "512M"},
    },
}

EXPECTED_QUEUE_DB_MOUNTS = ["slashloop_queue_pgdata:/var/lib/postgresql/data"]
EXPECTED_QUEUE_BACKUP_MOUNTS = [
    "slashloop_queue_backups:/backups",
    "/root/salonease/slashloop-queue/queue-backup.sh:/usr/local/bin/queue-backup.sh:ro",
]
EXPECTED_TOP_LEVEL_VOLUMES = ["slashloop_queue_pgdata", "slashloop_queue_backups"]

QUEUE_SERVICES = ("queue-db", "queue-api", "queue-backup")


# ---------------------------------------------------------------------------
# Minimal indentation reader.
#
# Not a YAML parser: compose is indentation-structured, and the properties
# asserted here are keys an editor adds, drops, or retypes. Tracking only
# (line, indent) keeps the dependency surface at zero and keeps the failure
# messages anchored to a real line number.
# ---------------------------------------------------------------------------


def strip_comment(value: str) -> str:
    """Drop a trailing YAML comment, honouring quotes."""
    out: list[str] = []
    quote = ""
    prev = ""
    for char in value:
        if quote:
            out.append(char)
            if char == quote:
                quote = ""
        elif char == "#" and (prev == "" or prev.isspace()):
            break
        else:
            if char in "\"'":
                quote = char
            out.append(char)
        prev = char
    return "".join(out)


def unquote(value: str) -> str:
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        return value[1:-1]
    return value


class Doc:
    """Line-indexed view over a compose file."""

    def __init__(self, text: str) -> None:
        self.lines = text.split("\n")

    def __len__(self) -> int:
        return len(self.lines)

    def is_content(self, line: str) -> bool:
        stripped = line.strip()
        return bool(stripped) and not stripped.startswith("#")

    def block_end(self, at: int, limit: int, indent: int) -> int:
        """Index just past the block nested under the line at `at`."""
        index = at + 1
        while index < limit:
            line = self.lines[index]
            if self.is_content(line) and len(line) - len(line.lstrip(" ")) <= indent:
                break
            index += 1
        return index

    def find(self, low: int, high: int, indent: int, key: str) -> int | None:
        prefix = " " * indent + key + ":"
        for index in range(low, high):
            if self.lines[index].startswith(prefix):
                return index
        return None

    def find_all(self, low: int, high: int, indent: int, key: str) -> list[int]:
        prefix = " " * indent + key + ":"
        return [i for i in range(low, high) if self.lines[i].startswith(prefix)]

    def scalar(self, at: int) -> str:
        _, _, rest = self.lines[at].partition(":")
        return unquote(strip_comment(rest).strip())

    def items(self, low: int, high: int, indent: int) -> list[str]:
        prefix = " " * indent + "- "
        return [
            unquote(strip_comment(self.lines[i].strip()[2:]).strip())
            for i in range(low, high)
            if self.lines[i].startswith(prefix)
        ]

    def top(self, key: str) -> tuple[int, int] | None:
        at = self.find(0, len(self), 0, key)
        if at is None:
            return None
        return at, self.block_end(at, len(self), 0)

    def service(self, name: str) -> tuple[int, int] | None:
        span = self.top("services")
        if span is None:
            return None
        low, high = span
        at = self.find(low + 1, high, 2, name)
        if at is None:
            return None
        return at, self.block_end(at, high, 2)


class Report:
    """Collects failures so one run surfaces every broken property."""

    def __init__(self) -> None:
        self.failures: list[tuple[int, str, str]] = []

    def check(self, ok: bool, line: int, label: str, detail: str = "") -> bool:
        if not ok:
            self.failures.append((line, label, detail))
        return ok

    def equals(self, actual, expected, line: int, label: str) -> bool:
        return self.check(
            actual == expected, line, label, f"expected {expected!r}, got {actual!r}"
        )

    def contains_all(self, actual: list[str], expected: list[str], line: int, label: str) -> bool:
        missing = [item for item in expected if item not in actual]
        return self.check(not missing, line, label, f"missing {missing!r}")

    def exactly_once(self, haystack: list[str], needle: str, line: int, label: str) -> bool:
        count = haystack.count(needle)
        return self.check(
            count == 1, line, label, f"expected exactly one {needle!r}, found {count}"
        )

    def absent(self, haystack: list[str], needle: str, line: int, label: str) -> bool:
        return self.check(needle not in haystack, line, label, f"{needle!r} must not appear")


# ---------------------------------------------------------------------------
# The checks.
# ---------------------------------------------------------------------------


def check_top_level(doc: Doc, report: Report) -> None:
    for key in ("services", "volumes", "secrets"):
        report.check(doc.top(key) is not None, 1, f"top-level `{key}:` block exists")

    secrets = doc.top("secrets")
    if secrets is None:
        return
    low, high = secrets
    at = doc.find(low + 1, high, 2, EXPECTED_SECRET_NAME)
    if not report.check(
        at is not None, low + 1, f"`secrets.{EXPECTED_SECRET_NAME}` is declared"
    ):
        return
    file_key = doc.find(at + 1, doc.block_end(at, high, 2), 4, "file")
    if report.check(file_key is not None, at + 1, f"`secrets.{EXPECTED_SECRET_NAME}.file` exists"):
        report.equals(
            doc.scalar(file_key), EXPECTED_SECRET_FILE, file_key + 1, "secret file path"
        )

    volumes = doc.top("volumes")
    if volumes is None:
        return
    vlow, vhigh = volumes
    declared = [
        doc.lines[i].strip()[:-1]
        for i in range(vlow + 1, vhigh)
        if doc.is_content(doc.lines[i])
        and doc.lines[i].startswith("  ")
        and not doc.lines[i].startswith("    ")
        and doc.lines[i].rstrip().endswith(":")
    ]
    report.contains_all(declared, EXPECTED_TOP_LEVEL_VOLUMES, vlow + 1, "top-level volumes")


def check_service_exists(doc: Doc, report: Report, name: str) -> tuple[int, int] | None:
    span = doc.service(name)
    if span is None:
        report.check(False, 1, f"service `{name}` exists")
    return span


def check_image(doc: Doc, report: Report, name: str, span: tuple[int, int], expected: str) -> None:
    at, end = span
    images = doc.find_all(at + 1, end, 4, "image")
    report.check(len(images) == 1, at + 1, f"`{name}` declares exactly one image", f"found {len(images)}")
    if images:
        report.equals(doc.scalar(images[0]), expected, images[0] + 1, f"`{name}` image")
    report.check(
        doc.find(at + 1, end, 4, "build") is None,
        at + 1,
        f"`{name}` has no `build:` block",
        "images are built in GitHub Actions, never on the VPS",
    )


def check_no_published_ports(doc: Doc, report: Report, name: str, span: tuple[int, int]) -> None:
    at, end = span
    # Any indent: a published `ports:` under these services is the bug, so
    # matching a nested one too only makes the gate stricter, never looser.
    offenders = [
        i
        for i in range(at + 1, end)
        if doc.is_content(doc.lines[i]) and doc.lines[i].lstrip().startswith("ports:")
    ]
    report.check(
        not offenders, at + 1, f"`{name}` publishes no host ports",
        f"`ports:` at line {offenders[0] + 1}" if offenders else "",
    )


def check_expose(doc: Doc, report: Report, name: str, span: tuple[int, int], expected: list[str]) -> None:
    at, end = span
    expose = doc.find(at + 1, end, 4, "expose")
    if not report.check(expose is not None, at + 1, f"`{name}` declares `expose:`"):
        return
    report.equals(doc.items(expose + 1, doc.block_end(expose, end, 4), 6), expected, expose + 1, f"`{name}` expose list")


def check_labels(doc: Doc, report: Report, name: str, span: tuple[int, int], expected: list[str]) -> None:
    at, end = span
    labels = doc.find(at + 1, end, 4, "labels")
    if not report.check(labels is not None, at + 1, f"`{name}` declares Traefik `labels:`"):
        return
    lspan_end = doc.block_end(labels, end, 4)
    actual = doc.items(labels + 1, lspan_end, 6)
    for needle in expected:
        report.exactly_once(actual, needle, labels + 1, f"`{name}` label {needle!r}")
    rules = [item for item in actual if "routers.queue-api.rule=" in item]
    report.check(
        len(rules) == 1,
        labels + 1,
        f"`{name}` has exactly one queue-api router rule",
        f"found {len(rules)}",
    )


def check_secrets(doc: Doc, report: Report, name: str, span: tuple[int, int]) -> None:
    at, end = span
    secrets = doc.find(at + 1, end, 4, "secrets")
    if not report.check(secrets is not None, at + 1, f"`{name}` consumes a compose secret"):
        return
    report.equals(
        doc.items(secrets + 1, doc.block_end(secrets, end, 4), 6),
        EXPECTED_SECRETS_ON[name],
        secrets + 1,
        f"`{name}` secrets list",
    )


def check_env(doc: Doc, report: Report, name: str, span: tuple[int, int], expected: dict[str, str]) -> None:
    at, end = span
    env = doc.find(at + 1, end, 4, "environment")
    if not report.check(env is not None, at + 1, f"`{name}` declares `environment:`"):
        return
    env_span_end = doc.block_end(env, end, 4)
    for key, want in expected.items():
        key_at = doc.find(env + 1, env_span_end, 6, key)
        if not report.check(key_at is not None, env + 1, f"`{name}.{key}` is set"):
            continue
        report.equals(doc.scalar(key_at), want, key_at + 1, f"`{name}.{key}`")


def check_volumes(doc: Doc, report: Report, name: str, span: tuple[int, int], expected: list[str]) -> None:
    at, end = span
    volumes = doc.find(at + 1, end, 4, "volumes")
    if not report.check(volumes is not None, at + 1, f"`{name}` declares `volumes:`"):
        return
    report.equals(
        doc.items(volumes + 1, doc.block_end(volumes, end, 4), 6),
        expected,
        volumes + 1,
        f"`{name}` volume mounts",
    )


def check_healthcheck(doc: Doc, report: Report, name: str, span: tuple[int, int], expected: dict[str, str]) -> None:
    at, end = span
    hc = doc.find(at + 1, end, 4, "healthcheck")
    if not report.check(hc is not None, at + 1, f"`{name}` declares a healthcheck"):
        return
    hc_end = doc.block_end(hc, end, 4)
    for key, want in expected.items():
        key_at = doc.find(hc + 1, hc_end, 6, key)
        if not report.check(key_at is not None, hc + 1, f"`{name}.healthcheck.{key}` is set"):
            continue
        report.equals(doc.scalar(key_at), want, key_at + 1, f"`{name}.healthcheck.{key}`")


def check_resources(doc: Doc, report: Report, name: str, span: tuple[int, int]) -> None:
    at, end = span
    expected = EXPECTED_RESOURCES[name]
    deploy = doc.find(at + 1, end, 4, "deploy")
    if not report.check(deploy is not None, at + 1, f"`{name}` declares `deploy.resources`"):
        return
    resources = doc.find(deploy + 1, doc.block_end(deploy, end, 4), 6, "resources")
    if not report.check(resources is not None, deploy + 1, f"`{name}.deploy.resources` is set"):
        return
    res_end = doc.block_end(resources, doc.block_end(deploy, end, 4), 6)
    for group, wanted in expected.items():
        group_at = doc.find(resources + 1, res_end, 8, group)
        if not report.check(group_at is not None, resources + 1, f"`{name}.deploy.resources.{group}` exists"):
            continue
        group_end = doc.block_end(group_at, res_end, 8)
        for key, want in wanted.items():
            key_at = doc.find(group_at + 1, group_end, 10, key)
            if not report.check(key_at is not None, group_at + 1, f"`{name}.deploy.resources.{group}.{key}` is set"):
                continue
            report.equals(
                doc.scalar(key_at), want, key_at + 1, f"`{name}.deploy.resources.{group}.{key}"
            )


def check_depends_on(doc: Doc, report: Report, name: str, span: tuple[int, int]) -> None:
    at, end = span
    depends = doc.find(at + 1, end, 4, "depends_on")
    if not report.check(depends is not None, at + 1, f"`{name}` declares `depends_on:`"):
        return
    depends_end = doc.block_end(depends, end, 4)
    db = doc.find(depends + 1, depends_end, 6, "queue-db")
    if not report.check(db is not None, depends + 1, f"`{name}` depends on queue-db"):
        return
    condition = doc.find(db + 1, doc.block_end(db, depends_end, 6), 8, "condition")
    if not report.check(condition is not None, db + 1, f"`{name}` sets a depends_on condition"):
        return
    report.equals(doc.scalar(condition), "service_healthy", condition + 1, f"`{name}` depends_on condition")


def run(text: str) -> Report:
    doc = Doc(text)
    report = Report()
    check_top_level(doc, report)

    spans = {name: check_service_exists(doc, report, name) for name in QUEUE_SERVICES}

    check_image(doc, report, "queue-db", spans["queue-db"], EXPECTED_QUEUE_DB_IMAGE)
    check_image(doc, report, "queue-api", spans["queue-api"], EXPECTED_QUEUE_API_IMAGE)
    check_image(doc, report, "queue-backup", spans["queue-backup"], EXPECTED_QUEUE_BACKUP_IMAGE)

    for name in ("queue-db", "queue-api"):
        check_no_published_ports(doc, report, name, spans[name])

    check_expose(doc, report, "queue-db", spans["queue-db"], EXPECTED_QUEUE_DB_EXPOSE)
    check_expose(doc, report, "queue-api", spans["queue-api"], EXPECTED_QUEUE_API_EXPOSE)

    check_labels(doc, report, "queue-api", spans["queue-api"], EXPECTED_QUEUE_API_LABELS)

    for name in ("queue-db", "queue-backup"):
        check_secrets(doc, report, name, spans[name])
    for (name, key), want in EXPECTED_SECRET_ENV.items():
        check_env(doc, report, name, spans[name], {key: want})

    check_env(doc, report, "queue-api", spans["queue-api"], EXPECTED_QUEUE_API_ENV)

    check_volumes(doc, report, "queue-db", spans["queue-db"], EXPECTED_QUEUE_DB_MOUNTS)
    check_volumes(doc, report, "queue-backup", spans["queue-backup"], EXPECTED_QUEUE_BACKUP_MOUNTS)

    check_healthcheck(doc, report, "queue-db", spans["queue-db"], EXPECTED_QUEUE_DB_HEALTHCHECK)
    check_healthcheck(doc, report, "queue-api", spans["queue-api"], EXPECTED_QUEUE_API_HEALTHCHECK)

    for name in QUEUE_SERVICES:
        check_resources(doc, report, name, spans[name])

    check_depends_on(doc, report, "queue-api", spans["queue-api"])
    check_depends_on(doc, report, "queue-backup", spans["queue-backup"])

    return report


# ---------------------------------------------------------------------------
# Self-test: prove each guard actually bites.
#
# Every mutation below is derived from the real file by replacing a snippet
# that must occur exactly once. A mutation that the checks fail to catch is
# itself a failure, because it means a guard is decorative.
# ---------------------------------------------------------------------------

MUTATIONS = [
    (
        "published port on queue-db",
        '    expose:\n      - "5432"',
        '    ports:\n      - "5432"\n    expose:\n      - "5432"',
    ),
    (
        "published port on queue-api",
        '    expose:\n      - "4100"',
        '    ports:\n      - "127.0.0.1:4100:4100"\n    expose:\n      - "4100"',
    ),
    (
        "queue-api image off GHCR",
        "    image: ghcr.io/man0l/slashloop-queue-api:master",
        "    image: queue-api:local",
    ),
    (
        "queue-api built on the VPS instead of Actions",
        "    image: ghcr.io/man0l/slashloop-queue-api:master\n",
        "    build:\n      context: ../queue-api\n    image: ghcr.io/man0l/slashloop-queue-api:master\n",
    ),
    (
        "router rule host widened",
        "Host(`queue.slashloop.dev`)",
        "HostRegexp(`{subdomain:[a-z]+.}slashloop.dev`)",
    ),
    (
        "router rule path narrowed",
        "(Path(`/healthz`) || PathPrefix(`/v1/jobs`))",
        "PathPrefix(`/v1/jobs`)",
    ),
    (
        "secret file path changed",
        f"file: {EXPECTED_SECRET_FILE}",
        "file: ./slashloop-queue/db_password",
    ),
    (
        "secret dropped from queue-db",
        "POSTGRES_PASSWORD_FILE: /run/secrets/slashloop_queue_db_password\n    secrets:\n      - slashloop_queue_db_password",
        "POSTGRES_PASSWORD_FILE: /run/secrets/slashloop_queue_db_password",
    ),
    (
        "queue-api key inlined instead of interpolated",
        "QUEUE_API_KEY_ACTIVE_SECRET: ${SLASHLOOP_QUEUE_HMAC_SECRET:?missing SLASHLOOP_QUEUE_HMAC_SECRET}",
        'QUEUE_API_KEY_ACTIVE_SECRET: "literal-from-a-shell-history"',
    ),
    (
        "queue-db pgdata volume lost",
        "      - slashloop_queue_pgdata:/var/lib/postgresql/data",
        "      - slashloop_queue_pgdata:/var/lib/postgresql/data\n      - /tmp:/tmp",
    ),
    (
        "queue-db healthcheck weakened",
        'test: ["CMD-SHELL", "pg_isready -U slashloop_queue -d slashloop_queue"]',
        'test: ["CMD-SHELL", "true"]',
    ),
    (
        "queue-api healthcheck start_period cut",
        "      start_period: 20s",
        "      start_period: 0s",
    ),
    (
        "queue-db memory ceiling raised",
        '          memory: 1G',
        '          memory: 8G',
    ),
    (
        "queue-api reservations dropped",
        "          memory: 512M\n        reservations:\n          memory: 128M",
        "          memory: 512M\n        reservations: {}",
    ),
    (
        "queue-api stopped waiting for a healthy queue-db",
        "    pull_policy: always\n    restart: unless-stopped\n    depends_on:\n      queue-db:\n        condition: service_healthy",
        "    pull_policy: always\n    restart: unless-stopped\n    depends_on:\n      queue-db:\n        condition: service_started",
    ),
    (
        "queue-api listen port moved",
        'QUEUE_API_PORT: "4100"',
        'QUEUE_API_PORT: "8080"',
    ),
]


def self_test(text: str) -> Report:
    report = Report()
    for name, old, new in MUTATIONS:
        occurrences = text.count(old)
        if occurrences != 1:
            report.check(
                False, 1, f"self-test mutation {name!r} is still applicable",
                f"anchor occurs {occurrences} times, expected exactly 1",
            )
            continue
        caught = run(text.replace(old, new, 1)).failures
        report.check(
            bool(caught), 1, f"self-test mutation {name!r} is rejected",
            "the checks passed a deliberately broken compose file",
        )
    return report


def emit(report: Report, title: str) -> int:
    if report.failures:
        print(f"::group::{title}: {len(report.failures)} failure(s)")
        for line, label, detail in report.failures:
            print(f"::error file=docker-compose.prod.yml,line={max(line, 1)},title={label}::{detail}")
        print("::endgroup::")
        return 1
    print(f"{title}: OK")
    return 0


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--compose", default="docker-compose.prod.yml")
    parser.add_argument(
        "--self-test",
        action="store_true",
        help="also assert that a set of deliberately broken copies are rejected",
    )
    args = parser.parse_args(argv)

    try:
        with open(args.compose, encoding="utf-8") as handle:
            text = handle.read()
    except OSError as error:
        print(f"::error::{args.compose} could not be read: {error}")
        return 1

    status = emit(run(text), "assert-compose")

    if args.self_test and status == 0:
        status = emit(self_test(text), "assert-compose self-test") or status

    return status


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))