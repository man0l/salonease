# Codex 0.159.2 MCP headers and native gateway ownership

Reviewable source patch for [SLA-393](https://bots.balkanbit.app/SLA/issues/SLA-393). `/app` is the deployed Paperclip source snapshot and has no Git metadata or writable upstream source checkout. This repository carries the patch and evidence; it does not modify the deployed application. Baseline SHA-256 values identify the three existing files.

## Findings and changes

- `buildManagedMcpBlock` emits `headers`. Codex 0.159.2 rejects this under `--strict-config`; its supported literal field is `http_headers`. Change that field only; keep existing token values, generation, expiry, HTTP endpoints, and file modes.
- The writer already replaces its complete managed block and clears stale entries. Tests now prove legacy `headers`, old tokens, and another agent's stale server disappear while provider settings remain.
- Native assignment gateways created by `buildPaperclipRuntimeMcpServers` store `metadata.agentId`, but omit the top-level `agentId`. `gatewayAppliesToRun` checks only the latter. Thus another agent's native gateway can pass the injection filter when its underlying connections are installed. The patch checks the legacy metadata owner for native assignments, fails closed if missing, records top-level `agentId` for new gateways, and restricts reuse to the current agent's scope. Legitimate company gateways and explicit project/issue scope checks remain.
- Agent-specific native entries should be excluded from other agents' homes. Do this from authoritative ownership metadata, not gateway names. Existing company-scoped database queries and run-scoped tokens remain intact. This patch does not solve concurrent processes writing the same configured home; the rollout owner must verify effective home isolation and avoid shared token-bearing configs for concurrent runs.

## Verification

- Patched source copied into a run-owned scratch checkout; `/app` left unmodified.
- Focused Vitest: **64 tests passed in 2 files**, including native owner rejection, explicit scope checks, config replacement, provider preservation, permissions, auth seeding, and staging.
- Patched Codex adapter TypeScript check (`tsc --noEmit`): passed.
- `git -C /app apply --check codex-mcp-headers-and-scope.patch`: passed.
- Installed Codex CLI: `codex-cli 0.159.2`. Generated its app-server JSON schemas to verify the status-list and tool-call protocol. Its installed strict config validator rejects `mcp_servers.schema_probe.headers` (exit 1); see `negative-schema-evidence.txt`.
- Actual patched writer generated an isolated scratch home with current-run Paperclip JWT. Fresh `codex app-server --strict-config --stdio` initialized Paperclip project MCP, listed tools, and used its read-only `list_project_repositories` through `mcpServer/tool/call`. See `readonly-evidence.json` for UTC time, parent heartbeat run, CLI thread ID, successful server initialization, response digest, and absence of ignored-header warnings. No model inference or credential change was needed.
- This is a **project MCP** success, not assigned-gateway acceptance. Probing the copied `paperclip-assigned` token reported `gateway_token_revoked`; probing runtime-tools with the task JWT reported invalid runtime token. These are different token authorities. No token was printed or reused as a new long-lived credential.
- Full application typecheck/build/test and integration tests against the complete patched heartbeat service were not run: the deployable source repository is unavailable. The patch remains pending source integration and deployment.

## Deployment owner and required acceptance

Atlas must obtain the deployment source checkout, apply this patch on a source branch, run native assignment/managed MCP integration checks, open its source PR, and deploy the reviewed build through the normal release workflow. Do not hot-edit `/app`, database records, subscription configuration, credentials, or company settings.

After deployment, run CEO (z.ai) with its saved CLI/ZAI configuration. Require a freshly minted run-scoped assigned gateway token, correct agent/company ownership, and an isolated effective home. Verify that the intended `paperclip-assigned` MCP initializes, lists and uses one assigned read-only tool, and produces no ignored `headers` warning. Link the run and its engineering work product. Then the parent acceptance can be completed. Project MCP success or a direct API curl is insufficient.

Apply in the source checkout:

```bash
git apply --check /path/to/codex-mcp-headers-and-scope.patch
git apply /path/to/codex-mcp-headers-and-scope.patch
pnpm exec vitest run packages/adapters/codex-local/src/server/codex-home.test.ts server/src/services/managed-mcp-gateway-scope.test.ts server/src/__tests__/heartbeat-runtime-mcp-servers.test.ts
```

## Official sources

- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference): `http_headers`, `env_http_headers`, and `bearer_token_env_var` are supported HTTP fields.
- [Codex MCP documentation](https://learn.chatgpt.com/docs/extend/mcp?surface=cli): static headers vs environment-sourced headers.

The fix uses literal `http_headers` because the existing writer supplies literal run-scoped bearer values. Changing to `env_http_headers` would require a separate per-process environment transport design; it would not be a field rename.
