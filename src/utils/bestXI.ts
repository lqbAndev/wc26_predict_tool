import { TEAMS } from '../data/tournament';
import type {
  GroupMatch,
  KnockoutMatch,
  KnockoutRound,
  Team,
  TimelineEvent,
} from '../types/tournament';

type BestXILineupPosition = 'GK' | 'DEF' | 'MID' | 'ATT';

export interface BestXIPlayer {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  naturalPosition: BestXILineupPosition;
  lineupPosition: BestXILineupPosition;
  goals: number;
  cleanSheets: number;
  motmCount: number;
  totalScore: number;
  knockoutImpact: number;
  semiFinalImpact: number;
}

export interface BestXIResult {
  goalkeeper: BestXIPlayer;
  defenders: BestXIPlayer[];
  midfielders: BestXIPlayer[];
  attackers: BestXIPlayer[];
  bestPlayer: BestXIPlayer;
}

interface MutableBestXIPlayer extends BestXIPlayer {}

const roundHasSemiFinalBonus = (round: KnockoutRound) => round === 'semifinals' || round === 'final';

const mapPositionToLineup = (position: Team['players'][number]['position']): BestXILineupPosition => {
  if (position === 'GK') {
    return 'GK';
  }

  if (position === 'DF') {
    return 'DEF';
  }

  if (position === 'MF') {
    return 'MID';
  }

  return 'ATT';
};

const comparePlayers = (left: MutableBestXIPlayer, right: MutableBestXIPlayer) => {
  if (right.totalScore !== left.totalScore) {
    return right.totalScore - left.totalScore;
  }

  if (right.goals !== left.goals) {
    return right.goals - left.goals;
  }

  if (right.motmCount !== left.motmCount) {
    return right.motmCount - left.motmCount;
  }

  return left.playerName.localeCompare(right.playerName);
};

const resolveTimeline = (match: GroupMatch | KnockoutMatch): TimelineEvent[] => {
  if (match.timeline?.length) {
    return match.timeline;
  }

  const fallbackTimeline: TimelineEvent[] = [];

  if (match.scorers?.home.length) {
    for (const event of match.scorers.home) {
      const resolvedTeamId = event.teamId || match.homeTeamId;
      if (!resolvedTeamId) {
        continue;
      }

      fallbackTimeline.push({
        sortMinute: event.minute,
        displayMinute: `${event.minute}'`,
        playerName: event.playerName,
        playerId: event.playerId,
        teamId: resolvedTeamId,
        side: 'home',
        isPenalty: false,
        phase: 'regulation',
      });
    }
  }

  if (match.scorers?.away.length) {
    for (const event of match.scorers.away) {
      const resolvedTeamId = event.teamId || match.awayTeamId;
      if (!resolvedTeamId) {
        continue;
      }

      fallbackTimeline.push({
        sortMinute: event.minute,
        displayMinute: `${event.minute}'`,
        playerName: event.playerName,
        playerId: event.playerId,
        teamId: resolvedTeamId,
        side: 'away',
        isPenalty: false,
        phase: 'regulation',
      });
    }
  }

  return fallbackTimeline;
};

const buildPlayerRegistry = () => {
  const registry = new Map<string, MutableBestXIPlayer>();
  const teamByName = new Map<string, Team>();

  for (const team of TEAMS) {
    teamByName.set(team.name, team);

    for (const player of team.players) {
      const key = `${team.id}:${player.id}`;
      registry.set(key, {
        playerId: player.id,
        playerName: player.name,
        teamId: team.id,
        teamName: team.name,
        naturalPosition: mapPositionToLineup(player.position),
        lineupPosition: mapPositionToLineup(player.position),
        goals: 0,
        cleanSheets: 0,
        motmCount: 0,
        totalScore: 0,
        knockoutImpact: 0,
        semiFinalImpact: 0,
      });
    }
  }

  return {
    registry,
    teamByName,
  };
};

const applyGoalScore = (
  player: MutableBestXIPlayer,
  isKnockout: boolean,
  hasSemiFinalBonus: boolean,
) => {
  player.goals += 1;
  player.totalScore += 2;

  if (isKnockout) {
    player.knockoutImpact += 1;
    player.totalScore += 1;
  }

  if (hasSemiFinalBonus) {
    player.semiFinalImpact += 1;
    player.totalScore += 2;
  }
};

const applyMotmScore = (
  player: MutableBestXIPlayer,
  isKnockout: boolean,
  hasSemiFinalBonus: boolean,
) => {
  player.motmCount += 1;
  player.totalScore += 3;

  if (isKnockout) {
    player.knockoutImpact += 1;
    player.totalScore += 1;
  }

  if (hasSemiFinalBonus) {
    player.semiFinalImpact += 1;
    player.totalScore += 2;
  }
};

