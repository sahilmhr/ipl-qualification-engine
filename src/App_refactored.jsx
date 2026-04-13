import { useState, useMemo, useCallback, useRef } from "react";
import { TEAMS, TABS, COLORS, DEFAULT_TEAM } from "./constants";
import { loadFixtures, buildFixtures, saveFixtures } from "./utils/storage";
import {
  computeStandings,
  computeQualification,
  findCriticalMatches,
  computePointsProgression,
} from "./utils/math";
import {
  applyScenario,
  buildBestScenario,
  exportStandingsText,
  fmtNRR,
  fmtScore,
} from "./utils/helpers";
import {
  useFixtures,
  useStandings,
  useRankedTeams,
  usePointsProgression,
  useAllQualification,
  useH2HStats,
} from "./hooks";
import { MatchModal } from "./components/shared/MatchModal";
import { PointsChart } from "./components/common/PointsChart";
import { QualRace } from "./components/common/QualRace";
import { LastResultsBadge } from "./components/common/LastResultsBadge";
import { StreakBadge } from "./components/common/StreakBadge";
import HeaderSection from "./components/features/HeaderSection";
import TabNavigation from "./components/features/TabNavigation";
import Fixtures from "./components/features/Fixtures";
import Qualify from "./components/features/Qualify";
import Race from "./components/features/Race";
import Simulator from "./components/features/Simulator";
import H2H from "./components/features/H2H";
import Timelapse from "./components/features/Timelapse";
import Standings from "./components/features/Standings";

const C = COLORS.primary;
const Y = COLORS.secondary;
const G = COLORS.success;
const R = COLORS.error;

