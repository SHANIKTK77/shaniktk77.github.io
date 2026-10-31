# Shadman Khan Khattak — Portfolio

My personal portfolio website, live at **[shaniktk77.github.io](https://shaniktk77.github.io)** and **[shadmankhan.vercel.app](https://shadmankhan.vercel.app)**.

A simple single-page portfolio: who I am, the games I've worked on, my experience, my skills and my resume.

- GitHub: [@shaniktk77](https://github.com/shaniktk77)
- LinkedIn: [Shadman Khan Khattak](https://www.linkedin.com/in/shadman-khan-khattak-b6b834163/)

## Built With

- React 17 (Create React App), no runtime dependencies beyond React
- Plain CSS with design tokens, light and dark themes (follows the system, with a switch)
- Google Fonts: Newsreader, IBM Plex Sans and IBM Plex Mono
- Jest + Testing Library for component tests, Playwright for browser tests
- GitHub Pages and Vercel

The design system and the reasoning behind it are in [`docs/DESIGN.md`](docs/DESIGN.md).
Notes for coding agents are in [`AGENTS.md`](AGENTS.md).

## Running Locally

You need [Node.js](https://nodejs.org/) and `git` installed.

```bash
npm install
npm start
```

The app runs at [http://localhost:3000](http://localhost:3000) and reloads as you edit.

## Editing Content

| What | Where |
| --- | --- |
| Profile, stats, games, experience, education, skills | `src/data.js` |
| App Store link for a game | add an `appStore` URL to that game in `src/data.js` |
| Personal project shown on its own below the games | the game marked `personal: true` in `src/data.js` |
| Game screenshots | `src/Assets/Projects/` |
| Resume PDF | `src/Assets/Resume.pdf` |
| Intro paragraphs | `src/components/Hero.js` |
| Section order and nav labels | `src/sections.js` |
| Colors, fonts, spacing | `src/styles/tokens.css` (also copy color changes into `public/privacy-policy/index.html` and `public/404.html`) |
| A section's layout | `src/components/<Section>.js` and its `.css` |

## Testing

```bash
CI=true npm test          # component and unit tests
npx playwright install chromium   # once
npm run test:e2e          # real-browser tests on desktop and phone sizes
CI=true npm run build     # same build the deploy runs; fails on any lint warning
```

## Deploying

Pushing to `main` deploys automatically:

- **GitHub Pages:** the `Deploy to GitHub Pages` workflow (`.github/workflows/deploy-pages.yml`) builds the app and pushes `build/` to the `gh-pages` branch, which GitHub Pages serves.
- **Vercel:** the Vercel project ([shadmankhan.vercel.app](https://shadmankhan.vercel.app)) is linked to this repo and redeploys on every push.

To deploy to GitHub Pages by hand instead:

```bash
npm run deploy
```

## Credits

Based on the open-source portfolio template by [Soumyajit4419](https://github.com/soumyajit4419/Portfolio).
