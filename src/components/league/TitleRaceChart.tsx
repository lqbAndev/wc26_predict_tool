/**
 * TitleRaceChart — Line chart tracking points progression of top 4 teams.
 */

import { useMemo } from 'react';
import type { LeagueStanding } from '../../types/leagueConfig';
import type { LeagueMatch } from '../../types/leagueConfig';

interface TitleRaceChartProps {
  standings: LeagueStanding[];
  fixtures: LeagueMatch[];
  totalRounds: number;
}

interface TeamPointsHistory {
  teamId: string;
  teamName: string;
  color: string;
  points: number[];
}

const CHART_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Amber
];

export default function TitleRaceChart({ standings, fixtures, totalRounds }: TitleRaceChartProps) {
  const chartData = useMemo(() => {
    // Get top 4 teams
    const top4 = standings.slice(0, 4);
    if (top4.length === 0) return [];

    // Calculate points history for each team
    const history: TeamPointsHistory[] = top4.map((standing, index) => {
      const pointsHistory: number[] = [0]; // Start with 0 points

      // Calculate cumulative points after each matchweek
      for (let mw = 1; mw <= totalRounds; mw++) {
        const teamMatches = fixtures.filter(
          (f) =>
            f.matchweek <= mw &&
            f.status === 'completed' &&
            (f.homeTeamId === standing.teamId || f.awayTeamId === standing.teamId),
        );

        let totalPoints = 0;
        for (const match of teamMatches) {
          const isHome = match.homeTeamId === standing.teamId;
          const teamScore = isHome ? match.homeScore! : match.awayScore!;
          const opponentScore = isHome ? match.awayScore! : match.homeScore!;

          if (teamScore > opponentScore) totalPoints += 3;
          else if (teamScore === opponentScore) totalPoints += 1;
        }

        pointsHistory.push(totalPoints);
      }

      return {
        teamId: standing.teamId,
        teamName: standing.teamName,
        color: CHART_COLORS[index % CHART_COLORS.length],
        points: pointsHistory,
      };
    });

    return history;
  }, [standings, fixtures, totalRounds]);

  if (chartData.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">Title Race</h2>
        <p className="text-white/60">No data available yet. Simulate some matches to see the title race!</p>
      </div>
    );
  }

  // Chart dimensions
  const width = 800;
  const height = 400;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const maxPoints = Math.max(...chartData.flatMap((d) => d.points), 42);
  const xScale = (matchweek: number) => (matchweek / totalRounds) * chartWidth;
  const yScale = (points: number) => chartHeight - (points / maxPoints) * chartHeight;

  // Generate path for each team
  const generatePath = (points: number[]) => {
    const pathParts = points.map((p, i) => {
      const x = xScale(i);
      const y = yScale(p);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    });
    return pathParts.join(' ');
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-4">Title Race</h2>

      <div className="overflow-x-auto">
        <svg
          width={width}
          height={height}
          className="mx-auto"
          style={{ maxWidth: '100%', height: 'auto' }}
        >
          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {/* Grid lines */}
            {[0, 10, 20, 30, 40].map((points) => (
              <g key={points}>
                <line
                  x1={0}
                  y1={yScale(points)}
                  x2={chartWidth}
                  y2={yScale(points)}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth={1}
                />
                <text
                  x={-10}
                  y={yScale(points)}
                  fill="rgba(255, 255, 255, 0.6)"
                  fontSize={12}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {points}
                </text>
              </g>
            ))}

            {/* X-axis labels */}
            {Array.from({ length: Math.min(totalRounds + 1, 15) }, (_, i) =>
              Math.floor((i * totalRounds) / 14),
            ).map((mw) => (
              <text
                key={mw}
                x={xScale(mw)}
                y={chartHeight + 25}
                fill="rgba(255, 255, 255, 0.6)"
                fontSize={12}
                textAnchor="middle"
              >
                {mw}
              </text>
            ))}

            {/* Lines for each team */}
            {chartData.map((team) => (
              <path
                key={team.teamId}
                d={generatePath(team.points)}
                fill="none"
                stroke={team.color}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Points for each team (current position) */}
            {chartData.map((team) => {
              const lastMatchweek = team.points.length - 1;
              const lastPoints = team.points[lastMatchweek];
              return (
                <circle
                  key={`point-${team.teamId}`}
                  cx={xScale(lastMatchweek)}
                  cy={yScale(lastPoints)}
                  r={5}
                  fill={team.color}
                  stroke="white"
                  strokeWidth={2}
                />
              );
            })}

            {/* Axis labels */}
            <text
              x={chartWidth / 2}
              y={chartHeight + 40}
              fill="rgba(255, 255, 255, 0.8)"
              fontSize={14}
              textAnchor="middle"
              fontWeight="bold"
            >
              Matchweek
            </text>
            <text
              x={-chartHeight / 2}
              y={-35}
              fill="rgba(255, 255, 255, 0.8)"
              fontSize={14}
              textAnchor="middle"
              fontWeight="bold"
              transform={`rotate(-90, -${chartHeight / 2}, -35)`}
            >
              Points
            </text>
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        {chartData.map((team) => (
          <div key={team.teamId} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: team.color }}
            />
            <span className="text-sm text-white font-semibold">
              {team.teamName} ({team.points[team.points.length - 1]} pts)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
