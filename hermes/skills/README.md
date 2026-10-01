# Bundled Paperclip skills

This directory is a committed snapshot of Paperclip's bundled skills. The
gateway mounts it read-only at `/home/hermes/.hermes/skills`, where Hermes
discovers each `<skill-name>/SKILL.md`.

Paperclip's `hermes_gateway` adapter does not synchronize company skills yet
(`supported: false`, `mode: unsupported`), so these files must be materialized
inside the gateway runtime. Committing the snapshot keeps deployment through
`git pull` deterministic and lets code review govern skill changes.

Snapshot fingerprint:
`65c49c779e5ffa4489c81d1f9dfeca23d6d8365918356972d31e80c844f26f62`

The fingerprint is the SHA-256 of the sorted `sha256sum` manifest of every
regular file in this directory, excluding this README and the `skills/.hub`
symlink:

```sh
cd hermes/skills
find . -type f ! -name README.md -not -path './.hub*' -printf '%P\n' \
  | sort | xargs sha256sum | sha256sum | cut -d' ' -f1
```

To update, copy a reviewed Paperclip skill bundle into this directory, replace
this README, recompute the fingerprint, and include the change in review. Do
not edit skill content in place. Runtime skill state remains read-only.

## Bundled helper scripts

Both helpers are documented as `bash scripts/<name>.sh`, so they work even
though an installed snapshot may not keep the executable bit:

- `paperclip/scripts/paperclip-upload-artifact.sh` — attaches a workspace file
  to the current issue and creates the artifact work product.
- `paperclip/scripts/paperclip-issue-update.sh` — PATCHes an issue
  (status/comment) and exits 0 only when the server echoes the update.

`hermes/tests/paperclip-skill-helpers.test.sh` exercises both against a local
stub server and also fails if any `scripts/*.sh` path referenced by a skill
document is missing. Run it with `bash hermes/tests/paperclip-skill-helpers.test.sh`.
