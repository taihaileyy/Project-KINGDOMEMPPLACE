#!/usr/bin/env bash
# Applies the Supabase stub, every migration, then every *.test.sql file.
# Uses $DATABASE_URL if set (CI); otherwise starts a throwaway local cluster.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -z "${DATABASE_URL:-}" ]; then
  PGBIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)"
  TMP="$(mktemp -d)"
  # Postgres refuses to run as root; use the postgres OS user when we are root.
  AS=()
  if [ "$(id -u)" = 0 ]; then chown postgres "$TMP"; AS=(runuser -u postgres --); fi
  trap '"${AS[@]}" "$PGBIN/pg_ctl" -D "$TMP/data" stop -m immediate >/dev/null 2>&1 || true; rm -rf "$TMP"' EXIT
  "${AS[@]}" "$PGBIN/initdb" -D "$TMP/data" -U postgres -A trust >/dev/null
  "${AS[@]}" "$PGBIN/pg_ctl" -D "$TMP/data" -o "-k $TMP -p 54329 -c listen_addresses=''" -l "$TMP/log" -w start >/dev/null
  DATABASE_URL="postgresql://postgres@/postgres?host=$TMP&port=54329"
fi

run() { psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -X -f "$1" >/dev/null; }

run supabase/tests/00_supabase_stub.sql
for f in supabase/migrations/*.sql; do echo "migrate  $f"; run "$f"; done
for f in supabase/tests/*.test.sql; do echo "test     $f"; run "$f"; done
echo "All database tests passed."
