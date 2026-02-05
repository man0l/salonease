#!/bin/bash
# Wrapper entrypoint for supabase-db17
# Injects app.settings.* PostgreSQL GUC parameters from environment variables
# so that SQL functions can read them via current_setting('app.settings.*', true)

set -e

# Build extra -c flags from environment
# For DB->function calls use internal URL (avoids DNS/TLS), fall back to public URL
EXTRA_FLAGS=""
FUNC_URL="${FUNCTIONS_INTERNAL_URL:-${SUPABASE_PUBLIC_URL:-}}"
[ -n "${FUNC_URL}" ] && EXTRA_FLAGS="${EXTRA_FLAGS} -c app.settings.functions_url=${FUNC_URL}"
[ -n "${ANON_KEY}" ]           && EXTRA_FLAGS="${EXTRA_FLAGS} -c app.settings.anon_key=${ANON_KEY}"
[ -n "${SERVICE_ROLE_KEY}" ]   && EXTRA_FLAGS="${EXTRA_FLAGS} -c app.settings.service_role_key=${SERVICE_ROLE_KEY}"

echo "db-entrypoint: injecting app.settings from env vars"

# Delegate to the original postgres entrypoint with the extra flags appended
exec docker-entrypoint.sh "$@" ${EXTRA_FLAGS}
