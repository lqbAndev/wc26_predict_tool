import type { CupConfig } from '../../../types/cupConfig';

/**
 * FIFA World Cup 2026 — Official configuration.
 *
 * 48 teams · 12 groups of 4 · top 2 per group + 8 best 3rds = 32 advancing.
 */
export const wc26Config: CupConfig = {
  id: 'wc26',
  name: 'FIFA World Cup 2026',
  teams: 48,
  groupsCount: 12,
  teamsPerGroup: 4,
  advancePerGroup: 2,
  bestThirdsToAdvance: 8,
  storageKey: 'wc26-prediction-tool:v2',
};
