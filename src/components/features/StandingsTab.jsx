import { TEAMS, COLORS } from "../../constants";
import { LastResultsBadge } from "../common/LastResultsBadge";
import { PointsChart } from "../common/PointsChart";
import { fmtNRR } from "../../utils/helpers";

const C = COLORS.primary;
const Y = COLORS.secondary;
const G = COLORS.success;

export function StandingsTab({
  rankedTeams,
  standings,
  allQual,
  progression,
  chartTeams,
  setChartTeams,
}) {
  return (
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
                "P",
                "W",
                "L",
                "NR",
                "Pts",
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
              const rem = (fixtures) =>
                fixtures.filter(
                  (f) =>
                    !f.result &&
                    (f.a === team.id || f.b === team.id),
                ).length;
              const inTop4 = idx < 4;
              const q = allQual?.[team.id];
              const elim = q?.impossible;
              const guaranteed = q?.alreadyGuaranteed;
              let magicEl;
              if (guaranteed)
                magicEl = (
                  <span style={{ color: G, fontWeight: 700, fontSize: 11 }}>
                    ✓
                  </span>
                );
              else if (elim)
                magicEl = (
                  <span style={{ color: "#ef4444", fontWeight: 700, fontSize: 11 }}>
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
                      color: "#ef4444",
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
                      fontWeight: 500,
                      color:
                        s.nrr > 0
                          ? G
                          : s.nrr < 0
                            ? "#ef4444"
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
                    {s.wins + rem([])}
                  </td>
                  <td style={{ padding: "9px 7px", textAlign: "center" }}>
                    <LastResultsBadge results={s.streak} />
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
        Magic No. = additional wins needed to guarantee Top 4 · Streak = current
        consecutive result · Max W = max possible wins · NRR as tiebreaker
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
  );
}
