import React, { useRef, useState } from "react";
import Link from "next/link";
import IPhone18Model from "./IPhone18Model.jsx";

export default function HeroSection({ product }) {
  const stageRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handlePointerMove = (e) => {
    const rect = stageRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -14, y: px * 22 });
  };

  const handlePointerLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-bg-gradient" style={{ "--accent": product.accentColor }} />
        <div className="hero-bg-grid" />
      </div>

      <div className="hero-content">
        <p className="eyebrow fade-in-up">{product.eyebrow}</p>
        <h1 className="hero-title fade-in-up delay-1">{product.name}</h1>
        <p className="hero-tagline fade-in-up delay-2">{product.tagline}</p>
        <p className="hero-description fade-in-up delay-3">{product.description}</p>


      </div>

      <div
        className="hero-phone-stage"
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <div className="hero-phone-float">
          <IPhone18Model
            rotationY={18 + tilt.y}
            rotationX={-6 + tilt.x}
            scale={1}
            accentColor={product.accentColor}
          />
        </div>
      </div>

      <div className="hero-scroll-hint">
        <span>Scroll to explore</span>
        <div className="scroll-hint-line" />
      </div>
    </section>
  );
}