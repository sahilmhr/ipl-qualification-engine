import { useState, useMemo } from "react";
import { TEAMS, COLORS } from "../../constants";
import { analyzeSurpassPossibility } from "../../utils/surpassAnalyzer";

const C = COLORS.primary;
const Y = COLORS.secondary;
const G = COLORS.success;
const R = COLORS.error;

export function SurpassAnalyzer({
  selectedTeam,
  setSelectedTeam,
  standings,
  fixtures,
}) {
  const [showDetails, setShowDetails] = useState(true);

  const analysis = useMemo(
    () => analyzeSurpassPossibility(selectedTeam, standings, fixtures),
    [selectedTeam, standings, fixtures]
  );

  const selectedTeamStanding = standings[selectedTeam];
  const selectedTeamData = TEAMS.find((t) => t.id === selectedTeam);
  const selectedTeamRemaining = fixtures.filter(
    (f) => !f.result && (f.a === selectedTeam || f.b === selectedTeam)
  ).length;

  return (
    <div>
      {/* Team Selector */}
      <div
        style={{
          background: "var(--color-background-primary)",
          borderRadius: 12,
          border: "0.5px solid var(--color-border-tertiary)",
          padding: "1rem",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: "var(--color-text-secondary)",
            marginBottom: 8,
            letterSpacing: 1,
            fontWeight: 600,
          }}
        >
          SELECT TEAM TO ANALYZE
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {TEAMS.map((team) => (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(team.id)}
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
                transition: "all 0.2s ease",
              }}
            >
              {team.short}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Card */}
      <div
        style={{
          background: "var(--color-background-primary)",
          borderRadius: 12,
          border: "0.5px solid var(--color-border-tertiary)",
          padding: "1.25rem",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 12,
            marginBottom: 4,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                color: "var(--color-text-secondary)",
                marginBottom: 4,
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              TEAM
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C }}>
              {selectedTeamData?.short}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                color: "var(--color-text-secondary)",
                marginBottom: 4,
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              CURRENT POINTS
            </div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              {selectedTeamStanding?.points}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                color: "var(--color-text-secondary)",
                marginBottom: 4,
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              REMAINING MATCHES
            </div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              {selectedTeamRemaining}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                color: "var(--color-text-secondary)",
                marginBottom: 4,
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              MAX POSSIBLE PTS
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: Y }}>
              {selectedTeamStanding?.points +
                selectedTeamRemaining * 2}
            </div>
          </div>
        </div>
      </div>

      {/* Teams That CAN Surpass */}
      <div
        style={{
          background: "var(--color-background-primary)",
          borderRadius: 12,
          border: `1px solid ${G}40`,
          padding: "1.25rem",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                color: "var(--color-text-secondary)",
                marginBottom: 2,
                letterSpacing: 1,
                fontWeight: 600,
              }}
            >
              CAN SURPASS
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: G,
                marginBottom: 2,
              }}
            >
              {analysis.canSurpass.length}
              <span
                style={{
                  fontSize: 14,
                  color: "var(--color-text-secondary)",
                  fontWeight: 400,
                  marginLeft: 6,
                }}
              >
                {" "}
                team{analysis.canSurpass.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {analysis.canSurpass.length > 0 ? (
          <div
            style={{
              background: "#080808",
              borderRadius: 8,
              border: "0.5px solid var(--color-border-tertiary)",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#101010" }}>
                  <th
                    style={{
                      padding: "8px 10px",
                      textAlign: "left",
                      fontSize: 10,
                      fontWeight: 600,
                      color: Y,
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    TEAM
                  </th>
                  <th
                    style={{
                      padding: "8px 10px",
                      textAlign: "center",
                      fontSize: 10,
                      fontWeight: 600,
                      color: Y,
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    CURRENT PTS
                  </th>
                  <th
                    style={{
                      padding: "8px 10px",
                      textAlign: "center",
                      fontSize: 10,
                      fontWeight: 600,
                      color: Y,
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    MAX PTS
                  </th>
                  <th
                    style={{
                      padding: "8px 10px",
                      textAlign: "center",
                      fontSize: 10,
                      fontWeight: 600,
                      color: Y,
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    REM
                  </th>
                  <th
                    style={{
                      padding: "8px 10px",
                      textAlign: "center",
                      fontSize: 10,
                      fontWeight: 600,
                      color: Y,
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    WINS NEEDED
                  </th>
                </tr>
              </thead>
              <tbody>
                {analysis.canSurpass.map((team, idx) => (
                  <tr
                    key={team.teamId}
                    style={{
                      background:
                        idx % 2 === 0 ? "transparent" : "#08080840",
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    <td
                      style={{
                        padding: "8px 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: team.color,
                          flexShrink: 0,
                        }}
                      ></div>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>
                        {team.short}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        textAlign: "center",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {team.currentPoints}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        textAlign: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: G,
                      }}
                    >
                      {team.maxPoints}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        textAlign: "center",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {team.remainingMatches}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        textAlign: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: C,
                      }}
                    >
                      {team.winsNeeded}/{team.remainingMatches}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "var(--color-text-secondary)",
              fontSize: 13,
            }}
          >
            <div style={{ marginBottom: 6 }}>✓ No team can surpass</div>
            <div style={{ fontSize: 12 }}>
              {selectedTeamData?.short} cannot be caught regardless of outcomes
            </div>
          </div>
        )}
      </div>

      {/* Teams That CANNOT Surpass */}
      <div
        style={{
          background: "var(--color-background-primary)",
          borderRadius: 12,
          border: `1px solid ${R}40`,
          padding: "1.25rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                color: "var(--color-text-secondary)",
                marginBottom: 2,
                letterSpacing: 1,
                fontWeight: 600,
              }}
            >
              CANNOT SURPASS
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: R,
                marginBottom: 2,
              }}
            >
              {analysis.cannotSurpass.length}
              <span
                style={{
                  fontSize: 14,
                  color: "var(--color-text-secondary)",
                  fontWeight: 400,
                  marginLeft: 6,
                }}
              >
                {" "}
                team{analysis.cannotSurpass.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {analysis.cannotSurpass.length > 0 ? (
          <div
            style={{
              background: "#080808",
              borderRadius: 8,
              border: "0.5px solid var(--color-border-tertiary)",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#101010" }}>
                  <th
                    style={{
                      padding: "8px 10px",
                      textAlign: "left",
                      fontSize: 10,
                      fontWeight: 600,
                      color: Y,
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    TEAM
                  </th>
                  <th
                    style={{
                      padding: "8px 10px",
                      textAlign: "center",
                      fontSize: 10,
                      fontWeight: 600,
                      color: Y,
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    CURRENT PTS
                  </th>
                  <th
                    style={{
                      padding: "8px 10px",
                      textAlign: "center",
                      fontSize: 10,
                      fontWeight: 600,
                      color: Y,
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    MAX PTS
                  </th>
                  <th
                    style={{
                      padding: "8px 10px",
                      textAlign: "center",
                      fontSize: 10,
                      fontWeight: 600,
                      color: Y,
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    REM
                  </th>
                  <th
                    style={{
                      padding: "8px 10px",
                      textAlign: "center",
                      fontSize: 10,
                      fontWeight: 600,
                      color: Y,
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    SHORT BY
                  </th>
                </tr>
              </thead>
              <tbody>
                {analysis.cannotSurpass.map((team, idx) => (
                  <tr
                    key={team.teamId}
                    style={{
                      background:
                        idx % 2 === 0 ? "transparent" : "#08080840",
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                      opacity: 0.7,
                    }}
                  >
                    <td
                      style={{
                        padding: "8px 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: team.color,
                          flexShrink: 0,
                        }}
                      ></div>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>
                        {team.short}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        textAlign: "center",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {team.currentPoints}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        textAlign: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: R,
                      }}
                    >
                      {team.maxPoints}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        textAlign: "center",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {team.remainingMatches}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        textAlign: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: R,
                      }}
                    >
                      {team.deficit} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "var(--color-text-secondary)",
              fontSize: 13,
            }}
          >
            <div style={{ marginBottom: 6 }}>⚠ All other teams can surpass</div>
            <div style={{ fontSize: 12 }}>
              {selectedTeamData?.short} is at risk of being caught by every
              other team
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SurpassAnalyzer;
