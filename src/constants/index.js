// Teams data
export const TEAMS = [
  { id: "DC", name: "Delhi Capitals", short: "DC", color: "#2563EB" },
  { id: "CSK", name: "Chennai Super Kings", short: "CSK", color: "#D97706" },
  { id: "GT", name: "Gujarat Titans", short: "GT", color: "#16A34A" },
  { id: "MI", name: "Mumbai Indians", short: "MI", color: "#1D4ED8" },
  { id: "KKR", name: "Kolkata Knight Riders", short: "KKR", color: "#7C3AED" },
  { id: "LSG", name: "Lucknow Super Giants", short: "LSG", color: "#0EA5E9" },
  { id: "PBKS", name: "Punjab Kings", short: "PBKS", color: "#DC2626" },
  { id: "RR", name: "Rajasthan Royals", short: "RR", color: "#BE185D" },
  {
    id: "RCB",
    name: "Royal Challengers Bengaluru",
    short: "RCB",
    color: "#EC1C24",
  },
  { id: "SRH", name: "Sunrisers Hyderabad", short: "SRH", color: "#EA580C" },
];

// Raw fixture schedule
export const RAW = [
  [1, "RCB", "SRH", "28 Mar"],
  [2, "MI", "KKR", "29 Mar"],
  [3, "RR", "CSK", "30 Mar"],
  [4, "PBKS", "GT", "31 Mar"],
  [5, "LSG", "DC", "1 Apr"],
  [6, "KKR", "SRH", "2 Apr"],
  [7, "CSK", "PBKS", "3 Apr"],
  [8, "DC", "MI", "4 Apr"],
  [9, "GT", "RR", "4 Apr"],
  [10, "SRH", "LSG", "5 Apr"],
  [11, "RCB", "CSK", "5 Apr"],
  [12, "KKR", "PBKS", "6 Apr"],
  [13, "RR", "MI", "7 Apr"],
  [14, "DC", "GT", "8 Apr"],
  [15, "KKR", "LSG", "9 Apr"],
  [16, "RR", "RCB", "10 Apr"],
  [17, "PBKS", "SRH", "11 Apr"],
  [18, "CSK", "DC", "11 Apr"],
  [19, "LSG", "GT", "12 Apr"],
  [20, "MI", "RCB", "12 Apr"],
  [21, "SRH", "RR", "13 Apr"],
  [22, "CSK", "KKR", "14 Apr"],
  [23, "RCB", "LSG", "15 Apr"],
  [24, "MI", "PBKS", "16 Apr"],
  [25, "GT", "KKR", "17 Apr"],
  [26, "RCB", "DC", "18 Apr"],
  [27, "SRH", "CSK", "18 Apr"],
  [28, "KKR", "RR", "19 Apr"],
  [29, "PBKS", "LSG", "19 Apr"],
  [30, "GT", "MI", "20 Apr"],
  [31, "SRH", "DC", "21 Apr"],
  [32, "LSG", "RR", "22 Apr"],
  [33, "MI", "CSK", "23 Apr"],
  [34, "RCB", "GT", "24 Apr"],
  [35, "DC", "PBKS", "25 Apr"],
  [36, "RR", "SRH", "25 Apr"],
  [37, "CSK", "GT", "26 Apr"],
  [38, "LSG", "KKR", "26 Apr"],
  [39, "DC", "RCB", "27 Apr"],
  [40, "PBKS", "RR", "28 Apr"],
  [41, "MI", "SRH", "29 Apr"],
  [42, "GT", "RCB", "30 Apr"],
  [43, "RR", "DC", "1 May"],
  [44, "CSK", "MI", "2 May"],
  [45, "SRH", "KKR", "3 May"],
  [46, "GT", "PBKS", "3 May"],
  [47, "MI", "LSG", "4 May"],
  [48, "DC", "CSK", "5 May"],
  [49, "SRH", "PBKS", "6 May"],
  [50, "LSG", "RCB", "7 May"],
  [51, "DC", "KKR", "8 May"],
  [52, "RR", "GT", "9 May"],
  [53, "CSK", "LSG", "10 May"],
  [54, "RCB", "MI", "10 May"],
  [55, "PBKS", "DC", "11 May"],
  [56, "GT", "SRH", "12 May"],
  [57, "RCB", "KKR", "13 May"],
  [58, "PBKS", "MI", "14 May"],
  [59, "LSG", "CSK", "15 May"],
  [60, "KKR", "GT", "16 May"],
  [61, "PBKS", "RCB", "17 May"],
  [62, "DC", "RR", "17 May"],
  [63, "CSK", "SRH", "18 May"],
  [64, "RR", "LSG", "19 May"],
  [65, "KKR", "MI", "20 May"],
  [66, "GT", "CSK", "21 May"],
  [67, "SRH", "RCB", "22 May"],
  [68, "LSG", "PBKS", "23 May"],
  [69, "MI", "RR", "24 May"],
  [70, "KKR", "DC", "24 May"],
];

// Create team map for quick lookups
export const teamMap = Object.fromEntries(TEAMS.map((t) => [t.id, t]));

// UI constants
export const TABS = [
  "Standings",
  "Fixtures",
  "Qualify",
  "Race",
  "Scenarios",
  "Simulator",
  "H2H",
  "Timelapse",
  "Surpass",
];

// Color constants for UI
export const COLORS = {
  primary: "#EA580C", // Orange
  secondary: "#FBBF24", // Yellow
  success: "#22c55e", // Green
  error: "#ef4444", // Red
  grey: "#94a3b8",
  darkBg: "#080808",
};

// Defaults
export const DEFAULT_TEAM = "DC";
export const TOTAL_MATCHES = 70;
export const MATCHES_PER_TEAM = 14;
export const PLAYOFF_SLOTS = 4;
export const LS_KEY = "fixtures";
