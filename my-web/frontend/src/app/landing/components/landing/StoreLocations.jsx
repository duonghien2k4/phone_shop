import React, { useState } from "react";

export default function StoreLocations({ locations }) {
  const [selected, setSelected] = useState(locations[0].id);
  const active = locations.find((l) => l.id === selected);

  return (
    <section className="locations">
      <div className="locations-list">
        <p className="eyebrow">Visit us</p>
        <h2>Find a store near you.</h2>

        <div className="locations-items">
          {locations.map((loc) => (
            <button
              key={loc.id}
              className={`location-item ${selected === loc.id ? "location-item--active" : ""}`}
              onClick={() => setSelected(loc.id)}
            >
              <span className="location-city">{loc.city}</span>
              <span className="location-address">{loc.address}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="locations-visual">
        <div className="locations-map-placeholder">
          <div className="map-pin" />
          <div className="map-grid" />
        </div>
        <div className="locations-detail">
          <h3>{active.city}</h3>
          <p>{active.address}</p>
          <span>{active.hours}</span>
        </div>
      </div>
    </section>
  );
}