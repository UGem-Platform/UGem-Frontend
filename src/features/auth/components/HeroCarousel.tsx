import { useEffect, useRef, useState } from "react";

type Props = {
  images: string[];
  intervalMs?: number;
  onChange?: (index: number) => void;
};

export function HeroCarousel({ images, intervalMs = 5000, onChange }: Props) {
  const [index, setIndex] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (images.length <= 1) return;
    timer.current = window.setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % images.length;
        if (onChange) onChange(next);
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
    if (onChange) onChange(next);
  }

  return (
    <div className="carousel" aria-live="polite">
      {images.map((src, i) => (
        <div
          key={i}
          className={`carousel-slide ${i === index ? "active" : ""}`}
          style={{ backgroundImage: `url("${src}")` }}
          role="img"
          aria-hidden={i === index ? "false" : "true"}
        />
      ))}

      {images.length > 1 && (
        <div className="carousel-controls">
          {/* <button
            aria-label="Previous"
            type="button"
            onClick={() => go((index - 1 + images.length) % images.length)}
          >
            ‹
          </button> */}
          <div className="carousel-dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={i === index ? "dot active" : "dot"}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => go(i)}
              />
            ))}
          </div>
          {/* <button
            aria-label="Next"
            type="button"
            onClick={() => go((index + 1) % images.length)}
          >
            ›
          </button> */}
        </div>
      )}
    </div>
  );
}

export default HeroCarousel;
