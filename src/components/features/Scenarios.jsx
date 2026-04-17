import { useState, useMemo } from "react";
import { TEAMS, COLORS, teamMap } from "../../constants";
import { generateQualificationScenarios } from "../../utils/math";
import { fmtNRR } from "../../utils/helpers";

const C = COLORS.primary;
const Y = COLORS.secondary;
const G = COLORS.success;
const R = COLORS.error;

export function ScenariosTab({ selectedTeam, setSelectedTeam, fixtures, rankedTeams }) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeScenarios, setActiveScenarios] = useState(new Set());

  const handleGenerateScenarios = () => {
    setLoading(true);
    setTimeout(() => {
      const generated = generateQualificationScenarios(selectedTeam, fixtures);
      setScenarios(generated);
      setActiveScenarios(new Set());
      setLoading(false);
    }, 100);
  };

  const rivalMatches = useMemo(() => {
    return fixtures.filter((f) => !f.result && f.a !== selectedTeam && f.b !== selectedTeam);
  }, [fixtures, selectedTeam]);

  const toggleScenario = (index) => {
    const newActive = new Set(activeScenarios);
    if (newActive.has(index)) {
      newActive.delete(index);
    } else {
      newActive.add(index);
    }
    setActiveScenarios(newActive);
  };

  const currentRank = rankedTeams.findIndex((t) => t.id === selectedTeam) + 1;
  const qualifiableMsg =
    currentRank <= 4
      ? "Already qualified! ✓"
      : rivalMatches.length === 0
        ? "No rival matches left to generate scenarios"
        : rivalMatches.length > 16
          ? `Too many rival matches (${rivalMatches.length}). Max 16 allowed.`
          : `${scenarios.length} qualifying scenarios found`;

  return (
    <div>
      {/* Team Selector */}
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
                setScenarios([]);
                setActiveScenarios(new Set());
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

      {/* Info & Generate Button */}
      <div
        style={{
          background: "var(--color-background-secondary)",
          borderRadius: 8,
          padding: "12px",
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 3 }}>
            {teamMap[selectedTeam].name}
          </div>
          <div
            style={{
              fontSize: 11,
              color:
                currentRank <= 4
                  ? G
                  : rivalMatches.length === 0 || rivalMatches.length > 16
                    ? "var(--color-text-tertiary)"
                    : Y,
            }}
          >
            {qualifiableMsg}
          </div>
        </div>
        <button
          onClick={handleGenerateScenarios}
          disabled={
            loading ||
            currentRank <= 4 ||
            rivalMatches.length === 0 ||
            rivalMatches.length > 16
          }
          style={{
            padding: "8px 16px",
            border: "none",
            borderRadius: 8,
            cursor:
              loading ||
              currentRank <= 4 ||
              rivalMatches.length === 0 ||
              rivalMatches.length > 16
                ? "not-allowed"
                : "pointer",
            background: C,
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "sans-serif",
            opacity:
              loading ||
              currentRank <= 4 ||
              rivalMatches.length === 0 ||
              rivalMatches.length > 16
                ? 0.5
                : 1,
          }}
        >
          {loading ? "⏳ Generating..." : "🔄 Generate"}
        </button>
      </div>

      {/* Scenarios List */}
      {scenarios.length > 0 && (
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
              color: Y,
              marginBottom: 12,
              letterSpacing: 2,
            }}
          >
            {scenarios.length} SCENARIOS · SELECT TO PREVIEW
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {scenarios.slice(0, 50).map((scenario, idx) => {
              const isActive = activeScenarios.has(idx);
              const matchResults = Object.entries(scenario.results);
              return (
                <div
                  key={idx}
                  style={{
                    background: isActive
                      ? `${C}15`
                      : "var(--color-background-secondary)",
                    border: isActive
                      ? `1px solid ${C}`
                      : "1px solid var(--color-border-secondary)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleScenario(idx)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleScenario(idx);
                      }}
                      style={{ width: 16, height: 16, cursor: "pointer" }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      Scenario {idx + 1}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: "var(--color-text-tertiary)",
                        marginLeft: "auto",
                      }}
                    >
                      Rank: #{scenario.rank}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {matchResults.slice(0, 6).map(([matchId, winner]) => {
                      const winnerTeam = teamMap[winner];
                      return (
                        <span
                          key={matchId}
                          style={{
                            fontSize: 9,
                            background: "var(--color-background-tertiary)",
                            padding: "2px 6px",
                            borderRadius: 4,
                            color: winnerTeam.color,
                            fontWeight: 600,
                          }}
                        >
                          M{matchId}: {winnerTeam.short}
                        </span>
                      );
                    })}
                    {matchResults.length > 6 && (
                      <span
                        style={{
                          fontSize: 9,
                          color: "var(--color-text-tertiary)",
                          padding: "2px 6px",
                        }}
                      >
                        +{matchResults.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Preview Standings for Selected Scenarios */}
      {activeScenarios.size > 0 && (
        <div
          style={{
            background: "var(--color-background-primary)",
            borderRadius: 12,
            border: `0.5px solid ${C}44`,
            padding: "1rem",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: C,
              marginBottom: 12,
              letterSpacing: 2,
            }}
          >
            PREVIEW: STANDINGS IN SELECTED SCENARIOS
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${activeScenarios.size}, 1fr)`,
              gap: 8,
            }}
          >
            {Array.from(activeScenarios).map((scenarioIdx) => {
              const scenario = scenarios[scenarioIdx];
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
                  key={scenarioIdx}
                  style={{
                    background: "var(--color-background-secondary)",
                    borderRadius: 8,
                    padding: "10px",
                    border: `0.5px solid ${C}44`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: Y,
                      marginBottom: 8,
                      textAlign: "center",
                    }}
                  >
                    Scenario {scenarioIdx + 1}
                  </div>
                  <table style={{ width: "100%", fontSize: 10 }}>
                    <thead>
                      <tr style={{ borderBottom: `0.5px solid #333` }}>
                        <th
                          style={{
                            textAlign: "left",
                            padding: "4px",
                            color: "var(--color-text-secondary)",
                            fontWeight: 500,
                          }}
                        >
                          Team
                        </th>
                        <th
                          style={{
                            textAlign: "center",
                            padding: "4px",
                            color: "var(--color-text-secondary)",
                            fontWeight: 500,
                            width: 30,
                          }}
                        >
                          Pts
                        </th>
                        <th
                          style={{
                            textAlign: "center",
                            padding: "4px",
                            color: "var(--color-text-secondary)",
                            fontWeight: 500,
                            width: 40,
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
                              borderBottom:
                                "0.5px solid var(--color-border-tertiary)",
                            }}
                          >
                            <td
                              style={{
                                padding: "4px",
                                color: isSelected ? C : "var(--color-text-primary)",
                                fontWeight: isSelected ? 700 : 400,
                                fontSize: 9,
                              }}
                            >
                              {idx + 1}. {teamMap[team.teamId].short}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                padding: "4px",
                                color: isSelected ? C : Y,
                                fontWeight: 600,
                                fontSize: isSelected ? 11 : 10,
                              }}
                            >
                              {team.points}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                padding: "4px",
                                color:
                                  team.nrr > 0
                                    ? G
                                    : team.nrr < 0
                                      ? R
                                      : "var(--color-text-secondary)",
                                fontSize: 9,
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ScenariosTab;
