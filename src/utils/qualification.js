import { TEAMS } from "../data/teams";

export function parseOvers(ov) {
  const s = String(ov);
  const [full, balls = "0"] = s.split(".");
  return parseInt(full || 0) + parseInt(balls) / 6;
}

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
    };
  });

  fixtures.forEach((f) => {
    if (!f.result) return;
    if (f.result.type === "nr") {
      s[f.a].nrs++;
      s[f.a].played++;
      s[f.a].points++;
      s[f.b].nrs++;
      s[f.b].played++;
      s[f.b].points++;
      return;
    }

    const { winner, scoreA, scoreB } = f.result;
    const loser = winner === f.a ? f.b : f.a;
    s[winner].wins++;
    s[winner].played++;
    s[winner].points += 2;
    s[loser].losses++;
    s[loser].played++;

    const rA = Number(scoreA.runs),
      ovA = parseOvers(scoreA.overs),
      rB = Number(scoreB.runs),
      ovB = parseOvers(scoreB.overs);

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
  });

  return s;
}

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

export function applyScenario(fixtures, scenario) {
  return fixtures.map((f) => {
    if (f.result || !scenario[f.id]) return f;
    return { ...f, result: scenario[f.id] };
  });
}

export function findCriticalMatches(teamId, fixtures) {
  const critical = [];
  const unplayed = fixtures.filter((f) => !f.result);

  for (const match of unplayed) {
    const involvesTeam = match.a === teamId || match.b === teamId;
    const rival = involvesTeam
      ? match.a === teamId
        ? match.b
        : match.a
      : null;

    if (!involvesTeam) continue;

    const fWin = fixtures.map((f) =>
      f.id === match.id
        ? {
            ...f,
            result: {
              type: "win",
              winner: teamId,
              scoreA: { runs: "", wickets: "", overs: "" },
              scoreB: { runs: "", wickets: "", overs: "" },
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
              scoreA: { runs: "", wickets: "", overs: "" },
              scoreB: { runs: "", wickets: "", overs: "" },
            },
          }
        : f,
    );
    const sLoss = computeStandings(fLoss);
    const qLoss = computeQualification(teamId, fLoss, sLoss);

    const winsNeededWin = qWin.alreadyGuaranteed
      ? 0
      : qWin.impossible
        ? 99
        : qWin.minAdditionalWins;
    const winsNeededLoss = qLoss.alreadyGuaranteed
      ? 0
      : qLoss.impossible
        ? 99
        : qLoss.minAdditionalWins;
    const impact = winsNeededLoss - winsNeededWin;

    if (impact !== 0)
      critical.push({
        match,
        type: "own",
        rival,
        impact,
        winsNeededWin,
        winsNeededLoss,
      });
  }

  return critical.sort((a, b) => b.impact - a.impact).slice(0, 5);
}

export function fmtNRR(n) {
  if (!n && n !== 0) return "+0.000";
  return (n >= 0 ? "+" : "") + n.toFixed(3);
}

export function fmtScore(sc) {
  if (!sc || !sc.runs) return "—";
  return `${sc.runs}/${sc.wickets || 0} (${sc.overs || 0})`;
}
