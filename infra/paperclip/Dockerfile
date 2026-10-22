# Thin layer over the pinned upstream image. Keep the FROM tag in step with
# the pin rationale in docker-compose.prod.yml.
FROM ghcr.io/paperclipai/paperclip:sha-c46e41e

# Agents run as `node` and cannot apt-get, so process tools must be in the
# image. Without procps, agent shells fail with `pgrep: command not found`
# (SLA-992). The base image stays root; docker-entrypoint.sh drops to node.
RUN apt-get update \
    && apt-get install -y --no-install-recommends procps \
    && rm -rf /var/lib/apt/lists/*
