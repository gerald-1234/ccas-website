import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { apiRequest } from "../../config/api";
import { PatientDirectory } from "../patients/PatientDirectory";
import { PatientHistoryView } from "../patients/PatientHistoryView";
import { Account } from "../shared/Account";
import { Notifications } from "../shared/Notifications";

export const DoctorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.split("/").pop();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Doctor Consultation Desk
          </h1>
          <p className="text-sm text-slate-500">
            Manage patient queue and record clinical evaluations.
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
            Schedule
          </button>
          <button
            onClick={() => navigate("/dashboard/patients")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === "patients"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Patient Directory
          </button>
        </div>
      </div>

      <Routes>
        <Route path="notifications" element={<Notifications />} />
        <Route path="account" element={<Account />} />
        <Route index element={<Navigate to="/dashboard/overview" replace />} />
        <Route path="overview" element={<ConsultationDesk />} />
        <Route path="patients" element={<PatientDirectory linkToHistory />} />
        <Route path="history" element={<PatientDirectory linkToHistory />} />
        <Route
          path="history/:patientId"
          element={<PatientHistoryView />}
        />{" "}
        <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
      </Routes>
    </div>
  );
};

const ConsultationDesk = () => {
  const [appointments, setAppointments] = useState([]);
  const [activeApt, setActiveApt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [record, setRecord] = useState({
    diagnosis: "",
    treatment: "",
    prescription: "",
    doctor_notes: "",
  });

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/appointments");
      setAppointments(res.appointments || res || []);
    } catch (err) {
      console.error("Failed to load schedule:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const handleSelectAppointment = (apt) => {
    setActiveApt(apt);
    setRecord({
      diagnosis: apt.diagnosis || "",
      treatment: apt.treatment || "",
      prescription: apt.prescription || "",
      doctor_notes: apt.doctor_notes || "",
    });
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    if (!activeApt) return;

    try {
      setSaving(true);

      await apiRequest(`/medical/appointments/${activeApt.id}/record`, {
        method: "PUT",
        body: JSON.stringify(record),
      });

      await apiRequest(`/appointments/${activeApt.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "completed" }),
      });

      setActiveApt(null);
      await loadSchedule();
    } catch (err) {
      alert(`Error saving clinical record: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
          <span>Assigned Consultations</span>
          <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-0.5 rounded-full">
            {appointments.length}
          </span>
        </h2>

        {loading ? (
          <p className="text-sm text-slate-500 py-4">Loading schedule...</p>
        ) : appointments.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">
            No active appointments assigned.
          </p>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => {
              const isActive = activeApt?.id === apt.id;
              return (
                <div
                  key={apt.id}
                  className={`p-4 border rounded-lg flex justify-between items-center transition ${
                    isActive
                      ? "border-blue-500 bg-blue-50/40"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {apt.patient_name || apt.patient?.full_name || "Patient"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      <span className="font-medium text-slate-700">
                        {apt.appointment_time}
                      </span>
                      {apt.reason_for_visit && ` — ${apt.reason_for_visit}`}
                    </p>
                    <span
                      className={`inline-block mt-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        apt.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {apt.status || "scheduled"}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectAppointment(apt)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isActive ? "Editing..." : "Consult"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        {activeApt ? (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Clinical Note & Prescription
                </h2>
                <p className="text-xs text-slate-500">
                  Patient:{" "}
                  <strong className="text-slate-700">
                    {activeApt.patient_name || "Patient"}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setActiveApt(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Diagnosis *
                </label>
                <input
                  type="text"
                  required
                  value={record.diagnosis}
                  onChange={(e) =>
                    setRecord({ ...record, diagnosis: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Treatment Plan *
                </label>
                <textarea
                  required
                  rows={3}
                  value={record.treatment}
                  onChange={(e) =>
                    setRecord({ ...record, treatment: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prescription
                </label>
                <input
                  type="text"
                  value={record.prescription}
                  onChange={(e) =>
                    setRecord({ ...record, prescription: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Doctor Notes (Confidential)
                </label>
                <textarea
                  rows={2}
                  value={record.doctor_notes}
                  onChange={(e) =>
                    setRecord({ ...record, doctor_notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50"
                >
                  {saving
                    ? "Saving Record..."
                    : "Save Clinical File & Complete"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveApt(null)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
            <p className="font-medium text-sm">
              No Active Consultation Selected
            </p>
            <p className="text-xs mt-1">
              Select an appointment from the left column to write notes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
