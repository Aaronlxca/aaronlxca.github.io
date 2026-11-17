# Google Chrome Modern Web Guidance

Reviewed and installed on 17 November 2026 from Google's [Modern Web Guidance documentation](https://developer.chrome.com/docs/modern-web-guidance) and official [distribution repository](https://github.com/GoogleChrome/modern-web-guidance). This is the agent-guidance project, distinct from the optional [Material Design 3 component library](material-design-3.md).

## Installation and review

- Official distribution commit: `64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65`.
- CLI: `modern-web-guidance@1.0.1`, pinned as a development dependency; Node **22+** is required. Source repository: [GoogleChrome/modern-web-guidance-src](https://github.com/GoogleChrome/modern-web-guidance-src).
- Skill snapshot: `2026_11_10-47b4c80e`; the reviewed npm package contains **209 guides** and its local search data.
- npm integrity: `sha512-5ztUh5F1p2PewnSkA6EhsGUXqomaZY9qe6iWJCU4JbIQxHTky7s5lMJcPE4EbD1uhbQZIhl0HROH0+s6fIiGzg==`.
- Upstream `SKILL.md` SHA-256: `1292f0ce14794a5bc49af58e99d5f6d4edf10acd9472cade94ab0c5590892716`. The repository and published-package copies match.
- License: Apache 2.0. The installed skill retains its license; the npm package also includes `THIRD_PARTY_NOTICES` for bundled code.

Before executing the tool, the full skill, npm manifest, CLI command dispatch, local search/retrieval paths, telemetry controls and installer/update subprocesses were inspected. The package declares no npm dependencies or lifecycle scripts; its published JavaScript bundles include third-party code. This is a focused installation review, not a security audit of every bundled dependency.

The installer delegates to `npx skills`; the recommended CLI installation also supports automatic updates. Neither installer nor updater was run. Instead, the exact npm tarball was inspected and installed with:

```sh
npm install --save-dev --save-exact --ignore-scripts modern-web-guidance@1.0.1
```

The repository skill at [`.agents/skills/modern-web-guidance/SKILL.md`](../.agents/skills/modern-web-guidance/SKILL.md) is adapted from that reviewed upstream file. The adaptations replace upstream package-runner commands/references with the local wrapper, replace the package-runner section with repository instructions, and add the owner's scope/design precedence. No other upstream workflow or guide content is rewritten. Guides and executable bundles remain in the locked npm package rather than being duplicated into Git.

## Use from this repository

```sh
npm ci --ignore-scripts
npm run guidance -- --version
npm run guidance -- search "keyboard focus management"
npm run guidance -- retrieve "accessibility"
```

Search first with a focused, action-oriented English query. Read matching descriptions, then retrieve the relevant IDs. `list` is available for broad reviews. `legacy-scan` is available only for an explicitly requested modernization/legacy-pattern task; it is not a general compliance test and was not run for this installation.

[`scripts/modern-web-guidance.cjs`](../scripts/modern-web-guidance.cjs) resolves the installed CLI directly and forces `DISABLE_TELEMETRY=1`, `ENABLE_FILE_LOGGING=false` and `DO_NOT_TRACK=1` in the child process. Upstream telemetry is enabled by default and can start a detached watchdog; the inspected opt-out prevents its initialization. Use the wrapper rather than calling the raw CLI or `npx ...@latest`. The wrapper exposes search, list, retrieve, scan, help and version commands; it does not expose installation, updates or feature opt-in commands.

Search and retrieval use the package's bundled vectors and Markdown locally after installation. No account, API key, remote AI model or DevTools connection is needed. Guidance is a pinned snapshot, not a live compatibility check; verify current browser support from official sources before adopting newer APIs.

## Project boundaries

[DESIGN.md](../DESIGN.md) and the owner's brief remain authoritative. Use Impeccable for visual critique, Vercel's guidelines for interface review, Modern Web Guidance for web-platform implementation patterns, and ordinary Playwright for browser evidence. None of these tools authorizes changing copy, career facts, branding, typography, the desktop cascade or native mobile scrolling.

The default guidance policy is **Baseline Widely available**, with the guide's fallbacks for newer features. No custom browser target, volatile-feature opt-in, origin trial, hook, MCP server, DevTools integration, marketplace connection, automatic update or deployment is enabled. Existing production pages do not import this package. Automatic skill discovery depends on the Codex client; agents can always read the repository skill directly.

## Verification

- Locked install and CLI version checked with lifecycle scripts disabled.
- Local search for `keyboard focus management` returned `accessibility` as the first match.
- Retrieval of `accessibility` succeeded and returned the bundled guide, including keyboard/focus and skip-link sections. This verifies tool operation; it is not a fresh accessibility audit or an instruction to alter the site.
- Both commands also passed with network and subprocess entry points blocked inside the CLI. The wrapper overrode deliberately conflicting inherited telemetry/logging settings. The wrapper rejected `update` without running the upstream updater.
- Full ordinary Playwright suite: **12 passed, 6 intentionally skipped** duplicate desktop-only groups (3.9 minutes). Desktop/tablet/mobile homepage screenshots were inspected. Existing axe diagnostic rule/target sets match the committed A01–A04 baseline in all three viewports; passing assertions do not establish full WCAG conformance or physical-device compatibility.
- `git diff --check` and wrapper syntax checks passed. `index.html`, `resume.html`, `favicon.svg` and `DESIGN.md` remain identical to `main`. No production UI or test expectations were changed.
