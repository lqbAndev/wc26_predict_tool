import { useMemo } from 'react';
import { Award, Star, Trophy, User, X, Shield } from 'lucide-react';
import { ROUND_LABELS, TEAMS_BY_ID } from '../data/tournament';
import type {
  GroupMatch,
  KnockoutMatch,
  KnockoutRound,
} from '../types/tournament';
import { Flag } from './Flag';
import { TriondaBall } from './BrandAssets';

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: string;
  teamId: string;
  playerName: string;
  position?: string;
  groupMatches: GroupMatch[];
  knockoutMatches: Record<KnockoutRound, KnockoutMatch[]>;
}

interface TimelineEntry {
  /** e.g. "Ghi 2 bàn — Tứ kết vs Brazil" */
  description: string;
  /** Sort key for chronological order */
  sortOrder: number;
  /** Type badge colour */
  type: 'goal' | 'motm' | 'both' | 'cleansheet' | 'cleansheet+motm';
  /** Opponent team name */
  opponent: string;
  /** Round display label */
  roundLabel: string;
}

const getTeamName = (teamId: string | null): string =>
  teamId ? (TEAMS_BY_ID[teamId]?.name ?? teamId) : 'TBD';

/**
 * Build the player's match-by-match timeline from all completed matches.
 *
 * For every completed match we check:
 *   1. How many goals the player scored (via timeline or fallback scorers).
 *   2. Whether the player was awarded MOTM.
 *
 * Each relevant match produces one TimelineEntry combining both facts.
 */
const buildPlayerTimeline = (
  playerId: string,
  teamId: string,
  playerName: string,
  position: string | undefined,
  groupMatches: GroupMatch[],
  knockoutMatches: Record<KnockoutRound, KnockoutMatch[]>,
): { totalGoalsOrCleanSheets: number; totalMotm: number; timeline: TimelineEntry[], isGK: boolean } => {
  const isGK = position === 'GK';
  let totalGoalsOrCleanSheets = 0;
  let totalMotm = 0;
  const timeline: TimelineEntry[] = [];

  const processMatch = (
    match: GroupMatch | KnockoutMatch,
    roundLabel: string,
    sortOrder: number,
  ) => {
    if (match.status !== 'completed') return;

    // --- Check MOTM ---
    const teamName = getTeamName(teamId);
    const isMotm =
      match.motm?.playerName === playerName &&
      match.motm?.teamName === teamName;

    // --- Build opponent label ---
    const opponentId =
      match.homeTeamId === teamId ? match.awayTeamId : match.homeTeamId;
    const opponentName = getTeamName(opponentId);

    if (isMotm) totalMotm += 1;

    if (isGK) {
      // Check for clean sheet
      const opponentScore = match.homeTeamId === teamId ? match.awayScore : match.homeScore;
      const isCleanSheet = opponentScore === 0;

      if (!isCleanSheet && !isMotm) return;

      if (isCleanSheet) totalGoalsOrCleanSheets += 1;

      const parts: string[] = [];
      if (isCleanSheet) parts.push('Sạch lưới');
      if (isMotm) parts.push('MOTM');

      const type: TimelineEntry['type'] =
        isCleanSheet && isMotm ? 'cleansheet+motm' : isCleanSheet ? 'cleansheet' : 'motm';

      timeline.push({
        description: `${parts.join(' + ')} — ${roundLabel} vs ${opponentName}`,
        sortOrder,
        type,
        opponent: opponentName,
        roundLabel,
      });
    } else {
      // --- Count goals ---
      let goalsInMatch = 0;

      if (match.timeline?.length) {
        for (const event of match.timeline) {
          if (event.playerId === playerId && event.teamId === teamId) {
            goalsInMatch += 1;
          }
        }
      } else if (match.scorers) {
        const side =
          match.homeTeamId === teamId
            ? match.scorers.home
            : match.awayTeamId === teamId
              ? match.scorers.away
              : [];

        for (const event of side) {
          if (event.playerId === playerId) {
            goalsInMatch += 1;
          }
        }
      }

      if (goalsInMatch === 0 && !isMotm) return;

      totalGoalsOrCleanSheets += goalsInMatch;

      // --- Create description ---
      const parts: string[] = [];
      if (goalsInMatch > 0) {
        parts.push(`Ghi ${goalsInMatch} bàn`);
      }
      if (isMotm) {
        parts.push('MOTM');
      }

      const type: TimelineEntry['type'] =
        goalsInMatch > 0 && isMotm ? 'both' : goalsInMatch > 0 ? 'goal' : 'motm';

      timeline.push({
        description: `${parts.join(' + ')} — ${roundLabel} vs ${opponentName}`,
        sortOrder,
        type,
        opponent: opponentName,
        roundLabel,
      });
    }
  };

  // Group matches
  let sortCounter = 0;
  for (const match of groupMatches) {
    if (match.homeTeamId !== teamId && match.awayTeamId !== teamId) continue;
    processMatch(match, `Vòng bảng ${match.group}`, sortCounter++);
  }

  // Knockout matches (in progression order)
  const knockoutOrder: KnockoutRound[] = [
    'roundOf32',
    'roundOf16',
    'quarterfinals',
    'semifinals',
    'thirdPlace',
    'final',
  ];

  for (const round of knockoutOrder) {
    for (const match of knockoutMatches[round]) {
      if (match.homeTeamId !== teamId && match.awayTeamId !== teamId) continue;
      processMatch(match, ROUND_LABELS[round], sortCounter++);
    }
  }

  timeline.sort((a, b) => a.sortOrder - b.sortOrder);
  return { totalGoalsOrCleanSheets, totalMotm, timeline, isGK };
};

