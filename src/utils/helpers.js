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

// Generate test data for first 40 matches (for testing scenarios feature)
export function generateTestResults(fixtures) {
  const blank = { runs: "", wickets: "", overs: "" };

  // Create balanced results: seed determines winning team
  // More balanced to create competitive standings
  const getWinner = (matchId, teamA, teamB) => {
    const seed =
      matchId * 11 + teamA.charCodeAt(0) * 3 + teamB.charCodeAt(1) * 7;
    return seed % 3 === 0 ? teamA : teamB; // 33% vs 67% split for variety
  };

  return fixtures.map((f) => {
    // Only populate results for first 40 matches
    if (f.id > 40) return f;
    if (f.result) return f; // Don't override existing results

    const winner = getWinner(f.id, f.a, f.b);

    return {
      ...f,
      result: {
        type: "win",
        winner,
        scoreA:
          winner === f.a
            ? { runs: "155", wickets: "6", overs: "19.2" }
            : { runs: "145", wickets: "8", overs: "20" },
        scoreB:
          winner === f.b
            ? { runs: "155", wickets: "6", overs: "19.2" }
            : { runs: "145", wickets: "8", overs: "20" },
      },
    };
  });
}
