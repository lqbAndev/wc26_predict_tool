import { ROUND_LABELS, TEAMS_BY_ID } from '../data/tournament';
import type {
  GroupMatch,
  KnockoutMatch,
  KnockoutRound,
  SeasonMOTM,
  TopScorerEntry,
} from '../types/tournament';
import { buildBestXI, type BestXIResult } from './bestXI';

export interface ScorerInfo {
  playerName: string;
  displayMinute: string;
}

export interface MatchHighlight {
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  totalGoals: number;
  roundLabel: string;
  penalty: { home: number; away: number } | null;
  homeScorers: ScorerInfo[];
  awayScorers: ScorerInfo[];
}

export interface TournamentRecapStats {
  champion: string;
  runnerUp: string;
  thirdPlace: string;
  topScorer: TopScorerEntry | null;
  seasonMOTM: SeasonMOTM | null;
  bestXI: BestXIResult | null;
  totalGoals: number;
  totalMatches: number;
  totalPenaltyMatches: number;
  highestScoringMatch: MatchHighlight | null;
  mostGoalsTeam: { teamName: string; goals: number } | null;
  mostConcededTeam: { teamName: string; goals: number } | null;
  finalMatch: MatchHighlight | null;
  thirdPlaceMatch: MatchHighlight | null;
  mostDramaticMatch: MatchHighlight | null;
  goalsPerMatch: number;
  isComplete: boolean;
}

const getTeamName = (teamId: string | null): string =>
  teamId ? (TEAMS_BY_ID[teamId]?.name ?? teamId) : 'TBD';

const buildMatchHighlight = (
  match: GroupMatch | KnockoutMatch,
  roundLabel: string,
): MatchHighlight | null => {
  if (match.homeScore == null || match.awayScore == null) {
    return null;
  }

  const homeScorers: ScorerInfo[] = [];
  const awayScorers: ScorerInfo[] = [];

  if (match.timeline) {
    for (const event of match.timeline) {
      const info: ScorerInfo = { playerName: event.playerName, displayMinute: event.displayMinute };
      if (event.side === 'home') {
        homeScorers.push(info);
      } else {
        awayScorers.push(info);
      }
    }
  } else if (match.scorers) {
    for (const event of match.scorers.home) {
      homeScorers.push({ playerName: event.playerName, displayMinute: `${event.minute}'` });
    }
    for (const event of match.scorers.away) {
      awayScorers.push({ playerName: event.playerName, displayMinute: `${event.minute}'` });
    }
  }

  return {
    homeTeamName: getTeamName(match.homeTeamId),
    awayTeamName: getTeamName(match.awayTeamId),
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    totalGoals: match.homeScore + match.awayScore,
    roundLabel,
    penalty: 'penalty' in match && match.penalty ? { home: match.penalty.home, away: match.penalty.away } : null,
    homeScorers,
    awayScorers,
  };
};

export const isTournamentComplete = (knockoutMatches: Record<KnockoutRound, KnockoutMatch[]>) => {
  const finalMatch = knockoutMatches.final[0];
  const thirdPlaceMatch = knockoutMatches.thirdPlace[0];

  return finalMatch?.status === 'completed' && thirdPlaceMatch?.status === 'completed';
};

