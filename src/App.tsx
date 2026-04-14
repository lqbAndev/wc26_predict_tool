import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Orbit, RotateCcw, Swords, Trophy, Users } from 'lucide-react';
import { BestThirdTable } from './components/BestThirdTable';
import { ChampionCup, TriondaBall, WorldCupLogo } from './components/BrandAssets';
import { ChampionModal } from './components/ChampionModal';
import { Flag } from './components/Flag';
import { GroupCard } from './components/GroupCard';
import { HeroBranding } from './components/HeroBranding';
import { KnockoutBracket } from './components/KnockoutBracket';
import { ResetModal } from './components/ResetModal';
import { TopScorersTable } from './components/TopScorersTable';
import { TournamentRecap } from './components/TournamentRecap';
import { GROUPS } from './data/tournament';
import { useTournament } from './hooks/useTournament';
import { calculateTournamentStats } from './utils/recapStats';

const SLOGAN = 'WE ARE 26';

const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function App() {
  const {
    coreState,
    derivedState,
    predictGroupMatch,
    openKnockoutStage,
    predictKnockoutMatch,
    resolvePenalty,
    resetTournament,
  } = useTournament();

  const [showResetModal, setShowResetModal] = useState(false);
  const [showChampionModal, setShowChampionModal] = useState(false);
  const prevChampionRef = useRef<string | null>(null);

  useEffect(() => {
    if (derivedState.championName && !prevChampionRef.current) {
      setTimeout(() => setShowChampionModal(true), 1200);
    }

    prevChampionRef.current = derivedState.championName;
  }, [derivedState.championName]);

  const completedGroupMatches = coreState.groupMatches.filter((match) => match.status === 'completed').length;
  const totalGroupMatches = coreState.groupMatches.length;
  const knockoutMatches = Object.values(coreState.knockoutMatches).flat();
  const completedKnockoutMatches = knockoutMatches.filter((match) => match.status === 'completed').length;
  const qualifiedThirdIds = new Set(
    derivedState.thirdPlaceTable.filter((entry) => entry.qualifies).map((entry) => entry.teamId),
  );

  const recapStats = useMemo(
    () => calculateTournamentStats(coreState.groupMatches, coreState.knockoutMatches, derivedState.topScorers),
    [coreState.groupMatches, coreState.knockoutMatches, derivedState.topScorers],
  );

  const handleOpenKnockout = () => {
    openKnockoutStage();
    setTimeout(() => scrollToId('knockout'), 120);
  };

  const handleViewRecap = () => {
    setTimeout(() => scrollToId('recap'), 200);
  };

  const confirmReset = () => {
    resetTournament();
    setShowResetModal(false);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute left-[-120px] top-[140px] hidden opacity-30 lg:block">
        <TriondaBall size={260} className="animate-ball-float" />
      </div>

      <div className="mx-auto max-w-[1640px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="brand-shell overflow-hidden p-6 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(19,78,74,0.22),transparent_28%),radial-gradient(circle_at_left,rgba(30,64,175,0.18),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(165,52,72,0.16),transparent_28%)]" />

          <div className="relative">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] xl:items-start">
              <div className="max-w-3xl">
                <div className="flex items-center gap-4">
                  <WorldCupLogo size={56} />
                  <div>
                    <p className="field-label">World Cup 2026</p>
                    <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-white sm:text-5xl xl:text-[3.7rem]">
                      Prediction Tool
                    </h1>
                  </div>
                </div>

                <p className="mt-5 text-lg font-medium text-host-ice/80 sm:text-xl">{SLOGAN}</p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => scrollToId('group-stage')}
                    className="rounded-2xl border border-host-ice/15 bg-host-usa/16 px-5 py-3 text-sm font-semibold text-host-ice transition hover:-translate-y-0.5 hover:bg-host-usa/24"
                  >
                    Xem vòng bảng
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToId('best-third')}
                    className="rounded-2xl border border-host-ice/15 bg-host-canada/14 px-5 py-3 text-sm font-semibold text-host-ice transition hover:-translate-y-0.5 hover:bg-host-canada/22"
                  >
                    Best 3rd Place
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenKnockout}
                    disabled={!derivedState.knockoutReady}
                    className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${derivedState.knockoutReady
                      ? 'border border-host-mexico/35 bg-host-mexico/18 text-host-ice hover:-translate-y-0.5 hover:bg-host-mexico/24'
                      : 'cursor-not-allowed border border-white/10 bg-white/5 text-white/35'
                      }`}
                  >
                    Knock-out Stage
                  </button>

                  {recapStats.isComplete && (
                    <button
                      type="button"
                      onClick={handleViewRecap}
                      className="flex items-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/12 px-5 py-3 text-sm font-semibold text-amber-200 transition hover:-translate-y-0.5 hover:bg-amber-400/20"
                    >
                      <Trophy className="h-4 w-4" /> Recap WC26
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowResetModal(true)}
                    className="flex items-center gap-2 rounded-2xl border border-host-canada/28 bg-host-canada/14 px-5 py-3 text-sm font-semibold text-host-ice transition hover:-translate-y-0.5 hover:bg-host-canada/18"
                  >
                    <RotateCcw className="h-4 w-4" /> Thử lại
                  </button>
                </div>
              </div>

              <HeroBranding />
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[28px] border border-host-usa/22 bg-host-usa/12 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-host-ice/55">
                  <CalendarDays className="h-4 w-4" /> Vòng bảng
                </div>
                <div className="mt-2 text-3xl font-bold text-white">
                  {completedGroupMatches}/{totalGroupMatches}
                </div>
                <div className="mt-2 text-sm text-white/60">Trận đã dự đoán</div>
              </div>

              <div className="rounded-[28px] border border-host-mexico/24 bg-host-mexico/12 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-host-ice/55">
                  <Users className="h-4 w-4" /> Đội đi tiếp
                </div>
                <div className="mt-2 text-3xl font-bold text-white">
                  {derivedState.knockoutReady ? derivedState.qualifiedTeamIds.length : '--'}
                </div>
                <div className="mt-2 text-sm text-white/60">Bao gồm Top 8 hạng ba</div>
              </div>

              <div className="rounded-[28px] border border-host-canada/24 bg-host-canada/12 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-host-ice/55">
                  <Swords className="h-4 w-4" /> Knock-out
                </div>
                <div className="mt-2 text-3xl font-bold text-white">
                  {completedKnockoutMatches}/{knockoutMatches.length}
                </div>
                <div className="mt-2 text-sm text-white/60">Trận đã chốt kết quả</div>
              </div>

              <div className="rounded-[28px] border border-white/12 bg-white/[0.06] p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-host-ice/55">
                  <Orbit className="h-4 w-4" /> Champion
                </div>
                <div className="mt-3 flex items-center gap-3 text-xl font-bold text-white">
                  {derivedState.championName ? (
                    <>
                      <ChampionCup size={48} />
                      <Flag teamName={derivedState.championName} size={28} />
                    </>
                  ) : (
                    <WorldCupLogo size={28} />
                  )}
                  <span>{derivedState.championName ?? 'Chưa xác định'}</span>
                </div>
                <div className="mt-2 text-sm text-white/60">Nhà vô địch</div>
              </div>
            </div>
          </div>
        </header>

        <main className="mt-8 space-y-8">
          <section id="group-stage">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="field-label">Group Stage</p>
                <h2 className="mt-2 text-3xl font-bold text-white">12 bảng đấu từ A đến L</h2>
              </div>

              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/65">
                Bảng xếp hạng cập nhật sau mỗi lần bấm Dự đoán
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              {GROUPS.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  matches={coreState.groupMatches.filter((match) => match.group === group.id)}
                  standings={derivedState.standingsByGroup[group.id]}
                  qualifiedThirdIds={qualifiedThirdIds}
                  onPredict={predictGroupMatch}
                />
              ))}
            </div>
          </section>

          <section id="best-third" className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <BestThirdTable
              entries={derivedState.thirdPlaceTable}
              groupStageComplete={derivedState.groupStageComplete}
            />
            <TopScorersTable scorers={derivedState.topScorers} />
          </section>

          <section id="knockout" className="relative left-1/2 w-screen max-w-none -translate-x-1/2 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1880px]">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div className="flex items-center gap-3">
                  <WorldCupLogo size={42} />
                  <div>
                    <p className="field-label">Knock-out Stage</p>
                    <h2 className="mt-1 text-3xl font-bold text-white">Bracket loại trực tiếp</h2>
                  </div>
                </div>

                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/65">
                  Hòa sau 120 phút sẽ đá penalty
                </div>
              </div>

              {derivedState.knockoutReady ? (
                coreState.knockoutVisible ? (
                  <KnockoutBracket
                    knockoutMatches={coreState.knockoutMatches}
                    teamOrigins={derivedState.knockoutTeamOrigins}
                    championName={derivedState.championName}
                    onPredict={predictKnockoutMatch}
                    onResolvePenalty={resolvePenalty}
                  />
                ) : (
                  <div className="brand-shell p-6 sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                      <div>
                        <p className="field-label">Sẵn sàng</p>
                        <h3 className="mt-2 text-2xl font-bold text-white">32 đội đã sẵn sàng vào bracket</h3>
                        <p className="mt-3 text-sm text-white/66">Mở vòng loại trực tiếp.</p>
                      </div>
                      <TriondaBall size={86} className="animate-ball-float" />
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenKnockout}
                      className="mt-5 rounded-2xl border border-host-mexico/35 bg-host-mexico/18 px-5 py-3 text-sm font-semibold text-host-ice transition hover:-translate-y-0.5 hover:bg-host-mexico/24"
                    >
                      Mở Knock-out Stage
                    </button>
                  </div>
                )
              ) : (
                <div className="brand-shell p-6 sm:p-8">
                  <p className="field-label">Locked</p>
                  <h3 className="mt-2 text-2xl font-bold text-white">Hoàn tất vòng bảng để mở bracket</h3>
                  <p className="mt-3 max-w-2xl text-sm text-white/66">Cần đủ 72 trận và Top 8 đội hạng ba.</p>
                </div>
              )}
            </div>
          </section>

          <section id="recap" className="relative left-1/2 w-screen max-w-none -translate-x-1/2 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1640px]">
              <TournamentRecap stats={recapStats} />
            </div>
          </section>
        </main>
      </div>

      <ResetModal isOpen={showResetModal} onClose={() => setShowResetModal(false)} onConfirm={confirmReset} />

      <ChampionModal
        isOpen={showChampionModal}
        championName={derivedState.championName}
        onClose={() => setShowChampionModal(false)}
        onViewRecap={handleViewRecap}
      />
    </div>
  );
}

export default App;
