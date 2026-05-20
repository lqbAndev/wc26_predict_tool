/**
 * Test League Configuration — Dev-only league for testing Round-Robin engine.
 *
 * 8 teams, 14 rounds (7 home + 7 away), home advantage enabled.
 */

import type { LeagueConfig } from '../../../types/leagueConfig';

export const testLeagueConfig: LeagueConfig = {
  id: 'test-league',
  name: 'Vibe Test League',
  type: 'league',
  teams: 8,
  rounds: 14, // 7 home + 7 away
  homeAdvantage: true,
  qualificationZones: [
    {
      id: 'champions-league',
      label: 'Champions League',
      startPosition: 1,
      endPosition: 2,
      color: '#10b981', // Green
    },
    {
      id: 'europa-league',
      label: 'Europa League',
      startPosition: 3,
      endPosition: 4,
      color: '#3b82f6', // Blue
    },
    {
      id: 'relegation',
      label: 'Relegation Zone',
      startPosition: 7,
      endPosition: 8,
      color: '#ef4444', // Red
    },
  ],
  storageKey: 'vibe-test-league-state',
};
