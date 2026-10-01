#!/usr/bin/env bash
#
# Test-double coverage for the Paperclip skill helper scripts bundled under
# hermes/skills. Every check runs against a local throwaway stub server
# (paperclip_api_stub.py) with a fake API key, so no real Paperclip API, no
# real credentials, and no network egress are involved.
#
# Usage: bash hermes/tests/paperclip-skill-helpers.test.sh

set -uo pipefail

tests_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
skills_dir="$(cd "$tests_dir/../skills" && pwd)"
stub="$tests_dir/paperclip_api_stub.py"
update_helper="$skills_dir/paperclip/scripts/paperclip-issue-update.sh"
upload_helper="$skills_dir/paperclip/scripts/paperclip-upload-artifact.sh"

# Fake credential. Used only to prove the helpers forward it in a header and
# never echo it into stdout/stderr.
fake_key="test-key-must-not-be-logged"
fake_run_id="test-run-id-1234"

tests_run=0
tests_failed=0
work_dir=""
stub_pid=""
stub_url=""
request_log=""

pass() {
  tests_run=$((tests_run + 1))
  printf 'ok %d - %s\n' "$tests_run" "$1"
}

fail() {
  tests_run=$((tests_run + 1))
  tests_failed=$((tests_failed + 1))
  printf 'not ok %d - %s\n' "$tests_run" "$1"
  if [[ -n "${2:-}" ]]; then
    printf '  # %s\n' "$2"
  fi
}

check() {
  # check <description> <condition-exit-code> [detail]
  if [[ "$2" -eq 0 ]]; then
    pass "$1"
  else
    fail "$1" "${3:-}"
  fi
}

cleanup() {
  if [[ -n "$stub_pid" ]]; then
    kill "$stub_pid" >/dev/null 2>&1 || true
    wait "$stub_pid" 2>/dev/null || true
  fi
  [[ -n "$work_dir" ]] && rm -rf "$work_dir"
}
trap cleanup EXIT

start_stub() {
  # start_stub <behaviour> -> exports stub_url
  local behaviour="$1"
  local port_file="$work_dir/port"
  local log_file="$work_dir/requests.json"
  # Each stub run binds a fresh ephemeral port, so clear the previous markers
  # before waiting for the new one to appear.
  rm -f "$port_file"
  printf '[]' >"$log_file"
  python3 "$stub" "$port_file" "$log_file" "$behaviour" >/dev/null 2>&1 &
  stub_pid=$!

  local port=""
  for _ in $(seq 1 100); do
    if [[ -s "$port_file" ]]; then
      port="$(cat "$port_file")"
      break
    fi
    sleep 0.05
  done
  if [[ -z "$port" ]]; then
    printf 'Bail out! stub server did not start\n' >&2
    exit 1
  fi
  stub_url="http://127.0.0.1:$port"
  request_log="$log_file"
}

stop_stub() {
  if [[ -n "$stub_pid" ]]; then
    kill "$stub_pid" >/dev/null 2>&1 || true
    wait "$stub_pid" 2>/dev/null || true
    stub_pid=""
  fi
}

run_update_helper() {
  # run_update_helper [args...] with stdin from $work_dir/stdin
  env -u PAPERCLIP_TASK_ID \
    PAPERCLIP_API_URL="$stub_url" \
    PAPERCLIP_API_KEY="$fake_key" \
    PAPERCLIP_RUN_ID="$fake_run_id" \
    bash "$update_helper" "$@" <"${stdin_file:-$work_dir/stdin}"
}

work_dir="$(mktemp -d)"
: >"$work_dir/stdin"

# ---------------------------------------------------------------------------
# 1. Every scripts/*.sh path referenced by the Paperclip skill docs exists.
# ---------------------------------------------------------------------------
missing_refs=""
while IFS= read -r doc; do
  # A reference resolves either against the referencing file's own directory
  # (the snapshot README) or against the skill root, the directory holding
  # SKILL.md (every skill document).
  doc_dir="$(dirname "$doc")"
  skill_root="$doc_dir"
  while [[ "$skill_root" != "$skills_dir" && ! -f "$skill_root/SKILL.md" ]]; do
    skill_root="$(dirname "$skill_root")"
  done
  while IFS= read -r ref; do
    [[ -z "$ref" ]] && continue
    # An optional leading skill directory (as the snapshot README writes
    # `paperclip/scripts/x.sh`) makes the path relative to the snapshot root;
    # a bare `scripts/x.sh` is relative to the skill root.
    if [[ -f "$skills_dir/$ref" || -f "$doc_dir/$ref" || -f "$skill_root/$ref" ]]; then
      continue
    fi
    missing_refs="$missing_refs ${doc#"$skills_dir"/}:$ref"
  done < <(grep -hoE '([A-Za-z0-9_.-]+/)?scripts/[A-Za-z0-9_./-]+\.sh' "$doc" | sort -u)
