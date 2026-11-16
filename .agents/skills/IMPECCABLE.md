# Impeccable installation

Installed using the upstream documented manual-copy method for Codex: `.agents/skills/impeccable/`.

- Source: https://github.com/pbakaus/impeccable
- Source commit: `d41d9860b0094dcb68030657da63461212835aaa`
- Skill version: `4.9.2`
- License: Apache 2.0; copied alongside the skill.
- Reviewed: `SKILL.md`, `reference/document.md`, `reference/audit.md` and the launcher before execution.
- Verified: the context command ran successfully on this Linux cloud environment. The launcher downloaded its pinned engine and verified the upstream checksum. The cache is `/workspace/.impeccable-cache`, outside this repository.
- Manual installation does not activate provider hooks. No hook, autonomous UI edits, live-mode injection or framework migration was configured. Reload a compatible Codex client to discover `$impeccable` in future sessions.

Reproduce in this environment:

```sh
IMPECCABLE_HOME=/workspace/.impeccable-cache DO_NOT_TRACK=1 .agents/skills/impeccable/scripts/impeccable context --target index.html
IMPECCABLE_HOME=/workspace/.impeccable-cache DO_NOT_TRACK=1 .agents/skills/impeccable/scripts/impeccable detect index.html --json
```

On another computer, omit `IMPECCABLE_HOME` to use the default per-user cache. The first launch needs network access to download the pinned engine. A detector exit code of 2 means findings, not an execution failure. Treat style-pattern advisories as review prompts; the existing brand and the owner's instructions take precedence.
