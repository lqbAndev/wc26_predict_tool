import { startTransition, useEffect, useState } from 'react';
import {
  TEAMS_BY_ID,
  createInitialTournamentCoreState,
  normalizeKnockoutMatches,
} from '../data/tournament';
import type {
  KnockoutRound,
  PersistedTournamentState,
  TournamentCoreState,
  TournamentDerivedState,
} from '../types/tournament';
import {
  STORAGE_VERSION,
  clearPersistedTournament,
  readPersistedTournament,
  writePersistedTournament,
} from '../utils/storage';
import {
  computeStandingsByGroup,
  computeThirdPlaceTable,
  findChampionName,
  getQualifiedTeamIds,
  isGroupStageComplete,
} from '../utils/groupStage';
import {
  advanceWinnerToNextRound,
  buildKnockoutBracket,
  buildKnockoutSeeds,
  buildKnockoutTeamOrigins,
} from '../utils/knockout';
import { simulateGroupMatch, simulateKnockoutRegulation, simulatePenaltyShootout } from '../utils/random';
import { buildTopScorers } from '../utils/topScorers';

const deriveTournamentState = (core: TournamentCoreState): TournamentDerivedState => {
  const standingsByGroup = computeStandingsByGroup(core.groupMatches);
  const groupStageComplete = isGroupStageComplete(core.groupMatches);
  const thirdPlaceTable = computeThirdPlaceTable(standingsByGroup, groupStageComplete);
  const knockoutSeeds = buildKnockoutSeeds(standingsByGroup, thirdPlaceTable);
  const knockoutReady =
    groupStageComplete &&
    knockoutSeeds.groupWinners.length === 12 &&
    knockoutSeeds.groupRunnersUp.length === 12 &&
    knockoutSeeds.bestThirds.length === 8;
  const knockoutTeamOrigins = knockoutReady ? buildKnockoutTeamOrigins(knockoutSeeds) : {};
  const qualifiedTeamIds = knockoutReady ? getQualifiedTeamIds(standingsByGroup, thirdPlaceTable) : [];
  const topScorers = buildTopScorers(core.groupMatches, core.knockoutMatches);
  const championTeamId = core.knockoutMatches.final[0]?.winnerTeamId ?? null;

  return {
    standingsByGroup,
    thirdPlaceTable,
    topScorers,
    qualifiedTeamIds,
    groupStageComplete,
    knockoutReady,
    knockoutSeeds,
    knockoutTeamOrigins,
    championTeamId,
    championName: findChampionName(championTeamId),
  };
};

const normalizeCoreState = (state: TournamentCoreState): TournamentCoreState => ({
  ...state,
  knockoutMatches: normalizeKnockoutMatches(state.knockoutMatches),
});

const getInitialCoreState = (): TournamentCoreState => {
  const persisted = readPersistedTournament();

  if (!persisted?.core) {
    return createInitialTournamentCoreState();
  }

  return normalizeCoreState(persisted.core);
};

const hasInitializedKnockout = (state: TournamentCoreState) =>
  Object.values(state.knockoutMatches).some((matches) =>
    matches.some(
      (match) =>
        match.homeTeamId !== null ||
        match.awayTeamId !== null ||
        match.status !== 'pending' ||
        match.winnerTeamId !== null,
    ),
  );

