# Design system

## Direction: "Live Render"

The site belongs to a game developer whose distinguishing skill is making games run well
on cheap phones. So the page doesn't show a picture of a rendered world; it renders one,
on the visitor's device, and shows its own frame numbers while it does.

- **Cinematic:** a full-screen procedural terrain (ridgelines either side of a road, a nod
  to the racing titles) lit by a single sodium-orange light that follows the pointer.
  Oversized serif headlines rise out of masks over it.
- **Experimental:** the games are a list of oversized titles beside a sticky "game view";
  the career is a profiler capture; skills read like a line of credits; the page closes on
  the name set as wide as the screen.
- **Engineering:** the hero HUD reports the scene's real fps, frame time, draw calls (1),
  vertex count, render size and resolution scale. The renderer lowers its own resolution
  when frames run long, which is the owner's day job, shown rather than claimed.

Principles:

1. **Every graphic is real.** The HUD numbers are measured by the renderer. The install
   split, meters, install bars and profiler are computed from `src/data.js`. Each data
   graphic has a text alternative. Nothing decorative pretends to be data.
2. **One accent, used for signal.** Sodium orange (`--signal`) marks the light, the current
   thing (active row, current role, section number) and the "after" value. Everything
   else is ink on paper.
3. **Plates over a scene.** The WebGL scene is fixed behind the page. The hero and contact
   are windows onto it; every other section is an opaque paper plate that slides over it.
   The scene only renders while one of those windows is on screen.
4. **Motion with a job.** Headline words rise once on load; headings wipe in; bars grow to
   their value; the game view cross-fades to the active row. The only loops are the
   scene, two status blinkers and the scroll cue. Everything stops under
   `prefers-reduced-motion`, and the scene draws a single still frame.
5. **Engine in-jokes, used once each.** Corner ticks on the game view; the profiler; a
   broken screenshot (and the 404 page) gets Unity's magenta missing-texture checkerboard.

## Tokens (`src/styles/tokens.css`)

### Color

| Token | Light ("plate") | Dark ("night render") | Use |
| --- | --- | --- | --- |
| `--paper` / `-2` / `-3` | `#eeebe3` / `#e5e1d6` / `#d9d4c7` | `#0c0d0f` / `#14161a` / `#1e2126` | Page, hover wash, tracks |
| `--ink` / `-2` / `-3` | `#121314` / `#45474b` / `#5f6267` | `#ecebe6` / `#b2b4b8` / `#8a8e94` | Text; `-3` is ≥4.5:1 on paper |
| `--rule` / `--rule-strong` | `#d2cdc1` / `#aaa598` | `#23262b` / `#3d4148` | Hairlines |
| `--signal` | `#b33a0a` | `#ff7a1a` | The accent (≥4.5:1 on paper) |
| `--scene-line` / `--scene-light` / `--scene-strength` | ink / `#e2550f` / 0.55 | `#8fa3c0` / `#ff7a1a` / 0.7 | Read by the WebGL scene; keep them hex |
| `--scrim` | paper @ 88% | paper @ 86% | Plates over the scene (header, HUD, contact) |
| `--missing` / `--missing-dark` | `#ff00ff` / `#000` | same | Missing-texture checkerboard only |
| `--inverse*` | dark plate | light plate | Solo project panel |

Theme resolution: system preference by default; `html[data-theme]` overrides it once the
visitor uses the switch (stored in `localStorage.theme`, applied before paint by
`public/index.html`). The scene watches `data-theme` and the system setting and re-reads
its colors.

### Type

| Role | Family | Notes |
| --- | --- | --- |
| Display (h1–h3, big numbers, skills, footer name) | Instrument Serif | One weight; italic only for the headline payoff. Set tight (line-height 0.85–0.95, negative tracking) |
| Body | Geist 400/500/600 | |
| Labels, HUD, data, buttons | Geist Mono 400/500 | Uppercase + 0.08em tracking for labels |

Scale: `--step--2` (11px HUD) → `--step--1` (13px labels) → `--step-0` (17px body) →
`--step-1..5`, fluid with `clamp()`. `--step-4` (section titles) tops out at 112px,
`--step-5` ("Get in touch") at 176px. The hero headline uses its own clamp with a 48px floor.

