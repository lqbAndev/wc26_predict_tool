/**
 * useDynamicTournament — A competition-agnostic tournament hook.
 *
 * This hook receives a CompetitionDefinition and manages all state
 * (group matches, knockout bracket, scenario) dynamically based on
 * the competition's CupConfig.
 *
 * For WC26, it delegates to the existing buildKnockoutBracket (FIFA rules).
 * For simpler cups (like Test Cup), it uses buildSimpleKnockoutBracket.
 */

import { startTransition, useEffect, useState } from 'react';
import type { CompetitionDefinition } from '../data/competitions/registry';
import type {
  GroupMatch,
  KnockoutMatch,
  KnockoutRound,
  PersistedTournamentState,
  TeamStanding,
  ThirdPlaceStanding,
  TournamentCoreState,
  TournamentDerivedState,
  TournamentScenario,
  KnockoutSeeds,
} from '../types/tournament';
import { simulateGroupMatch, simulateKnockoutRegulation, simulatePenaltyShootout } from '../utils/random';
import { computeMatchMOTM, buildSeasonMOTM } from '../utils/motm';
import { buildTopScorers } from '../utils/topScorers';
import { rankQualifiedTeams } from '../utils/groupStage';
import { advanceWinnerToNextRound, buildKnockoutBracket, buildKnockoutTeamOrigins } from '../utils/knockout';
import { buildSimpleKnockoutBracket } from '../data/competitions/dynamicEngine';

/* ──────────────────────────────────────────────
 *  Storage helpers (per-competition)
 * ────────────────────────────────────────────── */

const STORAGE_VERSION = 2;

const readPersistedState = (storageKey: string): PersistedTournamentState | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedTournamentState;
    if (parsed.version !== STORAGE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writePersistedState = (storageKey: string, payload: PersistedTournamentState) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey, JSON.stringify(payload));
};

const clearPersistedState = (storageKey: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(storageKey);
};

/* ──────────────────────────────────────────────
 *  Group stage computations (generic)
 * ────────────────────────────────────────────── */

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

