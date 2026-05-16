/**
 * CompetitionContext — Provides the active competition's teamsById map.
 *
 * This context decouples components like MatchCard and KnockoutMatchCard
 * from the hard-coded WC26 TEAMS_BY_ID import. Components can read
 * team data from context, or fall back to the WC26 import for backward
 * compatibility.
 */

import { createContext, useContext } from 'react';
import type { Team } from '../types/tournament';
import { TEAMS_BY_ID as WC26_TEAMS_BY_ID } from '../data/tournament';

interface CompetitionContextValue {
  teamsById: Record<string, Team>;
}

const CompetitionContext = createContext<CompetitionContextValue>({
  teamsById: WC26_TEAMS_BY_ID,
});

export const CompetitionProvider = CompetitionContext.Provider;

/**
 * Use the current competition's teamsById.
 * Falls back to WC26 TEAMS_BY_ID if no provider is set.
 */
export const useTeamsById = (): Record<string, Team> => {
  const ctx = useContext(CompetitionContext);
  return ctx.teamsById;
};