const selectByPosition = (
  sortedPool: MutableBestXIPlayer[],
  selectedIds: Set<string>,
  position: BestXILineupPosition,
  count: number,
) => {
  const selected: BestXIPlayer[] = [];

  for (const candidate of sortedPool) {
    if (selected.length >= count) {
      break;
    }
    if (selectedIds.has(candidate.playerId) || candidate.naturalPosition !== position) {
      continue;
    }

    selectedIds.add(candidate.playerId);
    selected.push({
      ...candidate,
      lineupPosition: position,
    });
  }

  if (selected.length < count) {
    for (const candidate of sortedPool) {
      if (selected.length >= count) {
        break;
      }
      if (selectedIds.has(candidate.playerId)) {
        continue;
      }

      selectedIds.add(candidate.playerId);
      selected.push({
        ...candidate,
        lineupPosition: position,
      });
    }
  }

  return selected;
};

export const buildBestXI = (
  groupMatches: GroupMatch[],
  knockoutMatches: Record<KnockoutRound, KnockoutMatch[]>,
) => {
  const { registry, teamByName } = buildPlayerRegistry();

  const processMatch = (match: GroupMatch | KnockoutMatch, round: KnockoutRound | null) => {
    if (match.status !== 'completed') {
      return;
    }

    const isKnockout = round !== null;
    const hasSemiFinalBonus = isKnockout && roundHasSemiFinalBonus(round);
    const timeline = resolveTimeline(match);

    for (const event of timeline) {
      if (!event.teamId) {
        continue;
      }

      const key = `${event.teamId}:${event.playerId}`;
      const player = registry.get(key);
      if (!player) {
        continue;
      }

      applyGoalScore(player, isKnockout, hasSemiFinalBonus);
    }

    // Process clean sheets
    if (match.homeScore === 0) {
      const awayTeam = teamByName.get(match.awayTeamId ? TEAMS.find(t => t.id === match.awayTeamId)?.name ?? '' : '');
      if (awayTeam) {
        for (const p of awayTeam.players) {
          if (p.position === 'GK') {
            const player = registry.get(`${awayTeam.id}:${p.id}`);
            if (player) player.cleanSheets += 1;
          }
        }
      }
    }
    if (match.awayScore === 0) {
      const homeTeam = teamByName.get(match.homeTeamId ? TEAMS.find(t => t.id === match.homeTeamId)?.name ?? '' : '');
      if (homeTeam) {
        for (const p of homeTeam.players) {
          if (p.position === 'GK') {
            const player = registry.get(`${homeTeam.id}:${p.id}`);
            if (player) player.cleanSheets += 1;
          }
        }
      }
    }


    if (match.motm) {
      const motmTeam = teamByName.get(match.motm.teamName);
      if (motmTeam) {
        const motmPlayer = motmTeam.players.find((player) => player.name === match.motm?.playerName);
        if (motmPlayer) {
          const key = `${motmTeam.id}:${motmPlayer.id}`;
          const player = registry.get(key);
          if (player) {
            applyMotmScore(player, isKnockout, hasSemiFinalBonus);
          }
        }
      }
    }
  };

  for (const match of groupMatches) {
    processMatch(match, null);
  }

  for (const [round, matches] of Object.entries(knockoutMatches) as [KnockoutRound, KnockoutMatch[]][]) {
    for (const match of matches) {
      processMatch(match, round);
    }
  }

  const sortedPool = Array.from(registry.values()).sort(comparePlayers);
  if (!sortedPool.length) {
    return null;
  }

  const selectedIds = new Set<string>();
  const [goalkeeper] = selectByPosition(sortedPool, selectedIds, 'GK', 1);
  const defenders = selectByPosition(sortedPool, selectedIds, 'DEF', 4);
  const midfielders = selectByPosition(sortedPool, selectedIds, 'MID', 3);
  const attackers = selectByPosition(sortedPool, selectedIds, 'ATT', 3);

  if (!goalkeeper || defenders.length !== 4 || midfielders.length !== 3 || attackers.length !== 3) {
    return null;
  }

  const fullXI = [goalkeeper, ...defenders, ...midfielders, ...attackers].sort(comparePlayers);
  const bestPlayer = fullXI[0];

  return {
    goalkeeper,
    defenders,
    midfielders,
    attackers,
    bestPlayer,
  } satisfies BestXIResult;
};
