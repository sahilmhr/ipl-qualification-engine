import { useState } from "react";
import { teamMap } from "../../constants";

export function MatchModal({ match, onSave, onClose }) {
  const tA = teamMap[match.a],
    tB = teamMap[match.b];
  const [mode, setMode] = useState(match.result?.type === "nr" ? "nr" : "win");
  const [winner, setWinner] = useState(match.result?.winner || match.a);
  const [scoreA, setScoreA] = useState(
    match.result?.scoreA || { runs: "", wickets: "", overs: "" },
  );
  const [scoreB, setScoreB] = useState(
    match.result?.scoreB || { runs: "", wickets: "", overs: "" },
  );
  const btn = {
    padding: "7px 14px",
    border: "0.5px solid",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "sans-serif",
  };
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000c",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--color-background-primary)",
          borderRadius: 14,
          border: "0.5px solid var(--color-border-secondary)",
          padding: "1.5rem",
          width: "min(460px,95vw)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-tertiary)",
                marginBottom: 3,
              }}
            >
              MATCH {match.id} · {match.date}
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              <span style={{ color: tA.color }}>{tA.name}</span>
              <span
                style={{
                  color: "var(--color-text-tertiary)",
                  fontWeight: 400,
                  margin: "0 6px",
                }}
              >
                vs
              </span>
              <span style={{ color: tB.color }}>{tB.name}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: "var(--color-text-secondary)",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[
            ["win", "Result"],
            ["nr", "No Result / Washed Out"],
          ].map(([m, l]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                ...btn,
                flex: 1,
                background:
                  mode === m
                    ? m === "nr"
                      ? "#64748b"
                      : "#EA580C"
                    : "transparent",
                color: mode === m ? "#fff" : "var(--color-text-secondary)",
                borderColor:
                  mode === m
                    ? m === "nr"
                      ? "#64748b"
                      : "#EA580C"
                    : "var(--color-border-secondary)",
              }}
            >
              {l}
            </button>
          ))}
        </div>
        {mode === "nr" ? (
          <div
            style={{
              padding: 14,
              background: "var(--color-background-secondary)",
              borderRadius: 10,
              textAlign: "center",
              fontSize: 13,
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
              marginBottom: 14,
            }}
          >
            Match abandoned.{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>
              Both teams get 1 point.
            </strong>{" "}
            No NRR impact.
          </div>
        ) : (
          <div>
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-secondary)",
                marginBottom: 8,
                letterSpacing: 1,
              }}
            >
              WINNER
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {[match.a, match.b].map((tid) => {
                const t = teamMap[tid];
                return (
                  <button
                    key={tid}
                    onClick={() => setWinner(tid)}
                    style={{
                      flex: 1,
                      padding: "9px 0",
                      border: "1.5px solid",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: "sans-serif",
                      background: winner === tid ? t.color : "transparent",
                      color:
                        winner === tid ? "#fff" : "var(--color-text-primary)",
                      borderColor:
                        winner === tid
                          ? t.color
                          : "var(--color-border-secondary)",
                    }}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-secondary)",
                marginBottom: 8,
                letterSpacing: 1,
              }}
            >
              SCORES{" "}
              <span
                style={{
                  color: "var(--color-text-tertiary)",
                  fontSize: 10,
                  fontWeight: 400,
                }}
              >
                (optional — needed for NRR)
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 4 }}>
              {[
                [tA, scoreA, setScoreA],
                [tB, scoreB, setScoreB],
              ].map(([t, sc, setSc]) => (
                <div key={t.id} style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 10,
                      color: t.color,
                      marginBottom: 5,
                      fontWeight: 600,
                    }}
                  >
                    {t.short}
                  </div>
                  <div style={{ display: "flex", gap: 3 }}>
                    {[
                      ["Runs", "runs", "52%"],
                      ["Wkts", "wickets", "24%"],
                      ["Overs", "overs", "24%"],
                    ].map(([ph, k, w]) => (
                      <input
                        key={k}
                        type="number"
                        placeholder={ph}
                        value={sc[k]}
                        onChange={(e) => setSc({ ...sc, [k]: e.target.value })}
                        style={{
                          width: w,
                          padding: "5px 6px",
                          borderRadius: 5,
                          border: "0.5px solid var(--color-border-secondary)",
                          background: "var(--color-background-tertiary)",
                          color: "var(--color-text-primary)",
                          fontSize: 12,
                          fontFamily: "sans-serif",
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              ...btn,
              background: "transparent",
              borderColor: "var(--color-border-secondary)",
              color: "var(--color-text-secondary)",
            }}
          >
            Cancel
          </button>
          {match.result && (
            <button
              onClick={() => {
                onSave(null);
                onClose();
              }}
              style={{
                ...btn,
                background: "transparent",
                borderColor: "#ef444466",
                color: "#ef4444",
              }}
            >
              Clear
            </button>
          )}
          <button
            onClick={() => {
              onSave(
                mode === "nr"
                  ? { type: "nr" }
                  : { type: "win", winner, scoreA, scoreB },
              );
              onClose();
            }}
            style={{
              flex: 2,
              ...btn,
              background: "#EA580C",
              border: "none",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            {mode === "nr" ? "Mark No Result" : "Save Result"}
          </button>
        </div>
      </div>
    </div>
  );
}
