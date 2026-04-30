import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, GitCompareArrows, Search, X } from 'lucide-react';
import type { Team } from '../types/tournament';
import type { TeamCompareStats } from '../utils/headToHead';
import { Flag } from './Flag';

interface HeadToHeadModalProps {
  isOpen: boolean;
  teams: Team[];
  teamAId: string;
  teamBId: string;
  compareRequested: boolean;
  compareStats: { left: TeamCompareStats; right: TeamCompareStats } | null;
  onChangeTeamA: (teamId: string) => void;
  onChangeTeamB: (teamId: string) => void;
  onCompare: () => void;
  onClose: () => void;
}

interface TeamSelectProps {
  label: string;
  teams: Team[];
  value: string;
  blockedTeamId: string;
  onChange: (teamId: string) => void;
}

const TeamSelect = ({ label, teams, value, blockedTeamId, onChange }: TeamSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedTeam = teams.find((team) => team.id === value) ?? null;
  const filteredTeams = useMemo(
    () =>
      teams.filter((team) => {
        if (team.id === blockedTeamId) {
          return false;
        }
        if (!query.trim()) {
          return true;
        }
        return team.name.toLowerCase().includes(query.toLowerCase());
      }),
    [blockedTeamId, query, teams],
  );

  useEffect(() => {
    const onOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative space-y-2">
      <span className="text-[13px] uppercase tracking-[0.16em] text-white/55">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-2xl border border-white/12 bg-white/[0.04] px-3 py-3 text-left text-[15px] font-semibold text-white outline-none transition hover:bg-white/[0.08] focus:border-host-mexico/40"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Flag teamName={selectedTeam?.name ?? null} size={20} />
          <span className="truncate">{selectedTeam?.name ?? 'Chọn đội'}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-white/60 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-[95] mt-2 rounded-2xl border border-white/15 bg-[#0b1a2a] p-2 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-2.5 py-2">
            <Search className="h-4 w-4 text-white/45" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm đội tuyển..."
              className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-white/35"
            />
          </div>

          <div className="max-h-56 overflow-y-auto pr-1">
            {filteredTeams.length ? (
              <div className="space-y-1">
                {filteredTeams.map((team) => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => {
                      onChange(team.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[15px] font-medium transition ${team.id === value
                      ? 'border border-host-mexico/35 bg-host-mexico/16 text-white'
                      : 'border border-transparent text-white/80 hover:border-white/10 hover:bg-white/[0.08]'
                      }`}
                  >
                    <Flag teamName={team.name} size={18} />
                    <span className="truncate">{team.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-[15px] text-white/55">
                Không tìm thấy đội phù hợp
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const MetricRow = ({
  label,
  leftValue,
  rightValue,
  leftBetter,
  rightBetter,
}: {
  label: string;
  leftValue: string | number;
  rightValue: string | number;
  leftBetter?: boolean;
  rightBetter?: boolean;
}) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
    {/* Mobile: stacked layout */}
    <div className="flex flex-col gap-1 sm:hidden">
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/55 text-center">{label}</div>
      <div className="grid grid-cols-2 gap-2">
        <div className={`rounded-xl px-2 py-1.5 text-[14px] font-semibold text-white text-center ${leftBetter ? 'bg-host-mexico/20 ring-1 ring-host-mexico/45' : 'bg-white/[0.04]'}`}>
          {leftValue}
        </div>
        <div className={`rounded-xl px-2 py-1.5 text-[14px] font-semibold text-white text-center ${rightBetter ? 'bg-host-mexico/20 ring-1 ring-host-mexico/45' : 'bg-white/[0.04]'}`}>
          {rightValue}
        </div>
      </div>
    </div>
    {/* Desktop: side-by-side layout */}
    <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-3">
      <div className={`rounded-xl px-2 py-1 text-[15px] font-semibold text-white ${leftBetter ? 'bg-host-mexico/20 ring-1 ring-host-mexico/45' : ''}`}>
        {leftValue}
      </div>
      <div className="min-w-[140px] text-center text-xs uppercase tracking-[0.16em] text-white/55">{label}</div>
      <div className={`rounded-xl px-2 py-1 text-right text-[15px] font-semibold text-white ${rightBetter ? 'bg-host-mexico/20 ring-1 ring-host-mexico/45' : ''}`}>
        {rightValue}
      </div>
    </div>
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 pt-1">
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
    <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-host-mexico/70">{title}</span>
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
  </div>
);

/** Small coloured badge for recent-form letters */
const FormBadge = ({ form }: { form: string }) => {
  if (form === '--') return <span className="text-white/40">--</span>;

  const letters = form.split('-');
  return (
    <span className="inline-flex gap-0.5">
      {letters.map((l, i) => {
        let bg = 'bg-white/10 text-white/60';
        if (l === 'W') bg = 'bg-emerald-500/25 text-emerald-300';
        if (l === 'L') bg = 'bg-red-500/25 text-red-300';
        if (l === 'D') bg = 'bg-amber-500/25 text-amber-300';
        return (
          <span key={i} className={`inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${bg}`}>
            {l}
          </span>
        );
      })}
    </span>
  );
};

export const HeadToHeadModal = ({
  isOpen,
  teams,
  teamAId,
  teamBId,
  compareRequested,
  compareStats,
  onChangeTeamA,
  onChangeTeamB,
  onCompare,
  onClose,
}: HeadToHeadModalProps) => {
  if (!isOpen) {
    return null;
  }

  const selectedA = teams.find((team) => team.id === teamAId) ?? null;
  const selectedB = teams.find((team) => team.id === teamBId) ?? null;
  const canCompare = Boolean(selectedA && selectedB && selectedA.id !== selectedB.id);

  return (
    <div className="fixed inset-0 z-[90] flex flex-col justify-end sm:block">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Mobile: bottom-sheet; Desktop: centered wider modal */}
      <div className="relative mx-auto flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] border border-white/15 bg-[#08131f] shadow-[0_-8px_40px_rgba(0,0,0,0.6)] sm:mt-[4vh] sm:min-h-[80vh] sm:max-h-[92vh] sm:w-[min(860px,92vw)] sm:rounded-[28px] sm:shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        {/* Mobile drag handle */}
        <div className="flex shrink-0 justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 px-4 pb-3 pt-3 sm:p-6 sm:pb-4">
          <div>
            <p className="field-label">Head-to-Head</p>
            <h3 className="mt-1 text-xl font-bold text-white sm:text-2xl">So sánh trực tiếp 2 đội tuyển</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-white/70 transition hover:bg-white/[0.08] hover:text-white"
            aria-label="Đóng so sánh"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6">
          {/* Team selectors — stacked on mobile, side-by-side on desktop */}
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <TeamSelect label="Đội 1" teams={teams} value={teamAId} blockedTeamId={teamBId} onChange={onChangeTeamA} />
            <TeamSelect label="Đội 2" teams={teams} value={teamBId} blockedTeamId={teamAId} onChange={onChangeTeamB} />
            <button
              type="button"
              disabled={!canCompare}
              onClick={onCompare}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition sm:inline-flex sm:h-[46px] sm:w-auto ${canCompare
                ? 'border border-host-mexico/35 bg-host-mexico/18 text-host-ice hover:-translate-y-0.5 hover:bg-host-mexico/24'
                : 'cursor-not-allowed border border-white/10 bg-white/5 text-white/35'
                }`}
            >
              <GitCompareArrows className="h-4 w-4" />
              Compare
            </button>
          </div>

          {/* Compare results */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 sm:mt-5 sm:p-5">
            {!compareRequested ? (
              <p className="text-[15px] text-white/65">Chọn 2 đội bất kỳ rồi bấm Compare để xem chỉ số đối đầu.</p>
            ) : !compareStats ? (
              <p className="text-[15px] text-amber-200/80">Không thể so sánh khi chọn trùng đội hoặc thiếu dữ liệu.</p>
            ) : (
              <div className="space-y-2.5">
                {/* VS header — stacked on mobile */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  {/* Mobile */}
                  <div className="flex flex-col items-center gap-1.5 sm:hidden">
                    <div className="flex items-center gap-2">
                      <Flag teamName={compareStats.left.teamName} size={20} />
                      <span className="truncate text-[14px] font-bold text-white">{compareStats.left.teamName}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/55">VS</span>
                    <div className="flex items-center gap-2">
                      <Flag teamName={compareStats.right.teamName} size={20} />
                      <span className="truncate text-[14px] font-bold text-white">{compareStats.right.teamName}</span>
                    </div>
                  </div>
                  {/* Desktop */}
                  <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-3">
                    <div className="flex items-center gap-2">
                      <Flag teamName={compareStats.left.teamName} size={22} />
                      <span className="truncate text-[15px] font-bold text-white">{compareStats.left.teamName}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/55">VS</span>
                    <div className="flex items-center justify-end gap-2">
                      <span className="truncate text-right text-[15px] font-bold text-white">{compareStats.right.teamName}</span>
                      <Flag teamName={compareStats.right.teamName} size={22} />
                    </div>
                  </div>
                </div>

                {/* ═══ TỔNG QUAN ═══ */}
                <SectionHeader title="Tổng quan" />

                <MetricRow
                  label="Hành trình giải đấu"
                  leftValue={compareStats.left.journey}
                  rightValue={compareStats.right.journey}
                  leftBetter={compareStats.left.journeyRank > compareStats.right.journeyRank}
                  rightBetter={compareStats.right.journeyRank > compareStats.left.journeyRank}
                />
                <MetricRow
                  label="Tổng trận đấu"
                  leftValue={compareStats.left.totalMatches}
                  rightValue={compareStats.right.totalMatches}
                />
                <MetricRow
                  label="Số trận thắng"
                  leftValue={compareStats.left.wins}
                  rightValue={compareStats.right.wins}
                  leftBetter={compareStats.left.wins > compareStats.right.wins}
                  rightBetter={compareStats.right.wins > compareStats.left.wins}
                />
                <MetricRow
                  label="Tỷ lệ thắng"
                  leftValue={compareStats.left.winRate}
                  rightValue={compareStats.right.winRate}
                  leftBetter={parseFloat(compareStats.left.winRate) > parseFloat(compareStats.right.winRate)}
                  rightBetter={parseFloat(compareStats.right.winRate) > parseFloat(compareStats.left.winRate)}
                />
                <MetricRow
                  label="Tổng MOTM"
                  leftValue={compareStats.left.motmCount}
                  rightValue={compareStats.right.motmCount}
                  leftBetter={compareStats.left.motmCount > compareStats.right.motmCount}
                  rightBetter={compareStats.right.motmCount > compareStats.left.motmCount}
                />

                {/* Recent form — custom render with badges */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                  <div className="flex flex-col gap-1 sm:hidden">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-white/55 text-center">Phong độ gần đây</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex justify-center rounded-xl bg-white/[0.04] px-2 py-1.5">
                        <FormBadge form={compareStats.left.recentForm} />
                      </div>
                      <div className="flex justify-center rounded-xl bg-white/[0.04] px-2 py-1.5">
                        <FormBadge form={compareStats.right.recentForm} />
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-3">
                    <div className="rounded-xl px-2 py-1">
                      <FormBadge form={compareStats.left.recentForm} />
                    </div>
                    <div className="min-w-[140px] text-center text-xs uppercase tracking-[0.16em] text-white/55">Phong độ gần đây</div>
                    <div className="flex justify-end rounded-xl px-2 py-1">
                      <FormBadge form={compareStats.right.recentForm} />
                    </div>
                  </div>
                </div>

                <MetricRow
                  label="Số trận penalty"
                  leftValue={compareStats.left.penaltyMatches}
                  rightValue={compareStats.right.penaltyMatches}
                  leftBetter={compareStats.left.penaltyMatches < compareStats.right.penaltyMatches}
                  rightBetter={compareStats.right.penaltyMatches < compareStats.left.penaltyMatches}
                />



                {/* ═══ TẤN CÔNG ═══ */}
                <SectionHeader title="Tấn Công" />

                <MetricRow
                  label="Tổng bàn thắng"
                  leftValue={compareStats.left.totalGoals}
                  rightValue={compareStats.right.totalGoals}
                  leftBetter={compareStats.left.totalGoals > compareStats.right.totalGoals}
                  rightBetter={compareStats.right.totalGoals > compareStats.left.totalGoals}
                />
                <MetricRow
                  label="Bàn / trận"
                  leftValue={`${compareStats.left.goalsPerMatch}`}
                  rightValue={`${compareStats.right.goalsPerMatch}`}
                  leftBetter={compareStats.left.goalsPerMatch > compareStats.right.goalsPerMatch}
                  rightBetter={compareStats.right.goalsPerMatch > compareStats.left.goalsPerMatch}
                />
                <MetricRow
                  label="Hiệu số bàn thắng bại"
                  leftValue={compareStats.left.goalDifference > 0 ? `+${compareStats.left.goalDifference}` : `${compareStats.left.goalDifference}`}
                  rightValue={compareStats.right.goalDifference > 0 ? `+${compareStats.right.goalDifference}` : `${compareStats.right.goalDifference}`}
                  leftBetter={compareStats.left.goalDifference > compareStats.right.goalDifference}
                  rightBetter={compareStats.right.goalDifference > compareStats.left.goalDifference}
                />
                <MetricRow
                  label="Trận thắng đậm nhất"
                  leftValue={compareStats.left.biggestWin}
                  rightValue={compareStats.right.biggestWin}
                />
                <MetricRow
                  label="Top scorer"
                  leftValue={compareStats.left.bestPlayer}
                  rightValue={compareStats.right.bestPlayer}
                />

                {/* ═══ PHÒNG NGỰ ═══ */}
                <SectionHeader title="Phòng Ngự" />

                <MetricRow
                  label="Bàn thua"
                  leftValue={compareStats.left.goalsConceded}
                  rightValue={compareStats.right.goalsConceded}
                  leftBetter={compareStats.left.goalsConceded < compareStats.right.goalsConceded}
                  rightBetter={compareStats.right.goalsConceded < compareStats.left.goalsConceded}
                />
                <MetricRow
                  label="Giữ sạch lưới"
                  leftValue={compareStats.left.cleanSheets}
                  rightValue={compareStats.right.cleanSheets}
                  leftBetter={compareStats.left.cleanSheets > compareStats.right.cleanSheets}
                  rightBetter={compareStats.right.cleanSheets > compareStats.left.cleanSheets}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
