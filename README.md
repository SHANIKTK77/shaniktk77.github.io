# Shadman Khan Khattak — Portfolio

My personal portfolio website, live at **[shaniktk77.github.io](https://shaniktk77.github.io)**.

A single-page game developer portfolio styled like a AAA game's title screen: the games I've shipped, my experience, my skills and my resume.

- GitHub: [@shaniktk77](https://github.com/shaniktk77)
- LinkedIn: [Shadman Khan Khattak](https://www.linkedin.com/in/shadman-khan-khattak-b6b834163/)

## Features

- **Studio splash:** a loading screen with a drawn-in crest and a random tip, shown once per browser session. Press any key or click to skip it.
- **Title screen hero:** full-screen game art that cross-fades between my games, a real-time WebGL layer of smoke and embers, mouse parallax, HUD framing and a game-style main menu.
- **Character select:** a player card, an attribute radar chart and achievement tiles that count up when you scroll to them.
- **Game library:** a store-style grid with a big tile for the featured game; filter by genre, hover for details and store links.
- **Campaign:** my work history as chapters with completed objectives, on a timeline that fills as you scroll.
- **Loadout:** my skills and tools as six equipment slots.
- **Arcade:** Lane Dodger, a small canvas mini-game you can play on the page.
- **Lobby:** contact links styled as a multiplayer party screen.
- **Extras:** a crosshair cursor that locks on to links, optional synthesized UI sounds (toggle in the top bar), film grain, and a full-screen pause menu on phones.
- **Easter egg:** enter the Konami code (↑ ↑ ↓ ↓ ← → ← → B A) to turn on retro mode.

The page also respects `prefers-reduced-motion`: animations, the WebGL effect, the slideshow autoplay, the custom cursor and the splash screen are turned off for visitors who ask for reduced motion.

## Built With

- React
- CSS3 (no UI framework)
- [react-icons](https://react-icons.github.io/react-icons/)
- WebGL (hand-written shader, no 3D library) and the Web Audio API
- Google Fonts: Barlow Condensed, Inter, JetBrains Mono and Press Start 2P (retro mode only)
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
| Game shown first in the hero and as the big library tile | `featuredTitle` in `src/data.js` |
| Radar chart ratings | `attributes` in `src/data.js` |
| Loading screen tips | `tips` in `src/data.js` |
| App Store link for a game | add an `appStore` URL to that game in `src/data.js` |
| Game screenshots | `src/Assets/Projects/` |
| Resume PDF | `src/Assets/Resume.pdf` |
| Layout and section components | `src/App.js` |
| Styles, colors and fonts | `src/App.css` (colors are CSS variables at the top) |
| Boot screen length | `BOOT_MS` in `src/App.js` |
| Mini-game | `src/MiniGame.js` |
| Hero smoke and embers shader | `src/HeroFX.js` |
| UI sounds | `src/sfx.js` |

## Deploying

```bash
npm run deploy
```

This builds the app and pushes the `build/` output to the `gh-pages` branch, which GitHub Pages serves.

## Credits

Based on the open-source portfolio template by [Soumyajit4419](https://github.com/soumyajit4419/Portfolio).
