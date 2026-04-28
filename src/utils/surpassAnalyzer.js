import { TEAMS, MATCHES_PER_TEAM } from "../constants";

/**
 * Calculates the maximum possible points for a team
 * @param {string} teamId - Team ID
 * @param {Array} standings - Current standings object
 * @param {Array} fixtures - All fixtures
 * @returns {number} Maximum possible points
 */
export function calculateMaxPoints(teamId, standings, fixtures) {
  const teamStanding = standings[teamId];
  const currentPoints = teamStanding.points;
  
  // Find remaining matches for this team
  const remainingMatches = fixtures.filter(
    (f) => !f.result && (f.a === teamId || f.b === teamId)
  ).length;
  
  // Max points = current points + (remaining matches * 2 points per win)
  const maxPoints = currentPoints + (remainingMatches * 2);
  
  return maxPoints;
}

/**
 * Analyzes which teams can surpass a selected team
 * @param {string} selectedTeamId - Team ID to check against
 * @param {Object} standings - Current standings object
 * @param {Array} fixtures - All fixtures
 * @returns {Object} Analysis result with canSurpass and cannotSurpass arrays
 */
export function analyzeSurpassPossibility(selectedTeamId, standings, fixtures) {
  const selectedTeamPoints = standings[selectedTeamId].points;
  
  const analysis = {
    selectedTeam: selectedTeamId,
    selectedTeamPoints,
    canSurpass: [],
    cannotSurpass: [],
    allTeamsMaxPoints: {},
  };
  
  // Analyze each team
  TEAMS.forEach((team) => {
    if (team.id === selectedTeamId) {
      // Skip the selected team itself
      return;
    }
    
    const maxPoints = calculateMaxPoints(team.id, standings, fixtures);
    analysis.allTeamsMaxPoints[team.id] = {
      name: team.name,
      short: team.short,
      color: team.color,
      currentPoints: standings[team.id].points,
      maxPoints,
      remainingMatches: fixtures.filter(
        (f) => !f.result && (f.a === team.id || f.b === team.id)
      ).length,
    };
    
    // Check if team can surpass the selected team
    if (maxPoints > selectedTeamPoints) {
      analysis.canSurpass.push({
        teamId: team.id,
        name: team.name,
        short: team.short,
        color: team.color,
        currentPoints: standings[team.id].points,
        maxPoints,
        pointsNeeded: selectedTeamPoints - standings[team.id].points + 1,
        remainingMatches: analysis.allTeamsMaxPoints[team.id].remainingMatches,
        winsNeeded: Math.ceil(
          (selectedTeamPoints - standings[team.id].points + 1) / 2
        ),
      });
    } else {
      analysis.cannotSurpass.push({
        teamId: team.id,
        name: team.name,
        short: team.short,
        color: team.color,
        currentPoints: standings[team.id].points,
        maxPoints,
        deficit: selectedTeamPoints - maxPoints,
        remainingMatches: analysis.allTeamsMaxPoints[team.id].remainingMatches,
      });
    }
  });
  
  // Sort lists by max points (descending)
  analysis.canSurpass.sort((a, b) => b.maxPoints - a.maxPoints);
  analysis.cannotSurpass.sort((a, b) => b.maxPoints - a.maxPoints);
  
  return analysis;
}

/**
 * Gets summary statistics for surpass analysis
 * @param {string} selectedTeamId - Team ID to check against
 * @param {Object} standings - Current standings object
 * @param {Array} fixtures - All fixtures
 * @returns {Object} Summary data
 */
export function getSurpassSummary(selectedTeamId, standings, fixtures) {
  const analysis = analyzeSurpassPossibility(selectedTeamId, standings, fixtures);
  
  return {
    totalTeams: TEAMS.length - 1, // Exclude selected team
    canSurpassCount: analysis.canSurpass.length,
    cannotSurpassCount: analysis.cannotSurpass.length,
    selectedTeamPoints: analysis.selectedTeamPoints,
  };
}
