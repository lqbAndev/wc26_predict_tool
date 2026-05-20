/**
 * Test League Teams — 8 fictional teams for league engine testing.
 *
 * Each team has 5 players with simple names and balanced ratings (75-85).
 * This is a dev-only dataset for verifying league logic.
 */

import type { Team } from '../../../types/tournament';

export const TEST_LEAGUE_TEAMS: Team[] = [
  {
    id: 'team-alpha',
    name: 'Team Alpha',
    shortName: 'ALP',
    group: 'A', // Not used in league, but required by Team type
    rating: 85,
    players: [
      { id: 'alpha-gk1', name: 'Alex Stone', position: 'GK' },
      { id: 'alpha-df1', name: 'Ben Carter', position: 'DF' },
      { id: 'alpha-mf1', name: 'Chris Morgan', position: 'MF' },
      { id: 'alpha-mf2', name: 'David Lee', position: 'MF' },
      { id: 'alpha-fw1', name: 'Ethan Blake', position: 'FW' },
    ],
  },
  {
    id: 'team-beta',
    name: 'Team Beta',
    shortName: 'BET',
    group: 'A',
    rating: 82,
    players: [
      { id: 'beta-gk1', name: 'Felix Grant', position: 'GK' },
      { id: 'beta-df1', name: 'George Hall', position: 'DF' },
      { id: 'beta-mf1', name: 'Henry Ross', position: 'MF' },
      { id: 'beta-mf2', name: 'Ian Price', position: 'MF' },
      { id: 'beta-fw1', name: 'Jack Turner', position: 'FW' },
    ],
  },
  {
    id: 'team-gamma',
    name: 'Team Gamma',
    shortName: 'GAM',
    group: 'A',
    rating: 80,
    players: [
      { id: 'gamma-gk1', name: 'Kyle Ward', position: 'GK' },
      { id: 'gamma-df1', name: 'Liam Scott', position: 'DF' },
      { id: 'gamma-mf1', name: 'Mason Reed', position: 'MF' },
      { id: 'gamma-mf2', name: 'Noah Bell', position: 'MF' },
      { id: 'gamma-fw1', name: 'Owen Fox', position: 'FW' },
    ],
  },
  {
    id: 'team-delta',
    name: 'Team Delta',
    shortName: 'DEL',
    group: 'A',
    rating: 79,
    players: [
      { id: 'delta-gk1', name: 'Paul Gray', position: 'GK' },
      { id: 'delta-df1', name: 'Quinn Hunt', position: 'DF' },
      { id: 'delta-mf1', name: 'Ryan Cole', position: 'MF' },
      { id: 'delta-mf2', name: 'Sam West', position: 'MF' },
      { id: 'delta-fw1', name: 'Tom Nash', position: 'FW' },
    ],
  },
  {
    id: 'team-epsilon',
    name: 'Team Epsilon',
    shortName: 'EPS',
    group: 'A',
    rating: 77,
    players: [
      { id: 'epsilon-gk1', name: 'Umar Khan', position: 'GK' },
      { id: 'epsilon-df1', name: 'Victor Lane', position: 'DF' },
      { id: 'epsilon-mf1', name: 'Will Hart', position: 'MF' },
      { id: 'epsilon-mf2', name: 'Xander Cruz', position: 'MF' },
      { id: 'epsilon-fw1', name: 'Yuri Novak', position: 'FW' },
    ],
  },
  {
    id: 'team-zeta',
    name: 'Team Zeta',
    shortName: 'ZET',
    group: 'A',
    rating: 76,
    players: [
      { id: 'zeta-gk1', name: 'Zane Park', position: 'GK' },
      { id: 'zeta-df1', name: 'Adam Ford', position: 'DF' },
      { id: 'zeta-mf1', name: 'Blake King', position: 'MF' },
      { id: 'zeta-mf2', name: 'Cody Mills', position: 'MF' },
      { id: 'zeta-fw1', name: 'Dean Shaw', position: 'FW' },
    ],
  },
  {
    id: 'team-eta',
    name: 'Team Eta',
    shortName: 'ETA',
    group: 'A',
    rating: 75,
    players: [
      { id: 'eta-gk1', name: 'Evan Boyd', position: 'GK' },
      { id: 'eta-df1', name: 'Finn Webb', position: 'DF' },
      { id: 'eta-mf1', name: 'Gage Dunn', position: 'MF' },
      { id: 'eta-mf2', name: 'Hugo Vega', position: 'MF' },
      { id: 'eta-fw1', name: 'Ivan Moss', position: 'FW' },
    ],
  },
  {
    id: 'team-theta',
    name: 'Team Theta',
    shortName: 'THE',
    group: 'A',
    rating: 75,
    players: [
      { id: 'theta-gk1', name: 'Jake Holt', position: 'GK' },
      { id: 'theta-df1', name: 'Kurt Wade', position: 'DF' },
      { id: 'theta-mf1', name: 'Luke Tate', position: 'MF' },
      { id: 'theta-mf2', name: 'Mark Flynn', position: 'MF' },
      { id: 'theta-fw1', name: 'Nate York', position: 'FW' },
    ],
  },
];

/** Teams indexed by ID for quick lookup */
export const TEST_LEAGUE_TEAMS_BY_ID: Record<string, Team> = TEST_LEAGUE_TEAMS.reduce(
  (acc, team) => {
    acc[team.id] = team;
    return acc;
  },
  {} as Record<string, Team>,
);
