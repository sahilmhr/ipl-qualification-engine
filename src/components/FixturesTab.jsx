import { TEAMS, teamMap } from "../data/teams";
import { fmtScore } from "../utils/qualification";

export default function FixturesTab({
  fixtures,
  filterTeam,
  setFilterTeam,
  matchPage,
  setMatchPage,
  totalPages,
  paged,
  setModalMatch,
}) {
  const filtered =
    filterTeam === "ALL"
      ? fixtures
      : fixtures.filter((f) => f.a === filterTeam || f.b === filterTeam);

  const G = "#22c55e";

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <select
          value={filterTeam}
          onChange={(e) => {
            setFilterTeam(e.target.value);
            setMatchPage(0);
          }}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "0.5px solid var(--color-border-secondary)",
            background: "var(--color-background-primary)",
            color: "var(--color-text-primary)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          <option value="ALL">All Teams</option>
          {TEAMS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          {filtered.filter((f) => f.result).length}/{filtered.length} done
        </span>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setMatchPage((p) => Math.max(0, p - 1))}
          disabled={matchPage === 0}
          style={{
            padding: "6px 11px",
            borderRadius: 6,
            border: "0.5px solid var(--color-border-secondary)",
            cursor: "pointer",
            background: "var(--color-background-secondary)",
            color: "var(--color-text-primary)",
            fontSize: 12,
          }}
        >
          ←
        </button>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          {matchPage + 1}/{totalPages}
        </span>
        <button
          onClick={() => setMatchPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={matchPage >= totalPages - 1}
          style={{
            padding: "6px 11px",
            borderRadius: 6,
            border: "0.5px solid var(--color-border-secondary)",
            cursor: "pointer",
            background: "var(--color-background-secondary)",
            color: "var(--color-text-primary)",
            fontSize: 12,
          }}
        >
          →
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {paged.map((match) => {
          const res = match.result;
          const isNR = res?.type === "nr";
          const isWin = res?.type === "win";
          return (
            <div
              key={match.id}
              onClick={() => setModalMatch(match)}
              style={{
                background: "var(--color-background-primary)",
                borderRadius: 9,
                border: isNR
                  ? "0.5px solid #94a3b888"
                  : isWin
                  ? "0.5px solid #22c55e44"
                  : "0.5px solid var(--color-border-tertiary)",
                padding: "9px 13px",
                display: "flex",
                alignItems: "center",
                gap: 9,
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--color-background-secondary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--color-background-primary)")
              }
            >
              <div style={{ minWidth: 44, flexShrink: 0 }}>
                <div style={{ fontSize: 9, color: "var(--color-text-tertiary)" }}>
                  M{match.id}
                </div>
                <div style={{ fontSize: 9, color: "var(--color-text-tertiary)" }}>
                  {match.date}
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                {[match.a, match.b].map((tid, i) => {
                  const t = teamMap[tid];
                  return (
                    <span
                      key={tid}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 13,
                        fontWeight: isWin && res.winner === tid ? 700 : 400,
                        color: isWin && res.winner === tid ? G : "var(--color-text-primary)",
                      }}
                    >
                      {i === 1 && (
                        <span style={{ fontSize: 9, color: "var(--color-text-tertiary)" }}>
                          vs
                        </span>
                      )}
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: t.color,
                          display: "inline-block",
                        }}
                      />
                      {t.short}
                    </span>
                  );
                })}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {!res && (
                  <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
                    Click to add
                  </span>
                )}
                {isNR && (
                  <span
                    style={{
                      fontSize: 11,
                      color: "#94a3b8",
                      fontWeight: 600,
                    }}
                  >
                    NO RESULT
                  </span>
                )}
                {isWin && (
                  <div>
                    <div style={{ fontSize: 11, color: G, fontWeight: 600 }}>
                      {teamMap[res.winner].short} won
                    </div>
                    {res.scoreA?.runs && (
                      <div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>
                        {fmtScore(res.scoreA)} · {fmtScore(res.scoreB)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
