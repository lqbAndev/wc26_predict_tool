import { Trophy, Medal, Award, Target, Swords, Flame, Sparkles } from 'lucide-react';
import type { LeagueStanding, LeagueMatch } from '../../types/leagueConfig';

interface LeagueRecapProps {
  standings: LeagueStanding[];
  fixtures: LeagueMatch[];
}

const StatCard = ({
  label,
  value,
  sub,
  accent = 'emerald',
  teamInitials,
  className = '',
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'amber' | 'emerald' | 'rose' | 'sky';
  teamInitials?: string;
  className?: string;
}) => {
  const borderMap = {
    amber: 'border-amber-400/25',
    emerald: 'border-emerald-400/25',
    rose: 'border-rose-400/25',
    sky: 'border-sky-400/25',
  };
  const bgMap = {
    amber: 'bg-amber-950/10',
    emerald: 'bg-emerald-950/15',
    rose: 'bg-rose-950/10',
    sky: 'bg-sky-950/10',
  };
  const labelColorMap = {
    amber: 'text-amber-400/80',
    emerald: 'text-emerald-400/80',
    rose: 'text-rose-400/80',
    sky: 'text-sky-400/80',
  };

  return (
    <div
      className={`rounded-2xl border ${borderMap[accent]} ${bgMap[accent]} p-5 transition-all duration-300 hover:scale-[1.02] ${className} backdrop-blur-md`}
    >
      <div className={`text-xs font-bold uppercase tracking-[0.22em] ${labelColorMap[accent]}`}>
        {label}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {teamInitials && (
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-bold text-xs ${
              accent === 'amber' ? 'bg-amber-950/40 border-amber-400/30 text-amber-200' :
              accent === 'rose' ? 'bg-rose-950/40 border-rose-400/30 text-rose-200' :
              accent === 'sky' ? 'bg-sky-950/40 border-sky-400/30 text-sky-200' :
              'bg-emerald-950/40 border-emerald-400/30 text-emerald-200'
            }`}>
              {teamInitials}
            </div>
          )}
          <div className="truncate text-2xl font-black text-white">{value}</div>
        </div>
      </div>
      {sub ? <div className="mt-1.5 text-xs text-white/55">{sub}</div> : null}
    </div>
  );
};

const FeaturedMatchCard = ({
  title,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  roundLabel,
  className = '',
}: {
  title: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  roundLabel: string;
  className?: string;
}) => (
  <div
    className={`rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/10 via-emerald-950/10 to-emerald-950/[0.03] p-5 transition-all duration-300 hover:scale-[1.01] shadow-[0_4px_24px_rgba(245,158,11,0.04)] ${className}`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/90">
        <Flame className="h-4 w-4" />
        {title}
      </div>
      <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
        {roundLabel}
      </div>
    </div>

    <div className="flex items-center justify-between gap-3">
      {/* Home */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-950/60 font-black text-sm text-emerald-400">
          {homeTeam.slice(0, 2).toUpperCase()}
        </div>
        <span className="truncate font-bold text-white text-base">
          {homeTeam}
        </span>
      </div>

      {/* Score */}
      <div className="flex flex-col items-center px-4">
        <div className="flex items-center gap-2 text-2xl font-black text-white">
          <span>{homeScore}</span>
          <span className="text-white/30">:</span>
          <span>{awayScore}</span>
        </div>
      </div>

      {/* Away */}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
        <span className="truncate text-right font-bold text-white text-base">
          {awayTeam}
        </span>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-950/60 font-black text-sm text-emerald-400">
          {awayTeam.slice(0, 2).toUpperCase()}
        </div>
      </div>
    </div>
  </div>
);

const Podium = ({
  champion,
  runnerUp,
  thirdPlace,
}: {
  champion: string;
  runnerUp: string;
  thirdPlace: string;
}) => (
  <div className="flex items-end justify-center gap-3 py-6 sm:gap-6 lg:gap-10">
    {/* 2nd Place */}
    <div className="flex w-[100px] flex-col items-center sm:w-[150px] lg:w-[180px]">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-950/80 font-black text-lg text-emerald-300 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
        {runnerUp.slice(0, 2).toUpperCase()}
      </div>
      <div className="mt-2 flex items-center gap-1 text-[10px] uppercase tracking-widest text-emerald-300/50 sm:text-xs">
        <Medal className="h-3 w-3 text-slate-300" /> Runner-Up (2nd)
      </div>
      <span className="mt-1 text-center text-sm font-bold text-white/90 truncate w-full">{runnerUp}</span>
      <div className="mt-3 flex h-[64px] w-full items-center justify-center rounded-t-2xl border border-b-0 border-emerald-500/10 bg-gradient-to-t from-emerald-500/[0.02] to-emerald-500/[0.08] sm:h-20 shadow-lg">
        <span className="text-4xl font-black text-emerald-500/10 sm:text-5xl">2</span>
      </div>
    </div>

    {/* 1st Place - Champion */}
    <div className="flex w-[120px] flex-col items-center sm:w-[170px] lg:w-[210px]">
      <div className="relative">
        <div className="absolute -inset-4 animate-pulse rounded-full bg-amber-400/10 blur-2xl" />
        <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-amber-400/20 to-emerald-500/20 blur-sm" />
        <div className="relative flex h-[76px] w-[76px] items-center justify-center rounded-full border-2 border-amber-400/40 bg-emerald-950 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <span className="font-black text-2xl text-amber-300">{champion.slice(0, 2).toUpperCase()}</span>
        </div>
      </div>
      <div className="mt-2 text-amber-400">
        <Trophy className="h-6 w-6 animate-bounce" />
      </div>
      <div className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300 sm:text-xs sm:tracking-[0.25em]">
        <Trophy className="h-3.5 w-3.5" /> Champion (1st)
      </div>
      <span className="mt-1 text-center text-base font-black text-white truncate w-full">{champion}</span>
      <div className="mt-3 flex h-[96px] w-full items-center justify-center rounded-t-2xl border border-b-0 border-amber-500/20 bg-gradient-to-t from-amber-500/[0.04] to-amber-500/[0.15] sm:h-28 shadow-xl">
        <span className="text-5xl font-black text-amber-500/10 sm:text-6xl">1</span>
      </div>
    </div>

    {/* 3rd Place */}
    <div className="flex w-[100px] flex-col items-center sm:w-[150px] lg:w-[180px]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-950/80 font-black text-base text-emerald-300 shadow-[0_4px_14px_rgba(0,0,0,0.3)]">
        {thirdPlace.slice(0, 2).toUpperCase()}
      </div>
      <div className="mt-2 flex items-center gap-1 text-[10px] uppercase tracking-widest text-emerald-300/50 sm:text-xs">
        <Award className="h-3 w-3 text-amber-600" /> Third Place (3rd)
      </div>
      <span className="mt-1 text-center text-sm font-bold text-white/90 truncate w-full">{thirdPlace}</span>
      <div className="mt-3 flex h-[48px] w-full items-center justify-center rounded-t-2xl border border-b-0 border-emerald-500/10 bg-gradient-to-t from-emerald-500/[0.01] to-emerald-500/[0.06] sm:h-14 shadow-md">
        <span className="text-3xl font-black text-emerald-500/5 sm:text-4xl">3</span>
      </div>
    </div>
  </div>
);

export default function LeagueRecap({ standings, fixtures }: LeagueRecapProps) {
  const completedMatches = fixtures.filter((f) => f.status === 'completed');
  const isComplete = completedMatches.length === fixtures.length;

  if (!isComplete || standings.length < 3) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/10 bg-emerald-950/5 p-6 sm:p-8 backdrop-blur-md">
        <div className="flex items-center gap-3 text-white/40">
          <Trophy className="h-8 w-8" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-400/50">Season Recap</p>
            <h3 className="mt-1 text-lg font-bold text-white/50">
              Complete all {fixtures.length} matches to view the league recap
            </h3>
          </div>
        </div>
      </div>
    );
  }

  // 1. Podium teams
  const champion = standings[0];
  const runnerUp = standings[1];
  const thirdPlace = standings[2];

  // 2. Goal Stats
  const totalGoals = completedMatches.reduce((sum, f) => sum + f.homeScore! + f.awayScore!, 0);
  const goalsPerMatch = (totalGoals / completedMatches.length).toFixed(2);

  // 3. Attack & Defence Stats
  let bestAttack = standings[0];
  let worstDefence = standings[0];
  let bestDefence = standings[0];

  for (const s of standings) {
    if (s.goalsFor > bestAttack.goalsFor) bestAttack = s;
    if (s.goalsAgainst > worstDefence.goalsAgainst) worstDefence = s;
    if (s.goalsAgainst < bestDefence.goalsAgainst) bestDefence = s;
  }

  // 4. Highest Scoring Match
  let highestScoringMatch: LeagueMatch | null = null;
  let maxMatchGoals = -1;

  for (const match of completedMatches) {
    const goals = match.homeScore! + match.awayScore!;
    if (goals > maxMatchGoals) {
      maxMatchGoals = goals;
      highestScoringMatch = match;
    }
  }

  // 5. Team name lookup map from standings
  const teamNameMap = standings.reduce((acc, curr) => {
    acc[curr.teamId] = curr.teamName;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="space-y-6">
      {/* Ambient header */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/15 bg-gradient-to-b from-[#051c0e] to-[#020a05] p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.08),transparent_35%)] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/12 border border-amber-400/20 text-amber-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-400/60">Season Summary</p>
              <h2 className="text-2xl font-black text-white sm:text-3xl">League Recap</h2>
            </div>
          </div>

          <Podium
            champion={champion.teamName}
            runnerUp={runnerUp.teamName}
            thirdPlace={thirdPlace.teamName}
          />
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Goals"
          value={totalGoals}
          sub={`Average ${goalsPerMatch} goals/match`}
          accent="emerald"
        />
        <StatCard
          label="Matches Played"
          value={completedMatches.length}
          sub="All rounds completed"
          accent="sky"
        />
        <StatCard
          label="Best Attack"
          value={bestAttack.teamName}
          sub={`Scored ${bestAttack.goalsFor} goals`}
          accent="amber"
          teamInitials={bestAttack.teamName.slice(0, 2).toUpperCase()}
        />
        <StatCard
          label="Best Defense"
          value={bestDefence.teamName}
          sub={`Conceded only ${bestDefence.goalsAgainst} goals`}
          accent="emerald"
          teamInitials={bestDefence.teamName.slice(0, 2).toUpperCase()}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Champion's Record"
          value={`${champion.wins} W - ${champion.draws} D - ${champion.losses} L`}
          sub={`Total of ${champion.points} points with GD ${champion.goalDifference > 0 ? '+' : ''}${champion.goalDifference}`}
          accent="amber"
          teamInitials={champion.teamName.slice(0, 2).toUpperCase()}
        />
        <StatCard
          label="Worst Defense"
          value={worstDefence.teamName}
          sub={`Conceded ${worstDefence.goalsAgainst} goals`}
          accent="rose"
          teamInitials={worstDefence.teamName.slice(0, 2).toUpperCase()}
        />
      </div>

      {/* Highest scoring match */}
      {highestScoringMatch && (
        <FeaturedMatchCard
          title="Highest Scoring Match"
          homeTeam={teamNameMap[highestScoringMatch.homeTeamId] || 'Home Team'}
          awayTeam={teamNameMap[highestScoringMatch.awayTeamId] || 'Away Team'}
          homeScore={highestScoringMatch.homeScore!}
          awayScore={highestScoringMatch.awayScore!}
          roundLabel={`Matchweek ${highestScoringMatch.matchweek}`}
        />
      )}
    </div>
  );
}
