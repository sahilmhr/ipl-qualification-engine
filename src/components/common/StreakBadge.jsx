export function StreakBadge({ streak }) {
  if (!streak || streak.count === 0)
    return (
      <span style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>
        —
      </span>
    );
  const color =
    streak.type === "W"
      ? "#22c55e"
      : streak.type === "L"
        ? "#ef4444"
        : "#94a3b8";
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: color,
        background: `${color}18`,
        padding: "2px 6px",
        borderRadius: 4,
        whiteSpace: "nowrap",
      }}
    >
      {streak.count}
      {streak.type}
    </span>
  );
}
