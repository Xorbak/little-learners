import type { ReactNode } from 'react';
import type { ClipId } from '../../types/learning';
import { narrator } from '../audio/narrator';

/**
 * Words under the pictures, so a grown-up can read along (she goes by the
 * pictures; seeing that words go with pictures is good early reading too).
 * Grown-ups can hide them all (Grown-ups → Words under pictures).
 */
export function Tag({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`tag ${className}`} aria-hidden="true">
      {children}
    </span>
  );
}

/** The words of a clip, tidied for a label ("Pop the balloons!" → "Pop the balloons") */
export const words = (clip: ClipId): string => (narrator.allClips()[clip] ?? '').replace(/[!…:,]+$/u, '').trim();
