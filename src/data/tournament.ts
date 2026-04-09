import { buildTeamRoster } from './players';
import type {
  GroupId,
  GroupMatch,
  MatchScorers,
  KnockoutMatch,
  KnockoutRound,
  Team,
  TournamentCoreState,
} from '../types/tournament';
import { GROUP_IDS, KNOCKOUT_ROUNDS } from '../types/tournament';

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase();

const SHORT_NAME_OVERRIDES: Record<string, string> = {
  'Bosnia & Herzegovina': 'Bosnia',
  'Czech Republic': 'Czechia',
  'United States': 'USA',
  'Ivory Coast': "C. d'Ivoire",
  'South Africa': 'South Africa',
  'South Korea': 'South Korea',
  'Cape Verde': 'Cape Verde',
  'DR Congo': 'DR Congo',
};

const GROUP_DEFINITIONS = [
  {
    id: 'A',
    teams: [
      ['Mexico', 82],
      ['South Africa', 73],
      ['South Korea', 78],
      ['Czech Republic', 77],
    ],
  },
  {
    id: 'B',
    teams: [
      ['Canada', 78],
      ['Bosnia & Herzegovina', 74],
      ['Qatar', 71],
      ['Switzerland', 80],
    ],
  },
  {
    id: 'C',
    teams: [
      ['Brazil', 90],
      ['Morocco', 81],
      ['Haiti', 68],
      ['Scotland', 76],
    ],
  },
  {
    id: 'D',
    teams: [
      ['United States', 81],
      ['Paraguay', 75],
      ['Australia', 77],
      ['Turkey', 79],
    ],
  },
  {
    id: 'E',
    teams: [
      ['Germany', 86],
      ['Curacao', 67],
      ['Ivory Coast', 79],
      ['Ecuador', 80],
    ],
  },
  {
    id: 'F',
    teams: [
      ['Netherlands', 86],
      ['Japan', 82],
      ['Sweden', 78],
      ['Tunisia', 74],
    ],
  },
  {
    id: 'G',
    teams: [
      ['Belgium', 85],
      ['Egypt', 77],
      ['Iran', 78],
      ['New Zealand', 70],
    ],
  },
  {
    id: 'H',
    teams: [
      ['Spain', 88],
      ['Cape Verde', 72],
      ['Saudi Arabia', 73],
      ['Uruguay', 84],
    ],
  },
  {
    id: 'I',
    teams: [
      ['France', 90],
      ['Senegal', 81],
      ['Iraq', 69],
      ['Norway', 79],
    ],
  },
  {
    id: 'J',
    teams: [
      ['Argentina', 89],
      ['Algeria', 76],
      ['Austria', 77],
      ['Jordan', 68],
    ],
  },
  {
    id: 'K',
    teams: [
      ['Portugal', 86],
      ['DR Congo', 72],
      ['Uzbekistan', 73],
      ['Colombia', 84],
    ],
  },
  {
    id: 'L',
    teams: [
      ['England', 87],
      ['Croatia', 83],
      ['Ghana', 77],
      ['Panama', 71],
    ],
  },
] as const;

type TeamTuple = (typeof GROUP_DEFINITIONS)[number]['teams'][number];

const createTeam = (group: GroupId, tuple: TeamTuple): Team => {
  const [name, rating] = tuple;

  return {
    id: slugify(name),
    name,
    shortName: SHORT_NAME_OVERRIDES[name] ?? name,
    group,
    rating,
    players: buildTeamRoster(name),
  };
};

export const TEAMS: Team[] = GROUP_DEFINITIONS.flatMap((groupDefinition) =>
  groupDefinition.teams.map((teamTuple) => createTeam(groupDefinition.id, teamTuple)),
);

export const TEAMS_BY_ID = TEAMS.reduce<Record<string, Team>>((accumulator, team) => {
  accumulator[team.id] = team;
  return accumulator;
}, {});

export const GROUPS = GROUP_IDS.map((groupId) => ({
  id: groupId,
  label: `Bảng ${groupId}`,
  teams: TEAMS.filter((team) => team.group === groupId),
}));

