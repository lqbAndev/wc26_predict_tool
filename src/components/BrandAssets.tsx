import championCup24 from '../img/icons8-fifa-world-cup-24.png';
import championCup48 from '../img/icons8-fifa-world-cup-48.png';
import championCup96 from '../img/icons8-fifa-world-cup-96.png';
import worldCupLogo from '../img/tournaments_fifa-world-cup-2026--white_512x512.football-logos.cc.png';
import triondaBall from '../img/trionda-wc2026.png';

interface BrandAssetProps {
  size?: number;
  className?: string;
}

const pickChampionCupAsset = (size: number) => {
  if (size <= 24) {
    return championCup24;
  }

  if (size <= 48) {
    return championCup48;
  }

  return championCup96;
};

export const WorldCupLogo = ({ size = 88, className = '' }: BrandAssetProps) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-host-usa/18 via-white/6 to-host-canada/16 blur-xl" />
      <img
        src={worldCupLogo}
        alt="Logo FIFA World Cup 2026"
        width={size}
        height={size}
        className="relative h-full w-full object-contain drop-shadow-[0_18px_30px_rgba(8,12,24,0.45)]"
      />
    </div>
  );
};

export const TriondaBall = ({ size = 104, className = '' }: BrandAssetProps) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-host-mexico/16 via-white/8 to-host-canada/14 blur-2xl" />
      <img
        src={triondaBall}
        alt="Bóng Trionda World Cup 2026"
        width={size}
        height={size}
        className="relative h-full w-full object-contain drop-shadow-[0_22px_35px_rgba(8,12,24,0.5)]"
      />
    </div>
  );
};

export const ChampionCup = ({ size = 48, className = '' }: BrandAssetProps) => {
  const trophySrc = pickChampionCupAsset(size);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(231,184,73,0.28),rgba(255,255,255,0)_68%)] blur-xl" />
      <img
        src={trophySrc}
        alt="Cúp vô địch World Cup"
        width={size}
        height={size}
        className="relative h-full w-full object-contain drop-shadow-[0_18px_30px_rgba(8,12,24,0.45)]"
      />
    </div>
  );
};