const computeStandingsByGroupGeneric = (
  matches: GroupMatch[],
  groups: Array<{ id: string; teams: { id: string; name: string; group: any }[] }>,
): Record<string, TeamStanding[]> => {
  const result: Record<string, TeamStanding[]> = {};

  for (const group of groups) {
    const rows: Record<string, TeamStanding> = {};

    for (const team of group.teams) {
      rows[team.id] = {
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
    }

    const groupMatches = matches.filter((m) => m.group === group.id && m.status === 'completed');

    for (const match of groupMatches) {
      if (match.homeScore === null || match.awayScore === null) continue;

      const homeRow = rows[match.homeTeamId];
      const awayRow = rows[match.awayTeamId];
      if (!homeRow || !awayRow) continue;

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

    result[group.id] = Object.values(rows)
      .map((row) => ({ ...row, goalDifference: row.goalsFor - row.goalsAgainst }))
      .sort(standingSorter)
      .map((row, idx) => ({ ...row, rank: idx + 1 }));
  }

  return result;
};

const computeThirdPlaceTableGeneric = (
  standingsByGroup: Record<string, TeamStanding[]>,
  groupIds: string[],
  groupStageComplete: boolean,
  bestThirdsToAdvance: number,
): ThirdPlaceStanding[] => {
  if (bestThirdsToAdvance === 0) return [];

  return groupIds
    .map((gid) => standingsByGroup[gid]?.[2])
    .filter(Boolean)
    .sort(thirdPlaceSorter)
    .map((row, idx) => ({
      ...row,
      position: idx + 1,
      qualifies: idx < bestThirdsToAdvance,
      status: groupStageComplete
        ? (idx < bestThirdsToAdvance ? 'qualified' : 'eliminated')
        : 'provisional',
    })) as ThirdPlaceStanding[];
};

/* ──────────────────────────────────────────────
 *  The Hook
 * ────────────────────────────────────────────── */

export const useDynamicTournament = (competition: CompetitionDefinition) => {
  const { config, teams, teamsById, groups, groupIds } = competition;

  const createInitialCoreState = (): TournamentCoreState => ({
    groupMatches: competition.createInitialGroupMatches(),
    knockoutVisible: false,
    knockoutMatches: competition.createEmptyKnockoutMatches() as Record<KnockoutRound, KnockoutMatch[]>,
    scenario: 'standard',
  });

  const getInitialCoreState = (): TournamentCoreState => {
    const persisted = readPersistedState(config.storageKey);
    if (!persisted?.core) return createInitialCoreState();
    return { ...persisted.core, scenario: persisted.core.scenario ?? 'standard' };
  };

  const [coreState, setCoreState] = useState<TournamentCoreState>(() => getInitialCoreState());

  // Derive state
  const standingsByGroup = computeStandingsByGroupGeneric(coreState.groupMatches, groups);
  const groupStageComplete = coreState.groupMatches.every((m) => m.status === 'completed');
  const thirdPlaceTable = computeThirdPlaceTableGeneric(
    standingsByGroup,
    groupIds,
    groupStageComplete,
    config.bestThirdsToAdvance,
  );

  // Build knockout seeds
  const groupWinners = rankQualifiedTeams(
    groupIds.map((gid) => standingsByGroup[gid]?.[0]).filter(Boolean) as TeamStanding[],
  );
  const groupRunnersUp = rankQualifiedTeams(
    groupIds.map((gid) => standingsByGroup[gid]?.[1]).filter(Boolean) as TeamStanding[],
  );
  const bestThirds = thirdPlaceTable.slice(0, config.bestThirdsToAdvance);

  const knockoutSeeds: KnockoutSeeds = { groupWinners, groupRunnersUp, bestThirds };

  const knockoutReady =
    groupStageComplete &&
    groupWinners.length === config.groupsCount &&
    groupRunnersUp.length === config.groupsCount &&
    bestThirds.length === config.bestThirdsToAdvance;

  const knockoutTeamOrigins = knockoutReady ? buildKnockoutTeamOrigins(knockoutSeeds) : {};
  const qualifiedTeamIds = knockoutReady
    ? [
        ...groupIds.flatMap((gid) => standingsByGroup[gid].slice(0, config.advancePerGroup)),
        ...bestThirds,
      ].map((t) => t.teamId)
    : [];

  const topScorers = buildTopScorers(coreState.groupMatches, coreState.knockoutMatches);
  const seasonMOTM = buildSeasonMOTM(coreState.groupMatches, coreState.knockoutMatches);
  const championTeamId = coreState.knockoutMatches.final?.[0]?.winnerTeamId ?? null;
  const championName = championTeamId ? (teamsById[championTeamId]?.name ?? null) : null;

  const derivedState: TournamentDerivedState = {
    standingsByGroup: standingsByGroup as any,
    thirdPlaceTable,
    topScorers,
    seasonMOTM,
    qualifiedTeamIds,
    groupStageComplete,
    knockoutReady,
    knockoutSeeds,
    knockoutTeamOrigins,
    championTeamId,
    championName,
  };

  // Persist state
  useEffect(() => {
    const payload: PersistedTournamentState = {
      version: STORAGE_VERSION,
      core: coreState,
      derived: {
        standingsByGroup: derivedState.standingsByGroup,
        thirdPlaceTable: derivedState.thirdPlaceTable,
        topScorers: derivedState.topScorers,
        seasonMOTM: derivedState.seasonMOTM,
        qualifiedTeamIds: derivedState.qualifiedTeamIds,
        groupStageComplete: derivedState.groupStageComplete,
        knockoutReady: derivedState.knockoutReady,
        knockoutTeamOrigins: derivedState.knockoutTeamOrigins,
        championTeamId: derivedState.championTeamId,
        championName: derivedState.championName,
      },
      updatedAt: new Date().toISOString(),
    };
    writePersistedState(config.storageKey, payload);
  }, [coreState, derivedState, config.storageKey]);

  // Actions
  const predictGroupMatch = (matchId: string) => {
    setCoreState((prev) => ({
      ...prev,
      groupMatches: prev.groupMatches.map((match) => {
        if (match.id !== matchId || match.status === 'completed') return match;
        return simulateGroupMatch(
          match,
          teamsById[match.homeTeamId],
          teamsById[match.awayTeamId],
          prev.scenario ?? 'standard',
        );
      }),
    }));
  };

  const hasInitializedKnockout = (state: TournamentCoreState) =>
    Object.values(state.knockoutMatches).some((matches) =>
      (matches as KnockoutMatch[]).some(
        (m) => m.homeTeamId !== null || m.awayTeamId !== null || m.status !== 'pending' || m.winnerTeamId !== null,
      ),
    );

  const openKnockoutStage = () => {
    startTransition(() => {
      setCoreState((prev) => {
        if (!knockoutReady) return prev;

        let knockoutMatches: Record<string, KnockoutMatch[]>;

        if (hasInitializedKnockout(prev)) {
          knockoutMatches = prev.knockoutMatches;
        } else if (config.bestThirdsToAdvance === 0) {
          // Simple tournament — use cross-group pairing
          knockoutMatches = buildSimpleKnockoutBracket(
            config,
            standingsByGroup,
            competition.createEmptyKnockoutMatches(),
          );
        } else {
          // Complex tournament (WC26) — delegate to legacy buildKnockoutBracket
          knockoutMatches = buildKnockoutBracket(knockoutSeeds, standingsByGroup);
        }

        return {
          ...prev,
          knockoutVisible: true,
          knockoutMatches: knockoutMatches as Record<KnockoutRound, KnockoutMatch[]>,
        };
      });
    });
  };

  const predictKnockoutMatch = (round: KnockoutRound, matchId: string) => {
    setCoreState((prev) => {
      const roundMatches = prev.knockoutMatches[round];
      if (!roundMatches) return prev;

      const target = roundMatches.find((m) => m.id === matchId);
      if (!target || target.status !== 'pending' || !target.homeTeamId || !target.awayTeamId) return prev;

      const updated = simulateKnockoutRegulation(
        target,
        teamsById[target.homeTeamId],
        teamsById[target.awayTeamId],
        'standard',
      );

      let nextKnockout: TournamentCoreState['knockoutMatches'] = {
        ...prev.knockoutMatches,
        [round]: roundMatches.map((m) => (m.id === matchId ? updated : m)),
      };

      if (updated.status === 'completed' && updated.winnerTeamId) {
        nextKnockout = advanceWinnerToNextRound(
          nextKnockout,
          round,
          updated.slot,
          updated.winnerTeamId,
          updated.loserTeamId,
        );
      }

      return { ...prev, knockoutMatches: nextKnockout };
    });
  };

  const resolvePenalty = (round: KnockoutRound, matchId: string) => {
    setCoreState((prev) => {
      const roundMatches = prev.knockoutMatches[round];
      if (!roundMatches) return prev;

      const target = roundMatches.find((m) => m.id === matchId);
      if (!target || target.status !== 'awaiting-penalties' || !target.homeTeamId || !target.awayTeamId) return prev;

      const penaltyResult = simulatePenaltyShootout(teamsById[target.homeTeamId], teamsById[target.awayTeamId]);
      const penalty = { home: penaltyResult.home, away: penaltyResult.away };
      const winnerTeamId = penalty.home > penalty.away ? target.homeTeamId : target.awayTeamId;
      const loserTeamId = winnerTeamId === target.homeTeamId ? target.awayTeamId : target.homeTeamId;

      const completedMatch: KnockoutMatch = {
        ...target,
        penalty,
        penaltyTimeline: penaltyResult.timeline,
        motm: null,
        status: 'completed' as const,
        winnerTeamId,
        loserTeamId,
      };
      const updatedMatch: KnockoutMatch = {
        ...completedMatch,
        motm: computeMatchMOTM(completedMatch),
      };

      let nextKnockout: TournamentCoreState['knockoutMatches'] = {
        ...prev.knockoutMatches,
        [round]: roundMatches.map((m) => (m.id === matchId ? updatedMatch : m)),
      };

      nextKnockout = advanceWinnerToNextRound(nextKnockout, round, updatedMatch.slot, winnerTeamId, loserTeamId);

      return { ...prev, knockoutMatches: nextKnockout };
    });
  };

  const resetTournament = () => {
    clearPersistedState(config.storageKey);
    startTransition(() => {
      setCoreState(createInitialCoreState());
    });
  };

  const setScenario = (scenario: TournamentScenario) => {
    setCoreState((prev) => ({ ...prev, scenario }));
  };

  return {
    config,
    competition,
    teams,
    teamsById,
    groups,
    coreState,
    derivedState,
    predictGroupMatch,
    openKnockoutStage,
    predictKnockoutMatch,
    resolvePenalty,
    resetTournament,
    setScenario,
  };
};
