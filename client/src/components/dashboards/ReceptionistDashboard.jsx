import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { apiRequest } from "../../config/api";
import { AppointmentBooking } from "../forms/AppointmentBooking";
import { PatientRegistration } from "../forms/PatientRegistration";
import { WalkInRegistration } from "../forms/WalkInRegistration";
import { Account } from "../shared/Account.jsx";
import { Notifications } from "../shared/Notifications";

export const ReceptionistDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.split("/").pop();

  const fetchData = async () => {
    try {
      setLoading(true);
      const aptRes = await apiRequest("/appointments");
      setAppointments(aptRes.appointments || aptRes || []);
    } catch (err) {
      console.error("Failed to load receptionist portal data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSuccess = () => {
    fetchData();
    navigate("/dashboard/overview");
  };

  if (loading) {
    return <div className="text-slate-500">Loading receptionist desk...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Front Desk & Reception
          </h1>
          <p className="text-sm text-slate-500">
            Manage daily arrivals, check-ins, and walk-in registrations.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => navigate("/dashboard/overview")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === "overview"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Today's Queue ({appointments.length})
          </button>
          <button
            onClick={() => navigate("/dashboard/appointments")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === "appointments"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Book Appointment
          </button>
          <button
            onClick={() => navigate("/dashboard/patients")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === "patients"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            + Register Patient
          </button>
          <button
            onClick={() => navigate("/dashboard/walk-in")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === "walk-in"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            + Walk-In
          </button>
        </div>
      </div>

      <Routes>
        <Route index element={<Navigate to="/dashboard/overview" replace />} />
        <Route
          path="overview"
          element={
            <PatientQueue appointments={appointments} onUpdate={fetchData} />
          }
        />
        <Route
          path="appointments"
          element={<AppointmentBooking onSuccess={handleSuccess} />}
        />
        <Route
          path="patients"
          element={<PatientRegistration onSuccess={handleSuccess} />}
        />
        <Route
          path="walk-in"
          element={<WalkInRegistration onSuccess={handleSuccess} />}
        />
        <Route path="notifications" element={<Notifications />} />
        <Route path="account" element={<Account />} />
        <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
      </Routes>
    </div>
  );
};

const PatientQueue = ({ appointments, onUpdate }) => {
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await apiRequest(`/appointments/${appointmentId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      onUpdate();
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-900">
          Patient Check-In Queue
        </h2>
        <button
          onClick={onUpdate}
          className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
        >
          Refresh Desk
        </button>
      </div>

      {appointments.length === 0 ? (
        <p className="text-sm text-slate-500 py-6 text-center">
          No patients scheduled in the queue today.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Patient</th>
                <th className="py-2.5 px-3">Assigned Doctor</th>
                <th className="py-2.5 px-3">Reason</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {apt.appointment_time}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-900">
                    {apt.patient?.first_name} {apt.patient?.last_name}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    Dr. {apt.doctor?.first_name} {apt.doctor?.last_name}
                  </td>
                  <td className="py-3 px-3 text-slate-500 text-xs max-w-xs truncate">
                    {apt.reason_for_visit}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        apt.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : apt.status === "in_consultation"
                            ? "bg-purple-100 text-purple-800"
                            : apt.status === "checked_in"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {apt.status || "scheduled"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    {apt.status === "scheduled" && (
                      <button
                        onClick={() => handleStatusUpdate(apt.id, "checked_in")}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
                      >
                        Check In
                      </button>
                    )}
                    {apt.status === "scheduled" && (
                      <button
                        onClick={() => handleStatusUpdate(apt.id, "cancelled")}
                        className="px-2.5 py-1 border border-slate-300 hover:bg-red-50 text-red-600 rounded text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
