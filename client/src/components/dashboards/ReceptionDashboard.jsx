import React, { useState } from "react";

export default function ReceptionDashboard({ patients, setPatients }) {
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState("");
  const [walkInReason, setWalkInReason] = useState("");
  const [assignedDoctor, setAssignedDoctor] = useState("Dr. Sarah Jenkins");

  const handleStatusChange = (patientId, newStatus) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, status: newStatus } : p)),
    );
  };

  const handleAddWalkIn = (e) => {
    e.preventDefault();
    if (!walkInName || !walkInReason) return;

    const newPatient = {
      id: `P-${100 + patients.length + 1}`,
      name: walkInName,
      age: 30,
      gender: "Undisclosed",
      phone: "+1 (555) 000-0000",
      email: "walkin@careconnect.com",
      bloodGroup: "N/A",
      allergies: "None",
      status: "Waiting",
      assignedDoctor,
      reason: walkInReason,
      arrivalTime: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setPatients((prev) => [newPatient, ...prev]);
    setWalkInName("");
    setWalkInReason("");
    setShowWalkInModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Receptionist Command Center
          </h1>
          <p className="text-xs text-slate-400">
            Manage patient check-ins, waiting room queues, and doctor
            allocations.
          </p>
        </div>
        <button
          onClick={() => setShowWalkInModal(true)}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg"
        >
          + Quick Walk-In Check-In
        </button>
      </div>

      {/* Waiting Room Queue Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-800/40 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Live Waiting Room Queue
          </h3>
          <span className="text-xs font-medium text-teal-400">
            {patients.length} Total Registered
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800/20 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Patient Name</th>
                <th className="p-3.5">Arrival Time</th>
                <th className="p-3.5">Assigned Doctor</th>
                <th className="p-3.5">Reason</th>
                <th className="p-3.5">Current Status</th>
                <th className="p-3.5 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  <td className="p-3.5 font-mono text-teal-400 font-semibold">
                    {patient.id}
                  </td>
                  <td className="p-3.5 font-medium text-slate-100">
                    {patient.name}
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {patient.arrivalTime || "09:00 AM"}
                  </td>
                  <td className="p-3.5 text-slate-300 font-medium">
                    {patient.assignedDoctor || "Dr. Sarah Jenkins"}
                  </td>
                  <td className="p-3.5 text-slate-400 max-w-xs truncate">
                    {patient.reason}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        patient.status === "Waiting"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : patient.status === "In Consultation"
                            ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {patient.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <select
                      value={patient.status}
                      onChange={(e) =>
                        handleStatusChange(patient.id, e.target.value)
                      }
                      className="bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-300 px-2 py-1 focus:outline-none focus:border-teal-500"
                    >
                      <option value="Waiting">Waiting</option>
                      <option value="In Consultation">In Consultation</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Walk-In Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">
                Quick Walk-In Check-In
              </h3>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="text-slate-500 hover:text-slate-300 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddWalkIn} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Patient Full Name
                </label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Reason for Visit
                </label>
                <input
                  type="text"
                  required
                  value={walkInReason}
                  onChange={(e) => setWalkInReason(e.target.value)}
                  placeholder="e.g. Fever & headache"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Assign Doctor
                </label>
                <select
                  value={assignedDoctor}
                  onChange={(e) => setAssignedDoctor(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  <option value="Dr. Sarah Jenkins">
                    Dr. Sarah Jenkins (General)
                  </option>
                  <option value="Dr. Robert Chen">
                    Dr. Robert Chen (Cardiology)
                  </option>
                  <option value="Dr. Amara Okafor">
                    Dr. Amara Okafor (Pediatrics)
                  </option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-bold"
                >
                  Check In Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
