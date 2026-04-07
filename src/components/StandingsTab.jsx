import { TEAMS, teamMap } from "../data/teams";
import { fmtNRR } from "../utils/qualification";

export default function StandingsTab({
  fixtures,
  standings,
  rankedTeams,
  allQual,
  exportData,
  importData,
}) {
  const C = "#EA580C";
  const G = "#22c55e";
  const R = "#ef4444";
  const Y = "#FBBF24";

  return (
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
              {["#", "Team", "Pts", "P", "W", "L", "NR", "NRR", "Max W", "Qual Status"].map((h) => (
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
                    borderBottom: "0.5px solid var(--color-border-tertiary)",
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
                      />
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
        Pts = Points · Max W = maximum possible wins · Qual Status computed via max-flow for all teams · NRR as tiebreaker
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
  );
}
