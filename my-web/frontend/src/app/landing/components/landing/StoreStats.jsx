import React, { useEffect, useRef, useState } from "react";

function CountUp({ value, suffix, active }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active) return;
    let frame;
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * value));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, value]);

  return (
    <span className="stat-value">
      {display}
      {suffix}
    </span>
  );
}

export default function StoreStats({ stats }) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="stats" ref={ref}>
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-item">
            <CountUp value={stat.value} suffix={stat.suffix} active={active} />
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}