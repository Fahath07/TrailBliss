import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import "./MyBookings.css";

const STATUS_COLORS = {
  Pending: "status-pending",
  Confirmed: "status-confirmed",
  "In Progress": "status-progress",
  Completed: "status-completed",
  Cancelled: "status-cancelled",
  Refunded: "status-refunded",
};

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/bookings/my")
      .then(({ data }) => setBookings(data.data || []))
      .catch(() => setError("Failed to load bookings."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mybookings-state">Loading your bookings...</div>;
  if (error) return <div className="mybookings-state mybookings-error">{error}</div>;

  return (
    <div className="mybookings-page">
      <div className="page-hero">
        <h1>📋 My Bookings</h1>
        <p>Track and manage all your trip bookings</p>
      </div>

      <section className="section">
        <div className="container mybookings-container">
          {bookings.length === 0 ? (
            <div className="mybookings-empty card">
              <div className="empty-icon">🗺️</div>
              <h3>No bookings yet</h3>
              <p>You haven't booked any trips yet. Start exploring!</p>
              <Link to="/packages" className="btn btn-primary">Browse Packages</Link>
            </div>
          ) : (
            <div className="mybookings-list">
              {bookings.map(b => (
                <div key={b._id} className="booking-card card">
                  <div className="booking-image">
                    <img
                      src={b.package?.images?.featured || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80"}
                      alt={b.package?.title}
                    />
                  </div>
                  <div className="booking-info">
                    <div className="booking-top">
                      <div>
                        <h3>{b.package?.title || "Trip"}</h3>
                        <p className="booking-location">
                          📍 {b.package?.location?.city}{b.package?.location?.state ? `, ${b.package.location.state}` : ""}
                        </p>
                      </div>
                      <span className={`booking-status ${STATUS_COLORS[b.status] || "status-pending"}`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="booking-meta">
                      <div className="booking-meta-item">
                        <span>📅 Travel Date</span>
                        <strong>{b.travelDetails?.startDate ? new Date(b.travelDetails.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</strong>
                      </div>
                      <div className="booking-meta-item">
                        <span>👥 Travelers</span>
                        <strong>{b.travelerDetails?.numberOfTravelers || 1}</strong>
                      </div>
                      <div className="booking-meta-item">
                        <span>🎒 Trip Type</span>
                        <strong>{b.travelDetails?.tripType || "—"}</strong>
                      </div>
                      <div className="booking-meta-item">
                        <span>💰 Total Amount</span>
                        <strong>₹{b.pricing?.finalAmount?.toLocaleString() || "—"}</strong>
                      </div>
                    </div>

                    {b.travelerDetails?.primaryContact?.fullName && (
                      <p className="booking-contact">
                        Contact: {b.travelerDetails.primaryContact.fullName} · {b.travelerDetails.primaryContact.phone}
                      </p>
                    )}

                    <div className="booking-footer">
                      <span className="booking-id">Booking ID: {b.bookingId || b._id?.slice(-6).toUpperCase()}</span>
                      <span className="booking-date">Booked on {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default MyBookings;