export const calculateTournamentStats = (
  groupMatches: GroupMatch[],
  knockoutMatches: Record<KnockoutRound, KnockoutMatch[]>,
  topScorers: TopScorerEntry[],
  seasonMOTM: SeasonMOTM | null,
): TournamentRecapStats => {
  const allKnockoutMatches = Object.values(knockoutMatches).flat();
  const completedGroupMatches = groupMatches.filter((match) => match.status === 'completed');
  const completedKnockoutMatches = allKnockoutMatches.filter((match) => match.status === 'completed');
  const isComplete = isTournamentComplete(knockoutMatches);

  const finalMatch = knockoutMatches.final[0];
  const thirdPlaceMatch = knockoutMatches.thirdPlace[0];
  const champion = getTeamName(finalMatch?.winnerTeamId ?? null);
  const runnerUp = getTeamName(finalMatch?.loserTeamId ?? null);
  const thirdPlace = getTeamName(thirdPlaceMatch?.winnerTeamId ?? null);

  let totalGoals = 0;
  const teamGoalsFor = new Map<string, number>();
  const teamGoalsAgainst = new Map<string, number>();

  const addGoals = (teamId: string | null, goalsFor: number, goalsAgainst: number) => {
    if (!teamId) {
      return;
    }
    teamGoalsFor.set(teamId, (teamGoalsFor.get(teamId) ?? 0) + goalsFor);
    teamGoalsAgainst.set(teamId, (teamGoalsAgainst.get(teamId) ?? 0) + goalsAgainst);
  };

  for (const match of [...completedGroupMatches, ...completedKnockoutMatches]) {
    if (match.homeScore == null || match.awayScore == null) {
      continue;
    }

    totalGoals += match.homeScore + match.awayScore;
    addGoals(match.homeTeamId, match.homeScore, match.awayScore);
    addGoals(match.awayTeamId, match.awayScore, match.homeScore);
  }

  const totalMatches = completedGroupMatches.length + completedKnockoutMatches.length;
  const totalPenaltyMatches = completedKnockoutMatches.filter((match) => match.penalty !== null).length;

  let highestScoringMatch: MatchHighlight | null = null;
  let highestGoals = -1;

  for (const match of completedGroupMatches) {
    const goals = (match.homeScore ?? 0) + (match.awayScore ?? 0);
    if (goals > highestGoals) {
      highestGoals = goals;
      highestScoringMatch = buildMatchHighlight(match, `Bảng ${match.group}`);
    }
  }

  for (const match of completedKnockoutMatches) {
    const goals = (match.homeScore ?? 0) + (match.awayScore ?? 0);
    if (goals > highestGoals) {
      highestGoals = goals;
      highestScoringMatch = buildMatchHighlight(match, ROUND_LABELS[match.round]);
    }
  }

  let mostGoalsTeam: { teamName: string; goals: number } | null = null;
  let maxGoals = -1;
  for (const [teamId, goals] of teamGoalsFor) {
    if (goals > maxGoals) {
      maxGoals = goals;
      mostGoalsTeam = { teamName: getTeamName(teamId), goals };
    }
  }

  let mostConcededTeam: { teamName: string; goals: number } | null = null;
  let maxConceded = -1;
  for (const [teamId, goals] of teamGoalsAgainst) {
    if (goals > maxConceded) {
      maxConceded = goals;
      mostConcededTeam = { teamName: getTeamName(teamId), goals };
    }
  }

  const finalMatchHighlight = finalMatch ? buildMatchHighlight(finalMatch, 'Chung kết') : null;
  const thirdPlaceMatchHighlight = thirdPlaceMatch ? buildMatchHighlight(thirdPlaceMatch, 'Tranh hạng 3') : null;

  let mostDramaticMatch: MatchHighlight | null = null;
  let highestDramaScore = -1;

  const computeDramaScore = (match: GroupMatch | KnockoutMatch) => {
    if (match.homeScore == null || match.awayScore == null) {
      return -1;
    }

    const goalDiff = Math.abs(match.homeScore - match.awayScore);
    let score = 0;
    if ('penalty' in match && match.penalty) {
      score += 10;
    }
    if (goalDiff === 0) {
      score += 5;
    } else if (goalDiff === 1) {
      score += 3;
    }
    score += (match.homeScore + match.awayScore) * 0.5;
    return score;
  };

  for (const match of completedGroupMatches) {
    const dramaScore = computeDramaScore(match);
    if (dramaScore > highestDramaScore) {
      highestDramaScore = dramaScore;
      mostDramaticMatch = buildMatchHighlight(match, `Bảng ${match.group}`);
    }
  }

  for (const match of completedKnockoutMatches) {
    if (match.round === 'final' || match.round === 'thirdPlace') {
      continue;
    }
    const dramaScore = computeDramaScore(match);
    if (dramaScore > highestDramaScore) {
      highestDramaScore = dramaScore;
      mostDramaticMatch = buildMatchHighlight(match, ROUND_LABELS[match.round]);
    }
  }

  const goalsPerMatch = totalMatches > 0 ? Number((totalGoals / totalMatches).toFixed(2)) : 0;
  const bestXI = isComplete ? buildBestXI(groupMatches, knockoutMatches) : null;

  return {
    champion,
    runnerUp,
    thirdPlace,
    topScorer: topScorers[0] ?? null,
    seasonMOTM,
    bestXI,
    totalGoals,
    totalMatches,
    totalPenaltyMatches,
    highestScoringMatch,
    mostGoalsTeam,
    mostConcededTeam,
    finalMatch: finalMatchHighlight,
    thirdPlaceMatch: thirdPlaceMatchHighlight,
    mostDramaticMatch,
    goalsPerMatch,
    isComplete,
  };
};
