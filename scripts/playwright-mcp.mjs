import { chromium } from '@playwright/test'

// Use the browser installed for the test runner, not a personal Chrome profile
// or the MCP package's separately versioned browser download.
process.argv.push('--isolated', '--executable-path', chromium.executablePath())
await import('../node_modules/@playwright/mcp/cli.js')
