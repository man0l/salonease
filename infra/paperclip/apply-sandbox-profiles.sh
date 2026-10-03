#!/usr/bin/env bash
set -euo pipefail
# Run on the authorized VPS from its infrastructure checkout after agents drain.
infra_root="${1:-/root/salonease}"
cd "$infra_root"
install -m 0644 infra/paperclip/paperclip-codex.apparmor /etc/apparmor.d/paperclip-codex
apparmor_parser -r /etc/apparmor.d/paperclip-codex
docker compose -f docker-compose.prod.yml config --quiet
docker compose -f docker-compose.prod.yml up -d --no-deps --pull never paperclip
for attempt in $(seq 1 60); do
  if curl -fsS http://127.0.0.1:3100/api/health >/dev/null 2>&1; then break; fi
  # Container is behind Traefik, so verify health inside its network namespace.
  if docker exec salonease-paperclip-1 node -e "fetch('http://127.0.0.1:3100/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; then break; fi
  sleep 2
done
docker exec salonease-paperclip-1 node -e "fetch('http://127.0.0.1:3100/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
docker exec -u node salonease-paperclip-1 sh -c 'mkdir -p /home/node/sla374-sandbox-work /home/node/sla374-sandbox-outside; cd /home/node/sla374-sandbox-work; codex sandbox -c '\''sandbox_mode="workspace-write"'\'' -- /bin/sh -c '\''touch /home/node/sla374-sandbox-work/pass; if touch /home/node/sla374-sandbox-outside/escape 2>/dev/null; then echo boundary-fail; exit 1; fi; echo boundary-pass'\'''
docker inspect salonease-paperclip-1 --format 'SecurityOpt={{json .HostConfig.SecurityOpt}} CapAdd={{json .HostConfig.CapAdd}} AppArmor={{.AppArmorProfile}}'
