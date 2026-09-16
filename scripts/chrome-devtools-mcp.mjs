import { chromium } from '@playwright/test'

// Share the test browser binary, not a personal Chrome profile.
process.argv.push('--isolated', '--executable-path', chromium.executablePath())
await import('../node_modules/chrome-devtools-mcp/build/src/bin/chrome-devtools-mcp.js')
