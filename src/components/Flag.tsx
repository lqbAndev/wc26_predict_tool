import { useState } from 'react';
import { FLAG_FALLBACK_PATH, getTeamFlagSrc } from '../data/flagMap';

interface FlagProps {
  teamName?: string | null;
  flagSrc?: string;
  size?: number;
  className?: string;
}

export const Flag = ({ teamName, flagSrc, size = 24, className = '' }: FlagProps) => {
  const [hasError, setHasError] = useState(false);
  const src = hasError ? FLAG_FALLBACK_PATH : flagSrc ?? getTeamFlagSrc(teamName);
  const height = Math.round(size * 0.72);
  const alt = teamName ? `Cờ của ${teamName}` : 'Cờ đội tuyển';

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[6px] border border-white/10 bg-white/5 shadow-[0_4px_14px_rgba(0,0,0,0.2)] ${className}`}
      style={{ width: size, height }}
    >
      <img
        src={src}
        alt={alt}
        width={size}
        height={height}
        loading="lazy"
        onError={() => setHasError(true)}
        className="h-full w-full object-cover"
      />
    </span>
  );
};
