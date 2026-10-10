# Shadman Khan Khattak — Portfolio

My personal portfolio website, live at **[shaniktk77.github.io](https://shaniktk77.github.io)**.

A single-page game developer portfolio styled like a modern game launcher: the games I've shipped, my experience, my skills and my resume.

- GitHub: [@shaniktk77](https://github.com/shaniktk77)
- LinkedIn: [Shadman Khan Khattak](https://www.linkedin.com/in/shadman-khan-khattak-b6b834163/)

## Features

- **Boot screen:** a short loading screen shown once per browser session. Press any key or click to skip it.
- **Hero showcase:** a slideshow of my games with a blurred backdrop of the current game behind it.
- **Achievements:** career stats that count up when you scroll to them.
- **Game library:** game cards you can filter by genre, each linking to its store page.
- **Career mode:** my work experience laid out as missions and objectives.
- **Loadout:** my skills and tools grouped into slots.
- **Arcade:** Lane Dodger, a small canvas mini-game you can play on the page.
- **Navigation:** the menu highlights the section you're in, and phones get a full-screen pause menu.
- **Easter egg:** enter the Konami code (↑ ↑ ↓ ↓ ← → ← → B A) to turn on retro mode.

The page also respects `prefers-reduced-motion`: animations, the slideshow autoplay and the boot screen are turned off for visitors who ask for reduced motion.

## Built With

- React
- CSS3 (no UI framework)
- [react-icons](https://react-icons.github.io/react-icons/)
- Google Fonts: Rajdhani, JetBrains Mono, Inter and Press Start 2P (retro mode only)
- GitHub Pages

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
| Game shown first in the hero slideshow | `featuredTitle` in `src/data.js` |
| App Store link for a game | add an `appStore` URL to that game in `src/data.js` |
| Game screenshots | `src/Assets/Projects/` |
| Resume PDF | `src/Assets/Resume.pdf` |
| Layout and section components | `src/App.js` |
| Styles, colors and fonts | `src/App.css` (colors are CSS variables at the top) |
| Boot screen length | `BOOT_MS` in `src/App.js` |
| Mini-game | `src/MiniGame.js` |

## Deploying

```bash
npm run deploy
```

This builds the app and pushes the `build/` output to the `gh-pages` branch, which GitHub Pages serves.

## Credits

Based on the open-source portfolio template by [Soumyajit4419](https://github.com/soumyajit4419/Portfolio).
