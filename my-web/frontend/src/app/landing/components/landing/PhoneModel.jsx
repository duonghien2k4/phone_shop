import React from "react";

// Reusable CSS 3D phone model. Built entirely from DOM layers so it can
// later be swapped for a real GLB/<Canvas> component without touching callers.
export default function PhoneModel({
  rotationY = 0,
  rotationX = 0,
  scale = 1,
  accentColor = "#8a7bff",
  glow = true,
  style = {},
  className = "",
}) {
  return (
    <div
      className={`phone-model-stage ${className}`}
      style={{
        transform: `scale(${scale})`,
        ...style,
      }}
    >
      {glow && (
        <div
          className="phone-glow"
          style={{
            background: `radial-gradient(circle, ${accentColor}55 0%, transparent 70%)`,
          }}
        />
      )}
      <div
        className="phone-model"
        style={{
          transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
        }}
      >
        <div className="phone-face phone-front">
          <div className="phone-notch" />
          <div className="phone-screen" style={{ "--accent": accentColor }}>
            <div className="phone-screen-glow" />
          </div>
        </div>
        <div className="phone-face phone-back" style={{ background: accentColor }}>
          <div className="phone-camera-bump">
            <span className="lens lens-1" />
            <span className="lens lens-2" />
            <span className="lens lens-3" />
            <span className="lens-flash" />
          </div>
          <div className="phone-back-sheen" />
        </div>
        <div className="phone-face phone-edge phone-edge-right" />
        <div className="phone-face phone-edge phone-edge-left" />
        <div className="phone-face phone-edge phone-edge-top" />
        <div className="phone-face phone-edge phone-edge-bottom" />
      </div>
      <div className="phone-shadow" />
    </div>
  );
}