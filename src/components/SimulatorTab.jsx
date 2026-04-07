import { TEAMS, teamMap } from "../data/teams";
import { computeQualification } from "../utils/qualification";

export default function SimulatorTab({
  fixtures,
  scenario,
  setScenario,
  simTeam,
  setSimTeam,
  rankedTeams,
  standings,
  simFixtures,
  simStandings,
  simRanked,
}) {
  const C = "#EA580C";
  const G = "#22c55e";
  const R = "#ef4444";

  const unplayedForSim = fixtures.filter((f) => !f.result);
  const simQ = computeQualification(simTeam, simFixtures, simStandings);
  const team = teamMap[simTeam];
  const vc = simQ.impossible ? R : simQ.alreadyGuaranteed ? G : C;
  const scenarioCount = Object.values(scenario).filter(Boolean).length;

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
          Hypothetically set outcomes for any unplayed matches below. The standings and qualification status update live — without affecting your real data. Compare how the table looks under different scenarios.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
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
                color: simTeam === t.id ? "#fff" : "var(--color-text-primary)",
                borderColor: simTeam === t.id ? t.color : "var(--color-border-secondary)",
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
                color: isSim ? C : "#FBBF24",
                letterSpacing: 1,
              }}
            >
              {label}
            </div>
            {ranked.map((team, idx) => {
              const s = stds[team.id];
              const inTop4 = idx < 4;
              const changed = isSim && simStandings[team.id].points !== standings[team.id].points;
              return (
                <div
                  key={team.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "6px 10px",
                    borderBottom: "0.5px solid var(--color-border-tertiary)",
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
                  />
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
                  <span style={{ fontSize: 11, fontWeight: 700, color: G }}>{s.wins}W</span>
                  <span style={{ fontSize: 11, color: C, fontWeight: 600 }}>{s.points}pts</span>
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
          SIMULATED QUALIFICATION — {team.short} ({scenarioCount} hypothetical result{scenarioCount !== 1 ? "s" : ""} applied)
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
            Still needs {simQ.minAdditionalWins} more win{simQ.minAdditionalWins !== 1 ? "s" : ""} in this scenario
          </div>
        )}
      </div>

      <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 8 }}>
        Set hypothetical outcomes for unplayed matches:
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {unplayedForSim.map((match) => {
          const tA = teamMap[match.a];
          const tB = teamMap[match.b];
          const sc = scenario[match.id];
          return (
            <div
              key={match.id}
              style={{
                background: "var(--color-background-primary)",
                borderRadius: 8,
                border: sc ? `0.5px solid ${C}66` : "0.5px solid var(--color-border-tertiary)",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: 42, flexShrink: 0 }}>
                <div style={{ fontSize: 9, color: "var(--color-text-tertiary)" }}>M{match.id}</div>
                <div style={{ fontSize: 9, color: "var(--color-text-tertiary)" }}>{match.date}</div>
              </div>
              <div style={{ flex: 1, fontSize: 12 }}>
                <span style={{ color: tA.color, fontWeight: 500 }}>{tA.short}</span>
                <span style={{ color: "var(--color-text-tertiary)", margin: "0 5px" }}>vs</span>
                <span style={{ color: tB.color, fontWeight: 500 }}>{tB.short}</span>
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
                                  scoreA: { runs: "", wickets: "", overs: "" },
                                  scoreB: { runs: "", wickets: "", overs: "" },
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
                        background: sc?.winner === tid ? t.color : "transparent",
                        color: sc?.winner === tid ? "#fff" : "var(--color-text-secondary)",
                        borderColor: sc?.winner === tid ? t.color : "var(--color-border-secondary)",
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
  );
}
