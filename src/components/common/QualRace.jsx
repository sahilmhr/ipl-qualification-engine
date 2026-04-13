import { TEAMS } from "../../constants";

const G = "#22c55e";
const R = "#ef4444";

export function QualRace({ standings, fixtures, allQual }) {
  const sorted = [...TEAMS].sort((a, b) => {
    const sa = standings[a.id],
      sb = standings[b.id];
    if (sb.points !== sa.points) return sb.points - sa.points;
    return (sb.nrr || 0) - (sa.nrr || 0);
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {sorted.map((team, idx) => {
        const s = standings[team.id];
        const rem = fixtures.filter(
          (f) => !f.result && (f.a === team.id || f.b === team.id),
        ).length;
        const maxWins = s.wins + rem;
        const q = allQual?.[team.id];
        const guaranteed = q?.alreadyGuaranteed;
        const eliminated = q?.impossible;
        const needMore =
          !guaranteed && !eliminated ? q?.minAdditionalWins : null;
        const wonPct = (s.wins / 14) * 100;
        const maxPct = (maxWins / 14) * 100;
        const qualLine = (10 / 14) * 100; // approximate qual line
        return (
          <div
            key={team.id}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <span
              style={{
                width: 18,
                fontSize: 11,
                fontWeight: 700,
                color: idx < 4 ? "#EA580C" : "var(--color-text-secondary)",
              }}
            >
              {idx + 1}
            </span>
            <span
              style={{
                width: 36,
                fontSize: 11,
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              {team.short}
            </span>
            <div
              style={{
                flex: 1,
                position: "relative",
                height: 18,
                background: "var(--color-background-secondary)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              {/* max possible (projected) */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: `${maxPct}%`,
                  background: team.color,
                  opacity: 0.18,
                  borderRadius: 4,
                }}
              />
              {/* actual wins */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: `${wonPct}%`,
                  background: team.color,
                  borderRadius: 4,
                }}
              />
              {/* qual threshold line */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: `${qualLine}%`,
                  width: 1.5,
                  height: "100%",
                  background: "#FBBF24",
                  opacity: 0.6,
                }}
              />
            </div>
            <span
              style={{
                width: 28,
                textAlign: "right",
                fontSize: 11,
                fontWeight: 700,
                color: G,
              }}
            >
              {s.wins}W
            </span>
            <span style={{ width: 42, textAlign: "right", fontSize: 10 }}>
              {guaranteed && (
                <span style={{ color: G, fontWeight: 700 }}>
                  ✓ Done
                </span>
              )}
              {eliminated && (
                <span style={{ color: R, fontWeight: 700 }}>✗ Out</span>
              )}
              {needMore !== null && needMore !== undefined && (
                <span style={{ color: "#EA580C" }}>+{needMore}W</span>
              )}
            </span>
          </div>
        );
      })}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginTop: 4,
          fontSize: 10,
          color: "var(--color-text-tertiary)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span
            style={{
              width: 10,
              height: 10,
              background: "#FBBF24",
              opacity: 0.6,
              display: "inline-block",
              borderRadius: 1,
            }}
          ></span>
          ~Qual line
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span
            style={{
              width: 10,
              height: 8,
              background: "#888",
              opacity: 0.3,
              display: "inline-block",
              borderRadius: 2,
            }}
          ></span>
          Max possible (projected)
        </span>
      </div>
    </div>
  );
}
