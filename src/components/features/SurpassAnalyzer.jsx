import { useState, useMemo } from "react";
import { TEAMS } from "../../constants";
import { analyzeSurpassPossibility, describeScenario, getSurpassStats } from "../../utils/surpassAnalyzer";

const C = "#EA580C"; // Primary color
const G = "#22c55e"; // Success
const R = "#ef4444"; // Error
const Y = "#f59e0b"; // Warning

export function SurpassAnalyzerTab({
  selectedTeam,
  setSelectedTeam,
  standings,
  fixtures,
}) {
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [computing, setComputing] = useState(false);

  const analysis = useMemo(() => {
    if (computing) return null;
    return analyzeSurpassPossibility(selectedTeam, fixtures, standings);
  }, [selectedTeam, fixtures, standings, computing]);

  const stats = useMemo(() => {
    if (!analysis) return null;
    return getSurpassStats(selectedTeam, fixtures, standings);
  }, [analysis, standings, selectedTeam, fixtures]);

  const selectedTeamData = TEAMS.find((t) => t.id === selectedTeam);
  const s = standings[selectedTeam];

  return (
    <div>
      {/* Team Selection */}
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
          SELECT TEAM TO ANALYZE
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {TEAMS.map((team) => (
            <button
              key={team.id}
              onClick={() => {
                setSelectedTeam(team.id);
                setExpandedTeam(null);
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

      {/* Summary Stats */}
      {stats && (
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
            SURPASS ANALYSIS — {selectedTeamData?.name}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
              marginBottom: 10,
            }}
          >
            {[
              ["Rank", "#" + (Object.values(standings)
                .filter((st) => st.points > s.points || 
                  (st.points === s.points && (st.nrr || 0) > (s.nrr || 0)))
                .length + 1), Y],
              ["Points", s.points, Y],
              ["Can Surpass", stats.canSurpass, G],
              ["Cannot Surpass", stats.cannotSurpass, R],
            ].map(([label, value, color]) => (
              <div key={label}
                style={{
                  background: "var(--color-background-secondary)",
                  borderRadius: 8,
                  padding: "0.75rem",
                  textAlign: "center",
                  border: `1px solid ${color}33`,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-secondary)",
                    marginBottom: 4,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: color,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-secondary)",
              paddingTop: 8,
              borderTop: "1px solid var(--color-border-tertiary)",
            }}
          >
            Teams that can surpass {selectedTeamData?.short}'s {s.points} points through valid match combinations: <strong>{stats.canSurpass}</strong>%
          </div>
        </div>
      )}

      {/* Can Surpass Section */}
      {analysis && analysis.canSurpass.length > 0 && (
        <div
          style={{
            background: "var(--color-background-primary)",
            borderRadius: 12,
            border: `0.5px solid ${G}44`,
            padding: "1rem 1.25rem",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: G,
              letterSpacing: 2,
              marginBottom: 10,
            }}
          >
            CAN SURPASS ({analysis.canSurpass.length})
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {analysis.canSurpass.map((teamId) => {
              const team = TEAMS.find((t) => t.id === teamId);
              const ts = standings[teamId];
              const scenario = analysis.scenarios[teamId];
              const isExpanded = expandedTeam === teamId;

              return (
                <div
                  key={teamId}
                  style={{
                    background: "var(--color-background-secondary)",
                    border: `1px solid ${G}66`,
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => setExpandedTeam(isExpanded ? null : teamId)}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 4,
                          background: team.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {team.short[0]}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {team.short}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--color-text-secondary)",
                            marginTop: 2,
                          }}
                        >
                          {ts.points} points • {ts.wins} wins
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        color: G,
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    >
                      ▼
                    </div>
                  </button>

                  {isExpanded && scenario && (
                    <div
                      style={{
                        padding: "1rem",
                        borderTop: `1px solid ${G}33`,
                        background: "var(--color-background-primary)",
                        fontSize: 11,
                      }}
                    >
                      <div
                        style={{
                          color: "var(--color-text-secondary)",
                          marginBottom: 8,
                          fontWeight: 600,
                      }}
                      >
                        Example scenario where {team.short} surpasses {selectedTeamData?.short}:
                      </div>

                      {describeScenario(scenario, fixtures, teamId, selectedTeam).map(
                        (item, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: "6px 0",
                              color: "var(--color-text-primary)",
                              borderBottom:
                                idx <
                                describeScenario(scenario, fixtures, teamId, selectedTeam)
                                  .length -
                                  1
                                  ? "1px solid var(--color-border-tertiary)"
                                  : "none",
                            }}
                          >
                            • {item.text}
                          </div>
                        ),
                      )}

                      <div
                        style={{
                          marginTop: 10,
                          padding: "8px",
                          background: `${G}11`,
                          borderLeft: `2px solid ${G}`,
                          borderRadius: 4,
                          fontSize: 10,
                          color: G,
                        }}
                      >
                        ✓ Valid scenario exists
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cannot Surpass Section */}
      {analysis && analysis.cannotSurpass.length > 0 && (
        <div
          style={{
            background: "var(--color-background-primary)",
            borderRadius: 12,
            border: `0.5px solid ${R}44`,
            padding: "1rem 1.25rem",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: R,
              letterSpacing: 2,
              marginBottom: 10,
            }}
          >
            CANNOT SURPASS ({analysis.cannotSurpass.length})
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {analysis.cannotSurpass.map((teamId) => {
              const team = TEAMS.find((t) => t.id === teamId);
              const ts = standings[teamId];

              return (
                <div
                  key={teamId}
                  style={{
                    background: "var(--color-background-secondary)",
                    border: `1px solid ${R}66`,
                    borderRadius: 8,
                    padding: "0.75rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 3,
                      background: team.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 9,
                      fontWeight: 700,
                    }}
                  >
                    {team.short[0]}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {team.short}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {ts.points}pts • {ts.wins}W
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-secondary)",
              marginTop: 10,
              paddingTop: 10,
              borderTop: "1px solid var(--color-border-tertiary)",
            }}
          >
            These teams mathematically cannot surpass {selectedTeamData?.short} in any valid scenario.
          </div>
        </div>
      )}

      {/* No analysis yet */}
      {!analysis && !computing && (
        <div
          style={{
            background: "var(--color-background-secondary)",
            borderRadius: 12,
            border: "1px solid var(--color-border-tertiary)",
            padding: "2rem",
            textAlign: "center",
            color: "var(--color-text-secondary)",
          }}
        >
          <div style={{ fontSize: 12, marginBottom: 8 }}>
            Select a team to analyze who can surpass them.
          </div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>
            The algorithm considers all valid match combinations across the league.
          </div>
        </div>
      )}
    </div>
  );
}
