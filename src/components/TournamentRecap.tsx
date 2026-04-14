import {
  Award,
  Goal,
  Swords,
  Target,
  TrendingUp,
  ShieldAlert,
  Zap,
  Trophy,
  Medal,
  Flame,
} from 'lucide-react';
import { Flag } from './Flag';
import { ChampionCup, WorldCupLogo, TriondaBall } from './BrandAssets';
import type { TournamentRecapStats, ScorerInfo } from '../utils/recapStats';

interface TournamentRecapProps {
  stats: TournamentRecapStats;
}

/* ──── Stat Card ──── */
const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  accent = 'usa',
  flagTeam,
  flagTeams,
}: {
  icon: typeof Goal;
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'usa' | 'mexico' | 'canada' | 'neutral';
  flagTeam?: string;
  flagTeams?: [string, string];
}) => {
  const borderMap = {
    usa: 'border-host-usa/22',
    mexico: 'border-host-mexico/24',
    canada: 'border-host-canada/24',
    neutral: 'border-white/12',
  };
  const bgMap = {
    usa: 'bg-host-usa/12',
    mexico: 'bg-host-mexico/12',
    canada: 'bg-host-canada/12',
    neutral: 'bg-white/[0.06]',
  };

  return (
    <div className={`rounded-[28px] border ${borderMap[accent]} ${bgMap[accent]} p-5 transition hover:scale-[1.02]`}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-host-ice/55">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {flagTeam && <Flag teamName={flagTeam} size={26} />}
          {flagTeams && <Flag teamName={flagTeams[0]} size={26} />}
          <div className="truncate text-3xl font-bold text-white">{value}</div>
          {flagTeams && <Flag teamName={flagTeams[1]} size={26} />}
        </div>
      </div>
      {sub && <div className="mt-1 text-sm text-white/55">{sub}</div>}
    </div>
  );
};

