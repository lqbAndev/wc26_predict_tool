import { Award, Crosshair } from 'lucide-react';
import { ROUND_LABELS, TEAMS_BY_ID } from '../data/tournament';
import type {
  GoalEvent,
  KnockoutMatch,
  KnockoutRound,
  KnockoutTeamOrigin,
} from '../types/tournament';
import { Flag } from './Flag';

interface KnockoutMatchCardProps {
  match: KnockoutMatch;
  round: KnockoutRound;
  title: string;
  teamOrigins: Record<string, KnockoutTeamOrigin>;
  variant?: 'overview' | 'center' | 'third';
  onPredict: (round: KnockoutRound, matchId: string) => void;
  onResolvePenalty: (round: KnockoutRound, matchId: string) => void;
}

const CARD_VARIANTS = {
  overview: 'border-white/10 bg-[linear-gradient(180deg,rgba(10,18,30,0.9),rgba(9,16,27,0.82))]',
  center: 'border-host-canada/22 bg-[linear-gradient(165deg,rgba(20,35,59,0.96),rgba(10,18,30,0.96))] shadow-brand',
  third: 'border-white/12 bg-white/[0.05]',
} as const;

const NAME_VARIANTS = {
  overview: 'text-[13px]',
  center: 'text-[15px]',
  third: 'text-[13px]',
} as const;

const SCORE_VARIANTS = {
  overview: 'text-lg',
  center: 'text-xl',
  third: 'text-lg',
} as const;

const formatScorerLine = (teamName: string | null, events: GoalEvent[]) => {
  const label = teamName ?? 'TBD';

  if (!events.length) {
    return `${label}: Không có bàn thắng`;
  }

  const scorers = events.map((event) => `${event.playerName} ${event.minute}'`).join(', ');
  return `${label}: ${scorers}`;
};

const formatScore = (home: number | null, away: number | null) =>
  home === null || away === null ? '- : -' : `${home} : ${away}`;

const getStatusLabel = (match: KnockoutMatch, hasTeams: boolean) => {
  if (match.status === 'completed') {
    return 'Đã chốt';
  }

  if (match.status === 'awaiting-penalties') {
    return 'Chờ penalty';
  }

  return hasTeams ? 'Chưa dự đoán' : 'Chờ cặp đấu';
};

