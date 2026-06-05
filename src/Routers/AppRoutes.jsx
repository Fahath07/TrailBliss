import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import Homepage from "../Pages/Homepage";
import Login from "../Pages/Login";
import Signup from "../Pages/Signup";
import ForgotPassword from "../Pages/ForgotPassword";
import About from "../Pages/About";
import Contact from "../Pages/Contact";
import Packages from "../Pages/Packages";
import ApplicationForm from "../Pages/ApplicationForm";
import FAQ from "../Pages/FAQ";
import PrivacyPolicy from "../Pages/PrivacyPolicy";
import Terms from "../Pages/Terms";
import AdminPanel from "../Pages/AdminPanel";
import { useAuth } from "../context/AuthContext";

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

// Redirects unauthenticated users to /login, preserving the intended destination
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Admin — no Navbar/Footer */}
      <Route path="/admin" element={<AdminPanel />} />

      {/* Public pages */}
      <Route path="/" element={<Layout><Homepage /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/signup" element={<Layout><Signup /></Layout>} />
      <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
      <Route path="/about" element={<Layout><About /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />
      <Route path="/packages" element={<Layout><Packages /></Layout>} />
      <Route path="/faq" element={<Layout><FAQ /></Layout>} />
      <Route path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />
      <Route path="/terms" element={<Layout><Terms /></Layout>} />

      {/* Protected — must be logged in */}
      <Route
        path="/apply"
        element={
          <ProtectedRoute>
            <Layout><ApplicationForm /></Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
