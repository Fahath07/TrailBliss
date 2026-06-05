import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import "./Packages.css";

const categories = ["All", "Nature", "Leisure", "Adventure", "Cultural", "Wellness"];

function Packages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");
  const [allPackages, setAllPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/trips")
      .then(({ data }) => setAllPackages(data.data || []))
      .catch(() => setError("Failed to load packages. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = allPackages.filter((p) => {
    const matchCat = active === "All" || p.category === active;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.title?.toLowerCase().includes(q) ||
      p.location?.city?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  function handleBookNow(pkgId) {
    if (!user) navigate(`/login?redirect=/apply?pkg=${pkgId}`);
    else navigate(`/apply?pkg=${pkgId}`);
  }

  return (
    <div>
      <div className="page-hero">
        <h1>🌿 All Packages</h1>
        <p>Explore our curated collection of handpicked travel experiences across India</p>
      </div>

      <section className="section">
        <div className="container">
          <div className="pkg-filters">
            <input
              type="text"
              className="form-control pkg-search"
              placeholder="🔍  Search destinations or packages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="filter-tabs">
              {categories.map((c) => (
                <button key={c} className={`filter-tab ${active === c ? "active" : ""}`}
                  onClick={() => setActive(c)}>{c}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="no-results"><p>Loading packages...</p></div>
          ) : error ? (
            <div className="no-results"><p style={{ color: "#EF4444" }}>{error}</p></div>
          ) : (
            <>
              <p className="pkg-count">{filtered.length} package{filtered.length !== 1 ? "s" : ""} found</p>
              {filtered.length === 0 ? (
                <div className="no-results"><p>😕 No packages found. Try a different search or filter.</p></div>
              ) : (
                <div className="grid-3" style={{ marginTop: 16 }}>
                  {filtered.map((p) => (
                    <div className="card pkg-card" key={p._id}>
                      <div className="pkg-img" style={{ backgroundImage: `url(${p.images?.featured || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80"})` }}>
                        {p.badge && <span className="badge badge-gold">{p.badge}</span>}
                        <span className="pkg-duration">{p.duration?.days || p.duration} Days</span>
                        <span className="pkg-category-tag">{p.category}</span>
                      </div>
                      <div className="pkg-body">
                        <p className="pkg-location">📍 {p.location?.city}{p.location?.state ? `, ${p.location.state}` : ""}</p>
                        <h3>{p.title}</h3>
                        <p className="pkg-desc">{p.description}</p>
                        <div className="pkg-footer">
                          <span className="pkg-price">₹{p.pricing?.basePrice?.toLocaleString()} <small>/person</small></span>
                          <button className="btn btn-primary btn-sm" onClick={() => handleBookNow(p._id)}>
                            {user ? "Book Now" : "🔒 Book Now"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Packages;
