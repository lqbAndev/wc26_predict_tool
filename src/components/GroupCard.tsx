import type { GroupMatch, GroupId, Team, TeamStanding } from '../types/tournament';
import { Flag } from './Flag';
import { MatchCard } from './MatchCard';
import { StandingsTable } from './StandingsTable';

interface GroupCardProps {
  group: {
    id: GroupId;
    label: string;
    teams: Team[];
  };
  matches: GroupMatch[];
  standings: TeamStanding[];
  qualifiedThirdIds: Set<string>;
  onPredict: (matchId: string) => void;
  onTeamClick?: (teamId: string) => void;
}

export const GroupCard = ({
  group,
  matches,
  standings,
  qualifiedThirdIds,
  onPredict,
  onTeamClick,
}: GroupCardProps) => {
  const completedMatches = matches.filter((match) => match.status === 'completed').length;

  return (
    <section className="panel p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="field-label">{group.label}</p>
          <h3 className="mt-2 text-2xl font-bold text-white">{group.label}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {group.teams.map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => onTeamClick?.(team.id)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/75 transition-all duration-200 hover:border-white/20 hover:bg-gray-700/50 hover:text-white hover:shadow-[0_2px_12px_rgba(255,255,255,0.06)] active:scale-[0.97]"
              >
                <Flag teamName={team.name} size={20} />
                <span>{team.shortName}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
          {completedMatches}/{matches.length} trận đã chốt
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} onPredict={onPredict} />
        ))}
      </div>

      <div className="mt-5">
        <StandingsTable standings={standings} qualifiedThirdIds={qualifiedThirdIds} />
      </div>
    </section>
  );
};
