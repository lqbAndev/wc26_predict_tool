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
  /** Goal Difference (totalGoals - goalsConceded) */
  goalDifference: number;
  /** Number of matches where the team conceded 0 goals */
  cleanSheets: number;
  /** Win Rate as a percentage string, e.g. "66.7%" */
  winRate: string;
  /** Recent form for last 5 matches, e.g. "W-D-W-L-W" */
  recentForm: string;
  /** Biggest win result, e.g. "3 - 0 vs Germany" */
  biggestWin: string;
  /** Key player = player with most MOTM awards on the team */
  keyPlayer: string;
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
  /** Per-team per-player MOTM counts — used to determine "Key Player" */
  const playerMotmByTeam = new Map<string, Map<string, { playerName: string; count: number }>>();
  const statsByTeam = new Map<string, TeamCompareStats>();

  /** Track match results per team chronologically for form & biggest win */
  const matchResultsByTeam = new Map<
    string,
    { result: 'W' | 'D' | 'L'; goalsFor: number; goalsAgainst: number; opponentName: string }[]
  >();

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
      goalDifference: 0,
      cleanSheets: 0,
      winRate: '0%',
      recentForm: '--',
      biggestWin: '--',
      keyPlayer: 'Chưa xác định',
    });
    matchResultsByTeam.set(team.id, []);
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

    // --- Clean sheets ---
    if (match.awayScore === 0) {
      homeStats.cleanSheets += 1;
    }
    if (match.homeScore === 0) {
      awayStats.cleanSheets += 1;
    }

    // --- Win/Draw/Loss tracking ---
    let homeResult: 'W' | 'D' | 'L';
    let awayResult: 'W' | 'D' | 'L';

    if (match.homeScore > match.awayScore) {
      homeStats.wins += 1;
      homeResult = 'W';
      awayResult = 'L';
    } else if (match.awayScore > match.homeScore) {
      awayStats.wins += 1;
      homeResult = 'L';
      awayResult = 'W';
    } else if ('winnerTeamId' in match && match.winnerTeamId) {
      const winnerStats = statsByTeam.get(match.winnerTeamId);
      if (winnerStats) {
        winnerStats.wins += 1;
      }
      // Draw in regulation → winner via penalties counts as W
      homeResult = match.winnerTeamId === match.homeTeamId ? 'W' : 'L';
      awayResult = match.winnerTeamId === match.awayTeamId ? 'W' : 'L';
    } else {
      homeResult = 'D';
      awayResult = 'D';
    }

    // Record match results per team
    matchResultsByTeam.get(match.homeTeamId)?.push({
      result: homeResult,
      goalsFor: match.homeScore,
      goalsAgainst: match.awayScore,
      opponentName: awayStats.teamName,
    });
    matchResultsByTeam.get(match.awayTeamId)?.push({
      result: awayResult,
      goalsFor: match.awayScore,
      goalsAgainst: match.homeScore,
      opponentName: homeStats.teamName,
    });

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

    // --- MOTM tracking (total + per-player per-team) ---
    if (match.motm) {
      const motmTeam = Object.values(TEAMS_BY_ID).find((team) => team.name === match.motm?.teamName);
      if (motmTeam) {
        matchMotmCounts.set(motmTeam.id, (matchMotmCounts.get(motmTeam.id) ?? 0) + 1);

        let teamPlayerMotm = playerMotmByTeam.get(motmTeam.id);
        if (!teamPlayerMotm) {
          teamPlayerMotm = new Map();
          playerMotmByTeam.set(motmTeam.id, teamPlayerMotm);
        }
        const playerKey = match.motm.playerName;
        const existing = teamPlayerMotm.get(playerKey);
        if (existing) {
          existing.count += 1;
        } else {
          teamPlayerMotm.set(playerKey, { playerName: match.motm.playerName, count: 1 });
        }
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

    // --- Goal Difference ---
    stats.goalDifference = stats.totalGoals - stats.goalsConceded;

    // --- Win Rate (normalized to max 8 matches for fair comparison) ---
    const WIN_RATE_DIVISOR = 8;
    stats.winRate = `${((stats.wins / WIN_RATE_DIVISOR) * 100).toFixed(1)}%`;

    // --- Recent Form (last 5 matches) ---
    const results = matchResultsByTeam.get(team.id) ?? [];
    if (results.length > 0) {
      const last5 = results.slice(-5);
      stats.recentForm = last5.map((r) => r.result).join('-');
    }

    // --- Biggest Win ---
    const wins = (matchResultsByTeam.get(team.id) ?? []).filter((r) => r.result === 'W');
    if (wins.length > 0) {
      const biggest = wins.reduce((best, curr) => {
        const bestMargin = best.goalsFor - best.goalsAgainst;
        const currMargin = curr.goalsFor - curr.goalsAgainst;
        if (currMargin > bestMargin) return curr;
        if (currMargin === bestMargin && curr.goalsFor > best.goalsFor) return curr;
        return best;
      });
      stats.biggestWin = `${biggest.goalsFor} - ${biggest.goalsAgainst} vs ${biggest.opponentName}`;
    }

    // --- Key Player (most MOTM on team) ---
    const teamMotmPlayers = playerMotmByTeam.get(team.id);
    if (teamMotmPlayers?.size) {
      const keyArr = Array.from(teamMotmPlayers.values()).sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.playerName.localeCompare(b.playerName);
      });
      const top = keyArr[0];
      stats.keyPlayer = `${top.playerName} (${top.count} MOTM)`;
    }
  }

  return statsByTeam;
};
