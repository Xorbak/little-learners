import { useEffect, useState } from 'react';
import { narrator } from './narrator';

/** true while the narrator is talking (for "listen first": cards wait until the question has been asked) */
export function useSpeaking(): boolean {
  const [speaking, setSpeaking] = useState(narrator.isSpeaking());
  useEffect(() => {
    const off = narrator.onSpeaking(setSpeaking);
    // The game inside may already have started asking (its effects run before ours)
    setSpeaking(narrator.isSpeaking());
    return off;
  }, []);
  return speaking;
}
