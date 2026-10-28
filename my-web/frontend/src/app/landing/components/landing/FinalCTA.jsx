import React from "react";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="final-cta">
      <div className="final-cta-glow" />
        <p className="eyebrow">Ready when you are</p>
        <h2>Your next phone starts here.</h2>
      <p className="eyebrow final-cta-subtitle">
          Discover flagship technology, genuine products and service you can trust.
        </p>
      <div className="final-cta-buttons mt-20">
        <Link className="btn btn-primary" href="/shop">Explore products</Link>
        <Link className="btn btn-ghost btn-ghost--light" href="/dia-chi">Visit our stores</Link>
      </div>
    </section>
  );
}