# The upstream image is pinned so runtime behavior cannot drift between builds.
FROM openclaw/openclaw:2026.9.6

USER root

# OpenCode is installed at a pinned version and exposed through the normal PATH.
# OpenRouter is supplied by the gateway's runtime environment; OpenCode uses that
# environment variable directly, so no provider credentials are baked in.
RUN npm install --ignore-scripts --prefix /opt/opencode --no-audit --no-fund opencode-ai@1.18.31 opencode-linux-x64-baseline@1.18.31 \
    && node /opt/opencode/node_modules/opencode-ai/postinstall.mjs \
    && ln -s /opt/opencode/node_modules/.bin/opencode /usr/local/bin/opencode \
    && npm install --ignore-scripts --prefix /opt/openclaw-acpx --omit=peer --no-audit --no-fund @openclaw/acpx@2026.9.6 \
    && cd /opt/openclaw-acpx \
    && npm install-scripts approve esbuild@0.28.2 \
    && npm rebuild esbuild \
    && mkdir -p /opt/openclaw-acpx/node_modules/@openclaw/acpx/node_modules \
    && ln -s /app /opt/openclaw-acpx/node_modules/@openclaw/acpx/node_modules/openclaw \
    && cd / \
    && npm cache clean --force \
    && chown -R node:node /opt/opencode /opt/openclaw-acpx

USER node
