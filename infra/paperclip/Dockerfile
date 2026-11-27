# Paperclip + pg_dump (SLA-1732).
#
# The upstream image ships no PostgreSQL client, so runDatabaseBackup falls
# back to the JavaScript dump, which never reaches gzip + pruneOldBackups.
# This layer adds only postgresql-client-17 (Debian trixie's major, matching
# the paperclip-db postgres:17 server). Bump BASE_TAG together with the
# compose pin; nothing else is changed.
ARG BASE_TAG=2026.1106.0
FROM ghcr.io/paperclipai/paperclip:${BASE_TAG}
USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends postgresql-client-17 \
  && rm -rf /var/lib/apt/lists/* \
  && pg_dump --version
# Upstream entrypoint (gosu/tini) drops privileges; keep its default user.
