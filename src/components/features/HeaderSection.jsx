import { COLORS, TABS } from "../../constants";

const C = COLORS.primary;
const Y = COLORS.secondary;
const G = COLORS.success;
const R = COLORS.error;

export function HeaderSection({
  played,
  exportMsg,
  dataExportMsg,
  dataImportMsg,
  exportStandings,
  exportData,
  fileInputRef,
  handleImport,
  resetAll,
  loadTestData,
}) {
  return (
    <div
      style={{
        background: "#080808",
        padding: "1rem 1.5rem 0.8rem",
        borderBottom: `2px solid ${C}`,
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              background: C,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              color: "#fff",
              fontSize: 17,
            }}
          >
            ♦
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: Y,
                letterSpacing: 1,
              }}
            >
              TATA IPL 2026
            </div>
            <div style={{ fontSize: 9, color: `${C}bb`, letterSpacing: 3 }}>
              MATHEMATICAL QUALIFICATION ENGINE
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={exportStandings}
              style={{
                padding: "5px 10px",
                background: "transparent",
                border: `0.5px solid ${Y}66`,
                borderRadius: 6,
                color: Y,
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "sans-serif",
              }}
            >
              {exportMsg || "⎘ Copy Standings"}
            </button>
            <button
              onClick={exportData}
              style={{
                padding: "5px 10px",
                background: "transparent",
                border: `0.5px solid ${G}66`,
                borderRadius: 6,
                color: G,
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "sans-serif",
              }}
            >
              {dataExportMsg || "⎘ Export Data"}
            </button>
            <button
              onClick={() => fileInputRef.current.click()}
              style={{
                padding: "5px 10px",
                background: "transparent",
                border: `0.5px solid ${C}66`,
                borderRadius: 6,
                color: C,
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "sans-serif",
              }}
            >
              {dataImportMsg || "⎗ Import Data"}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              style={{ display: "none" }}
              accept=".json"
            />
            <button
              onClick={loadTestData}
              style={{
                padding: "5px 10px",
                background: "transparent",
                border: `0.5px solid ${Y}66`,
                borderRadius: 6,
                color: Y,
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "sans-serif",
              }}
            >
              🧪 Test Data
            </button>
            <button
              onClick={resetAll}
              style={{
                padding: "5px 10px",
                background: "transparent",
                border: `0.5px solid ${R}66`,
                borderRadius: 6,
                color: R,
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "sans-serif",
              }}
            >
              ↺ Reset
            </button>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            fontSize: 11,
            color: "#555",
          }}
        >
          <span style={{ color: G }}>✓ Official 70-match schedule</span>
          <span style={{ color: "#888" }}>{played}/70 results</span>
          <span style={{ color: "#666" }}>Auto-saved to browser</span>
          <span style={{ color: Y }}>
            Max-flow · C(9,4)=126 · NRR · Streaks
          </span>
        </div>
      </div>
    </div>
  );
}

export default HeaderSection;
