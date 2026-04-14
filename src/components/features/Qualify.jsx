import { TEAMS, COLORS } from "../../constants";
import { teamMap } from "../../constants";
import { fmtNRR } from "../../utils/helpers";

const C = COLORS.primary;
const Y = COLORS.secondary;
const G = COLORS.success;
const R = COLORS.error;

export function QualifyTab({
  selectedTeam,
  setSelectedTeam,
  standings,
  fixtures,
  qualResult,
  computing,
  handleCompute,
  rankedTeams,
  criticalMatches,
  setModalMatch,
  setQualResult,
}) {
  const s = standings[selectedTeam];
  const rem = fixtures.filter(
    (f) =>
      !f.result && (f.a === selectedTeam || f.b === selectedTeam),
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
                setQualResult(null);
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
            <div style={{ fontSize: 20, fontWeight: 700, color: c }}>
              {v}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "var(--color-background-secondary)",
          borderRadius: 8,
          padding: "9px 12px",
          marginBottom: 10,
          fontSize: 11,
          color: "var(--color-text-secondary)",
          lineHeight: 1.7,
        }}
      >
        <strong style={{ color: "var(--color-text-primary)" }}>
          Algorithm:
        </strong>{" "}
        Checks all C(9,4)=126 rival subsets via Edmonds-Karp max-flow on
        the fixture graph. Qualification is computed on wins only — NRR is
        non-deterministic.
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
          fontFamily: "sans-serif",
        }}
      >
        {computing
          ? "⏳ Running max-flow..."
          : `▶  Compute Qualification — ${teamMap[selectedTeam].name}`}
      </button>

      {qualResult && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(() => {
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
              <div>
                {/* Results rendered similarly to original */}
                <div
                  style={{
                    background: "var(--color-background-primary)",
                    borderRadius: 10,
                    border: "0.5px solid var(--color-border-tertiary)",
                    padding: "1rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color:
                        qualResult.impossible
                          ? R
                          : qualResult.alreadyGuaranteed
                            ? G
                            : C,
                    }}
                  >
                    {qualResult.alreadyGuaranteed ? (
                      "Already Guaranteed ✓"
                    ) : qualResult.impossible ? (
                      "Mathematically Eliminated"
                    ) : (
                      <>
                        Need {qualResult.minAdditionalWins} more win
                        {qualResult.minAdditionalWins !== 1 ? "s" : ""} → guaranteed at{" "}
                        {qualResult.currentWins + qualResult.minAdditionalWins}W
                      </>
                    )}
                  </div>
                </div>

                {/* Win Tracker */}
                <div
                  style={{
                    background: "var(--color-background-primary)",
                    borderRadius: 10,
                    border: "0.5px solid var(--color-border-tertiary)",
                    padding: "1rem",
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
                    WIN TRACKER — 14 MATCHES
                  </div>
                  <div
                    style={{ display: "flex", gap: 3, marginBottom: 7 }}
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
                              ? G
                              : !alreadyGuaranteed && i < targetWins
                                ? C
                                : i < currentWins + remaining
                                  ? "#ffffff15"
                                  : "#ffffff06",
                          border:
                            !alreadyGuaranteed &&
                            i >= currentWins &&
                            i < targetWins
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
                            background: C,
                            border: `1px solid ${Y}`,
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
                          background: "#ffffff15",
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
                      Target: {targetWins}W
                    </span>
                  </div>
                </div>

                {/* Rival Analysis */}
                <div
                  style={{
                    background: "var(--color-background-primary)",
                    borderRadius: 10,
                    border: "0.5px solid var(--color-border-tertiary)",
                    padding: "1rem",
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
                    RIVAL ANALYSIS
                  </div>
                  {TEAMS.filter((t) => t.id !== selectedTeam)
                    .sort(
                      (a, b) => standings[b.id].wins - standings[a.id].wins,
                    )
                    .map((rivalTeam) => {
                      const s = standings[rivalTeam.id];
                      const tr = fixtures.filter(
                        (f) =>
                          !f.result && (f.a === rivalTeam.id || f.b === rivalTeam.id),
                      ).length;
                      const h2h = fixtures.filter(
                        (f) =>
                          !f.result &&
                          ((f.a === selectedTeam && f.b === rivalTeam.id) ||
                            (f.b === selectedTeam && f.a === rivalTeam.id)),
                      ).length;
                      const canReach = s.wins + tr >= targetWins + 1;
                      return (
                        <div
                          key={rivalTeam.id}
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
                              background: rivalTeam.color,
                              flexShrink: 0,
                            }}
                          ></span>
                          <span
                            style={{
                              width: 34,
                              fontWeight: 600,
                              fontSize: 11,
                              color: "var(--color-text-primary)",
                            }}
                          >
                            {rivalTeam.short}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: 7,
                              background: "#ffffff10",
                              borderRadius: 3,
                              overflow: "hidden",
                              minWidth: 50,
                            }}
                          >
                            <div
                              style={{
                                width: `${(s.wins / 14) * 100}%`,
                                height: "100%",
                                background: rivalTeam.color,
                                borderRadius: 3,
                              }}
                            ></div>
                          </div>
                          <span
                            style={{
                              width: 52,
                              textAlign: "right",
                              fontSize: 10,
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
          })()}


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
                ⚡ CRITICAL MATCHES FOR {teamMap[selectedTeam].short}
              </div>
              {criticalMatches.map(({ match, wWin, wLoss }) => {
                const tA = teamMap[match.a],
                  tB = teamMap[match.b];
                return (
                  <div
                    key={match.id}
                    onClick={() => setModalMatch(match)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 7,
                      padding: "8px 10px",
                      background: "var(--color-background-secondary)",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ flexShrink: 0, minWidth: 44 }}>
                      <div style={{ fontSize: 9, color: "var(--color-text-tertiary)" }}>
                        M{match.id}
                      </div>
                      <div style={{ fontSize: 9, color: "var(--color-text-tertiary)" }}>
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
                        Win →{" "}
                        {wWin === 0
                          ? "✓ guaranteed"
                          : wWin === 99
                            ? "eliminated"
                            : `need ${wWin} more`}
                      </div>
                      <div style={{ color: R }}>
                        Loss →{" "}
                        {wLoss === 0
                          ? "✓ guaranteed"
                          : wLoss === 99
                            ? "eliminated"
                            : `need ${wLoss} more`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QualifyTab;
