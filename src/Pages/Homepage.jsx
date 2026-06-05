import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import heroTitle from "../Assets/Images/herotitle.png";
import munnar from "../Assets/Images/munnar.jpg";
import alleppey from "../Assets/Images/alleppey.jpg";
import kodaikanal from "../Assets/Images/kodaikanal.jpg";
import adventure from "../Assets/Images/adventure.jpg";
import "./Homepage.css";

const features = [
  { icon: "🗺️", title: "Custom Itineraries", desc: "Every trip is tailored to your pace, budget, and interests." },
  { icon: "🤝", title: "Trusted Partners", desc: "We work only with verified local guides and hotels." },
  { icon: "💰", title: "Transparent Pricing", desc: "No hidden fees. What you see is exactly what you pay." },
  { icon: "📞", title: "24/7 Support", desc: "Our team is always available before and during your trip." },
];

const testimonials = [
  { name: "Asha R.", trip: "Munnar Escape", text: "The trip was beautifully organized. Every detail was taken care of — truly relaxing!", rating: 4.7 },
  { name: "Rohit M.", trip: "Alleppey Cruise", text: "The houseboat experience was once in a lifetime. Absolutely magical sunsets!", rating: 5 },
  { name: "Priya S.", trip: "Kodaikanal Trek", text: "Excellent local guides and warm hospitality. Will definitely book again.", rating: 5 },
];

function Stars({ count }) {
  return <span className="stars">{"★".repeat(Math.round(count))}</span>;
}

// small newsletter sub-component — keeps the main component clean
function NewsletterBar() {
  const [email, setEmail]     = useState("");
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");

  function handleSub(e) {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email");
      return;
    }
    setDone(true);
    setError("");
  }

  if (done) {
    return (
      <div className="newsletter-bar">
        <p>🎉 Thanks for subscribing! Watch your inbox for deals.</p>
      </div>
    );
  }

  return (
    <div className="newsletter-bar">
      <div className="newsletter-copy">
        <strong>Get exclusive travel deals</strong>
        <span>Subscribe and be the first to know about seasonal packages.</span>
      </div>
      <form className="newsletter-form" onSubmit={handleSub} noValidate>
        <input
          type="email"
          className="form-control"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          style={{ maxWidth: 260 }}
        />
        <button type="submit" className="btn btn-gold">Subscribe</button>
      </form>
      {error && <span className="error-msg">{error}</span>}
    </div>
  );
}

function Homepage() {
  const [featuredPackages, setFeaturedPackages] = useState([]);

  useEffect(() => {
    api.get("/trips").then(({ data }) => {
      setFeaturedPackages((data.data || []).slice(0, 3));
    }).catch(() => {});
  }, []);
  return (
    <div className="homepage">
    
      <section className="hero" style={{ backgroundImage: `url(${adventure})` }}>
        <div className="hero-overlay" />
        <div className="hero-content container fade-up">
          <span className="hero-eyebrow">✈️ Adventure Awaits!</span>
          <h1>
            <img src={heroTitle} alt="TrailBliss" className="hero-title-img" />
          </h1>
          <p className="hero-desc">
            Tailor-made packages, trusted local partners, and transparent pricing.
            Find your perfect escape with TrailBliss.
          </p>
          <div className="hero-ctas">
            <Link to="/packages" className="btn btn-gold btn-lg">Explore Packages</Link>
            <Link to="/contact" className="btn btn-outline-white btn-lg">Get in Touch</Link>
          </div>
          <div className="hero-stats">
            <div><strong>500+</strong><span>Happy Travelers</span></div>
            <div><strong>50+</strong><span>Destinations</span></div>
            <div><strong>4.9★</strong><span>Average Rating</span></div>
          </div>
        </div>
      </section>

      {/* Destinations strip */}
      <section className="destinations-strip section-sm">
        <div className="container">
          <p className="section-label">Top Destinations</p>
          <div className="dest-cards">
            {[
              { img: munnar, name: "Munnar" },
              { img: alleppey, name: "Alleppey" },
              { img: kodaikanal, name: "Kodaikanal" },
              { img: adventure, name: "Adventure" },
            ].map((d) => (
              <Link to="/packages" key={d.name} className="dest-card" style={{ backgroundImage: `url(${d.img})` }}>
                <span>{d.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="section">
        <div className="container">
          <p className="section-label">Curated For You</p>
          <div className="section-head-row">
            <div>
              <h2 className="section-title">Featured Packages</h2>
              <p className="section-sub">Hand-picked experiences for every kind of traveller.</p>
            </div>
            <Link to="/packages" className="btn btn-outline">View All</Link>
          </div>
          <div className="grid-3" style={{ marginTop: 32 }}>
            {featuredPackages.map((p) => (
              <div className="card pkg-card" key={p._id}>
                <div className="pkg-img" style={{ backgroundImage: `url(${p.images?.featured || munnar})` }}>
                  {p.badge && <span className="badge badge-gold">{p.badge}</span>}
                </div>
                <div className="pkg-body">
                  <p className="pkg-location">📍 {p.location?.city || p.location}</p>
                  <h3>{p.title}</h3>
                  <p className="pkg-desc">{p.description}</p>
                  <div className="pkg-footer">
                    <span className="pkg-price">₹{(p.pricing?.basePrice || p.price)?.toLocaleString()} <small>/person</small></span>
                    <Link to="/apply" className="btn btn-primary btn-sm">Book Now</Link>
                  </div>
                </div>
              </div>
            ))}
            {featuredPackages.length === 0 && (
              <p style={{ color: "var(--muted)", gridColumn: "1/-1" }}>Loading packages...</p>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section section">
        <div className="container">
          <p className="section-label">Why TrailBliss</p>
          <h2 className="section-title">Travel with Confidence</h2>
          <div className="grid-4" style={{ marginTop: 36 }}>
            {features.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <p className="section-label">Real Stories</p>
          <h2 className="section-title">What Travellers Say</h2>
          <div className="grid-3" style={{ marginTop: 32 }}>
            {testimonials.map((t) => (
              <div className="card testi-card" key={t.name}>
                <Stars count={t.rating} />
                <p className="testi-text">"{t.text}"</p>
                <div className="testi-author">
                  <div className="testi-avatar">{t.name[0]}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.trip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section-sm">
        <div className="container">
          <NewsletterBar />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner section">
        <div className="container">
          <div className="cta-box">
            <div>
              <h2>Ready for your next adventure?</h2>
              <p>Fill out our quick enquiry form and we'll plan your dream trip.</p>
            </div>
            <div className="cta-actions">
              <Link to="/apply" className="btn btn-gold btn-lg">Start Planning</Link>
              <Link to="/contact" className="btn btn-outline-white">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Homepage;
