import type {
  GroupMatch,
  KnockoutMatch,
  MatchScorers,
  PenaltyShootout,
  PlayerProfile,
  Team,
} from '../types/tournament';

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

const randomInt = (minimum: number, maximum: number) =>
  Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;

const shuffleArray = <T,>(items: T[]) => {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index);
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
};

const weightedPick = <T,>(choices: Array<{ value: T; weight: number }>) => {
  const totalWeight = choices.reduce((sum, choice) => sum + choice.weight, 0);
  let threshold = Math.random() * totalWeight;

  for (const choice of choices) {
    threshold -= choice.weight;
    if (threshold <= 0) {
      return choice.value;
    }
  }

  return choices[choices.length - 1].value;
};

const sampleBaseGoals = () =>
  weightedPick<number>([
    { value: 0, weight: 25 },
    { value: 1, weight: 30 },
    { value: 2, weight: 24 },
    { value: 3, weight: 12 },
    { value: 4, weight: 6 },
    { value: 5, weight: 3 },
  ]);

const applyRatingBias = (goals: number, ratingDifference: number) => {
  let adjusted = goals;
  const magnitude = Math.abs(ratingDifference);
  const positiveBias = Math.min(0.55, magnitude / 32);
  const negativeBias = Math.min(0.45, magnitude / 34);

  if (ratingDifference >= 8 && Math.random() < positiveBias) {
    adjusted += 1;
  }

  if (ratingDifference >= 15 && Math.random() < 0.18) {
    adjusted += 1;
  }

  if (ratingDifference <= -8 && adjusted > 0 && Math.random() < negativeBias) {
    adjusted -= 1;
  }

  return clamp(adjusted, 0, 5);
};

const generateScoreline = (homeTeam: Team, awayTeam: Team) => {
  const homeGoals = applyRatingBias(sampleBaseGoals(), homeTeam.rating - awayTeam.rating);
  const awayGoals = applyRatingBias(sampleBaseGoals(), awayTeam.rating - homeTeam.rating);

  return {
    homeGoals,
    awayGoals,
  };
};

const playerWeight = (player: PlayerProfile) => {
  switch (player.position) {
    case 'FW':
      return 10;
    case 'MF':
      return 6;
    case 'DF':
      return 3;
    case 'GK':
      return 1;
  }
};

const GOAL_MINUTE_BUCKETS = [
  { start: 4, end: 15, weight: 10 },
  { start: 16, end: 30, weight: 16 },
  { start: 31, end: 45, weight: 15 },
  { start: 46, end: 60, weight: 16 },
  { start: 61, end: 75, weight: 18 },
  { start: 76, end: 90, weight: 20 },
] as const;

const generateMatchGoalMinutes = (goalCount: number) => {
  if (goalCount === 0) {
    return [];
  }

  const uniqueMinutes = new Set<number>();

  while (uniqueMinutes.size < goalCount) {
    const bucket = weightedPick(
      GOAL_MINUTE_BUCKETS.map((entry) => ({
        value: entry,
        weight: entry.weight,
      })),
    );

    uniqueMinutes.add(randomInt(bucket.start, bucket.end));
  }

  return Array.from(uniqueMinutes).sort((left, right) => left - right);
};

const allocateGoalMinutes = (homeGoals: number, awayGoals: number) => {
  const timeline = generateMatchGoalMinutes(homeGoals + awayGoals);
  const sides = shuffleArray([
    ...Array.from({ length: homeGoals }, () => 'home' as const),
    ...Array.from({ length: awayGoals }, () => 'away' as const),
  ]);

  const homeMinutes: number[] = [];
  const awayMinutes: number[] = [];

  timeline.forEach((minute, index) => {
    if (sides[index] === 'home') {
      homeMinutes.push(minute);
      return;
    }

    awayMinutes.push(minute);
  });

  return {
    homeMinutes,
    awayMinutes,
  };
};

const generateScorersForTeam = (team: Team, minutes: number[]) => {
  if (!minutes.length) {
    return [];
  }

  return minutes.map((minute) => {
    const player = weightedPick(
      team.players.map((candidate) => ({
        value: candidate,
        weight: playerWeight(candidate),
      })),
    );

    return {
      minute,
      playerId: player.id,
      playerName: player.name,
      teamId: team.id,
    };
  });
};

const createScorers = (
  homeTeam: Team,
  awayTeam: Team,
  homeGoals: number,
  awayGoals: number,
) => {
  const { homeMinutes, awayMinutes } = allocateGoalMinutes(homeGoals, awayGoals);

  return {
    home: generateScorersForTeam(homeTeam, homeMinutes),
    away: generateScorersForTeam(awayTeam, awayMinutes),
  };
};

