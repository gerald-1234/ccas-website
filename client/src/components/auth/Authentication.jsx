import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../config/api";
import { BLOOD_GROUPS } from "../../config/constants";
import { useAuth } from "../../useAuth";
import { BrandLockup } from "../common/BrandLockup";
import { AuthBrandPanel } from "./AuthBrandPanel";

const inputClass =
  "w-full px-3.5 py-2.5 text-sm bg-white rounded-lg border border-slate-300 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all placeholder:text-slate-400";

const labelClass = "block text-xs font-medium text-slate-700 mb-1.5";

const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4 text-white"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const Authentication = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regData, setRegData] = useState({
    first_name: "",
    last_name: "",
    gender: "Male",
    date_of_birth: "",
    phone: "",
    email: "",
    password: "",
    residential_address: "",
    blood_group: BLOOD_GROUPS?.[0] || "O+",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  const handleRegChange = (field, value) => {
    setRegData((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleMode = () => {
    setError("");
    setIsRegistering((prev) => !prev);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(regData),
      });
      await login(regData.email, regData.password);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 antialiased selection:bg-blue-500 selection:text-white">
      <AuthBrandPanel />

      <div className="w-full lg:w-1/2 flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col px-5 sm:px-10 lg:px-16 py-6 sm:py-8">
          {/* Header Bar */}
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <BrandLockup size="sm" />
            <button
              onClick={() => navigate("/")}
              type="button"
              className="text-xs sm:text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors duration-150"
            >
              ← Back to Home
            </button>
          </div>

          {/* Content Box */}
          <div className="flex-1 flex items-center">
            <div className="max-w-md w-full mx-auto space-y-6 py-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  {isRegistering ? "Create Patient Account" : "Welcome Back"}
                </h1>
                <p className="text-slate-500 text-sm mt-1.5">
                  {isRegistering
                    ? "Enter your personal and medical information to register."
                    : "Sign in with your credentials to access your care portal."}
                </p>
              </div>

              {error && (
                <div className="p-3.5 text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200/80 rounded-lg flex items-start gap-2.5">
                  <svg
                    className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {!isRegistering ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className={inputClass}
                      placeholder="name@example.com"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className={`${inputClass} pr-16`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600/40 transition duration-150 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-5">
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Personal Info
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>First Name</label>
                        <input
                          type="text"
                          required
                          value={regData.first_name}
                          onChange={(e) =>
                            handleRegChange("first_name", e.target.value)
                          }
                          className={inputClass}
                          placeholder="Jane"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Last Name</label>
                        <input
                          type="text"
                          required
                          value={regData.last_name}
                          onChange={(e) =>
                            handleRegChange("last_name", e.target.value)
                          }
                          className={inputClass}
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Gender</label>
                        <select
                          value={regData.gender}
                          onChange={(e) =>
                            handleRegChange("gender", e.target.value)
                          }
                          className={inputClass}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Date of Birth</label>
                        <input
                          type="date"
                          required
                          value={regData.date_of_birth}
                          onChange={(e) =>
                            handleRegChange("date_of_birth", e.target.value)
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={regData.phone}
                          onChange={(e) =>
                            handleRegChange("phone", e.target.value)
                          }
                          className={inputClass}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Blood Group</label>
                        <select
                          value={regData.blood_group}
                          onChange={(e) =>
                            handleRegChange("blood_group", e.target.value)
                          }
                          className={inputClass}
                        >
                          {BLOOD_GROUPS?.map((bg) => (
                            <option key={bg} value={bg}>
                              {bg}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Residential Address</label>
                      <input
                        type="text"
                        required
                        value={regData.residential_address}
                        onChange={(e) =>
                          handleRegChange("residential_address", e.target.value)
                        }
                        className={inputClass}
                        placeholder="123 Health Ave, Suite 100"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Account Credentials
                    </p>
                    <div>
                      <label className={labelClass}>Email Address</label>
                      <input
                        type="email"
                        required
                        value={regData.email}
                        onChange={(e) =>
                          handleRegChange("email", e.target.value)
                        }
                        className={inputClass}
                        placeholder="jane.doe@example.com"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Password</label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={regData.password}
                          onChange={(e) =>
                            handleRegChange("password", e.target.value)
                          }
                          className={`${inputClass} pr-16`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                        >
                          {showRegPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Emergency Contact
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Contact Name</label>
                        <input
                          type="text"
                          required
                          value={regData.emergency_contact_name}
                          onChange={(e) =>
                            handleRegChange(
                              "emergency_contact_name",
                              e.target.value,
                            )
                          }
                          className={inputClass}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Contact Phone</label>
                        <input
                          type="tel"
                          required
                          value={regData.emergency_contact_phone}
                          onChange={(e) =>
                            handleRegChange(
                              "emergency_contact_phone",
                              e.target.value,
                            )
                          }
                          className={inputClass}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600/40 transition duration-150 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      "Complete Registration"
                    )}
                  </button>
                </form>
              )}

              <div className="pt-4 border-t border-slate-200 text-center">
                <p className="text-sm text-slate-600">
                  {isRegistering
                    ? "Already have an account?"
                    : "Don't have an account yet?"}{" "}
                  <button
                    type="button"
                    onClick={handleToggleMode}
                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors focus:outline-none"
                  >
                    {isRegistering ? "Sign In" : "Create Account"}
                  </button>
                </p>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 pt-6">
            © {new Date().getFullYear()} CareConnect. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};
