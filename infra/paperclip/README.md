# Paperclip Codex sandbox in Docker

CTO v2 uses the Codex workspace sandbox with `dangerouslyBypassApprovalsAndSandbox=false`. Docker's default seccomp profile rejects the required user namespaces; Docker's default AppArmor profile also rejects the sandbox's mounts. These profiles let the nested sandbox start while retaining the other Docker restrictions and default capabilities. No `CAP_SYS_ADMIN`, privileged container, host namespaces, or global user-namespace setting is added.

`codex-seccomp.json` derives from Moby's default profile and adds one allow rule for `clone`, `unshare`, `setns`, `mount`, `umount2`, and `pivot_root`. Mount operations require a capability in the caller's namespace; the Paperclip container has no host `CAP_SYS_ADMIN`.

`paperclip-codex.apparmor` derives from Moby v27.3.1's Docker profile. It retains the proc/sys, firmware, powercap and kernel-security denials, plus peer signal/ptrace rules, while allowing mount/pivot-root for the namespace sandbox.

Sources:
- https://raw.githubusercontent.com/moby/profiles/main/seccomp/default.json (retrieved 2026-10-03; derived snapshot committed here)
- https://raw.githubusercontent.com/moby/moby/v27.3.1/profiles/apparmor/template.go
- https://learn.chatgpt.com/docs/sandboxing

Before recreating only Paperclip:

```bash
sudo install -m 0644 infra/paperclip/paperclip-codex.apparmor /etc/apparmor.d/paperclip-codex
sudo apparmor_parser -r /etc/apparmor.d/paperclip-codex
# Check configuration without printing resolved environment values.
docker compose -f docker-compose.prod.yml config --quiet
docker compose -f docker-compose.prod.yml up -d --no-deps --pull never paperclip
```

Drain active agent runs first: recreating this service stops its in-container processes. The host's AppArmor service loads the installed profile again on reboot. Keep the profile loaded before any future recreation of the Paperclip container.

Validation on the existing Paperclip image, as uid 1000 in a disposable container with no network: a Codex sandbox command passed; a workspace write passed; a sibling-directory write was rejected. Recheck the same boundaries after production recreation. No model inference is needed for these checks.

Rollback: remove the two Paperclip `security_opt` entries and recreate only Paperclip. The former container policy cannot run the nested sandbox, so pause sandbox-dependent agents rather than repeatedly waking them. Profile files can stay installed without affecting services that do not select them.
