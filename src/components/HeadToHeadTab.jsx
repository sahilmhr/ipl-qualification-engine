import { TEAMS, teamMap } from "../data/teams";

export default function HeadToHeadTab({
  h2hA,
  h2hB,
  setH2hA,
  setH2hB,
  standings,
  rankedTeams,
  h2hStats,
  fixtures,
  setModalMatch,
}) {
  const tA = teamMap[h2hA];
  const tB = teamMap[h2hB];
  const sA = standings[h2hA];
  const sB = standings[h2hB];
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 14,
        }}
      >
        {[
          [h2hA, setH2hA, "Team A"],
          [h2hB, setH2hB, "Team B"],
        ].map(([val, setter, label], pi) => (
          <div
            key={label}
            style={{
              background: "var(--color-background-primary)",
              borderRadius: 12,
              border: "0.5px solid var(--color-border-tertiary)",
              padding: "0.9rem",
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
              {label}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {TEAMS.filter((t) => t.id !== (pi === 0 ? h2hB : h2hA)).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setter(t.id)}
                  style={{
                    padding: "4px 9px",
                    border: "1px solid",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 11,
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

      <div
        style={{
          background: "var(--color-background-primary)",
          borderRadius: 14,
          border: "0.5px solid var(--color-border-tertiary)",
          padding: "1.25rem",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
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
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              {tA.name}
            </div>
            <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>
              #{rankedTeams.findIndex((t) => t.id === h2hA) + 1} · {sA.points}pts
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "0 12px" }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "var(--color-text-primary)",
                letterSpacing: 2,
              }}
            >
              {h2hStats.aWins} – {h2hStats.bWins}
            </div>
            <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>
              {h2hStats.played.length} played · {h2hStats.remaining.length} remaining
            </div>
            {leader && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  color: leader.color,
                  fontWeight: 600,
                }}
              >
                {leader.short} leads
              </div>
            )}
            {!leader && total > 0 && (
              <div style={{ marginTop: 4, fontSize: 11, color: "var(--color-text-secondary)" }}>
                Level
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
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              {tB.name}
            </div>
            <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>
              #{rankedTeams.findIndex((t) => t.id === h2hB) + 1} · {sB.points}pts
            </div>
          </div>
        </div>

        {total > 0 && (
          <>
            <div
              style={{
                display: "flex",
                height: 10,
                borderRadius: 5,
                overflow: "hidden",
                marginBottom: 5,
              }}
            >
              <div style={{ width: `${aPct}%`, background: tA.color, transition: "width 0.4s" }} />
              <div style={{ flex: 1, background: tB.color, transition: "width 0.4s" }} />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                color: "var(--color-text-secondary)",
              }}
            >
              <span style={{ color: tA.color, fontWeight: 600 }}>{Math.round(aPct)}%</span>
              <span>Win share</span>
              <span style={{ color: tB.color, fontWeight: 600 }}>{Math.round(100 - aPct)}%</span>
            </div>
          </>
        )}
      </div>

      <div
        style={{
          background: "var(--color-background-primary)",
          borderRadius: 12,
          border: "0.5px solid var(--color-border-tertiary)",
          padding: "1rem",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: "var(--color-text-secondary)",
            marginBottom: 12,
            letterSpacing: 1,
          }}
        >
          SEASON COMPARISON
        </div>
        {[
          ["Points", sA.points, sB.points],
          ["Wins", sA.wins, sB.wins],
          ["Losses", sA.losses, sB.losses, true],
          ["NRR", sA.nrr?.toFixed(3), sB.nrr?.toFixed(3)],
          [
            "Remaining",
            fixtures.filter((f) => !f.result && (f.a === h2hA || f.b === h2hA)).length,
            fixtures.filter((f) => !f.result && (f.a === h2hB || f.b === h2hB)).length,
          ],
        ].map(([label, va, vb, invertWinner]) => {
          const aNum = parseFloat(va);
          const bNum = parseFloat(vb);
          const aBetter = invertWinner ? aNum < bNum : aNum > bNum;
          const bBetter = invertWinner ? bNum < aNum : bNum > aNum;
          return (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: aBetter ? tA.color : "var(--color-text-primary)",
                  minWidth: 36,
                  textAlign: "right",
                }}
              >
                {va}
              </span>
              <div
                style={{
                  flex: 1,
                  position: "relative",
                  height: 6,
                  background: "var(--color-background-secondary)",
                  borderRadius: 3,
                }}
              >
                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    background: aBetter
                      ? tA.color
                      : bBetter
                      ? tB.color
                      : "var(--color-border-secondary)",
                    width: `${Math.abs(aNum - bNum) === 0 ? 50 : aBetter ? 70 : 30}%`,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--color-text-tertiary)",
                  minWidth: 60,
                  textAlign: "center",
                }}
              >
                {label}
              </span>
              <div
                style={{
                  flex: 1,
                  position: "relative",
                  height: 6,
                  background: "var(--color-background-secondary)",
                  borderRadius: 3,
                  transform: "scaleX(-1)",
                }}
              >
                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    background: bBetter
                      ? tB.color
                      : aBetter
                      ? tA.color
                      : "var(--color-border-secondary)",
                    width: `${Math.abs(aNum - bNum) === 0 ? 50 : bBetter ? 70 : 30}%`,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: bBetter ? tB.color : "var(--color-text-primary)",
                  minWidth: 36,
                }}
              >
                {vb}
              </span>
            </div>
          );
        })}
      </div>

      {h2hStats.played.length > 0 && (
        <div
          style={{
            background: "var(--color-background-primary)",
            borderRadius: 12,
            border: "0.5px solid var(--color-border-tertiary)",
            padding: "1rem",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "var(--color-text-secondary)",
              marginBottom: 10,
              letterSpacing: 1,
            }}
          >
            MATCH HISTORY THIS SEASON
          </div>
          {h2hStats.played.map((match) => {
            const res = match.result;
            const winnerTeam = teamMap[res.winner];
            return (
              <div
                key={match.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", minWidth: 50 }}>
                  {match.date}
                </div>
                <div style={{ flex: 1, fontSize: 12 }}>
                  <span
                    style={{
                      color:
                        match.a === res.winner ? teamMap[match.a].color : "var(--color-text-secondary)",
                      fontWeight: match.a === res.winner ? 700 : 400,
                    }}
                  >
                    {teamMap[match.a].short}
                  </span>
                  <span style={{ color: "var(--color-text-tertiary)", margin: "0 6px" }}>vs</span>
                  <span
                    style={{
                      color:
                        match.b === res.winner ? teamMap[match.b].color : "var(--color-text-secondary)",
                      fontWeight: match.b === res.winner ? 700 : 400,
                    }}
                  >
                    {teamMap[match.b].short}
                  </span>
                </div>
                {res.scoreA?.runs && (
                  <div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>
                    {`${res.scoreA.runs}/${res.scoreA.wickets || 0} (${res.scoreA.overs || 0})`} · {`${res.scoreB.runs}/${res.scoreB.wickets || 0} (${res.scoreB.overs || 0})`}
                  </div>
                )}
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: winnerTeam.color,
                    minWidth: 50,
                    textAlign: "right",
                  }}
                >
                  {winnerTeam.short} won
                </div>
              </div>
            );
          })}
        </div>
      )}

      {h2hStats.remaining.length > 0 && (
        <div
          style={{
            background: "var(--color-background-primary)",
            borderRadius: 12,
            border: "0.5px solid var(--color-border-tertiary)",
            padding: "1rem",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "var(--color-text-secondary)",
              marginBottom: 10,
              letterSpacing: 1,
            }}
          >
            UPCOMING FIXTURES
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
              <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", minWidth: 50 }}>
                {match.date}
              </div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>
                <span style={{ color: tA.color }}>{tA.short}</span>
                <span style={{ color: "var(--color-text-tertiary)", margin: "0 6px" }}>vs</span>
                <span style={{ color: tB.color }}>{tB.short}</span>
              </div>
              <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
                M{match.id} · Click to enter result →
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
