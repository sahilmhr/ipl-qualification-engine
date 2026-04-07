export const TEAMS = [
  {
    id: "CSK",
    name: "Chennai Super Kings",
    short: "CSK",
    color: "#D97706",
    jersey: "🟡",
  },
  {
    id: "DC",
    name: "Delhi Capitals",
    short: "DC",
    color: "#2563EB",
    jersey: "🔵",
  },
  {
    id: "GT",
    name: "Gujarat Titans",
    short: "GT",
    color: "#16A34A",
    jersey: "🟢",
  },
  {
    id: "KKR",
    name: "Kolkata Knight Riders",
    short: "KKR",
    color: "#7C3AED",
    jersey: "🟣",
  },
  {
    id: "LSG",
    name: "Lucknow Super Giants",
    short: "LSG",
    color: "#0EA5E9",
    jersey: "🩵",
  },
  {
    id: "MI",
    name: "Mumbai Indians",
    short: "MI",
    color: "#1D4ED8",
    jersey: "🔵",
  },
  {
    id: "PBKS",
    name: "Punjab Kings",
    short: "PBKS",
    color: "#DC2626",
    jersey: "🔴",
  },
  {
    id: "RR",
    name: "Rajasthan Royals",
    short: "RR",
    color: "#C026D3",
    jersey: "🟣",
  },
  {
    id: "RCB",
    name: "Royal Challengers Bengaluru",
    short: "RCB",
    color: "#EC1C24",
    jersey: "🔴",
  },
  {
    id: "SRH",
    name: "Sunrisers Hyderabad",
    short: "SRH",
    color: "#EA580C",
    jersey: "🟠",
  },
];

export const teamMap = Object.fromEntries(TEAMS.map((t) => [t.id, t]));
