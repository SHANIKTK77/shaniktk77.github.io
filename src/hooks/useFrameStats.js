import { useEffect, useState } from "react";
import { latestStats, subscribeStats } from "../gl/stats";

// Live frame numbers from the WebGL scene, or null while it hasn't drawn (or can't).
export default function useFrameStats() {
  const [stats, setStats] = useState(latestStats);
  useEffect(() => subscribeStats(setStats), []);
  return stats;
}
