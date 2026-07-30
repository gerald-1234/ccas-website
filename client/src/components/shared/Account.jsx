import { useState } from "react";
// import { useAuth } from "../../AuthContext";
import { useAuth } from "../../useAuth.js";
import { apiRequest } from "../../config/api";

export const Account = () => {
  const { user, profile, logout } = useAuth();
  const [form, setForm] = useState({ current_password: "", new_password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (form.new_password !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    try {
      setSaving(true);
      await apiRequest("/auth/change-password", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setMessage({ type: "success", text: "Password updated successfully." });
      setForm({ current_password: "", new_password: "" });
      setConfirmPassword("");
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">My Account</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Name
            </p>
            <p className="text-slate-900 mt-0.5">
              {user?.first_name} {user?.last_name}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Role
            </p>
            <p className="text-slate-900 mt-0.5 capitalize">{user?.role}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Email
            </p>
            <p className="text-slate-900 mt-0.5">
              {user?.email || profile?.email || "—"}
            </p>
          </div>
          {profile?.phone && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">
                Phone
              </p>
              <p className="text-slate-900 mt-0.5">{profile.phone}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Change Password
        </h2>

        {message.text && (
          <div
            className={`p-3 mb-4 rounded-lg text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={form.current_password}
              onChange={(e) =>
                setForm({ ...form, current_password: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={form.new_password}
              onChange={(e) =>
                setForm({ ...form, new_password: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      <button
        onClick={logout}
        className="text-sm font-semibold text-red-600 hover:text-red-700"
      >
        Log out of CareConnect
      </button>
    </div>
  );
};
