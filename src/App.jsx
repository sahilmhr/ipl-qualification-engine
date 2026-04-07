import { useState, useMemo, useCallback, useEffect } from "react";
import { TEAMS } from "./data/teams";
import { buildFixtures } from "./data/fixtures";
import {
  applyScenario,
  computeStandings,
  computeQualification,
  findCriticalMatches,
} from "./utils/qualification";
import Tabs from "./components/Tabs";
import MatchModal from "./components/MatchModal";
import StandingsTab from "./components/StandingsTab";
import FixturesTab from "./components/FixturesTab";
import QualifyTab from "./components/QualifyTab";
import SimulatorTab from "./components/SimulatorTab";
import HeadToHeadTab from "./components/HeadToHeadTab";

const TABS = ["Standings", "Fixtures", "Qualify", "Simulator", "Head-to-Head"];
const PER_PAGE = 14;
const C = "#EA580C";
const Y = "#FBBF24";
const G = "#22c55e";

export default function App() {
  const [fixtures, setFixtures] = useState(() => {
    const saved = localStorage.getItem("fixtures");
    return saved ? JSON.parse(saved) : buildFixtures();
  });
  const [tab, setTab] = useState("Standings");
  const [selectedTeam, setSelectedTeam] = useState("MI");
  const [qualResult, setQualResult] = useState(null);
  const [computing, setComputing] = useState(false);
  const [matchPage, setMatchPage] = useState(0);
  const [filterTeam, setFilterTeam] = useState("ALL");
  const [modalMatch, setModalMatch] = useState(null);
  const [scenario, setScenario] = useState({});
  const [simTeam, setSimTeam] = useState("CSK");
  const [h2hA, setH2hA] = useState("RCB");
  const [h2hB, setH2hB] = useState("SRH");

  const standings = useMemo(() => computeStandings(fixtures), [fixtures]);

  const rankedTeams = useMemo(
    () =>
      [...TEAMS].sort((a, b) => {
        const sa = standings[a.id];
        const sb = standings[b.id];
        if (sb.points !== sa.points) return sb.points - sa.points;
        return (sb.nrr || 0) - (sa.nrr || 0);
      }),
    [standings],
  );

  const saveResult = useCallback((matchId, result) => {
    setFixtures((prev) =>
      prev.map((f) => (f.id === matchId ? { ...f, result } : f)),
    );
    setQualResult(null);
  }, []);

  const handleCompute = () => {
    setComputing(true);
    setTimeout(() => {
      setQualResult(computeQualification(selectedTeam, fixtures, standings));
      setComputing(false);
    }, 10);
  };

  const criticalMatches = useMemo(() => {
    if (tab !== "Qualify" || !qualResult) return [];
    return findCriticalMatches(selectedTeam, fixtures, standings);
  }, [tab, qualResult, selectedTeam, fixtures, standings]);

  const simFixtures = useMemo(() => applyScenario(fixtures, scenario), [fixtures, scenario]);
  const simStandings = useMemo(() => computeStandings(simFixtures), [simFixtures]);

  const simRanked = useMemo(
    () =>
      [...TEAMS].sort((a, b) => {
        const sa = simStandings[a.id];
        const sb = simStandings[b.id];
        if (sb.points !== sa.points) return sb.points - sa.points;
        return (sb.nrr || 0) - (sa.nrr || 0);
      }),
    [simStandings],
  );

  const allQual = useMemo(() => {
    if (tab !== "Standings") return null;
    const res = {};
    TEAMS.forEach((team) => {
      res[team.id] = computeQualification(team.id, fixtures, standings);
    });
    return res;
  }, [tab, fixtures, standings]);

  const h2hStats = useMemo(() => {
    const played = fixtures.filter(
      (f) =>
        f.result &&
        f.result.type === "win" &&
        ((f.a === h2hA && f.b === h2hB) || (f.a === h2hB && f.b === h2hA)),
    );
    const remaining = fixtures.filter(
      (f) =>
        !f.result &&
        ((f.a === h2hA && f.b === h2hB) || (f.a === h2hB && f.b === h2hA)),
    );
    const aWins = played.filter((f) => f.result.winner === h2hA).length;
    const bWins = played.filter((f) => f.result.winner === h2hB).length;
    return { played, remaining, aWins, bWins };
  }, [fixtures, h2hA, h2hB]);

  const played = fixtures.filter((f) => f.result).length;

  const filtered =
    filterTeam === "ALL"
      ? fixtures
      : fixtures.filter((f) => f.a === filterTeam || f.b === filterTeam);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice(matchPage * PER_PAGE, (matchPage + 1) * PER_PAGE);

  useEffect(() => {
    localStorage.setItem("fixtures", JSON.stringify(fixtures));
  }, [fixtures]);

  function exportData() {
    const data = localStorage.getItem("fixtures");
    if (!data) {
      alert("No data to export");
      return;
    }
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ipl-fixtures.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data)) {
          throw new Error("Invalid format");
        }
        localStorage.setItem("fixtures", JSON.stringify(data));
        setFixtures(data);
      } catch (err) {
        alert("Invalid file");
        console.error(err);
      }
    };

    reader.readAsText(file);
  }

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        minHeight: "100vh",
        background: "var(--color-background-tertiary)",
        paddingBottom: "3rem",
      }}
    >
      {modalMatch && (
        <MatchModal
          match={modalMatch}
          onSave={(result) => saveResult(modalMatch.id, result)}
          onClose={() => setModalMatch(null)}
        />
      )}

      <div
        style={{
          background: "#0a0a0a",
          padding: "1.1rem 1.5rem 0.8rem",
          borderBottom: `2px solid ${C}`,
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 5,
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
            <div>
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
            <span>{played}/70 results</span>
            <span style={{ color: Y }}>● NRR · No Result · Max-flow · Scenario Sim</span>
          </div>
        </div>
      </div>

      <Tabs tab={tab} setTab={setTab} tabs={TABS} />

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "1.1rem 1rem" }}>
        {tab === "Standings" && (
          <StandingsTab
            fixtures={fixtures}
            standings={standings}
            rankedTeams={rankedTeams}
            allQual={allQual}
            exportData={exportData}
            importData={importData}
          />
        )}

        {tab === "Fixtures" && (
          <FixturesTab
            fixtures={fixtures}
            filterTeam={filterTeam}
            setFilterTeam={setFilterTeam}
            matchPage={matchPage}
            setMatchPage={setMatchPage}
            totalPages={totalPages}
            paged={paged}
            setModalMatch={setModalMatch}
          />
        )}

        {tab === "Qualify" && (
          <QualifyTab
            fixtures={fixtures}
            standings={standings}
            rankedTeams={rankedTeams}
            selectedTeam={selectedTeam}
            setSelectedTeam={setSelectedTeam}
            handleCompute={handleCompute}
            computing={computing}
            qualResult={qualResult}
            criticalMatches={criticalMatches}
            setModalMatch={setModalMatch}
          />
        )}

        {tab === "Simulator" && (
          <SimulatorTab
            fixtures={fixtures}
            scenario={scenario}
            setScenario={setScenario}
            simTeam={simTeam}
            setSimTeam={setSimTeam}
            rankedTeams={rankedTeams}
            standings={standings}
            simFixtures={simFixtures}
            simStandings={simStandings}
            simRanked={simRanked}
          />
        )}

        {tab === "Head-to-Head" && (
          <HeadToHeadTab
            h2hA={h2hA}
            h2hB={h2hB}
            setH2hA={setH2hA}
            setH2hB={setH2hB}
            standings={standings}
            rankedTeams={rankedTeams}
            h2hStats={h2hStats}
            fixtures={fixtures}
            setModalMatch={setModalMatch}
          />
        )}
      </div>
    </div>
  );
}
