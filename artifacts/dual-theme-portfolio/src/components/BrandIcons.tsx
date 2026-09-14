import type { CSSProperties } from 'react';
import matplotlibLogo from '../assets/matplotlib.svg';
import seabornLogo from '../assets/seaborn.svg';

type BrandIconProps = { size?: number; className?: string; style?: CSSProperties };

/**
 * Official brand logos (multicolor artwork) bundled locally:
 * - Matplotlib: devicon (official logo)
 * - Seaborn: gilbarbara/logos (official logo)
 * react-icons no longer ships either brand, so these render the real logos.
 * Bundling locally (instead of a CDN) guarantees they always load.
 */
export function MatplotlibIcon({ size = 16, className, style }: BrandIconProps) {
  return (
    <img
      src={matplotlibLogo}
      alt="Matplotlib"
      width={size}
      height={size}
      className={className}
      style={{ ...style, objectFit: 'contain' }}
      loading="lazy"
    />
  );
}

export function SeabornIcon({ size = 16, className, style }: BrandIconProps) {
  return (
    <img
      src={seabornLogo}
      alt="Seaborn"
      width={size}
      height={size}
      className={className}
      style={{ ...style, objectFit: 'contain' }}
      loading="lazy"
    />
  );
}
