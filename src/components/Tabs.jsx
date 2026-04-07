export default function Tabs({ tab, setTab, tabs }) {
  const C = "#EA580C";
  const Y = "#FBBF24";

  return (
    <div
      style={{
        background: "#0a0a0a",
        borderBottom: "1px solid #1a1a1a",
        position: "sticky",
        top: 0,
        zIndex: 50,
        overflowX: "auto",
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          display: "flex",
          whiteSpace: "nowrap",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "10px 18px",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "sans-serif",
              background: tab === t ? C : "transparent",
              color: tab === t ? "#fff" : "#666",
              fontWeight: tab === t ? 600 : 400,
              borderBottom:
                tab === t ? `2px solid ${Y}` : "2px solid transparent",
              flexShrink: 0,
            }}
          >
            {t === "Head-to-Head" ? "H2H" : t}
          </button>
        ))}
      </div>
    </div>
  );
}
