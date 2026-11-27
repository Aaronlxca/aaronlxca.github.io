# Aaron | Professional portfolio

Single-page portfolio for investment analysis, strategic finance, sustainable finance, and business strategy.

## Publishing

GitHub Pages publishes this static site from `main` at the repository root. Open the [live testing version](https://aaronlxca.github.io/). The homepage and interactive résumé use local stylesheets, scripts, fonts and artwork, with no site build step.

The previous public version is preserved on [backup/pre-luminous-live-testing](https://github.com/Aaronlxca/aaronlxca.github.io/tree/backup/pre-luminous-live-testing) at commit `eea4297`. To roll back, revert the live-testing merge through a pull request and verify the ensuing Pages build. The backup branch also preserves the exact pre-deployment tree.

## Design documentation and homepage audit

[DESIGN.md](DESIGN.md) records the original visual identity. The Luminous Intelligence live-testing version retains the six chapters and the existing résumé content. [audit/REPORT.md](audit/REPORT.md) contains the responsive and accessibility audit, severity-ranked findings, test limits and screenshot links. Open [audit/gallery.html](audit/gallery.html) for the six-chapter screenshot gallery. No production HTML, CSS, content or interaction was changed by this audit.

Impeccable is installed as a project-local Codex skill. Its pinned source and installation details are in [.agents/skills/IMPECCABLE.md](.agents/skills/IMPECCABLE.md).

The repository also includes Vercel's reviewed `web-design-guidelines` skill. [AGENTS.md](AGENTS.md) points coding agents to the design guidance and tests; [QA_SETUP.md](QA_SETUP.md) records installation results, sources, commands and permission boundaries. Hooks and external integrations remain disabled.

[Material Design 3](docs/material-design-3.md) is installed as optional development tooling through the official `@material/web` package. Use `npm run preview:material` and open `http://127.0.0.1:4173/_dev/material3.html` for its separate local component preview; run `npm run test:material` for browser verification. The existing portfolio does not import the library.

[Google Chrome Modern Web Guidance](docs/modern-web-guidance.md) is installed as a repository agent skill plus a pinned local CLI. Use `npm run guidance -- search "keyboard focus management"` and retrieve a matching guide with `npm run guidance -- retrieve "<id>"`. The wrapper disables telemetry; no hooks, automatic updates or DevTools integration are enabled.

[A01–A04 correction review](docs/qa/a01-a04/REPORT.md) records the follow-up focus, contrast and footer fixes, expanded regression tests, and updated screenshots compared with the original audit.

## Browser testing

The optional Node dependencies support development tests only; GitHub Pages serves the static files without a build step.

```sh
npm ci --ignore-scripts
npx playwright install chromium
npm test
```

With an existing Chromium installation (as in the audited cloud environment):

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test
```

Playwright starts a Python 3 static server on localhost port 4173. Set `AUDIT_BASE_URL` to test another deployment without starting the server. The three projects capture desktop 1440×900, touch tablet 768×1024 and touch mobile 390×844. Extra desktop-project probes inspect narrow breakpoints, keyboard behavior, reduced motion, a 200% zoom-equivalent viewport and emulated touch input.

`npm run test:report` opens the transient Playwright HTML report. Tests save fresh screenshots and JSON evidence to the ignored `test-results/evidence/` folder; set `QA_OUTPUT_DIR` to choose another destination. Historical `audit/` captures remain intact. `npm run test:desktop`, `npm run test:mobile` and `npm run test:screenshots` provide focused runs. The suite saves axe findings and fails on detected violations. Chapter-label contrast is measured against the rendered background. Inspect screenshots before promoting evidence into versioned documentation. The suite uses Chromium, not physical devices or Safari; Playwright MCP is not exposed in this cloud session and is not required.
