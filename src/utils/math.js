import { TEAMS } from "../constants";

// Parse overs format (e.g., "18.3" -> 18 + 3/6)
export function parseOvers(ov) {
  const s = String(ov);
  const [full, balls = "0"] = s.split(".");
  return parseInt(full || 0) + parseInt(balls) / 6;
}

// Compute standings for all teams
export function computeStandings(fixtures) {
  const s = {};
  TEAMS.forEach((t) => {
    s[t.id] = {
      wins: 0,
      losses: 0,
      nrs: 0,
      played: 0,
      points: 0,
      runsFor: 0,
      oversFor: 0,
      runsAgainst: 0,
      oversAgainst: 0,
      streak: [],
    };
  });
  // Process in match id order for streak accuracy
  [...fixtures]
    .sort((a, b) => a.id - b.id)
    .forEach((f) => {
      if (!f.result) return;
      if (f.result.type === "nr") {
        s[f.a].nrs++;
        s[f.a].played++;
        s[f.a].points++;
        s[f.a].streak.push("NR");
        s[f.b].nrs++;
        s[f.b].played++;
        s[f.b].points++;
        s[f.b].streak.push("NR");
        return;
      }
      const { winner, scoreA, scoreB } = f.result;
      const loser = winner === f.a ? f.b : f.a;
      s[winner].wins++;
      s[winner].played++;
      s[winner].points += 2;
      s[winner].streak.push("W");
      s[loser].losses++;
      s[loser].played++;
      s[loser].streak.push("L");
      const rA = Number(scoreA?.runs || 0),
        ovA = parseOvers(scoreA?.overs || 0);
      const rB = Number(scoreB?.runs || 0),
        ovB = parseOvers(scoreB?.overs || 0);
      if (ovA > 0 && ovB > 0) {
        s[f.a].runsFor += rA;
        s[f.a].oversFor += ovA;
        s[f.a].runsAgainst += rB;
        s[f.a].oversAgainst += ovB;
        s[f.b].runsFor += rB;
        s[f.b].oversFor += ovB;
        s[f.b].runsAgainst += rA;
        s[f.b].oversAgainst += ovA;
      }
    });
  Object.keys(s).forEach((tid) => {
    const t = s[tid];
    t.nrr =
      (t.oversFor > 0 ? t.runsFor / t.oversFor : 0) -
      (t.oversAgainst > 0 ? t.runsAgainst / t.oversAgainst : 0);
    // Current streak = last consecutive identical results
    const arr = t.streak;
    if (arr.length === 0) {
      t.currentStreak = { type: "", count: 0 };
      return;
    }
    const last = arr[arr.length - 1];
    let count = 0;
    for (let i = arr.length - 1; i >= 0 && arr[i] === last; i--) count++;
    t.currentStreak = { type: last, count };
  });
  return s;
}

// Compute points progression for chart
export function computePointsProgression(fixtures) {
  const sorted = [...fixtures]
    .sort((a, b) => a.id - b.id)
    .filter((f) => f.result);
  const snapshots = [];
  const pts = {};
  TEAMS.forEach((t) => {
    pts[t.id] = 0;
  });
  // initial
  snapshots.push({ matchId: 0, date: "Start", points: { ...pts } });
  sorted.forEach((f) => {
    if (f.result.type === "nr") {
      pts[f.a]++;
      pts[f.b]++;
    } else {
      pts[f.result.winner] += 2;
    }
    snapshots.push({ matchId: f.id, date: f.date, points: { ...pts } });
  });
  return snapshots;
}

// Edmonds-Karp max flow algorithm
export function maxFlowEK(cap, source, sink, n) {
  const res = cap.map((r) => r.slice());
  let flow = 0;
  while (true) {
    const parent = new Array(n).fill(-1);
    parent[source] = source;
    const q = [source];
    for (let qi = 0; qi < q.length && parent[sink] < 0; qi++) {
      const u = q[qi];
      for (let v = 0; v < n; v++) {
        if (parent[v] < 0 && res[u][v] > 0) {
          parent[v] = u;
          q.push(v);
        }
      }
    }
    if (parent[sink] < 0) break;
    let aug = Infinity;
    for (let v = sink; v !== source; ) {
      const u = parent[v];
      aug = Math.min(aug, res[u][v]);
      v = u;
    }
    for (let v = sink; v !== source; ) {
      const u = parent[v];
      res[u][v] -= aug;
      res[v][u] += aug;
      v = u;
    }
    flow += aug;
  }
  return flow;
}

