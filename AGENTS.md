# AGENTS.md

Guidance for coding agents (Codex, Claude Code, others) working in this repository.
Humans should start with `README.md`; the design system is in `docs/DESIGN.md`.

## What this is

Shadman Khan Khattak's personal portfolio: a single-page React site plus two static pages.
There is no backend, no auth, no database and no API calls. Everything shown comes from
`src/data.js`.

Live at https://shaniktk77.github.io (GitHub Pages) and https://shadmankhan.vercel.app (Vercel).
Both deploy automatically from `main`.

## Commands

| Task | Command |
| --- | --- |
| Install | `npm ci` |
| Dev server (http://localhost:3000) | `npm start` |
| Unit/component tests (Jest + Testing Library) | `CI=true npm test` |
| Browser tests (Playwright, desktop + Pixel 7) | `npx playwright install chromium` once, then `npm run test:e2e` |
| Production build | `CI=true npm run build` |

`CI=true` matters: the deploy workflow builds with it, and Create React App then treats
**every lint warning as a build failure**. Run the build that way before pushing.

## Layout

```
public/
  index.html            Shell: fonts, meta/OG tags, JSON-LD, pre-paint theme script
  privacy-policy/       Static legal page for the mobile games (hand-written HTML + CSS)
  404.html              Static not-found page (served by GitHub Pages / Vercel)
  app-ads.txt           AdMob verification. Do not edit or remove.
src/
  data.js               ALL content: profile, stats, games, experience, education, skills
  sections.js           Section ids, labels and numbers (drives nav + headings)
  App.js                Composes the page; imports global styles first
  styles/tokens.css     Design tokens (colors, type, space, motion) + dark palette
  styles/base.css       Reset, element defaults, .container/.label/.button, reveal system
  components/           One component per file, each with its own .css next to it
  hooks/                useTheme, useReveal, useActiveSection, useLocalTime
  lib/installs.js       Parses Play Store tiers ("100M+") for the install bars
e2e/site.spec.js        Playwright tests
```

## Rules

- **Content is real. Never invent it.** No placeholder text, made-up metrics, testimonials,
  clients or download counts. Every number on the page must trace back to `src/data.js`.
  If a design needs data that doesn't exist, leave the element out.
- **Change content in `src/data.js`, not in components.** The headline and two intro
  paragraphs in `components/Hero.js` are the only hand-written copy in components.
- **Use tokens.** Components read `var(--…)` from `styles/tokens.css`; don't hard-code colors,
  fonts or durations. A new color means a new token with both light and dark values.
- **Keep the static pages in step.** `public/privacy-policy/index.html` and `public/404.html`
  copy the palette by hand (they can't import the React CSS). If you change a token, change it
  there too.
- **Don't edit the privacy policy text** unless the owner asks; it's a legal document tied to
  published apps. Styling changes are fine.
- **Stack is deliberate.** React 17 + Create React App + plain CSS. No UI kit, no CSS-in-JS,
  no router (one page). Don't add runtime dependencies without a strong reason; the bundle is
  ~55 kB gzip and should stay small.
- **Accessibility is part of done.** Keep the skip link, landmark labels, visible focus,
  `aria-expanded` on the menu, text alternatives for every chart (see `Meter.js`,
  `InstallSplit` in `Hero.js`), and the `prefers-reduced-motion` handling in `base.css`.
- **Line endings are LF** (`.gitattributes`). On Windows, write files with `newline="\n"`.

## Conventions

- Function components and hooks only. Default export per component file.
- CSS class names are BEM-ish and scoped by component: `.game__title`, `.hero__meta`.
- Section components take their data as props from `App.js` rather than importing `data.js`,
  which keeps them testable.
- Comments explain *why*, briefly. Match the existing tone.

## Verifying a change

1. `CI=true npm test`. All tests must pass.
2. `CI=true npm run build`. Must compile with no warnings.
3. `npm run test:e2e` for anything visual or interactive. It checks console errors, image
   loading, horizontal overflow at 320–1920px, nav, mobile menu, theme persistence, skip link,
   reduced motion, and writes full-page screenshots to `e2e/.results/` for you to look at.

## Known limitations

- Game screenshots are 1280×720 JPEGs (90–270 kB). They're lazy-loaded with reserved space,
  but aren't resized or converted to WebP/AVIF; CRA has no image pipeline.
- The `theme-color` meta follows the system setting only, not the manual theme switch.
- `og:image` isn't set, so link previews have no picture.
- `npm audit` reports advisories in Create React App's build tooling (dev-only; not shipped).
