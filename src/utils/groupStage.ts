import { GROUP_IDS, GROUPS, TEAMS_BY_ID } from '../data/tournament';
import type { GroupMatch, GroupId, TeamStanding, ThirdPlaceStanding } from '../types/tournament';

const standingSorter = (left: TeamStanding, right: TeamStanding) =>
  right.points - left.points ||
  right.goalDifference - left.goalDifference ||
  right.goalsFor - left.goalsFor ||
  left.teamName.localeCompare(right.teamName, 'vi');

const thirdPlaceSorter = (left: TeamStanding, right: TeamStanding) =>
  right.points - left.points ||
  right.goalDifference - left.goalDifference ||
  right.goalsFor - left.goalsFor ||
  left.goalsAgainst - right.goalsAgainst ||
  left.teamName.localeCompare(right.teamName, 'vi');

export const createEmptyStandingsByGroup = (): Record<GroupId, TeamStanding[]> =>
  GROUP_IDS.reduce((accumulator, groupId) => {
    accumulator[groupId] = [];
    return accumulator;
  }, {} as Record<GroupId, TeamStanding[]>);

export const computeStandingsByGroup = (matches: GroupMatch[]): Record<GroupId, TeamStanding[]> => {
  const standingsByGroup = createEmptyStandingsByGroup();

  for (const group of GROUPS) {
    const rows = group.teams.reduce<Record<string, TeamStanding>>((accumulator, team) => {
      accumulator[team.id] = {
        teamId: team.id,
        teamName: team.name,
        group: team.group,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        rank: 0,
      };
      return accumulator;
    }, {});

    const groupMatches = matches.filter((match) => match.group === group.id && match.status === 'completed');

    for (const match of groupMatches) {
      if (match.homeScore === null || match.awayScore === null) {
        continue;
      }

      const homeRow = rows[match.homeTeamId];
      const awayRow = rows[match.awayTeamId];

      homeRow.played += 1;
      awayRow.played += 1;
      homeRow.goalsFor += match.homeScore;
      homeRow.goalsAgainst += match.awayScore;
      awayRow.goalsFor += match.awayScore;
      awayRow.goalsAgainst += match.homeScore;

      if (match.homeScore > match.awayScore) {
        homeRow.wins += 1;
        homeRow.points += 3;
        awayRow.losses += 1;
      } else if (match.homeScore < match.awayScore) {
        awayRow.wins += 1;
        awayRow.points += 3;
        homeRow.losses += 1;
      } else {
        homeRow.draws += 1;
        awayRow.draws += 1;
        homeRow.points += 1;
        awayRow.points += 1;
      }
    }

    standingsByGroup[group.id] = Object.values(rows)
      .map((row) => ({
        ...row,
        goalDifference: row.goalsFor - row.goalsAgainst,
      }))
      .sort(standingSorter)
      .map((row, index) => ({
        ...row,
        rank: index + 1,
      }));
  }

  return standingsByGroup;
};

export const isGroupStageComplete = (matches: GroupMatch[]) =>
  matches.every((match) => match.status === 'completed');

export const computeThirdPlaceTable = (
  standingsByGroup: Record<GroupId, TeamStanding[]>,
  groupStageComplete: boolean,
): ThirdPlaceStanding[] =>
  GROUP_IDS.map((groupId) => standingsByGroup[groupId][2])
    .filter(Boolean)
    .sort(thirdPlaceSorter)
    .map((row, index) => ({
      ...row,
      position: index + 1,
      qualifies: index < 8,
      status: groupStageComplete ? (index < 8 ? 'qualified' : 'eliminated') : 'provisional',
    }));

const overallSorter = (left: TeamStanding, right: TeamStanding) =>
  right.points - left.points ||
  right.goalDifference - left.goalDifference ||
  right.goalsFor - left.goalsFor ||
  left.goalsAgainst - right.goalsAgainst ||
  left.teamName.localeCompare(right.teamName, 'vi');

export const rankQualifiedTeams = <T extends TeamStanding>(standings: T[]) => [...standings].sort(overallSorter);

export const getQualifiedTeamIds = (
  standingsByGroup: Record<GroupId, TeamStanding[]>,
  thirdPlaceTable: ThirdPlaceStanding[],
): string[] => {
  const automaticQualifiers = GROUP_IDS.flatMap((groupId) => standingsByGroup[groupId].slice(0, 2));
  const bestThirds = thirdPlaceTable.slice(0, 8);
  return [...automaticQualifiers, ...bestThirds].map((team) => team.teamId);
};

export const findChampionName = (championTeamId: string | null) => {
  if (!championTeamId) {
    return null;
  }

  return TEAMS_BY_ID[championTeamId]?.name ?? null;
};
