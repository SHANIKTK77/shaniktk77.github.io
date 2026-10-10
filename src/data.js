import rider3D from "./Assets/Projects/Rider.jpg";
import csm from "./Assets/Projects/csm.jpg";
import kungFu from "./Assets/Projects/Kung FU.jpg";
import pradoParking from "./Assets/Projects/prado.jpg";
import rampStunt from "./Assets/Projects/rampstunt.jpg";
import mcr from "./Assets/Projects/MCR.jpg";
import motoMax from "./Assets/Projects/motomax.jpg";
import offroadJeep from "./Assets/Projects/offroadjeep.jpg";

const playStore = (id) =>
  `https://play.google.com/store/apps/details?id=${id}&hl=en`;

export const profile = {
  name: "Shadman Khan Khattak",
  role: "Game Developer",
  focus: ["Performance optimization", "Cross-platform porting", "Multiplayer"],
  location: "Nowshera, Pakistan",
  email: "shani.ktk77@gmail.com",
  phone: "+92-311-9029334",
  github: "https://github.com/shaniktk77",
  linkedin: "https://www.linkedin.com/in/shadman-khan-khattak-b6b834163/",
};

export const stats = [
  { value: "4+", label: "Years making games" },
  { value: "50M+", label: "Downloads on Prado Parking" },
  { value: "0.24%", label: "ANR rate, down from 0.45%" },
  { value: "~5x", label: "Fewer draw calls (450 → 90)" },
];

// Character-sheet ratings (0–100) shown on the radar chart in the profile section
export const attributes = [
  { label: "Optimization", value: 96 },
  { label: "Porting", value: 92 },
  { label: "Gameplay", value: 88 },
  { label: "Multiplayer", value: 84 },
  { label: "Live ops", value: 82 },
  { label: "UI systems", value: 86 },
];

// Shown at random on the loading screen
export const tips = [
  "Combining meshes and atlasing textures took draw calls from ~450 down to ~90.",
  "Moving ad and scene loading off the main thread cut ANR from 0.45% to 0.24%.",
  "Prado Car Parking passed 50 million downloads on Google Play.",
  "Enter ↑ ↑ ↓ ↓ ← → ← → B A anywhere on the page for a surprise.",
  "Press Enter on the title screen to drive through the portfolio in real-time 3D.",
  "Type IDDQD anywhere for god mode.",
  "Hit the stunt ramp with nitro for big air.",
  "Turn on sound in the top bar for UI effects.",
];

// The game shown large at the top of the page
export const featuredTitle = "Commando Shooting Stars";

// Add an `appStore` URL to any game to turn its iOS badge into a link
export const games = [
  {
    title: "Commando Shooting Stars",
    genre: "FPS",
    badge: "Original · Solo-built",
    image: csm,
    description:
      "My own game, built solo from the ground up. I made the shooting, upgrades and loot, plus the Firebase backend behind player data and live config.",
    platforms: ["Android", "iOS"],
    playStore: playStore("com.fg.fps.commando.shooting.game.action.games"),
  },
  {
    title: "Prado Car Parking",
    genre: "Simulation",
    badge: "50M+ downloads",
    image: pradoParking,
    description:
      "A 50M+ download hit. I tuned its performance, brought ANR down to 0.24% and polished the gameplay to keep players coming back.",
    platforms: ["Android", "iOS"],
    playStore: playStore("com.ghive.jeep.parking.car.free.game.master.apps"),
  },
  {
    title: "Rider 3D",
    genre: "Racing",
    image: rider3D,
    description:
      "I built the UI, the upgrade system and the offline economy, and kept crashes under 1% across every release.",
    platforms: ["Android", "iOS"],
    playStore: playStore(
      "com.ffgames.motoercycle.traffic.racer.bikegames.rider.motobikeracing3d"
    ),
  },
  {
    title: "Moto Max",
    genre: "Racing",
    image: motoMax,
    description:
      "Fast circuits, sharp turns and a lot of leaning into corners.",
    platforms: ["Android", "iOS"],
    playStore: playStore(
      "com.offline.racing.motorcyclegame.motomax.bikerace.bike.games"
    ),
  },
  {
    title: "Mini Car Rush",
    genre: "Endless runner",
    image: mcr,
    description:
      "Offline chase racing with turbo cars, boosters and plenty of obstacles.",
    platforms: ["Android", "iOS"],
    playStore: playStore("com.tb.minicar.rush.racing.drivinggames"),
  },
  {
    title: "Kung Fu Fighting",
    genre: "Fighting",
    image: kungFu,
    description:
      "3D martial arts brawler with non-stop action and arena progression.",
    platforms: ["Android", "iOS"],
    playStore: playStore("com.gzl.superhero.karatefighting.game"),
  },
  {
    title: "GT Car Stunt",
    genre: "Stunt racing",
    image: rampStunt,
    description: "Ramp stunts with smooth, realistic car handling on mobile.",
    platforms: ["Android"],
    playStore: playStore("com.car.stunt.driving.cargames.offline.ramp.racing"),
  },
  {
    title: "Off Road Jeep Parking",
    genre: "Simulation",
    image: offroadJeep,
    description:
      "4x4 off-road driving, parking and cargo transport across mountain tracks.",
    platforms: ["Android"],
    playStore: playStore("com.doit.fun.games.offroad.rally.truck.apps"),
  },
];