const GROUP_MATCHUPS = [
  { matchday: 1, homeIndex: 0, awayIndex: 1 },
  { matchday: 1, homeIndex: 2, awayIndex: 3 },
  { matchday: 2, homeIndex: 0, awayIndex: 2 },
  { matchday: 2, homeIndex: 3, awayIndex: 1 },
  { matchday: 3, homeIndex: 3, awayIndex: 0 },
  { matchday: 3, homeIndex: 1, awayIndex: 2 },
] as const;

export const ROUND_LABELS: Record<KnockoutRound, string> = {
  roundOf32: 'Round of 32',
  roundOf16: 'Round of 16',
  quarterfinals: 'Quarter Finals',
  semifinals: 'Semi Finals',
  thirdPlace: 'Third Place Match',
  final: 'Final',
};

export const createInitialGroupMatches = (): GroupMatch[] =>
  GROUPS.flatMap((group) =>
    GROUP_MATCHUPS.map((matchup, index) => ({
      id: `group-${group.id}-${index + 1}`,
      stage: 'group' as const,
      group: group.id,
      matchday: matchup.matchday,
      homeTeamId: group.teams[matchup.homeIndex].id,
      awayTeamId: group.teams[matchup.awayIndex].id,
      homeScore: null,
      awayScore: null,
      scorers: null,
      status: 'pending' as const,
      predictedAt: null,
    })),
  );

const sameTeamPair = (left: GroupMatch, right: GroupMatch) =>
  (left.homeTeamId === right.homeTeamId && left.awayTeamId === right.awayTeamId) ||
  (left.homeTeamId === right.awayTeamId && left.awayTeamId === right.homeTeamId);

const swapScorersSides = (scorers: MatchScorers | null): MatchScorers | null => {
  if (!scorers) {
    return null;
  }

  return {
    home: scorers.away,
    away: scorers.home,
  };
};

export const normalizeGroupMatches = (incomingMatches?: GroupMatch[]): GroupMatch[] => {
  const canonicalMatches = createInitialGroupMatches();

  if (!incomingMatches?.length) {
    return canonicalMatches;
  }

  return canonicalMatches.map((canonicalMatch) => {
    const persistedMatch =
      incomingMatches.find((match) => match.id === canonicalMatch.id) ??
      incomingMatches.find((match) => sameTeamPair(match, canonicalMatch));

    if (!persistedMatch) {
      return canonicalMatch;
    }

    const sameOrientation =
      persistedMatch.homeTeamId === canonicalMatch.homeTeamId &&
      persistedMatch.awayTeamId === canonicalMatch.awayTeamId;
    const reversedOrientation =
      persistedMatch.homeTeamId === canonicalMatch.awayTeamId &&
      persistedMatch.awayTeamId === canonicalMatch.homeTeamId;

    if (sameOrientation) {
      return {
        ...canonicalMatch,
        homeScore: persistedMatch.homeScore,
        awayScore: persistedMatch.awayScore,
        scorers: persistedMatch.scorers,
        status: persistedMatch.status,
        predictedAt: persistedMatch.predictedAt,
      };
    }

    if (reversedOrientation) {
      return {
        ...canonicalMatch,
        homeScore: persistedMatch.awayScore,
        awayScore: persistedMatch.homeScore,
        scorers: swapScorersSides(persistedMatch.scorers),
        status: persistedMatch.status,
        predictedAt: persistedMatch.predictedAt,
      };
    }

    return canonicalMatch;
  });
};

const getDefaultSeedLabels = (round: KnockoutRound, slot: number) => {
  switch (round) {
    case 'roundOf16':
      return {
        homeSeedLabel: `Winner R32-${slot * 2 + 1}`,
        awaySeedLabel: `Winner R32-${slot * 2 + 2}`,
      };
    case 'quarterfinals':
      return {
        homeSeedLabel: `Winner R16-${slot * 2 + 1}`,
        awaySeedLabel: `Winner R16-${slot * 2 + 2}`,
      };
    case 'semifinals':
      return {
        homeSeedLabel: `Winner QF-${slot * 2 + 1}`,
        awaySeedLabel: `Winner QF-${slot * 2 + 2}`,
      };
    case 'thirdPlace':
      return {
        homeSeedLabel: 'Loser SF-1',
        awaySeedLabel: 'Loser SF-2',
      };
    case 'final':
      return {
        homeSeedLabel: 'Winner SF-1',
        awaySeedLabel: 'Winner SF-2',
      };
    default:
      return {
        homeSeedLabel: null,
        awaySeedLabel: null,
      };
  }
};

