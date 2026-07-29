import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "../../config/api";
import { Notifications } from "../shared/Notifications";
import { Account } from "../shared/Account";

export const ManagerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.split("/")[2] || "overview";

  const tabs = [
    { key: "overview", label: "Reports" },
    { key: "notifications", label: "Notifications" },
    { key: "account", label: "My Account" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clinic Reports</h1>
          <p className="text-sm text-slate-500">
            Attendance and doctor utilization overview.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => navigate(`/dashboard/${tab.key}`)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
                activeTab === tab.key
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <Routes>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<ManagerReports />} />
        <Route path="reports" element={<ManagerReports />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="account" element={<Account />} />
        <Route path="*" element={<Navigate to="overview" replace />} />
      </Routes>
    </div>
  );
};

const ManagerReports = () => {
  const [summary, setSummary] = useState(null);
  const [utilization, setUtilization] = useState([]);
  const [range, setRange] = useState(() => {
    const to = new Date().toISOString().split("T")[0];
    const from = new Date(Date.now() - 30 * 86400000)
      .toISOString()
      .split("T")[0];
    return { from, to };
  });
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [summaryRes, utilRes] = await Promise.all([
        apiRequest(`/reports/summary?from=${range.from}&to=${range.to}`),
        apiRequest(
          `/reports/doctor-utilization?from=${range.from}&to=${range.to}`,
        ),
      ]);
      setSummary(summaryRes);
      setUtilization(utilRes.doctors || utilRes || []);
    } catch (err) {
      console.error("Failed to load reports:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [range.from, range.to]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            From
          </label>
          <input
            type="date"
            value={range.from}
            onChange={(e) => setRange({ ...range, from: e.target.value })}
            className="px-3 py-1.5 border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            To
          </label>
          <input
            type="date"
            value={range.to}
            onChange={(e) => setRange({ ...range, to: e.target.value })}
            className="px-3 py-1.5 border rounded-lg text-sm"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading reports...</p>
      ) : (
        <>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Attendance Summary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Stat label="Total" value={summary?.total ?? 0} />
              <Stat
                label="Completed"
                value={summary?.status_counts?.completed ?? 0}
              />
              <Stat
                label="No-Shows"
                value={summary?.status_counts?.no_show ?? 0}
              />
              <Stat
                label="Attendance Rate"
                value={
                  summary?.attendance_rate != null
                    ? `${summary.attendance_rate}%`
                    : "N/A"
                }
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Doctor Utilization
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                    <th className="py-2.5 px-3">Doctor</th>
                    <th className="py-2.5 px-3">Appointments</th>
                    <th className="py-2.5 px-3">Completed</th>
                    <th className="py-2.5 px-3">Booked Minutes</th>
                    <th className="py-2.5 px-3">Completion %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {utilization.map((d) => (
                    <tr key={d.doctor_id || d.id}>
                      <td className="py-3 px-3 font-medium text-slate-900">
                        Dr. {d.first_name} {d.last_name}
                      </td>
                      <td className="py-3 px-3">{d.appointment_count ?? 0}</td>
                      <td className="py-3 px-3">{d.completed_count ?? 0}</td>
                      <td className="py-3 px-3">{d.booked_minutes ?? 0}</td>
                      <td className="py-3 px-3">
                        {d.completion_percentage != null
                          ? `${d.completion_percentage}%`
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div>
    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
      {label}
    </p>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);