done < <(find "$skills_dir" -name '*.md' -type f | sort)
check "every scripts/*.sh reference in Paperclip skill docs resolves" \
  "$([[ -z "$missing_refs" ]] && echo 0 || echo 1)" \
  "missing:${missing_refs:- none}"

# ---------------------------------------------------------------------------
# 1b. The documented snapshot fingerprint still matches the tree.
# ---------------------------------------------------------------------------
computed_fingerprint="$(
  cd "$skills_dir" &&
    find . -type f ! -name README.md -not -path './.hub*' -printf '%P\n' |
      sort | xargs sha256sum | sha256sum | cut -d' ' -f1
)"
documented_fingerprint="$(
  # Intentionally a literal single-quoted sed script: no expansion wanted.
  # shellcheck disable=SC2016
  sed -n 's/^`\([0-9a-f]\{64\}\)`$/\1/p' "$skills_dir/README.md" | head -1
)"
check "documented snapshot fingerprint matches the bundled files" \
  "$([[ -n "$documented_fingerprint" && "$computed_fingerprint" == "$documented_fingerprint" ]] && echo 0 || echo 1)" \
  "documented=${documented_fingerprint:-<none>} computed=$computed_fingerprint"

# ---------------------------------------------------------------------------
# 2. Argument validation: every failure path exits nonzero with a message and
#    never prints the API key.
# ---------------------------------------------------------------------------
stderr_file="$work_dir/stderr"
stdout_file="$work_dir/stdout"

run_env_missing() {
  env -u PAPERCLIP_TASK_ID -u PAPERCLIP_API_KEY -u PAPERCLIP_RUN_ID -u PAPERCLIP_API_URL \
    bash "$update_helper" --issue-id issue-1 --status 'done' \
    >"$stdout_file" 2>"$stderr_file" </dev/null
}

run_env_missing
code=$?
check "update helper exits nonzero when Paperclip env is missing" \
  "$([[ $code -ne 0 ]] && echo 0 || echo 1)" "exit=$code"
check "update helper explains the missing environment" \
  "$(grep -q 'Missing PAPERCLIP_API_URL' "$stderr_file" && echo 0 || echo 1)" \
  "$(head -1 "$stderr_file")"

env -u PAPERCLIP_TASK_ID \
  PAPERCLIP_API_URL="$stub_url" PAPERCLIP_API_KEY="$fake_key" PAPERCLIP_RUN_ID="$fake_run_id" \
  bash "$update_helper" </dev/null >"$stdout_file" 2>"$stderr_file"
code=$?
check "update helper exits nonzero without an issue id" \
  "$([[ $code -ne 0 ]] && echo 0 || echo 1)" "exit=$code"
check "update helper explains the missing issue id" \
  "$(grep -q 'Missing issue id' "$stderr_file" && echo 0 || echo 1)" \
  "$(head -1 "$stderr_file")"

env -u PAPERCLIP_TASK_ID \
  PAPERCLIP_API_URL="$stub_url" PAPERCLIP_API_KEY="$fake_key" PAPERCLIP_RUN_ID="$fake_run_id" \
  bash "$update_helper" --issue-id issue-1 --bogus-flag </dev/null >"$stdout_file" 2>"$stderr_file"
code=$?
check "update helper exits nonzero on an unknown argument" \
  "$([[ $code -ne 0 ]] && echo 0 || echo 1)" "exit=$code"
check "update helper names the unknown argument" \
  "$(grep -q 'Unknown argument: --bogus-flag' "$stderr_file" && echo 0 || echo 1)" \
  "$(head -1 "$stderr_file")"

: >"$work_dir/stdin"
run_update_helper --issue-id issue-1 >"$stdout_file" 2>"$stderr_file"
code=$?
check "update helper exits nonzero when there is nothing to update" \
  "$([[ $code -ne 0 ]] && echo 0 || echo 1)" "exit=$code"
check "update helper explains the empty update" \
  "$(grep -q 'Nothing to update' "$stderr_file" && echo 0 || echo 1)" \
  "$(head -1 "$stderr_file")"

check "update helper never prints the API key on a validation failure" \
  "$(grep -qF "$fake_key" "$stdout_file" "$stderr_file" && echo 1 || echo 0)" \
  "fake key leaked into output"

