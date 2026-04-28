import { TEAMS, teamMap } from "../constants";
import { computeStandings } from "./math";

/**
 * Surpass Possibility Analyzer
 * 
 * Determines which teams can mathematically surpass a selected team
 * considering match dependencies between teams (global feasibility).
 * 
 * Core algorithm: Constraint Satisfaction with DFS + Pruning
 */

/**
 * For a given team, compute if they can surpass the target team's points
 * by finding if there exists a valid match outcome combination
 */
export function canTeamSurpass(
  targetTeamId,
  analyzeTeamId,
  fixtures,
  targetTeamPoints
) {
  if (analyzeTeamId === targetTeamId) return null; // Same team

  const remaining = fixtures.filter((f) => !f.result);
  if (remaining.length === 0) {
    // No more matches, check if analyze team has more points
    const standings = computeStandings(fixtures);
    return standings[analyzeTeamId].points > targetTeamPoints;
  }

  // Get max possible points for the analyze team
  const analyzeTeamRemaining = remaining.filter(
    (f) => f.a === analyzeTeamId || f.b === analyzeTeamId
  ).length;
  
  const currentAnalyzeStandings = computeStandings(fixtures);
  const currentAnalyzePoints = currentAnalyzeStandings[analyzeTeamId].points;
  const maxPossiblePoints = currentAnalyzePoints + analyzeTeamRemaining * 2;

  // Early elimination: if max possible <= target, can't surpass
  if (maxPossiblePoints <= targetTeamPoints) return false;

  // Try to find a valid scenario where analyze team surpasses target team
  // Use search with pruning
  const scenario = findSurpassScenario(
    targetTeamId,
    analyzeTeamId,
    fixtures,
    targetTeamPoints,
    remaining,
    0,
    {}
  );
  
  return scenario !== null ? scenario : false;
}

/**
 * DFS search to find a valid scenario where analyzeTeam > targetTeam
 * Returns the scenario object if found, null otherwise
 * 
 * Optimizations:
 * - Prioritize helpful outcomes for teamToAnalyze
 * - Prune branches where max future points <= target
 * - Limit search depth to avoid timeout
 */
function findSurpassScenario(
  targetTeamId,
  analyzeTeamId,
  fixtures,
  targetTeamPoints,
  remaining,
  matchIndex,
  scenarioSoFar,
  depth = 0,
  maxDepth = 200
) {
  // Terminal conditions
  if (matchIndex === remaining.length) {
    // All matches assigned, verify the scenario works
    const testFixtures = applyScenario(fixtures, scenarioSoFar);
    const standings = computeStandings(testFixtures);
    const analyzePoints = standings[analyzeTeamId].points;
    
    // Valid scenario if analyze team has more points than target
    if (analyzePoints > targetTeamPoints) {
      return scenarioSoFar;
    }
    return null;
  }

  // Safeguard: prevent excessive computation
  if (depth > maxDepth) return null;

  const match = remaining[matchIndex];
  const blank = { runs: "", wickets: "", overs: "" };

  // Quick pruning: Calculate what max points analyze team could get
  // Count how many remaining matches involve analyze team
  let analyzeRemainingCount = 0;
  for (let i = matchIndex; i < remaining.length; i++) {
    const m = remaining[i];
    if (m.a === analyzeTeamId || m.b === analyzeTeamId) {
      analyzeRemainingCount++;
    }
  }

  // Apply partial scenario and check current standings
  const partialFixtures = applyScenario(fixtures, scenarioSoFar);
  const partialStandings = computeStandings(partialFixtures);
  const currentAnalyzePoints = partialStandings[analyzeTeamId].points;
  
  // Maximum possible points if analyze team wins all remaining matches
  const maxPossiblePoints = currentAnalyzePoints + analyzeRemainingCount * 2;
  
  // If even with perfect result we can't surpass, prune this branch
  if (maxPossiblePoints <= targetTeamPoints) {
    return null;
  }

  // Determine outcome priorities
  // Prioritize wins for the analyze team when they're involved
  const outcomes = [];
  
  if (match.a === analyzeTeamId) {
    outcomes.push({ winner: analyzeTeamId, priority: 0 });
    outcomes.push({ winner: match.b, priority: 1 });
  } else if (match.b === analyzeTeamId) {
    outcomes.push({ winner: analyzeTeamId, priority: 0 });
    outcomes.push({ winner: match.a, priority: 1 });
  } else {
    // Analyze team not involved, prefer team A
    outcomes.push({ winner: match.a, priority: 0 });
    outcomes.push({ winner: match.b, priority: 1 });
  }

  // Try outcomes in priority order
  for (const outcome of outcomes) {
    const newScenario = {
      ...scenarioSoFar,
      [match.id]: {
        type: "win",
        winner: outcome.winner,
        scoreA: blank,
        scoreB: blank,
      },
    };

    const result = findSurpassScenario(
      targetTeamId,
      analyzeTeamId,
      fixtures,
      targetTeamPoints,
      remaining,
      matchIndex + 1,
      newScenario,
      depth + 1,
      maxDepth
    );

    if (result !== null) {
      return result;
    }
  }

  return null;
}

