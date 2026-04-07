import { KNOCKOUT_ROUNDS, createEmptyKnockoutMatches } from '../data/tournament';
import type {
  GroupId,
  KnockoutMatch,
  KnockoutRound,
  KnockoutSeeds,
  TeamStanding,
  ThirdPlaceStanding,
} from '../types/tournament';
import { GROUP_IDS } from '../types/tournament';
import { rankQualifiedTeams } from './groupStage';

const getGroupPosition = (groupId: GroupId, position: 0 | 1, standingsByGroup: Record<GroupId, TeamStanding[]>) =>
  standingsByGroup[groupId]?.[position];

export const buildKnockoutSeeds = (
  standingsByGroup: Record<GroupId, TeamStanding[]>,
  thirdPlaceTable: ThirdPlaceStanding[],
): KnockoutSeeds => {
  const groupWinners = rankQualifiedTeams(
    GROUP_IDS.map((groupId) => getGroupPosition(groupId, 0, standingsByGroup)).filter(
      (team): team is TeamStanding => Boolean(team),
    ),
  );

  const groupRunnersUp = rankQualifiedTeams(
    GROUP_IDS.map((groupId) => getGroupPosition(groupId, 1, standingsByGroup)).filter(
      (team): team is TeamStanding => Boolean(team),
    ),
  );

  return {
    groupWinners,
    groupRunnersUp,
    bestThirds: thirdPlaceTable.slice(0, 8),
  };
};

const createSeedLabel = (
  bucket: 'winner' | 'runner' | 'third',
  entry: TeamStanding | ThirdPlaceStanding,
  index: number,
) => {
  if (bucket === 'third') {
    return `Hạng 3 #${index + 1} · ${entry.group}`;
  }

  return `${bucket === 'winner' ? 'Nhất' : 'Nhì'} ${entry.group} · seed ${index + 1}`;
};

export const buildKnockoutBracket = (seeds: KnockoutSeeds): Record<KnockoutRound, KnockoutMatch[]> => {
  const bracket = createEmptyKnockoutMatches();

  if (
    seeds.groupWinners.length < 12 ||
    seeds.groupRunnersUp.length < 12 ||
    seeds.bestThirds.length < 8
  ) {
    return bracket;
  }

  const winners = seeds.groupWinners;
  const runners = seeds.groupRunnersUp;
  const thirds = seeds.bestThirds;

  const pairings = [
    { home: winners[0], away: thirds[7], homeLabel: createSeedLabel('winner', winners[0], 0), awayLabel: createSeedLabel('third', thirds[7], 7) },
    { home: winners[1], away: thirds[6], homeLabel: createSeedLabel('winner', winners[1], 1), awayLabel: createSeedLabel('third', thirds[6], 6) },
    { home: winners[2], away: thirds[5], homeLabel: createSeedLabel('winner', winners[2], 2), awayLabel: createSeedLabel('third', thirds[5], 5) },
    { home: winners[3], away: thirds[4], homeLabel: createSeedLabel('winner', winners[3], 3), awayLabel: createSeedLabel('third', thirds[4], 4) },
    { home: winners[4], away: thirds[3], homeLabel: createSeedLabel('winner', winners[4], 4), awayLabel: createSeedLabel('third', thirds[3], 3) },
    { home: winners[5], away: thirds[2], homeLabel: createSeedLabel('winner', winners[5], 5), awayLabel: createSeedLabel('third', thirds[2], 2) },
    { home: winners[6], away: thirds[1], homeLabel: createSeedLabel('winner', winners[6], 6), awayLabel: createSeedLabel('third', thirds[1], 1) },
    { home: winners[7], away: thirds[0], homeLabel: createSeedLabel('winner', winners[7], 7), awayLabel: createSeedLabel('third', thirds[0], 0) },
    { home: winners[8], away: runners[11], homeLabel: createSeedLabel('winner', winners[8], 8), awayLabel: createSeedLabel('runner', runners[11], 11) },
    { home: winners[9], away: runners[10], homeLabel: createSeedLabel('winner', winners[9], 9), awayLabel: createSeedLabel('runner', runners[10], 10) },
    { home: winners[10], away: runners[9], homeLabel: createSeedLabel('winner', winners[10], 10), awayLabel: createSeedLabel('runner', runners[9], 9) },
    { home: winners[11], away: runners[8], homeLabel: createSeedLabel('winner', winners[11], 11), awayLabel: createSeedLabel('runner', runners[8], 8) },
    { home: runners[0], away: runners[7], homeLabel: createSeedLabel('runner', runners[0], 0), awayLabel: createSeedLabel('runner', runners[7], 7) },
    { home: runners[1], away: runners[6], homeLabel: createSeedLabel('runner', runners[1], 1), awayLabel: createSeedLabel('runner', runners[6], 6) },
    { home: runners[2], away: runners[5], homeLabel: createSeedLabel('runner', runners[2], 2), awayLabel: createSeedLabel('runner', runners[5], 5) },
    { home: runners[3], away: runners[4], homeLabel: createSeedLabel('runner', runners[3], 3), awayLabel: createSeedLabel('runner', runners[4], 4) },
  ];

  bracket.roundOf32 = bracket.roundOf32.map((match, index) => ({
    ...match,
    homeTeamId: pairings[index].home.teamId,
    awayTeamId: pairings[index].away.teamId,
    homeSeedLabel: pairings[index].homeLabel,
    awaySeedLabel: pairings[index].awayLabel,
  }));

  return bracket;
};

export const advanceWinnerToNextRound = (
  knockoutMatches: Record<KnockoutRound, KnockoutMatch[]>,
  round: KnockoutRound,
  slot: number,
  winnerTeamId: string,
  loserTeamId?: string | null,
): Record<KnockoutRound, KnockoutMatch[]> => {
  let updatedMatches = { ...knockoutMatches };

  if (round === 'semifinals' && loserTeamId) {
    const thirdPlaceSide = slot === 0 ? 'homeTeamId' : 'awayTeamId';
    updatedMatches = {
      ...updatedMatches,
      thirdPlace: updatedMatches.thirdPlace.map((match, index) => {
        if (index !== 0) return match;

        return {
          ...match,
          [thirdPlaceSide]: loserTeamId,
        };
      }),
    };
  }

  const nextRound =
    round === 'semifinals'
      ? 'final'
      : round === 'thirdPlace' || round === 'final'
        ? null
        : KNOCKOUT_ROUNDS[KNOCKOUT_ROUNDS.indexOf(round) + 1];

  if (!nextRound) {
    return updatedMatches;
  }

  const nextSlot = Math.floor(slot / 2);
  const side = slot % 2 === 0 ? 'homeTeamId' : 'awayTeamId';

  return {
    ...updatedMatches,
    [nextRound]: updatedMatches[nextRound].map((match, index) => {
      if (index !== nextSlot) {
        return match;
      }

      return {
        ...match,
        [side]: winnerTeamId,
      };
    }),
  };
};
