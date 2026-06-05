import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import "./ApplicationForm.css";


function ApplicationForm() {
  const [tab, setTab] = useState("book");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  // const [selectedPackage, setSelectedPackage] = useState(null); // Remove unused variable
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pkgId = searchParams.get("pkg");

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    if (pkgId && packages.length > 0) {
      const pkg = packages.find(p => p._id === pkgId);
      if (pkg) {
        // setSelectedPackage(pkg);
        setBookingForm(prev => ({ ...prev, package: pkg._id }));
      }
    }
  }, [pkgId, packages]);

  async function fetchPackages() {
    try {
      const { data } = await api.get("/trips");
      setPackages(data.data || []);
    } catch (err) {
      console.error("Failed to fetch packages", err);
    }
  }

  const [bookingForm, setBookingForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    travelers: "",
    package: "",
    travelDate: "",
    budget: "",
    tripType: "",
    notes: "",
  });

  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  // Pre-fill user details once user is available
  useEffect(() => {
    if (user) {
      setBookingForm((prev) => ({
        ...prev,
        fullName: `${user.firstname || ""} ${user.lastname || ""}`.trim(),
        email: user.email || "",
        phone: user.phone || "",
      }));
      setEnquiryForm((prev) => ({
        ...prev,
        name: `${user.firstname || ""} ${user.lastname || ""}`.trim(),
        email: user.email || "",
      }));
    }
  }, [user]);

  function handleBookingChange(e) {
    const { name, value } = e.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleEnquiryChange(e) {
    const { name, value } = e.target;
    setEnquiryForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validateBooking() {
    const errs = {};
    if (!bookingForm.fullName.trim()) errs.fullName = "Required";
    if (!bookingForm.email.trim()) errs.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(bookingForm.email)) errs.email = "Invalid email";
    if (!bookingForm.phone.trim()) errs.phone = "Required";
    if (!bookingForm.travelers) errs.travelers = "Required";
    if (!bookingForm.package) errs.package = "Select a package";
    if (!bookingForm.travelDate) errs.travelDate = "Select a date";
    return errs;
  }

  function validateEnquiry() {
    const errs = {};
    if (!enquiryForm.name.trim()) errs.name = "Required";
    if (!enquiryForm.email.trim()) errs.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(enquiryForm.email)) errs.email = "Invalid email";
    if (!enquiryForm.subject.trim()) errs.subject = "Required";
    if (!enquiryForm.message.trim()) errs.message = "Required";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = tab === "book" ? validateBooking() : validateEnquiry();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    
    setLoading(true);
    try {
      if (tab === "book") {
        const bookingData = {
          packageId: bookingForm.package,
          travelerDetails: {
            numberOfTravelers: parseInt(bookingForm.travelers),
            fullName: bookingForm.fullName,
            email: bookingForm.email,
            phone: bookingForm.phone,
            tripType: bookingForm.tripType
          },
          travelDetails: {
            startDate: new Date(bookingForm.travelDate),
            budgetRange: bookingForm.budget,
            specialRequests: bookingForm.notes
          }
        };
        
        await api.post("/bookings", bookingData);
      } else {
        await api.post("/enquiries", {
          enquiryId: `ENQ-${Date.now()}`,
          name: enquiryForm.name,
          email: enquiryForm.email,
          subject: enquiryForm.subject,
          message: enquiryForm.message,
        });
      }
      
      setSubmitted(true);
    } catch (err) {
      console.error("Submission failed:", err);
      setErrors({ submit: err.response?.data?.message || "Submission failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setSubmitted(false);
    setBookingForm({ fullName: "", email: "", phone: "", travelers: "", package: "", travelDate: "", budget: "", tripType: "", notes: "" });
    setEnquiryForm({ name: "", email: "", subject: "", message: "" });
    setErrors({});
    navigate("/packages");
  }

  if (submitted) {
    return (
      <div className="form-success-page">
        <div className="form-success-card card fade-up">
          <div className="success-icon">🎉</div>
          <h2>Booking Confirmed!</h2>
          <p>
            Your {tab === "book" ? "booking application" : "enquiry"} has been received.
            Our team will contact you within 24 hours.
          </p>
          <button className="btn btn-primary" onClick={handleReset}>Browse More Packages</button>
        </div>
      </div>
    );
  }


  return (
    <div>
      <div className="page-hero">
        <h1>📋 Book Your Trip</h1>
        <p>Fill in your details and we'll craft the perfect itinerary for you</p>
      </div>

      <section className="section">
        <div className="container form-container">
          <div className="form-tabs">
            <button className={`form-tab ${tab === "book" ? "active" : ""}`}
              onClick={() => { setTab("book"); setErrors({}); }}>
              ✈️ Booking Application
            </button>
            <button className={`form-tab ${tab === "enquiry" ? "active" : ""}`}
              onClick={() => { setTab("enquiry"); setErrors({}); }}>
              💬 General Enquiry
            </button>
          </div>

          <div className="card form-card fade-up">
            {tab === "book" ? (
              <form onSubmit={handleSubmit} noValidate>
                <h3 className="form-section-title">Personal Details</h3>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input name="fullName" type="text"
                      className={`form-control ${errors.fullName ? "input-error" : ""}`}
                      placeholder="John Doe" value={bookingForm.fullName} onChange={handleBookingChange} />
                    {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input name="email" type="email"
                      className={`form-control ${errors.email ? "input-error" : ""}`}
                      placeholder="you@example.com" value={bookingForm.email} onChange={handleBookingChange} />
                    {errors.email && <span className="error-msg">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input name="phone" type="tel"
                      className={`form-control ${errors.phone ? "input-error" : ""}`}
                      placeholder="+91 98765 43210" value={bookingForm.phone} onChange={handleBookingChange} />
                    {errors.phone && <span className="error-msg">{errors.phone}</span>}
                  </div>
                  <div className="form-group">
                    <label>Number of Travelers *</label>
                    <select name="travelers"
                      className={`form-control ${errors.travelers ? "input-error" : ""}`}
                      value={bookingForm.travelers} onChange={handleBookingChange}>
                      <option value="">Select</option>
                      {[1, 2, 3, 4, 5, "6+"].map((n) => (
                        <option key={n} value={n}>{n} {n === 1 ? "Person" : "People"}</option>
                      ))}
                    </select>
                    {errors.travelers && <span className="error-msg">{errors.travelers}</span>}
                  </div>
                </div>

                <div className="divider" />
                <h3 className="form-section-title">Trip Details</h3>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Preferred Package *</label>
                    <select name="package"
                      className={`form-control ${errors.package ? "input-error" : ""}`}
                      value={bookingForm.package} onChange={handleBookingChange}>
                      <option value="">Select a package</option>
                      {packages.map((pkg) => (
                        <option key={pkg._id || pkg.id} value={pkg._id || pkg.id}>
                          {pkg.title} - {pkg.location || pkg.location?.city}
                        </option>
                      ))}
                    </select>
                    {errors.package && <span className="error-msg">{errors.package}</span>}
                  </div>
                  <div className="form-group">
                    <label>Travel Date *</label>
                    <input name="travelDate" type="date"
                      className={`form-control ${errors.travelDate ? "input-error" : ""}`}
                      value={bookingForm.travelDate} onChange={handleBookingChange} />
                    {errors.travelDate && <span className="error-msg">{errors.travelDate}</span>}
                  </div>
                  <div className="form-group">
                    <label>Budget Range</label>
                    <select name="budget" className="form-control" value={bookingForm.budget} onChange={handleBookingChange}>
                      <option value="">Select</option>
                      <option>Under ₹2,000</option>
                      <option>₹2,000 – ₹3,000</option>
                      <option>₹3,000 – ₹5,000</option>
                      <option>Above ₹5,000</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Trip Type</label>
                    <select name="tripType" className="form-control" value={bookingForm.tripType} onChange={handleBookingChange}>
                      <option value="">Select</option>
                      <option>Family</option>
                      <option>Couple</option>
                      <option>Solo</option>
                      <option>Friends Group</option>
                      <option>Corporate</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 16 }}>
                  <label>
                    Special Requests / Notes{" "}
                    <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>({bookingForm.notes.length}/500)</span>
                  </label>
                  <textarea name="notes" className="form-control"
                    placeholder="Any dietary requirements, accessibility needs, or special requests..."
                    value={bookingForm.notes} onChange={handleBookingChange} maxLength={500} />
                </div>

                {errors.submit && <div className="error-msg" style={{ marginTop: 16 }}>{errors.submit}</div>}
                <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 24 }} disabled={loading}>
                  {loading ? "Submitting..." : "Confirm Booking ✈️"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h3 className="form-section-title">Send Us a Message</h3>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Your Name *</label>
                    <input name="name" type="text"
                      className={`form-control ${errors.name ? "input-error" : ""}`}
                      placeholder="John Doe" value={enquiryForm.name} onChange={handleEnquiryChange} />
                    {errors.name && <span className="error-msg">{errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input name="email" type="email"
                      className={`form-control ${errors.email ? "input-error" : ""}`}
                      placeholder="you@example.com" value={enquiryForm.email} onChange={handleEnquiryChange} />
                    {errors.email && <span className="error-msg">{errors.email}</span>}
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: 16 }}>
                  <label>Subject *</label>
                  <input name="subject" type="text"
                    className={`form-control ${errors.subject ? "input-error" : ""}`}
                    placeholder="What's this about?" value={enquiryForm.subject} onChange={handleEnquiryChange} />
                  {errors.subject && <span className="error-msg">{errors.subject}</span>}
                </div>
                <div className="form-group" style={{ marginTop: 16 }}>
                  <label>
                    Message *{" "}
                    <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>({enquiryForm.message.length}/1000)</span>
                  </label>
                  <textarea name="message"
                    className={`form-control ${errors.message ? "input-error" : ""}`}
                    style={{ minHeight: 160 }}
                    placeholder="Tell us how we can help you..."
                    value={enquiryForm.message} onChange={handleEnquiryChange} maxLength={1000} />
                  {errors.message && <span className="error-msg">{errors.message}</span>}
                </div>
                {errors.submit && <div className="error-msg" style={{ marginTop: 16 }}>{errors.submit}</div>}
                <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 24 }} disabled={loading}>
                  {loading ? "Sending..." : "Send Enquiry 💬"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ApplicationForm;
