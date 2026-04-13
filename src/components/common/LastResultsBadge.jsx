export function LastResultsBadge({ results }) {
  if (!results || results.length === 0)
    return (
      <span
        style={{
          fontSize: 10,
          color: "var(--color-text-tertiary)",
          justifyContent: "center",
        }}
      >
        —
      </span>
    );
  // Get last 4 results
  const last4 = results.slice(-4);
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: "1px",
        whiteSpace: "nowrap",
        display: "flex",
        gap: "3px",
        justifyContent: "center",
      }}
    >
      {last4.map((result, idx) => {
        const color =
          result === "W" ? "#22c55e" : result === "L" ? "#ef4444" : "#94a3b8";
        return (
          <span
            key={idx}
            style={{
              color: color,
              fontWeight: 700,
            }}
          >
            {result}
          </span>
        );
      })}
    </span>
  );
}
