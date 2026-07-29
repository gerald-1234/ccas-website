import React, { useState, useEffect } from "react";
import { apiRequest } from "../../config/api";

export const ReceptionDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = async () => {
    try {
      const data = await apiRequest("/appointments");
      setAppointments(data.appointments || data || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await apiRequest(`/appointments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      loadAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">
        Reception Desk Dashboard
      </h1>
      {loading ? (
        <p className="text-slate-500">Loading appointments...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 font-semibold border-b">
              <tr>
                <th className="p-4">Time</th>
                <th className="p-4">Patient</th>
                <th className="p-4">Doctor</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium">{apt.appointment_time}</td>
                  <td className="p-4">{apt.patient_name || apt.patient_id}</td>
                  <td className="p-4">{apt.doctor_name || apt.doctor_id}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold capitalize bg-slate-100 text-slate-800">
                      {apt.status}
                    </span>
                  </td>
                  <td className="p-4 space-x-2">
                    {apt.status === "scheduled" && (
                      <button
                        onClick={() => updateStatus(apt.id, "checked_in")}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700"
                      >
                        Check In
                      </button>
                    )}
                    {apt.status !== "cancelled" && (
                      <button
                        onClick={() => updateStatus(apt.id, "no_show")}
                        className="px-3 py-1 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700"
                      >
                        No Show
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
