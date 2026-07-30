/**
 * Staggered word-reveal headline, inspired by originkit.dev's "appear-text"
 * (their site blocks scripted extraction, so this is a faithful reimplementation
 * of the demo behavior: words rise, unblur, and settle with a stagger).
 * Pure CSS animation, honors prefers-reduced-motion.
 */
export function AppearText({
  text,
  className,
  startDelay = 0,
  stagger = 70,
}: {
  text: string;
  className?: string;
  startDelay?: number;
  stagger?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          aria-hidden="true"
          className="appear-word"
          style={{ animationDelay: `${startDelay + i * stagger}ms` }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
