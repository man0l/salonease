# Hermes gateway (internal, Paperclip `hermes_gateway` adapter)

Internal-only service on `app-network`, reachable by Paperclip at
`http://hermes-gateway:8642`. No Traefik route on purpose — Paperclip calls it
over Docker DNS, same as `openclaw-gateway`.

On the deployment host, create `hermes/.env` from `.env.example`, fill in the
gateway key and provider key, then deploy only through Git:

```sh
cd /root/salonease
git pull
docker compose -f docker-compose.prod.yml up -d --build hermes-gateway
```

`API_SERVER_KEY` is the Hermes gateway key. Paperclip must store the same
value as `agentDefaultsPayload.apiKey` when the gateway joins (see
`HERMES_GATEWAY_ONBOARDING.md` in `paperclipai/paperclip`). It must differ from the claimed
Paperclip agent key. The repository never contains secret values.

Resources are conservative on purpose: the VPS runs ~4.2 GiB used of 5.9 GiB
with Paperclip (~1.9 GiB, unbounded) and OpenClaw (2G limit) as the heavy
tenants. Hermes is capped at 768M / 0.5 CPU with a 128M reservation.
