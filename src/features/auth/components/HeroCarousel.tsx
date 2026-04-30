import { useEffect, useRef, useState } from "react";

type Props = {
  images: string[];
  intervalMs?: number;
  onChange?: (...args: [number]) => void;
};

export function HeroCarousel({ images, intervalMs = 5000, onChange }: Props) {
  const [index, setIndex] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (images.length <= 1) return;

    timer.current = window.setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % images.length;
        onChange?.(next);
        return next;
      });
    }, intervalMs);

    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [images.length, intervalMs, onChange]);

  function go(i: number) {
    const next = i % images.length;
    setIndex(next);

    if (timer.current) {
      window.clearInterval(timer.current);
      timer.current = window.setInterval(() => {
        setIndex((k) => (k + 1) % images.length);
      }, intervalMs);
    }

    onChange?.(next);
  }

  return (
    <div
      className="relative h-full min-h-[48vh] w-full overflow-hidden rounded-2xl bg-slate-950 lg:min-h-screen"
      aria-live="polite"
    >
      {images.map((src, i) => (
        <div
          key={i}
          className={`
            absolute inset-0 bg-cover bg-center bg-no-repeat
            transition-all duration-700 ease-out
            ${i === index ? "opacity-100 scale-100" : "opacity-0 scale-105"}
          `}
          style={{ backgroundImage: `url("${src}")` }}
          role="img"
          aria-hidden={i !== index}
        />
      ))}

      {/* overlay */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-cyan-950/65 via-slate-950/35 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/60 via-transparent to-transparent" />

      {/* dots */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`
                  h-2.5 rounded-full transition-all duration-300
                  ${i === index ? "w-8 bg-cyan-400" : "w-2.5 bg-white/60 hover:bg-white"}
                `}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default HeroCarousel;
