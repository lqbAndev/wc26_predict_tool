/**
 * Dynamic Engine — Generates group matches, knockout brackets, and round labels
 * from a CupConfig + team data, without any hard-coded tournament structure.
 *
 * This is the core of Phase 2: "Decoupling Cup Logic".
 */

import type { CupConfig } from '../../types/cupConfig';
import {
  computeAdvancingTeams,
  getFirstKnockoutRound,
  generateGroupIds,
  buildKnockoutRoundsFromStart,
} from '../../types/cupConfig';
import type { GroupMatch, KnockoutMatch, KnockoutRound, Team } from '../../types/tournament';

/* ──────────────────────────────────────────────
 *  Dynamic Group Matches
 * ────────────────────────────────────────────── */

/**
 * Round-robin matchups for a group of 4 teams.
 * Indices refer to position within the group's team array.
 */
const GROUP_MATCHUPS_4 = [
  { matchday: 1, homeIndex: 0, awayIndex: 1 },
  { matchday: 1, homeIndex: 2, awayIndex: 3 },
  { matchday: 2, homeIndex: 0, awayIndex: 2 },
  { matchday: 2, homeIndex: 3, awayIndex: 1 },
  { matchday: 3, homeIndex: 3, awayIndex: 0 },
  { matchday: 3, homeIndex: 1, awayIndex: 2 },
] as const;

export const createDynamicGroupMatches = (
  groups: Array<{ id: string; teams: Team[] }>,
): GroupMatch[] =>
  groups.flatMap((group) =>
    GROUP_MATCHUPS_4.map((matchup, index) => ({
      id: `group-${group.id}-${index + 1}`,
      stage: 'group' as const,
      group: group.id as any,
      matchday: matchup.matchday,
      homeTeamId: group.teams[matchup.homeIndex].id,
      awayTeamId: group.teams[matchup.awayIndex].id,
      homeScore: null,
      awayScore: null,
      scorers: null,
      timeline: null,
      motm: null,
      status: 'pending' as const,
      predictedAt: null,
    })),
  );

/* ──────────────────────────────────────────────
 *  Dynamic Knockout Bracket
 * ────────────────────────────────────────────── */

/**
 * Map of round label names (for display).
 */
const ROUND_LABEL_MAP: Record<string, string> = {
  roundOf32: 'Round of 32',
  roundOf16: 'Round of 16',
  quarterfinals: 'Quarter Finals',
  semifinals: 'Semi Finals',
  thirdPlace: 'Third Place Match',
  final: 'Final',
};

/**
 * Get the default seed labels for a match in a given round.
 */
const getDefaultSeedLabels = (round: string, slot: number, prevRoundLabel: string) => {
  if (round === 'thirdPlace') {
    return { homeSeedLabel: 'Loser SF-1', awaySeedLabel: 'Loser SF-2' };
  }
  if (round === 'final') {
    return { homeSeedLabel: 'Winner SF-1', awaySeedLabel: 'Winner SF-2' };
  }
  return {
    homeSeedLabel: `Winner ${prevRoundLabel}-${slot * 2 + 1}`,
    awaySeedLabel: `Winner ${prevRoundLabel}-${slot * 2 + 2}`,
  };
};

const SHORT_ROUND_LABELS: Record<string, string> = {
  roundOf32: 'R32',
  roundOf16: 'R16',
  quarterfinals: 'QF',
  semifinals: 'SF',
};

/**
 * Create an empty knockout match for a given round and slot.
 */
const createEmptyKnockoutMatch = (
  round: string,
  slot: number,
  prevRound?: string,
): KnockoutMatch => {
  const prevLabel = prevRound ? (SHORT_ROUND_LABELS[prevRound] ?? prevRound) : '';
  const seeds = getDefaultSeedLabels(round, slot, prevLabel);

  return {
    id: `${round}-${slot + 1}`,
    stage: 'knockout',
    round: round as KnockoutRound,
    slot,
    homeTeamId: null,
    awayTeamId: null,
    homeSeedLabel: seeds.homeSeedLabel,
    awaySeedLabel: seeds.awaySeedLabel,
    regulationHomeScore: null,
    regulationAwayScore: null,
    extraTimeHomeScore: null,
    extraTimeAwayScore: null,
    homeScore: null,
    awayScore: null,
    scorers: null,
    timeline: null,
    motm: null,
    penalty: null,
    status: 'pending',
    winnerTeamId: null,
    loserTeamId: null,
    predictedAt: null,
  };
};

/**
 * Dynamically create the knockout matches structure based on CupConfig.
 *
 * Algorithm:
 * 1. Compute total advancing teams → determine first knockout round.
 * 2. Build all rounds from firstRound → semifinals → thirdPlace → final.
 * 3. For each round, calculate the number of matches (halving each round).
 */
