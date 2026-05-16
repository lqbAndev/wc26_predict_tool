/**
 * CupConfig — The universal configuration interface for any cup tournament.
 *
 * This decouples tournament logic from hard-coded WC26 data,
 * enabling dynamic group generation and dynamic knockout brackets
 * for any cup format.
 */

export interface CupConfig {
  /** Unique identifier used in routing, e.g. 'wc26', 'test-cup' */
  id: string;

  /** Display name of the competition */
  name: string;

  /** Total number of teams */
  teams: number;

  /** Number of groups */
  groupsCount: number;

  /** Number of teams per group */
  teamsPerGroup: number;

  /** How many teams advance per group (1st, 2nd, etc.) */
  advancePerGroup: number;

  /** How many best 3rd-placed teams also advance (0 if no 3rd-place rule) */
  bestThirdsToAdvance: number;

  /** Storage key for localStorage persistence */
  storageKey: string;
}

/**
 * Computed helpers derived from a CupConfig.
 */
export const computeAdvancingTeams = (config: CupConfig): number => {
  return config.groupsCount * config.advancePerGroup + config.bestThirdsToAdvance;
};

/**
 * Determine the first knockout round based on advancing teams count.
 * - 32 teams → roundOf32
 * - 16 teams → roundOf16
 * - 8  teams → quarterfinals
 * - 4  teams → semifinals
 */
export type DynamicKnockoutRound =
  | 'roundOf32'
  | 'roundOf16'
  | 'quarterfinals'
  | 'semifinals';

export const getFirstKnockoutRound = (advancingTeams: number): DynamicKnockoutRound => {
  if (advancingTeams >= 32) return 'roundOf32';
  if (advancingTeams >= 16) return 'roundOf16';
  if (advancingTeams >= 8) return 'quarterfinals';
  return 'semifinals';
};

/**
 * Generate dynamic group IDs (A, B, C, ...) based on count.
 */
export const generateGroupIds = (count: number): string[] =>
  Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i));

/**
 * Build the ordered list of knockout rounds from a starting round to the final.
 */
export const buildKnockoutRoundsFromStart = (
  startRound: DynamicKnockoutRound,
): string[] => {
  const allRounds = ['roundOf32', 'roundOf16', 'quarterfinals', 'semifinals', 'thirdPlace', 'final'];
  const startIndex = allRounds.indexOf(startRound);
  return allRounds.slice(startIndex);
};
