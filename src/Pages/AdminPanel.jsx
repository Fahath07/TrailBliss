import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import "./AdminPanel.css";

const statusColors = {
  confirmed: "badge-green", pending: "badge-gold", cancelled: "badge badge-red",
};

function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tripForm, setTripForm] = useState({ title: "", description: "", destination: "", duration: "", price: "", maxGroupSize: "", startDate: "", endDate: "", image: "", category: "Nature" });
  const [tripMsg, setTripMsg] = useState("");
  const [editingTrip, setEditingTrip] = useState(null);

  // Guard: redirect non-admins
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "admin") { navigate("/"); }
  }, [user, navigate]);

  const fetchBookings = useCallback(() => {
    setLoading(true);
    setError("");
    api.get("/bookings/all")
      .then(({ data }) => setBookings(data.data || []))
      .catch((err) => {
        setError("Failed to load bookings");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    setError("");
    api.get("/user/all")
      .then(({ data }) => setUsers(data.data || []))
      .catch((err) => {
        setError("Failed to load users");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchTrips = useCallback(() => {
    setLoading(true);
    setError("");
    api.get("/trips")
      .then(({ data }) => setTrips(data.data || []))
      .catch((err) => {
        setError("Failed to load trips");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === "bookings") fetchBookings();
    else if (tab === "users") fetchUsers();
    else if (tab === "packages") fetchTrips();
  }, [tab, fetchBookings, fetchUsers, fetchTrips]);

  async function updateBookingStatus(id, status) {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status } : b));
    } catch (err) {
      setError("Failed to update booking status");
    }
  }

  async function deleteUser(id) {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/user/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      setError("Failed to delete user");
    }
  }

  async function deleteTrip(id) {
    if (!window.confirm("Delete this trip?")) return;
    try {
      await api.delete(`/trips/${id}`);
      setTrips((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError("Failed to delete trip");
    }
  }

  function handleTripChange(e) {
    const { name, value } = e.target;
    setTripForm((prev) => ({ ...prev, [name]: value }));
  }

  function editTrip(trip) {
    setEditingTrip(trip._id);
    setTripForm({
      title: trip.title,
      description: trip.description,
      destination: trip.location?.city || trip.destination || "",
      duration: trip.duration?.days || trip.duration || "",
      price: trip.pricing?.basePrice || trip.price || "",
      maxGroupSize: trip.groupSize?.max || trip.maxGroupSize || "",
      startDate: trip.startDate ? trip.startDate.split('T')[0] : "",
      endDate: trip.endDate ? trip.endDate.split('T')[0] : "",
      image: trip.images?.featured || trip.image || "",
      category: trip.category || "Nature"
    });
  }

  function cancelEdit() {
    setEditingTrip(null);
    setTripForm({ title: "", description: "", destination: "", duration: "", price: "", maxGroupSize: "", startDate: "", endDate: "", image: "", category: "Nature" });
  }

  async function handleAddTrip(e) {
    e.preventDefault();
    setTripMsg("");
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
        availability: { isActive: true }
      };

      if (editingTrip) {
        await api.put(`/trips/${editingTrip}`, tripData);
        setTripMsg("Trip updated successfully!");
        setEditingTrip(null);
      } else {
        await api.post("/trips", tripData);
        setTripMsg("Trip added successfully!");
      }
      
      setTripForm({ title: "", description: "", destination: "", duration: "", price: "", maxGroupSize: "", startDate: "", endDate: "", image: "", category: "Nature" });
      fetchTrips();
    } catch (err) {
      setTripMsg(err.response?.data?.message || "Failed to save trip.");
    }
  }

  const stats = [
    { icon: "📦", label: "Total Bookings", value: bookings.length, color: "#3B82F6" },
    { icon: "👥", label: "Total Users", value: users.length, color: "#8B5CF6" },
    { icon: "🗺️", label: "Total Trips", value: trips.length, color: "#10B981" },
    { icon: "✅", label: "Confirmed", value: bookings.filter((b) => b.status === "confirmed").length, color: "#F59E0B" },
  ];

  if (!user || user.role !== "admin") return null;

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span>🧭</span>
          <strong>TrailBliss</strong>
          <small>Admin</small>
        </div>
        <nav className="admin-nav">
          {[
            { key: "bookings", icon: "📦", label: "Bookings" },
            { key: "users", icon: "👥", label: "Users" },
            { key: "packages", icon: "🗺️", label: "Packages" },
          ].map((item) => (
            <button key={item.key} className={`admin-nav-item ${tab === item.key ? "active" : ""}`} onClick={() => setTab(item.key)}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h2>Dashboard</h2>
            <p>Welcome back, {user.firstname} 👋</p>
          </div>
          <div className="admin-topbar-right">
            <span className="admin-avatar">{user.firstname?.[0]?.toUpperCase()}</span>
          </div>
        </div>

        <div className="admin-stats">
          {stats.map((s) => (
            <div className="admin-stat-card card" key={s.label}>
              <div className="stat-icon" style={{ background: s.color + "18", color: s.color }}>{s.icon}</div>
              <div>
                <p className="stat-label">{s.label}</p>
                <strong className="stat-value">{s.value}</strong>
              </div>
            </div>
          ))}
        </div>

        <div className="admin-tabs">
          {["bookings", "users", "packages"].map((t) => (
            <button key={t} className={`admin-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading && <p style={{ padding: "1rem" }}>Loading...</p>}
        {error && <p style={{ padding: "1rem", color: "#EF4444" }}>{error}</p>}

        {/* Bookings */}
        {tab === "bookings" && !loading && (
          <div className="card admin-table-card">
            <div className="table-header"><h3>All Bookings</h3></div>
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Customer</th><th>Trip</th><th>Seats</th><th>Total</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td>{b.user?.firstname} {b.user?.lastname}<br /><small>{b.user?.email}</small></td>
                      <td>{b.trip?.title}<br /><small>{b.trip?.destination || b.trip?.location?.city}</small></td>
                      <td>{b.seats || b.numberOfTravelers}</td>
                      <td><strong>₹{b.totalPrice?.toLocaleString()}</strong></td>
                      <td><span className={`badge ${statusColors[b.status]}`}>{b.status}</span></td>
                      <td>
                        <select className="form-control" style={{ padding: "4px 8px", fontSize: "0.8rem", width: "auto" }}
                          value={b.status} onChange={(e) => updateBookingStatus(b._id, e.target.value)}>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && <tr><td colSpan="6" style={{ textAlign: "center" }}>No bookings yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === "users" && !loading && (
          <div className="card admin-table-card">
            <div className="table-header"><h3>All Users</h3></div>
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.firstname} {u.lastname}</td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td><span className={`badge ${u.role === "admin" ? "badge-blue" : "badge-green"}`}>{u.role}</span></td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        {u.role !== "admin" && (
                          <button className="btn btn-sm" style={{ background: "#EF4444", color: "#fff" }} onClick={() => deleteUser(u._id)}>Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan="6" style={{ textAlign: "center" }}>No users found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Packages */}
        {tab === "packages" && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Add Trip Form */}
            <div className="card admin-table-card">
              <div className="table-header">
                <h3>{editingTrip ? "Edit Trip" : "Add New Trip"}</h3>
                {editingTrip && (
                  <button onClick={cancelEdit} className="btn btn-sm" style={{ background: "#6B7280", color: "#fff" }}>
                    Cancel
                  </button>
                )}
              </div>
              <form onSubmit={handleAddTrip} style={{ padding: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {[
                  { name: "title", placeholder: "Title", type: "text" },
                  { name: "destination", placeholder: "Destination", type: "text" },
                  { name: "duration", placeholder: "Duration (days)", type: "number" },
                  { name: "price", placeholder: "Price (₹)", type: "number" },
                  { name: "maxGroupSize", placeholder: "Max Group Size", type: "number" },
                  { name: "image", placeholder: "Image URL (optional)", type: "text" },
                  { name: "startDate", placeholder: "Start Date", type: "date" },
                  { name: "endDate", placeholder: "End Date", type: "date" },
                ].map((f) => (
                  <input key={f.name} name={f.name} type={f.type} placeholder={f.placeholder}
                    className="form-control" value={tripForm[f.name]} onChange={handleTripChange} required={f.name !== "image"} />
                ))}
                <textarea name="description" placeholder="Description" className="form-control"
                  style={{ gridColumn: "1 / -1" }} value={tripForm.description} onChange={handleTripChange} required />
                <select name="category" className="form-control" value={tripForm.category} onChange={handleTripChange}>
                  {["Nature", "Leisure", "Adventure", "Cultural", "Wellness"].map((c) => <option key={c}>{c}</option>)}
                </select>
                <button type="submit" className="btn btn-primary">{editingTrip ? "Update Trip" : "+ Add Trip"}</button>
                {tripMsg && <p style={{ gridColumn: "1 / -1", color: tripMsg.includes("success") ? "#10B981" : "#EF4444" }}>{tripMsg}</p>}
              </form>
            </div>

            {/* Trips Table */}
            <div className="card admin-table-card">
              <div className="table-header"><h3>All Trips ({trips.length})</h3></div>
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Title</th><th>Destination</th><th>Price</th><th>Duration</th><th>Available</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {trips.map((t) => (
                      <tr key={t._id}>
                        <td>{t.title}</td>
                        <td>{t.location?.city || t.destination}</td>
                        <td>₹{(t.pricing?.basePrice || t.price)?.toLocaleString()}</td>
                        <td>{t.duration?.days || t.duration} days</td>
                        <td><span className={`badge ${(t.availability?.isActive !== false) ? "badge-green" : "badge badge-red"}`}>{(t.availability?.isActive !== false) ? "Yes" : "No"}</span></td>
                        <td>
                          <button className="btn btn-sm" style={{ background: "#3B82F6", color: "#fff", marginRight: "8px" }} onClick={() => editTrip(t)}>Edit</button>
                          <button className="btn btn-sm" style={{ background: "#EF4444", color: "#fff" }} onClick={() => deleteTrip(t._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {trips.length === 0 && <tr><td colSpan="6" style={{ textAlign: "center" }}>No trips yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminPanel;
