# Hermes gateway (internal, Paperclip `hermes_gateway` adapter)

Internal-only service on `app-network`, reachable by Paperclip at
`http://hermes-gateway:8642`. No Traefik route on purpose — Paperclip calls it
over Docker DNS, same as `openclaw-gateway`.

On the deployment host, create `hermes/.env` from `.env.example`, fill in the
gateway key and both provider keys, then deploy only through Git:

```sh
cd /root/salonease
git pull
docker compose -f docker-compose.prod.yml up -d --build hermes-gateway
```

## Skills

Paperclip's `hermes_gateway` adapter does not synchronize Paperclip company
skills yet (`supported: false`, `mode: unsupported`). `hermes/skills/` is
therefore a reviewed, committed snapshot of the Paperclip bundled skills.
Compose mounts it read-only at `/home/hermes/.hermes/skills`, where Hermes
discovers each `<skill-name>/SKILL.md`. Updating the snapshot through Git makes
skill changes reviewable and avoids stale content in the `hermes_state` volume.

## Model policy (free-only, mirrors openclaw-gateway)

`config.yaml` is the externally managed gateway model configuration,
mounted read-only (same pattern as `openclaw/openclaw.prod.json`). It pins
OpenCode Zen `space-bunny-free` as the primary model, with the exact
OpenRouter free routes from `openclaw/openclaw.prod.json` as ordered
fallbacks (`stealth/space-bunny-alpha`, `openrouter/free`,
`cohere/north-mini-code:free`). No paid models are configured.
`OPENCODE_ZEN_API_KEY` and `OPENROUTER_API_KEY` are read from the service
environment. The repository never contains provider secrets.

`API_SERVER_KEY` is the Hermes gateway key. Paperclip must store the same
value as `agentDefaultsPayload.apiKey` when the gateway joins (see
`HERMES_GATEWAY_ONBOARDING.md` in `paperclipai/paperclip`). It must differ from the claimed
Paperclip agent key. The repository never contains secret values.

Resources are conservative on purpose: the VPS runs ~4.2 GiB used of 5.9 GiB
with Paperclip (~1.9 GiB, unbounded) and OpenClaw (2G limit) as the heavy
tenants. Hermes is capped at 768M / 0.5 CPU with a 128M reservation.
