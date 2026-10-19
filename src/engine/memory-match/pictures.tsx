/** Card back: a cheeky whoopee cushion */
export function CardBack() {
  return (
    <svg viewBox="0 0 100 100" width="78%" height="78%" aria-hidden="true">
      {/* the nozzle, poking out to the side */}
      <path d="M72 58 l20 8 a4 4 0 0 1 2 6 l-3 6 a4 4 0 0 1 -6 1 l-18 -10z" fill="#f06595" />
      <ellipse cx="91" cy="73" rx="3" ry="5" fill="#c2255c" transform="rotate(25 91 73)" />
      {/* the flat, squishy cushion */}
      <ellipse cx="44" cy="56" rx="38" ry="26" fill="#f06595" />
      <ellipse cx="44" cy="50" rx="38" ry="23" fill="#ff8fab" />
      <ellipse cx="28" cy="40" rx="10" ry="5" fill="#fff" opacity="0.5" transform="rotate(-15 28 40)" />
      {/* a cheeky face */}
      <circle cx="35" cy="50" r="3.5" fill="#5c3a4a" />
      <circle cx="53" cy="50" r="3.5" fill="#5c3a4a" />
      <path d="M37 58 q7 6 14 0" stroke="#5c3a4a" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** The bonus stinky card: a green cloud holding its nose */
export function StinkyCloud({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      {/* wiggly stink lines */}
      <path d="M22 26 q-6 -8 0 -16" stroke="#94d82d" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M50 20 q-6 -8 0 -16" stroke="#94d82d" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M78 26 q-6 -8 0 -16" stroke="#94d82d" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* the cloud */}
      <g fill="#a9e34b" stroke="#74b816" strokeWidth="3">
        <circle cx="30" cy="58" r="20" />
        <circle cx="50" cy="44" r="22" />
        <circle cx="70" cy="58" r="20" />
        <rect x="26" y="56" width="48" height="24" rx="12" stroke="none" />
      </g>
      <rect x="26" y="56" width="48" height="22" rx="11" fill="#a9e34b" />
      {/* squeezed-shut eyes and a wobbly mouth */}
      <path d="M36 52 l6 4 l-6 4" stroke="#2b2d42" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M64 52 l-6 4 l6 4" stroke="#2b2d42" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 70 q5 -4 10 0 t10 0" stroke="#2b2d42" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* a hand pinching its nose */}
      <ellipse cx="50" cy="60" rx="7" ry="5" fill="#ffd8a8" stroke="#e8590c" strokeWidth="2" />
    </svg>
  );
}