export default function App() {
  const { fixtures, setFixtures, saveResult } = useFixtures();
  const [tab, setTab] = useState("Standings");
  const [selectedTeam, setSelectedTeam] = useState(DEFAULT_TEAM);
  const [qualResult, setQualResult] = useState(null);
  const [computing, setComputing] = useState(false);
  const [matchPage, setMatchPage] = useState(0);
  const [filterTeam, setFilterTeam] = useState("ALL");
  const [modalMatch, setModalMatch] = useState(null);
  const [scenario, setScenario] = useState({});
  const [simTeam, setSimTeam] = useState(DEFAULT_TEAM);
  const [h2hA, setH2hA] = useState(DEFAULT_TEAM);
  const [h2hB, setH2hB] = useState("RCB");
  const [chartTeams, setChartTeams] = useState(() =>
    Object.fromEntries(TEAMS.map((t) => [t.id, true])),
  );
  const [exportMsg, setExportMsg] = useState("");
  const [dataExportMsg, setDataExportMsg] = useState("");
  const [dataImportMsg, setDataImportMsg] = useState("");
  const fileInputRef = useRef(null);
  const PER_PAGE = 14;

  // Memoized computations
  const standings = useStandings(fixtures);
  const rankedTeams = useRankedTeams(standings);
  const progression = usePointsProgression(fixtures);
  const allQual = useAllQualification(tab, fixtures, standings);
  const h2hStats = useH2HStats(fixtures, h2hA, h2hB);

  // Scenario-based computations
  const simFixtures = useMemo(
    () => applyScenario(fixtures, scenario),
    [fixtures, scenario],
  );
  const simStandings = useMemo(
    () => computeStandings(simFixtures),
    [simFixtures],
  );
  const simRanked = useMemo(
    () =>
      [...TEAMS].sort((a, b) => {
        const sa = simStandings[a.id],
          sb = simStandings[b.id];
        if (sb.points !== sa.points) return sb.points - sa.points;
        return (sb.nrr || 0) - (sa.nrr || 0);
      }),
    [simStandings],
  );

  const criticalMatches = useMemo(() => {
    if (tab !== "Qualify" || !qualResult) return [];
    return findCriticalMatches(selectedTeam, fixtures);
  }, [tab, qualResult, selectedTeam, fixtures]);

  // Pagination
  const played = fixtures.filter((f) => f.result).length;
  const filtered =
    filterTeam === "ALL"
      ? fixtures
      : fixtures.filter((f) => f.a === filterTeam || f.b === filterTeam);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice(
    matchPage * PER_PAGE,
    (matchPage + 1) * PER_PAGE,
  );
  const unplayedForSim = fixtures.filter((f) => !f.result);

  // Timelapse specific
  const playedIds = fixtures
    .filter((f) => f.result)
    .map((f) => f.id)
    .sort((a, b) => a - b);
  const maxPlayed = playedIds.length > 0 ? playedIds[playedIds.length - 1] : 0;
  const [tlMatch, setTlMatch] = useState(maxPlayed);

  // Event handlers
  const handleCompute = () => {
    setComputing(true);
    setTimeout(() => {
      setQualResult(computeQualification(selectedTeam, fixtures, standings));
      setComputing(false);
    }, 10);
  };

  const resetAll = () => {
    if (confirm("Reset all results?")) {
      setFixtures(buildFixtures());
      setQualResult(null);
      setScenario({});
    }
  };

  const exportStandings = () => {
    const text = exportStandingsText(rankedTeams, standings, fmtNRR);
    navigator.clipboard.writeText(text).then(() => {
      setExportMsg("Copied!");
      setTimeout(() => setExportMsg(""), 2000);
    });
  };

  const exportData = () => {
    const data = fixtures.map((f) => ({ ...f, batFirst: f.batFirst ?? null }));
    navigator.clipboard
      .writeText(JSON.stringify(data, null, 2))
      .then(() => {
        setDataExportMsg("Data exported to clipboard!");
        setTimeout(() => setDataExportMsg(""), 3000);
      })
      .catch(() => {
        setDataExportMsg("Failed to export data");
        setTimeout(() => setDataExportMsg(""), 3000);
      });
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data))
          throw new Error("Data must be an array of fixtures");
        data.forEach((f, i) => {
          if (typeof f.id !== "number" || !f.a || !f.b || !f.date)
            throw new Error(
              `Invalid fixture at index ${i}: missing required fields`,
            );
        });
        setFixtures(
          data.map((f) => ({
            ...f,
            scoreA: f.scoreA || { runs: "", wickets: "", overs: "" },
            scoreB: f.scoreB || { runs: "", wickets: "", overs: "" },
            batFirst: f.batFirst ?? null,
          })),
        );
        setDataImportMsg("Data imported successfully!");
        setTimeout(() => setDataImportMsg(""), 3000);
      } catch (err) {
        setDataImportMsg("Import failed: " + err.message);
        setTimeout(() => setDataImportMsg(""), 5000);
      }
    };
    reader.readAsText(file);
  };

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
          onSave={(r) => saveResult(modalMatch.id, r)}
          onClose={() => setModalMatch(null)}
        />
      )}

      {/* Header */}
      <HeaderSection
        played={played}
        exportMsg={exportMsg}
        dataExportMsg={dataExportMsg}
        dataImportMsg={dataImportMsg}
        exportStandings={exportStandings}
        exportData={exportData}
        fileInputRef={fileInputRef}
        handleImport={handleImport}
        resetAll={resetAll}
      />

      {/* Tabs */}
      <TabNavigation tab={tab} setTab={setTab} />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "1rem" }}>
        {/* Standings */}
        {tab === "Standings" && (
          <Standings
            rankedTeams={rankedTeams}
            standings={standings}
            allQual={allQual}
            progression={progression}
            chartTeams={chartTeams}
            setChartTeams={setChartTeams}
            fixtures={fixtures}
          />
        )}

        {/* Fixtures */}
        {tab === "Fixtures" && (
          <Fixtures
            filtered={filtered}
            paged={paged}
            matchPage={matchPage}
            setMatchPage={setMatchPage}
            totalPages={totalPages}
            filterTeam={filterTeam}
            setFilterTeam={setFilterTeam}
            setModalMatch={setModalMatch}
            fmtScore={fmtScore}
          />
        )}

        {/* Qualify */}
        {tab === "Qualify" && (
          <Qualify
            selectedTeam={selectedTeam}
            setSelectedTeam={setSelectedTeam}
            standings={standings}
            fixtures={fixtures}
            qualResult={qualResult}
            computing={computing}
            handleCompute={handleCompute}
            rankedTeams={rankedTeams}
            criticalMatches={criticalMatches}
            setModalMatch={setModalMatch}
            fmtNRR={fmtNRR}
            setQualResult={setQualResult}
          />
        )}

        {/* Race */}
        {tab === "Race" && (
          <Race
            standings={standings}
            fixtures={fixtures}
            allQual={allQual}
            rankedTeams={rankedTeams}
          />
        )}

        {/* Simulator */}
        {tab === "Simulator" && (
          <Simulator
            fixtures={fixtures}
            scenario={scenario}
            setScenario={setScenario}
            simTeam={simTeam}
            setSimTeam={setSimTeam}
            simFixtures={simFixtures}
            simStandings={simStandings}
            simRanked={simRanked}
            standings={standings}
            rankedTeams={rankedTeams}
            buildBestScenario={buildBestScenario}
            unplayedForSim={unplayedForSim}
          />
        )}

        {/* H2H */}
        {tab === "H2H" && (
          <H2H
            h2hA={h2hA}
            h2hB={h2hB}
            setH2hA={setH2hA}
            setH2hB={setH2hB}
            h2hStats={h2hStats}
            standings={standings}
            rankedTeams={rankedTeams}
            fixtures={fixtures}
            setModalMatch={setModalMatch}
            fmtScore={fmtScore}
          />
        )}

        {/* Timelapse */}
        {tab === "Timelapse" && (
          <Timelapse
            fixtures={fixtures}
            tlMatch={tlMatch}
            setTlMatch={setTlMatch}
            maxPlayed={maxPlayed}
          />
        )}
      </div>
    </div>
  );
}
