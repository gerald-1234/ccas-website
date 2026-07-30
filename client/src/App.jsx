import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  Link,
} from "react-router-dom";

import { AuthProvider } from "./AuthContext";
import { useAuth } from "./useAuth";

import { Authentication } from "./components/auth/Authentication";
import { Dashboard } from "./components/dashboards/Dashboard";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { LandingPage } from "./components/landing/LandingPage";

const LoadingScreen = ({ text = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-slate-500 text-sm font-medium animate-pulse">
      {text}
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen text="Authenticating session..." />;
  }

  return user ? children : <Navigate to="/auth" replace />;
};

const PublicAuthRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
};

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          <Route
            path="/auth"
            element={
              <PublicAuthRoute>
                <Authentication />
              </PublicAuthRoute>
            }
          />

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

          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center">
                <h1 className="mb-2 text-5xl font-extrabold text-slate-900">
                  404
                </h1>

                <p className="mb-6 text-sm text-slate-500">
                  The page you are looking for does not exist.
                </p>

                <Link
                  to="/"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  Return Home
                </Link>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
