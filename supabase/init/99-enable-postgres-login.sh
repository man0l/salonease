#!/usr/bin/env bash
# Supabase Postgres disables login for the postgres role by default.
# GoTrue, PostgREST, and our .env connection strings all use postgres.
set -euo pipefail

psql -v ON_ERROR_STOP=1 --username "supabase_admin" --dbname "postgres" <<-EOSQL
	ALTER ROLE postgres WITH LOGIN PASSWORD '${POSTGRES_PASSWORD}';
EOSQL