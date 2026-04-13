import { useState, useMemo } from "react";
import { TEAMS, COLORS, teamMap } from "../../constants";
import { parseOvers } from "../../utils/math";
import { fmtNRR } from "../../utils/helpers";

const C = COLORS.primary;
const Y = COLORS.secondary;
const G = COLORS.success;
const R = COLORS.error;

export function TimelapseTab({ fixtures, tlMatch: initialTlMatch, maxPlayed }) {
  const [tlMatch, setTlMatchLocal] = useState(initialTlMatch);

  const tlStandings = useMemo(() => {
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
    [...fixtures]
      .filter((f) => f.id <= tlMatch && f.result)
      .sort((a, b) => a.id - b.id)
      .forEach((f) => {
        const r = f.result;
        if (r.type === "nr") {
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
        const loser = r.winner === f.a ? f.b : f.a;
        s[r.winner].wins++;
        s[r.winner].played++;
        s[r.winner].points += 2;
        s[r.winner].streak.push("W");
        s[loser].losses++;
        s[loser].played++;
        s[loser].streak.push("L");
        const rA = Number(r.scoreA?.runs || 0),
          ovA = parseOvers(r.scoreA?.overs || 0);
        const rB = Number(r.scoreB?.runs || 0),
          ovB = parseOvers(r.scoreB?.overs || 0);
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
  }, [tlMatch, fixtures]);

  const tlRanked = useMemo(
    () =>
      [...TEAMS].sort((a, b) => {
        const sa = tlStandings[a.id],
          sb = tlStandings[b.id];
        if (sb.points !== sa.points) return sb.points - sa.points;
        return (sb.nrr || 0) - (sa.nrr || 0);
      }),
    [tlStandings],
  );

  // Compute previous standings for ranking change indicator
  const prevStandings = useMemo(() => {
    if (tlMatch === 0) return {};
    const p = {};
    TEAMS.forEach((t) => {
      p[t.id] = {
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
    [...fixtures]
      .filter((f) => f.id < tlMatch && f.result)
      .sort((a, b) => a.id - b.id)
      .forEach((f) => {
        const r = f.result;
        if (r.type === "nr") {
          p[f.a].nrs++;
          p[f.a].played++;
          p[f.a].points++;
          p[f.b].nrs++;
          p[f.b].played++;
          p[f.b].points++;
          return;
        }
        const loser = r.winner === f.a ? f.b : f.a;
        p[r.winner].wins++;
        p[r.winner].played++;
        p[r.winner].points += 2;
        p[loser].losses++;
        p[loser].played++;
        const rA = Number(r.scoreA?.runs || 0),
          ovA = parseOvers(r.scoreA?.overs || 0);
        const rB = Number(r.scoreB?.runs || 0),
          ovB = parseOvers(r.scoreB?.overs || 0);
        if (ovA > 0 && ovB > 0) {
          p[f.a].runsFor += rA;
          p[f.a].oversFor += ovA;
          p[f.a].runsAgainst += rB;
          p[f.a].oversAgainst += ovB;
          p[f.b].runsFor += rB;
          p[f.b].oversFor += ovB;
          p[f.b].runsAgainst += rA;
          p[f.b].oversAgainst += ovA;
        }
      });
    Object.keys(p).forEach((tid) => {
      const t = p[tid];
      t.nrr =
        (t.oversFor > 0 ? t.runsFor / t.oversFor : 0) -
        (t.oversAgainst > 0 ? t.runsAgainst / t.oversAgainst : 0);
    });
    return p;
  }, [tlMatch, fixtures]);

  const prevRanked = useMemo(() => {
    if (tlMatch === 0) return [];
    return [...TEAMS].sort((a, b) => {
      const pa = prevStandings[a.id],
        pb = prevStandings[b.id];
      if (pb.points !== pa.points) return pb.points - pa.points;
      return (pb.nrr || 0) - (pa.nrr || 0);
    });
  }, [prevStandings, tlMatch]);

  const rankChange = useMemo(() => {
    const change = {};
    tlRanked.forEach((team, idx) => {
      const prevIdx = prevRanked.findIndex((t) => t.id === team.id);
      change[team.id] = prevIdx === -1 ? 0 : prevIdx - idx;
    });
    return change;
  }, [tlRanked, prevRanked]);

  const curFixture = fixtures.find((f) => f.id === tlMatch);
  const curResult = curFixture?.result;

  return (
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
        <div style={{ fontSize: 10, color: C, letterSpacing: 2, marginBottom: 10 }}>
          TIMELAPSE POINTS TABLE
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => setTlMatchLocal((m) => Math.max(0, m - 1))}
            disabled={tlMatch === 0}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "0.5px solid var(--color-border-secondary)",
              background: "transparent",
              color: "var(--color-text-primary)",
              cursor: "pointer",
              fontFamily: "sans-serif",
            }}
          >
            ←
          </button>
          <input
            type="range"
            min={0}
            max={maxPlayed || 70}
            value={tlMatch}
            step={1}
            onChange={(e) => setTlMatchLocal(+e.target.value)}
            style={{ flex: 1, minWidth: 120 }}
          />
          <button
            onClick={() => setTlMatchLocal((m) => Math.min(maxPlayed || 70, m + 1))}
            disabled={tlMatch >= (maxPlayed || 70)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "0.5px solid var(--color-border-secondary)",
              background: "transparent",
              color: "var(--color-text-primary)",
              cursor: "pointer",
              fontFamily: "sans-serif",
            }}
          >
            →
          </button>
        </div>

        <div
          style={{
            marginTop: 10,
            padding: "8px 12px",
            background: "var(--color-background-secondary)",
            borderRadius: 8,
            fontSize: 12,
          }}
        >
          {tlMatch === 0 ? (
            <span style={{ color: "var(--color-text-tertiary)" }}>
              Season start — no matches played
            </span>
          ) : curFixture ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ color: "var(--color-text-tertiary)", fontSize: 11 }}>
                M{tlMatch} · {curFixture.date}
              </span>
              <span style={{ color: teamMap[curFixture.a].color, fontWeight: 600 }}>
                {teamMap[curFixture.a].short}
              </span>
              <span style={{ color: "var(--color-text-tertiary)" }}>vs</span>
              <span style={{ color: teamMap[curFixture.b].color, fontWeight: 600 }}>
                {teamMap[curFixture.b].short}
              </span>
              {curResult?.type === "nr" && (
                <span style={{ color: "#94a3b8", fontWeight: 600, fontSize: 11 }}>
                  NO RESULT
                </span>
              )}
              {curResult?.type === "win" && (
                <span style={{ color: teamMap[curResult.winner].color, fontWeight: 600 }}>
                  {teamMap[curResult.winner].short} won
                </span>
              )}
              {!curResult && (
                <span style={{ color: "var(--color-text-tertiary)", fontStyle: "italic", fontSize: 11 }}>
                  no result entered yet
                </span>
              )}
            </div>
          ) : null}
        </div>

        <div style={{ width: "100%", height: 3, background: "var(--color-background-secondary)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(tlMatch / 70) * 100}%`, background: C, borderRadius: 2, transition: "width .2s" }} />
        </div>
      </div>

      <div
        style={{
          background: "var(--color-background-primary)",
          borderRadius: 12,
          border: "0.5px solid var(--color-border-tertiary)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#080808" }}>
              {["#", "Team", "P", "W", "L", "NR", "Pts", "NRR", "Form", "Chg"].map((h) => (
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
            {tlRanked.map((team, idx) => {
              const s = tlStandings[team.id];
              const last5 = s.streak.slice(-5);
              const top4 = idx < 4;
              return (
                <tr
                  key={team.id}
                  style={{
                    background: top4 ? "#EA580C07" : "transparent",
                    borderBottom: "0.5px solid var(--color-border-tertiary)",
                  }}
                >
                  <td
                    style={{
                      padding: "9px 7px",
                      textAlign: "center",
                      fontWeight: 700,
                      color: top4 ? C : "var(--color-text-secondary)",
                      fontSize: 13,
                    }}
                  >
                    {idx + 1}
                  </td>
                  <td style={{ padding: "9px 7px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 9, height: 9, borderRadius: "50%", background: team.color, flexShrink: 0 }} />
                      <span style={{ fontWeight: top4 ? 600 : 400, color: "var(--color-text-primary)", fontSize: 12, whiteSpace: "nowrap" }}>
                        {team.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "9px 7px", textAlign: "center", color: "var(--color-text-secondary)" }}>
                    {s.played}
                  </td>
                  <td style={{ padding: "9px 7px", textAlign: "center", fontWeight: 700, color: G }}>
                    {s.wins}
                  </td>
                  <td style={{ padding: "9px 7px", textAlign: "center", color: R }}>
                    {s.losses}
                  </td>
                  <td style={{ padding: "9px 7px", textAlign: "center", color: "#94a3b8" }}>
                    {s.nrs}
                  </td>
                  <td style={{ padding: "9px 7px", textAlign: "center", fontWeight: 700, color: Y, fontSize: 14 }}>
                    {s.points}
                  </td>
                  <td
                    style={{
                      padding: "9px 7px",
                      textAlign: "center",
                      fontWeight: 500,
                      color: s.nrr > 0 ? G : s.nrr < 0 ? R : "var(--color-text-secondary)",
                      fontSize: 11,
                    }}
                  >
                    {fmtNRR(s.nrr)}
                  </td>
                  <td style={{ padding: "9px 7px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 3, justifyContent: "center" }}>
                      {last5.length === 0 ? (
                        <span style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>—</span>
                      ) : (
                        last5.map((r, i) => (
                          <div
                            key={i}
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: r === "W" ? "#22c55e" : r === "L" ? "#ef4444" : "#94a3b8",
                            }}
                          />
                        ))
                      )}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "9px 7px",
                      textAlign: "center",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {rankChange[team.id] > 0 && (
                      <span style={{ color: G }}>
                        ▲{rankChange[team.id]}
                      </span>
                    )}
                    {rankChange[team.id] < 0 && (
                      <span style={{ color: R }}>
                        ▼{Math.abs(rankChange[team.id])}
                      </span>
                    )}
                    {rankChange[team.id] === 0 && (
                      <span style={{ color: "var(--color-text-tertiary)" }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TimelapseTab;