/**
 * Analyze all teams to see which can surpass the target team
 */
export function analyzeSurpassPossibility(
  targetTeamId,
  fixtures,
  standings
) {
  const targetPoints = standings[targetTeamId].points;
  
  const results = {
    targetTeam: targetTeamId,
    targetPoints,
    canSurpass: [],
    cannotSurpass: [],
    scenarios: {}, // scenarios[teamId] = scenario object
  };

  for (const team of TEAMS) {
    if (team.id === targetTeamId) continue;

    const canSurpass = canTeamSurpass(
      targetTeamId,
      team.id,
      fixtures,
      targetPoints
    );

    if (canSurpass === false) {
      results.cannotSurpass.push(team.id);
    } else if (canSurpass && typeof canSurpass === 'object') {
      results.canSurpass.push(team.id);
      results.scenarios[team.id] = canSurpass;
    } else {
      results.cannotSurpass.push(team.id);
    }
  }

  // Sort alphabetically for consistent display
  results.canSurpass.sort();
  results.cannotSurpass.sort();

  return results;
}

/**
 * Apply scenario (match outcomes) to fixtures
 */
function applyScenario(fixtures, scenario) {
  return fixtures.map((f) => {
    if (f.result || !scenario[f.id]) return f;
    return { ...f, result: scenario[f.id] };
  });
}

/**
 * Given a scenario object, return a human-readable description
 * of key match results that matter
 */
export function describeScenario(
  scenario,
  fixtures,
  teamId,
  otherTeamId
) {
  const relevant = [];
  
  for (const [matchIdStr, result] of Object.entries(scenario)) {
    const matchId = parseInt(matchIdStr);
    const match = fixtures.find((f) => f.id === matchId);
    if (!match) continue;

    // Include if team is involved or if it affects standings
    if (match.a === teamId || match.b === teamId || 
        match.a === otherTeamId || match.b === otherTeamId) {
      const opponent = match.a === result.winner ? match.b : match.a;
      const verb = result.winner === teamId ? "beat" : "loses to";
      relevant.push({
        matchId,
        text: `${result.winner === teamId ? teamId : opponent} beats ${result.winner === teamId ? opponent : teamId}`,
        isTeamInvolved: match.a === teamId || match.b === teamId,
      });
    }
  }

  // Prioritize matches involving the target team
  relevant.sort((a, b) => {
    if (a.isTeamInvolved !== b.isTeamInvolved) {
      return b.isTeamInvolved ? 1 : -1;
    }
    return a.matchId - b.matchId;
  });

  return relevant.slice(0, 5); // Return top 5 relevant matches
}

/**
 * Get statistics about surpass possibility
 */
export function getSurpassStats(
  targetTeamId,
  fixtures,
  standings
) {
  const analysis = analyzeSurpassPossibility(targetTeamId, fixtures, standings);
  
  return {
    targetTeam: targetTeamId,
    totalTeams: TEAMS.length - 1,
    canSurpass: analysis.canSurpass.length,
    cannotSurpass: analysis.cannotSurpass.length,
    percentageCanSurpass: Math.round(
      (analysis.canSurpass.length / (TEAMS.length - 1)) * 100
    ),
  };
}
