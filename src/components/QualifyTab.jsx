import { TEAMS, teamMap } from "../data/teams";
import { fmtNRR } from "../utils/qualification";

export default function QualifyTab({
  fixtures,
  standings,
  rankedTeams,
  selectedTeam,
  setSelectedTeam,
  handleCompute,
  computing,
  qualResult,
  criticalMatches,
  setModalMatch,
}) {
  const C = "#EA580C";
  const G = "#22c55e";
  const R = "#ef4444";
  const Y = "#FBBF24";

  const s = standings[selectedTeam];
  const rem = fixtures.filter(
    (f) => !f.result && (f.a === selectedTeam || f.b === selectedTeam),
  ).length;
  const rank = rankedTeams.findIndex((t) => t.id === selectedTeam) + 1;

  return (
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
              }}
              style={{
                padding: "6px 11px",
                border: "1.5px solid",
                borderRadius: 7,
                cursor: "pointer",
                fontSize: 12,
                background: selectedTeam === team.id ? team.color : "transparent",
                color: selectedTeam === team.id ? "#fff" : "var(--color-text-primary)",
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
            <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
          </div>
        ))}
      </div>

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
          ? "⏳ Running max-flow..."
          : `▶  Compute Qualification for ${teamMap[selectedTeam].name}`}
      </button>

      {qualResult && (
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
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
                      Even with all {remaining} remaining wins ({currentWins + remaining} total), 4+ rivals can still simultaneously exceed that.
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
                      Mathematically impossible for 4 rivals to each reach {currentWins + 1}+ wins. {team.short} is in Top 4 regardless of all future results.
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
                      Need {minAdditionalWins} more win{minAdditionalWins !== 1 ? "s" : ""} → guaranteed at {targetWins} total
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--color-text-secondary)",
                        lineHeight: 1.7,
                      }}
                    >
                      At {targetWins} wins, no 4 rivals can simultaneously exceed this given {fixtures.filter((f) => !f.result).length} remaining fixtures.
                    </div>
                  </>
                )}
              </div>

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
                  <div style={{ display: "flex", gap: 3, marginBottom: 7 }}>
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
                            !alreadyGuaranteed && i >= currentWins && i < targetWins
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
                      />
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
                        />
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
                      />
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
                    ({ match, impact, winsNeededWin, winsNeededLoss }) => {
                      const tA = teamMap[match.a];
                      const tB = teamMap[match.b];
                      return (
                        <div
                          key={match.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 8,
                            padding: "8px 10px",
                            background: "var(--color-background-secondary)",
                            borderRadius: 8,
                            cursor: "pointer",
                          }}
                          onClick={() => setModalMatch(match)}
                        >
                          <div style={{ flexShrink: 0 }}>
                            <div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>
                              M{match.id}
                            </div>
                            <div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>
                              {match.date}
                            </div>
                          </div>
                          <div style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>
                            <span style={{ color: tA.color }}>{tA.short}</span>
                            <span style={{ color: "var(--color-text-tertiary)", margin: "0 5px" }}>
                              vs
                            </span>
                            <span style={{ color: tB.color }}>{tB.short}</span>
                          </div>
                          <div style={{ textAlign: "right", fontSize: 11 }}>
                            <div style={{ color: G, marginBottom: 1 }}>
                              Win → need {winsNeededWin === 0 ? "0 (✓ done)" : winsNeededWin === 99 ? "impossible" : `${winsNeededWin} more`}
                            </div>
                            <div style={{ color: R }}>
                              Loss → need {winsNeededLoss === 0 ? "0 (✓ done)" : winsNeededLoss === 99 ? "impossible" : `${winsNeededLoss} more`}
                            </div>
                          </div>
                          <div
                            style={{
                              background: impact > 0 ? `${G}22` : `${R}22`,
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
                    Impact = extra wins needed if you lose vs win this match. Click a match to enter result.
                  </div>
                </div>
              )}

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
                  .sort((a, b) => standings[b.id].wins - standings[a.id].wins)
                  .map((team) => {
                    const s = standings[team.id];
                    const tr = fixtures.filter(
                      (f) => !f.result && (f.a === team.id || f.b === team.id),
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
                        />
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
                          />
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
        })()
      )}
    </div>
  );
}
