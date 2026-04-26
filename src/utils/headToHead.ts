import { ROUND_LABELS, TEAMS_BY_ID } from '../data/tournament';
import type {
  GroupMatch,
  KnockoutMatch,
  KnockoutRound,
  Team,
  TimelineEvent,
} from '../types/tournament';

export interface TeamCompareStats {
  teamId: string;
  teamName: string;
  totalGoals: number;
  goalsConceded: number;
  wins: number;
  motmCount: number;
  bestPlayer: string;
  journey: string;
  journeyRank: number;
  penaltyMatches: number;
  totalMatches: number;
  goalsPerMatch: number;
}

const KNOCKOUT_ORDER: KnockoutRound[] = [
  'roundOf32',
  'roundOf16',
  'quarterfinals',
  'semifinals',
  'thirdPlace',
  'final',
];

const getScorerTimeline = (match: GroupMatch | KnockoutMatch): TimelineEvent[] => {
  if (match.timeline?.length) {
    return match.timeline;
  }

  const events: TimelineEvent[] = [];

  if (match.scorers?.home.length) {
    for (const scorer of match.scorers.home) {
      const resolvedTeamId = scorer.teamId || match.homeTeamId;
      if (!resolvedTeamId) {
        continue;
      }

      events.push({
        sortMinute: scorer.minute,
        displayMinute: `${scorer.minute}'`,
        playerName: scorer.playerName,
        playerId: scorer.playerId,
        teamId: resolvedTeamId,
        side: 'home',
        isPenalty: false,
        phase: 'regulation',
      });
    }
  }

  if (match.scorers?.away.length) {
    for (const scorer of match.scorers.away) {
      const resolvedTeamId = scorer.teamId || match.awayTeamId;
      if (!resolvedTeamId) {
        continue;
      }

      events.push({
        sortMinute: scorer.minute,
        displayMinute: `${scorer.minute}'`,
        playerName: scorer.playerName,
        playerId: scorer.playerId,
        teamId: resolvedTeamId,
        side: 'away',
        isPenalty: false,
        phase: 'regulation',
      });
    }
  }

  return events;
};

const getJourney = (teamId: string, knockoutMatches: Record<KnockoutRound, KnockoutMatch[]>) => {
  const finalMatch = knockoutMatches.final[0];
  const thirdPlaceMatch = knockoutMatches.thirdPlace[0];

  if (finalMatch?.winnerTeamId === teamId) {
    return { label: 'Vô địch', rank: 8 };
  }

  if (finalMatch?.loserTeamId === teamId) {
    return { label: 'Á quân', rank: 7 };
  }

  if (thirdPlaceMatch?.winnerTeamId === teamId) {
    return { label: 'Hạng ba', rank: 6 };
  }

  if (thirdPlaceMatch?.loserTeamId === teamId) {
    return { label: 'Hạng tư', rank: 5 };
  }

  let highestRound: KnockoutRound | null = null;

  for (const round of KNOCKOUT_ORDER) {
    if (round === 'thirdPlace' || round === 'final') {
      continue;
    }

    const played = knockoutMatches[round].some(
      (match) => match.homeTeamId === teamId || match.awayTeamId === teamId,
    );

    if (played) {
      highestRound = round;
    }
  }

  if (!highestRound) {
    return { label: 'Dừng ở vòng bảng', rank: 1 };
  }

  const roundRankMap: Record<Exclude<KnockoutRound, 'thirdPlace' | 'final'>, number> = {
    roundOf32: 2,
    roundOf16: 3,
    quarterfinals: 4,
    semifinals: 5,
  };

  return {
    label: `Tới ${ROUND_LABELS[highestRound]}`,
    rank: roundRankMap[highestRound],
  };
};

