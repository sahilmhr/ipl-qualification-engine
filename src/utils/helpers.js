// Formatting helpers
export const fmtNRR = (n) => {
  if (n === undefined || n === null || isNaN(n)) return "+0.000";
  return (n >= 0 ? "+" : "") + n.toFixed(3);
};

export const fmtScore = (sc) => {
  if (!sc || !sc.runs) return "—";
  return `${sc.runs}/${sc.wickets || 0} (${sc.overs || 0})`;
};

// Scenario helpers
export function applyScenario(fixtures, scenario) {
  return fixtures.map((f) => {
    if (f.result) return f;
    const sc = scenario[f.id];
    return sc ? { ...f, result: sc } : f;
  });
}

// Auto-fill: set all unplayed matches involving team to team win, all others random-ish (first team)
export function buildBestScenario(teamId, fixtures) {
  const sc = {};
  const blank = { runs: "", wickets: "", overs: "" };
  fixtures
    .filter((f) => !f.result)
    .forEach((f) => {
      if (f.a === teamId || f.b === teamId) {
        sc[f.id] = {
          type: "win",
          winner: teamId,
          scoreA: blank,
          scoreB: blank,
        };
      }
    });
  return sc;
}

// Export standings as formatted text
export function exportStandingsText(rankedTeams, standings, fmtNRR) {
  const header =
    "# IPL 2026 Standings\n" + new Date().toLocaleDateString("en-IN") + "\n\n";
  const cols = "#  Team         Pts  W  L NR   NRR\n" + "─".repeat(38) + "\n";
  const rows = rankedTeams
    .map((t, i) => {
      const s = standings[t.id];
      return `${String(i + 1).padStart(2)}. ${t.short.padEnd(5)} ${String(s.points).padStart(3)}  ${s.wins}  ${s.losses}  ${s.nrs}  ${fmtNRR(s.nrr)}`;
    })
    .join("\n");
  return header + cols + rows;
}
