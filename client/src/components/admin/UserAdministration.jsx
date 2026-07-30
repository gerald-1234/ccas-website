import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../../config/api";

const INITIAL_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  role: "receptionist",
  password: "",
  specialization: "",
  consultation_room: "",
};

const STAFF_ROLES = ["receptionist", "doctor", "nurse", "manager", "admin"];

function roleLabel(role) {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function UserAdministration() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [newPassword, setNewPassword] = useState("");
  const [resetUserId, setResetUserId] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [creating, setCreating] = useState(false);
  const [actionId, setActionId] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    setMessage({ type: "", text: "" });

    try {
      const query = roleFilter
        ? `?page=1&limit=100&role=${encodeURIComponent(roleFilter)}`
        : "?page=1&limit=100";
      const data = await apiRequest(`/admin/users${query}`);
      setUsers(data.users || []);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoadingUsers(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      loadUsers();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadUsers]);

  const updateForm = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreating(true);
    setMessage({ type: "", text: "" });

    try {
      await apiRequest("/admin/users", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setFormData(INITIAL_FORM);
      setMessage({ type: "success", text: "Staff account created successfully." });
      await loadUsers();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (user) => {
    const currentAction = `status-${user.id}`;
    setActionId(currentAction);
    setMessage({ type: "", text: "" });

    try {
      await apiRequest(`/admin/users/${user.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      setMessage({
        type: "success",
        text: `${user.email} was ${user.is_active ? "deactivated" : "activated"}.`,
      });
      await loadUsers();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setActionId("");
    }
  };

  const handlePasswordReset = async (event, user) => {
    event.preventDefault();
    const currentAction = `password-${user.id}`;
    setActionId(currentAction);
    setMessage({ type: "", text: "" });

    try {
      await apiRequest(`/admin/users/${user.id}/reset-password`, {
        method: "PATCH",
        body: JSON.stringify({ new_password: newPassword }),
      });
      setMessage({
        type: "success",
        text: `Password reset completed for ${user.email}.`,
      });
      setNewPassword("");
      setResetUserId("");
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setActionId("");
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      <div>
        <h1 className="text-2xl font-bold">User Administration</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create staff accounts and manage existing account access.
        </p>
      </div>

      {message.text && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 font-bold">Create Staff Account</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              First name
              <input
                required
                value={formData.first_name}
                onChange={(event) => updateForm("first_name", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Last name
              <input
                required
                value={formData.last_name}
                onChange={(event) => updateForm("last_name", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Email address
              <input
                required
                type="email"
                value={formData.email}
                onChange={(event) => updateForm("email", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Phone number
              <input
                type="tel"
                value={formData.phone}
                onChange={(event) => updateForm("phone", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Role
              <select
                value={formData.role}
                onChange={(event) => updateForm("role", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                {STAFF_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {roleLabel(role)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Temporary password
              <input
                required
                type="password"
                minLength="8"
                value={formData.password}
                onChange={(event) => updateForm("password", event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </label>
            {formData.role === "doctor" && (
              <>
                <label className="text-sm font-medium text-slate-700">
                  Specialization
                  <input
                    required
                    value={formData.specialization}
                    onChange={(event) =>
                      updateForm("specialization", event.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Consultation room
                  <input
                    value={formData.consultation_room}
                    onChange={(event) =>
                      updateForm("consultation_room", event.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </label>
              </>
            )}
          </div>
          <button
            type="submit"
            disabled={creating}
            className="inline-flex min-w-40 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {creating ? "Creating..." : "Create Account"}
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <h2 className="font-bold">Existing Accounts</h2>
          <div className="flex items-center gap-2">
            <select
              aria-label="Filter users by role"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All roles</option>
              <option value="patient">Patient</option>
              {STAFF_ROLES.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={loadUsers}
              disabled={loadingUsers}
              className="inline-flex min-w-24 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {loadingUsers && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              )}
              {loadingUsers ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {loadingUsers ? (
          <div className="flex items-center gap-3 px-5 py-8 text-sm text-slate-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            Loading user accounts...
          </div>
        ) : users.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500">
            No accounts match this filter.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {users.map((user) => (
                  <tr key={user.id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-5 py-4">{roleLabel(user.role)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          user.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="min-w-72 px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(user)}
                          disabled={Boolean(actionId)}
                          className="inline-flex min-w-24 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                        >
                          {actionId === `status-${user.id}` && (
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                          )}
                          {user.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setResetUserId(
                              resetUserId === user.id ? "" : user.id,
                            );
                            setNewPassword("");
                          }}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Reset password
                        </button>
                      </div>

                      {resetUserId === user.id && (
                        <form
                          onSubmit={(event) => handlePasswordReset(event, user)}
                          className="mt-3 flex flex-wrap gap-2"
                        >
                          <input
                            required
                            type="password"
                            minLength="8"
                            value={newPassword}
                            onChange={(event) =>
                              setNewPassword(event.target.value)
                            }
                            placeholder="New password"
                            className="min-w-40 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                          />
                          <button
                            type="submit"
                            disabled={Boolean(actionId)}
                            className="inline-flex min-w-20 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                          >
                            {actionId === `password-${user.id}` && (
                              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            )}
                            Save
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
