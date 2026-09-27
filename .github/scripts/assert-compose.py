#!/usr/bin/env python3
"""Compose-prod deploy guardrails (SLA-15 follow-up).

Fails the workflow when an edit to docker-compose.prod.yml breaks the
sanctioned VPS deploy model. Input: `docker compose config --format json`
(in CI) or any parsed-YAML JSON with the same shape (local check).

Usage: python3 assert-compose.py /tmp/compose.json
"""
import json
import sys

QUEUE_SERVICES = ("queue-db", "queue-api", "queue-backup")
EXPECTED_ROUTER_RULE = (
    "traefik.http.routers.queue-api.rule="
    "Host(`queue.slashloop.dev`) && (Path(`/healthz`) || PathPrefix(`/v1/jobs`))"
)


def check(name, ok, detail=""):
    status = "PASS" if ok else "FAIL"
    print(f"[{status}] {name}" + (f" — {detail}" if detail and not ok else ""))
    return ok


def main(path):
    with open(path) as f:
        cfg = json.load(f)
    services = cfg.get("services", {})
    volumes = cfg.get("volumes", {})
    secrets = cfg.get("secrets", {})
    ok = True

    # 1. Queue services exist.
    ok &= check(
        "queue services present",
        all(s in services for s in QUEUE_SERVICES),
        f"services={sorted(services)}",
    )

    # 2. Nothing but traefik publishes host ports; queue stack is internal.
    # Ports are strings in raw YAML ("80:80") and objects after
    # `docker compose config` — accept both shapes.
    def port_text(p):
        if isinstance(p, dict):
            return str(p.get("published", p.get("target", p)))
        return str(p)

    for svc_name, svc in services.items():
        published = svc.get("ports") or []
        if svc_name == "traefik":
            ports = " ".join(port_text(p) for p in published)
            ok &= check(
                "traefik still publishes 80/443",
                "80" in ports and "443" in ports,
                f"traefik ports={ports}",
            )
        else:
            ok &= check(
                f"{svc_name} publishes no host ports",
                not published,
                f"ports={published}",
            )

    # 3. queue-api comes from GitHub Actions, never a local VPS build.
    api = services.get("queue-api", {})
    ok &= check(
        "queue-api uses GHCR image",
        api.get("image", "").startswith("ghcr.io/man0l/slashloop-queue-api:"),
        f"image={api.get('image')}",
    )
    ok &= check(
        "queue-api has no local build context",
        "build" not in api,
        f"build={api.get('build')}",
    )

    # 4. Traefik isolation: exact-host router, TLS resolver, middlewares.
    labels = api.get("labels", [])
    label_text = "\n".join(
        labels if isinstance(labels, list)
        else [f"{k}={v}" for k, v in labels.items()]
    )
    ok &= check(
        "queue router is exact-host queue.slashloop.dev",
        EXPECTED_ROUTER_RULE in label_text,
        "router rule changed or missing",
    )
    ok &= check(
        "queue router uses websecure + myresolver",
        "routers.queue-api.entrypoints=websecure" in label_text
        and "routers.queue-api.tls.certresolver=myresolver" in label_text,
        "entrypoint/resolver changed",
    )

    # 5. Secrets come from the host file, never baked in.
    ok &= check(
        "queue db password is a host secret file",
        (secrets.get("slashloop_queue_db_password") or {}).get("file", "")
        .endswith("slashloop-queue/db_password"),
        f"secrets={secrets}",
    )
    api_env = api.get("environment", {})
    ok &= check(
        "queue-api takes secrets via env interpolation",
        "QUEUE_DATABASE_URL" in api_env and "queue-db:5432" in str(api_env.get("QUEUE_DATABASE_URL")),
        "QUEUE_DATABASE_URL missing or not pointed at queue-db",
    )

    # 6. Volumes survive recreates; healthchecks gate startup order.
    ok &= check(
        "queue volumes declared",
        "slashloop_queue_pgdata" in volumes
        and "slashloop_queue_backups" in volumes,
        f"volumes={sorted(volumes)}",
    )
    for s in ("queue-db", "queue-api"):
        ok &= check(
            f"{s} has a healthcheck",
            bool(services.get(s, {}).get("healthcheck")),
            "missing healthcheck",
        )
    ok &= check(
        "queue-api waits for healthy queue-db",
        ((services.get("queue-api", {}).get("depends_on") or {}).get("queue-db") or {}).get(
            "condition"
        )
        == "service_healthy",
        "depends_on condition changed",
    )

    # 7. Resource budgets so queue load cannot starve Salonease.
    for s in QUEUE_SERVICES:
        limits = (
            ((services.get(s, {}).get("deploy") or {}).get("resources") or {}).get("limits")
            or {}
        )
        ok &= check(
            f"{s} has memory limit",
            bool(limits.get("memory")),
            f"deploy={services.get(s, {}).get('deploy')}",
        )

    print("GUARDRAILS_OK" if ok else "GUARDRAILS_FAILED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
