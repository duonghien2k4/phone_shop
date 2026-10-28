import React, { useEffect, useRef, useState } from "react";

function useInView(threshold = 0.3) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView];
}

export default function ProductSpecs({ product }) {
  return (
    <section className="specs">
      <div className="specs-header">
        <p className="eyebrow">Technical excellence</p>
        <h2>Every detail, engineered.</h2>
      </div>

      <div className="specs-grid">
        {product.specifications.map((spec, i) => {
          const [ref, inView] = useInView();
          return (
            <div
              key={spec.label}
              ref={ref}
              className={`spec-card ${inView ? "spec-card--visible" : ""}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <span className="spec-value">{spec.value}</span>
              <span className="spec-label">{spec.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}