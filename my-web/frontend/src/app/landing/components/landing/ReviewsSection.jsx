import React from "react";

export default function ReviewsSection({ reviews }) {
  return (
    <section className="reviews">
      <div className="section-header">
        <p className="eyebrow">Customer stories</p>
        <h2>Loved by thousands.</h2>
      </div>

      <div className="reviews-track">
        {reviews.map((r) => (
          <div key={r.id} className="review-card">
            <div className="review-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < r.rating ? "star star--filled" : "star"}>
                  ★
                </span>
              ))}
            </div>
            <p className="review-quote">"{r.quote}"</p>
            <div className="review-meta">
              <span className="review-name">{r.name}</span>
              <span className="review-sep">·</span>
              <span className="review-product">{r.product}</span>
              <span className="review-sep">·</span>
              <span className="review-date">{r.date}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}