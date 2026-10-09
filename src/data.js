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
  location: "Nowshera, Pakistan",
  github: "https://github.com/shaniktk77",
  linkedin: "https://www.linkedin.com/in/shadman-khan-khattak-b6b834163/",
};

export const stats = [
  { value: "3+", label: "Years shipping games" },
  { value: "8", label: "Games on Google Play" },
  { value: "<0.45%", label: "ANR rate achieved" },
  { value: "<1%", label: "Crash rate achieved" },
];

export const games = [
  {
    title: "Rider 3D",
    genre: "Racing",
    image: rider3D,
    description:
      "Highway bike racing built around speed, traffic dodging and tight controls.",
    link: playStore(
      "com.ffgames.motoercycle.traffic.racer.bikegames.rider.motobikeracing3d"
    ),
  },
  {
    title: "Moto Max",
    genre: "Racing",
    image: motoMax,
    description:
      "High-speed circuits and sharp turns in an adrenaline-fuelled bike racer.",
    link: playStore(
      "com.offline.racing.motorcyclegame.motomax.bikerace.bike.games"
    ),
  },
  {
    title: "Commando Shooting Stars",
    genre: "FPS",
    image: csm,
    description:
      "Counter-terrorism missions that test aim and marksmanship across hostile maps.",
    link: playStore("com.fg.fps.commando.shooting.game.action.games"),
  },
  {
    title: "Mini Car Rush",
    genre: "Endless runner",
    image: mcr,
    description:
      "Offline chase racing with upgradeable turbo cars, boosters and obstacles.",
    link: playStore("com.tb.minicar.rush.racing.drivinggames"),
  },
  {
    title: "Kung Fu Fighting",
    genre: "Fighting",
    image: kungFu,
    description:
      "3D martial arts brawler with non-stop action and arena progression.",
    link: playStore("com.gzl.superhero.karatefighting.game"),
  },
  {
    title: "Prado Car Parking",
    genre: "Simulation",
    image: pradoParking,
    description:
      "Parking missions and driving challenges with daily achievement rewards.",
    link: playStore("com.ghive.jeep.parking.car.free.game.master.apps"),
  },
  {
    title: "GT Car Stunt",
    genre: "Stunt racing",
    image: rampStunt,
    description:
      "Ramp stunts with smooth, realistic car handling on mobile.",
    link: playStore("com.car.stunt.driving.cargames.offline.ramp.racing"),
  },
  {
    title: "Off Road Jeep Parking",
    genre: "Simulation",
    image: offroadJeep,
    description:
      "4x4 off-road driving, parking and cargo transport across mountain tracks.",
    link: playStore("com.doit.fun.games.offroad.rally.truck.apps"),
  },
];

export const experience = [
  {
    role: "Game Developer",
    company: "Terafort",
    period: "3+ years · Current",
    points: [
      "Build scalable prototypes and gameplay mechanics across FPS, TPS and simulation genres.",
      "Fix critical crashes and ANRs, keeping ANR rates below 0.45% and crash rates below 1%.",
      "Integrate ad mediation, analytics and backend services into live games.",
    ],
  },
  {
    role: "System Engineer",
    company: "ZMectr SMC Pvt Ltd",
    period: "1 year",
    points: [
      "Designed IoT hardware systems for home automation, wearables and environmental monitoring.",
    ],
  },
];

export const skills = [
  { group: "Engines", items: ["Unity", "Unreal Engine"] },
  { group: "Languages", items: ["C#", "C++", "Java", "JavaScript", "Python"] },
  {
    group: "SDKs",
    items: [
      "Google AdMob",
      "AppLovin MAX",
      "Unity Ads",
      "Chartboost",
      "Firebase",
      "AWS + Laravel APIs",
    ],
  },
  {
    group: "Tools",
    items: ["Git", "Visual Studio", "VS Code", "Postman", "Jira", "Trello", "ClickUp"],
  },
];
