type SeasonalEvergreenTrimProps = {
  side: "left" | "right";
};

const sprays = [36, 96, 158, 222, 288, 356, 426, 498, 572, 648, 726, 806];

const lights = [
  { x: 43, y: 92, delay: "0s" },
  { x: 91, y: 177, delay: "-1.6s" },
  { x: 35, y: 264, delay: "-3.2s" },
  { x: 99, y: 355, delay: "-.8s" },
  { x: 46, y: 448, delay: "-2.4s" },
  { x: 92, y: 548, delay: "-4s" },
  { x: 39, y: 652, delay: "-1.2s" },
  { x: 95, y: 755, delay: "-2.8s" },
];

export function SeasonalEvergreenTrim({ side }: SeasonalEvergreenTrimProps) {
  const id = `evergreen-${side}`;

  return (
    <div className={`seasonal-trim seasonal-trim--${side}`} aria-hidden="true">
      <svg
        className="seasonal-trim__svg"
        viewBox="0 0 140 870"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={`${id}-pine`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2f7a56" />
            <stop offset=".5" stopColor="#174f38" />
            <stop offset="1" stopColor="#092f22" />
          </linearGradient>
          <linearGradient id={`${id}-pine-light`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4b956d" />
            <stop offset="1" stopColor="#1a573d" />
          </linearGradient>
          <radialGradient id={`${id}-red`} cx=".35" cy=".28" r=".68">
            <stop offset="0" stopColor="#df6468" />
            <stop offset=".65" stopColor="#a32129" />
            <stop offset="1" stopColor="#6d1117" />
          </radialGradient>
          <radialGradient id={`${id}-gold`} cx=".35" cy=".28" r=".68">
            <stop offset="0" stopColor="#fff0ad" />
            <stop offset=".58" stopColor="#d5a642" />
            <stop offset="1" stopColor="#8b5d1c" />
          </radialGradient>
          <radialGradient id={`${id}-light`} cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#fffef1" />
            <stop offset=".35" stopColor="#ffe9a0" />
            <stop offset="1" stopColor="#dca447" stopOpacity=".1" />
          </radialGradient>
          <filter id={`${id}-shadow`} x="-30%" y="-20%" width="170%" height="150%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity=".22" />
          </filter>
          <filter id={`${id}-glow`} x="-250%" y="-250%" width="600%" height="600%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d="M72 2 C66 125 68 250 70 390 C72 535 69 690 73 860"
          stroke="#6c4d2c"
          strokeWidth="4"
          strokeLinecap="round"
          opacity=".44"
        />

        <path
          d="M55 58 C72 112 91 152 83 215 C75 277 53 313 63 377 C74 448 95 493 85 555 C76 615 55 657 65 722 C70 756 82 786 90 817"
          stroke="#b58b4a"
          strokeWidth="1.5"
          strokeDasharray="2 6"
          opacity=".42"
        />

        {sprays.map((y, index) => (
          <g key={y} filter={`url(#${id}-shadow)`}>
            <path
              d={`M72 ${y}
                C58 ${y - 17}, 41 ${y - 19}, 18 ${y - 8}
                C34 ${y - 1}, 47 ${y + 8}, 66 ${y + 9}
                C49 ${y + 14}, 33 ${y + 27}, 18 ${y + 44}
                C39 ${y + 36}, 56 ${y + 29}, 73 ${y + 17}`}
              fill={`url(#${id}-pine)`}
            />
            <path
              d={`M72 ${y + 3}
                C88 ${y - 12}, 103 ${y - 14}, 126 ${y - 1}
                C110 ${y + 5}, 96 ${y + 12}, 77 ${y + 13}
                C94 ${y + 21}, 111 ${y + 34}, 125 ${y + 51}
                C104 ${y + 42}, 88 ${y + 34}, 72 ${y + 20}`}
              fill={`url(#${id}-pine)`}
            />
            <path
              d={`M70 ${y + 1} C55 ${y - 8}, 43 ${y - 8}, 30 ${y + 1} C44 ${y + 7}, 56 ${y + 12}, 70 ${y + 13}`}
              fill={`url(#${id}-pine-light)`}
              opacity=".62"
            />
            <path
              d={`M74 ${y + 5} C87 ${y - 3}, 99 ${y - 2}, 112 ${y + 7} C100 ${y + 13}, 88 ${y + 17}, 75 ${y + 17}`}
              fill={`url(#${id}-pine-light)`}
              opacity=".54"
            />

            {index % 3 === 0 ? (
              <circle cx="39" cy={y + 18} r="7" fill={`url(#${id}-red)`} />
            ) : null}
            {index % 4 === 1 ? (
              <circle cx="101" cy={y + 28} r="6.5" fill={`url(#${id}-gold)`} />
            ) : null}
            {index % 4 === 2 ? (
              <g fill="#a31d24">
                <circle cx="51" cy={y + 15} r="3.1" />
                <circle cx="58" cy={y + 19} r="3.1" />
                <circle cx="47" cy={y + 22} r="3.1" />
              </g>
            ) : null}
          </g>
        ))}

        {lights.map((light) => (
          <g
            className="seasonal-trim__light"
            key={`${light.x}-${light.y}`}
            style={{ animationDelay: light.delay }}
            filter={`url(#${id}-glow)`}
          >
            <circle cx={light.x} cy={light.y} r="8" fill={`url(#${id}-light)`} opacity=".46" />
            <circle cx={light.x} cy={light.y} r="2.2" fill="#fff8cf" />
          </g>
        ))}
      </svg>
    </div>
  );
}
