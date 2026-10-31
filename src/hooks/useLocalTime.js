import { useEffect, useState } from "react";

// The current time in a given IANA time zone, e.g. "14:05". Updates every 30 seconds.
// Lets a visitor see at a glance whether it's working hours where I am.
export default function useLocalTime(timeZone) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
    }).format(now);
  } catch {
    return null;
  }
}