export const useTournament = () => {
  const [coreState, setCoreState] = useState<TournamentCoreState>(() => getInitialCoreState());
  const derivedState = deriveTournamentState(coreState);

  useEffect(() => {
    const payload: PersistedTournamentState = {
      version: STORAGE_VERSION,
      core: coreState,
      derived: {
        standingsByGroup: derivedState.standingsByGroup,
        thirdPlaceTable: derivedState.thirdPlaceTable,
        topScorers: derivedState.topScorers,
        qualifiedTeamIds: derivedState.qualifiedTeamIds,
        groupStageComplete: derivedState.groupStageComplete,
        knockoutReady: derivedState.knockoutReady,
        knockoutTeamOrigins: derivedState.knockoutTeamOrigins,
        championTeamId: derivedState.championTeamId,
        championName: derivedState.championName,
      },
      updatedAt: new Date().toISOString(),
    };

    writePersistedTournament(payload);
  }, [coreState, derivedState]);

  const predictGroupMatch = (matchId: string) => {
    setCoreState((currentState) => ({
      ...currentState,
      groupMatches: currentState.groupMatches.map((match) => {
        if (match.id !== matchId || match.status === 'completed') {
          return match;
        }

        return simulateGroupMatch(match, TEAMS_BY_ID[match.homeTeamId], TEAMS_BY_ID[match.awayTeamId]);
      }),
    }));
  };

  const openKnockoutStage = () => {
    startTransition(() => {
      setCoreState((currentState) => {
        const normalizedState = normalizeCoreState(currentState);
        const currentDerivedState = deriveTournamentState(normalizedState);

        if (!currentDerivedState.knockoutReady) {
          return normalizedState;
        }

        const knockoutMatches = hasInitializedKnockout(normalizedState)
          ? normalizedState.knockoutMatches
          : buildKnockoutBracket(currentDerivedState.knockoutSeeds);

        return {
          ...normalizedState,
          knockoutVisible: true,
          knockoutMatches,
        };
      });
    });
  };

  const predictKnockoutMatch = (round: KnockoutRound, matchId: string) => {
    setCoreState((currentState) => {
      const roundMatches = currentState.knockoutMatches[round];
      const targetMatch = roundMatches.find((match) => match.id === matchId);

      if (
        !targetMatch ||
        targetMatch.status !== 'pending' ||
        !targetMatch.homeTeamId ||
        !targetMatch.awayTeamId
      ) {
        return currentState;
      }

      const updatedMatch = simulateKnockoutRegulation(
        targetMatch,
        TEAMS_BY_ID[targetMatch.homeTeamId],
        TEAMS_BY_ID[targetMatch.awayTeamId],
      );

      let nextKnockoutState: TournamentCoreState['knockoutMatches'] = {
        ...currentState.knockoutMatches,
        [round]: roundMatches.map((match) => (match.id === matchId ? updatedMatch : match)),
      };

      if (updatedMatch.status === 'completed' && updatedMatch.winnerTeamId) {
        nextKnockoutState = advanceWinnerToNextRound(
          nextKnockoutState,
          round,
          updatedMatch.slot,
          updatedMatch.winnerTeamId,
          updatedMatch.loserTeamId,
        );
      }

      return {
        ...currentState,
        knockoutMatches: nextKnockoutState,
      };
    });
  };

  const resolvePenalty = (round: KnockoutRound, matchId: string) => {
    setCoreState((currentState) => {
      const roundMatches = currentState.knockoutMatches[round];
      const targetMatch = roundMatches.find((match) => match.id === matchId);

      if (
        !targetMatch ||
        targetMatch.status !== 'awaiting-penalties' ||
        !targetMatch.homeTeamId ||
        !targetMatch.awayTeamId
      ) {
        return currentState;
      }

      const penalty = simulatePenaltyShootout(
        TEAMS_BY_ID[targetMatch.homeTeamId],
        TEAMS_BY_ID[targetMatch.awayTeamId],
      );
      const winnerTeamId = penalty.home > penalty.away ? targetMatch.homeTeamId : targetMatch.awayTeamId;
      const loserTeamId = winnerTeamId === targetMatch.homeTeamId ? targetMatch.awayTeamId : targetMatch.homeTeamId;
      const updatedMatch = {
        ...targetMatch,
        penalty,
        status: 'completed' as const,
        winnerTeamId,
        loserTeamId,
      };

      let nextKnockoutState: TournamentCoreState['knockoutMatches'] = {
        ...currentState.knockoutMatches,
        [round]: roundMatches.map((match) => (match.id === matchId ? updatedMatch : match)),
      };

      nextKnockoutState = advanceWinnerToNextRound(
        nextKnockoutState,
        round,
        updatedMatch.slot,
        updatedMatch.winnerTeamId,
        updatedMatch.loserTeamId,
      );

      return {
        ...currentState,
        knockoutMatches: nextKnockoutState,
      };
    });
  };

  const resetTournament = () => {
    clearPersistedTournament();
    startTransition(() => {
      setCoreState(createInitialTournamentCoreState());
    });
  };

  return {
    coreState,
    derivedState,
    predictGroupMatch,
    openKnockoutStage,
    predictKnockoutMatch,
    resolvePenalty,
    resetTournament,
  };
};