// Generate combinations
export function combinations(arr, k) {
  const res = [];
  function go(s, cur) {
    if (cur.length === k) {
      res.push([...cur]);
      return;
    }
    for (let i = s; i <= arr.length - (k - cur.length); i++) {
      cur.push(arr[i]);
      go(i + 1, cur);
      cur.pop();
    }
  }
  go(0, []);
  return res;
}

// Check if 4 or more teams can exceed a threshold
export function canFourTeamsExceed(teamId, threshold, fixtures, standings) {
  const others = TEAMS.map((t) => t.id).filter((id) => id !== teamId);
  const remMatches = fixtures.filter(
    (f) => !f.result && f.a !== teamId && f.b !== teamId,
  );
  const M = remMatches.length;
  const needs = {},
    maxPoss = {};
  others.forEach((tid) => {
    const w = standings[tid]?.wins || 0;
    needs[tid] = Math.max(0, threshold - w);
    const tr = fixtures.filter(
      (f) => !f.result && (f.a === tid || f.b === tid),
    ).length;
    maxPoss[tid] = w + tr;
  });
  const viable = others.filter((tid) => maxPoss[tid] >= threshold);
  if (viable.length < 4) return false;
  const SRC = 0,
    SINK = M + others.length + 1,
    NN = SINK + 1;
  const tIdx = {};
  others.forEach((tid, i) => {
    tIdx[tid] = M + 1 + i;
  });
  const base = Array.from({ length: NN }, () => new Array(NN).fill(0));
  remMatches.forEach((m, i) => {
    base[SRC][i + 1] = 1;
    if (tIdx[m.a] !== undefined) base[i + 1][tIdx[m.a]] = 1;
    if (tIdx[m.b] !== undefined) base[i + 1][tIdx[m.b]] = 1;
  });
  for (const subset of combinations(viable, 4)) {
    const required = subset.reduce((s, tid) => s + needs[tid], 0);
    if (required === 0) return true;
    const cap = base.map((r) => r.slice());
    subset.forEach((tid) => {
      cap[tIdx[tid]][SINK] = needs[tid];
    });
    if (maxFlowEK(cap, SRC, SINK, NN) >= required) return true;
  }
  return false;
}

// Compute qualification for specific team
export function computeQualification(teamId, fixtures, standings) {
  const w = standings[teamId]?.wins || 0;
  const rem = fixtures.filter(
    (f) => !f.result && (f.a === teamId || f.b === teamId),
  ).length;
  if (!canFourTeamsExceed(teamId, w + 1, fixtures, standings))
    return {
      currentWins: w,
      remaining: rem,
      minAdditionalWins: 0,
      alreadyGuaranteed: true,
      impossible: false,
    };
  for (let k = 1; k <= rem; k++) {
    if (!canFourTeamsExceed(teamId, w + k + 1, fixtures, standings))
      return {
        currentWins: w,
        remaining: rem,
        minAdditionalWins: k,
        alreadyGuaranteed: false,
        impossible: false,
      };
  }
  return {
    currentWins: w,
    remaining: rem,
    minAdditionalWins: null,
    alreadyGuaranteed: false,
    impossible: true,
  };
}

