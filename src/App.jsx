import { useState, useMemo, useCallback, useEffect, useRef } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const TEAMS = [
  {
    id: "RCB",
    name: "Royal Challengers Bengaluru",
    short: "RCB",
    color: "#EC1C24",
  },
  { id: "MI", name: "Mumbai Indians", short: "MI", color: "#1D4ED8" },
  { id: "RR", name: "Rajasthan Royals", short: "RR", color: "#BE185D" },
  { id: "PBKS", name: "Punjab Kings", short: "PBKS", color: "#DC2626" },
  { id: "LSG", name: "Lucknow Super Giants", short: "LSG", color: "#0EA5E9" },
  { id: "KKR", name: "Kolkata Knight Riders", short: "KKR", color: "#7C3AED" },
  { id: "CSK", name: "Chennai Super Kings", short: "CSK", color: "#D97706" },
  { id: "DC", name: "Delhi Capitals", short: "DC", color: "#2563EB" },
  { id: "GT", name: "Gujarat Titans", short: "GT", color: "#16A34A" },
  { id: "SRH", name: "Sunrisers Hyderabad", short: "SRH", color: "#EA580C" },
];
const RAW = [
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
  [37, "GT", "CSK", "26 Apr"],
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
  [66, "CSK", "GT", "21 May"],
  [67, "SRH", "RCB", "22 May"],
  [68, "LSG", "PBKS", "23 May"],
  [69, "MI", "RR", "24 May"],
  [70, "KKR", "DC", "24 May"],
];
const teamMap = Object.fromEntries(TEAMS.map((t) => [t.id, t]));
const buildFixtures = () =>
  RAW.map(([id, a, b, date]) => ({
    id,
    a,
    b,
    date,
    result: null,
    scoreA: { runs: "", wickets: "", overs: "" },
    scoreB: { runs: "", wickets: "", overs: "" },
    batFirst: null,
  }));

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const LS_KEY = "ipl2026_fixtures_v3";
function loadFixtures() {
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
function saveFixtures(fixtures) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(fixtures));
  } catch {
    console.error("Issue");
  } // ignore errors
}

// ─── CORE MATH ────────────────────────────────────────────────────────────────
function parseOvers(ov) {
  const s = String(ov);
  const [full, balls = "0"] = s.split(".");
  return parseInt(full || 0) + parseInt(balls) / 6;
}

