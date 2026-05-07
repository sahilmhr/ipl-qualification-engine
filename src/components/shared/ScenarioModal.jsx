import { teamMap, COLORS } from "../../constants";
import { fmtNRR } from "../../utils/helpers";

const C = COLORS.primary;
const Y = COLORS.secondary;
const G = COLORS.success;
const R = COLORS.error;

export function ScenarioModal({ scenario, scenarioIndex, selectedTeam, onClose }) {
  if (!scenario) return null;

  const matchResults = Object.entries(scenario.results);
  const ranked = Object.entries(scenario.standings)
    .map(([teamId, s]) => ({
      teamId,
      ...s,
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return (b.nrr || 0) - (a.nrr || 0);
    });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--color-background-primary)",
          borderRadius: 12,
          border: `1px solid ${C}44`,
          padding: "24px",
          maxWidth: "90%",
          maxHeight: "90vh",
          overflow: "auto",
          width: "100%",
          maxWidth: "600px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: C,
                marginBottom: 4,
              }}
            >
              Scenario {scenarioIndex + 1} · Rank #{scenario.rank}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-secondary)",
              }}
            >
              {matchResults.length} match result{matchResults.length !== 1 ? "s" : ""}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--color-background-secondary)",
              border: "1px solid var(--color-border-secondary)",
              borderRadius: 6,
              width: 32,
              height: 32,
              fontSize: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-primary)",
            }}
          >
            ✕
          </button>
        </div>

        {/* All Match Results */}
        <div
          style={{
            background: "var(--color-background-secondary)",
            borderRadius: 8,
            padding: "12px",
            marginBottom: 16,
            border: `0.5px solid var(--color-border-secondary)`,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: Y,
              marginBottom: 12,
              letterSpacing: 1,
            }}
          >
            ALL MATCH RESULTS ({matchResults.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {matchResults.map(([matchId, winner]) => {
              const winnerTeam = teamMap[winner];
              return (
                <div
                  key={matchId}
                  style={{
                    fontSize: 11,
                    background: "var(--color-background-tertiary)",
                    padding: "6px 10px",
                    borderRadius: 6,
                    color: winnerTeam.color,
                    fontWeight: 600,
                    border: `1px solid ${winnerTeam.color}33`,
                  }}
                >
                  <span style={{ color: "var(--color-text-secondary)", fontWeight: 400 }}>
                    M{matchId}:
                  </span>{" "}
                  {winnerTeam.short}
                </div>
              );
            })}
          </div>
        </div>

        {/* Final Standings */}
        <div
          style={{
            background: "var(--color-background-secondary)",
            borderRadius: 8,
            padding: "12px",
            border: `0.5px solid var(--color-border-secondary)`,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: C,
              marginBottom: 12,
              letterSpacing: 1,
            }}
          >
            FINAL STANDINGS
          </div>
          <table style={{ width: "100%", fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: `0.5px solid #333` }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "6px 8px",
                    color: "var(--color-text-secondary)",
                    fontWeight: 500,
                    fontSize: 9,
                  }}
                >
                  Team
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: "6px 8px",
                    color: "var(--color-text-secondary)",
                    fontWeight: 500,
                    fontSize: 9,
                    width: 50,
                  }}
                >
                  Points
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: "6px 8px",
                    color: "var(--color-text-secondary)",
                    fontWeight: 500,
                    fontSize: 9,
                    width: 60,
                  }}
                >
                  NRR
                </th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((team, idx) => {
                const isSelected = team.teamId === selectedTeam;
                const isTop4 = idx < 4;
                return (
                  <tr
                    key={team.teamId}
                    style={{
                      background: isSelected
                        ? `${C}22`
                        : isTop4
                          ? "#00000010"
                          : "transparent",
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    <td
                      style={{
                        padding: "8px",
                        color: isSelected ? C : "var(--color-text-primary)",
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: 11,
                      }}
                    >
                      {idx + 1}. {teamMap[team.teamId].short}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        padding: "8px",
                        color: isSelected ? C : Y,
                        fontWeight: 600,
                        fontSize: isSelected ? 12 : 11,
                      }}
                    >
                      {team.points}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        padding: "8px",
                        color:
                          team.nrr > 0
                            ? G
                            : team.nrr < 0
                              ? R
                              : "var(--color-text-secondary)",
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      {fmtNRR(team.nrr)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Qualified Indicator */}
        {ranked.findIndex((t) => t.teamId === selectedTeam) < 4 && (
          <div
            style={{
              marginTop: 16,
              padding: "8px 12px",
              background: `${G}22`,
              borderRadius: 6,
              border: `0.5px solid ${G}`,
              fontSize: 11,
              color: G,
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            ✓ Team qualifies in this scenario
          </div>
        )}
      </div>
    </div>
  );
}

export default ScenarioModal;
