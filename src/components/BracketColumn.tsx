import { ROUND_LABELS } from '../data/tournament';
import type { KnockoutMatch, KnockoutRound, KnockoutTeamOrigin } from '../types/tournament';
import { KnockoutMatchCard } from './KnockoutMatchCard';

interface BracketColumnProps {
  round: KnockoutRound;
  matches: KnockoutMatch[];
  teamOrigins: Record<string, KnockoutTeamOrigin>;
  showConnector?: boolean;
  onPredict: (round: KnockoutRound, matchId: string) => void;
  onResolvePenalty: (round: KnockoutRound, matchId: string) => void;
}

const HEIGHT_BY_ROUND: Record<KnockoutRound, string> = {
  roundOf32: 'xl:min-h-[860px]',
  roundOf16: 'xl:min-h-[700px]',
  quarterfinals: 'xl:min-h-[520px]',
  semifinals: 'xl:min-h-[360px]',
  thirdPlace: 'xl:min-h-[240px]',
  final: 'xl:min-h-[260px]',
};

export const BracketColumn = ({
  round,
  matches,
  teamOrigins,
  showConnector = true,
  onPredict,
  onResolvePenalty,
}: BracketColumnProps) => {
  const completedCount = matches.filter((match) => match.status === 'completed').length;
  const stackClass = (() => {
    if (round === 'roundOf32') {
      return 'mt-3 flex flex-col gap-2 xl:h-[calc(100%-2.35rem)] xl:justify-between';
    }

    if (round === 'roundOf16') {
      return 'mt-3 flex flex-col gap-3 xl:h-[calc(100%-2.35rem)] xl:justify-between';
    }

    if (round === 'quarterfinals') {
      return 'mt-3 flex flex-col gap-4 xl:h-[calc(100%-2.35rem)] xl:justify-between';
    }

    if (round === 'semifinals') {
      return 'mt-3 flex flex-col gap-4 xl:h-[calc(100%-2.35rem)] xl:justify-center';
    }

    return 'mt-3 flex flex-col gap-3 xl:h-[calc(100%-2.35rem)] xl:justify-around';
  })();

  return (
    <div
      className={`relative rounded-[24px] border border-white/8 bg-white/[0.03] p-3 ${HEIGHT_BY_ROUND[round]} ${
        showConnector
          ? 'after:absolute after:right-[-18px] after:top-1/2 after:hidden after:h-px after:w-4 after:-translate-y-1/2 after:bg-gradient-to-r after:from-host-ice/20 after:to-transparent xl:after:block'
          : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="field-label">{ROUND_LABELS[round]}</p>

        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-host-ice/62">
          {completedCount}/{matches.length}
        </span>
      </div>

      <div className={stackClass}>
        {matches.map((match) => (
          <KnockoutMatchCard
            key={match.id}
            match={match}
            round={round}
            title={`Match ${match.slot + 1}`}
            teamOrigins={teamOrigins}
            onPredict={onPredict}
            onResolvePenalty={onResolvePenalty}
          />
        ))}
      </div>
    </div>
  );
};
