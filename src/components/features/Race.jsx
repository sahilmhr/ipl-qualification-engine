import { COLORS } from "../../constants";
import { QualRace } from "../common/QualRace";
import { fmtNRR } from "../../utils/helpers";
import { TEAMS } from "../../constants";

const C = COLORS.primary;
const Y = COLORS.secondary;
const G = COLORS.success;
const R = COLORS.error;

export function RaceTab({ standings, fixtures, allQual, rankedTeams }) {
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
            marginBottom: 10,
          }}
        >
          QUALIFICATION RACE — ALL TEAMS
        </div>
        <QualRace
          standings={standings}
          fixtures={fixtures}
          allQual={allQual}
        />
      </div>
      <div
        style={{
          background: "var(--color-background-primary)",
          borderRadius: 12,
          border: "0.5px solid var(--color-border-tertiary)",
          padding: "1rem 1.25rem",
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: "var(--color-text-secondary)",
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          ALL MAGIC NUMBERS
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5,1fr)",
            gap: 8,
          }}
        >
          {rankedTeams.map((team, idx) => {
            const q = allQual?.[team.id];
            const vc = q?.alreadyGuaranteed ? G : q?.impossible ? R : C;
            const label = q?.alreadyGuaranteed
              ? "✓"
              : q?.impossible
                ? "✗"
                : q?.minAdditionalWins != null
                  ? String(q.minAdditionalWins)
                  : "—";
            return (
              <div
                key={team.id}
                style={{
                  background: "var(--color-background-secondary)",
                  borderRadius: 10,
                  padding: "12px 8px",
                  textAlign: "center",
                  border: `0.5px solid ${idx < 4 ? `${team.color}44` : "var(--color-border-tertiary)"}`,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: team.color,
                    margin: "0 auto 5px",
                  }}
                ></div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    marginBottom: 4,
                  }}
                >
                  {team.short}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: vc }}>
                  {label}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--color-text-tertiary)",
                    marginTop: 2,
                  }}
                >
                  {q?.alreadyGuaranteed
                    ? "guaranteed"
                    : q?.impossible
                      ? "eliminated"
                      : "wins needed"}
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 10,
            color: "var(--color-text-tertiary)",
          }}
        >
          Magic number = additional wins needed to mathematically
          guarantee Top 4, ignoring NRR. Computed via max-flow for all 10
          teams simultaneously.
        </div>
      </div>
    </div>
  );
}

export default RaceTab;
