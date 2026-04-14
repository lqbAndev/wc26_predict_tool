import { X } from 'lucide-react';
import ReactConfetti from 'react-confetti';
import { useEffect, useState } from 'react';
import { Flag } from './Flag';
import { ChampionCup, TriondaBall, WorldCupLogo } from './BrandAssets';

interface ChampionModalProps {
  championName: string | null;
  isOpen: boolean;
  onClose: () => void;
  onViewRecap?: () => void;
}

export const ChampionModal = ({ championName, isOpen, onClose, onViewRecap }: ChampionModalProps) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, [isOpen]);

  if (!isOpen || !championName) return null;

  const handleViewRecap = () => {
    onClose();
    onViewRecap?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0 z-0">
        <ReactConfetti width={dimensions.width} height={dimensions.height} recycle numberOfPieces={220} />
      </div>
      <div className="fixed inset-0 z-10 bg-black/82 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="brand-shell relative z-20 w-full max-w-xl overflow-hidden p-8 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(30,64,175,0.22),transparent_32%),radial-gradient(circle_at_bottom,rgba(165,52,72,0.18),transparent_34%)]" />

        <button
          onClick={onClose}
          aria-label="Đóng"
          title="Đóng"
          className="absolute right-5 top-5 z-30 rounded-full bg-white/6 p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative z-20">
          <div className="flex items-center justify-center gap-5">
            <WorldCupLogo size={72} />
            <ChampionCup size={96} />
            <TriondaBall size={80} className="animate-ball-float" />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-host-ice/62">
            World Cup 2026 Champion
          </p>

          <div className="mt-5 flex items-center justify-center gap-4">
            <Flag teamName={championName} size={42} />
            <h3 className="bg-gradient-to-r from-white to-host-ice/80 bg-clip-text text-4xl font-black text-transparent sm:text-5xl">
              {championName}
            </h3>
          </div>

          <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-white/72">
            Chúc mừng {championName} đã chạm tới đỉnh cao World Cup 2026 trong phiên bản dự đoán này.
          </p>

          <button
            type="button"
            onClick={handleViewRecap}
            className="mt-8 w-full rounded-2xl border border-host-mexico/35 bg-host-mexico/18 px-5 py-4 text-sm font-bold text-host-ice transition hover:scale-[1.02] hover:bg-host-mexico/24"
          >
            Đóng và xem Recap giải đấu
          </button>
        </div>
      </div>
    </div>
  );
};
