import { useState } from 'react';
import { Orbit, Sparkles } from 'lucide-react';
import type { KnockoutMatch, KnockoutRound } from '../types/tournament';
import { BracketColumn } from './BracketColumn';
import { ChampionCup, TriondaBall, WorldCupLogo } from './BrandAssets';
import { Flag } from './Flag';
import { KnockoutMatchCard } from './KnockoutMatchCard';

interface KnockoutBracketProps {
  knockoutMatches: Record<KnockoutRound, KnockoutMatch[]>;
  championName: string | null;
  onPredict: (round: KnockoutRound, matchId: string) => void;
  onResolvePenalty: (round: KnockoutRound, matchId: string) => void;
}

type BracketView = 'pathway1' | 'pathway2' | 'finals';

const VIEW_TABS: Array<{ id: BracketView; label: string }> = [
  { id: 'pathway1', label: 'Pathway 1' },
  { id: 'pathway2', label: 'Pathway 2' },
  { id: 'finals', label: 'Finals' },
];

const PATHWAY_1: Array<{ round: KnockoutRound; matches: (matches: Record<KnockoutRound, KnockoutMatch[]>) => KnockoutMatch[] }> = [
  { round: 'roundOf32', matches: (all) => all.roundOf32.slice(0, 8) },
  { round: 'roundOf16', matches: (all) => all.roundOf16.slice(0, 4) },
  { round: 'quarterfinals', matches: (all) => all.quarterfinals.slice(0, 2) },
  { round: 'semifinals', matches: (all) => all.semifinals.slice(0, 1) },
];

const PATHWAY_2: Array<{ round: KnockoutRound; matches: (matches: Record<KnockoutRound, KnockoutMatch[]>) => KnockoutMatch[] }> = [
  { round: 'roundOf32', matches: (all) => all.roundOf32.slice(8, 16) },
  { round: 'roundOf16', matches: (all) => all.roundOf16.slice(4, 8) },
  { round: 'quarterfinals', matches: (all) => all.quarterfinals.slice(2, 4) },
  { round: 'semifinals', matches: (all) => all.semifinals.slice(1, 2) },
];

export const KnockoutBracket = ({
  knockoutMatches,
  championName,
  onPredict,
  onResolvePenalty,
}: KnockoutBracketProps) => {
  const [activeView, setActiveView] = useState<BracketView>('pathway1');

  const finalMatch = knockoutMatches.final[0];
  const thirdPlaceMatch = knockoutMatches.thirdPlace[0];
  const activePathway = activeView === 'pathway2' ? PATHWAY_2 : PATHWAY_1;

  return (
    <section className="brand-shell min-w-0 overflow-hidden p-4 sm:p-5 lg:p-6">
      <div className="flex flex-col gap-4 border-b border-white/8 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <WorldCupLogo size={46} />
          <div>
            <p className="field-label">Knock-out Stage</p>
            <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Tournament Tree</h2>
          </div>

        </div>

        <div className="flex flex-wrap items-center gap-3">
          {championName ? (
            <div className="flex items-center gap-2 rounded-full border border-host-mexico/22 bg-host-mexico/10 px-3 py-2">
              <ChampionCup size={24} />
              <Flag teamName={championName} size={18} />
              <span className="text-xs uppercase tracking-[0.18em] text-host-ice/72">{championName}</span>
            </div>
          ) : null}

          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
            <Orbit className="h-4 w-4 text-host-mexico" />
            <span className="text-xs uppercase tracking-[0.18em] text-host-ice/70">Trionda WC2026</span>
            <TriondaBall size={42} className="animate-ball-float" />
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveView(tab.id)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${activeView === tab.id
                ? 'border-host-mexico/35 bg-host-mexico/16 text-host-ice'
                : 'border-white/10 bg-white/[0.04] text-host-ice/68 hover:border-host-ice/22 hover:text-white'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeView === 'finals' ? (
        <div className="mt-6 mx-auto max-w-[880px]">
          <div className="rounded-[30px] border border-white/8 bg-black/15 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="field-label">Center Stage</p>
                <h3 className="mt-2 text-2xl font-bold text-white">Finals</h3>
              </div>
              <Sparkles className="h-5 w-5 text-host-canada" />
            </div>

            <div className="mt-5 space-y-4">
              <KnockoutMatchCard
                match={finalMatch}
                round="final"
                title="Showpiece"
                variant="center"
                onPredict={onPredict}
                onResolvePenalty={onResolvePenalty}
              />

              <KnockoutMatchCard
                match={thirdPlaceMatch}
                round="thirdPlace"
                title="Placement"
                variant="third"
                onPredict={onPredict}
                onResolvePenalty={onResolvePenalty}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-[30px] border border-white/8 bg-black/15 p-4 sm:p-5">
          <div className="bracket-scroll overflow-x-auto overflow-y-hidden pb-3">
            <div className="grid min-w-[1180px] grid-cols-[minmax(300px,2.25fr)_minmax(260px,1.75fr)_minmax(240px,1.35fr)_minmax(220px,1fr)] gap-6">
              {activePathway.map((column, index) => (
                <BracketColumn
                  key={`${activeView}-${column.round}`}
                  round={column.round}
                  matches={column.matches(knockoutMatches)}
                  showConnector={index < activePathway.length - 1}
                  onPredict={onPredict}
                  onResolvePenalty={onResolvePenalty}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
