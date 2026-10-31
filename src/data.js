import rider3D from "./Assets/Projects/Rider.jpg";
import csm from "./Assets/Projects/csm.jpg";
import kungFu from "./Assets/Projects/Kung FU.jpg";
import pradoParking from "./Assets/Projects/prado.jpg";
import mcr from "./Assets/Projects/MCR.jpg";
import motoMax from "./Assets/Projects/motomax.jpg";
import offroadJeep from "./Assets/Projects/offroadjeep.jpg";
import gunGames from "./Assets/Projects/gungames.jpg";
import bikeMaster from "./Assets/Projects/bikemaster.jpg";
import crazyCar from "./Assets/Projects/crazycar.jpg";
import carWash from "./Assets/Projects/carwash.jpg";

const playStore = (id) =>
  `https://play.google.com/store/apps/details?id=${id}&hl=en`;

export const profile = {
  name: "Shadman Khan Khattak",
  role: "Senior Unity Developer",
  focus: ["Performance optimization", "Cross-platform porting", "Multiplayer"],
  location: "Nowshera, Pakistan",
  timeZone: "Asia/Karachi",
  utcOffset: "UTC+5",
  status: "Available for remote and contract work",
  email: "shani.ktk77@gmail.com",
  phone: "+92 311 9029334",
  availability:
    "Available for remote roles and contract work. Based in Pakistan (UTC+5), with good overlap with UK, EU and Gulf teams.",
  github: "https://github.com/shaniktk77",
  linkedin: "https://www.linkedin.com/in/shadman-khan-khattak-b6b834163/",
};

// `before`/`after` are the same numbers as in the label, used to draw the comparison bars
export const stats = [
  { value: "325M+", label: "Combined downloads on games I've worked on" },
  { value: "0.24%", label: "ANR rate, down from 0.45%", name: "ANR rate", before: 0.45, after: 0.24, unit: "%" },
  { value: "~5x", label: "Fewer draw calls (450 → 90)", name: "Draw calls", before: 450, after: 90, unit: "", note: "Best case. Most titles went from ~450 to ~200." },
  { value: "5+", label: "Years making games" },
];

// Ordered by Google Play downloads. Add an `appStore` URL to any game to show an App Store link.
// `personal` marks a game I built on my own
export const games = [
  {
    title: "Prado Car Parking",
    genre: "Simulation",
    badge: "100M+ downloads",
    image: pradoParking,
    description:
      "Listed on Google Play as Car Games - Car Parking Games. I tuned its performance, cut ANR from 0.45% to 0.24% and polished the core gameplay.",
    platforms: ["Android", "iOS"],
    playStore: playStore("com.ghive.jeep.parking.car.free.game.master.apps"),
  },
  {
    title: "Kung Fu Karate",
    genre: "Fighting",
    badge: "100M+ downloads",
    image: kungFu,
    platforms: ["Android", "iOS"],
    playStore: playStore("com.gzl.superhero.karatefighting.game"),
  },
  {
    title: "Gun Games 3D",
    genre: "Shooter",
    badge: "50M+ downloads",
    image: gunGames,
    platforms: ["Android"],
    playStore: playStore("com.lf.frontline.elite.war.free.apps"),
  },
  {
    title: "Crazy Car Racing",
    genre: "Racing",
    badge: "50M+ downloads",
    image: crazyCar,
    platforms: ["Android"],
    playStore: playStore("com.fungames.highway.traffic.race"),
  },
  {
    title: "MRM Bike Racing",
    genre: "Racing",
    badge: "10M+ downloads",
    image: motoMax,
    description: "Formerly Moto Max.",
    platforms: ["Android", "iOS"],
    playStore: playStore(
      "com.offline.racing.motorcyclegame.motomax.bikerace.bike.games"
    ),
  },
  {
    title: "Offroad Car Parking",
    genre: "Simulation",
    badge: "10M+ downloads",
    image: offroadJeep,
    platforms: ["Android"],
    playStore: playStore("com.doit.fun.games.offroad.rally.truck.apps"),
  },
  {
    title: "Rider 3D",
    genre: "Racing",
    badge: "5M+ downloads",
    image: rider3D,
    description:
      "I built the UI, the upgrade system and the offline economy, and kept crashes under 1% on every release.",
    platforms: ["Android", "iOS"],
    playStore: playStore(
      "com.ffgames.motoercycle.traffic.racer.bikegames.rider.motobikeracing3d"
    ),
  },
  {
    title: "Mini Car Runner",
    genre: "Endless runner",
    badge: "1M+ downloads",
    image: mcr,
    description: "Formerly Mini Car Rush.",
    platforms: ["Android", "iOS"],
    playStore: playStore("com.tb.minicar.rush.racing.drivinggames"),
  },
  {
    title: "Bike Racing Master",
    genre: "Racing",
    badge: "500K+ downloads",
    image: bikeMaster,
    platforms: ["Android"],
    playStore: playStore("com.tf.ride.master.bike.race.game"),
  },
  {
    title: "Car Wash: Makeover ASMR",
    genre: "Simulation",
    badge: "100K+ downloads",
    image: carWash,
    platforms: ["Android"],
    playStore: playStore("com.car.wash.asmr.makeover.game"),
  },
  {
    title: "Commando Shooting Stars",
    genre: "FPS",
    badge: "Personal project",
    personal: true,
    image: csm,
    description:
      "My own personal project, built solo from the ground up. I made the shooting, weapon upgrades and loot, plus the Firebase backend behind player data and live config.",
    platforms: ["Android", "iOS"],
    playStore: playStore("com.fg.fps.commando.shooting.game.action.games"),
  },
];

export const experience = [
  {
    role: "Senior Game Developer",
    company: "Terafort · Remote",
    period: "Oct 2022 – Present",
    summary:
      "I take games from prototype to release on every platform they ship to, then make sure they run smoothly everywhere, right down to low-end devices. Worked on titles with 325M+ combined downloads.",
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
    role: "Unity Developer",
    company: "Spartans Global Pvt Ltd. · Islamabad",
    period: "Jul 2021 – Oct 2022",
    track: ["Intern", "Trainee", "Junior Unity Developer", "Unity Developer"],
    summary:
      "Where I went from intern to Unity Developer, building and shipping mobile games in Unity and C#.",
  },
  {
    role: "System Engineer",
    company: "ZMectr",
    period: "2020 – 2021",
    summary:
      "Before games, I designed and ran IoT systems. I kept them up 99% of the time and cut production incidents by 25% by catching problems early and fixing their root causes.",
  },
];

// One-line summary shown under the Experience heading
export const experienceIntro = "Five years in games, after a year running IoT systems.";

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
