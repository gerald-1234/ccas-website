import React, { useState, useEffect } from "react";
import { apiRequest } from "../../config/api";

export const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [activeApt, setActiveApt] = useState(null);
  const [record, setRecord] = useState({
    diagnosis: "",
    treatment: "",
    prescription: "",
    doctor_notes: "",
  });

  const loadSchedule = async () => {
    try {
      const res = await apiRequest("/appointments");
      setAppointments(res.appointments || res || []);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(`/medical/appointments/${activeApt.id}/record`, {
        method: "PUT",
        body: JSON.stringify(record),
      });
      await apiRequest(`/appointments/${activeApt.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "completed" }),
      });
      setActiveApt(null);
      loadSchedule();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">
        Doctor Consultation Desk
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Assigned Consultations
          </h2>
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 border rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {apt.patient_name || "Patient"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {apt.appointment_time} — {apt.reason_for_visit}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveApt(apt);
                    setRecord({
                      diagnosis: "",
                      treatment: "",
                      prescription: "",
                      doctor_notes: "",
                    });
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
                >
                  Consult
                </button>
              </div>
            ))}
          </div>
        </div>

        {activeApt && (
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Consultation Notes
            </h2>
            <form onSubmit={handleSaveRecord} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Diagnosis
                </label>
                <input
                  type="text"
                  required
                  value={record.diagnosis}
                  onChange={(e) =>
                    setRecord({ ...record, diagnosis: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Treatment
                </label>
                <textarea
                  required
                  value={record.treatment}
                  onChange={(e) =>
                    setRecord({ ...record, treatment: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Prescription
                </label>
                <input
                  type="text"
                  value={record.prescription}
                  onChange={(e) =>
                    setRecord({ ...record, prescription: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Doctor Notes (Confidential)
                </label>
                <textarea
                  value={record.doctor_notes}
                  onChange={(e) =>
                    setRecord({ ...record, doctor_notes: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border rounded text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-green-600 text-white rounded font-semibold text-sm"
              >
                Save Clinical File & Complete
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
