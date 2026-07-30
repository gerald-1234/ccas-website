import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../config/api";

function formatDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminOverview() {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [userData, auditData] = await Promise.all([
        apiRequest("/admin/users?page=1&limit=100"),
        apiRequest("/admin/audit-logs?page=1&limit=6"),
      ]);

      setUsers(userData.users || []);
      setTotalUsers(userData.pagination?.total || 0);
      setAuditLogs(auditData.audit_logs || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      loadOverview();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadOverview]);

  const statistics = useMemo(() => {
    const activeUsers = users.filter((user) => user.is_active).length;
    const staffUsers = users.filter((user) => user.role !== "patient").length;
    const lockedUsers = users.filter(
      (user) => user.locked_until && new Date(user.locked_until) > new Date(),
    ).length;

    return [
      { label: "Total Accounts", value: totalUsers || users.length },
      { label: "Active Accounts", value: activeUsers },
      { label: "Staff Accounts", value: staffUsers },
      { label: "Locked Accounts", value: lockedUsers },
    ];
  }, [totalUsers, users]);

  return (
    <div className="space-y-6 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">System Overview</h1>
          <p className="mt-1 text-sm text-slate-500">
            Account status and recent administrative activity.
          </p>
        </div>
        <button
          type="button"
          onClick={loadOverview}
          disabled={loading}
          className="inline-flex min-w-24 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase text-slate-500">
              {item.label}
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "-" : item.value}
            </p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-bold text-slate-900">Recent Audit Activity</h2>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 px-5 py-8 text-sm text-slate-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            Loading system activity...
          </div>
        ) : auditLogs.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500">
            No audit activity has been recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Details</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {log.user?.email || "System"}
                    </td>
                    <td className="px-5 py-3">{log.action}</td>
                    <td className="max-w-xs px-5 py-3">{log.details || "-"}</td>
                    <td className="whitespace-nowrap px-5 py-3">
                      {formatDate(log.created_at)}
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