export const createDynamicKnockoutMatches = (
  config: CupConfig,
): Record<string, KnockoutMatch[]> => {
  const totalAdvancing = computeAdvancingTeams(config);
  const firstRound = getFirstKnockoutRound(totalAdvancing);
  const allRounds = buildKnockoutRoundsFromStart(firstRound);
  const bracket: Record<string, KnockoutMatch[]> = {};

  let matchCount = totalAdvancing / 2; // First round has N/2 matches

  for (let i = 0; i < allRounds.length; i++) {
    const round = allRounds[i];
    const prevRound = i > 0 ? allRounds[i - 1] : undefined;

    if (round === 'thirdPlace') {
      bracket[round] = [createEmptyKnockoutMatch(round, 0, prevRound)];
    } else if (round === 'final') {
      bracket[round] = [createEmptyKnockoutMatch(round, 0, prevRound)];
    } else {
      bracket[round] = Array.from(
        { length: matchCount },
        (_, idx) => createEmptyKnockoutMatch(round, idx, prevRound),
      );
      matchCount = Math.floor(matchCount / 2); // Next round has half the matches
    }
  }

  return bracket;
};

/**
 * Build round labels for the dynamic knockout rounds.
 */
export const buildDynamicRoundLabels = (config: CupConfig): Record<string, string> => {
  const totalAdvancing = computeAdvancingTeams(config);
  const firstRound = getFirstKnockoutRound(totalAdvancing);
  const allRounds = buildKnockoutRoundsFromStart(firstRound);
  const labels: Record<string, string> = {};

  for (const round of allRounds) {
    labels[round] = ROUND_LABEL_MAP[round] ?? round;
  }

  return labels;
};

/**
 * Build the ordered knockout rounds array for a config.
 */
export const buildDynamicKnockoutRounds = (config: CupConfig): string[] => {
  const totalAdvancing = computeAdvancingTeams(config);
  const firstRound = getFirstKnockoutRound(totalAdvancing);
  return buildKnockoutRoundsFromStart(firstRound);
};

/* ──────────────────────────────────────────────
 *  Dynamic Knockout Bracket Seeding (Simple)
 *
 *  For non-WC26 tournaments without best-3rd complexity,
 *  we use a simple cross-group pairing:
 *    1st Group A vs 2nd Group B
 *    1st Group B vs 2nd Group A
 *    etc.
 * ────────────────────────────────────────────── */

import type { TeamStanding } from '../../types/tournament';

/**
 * Build a simple cross-group bracket for tournaments without best-3rd teams.
 *
 * Pairing logic:
 * - With N groups, pair Group[i]'s winner vs Group[N-1-i]'s runner-up.
 * - This ensures cross-group matches: 1A vs 2B, 1B vs 2A, etc.
 */
export const buildSimpleKnockoutBracket = (
  config: CupConfig,
  standingsByGroup: Record<string, TeamStanding[]>,
  emptyBracket: Record<string, KnockoutMatch[]>,
): Record<string, KnockoutMatch[]> => {
  const bracket = { ...emptyBracket };
  const groupIds = generateGroupIds(config.groupsCount);

  const totalAdvancing = computeAdvancingTeams(config);
  const firstRound = getFirstKnockoutRound(totalAdvancing);

  // Build pairs: 1st of group[i] vs 2nd of group[groupsCount - 1 - i]
  const firstRoundMatches = [...(bracket[firstRound] ?? [])];

  let slotIndex = 0;
  for (let i = 0; i < groupIds.length; i++) {
    const oppositeIndex = groupIds.length - 1 - i;
    if (i >= oppositeIndex) break; // Avoid duplicate pairs

    const groupA = groupIds[i];
    const groupB = groupIds[oppositeIndex];

    const winnerA = standingsByGroup[groupA]?.[0];
    const runnerB = standingsByGroup[groupB]?.[1];
    const winnerB = standingsByGroup[groupB]?.[0];
    const runnerA = standingsByGroup[groupA]?.[1];

    if (winnerA && runnerB && slotIndex < firstRoundMatches.length) {
      firstRoundMatches[slotIndex] = {
        ...firstRoundMatches[slotIndex],
        homeTeamId: winnerA.teamId,
        awayTeamId: runnerB.teamId,
        homeSeedLabel: `Nhất ${groupA}`,
        awaySeedLabel: `Nhì ${groupB}`,
      };
      slotIndex++;
    }

    if (winnerB && runnerA && slotIndex < firstRoundMatches.length) {
      firstRoundMatches[slotIndex] = {
        ...firstRoundMatches[slotIndex],
        homeTeamId: winnerB.teamId,
        awayTeamId: runnerA.teamId,
        homeSeedLabel: `Nhất ${groupB}`,
        awaySeedLabel: `Nhì ${groupA}`,
      };
      slotIndex++;
    }
  }

  bracket[firstRound] = firstRoundMatches;
  return bracket;
};
