import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Notifications } from "../shared/Notifications";
import { Account } from "../shared/Account";
// import { useAuth } from "../../AuthContext";
import { useAuth } from "../../useAuth.js";
import { apiRequest } from "../../config/api";
import { AppointmentBooking } from "../forms/AppointmentBooking";

export const PatientDashboard = () => {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const patientId = profile?.id;

      const [aptRes, recRes] = await Promise.all([
        apiRequest("/appointments"),
        patientId
          ? apiRequest(`/medical/patients/${patientId}/history`)
          : Promise.resolve({ records: [] }),
      ]);

      setAppointments(aptRes.appointments || aptRes || []);
      setRecords(recRes.records || recRes || []);
    } catch (err) {
      console.error("Failed to load patient data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile?.id]);

  const location = useLocation();
  const navigate = useNavigate();
  const getActiveTab = () => {
    const path = location.pathname.split("/").pop();
    if (["appointments", "history"].includes(path)) return path;
    if (path === "book") return "appointments";
    return "appointments";
  };
  const activeTab = getActiveTab();

  const handleBookingSuccess = () => {
    fetchData();
    navigate("/dashboard/appointments");
  };

  if (loading) {
    return <div className="text-slate-500">Loading your health portal...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Portal</h1>
          <p className="text-sm text-slate-500">
            Manage your consultations and clinical health history.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => navigate("/dashboard/appointments")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === "appointments"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            My Appointments
          </button>
          <button
            onClick={() => navigate("/dashboard/appointments/book")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === "appointments" &&
              location.pathname.endsWith("/book")
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            + Book New
          </button>
          <button
            onClick={() => navigate("/dashboard/history")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === "history"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Medical Records
          </button>
        </div>
      </div>

      <Routes>
        <Route path="notifications" element={<Notifications />} />
        <Route path="account" element={<Account />} />
        <Route index element={<Navigate to="/dashboard/overview" replace />} />
        <Route
          path="overview"
          element={<AppointmentsList appointments={appointments} />}
        />
        <Route
          path="appointments/*"
          element={
            <AppointmentRoutes
              onSuccess={handleBookingSuccess}
              appointments={appointments}
            />
          }
        />
        <Route
          path="history"
          element={<MedicalRecordsList records={records} />}
        />
        <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
      </Routes>
    </div>
  );
};

const AppointmentsList = ({ appointments }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <h2 className="text-lg font-bold text-slate-900 mb-4">
      Upcoming & Past Appointments
    </h2>
    {appointments.length === 0 ? (
      <div className="text-center py-8 text-slate-500 text-sm">
        No appointments scheduled yet. Click "Book Appointment" to schedule one!
      </div>
    ) : (
      <div className="divide-y divide-slate-100">
        {appointments.map((apt) => (
          <div key={apt.id} className="py-4 flex justify-between items-center">
            <div>
              <p className="font-semibold text-slate-900">
                Dr.{" "}
                {apt.doctor_name ||
                  apt.doctor?.full_name ||
                  "Assigned Specialist"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {apt.appointment_date} at {apt.appointment_time} —{" "}
                {apt.reason_for_visit}
              </p>
            </div>
            <span
              className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${
                apt.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : apt.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
              }`}
            >
              {apt.status || "scheduled"}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const AppointmentRoutes = ({ onSuccess, appointments }) => (
  <Routes>
    <Route index element={<AppointmentsList appointments={appointments} />} />
    <Route path="book" element={<AppointmentBooking onSuccess={onSuccess} />} />
  </Routes>
);

const MedicalRecordsList = ({ records }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <h2 className="text-lg font-bold text-slate-900 mb-4">
      Your Health Records & Prescriptions
    </h2>
    {records.length === 0 ? (
      <p className="text-sm text-slate-500 py-4">
        No health history records found.
      </p>
    ) : (
      <div className="space-y-4">
        {records.map((rec) => (
          <div
            key={rec.id}
            className="p-4 border border-slate-200 rounded-lg space-y-2"
          >
            <div className="flex justify-between items-center text-xs text-slate-500 border-b pb-2">
              <span>
                Diagnosis Date:{" "}
                {rec.created_at
                  ? new Date(rec.created_at).toLocaleDateString()
                  : "N/A"}
              </span>
              <span className="font-semibold text-slate-700">
                Dr. {rec.doctor_name || "Attending Doctor"}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-700">
                Diagnosis:{" "}
              </span>
              <span className="text-sm text-slate-900 font-medium">
                {rec.diagnosis}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-700">
                Treatment Plan:{" "}
              </span>
              <p className="text-sm text-slate-600">{rec.treatment}</p>
            </div>
            {rec.prescription && (
              <div className="bg-blue-50 p-2.5 rounded text-xs text-blue-900">
                <strong>Rx / Prescription:</strong> {rec.prescription}
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);
