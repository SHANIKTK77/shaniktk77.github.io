# Design system

## Direction: "Telemetry"

The site belongs to a game developer whose distinguishing skill is performance work:
profiling, draw calls, memory, ANR rates. Most of the games are racing titles. The visual
language borrows from both: an engineer's instrument panel and a printed spec sheet, set in
an editorial serif so it reads as a person, not a dashboard.

Principles:

1. **Measure, don't decorate.** The one accent color, signal orange, is reserved for things
   being measured or marked (the "after" bar, the current section, index numbers). There
   are no gradients, glows, glass or drop shadows.
2. **Every graphic is real data.** The install split, ANR and draw-call bars, and per-game
   install bars are all computed from `src/data.js`. Each has a text alternative.
3. **Rules, not boxes.** Structure comes from hairline rules and a 12-column grid rather than
   cards. The single filled panel (the solo project, inverted) is there to break rhythm on purpose.
4. **Quiet motion.** Things fade up once as they enter, and bars grow to their value. Nothing
   loops, nothing parallaxes. All of it switches off under `prefers-reduced-motion`.

## Tokens (`src/styles/tokens.css`)

### Color

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--paper` | `#f4f2ed` | `#111110` | Page background |
| `--paper-2` | `#ebe8e1` | `#1a1918` | Hover wash, raised areas |
| `--paper-3` | `#e1ddd4` | `#23221f` | Bar tracks, image placeholders |
| `--ink` | `#161513` | `#ece8df` | Primary text, strong rules |
| `--ink-2` | `#4f4b44` | `#b3ada2` | Body copy |
| `--ink-3` | `#6d685f` | `#8f897f` | Labels, metadata (≥4.5:1 on paper) |
| `--rule` / `--rule-strong` | `#d9d5cc` / `#b9b4a9` | `#2a2826` / `#45423d` | Hairlines |
| `--signal` | `#c2410c` | `#ff6a2b` | The accent. Use sparingly. |
| `--inverse*` | dark panel | light panel | Solo project panel |

Theme resolution: system preference by default; `html[data-theme]` overrides it once the
visitor uses the switch (stored in `localStorage.theme`, applied before paint by
`public/index.html`).

### Type

| Role | Family | Notes |
| --- | --- | --- |
| Display (h1–h3, big numbers, skill list) | Newsreader | Optical sizing; italic used once, for the headline's payoff |
| Body | IBM Plex Sans 400/600 | |
| Labels, data, buttons | IBM Plex Mono 400/500 | Uppercase + 0.08em tracking for labels |

Scale: `--step--1` (13px labels) → `--step-0` (17px body) → `--step-1..4`, fluid with `clamp()`.
The headline (`--step-4`) tops out at 84px.

### Space and layout

4px base (`--space-1` … `--space-9`). Sections use `--section-y` (72–128px).
Container max 76rem with a fluid gutter (`--gutter`, 16–40px). Sections lay out on a
12-column grid: headings take 7 columns, intros the remaining 5; data rows put labels in
3 columns and values in 9.

Breakpoints (max-width): **1100** (ledger drops genre/platform columns), **900** (two-column
layouts stack), **760** (desktop nav becomes the Menu sheet), **640** (ledger becomes
thumbnail + text), **480** (buttons go full width; wordmark drops the monogram), **340**.

### Shape and motion

`--radius: 2px` everywhere. Only borders, no shadows.
Easing `--ease-out` for entrances, durations `--dur-fast` 160ms (hover), `--dur` 320ms
(UI), `--dur-slow` 900ms (reveals).

## Components

| Component | Notes |
| --- | --- |
| `Header` | Sticky; numbered nav with an active-section underline; theme switch; full-screen menu under 760px (focus moves in, Escape closes, scroll locks) |
| `SectionHead` | "01 — Work" index line, h2, optional intro in the right-hand columns |
| `Hero` | Meta bar with live local time, headline, intro, actions, and the readouts panel |
| `Meter` | Before/after bars on a shared scale, with a hidden sentence for screen readers |
| `Work` | The games ledger (stretched-link rows with log-scale install bars) and the solo panel |
| `Shot` | 16:9 screenshot with reserved size, a loading sweep, fade-in and a text fallback on error |
| `Experience` | Timeline rows; numbered highlight grid; promotion track (vertical on phones) |
| `Skills` | Spec sheet: mono group label and serif values |
| `Contact` | Big mailto, copy-to-clipboard (hidden without the Clipboard API), details grid |
| `.button` / `--solid` / `--inverse` | One shape. Solid is for the single primary action in a view. |

## Static pages

`public/privacy-policy/index.html` and `public/404.html` reuse the palette and fonts by
hand and honour the saved theme. Keep them in step with `tokens.css`.
