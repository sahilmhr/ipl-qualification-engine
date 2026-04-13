import { useState, useMemo, useEffect, useCallback } from "react";
import { loadFixtures, saveFixtures } from "../utils/storage";
import {
  computeStandings,
  computePointsProgression,
  computeQualification,
} from "../utils/math";
import { TEAMS } from "../constants";

export function useFixtures() {
  const [fixtures, setFixtures] = useState(loadFixtures);

  // Persist on every change
  useEffect(() => {
    saveFixtures(fixtures);
  }, [fixtures]);

  const saveResult = useCallback((matchId, result) => {
    setFixtures((p) => p.map((f) => (f.id === matchId ? { ...f, result } : f)));
  }, []);

  return { fixtures, setFixtures, saveResult };
}

export function useStandings(fixtures) {
  return useMemo(() => computeStandings(fixtures), [fixtures]);
}

export function useRankedTeams(standings) {
  return useMemo(
    () =>
      [...TEAMS].sort((a, b) => {
        const sa = standings[a.id],
          sb = standings[b.id];
        if (sb.points !== sa.points) return sb.points - sa.points;
        return (sb.nrr || 0) - (sa.nrr || 0);
      }),
    [standings],
  );
}

export function usePointsProgression(fixtures) {
  return useMemo(() => computePointsProgression(fixtures), [fixtures]);
}

export function useAllQualification(tab, fixtures, standings) {
  return useMemo(() => {
    if (tab !== "Standings" && tab !== "Race") return null;
    const res = {};
    TEAMS.forEach((t) => {
      res[t.id] = computeQualification(t.id, fixtures, standings);
    });
    return res;
  }, [tab, fixtures, standings]);
}

export function useH2HStats(fixtures, h2hA, h2hB) {
  return useMemo(() => {
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
    return {
      played,
      remaining,
      aWins: played.filter((f) => f.result.winner === h2hA).length,
      bWins: played.filter((f) => f.result.winner === h2hB).length,
    };
  }, [fixtures, h2hA, h2hB]);
}
