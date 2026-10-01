# Bundled Paperclip skills

This directory is a committed snapshot of Paperclip's bundled skills. The
gateway mounts it read-only at `/home/hermes/.hermes/skills`, where Hermes
discovers each `<skill-name>/SKILL.md`.

Paperclip's `hermes_gateway` adapter does not synchronize company skills yet
(`supported: false`, `mode: unsupported`), so these files must be materialized
inside the gateway runtime. Committing the snapshot keeps deployment through
`git pull` deterministic and lets code review govern skill changes.

Snapshot fingerprint:
`9b51a024e323cf3072aa85a0034a25d7a0a72c91cdb912bd3cbd9238e7e1530f`

To update, copy a reviewed Paperclip skill bundle into this directory, replace
this README, recompute the fingerprint, and include the change in review. Do
not edit skill content in place. Runtime skill state remains read-only.
