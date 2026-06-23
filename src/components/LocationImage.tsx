import { useState } from 'react';

const BASE = import.meta.env.BASE_URL;

interface LocationImageProps {
  locationId: string;
  name: string;
  type: string;
  className?: string;
}

const TYPE_COLORS: Record<string, string> = {
  home: '#22c55e',
  plaza: '#eab308',
  library: '#3b82f6',
  park: '#22c55e',
  market: '#f97316',
  church: '#a855f7',
  monument: '#ec4899',
  cafe: '#f59e0b',
  theatre: '#8b5cf6',
  office: '#6366f1',
  airport: '#ef4444',
};

export default function LocationImage({ locationId, name, type, className = '' }: LocationImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();

  const color = TYPE_COLORS[type] ?? '#e94560';

  if (error) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)` }}
      >
        <span className="text-2xl font-bold" style={{ color }}>
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)` }}
        >
          <span className="text-2xl font-bold" style={{ color }}>
            {initials}
          </span>
        </div>
      )}
      <img
        src={`${BASE}locations/${locationId}.jpg`}
        alt={name}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}