import { useState, useEffect } from "react";
import Field from "../Components/Field";
import "./Contact.css";

// Custom hook for form management built into component
function useFormValidation(initialState, validationRules) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };
  
  const validate = () => {
    const errs = {};
    Object.keys(validationRules).forEach(field => {
      const rule = validationRules[field];
      const value = form[field] || "";
      if (rule.required && !value.trim()) {
        errs[field] = rule.requiredMessage || `${field} is required`;
      } else if (rule.pattern && value.trim() && !rule.pattern.test(value)) {
        errs[field] = rule.patternMessage || `Invalid ${field}`;
      }
    });
    return errs;
  };
  
  const reset = () => {
    setForm(initialState);
    setErrors({});
  };
  
  return { form, errors, handleChange, validate, reset, setErrors };
}

function Contact() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  
  // Using custom form hook
  const { form, errors, handleChange, validate, reset, setErrors } = useFormValidation(
    { name: "", email: "", subject: "", message: "" },
    {
      name: { required: true, requiredMessage: "Name is required" },
      email: { 
        required: true, 
        requiredMessage: "Email is required",
        pattern: /\S+@\S+\.\S+/,
        patternMessage: "Enter a valid email"
      },
      subject: { required: true, requiredMessage: "Subject is required" },
      message: { required: true, requiredMessage: "Message cannot be empty" }
    }
  );
  
  // Demo of useEffect for cleanup
  useEffect(() => {
    // Cleanup function when component unmounts
    return () => {
      if (loading) {
        // Form cleanup
      }
    };
  }, [loading]);

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { 
      setErrors(errs); 
      return; 
    }
    setLoading(true);
    setTimeout(() => { 
      setLoading(false); 
      setSent(true); 
    }, 1000);
  }

  function handleReset() {
    reset();
    setSent(false);
  }

  return (
    <div>
      <div className="page-hero">
        <h1>📬 Contact Us</h1>
        <p>We'd love to hear from you. Reach out anytime!</p>
      </div>

      <section className="section">
        <div className="container contact-layout">
          {/* static info — no state needed here */}
          <div className="contact-info">
            <h3>Get in Touch</h3>
            <p style={{ color: "var(--muted)", lineHeight: 1.75, marginTop: 8 }}>
              Have a question about a package or need help planning your trip?
              Our team is here to help.
            </p>
            <div className="contact-cards">
              {[
                { icon: "📍", title: "Our Office",     detail: "Palani Road, Dharapuram, Tiruppur, Tamil Nadu 638657" },
                { icon: "📞", title: "Phone",          detail: "+91 6369386812" },
                { icon: "✉️", title: "Email",          detail: "adventure@trailbliss.in" },
                { icon: "🕐", title: "Working Hours",  detail: "Mon–Sat, 9 AM – 7 PM" },
              ].map((c) => (
                <div className="contact-info-card" key={c.title}>
                  <span className="contact-icon">{c.icon}</span>
                  <div>
                    <strong>{c.title}</strong>
                    <p>{c.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* contact form */}
          <div className="card contact-form-card">
            {sent ? (
              <div className="contact-sent">
                <div style={{ fontSize: "2.5rem" }}>✅</div>
                <h3>Message Sent!</h3>
                <p>We'll get back to you within 24 hours.</p>
                <button className="btn btn-primary" onClick={handleReset}>
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h3 style={{ marginBottom: 24, color: "var(--navy)" }}>
                  Send a Message
                </h3>

                <div className="form-grid-2">
                  <Field label="Your Name" error={errors.name} required>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      className={`form-control ${errors.name ? "input-error" : ""}`}
                      placeholder="John Doe"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </Field>
                  <Field label="Email" error={errors.email} required>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      className={`form-control ${errors.email ? "input-error" : ""}`}
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </Field>
                </div>

                <Field label="Subject" error={errors.subject} required style={{ marginTop: 16 }}>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    className={`form-control ${errors.subject ? "input-error" : ""}`}
                    placeholder="How can we help?"
                    value={form.subject}
                    onChange={handleChange}
                  />
                </Field>

                <Field label="Message" error={errors.message} required style={{ marginTop: 16 }}>
                  <textarea
                    id="contact-message"
                    name="message"
                    className={`form-control ${errors.message ? "input-error" : ""}`}
                    placeholder="Write your message here..."
                    value={form.message}
                    onChange={handleChange}
                  />
                </Field>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ marginTop: 24, width: "100%" }}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Message 📨"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