// Find critical matches for a team
export function findCriticalMatches(teamId, fixtures) {
  const critical = [];
  const unplayed = fixtures.filter(
    (f) => !f.result && (f.a === teamId || f.b === teamId),
  );
  for (const match of unplayed) {
    const rival = match.a === teamId ? match.b : match.a;
    const blank = { runs: "", wickets: "", overs: "" };
    const fWin = fixtures.map((f) =>
      f.id === match.id
        ? {
            ...f,
            result: {
              type: "win",
              winner: teamId,
              scoreA: blank,
              scoreB: blank,
            },
          }
        : f,
    );
    const sWin = computeStandings(fWin);
    const qWin = computeQualification(teamId, fWin, sWin);
    const fLoss = fixtures.map((f) =>
      f.id === match.id
        ? {
            ...f,
            result: {
              type: "win",
              winner: rival,
              scoreA: blank,
              scoreB: blank,
            },
          }
        : f,
    );
    const sLoss = computeStandings(fLoss);
    const qLoss = computeQualification(teamId, fLoss, sLoss);
    const wWin = qWin.alreadyGuaranteed
      ? 0
      : qWin.impossible
        ? 99
        : qWin.minAdditionalWins;
    const wLoss = qLoss.alreadyGuaranteed
      ? 0
      : qLoss.impossible
        ? 99
        : qLoss.minAdditionalWins;
    const impact = wLoss - wWin;
    if (impact !== 0 || wWin === 0 || wLoss === 99)
      critical.push({ match, rival, impact, wWin, wLoss });
  }
  return critical.sort((a, b) => b.impact - a.impact).slice(0, 6);
}

// Generate all scenarios where team can qualify (excluding their own matches)
export function generateQualificationScenarios(teamId, fixtures) {
  const blank = { runs: "", wickets: "", overs: "" };
  // Find unplayed matches not involving the selected team (rival matches)
  const rivalMatches = fixtures.filter(
    (f) => !f.result && f.a !== teamId && f.b !== teamId,
  );

  console.log(
    `[Scenarios] Team: ${teamId}, Rival matches: ${rivalMatches.length}, Unplayed total: ${fixtures.filter((f) => !f.result).length}`,
  );

  if (rivalMatches.length === 0) {
    console.log(`[Scenarios] No rival matches - returning empty`);
    return [];
  }
  if (rivalMatches.length > 16) {
    // Limit to prevent exponential explosion (2^16 = 65k scenarios)
    console.log(
      `[Scenarios] Too many rival matches (${rivalMatches.length}) - returning empty`,
    );
    return [];
  }

  const scenarios = [];

  // Generate all possible combinations of results (2^n)
  const totalCombos = Math.pow(2, rivalMatches.length);
  for (let combo = 0; combo < totalCombos; combo++) {
    // Apply this combination of results
    const scenarioFixtures = fixtures.map((f) => {
      const matchIdx = rivalMatches.findIndex((rm) => rm.id === f.id);
      if (matchIdx === -1) return f; // Not a rival match, keep as is

      // Check if this combo has this match going to team A or team B
      const bitSet = (combo >> matchIdx) & 1;
      const winner = bitSet === 0 ? f.a : f.b;
      return {
        ...f,
        result: {
          type: "win",
          winner,
          scoreA:
            winner === f.a
              ? { runs: "150", wickets: "8", overs: "20" }
              : { runs: "140", wickets: "9", overs: "19.4" },
          scoreB:
            winner === f.b
              ? { runs: "150", wickets: "8", overs: "20" }
              : { runs: "140", wickets: "9", overs: "19.4" },
        },
      };
    });

    // Check standings and qualification
    const standings = computeStandings(scenarioFixtures);
    const ranked = [...TEAMS].sort((a, b) => {
      const sa = standings[a.id],
        sb = standings[b.id];
      if (sb.points !== sa.points) return sb.points - sa.points;
      return (sb.nrr || 0) - (sa.nrr || 0);
    });

    const qualifyRank = ranked.findIndex((t) => t.id === teamId) + 1;

    // Only add if team qualifies (Top 4)
    if (qualifyRank <= 4) {
      // Build scenario object showing which matches were flipped
      const results = {};
      rivalMatches.forEach((match, idx) => {
        const bitSet = (combo >> idx) & 1;
        results[match.id] = bitSet === 0 ? match.a : match.b;
      });

      scenarios.push({
        rank: qualifyRank,
        standings,
        results, // { matchId: winner }
        teamRank: qualifyRank,
      });
    }
  }

  console.log(
    `[Scenarios] Tested ${totalCombos} combinations, found ${scenarios.length} qualifying scenarios`,
  );
  return scenarios;
}