/* ──── Featured Match Card ──── */
const FeaturedMatchCard = ({
  title,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  roundLabel,
  penalty,
  homeScorers = [],
  awayScorers = [],
  featured = false,
  icon: Icon = Trophy,
}: {
  title: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  roundLabel: string;
  penalty: { home: number; away: number } | null;
  homeScorers?: ScorerInfo[];
  awayScorers?: ScorerInfo[];
  featured?: boolean;
  icon?: typeof Trophy;
}) => (
  <div
    className={`rounded-[28px] border p-5 transition hover:scale-[1.01] ${featured
      ? 'border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-host-mexico/10 to-host-mexico/[0.03] shadow-[0_0_24px_rgba(245,158,11,0.08)] sm:p-6'
      : 'border-white/10 bg-white/[0.04]'
      }`}
  >
    {/* Header */}
    <div className="flex items-center justify-between">
      <div
        className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] ${featured ? 'text-amber-400/90' : 'text-host-ice/50'
          }`}
      >
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">
        {roundLabel}
      </div>
    </div>

    {/* Teams & Score */}
    <div className="mt-4 flex items-center justify-between gap-3">
      {/* Home */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Flag teamName={homeTeam} size={featured ? 32 : 24} />
        <span className={`truncate font-semibold text-white ${featured ? 'text-base sm:text-lg' : 'text-sm'}`}>
          {homeTeam}
        </span>
      </div>

      {/* Score */}
      <div className="flex flex-col items-center">
        <div
          className={`flex items-baseline gap-1.5 font-black text-white ${featured ? 'text-3xl sm:text-4xl' : 'text-2xl'
            }`}
        >
          <span>{homeScore}</span>
          <span className="text-white/30">:</span>
          <span>{awayScore}</span>
        </div>
        {penalty && (
          <div className="mt-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-sm">
            PEN {penalty.home} – {penalty.away}
          </div>
        )}
      </div>

      {/* Away */}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <span
          className={`truncate text-right font-semibold text-white ${featured ? 'text-base sm:text-lg' : 'text-sm'}`}
        >
          {awayTeam}
        </span>
        <Flag teamName={awayTeam} size={featured ? 32 : 24} />
      </div>
    </div>

    {/* Goal Scorers */}
    {(homeScorers.length > 0 || awayScorers.length > 0) && (
      <div className="mt-3 grid grid-cols-2 gap-x-4 border-t border-white/[0.08] pt-3">
        <div className="space-y-0.5">
          {homeScorers.map((s, i) => (
            <div key={i} className="text-xs text-white/50">
              <span className="text-white/70">{s.playerName}</span>{' '}
              <span className="text-host-ice/40">{s.displayMinute}</span>
            </div>
          ))}
        </div>
        <div className="space-y-0.5 text-right">
          {awayScorers.map((s, i) => (
            <div key={i} className="text-xs text-white/50">
              <span className="text-host-ice/40">{s.displayMinute}</span>{' '}
              <span className="text-white/70">{s.playerName}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

/* ──── Podium ──── */
const Podium = ({
  champion,
  runnerUp,
  thirdPlace,
}: {
  champion: string;
  runnerUp: string;
  thirdPlace: string;
}) => (
  <div className="flex items-end justify-center gap-2 py-4 sm:gap-5 lg:gap-8">
    {/* Runner-Up (2nd) */}
    <div className="flex w-[92px] flex-col items-center sm:w-[150px] lg:w-[180px]">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] sm:h-[72px] sm:w-[72px]">
        <Flag teamName={runnerUp} size={36} />
      </div>
      <div className="mt-2 flex items-center gap-1 text-[10px] uppercase tracking-widest text-host-ice/50 sm:gap-1.5 sm:text-xs">
        <Medal className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Á quân
      </div>
      <span className="mt-1 text-center text-sm font-bold text-white/80 sm:text-base">{runnerUp}</span>
      {/* Pedestal */}
      <div className="mt-3 flex h-[72px] w-full items-center justify-center rounded-t-2xl border border-b-0 border-white/10 bg-gradient-to-t from-white/[0.03] to-white/[0.08] sm:h-20">
        <span className="text-4xl font-black text-white/[0.08] sm:text-5xl">2</span>
      </div>
    </div>

    {/* Champion (1st) */}
    <div className="flex w-[110px] flex-col items-center sm:w-[170px] lg:w-[210px]">
      <div className="relative">
        <div className="absolute -inset-4 animate-pulse rounded-full bg-amber-400/15 blur-2xl sm:-inset-5" />
        <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-amber-400/25 to-host-mexico/20 blur-sm sm:-inset-2" />
        <div className="relative flex h-[76px] w-[76px] items-center justify-center rounded-full border-2 border-amber-400/40 bg-host-mexico/14 shadow-[0_0_20px_rgba(245,158,11,0.15)] sm:h-[100px] sm:w-[100px]">
          <Flag teamName={champion} size={48} />
        </div>
      </div>
      <div className="mt-2 sm:mt-3">
        <ChampionCup size={38} />
      </div>
      <div className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-host-mexico/80 sm:gap-1.5 sm:text-xs sm:tracking-[0.25em]">
        <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Vô địch
      </div>
      <span className="mt-1 text-center text-base font-black text-white sm:text-xl">{champion}</span>
      {/* Pedestal */}
      <div className="mt-3 flex h-[100px] w-full items-center justify-center rounded-t-2xl border border-b-0 border-host-mexico/20 bg-gradient-to-t from-host-mexico/[0.04] to-host-mexico/[0.12] sm:h-[120px]">
        <span className="text-5xl font-black text-host-mexico/[0.12] sm:text-6xl">1</span>
      </div>
    </div>

    {/* Third Place (3rd) */}
    <div className="flex w-[92px] flex-col items-center sm:w-[150px] lg:w-[180px]">
      <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-white/15 bg-white/[0.06] sm:h-16 sm:w-16">
        <Flag teamName={thirdPlace} size={32} />
      </div>
      <div className="mt-2 flex items-center gap-1 text-[10px] uppercase tracking-widest text-host-ice/50 sm:gap-1.5 sm:text-xs">
        <Award className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Hạng ba
      </div>
      <span className="mt-1 text-center text-sm font-bold text-white/80 sm:text-base">{thirdPlace}</span>
      {/* Pedestal */}
      <div className="mt-3 flex h-[52px] w-full items-center justify-center rounded-t-2xl border border-b-0 border-white/10 bg-gradient-to-t from-white/[0.02] to-white/[0.06] sm:h-[60px]">
        <span className="text-3xl font-black text-white/[0.06] sm:text-4xl">3</span>
      </div>
    </div>
  </div>
);

/* ──── Main Component ──── */
export const TournamentRecap = ({ stats }: TournamentRecapProps) => {
  if (!stats.isComplete) {
    return (
      <div className="brand-shell p-6 sm:p-8">
        <div className="flex items-center gap-3 text-white/40">
          <WorldCupLogo size={36} />
          <div>
            <p className="field-label">Tournament Recap</p>
            <h3 className="mt-1 text-xl font-bold text-white/50">
              Hoàn tất toàn bộ giải đấu để xem Recap
            </h3>
          </div>
        </div>
      </div>
    );
  }

  /* Deduplicate most dramatic match against highest scoring */
  const dramaticMatch =
    stats.mostDramaticMatch &&
      !(
        stats.mostDramaticMatch.homeTeamName === stats.highestScoringMatch?.homeTeamName &&
        stats.mostDramaticMatch.awayTeamName === stats.highestScoringMatch?.awayTeamName
      )
      ? stats.mostDramaticMatch
      : null;

  const smallCardCount = [stats.thirdPlaceMatch, stats.highestScoringMatch, dramaticMatch].filter(Boolean).length;

  return (
    <div>
      {/* ─── Hero ─── */}
      <div className="brand-shell overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(19,78,74,0.24),transparent_30%),radial-gradient(circle_at_left,rgba(30,64,175,0.20),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(165,52,72,0.18),transparent_30%)]" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-4">
            <WorldCupLogo size={52} />
            <div>
              <p className="field-label">Tournament Recap</p>
              <h2 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
                Tổng kết World Cup 2026
              </h2>
            </div>
            <TriondaBall size={56} className="ml-auto hidden animate-ball-float sm:block" />
          </div>

          {/* Podium */}
          <div className="mt-8">
            <Podium champion={stats.champion} runnerUp={stats.runnerUp} thirdPlace={stats.thirdPlace} />
          </div>
        </div>
      </div>

      {/* ─── Stats Dashboard ─── */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Goal} label="Tổng bàn thắng" value={stats.totalGoals} sub={`${stats.goalsPerMatch} bàn/trận`} accent="usa" />
        <StatCard icon={Swords} label="Tổng trận đấu" value={stats.totalMatches} sub="Trận đã hoàn tất" accent="mexico" />
        <StatCard icon={Zap} label="Penalty Shootout" value={stats.totalPenaltyMatches} sub="Trận phân thắng bại luân lưu" accent="canada" />
        <StatCard
          icon={Target}
          label="Vua phá lưới"
          value={stats.topScorer ? stats.topScorer.playerName : '--'}
          sub={stats.topScorer ? `${stats.topScorer.goals} bàn · ${stats.topScorer.teamName}` : undefined}
          accent="neutral"
          flagTeam={stats.topScorer?.teamName}
        />
        <StatCard
          icon={TrendingUp}
          label="Đội ghi nhiều nhất"
          value={stats.mostGoalsTeam?.teamName ?? '--'}
          sub={stats.mostGoalsTeam ? `${stats.mostGoalsTeam.goals} bàn` : undefined}
          accent="usa"
          flagTeam={stats.mostGoalsTeam?.teamName}
        />
        <StatCard
          icon={ShieldAlert}
          label="Đội thủng lưới nhiều nhất"
          value={stats.mostConcededTeam?.teamName ?? '--'}
          sub={stats.mostConcededTeam ? `${stats.mostConcededTeam.goals} bàn` : undefined}
          accent="canada"
          flagTeam={stats.mostConcededTeam?.teamName}
        />
        {stats.highestScoringMatch && (
          <div className="sm:col-span-2">
            <StatCard
              icon={TrendingUp}
              label="Trận nhiều bàn nhất"
              value={`${stats.highestScoringMatch.homeTeamName} ${stats.highestScoringMatch.homeScore} – ${stats.highestScoringMatch.awayScore} ${stats.highestScoringMatch.awayTeamName}`}
              sub={`${stats.highestScoringMatch.totalGoals} bàn · ${stats.highestScoringMatch.roundLabel}`}
              accent="mexico"
              flagTeams={[stats.highestScoringMatch.homeTeamName, stats.highestScoringMatch.awayTeamName]}
            />
          </div>
        )}
      </div>

      {/* ─── Featured Matches ─── */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-host-mexico" />
          <h3 className="text-lg font-bold text-white">Trận đấu nổi bật</h3>
        </div>

        {/* Final — Full Width, Highlighted */}
        {stats.finalMatch && (
          <FeaturedMatchCard
            title="Chung kết"
            homeTeam={stats.finalMatch.homeTeamName}
            awayTeam={stats.finalMatch.awayTeamName}
            homeScore={stats.finalMatch.homeScore}
            awayScore={stats.finalMatch.awayScore}
            roundLabel="Final"
            penalty={stats.finalMatch.penalty}
            homeScorers={stats.finalMatch.homeScorers}
            awayScorers={stats.finalMatch.awayScorers}
            featured
            icon={Trophy}
          />
        )}

        {/* Smaller Cards: Third Place + Highest Scoring + Most Dramatic */}
        {smallCardCount > 0 && (
          <div className={`grid gap-4 ${smallCardCount >= 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}`}>
            {stats.thirdPlaceMatch && (
              <FeaturedMatchCard
                title="Tranh hạng ba"
                homeTeam={stats.thirdPlaceMatch.homeTeamName}
                awayTeam={stats.thirdPlaceMatch.awayTeamName}
                homeScore={stats.thirdPlaceMatch.homeScore}
                awayScore={stats.thirdPlaceMatch.awayScore}
                roundLabel="Third Place"
                penalty={stats.thirdPlaceMatch.penalty}
                homeScorers={stats.thirdPlaceMatch.homeScorers}
                awayScorers={stats.thirdPlaceMatch.awayScorers}
                icon={Medal}
              />
            )}

            {stats.highestScoringMatch && (
              <FeaturedMatchCard
                title="Trận nhiều bàn nhất"
                homeTeam={stats.highestScoringMatch.homeTeamName}
                awayTeam={stats.highestScoringMatch.awayTeamName}
                homeScore={stats.highestScoringMatch.homeScore}
                awayScore={stats.highestScoringMatch.awayScore}
                roundLabel={stats.highestScoringMatch.roundLabel}
                penalty={stats.highestScoringMatch.penalty}
                homeScorers={stats.highestScoringMatch.homeScorers}
                awayScorers={stats.highestScoringMatch.awayScorers}
                icon={TrendingUp}
              />
            )}

            {dramaticMatch && (
              <FeaturedMatchCard
                title="Trận kịch tính nhất"
                homeTeam={dramaticMatch.homeTeamName}
                awayTeam={dramaticMatch.awayTeamName}
                homeScore={dramaticMatch.homeScore}
                awayScore={dramaticMatch.awayScore}
                roundLabel={dramaticMatch.roundLabel}
                penalty={dramaticMatch.penalty}
                homeScorers={dramaticMatch.homeScorers}
                awayScorers={dramaticMatch.awayScorers}
                icon={Flame}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