export const buildTeamCompareStatsMap = (
  teams: Team[],
  groupMatches: GroupMatch[],
  knockoutMatches: Record<KnockoutRound, KnockoutMatch[]>,
) => {
  const playerGoalsByTeam = new Map<string, Map<string, { playerName: string; goals: number }>>();
  const matchMotmCounts = new Map<string, number>();
  const statsByTeam = new Map<string, TeamCompareStats>();

  for (const team of teams) {
    statsByTeam.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      totalGoals: 0,
      goalsConceded: 0,
      wins: 0,
      motmCount: 0,
      bestPlayer: 'Chưa xác định',
      journey: 'Dừng ở vòng bảng',
      journeyRank: 1,
      penaltyMatches: 0,
      totalMatches: 0,
      goalsPerMatch: 0,
    });
  }

  const allMatches = [
    ...groupMatches,
    ...Object.values(knockoutMatches).flat(),
  ];

  for (const match of allMatches) {
    if (match.status !== 'completed' || match.homeScore === null || match.awayScore === null) {
      continue;
    }

    if (!match.homeTeamId || !match.awayTeamId) {
      continue;
    }

    const homeStats = statsByTeam.get(match.homeTeamId);
    const awayStats = statsByTeam.get(match.awayTeamId);
    if (!homeStats || !awayStats) {
      continue;
    }

    homeStats.totalGoals += match.homeScore;
    homeStats.goalsConceded += match.awayScore;
    homeStats.totalMatches += 1;

    awayStats.totalGoals += match.awayScore;
    awayStats.goalsConceded += match.homeScore;
    awayStats.totalMatches += 1;

    if (match.homeScore > match.awayScore) {
      homeStats.wins += 1;
    } else if (match.awayScore > match.homeScore) {
      awayStats.wins += 1;
    } else if ('winnerTeamId' in match && match.winnerTeamId) {
      const winnerStats = statsByTeam.get(match.winnerTeamId);
      if (winnerStats) {
        winnerStats.wins += 1;
      }
    }

    if ('penalty' in match && match.penalty) {
      homeStats.penaltyMatches += 1;
      awayStats.penaltyMatches += 1;
    }

    const events = getScorerTimeline(match);
    for (const event of events) {
      const eventTeamId = event.teamId;
      if (!eventTeamId || !statsByTeam.has(eventTeamId)) {
        continue;
      }

      let teamPlayers = playerGoalsByTeam.get(eventTeamId);
      if (!teamPlayers) {
        teamPlayers = new Map();
        playerGoalsByTeam.set(eventTeamId, teamPlayers);
      }

      const current = teamPlayers.get(event.playerId);
      if (current) {
        current.goals += 1;
      } else {
        teamPlayers.set(event.playerId, {
          playerName: event.playerName,
          goals: 1,
        });
      }
    }

    if (match.motm) {
      const motmTeam = Object.values(TEAMS_BY_ID).find((team) => team.name === match.motm?.teamName);
      if (motmTeam) {
        matchMotmCounts.set(motmTeam.id, (matchMotmCounts.get(motmTeam.id) ?? 0) + 1);
      }
    }
  }

  for (const team of teams) {
    const stats = statsByTeam.get(team.id);
    if (!stats) {
      continue;
    }

    stats.motmCount = matchMotmCounts.get(team.id) ?? 0;

    const playerGoals = playerGoalsByTeam.get(team.id);
    if (playerGoals?.size) {
      const best = Array.from(playerGoals.values()).sort((left, right) => {
        if (right.goals !== left.goals) {
          return right.goals - left.goals;
        }
        return left.playerName.localeCompare(right.playerName);
      })[0];
      stats.bestPlayer = `${best.playerName} (${best.goals})`;
    }

    const journey = getJourney(team.id, knockoutMatches);
    stats.journey = journey.label;
    stats.journeyRank = journey.rank;
    stats.goalsPerMatch = stats.totalMatches ? Number((stats.totalGoals / stats.totalMatches).toFixed(2)) : 0;
  }

  return statsByTeam;
};