### Space and layout

4px base (`--space-1` … `--space-9`). Sections use `--section-y` (80–160px). Container max
90rem with a fluid gutter (`--gutter`, 16–48px). 12-column grid: section titles take 8
columns and intros 4; the games ledger splits 6 (game view) / 6 (list).

Breakpoints (max-width): **1100** (highlights go to 2 columns), **1000** (game view goes;
rows get thumbnails; hero brief stacks), **900** (two-column layouts stack), **760**
(desktop nav becomes the Menu sheet), **640** (rows become thumbnail-over-text; HUD goes
full width; highlights single column), **480**, **360**.

### Shape and motion

Square corners (`--radius: 0`), hairline borders, no shadows. Buttons fill with a left-to-right
wipe. Easing `--ease-out` (expo-ish) for entrances; `--dur-fast` 160ms (hover), `--dur`
360ms (UI), `--dur-slow` 1100ms (reveals).

Reveals (`hooks/useReveal.js`): `data-reveal` fades up; `data-reveal="wipe"` uncovers left
to right with `clip-path`. Wipe elements are observed through their parent, because Chrome's
IntersectionObserver counts the target's own clip-path.

## The scene (`src/gl/terrain.js`)

Plain WebGL 1 and about 300 lines, with no Three.js (a 150 kB+ dependency for what is one
buffer and one shader). The terrain is a static grid of line segments (84 rows × 169 segments on
desktop, 56 × 109 under 700px) drawn with **one** `drawArrays` call. The vertex shader scrolls the
rows toward the camera, displaces them with 3-octave simplex noise, carves a flat road, and
computes fog, lighting and centre-line dashes. The fragment shader only mixes two colors.

- **Dynamic resolution:** if the smoothed frame interval exceeds 22ms, the render scale
  drops by 20% (floor 50%); after 6s of comfortable frames it climbs back.
- **Budget:** device pixel ratio capped at 2; `powerPreference: "low-power"`; the loop stops
  when neither the hero nor the contact section is on screen, and when the tab is hidden.
- **Fallbacks:** no WebGL → the CSS horizon glow stays and the HUD doesn't render. Context
  lost → the loop stops and resumes on restore. Reduced motion → one still frame, and
  the pointer and scroll are ignored.
- **Input:** pointer x/y moves the light and adds a little camera yaw/pitch; touch devices
  get a slow automatic drift instead; scroll progress lifts the camera toward the finale.

## Components

| Component | Notes |
| --- | --- |
| `Scene` | Fixed canvas + horizon glow; owns the renderer, theme/pointer/scroll/visibility wiring |
| `Header` | Fixed; transparent over the hero, scrim plate once scrolled; numbered mono nav; CSS scroll-progress line (`animation-timeline`); full-screen menu under 760px |
| `SectionHead` | "01 / 04 ——— Work" index line, oversized wiped-in h2, optional intro |
| `Hero` | Meta bar with live local time; word-masked headline; scroll cue; live render HUD (`FrameReadout`); then the brief (intro, actions, key-number cluster) |
| `Meter` | Before/after bars on a shared scale, with a hidden sentence for screen readers |
| `Work` | Sticky `GameView` (aria-hidden duplicate) + oversized title rows. The active row is the hovered/focused one or the one crossing mid-screen. Solo project as a 21:9 still with an inverse plate |
| `Shot` | 16:9 screenshot, reserved size, blur-to-sharp "texture streaming" load, missing-texture fallback |
| `Experience` | `Profiler` (thread-name column, year grid, bars from `lib/period.js`, recording cursor on the current role), then timeline entries with highlight markers |
| `Skills` | Spec sheet: mono group + count, display-face items separated by slashes |
| `Contact` | Full-height finale over the scene; huge email, copy button, details plate |
| `Footer` | The name set edge to edge, then the legal bar |

## Static pages

`public/privacy-policy/index.html` (palette and type only; the policy text is legal copy
and stays untouched) and `public/404.html` (missing-asset page on a scrolling magenta
checkerboard) copy the palette by hand and honour the saved theme. Keep them in step with
`tokens.css`.
