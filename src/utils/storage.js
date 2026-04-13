import { RAW, TEAMS, LS_KEY } from "../constants";

// Build fresh fixture list
export function buildFixtures() {
  return RAW.map(([id, a, b, date]) => ({
    id,
    a,
    b,
    date,
    result: null,
    scoreA: { runs: "", wickets: "", overs: "" },
    scoreB: { runs: "", wickets: "", overs: "" },
    batFirst: null,
  }));
}

// Load fixtures from localStorage
export function loadFixtures() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return buildFixtures();
    const saved = JSON.parse(raw);
    // Merge saved results onto fresh fixture list (preserves schedule order)
    const base = buildFixtures();
    const savedMap = Object.fromEntries(saved.map((f) => [f.id, f]));
    return base.map((f) =>
      savedMap[f.id]
        ? {
            ...f,
            result: savedMap[f.id].result,
            scoreA: savedMap[f.id].scoreA || f.scoreA,
            scoreB: savedMap[f.id].scoreB || f.scoreB,
            batFirst: savedMap[f.id].batFirst ?? f.batFirst,
          }
        : f,
    );
  } catch {
    return buildFixtures();
  }
}

// Save fixtures to localStorage
export function saveFixtures(fixtures) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(fixtures));
  } catch {
    console.error("Failed to save fixtures to localStorage");
  }
}
