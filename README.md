# Shadman Khan Khattak — Portfolio

My personal portfolio website, live at **[shaniktk77.github.io](https://shaniktk77.github.io)** and **[shadmankhan.vercel.app](https://shadmankhan.vercel.app)**.

A single-page game developer portfolio styled like a AAA game's title screen: the games I've shipped, my experience, my skills and my resume.

- GitHub: [@shaniktk77](https://github.com/shaniktk77)
- LinkedIn: [Shadman Khan Khattak](https://www.linkedin.com/in/shadman-khan-khattak-b6b834163/)

## Features

- **Studio splash:** a loading screen with a drawn-in crest and a random tip, shown once per browser session. Press any key or click to skip it.
- **Drivable 3D title screen:** the hero is a real-time three.js world. A demo car laps a neon ring road in attract mode behind the title; press Enter (or **Take the wheel**) to drive it yourself.
  - Billboards around the track show each of my games, with a Google Play link when you drive past.
  - Glowing light beams are mission markers: drive into one and press E to jump to that section of the page.
  - Side quests with achievements: a bowling-pin cone strike, a stunt ramp, a parking challenge (a nod to Prado Car Parking) and a drift score to beat 9,000.
  - Arcade car physics with drifting, nitro, glowing drift trails, sparks, a minimap, an engine sound and on-screen touch controls on phones.
  - A live readout of FPS, draw calls and triangles. The whole world draws in about 50 calls thanks to instancing and no real-time shadows, and it lowers its own resolution if the frame rate drops.
- **Character select:** a player card, an attribute radar chart and achievement tiles that count up when you scroll to them.
- **Game library:** a store-style grid with a big tile for the featured game; filter by genre, hover for details and store links.
- **Campaign:** my work history as chapters with completed objectives, on a timeline that fills as you scroll.
- **Loadout:** my skills and tools as six equipment slots.
- **Arcade:** Lane Dodger, a small canvas mini-game you can play on the page.
- **Lobby:** contact links styled as a multiplayer party screen.
- **Extras:** a crosshair cursor that locks on to links, optional synthesized UI sounds (toggle in the top bar), film grain, and a full-screen pause menu on phones.
- **Easter eggs:** enter the Konami code (↑ ↑ ↓ ↓ ← → ← → B A) to turn on retro mode, or type `IDDQD` for god mode: a gold theme, a golden car with an aura and infinite nitro.

The page also respects `prefers-reduced-motion`: animations, the WebGL effects, the slideshow autoplay, the custom cursor and the splash screen are turned off for visitors who ask for reduced motion. Those visitors, and browsers without WebGL, get the classic title screen instead of the 3D world: game art that cross-fades between my games with a smoke-and-embers shader on top.

## Built With

- React
- CSS3 (no UI framework)
- [react-icons](https://react-icons.github.io/react-icons/)
- [three.js](https://threejs.org/) for the drivable world (loaded on demand, no physics library)
- WebGL (a hand-written shader for the fallback hero) and the Web Audio API
- Google Fonts: Barlow Condensed, Inter, JetBrains Mono and Press Start 2P (retro mode only)
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
| 3D world: layout, car physics, objectives | `src/driveEngine.js` (tuning constants at the top) |
| 3D world HUD, objectives copy and touch controls | `src/DriveWorld.js` |
| Mission markers (labels, colors) | `NAV` in `src/App.js` |
| Fallback hero smoke and embers shader | `src/HeroFX.js` |
| UI sounds | `src/sfx.js` |

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
