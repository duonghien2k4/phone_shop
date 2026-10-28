import React, { useEffect, useRef, useState } from "react";

const POINTS = [
  "Authentic products, every time",
  "Official manufacturer warranty",
  "Transparent, no-surprise pricing",
  "Professional, honest consultation",
  "Fast nationwide delivery",
  "Dedicated after-sales support",
];

export default function StoreStory() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.15,
    });
    obs.observe(el);

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      setOffset(center * -0.08);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section className="story" ref={ref}>
      <div className={`story-text ${inView ? "story-text--visible" : ""}`}>
        <p className="eyebrow">Our promise</p>
        <h2>Technology you can trust.</h2>
        <ul className="story-points">
          {POINTS.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>

      <div className="story-visual" style={{ transform: `translateY(${offset}px)` }}>
        <div className="story-visual-panel">
          <div className="story-visual-glow" />
          <div className="story-visual-grid" />
        </div>
      </div>
    </section>
  );
}