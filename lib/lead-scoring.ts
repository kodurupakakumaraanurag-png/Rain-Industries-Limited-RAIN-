export interface ScoringDimensions {
  digitalPresenceScore: number;
  hiringActivityScore: number;
  techStackFitScore: number;
  fundingRevenueScore: number;
  projectUrgencyScore: number;
  budgetClarityScore: number;
}

export function calculateTotalLeadScore(dimensions: ScoringDimensions): number {
  const {
    digitalPresenceScore = 0,
    hiringActivityScore = 0,
    techStackFitScore = 0,
    fundingRevenueScore = 0,
    projectUrgencyScore = 0,
    budgetClarityScore = 0,
  } = dimensions;

  // Clamp each dimension to 0 - 5
  const dp = Math.max(0, Math.min(5, digitalPresenceScore));
  const ha = Math.max(0, Math.min(5, hiringActivityScore));
  const ts = Math.max(0, Math.min(5, techStackFitScore));
  const fr = Math.max(0, Math.min(5, fundingRevenueScore));
  const pu = Math.max(0, Math.min(5, projectUrgencyScore));
  const bc = Math.max(0, Math.min(5, budgetClarityScore));

  return dp + ha + ts + fr + pu + bc;
}

export function getScoringCategory(totalScore: number): { label: string; grade: string; color: string } {
  if (totalScore >= 24) {
    return { label: 'Hot / High Priority', grade: 'A+', color: 'emerald' };
  } else if (totalScore >= 18) {
    return { label: 'Warm / Solid Opportunity', grade: 'A', color: 'blue' };
  } else if (totalScore >= 12) {
    return { label: 'Moderate / Nurturing Required', grade: 'B', color: 'amber' };
  } else {
    return { label: 'Cold / Unqualified', grade: 'C', color: 'rose' };
  }
}
