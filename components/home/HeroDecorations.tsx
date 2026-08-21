/**
 * Ambient particle field for the hero. The particles stay behind the content
 * so the background feels alive without competing with the song brief.
 */
const PARTICLES = [
  [6, 18, 5, 0, 5.8, 0.72], [12, 34, 4, 1.4, 7.2, 0.56], [18, 72, 6, 2.8, 6.4, 0.62],
  [35, 88, 6, 4.2, 7.4, 0.68], [46, 67, 6, 0.8, 8.8, 0.62],
  [56, 42, 6, 1.9, 7.8, 0.7], [66, 27, 6, 2.7, 8.4, 0.64],
  [76, 9, 6, 3.9, 7.1, 0.68], [86, 76, 6, 4.1, 8.6, 0.64],
  [96, 58, 6, 0.6, 7.6, 0.7], [22, 43, 6, 1.7, 8.1, 0.62],
  [63, 94, 6, 2.9, 7.3, 0.58], [89, 87, 6, 3.7, 8.9, 0.64],
] as const;

export default function HeroDecorations() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
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
