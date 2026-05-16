/**
 * FIFA World Cup 2026 — Team data.
 *
 * Re-exports all WC26-specific team data from the legacy data/tournament module.
 * This wrapper keeps the competition-based architecture consistent while
 * reusing the existing 48-team data without duplication.
 */

export {
  TEAMS as WC26_TEAMS,
  TEAMS_BY_ID as WC26_TEAMS_BY_ID,
  GROUPS as WC26_GROUPS,
} from '../../tournament';

export { GROUP_IDS as WC26_GROUP_IDS } from '../../../types/tournament';
