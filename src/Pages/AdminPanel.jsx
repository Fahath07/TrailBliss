import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import logo from "../Assets/Images/trailbliss.png";
import "./AdminPanel.css";

const STATUS_COLORS = {
  Confirmed: "badge-green", confirmed: "badge-green",
  Pending: "badge-gold", pending: "badge-gold",
  Cancelled: "badge-red", cancelled: "badge-red",
};

const ENQUIRY_STATUS_COLORS = {
  New: "badge-blue", new: "badge-blue",
  "In Progress": "badge-gold", open: "badge-gold",
  Resolved: "badge-green", resolved: "badge-green",
  Closed: "badge-red", closed: "badge-red",
};

const EMPTY_TRIP = {
  title: "", description: "", destination: "", duration: "",
  price: "", maxGroupSize: "", startDate: "", endDate: "", image: "", category: "Nature",
};

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className="admin-stat-card card">
      <div className="stat-icon" style={{ background: color + "18", color }}>{icon}</div>
      <div>
        <p className="stat-label">{label}</p>
        <strong className="stat-value">{value}</strong>
        {sub && <span className="stat-change">{sub}</span>}
      </div>
    </div>
  );
}

function AdminPanel() {
  const { user, logout, authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");

  // Data
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [enquiries, setEnquiries] = useState([]);

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [avatarOpen, setAvatarOpen] = useState(false);
  const [tripForm, setTripForm] = useState(EMPTY_TRIP);
  const [tripMsg, setTripMsg] = useState("");
  const [editingTrip, setEditingTrip] = useState(null);

  // Guard — wait for profile fetch before redirecting
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
    if (user.role !== "admin") navigate("/");
  }, [user, authLoading, navigate]);

  // ── Fetch helpers ──────────────────────────────────────────────
  const fetchBookings = useCallback(() => {
    setLoading(true); setError("");
    api.get("/bookings/all")
      .then(({ data }) => setBookings(data.data || []))
      .catch(() => setError("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  const fetchUsers = useCallback(() => {
    setLoading(true); setError("");
    api.get("/user/all")
      .then(({ data }) => setUsers(data.data || []))
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const fetchTrips = useCallback(() => {
    setLoading(true); setError("");
    api.get("/trips")
      .then(({ data }) => setTrips(data.data || []))
      .catch(() => setError("Failed to load trips"))
      .finally(() => setLoading(false));
  }, []);

  const fetchEnquiries = useCallback(() => {
    setLoading(true); setError("");
    api.get("/enquiries/all")
      .then(({ data }) => setEnquiries(data.data || []))
      .catch(() => setError("Failed to load enquiries"))
      .finally(() => setLoading(false));
  }, []);

  // Load dashboard data once + per-tab data
  useEffect(() => {
    fetchBookings();
    fetchUsers();
    fetchTrips();
    fetchEnquiries();
  }, [fetchBookings, fetchUsers, fetchTrips, fetchEnquiries]);

  useEffect(() => { setSearch(""); }, [tab]);

  // ── Actions ────────────────────────────────────────────────────
  async function updateBookingStatus(id, status) {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
    } catch { setError("Failed to update booking status"); }
  }

  async function deleteUser(id) {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/user/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch { setError("Failed to delete user"); }
  }

  async function updateEnquiryStatus(id, status) {
    try {
      await api.put(`/enquiries/${id}/status`, { status });
      setEnquiries(prev => prev.map(e => e._id === id ? { ...e, status } : e));
    } catch { setError("Failed to update enquiry status"); }
  }

  async function deleteEnquiry(id) {
    if (!window.confirm("Delete this enquiry?")) return;
    try {
      await api.delete(`/enquiries/${id}`);
      setEnquiries(prev => prev.filter(e => e._id !== id));
    } catch { setError("Failed to delete enquiry"); }
  }

  async function deleteTrip(id) {
    if (!window.confirm("Delete this trip?")) return;
    try {
      await api.delete(`/trips/${id}`);
      setTrips(prev => prev.filter(t => t._id !== id));
    } catch { setError("Failed to delete trip"); }
  }

  async function handleTripSubmit(e) {
    e.preventDefault(); setTripMsg("");
    try {
      const tripData = {
        title: tripForm.title,
        description: tripForm.description,
        location: { city: tripForm.destination, state: "", country: "India" },
        duration: { days: Number(tripForm.duration) },
        pricing: { basePrice: Number(tripForm.price) },
        groupSize: { max: Number(tripForm.maxGroupSize) },
        images: { featured: tripForm.image || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80" },
        category: tripForm.category,
        startDate: tripForm.startDate || undefined,
        endDate: tripForm.endDate || undefined,
        availability: { isActive: true },
      };
      if (editingTrip) {
        await api.put(`/trips/${editingTrip}`, tripData);
        setTripMsg("Trip updated successfully!");
        setEditingTrip(null);
      } else {
        await api.post("/trips", tripData);
        setTripMsg("Trip added successfully!");
      }
      setTripForm(EMPTY_TRIP);
      fetchTrips();
    } catch (err) {
      setTripMsg(err.response?.data?.error || err.response?.data?.message || "Failed to save trip.");
    }
  }

  function startEditTrip(trip) {
    setEditingTrip(trip._id);
    setTripForm({
      title: trip.title || "",
      description: trip.description || "",
      destination: trip.location?.city || trip.destination || "",
      duration: trip.duration?.days || trip.duration || "",
      price: trip.pricing?.basePrice || trip.price || "",
      maxGroupSize: trip.groupSize?.max || trip.maxGroupSize || "",
      startDate: trip.startDate ? trip.startDate.split("T")[0] : "",
      endDate: trip.endDate ? trip.endDate.split("T")[0] : "",
      image: trip.images?.featured || trip.image || "",
      category: trip.category || "Nature",
    });
    setTab("packages");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLogout() { logout(); navigate("/"); }

  // ── Derived stats ──────────────────────────────────────────────
  const revenue = bookings
    .filter(b => b.status === "Confirmed" || b.status === "confirmed")
    .reduce((sum, b) => sum + (b.pricing?.finalAmount || b.pricing?.totalAmount || 0), 0);

  const stats = [
    { icon: "📦", label: "Total Bookings", value: bookings.length, color: "#3B82F6" },
    { icon: "👥", label: "Total Users", value: users.length, color: "#8B5CF6" },
    { icon: "🗺️", label: "Total Trips", value: trips.length, color: "#10B981" },
    { icon: "✅", label: "Confirmed", value: bookings.filter(b => b.status === "Confirmed").length, color: "#F59E0B" },
    { icon: "💬", label: "Enquiries", value: enquiries.length, color: "#EC4899" },
    { icon: "💰", label: "Revenue", value: `₹${revenue.toLocaleString()}`, color: "#14B8A6" },
  ];

  // ── Search filters ─────────────────────────────────────────────
  const filteredBookings = bookings.filter(b =>
    !search || [b.user?.firstname, b.user?.lastname, b.user?.email, b.package?.title]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );
  const filteredUsers = users.filter(u =>
    !search || [u.firstname, u.lastname, u.email, u.phone]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );
  const filteredTrips = trips.filter(t =>
    !search || [t.title, t.location?.city, t.category]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );
  const filteredEnquiries = enquiries.filter(e =>
    !search || [e.name, e.email, e.subject]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const recentEnquiries = [...enquiries]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (authLoading) return null;
  if (!user || user.role !== "admin") return null;

  const NAV_ITEMS = [
    { key: "dashboard", icon: "🏠", label: "Dashboard" },
    { key: "bookings", icon: "📦", label: "Bookings" },
    { key: "enquiries", icon: "💬", label: "Enquiries" },
    { key: "packages", icon: "🗺️", label: "Packages" },
    { key: "users", icon: "👥", label: "Users" },
  ];

  return (
    <div className="admin-page">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <img src={logo} alt="TrailBliss" style={{ height: 36, objectFit: "contain" }} />
          <small>Admin Panel</small>
        </div>
        <nav className="admin-nav">
          {NAV_ITEMS.map(item => (
            <button key={item.key}
              className={`admin-nav-item ${tab === item.key ? "active" : ""}`}
              onClick={() => setTab(item.key)}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-nav-item" onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">
        {/* Topbar */}
        <div className="admin-topbar">
          <div>
            <h2>{NAV_ITEMS.find(n => n.key === tab)?.label}</h2>
            <p>Welcome back, {user.firstname} 👋</p>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-avatar-wrap">
              <span className="admin-avatar" onClick={() => setAvatarOpen(o => !o)}>
                {user.firstname?.[0]?.toUpperCase()}
              </span>
              {avatarOpen && (
                <div className="admin-avatar-dropdown">
                  <p className="avatar-dropdown-name">{user.firstname} {user.lastname}</p>
                  <p className="avatar-dropdown-email">{user.email}</p>
                  <hr className="avatar-dropdown-divider" />
                  <button onClick={() => { setAvatarOpen(false); handleLogout(); }}>🚪 Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && <p className="admin-error">{error}</p>}

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div>
            <div className="admin-stats">
              {stats.map(s => <StatCard key={s.label} {...s} />)}
            </div>

            <div className="admin-dashboard-grid">
              {/* Recent Bookings */}
              <div className="card admin-table-card">
                <div className="table-header">
                  <h3>Recent Bookings</h3>
                  <button className="btn btn-sm btn-outline" onClick={() => setTab("bookings")}>View All</button>
                </div>
                <div className="table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Customer</th><th>Trip</th><th>Status</th><th>Amount</th></tr>
                    </thead>
                    <tbody>
                      {recentBookings.map(b => (
                        <tr key={b._id}>
                          <td>{b.user?.firstname} {b.user?.lastname}</td>
                          <td>{b.package?.title}</td>
                          <td><span className={`badge ${STATUS_COLORS[b.status]}`}>{b.status}</span></td>
                          <td>₹{b.pricing?.finalAmount?.toLocaleString() || "—"}</td>
                        </tr>
                      ))}
                      {recentBookings.length === 0 && <tr><td colSpan="4" style={{ textAlign: "center" }}>No bookings yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Enquiries */}
              <div className="card admin-table-card">
                <div className="table-header">
                  <h3>Recent Enquiries</h3>
                  <button className="btn btn-sm btn-outline" onClick={() => setTab("enquiries")}>View All</button>
                </div>
                <div className="table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Name</th><th>Subject</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {recentEnquiries.map(e => (
                        <tr key={e._id}>
                          <td>{e.name}<br /><small>{e.email}</small></td>
                          <td>{e.subject}</td>
                          <td><span className={`badge ${ENQUIRY_STATUS_COLORS[e.status] || "badge-gold"}`}>{e.status || "new"}</span></td>
                        </tr>
                      ))}
                      {recentEnquiries.length === 0 && <tr><td colSpan="3" style={{ textAlign: "center" }}>No enquiries yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Quick breakdown */}
            <div className="admin-breakdown card">
              <h3 style={{ marginBottom: 16 }}>Booking Status Breakdown</h3>
              <div className="breakdown-bars">
                {["Pending", "Confirmed", "Cancelled"].map(s => {
                  const count = bookings.filter(b => b.status === s).length;
                  const pct = bookings.length ? Math.round((count / bookings.length) * 100) : 0;
                  const colors = { Pending: "#F59E0B", Confirmed: "#10B981", Cancelled: "#EF4444" };
                  return (
                    <div key={s} className="breakdown-bar-row">
                      <span className="breakdown-label">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                      <div className="breakdown-track">
                        <div className="breakdown-fill" style={{ width: `${pct}%`, background: colors[s] }} />
                      </div>
                      <span className="breakdown-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── BOOKINGS ── */}
        {tab === "bookings" && (
          <div className="card admin-table-card">
            <div className="table-header">
              <h3>All Bookings ({filteredBookings.length})</h3>
              <input className="admin-search" placeholder="Search bookings..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {loading ? <p className="admin-loading">Loading...</p> : (
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Customer</th><th>Trip</th><th>Travelers</th><th>Date</th><th>Total</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map(b => (
                      <tr key={b._id}>
                        <td>{b.user?.firstname} {b.user?.lastname}<br /><small>{b.user?.email}</small></td>
                        <td>{b.package?.title}<br /><small>{b.package?.location?.city}</small></td>
                        <td>{b.travelerDetails?.numberOfTravelers || "—"}</td>
                        <td>{b.travelDetails?.startDate ? new Date(b.travelDetails.startDate).toLocaleDateString() : "—"}</td>
                        <td><strong>₹{b.pricing?.finalAmount?.toLocaleString() || "—"}</strong></td>
                        <td>
                          <select className="admin-select" value={b.status}
                            onChange={e => updateBookingStatus(b._id, e.target.value)}>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>—</td>
                      </tr>
                    ))}
                    {filteredBookings.length === 0 && <tr><td colSpan="7" style={{ textAlign: "center" }}>No bookings found.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ENQUIRIES ── */}
        {tab === "enquiries" && (
          <div className="card admin-table-card">
            <div className="table-header">
              <h3>All Enquiries ({filteredEnquiries.length})</h3>
              <input className="admin-search" placeholder="Search enquiries..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {loading ? <p className="admin-loading">Loading...</p> : (
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Subject</th><th>Message</th><th>Date</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredEnquiries.map(e => (
                      <tr key={e._id}>
                        <td>{e.name}</td>
                        <td>{e.email}</td>
                        <td>{e.subject}</td>
                        <td style={{ maxWidth: 200 }}><span className="table-truncate">{e.message}</span></td>
                        <td>{e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "—"}</td>
                        <td>
                          <select className="admin-select" value={e.status || "New"}
                            onChange={ev => updateEnquiryStatus(e._id, ev.target.value)}>
                            <option value="New">New</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-danger" onClick={() => deleteEnquiry(e._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {filteredEnquiries.length === 0 && <tr><td colSpan="7" style={{ textAlign: "center" }}>No enquiries found.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── PACKAGES ── */}
        {tab === "packages" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Trip form */}
            <div className="card admin-table-card">
              <div className="table-header">
                <h3>{editingTrip ? "✏️ Edit Trip" : "➕ Add New Trip"}</h3>
                {editingTrip && (
                  <button className="btn btn-sm" style={{ background: "#6B7280", color: "#fff" }}
                    onClick={() => { setEditingTrip(null); setTripForm(EMPTY_TRIP); setTripMsg(""); }}>
                    Cancel Edit
                  </button>
                )}
              </div>
              <form onSubmit={handleTripSubmit} className="trip-form">
                {[
                  { name: "title", placeholder: "Trip Title", type: "text" },
                  { name: "destination", placeholder: "Destination City", type: "text" },
                  { name: "duration", placeholder: "Duration (days)", type: "number" },
                  { name: "price", placeholder: "Price (₹)", type: "number" },
                  { name: "maxGroupSize", placeholder: "Max Group Size", type: "number" },
                  { name: "image", placeholder: "Image URL (optional)", type: "text" },
                  { name: "startDate", placeholder: "Start Date", type: "date" },
                  { name: "endDate", placeholder: "End Date", type: "date" },
                ].map(f => (
                  <input key={f.name} name={f.name} type={f.type} placeholder={f.placeholder}
                    className="form-control" value={tripForm[f.name]}
                    onChange={e => setTripForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                    required={f.name !== "image" && f.name !== "startDate" && f.name !== "endDate"} />
                ))}
                <textarea name="description" placeholder="Description" className="form-control"
                  style={{ gridColumn: "1 / -1" }} value={tripForm.description} required
                  onChange={e => setTripForm(p => ({ ...p, description: e.target.value }))} />
                <select name="category" className="form-control" value={tripForm.category}
                  onChange={e => setTripForm(p => ({ ...p, category: e.target.value }))}>
                  {["Nature", "Leisure", "Adventure", "Cultural", "Wellness"].map(c => <option key={c}>{c}</option>)}
                </select>
                <button type="submit" className="btn btn-primary">{editingTrip ? "Update Trip" : "+ Add Trip"}</button>
                {tripMsg && (
                  <p style={{ gridColumn: "1 / -1", color: tripMsg.includes("success") ? "#10B981" : "#EF4444", margin: 0 }}>
                    {tripMsg}
                  </p>
                )}
              </form>
            </div>

            {/* Trips table */}
            <div className="card admin-table-card">
              <div className="table-header">
                <h3>All Trips ({filteredTrips.length})</h3>
                <input className="admin-search" placeholder="Search trips..."
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              {loading ? <p className="admin-loading">Loading...</p> : (
                <div className="table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Title</th><th>Destination</th><th>Category</th><th>Price</th><th>Duration</th><th>Active</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {filteredTrips.map(t => (
                        <tr key={t._id}>
                          <td>{t.title}</td>
                          <td>{t.location?.city || t.destination}</td>
                          <td><span className="badge badge-blue">{t.category}</span></td>
                          <td>₹{(t.pricing?.basePrice || t.price)?.toLocaleString()}</td>
                          <td>{t.duration?.days || t.duration} days</td>
                          <td>
                            <span className={`badge ${t.availability?.isActive !== false ? "badge-green" : "badge-red"}`}>
                              {t.availability?.isActive !== false ? "Yes" : "No"}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-edit" onClick={() => startEditTrip(t)}>Edit</button>
                            <button className="btn btn-sm btn-danger" onClick={() => deleteTrip(t._id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                      {filteredTrips.length === 0 && <tr><td colSpan="7" style={{ textAlign: "center" }}>No trips found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <div className="card admin-table-card">
            <div className="table-header">
              <h3>All Users ({filteredUsers.length})</h3>
              <input className="admin-search" placeholder="Search users..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {loading ? <p className="admin-loading">Loading...</p> : (
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u._id}>
                        <td>{u.firstname} {u.lastname}</td>
                        <td>{u.email}</td>
                        <td>{u.phone || "—"}</td>
                        <td><span className={`badge ${u.role === "admin" ? "badge-blue" : "badge-green"}`}>{u.role}</span></td>
                        <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                        <td>
                          {u.role !== "admin" && (
                            <button className="btn btn-sm btn-danger" onClick={() => deleteUser(u._id)}>Delete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && <tr><td colSpan="6" style={{ textAlign: "center" }}>No users found.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminPanel;
