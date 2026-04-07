import { TEAMS_BY_ID } from '../data/tournament';
import type { GoalEvent, GroupMatch } from '../types/tournament';
import { Flag } from './Flag';

interface MatchCardProps {
  match: GroupMatch;
  onPredict: (matchId: string) => void;
}

const formatEvents = (events: GoalEvent[]) =>
  events.map((event) => `${event.playerName} ${event.minute}'`).join(', ');

export const MatchCard = ({ match, onPredict }: MatchCardProps) => {
  const homeTeam = TEAMS_BY_ID[match.homeTeamId];
  const awayTeam = TEAMS_BY_ID[match.awayTeamId];
  const isCompleted = match.status === 'completed';

  return (
    <article className="rounded-[28px] border border-white/10 bg-black/15 p-4 shadow-glow">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="field-label">Lượt {match.matchday}</p>
          <div className="mt-1 space-y-2">
            <div className="flex items-center gap-3 text-base font-semibold text-white">
              <Flag teamName={homeTeam.name} size={28} />
              <span>{homeTeam.name}</span>
            </div>
            <div className="flex items-center gap-3 text-base font-semibold text-white">
              <Flag teamName={awayTeam.name} size={28} />
              <span>{awayTeam.name}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
              isCompleted
                ? 'border border-emerald-300/20 bg-emerald-400/10 text-emerald-100'
                : 'border border-amber-300/20 bg-amber-300/10 text-amber-100'
            }`}
          >
            {isCompleted ? 'Đã chốt' : 'Chờ dự đoán'}
          </span>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-center">
            <div className="text-xs uppercase tracking-[0.28em] text-white/45">Tỉ số</div>
            <div className="mt-1 text-2xl font-bold text-white">
              {match.homeScore ?? '-'} <span className="text-white/35">:</span> {match.awayScore ?? '-'}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
          <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/60">{homeTeam.shortName}</p>
          <p className="mt-2 text-sm leading-6 text-white/80">
            {match.scorers?.home.length ? formatEvents(match.scorers.home) : 'Chưa có bàn thắng.'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/60">{awayTeam.shortName}</p>
          <p className="mt-2 text-sm leading-6 text-white/80">
            {match.scorers?.away.length ? formatEvents(match.scorers.away) : 'Chưa có bàn thắng.'}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onPredict(match.id)}
        disabled={isCompleted}
        className={`mt-4 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
          isCompleted
            ? 'cursor-not-allowed border border-white/10 bg-white/5 text-white/35'
            : 'border border-emerald-300/20 bg-emerald-400/15 text-emerald-50 hover:-translate-y-0.5 hover:bg-emerald-400/20'
        }`}
      >
        {isCompleted ? 'Kết quả đã khóa' : 'Dự đoán'}
      </button>
    </article>
  );
};