function computeStandings(fixtures) {
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

// Points progression: for each match in order, snapshot all team points
function computePointsProgression(fixtures) {
  const sorted = [...fixtures]
    .sort((a, b) => a.id - b.id)
    .filter((f) => f.result);
  const snapshots = []; // [{matchId, date, points:{teamId:pts,...}}]
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

// ─── MAX-FLOW ─────────────────────────────────────────────────────────────────
function maxFlowEK(cap, source, sink, n) {
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
function combinations(arr, k) {
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

function canFourTeamsExceed(teamId, threshold, fixtures, standings) {
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

function computeQualification(teamId, fixtures, standings) {
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

// Critical matches for a team
function findCriticalMatches(teamId, fixtures) {
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

// Scenario helpers
function applyScenario(fixtures, scenario) {
  return fixtures.map((f) => {
    if (f.result) return f;
    const sc = scenario[f.id];
    return sc ? { ...f, result: sc } : f;
  });
}

// Auto-fill: set all unplayed matches involving team to team win, all others random-ish (first team)
function buildBestScenario(teamId, fixtures) {
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
      } else {
        // Leave non-team matches unset — they don't affect team's own wins
      }
    });
  return sc;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmtNRR = (n) => {
  if (n === undefined || n === null || isNaN(n)) return "+0.000";
  return (n >= 0 ? "+" : "") + n.toFixed(3);
};
const fmtScore = (sc) => {
  if (!sc || !sc.runs) return "—";
  return `${sc.runs}/${sc.wickets || 0} (${sc.overs || 0})`;
};

// ─── POINTS CHART ─────────────────────────────────────────────────────────────
function PointsChart({ progression, visibleTeams }) {
  if (progression.length < 2)
    return (
      <div
        style={{
          height: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-tertiary)",
          fontSize: 13,
        }}
      >
        Enter match results to see points progression
      </div>
    );
  const W = 560,
    H = 180,
    PAD = { t: 20, r: 20, b: 30, l: 28 };
  const cW = W - PAD.l - PAD.r,
    cH = H - PAD.t - PAD.b;
  const maxPts = Math.max(
    ...progression.map((s) => Math.max(...TEAMS.map((t) => s.points[t.id]))),
    2,
  );
  const xScale = (i) => (i / (progression.length - 1)) * cW;
  const yScale = (v) => cH - (v / maxPts) * cH;
  const teamLines = TEAMS.filter((t) => visibleTeams[t.id] !== false).map(
    (team) => {
      const pts = progression.map((s, i) => ({
        x: xScale(i),
        y: yScale(s.points[team.id]),
      }));
      const d = pts
        .map(
          (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`,
        )
        .join(" ");
      return {
        team,
        d,
        last: pts[pts.length - 1],
        lastPts: progression[progression.length - 1].points[team.id],
      };
    },
  );
  // y-axis ticks
  const yTicks = [];
  for (let v = 0; v <= maxPts; v += 2) yTicks.push(v);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      {/* Grid lines */}
      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={PAD.l}
            y1={PAD.t + yScale(v)}
            x2={PAD.l + cW}
            y2={PAD.t + yScale(v)}
            stroke="var(--color-border-tertiary)"
            strokeWidth="0.5"
          />
          <text
            x={PAD.l - 4}
            y={PAD.t + yScale(v) + 4}
            textAnchor="end"
            fontSize="9"
            fill="var(--color-text-tertiary)"
          >
            {v}
          </text>
        </g>
      ))}
      {/* Lines */}
      {teamLines.map(({ team, d, last, lastPts }) => (
        <g key={team.id}>
          <path
            d={d}
            fill="none"
            stroke={team.color}
            strokeWidth="1.5"
            transform={`translate(${PAD.l},${PAD.t})`}
            strokeLinejoin="round"
          />
          <circle
            cx={PAD.l + last.x}
            cy={PAD.t + last.y}
            r="3"
            fill={team.color}
          />
          <text
            x={PAD.l + last.x + 5}
            y={PAD.t + last.y + 4}
            fontSize="9"
            fill={team.color}
            fontWeight="600"
          >
            {lastPts}
          </text>
        </g>
      ))}
      {/* x-axis label */}
      <text
        x={PAD.l + cW / 2}
        y={H - 2}
        textAnchor="middle"
        fontSize="9"
        fill="var(--color-text-tertiary)"
      >
        Match number
      </text>
    </svg>
  );
}

// ─── QUALIFICATION RACE ───────────────────────────────────────────────────────
function QualRace({ standings, fixtures, allQual }) {
  const sorted = [...TEAMS].sort((a, b) => {
    const sa = standings[a.id],
      sb = standings[b.id];
    if (sb.points !== sa.points) return sb.points - sa.points;
    return (sb.nrr || 0) - (sa.nrr || 0);
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {sorted.map((team, idx) => {
        const s = standings[team.id];
        const rem = fixtures.filter(
          (f) => !f.result && (f.a === team.id || f.b === team.id),
        ).length;
        const maxWins = s.wins + rem;
        const q = allQual?.[team.id];
        const guaranteed = q?.alreadyGuaranteed;
        const eliminated = q?.impossible;
        const needMore =
          !guaranteed && !eliminated ? q?.minAdditionalWins : null;
        const wonPct = (s.wins / 14) * 100;
        const maxPct = (maxWins / 14) * 100;
        const qualLine = (10 / 14) * 100; // approximate qual line
        return (
          <div
            key={team.id}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <span
              style={{
                width: 18,
                fontSize: 11,
                fontWeight: 700,
                color: idx < 4 ? "#EA580C" : "var(--color-text-secondary)",
              }}
            >
              {idx + 1}
            </span>
            <span
              style={{
                width: 36,
                fontSize: 11,
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              {team.short}
            </span>
            <div
              style={{
                flex: 1,
                position: "relative",
                height: 18,
                background: "var(--color-background-secondary)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              {/* max possible (projected) */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: `${maxPct}%`,
                  background: team.color,
                  opacity: 0.18,
                  borderRadius: 4,
                }}
              />
              {/* actual wins */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: `${wonPct}%`,
                  background: team.color,
                  borderRadius: 4,
                }}
              />
              {/* qual threshold line */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: `${qualLine}%`,
                  width: 1.5,
                  height: "100%",
                  background: "#FBBF24",
                  opacity: 0.6,
                }}
              />
            </div>
            <span
              style={{
                width: 28,
                textAlign: "right",
                fontSize: 11,
                fontWeight: 700,
                color: "#22c55e",
              }}
            >
              {s.wins}W
            </span>
            <span style={{ width: 42, textAlign: "right", fontSize: 10 }}>
              {guaranteed && (
                <span style={{ color: "#22c55e", fontWeight: 700 }}>
                  ✓ Done
                </span>
              )}
              {eliminated && (
                <span style={{ color: "#ef4444", fontWeight: 700 }}>✗ Out</span>
              )}
              {needMore !== null && needMore !== undefined && (
                <span style={{ color: "#EA580C" }}>+{needMore}W</span>
              )}
            </span>
          </div>
        );
      })}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginTop: 4,
          fontSize: 10,
          color: "var(--color-text-tertiary)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span
            style={{
              width: 10,
              height: 10,
              background: "#FBBF24",
              opacity: 0.6,
              display: "inline-block",
              borderRadius: 1,
            }}
          ></span>
          ~Qual line
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span
            style={{
              width: 10,
              height: 8,
              background: "#888",
              opacity: 0.3,
              display: "inline-block",
              borderRadius: 2,
            }}
          ></span>
          Max possible (projected)
        </span>
      </div>
    </div>
  );
}

// ─── STREAK BADGE ─────────────────────────────────────────────────────────────
function StreakBadge({ streak }) {
  if (!streak || streak.count === 0)
    return (
      <span style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>
        —
      </span>
    );
  const color =
    streak.type === "W"
      ? "#22c55e"
      : streak.type === "L"
        ? "#ef4444"
        : "#94a3b8";
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: color,
        background: `${color}18`,
        padding: "2px 6px",
        borderRadius: 4,
        whiteSpace: "nowrap",
      }}
    >
      {streak.count}
      {streak.type}
    </span>
  );
}

// ─── MATCH MODAL ─────────────────────────────────────────────────────────────
function MatchModal({ match, onSave, onClose }) {
  const tA = teamMap[match.a],
    tB = teamMap[match.b];
  const [mode, setMode] = useState(match.result?.type === "nr" ? "nr" : "win");
  const [winner, setWinner] = useState(match.result?.winner || match.a);
  const [scoreA, setScoreA] = useState(
    match.result?.scoreA || { runs: "", wickets: "", overs: "" },
  );
  const [scoreB, setScoreB] = useState(
    match.result?.scoreB || { runs: "", wickets: "", overs: "" },
  );
  const btn = {
    padding: "7px 14px",
    border: "0.5px solid",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "sans-serif",
  };
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000c",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--color-background-primary)",
          borderRadius: 14,
          border: "0.5px solid var(--color-border-secondary)",
          padding: "1.5rem",
          width: "min(460px,95vw)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-tertiary)",
                marginBottom: 3,
              }}
            >
              MATCH {match.id} · {match.date}
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              <span style={{ color: tA.color }}>{tA.name}</span>
              <span
                style={{
                  color: "var(--color-text-tertiary)",
                  fontWeight: 400,
                  margin: "0 6px",
                }}
              >
                vs
              </span>
              <span style={{ color: tB.color }}>{tB.name}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: "var(--color-text-secondary)",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[
            ["win", "Result"],
            ["nr", "No Result / Washed Out"],
          ].map(([m, l]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                ...btn,
                flex: 1,
                background:
                  mode === m
                    ? m === "nr"
                      ? "#64748b"
                      : "#EA580C"
                    : "transparent",
                color: mode === m ? "#fff" : "var(--color-text-secondary)",
                borderColor:
                  mode === m
                    ? m === "nr"
                      ? "#64748b"
                      : "#EA580C"
                    : "var(--color-border-secondary)",
              }}
            >
              {l}
            </button>
          ))}
        </div>
        {mode === "nr" ? (
          <div
            style={{
              padding: 14,
              background: "var(--color-background-secondary)",
              borderRadius: 10,
              textAlign: "center",
              fontSize: 13,
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
              marginBottom: 14,
            }}
          >
            Match abandoned.{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>
              Both teams get 1 point.
            </strong>{" "}
            No NRR impact.
          </div>
        ) : (
          <div>
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-secondary)",
                marginBottom: 8,
                letterSpacing: 1,
              }}
            >
              WINNER
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {[match.a, match.b].map((tid) => {
                const t = teamMap[tid];
                return (
                  <button
                    key={tid}
                    onClick={() => setWinner(tid)}
                    style={{
                      flex: 1,
                      padding: "9px 0",
                      border: "1.5px solid",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: "sans-serif",
                      background: winner === tid ? t.color : "transparent",
                      color:
                        winner === tid ? "#fff" : "var(--color-text-primary)",
                      borderColor:
                        winner === tid
                          ? t.color
                          : "var(--color-border-secondary)",
                    }}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-secondary)",
                marginBottom: 8,
                letterSpacing: 1,
              }}
            >
              SCORES{" "}
              <span
                style={{
                  color: "var(--color-text-tertiary)",
                  fontSize: 10,
                  fontWeight: 400,
                }}
              >
                (optional — needed for NRR)
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 4 }}>
              {[
                [tA, scoreA, setScoreA],
                [tB, scoreB, setScoreB],
              ].map(([t, sc, setSc]) => (
                <div key={t.id} style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 10,
                      color: t.color,
                      marginBottom: 5,
                      fontWeight: 600,
                    }}
                  >
                    {t.short}
                  </div>
                  <div style={{ display: "flex", gap: 3 }}>
                    {[
                      ["Runs", "runs", "52%"],
                      ["Wkts", "wickets", "24%"],
                      ["Overs", "overs", "24%"],
                    ].map(([ph, k, w]) => (
                      <input
                        key={k}
                        type="number"
                        placeholder={ph}
                        value={sc[k]}
                        onChange={(e) => setSc({ ...sc, [k]: e.target.value })}
                        style={{
                          width: w,
                          padding: "5px 6px",
                          borderRadius: 5,
                          border: "0.5px solid var(--color-border-secondary)",
                          background: "var(--color-background-tertiary)",
                          color: "var(--color-text-primary)",
                          fontSize: 12,
                          fontFamily: "sans-serif",
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              ...btn,
              background: "transparent",
              borderColor: "var(--color-border-secondary)",
              color: "var(--color-text-secondary)",
            }}
          >
            Cancel
          </button>
          {match.result && (
            <button
              onClick={() => {
                onSave(null);
                onClose();
              }}
              style={{
                ...btn,
                background: "transparent",
                borderColor: "#ef444466",
                color: "#ef4444",
              }}
            >
              Clear
            </button>
          )}
          <button
            onClick={() => {
              onSave(
                mode === "nr"
                  ? { type: "nr" }
                  : { type: "win", winner, scoreA, scoreB },
              );
              onClose();
            }}
            style={{
              flex: 2,
              ...btn,
              background: "#EA580C",
              border: "none",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            {mode === "nr" ? "Mark No Result" : "Save Result"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const TABS = ["Standings", "Fixtures", "Qualify", "Race", "Simulator", "H2H"];

export default function App() {
  const [fixtures, setFixtures] = useState(loadFixtures);
  const [tab, setTab] = useState("Standings");
  const [selectedTeam, setSelectedTeam] = useState("MI");
  const [qualResult, setQualResult] = useState(null);
  const [computing, setComputing] = useState(false);
  const [matchPage, setMatchPage] = useState(0);
  const [filterTeam, setFilterTeam] = useState("ALL");
  const [modalMatch, setModalMatch] = useState(null);
  const [scenario, setScenario] = useState({});
  const [simTeam, setSimTeam] = useState("MI");
  const [h2hA, setH2hA] = useState("MI");
  const [h2hB, setH2hB] = useState("RCB");
  const [chartTeams, setChartTeams] = useState(() =>
    Object.fromEntries(TEAMS.map((t) => [t.id, true])),
  );
  const [exportMsg, setExportMsg] = useState("");
  const [dataExportMsg, setDataExportMsg] = useState("");
  const [dataImportMsg, setDataImportMsg] = useState("");
  const fileInputRef = useRef(null);
  const PER_PAGE = 14;

  // Persist on every change
  useEffect(() => {
    saveFixtures(fixtures);
  }, [fixtures]);

  const standings = useMemo(() => computeStandings(fixtures), [fixtures]);
  const rankedTeams = useMemo(
    () =>
      [...TEAMS].sort((a, b) => {
        const sa = standings[a.id],
          sb = standings[b.id];
        if (sb.points !== sa.points) return sb.points - sa.points;
        return (sb.nrr || 0) - (sa.nrr || 0);
      }),
    [standings],
  );

  const progression = useMemo(
    () => computePointsProgression(fixtures),
    [fixtures],
  );

  // All-team qualification (computed only on Standings & Race tabs)
  const allQual = useMemo(() => {
    if (tab !== "Standings" && tab !== "Race") return null;
    const res = {};
    TEAMS.forEach((t) => {
      res[t.id] = computeQualification(t.id, fixtures, standings);
    });
    return res;
  }, [tab, fixtures, standings]);

  const saveResult = useCallback((matchId, result) => {
    setFixtures((p) => p.map((f) => (f.id === matchId ? { ...f, result } : f)));
    setQualResult(null);
  }, []);

  const handleCompute = () => {
    setComputing(true);
    setTimeout(() => {
      setQualResult(computeQualification(selectedTeam, fixtures, standings));
      setComputing(false);
    }, 10);
  };

  const criticalMatches = useMemo(() => {
    if (tab !== "Qualify" || !qualResult) return [];
    return findCriticalMatches(selectedTeam, fixtures);
  }, [tab, qualResult, selectedTeam, fixtures]);

  const simFixtures = useMemo(
    () => applyScenario(fixtures, scenario),
    [fixtures, scenario],
  );
  const simStandings = useMemo(
    () => computeStandings(simFixtures),
    [simFixtures],
  );
  const simRanked = useMemo(
    () =>
      [...TEAMS].sort((a, b) => {
        const sa = simStandings[a.id],
          sb = simStandings[b.id];
        if (sb.points !== sa.points) return sb.points - sa.points;
        return (sb.nrr || 0) - (sa.nrr || 0);
      }),
    [simStandings],
  );

  const h2hStats = useMemo(() => {
    const played = fixtures.filter(
      (f) =>
        f.result &&
        f.result.type === "win" &&
        ((f.a === h2hA && f.b === h2hB) || (f.a === h2hB && f.b === h2hA)),
    );
    const remaining = fixtures.filter(
      (f) =>
        !f.result &&
        ((f.a === h2hA && f.b === h2hB) || (f.a === h2hB && f.b === h2hA)),
    );
    return {
      played,
      remaining,
      aWins: played.filter((f) => f.result.winner === h2hA).length,
      bWins: played.filter((f) => f.result.winner === h2hB).length,
    };
  }, [fixtures, h2hA, h2hB]);

  const played = fixtures.filter((f) => f.result).length;
  const filtered =
    filterTeam === "ALL"
      ? fixtures
      : fixtures.filter((f) => f.a === filterTeam || f.b === filterTeam);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice(
    matchPage * PER_PAGE,
    (matchPage + 1) * PER_PAGE,
  );
  const unplayedForSim = fixtures.filter((f) => !f.result);

  // Export standings text
  const exportStandings = () => {
    const header =
      "# IPL 2026 Standings\n" +
      new Date().toLocaleDateString("en-IN") +
      "\n\n";
    const cols = "#  Team         Pts  W  L NR   NRR\n" + "─".repeat(38) + "\n";
    const rows = rankedTeams
      .map((t, i) => {
        const s = standings[t.id];
        return `${String(i + 1).padStart(2)}. ${t.short.padEnd(5)} ${String(s.points).padStart(3)}  ${s.wins}  ${s.losses}  ${s.nrs}  ${fmtNRR(s.nrr)}`;
      })
      .join("\n");
    const text = header + cols + rows;
    navigator.clipboard.writeText(text).then(() => {
      setExportMsg("Copied!");
      setTimeout(() => setExportMsg(""), 2000);
    });
  };

  const resetAll = () => {
    if (confirm("Reset all results?")) {
      setFixtures(buildFixtures());
      setQualResult(null);
      setScenario({});
    }
  };

  const exportData = () => {
    const data = fixtures.map((f) => ({ ...f, batFirst: f.batFirst ?? null }));
    navigator.clipboard
      .writeText(JSON.stringify(data, null, 2))
      .then(() => {
        setDataExportMsg("Data exported to clipboard!");
        setTimeout(() => setDataExportMsg(""), 3000);
      })
      .catch(() => {
        setDataExportMsg("Failed to export data");
        setTimeout(() => setDataExportMsg(""), 3000);
      });
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data))
          throw new Error("Data must be an array of fixtures");
        data.forEach((f, i) => {
          if (typeof f.id !== "number" || !f.a || !f.b || !f.date)
            throw new Error(
              `Invalid fixture at index ${i}: missing required fields`,
            );
        });
        setFixtures(
          data.map((f) => ({
            ...f,
            scoreA: f.scoreA || { runs: "", wickets: "", overs: "" },
            scoreB: f.scoreB || { runs: "", wickets: "", overs: "" },
            batFirst: f.batFirst ?? null,
          })),
        );
        setDataImportMsg("Data imported successfully!");
        setTimeout(() => setDataImportMsg(""), 3000);
      } catch (err) {
        setDataImportMsg("Import failed: " + err.message);
        setTimeout(() => setDataImportMsg(""), 5000);
      }
    };
    reader.readAsText(file);
  };

  const C = "#EA580C",
    Y = "#FBBF24",
    G = "#22c55e",
    R = "#ef4444";

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        minHeight: "100vh",
        background: "var(--color-background-tertiary)",
        paddingBottom: "3rem",
      }}
    >
      {modalMatch && (
        <MatchModal
          match={modalMatch}
          onSave={(r) => saveResult(modalMatch.id, r)}
          onClose={() => setModalMatch(null)}
        />
      )}

      {/* ── HEADER ── */}
      <div
        style={{
          background: "#080808",
          padding: "1rem 1.5rem 0.8rem",
          borderBottom: `2px solid ${C}`,
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                background: C,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: "#fff",
                fontSize: 17,
              }}
            >
              ♦
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: Y,
                  letterSpacing: 1,
                }}
              >
                TATA IPL 2026
              </div>
              <div style={{ fontSize: 9, color: `${C}bb`, letterSpacing: 3 }}>
                MATHEMATICAL QUALIFICATION ENGINE
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={exportStandings}
                style={{
                  padding: "5px 10px",
                  background: "transparent",
                  border: `0.5px solid ${Y}66`,
                  borderRadius: 6,
                  color: Y,
                  fontSize: 11,
                  cursor: "pointer",
                  fontFamily: "sans-serif",
                }}
              >
                {exportMsg || "⎘ Copy Standings"}
              </button>
              <button
                onClick={exportData}
                style={{
                  padding: "5px 10px",
                  background: "transparent",
                  border: `0.5px solid ${G}66`,
                  borderRadius: 6,
                  color: G,
                  fontSize: 11,
                  cursor: "pointer",
                  fontFamily: "sans-serif",
                }}
              >
                {dataExportMsg || "⎘ Export Data"}
              </button>
              <button
                onClick={() => fileInputRef.current.click()}
                style={{
                  padding: "5px 10px",
                  background: "transparent",
                  border: `0.5px solid ${C}66`,
                  borderRadius: 6,
                  color: C,
                  fontSize: 11,
                  cursor: "pointer",
                  fontFamily: "sans-serif",
                }}
              >
                {dataImportMsg || "⎗ Import Data"}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                style={{ display: "none" }}
                accept=".json"
              />
              <button
                onClick={resetAll}
                style={{
                  padding: "5px 10px",
                  background: "transparent",
                  border: `0.5px solid ${R}66`,
                  borderRadius: 6,
                  color: R,
                  fontSize: 11,
                  cursor: "pointer",
                  fontFamily: "sans-serif",
                }}
              >
                ↺ Reset
              </button>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              fontSize: 11,
              color: "#555",
            }}
          >
            <span style={{ color: G }}>✓ Official 70-match schedule</span>
            <span style={{ color: "#888" }}>{played}/70 results</span>
            <span style={{ color: "#666" }}>Auto-saved to browser</span>
            <span style={{ color: Y }}>
              Max-flow · C(9,4)=126 · NRR · Streaks
            </span>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div
        style={{
          background: "#080808",
          borderBottom: "1px solid #181818",
          position: "sticky",
          top: 0,
          zIndex: 50,
          overflowX: "auto",
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            display: "flex",
            whiteSpace: "nowrap",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "10px 16px",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "sans-serif",
                background: tab === t ? C : "transparent",
                color: tab === t ? "#fff" : "#666",
                fontWeight: tab === t ? 600 : 400,
                borderBottom:
                  tab === t ? `2px solid ${Y}` : "2px solid transparent",
                flexShrink: 0,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "1rem" }}>
        {/* ════════════════════════════════════════════════════════
            STANDINGS
        ════════════════════════════════════════════════════════ */}
        {tab === "Standings" && (
          <div>
            <div
              style={{
                background: "var(--color-background-primary)",
                borderRadius: 12,
                border: "0.5px solid var(--color-border-tertiary)",
                overflow: "hidden",
                marginBottom: 12,
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr style={{ background: "#080808" }}>
                    {[
                      "#",
                      "Team",
                      "Pts",
                      "P",
                      "W",
                      "L",
                      "NR",
                      "NRR",
                      "Max W",
                      "Streak",
                      "Magic No.",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "9px 7px",
                          textAlign: h === "Team" ? "left" : "center",
                          fontWeight: 500,
                          fontSize: 10,
                          color: Y,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rankedTeams.map((team, idx) => {
                    const s = standings[team.id];
                    const rem = fixtures.filter(
                      (f) => !f.result && (f.a === team.id || f.b === team.id),
                    ).length;
                    const maxW = s.wins + rem;
                    const inTop4 = idx < 4;
                    const q = allQual?.[team.id];
                    const elim = q?.impossible;
                    const guaranteed = q?.alreadyGuaranteed;
                    // Magic number = wins needed to guarantee (null if impossible, 0 if already done)
                    let magicEl;
                    if (guaranteed)
                      magicEl = (
                        <span
                          style={{ color: G, fontWeight: 700, fontSize: 11 }}
                        >
                          ✓
                        </span>
                      );
                    else if (elim)
                      magicEl = (
                        <span
                          style={{ color: R, fontWeight: 700, fontSize: 11 }}
                        >
                          ✗
                        </span>
                      );
                    else if (q)
                      magicEl = (
                        <span
                          style={{ fontWeight: 700, color: C, fontSize: 13 }}
                        >
                          {q.minAdditionalWins}
                        </span>
                      );
                    else
                      magicEl = (
                        <span style={{ color: "var(--color-text-tertiary)" }}>
                          —
                        </span>
                      );
                    return (
                      <tr
                        key={team.id}
                        style={{
                          background: inTop4 ? "#EA580C07" : "transparent",
                          borderBottom:
                            "0.5px solid var(--color-border-tertiary)",
                        }}
                      >
                        <td
                          style={{
                            padding: "9px 7px",
                            textAlign: "center",
                            fontWeight: 700,
                            color: inTop4 ? C : "var(--color-text-secondary)",
                            fontSize: 13,
                          }}
                        >
                          {idx + 1}
                        </td>
                        <td style={{ padding: "9px 7px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                            }}
                          >
                            <div
                              style={{
                                width: 9,
                                height: 9,
                                borderRadius: "50%",
                                background: team.color,
                                flexShrink: 0,
                              }}
                            ></div>
                            <span
                              style={{
                                fontWeight: 600,
                                color: elim
                                  ? "var(--color-text-tertiary)"
                                  : "var(--color-text-primary)",
                                fontSize: 12,
                                whiteSpace: "nowrap",
                                textDecoration: elim ? "line-through" : "none",
                              }}
                            >
                              {team.name}
                            </span>
                            {guaranteed && (
                              <span
                                style={{
                                  fontSize: 9,
                                  background: "#22c55e22",
                                  color: G,
                                  padding: "1px 5px",
                                  borderRadius: 3,
                                  fontWeight: 700,
                                }}
                              >
                                QUAL
                              </span>
                            )}
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "9px 7px",
                            textAlign: "center",
                            fontWeight: 700,
                            color: Y,
                            fontSize: 14,
                          }}
                        >
                          {s.points}
                        </td>
                        <td
                          style={{
                            padding: "9px 7px",
                            textAlign: "center",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {s.played}
                        </td>
                        <td
                          style={{
                            padding: "9px 7px",
                            textAlign: "center",
                            fontWeight: 700,
                            color: G,
                          }}
                        >
                          {s.wins}
                        </td>
                        <td
                          style={{
                            padding: "9px 7px",
                            textAlign: "center",
                            color: R,
                          }}
                        >
                          {s.losses}
                        </td>
                        <td
                          style={{
                            padding: "9px 7px",
                            textAlign: "center",
                            color: "#94a3b8",
                          }}
                        >
                          {s.nrs}
                        </td>
                        <td
                          style={{
                            padding: "9px 7px",
                            textAlign: "center",
                            fontWeight: 500,
                            color:
                              s.nrr > 0
                                ? G
                                : s.nrr < 0
                                  ? R
                                  : "var(--color-text-secondary)",
                            fontSize: 11,
                          }}
                        >
                          {fmtNRR(s.nrr)}
                        </td>
                        <td
                          style={{
                            padding: "9px 7px",
                            textAlign: "center",
                            color: C,
                            fontWeight: 500,
                          }}
                        >
                          {maxW}
                        </td>
                        <td style={{ padding: "9px 7px", textAlign: "center" }}>
                          <StreakBadge streak={s.currentStreak} />
                        </td>
                        <td style={{ padding: "9px 7px", textAlign: "center" }}>
                          {magicEl}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div
              style={{
                fontSize: 10,
                color: "var(--color-text-tertiary)",
                marginBottom: 16,
                lineHeight: 1.7,
              }}
            >
              Magic No. = additional wins needed to guarantee Top 4 · Streak =
              current consecutive result · Max W = max possible wins · NRR as
              tiebreaker
            </div>

            {/* Points Progression Chart */}
            <div
              style={{
                background: "var(--color-background-primary)",
                borderRadius: 12,
                border: "0.5px solid var(--color-border-tertiary)",
                padding: "1rem 1.25rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-secondary)",
                    letterSpacing: 1,
                  }}
                >
                  POINTS PROGRESSION
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {TEAMS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() =>
                        setChartTeams((p) => ({ ...p, [t.id]: !p[t.id] }))
                      }
                      style={{
                        padding: "2px 7px",
                        border: `1px solid ${chartTeams[t.id] ? t.color : "var(--color-border-secondary)"}`,
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 10,
                        background: chartTeams[t.id]
                          ? `${t.color}22`
                          : "transparent",
                        color: chartTeams[t.id]
                          ? t.color
                          : "var(--color-text-tertiary)",
                        fontWeight: chartTeams[t.id] ? 600 : 400,
                        fontFamily: "sans-serif",
                      }}
                    >
                      {t.short}
                    </button>
                  ))}
                </div>
              </div>
              <PointsChart
                progression={progression}
                visibleTeams={chartTeams}
              />
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            FIXTURES
        ════════════════════════════════════════════════════════ */}
        {tab === "Fixtures" && (
          <div>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 10,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <select
                value={filterTeam}
                onChange={(e) => {
                  setFilterTeam(e.target.value);
                  setMatchPage(0);
                }}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "0.5px solid var(--color-border-secondary)",
                  background: "var(--color-background-primary)",
                  color: "var(--color-text-primary)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <option value="ALL">All Teams</option>
                {TEAMS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <select
                value={filterTeam === "ALL" ? "ALL" : "played"}
                onChange={() => {}}
                style={{ display: "none" }}
              />
              <span
                style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
              >
                {filtered.filter((f) => f.result).length}/{filtered.length} done
              </span>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => setMatchPage((p) => Math.max(0, p - 1))}
                disabled={matchPage === 0}
                style={{
                  padding: "6px 11px",
                  borderRadius: 6,
                  border: "0.5px solid var(--color-border-secondary)",
                  cursor: "pointer",
                  background: "var(--color-background-secondary)",
                  color: "var(--color-text-primary)",
                  fontSize: 12,
                  fontFamily: "sans-serif",
                }}
              >
                ←
              </button>
              <span
                style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
              >
                {matchPage + 1}/{totalPages}
              </span>
              <button
                onClick={() =>
                  setMatchPage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={matchPage >= totalPages - 1}
                style={{
                  padding: "6px 11px",
                  borderRadius: 6,
                  border: "0.5px solid var(--color-border-secondary)",
                  cursor: "pointer",
                  background: "var(--color-background-secondary)",
                  color: "var(--color-text-primary)",
                  fontSize: 12,
                  fontFamily: "sans-serif",
                }}
              >
                →
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {paged.map((match) => {
                const res = match.result;
                const isNR = res?.type === "nr",
                  isWin = res?.type === "win";
                return (
                  <div
                    key={match.id}
                    onClick={() => setModalMatch(match)}
                    style={{
                      background: "var(--color-background-primary)",
                      borderRadius: 9,
                      border: isNR
                        ? "0.5px solid #94a3b866"
                        : isWin
                          ? "0.5px solid #22c55e33"
                          : "0.5px solid var(--color-border-tertiary)",
                      padding: "9px 13px",
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      cursor: "pointer",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--color-background-secondary)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        "var(--color-background-primary)")
                    }
                  >
                    <div style={{ minWidth: 44, flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: 9,
                          color: "var(--color-text-tertiary)",
                        }}
                      >
                        M{match.id}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          color: "var(--color-text-tertiary)",
                        }}
                      >
                        {match.date}
                      </div>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {[match.a, match.b].map((tid, i) => {
                        const t = teamMap[tid];
                        return (
                          <span
                            key={tid}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 13,
                              fontWeight:
                                isWin && res.winner === tid ? 700 : 400,
                              color:
                                isWin && res.winner === tid
                                  ? G
                                  : "var(--color-text-primary)",
                            }}
                          >
                            {i === 1 && (
                              <span
                                style={{
                                  fontSize: 9,
                                  color: "var(--color-text-tertiary)",
                                  margin: "0 2px",
                                }}
                              >
                                vs
                              </span>
                            )}
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: t.color,
                                display: "inline-block",
                                flexShrink: 0,
                              }}
                            ></span>
                            {t.short}
                          </span>
                        );
                      })}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      {!res && (
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--color-text-tertiary)",
                          }}
                        >
                          + Add result
                        </span>
                      )}
                      {isNR && (
                        <span
                          style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            fontWeight: 600,
                          }}
                        >
                          NO RESULT
                        </span>
                      )}
                      {isWin && (
                        <div>
                          <div
                            style={{ fontSize: 11, color: G, fontWeight: 600 }}
                          >
                            {teamMap[res.winner].short} won
                          </div>
                          {res.scoreA?.runs && (
                            <div
                              style={{
                                fontSize: 10,
                                color: "var(--color-text-tertiary)",
                              }}
                            >
                              {fmtScore(res.scoreA)} · {fmtScore(res.scoreB)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            QUALIFY
        ════════════════════════════════════════════════════════ */}
        {tab === "Qualify" && (
          <div>
            <div
              style={{
                background: "var(--color-background-primary)",
                borderRadius: 12,
                border: "0.5px solid var(--color-border-tertiary)",
                padding: "1rem",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "var(--color-text-secondary)",
                  marginBottom: 8,
                  letterSpacing: 1,
                }}
              >
                SELECT TEAM
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {TEAMS.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => {
                      setSelectedTeam(team.id);
                      setQualResult(null);
                    }}
                    style={{
                      padding: "6px 12px",
                      border: "1.5px solid",
                      borderRadius: 7,
                      cursor: "pointer",
                      fontSize: 12,
                      fontFamily: "sans-serif",
                      background:
                        selectedTeam === team.id ? team.color : "transparent",
                      color:
                        selectedTeam === team.id
                          ? "#fff"
                          : "var(--color-text-primary)",
                      borderColor:
                        selectedTeam === team.id
                          ? team.color
                          : "var(--color-border-secondary)",
                      fontWeight: selectedTeam === team.id ? 600 : 400,
                    }}
                  >
                    {team.short}
                  </button>
                ))}
              </div>
            </div>
            {(() => {
              const s = standings[selectedTeam];
              const rem = fixtures.filter(
                (f) =>
                  !f.result && (f.a === selectedTeam || f.b === selectedTeam),
              ).length;
              const rank =
                rankedTeams.findIndex((t) => t.id === selectedTeam) + 1;
              return (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5,1fr)",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  {[
                    ["Rank", `#${rank}`, rank <= 4 ? G : R],
                    ["Points", s.points, Y],
                    ["Wins", s.wins, G],
                    ["NR", s.nrs, "#94a3b8"],
                    ["Remaining", rem, C],
                  ].map(([l, v, c]) => (
                    <div
                      key={l}
                      style={{
                        background: "var(--color-background-secondary)",
                        borderRadius: 8,
                        padding: "10px 8px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--color-text-secondary)",
                          marginBottom: 3,
                        }}
                      >
                        {l}
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: c }}>
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
            <div
              style={{
                background: "var(--color-background-secondary)",
                borderRadius: 8,
                padding: "9px 12px",
                marginBottom: 10,
                fontSize: 11,
                color: "var(--color-text-secondary)",
                lineHeight: 1.7,
              }}
            >
              <strong style={{ color: "var(--color-text-primary)" }}>
                Algorithm:
              </strong>{" "}
              Checks all C(9,4)=126 rival subsets via Edmonds-Karp max-flow on
              the fixture graph. Qualification is computed on wins only — NRR is
              non-deterministic.
            </div>
            <button
              onClick={handleCompute}
              disabled={computing}
              style={{
                width: "100%",
                padding: "11px",
                border: "none",
                borderRadius: 10,
                cursor: computing ? "not-allowed" : "pointer",
                background: computing ? "#1a1a1a" : C,
                color: computing ? "#444" : "#fff",
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 12,
                fontFamily: "sans-serif",
              }}
            >
              {computing
                ? "⏳ Running max-flow..."
                : `▶  Compute Qualification — ${teamMap[selectedTeam].name}`}
            </button>

            {qualResult &&
              (() => {
                const team = teamMap[selectedTeam];
                const {
                  currentWins,
                  remaining,
                  minAdditionalWins,
                  alreadyGuaranteed,
                  impossible,
                } = qualResult;
                const targetWins = alreadyGuaranteed
                  ? currentWins
                  : impossible
                    ? currentWins + remaining
                    : currentWins + minAdditionalWins;
                const vc = impossible ? R : alreadyGuaranteed ? G : C;
                return (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {/* Verdict */}
                    <div
                      style={{
                        borderRadius: 12,
                        padding: "1rem 1.25rem",
                        background: `${vc}0d`,
                        border: `1.5px solid ${vc}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--color-text-secondary)",
                          marginBottom: 4,
                          letterSpacing: 2,
                        }}
                      >
                        VERDICT
                      </div>
                      {impossible && (
                        <>
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 700,
                              color: R,
                              marginBottom: 5,
                            }}
                          >
                            Mathematically Eliminated
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--color-text-secondary)",
                              lineHeight: 1.7,
                            }}
                          >
                            Even winning all {remaining} remaining matches (
                            {currentWins + remaining}W total), 4+ rivals can
                            still simultaneously exceed that given the fixture
                            graph.
                          </div>
                        </>
                      )}
                      {alreadyGuaranteed && (
                        <>
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 700,
                              color: G,
                              marginBottom: 5,
                            }}
                          >
                            Already Guaranteed ✓
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--color-text-secondary)",
                              lineHeight: 1.7,
                            }}
                          >
                            With {currentWins} wins it is impossible for 4
                            rivals to all reach {currentWins + 1}+ wins
                            simultaneously. {team.short} is in Top 4 regardless
                            of all future results.
                          </div>
                        </>
                      )}
                      {!impossible && !alreadyGuaranteed && (
                        <>
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 700,
                              color: C,
                              marginBottom: 5,
                            }}
                          >
                            Need {minAdditionalWins} more win
                            {minAdditionalWins !== 1 ? "s" : ""} → guaranteed at{" "}
                            {targetWins}W
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--color-text-secondary)",
                              lineHeight: 1.7,
                            }}
                          >
                            At {targetWins} wins, no subset of 4 rivals can
                            simultaneously exceed this given remaining fixtures.
                            Currently {currentWins}W, {remaining} matches left.
                          </div>
                        </>
                      )}
                    </div>

                    {/* Win bar */}
                    {!impossible && (
                      <div
                        style={{
                          background: "var(--color-background-primary)",
                          borderRadius: 10,
                          border: "0.5px solid var(--color-border-tertiary)",
                          padding: "0.9rem 1.1rem",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--color-text-secondary)",
                            marginBottom: 8,
                            letterSpacing: 2,
                          }}
                        >
                          WIN TRACKER — 14 MATCHES
                        </div>
                        <div
                          style={{ display: "flex", gap: 3, marginBottom: 7 }}
                        >
                          {Array.from({ length: 14 }).map((_, i) => (
                            <div
                              key={i}
                              style={{
                                flex: 1,
                                height: 22,
                                borderRadius: 3,
                                background:
                                  i < currentWins
                                    ? G
                                    : !alreadyGuaranteed && i < targetWins
                                      ? C
                                      : i < currentWins + remaining
                                        ? "#ffffff15"
                                        : "#ffffff06",
                                border:
                                  !alreadyGuaranteed &&
                                  i >= currentWins &&
                                  i < targetWins
                                    ? `1px solid ${Y}`
                                    : "none",
                              }}
                            />
                          ))}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 12,
                            fontSize: 10,
                            color: "var(--color-text-secondary)",
                            flexWrap: "wrap",
                          }}
                        >
                          <span>
                            <span
                              style={{
                                display: "inline-block",
                                width: 8,
                                height: 8,
                                background: G,
                                borderRadius: 2,
                                marginRight: 3,
                              }}
                            ></span>
                            Won ({currentWins})
                          </span>
                          {!alreadyGuaranteed && (
                            <span>
                              <span
                                style={{
                                  display: "inline-block",
                                  width: 8,
                                  height: 8,
                                  background: C,
                                  border: `1px solid ${Y}`,
                                  borderRadius: 2,
                                  marginRight: 3,
                                }}
                              ></span>
                              Need ({minAdditionalWins})
                            </span>
                          )}
                          <span>
                            <span
                              style={{
                                display: "inline-block",
                                width: 8,
                                height: 8,
                                background: "#ffffff15",
                                borderRadius: 2,
                                marginRight: 3,
                              }}
                            ></span>
                            Unplayed ({remaining})
                          </span>
                          <span
                            style={{
                              marginLeft: "auto",
                              fontWeight: 600,
                              color: vc,
                            }}
                          >
                            Target: {targetWins}W
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Critical matches */}
                    {criticalMatches.length > 0 && (
                      <div
                        style={{
                          background: "var(--color-background-primary)",
                          borderRadius: 10,
                          border: `0.5px solid ${Y}44`,
                          padding: "0.9rem 1.1rem",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            color: Y,
                            marginBottom: 10,
                            letterSpacing: 2,
                          }}
                        >
                          ⚡ CRITICAL MATCHES FOR {team.short}
                        </div>
                        {criticalMatches.map(({ match, wWin, wLoss }) => {
                          const tA = teamMap[match.a],
                            tB = teamMap[match.b];
                          return (
                            <div
                              key={match.id}
                              onClick={() => setModalMatch(match)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                marginBottom: 7,
                                padding: "8px 10px",
                                background: "var(--color-background-secondary)",
                                borderRadius: 8,
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.opacity = "0.85")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.opacity = "1")
                              }
                            >
                              <div style={{ flexShrink: 0, minWidth: 44 }}>
                                <div
                                  style={{
                                    fontSize: 9,
                                    color: "var(--color-text-tertiary)",
                                  }}
                                >
                                  M{match.id}
                                </div>
                                <div
                                  style={{
                                    fontSize: 9,
                                    color: "var(--color-text-tertiary)",
                                  }}
                                >
                                  {match.date}
                                </div>
                              </div>
                              <div
                                style={{
                                  flex: 1,
                                  fontSize: 12,
                                  fontWeight: 500,
                                }}
                              >
                                <span style={{ color: tA.color }}>
                                  {tA.short}
                                </span>
                                <span
                                  style={{
                                    color: "var(--color-text-tertiary)",
                                    margin: "0 5px",
                                  }}
                                >
                                  vs
                                </span>
                                <span style={{ color: tB.color }}>
                                  {tB.short}
                                </span>
                              </div>
                              <div style={{ textAlign: "right", fontSize: 11 }}>
                                <div style={{ color: G, marginBottom: 1 }}>
                                  Win →{" "}
                                  {wWin === 0
                                    ? "✓ guaranteed"
                                    : wWin === 99
                                      ? "eliminated"
                                      : `need ${wWin} more`}
                                </div>
                                <div style={{ color: R }}>
                                  Loss →{" "}
                                  {wLoss === 0
                                    ? "✓ guaranteed"
                                    : wLoss === 99
                                      ? "eliminated"
                                      : `need ${wLoss} more`}
                                </div>
                              </div>
                              {/* <div style={{background:impact>0?`${G}22`:`${R}22`,color:impact>0?G:R,padding:"3px 8px",borderRadius:5,fontSize:11,fontWeight:700,flexShrink:0,whiteSpace:"nowrap"}}>
                              {impact>0?`+${impact}`:String(impact)} swing
                            </div> */}
                            </div>
                          );
                        })}
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--color-text-tertiary)",
                            marginTop: 4,
                          }}
                        >
                          Swing = extra wins needed if you lose vs if you win.
                          Click to enter result.
                        </div>
                      </div>
                    )}

                    {/* Rivals */}
                    <div
                      style={{
                        background: "var(--color-background-primary)",
                        borderRadius: 10,
                        border: "0.5px solid var(--color-border-tertiary)",
                        padding: "0.9rem 1.1rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--color-text-secondary)",
                          marginBottom: 10,
                          letterSpacing: 2,
                        }}
                      >
                        RIVAL ANALYSIS
                      </div>
                      {TEAMS.filter((t) => t.id !== selectedTeam)
                        .sort(
                          (a, b) => standings[b.id].wins - standings[a.id].wins,
                        )
                        .map((team) => {
                          const s = standings[team.id];
                          const tr = fixtures.filter(
                            (f) =>
                              !f.result && (f.a === team.id || f.b === team.id),
                          ).length;
                          const h2h = fixtures.filter(
                            (f) =>
                              !f.result &&
                              ((f.a === selectedTeam && f.b === team.id) ||
                                (f.b === selectedTeam && f.a === team.id)),
                          ).length;
                          const canReach = s.wins + tr >= targetWins + 1;
                          return (
                            <div
                              key={team.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 5,
                              }}
                            >
                              <span
                                style={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: "50%",
                                  background: team.color,
                                  flexShrink: 0,
                                }}
                              ></span>
                              <span
                                style={{
                                  width: 34,
                                  fontWeight: 600,
                                  fontSize: 11,
                                  color: "var(--color-text-primary)",
                                }}
                              >
                                {team.short}
                              </span>
                              <div
                                style={{
                                  flex: 1,
                                  height: 7,
                                  background: "#ffffff10",
                                  borderRadius: 3,
                                  overflow: "hidden",
                                  minWidth: 50,
                                }}
                              >
                                <div
                                  style={{
                                    width: `${(s.wins / 14) * 100}%`,
                                    height: "100%",
                                    background: team.color,
                                    borderRadius: 3,
                                  }}
                                ></div>
                              </div>
                              <span
                                style={{
                                  width: 52,
                                  textAlign: "right",
                                  fontSize: 10,
                                  color: "var(--color-text-secondary)",
                                }}
                              >
                                {s.wins}W +{tr}
                              </span>
                              <span
                                style={{
                                  width: 52,
                                  textAlign: "right",
                                  fontSize: 10,
                                  color: s.nrr >= 0 ? G : R,
                                }}
                              >
                                {fmtNRR(s.nrr)}
                              </span>
                              {h2h > 0 && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    color: Y,
                                    background: `${Y}11`,
                                    padding: "1px 5px",
                                    borderRadius: 3,
                                  }}
                                >
                                  H2H {h2h}
                                </span>
                              )}
                              <span
                                style={{
                                  width: 44,
                                  textAlign: "center",
                                  fontSize: 10,
                                  fontWeight: 600,
                                  borderRadius: 4,
                                  padding: "2px 0",
                                  color: canReach ? R : G,
                                  background: canReach ? `${R}11` : `${G}11`,
                                }}
                              >
                                {canReach ? "threat" : "safe"}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })()}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            RACE
        ════════════════════════════════════════════════════════ */}
        {tab === "Race" && (
          <div>
            <div
              style={{
                background: "var(--color-background-primary)",
                borderRadius: 12,
                border: `0.5px solid ${C}44`,
                padding: "1rem 1.25rem",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: C,
                  letterSpacing: 2,
                  marginBottom: 10,
                }}
              >
                QUALIFICATION RACE — ALL TEAMS
              </div>
              <QualRace
                standings={standings}
                fixtures={fixtures}
                allQual={allQual}
              />
            </div>
            <div
              style={{
                background: "var(--color-background-primary)",
                borderRadius: 12,
                border: "0.5px solid var(--color-border-tertiary)",
                padding: "1rem 1.25rem",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "var(--color-text-secondary)",
                  letterSpacing: 1,
                  marginBottom: 12,
                }}
              >
                ALL MAGIC NUMBERS
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5,1fr)",
                  gap: 8,
                }}
              >
                {rankedTeams.map((team, idx) => {
                  const q = allQual?.[team.id];
                  const vc = q?.alreadyGuaranteed ? G : q?.impossible ? R : C;
                  const label = q?.alreadyGuaranteed
                    ? "✓"
                    : q?.impossible
                      ? "✗"
                      : q?.minAdditionalWins != null
                        ? String(q.minAdditionalWins)
                        : "—";
                  return (
                    <div
                      key={team.id}
                      style={{
                        background: "var(--color-background-secondary)",
                        borderRadius: 10,
                        padding: "12px 8px",
                        textAlign: "center",
                        border: `0.5px solid ${idx < 4 ? `${team.color}44` : "var(--color-border-tertiary)"}`,
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: team.color,
                          margin: "0 auto 5px",
                        }}
                      ></div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--color-text-primary)",
                          marginBottom: 4,
                        }}
                      >
                        {team.short}
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: vc }}>
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          color: "var(--color-text-tertiary)",
                          marginTop: 2,
                        }}
                      >
                        {q?.alreadyGuaranteed
                          ? "guaranteed"
                          : q?.impossible
                            ? "eliminated"
                            : "wins needed"}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 10,
                  color: "var(--color-text-tertiary)",
                }}
              >
                Magic number = additional wins needed to mathematically
                guarantee Top 4, ignoring NRR. Computed via max-flow for all 10
                teams simultaneously.
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            SIMULATOR
        ════════════════════════════════════════════════════════ */}
        {tab === "Simulator" && (
          <div>
            <div
              style={{
                background: "var(--color-background-primary)",
                borderRadius: 12,
                border: `0.5px solid ${C}44`,
                padding: "1rem 1.25rem",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: C,
                  letterSpacing: 2,
                  marginBottom: 6,
                }}
              >
                WHAT-IF SCENARIO SIMULATOR
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.7,
                }}
              >
                Set hypothetical outcomes for unplayed matches. Standings update
                live without touching real data.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 10,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
              >
                Analyse:
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {TEAMS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSimTeam(t.id)}
                    style={{
                      padding: "4px 10px",
                      border: "1px solid",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 11,
                      fontFamily: "sans-serif",
                      background: simTeam === t.id ? t.color : "transparent",
                      color:
                        simTeam === t.id ? "#fff" : "var(--color-text-primary)",
                      borderColor:
                        simTeam === t.id
                          ? t.color
                          : "var(--color-border-secondary)",
                      fontWeight: simTeam === t.id ? 600 : 400,
                    }}
                  >
                    {t.short}
                  </button>
                ))}
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                <button
                  onClick={() =>
                    setScenario(buildBestScenario(simTeam, fixtures))
                  }
                  style={{
                    padding: "5px 11px",
                    borderRadius: 6,
                    border: `0.5px solid ${G}66`,
                    background: "transparent",
                    color: G,
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: "sans-serif",
                  }}
                >
                  ✓ Best case for {teamMap[simTeam].short}
                </button>
                <button
                  onClick={() => setScenario({})}
                  style={{
                    padding: "5px 11px",
                    borderRadius: 6,
                    border: `0.5px solid ${R}66`,
                    background: "transparent",
                    color: R,
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: "sans-serif",
                  }}
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Side-by-side standings */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 12,
              }}
            >
              {[
                ["Current", rankedTeams, standings, false],
                ["Simulated", simRanked, simStandings, true],
              ].map(([label, ranked, stds, isSim]) => (
                <div
                  key={label}
                  style={{
                    background: "var(--color-background-primary)",
                    borderRadius: 10,
                    border: `0.5px solid ${isSim ? C + "55" : "var(--color-border-tertiary)"}`,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      background: isSim ? "#EA580C15" : "#080808",
                      padding: "8px 10px",
                      fontSize: 10,
                      fontWeight: 600,
                      color: isSim ? C : Y,
                      letterSpacing: 1,
                    }}
                  >
                    {label} Standings
                  </div>
                  {ranked.map((team, idx) => {
                    const s = stds[team.id];
                    const inTop4 = idx < 4;
                    const changed =
                      isSim &&
                      simStandings[team.id].points !==
                        standings[team.id].points;
                    return (
                      <div
                        key={team.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          padding: "6px 10px",
                          borderBottom:
                            "0.5px solid var(--color-border-tertiary)",
                          background: inTop4 ? "#EA580C05" : "transparent",
                        }}
                      >
                        <span
                          style={{
                            width: 16,
                            fontSize: 12,
                            fontWeight: 700,
                            color: inTop4 ? C : "var(--color-text-secondary)",
                          }}
                        >
                          {idx + 1}
                        </span>
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: team.color,
                            flexShrink: 0,
                          }}
                        ></span>
                        <span
                          style={{
                            flex: 1,
                            fontSize: 11,
                            fontWeight: inTop4 ? 600 : 400,
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {team.short}
                        </span>
                        <span
                          style={{ fontSize: 11, fontWeight: 700, color: G }}
                        >
                          {s.wins}W
                        </span>
                        <span
                          style={{ fontSize: 11, color: Y, fontWeight: 600 }}
                        >
                          {s.points}pts
                        </span>
                        {changed && (
                          <span
                            style={{
                              fontSize: 9,
                              color: C,
                              background: `${C}22`,
                              padding: "1px 4px",
                              borderRadius: 3,
                            }}
                          >
                            sim
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Sim qualification verdict */}
            {(() => {
              const simQ = computeQualification(
                simTeam,
                simFixtures,
                simStandings,
              );
              const team = teamMap[simTeam];
              const vc = simQ.impossible ? R : simQ.alreadyGuaranteed ? G : C;
              const count = Object.values(scenario).filter(Boolean).length;
              return (
                <div
                  style={{
                    background: "var(--color-background-primary)",
                    borderRadius: 10,
                    border: `1.5px solid ${vc}`,
                    padding: "0.9rem 1.1rem",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--color-text-secondary)",
                      marginBottom: 4,
                      letterSpacing: 2,
                    }}
                  >
                    {team.short} — SIMULATED QUAL ({count} hypothetical result
                    {count !== 1 ? "s" : ""} applied)
                  </div>
                  {simQ.impossible && (
                    <div style={{ fontSize: 14, fontWeight: 700, color: R }}>
                      Cannot guarantee even in this scenario
                    </div>
                  )}
                  {simQ.alreadyGuaranteed && (
                    <div style={{ fontSize: 14, fontWeight: 700, color: G }}>
                      Guaranteed in this scenario ✓
                    </div>
                  )}
                  {!simQ.impossible && !simQ.alreadyGuaranteed && (
                    <div style={{ fontSize: 14, fontWeight: 700, color: C }}>
                      Still needs {simQ.minAdditionalWins} more win
                      {simQ.minAdditionalWins !== 1 ? "s" : ""} in this scenario
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Match toggles */}
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-secondary)",
                marginBottom: 8,
              }}
            >
              Toggle hypothetical outcomes:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {unplayedForSim.map((match) => {
                const tA = teamMap[match.a],
                  tB = teamMap[match.b];
                const sc = scenario[match.id];
                return (
                  <div
                    key={match.id}
                    style={{
                      background: "var(--color-background-primary)",
                      borderRadius: 8,
                      border: sc
                        ? `0.5px solid ${C}66`
                        : "0.5px solid var(--color-border-tertiary)",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ minWidth: 42, flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: 9,
                          color: "var(--color-text-tertiary)",
                        }}
                      >
                        M{match.id}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          color: "var(--color-text-tertiary)",
                        }}
                      >
                        {match.date}
                      </div>
                    </div>
                    <div style={{ flex: 1, fontSize: 12 }}>
                      <span style={{ color: tA.color, fontWeight: 500 }}>
                        {tA.short}
                      </span>
                      <span
                        style={{
                          color: "var(--color-text-tertiary)",
                          margin: "0 5px",
                        }}
                      >
                        vs
                      </span>
                      <span style={{ color: tB.color, fontWeight: 500 }}>
                        {tB.short}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[match.a, match.b].map((tid) => {
                        const t = teamMap[tid];
                        const blank = { runs: "", wickets: "", overs: "" };
                        return (
                          <button
                            key={tid}
                            onClick={() =>
                              setScenario((p) => {
                                const n = { ...p };
                                if (sc?.winner === tid) delete n[match.id];
                                else
                                  n[match.id] = {
                                    type: "win",
                                    winner: tid,
                                    scoreA: blank,
                                    scoreB: blank,
                                  };
                                return n;
                              })
                            }
                            style={{
                              padding: "4px 10px",
                              border: "0.5px solid",
                              borderRadius: 5,
                              cursor: "pointer",
                              fontSize: 11,
                              fontFamily: "sans-serif",
                              background:
                                sc?.winner === tid ? t.color : "transparent",
                              color:
                                sc?.winner === tid
                                  ? "#fff"
                                  : "var(--color-text-secondary)",
                              borderColor:
                                sc?.winner === tid
                                  ? t.color
                                  : "var(--color-border-secondary)",
                              fontWeight: sc?.winner === tid ? 600 : 400,
                            }}
                          >
                            {t.short}
                          </button>
                        );
                      })}
                      {sc && (
                        <button
                          onClick={() =>
                            setScenario((p) => {
                              const n = { ...p };
                              delete n[match.id];
                              return n;
                            })
                          }
                          style={{
                            padding: "4px 6px",
                            border: `0.5px solid ${R}66`,
                            borderRadius: 5,
                            cursor: "pointer",
                            fontSize: 10,
                            background: "transparent",
                            color: R,
                            fontFamily: "sans-serif",
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            HEAD TO HEAD
        ════════════════════════════════════════════════════════ */}
        {tab === "H2H" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 14,
              }}
            >
              {[
                [h2hA, setH2hA, "Team A", h2hB],
                [h2hB, setH2hB, "Team B", h2hA],
              ].map(([val, setter, label, exclude]) => (
                <div
                  key={label}
                  style={{
                    background: "var(--color-background-primary)",
                    borderRadius: 12,
                    border: "0.5px solid var(--color-border-tertiary)",
                    padding: "0.9rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--color-text-secondary)",
                      marginBottom: 8,
                      letterSpacing: 1,
                    }}
                  >
                    {label}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {TEAMS.filter((t) => t.id !== exclude).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setter(t.id)}
                        style={{
                          padding: "4px 9px",
                          border: "1px solid",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 11,
                          fontFamily: "sans-serif",
                          background: val === t.id ? t.color : "transparent",
                          color:
                            val === t.id ? "#fff" : "var(--color-text-primary)",
                          borderColor:
                            val === t.id
                              ? t.color
                              : "var(--color-border-secondary)",
                          fontWeight: val === t.id ? 600 : 400,
                        }}
                      >
                        {t.short}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {(() => {
              const tA = teamMap[h2hA],
                tB = teamMap[h2hB];
              const sA = standings[h2hA],
                sB = standings[h2hB];
              const total = h2hStats.aWins + h2hStats.bWins;
              const aPct = total > 0 ? (h2hStats.aWins / total) * 100 : 50;
              const leader =
                h2hStats.aWins > h2hStats.bWins
                  ? tA
                  : h2hStats.bWins > h2hStats.aWins
                    ? tB
                    : null;
              return (
                <div>
                  {/* Big scoreline */}
                  <div
                    style={{
                      background: "var(--color-background-primary)",
                      borderRadius: 14,
                      border: "0.5px solid var(--color-border-tertiary)",
                      padding: "1.25rem",
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ textAlign: "center", flex: 1 }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            background: tA.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 16,
                            margin: "0 auto 6px",
                          }}
                        >
                          {tA.short[0]}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {tA.name}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          #{rankedTeams.findIndex((t) => t.id === h2hA) + 1} ·{" "}
                          {sA.points}pts
                        </div>
                        <StreakBadge streak={sA.currentStreak} />
                      </div>
                      <div
                        style={{
                          textAlign: "center",
                          padding: "0 12px",
                          minWidth: 100,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 30,
                            fontWeight: 700,
                            color: "var(--color-text-primary)",
                            letterSpacing: 3,
                          }}
                        >
                          {h2hStats.aWins} – {h2hStats.bWins}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {h2hStats.played.length} played ·{" "}
                          {h2hStats.remaining.length} left
                        </div>
                        {leader && (
                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 11,
                              color: leader.color,
                              fontWeight: 600,
                            }}
                          >
                            {leader.short} leads
                          </div>
                        )}
                        {!leader && total > 0 && (
                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 11,
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            Level
                          </div>
                        )}
                        {total === 0 && (
                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 11,
                              color: "var(--color-text-tertiary)",
                            }}
                          >
                            No results yet
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: "center", flex: 1 }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            background: tB.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 16,
                            margin: "0 auto 6px",
                          }}
                        >
                          {tB.short[0]}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {tB.name}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          #{rankedTeams.findIndex((t) => t.id === h2hB) + 1} ·{" "}
                          {sB.points}pts
                        </div>
                        <StreakBadge streak={sB.currentStreak} />
                      </div>
                    </div>
                    {total > 0 && (
                      <div>
                        <div
                          style={{
                            display: "flex",
                            height: 10,
                            borderRadius: 5,
                            overflow: "hidden",
                            marginBottom: 5,
                          }}
                        >
                          <div
                            style={{
                              width: `${aPct}%`,
                              background: tA.color,
                              transition: "width 0.4s",
                            }}
                          ></div>
                          <div style={{ flex: 1, background: tB.color }}></div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 10,
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          <span style={{ color: tA.color, fontWeight: 600 }}>
                            {Math.round(aPct)}%
                          </span>
                          <span>H2H win share this season</span>
                          <span style={{ color: tB.color, fontWeight: 600 }}>
                            {Math.round(100 - aPct)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Season comparison */}
                  <div
                    style={{
                      background: "var(--color-background-primary)",
                      borderRadius: 12,
                      border: "0.5px solid var(--color-border-tertiary)",
                      padding: "1rem",
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--color-text-secondary)",
                        marginBottom: 12,
                        letterSpacing: 1,
                      }}
                    >
                      SEASON STATS
                    </div>
                    {[
                      ["Points", sA.points, sB.points, false],
                      ["Wins", sA.wins, sB.wins, false],
                      ["Losses", sA.losses, sB.losses, true],
                      [
                        "NRR",
                        +(sA.nrr || 0).toFixed(3),
                        +(sB.nrr || 0).toFixed(3),
                        false,
                      ],
                    ].map(([label, va, vb, invert]) => {
                      const aBetter = invert ? va < vb : va > vb,
                        bBetter = invert ? vb < va : vb > va;
                      return (
                        <div
                          key={label}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: aBetter
                                ? tA.color
                                : "var(--color-text-primary)",
                              minWidth: 40,
                              textAlign: "right",
                            }}
                          >
                            {va}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: 6,
                              background: "var(--color-background-secondary)",
                              borderRadius: 3,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${va === vb ? 50 : aBetter ? 70 : 30}%`,
                                background: aBetter
                                  ? tA.color
                                  : bBetter
                                    ? tB.color
                                    : "var(--color-border-secondary)",
                                borderRadius: 3,
                                transition: "width 0.3s",
                              }}
                            ></div>
                          </div>
                          <span
                            style={{
                              fontSize: 10,
                              color: "var(--color-text-tertiary)",
                              minWidth: 50,
                              textAlign: "center",
                            }}
                          >
                            {label}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: 6,
                              background: "var(--color-background-secondary)",
                              borderRadius: 3,
                              overflow: "hidden",
                              transform: "scaleX(-1)",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${va === vb ? 50 : bBetter ? 70 : 30}%`,
                                background: bBetter
                                  ? tB.color
                                  : aBetter
                                    ? tA.color
                                    : "var(--color-border-secondary)",
                                borderRadius: 3,
                                transition: "width 0.3s",
                              }}
                            ></div>
                          </div>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: bBetter
                                ? tB.color
                                : "var(--color-text-primary)",
                              minWidth: 40,
                            }}
                          >
                            {vb}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Match history */}
                  {h2hStats.played.length > 0 && (
                    <div
                      style={{
                        background: "var(--color-background-primary)",
                        borderRadius: 12,
                        border: "0.5px solid var(--color-border-tertiary)",
                        padding: "1rem",
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--color-text-secondary)",
                          marginBottom: 10,
                          letterSpacing: 1,
                        }}
                      >
                        MATCH HISTORY
                      </div>
                      {h2hStats.played.map((match) => {
                        const res = match.result,
                          wt = teamMap[res.winner];
                        return (
                          <div
                            key={match.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "7px 0",
                              borderBottom:
                                "0.5px solid var(--color-border-tertiary)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 10,
                                color: "var(--color-text-tertiary)",
                                minWidth: 48,
                              }}
                            >
                              {match.date}
                            </div>
                            <div style={{ flex: 1, fontSize: 12 }}>
                              <span
                                style={{
                                  color:
                                    match.a === res.winner
                                      ? teamMap[match.a].color
                                      : "var(--color-text-secondary)",
                                  fontWeight:
                                    match.a === res.winner ? 700 : 400,
                                }}
                              >
                                {teamMap[match.a].short}
                              </span>
                              <span
                                style={{
                                  color: "var(--color-text-tertiary)",
                                  margin: "0 6px",
                                }}
                              >
                                vs
                              </span>
                              <span
                                style={{
                                  color:
                                    match.b === res.winner
                                      ? teamMap[match.b].color
                                      : "var(--color-text-secondary)",
                                  fontWeight:
                                    match.b === res.winner ? 700 : 400,
                                }}
                              >
                                {teamMap[match.b].short}
                              </span>
                            </div>
                            {res.scoreA?.runs && (
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "var(--color-text-tertiary)",
                                }}
                              >
                                {fmtScore(res.scoreA)} · {fmtScore(res.scoreB)}
                              </div>
                            )}
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: wt.color,
                                minWidth: 50,
                                textAlign: "right",
                              }}
                            >
                              {wt.short} won
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Upcoming */}
                  {h2hStats.remaining.length > 0 && (
                    <div
                      style={{
                        background: "var(--color-background-primary)",
                        borderRadius: 12,
                        border: "0.5px solid var(--color-border-tertiary)",
                        padding: "1rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--color-text-secondary)",
                          marginBottom: 10,
                          letterSpacing: 1,
                        }}
                      >
                        UPCOMING
                      </div>
                      {h2hStats.remaining.map((match) => (
                        <div
                          key={match.id}
                          onClick={() => setModalMatch(match)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 10px",
                            borderRadius: 8,
                            cursor: "pointer",
                            marginBottom: 4,
                            border: "0.5px solid var(--color-border-tertiary)",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--color-background-secondary)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <div
                            style={{
                              fontSize: 10,
                              color: "var(--color-text-tertiary)",
                              minWidth: 48,
                            }}
                          >
                            {match.date}
                          </div>
                          <div
                            style={{ flex: 1, fontSize: 12, fontWeight: 500 }}
                          >
                            <span style={{ color: tA.color }}>{tA.short}</span>
                            <span
                              style={{
                                color: "var(--color-text-tertiary)",
                                margin: "0 6px",
                              }}
                            >
                              vs
                            </span>
                            <span style={{ color: tB.color }}>{tB.short}</span>
                          </div>
                          <span style={{ fontSize: 11, color: C }}>
                            M{match.id} · Click to enter →
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
