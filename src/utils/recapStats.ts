import { TEAMS_BY_ID, ROUND_LABELS } from '../data/tournament';
import type {
  GroupMatch,
  KnockoutMatch,
  KnockoutRound,
  TopScorerEntry,
} from '../types/tournament';

/* ──────────────────────────────────────────────────────────────────────────────
 * Tournament Recap Stats — computes all summary data from match results.
 * Nothing is hard-coded; every value derives from the actual match state.
 * ────────────────────────────────────────────────────────────────────────── */

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
  /** Name of the champion team */
  champion: string;
  /** Name of the runner-up team */
  runnerUp: string;
  /** Name of the third-place team */
  thirdPlace: string;
  /** Top scorer entry */
  topScorer: TopScorerEntry | null;
  /** Total goals across the entire tournament */
  totalGoals: number;
  /** Total matches played */
  totalMatches: number;
  /** Number of matches decided by penalty shootout */
  totalPenaltyMatches: number;
  /** The match with the most combined goals */
  highestScoringMatch: MatchHighlight | null;
  /** Team that scored the most goals across the tournament */
  mostGoalsTeam: { teamName: string; goals: number } | null;
  /** Team that conceded the most goals across the tournament */
  mostConcededTeam: { teamName: string; goals: number } | null;
  /** Final match highlight */
  finalMatch: MatchHighlight | null;
  /** Third-place match highlight */
  thirdPlaceMatch: MatchHighlight | null;
  /** Most dramatic match highlight (penalty/close margin) */
  mostDramaticMatch: MatchHighlight | null;
  /** Goals per match average */
  goalsPerMatch: number;
  /** Whether the tournament is fully complete */
  isComplete: boolean;
}

const getTeamName = (teamId: string | null): string =>
  teamId ? (TEAMS_BY_ID[teamId]?.name ?? teamId) : 'TBD';

