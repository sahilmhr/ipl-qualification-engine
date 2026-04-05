import { useState, useMemo, useCallback, useEffect } from "react";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const TEAMS = [
  {
    id: "RCB",
    name: "Royal Challengers Bengaluru",
    short: "RCB",
    color: "#EC1C24",
  },
  { id: "MI", name: "Mumbai Indians", short: "MI", color: "#1D4ED8" },
  { id: "RR", name: "Rajasthan Royals", short: "RR", color: "#C026D3" },
  { id: "PBKS", name: "Punjab Kings", short: "PBKS", color: "#DC2626" },
  { id: "LSG", name: "Lucknow Super Giants", short: "LSG", color: "#0EA5E9" },
  { id: "KKR", name: "Kolkata Knight Riders", short: "KKR", color: "#7C3AED" },
  { id: "CSK", name: "Chennai Super Kings", short: "CSK", color: "#D97706" },
  { id: "DC", name: "Delhi Capitals", short: "DC", color: "#2563EB" },
  { id: "GT", name: "Gujarat Titans", short: "GT", color: "#16A34A" },
  { id: "SRH", name: "Sunrisers Hyderabad", short: "SRH", color: "#EA580C" },
];

// Official TATA IPL 2026 — 70 matches from the PDF
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

// result types
// null = unplayed
// { type:"win", winner, scoreA:{r,w,ov}, scoreB:{r,w,ov} }   — normal win with scores
//   winner bats first or second — we encode: teamA=home, teamB=away
//   NRR contribution: winner's RR - loser's RR over full match overs
// { type:"nr" }  — No Result / washed out (1 point each, 0 NRR impact)

function buildFixtures() {
  return RAW.map(([id, a, b, date]) => ({
    id,
    a,
    b,
    date,
    result: null,
    // score inputs stored separately for UI state
    scoreA: { runs: "", wickets: "", overs: "" },
    scoreB: { runs: "", wickets: "", overs: "" },
    // which team batted first
    batFirst: null, // "a" | "b"
  }));
}

// ─── NRR HELPERS ────────────────────────────────────────────────────────────
// IPL NRR = (total runs scored / total overs faced) - (total runs conceded / total overs faced)
// Per match: runRate = runs / overs
// NRR impact per team per match = their RR - opponent RR (winner gets positive, loser negative)
// We accumulate across all matches.

function parseOvers(ov) {
  // "19.3" → 19 + 3/6 = 19.5 actual overs
  const s = String(ov);
  const [full, balls = "0"] = s.split(".");
  return parseInt(full || 0) + parseInt(balls) / 6;
}

// Compute standings with NRR from fixture list
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
      // No Result — 1 point each, no NRR impact
      s[f.a].nrs++;
      s[f.a].played++;
      s[f.a].points++;
      s[f.b].nrs++;
      s[f.b].played++;
      s[f.b].points++;
      return;
    }

    // Normal win result
    const { winner, scoreA, scoreB } = f.result;
    const loser = winner === f.a ? f.b : f.a;
    s[winner].wins++;
    s[winner].played++;
    s[winner].points += 2;
    s[loser].losses++;
    s[loser].played++;

    // NRR: accumulate runs and overs
    const rA = Number(scoreA.runs),
      ovA = parseOvers(scoreA.overs);
    const rB = Number(scoreB.runs),
      ovB = parseOvers(scoreB.overs);

    if (ovA > 0 && ovB > 0) {
      // Team A stats
      s[f.a].runsFor += rA;
      s[f.a].oversFor += ovA;
      s[f.a].runsAgainst += rB;
      s[f.a].oversAgainst += ovB;
      // Team B stats
      s[f.b].runsFor += rB;
      s[f.b].oversFor += ovB;
      s[f.b].runsAgainst += rA;
      s[f.b].oversAgainst += ovA;
    }
  });

  // Compute NRR
  Object.keys(s).forEach((tid) => {
    const t = s[tid];
    const rrFor = t.oversFor > 0 ? t.runsFor / t.oversFor : 0;
    const rrAgainst = t.oversAgainst > 0 ? t.runsAgainst / t.oversAgainst : 0;
    t.nrr = rrFor - rrAgainst;
  });

  return s;
}

