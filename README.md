# Aaron | Professional portfolio

Single-page portfolio for investment analysis, strategic finance, sustainable finance, and business strategy.

## Publishing

For the clean GitHub Pages URL `https://aaronlxca.github.io/`, rename this repository to `Aaronlxca.github.io` in **Settings → General → Repository name**.

Then open **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save.

The `index.html` is self-contained with no external dependencies. The first version is a professional introduction; verified and non-confidential case studies can be added later.

## Design documentation and homepage audit

[DESIGN.md](DESIGN.md) records the current visual identity. [audit/REPORT.md](audit/REPORT.md) contains the responsive and accessibility audit, severity-ranked findings, test limits and screenshot links. Open [audit/gallery.html](audit/gallery.html) for the six-chapter screenshot gallery. No production HTML, CSS, content or interaction was changed by this audit.

Impeccable is installed as a project-local Codex skill. Its pinned source and installation details are in [.agents/skills/IMPECCABLE.md](.agents/skills/IMPECCABLE.md).

The repository also includes Vercel's reviewed `web-design-guidelines` skill. [AGENTS.md](AGENTS.md) points coding agents to the design guidance and tests; [QA_SETUP.md](QA_SETUP.md) records installation results, sources, commands and permission boundaries. Hooks and external integrations remain disabled.

[A01–A04 correction review](docs/qa/a01-a04/REPORT.md) records the follow-up focus, contrast and footer fixes, expanded regression tests, and updated screenshots compared with the original audit.

## Browser testing

The optional Node dependencies support development tests only; GitHub Pages still serves the original static files without a build step.

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

`npm run test:report` opens the transient Playwright HTML report. Tests save fresh screenshots and JSON evidence to the ignored `test-results/evidence/` folder; set `QA_OUTPUT_DIR` to choose another destination. Historical `audit/` captures remain intact. `npm run test:desktop`, `npm run test:mobile` and `npm run test:screenshots` provide focused runs. Accessibility violations are recorded as audit observations rather than failing the existing-behavior smoke tests; passing tests do not imply WCAG compliance. Inspect screenshots before promoting evidence into versioned documentation. The suite uses Chromium, not physical devices or Safari; Playwright MCP is not exposed in this cloud session and is not required.
