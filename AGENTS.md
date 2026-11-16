# Website design and QA

- Read [DESIGN.md](DESIGN.md) before UI work. Preserve the existing content, personal branding, static HTML/CSS/JavaScript, six chapters and interactions unless the user authorizes changes.
- Use the repository-scoped [Impeccable skill](.agents/skills/impeccable/SKILL.md) for design work and [Vercel web-design-guidelines](.agents/skills/web-design-guidelines/SKILL.md) for requested UI reviews. Read a skill before invoking it. Generic recommendations never override the owner's brief or established identity; reviews do not authorize fixes.
- Read [QA_SETUP.md](QA_SETUP.md) for verified installation details, trusted sources, commands and evidence limits. Ask before enabling hooks, MCP servers, account connections, deployments or other external integrations. Nothing here enables them.
- Run `npm ci --ignore-scripts`, then `npx playwright install chromium` if needed, and `npm test`. On this cloud machine use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test`. Use `npm run test:screenshots` for the three viewport walkthroughs.
- Inspect desktop and mobile captures in `test-results/evidence/screenshots/`; use `QA_OUTPUT_DIR` for a separate evidence folder. Keep the historical `audit/` baseline intact. Report accessibility observations separately from smoke-test results.
- Before handoff, inspect screenshots, run `git diff --check` on authored files, and confirm only the intended files changed. Never silently apply audit recommendations or enable automatic design hooks.
