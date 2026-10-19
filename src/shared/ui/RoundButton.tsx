import type { ReactNode } from 'react';

interface Props {
  label: string;
  onPress: () => void;
  children: ReactNode;
  variant?: 'home' | 'play' | 'plain';
  className?: string;
}

/** Big, friendly, icon-only button sized for small fingers */
export function RoundButton({ label, onPress, children, variant = 'plain', className = '' }: Props) {
  return (
    <button type="button" className={`round-btn round-btn--${variant} ${className}`} onClick={onPress} aria-label={label}>
      {children}
    </button>
  );
}

export const HomeIcon = () => (
  <svg viewBox="0 0 24 24" width="38" height="38" aria-hidden="true">
    <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="currentColor" />
  </svg>
);

export const PlayIcon = ({ size = 48 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor" />
  </svg>
);

export const BackIcon = () => (
  <svg viewBox="0 0 24 24" width="38" height="38" aria-hidden="true">
    <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
