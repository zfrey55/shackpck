'use client';

/**
 * 4×6 flat pouch mockup for ShackPack Builder.
 *
 * Aspect ratio 2:3 (portrait). Renders the uploaded artwork in the printable
 * area with a subtle bezel / heat-seal band suggesting a real mylar pouch.
 * Shows a dashed safe-area guide so customers know to avoid edge bleed.
 */

type Props = {
  /** Data URL or blob URL for local preview, or remote URL after upload. */
  artworkUrl?: string | null;
  className?: string;
};

export function PackMockup({ artworkUrl, className = '' }: Props) {
  // Viewbox is 400x600 (2:3). Safe area inset by 25px each side.
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 400 600"
        className="h-auto w-full rounded-lg shadow-lg"
        role="img"
        aria-label="Pack artwork preview on 4×6 flat pouch"
      >
        {/* Pouch background */}
        <defs>
          <linearGradient id="pouchBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="sealBand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f2937" />
            <stop offset="50%" stopColor="#374151" />
            <stop offset="100%" stopColor="#1f2937" />
          </linearGradient>
          <clipPath id="printArea">
            <rect x="0" y="50" width="400" height="500" rx="6" />
          </clipPath>
        </defs>

        {/* Outer pouch silhouette */}
        <rect x="0" y="0" width="400" height="600" rx="8" fill="url(#pouchBg)" />

        {/* Heat-seal band (top) */}
        <rect x="0" y="0" width="400" height="40" fill="url(#sealBand)" />
        <line
          x1="12"
          y1="20"
          x2="388"
          y2="20"
          stroke="#4b5563"
          strokeWidth="1"
          strokeDasharray="2 4"
        />

        {/* Heat-seal band (bottom) */}
        <rect x="0" y="560" width="400" height="40" fill="url(#sealBand)" />
        <line
          x1="12"
          y1="580"
          x2="388"
          y2="580"
          stroke="#4b5563"
          strokeWidth="1"
          strokeDasharray="2 4"
        />

        {/* Artwork printable area */}
        <g clipPath="url(#printArea)">
          {artworkUrl ? (
            <image
              href={artworkUrl}
              x="0"
              y="50"
              width="400"
              height="500"
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <g>
              <rect x="0" y="50" width="400" height="500" fill="#111827" />
              <text
                x="200"
                y="290"
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="22"
                fontFamily="Arial, sans-serif"
                fontWeight="700"
                letterSpacing="1"
              >
                SHACKPACK
              </text>
              <text
                x="200"
                y="320"
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="12"
                fontFamily="Arial, sans-serif"
              >
                Upload your artwork to preview here
              </text>
            </g>
          )}
        </g>

        {/* Safe-area guide (dashed) */}
        <rect
          x="25"
          y="75"
          width="350"
          height="450"
          fill="none"
          stroke="rgba(212,175,55,0.55)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      </svg>
      <div className="mt-2 text-[11px] text-slate-500">
        <p>
          4×6 flat pouch preview. Dashed line marks the safe area — keep key artwork inside.
        </p>
      </div>
    </div>
  );
}
