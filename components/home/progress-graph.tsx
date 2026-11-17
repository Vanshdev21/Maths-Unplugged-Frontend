/**
 * The hero's signature: a learning curve plotted on graph paper.
 * Pure SVG, draws itself once (respects reduced motion).
 */
export function ProgressGraph() {
  const points = [
    { x: 70, y: 262, label: "Learn" },
    { x: 196, y: 178, label: "Attempt" },
    { x: 330, y: 70, label: "Improve" },
  ];

  return (
    <figure className="relative overflow-hidden rounded-[28px] bg-black p-6 text-white sm:p-8">
      <svg viewBox="0 0 400 320" className="h-auto w-full" role="img" aria-labelledby="graph-title">
        <title id="graph-title">A learning curve rising through three stages: learn, attempt, improve</title>
        <defs>
          <pattern id="minor" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          </pattern>
          <pattern id="major" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#minor)" />
            <path d="M100 0H0V100" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="320" fill="url(#major)" />

        {/* axes */}
        <path d="M40 20V290H390" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
        <text x="46" y="32" fill="rgba(255,255,255,0.6)" fontSize="12" fontFamily="var(--font-sans)">
          confidence
        </text>
        <text x="390" y="308" textAnchor="end" fill="rgba(255,255,255,0.6)" fontSize="12" fontFamily="var(--font-sans)">
          practice
        </text>

        {/* the curve */}
        <path
          d="M40 285 C 110 270, 150 220, 196 178 S 290 95, 380 48"
          fill="none"
          stroke="#FDE700"
          strokeWidth="4"
          strokeLinecap="round"
          className="animate-draw"
          style={{ ["--len" as string]: "460" }}
        />

        {points.map((p, i) => (
          <g key={p.label}>
            <line x1={p.x} y1={p.y + 10} x2={p.x} y2={290} stroke="rgba(253,231,0,0.35)" strokeDasharray="3 4" />
            <circle
              cx={p.x}
              cy={p.y}
              r="7"
              fill="#000"
              stroke="#FDE700"
              strokeWidth="3"
              className="animate-pop"
              style={{ animationDelay: `${0.7 + i * 0.35}s` }}
            />
            <text
              x={p.x + (i === 2 ? -14 : 14)}
              y={p.y - 14}
              textAnchor={i === 2 ? "end" : "start"}
              fill="#fff"
              fontSize="17"
              fontWeight="600"
              fontFamily="var(--font-display)"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="sr-only">Learn, attempt, improve.</figcaption>
    </figure>
  );
}
