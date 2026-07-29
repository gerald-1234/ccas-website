import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

// Auth Provider (located directly in src/)
import { AuthProvider, useAuth } from "./AuthContext";

// Components
import { Authentication } from "./components/auth/Authentication";
import { Dashboard } from "./components/dashboards/Dashboard";
import { LandingPage } from "./components/landing/LandingPage";
import { DashboardLayout } from "./components/layout/DashboardLayout";

// Protected Route Wrapper (Restricted to logged-in users)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 font-medium text-sm animate-pulse">
          Authenticating session...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

// Public Route Wrapper (Redirects logged-in users away from auth to dashboard)
const PublicAuthRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 font-medium text-sm animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Redirects logged-in users from the root path to their dashboard.
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null; // Or a loading spinner
  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing Page (redirects if logged in) */}
          <Route path="/" element={<RootRedirect />} />

          {/* Authentication Route (src/components/auth/Authentication.jsx) */}
          <Route
            path="/auth"
            element={
              <PublicAuthRoute>
                <Authentication />
              </PublicAuthRoute>
            }
          />

          {/* Protected Dashboard Route */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback 404 Route */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-slate-50">
                <h1 className="text-5xl font-extrabold text-slate-900 mb-2">
                  404
                </h1>
                <p className="text-slate-500 mb-6 text-sm">
                  The page you are looking for does not exist.
                </p>
                <a
                  href="/"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  Return Home
                </a>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
