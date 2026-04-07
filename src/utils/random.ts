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

const generateGoalMinutes = (goalCount: number) => {
  const minutes = Array.from({ length: goalCount }, () => {
    const minute = randomInt(4, 88);
    return Math.random() < 0.18 ? minute + 1 : minute;
  });

  return minutes.sort((left, right) => left - right);
};

const generateScorersForTeam = (team: Team, goalCount: number) => {
  if (goalCount === 0) {
    return [];
  }

  const minutes = generateGoalMinutes(goalCount);

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
): MatchScorers => ({
  home: generateScorersForTeam(homeTeam, homeGoals),
  away: generateScorersForTeam(awayTeam, awayGoals),
});

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
  const homeAdvantage = homeTeam.rating - awayTeam.rating;
  const homeWinProb = 0.5 + (homeAdvantage / 40); // Rating diff 8 gives 0.7 win prob
  const homeWins = Math.random() < homeWinProb;

  // Realistic penalty shootout scores for the winner
  const realisticScores = [
    { win: 3, lose: 0, weight: 5 },
    { win: 3, lose: 1, weight: 10 },
    { win: 4, lose: 1, weight: 15 },
    { win: 4, lose: 2, weight: 25 },
    { win: 4, lose: 3, weight: 25 },
    { win: 5, lose: 3, weight: 30 },
    { win: 5, lose: 4, weight: 40 },
    { win: 6, lose: 5, weight: 15 }, // Sudden death
    { win: 7, lose: 6, weight: 5 },
  ];

  const score = weightedPick(realisticScores.map(s => ({ value: s, weight: s.weight })));

  if (homeWins) {
    return { home: score.win, away: score.lose };
  }
  return { home: score.lose, away: score.win };
};
