import { TEAMS } from "../../constants";

export function PointsChart({ progression, visibleTeams }) {
  if (progression.length < 2)
    return (
      <div
        style={{
          height: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-tertiary)",
          fontSize: 13,
        }}
      >
        Enter match results to see points progression
      </div>
    );
  const W = 560,
    H = 180,
    PAD = { t: 20, r: 20, b: 30, l: 28 };
  const cW = W - PAD.l - PAD.r,
    cH = H - PAD.t - PAD.b;
  const maxPts = Math.max(
    ...progression.map((s) => Math.max(...TEAMS.map((t) => s.points[t.id]))),
    2,
  );
  const xScale = (i) => (i / (progression.length - 1)) * cW;
  const yScale = (v) => cH - (v / maxPts) * cH;
  const teamLines = TEAMS.filter((t) => visibleTeams[t.id] !== false).map(
    (team) => {
      const pts = progression.map((s, i) => ({
        x: xScale(i),
        y: yScale(s.points[team.id]),
      }));
      const d = pts
        .map(
          (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`,
        )
        .join(" ");
      return {
        team,
        d,
        last: pts[pts.length - 1],
        lastPts: progression[progression.length - 1].points[team.id],
      };
    },
  );
  // y-axis ticks
  const yTicks = [];
  for (let v = 0; v <= maxPts; v += 2) yTicks.push(v);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      {/* Grid lines */}
      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={PAD.l}
            y1={PAD.t + yScale(v)}
            x2={PAD.l + cW}
            y2={PAD.t + yScale(v)}
            stroke="var(--color-border-tertiary)"
            strokeWidth="0.5"
          />
          <text
            x={PAD.l - 4}
            y={PAD.t + yScale(v) + 4}
            textAnchor="end"
            fontSize="9"
            fill="var(--color-text-tertiary)"
          >
            {v}
          </text>
        </g>
      ))}
      {/* Lines */}
      {teamLines.map(({ team, d, last, lastPts }) => (
        <g key={team.id}>
          <path
            d={d}
            fill="none"
            stroke={team.color}
            strokeWidth="1.5"
            transform={`translate(${PAD.l},${PAD.t})`}
            strokeLinejoin="round"
          />
          <circle
            cx={PAD.l + last.x}
            cy={PAD.t + last.y}
            r="3"
            fill={team.color}
          />
          <text
            x={PAD.l + last.x + 5}
            y={PAD.t + last.y + 4}
            fontSize="9"
            fill={team.color}
            fontWeight="600"
          >
            {lastPts}
          </text>
        </g>
      ))}
      {/* x-axis label */}
      <text
        x={PAD.l + cW / 2}
        y={H - 2}
        textAnchor="middle"
        fontSize="9"
        fill="var(--color-text-tertiary)"
      >
        Match number
      </text>
    </svg>
  );
}