const buildMatchHighlight = (
  match: GroupMatch | KnockoutMatch,
  roundLabel: string,
): MatchHighlight | null => {
  if (match.homeScore == null || match.awayScore == null) return null;

  const homeTeamId = 'homeTeamId' in match ? match.homeTeamId : null;
  const awayTeamId = 'awayTeamId' in match ? match.awayTeamId : null;

  // Extract goal scorers from timeline or scorers data
  const homeScorers: ScorerInfo[] = [];
  const awayScorers: ScorerInfo[] = [];

  if (match.timeline) {
    for (const event of match.timeline) {
      const info: ScorerInfo = { playerName: event.playerName, displayMinute: event.displayMinute };
      if (event.side === 'home') homeScorers.push(info);
      else awayScorers.push(info);
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
    homeTeamName: getTeamName(homeTeamId),
    awayTeamName: getTeamName(awayTeamId),
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    totalGoals: match.homeScore + match.awayScore,
    roundLabel,
    penalty: 'penalty' in match && match.penalty
      ? { home: match.penalty.home, away: match.penalty.away }
      : null,
    homeScorers,
    awayScorers,
  };
};

/**
 * Check whether the entire tournament (all knockout rounds including final
 * and third-place match) has been completed.
 */
export const isTournamentComplete = (
  knockoutMatches: Record<KnockoutRound, KnockoutMatch[]>,
): boolean => {
  const finalMatch = knockoutMatches.final[0];
  const thirdPlaceMatch = knockoutMatches.thirdPlace[0];

  return (
    finalMatch?.status === 'completed' &&
    thirdPlaceMatch?.status === 'completed'
  );
};

export const calculateTournamentStats = (
  groupMatches: GroupMatch[],
  knockoutMatches: Record<KnockoutRound, KnockoutMatch[]>,
  topScorers: TopScorerEntry[],
): TournamentRecapStats => {
  const allKnockout = Object.values(knockoutMatches).flat();
  const isComplete = isTournamentComplete(knockoutMatches);

  // --- Champion, Runner-up, Third ---
  const finalMatch = knockoutMatches.final[0];
  const thirdPlaceMatch = knockoutMatches.thirdPlace[0];
  const champion = getTeamName(finalMatch?.winnerTeamId ?? null);
  const runnerUp = getTeamName(finalMatch?.loserTeamId ?? null);
  const thirdPlace = getTeamName(thirdPlaceMatch?.winnerTeamId ?? null);

  // --- Goals ---
  const completedGroup = groupMatches.filter((m) => m.status === 'completed');
  const completedKnockout = allKnockout.filter((m) => m.status === 'completed');

  let totalGoals = 0;
  const teamGoalsFor = new Map<string, number>();
  const teamGoalsAgainst = new Map<string, number>();

  const addGoals = (teamId: string | null, goalsFor: number, goalsAgainst: number) => {
    if (!teamId) return;
    teamGoalsFor.set(teamId, (teamGoalsFor.get(teamId) ?? 0) + goalsFor);
    teamGoalsAgainst.set(teamId, (teamGoalsAgainst.get(teamId) ?? 0) + goalsAgainst);
  };

  for (const m of completedGroup) {
    if (m.homeScore != null && m.awayScore != null) {
      totalGoals += m.homeScore + m.awayScore;
      addGoals(m.homeTeamId, m.homeScore, m.awayScore);
      addGoals(m.awayTeamId, m.awayScore, m.homeScore);
    }
  }

  for (const m of completedKnockout) {
    if (m.homeScore != null && m.awayScore != null) {
      totalGoals += m.homeScore + m.awayScore;
      addGoals(m.homeTeamId, m.homeScore, m.awayScore);
      addGoals(m.awayTeamId, m.awayScore, m.homeScore);
    }
  }

  // --- Total matches ---
  const totalMatches = completedGroup.length + completedKnockout.length;

  // --- Penalty matches ---
  const totalPenaltyMatches = completedKnockout.filter((m) => m.penalty !== null).length;

  // --- Highest scoring match ---
  let highestScoringMatch: MatchHighlight | null = null;
  let highestGoals = -1;

  for (const m of completedGroup) {
    if (m.homeScore != null && m.awayScore != null) {
      const total = m.homeScore + m.awayScore;
      if (total > highestGoals) {
        highestGoals = total;
        highestScoringMatch = buildMatchHighlight(m, `Bảng ${m.group}`);
      }
    }
  }

  for (const m of completedKnockout) {
    if (m.homeScore != null && m.awayScore != null) {
      const total = m.homeScore + m.awayScore;
      if (total > highestGoals) {
        highestGoals = total;
        highestScoringMatch = buildMatchHighlight(m, ROUND_LABELS[m.round]);
      }
    }
  }

  // --- Most goals team ---
  let mostGoalsTeam: { teamName: string; goals: number } | null = null;
  let maxGoals = 0;
  for (const [teamId, goals] of teamGoalsFor) {
    if (goals > maxGoals) {
      maxGoals = goals;
      mostGoalsTeam = { teamName: getTeamName(teamId), goals };
    }
  }

  // --- Most conceded team ---
  let mostConcededTeam: { teamName: string; goals: number } | null = null;
  let maxConceded = 0;
  for (const [teamId, goals] of teamGoalsAgainst) {
    if (goals > maxConceded) {
      maxConceded = goals;
      mostConcededTeam = { teamName: getTeamName(teamId), goals };
    }
  }

  // --- Match highlights ---
  const finalHighlight = finalMatch ? buildMatchHighlight(finalMatch, 'Chung kết') : null;
  const thirdPlaceHighlight = thirdPlaceMatch ? buildMatchHighlight(thirdPlaceMatch, 'Tranh hạng 3') : null;

  // --- Most Dramatic Match (penalty / close margin, excl. final & 3rd place) ---
  let mostDramaticMatch: MatchHighlight | null = null;
  let maxDramaScore = -1;

  const scoreDrama = (m: GroupMatch | KnockoutMatch): number => {
    if (m.homeScore == null || m.awayScore == null) return -1;
    let score = 0;
    const diff = Math.abs(m.homeScore - m.awayScore);
    if ('penalty' in m && m.penalty) score += 10;
    if (diff === 0) score += 5;
    else if (diff === 1) score += 3;
    score += (m.homeScore + m.awayScore) * 0.5;
    return score;
  };

  for (const m of completedGroup) {
    const drama = scoreDrama(m);
    if (drama > maxDramaScore) {
      maxDramaScore = drama;
      mostDramaticMatch = buildMatchHighlight(m, `Bảng ${m.group}`);
    }
  }

  for (const m of completedKnockout) {
    if (m.round === 'final' || m.round === 'thirdPlace') continue;
    const drama = scoreDrama(m);
    if (drama > maxDramaScore) {
      maxDramaScore = drama;
      mostDramaticMatch = buildMatchHighlight(m, ROUND_LABELS[m.round]);
    }
  }

  // --- Top scorer ---
  const topScorer = topScorers[0] ?? null;

  // --- Goals per match ---
  const goalsPerMatch = totalMatches > 0 ? Math.round((totalGoals / totalMatches) * 100) / 100 : 0;

  return {
    champion,
    runnerUp,
    thirdPlace,
    topScorer,
    totalGoals,
    totalMatches,
    totalPenaltyMatches,
    highestScoringMatch,
    mostGoalsTeam,
    mostConcededTeam,
    finalMatch: finalHighlight,
    thirdPlaceMatch: thirdPlaceHighlight,
    mostDramaticMatch,
    goalsPerMatch,
    isComplete,
  };
};