export const experience = [
  {
    role: "Senior Game Developer",
    company: "Terafort",
    period: "2021 – Present",
    summary:
      "I take games from prototype to release on every platform they ship to, then make sure they run smoothly everywhere, right down to low-end devices.",
    highlights: [
      {
        title: "Making games run fast",
        text: "Profiled on-device and cut draw calls from ~450 to ~200, down to ~90 on some titles, by combining meshes, atlasing textures and tuning the far clip plane.",
      },
      {
        title: "Fitting on low-end phones",
        text: "Compressed assets and textures so games run on 2–3 GB Android devices without out-of-memory crashes.",
      },
      {
        title: "Keeping games stable",
        text: "Moved ad and scene loading off the main thread and pooled objects, taking ANR from 0.45% to 0.24% with crashes under 1%.",
      },
      {
        title: "Porting across platforms",
        text: "Ported several Android titles to iOS end to end, from platform bugs and code signing to App Store release, and build for tvOS and Android TV too.",
      },
      {
        title: "Multiplayer",
        text: "Built matchmaking, rooms and real-time state sync with Photon PUN so players stay in step across devices.",
      },
      {
        title: "AI in the editor",
        text: "Connected our Unity project to AI agents through Unity MCP, automating asset work, scene edits and other repetitive tasks.",
      },
    ],
  },
  {
    role: "System Engineer",
    company: "ZMectr",
    period: "2020 – 2021",
    summary:
      "Before games, I designed and ran IoT systems. I kept them up 99% of the time and cut production incidents by 25% by catching problems early and fixing their root causes.",
  },
];

export const education = {
  degree: "B.Sc. Computer Science",
  school: "Northern University Nowshera",
  period: "2017 – 2021",
};

export const skills = [
  {
    group: "Engines and languages",
    items: ["Unity (C#)", "Unreal Engine", "C++", "JavaScript", "Python"],
  },
  {
    group: "What I specialize in",
    items: [
      "Performance optimization",
      "Cross-platform porting",
      "Multiplayer (Photon, PlayFab)",
      "App Store and Play Store release",
    ],
  },
  {
    group: "Backend and monetization",
    items: ["Firebase", "AdMob", "Unity Ads", "AppLovin"],
  },
  {
    group: "Platforms",
    items: [
      "Android",
      "iOS",
      "tvOS",
      "Android TV",
      "Playable ads (Unity Playworks)",
    ],
  },
  {
    group: "Tools",
    items: ["Unity Profiler", "Graphy", "Xcode", "Git", "Bitbucket", "Agile"],
  },
  {
    group: "AI in my workflow",
    items: ["Unity MCP + AI agents", "Cursor", "Claude", "ChatGPT"],
  },
];
