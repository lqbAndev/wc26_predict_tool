/**
 * Test League — League competition module entry point.
 *
 * Registers the Test League (8 teams, 14 rounds) into the competition registry.
 * This is a dev-only feature for testing the league engine.
 *
 * NOTE: For local testing only — not deployed to production.
 */

import { testLeagueConfig } from './config';
import { TEST_LEAGUE_TEAMS, TEST_LEAGUE_TEAMS_BY_ID } from './teams';

export { testLeagueConfig, TEST_LEAGUE_TEAMS, TEST_LEAGUE_TEAMS_BY_ID };