export const KnockoutMatchCard = ({
  match,
  round,
  title,
  teamOrigins,
  variant = 'overview',
  onPredict,
  onResolvePenalty,
}: KnockoutMatchCardProps) => {
  const homeTeam = match.homeTeamId ? TEAMS_BY_ID[match.homeTeamId] : null;
  const awayTeam = match.awayTeamId ? TEAMS_BY_ID[match.awayTeamId] : null;
  const hasTeams = Boolean(match.homeTeamId && match.awayTeamId);
  const isCompleted = match.status === 'completed';
  const waitingPenalty = match.status === 'awaiting-penalties';
  const canPredict = match.status === 'pending' && hasTeams;
  const totalGoals = (match.scorers?.home.length ?? 0) + (match.scorers?.away.length ?? 0);
  const hasRegulationScore = match.regulationHomeScore !== null && match.regulationAwayScore !== null;
  const hasExtraTimeScore = match.extraTimeHomeScore !== null && match.extraTimeAwayScore !== null;

  const homeWinner = Boolean(match.winnerTeamId && match.winnerTeamId === match.homeTeamId);
  const awayWinner = Boolean(match.winnerTeamId && match.winnerTeamId === match.awayTeamId);
  const statusLabel = getStatusLabel(match, hasTeams);
  const statusClass = isCompleted
    ? 'border-host-mexico/28 bg-host-mexico/12 text-host-ice'
    : waitingPenalty
      ? 'border-host-canada/28 bg-host-canada/12 text-host-ice'
      : 'border-white/10 bg-white/[0.04] text-host-ice/62';

  const homeScorerLine = formatScorerLine(homeTeam?.name ?? match.homeSeedLabel, match.scorers?.home ?? []);
  const awayScorerLine = formatScorerLine(awayTeam?.name ?? match.awaySeedLabel, match.scorers?.away ?? []);

  const homeOriginLabel = match.homeTeamId ? teamOrigins[match.homeTeamId]?.label ?? null : null;
  const awayOriginLabel = match.awayTeamId ? teamOrigins[match.awayTeamId]?.label ?? null : null;
  const homeDisplayScore =
    match.extraTimeHomeScore ?? match.regulationHomeScore ?? match.homeScore;
  const awayDisplayScore =
    match.extraTimeAwayScore ?? match.regulationAwayScore ?? match.awayScore;

  const actionLabel = waitingPenalty
    ? 'Đá penalty'
    : canPredict
      ? 'Dự đoán'
      : isCompleted
        ? 'Trận đã chốt'
        : 'Chờ đủ cặp đấu';

  const handleAction = () => {
    if (waitingPenalty) {
      onResolvePenalty(round, match.id);
      return;
    }

    if (canPredict) {
      onPredict(round, match.id);
    }
  };

  const renderTeamRow = (
    teamName: string | null,
    seedLabel: string | null,
    score: number | null,
    originLabel: string | null,
    showOrigin: boolean,
    winner: boolean,
  ) => (
    <div className={`flex items-start justify-between gap-3 px-3 py-2 ${winner ? 'bg-host-mexico/[0.08]' : ''}`}>
      <div className="min-w-0 flex items-start gap-2">
        <Flag teamName={teamName} size={18} />
        <div className="min-w-0">
          <span
            className={`block whitespace-normal break-words font-semibold leading-5 text-white ${NAME_VARIANTS[variant]} ${
              !teamName ? 'text-white/62' : ''
            }`}
          >
            {teamName ?? seedLabel ?? 'TBD'}
          </span>

          {teamName && showOrigin ? (
            <span className="mt-0.5 block text-[10px] uppercase tracking-[0.12em] text-host-ice/58">
              {originLabel ?? 'Đang xác định nguồn'}
            </span>
          ) : null}
        </div>
      </div>

      <span
        className={`shrink-0 font-bold ${SCORE_VARIANTS[variant]} ${winner ? 'text-host-mexico' : 'text-white'}`}
      >
        {score ?? '-'}
      </span>
    </div>
  );

  return (
    <article className={`rounded-[20px] border p-2.5 ${CARD_VARIANTS[variant]}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-host-ice/45">{ROUND_LABELS[round]}</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-host-ice/32">{title}</div>
        </div>

        <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${statusClass}`}>
          {statusLabel}
        </span>
      </div>

      <div className="mt-2 overflow-hidden rounded-[16px] border border-white/8 bg-black/15">
        {renderTeamRow(
          homeTeam?.name ?? null,
          match.homeSeedLabel,
          homeDisplayScore,
          homeOriginLabel,
          round === 'roundOf32',
          homeWinner,
        )}
        <div className="h-px bg-white/8" />
        {renderTeamRow(
          awayTeam?.name ?? null,
          match.awaySeedLabel,
          awayDisplayScore,
          awayOriginLabel,
          round === 'roundOf32',
          awayWinner,
        )}
      </div>

      {hasRegulationScore || hasExtraTimeScore || match.penalty || (isCompleted && totalGoals === 0) ? (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em]">
          {hasRegulationScore ? (
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-host-ice/78">
              90p {formatScore(match.regulationHomeScore, match.regulationAwayScore)}
            </span>
          ) : null}

          {hasExtraTimeScore ? (
            <span className="rounded-full border border-host-canada/24 bg-host-canada/10 px-2.5 py-1 text-host-ice">
              120p {formatScore(match.extraTimeHomeScore, match.extraTimeAwayScore)}
            </span>
          ) : null}

          {match.penalty ? (
            <span className="rounded-full border border-host-mexico/24 bg-host-mexico/10 px-2.5 py-1 text-host-ice">
              Penalty {match.penalty.home}-{match.penalty.away}
            </span>
          ) : null}

          {isCompleted && totalGoals === 0 ? (
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-host-ice/62">
              Không có bàn thắng
            </span>
          ) : null}
        </div>
      ) : null}

      {totalGoals > 0 ? (
        <div className="mt-2 rounded-[14px] border border-white/8 bg-white/[0.04] px-3 py-3 text-[13px] leading-6 text-white/82">
          <div className="break-words">{homeScorerLine}</div>
          <div className="mt-1 break-words">{awayScorerLine}</div>
        </div>
      ) : null}

      {canPredict || waitingPenalty ? (
        <button
          type="button"
          disabled={!canPredict && !waitingPenalty}
          onClick={handleAction}
          className={`mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
            waitingPenalty
              ? 'border border-host-canada/35 bg-host-canada/16 text-host-ice hover:-translate-y-0.5 hover:bg-host-canada/22'
              : canPredict
                ? 'border border-host-mexico/35 bg-host-mexico/16 text-host-ice hover:-translate-y-0.5 hover:bg-host-mexico/22'
                : 'cursor-not-allowed border border-white/10 bg-white/5 text-white/35'
          }`}
        >
          {waitingPenalty ? <Award className="h-4 w-4" /> : <Crosshair className="h-4 w-4" />}
          {actionLabel}
        </button>
      ) : null}
    </article>
  );
};