export const simulateGroupMatch = (match: GroupMatch, homeTeam: Team, awayTeam: Team): GroupMatch => {
  const { homeGoals, awayGoals } = generateScoreline(homeTeam, awayTeam);

  return {
    ...match,
    homeScore: homeGoals,
    awayScore: awayGoals,
    scorers: createScorers(homeTeam, awayTeam, homeGoals, awayGoals),
    status: 'completed',
    predictedAt: new Date().toISOString(),
  };
};

export const simulateKnockoutRegulation = (
  match: KnockoutMatch,
  homeTeam: Team,
  awayTeam: Team,
): KnockoutMatch => {
  const { homeGoals, awayGoals } = generateScoreline(homeTeam, awayTeam);
  const scorers = createScorers(homeTeam, awayTeam, homeGoals, awayGoals);
  const isDraw = homeGoals === awayGoals;
  const winnerTeamId = isDraw ? null : homeGoals > awayGoals ? homeTeam.id : awayTeam.id;
  const loserTeamId = isDraw ? null : homeGoals > awayGoals ? awayTeam.id : homeTeam.id;

  return {
    ...match,
    homeScore: homeGoals,
    awayScore: awayGoals,
    scorers,
    status: isDraw ? 'awaiting-penalties' : 'completed',
    winnerTeamId,
    loserTeamId,
    predictedAt: new Date().toISOString(),
  };
};

export const simulatePenaltyShootout = (homeTeam: Team, awayTeam: Team): PenaltyShootout => {
  const getKickConversionRate = (team: Team, opponent: Team) =>
    clamp(0.72 + (team.rating - opponent.rating) * 0.006, 0.64, 0.86);

  const hasDecisiveLead = (home: number, away: number, homeKicks: number, awayKicks: number) => {
    const remainingHome = 5 - homeKicks;
    const remainingAway = 5 - awayKicks;

    return home > away + remainingAway || away > home + remainingHome;
  };

  const isAcceptedScoreline = (home: number, away: number) => {
    const winner = Math.max(home, away);
    const loser = Math.min(home, away);

    if (winner === loser) {
      return false;
    }

    if (winner === 3 && loser === 0) {
      return true;
    }

    if (winner === 4 && (loser === 2 || loser === 3)) {
      return true;
    }

    if (winner === 5 && (loser === 3 || loser === 4)) {
      return true;
    }

    return winner >= 6 && winner === loser + 1;
  };

  const simulateSingleShootout = () => {
    let home = 0;
    let away = 0;
    let homeKicks = 0;
    let awayKicks = 0;
    const homeFirst = Math.random() < 0.5;

    const takeKick = (side: 'home' | 'away') => {
      const scored =
        side === 'home'
          ? Math.random() < getKickConversionRate(homeTeam, awayTeam)
          : Math.random() < getKickConversionRate(awayTeam, homeTeam);

      if (side === 'home') {
        homeKicks += 1;
        if (scored) {
          home += 1;
        }
        return;
      }

      awayKicks += 1;
      if (scored) {
        away += 1;
      }
    };

    for (let round = 0; round < 5; round += 1) {
      takeKick(homeFirst ? 'home' : 'away');
      if (hasDecisiveLead(home, away, homeKicks, awayKicks)) {
        return { home, away };
      }

      takeKick(homeFirst ? 'away' : 'home');
      if (hasDecisiveLead(home, away, homeKicks, awayKicks)) {
        return { home, away };
      }
    }

    if (home !== away) {
      return { home, away };
    }

    for (let suddenDeathRound = 0; suddenDeathRound < 5; suddenDeathRound += 1) {
      takeKick(homeFirst ? 'home' : 'away');
      takeKick(homeFirst ? 'away' : 'home');

      if (home !== away) {
        return { home, away };
      }
    }

    return null;
  };

  for (let attempt = 0; attempt < 200; attempt += 1) {
    const result = simulateSingleShootout();

    if (result && isAcceptedScoreline(result.home, result.away)) {
      return result;
    }
  }

  const homeWins = Math.random() < clamp(0.5 + (homeTeam.rating - awayTeam.rating) / 80, 0.35, 0.65);
  const fallback = weightedPick([
    { value: { win: 3, lose: 0 }, weight: 10 },
    { value: { win: 4, lose: 2 }, weight: 24 },
    { value: { win: 4, lose: 3 }, weight: 28 },
    { value: { win: 5, lose: 3 }, weight: 20 },
    { value: { win: 5, lose: 4 }, weight: 30 },
    { value: { win: 6, lose: 5 }, weight: 12 },
    { value: { win: 7, lose: 6 }, weight: 6 },
  ]);

  return homeWins
    ? { home: fallback.win, away: fallback.lose }
    : { home: fallback.lose, away: fallback.win };
};