# ---------------------------------------------------------------------------
# 3. --dry-run builds the JSON payload from a heredoc without calling the API.
# ---------------------------------------------------------------------------
start_stub ok
printf '## Heading\n\n- one\n- two\n' >"$work_dir/stdin"
run_update_helper --issue-id issue-1 --status 'done' --dry-run >"$stdout_file" 2>"$stderr_file"
code=$?
check "update helper --dry-run exits zero" \
  "$([[ $code -eq 0 ]] && echo 0 || echo 1)" "exit=$code"
check "update helper --dry-run makes no API request" \
  "$([[ "$(jq 'length' "$request_log")" == "0" ]] && echo 0 || echo 1)" \
  "requests=$(jq 'length' "$request_log")"
check "update helper --dry-run preserves markdown newlines" \
  "$(jq -e '.comment | contains("\n- one\n- two")' "$stdout_file" >/dev/null && echo 0 || echo 1)" \
  "$(cat "$stdout_file")"
stop_stub

# ---------------------------------------------------------------------------
# 4. Happy path against the stub: PATCH, run-id header, verified echoed status.
# ---------------------------------------------------------------------------
start_stub ok
run_update_helper --issue-id issue-1 --status 'done' \
  >"$stdout_file" 2>"$stderr_file"
code=$?
check "update helper exits zero on a confirmed write" \
  "$([[ $code -eq 0 ]] && echo 0 || echo 1)" \
  "exit=$code stderr=$(head -2 "$stderr_file")"
check "update helper PATCHes /api/issues/<id>" \
  "$(jq -e '.[0].method == "PATCH" and .[0].path == "/api/issues/issue-1"' "$request_log" >/dev/null && echo 0 || echo 1)" \
  "$(jq -c '.[0] | {method, path}' "$request_log")"
check "update helper sends X-Paperclip-Run-Id" \
  "$(jq -e --arg run "$fake_run_id" '.[0].run_id == $run' "$request_log" >/dev/null && echo 0 || echo 1)" \
  "$(jq -c '.[0].run_id' "$request_log")"
check "update helper sends the bearer token in a header" \
  "$(jq -e --arg key "Bearer $fake_key" '.[0].authorization == $key' "$request_log" >/dev/null && echo 0 || echo 1)" \
  "authorization header mismatch"
check "update helper sends JSON content type" \
  "$(jq -e '.[0].content_type == "application/json"' "$request_log" >/dev/null && echo 0 || echo 1)" \
  "$(jq -c '.[0].content_type' "$request_log")"
check "update helper sends the requested status" \
  "$(jq -e '.[0].body | fromjson | .status == "done"' "$request_log" >/dev/null && echo 0 || echo 1)" \
  "$(jq -c '.[0].body' "$request_log")"
check "update helper prints the returned issue JSON" \
  "$(jq -e '.id == "issue-1" and .status == "done"' "$stdout_file" >/dev/null && echo 0 || echo 1)" \
  "$(head -1 "$stdout_file")"
check "update helper does not print the API key on success" \
  "$(grep -qF "$fake_key" "$stdout_file" "$stderr_file" && echo 1 || echo 0)" \
  "fake key leaked into output"
stop_stub

# ---------------------------------------------------------------------------
# 5. A 2xx that does not echo the requested status is a failed write.
# ---------------------------------------------------------------------------
start_stub status-mismatch
run_update_helper --issue-id issue-1 --status 'done' \
  >"$stdout_file" 2>"$stderr_file"
code=$?
check "update helper fails when the echoed status differs" \
  "$([[ $code -ne 0 ]] && echo 0 || echo 1)" "exit=$code"
check "update helper explains the status mismatch" \
  "$(grep -q 'echoed status in_progress instead of requested done' "$stderr_file" && echo 0 || echo 1)" \
  "$(head -1 "$stderr_file")"
stop_stub

# ---------------------------------------------------------------------------
# 6. A 2xx with an empty body is a failed write, not a success.
# ---------------------------------------------------------------------------
start_stub empty-body
run_update_helper --issue-id issue-1 --status 'done' \
  >"$stdout_file" 2>"$stderr_file"
code=$?
check "update helper fails on a 2xx with an empty body" \
  "$([[ $code -ne 0 ]] && echo 0 || echo 1)" "exit=$code"
check "update helper explains the empty body" \
  "$(grep -q 'empty response body' "$stderr_file" && echo 0 || echo 1)" \
  "$(head -1 "$stderr_file")"
stop_stub

