import { useState } from 'react';

interface StarsDisplayProps {
  rating: number;
  max?: number;
  size?: number;
}

export function StarsDisplay({ rating, max = 5, size = 18 }: StarsDisplayProps) {
  const full = Math.floor(rating);
  const partial = rating - full;

  return (
    <span className="stars" aria-label={`${rating} out of ${max}`}>
      {Array.from({ length: max }, (_, i) => {
        let fill = 0;
        if (i < full) fill = 100;
        else if (i === full) fill = Math.round(partial * 100);

        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" className="star">
            <defs>
              <linearGradient id={`star-fill-${i}-${rating}`}>
                <stop offset={`${fill}%`} stopColor="currentColor" />
                <stop offset={`${fill}%`} stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={`url(#star-fill-${i}-${rating})`}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </span>
  );
}

interface StarsInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: number;
}

export function StarsInput({ value, onChange, max = 5, size = 28 }: StarsInputProps) {
  const [hover, setHover] = useState(0);

  return (
    <span className="stars stars-input" onMouseLeave={() => setHover(0)}>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const active = starValue <= (hover || value);

        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={`star ${active ? 'star-active' : ''}`}
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHover(starValue)}
            style={{ cursor: 'pointer' }}
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={active ? 'currentColor' : 'transparent'}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </span>
  );
}
