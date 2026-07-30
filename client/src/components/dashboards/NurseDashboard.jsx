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
import { Account } from "../shared/Account.jsx";
import { Notifications } from "../shared/Notifications.jsx";

export const NurseDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.split("/")[2] || "overview";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nursing Station</h1>
          <p className="text-sm text-slate-500">
            Record vital signs and manage today's appointment queue.
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
            Vitals Queue
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
        <Route path="overview" element={<VitalsQueue />} />
        <Route path="patients" element={<PatientDirectory />} />
        <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
      </Routes>
    </div>
  );
};

const VitalsQueue = () => {
  const [appointments, setAppointments] = useState([]);
  const [activeApt, setActiveApt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vitals, setVitals] = useState({
    temperature_c: "",
    systolic_bp: "",
    diastolic_bp: "",
    pulse_rate: "",
    respiratory_rate: "",
    oxygen_saturation: "",
    weight_kg: "",
    height_cm: "",
    observations: "",
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
    setVitals({
      temperature_c: "",
      systolic_bp: "",
      diastolic_bp: "",
      pulse_rate: "",
      respiratory_rate: "",
      oxygen_saturation: "",
      weight_kg: "",
      height_cm: "",
      observations: "",
    });
  };

  const handleChange = (field, value) => {
    setVitals({ ...vitals, [field]: value });
  };

  const handleSaveVitals = async (e) => {
    e.preventDefault();
    if (!activeApt) return;

    try {
      setSaving(true);

      const payload = Object.fromEntries(
        Object.entries(vitals).map(([k, v]) => [
          k,
          k === "observations" ? v : v === "" ? null : Number(v),
        ]),
      );

      await apiRequest(`/medical/appointments/${activeApt.id}/vitals`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setActiveApt(null);
      await loadSchedule();
    } catch (err) {
      alert(`Error saving vitals: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: "temperature_c", label: "Temperature (°C)" },
    { key: "systolic_bp", label: "Systolic BP" },
    { key: "diastolic_bp", label: "Diastolic BP" },
    { key: "pulse_rate", label: "Pulse Rate" },
    { key: "respiratory_rate", label: "Respiratory Rate" },
    { key: "oxygen_saturation", label: "Oxygen Saturation (%)" },
    { key: "weight_kg", label: "Weight (kg)" },
    { key: "height_cm", label: "Height (cm)" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
          <span>Today's Queue</span>
          <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-0.5 rounded-full">
            {appointments.length}
          </span>
        </h2>

        {loading ? (
          <p className="text-sm text-slate-500 py-4">Loading schedule...</p>
        ) : appointments.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">
            No appointments scheduled.
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
                      {apt.appointment_time}
                      {apt.reason_for_visit && ` — ${apt.reason_for_visit}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelectAppointment(apt)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isActive ? "Editing..." : "Record Vitals"}
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
              <h2 className="text-lg font-bold text-slate-900">
                Vital Signs —{" "}
                <span className="font-normal text-slate-600">
                  {activeApt.patient_name || "Patient"}
                </span>
              </h2>
              <button
                onClick={() => setActiveApt(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveVitals} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {fields.map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {f.label}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={vitals[f.key]}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observations
                </label>
                <textarea
                  rows={2}
                  value={vitals.observations}
                  onChange={(e) => handleChange("observations", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Vitals"}
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
            <p className="font-medium text-sm">No Patient Selected</p>
            <p className="text-xs mt-1">
              Select an appointment from the queue to record vitals.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
