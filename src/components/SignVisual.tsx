import type { ReactNode } from 'react';
import type { RoadSign } from '../data/types';

interface Props {
  sign: RoadSign;
  className?: string;
}

function Triangle({
  children,
  inverted = false,
}: {
  children?: ReactNode;
  inverted?: boolean;
}) {
  const points = inverted ? '50,92 8,12 92,12' : '50,8 92,88 8,88';
  return (
    <>
      <polygon
        points={points}
        fill="#fff"
        stroke="#e03131"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      {children}
    </>
  );
}

function CircleRed({ children }: { children?: ReactNode }) {
  return (
    <>
      <circle cx="50" cy="50" r="40" fill="#fff" stroke="#e03131" strokeWidth="8" />
      {children}
    </>
  );
}

function CircleBlue({ children }: { children?: ReactNode }) {
  return (
    <>
      <circle cx="50" cy="50" r="40" fill="#1c7ed6" />
      {children}
    </>
  );
}

function Glyph({ sign }: { sign: RoadSign }) {
  switch (sign.id) {
    case 's-duoti-kelia':
      return <Triangle inverted />;
    case 's-pervaza-uztvaras':
      return (
        <Triangle>
          <rect x="22" y="48" width="56" height="8" fill="#1a1a1a" />
          <rect x="28" y="40" width="8" height="24" fill="#e03131" />
          <rect x="44" y="40" width="8" height="24" fill="#fff" stroke="#1a1a1a" strokeWidth="1" />
          <rect x="60" y="40" width="8" height="24" fill="#e03131" />
        </Triangle>
      );
    case 's-vaikai':
      return (
        <Triangle>
          <circle cx="38" cy="42" r="4" fill="#1a1a1a" />
          <path d="M38 48 v18 M32 54 h12 M34 66 l-6 10 M42 66 l6 10" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="58" cy="46" r="3.5" fill="#1a1a1a" />
          <path d="M58 51 v14 M53 56 h10 M55 65 l-4 8 M61 65 l5 8" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </Triangle>
      );
    case 's-ziedine':
      return (
        <Triangle>
          <circle cx="50" cy="58" r="14" fill="none" stroke="#1a1a1a" strokeWidth="4" />
          <polygon points="62,48 70,52 62,56" fill="#1a1a1a" />
        </Triangle>
      );
    case 's-pereja':
      return (
        <Triangle>
          <rect x="28" y="42" width="8" height="32" fill="#1a1a1a" />
          <rect x="44" y="42" width="8" height="32" fill="#1a1a1a" />
          <rect x="60" y="42" width="8" height="32" fill="#1a1a1a" />
        </Triangle>
      );
    case 's-pestieji':
      return (
        <Triangle>
          <circle cx="50" cy="40" r="5" fill="#1a1a1a" />
          <path d="M50 46 v20 M42 54 h16 M44 66 l-6 12 M56 66 l6 12" stroke="#1a1a1a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </Triangle>
      );
    case 's-dviratininkai':
      return (
        <Triangle>
          <circle cx="36" cy="66" r="9" fill="none" stroke="#1a1a1a" strokeWidth="3" />
          <circle cx="64" cy="66" r="9" fill="none" stroke="#1a1a1a" strokeWidth="3" />
          <path d="M36 66 L50 44 L64 66 M50 44 V56" stroke="#1a1a1a" strokeWidth="3" fill="none" />
        </Triangle>
      );
    case 's-kiti-pavojai':
      return (
        <Triangle>
          <text x="50" y="70" textAnchor="middle" fontSize="28" fontWeight="800" fill="#1a1a1a" fontFamily="Outfit, sans-serif">
            !
          </text>
        </Triangle>
      );
    case 's-iskeistas':
      return (
        <Triangle>
          <path d="M22 72 L40 72 L50 48 L60 72 L78 72" fill="none" stroke="#1a1a1a" strokeWidth="5" strokeLinejoin="round" />
        </Triangle>
      );
    case 's-stop':
      return (
        <>
          <polygon
            points="30,8 70,8 92,30 92,70 70,92 30,92 8,70 8,30"
            fill="#e03131"
            stroke="#fff"
            strokeWidth="4"
          />
          <text x="50" y="58" textAnchor="middle" fontSize="16" fontWeight="800" fill="#fff" fontFamily="Outfit, sans-serif">
            STOP
          </text>
        </>
      );
    case 's-pagrindinis':
      return (
        <rect x="50" y="12" width="54" height="54" rx="4" transform="rotate(45 50 12)" fill="#f5c518" stroke="#1a1a1a" strokeWidth="4" />
      );
    case 's-pagrindinis-pab':
      return (
        <>
          <rect x="50" y="12" width="54" height="54" rx="4" transform="rotate(45 50 12)" fill="#fff" stroke="#1a1a1a" strokeWidth="4" />
          <line x1="28" y1="28" x2="72" y2="72" stroke="#1a1a1a" strokeWidth="4" />
        </>
      );
    case 's-ivaziuoti-draudziama':
      return (
        <>
          <circle cx="50" cy="50" r="40" fill="#e03131" />
          <rect x="22" y="44" width="56" height="12" rx="2" fill="#fff" />
        </>
      );
    case 's-eismas-draudziamas':
      return <CircleRed />;
    case 's-greicio-apribojimas':
      return (
        <CircleRed>
          <text x="50" y="60" textAnchor="middle" fontSize="28" fontWeight="800" fill="#1a1a1a" fontFamily="Outfit, sans-serif">
            50
          </text>
        </CircleRed>
      );
    case 's-lenkti-draudziama':
      return (
        <CircleRed>
          <circle cx="38" cy="55" r="8" fill="none" stroke="#1a1a1a" strokeWidth="3" />
          <circle cx="58" cy="40" r="8" fill="none" stroke="#e03131" strokeWidth="3" />
          <line x1="22" y1="78" x2="78" y2="22" stroke="#e03131" strokeWidth="6" />
        </CircleRed>
      );
    case 's-sustoti-draudziama':
      return (
        <CircleRed>
          <circle cx="50" cy="50" r="18" fill="none" stroke="#1a1a1a" strokeWidth="4" />
          <line x1="25" y1="75" x2="75" y2="25" stroke="#e03131" strokeWidth="6" />
        </CircleRed>
      );
    case 's-stoveti-draudziama':
      return (
        <CircleRed>
          <circle cx="50" cy="50" r="18" fill="none" stroke="#1a1a1a" strokeWidth="4" />
          <line x1="30" y1="70" x2="70" y2="30" stroke="#e03131" strokeWidth="6" />
        </CircleRed>
      );
    case 's-mikro-draudziama':
      return (
        <CircleRed>
          <circle cx="38" cy="58" r="8" fill="none" stroke="#1a1a1a" strokeWidth="3" />
          <path d="M46 58 L58 40 L70 58 M58 40 V50" stroke="#1a1a1a" strokeWidth="3" fill="none" />
          <line x1="22" y1="78" x2="78" y2="22" stroke="#e03131" strokeWidth="6" />
        </CircleRed>
      );
    case 's-ratus-eismas':
      return (
        <CircleBlue>
          <circle cx="50" cy="50" r="16" fill="none" stroke="#fff" strokeWidth="5" />
          <polygon points="64,40 74,46 64,52" fill="#fff" />
        </CircleBlue>
      );
    case 's-dviraciu-takas':
      return (
        <CircleBlue>
          <circle cx="34" cy="58" r="10" fill="none" stroke="#fff" strokeWidth="3" />
          <circle cx="66" cy="58" r="10" fill="none" stroke="#fff" strokeWidth="3" />
          <path d="M34 58 L50 35 L66 58 M50 35 V48" stroke="#fff" strokeWidth="3" fill="none" />
        </CircleBlue>
      );
    case 's-pesciuju-takas':
      return (
        <CircleBlue>
          <circle cx="50" cy="32" r="6" fill="#fff" />
          <path d="M50 40 v22 M40 50 h20 M44 62 l-8 14 M56 62 l8 14" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
        </CircleBlue>
      );
    case 's-judeti-desinen':
      return (
        <CircleBlue>
          <path d="M28 50 h32 l-10 -12 M60 50 l-10 12" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </CircleBlue>
      );
    case 's-judeti-tiesiai':
      return (
        <CircleBlue>
          <path d="M50 72 V32 l-12 12 M50 32 l12 12" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </CircleBlue>
      );
    case 's-apvaziuoti-desine':
      return (
        <CircleBlue>
          <rect x="28" y="36" width="12" height="28" rx="2" fill="#fff" />
          <path d="M46 64 Q70 50 46 36" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
        </CircleBlue>
      );
    case 's-gyvenamoji':
      return (
        <>
          <rect x="12" y="18" width="76" height="64" rx="6" fill="#1c7ed6" />
          <rect x="28" y="36" width="28" height="28" fill="#fff" />
          <rect x="58" y="48" width="16" height="16" fill="#fff" />
          <circle cx="36" cy="70" r="5" fill="#212529" />
          <circle cx="66" cy="70" r="5" fill="#212529" />
        </>
      );
    case 's-pereja-info':
      return (
        <>
          <rect x="12" y="18" width="76" height="64" rx="6" fill="#1c7ed6" />
          <rect x="30" y="30" width="12" height="40" fill="#fff" />
          <rect x="58" y="30" width="12" height="40" fill="#fff" />
          <path d="M48 35c2 0 4 2 4 4s-2 4-4 4-4-2-4-4 2-4 4-4zM44 46h8v20h-3v12h-4V66h-3z" fill="#fff" />
        </>
      );
    case 's-automagistrale':
      return (
        <>
          <rect x="12" y="18" width="76" height="64" rx="6" fill="#1c7ed6" />
          <text x="50" y="58" textAnchor="middle" fontSize="22" fontWeight="800" fill="#fff" fontFamily="Outfit, sans-serif">
            A
          </text>
        </>
      );
    case 's-stovejimo':
      return (
        <>
          <rect x="12" y="18" width="76" height="64" rx="6" fill="#1c7ed6" />
          <text x="50" y="58" textAnchor="middle" fontSize="28" fontWeight="800" fill="#fff" fontFamily="Outfit, sans-serif">
            P
          </text>
        </>
      );
    default:
      if (sign.category === 'papildomi') {
        return (
          <>
            <rect x="12" y="28" width="76" height="44" rx="4" fill="#fff" stroke="#1a1a1a" strokeWidth="3" />
            <text x="50" y="56" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1a1a1a" fontFamily="Outfit, sans-serif">
              {sign.code}
            </text>
          </>
        );
      }
      return <rect x="15" y="15" width="70" height="70" rx="8" fill="#2a3444" />;
  }
}

export function SignVisual({ sign, className = '' }: Props) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden>
      <Glyph sign={sign} />
    </svg>
  );
}
