import { TEAMS } from "../../constants";
import { teamMap } from "../../constants";
import { StreakBadge } from "../common/StreakBadge";

export function H2HTab({ h2hA, h2hB, setH2hA, setH2hB, h2hStats, standings, rankedTeams, fixtures, setModalMatch, fmtScore }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        {[
          [h2hA, setH2hA, "Team A", h2hB],
          [h2hB, setH2hB, "Team B", h2hA],
        ].map(([val, setter, label, exclude]) => (
          <div
            key={label}
            style={{
              background: "var(--color-background-primary)",
              borderRadius: 12,
              border: "0.5px solid var(--color-border-tertiary)",
              padding: "0.9rem",
            }}
          >
            <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginBottom: 8, letterSpacing: 1 }}>
              {label}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {TEAMS.filter((t) => t.id !== exclude).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setter(t.id)}
                  style={{
                    padding: "4px 9px",
                    border: "1px solid",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 11,
                    fontFamily: "sans-serif",
                    background: val === t.id ? t.color : "transparent",
                    color: val === t.id ? "#fff" : "var(--color-text-primary)",
                    borderColor: val === t.id ? t.color : "var(--color-border-secondary)",
                    fontWeight: val === t.id ? 600 : 400,
                  }}
                >
                  {t.short}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {(() => {
        const tA = teamMap[h2hA],
          tB = teamMap[h2hB];
        const sA = standings[h2hA],
          sB = standings[h2hB];
        const total = h2hStats.aWins + h2hStats.bWins;
        const aPct = total > 0 ? (h2hStats.aWins / total) * 100 : 50;
        const leader =
          h2hStats.aWins > h2hStats.bWins
            ? tA
            : h2hStats.bWins > h2hStats.aWins
              ? tB
              : null;

        return (
          <div>
            {/* Big scoreline */}
            <div
              style={{
                background: "var(--color-background-primary)",
                borderRadius: 14,
                border: "0.5px solid var(--color-border-tertiary)",
                padding: "1.25rem",
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: tA.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 16,
                      margin: "0 auto 6px",
                    }}
                  >
                    {tA.short[0]}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-primary)" }}>
                    {tA.name}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>
                    #{rankedTeams.findIndex((t) => t.id === h2hA) + 1} · {sA.points}pts
                  </div>
                  <StreakBadge streak={sA.currentStreak} />
                </div>
                <div style={{ textAlign: "center", padding: "0 12px", minWidth: 100 }}>
                  <div style={{ fontSize: 30, fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: 3 }}>
                    {h2hStats.aWins} – {h2hStats.bWins}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>
                    {h2hStats.played.length} played · {h2hStats.remaining.length} left
                  </div>
                  {leader && (
                    <div style={{ marginTop: 4, fontSize: 11, color: leader.color, fontWeight: 600 }}>
                      {leader.short} leads
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: tB.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 16,
                      margin: "0 auto 6px",
                    }}
                  >
                    {tB.short[0]}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-primary)" }}>
                    {tB.name}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>
                    #{rankedTeams.findIndex((t) => t.id === h2hB) + 1} · {sB.points}pts
                  </div>
                  <StreakBadge streak={sB.currentStreak} />
                </div>
              </div>
              {total > 0 && (
                <div>
                  <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", marginBottom: 5 }}>
                    <div style={{ width: `${aPct}%`, background: tA.color, transition: "width 0.4s" }}></div>
                    <div style={{ flex: 1, background: tB.color }}></div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--color-text-secondary)" }}>
                    <span style={{ color: tA.color, fontWeight: 600 }}>{Math.round(aPct)}%</span>
                    <span>H2H win share this season</span>
                    <span style={{ color: tB.color, fontWeight: 600 }}>{Math.round(100 - aPct)}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Upcoming */}
            {h2hStats.remaining.length > 0 && (
              <div
                style={{
                  background: "var(--color-background-primary)",
                  borderRadius: 12,
                  border: "0.5px solid var(--color-border-tertiary)",
                  padding: "1rem",
                }}
              >
                <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginBottom: 10, letterSpacing: 1 }}>
                  UPCOMING
                </div>
                {h2hStats.remaining.map((match) => (
                  <div
                    key={match.id}
                    onClick={() => setModalMatch(match)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 8,
                      cursor: "pointer",
                      marginBottom: 4,
                      border: "0.5px solid var(--color-border-tertiary)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--color-background-secondary)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", minWidth: 48 }}>
                      {match.date}
                    </div>
                    <div style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>
                      <span style={{ color: tA.color }}>{tA.short}</span>
                      <span style={{ color: "var(--color-text-tertiary)", margin: "0 6px" }}>vs</span>
                      <span style={{ color: tB.color }}>{tB.short}</span>
                    </div>
                    <span style={{ fontSize: 11, color: "#EA580C" }}>
                      M{match.id} · Click to enter →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

export default H2HTab;
