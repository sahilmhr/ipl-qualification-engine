import { TABS, COLORS } from "../../constants";

const C = COLORS.primary;

export function TabNavigation({ tab, setTab }) {
  return (
    <div
      style={{
        background: "#080808",
        borderBottom: "1px solid #181818",
        position: "sticky",
        top: 0,
        zIndex: 50,
        overflowX: "auto",
      }}
    >
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          display: "flex",
          whiteSpace: "nowrap",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              localStorage.setItem('tab', t);
            }}
            style={{
              padding: "10px 16px",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "sans-serif",
              background: tab === t ? C : "transparent",
              color: tab === t ? "#fff" : "#666",
              fontWeight: tab === t ? 600 : 400,
              borderBottom:
                tab === t ? `2px solid #FBBF24` : "2px solid transparent",
              flexShrink: 0,
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TabNavigation;
