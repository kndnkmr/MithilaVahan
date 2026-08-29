// ============================================
// Logo — MithilaVahan brand mark + wordmark
// ============================================
// A small SVG "badge" (a stylised vehicle in motion inside a rounded square)
// paired with the wordmark. Mirrors Promedicoz's "icon + text" brand pattern,
// but uses a real drawn mark instead of an emoji so it reads as a proper logo.
//
// Props:
//   size      - pixel size of the square mark (default 30)
//   showText  - render the "MithilaVahan" wordmark next to the mark (default true)
//   className - extra classes on the wrapper

export default function Logo({ size = 30, showText = true, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      {showText && (
        <span className="font-extrabold tracking-tight leading-none text-brand-600 text-base sm:text-lg">
          Mithila<span className="text-brand-500">Vahan</span>
        </span>
      )}
    </span>
  );
}

// The square mark on its own — reused for favicons/manifest icons too.
export function LogoMark({ size = 30 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="MithilaVahan"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="mvGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e07a2f" />
          <stop offset="1" stopColor="#c9611b" />
        </linearGradient>
      </defs>
      {/* rounded badge */}
      <rect x="0" y="0" width="64" height="64" rx="16" fill="url(#mvGrad)" />
      {/* speed lines behind the vehicle — sense of motion */}
      <g stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2.4" strokeLinecap="round">
        <line x1="8" y1="26" x2="20" y2="26" />
        <line x1="6" y1="33" x2="16" y2="33" />
      </g>
      {/* stylised car body */}
      <path
        d="M20 40 L24 30 C25 27 27 26 30 26 L40 26 C43 26 45 27 47 30 L51 36 C52 37 52 38 52 39 L52 41 C52 42 51 43 50 43 L48 43"
        fill="#ffffff"
      />
      <path
        d="M18 41 L18 39 C18 37 19 36 21 36 L50 36 L52 39 L52 41 C52 42 51 43 50 43 L20 43 C19 43 18 42 18 41 Z"
        fill="#ffffff"
      />
      {/* windows */}
      <path d="M27 30 L31 30 L31 35 L25 35 Z" fill="#c9611b" />
      <path d="M33 30 L39 30 C41 30 42 31 44 35 L33 35 Z" fill="#c9611b" />
      {/* wheels */}
      <circle cx="26" cy="44" r="4.5" fill="#3a1e0a" />
      <circle cx="26" cy="44" r="1.8" fill="#ffffff" />
      <circle cx="45" cy="44" r="4.5" fill="#3a1e0a" />
      <circle cx="45" cy="44" r="1.8" fill="#ffffff" />
    </svg>
  );
}
