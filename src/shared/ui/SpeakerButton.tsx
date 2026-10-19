/** Big round button that repeats the instruction */
export function SpeakerButton({ onPress }: { onPress: () => void }) {
  return (
    <button type="button" className="round-btn round-btn--speaker" onClick={onPress} aria-label="Say it again">
      <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
        <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </button>
  );
}
