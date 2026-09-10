import type { RoadSign } from '../data/types';

interface Props {
  sign: RoadSign;
  className?: string;
}

export function SignVisual({ sign, className = '' }: Props) {
  const label = sign.code;
  switch (sign.shape) {
    case 'triangle':
      return (
        <svg className={className} viewBox="0 0 100 100" aria-hidden>
          <polygon
            points="50,8 92,88 8,88"
            fill={sign.category === 'pirmenybes' && sign.id === 's-duoti-kelia' ? '#fff' : '#fff'}
            stroke="#e03131"
            strokeWidth="7"
            strokeLinejoin="round"
          />
          {sign.id === 's-duoti-kelia' ? (
            <polygon points="50,28 74,72 26,72" fill="#fff" stroke="#e03131" strokeWidth="3" />
          ) : (
            <text
              x="50"
              y="68"
              textAnchor="middle"
              fontSize="16"
              fontWeight="700"
              fill="#1a1a1a"
              fontFamily="Outfit, sans-serif"
            >
              !
            </text>
          )}
        </svg>
      );
    case 'octagon':
      return (
        <svg className={className} viewBox="0 0 100 100" aria-hidden>
          <polygon
            points="30,8 70,8 92,30 92,70 70,92 30,92 8,70 8,30"
            fill="#e03131"
            stroke="#fff"
            strokeWidth="4"
          />
          <text
            x="50"
            y="58"
            textAnchor="middle"
            fontSize="18"
            fontWeight="800"
            fill="#fff"
            fontFamily="Outfit, sans-serif"
          >
            STOP
          </text>
        </svg>
      );
    case 'diamond':
      return (
        <svg className={className} viewBox="0 0 100 100" aria-hidden>
          <rect
            x="50"
            y="12"
            width="54"
            height="54"
            rx="4"
            transform="rotate(45 50 12)"
            fill={sign.id.includes('pab') ? '#fff' : '#f5c518'}
            stroke={sign.id.includes('pab') ? '#f5c518' : '#1a1a1a'}
            strokeWidth="4"
          />
          {sign.id.includes('pab') && (
            <line x1="28" y1="28" x2="72" y2="72" stroke="#1a1a1a" strokeWidth="4" />
          )}
        </svg>
      );
    case 'circle-red':
      return (
        <svg className={className} viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="40" fill="#fff" stroke="#e03131" strokeWidth="8" />
          {sign.id === 's-ivaziuoti-draudziama' ? (
            <rect x="22" y="44" width="56" height="12" rx="2" fill="#e03131" />
          ) : sign.id === 's-greicio-apribojimas' ? (
            <text
              x="50"
              y="58"
              textAnchor="middle"
              fontSize="28"
              fontWeight="800"
              fill="#1a1a1a"
              fontFamily="Outfit, sans-serif"
            >
              50
            </text>
          ) : sign.id === 's-lenkti-draudziama' ? (
            <>
              <circle cx="38" cy="55" r="8" fill="none" stroke="#1a1a1a" strokeWidth="3" />
              <circle cx="58" cy="40" r="8" fill="none" stroke="#e03131" strokeWidth="3" />
              <line x1="22" y1="78" x2="78" y2="22" stroke="#e03131" strokeWidth="6" />
            </>
          ) : sign.id.includes('sustoti') || sign.id.includes('stoveti') ? (
            <>
              <circle cx="50" cy="50" r="18" fill="none" stroke="#1a1a1a" strokeWidth="4" />
              <line
                x1={sign.id.includes('sustoti') ? 25 : 30}
                y1={sign.id.includes('sustoti') ? 75 : 70}
                x2={sign.id.includes('sustoti') ? 75 : 70}
                y2={sign.id.includes('sustoti') ? 25 : 30}
                stroke="#e03131"
                strokeWidth="6"
              />
            </>
          ) : (
            <text
              x="50"
              y="56"
              textAnchor="middle"
              fontSize="14"
              fontWeight="700"
              fill="#1a1a1a"
              fontFamily="Outfit, sans-serif"
            >
              {label}
            </text>
          )}
        </svg>
      );
    case 'circle-blue':
      return (
        <svg className={className} viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="40" fill="#1c7ed6" />
          {sign.id === 's-ratus-eismas' ? (
            <path
              d="M50 28a22 22 0 1 1-15.5 6.5"
              fill="none"
              stroke="#fff"
              strokeWidth="5"
              strokeLinecap="round"
            />
          ) : sign.id.includes('dviraciu') ? (
            <>
              <circle cx="34" cy="58" r="10" fill="none" stroke="#fff" strokeWidth="3" />
              <circle cx="66" cy="58" r="10" fill="none" stroke="#fff" strokeWidth="3" />
              <path d="M34 58 L50 35 L66 58 M50 35 V48" stroke="#fff" strokeWidth="3" fill="none" />
            </>
          ) : sign.id.includes('pesciuju') ? (
            <path
              d="M50 28c3 0 5 2 5 5s-2 5-5 5-5-2-5-5 2-5 5-5zm-6 14h12l-2 18h-3l-1 16h-4l-1-16h-3z"
              fill="#fff"
            />
          ) : (
            <path
              d="M42 30v40M42 30l20 12L42 54"
              fill="none"
              stroke="#fff"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      );
    case 'rectangle':
      return (
        <svg className={className} viewBox="0 0 100 100" aria-hidden>
          <rect
            x="12"
            y="18"
            width="76"
            height="64"
            rx="6"
            fill={sign.category === 'papildomi' ? '#fff' : '#1c7ed6'}
            stroke={sign.category === 'papildomi' ? '#1a1a1a' : 'none'}
            strokeWidth="3"
          />
          {sign.id === 's-gyvenamoji' ? (
            <>
              <rect x="28" y="36" width="28" height="28" fill="#fff" />
              <rect x="58" y="48" width="16" height="16" fill="#fff" />
              <circle cx="36" cy="70" r="5" fill="#212529" />
              <circle cx="66" cy="70" r="5" fill="#212529" />
            </>
          ) : sign.id === 's-pereja-info' ? (
            <>
              <rect x="30" y="30" width="12" height="40" fill="#fff" />
              <rect x="58" y="30" width="12" height="40" fill="#fff" />
              <path d="M48 35c2 0 4 2 4 4s-2 4-4 4-4-2-4-4 2-4 4-4zM44 46h8v20h-3v12h-4V66h-3z" fill="#fff" />
            </>
          ) : sign.category === 'papildomi' ? (
            <text
              x="50"
              y="56"
              textAnchor="middle"
              fontSize="14"
              fontWeight="700"
              fill="#1a1a1a"
              fontFamily="Outfit, sans-serif"
            >
              {sign.code}
            </text>
          ) : (
            <text
              x="50"
              y="56"
              textAnchor="middle"
              fontSize="20"
              fontWeight="800"
              fill="#fff"
              fontFamily="Outfit, sans-serif"
            >
              {sign.id.includes('automagistrale') ? 'A' : 'P'}
            </text>
          )}
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 100 100" aria-hidden>
          <rect x="15" y="15" width="70" height="70" rx="8" fill="#2a3444" />
        </svg>
      );
  }
}
