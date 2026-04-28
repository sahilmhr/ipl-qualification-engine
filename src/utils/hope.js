import { generateQualificationScenarios } from "./math";

// Returns true if the team has any scenario to qualify (not eliminated by all possible outcomes)
export function hasAnyQualificationChance(teamId, fixtures) {
  const scenarios = generateQualificationScenarios(teamId, fixtures);
  return scenarios.length > 0;
}
