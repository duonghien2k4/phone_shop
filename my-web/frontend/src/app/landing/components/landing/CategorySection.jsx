import React from "react";
import Link from "next/link";

export default function CategorySection({ categories }) {
  return (
    <section className="categories">
      <div className="section-header">
        <p className="eyebrow">Shop by brand</p>
        <h2>Find your next device.</h2>
      </div>

      <div className="categories-grid">
        {categories.map((cat) => (
          <Link href={cat.href} key={cat.id} className="category-tile">
            <div
              className="category-tile-bg"
              style={{ background: `linear-gradient(145deg, ${cat.accent}22, #0a0a0a)` }}
            />
            <div className="category-tile-content">
              <div>
                <h3>{cat.name}</h3>
                <span className="text-white!">{cat.count}</span>
              </div>
              <span className="category-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 19L19 5M19 5H9M19 5V15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}