# Shadman Khan Khattak — Portfolio

My personal portfolio website, live at **[shaniktk77.github.io](https://shaniktk77.github.io)** and **[shadmankhan.vercel.app](https://shadmankhan.vercel.app)**.

A simple single-page portfolio: who I am, the games I've worked on, my experience, my skills and my resume.

- GitHub: [@shaniktk77](https://github.com/shaniktk77)
- LinkedIn: [Shadman Khan Khattak](https://www.linkedin.com/in/shadman-khan-khattak-b6b834163/)

## Built With

- React
- Plain CSS (no UI framework), with light and dark themes that follow the visitor's system setting
- Google Fonts: Newsreader and IBM Plex Sans
- GitHub Pages and Vercel

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
| Page sections and intro text | `src/App.js` |
| Styles, colors and fonts | `src/App.css` (colors are CSS variables at the top) |

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
