import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { KnockoutMatch } from '../types/tournament';
import { TEAMS_BY_ID } from '../data/tournament';
import { Flag } from './Flag';
import { TriondaBall } from './BrandAssets';

interface PenaltyDetailsModalProps {
  match: KnockoutMatch;
  isOpen: boolean;
  onClose: () => void;
}

export const PenaltyDetailsModal = ({ match, isOpen, onClose }: PenaltyDetailsModalProps) => {
  const homeTeam = match.homeTeamId ? TEAMS_BY_ID[match.homeTeamId] : null;
  const awayTeam = match.awayTeamId ? TEAMS_BY_ID[match.awayTeamId] : null;
  const timeline = match.penaltyTimeline ?? [];

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !match.penalty) return null;

  const homeKicks = timeline.filter((k) => k.side === 'home');
  const awayKicks = timeline.filter((k) => k.side === 'away');

  const firstKickerSide = timeline.length > 0 ? timeline[0].side : null;
  const firstKickerTeamName = firstKickerSide === 'home' ? homeTeam?.shortName : awayTeam?.shortName;

  /** TriondaBall icon — full opacity when scored, faded when missed */
  const KickIcon = ({ scored }: { scored: boolean }) => (
    <div
      className={`transition-transform hover:scale-110 ${scored ? '' : 'opacity-25'}`}
      title={scored ? 'Ghi bàn' : 'Sút hỏng'}
    >
      <TriondaBall size={24} />
    </div>
  );

  const IconRow = ({ kicks }: { kicks: typeof homeKicks }) => (
    <div className="flex flex-wrap gap-2.5 items-center">
      {kicks.length === 0
        ? <span className="text-white/30 text-sm">—</span>
        : kicks.map((k, i) => <KickIcon key={i} scored={k.scored} />)}
    </div>
  );

  const modal = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Chi tiết Luân lưu Penalty"
        className={[
          'fixed z-[9999] flex flex-col',
          /* Mobile: bottom-sheet */
          'bottom-0 left-0 right-0 rounded-t-[24px]',
          /* ≥sm: centered popup */
          'sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2',
          'sm:-translate-x-1/2 sm:-translate-y-1/2',
          'sm:w-[min(560px,calc(100vw-2rem))] sm:rounded-[24px]',
          /* Shared */
          'max-h-[88dvh] overflow-y-auto',
          'border border-white/10',
          'bg-[linear-gradient(160deg,rgba(14,22,42,0.99),rgba(7,12,26,0.99))]',
          'shadow-[0_-4px_48px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)]',
        ].join(' ')}
      >
        {/* Drag handle — mobile only */}
        <div className="mx-auto mb-1 mt-3 h-1 w-10 rounded-full bg-white/15 sm:hidden" />

        {/* ── Header ── */}
        <div className="sticky top-0 z-10 flex items-center gap-3 rounded-t-[24px] border-b border-white/8 bg-[rgba(10,18,34,0.97)] px-5 py-4 backdrop-blur-xl sm:px-6">
          {/* Teams + score */}
          <div className="flex min-w-0 flex-1 items-center justify-center gap-2.5 overflow-hidden">
            <Flag teamName={homeTeam?.name ?? null} size={22} />
            <span className="max-w-[90px] truncate text-base font-bold text-white sm:max-w-none">
              {homeTeam?.shortName ?? 'Home'}
            </span>
            <span className="shrink-0 rounded-xl border border-host-mexico/35 bg-host-mexico/18 px-3.5 py-1.5 text-lg font-extrabold tabular-nums text-host-mexico">
              {match.penalty.home}&thinsp;–&thinsp;{match.penalty.away}
            </span>
            <span className="max-w-[90px] truncate text-base font-bold text-white sm:max-w-none">
              {awayTeam?.shortName ?? 'Away'}
            </span>
            <Flag teamName={awayTeam?.name ?? null} size={22} />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-white/10 bg-white/5 p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="space-y-5 p-5 sm:p-6">

          {/* Icon timeline */}
          {timeline.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-center gap-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                  Chuỗi sút
                </p>
                {firstKickerTeamName && (
                  <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300/80">
                    {firstKickerTeamName} sút trước
                  </span>
                )}
              </div>
              <div className="space-y-3.5 rounded-[18px] border border-white/8 bg-white/[0.03] px-5 py-5">
                <div className="flex items-center gap-4">
                  <span className="w-18 shrink-0 text-right text-[13px] font-semibold text-emerald-300/70 truncate">
                    {homeTeam?.shortName ?? 'Home'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <IconRow kicks={homeKicks} />
                  </div>
                </div>
                <div className="h-px bg-white/8" />
                <div className="flex items-center gap-4">
                  <span className="w-18 shrink-0 text-right text-[13px] font-semibold text-cyan-300/70 truncate">
                    {awayTeam?.shortName ?? 'Away'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <IconRow kicks={awayKicks} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Player columns */}
          {(homeKicks.length > 0 || awayKicks.length > 0) && (
            <div className="grid grid-cols-2 gap-3">
              {/* Home */}
              <div className="rounded-[18px] border border-emerald-500/15 bg-emerald-950/25 p-4">
                <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300/60">
                  <Flag teamName={homeTeam?.name ?? null} size={14} />
                  {homeTeam?.shortName ?? 'Home'}
                </p>
                <div className="space-y-2.5">
                  {homeKicks.map((k, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-5 shrink-0 text-right font-mono text-[11px] text-white/30">{i + 1}.</span>
                      <span className={`flex-1 min-w-0 truncate text-sm leading-5 ${k.scored ? 'text-white/90' : 'text-white/30'}`}>
                        {k.playerName}
                      </span>
                      <div className="shrink-0">
                        <KickIcon scored={k.scored} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Away */}
              <div className="rounded-[18px] border border-cyan-500/15 bg-cyan-950/25 p-4">
                <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/60">
                  <Flag teamName={awayTeam?.name ?? null} size={14} />
                  {awayTeam?.shortName ?? 'Away'}
                </p>
                <div className="space-y-2.5">
                  {awayKicks.map((k, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-5 shrink-0 text-right font-mono text-[11px] text-white/30">{i + 1}.</span>
                      <span className={`flex-1 min-w-0 truncate text-sm leading-5 ${k.scored ? 'text-white/90' : 'text-white/30'}`}>
                        {k.playerName}
                      </span>
                      <div className="shrink-0">
                        <KickIcon scored={k.scored} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* No data fallback */}
          {timeline.length === 0 && (
            <p className="py-4 text-center text-sm text-white/35">
              Không có dữ liệu chi tiết cho trận này.
            </p>
          )}

          {/* Sudden death note */}
          {(
            <p className="text-center text-[13px] text-amber-300/55">
              ⚡ {timeline.length} lượt sút tổng cộng
            </p>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(modal, document.body);
};
