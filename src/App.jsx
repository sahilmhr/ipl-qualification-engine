import { useState, useMemo, useCallback, useEffect } from "react";

// ─── TEAMS & FIXTURES ────────────────────────────────────────────────────────
const TEAMS = [
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
function buildFixtures() {
  return RAW.map(([id, a, b, date]) => ({
    id,
    a,
    b,
    date,
    result: null,
    scoreA: { runs: "", wickets: "", overs: "" },
    scoreB: { runs: "", wickets: "", overs: "" },
  }));
}

// ─── CORE MATH ───────────────────────────────────────────────────────────────
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

// ─── FEATURE: SCENARIO SIMULATOR ─────────────────────────────────────────────
// Returns a copy of fixtures with hypothetical results applied
function applyScenario(fixtures, scenario) {
  return fixtures.map((f) => {
    if (f.result || !scenario[f.id]) return f;
    return { ...f, result: scenario[f.id] };
  });
}

// ─── FEATURE: CRITICAL MATCHES ───────────────────────────────────────────────
// For a team, find which unplayed matches matter most to their qualification
function findCriticalMatches(teamId, fixtures) {
  const critical = [];
  const unplayed = fixtures.filter((f) => !f.result);
  for (const match of unplayed) {
    const involvesTeam = match.a === teamId || match.b === teamId;
    const rival = involvesTeam
      ? match.a === teamId
        ? match.b
        : match.a
      : null;
    // Simulate: what if team wins this match (if they play) vs loses
    // or what if a rival wins vs loses (if team not involved)
    if (involvesTeam) {
      // Simulate team winning
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
      // Simulate team losing
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
  }
  return critical.sort((a, b) => b.impact - a.impact).slice(0, 5);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function fmtNRR(n) {
  if (!n && n !== 0) return "+0.000";
  return (n >= 0 ? "+" : "") + n.toFixed(3);
}
function fmtScore(sc) {
  if (!sc || !sc.runs) return "—";
  return `${sc.runs}/${sc.wickets || 0} (${sc.overs || 0})`;
}

const TABS = ["Standings", "Fixtures", "Qualify", "Simulator", "Head-to-Head"];

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
  };
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000b",
        zIndex: 100,
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
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              <span style={{ color: tA.color }}>{tA.name}</span>{" "}
              <span
                style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}
              >
                vs
              </span>{" "}
              <span style={{ color: tB.color }}>{tB.name}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 18,
              cursor: "pointer",
              color: "var(--color-text-secondary)",
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[
            ["win", "Result"],
            ["nr", "No Result"],
          ].map(([m, l]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                ...btn,
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
                style={{ color: "var(--color-text-tertiary)", fontSize: 10 }}
              >
                (optional — for NRR)
              </span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                [tA, scoreA, setScoreA],
                [tB, scoreB, setScoreB],
              ].map(([t, sc, setSc]) => (
                <div key={t.id} style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--color-text-tertiary)",
                      marginBottom: 4,
                    }}
                  >
                    {t.short}
                  </div>
                  <div style={{ display: "flex", gap: 3 }}>
                    {[
                      ["Runs", "runs", "60px"],
                      ["Wkts", "wickets", "44px"],
                      ["Ovs", "overs", "48px"],
                    ].map(([ph, k, w]) => (
                      <input
                        key={k}
                        type="number"
                        placeholder={ph}
                        value={sc[k]}
                        onChange={(e) => setSc({ ...sc, [k]: e.target.value })}
                        style={{
                          width: w,
                          padding: "4px 5px",
                          borderRadius: 5,
                          border: "0.5px solid var(--color-border-secondary)",
                          background: "var(--color-background-tertiary)",
                          color: "var(--color-text-primary)",
                          fontSize: 12,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
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
                borderColor: "#e24b4a66",
                color: "#e24b4a",
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
export default function App() {
  const [fixtures, setFixtures] = useState(() => {
    const saved = localStorage.getItem("fixtures");
    return saved ? JSON.parse(saved) : buildFixtures();
  });
  const [tab, setTab] = useState("Standings");
  const [selectedTeam, setSelectedTeam] = useState("MI");
  const [qualResult, setQualResult] = useState(null);
  const [computing, setComputing] = useState(false);
  const [matchPage, setMatchPage] = useState(0);
  const [filterTeam, setFilterTeam] = useState("ALL");
  const [modalMatch, setModalMatch] = useState(null);
  // Scenario simulator state
  const [scenario, setScenario] = useState({}); // matchId -> {type,winner}
  const [simTeam, setSimTeam] = useState("CSK");
  // H2H state
  const [h2hA, setH2hA] = useState("RCB");
  const [h2hB, setH2hB] = useState("SRH");
  const PER_PAGE = 14;

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

  // Critical matches (memoized, computed lazily when tab is Qualify)
  const criticalMatches = useMemo(() => {
    if (tab !== "Qualify" || !qualResult) return [];
    return findCriticalMatches(selectedTeam, fixtures, standings);
  }, [tab, qualResult, selectedTeam, fixtures, standings]);

  // Simulation
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

  const allQual = useMemo(() => {
    if (tab !== "Standings") return null;
    const res = {};
    TEAMS.forEach((t) => {
      const q = computeQualification(t.id, fixtures, standings);
      res[t.id] = q;
    });
    return res;
  }, [tab, fixtures, standings]);

  // H2H stats
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
    const aWins = played.filter((f) => f.result.winner === h2hA).length;
    const bWins = played.filter((f) => f.result.winner === h2hB).length;
    return { played, remaining, aWins, bWins };
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

  // Unplayed fixtures for simulator
  const unplayedForSim = fixtures.filter((f) => !f.result);

  const C = "#EA580C",
    Y = "#FBBF24",
    G = "#22c55e",
    R = "#ef4444";

  useEffect(() => {
    localStorage.setItem("fixtures", JSON.stringify(fixtures));
  }, [fixtures]);

  function exportData() {
    const data = localStorage.getItem("fixtures");

    if (!data) {
      alert("No data to export");
      return;
    }

    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ipl-fixtures.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        // basic sanity check
        if (!Array.isArray(data)) {
          throw new Error("Invalid format");
        }

        localStorage.setItem("fixtures", JSON.stringify(data));
        setFixtures(data);
      } catch (err) {
        alert("Invalid file");
        console.error(err);
      }
    };

    reader.readAsText(file);
  }

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

      {/* Header */}
      <div
        style={{
          background: "#0a0a0a",
          padding: "1.1rem 1.5rem 0.8rem",
          borderBottom: `2px solid ${C}`,
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 5,
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
            <div>
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
            <span>{played}/70 results</span>
            <span style={{ color: Y }}>
              ● NRR · No Result · Max-flow · Scenario Sim
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          background: "#0a0a0a",
          borderBottom: "1px solid #1a1a1a",
          position: "sticky",
          top: 0,
          zIndex: 50,
          overflowX: "auto",
        }}
      >
        <div
          style={{
            maxWidth: 980,
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
                padding: "10px 18px",
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
              {t === "Head-to-Head" ? "H2H" : t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "1.1rem 1rem" }}>
        {/* ══════════════════════════════════════════════════════════════
            TAB 1: STANDINGS  (+ live qual status for ALL teams)
        ══════════════════════════════════════════════════════════════ */}
        {tab === "Standings" && (
          <div>
            <div
              style={{
                background: "var(--color-background-primary)",
                borderRadius: 12,
                border: "0.5px solid var(--color-border-tertiary)",
                overflow: "hidden",
                marginBottom: 10,
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
                  <tr style={{ background: "#0a0a0a" }}>
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
                      "Qual Status",
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
                    let statusEl;
                    if (q?.alreadyGuaranteed)
                      statusEl = (
                        <span
                          style={{
                            background: "#22c55e22",
                            color: G,
                            padding: "2px 7px",
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          ✓ Guaranteed
                        </span>
                      );
                    else if (q?.impossible)
                      statusEl = (
                        <span
                          style={{
                            background: "#ef444422",
                            color: R,
                            padding: "2px 7px",
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          ✗ Eliminated
                        </span>
                      );
                    else if (q)
                      statusEl = (
                        <span
                          style={{
                            background: `${C}22`,
                            color: C,
                            padding: "2px 7px",
                            borderRadius: 4,
                            fontSize: 10,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Need {q.minAdditionalWins}W more
                        </span>
                      );
                    else
                      statusEl = (
                        <span
                          style={{
                            color: "var(--color-text-tertiary)",
                            fontSize: 10,
                          }}
                        >
                          —
                        </span>
                      );
                    return (
                      <tr
                        key={team.id}
                        style={{
                          background: inTop4 ? "#EA580C09" : "transparent",
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
                                color: "var(--color-text-primary)",
                                fontSize: 12,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {team.name}
                            </span>
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
                          {statusEl}
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
                lineHeight: 1.6,
              }}
            >
              Pts = Points · Max W = maximum possible wins · Qual Status
              computed via max-flow for all teams · NRR as tiebreaker
            </div>
            <button
              onClick={exportData}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                background: "#EA580C",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#D4550A")}
              onMouseLeave={(e) => (e.target.style.background = "#EA580C")}
            >
              Export Data
            </button>
            <label
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "0.5px solid var(--color-border-secondary)",
                background: "var(--color-background-primary)",
                color: "var(--color-text-primary)",
                fontSize: 13,
                cursor: "pointer",
                transition: "border-color 0.2s",
                display: "inline-block",
              }}
              onMouseEnter={(e) => (e.target.style.borderColor = "#EA580C")}
              onMouseLeave={(e) =>
                (e.target.style.borderColor = "var(--color-border-secondary)")
              }
            >
              Import Data
              <input
                type="file"
                accept="application/json"
                onChange={importData}
                style={{ display: "none" }}
              />
            </label>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 2: FIXTURES
        ══════════════════════════════════════════════════════════════ */}
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
                        ? "0.5px solid #94a3b888"
                        : isWin
                          ? "0.5px solid #22c55e44"
                          : "0.5px solid var(--color-border-tertiary)",
                      padding: "9px 13px",
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      cursor: "pointer",
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
                          Click to add
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

        {/* ══════════════════════════════════════════════════════════════
            TAB 3: QUALIFY (+ critical matches)
        ══════════════════════════════════════════════════════════════ */}
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
                      padding: "6px 11px",
                      border: "1.5px solid",
                      borderRadius: 7,
                      cursor: "pointer",
                      fontSize: 12,
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
              }}
            >
              {computing
                ? "⏳ Running max-flow...`"
                : `▶  Compute Qualification for ${teamMap[selectedTeam].name}`}
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
                      {impossible ? (
                        <>
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 700,
                              color: R,
                              marginBottom: 5,
                            }}
                          >
                            Cannot Guarantee Top 4
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--color-text-secondary)",
                              lineHeight: 1.7,
                            }}
                          >
                            Even with all {remaining} remaining wins (
                            {currentWins + remaining} total), 4+ rivals can
                            still simultaneously exceed that.
                          </div>
                        </>
                      ) : alreadyGuaranteed ? (
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
                            Mathematically impossible for 4 rivals to each reach{" "}
                            {currentWins + 1}+ wins. {team.short} is in Top 4
                            regardless of all future results.
                          </div>
                        </>
                      ) : (
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
                            {targetWins} total
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--color-text-secondary)",
                              lineHeight: 1.7,
                            }}
                          >
                            At {targetWins} wins, no 4 rivals can simultaneously
                            exceed this given{" "}
                            {fixtures.filter((f) => !f.result).length} remaining
                            fixtures.
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
                          WIN TRACKER
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
                                        ? "#ffffff18"
                                        : "#ffffff08",
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
                                background: "#ffffff18",
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

                    {/* ── CRITICAL MATCHES (new!) ── */}
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
                        {criticalMatches.map(
                          ({
                            match,
                            impact,
                            winsNeededWin,
                            winsNeededLoss,
                          }) => {
                            const tA = teamMap[match.a],
                              tB = teamMap[match.b];
                            return (
                              <div
                                key={match.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  marginBottom: 8,
                                  padding: "8px 10px",
                                  background:
                                    "var(--color-background-secondary)",
                                  borderRadius: 8,
                                  cursor: "pointer",
                                }}
                                onClick={() => setModalMatch(match)}
                              >
                                <div style={{ flexShrink: 0 }}>
                                  <div
                                    style={{
                                      fontSize: 10,
                                      color: "var(--color-text-tertiary)",
                                    }}
                                  >
                                    M{match.id}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 10,
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
                                <div
                                  style={{ textAlign: "right", fontSize: 11 }}
                                >
                                  <div style={{ color: G, marginBottom: 1 }}>
                                    Win → need{" "}
                                    {winsNeededWin === 0
                                      ? "0 (✓ done)"
                                      : winsNeededWin === 99
                                        ? "impossible"
                                        : `${winsNeededWin} more`}
                                  </div>
                                  <div style={{ color: R }}>
                                    Loss → need{" "}
                                    {winsNeededLoss === 0
                                      ? "0 (✓ done)"
                                      : winsNeededLoss === 99
                                        ? "impossible"
                                        : `${winsNeededLoss} more`}
                                  </div>
                                </div>
                                <div
                                  style={{
                                    background:
                                      impact > 0 ? `${G}22` : `${R}22`,
                                    color: impact > 0 ? G : R,
                                    padding: "3px 8px",
                                    borderRadius: 5,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    flexShrink: 0,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {impact > 0 ? `+${impact}` : impact} impact
                                </div>
                              </div>
                            );
                          },
                        )}
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--color-text-tertiary)",
                            marginTop: 4,
                          }}
                        >
                          Impact = extra wins needed if you lose vs win this
                          match. Click a match to enter result.
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
                                  background: "#ffffff11",
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
                                  width: 50,
                                  textAlign: "right",
                                  fontSize: 10,
                                  color: "var(--color-text-secondary)",
                                }}
                              >
                                {s.wins}W+{tr}
                              </span>
                              <span
                                style={{
                                  width: 50,
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

        {/* ══════════════════════════════════════════════════════════════
            TAB 4: SCENARIO SIMULATOR  🆕
        ══════════════════════════════════════════════════════════════ */}
        {tab === "Simulator" && (
          <div>
            {/* Intro */}
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
                Hypothetically set outcomes for any unplayed matches below. The
                standings and qualification status update live — without
                affecting your real data. Compare how the table looks under
                different scenarios.
              </div>
            </div>

            {/* Team selector for sim qual check */}
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
              >
                Analyse qualification for:
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
              <button
                onClick={() => setScenario({})}
                style={{
                  marginLeft: "auto",
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: `0.5px solid ${R}66`,
                  background: "transparent",
                  color: R,
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Reset Scenario
              </button>
            </div>

            {/* Side-by-side: current vs simulated standings */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 14,
              }}
            >
              {[
                ["Current Standings", rankedTeams, standings, false],
                ["Simulated Standings", simRanked, simStandings, true],
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
                      background: isSim ? "#EA580C18" : "#0a0a0a",
                      padding: "8px 10px",
                      fontSize: 10,
                      fontWeight: 600,
                      color: isSim ? C : Y,
                      letterSpacing: 1,
                    }}
                  >
                    {label}
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
                          background: inTop4 ? "#EA580C06" : "transparent",
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
                              fontSize: 10,
                              color: C,
                              background: `${C}22`,
                              padding: "1px 5px",
                              borderRadius: 3,
                            }}
                          >
                            ↑sim
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Sim qual result */}
            {(() => {
              const simQ = computeQualification(
                simTeam,
                simFixtures,
                simStandings,
              );
              const team = teamMap[simTeam];
              const vc = simQ.impossible ? R : simQ.alreadyGuaranteed ? G : C;
              const scenarioCount =
                Object.values(scenario).filter(Boolean).length;
              return (
                <div
                  style={{
                    background: "var(--color-background-primary)",
                    borderRadius: 10,
                    border: `1.5px solid ${vc}`,
                    padding: "0.9rem 1.1rem",
                    marginBottom: 14,
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
                    SIMULATED QUALIFICATION — {team.short} ({scenarioCount}{" "}
                    hypothetical result{scenarioCount !== 1 ? "s" : ""} applied)
                  </div>
                  {simQ.impossible ? (
                    <div style={{ fontSize: 14, fontWeight: 700, color: R }}>
                      Cannot guarantee even in this scenario
                    </div>
                  ) : simQ.alreadyGuaranteed ? (
                    <div style={{ fontSize: 14, fontWeight: 700, color: G }}>
                      Guaranteed in this scenario ✓
                    </div>
                  ) : (
                    <div style={{ fontSize: 14, fontWeight: 700, color: C }}>
                      Still needs {simQ.minAdditionalWins} more win
                      {simQ.minAdditionalWins !== 1 ? "s" : ""} in this scenario
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Unplayed match toggles for scenario */}
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-secondary)",
                marginBottom: 8,
              }}
            >
              Set hypothetical outcomes for unplayed matches:
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
                        return (
                          <button
                            key={tid}
                            onClick={() =>
                              setScenario((p) =>
                                sc?.winner === tid
                                  ? { ...p, [match.id]: undefined }
                                  : {
                                      ...p,
                                      [match.id]: {
                                        type: "win",
                                        winner: tid,
                                        scoreA: {
                                          runs: "",
                                          wickets: "",
                                          overs: "",
                                        },
                                        scoreB: {
                                          runs: "",
                                          wickets: "",
                                          overs: "",
                                        },
                                      },
                                    },
                              )
                            }
                            style={{
                              padding: "4px 10px",
                              border: "0.5px solid",
                              borderRadius: 5,
                              cursor: "pointer",
                              fontSize: 11,
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

        {/* ══════════════════════════════════════════════════════════════
            TAB 5: HEAD-TO-HEAD  🆕
        ══════════════════════════════════════════════════════════════ */}
        {tab === "Head-to-Head" && (
          <div>
            {/* Team pickers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 14,
              }}
            >
              {[
                [h2hA, setH2hA, "Team A"],
                [h2hB, setH2hB, "Team B"],
              ].map(([val, setter, label], pi) => (
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
                    {TEAMS.filter((t) => t.id !== (pi === 0 ? h2hB : h2hA)).map(
                      (t) => (
                        <button
                          key={t.id}
                          onClick={() => setter(t.id)}
                          style={{
                            padding: "4px 9px",
                            border: "1px solid",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 11,
                            background: val === t.id ? t.color : "transparent",
                            color:
                              val === t.id
                                ? "#fff"
                                : "var(--color-text-primary)",
                            borderColor:
                              val === t.id
                                ? t.color
                                : "var(--color-border-secondary)",
                            fontWeight: val === t.id ? 600 : 400,
                          }}
                        >
                          {t.short}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* H2H summary banner */}
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
                  {/* Big head-to-head card */}
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
                      </div>
                      <div style={{ textAlign: "center", padding: "0 12px" }}>
                        <div
                          style={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: "var(--color-text-primary)",
                            letterSpacing: 2,
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
                          {h2hStats.remaining.length} remaining
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
                      </div>
                    </div>

                    {/* Win share bar */}
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
                          <div
                            style={{
                              flex: 1,
                              background: tB.color,
                              transition: "width 0.4s",
                            }}
                          ></div>
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
                          <span>Win share</span>
                          <span style={{ color: tB.color, fontWeight: 600 }}>
                            {Math.round(100 - aPct)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stat comparison */}
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
                      SEASON COMPARISON
                    </div>
                    {[
                      ["Points", sA.points, sB.points],
                      [`Wins`, sA.wins, sB.wins],
                      ["Losses", sA.losses, sB.losses, true],
                      ["NRR", sA.nrr?.toFixed(3), sB.nrr?.toFixed(3)],
                      [
                        "Remaining",
                        fixtures.filter(
                          (f) => !f.result && (f.a === h2hA || f.b === h2hA),
                        ).length,
                        fixtures.filter(
                          (f) => !f.result && (f.a === h2hB || f.b === h2hB),
                        ).length,
                      ],
                    ].map(([label, va, vb, invertWinner]) => {
                      const aNum = parseFloat(va),
                        bNum = parseFloat(vb);
                      const aBetter = invertWinner ? aNum < bNum : aNum > bNum,
                        bBetter = invertWinner ? bNum < aNum : bNum > aNum;
                      return (
                        <div
                          key={label}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
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
                              minWidth: 36,
                              textAlign: "right",
                            }}
                          >
                            {va}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              position: "relative",
                              height: 6,
                              background: "var(--color-background-secondary)",
                              borderRadius: 3,
                            }}
                          >
                            <div
                              style={{
                                height: 6,
                                borderRadius: 3,
                                background: aBetter
                                  ? tA.color
                                  : bBetter
                                    ? tB.color
                                    : "var(--color-border-secondary)",
                                width: `${Math.abs(aNum - bNum) === 0 ? 50 : aBetter ? 70 : 30}%`,
                              }}
                            ></div>
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--color-text-tertiary)",
                              minWidth: 60,
                              textAlign: "center",
                            }}
                          >
                            {label}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              position: "relative",
                              height: 6,
                              background: "var(--color-background-secondary)",
                              borderRadius: 3,
                              transform: "scaleX(-1)",
                            }}
                          >
                            <div
                              style={{
                                height: 6,
                                borderRadius: 3,
                                background: bBetter
                                  ? tB.color
                                  : aBetter
                                    ? tA.color
                                    : "var(--color-border-secondary)",
                                width: `${Math.abs(aNum - bNum) === 0 ? 50 : bBetter ? 70 : 30}%`,
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
                              minWidth: 36,
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
                        MATCH HISTORY THIS SEASON
                      </div>
                      {h2hStats.played.map((match) => {
                        const res = match.result;
                        const winnerTeam = teamMap[res.winner];
                        return (
                          <div
                            key={match.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "8px 0",
                              borderBottom:
                                "0.5px solid var(--color-border-tertiary)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 10,
                                color: "var(--color-text-tertiary)",
                                minWidth: 50,
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
                                color: winnerTeam.color,
                                minWidth: 50,
                                textAlign: "right",
                              }}
                            >
                              {winnerTeam.short} won
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Remaining fixtures */}
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
                        UPCOMING FIXTURES
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
                              minWidth: 50,
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
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--color-text-tertiary)",
                            }}
                          >
                            M{match.id} · Click to enter result →
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
