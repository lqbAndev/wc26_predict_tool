import { TriondaBall, WorldCupLogo } from './BrandAssets';
import { TEAM_FLAG_MAP } from '../data/flagMap';

const HOST_CHIPS = [
  {
    label: 'United States',
    flagKey: 'United States',
    className: 'border-host-usa/30 bg-host-usa/15 text-host-ice',
  },
  {
    label: 'Mexico',
    flagKey: 'Mexico',
    className: 'border-host-mexico/30 bg-host-mexico/15 text-host-ice',
  },
  {
    label: 'Canada',
    flagKey: 'Canada',
    className: 'border-host-canada/30 bg-host-canada/15 text-host-ice',
  },
] as const;

export const HeroBranding = () => {
  return (
    <div className="brand-shell isolate overflow-hidden p-5 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,89,161,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(24,115,91,0.16),transparent_32%)]" />

      <div className="relative flex flex-col gap-5">
        <div className="flex items-center justify-between gap-2">
          <WorldCupLogo size={108} />
          <h2 className="text-2xl font-bold text-white">FIFA WORLD CUP 2026</h2>
          <TriondaBall size={96} className="shrink-0 animate-ball-float" />
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {HOST_CHIPS.map((chip) => (
            <div
              key={chip.label}
              className={`rounded-[22px] border px-3 py-3 ${chip.className}`}
            >
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em]">
                <img
                  src={TEAM_FLAG_MAP[chip.flagKey]}
                  alt={`${chip.label} flag`}
                  className="h-4 w-4 rounded-sm object-cover"
                />
                <span>{chip.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
