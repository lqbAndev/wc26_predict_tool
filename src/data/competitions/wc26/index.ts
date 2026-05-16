/**
 * FIFA World Cup 2026 — Competition module entry point.
 *
 * Registers the WC26 competition into the global registry.
 * The main tournament data (teams, groups, matches) continues to live
 * in `src/data/tournament.ts` for backward compatibility — this module
 * bridges the legacy code into the new competition architecture.
 */

import { registerCompetition } from '../registry';
import type { CompetitionDefinition } from '../registry';
import { wc26Config } from './config';
import { WC26_TEAMS, WC26_TEAMS_BY_ID, WC26_GROUPS, WC26_GROUP_IDS } from './teams';
import {
  createInitialGroupMatches,
  createEmptyKnockoutMatches,
  ROUND_LABELS,
} from '../../tournament';
import { KNOCKOUT_ROUNDS } from '../../../types/tournament';

const wc26Definition: CompetitionDefinition = {
  config: wc26Config,
  teams: WC26_TEAMS,
  teamsById: WC26_TEAMS_BY_ID,
  groups: WC26_GROUPS,
  groupIds: [...WC26_GROUP_IDS],
  createInitialGroupMatches,
  createEmptyKnockoutMatches,
  knockoutRounds: KNOCKOUT_ROUNDS,
  roundLabels: ROUND_LABELS,
};

registerCompetition(wc26Definition);

export { wc26Config } from './config';
export { wc26Definition };
