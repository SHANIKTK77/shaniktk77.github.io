# AGENTS.md

Guidance for coding agents (Codex, Claude Code, others) working in this repository.
Humans should start with `README.md`; the design system is in `docs/DESIGN.md`.

## What this is

Shadman Khan Khattak's personal portfolio: a single-page React site plus two static pages.
There is no backend, no auth, no database and no API calls. Everything shown comes from
`src/data.js`, except the live frame numbers in the hero, which the WebGL scene measures
on the visitor's device.

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
  terms-of-service/     Static Terms of Service for the mobile games (same styles as the policy)
  404.html              Static not-found page (served by GitHub Pages / Vercel)
  app-ads.txt           AdMob verification. Do not edit or remove.
src/
  data.js               ALL content: profile, stats, games, experience, education, skills
  sections.js           Section ids, labels and numbers (drives nav + headings)
  App.js                Composes the page; imports global styles first
  styles/tokens.css     Design tokens (colors, type, space, motion, scene colors) + dark palette
  styles/base.css       Reset, element defaults, .container/.label/.button/.ticks, reveal system
  gl/terrain.js         The WebGL scene: shaders, one-draw-call terrain, dynamic resolution
  gl/stats.js           Tiny store the scene publishes frame numbers to
  components/           One component per file, each with its own .css next to it
                        (Scene.js mounts the canvas and wires theme/pointer/scroll/visibility)
  hooks/                useTheme, useReveal, useActiveSection, useLocalTime,
                        useFrameStats, useReducedMotion
  lib/installs.js       Parses Play Store tiers ("100M+") for the install bars
  lib/period.js         Parses "Oct 2022 – Present" style periods for the profiler
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
- **Keep the static pages in step.** `public/privacy-policy/index.html`,
  `public/terms-of-service/index.html` and `public/404.html`
  copy the palette by hand (they can't import the React CSS). If you change a token, change it
  there too.
- **Don't edit the privacy policy or terms of service text** unless the owner asks; they're
  legal documents tied to published apps (both URLs are registered in Play Console). Styling changes are fine.
- **Stack is deliberate.** React 17 + Create React App + plain CSS + raw WebGL. No UI kit, no
  CSS-in-JS, no router (one page), no Three.js/GSAP. Don't add runtime dependencies without a
  strong reason; the JS bundle is ~61 kB gzip (the whole scene is ~6 kB of it) and should stay small.
- **The scene must stay cheap and honest.** One draw call, DPR capped at 2, renders only while
  the hero or contact is on screen, one still frame under reduced motion, CSS fallback without
  WebGL. The HUD shows only values the renderer actually measures; if you change what's drawn,
  the numbers must still be true. Scene colors come from `--scene-*` tokens and must be hex.
- **Accessibility is part of done.** Keep the skip link, landmark labels, visible focus,
  `aria-expanded` on the menu, text alternatives for every chart (see `Meter.js`,
  `InstallSplit` in `Hero.js`, `Profiler` in `Experience.js`), `aria-hidden` on purely
  duplicate or decorative layers (the canvas, the HUD, the game view), and the
  `prefers-reduced-motion` handling in `base.css` and `Scene.js`.
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
   reduced motion, that the WebGL scene renders and reports frame numbers, and writes full-page screenshots to `e2e/.results/` for you to look at.

## Known limitations

- The scene uses WebGL 1 lines, which are always 1px wide; on very high-DPR screens the
  ridgelines are hairlines by design. Headless test browsers render it with SwiftShader.
- Game screenshots are 1280×720 JPEGs (90–270 kB). They're lazy-loaded with reserved space,
  but aren't resized or converted to WebP/AVIF; CRA has no image pipeline.
- The `theme-color` meta follows the system setting only, not the manual theme switch.
- `og:image` isn't set, so link previews have no picture.
- `npm audit` reports advisories in Create React App's build tooling (dev-only; not shipped).
