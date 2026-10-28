import React, { useEffect, useRef, useState } from "react";
import IPhone18Model from "./IPhone18Model.jsx";

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

// Scroll-driven choreography. Progress (0..1) across the tall section
// deterministically derives rotation, scale and the active chapter index.
export default function Product3DShowcase({ product }) {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const chapters = product.showcaseChapters;

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = clamp(-rect.top, 0, total);
      setProgress(total > 0 ? scrolled / total : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const segments = chapters.length - 1;
  const rawIndex = progress * segments;
  const index = clamp(Math.floor(rawIndex), 0, segments - 1);
  const t = clamp(rawIndex - index, 0, 1);
  const eased = t * t * (3 - 2 * t);

  const from = chapters[index];
  const to = chapters[index + 1] || chapters[index];

  const rotationY = lerp(from.rotationY, to.rotationY, eased);
  const rotationX = lerp(from.rotationX, to.rotationX, eased);
  const scale = lerp(from.scale, to.scale, eased);

  const activeChapter = eased > 0.5 ? to : from;
  const lightAngle = lerp(0, 360, progress);

  return (
    <section className="showcase" ref={sectionRef}>
      <div className="showcase-sticky">
        <div
          className="showcase-lighting"
          style={{
            background: `conic-gradient(from ${lightAngle}deg, #00000000, ${product.accentColor}22, #00000000)`,
          }}
        />

        <div className="showcase-phone-wrap">
          <IPhone18Model
            rotationY={rotationY}
            rotationX={rotationX}
            scale={scale * 1.08}
            position={[-0.48, 0.4, 0]}
            className="showcase-model"
            accentColor={product.accentColor}
          />
        </div>

        <div className="showcase-text-layer">
          {chapters.map((chapter, i) => (
            <div
              key={chapter.id}
              className={`showcase-chapter ${
                i === index || (i === index + 1 && eased > 0.5) ? "" : ""
              } ${activeChapter.id === chapter.id ? "showcase-chapter--active" : ""}`}
            >
              <h2>{chapter.heading}</h2>
              {chapter.sub && <p className="showcase-sub">{chapter.sub}</p>}
              {chapter.detail && <p className="showcase-detail">{chapter.detail}</p>}
              {chapter.cta && (
                <div className="showcase-cta">
                  <button className="btn btn-primary">Explore the full specifications</button>
                  <button className="btn btn-ghost bg-white!">Buy now</button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="showcase-progress">
          {chapters.map((c, i) => (
            <span
              key={c.id}
              className={`showcase-dot ${i <= index ? "showcase-dot--active" : ""}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}