# CLAUDE.md

@AGENTS.md

## Claude Code notes

- The dev server is configured in `.claude/launch.json` (name `portfolio`, port 3000). Use it
  for previewing changes; Playwright reuses it when it's already running.
- After a visual change, look at the page at phone width (375px) and desktop (1440px) in both
  light and dark themes, not just one.
- Design decisions and the reasoning behind them are in `docs/DESIGN.md`. Read it before
  changing layout, type, color or the WebGL scene.
- The browser pane can't go narrower than ~380px; check 320px with Playwright
  (`npm run test:e2e` covers overflow at 320–1920px).
