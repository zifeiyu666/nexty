/**
 * Ambient particle field for the hero. The particles stay behind the content
 * so the background feels alive without competing with the song brief.
 */
const PARTICLES = [
  [6, 18, 2, 0, 5.8, 0.45], [12, 34, 1, 1.4, 7.2, 0.32], [18, 72, 2, 2.8, 6.4, 0.38],
  [24, 16, 1, 3.6, 8.2, 0.28], [29, 52, 1, 1.1, 5.2, 0.34], [35, 88, 2, 4.2, 7.4, 0.42],
  [41, 23, 1, 2.2, 6.8, 0.3], [46, 67, 2, 0.8, 8.8, 0.36], [51, 11, 1, 3.1, 5.9, 0.32],
  [56, 42, 2, 1.9, 7.8, 0.4], [61, 82, 1, 4.8, 6.6, 0.3], [66, 27, 2, 2.7, 8.4, 0.37],
  [71, 61, 1, 0.4, 5.6, 0.28], [76, 9, 2, 3.9, 7.1, 0.4], [81, 47, 1, 1.5, 6.2, 0.34],
  [86, 76, 2, 4.1, 8.6, 0.38], [91, 20, 1, 2.4, 5.4, 0.3], [96, 58, 2, 0.6, 7.6, 0.42],
  [8, 90, 1, 3.2, 6.9, 0.27], [22, 43, 2, 1.7, 8.1, 0.36], [38, 7, 1, 4.5, 6.1, 0.3],
  [63, 94, 2, 2.9, 7.3, 0.34], [74, 36, 1, 0.2, 5.8, 0.3], [89, 87, 2, 3.7, 8.9, 0.38],
] as const;

export default function HeroDecorations() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="hero-particle-field absolute inset-0">
        {PARTICLES.map(([left, top, size, delay, duration, opacity], index) => (
          <span
            key={`${left}-${top}`}
            className={`hero-particle ${index % 5 === 0 ? "hero-particle-coral" : ""}`}
            style={{
              left: `${left}%`, top: `${top}%`, width: `${size}px`, height: `${size}px`,
              opacity, animationDelay: `${delay}s`, animationDuration: `${duration}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