// ─── MAX-FLOW (Edmonds-Karp) ─────────────────────────────────────────────────
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

// NR matches count as 0.5 wins for "remaining" capacity in qualification logic
// We treat NR as giving each team 0.5 effective "win slots" — but since we work
// in integers, we treat NR matches as not giving wins to either team.
// The qualification algo ignores NRR and uses wins only (as per spec).
function canFourTeamsExceed(teamId, threshold, fixtures, standings) {
  const others = TEAMS.map((t) => t.id).filter((id) => id !== teamId);
  // Remaining decisive matches (unplayed, not NR) not involving teamId
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

// ─── UI HELPERS ─────────────────────────────────────────────────────────────
const teamMap = Object.fromEntries(TEAMS.map((t) => [t.id, t]));
const TABS = ["Standings", "Fixtures", "Qualify"];

function fmtNRR(n) {
  if (n === undefined || n === null || isNaN(n)) return "+0.000";
  return (n >= 0 ? "+" : "") + n.toFixed(3);
}

function ScoreInput({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
      <div
        style={{
          fontSize: 10,
          color: "var(--color-text-tertiary)",
          letterSpacing: 1,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <input
          type="number"
          placeholder="Runs"
          value={value.runs}
          onChange={(e) => onChange({ ...value, runs: e.target.value })}
          style={{
            width: "100%",
            padding: "4px 6px",
            borderRadius: 5,
            border: "0.5px solid var(--color-border-secondary)",
            background: "var(--color-background-tertiary)",
            color: "var(--color-text-primary)",
            fontSize: 12,
          }}
        />
        <input
          type="number"
          placeholder="Wkts"
          value={value.wickets}
          min={0}
          max={10}
          onChange={(e) => onChange({ ...value, wickets: e.target.value })}
          style={{
            width: 52,
            padding: "4px 6px",
            borderRadius: 5,
            border: "0.5px solid var(--color-border-secondary)",
            background: "var(--color-background-tertiary)",
            color: "var(--color-text-primary)",
            fontSize: 12,
          }}
        />
        <input
          type="text"
          placeholder="Ovs"
          value={value.overs}
          onChange={(e) => onChange({ ...value, overs: e.target.value })}
          style={{
            width: 56,
            padding: "4px 6px",
            borderRadius: 5,
            border: "0.5px solid var(--color-border-secondary)",
            background: "var(--color-background-tertiary)",
            color: "var(--color-text-primary)",
            fontSize: 12,
          }}
        />
      </div>
    </div>
  );
}

// Score display string e.g. "186/4 (20.0)"
function fmtScore(sc) {
  if (!sc || !sc.runs) return "—";
  return `${sc.runs}/${sc.wickets || 0} (${sc.overs || 0})`;
}

// ─── MATCH RESULT MODAL ──────────────────────────────────────────────────────
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

  const hasScores =
    scoreA.runs !== "" &&
    scoreB.runs !== "" &&
    scoreA.overs !== "" &&
    scoreB.overs !== "";

  function handleSave() {
    if (mode === "nr") {
      onSave({ type: "nr" });
    } else {
      onSave({ type: "win", winner, scoreA, scoreB });
    }
    onClose();
  }

  const btnBase = {
    padding: "7px 14px",
    border: "0.5px solid",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    transition: "all 0.1s",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000a",
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
          width: "min(480px, 95vw)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
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
                  margin: "0 6px",
                  fontWeight: 400,
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
              fontSize: 18,
              cursor: "pointer",
              color: "var(--color-text-secondary)",
              padding: "0 4px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[
            ["win", "Result"],
            ["nr", "No Result / Washed Out"],
          ].map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                ...btnBase,
                background:
                  mode === m
                    ? m === "nr"
                      ? "#64748b"
                      : "#F26522"
                    : "transparent",
                color: mode === m ? "#fff" : "var(--color-text-secondary)",
                borderColor:
                  mode === m
                    ? m === "nr"
                      ? "#64748b"
                      : "#F26522"
                    : "var(--color-border-secondary)",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "nr" ? (
          <div
            style={{
              padding: "14px",
              background: "var(--color-background-secondary)",
              borderRadius: 10,
              textAlign: "center",
              fontSize: 13,
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
            }}
          >
            Match abandoned / washed out.
            <br />
            <strong style={{ color: "var(--color-text-primary)" }}>
              Both teams receive 1 point.
            </strong>
            <br />
            No NRR impact. No win or loss recorded.
          </div>
        ) : (
          <div>
            {/* Winner */}
            <div style={{ marginBottom: 14 }}>
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
              <div style={{ display: "flex", gap: 8 }}>
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
                      <span
                        style={{
                          display: "inline-block",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: winner === tid ? "#fff" : t.color,
                          marginRight: 6,
                        }}
                      ></span>
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scores */}
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
                  fontWeight: 400,
                  fontSize: 10,
                }}
              >
                (optional — needed for NRR)
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <ScoreInput
                label={`${tA.short} Score`}
                value={scoreA}
                onChange={setScoreA}
              />
              <ScoreInput
                label={`${tB.short} Score`}
                value={scoreB}
                onChange={setScoreB}
              />
            </div>
            {!hasScores && (scoreA.runs !== "" || scoreB.runs !== "") && (
              <div style={{ fontSize: 11, color: "#F9CD05", marginBottom: 10 }}>
                ⚠ Enter both teams' runs and overs for NRR to be calculated.
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              ...btnBase,
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
                ...btnBase,
                background: "transparent",
                borderColor: "#e24b4a66",
                color: "#e24b4a",
              }}
            >
              Clear
            </button>
          )}
          <button
            onClick={handleSave}
            style={{
              flex: 2,
              ...btnBase,
              background: "#F26522",
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

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [fixtures, setFixtures] = useState(() => {
    const stored = localStorage.getItem("fixtures");
    return stored ? JSON.parse(stored) : buildFixtures();
  });
  const [tab, setTab] = useState("Standings");
  const [selectedTeam, setSelectedTeam] = useState("MI");
  const [qualResult, setQualResult] = useState(null);
  const [computing, setComputing] = useState(false);
  const [matchPage, setMatchPage] = useState(0);
  const [filterTeam, setFilterTeam] = useState("ALL");
  const [modalMatch, setModalMatch] = useState(null);
  const PER_PAGE = 14;

  const standings = useMemo(() => computeStandings(fixtures), [fixtures]);
  const rankedTeams = useMemo(
    () =>
      [...TEAMS].sort((a, b) => {
        const sa = standings[a.id],
          sb = standings[b.id];
        if (sb.points !== sa.points) return sb.points - sa.points;
        return (sb.nrr || 0) - (sa.nrr || 0); // NRR as tiebreaker in display
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

<button onClick={exportData}>Export Data</button>

<input type="file" accept="application/json" onChange={importData} />

      {/* Modal */}
      {modalMatch && (
        <MatchModal
          match={modalMatch}
          onSave={(result) => saveResult(modalMatch.id, result)}
          onClose={() => setModalMatch(null)}
        />
      )}

      {/* Header */}
      <div
        style={{
          background: "#0a0a0a",
          padding: "1.25rem 1.5rem 0.9rem",
          borderBottom: "2px solid #EA580C",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
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
                width: 36,
                height: 36,
                background: "#EA580C",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: "#fff",
                fontSize: 18,
              }}
            >
              ♦
            </div>
            <div>
              <div
                style={{
                  fontSize: 19,
                  fontWeight: 700,
                  color: "#FBBF24",
                  letterSpacing: 1,
                }}
              >
                TATA IPL 2026
              </div>
              <div
                style={{ fontSize: 10, color: "#EA580Caa", letterSpacing: 3 }}
              >
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
            <span style={{ color: "#22c55e" }}>
              ✓ Official 70-match schedule
            </span>
            <span>{played}/70 results entered</span>
            <span style={{ color: "#FBBF24" }}>
              ● NRR · No Result · Max-flow C(9,4)
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
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex" }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "10px 22px",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "sans-serif",
                background: tab === t ? "#EA580C" : "transparent",
                color: tab === t ? "#fff" : "#666",
                fontWeight: tab === t ? 600 : 400,
                borderBottom:
                  tab === t ? "2px solid #FBBF24" : "2px solid transparent",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "1.25rem 1rem" }}>
        {/* ══ STANDINGS ══ */}
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
                  fontSize: 13,
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
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 8px",
                          textAlign: h === "Team" ? "left" : "center",
                          fontWeight: 500,
                          fontSize: 11,
                          color: "#FBBF24",
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
                    const inTop4 = idx < 4;
                    const nrrColor =
                      s.nrr > 0
                        ? "#22c55e"
                        : s.nrr < 0
                          ? "#ef4444"
                          : "var(--color-text-secondary)";
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
                            padding: "10px 8px",
                            textAlign: "center",
                            fontWeight: 700,
                            color: inTop4
                              ? "#EA580C"
                              : "var(--color-text-secondary)",
                            fontSize: 14,
                          }}
                        >
                          {idx + 1}
                        </td>
                        <td style={{ padding: "10px 8px" }}>
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
                            <div>
                              <div
                                style={{
                                  fontWeight: 600,
                                  color: "var(--color-text-primary)",
                                  fontSize: 13,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {team.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "10px 8px",
                            textAlign: "center",
                            fontWeight: 700,
                            color: "#FBBF24",
                            fontSize: 15,
                          }}
                        >
                          {s.points}
                        </td>
                        <td
                          style={{
                            padding: "10px 8px",
                            textAlign: "center",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {s.played}
                        </td>
                        <td
                          style={{
                            padding: "10px 8px",
                            textAlign: "center",
                            fontWeight: 700,
                            color: "#22c55e",
                          }}
                        >
                          {s.wins}
                        </td>
                        <td
                          style={{
                            padding: "10px 8px",
                            textAlign: "center",
                            color: "#ef4444",
                          }}
                        >
                          {s.losses}
                        </td>
                        <td
                          style={{
                            padding: "10px 8px",
                            textAlign: "center",
                            color: "#94a3b8",
                          }}
                        >
                          {s.nrs}
                        </td>
                        <td
                          style={{
                            padding: "10px 8px",
                            textAlign: "center",
                            fontWeight: 500,
                            color: nrrColor,
                            fontVariantNumeric: "tabular-nums",
                            fontSize: 12,
                          }}
                        >
                          {fmtNRR(s.nrr)}
                        </td>
                        <td
                          style={{ padding: "10px 8px", textAlign: "center" }}
                        >
                          {inTop4 ? (
                            <span
                              style={{
                                background: "#22c55e22",
                                color: "#22c55e",
                                padding: "3px 8px",
                                borderRadius: 4,
                                fontSize: 10,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                              }}
                            >
                              Top 4
                            </span>
                          ) : (
                            <span
                              style={{
                                background: "#EA580C22",
                                color: "#EA580C",
                                padding: "3px 8px",
                                borderRadius: 4,
                                fontSize: 10,
                                whiteSpace: "nowrap",
                              }}
                            >
                              Chasing
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-tertiary)",
                lineHeight: 1.6,
              }}
            >
              Sorted by Points, then NRR as tiebreaker · NR = No Result (1 pt
              each) · NRR updates automatically as you enter scores in Fixtures
            </div>
          </div>
        )}

        {/* ══ FIXTURES ══ */}
        {tab === "Fixtures" && (
          <div>
            {/* Filter + pagination */}
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
                  padding: "7px 10px",
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
              <div
                style={{
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  padding: "0 4px",
                }}
              >
                {filtered.filter((f) => f.result).length}/{filtered.length} done
              </div>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => setMatchPage((p) => Math.max(0, p - 1))}
                disabled={matchPage === 0}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "0.5px solid var(--color-border-secondary)",
                  cursor: "pointer",
                  background: "var(--color-background-secondary)",
                  color: "var(--color-text-primary)",
                  fontSize: 13,
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
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "0.5px solid var(--color-border-secondary)",
                  cursor: "pointer",
                  background: "var(--color-background-secondary)",
                  color: "var(--color-text-primary)",
                  fontSize: 13,
                }}
              >
                →
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {paged.map((match) => {
                const tA = teamMap[match.a],
                  tB = teamMap[match.b];
                const res = match.result;
                const isNR = res?.type === "nr";
                const isWin = res?.type === "win";

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
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                      transition: "border-color 0.1s, background 0.1s",
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
                    {/* Match meta */}
                    <div style={{ minWidth: 46, flexShrink: 0 }}>
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

                    {/* Teams */}
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 13,
                          fontWeight:
                            isWin && res.winner === match.a ? 700 : 400,
                          color:
                            isWin && res.winner === match.a
                              ? "#22c55e"
                              : "var(--color-text-primary)",
                        }}
                      >
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: tA.color,
                            display: "inline-block",
                          }}
                        ></span>
                        {tA.short}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          color: "var(--color-text-tertiary)",
                        }}
                      >
                        vs
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 13,
                          fontWeight:
                            isWin && res.winner === match.b ? 700 : 400,
                          color:
                            isWin && res.winner === match.b
                              ? "#22c55e"
                              : "var(--color-text-primary)",
                        }}
                      >
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: tB.color,
                            display: "inline-block",
                          }}
                        ></span>
                        {tB.short}
                      </span>
                    </div>

                    {/* Result display */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      {!res && (
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--color-text-tertiary)",
                            background: "var(--color-background-secondary)",
                            padding: "3px 8px",
                            borderRadius: 4,
                          }}
                        >
                          Click to add result
                        </span>
                      )}
                      {isNR && (
                        <span
                          style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            background: "#94a3b811",
                            padding: "3px 8px",
                            borderRadius: 4,
                            fontWeight: 600,
                          }}
                        >
                          NO RESULT
                        </span>
                      )}
                      {isWin && (
                        <div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#22c55e",
                              fontWeight: 600,
                              marginBottom: 1,
                            }}
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
            <div
              style={{
                marginTop: 10,
                fontSize: 11,
                color: "var(--color-text-tertiary)",
              }}
            >
              Click any match to enter result, scores, or mark as No Result /
              Washed Out.
            </div>
          </div>
        )}

        {/* ══ QUALIFY ══ */}
        {tab === "Qualify" && (
          <div>
            {/* Team selector */}
            <div
              style={{
                background: "var(--color-background-primary)",
                borderRadius: 12,
                border: "0.5px solid var(--color-border-tertiary)",
                padding: "1.1rem",
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

            {/* Stats cards */}
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
                    ["Rank", `#${rank}`, rank <= 4 ? "#22c55e" : "#ef4444"],
                    ["Points", s.points, "#FBBF24"],
                    ["Wins", s.wins, "#22c55e"],
                    ["NR", s.nrs, "#94a3b8"],
                    ["Remaining", rem, "#EA580C"],
                  ].map(([label, val, color]) => (
                    <div
                      key={label}
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
                        {label}
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 700, color }}>
                        {val}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Note about NRR in qualify */}
            <div
              style={{
                background: "var(--color-background-secondary)",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 10,
                fontSize: 11,
                color: "var(--color-text-secondary)",
                lineHeight: 1.7,
              }}
            >
              <strong style={{ color: "var(--color-text-primary)" }}>
                Qualification logic (wins only):
              </strong>{" "}
              The max-flow engine checks all C(9,4)=126 subsets of rivals via
              the fixture constraint graph. NRR is shown in the standings table
              as a tiebreaker display but the <em>guaranteed</em> qualification
              threshold is computed purely on wins — since NRR is
              non-deterministic (depends on exact match margins). No Result
              matches do not contribute wins to either team.
            </div>

            <button
              onClick={handleCompute}
              disabled={computing}
              style={{
                width: "100%",
                padding: "12px",
                border: "none",
                borderRadius: 10,
                cursor: computing ? "not-allowed" : "pointer",
                background: computing ? "#1a1a1a" : "#EA580C",
                color: computing ? "#444" : "#fff",
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 14,
              }}
            >
              {computing
                ? "⏳ Running max-flow..."
                : `▶  Compute Guaranteed Qualification for ${teamMap[selectedTeam].name}`}
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
                const vc = impossible
                  ? "#ef4444"
                  : alreadyGuaranteed
                    ? "#22c55e"
                    : "#EA580C";

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
                        padding: "1.1rem 1.25rem",
                        background: `${vc}0d`,
                        border: `1.5px solid ${vc}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--color-text-secondary)",
                          marginBottom: 5,
                          letterSpacing: 2,
                        }}
                      >
                        VERDICT
                      </div>
                      {impossible ? (
                        <>
                          <div
                            style={{
                              fontSize: 17,
                              fontWeight: 700,
                              color: "#ef4444",
                              marginBottom: 6,
                            }}
                          >
                            Cannot Guarantee Top 4 Mathematically
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--color-text-secondary)",
                              lineHeight: 1.7,
                            }}
                          >
                            Even if {team.short} wins all {remaining} remaining
                            matches ({currentWins + remaining} total wins), the
                            remaining fixture graph still allows 4+ other teams
                            to simultaneously exceed that total.
                          </div>
                        </>
                      ) : alreadyGuaranteed ? (
                        <>
                          <div
                            style={{
                              fontSize: 17,
                              fontWeight: 700,
                              color: "#22c55e",
                              marginBottom: 6,
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
                            With {currentWins} wins it is{" "}
                            <strong
                              style={{ color: "var(--color-text-primary)" }}
                            >
                              mathematically impossible
                            </strong>{" "}
                            for 4 rivals to each reach {currentWins + 1}+ wins
                            simultaneously given remaining fixtures.{" "}
                            {team.short} is in the Top 4 regardless of all
                            future results.
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            style={{
                              fontSize: 17,
                              fontWeight: 700,
                              color: "#EA580C",
                              marginBottom: 6,
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
                            At{" "}
                            <strong
                              style={{ color: "var(--color-text-primary)" }}
                            >
                              {targetWins} wins
                            </strong>
                            , no group of 4 rivals can simultaneously exceed
                            this total given the{" "}
                            {fixtures.filter((f) => !f.result).length} remaining
                            fixtures. Currently {currentWins} wins · {remaining}{" "}
                            matches to play.
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
                          padding: "1rem 1.25rem",
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
                          WIN TRACKER — 14 MATCHES
                        </div>
                        <div
                          style={{ display: "flex", gap: 3, marginBottom: 8 }}
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
                                    ? "#22c55e"
                                    : !alreadyGuaranteed && i < targetWins
                                      ? "#EA580C"
                                      : i < currentWins + remaining
                                        ? "#ffffff18"
                                        : "#ffffff08",
                                border:
                                  !alreadyGuaranteed &&
                                  i >= currentWins &&
                                  i < targetWins
                                    ? "1px solid #FBBF24"
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
                                background: "#22c55e",
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
                                  background: "#EA580C",
                                  border: "1px solid #FBBF24",
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
                            Target: {targetWins} wins
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Rivals */}
                    <div
                      style={{
                        background: "var(--color-background-primary)",
                        borderRadius: 10,
                        border: "0.5px solid var(--color-border-tertiary)",
                        padding: "1rem 1.25rem",
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
                          const nrrStr = fmtNRR(s.nrr);
                          return (
                            <div
                              key={team.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 6,
                                flexWrap: "wrap",
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
                                  width: 36,
                                  fontWeight: 600,
                                  fontSize: 12,
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
                                  minWidth: 60,
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
                                  width: 54,
                                  textAlign: "right",
                                  fontSize: 11,
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
                                  color: s.nrr >= 0 ? "#22c55e" : "#ef4444",
                                  fontVariantNumeric: "tabular-nums",
                                }}
                              >
                                {nrrStr}
                              </span>
                              {h2h >= 0 && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    color: "#FBBF24",
                                    background: "#FBBF2411",
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
                                  color: canReach ? "#ef4444" : "#22c55e",
                                  background: canReach
                                    ? "#ef444411"
                                    : "#22c55e11",
                                }}
                              >
                                {canReach ? "threat" : "safe"}
                              </span>
                            </div>
                          );
                        })}
                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 10,
                          color: "var(--color-text-tertiary)",
                          lineHeight: 1.6,
                        }}
                      >
                        Threat = team can max reach ≥{targetWins + 1} wins. H2H
                        = unplayed direct fixtures. NRR shown for reference —
                        qualification threshold uses wins only.
                      </div>
                    </div>
                  </div>
                );
              })()}
          </div>
        )}
      </div>
    </div>
  );
}
