import type { RoadSign } from '../data/types';

interface Props {
  sign: RoadSign;
  className?: string;
}

/** Official KET 2026 appendix crop (`public/signs/{code}.png`). */
export function SignVisual({ sign, className = '' }: Props) {
  return (
    <img
      className={className}
      src={`/signs/${sign.code}.png`}
      alt={`${sign.code}. ${sign.name}`}
      width={176}
      height={176}
      draggable={false}
    />
  );
}
