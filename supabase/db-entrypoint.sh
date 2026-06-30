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

ensure_postgres_login() {
  local pw="${POSTGRES_PASSWORD:-password}"
  local escaped_pw
  escaped_pw="$(printf '%s' "$pw" | sed "s/'/''/g")"

  for _ in $(seq 1 60); do
    if pg_isready -h localhost -U supabase_admin -q 2>/dev/null; then
      if psql -v ON_ERROR_STOP=0 -U supabase_admin -d postgres \
        -c "ALTER ROLE postgres WITH LOGIN PASSWORD '${escaped_pw}';" >/dev/null 2>&1; then
        echo "db-entrypoint: ensured postgres role can login"
      fi
      return 0
    fi
    sleep 1
  done

  echo "db-entrypoint: warning: timed out ensuring postgres role can login" >&2
  return 0
}

if [ "${1:-}" = "postgres" ]; then
  ensure_postgres_login &
fi

# Delegate to the original postgres entrypoint with the extra flags appended
exec docker-entrypoint.sh "$@" ${EXTRA_FLAGS}