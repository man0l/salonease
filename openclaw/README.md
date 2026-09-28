# OpenClaw gateway model policy

`openclaw.prod.json` is the externally managed Gateway configuration. It pins
Space Bunny Alpha via OpenRouter as the primary free model, with OpenRouter's
zero-cost router and Cohere North Mini Code free route as ordered fallbacks.
The same free route is pinned for the OpenCode ACP harness through
`opencode.json`; `OPENROUTER_API_KEY` is read from the service environment.

The service image also pins OpenCode v1.18.31 and the matching OpenClaw ACPX
plugin. OpenCode is exposed as the ACP harness and uses `OPENROUTER_API_KEY`
from the runtime environment. The repository never contains provider secrets.

On the deployment host, create `openclaw/.env` from `.env.example`, fill in the
gateway token and OpenRouter key, then deploy only through Git:

```sh
cd /root/salonease
git pull
docker compose -f docker-compose.prod.yml up -d --build openclaw-gateway
```

OpenCode reads `OPENROUTER_API_KEY` from the process environment. The repository
never contains its value.