const TypeBadge = ({ type }: { type: TimelineEntry['type'] }) => {
  const config = {
    goal: {
      bg: 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300',
      label: 'Ghi bàn',
    },
    motm: {
      bg: 'bg-amber-500/20 border-amber-400/30 text-amber-300',
      icon: <Star className="h-3 w-3" />,
      label: 'MOTM',
    },
    both: {
      bg: 'bg-host-mexico/20 border-host-mexico/30 text-host-ice',
      icon: <Trophy className="h-3 w-3" />,
      label: 'Ghi bàn & MOTM',
    },
    cleansheet: {
      bg: 'bg-sky-500/20 border-sky-400/30 text-sky-300',
      icon: <Shield className="h-3 w-3" />,
      label: 'Sạch lưới',
    },
    'cleansheet+motm': {
      bg: 'bg-host-mexico/20 border-host-mexico/30 text-host-ice',
      icon: <Trophy className="h-3 w-3" />,
      label: 'Sạch lưới + MOTM',
    },
  }[type];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${config.bg}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

export const PlayerProfileModal = ({
  isOpen,
  onClose,
  playerId,
  teamId,
  playerName,
  position,
  groupMatches,
  knockoutMatches,
}: PlayerProfileModalProps) => {
  const { totalGoalsOrCleanSheets, totalMotm, timeline, isGK } = useMemo(
    () => buildPlayerTimeline(playerId, teamId, playerName, position, groupMatches, knockoutMatches),
    [playerId, teamId, playerName, position, groupMatches, knockoutMatches],
  );

  if (!isOpen) return null;

  const teamName = getTeamName(teamId);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal — bottom-sheet on mobile, centered on desktop */}
      <div className="relative mx-auto flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-[32px] border-t border-white/10 bg-[#08131f] shadow-[0_-12px_40px_rgba(0,0,0,0.5)] sm:max-h-[80vh] sm:w-[min(520px,92vw)] sm:rounded-[28px] sm:border sm:border-white/15 sm:shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        {/* Decorative gradient */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.06),transparent_50%)]" />

        {/* Mobile drag handle */}
        <div className="flex shrink-0 justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="relative flex shrink-0 items-start justify-between gap-3 px-5 pb-4 pt-2 sm:px-6 sm:pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center overflow-hidden rounded-full border border-white/12 bg-white/[0.06]">
              <Flag teamName={teamName} size={48} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">{playerName}</h3>
              <div className="mt-0.5 text-[13px] sm:text-sm text-white/60">
                {teamName}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full sm:rounded-xl border border-white/10 bg-white/[0.04] p-2 sm:p-2.5 text-white/70 transition hover:bg-white/[0.08] hover:text-white"
            aria-label="Đóng hồ sơ cầu thủ"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Stat badges */}
        <div className="relative flex gap-3 px-5 sm:px-6">
          <div className={`flex-1 rounded-2xl border px-3 py-3 sm:px-4 text-center ${isGK ? 'border-sky-400/20 bg-sky-500/10' : 'border-emerald-400/20 bg-emerald-500/10'}`}>
            <div className={`text-[10px] uppercase tracking-[0.2em] ${isGK ? 'text-sky-300/70' : 'text-emerald-300/70'}`}>
              {isGK ? 'Sạch lưới' : 'Bàn thắng'}
            </div>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-white">{totalGoalsOrCleanSheets}</div>
          </div>
          <div className="flex-1 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-3 py-3 sm:px-4 text-center">
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/70">
              MOTM
            </div>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-white">{totalMotm}</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative mt-4 flex-1 overflow-y-auto px-5 pb-8 sm:px-6 sm:pb-6 overscroll-contain">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-host-ice/55">
            <Award className="h-4 w-4" />
            Hành trình giải đấu
          </div>

          {timeline.length > 0 ? (
            <div className="relative mt-3 space-y-2.5">

              {timeline.map((entry, index) => (
                <div
                  key={`${entry.roundLabel}-${entry.opponent}-${index}`}
                  className="relative flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5 transition hover:bg-white/[0.06]"
                >
                  {/* Dot */}
                  <div className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#0b1a2a]">
                    {entry.type === 'goal' ? (
                      <TriondaBall size={14} />
                    ) : entry.type === 'cleansheet' ? (
                      <Shield className="h-3 w-3 text-sky-400" />
                    ) : entry.type === 'motm' ? (
                      <Star className="h-3 w-3 text-amber-400" />
                    ) : (
                      <Trophy className="h-3 w-3 text-host-mexico" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <TypeBadge type={entry.type} />
                      <span className="text-[10px] sm:text-[11px] text-white/40">{entry.roundLabel}</span>
                    </div>
                    <p className="mt-1.5 text-xs sm:text-[13px] font-medium text-white/85 leading-relaxed">
                      {entry.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="mt-4 flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
                <User className="h-7 w-7 text-white/30" />
              </div>
              <p className="mt-4 text-sm font-semibold text-white/55">
                {isGK ? 'Chưa giữ sạch lưới trận nào' : 'Chưa ghi bàn nào trong giải'}
              </p>
              <p className="mt-1 max-w-[260px] text-xs text-white/35">
                Nhưng đóng góp lớn vào lối chơi và tinh thần đội tuyển
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
