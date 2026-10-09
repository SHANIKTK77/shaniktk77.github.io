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
  focus: ["Performance optimization", "iOS porting", "Multiplayer"],
  location: "Nowshera, Pakistan",
  email: "shani.ktk77@gmail.com",
  phone: "+92-311-9029334",
  github: "https://github.com/shaniktk77",
  linkedin: "https://www.linkedin.com/in/shadman-khan-khattak",
};

export const stats = [
  { value: "4+", label: "Years in game development" },
  { value: "50M+", label: "Downloads on Prado Parking" },
  { value: "0.24%", label: "ANR rate, down from 0.45%" },
  { value: "~5x", label: "Fewer draw calls (450 → 90)" },
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
      "Solo-built and shipped an original FPS: combat, upgrades and loot end to end, backed by a Firebase backend for player data and live config.",
    platforms: ["Android", "iOS"],
    playStore: playStore("com.fg.fps.commando.shooting.game.action.games"),
  },
  {
    title: "Prado Car Parking",
    genre: "Simulation",
    badge: "50M+ downloads",
    image: pradoParking,
    description:
      "Optimized runtime performance, cut ANR to ~0.24% and improved retention through gameplay polish and stability fixes.",
    platforms: ["Android", "iOS"],
    playStore: playStore("com.ghive.jeep.parking.car.free.game.master.apps"),
  },
  {
    title: "Rider 3D",
    genre: "Racing",
    image: rider3D,
    description:
      "Engineered UI systems, upgrade mechanics and an offline economy, keeping crash rate below 1% across releases.",
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
      "High-speed circuits and sharp turns in an adrenaline-fuelled bike racer.",
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
      "Offline chase racing with upgradeable turbo cars, boosters and obstacles.",
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
    role: "Unity Game Developer",
    company: "Terafort",
    period: "2021 – Present",
    points: [
      "Built a Unity MCP integration connecting the live project to AI agents for editor automation (asset ops, scene edits, scripted tasks), cutting repetitive manual dev work.",
      "Cut draw calls from ~450 to ~200 across titles (as low as ~90 on some) by combining meshes, atlasing textures and tuning the far clip plane, profiled on-device with Graphy.",
      "Reduced memory on low-end Android (2–3 GB) through asset and texture compression, eliminating OOM crashes.",
      "Engineered Photon PUN multiplayer: matchmaking, room creation and RPC-based state sync.",
      "Ported multiple Android titles to iOS end to end, from platform-specific fixes and code signing to App Store submission and release.",
      "Cut ANR from ~0.45% to ~0.24% (crash rate under 1%) by moving ad and scene loading off the main thread and pooling objects; integrated AdMob, Unity Ads and AppLovin.",
    ],
  },
  {
    role: "System Engineer",
    company: "ZMectr",
    period: "2020 – 2021",
    points: [
      "Designed and deployed IoT systems at 99% uptime, cutting production incidents 25% through proactive monitoring and root-cause analysis.",
    ],
  },
];

export const education = {
  degree: "B.Sc. Computer Science",
  school: "Northern University Nowshera",
  period: "2017 – 2021",
};

export const skills = [
  {
    group: "Core",
    items: [
      "Unity (C#)",
      "Unreal Engine",
      "C++",
      "JavaScript",
      "Python",
      "Performance optimization",
      "Photon",
      "PlayFab",
    ],
  },
  {
    group: "Technical",
    items: [
      "Firebase",
      "iOS porting",
      "App Store release",
      "AdMob",
      "Unity Ads",
      "AppLovin",
    ],
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
    items: ["Git", "Bitbucket", "Agile", "Unity Profiler", "Graphy", "Xcode"],
  },
  {
    group: "AI-assisted",
    items: ["Unity MCP + AI agents", "Cursor", "Claude", "ChatGPT"],
  },
];
