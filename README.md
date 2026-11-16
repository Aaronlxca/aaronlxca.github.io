# Aaron | Professional portfolio

Single-page portfolio for investment analysis, strategic finance, sustainable finance, and business strategy.

## Publishing

For the clean GitHub Pages URL `https://aaronlxca.github.io/`, rename this repository to `Aaronlxca.github.io` in **Settings → General → Repository name**.

Then open **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save.

The `index.html` is self-contained with no external dependencies. The first version is a professional introduction; verified and non-confidential case studies can be added later.

## Design documentation and homepage audit

[DESIGN.md](DESIGN.md) records the current visual identity. [audit/REPORT.md](audit/REPORT.md) contains the responsive and accessibility audit, severity-ranked findings, test limits and screenshot links. Open [audit/gallery.html](audit/gallery.html) for the six-chapter screenshot gallery. No production HTML, CSS, content or interaction was changed by this audit.

Impeccable is installed as a project-local Codex skill. Its pinned source and installation details are in [.agents/skills/IMPECCABLE.md](.agents/skills/IMPECCABLE.md).

## Browser testing

The optional Node dependencies support development tests only; GitHub Pages still serves the original static files without a build step.

```sh
npm ci
npx playwright install chromium
npm test
```

With an existing Chromium installation (as in the audited cloud environment):

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test
```

Playwright starts a Python 3 static server on localhost port 4173. Set `AUDIT_BASE_URL` to test another deployment without starting the server. The three projects capture desktop 1440×900, touch tablet 768×1024 and touch mobile 390×844. Extra desktop-project probes inspect narrow breakpoints, keyboard behavior, reduced motion, a 200% zoom-equivalent viewport and emulated touch input.

`npm run test:report` opens the transient Playwright HTML report. Tests refresh `audit/screenshots/` and JSON evidence. Accessibility violations are recorded as audit observations rather than failing the existing-behavior smoke tests; passing tests do not imply WCAG compliance. Review changes to evidence before committing them. The suite uses Chromium, not physical devices or Safari.
