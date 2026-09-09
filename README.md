# Expense Tracker workshop starter

A corrected React/Vite baseline with synthetic data. Monthly budgets are **not implemented**: participants add that feature during the workshop.

**Organizer preparation, not yet cleared for distribution.** Application/browser checks pass on Windows. Matt-skill integration, hook exercises, and the full classroom rehearsal are still pending.

## Local setup

Run these commands from this `starter` directory. The verified environment is Node **22.23.0**, npm **11.0.0**, and Playwright Test **1.63.0**. `.node-version` records the tested Node version; `package-lock.json` pins dependencies. macOS/Linux have not been rehearsed.

```bash
node --version
npm --version
npm ci
npx playwright install chromium
npm run test:baseline
npm run lint
npm run build
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open **http://127.0.0.1:5173/**. Stop your foreground server with Ctrl+C. The tests own a separate server on port **5174** and fail rather than reuse an unknown process there. Do not stop unrelated processes or silently switch ports.

`npm test` runs all tests in `tests/`; `npm run test:baseline` runs only the existing-behavior checks. The baseline has seven behavioral tests and no completed budget test. Trace/screenshots from failures go to ignored `test-results/`.

## Baseline behavior

- Add an income or expense with a nonblank description and a positive amount, up to USD 1000000.00 and at most two decimal places.
- Amounts are stored as numeric dollars. Totals sum rounded integer cents, then format two decimal places; form values are converted at submission.
- Dates use UTC, matching the original submission convention. Fixtures use the current and previous UTC months, including January/December rollover. Stored tests fix the browser clock before navigation.
- Type/category filters combine and affect table rows, not account totals. An empty result is explicit.
- Everything is in memory. Reload restores synthetic fixtures; changes are not saved.

| Starting check | Expected value |
| --- | ---: |
| Transactions | 8 |
| Income | 5800.00 |
| Expenses, all months | 1545.00 |
| Balance | 4255.00 |
| Current-month expenses | 250.00 |
| Previous-month expenses | 1295.00 |

The last two are fixture facts for the upcoming exercise, not an existing monthly-summary feature.

## Browser integration

Review `.mcp.json`, `.claude/settings.json`, and `scripts/playwright-mcp.mjs` before enabling project tools. The configured Playwright MCP **0.0.80** server uses local stdio and an isolated browser profile. Its launcher reuses the Chromium binary installed for the test runner; it does not depend on a personal Chrome installation or the MCP package's separately versioned browser download.

The MCP transport, navigation, entry, filters, console, and network requests were exercised through an MCP client. Claude Code's permission/discovery behavior still needs a separate runtime rehearsal. In particular, the project deny rule for `browser_run_code_unsafe` is configured but its enforcement has not yet been exercised in Claude Code.

Start Claude Code from the `starter` directory so relative paths resolve correctly. Keep normal approval prompts; do not blanket-allow the server or enable unsafe host-code execution. The local-origin list is a convenience restriction, **not a security sandbox**. Use only synthetic data, never personal logged-in tabs or credentials.

Your manually opened tab, the MCP browser, and the stored tests have independent in-memory app state. Re-establish each case's initial state in the browser actually being checked.

## Troubleshooting

- **Missing browser executable:** run `npx playwright install chromium` from this folder; check the approved network/proxy setup if the download fails. Do not disable certificate validation.
- **MCP cannot find its script:** start Claude Code from this folder; run `npm ci` here. The CLI entry point is `node scripts/playwright-mcp.mjs --help`.
- **Port already in use:** identify the process and stop only your own old preview; use the documented ports consistently.
- **Wrong totals or unexpected rows:** reload to reset synthetic changes, then compare all six starting checks above.
- **Review has no baseline ref:** an approved starter checkpoint must exist before the workshop. If `git rev-parse --verify HEAD` fails, stop and obtain organizer approval for the initial local checkpoint. Record the real starting ref before feature work; do not invent a SHA or treat an empty diff as a successful review.

## Source and sharing

Adapted from [Mosh Hamedani's Expense Tracker starter](https://github.com/mosh-hamedani/expense-tracker-starter/tree/ebb746781495028051926213eb7ef6de5ce1cfe4), commit `ebb746781495028051926213eb7ef6de5ce1cfe4`, originally used in his [Claude Code course](https://codewithmosh.com/p/claude-code).

The inspected upstream commit has no LICENSE file. This preparation does not grant redistribution rights; clarify permission before classroom distribution or publishing. No remote repository has been created.