# ---------------------------------------------------------------------------
# 7. A definitive 4xx is rejected once, with no retry.
# ---------------------------------------------------------------------------
start_stub client-error
run_update_helper --issue-id issue-1 --status 'done' \
  >"$stdout_file" 2>"$stderr_file"
code=$?
check "update helper fails on a 4xx rejection" \
  "$([[ $code -ne 0 ]] && echo 0 || echo 1)" "exit=$code"
check "update helper does not retry a 4xx" \
  "$([[ "$(jq 'length' "$request_log")" == "1" ]] && echo 0 || echo 1)" \
  "requests=$(jq 'length' "$request_log")"
stop_stub

# ---------------------------------------------------------------------------
# 8. A 5xx is retried once and then reported as failed (bounded write retry).
# ---------------------------------------------------------------------------
start_stub server-error
run_update_helper --issue-id issue-1 --status 'done' \
  >"$stdout_file" 2>"$stderr_file"
code=$?
check "update helper fails after 5xx retries" \
  "$([[ $code -ne 0 ]] && echo 0 || echo 1)" "exit=$code"
check "update helper stops at two attempts" \
  "$([[ "$(jq 'length' "$request_log")" == "2" ]] && echo 0 || echo 1)" \
  "requests=$(jq 'length' "$request_log")"
check "update helper says the write was not saved" \
  "$(grep -q 'was NOT saved' "$stderr_file" && echo 0 || echo 1)" \
  "$(head -1 "$stderr_file")"
stop_stub

# ---------------------------------------------------------------------------
# 9. A dropped connection is retried once, then reported as not saved.
# ---------------------------------------------------------------------------
start_stub drop-connection
run_update_helper --issue-id issue-1 --status 'done' \
  >"$stdout_file" 2>"$stderr_file"
code=$?
check "update helper fails after a dropped connection" \
  "$([[ $code -ne 0 ]] && echo 0 || echo 1)" "exit=$code"
check "update helper retries a connection-level failure once" \
  "$([[ "$(jq 'length' "$request_log")" == "2" ]] && echo 0 || echo 1)" \
  "requests=$(jq 'length' "$request_log")"
check "update helper says the write was not saved" \
  "$(grep -q 'was NOT saved' "$stderr_file" && echo 0 || echo 1)" \
  "$(head -1 "$stderr_file")"
stop_stub

# ---------------------------------------------------------------------------
# 10. The upload helper keeps its interface: arg validation and dry-run.
# ---------------------------------------------------------------------------
env -u PAPERCLIP_API_KEY -u PAPERCLIP_RUN_ID -u PAPERCLIP_API_URL -u PAPERCLIP_TASK_ID \
  bash "$upload_helper" </dev/null >"$stdout_file" 2>"$stderr_file"
code=$?
check "upload helper exits nonzero without a file argument" \
  "$([[ $code -ne 0 ]] && echo 0 || echo 1)" "exit=$code"
check "upload helper never prints the API key" \
  "$(grep -qF "$fake_key" "$stdout_file" "$stderr_file" && echo 1 || echo 0)" \
  "fake key leaked into output"

printf 'payload\n' >"$work_dir/report.md"
env -u PAPERCLIP_API_KEY -u PAPERCLIP_RUN_ID -u PAPERCLIP_API_URL \
  PAPERCLIP_TASK_ID=issue-1 PAPERCLIP_COMPANY_ID=company-1 \
  bash "$upload_helper" "$work_dir/report.md" --dry-run >"$stdout_file" 2>"$stderr_file"
code=$?
check "upload helper --dry-run still exits zero (interface preserved)" \
  "$([[ $code -eq 0 ]] && echo 0 || echo 1)" \
  "exit=$code stderr=$(head -2 "$stderr_file")"
check "upload helper --dry-run reports the resolved file" \
  "$(jq -e --arg path "$work_dir/report.md" '.file == $path' "$stdout_file" >/dev/null && echo 0 || echo 1)" \
  "$(head -1 "$stdout_file")"

# ---------------------------------------------------------------------------
# 11. bash -n on every bundled helper.
# ---------------------------------------------------------------------------
for helper in "$update_helper" "$upload_helper"; do
  bash -n "$helper" 2>"$stderr_file"
  check "bash -n $(basename "$helper")" "$?" "$(head -1 "$stderr_file")"
done

printf '1..%d\n' "$tests_run"
if [[ "$tests_failed" -gt 0 ]]; then
  printf '# %d of %d checks failed\n' "$tests_failed" "$tests_run" >&2
  exit 1
fi
printf '# all %d checks passed\n' "$tests_run"
