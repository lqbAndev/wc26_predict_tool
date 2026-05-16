/**
 * DynamicKnockoutBracket — A competition-agnostic bracket display.
 *
 * Unlike the original KnockoutBracket (hard-coded for WC26 with 4 columns
 * and pathway splits), this component dynamically renders only the rounds
 * that exist in the bracket data.
 *
 * For a Test Cup (4 teams), it shows only: Semi-Finals → Finals.
 * For WC26 (32 teams), it shows: R32 → R16 → QF → SF → Finals.
 */

import { useState } from 'react';
import type { KnockoutMatch, KnockoutRound, KnockoutTeamOrigin } from '../types/tournament';
import { KnockoutMatchCard } from './KnockoutMatchCard';
import { Flag } from './Flag';

interface DynamicKnockoutBracketProps {
  knockoutMatches: Record<string, KnockoutMatch[]>;
  knockoutRounds: string[];
  roundLabels: Record<string, string>;
  teamOrigins: Record<string, KnockoutTeamOrigin>;
  championName: string | null;
  onPredict: (round: KnockoutRound, matchId: string) => void;
  onResolvePenalty: (round: KnockoutRound, matchId: string) => void;
}

export const DynamicKnockoutBracket = ({
  knockoutMatches,
  knockoutRounds,
  roundLabels,
  teamOrigins,
  championName,
  onPredict,
  onResolvePenalty,
}: DynamicKnockoutBracketProps) => {
  // Separate main bracket rounds from special rounds (thirdPlace, final)
  const mainRounds = knockoutRounds.filter((r) => r !== 'thirdPlace' && r !== 'final');
  const hasThirdPlace = knockoutRounds.includes('thirdPlace');
  const hasFinal = knockoutRounds.includes('final');

  type ViewMode = 'bracket' | 'finals';
  const [activeView, setActiveView] = useState<ViewMode>('bracket');

  const finalMatch = knockoutMatches['final']?.[0];
  const thirdPlaceMatch = knockoutMatches['thirdPlace']?.[0];

  // Dynamically compute grid columns based on main rounds count
  const colCount = mainRounds.length;
  const gridCols = `repeat(${colCount}, minmax(260px, 1fr))`;
  const minWidth = `${colCount * 280}px`;

  return (
    <section className="brand-shell min-w-0 overflow-hidden p-4 sm:p-5 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-white/8 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div style={{ fontSize: 36, lineHeight: 1 }}>🏆</div>
          <div>
            <p className="field-label">Knock-out Stage</p>
            <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Tournament Tree</h2>
          </div>
        </div>

        {championName && (
          <div className="flex items-center gap-2 rounded-full border border-amber-400/22 bg-amber-400/10 px-3 py-2">
            <span>🏆</span>
            <Flag teamName={championName} size={18} />
            <span className="text-xs uppercase tracking-[0.18em] text-white/72">{championName}</span>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveView('bracket')}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            activeView === 'bracket'
              ? 'border-emerald-400/35 bg-emerald-400/16 text-white'
              : 'border-white/10 bg-white/[0.04] text-white/68 hover:border-white/22 hover:text-white'
          }`}
        >
          Bracket
        </button>

        {(hasFinal || hasThirdPlace) && (
          <button
            type="button"
            onClick={() => setActiveView('finals')}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              activeView === 'finals'
                ? 'border-emerald-400/35 bg-emerald-400/16 text-white'
                : 'border-white/10 bg-white/[0.04] text-white/68 hover:border-white/22 hover:text-white'
            }`}
          >
            Finals
          </button>
        )}
      </div>

      {activeView === 'finals' ? (
        /* ── Finals View ── */
        <div className="mt-6 mx-auto max-w-[880px]">
          <div className="rounded-[30px] border border-white/8 bg-black/15 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="field-label">Last Stage</p>
                <h3 className="mt-2 text-2xl font-bold text-white">Finals</h3>
              </div>
              <div style={{ fontSize: 32 }}>🏆</div>
            </div>

            <div className="mt-5 space-y-4">
              {hasFinal && finalMatch && (
                <KnockoutMatchCard
                  match={finalMatch}
                  round={'final' as KnockoutRound}
                  title="CHAMPION"
                  variant="center"
                  teamOrigins={teamOrigins}
                  onPredict={onPredict}
                  onResolvePenalty={onResolvePenalty}
                />
              )}

              {hasThirdPlace && thirdPlaceMatch && (
                <KnockoutMatchCard
                  match={thirdPlaceMatch}
                  round={'thirdPlace' as KnockoutRound}
                  title="3rd PLACE"
                  variant="third"
                  teamOrigins={teamOrigins}
                  onPredict={onPredict}
                  onResolvePenalty={onResolvePenalty}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ── Bracket View ── */
        <div className="mt-6 rounded-[30px] border border-white/8 bg-black/15 p-4 sm:p-5">
          <div className="bracket-scroll overflow-x-auto overflow-y-hidden pb-3">
            <div
              className="grid gap-5"
              style={{ gridTemplateColumns: gridCols, minWidth }}
            >
              {mainRounds.map((round, colIndex) => {
                const matches = knockoutMatches[round] ?? [];
                const completedCount = matches.filter((m) => m.status === 'completed').length;
                const label = roundLabels[round] ?? round;

                return (
                  <div
                    key={round}
                    className={`relative flex flex-col rounded-[24px] border border-white/8 bg-white/[0.03] p-3 ${
                      colIndex < mainRounds.length - 1
                        ? 'after:absolute after:right-[-18px] after:top-1/2 after:hidden after:h-px after:w-4 after:-translate-y-1/2 after:bg-gradient-to-r after:from-white/20 after:to-transparent xl:after:block'
                        : ''
                    }`}
                  >
                    {/* Column header */}
                    <div className="flex items-center justify-between gap-2">
                      <p className="field-label">{label}</p>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-white/62">
                        {completedCount}/{matches.length}
                      </span>
                    </div>

                    {/* Match cards */}
                    <div className="mt-3 flex flex-1 flex-col gap-3 xl:justify-around">
                      {matches.map((match) => (
                        <KnockoutMatchCard
                          key={match.id}
                          match={match}
                          round={round as KnockoutRound}
                          title={`Match ${match.slot + 1}`}
                          teamOrigins={teamOrigins}
                          onPredict={onPredict}
                          onResolvePenalty={onResolvePenalty}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