const createEmptyKnockoutMatch = (round: KnockoutRound, slot: number): KnockoutMatch => {
  const defaultSeeds = getDefaultSeedLabels(round, slot);

  return {
    id: `${round}-${slot + 1}`,
    stage: 'knockout',
    round,
    slot,
    homeTeamId: null,
    awayTeamId: null,
    homeSeedLabel: defaultSeeds.homeSeedLabel,
    awaySeedLabel: defaultSeeds.awaySeedLabel,
    regulationHomeScore: null,
    regulationAwayScore: null,
    extraTimeHomeScore: null,
    extraTimeAwayScore: null,
    homeScore: null,
    awayScore: null,
    scorers: null,
    penalty: null,
    status: 'pending',
    winnerTeamId: null,
    loserTeamId: null,
    predictedAt: null,
  };
};

export const createEmptyKnockoutMatches = (): Record<KnockoutRound, KnockoutMatch[]> => ({
  roundOf32: Array.from({ length: 16 }, (_, index) => createEmptyKnockoutMatch('roundOf32', index)),
  roundOf16: Array.from({ length: 8 }, (_, index) => createEmptyKnockoutMatch('roundOf16', index)),
  quarterfinals: Array.from({ length: 4 }, (_, index) => createEmptyKnockoutMatch('quarterfinals', index)),
  semifinals: Array.from({ length: 2 }, (_, index) => createEmptyKnockoutMatch('semifinals', index)),
  thirdPlace: [createEmptyKnockoutMatch('thirdPlace', 0)],
  final: [createEmptyKnockoutMatch('final', 0)],
});

export const normalizeKnockoutMatches = (
  incomingMatches?: Partial<Record<KnockoutRound, KnockoutMatch[]>>,
): Record<KnockoutRound, KnockoutMatch[]> => {
  const baseMatches = createEmptyKnockoutMatches();

  return KNOCKOUT_ROUNDS.reduce((accumulator, round) => {
    const incomingRound = incomingMatches?.[round] ?? [];

    accumulator[round] = baseMatches[round].map((baseMatch, index) => {
      const persistedMatch = incomingRound[index];

      if (!persistedMatch) {
        return baseMatch;
      }

      const regulationHomeScore = persistedMatch.regulationHomeScore ?? persistedMatch.homeScore ?? null;
      const regulationAwayScore = persistedMatch.regulationAwayScore ?? persistedMatch.awayScore ?? null;
      const shouldMirrorFinalToExtraTime =
        (persistedMatch.status === 'awaiting-penalties' || Boolean(persistedMatch.penalty)) &&
        persistedMatch.extraTimeHomeScore == null &&
        persistedMatch.extraTimeAwayScore == null;

      return {
        ...baseMatch,
        ...persistedMatch,
        homeSeedLabel: persistedMatch.homeSeedLabel ?? baseMatch.homeSeedLabel,
        awaySeedLabel: persistedMatch.awaySeedLabel ?? baseMatch.awaySeedLabel,
        regulationHomeScore,
        regulationAwayScore,
        extraTimeHomeScore: shouldMirrorFinalToExtraTime
          ? persistedMatch.homeScore ?? null
          : persistedMatch.extraTimeHomeScore ?? baseMatch.extraTimeHomeScore,
        extraTimeAwayScore: shouldMirrorFinalToExtraTime
          ? persistedMatch.awayScore ?? null
          : persistedMatch.extraTimeAwayScore ?? baseMatch.extraTimeAwayScore,
      };
    });

    return accumulator;
  }, {} as Record<KnockoutRound, KnockoutMatch[]>);
};

export const createInitialTournamentCoreState = (): TournamentCoreState => ({
  groupMatches: createInitialGroupMatches(),
  knockoutVisible: false,
  knockoutMatches: createEmptyKnockoutMatches(),
});

export { GROUP_IDS, KNOCKOUT_ROUNDS };
