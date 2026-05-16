/**
 * Competition Registry — central lookup for all available competitions.
 *
 * Each competition provides its CupConfig, teams, and group definitions.
 * The registry pattern allows the app to dynamically load the right
 * configuration based on the route param `:id`.
 */

import type { CupConfig } from '../../types/cupConfig';
import type { Team, GroupMatch, KnockoutMatch, KnockoutRound } from '../../types/tournament';

/**
 * A full competition definition, containing everything needed to
 * run a tournament simulation.
 */
export interface CompetitionDefinition {
  config: CupConfig;
  teams: Team[];
  teamsById: Record<string, Team>;
  groups: Array<{ id: string; label: string; teams: Team[] }>;
  groupIds: string[];
  createInitialGroupMatches: () => GroupMatch[];
  createEmptyKnockoutMatches: () => Record<string, KnockoutMatch[]>;
  knockoutRounds: readonly string[];
  roundLabels: Record<string, string>;
}

/** Global registry map: competitionId → CompetitionDefinition */
const registry = new Map<string, CompetitionDefinition>();

export const registerCompetition = (def: CompetitionDefinition) => {
  registry.set(def.config.id, def);
};

export const getCompetition = (id: string): CompetitionDefinition | undefined => {
  return registry.get(id);
};

export const getAllCompetitions = (): CompetitionDefinition[] => {
  return Array.from(registry.values());
};
